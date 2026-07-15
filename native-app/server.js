const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");
const { createDatabase } = require("./src/database-factory");
const { BENEFICIARY_FIELDS, fieldSectionMap } = require("./src/metadata");
const { recognizeNutritionProfile } = require("./src/nutrition-ocr");
const { philippineHolidaysForYear } = require("./src/philippine-holidays");
const { handleScholarshipRequest } = require("./src/scholarship-api");
const { handleOperationsRequest } = require("./src/operations-api");
const {
  ARCHIVE_ROLES,
  ROUTINE_WRITE_ROLES,
  WORKSPACE_READ_ROLES
} = require("./src/program-roles");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 3417);
const PUBLIC_DIR = path.join(__dirname, "public");
const BODY_LIMIT_BYTES = 40 * 1024 * 1024;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const sessions = new Map();
const responseCache = new Map();
const SHORT_CACHE_MS = 15 * 1000;
const MEDIUM_CACHE_MS = 60 * 1000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

async function sendCachedJson(res, key, ttlMs, producer) {
  const now = Date.now();
  const cached = responseCache.get(key);

  if (cached && cached.expiresAt > now) {
    sendJson(res, 200, cached.payload);
    return;
  }

  const payload = await producer();
  responseCache.set(key, {
    payload,
    expiresAt: now + ttlMs
  });
  sendJson(res, 200, payload);
}

async function sendRecordFromCache(req, res, url, producer, payloadKey = "record") {
  const key = cacheKey(req, url);
  const now = Date.now();
  const cached = responseCache.get(key);

  if (cached && cached.expiresAt > now) {
    sendJson(res, 200, cached.payload);
    return cached.payload[payloadKey] || null;
  }

  const record = await producer();
  if (!record) return null;

  const payload = { [payloadKey]: record };
  responseCache.set(key, {
    payload,
    expiresAt: now + SHORT_CACHE_MS
  });
  sendJson(res, 200, payload);
  return record;
}

function cacheKey(req, url) {
  return `${req.method}:${url.pathname}?${url.searchParams.toString()}`;
}

function clearResponseCache() {
  responseCache.clear();
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

function databaseConnectionMessage(error) {
  const message = String(error?.message || "");
  const cause = String(error?.cause?.message || "");

  if (/fetch failed|timeout|connect/i.test(`${message} ${cause}`)) {
    return "Cloud database connection failed. Check the internet connection and try again.";
  }

  return message ? `Database connection failed: ${message}` : "Database connection failed.";
}

function statusCodeForError(error) {
  const message = String(error?.message || "");
  const cause = String(error?.cause?.message || "");

  if (message === "Invalid username or password.") return 401;
  if (message === "Invalid JSON body.") return 400;
  if (message === "Request is too large.") return 413;
  if (/fetch failed|timeout|connect|econnreset|econnrefused|socket|network/i.test(`${message} ${cause}`)) {
    return 503;
  }

  return 500;
}

function createSession(user) {
  const token = crypto.randomBytes(32).toString("base64url");
  const session = {
    token,
    user,
    expiresAt: Date.now() + SESSION_TTL_MS
  };

  sessions.set(token, session);
  return session;
}

function readBearerToken(req) {
  const header = req.headers.authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1] : "";
}

function getSession(req) {
  const token = readBearerToken(req);
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;

  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  session.expiresAt = Date.now() + SESSION_TTL_MS;
  return session;
}

function requireSession(req, res) {
  const session = getSession(req);

  if (!session) {
    sendError(res, 401, "Please sign in to continue.");
    return null;
  }

  return session;
}

function requireSuperadmin(req, res) {
  const session = requireSession(req, res);
  if (!session) return null;

  if (session.user.role !== "superadmin") {
    sendError(res, 403, "Only the superadmin can manage accounts.");
    return null;
  }

  return session;
}

async function decorateUser(database, user) {
  let decorated = user;
  if (database?.scholarship) decorated = await database.scholarship.decorateUser(decorated);
  if (database?.operations) decorated = await database.operations.decorateUser(decorated);
  return decorated;
}

function hasProgramRole(session, programCode, allowedRoles) {
  if (session?.user?.role === "superadmin") return true;
  const roles = new Set(session?.user?.program_roles?.[programCode] || []);
  return allowedRoles.some(role => roles.has(role));
}

function existingProgramForPath(pathname) {
  if (pathname.startsWith("/api/nutrition/")) return "nutrition";
  if (/^\/api\/(?:records|search|bin|monitoring|metadata|next-control-no)(?:\/|$)/.test(pathname)) return "livelihood";
  return "";
}

function requireExistingProgramAccess(req, res, pathname, session) {
  const programCode = existingProgramForPath(pathname);
  if (!programCode) return true;
  let allowedRoles = WORKSPACE_READ_ROLES;
  if (!["GET", "HEAD"].includes(req.method)) allowedRoles = ROUTINE_WRITE_ROLES;
  if (req.method === "DELETE") allowedRoles = ARCHIVE_ROLES;
  if (hasProgramRole(session, programCode, allowedRoles)) return true;
  sendError(res, 403, `Your account does not have permission for the ${programCode} program.`);
  return false;
}

function accessiblePrograms(session) {
  const programs = ["livelihood", "nutrition", "scholarship", "health", "administration"];
  if (session?.user?.role === "superadmin") return programs;
  return programs.filter(programCode => hasProgramRole(session, programCode, WORKSPACE_READ_ROLES));
}

function canRestoreBinRecord(session, record) {
  if (session?.user?.role === "superadmin") return true;
  const financeRecord = record.entity_type === "finance" || /financial|finance/i.test(record.entity_type || "");
  return hasProgramRole(session, record.program_code, financeRecord ? ["program_officer", "finance"] : ["program_officer"]);
}

function binLabel(entityType, record = {}) {
  const name = [record.child_last_name, record.child_first_name].filter(Boolean).join(", ")
    || [record.last_name, record.first_name].filter(Boolean).join(", ")
    || record.display_name || record.center_name || record.recipe_name || record.viand_name || record.beneficiary_name
    || record.control_no || record.report_no || record.reference_no || record.beneficiary_no
    || record.report_month || record.month_label || record.title || record.name;
  return String(name || `${entityType} #${record.id || ""}`).slice(0, 240);
}

async function captureForBin(database, session, programCode, entityType, record) {
  if (!record || !database.operations) return record;
  await database.operations.captureDeletedRecord(
    programCode,
    entityType,
    record.id,
    binLabel(entityType, record),
    record,
    session?.user?.id
  );
  return record;
}

function restorableSnapshot(snapshot = {}) {
  const restored = { ...snapshot };
  for (const key of ["id", "created_at", "updated_at", "deleted_at"]) delete restored[key];
  return restored;
}

async function restoreCapturedRecord(database, binRecord) {
  const payload = restorableSnapshot(binRecord.snapshot || {});
  const restorers = {
    "livelihood-monitoring-report": value => database.saveMonitoringReport(value),
    "nutrition-center": value => database.saveNutritionCenter(value),
    "nutrition-beneficiary": value => database.saveNutritionBeneficiary(value),
    "nutrition-growth-report": value => database.saveNutritionGrowthReport(value),
    "nutrition-financial-report": value => database.saveNutritionFinancialReport(value),
    "nutrition-recipe": value => database.saveNutritionRecipe(value),
    "nutrition-menu": value => database.saveNutritionMenu(value),
    "nutrition-costing": value => database.saveNutritionCosting(value)
  };
  const restore = restorers[binRecord.entity_type];
  if (!restore) throw new Error("This archived record type cannot be restored automatically.");
  return restore(payload);
}

async function listUnifiedBin(database, session, options = {}) {
  const allowedPrograms = accessiblePrograms(session);
  const requestedProgram = String(options.program || "");
  const programs = requestedProgram ? allowedPrograms.filter(code => code === requestedProgram) : allowedPrograms;
  if (requestedProgram && !programs.length) throw new Error("Your account does not have access to that program bin.");
  const records = [];
  for (const programCode of programs) {
    if (programCode === "livelihood") {
      const legacy = await database.listDeletedRecords({ limit: 500, offset: 0 });
      records.push(...legacy.map(record => ({
        source: "livelihood",
        id: Number(record.id),
        program_code: "livelihood",
        entity_type: "beneficiary-profile",
        display_label: binLabel("beneficiary-profile", record),
        deleted_at: record.deleted_at || record.updated_at || ""
      })));
    }
    if (database.operations) {
      records.push(...await database.operations.listArchived(programCode));
      records.push(...await database.operations.listCapturedBin(programCode));
    }
    if (programCode === "scholarship" && database.scholarship) records.push(...await database.scholarship.listArchived());
  }
  const visible = records.filter(record => {
    if (record.entity_type === "cases" && !hasProgramRole(session, "administration", ["program_officer"])) return false;
    const search = String(options.search || "").trim().toLowerCase();
    return !search || `${record.display_label} ${record.entity_type} ${record.program_code}`.toLowerCase().includes(search);
  });
  visible.sort((a, b) => String(b.deleted_at || "").localeCompare(String(a.deleted_at || "")));
  const offset = Math.max(0, Number(options.offset || 0));
  const limit = Math.max(1, Math.min(200, Number(options.limit || 50)));
  return {
    records: visible.slice(offset, offset + limit).map(record => ({ ...record, can_restore: canRestoreBinRecord(session, record) })),
    total: visible.length,
    accessible_programs: allowedPrograms
  };
}

async function restoreUnifiedBinRecord(database, session, payload = {}) {
  const source = String(payload.source || "");
  const id = Number(payload.id || 0);
  const programCode = String(payload.program_code || "");
  const entityType = String(payload.entity_type || "");
  const descriptor = { source, id, program_code: programCode, entity_type: entityType };
  if (!canRestoreBinRecord(session, descriptor)) throw new Error("Your account cannot restore this record.");
  if (source === "livelihood") return database.restoreDeletedRecord(id);
  if (source === "operations") return database.operations.restore(entityType, id, session.user.id);
  if (source === "scholarship") return database.scholarship.restore(entityType, id, session.user.id);
  if (source === "captured") {
    const binRecord = await database.operations.getCapturedBin(id);
    if (!binRecord || binRecord.restored_at) throw new Error("Archived record was not found.");
    if (binRecord.program_code !== programCode || binRecord.entity_type !== entityType) throw new Error("Archived record details do not match.");
    const record = await restoreCapturedRecord(database, binRecord);
    await database.operations.markCapturedRestored(id, session.user.id);
    return record;
  }
  throw new Error("Unsupported record-bin source.");
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk;

      if (Buffer.byteLength(body) > BODY_LIMIT_BYTES) {
        reject(new Error("Request is too large."));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });

    req.on("error", reject);
  });
}

function sendStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const absolutePath = path.normalize(path.join(PUBLIC_DIR, decodeURIComponent(requestedPath)));
  const relativePath = path.relative(PUBLIC_DIR, absolutePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    sendError(res, 403, "Forbidden.");
    return;
  }

  fs.readFile(absolutePath, (error, data) => {
    if (error) {
      sendError(res, 404, "Not found.");
      return;
    }

    const mimeType = MIME_TYPES[path.extname(absolutePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": mimeType,
      "Content-Length": data.length
    });
    res.end(data);
  });
}

function recordIdFromPath(pathname, prefix) {
  const rest = pathname.slice(prefix.length);
  const firstPart = rest.split("/")[0];
  const id = Number(firstPart);
  return Number.isInteger(id) && id > 0 ? id : 0;
}

function createServer(database, startupError = null, reconnectDatabase = null) {
  let databaseError = startupError;

  async function requireDatabaseConnection(res) {
    if (database) return database;

    if (typeof reconnectDatabase === "function") {
      try {
        database = await reconnectDatabase();
        databaseError = null;
        return database;
      } catch (error) {
        databaseError = error;
      }
    }

    sendError(res, 503, databaseConnectionMessage(databaseError));
    return null;
  }

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      const pathname = url.pathname;

      if (pathname === "/api/health" && req.method === "GET") {
        sendJson(res, 200, {
          ok: true,
          database: Boolean(database),
          error: database ? "" : databaseConnectionMessage(databaseError)
        });
        return;
      }

      if (pathname.startsWith("/api/") && !await requireDatabaseConnection(res)) {
        return;
      }

      if (pathname === "/api/auth/login" && req.method === "POST") {
        const payload = await readJsonBody(req);
        const authenticatedUser = await database.authenticateUser(payload.username, payload.password);
        const user = await decorateUser(database, authenticatedUser);
        const session = createSession(user);
        sendJson(res, 200, { token: session.token, user: session.user });
        return;
      }

      if (pathname === "/api/auth/logout" && req.method === "POST") {
        const token = readBearerToken(req);
        if (token) sessions.delete(token);
        sendJson(res, 200, { ok: true });
        return;
      }

      if (pathname === "/api/auth/me" && req.method === "GET") {
        const session = requireSession(req, res);
        if (!session) return;
        session.user = await decorateUser(database, session.user);
        sendJson(res, 200, { user: session.user });
        return;
      }

      if (pathname === "/api/users" && req.method === "GET") {
        if (!requireSuperadmin(req, res)) return;
        const users = await database.listUsers();
        sendJson(res, 200, {
          users: await Promise.all(users.map(user => decorateUser(database, user)))
        });
        return;
      }

      if (pathname === "/api/users" && req.method === "POST") {
        if (!requireSuperadmin(req, res)) return;
        const payload = await readJsonBody(req);
        const savedUser = await database.saveUser(payload);
        if (database.operations && savedUser.role !== "superadmin") await database.operations.setUserRoles(savedUser.id, payload.program_roles || {});
        clearResponseCache();
        sendJson(res, 200, {
          user: await decorateUser(database, savedUser)
        });
        return;
      }

      let authenticatedSession = null;
      if (pathname.startsWith("/api/")) {
        authenticatedSession = requireSession(req, res);
        if (!authenticatedSession) return;
      }

      if (await handleScholarshipRequest({
        req,
        res,
        url,
        database,
        session: authenticatedSession,
        sendJson,
        sendError,
        readJsonBody,
        sendCachedJson,
        cacheKey,
        clearResponseCache,
        shortCacheMs: SHORT_CACHE_MS,
        mediumCacheMs: MEDIUM_CACHE_MS
      })) {
        return;
      }

      if (await handleOperationsRequest({
        req,
        res,
        url,
        database,
        session: authenticatedSession,
        sendJson,
        sendError,
        readJsonBody,
        sendCachedJson,
        cacheKey,
        clearResponseCache,
        shortCacheMs: SHORT_CACHE_MS,
        mediumCacheMs: MEDIUM_CACHE_MS
      })) {
        return;
      }

      if (pathname === "/api/record-bin" && req.method === "GET") {
        try {
          await sendCachedJson(res, `${cacheKey(req, url)}:user:${authenticatedSession.user.id}`, SHORT_CACHE_MS, () => listUnifiedBin(database, authenticatedSession, {
            program: url.searchParams.get("program") || "",
            search: url.searchParams.get("search") || "",
            limit: url.searchParams.get("limit") || 50,
            offset: url.searchParams.get("offset") || 0
          }));
        } catch (error) {
          sendError(res, 403, error.message);
        }
        return;
      }

      if (pathname === "/api/record-bin/restore" && req.method === "POST") {
        try {
          const payload = await readJsonBody(req);
          const record = await restoreUnifiedBinRecord(database, authenticatedSession, payload);
          clearResponseCache();
          sendJson(res, 200, { record });
        } catch (error) {
          sendError(res, /cannot|permission|access/i.test(error.message) ? 403 : 400, error.message);
        }
        return;
      }

      if (!requireExistingProgramAccess(req, res, pathname, authenticatedSession)) return;

      if (pathname === "/api/metadata" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), MEDIUM_CACHE_MS, async () => ({
          fields: BENEFICIARY_FIELDS,
          sections: fieldSectionMap()
        }));
        return;
      }

      if (pathname === "/api/calendar/philippine-holidays" && req.method === "GET") {
        const year = Number(url.searchParams.get("year") || new Date().getFullYear());
        sendJson(res, 200, { year, holidays: philippineHolidaysForYear(year) });
        return;
      }

      if (pathname === "/api/stats" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, () => database.stats());
        return;
      }

      if (pathname === "/api/next-control-no" && req.method === "GET") {
        const year = Number(url.searchParams.get("year")) || new Date().getFullYear();
        await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, async () => ({ controlNo: await database.nextControlNo(year) }));
        return;
      }

      if (pathname === "/api/records" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, async () => ({
          records: await database.listRecords({
            search: url.searchParams.get("search") || "",
            limit: url.searchParams.get("limit") || 50,
            offset: url.searchParams.get("offset") || 0,
            detail: url.searchParams.get("detail") || "summary"
          }),
          total: typeof database.countRecords === "function"
            ? await database.countRecords({ search: url.searchParams.get("search") || "" })
            : 0
        }));
        return;
      }

      if (pathname === "/api/records" && req.method === "POST") {
        const payload = await readJsonBody(req);
        clearResponseCache();
        sendJson(res, 200, { record: await database.saveRecord(payload) });
        return;
      }

      if (pathname.startsWith("/api/records/") && req.method === "GET") {
        const id = recordIdFromPath(pathname, "/api/records/");
        const record = id ? await sendRecordFromCache(req, res, url, () => database.getRecord(id)) : null;

        if (!record) {
          sendError(res, 404, "Record was not found.");
          return;
        }

        return;
      }

      if (pathname.startsWith("/api/records/") && req.method === "DELETE") {
        const id = recordIdFromPath(pathname, "/api/records/");
        const record = id ? await database.deleteRecord(id) : null;

        if (!record) {
          sendError(res, 404, "Record was not found.");
          return;
        }

        clearResponseCache();
        sendJson(res, 200, { record });
        return;
      }

      if (pathname === "/api/monitoring/reports" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, async () => ({
          reports: await database.listMonitoringReports({
            search: url.searchParams.get("search") || "",
            beneficiaryId: url.searchParams.get("beneficiaryId") || "",
            limit: url.searchParams.get("limit") || 200,
            offset: url.searchParams.get("offset") || 0
          }),
          total: typeof database.countMonitoringReports === "function"
            ? await database.countMonitoringReports({
              search: url.searchParams.get("search") || "",
              beneficiaryId: url.searchParams.get("beneficiaryId") || ""
            })
            : 0
        }));
        return;
      }

      if (pathname === "/api/monitoring/reports" && req.method === "POST") {
        const payload = await readJsonBody(req);
        clearResponseCache();
        sendJson(res, 200, { report: await database.saveMonitoringReport(payload) });
        return;
      }

      if (pathname === "/api/monitoring/forwarded-balance" && req.method === "GET") {
        sendJson(res, 200, await database.getMonitoringForwardedBalance({
          beneficiaryId: url.searchParams.get("beneficiaryId") || "",
          reportMonth: url.searchParams.get("reportMonth") || "",
          excludeId: url.searchParams.get("excludeId") || 0
        }));
        return;
      }

      if (pathname.startsWith("/api/monitoring/reports/") && req.method === "GET") {
        const id = recordIdFromPath(pathname, "/api/monitoring/reports/");
        const report = id ? await sendRecordFromCache(req, res, url, () => database.getMonitoringReport(id), "report") : null;

        if (!report) {
          sendError(res, 404, "Monitoring report was not found.");
          return;
        }

        return;
      }

      if (pathname.startsWith("/api/monitoring/reports/") && req.method === "DELETE") {
        const id = recordIdFromPath(pathname, "/api/monitoring/reports/");
        const report = id ? await database.deleteMonitoringReport(id) : null;

        if (!report) {
          sendError(res, 404, "Monitoring report was not found.");
          return;
        }

        await captureForBin(database, authenticatedSession, "livelihood", "livelihood-monitoring-report", report);
        clearResponseCache();
        sendJson(res, 200, { report });
        return;
      }

      if (pathname === "/api/nutrition/overview" && req.method === "GET") {
        if (url.searchParams.get("summary") === "dashboard" && typeof database.nutritionDashboardSummary === "function") {
          await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, () => database.nutritionDashboardSummary());
          return;
        }
        await sendCachedJson(res, cacheKey(req, url), MEDIUM_CACHE_MS, () => database.nutritionOverview());
        return;
      }

      if (pathname === "/api/nutrition/next-beneficiary-no" && req.method === "GET") {
        const year = Number(url.searchParams.get("year")) || new Date().getFullYear();
        sendJson(res, 200, { beneficiaryNo: await database.nextNutritionBeneficiaryNo(year) });
        return;
      }

      if (pathname === "/api/nutrition/ocr-profile" && req.method === "POST") {
        const payload = await readJsonBody(req);
        sendJson(res, 200, await recognizeNutritionProfile(payload.imageData));
        return;
      }

      if (pathname === "/api/nutrition/growth/cgs" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), MEDIUM_CACHE_MS, () => database.nutritionCgsReference());
        return;
      }

      if (pathname === "/api/nutrition/growth/reports" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, async () => ({
          reports: await database.listNutritionGrowthReports({
            search: url.searchParams.get("search") || "",
            centerId: url.searchParams.get("centerId") || "",
            limit: url.searchParams.get("limit") || 200,
            offset: url.searchParams.get("offset") || 0
          }),
          total: typeof database.countNutritionGrowthReports === "function"
            ? await database.countNutritionGrowthReports({
              search: url.searchParams.get("search") || "",
              centerId: url.searchParams.get("centerId") || ""
            })
            : 0
        }));
        return;
      }

      if (pathname === "/api/nutrition/growth/draft" && req.method === "GET") {
        sendJson(res, 200, {
          report: await database.buildNutritionGrowthDraft({
            id: url.searchParams.get("id") || "",
            center_id: url.searchParams.get("centerId") || "",
            submitted_date: url.searchParams.get("submittedDate") || "",
            report_month: url.searchParams.get("reportMonth") || ""
          })
        });
        return;
      }

      if (pathname === "/api/nutrition/growth/reports" && req.method === "POST") {
        const payload = await readJsonBody(req);
        clearResponseCache();
        sendJson(res, 200, { report: await database.saveNutritionGrowthReport(payload) });
        return;
      }

      if (pathname.startsWith("/api/nutrition/growth/reports/") && req.method === "GET") {
        const id = recordIdFromPath(pathname, "/api/nutrition/growth/reports/");
        const report = id ? await sendRecordFromCache(req, res, url, () => database.getNutritionGrowthReport(id), "report") : null;

        if (!report) {
          sendError(res, 404, "Growth monitoring report was not found.");
          return;
        }

        return;
      }

      if (pathname.startsWith("/api/nutrition/growth/reports/") && req.method === "DELETE") {
        const id = recordIdFromPath(pathname, "/api/nutrition/growth/reports/");
        const report = id ? await database.deleteNutritionGrowthReport(id) : null;

        if (!report) {
          sendError(res, 404, "Growth monitoring report was not found.");
          return;
        }

        await captureForBin(database, authenticatedSession, "nutrition", "nutrition-growth-report", report);
        clearResponseCache();
        sendJson(res, 200, { report });
        return;
      }

      if (pathname === "/api/nutrition/recipes" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, async () => ({
          recipes: await database.listNutritionRecipes({
            search: url.searchParams.get("search") || "",
            limit: url.searchParams.get("limit") || 100,
            offset: url.searchParams.get("offset") || 0
          }),
          total: await database.countNutritionRecipes({ search: url.searchParams.get("search") || "" })
        }));
        return;
      }

      if (pathname === "/api/nutrition/recipes" && req.method === "POST") {
        const payload = await readJsonBody(req);
        clearResponseCache();
        sendJson(res, 200, { recipe: await database.saveNutritionRecipe(payload) });
        return;
      }

      if (pathname.startsWith("/api/nutrition/recipes/") && req.method === "GET") {
        const id = recordIdFromPath(pathname, "/api/nutrition/recipes/");
        const recipe = id ? await sendRecordFromCache(req, res, url, () => database.getNutritionRecipe(id), "recipe") : null;
        if (!recipe) {
          sendError(res, 404, "Recipe was not found.");
          return;
        }
        return;
      }

      if (pathname.startsWith("/api/nutrition/recipes/") && req.method === "DELETE") {
        const id = recordIdFromPath(pathname, "/api/nutrition/recipes/");
        const recipe = id ? await database.deleteNutritionRecipe(id) : null;
        if (!recipe) {
          sendError(res, 404, "Recipe was not found.");
          return;
        }
        await captureForBin(database, authenticatedSession, "nutrition", "nutrition-recipe", recipe);
        clearResponseCache();
        sendJson(res, 200, { recipe });
        return;
      }

      if (pathname === "/api/nutrition/menus" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, async () => ({
          menus: await database.listNutritionMenus({
            year: url.searchParams.get("year") || "",
            limit: url.searchParams.get("limit") || 60,
            offset: url.searchParams.get("offset") || 0
          }),
          total: await database.countNutritionMenus({ year: url.searchParams.get("year") || "" })
        }));
        return;
      }

      if (pathname === "/api/nutrition/menus" && req.method === "POST") {
        const payload = await readJsonBody(req);
        clearResponseCache();
        sendJson(res, 200, { menu: await database.saveNutritionMenu(payload) });
        return;
      }

      if (pathname.startsWith("/api/nutrition/menus/") && pathname.endsWith("/generate") && req.method === "POST") {
        const id = recordIdFromPath(pathname, "/api/nutrition/menus/");
        clearResponseCache();
        sendJson(res, 200, await database.generateNutritionCostingsForMenu(id));
        return;
      }

      if (pathname.startsWith("/api/nutrition/menus/") && req.method === "GET") {
        const id = recordIdFromPath(pathname, "/api/nutrition/menus/");
        const menu = id ? await sendRecordFromCache(req, res, url, () => database.getNutritionMenu(id), "menu") : null;
        if (!menu) {
          sendError(res, 404, "Monthly menu was not found.");
          return;
        }
        return;
      }

      if (pathname.startsWith("/api/nutrition/menus/") && req.method === "DELETE") {
        const id = recordIdFromPath(pathname, "/api/nutrition/menus/");
        const menu = id ? await database.deleteNutritionMenu(id) : null;
        if (!menu) {
          sendError(res, 404, "Monthly menu was not found.");
          return;
        }
        await captureForBin(database, authenticatedSession, "nutrition", "nutrition-menu", menu);
        clearResponseCache();
        sendJson(res, 200, { menu });
        return;
      }

      if (pathname === "/api/nutrition/costings" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, async () => ({
          costings: await database.listNutritionCostings({
            search: url.searchParams.get("search") || "",
            centerId: url.searchParams.get("centerId") || "",
            month: url.searchParams.get("month") || "",
            limit: url.searchParams.get("limit") || 100,
            offset: url.searchParams.get("offset") || 0
          }),
          total: await database.countNutritionCostings({
            search: url.searchParams.get("search") || "",
            centerId: url.searchParams.get("centerId") || "",
            month: url.searchParams.get("month") || ""
          })
        }));
        return;
      }

      if (pathname === "/api/nutrition/costings" && req.method === "POST") {
        const payload = await readJsonBody(req);
        clearResponseCache();
        sendJson(res, 200, { costing: await database.saveNutritionCosting(payload) });
        return;
      }

      if (pathname.startsWith("/api/nutrition/costings/") && req.method === "GET") {
        const id = recordIdFromPath(pathname, "/api/nutrition/costings/");
        const costing = id ? await sendRecordFromCache(req, res, url, () => database.getNutritionCosting(id), "costing") : null;
        if (!costing) {
          sendError(res, 404, "Menu costing sheet was not found.");
          return;
        }
        return;
      }

      if (pathname.startsWith("/api/nutrition/costings/") && req.method === "DELETE") {
        const id = recordIdFromPath(pathname, "/api/nutrition/costings/");
        const costing = id ? await database.deleteNutritionCosting(id) : null;
        if (!costing) {
          sendError(res, 404, "Menu costing sheet was not found.");
          return;
        }
        await captureForBin(database, authenticatedSession, "nutrition", "nutrition-costing", costing);
        clearResponseCache();
        sendJson(res, 200, { costing });
        return;
      }

      if (pathname === "/api/nutrition/financial/reports" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, async () => ({
          reports: await database.listNutritionFinancialReports({
            search: url.searchParams.get("search") || "",
            centerId: url.searchParams.get("centerId") || "",
            year: url.searchParams.get("year") || "",
            limit: url.searchParams.get("limit") || 200,
            offset: url.searchParams.get("offset") || 0
          }),
          total: typeof database.countNutritionFinancialReports === "function"
            ? await database.countNutritionFinancialReports({
                search: url.searchParams.get("search") || "",
                centerId: url.searchParams.get("centerId") || "",
                year: url.searchParams.get("year") || ""
              })
            : 0
        }));
        return;
      }

      if (pathname === "/api/nutrition/financial/reports" && req.method === "POST") {
        const payload = await readJsonBody(req);
        clearResponseCache();
        sendJson(res, 200, { report: await database.saveNutritionFinancialReport(payload) });
        return;
      }

      if (pathname === "/api/nutrition/financial/summary" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, () => database.nutritionFinancialSummary({
          year: url.searchParams.get("year") || new Date().getFullYear()
        }));
        return;
      }

      if (pathname === "/api/nutrition/financial/budgets" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, async () => ({
          budgets: await database.listNutritionFinancialBudgets({
            year: url.searchParams.get("year") || new Date().getFullYear(),
            centerId: url.searchParams.get("centerId") || ""
          })
        }));
        return;
      }

      if (pathname === "/api/nutrition/financial/budgets" && req.method === "POST") {
        const payload = await readJsonBody(req);
        clearResponseCache();
        sendJson(res, 200, { budgets: await database.saveNutritionFinancialBudgets(payload) });
        return;
      }

      if (pathname.startsWith("/api/nutrition/financial/reports/") && req.method === "GET") {
        const id = recordIdFromPath(pathname, "/api/nutrition/financial/reports/");
        const report = id ? await sendRecordFromCache(req, res, url, () => database.getNutritionFinancialReport(id), "report") : null;
        if (!report) {
          sendError(res, 404, "Financial report was not found.");
          return;
        }
        return;
      }

      if (pathname.startsWith("/api/nutrition/financial/reports/") && req.method === "DELETE") {
        const id = recordIdFromPath(pathname, "/api/nutrition/financial/reports/");
        const report = id ? await database.deleteNutritionFinancialReport(id) : null;
        if (!report) {
          sendError(res, 404, "Financial report was not found.");
          return;
        }
        await captureForBin(database, authenticatedSession, "nutrition", "nutrition-financial-report", report);
        clearResponseCache();
        sendJson(res, 200, { report });
        return;
      }

      if (pathname === "/api/nutrition/centers" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, async () => ({
          centers: await database.listNutritionCenters({
            search: url.searchParams.get("search") || "",
            limit: url.searchParams.get("limit") || 200,
            offset: url.searchParams.get("offset") || 0
          })
        }));
        return;
      }

      if (pathname === "/api/nutrition/centers" && req.method === "POST") {
        const payload = await readJsonBody(req);
        clearResponseCache();
        sendJson(res, 200, { center: await database.saveNutritionCenter(payload) });
        return;
      }

      if (pathname.startsWith("/api/nutrition/centers/") && req.method === "GET") {
        const id = recordIdFromPath(pathname, "/api/nutrition/centers/");
        const center = id ? await sendRecordFromCache(req, res, url, () => database.getNutritionCenter(id), "center") : null;

        if (!center) {
          sendError(res, 404, "Feeding center was not found.");
          return;
        }

        return;
      }

      if (pathname.startsWith("/api/nutrition/centers/") && req.method === "DELETE") {
        const id = recordIdFromPath(pathname, "/api/nutrition/centers/");
        const center = id ? await database.deleteNutritionCenter(id) : null;

        if (!center) {
          sendError(res, 404, "Feeding center was not found.");
          return;
        }

        await captureForBin(database, authenticatedSession, "nutrition", "nutrition-center", center);
        clearResponseCache();
        sendJson(res, 200, { center });
        return;
      }

      if (pathname === "/api/nutrition/beneficiaries" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, async () => ({
          beneficiaries: await database.listNutritionBeneficiaries({
            search: url.searchParams.get("search") || "",
            centerId: url.searchParams.get("centerId") || "",
            limit: url.searchParams.get("limit") || 200,
            offset: url.searchParams.get("offset") || 0
          }),
          total: typeof database.countNutritionBeneficiaries === "function"
            ? await database.countNutritionBeneficiaries({
              search: url.searchParams.get("search") || "",
              centerId: url.searchParams.get("centerId") || ""
            })
            : 0
        }));
        return;
      }

      if (pathname === "/api/nutrition/beneficiaries" && req.method === "POST") {
        const payload = await readJsonBody(req);
        clearResponseCache();
        sendJson(res, 200, { beneficiary: await database.saveNutritionBeneficiary(payload) });
        return;
      }

      if (pathname.startsWith("/api/nutrition/beneficiaries/") && req.method === "GET") {
        const id = recordIdFromPath(pathname, "/api/nutrition/beneficiaries/");
        const beneficiary = id ? await sendRecordFromCache(req, res, url, () => database.getNutritionBeneficiary(id), "beneficiary") : null;

        if (!beneficiary) {
          sendError(res, 404, "Nutrition beneficiary was not found.");
          return;
        }

        return;
      }

      if (pathname.startsWith("/api/nutrition/beneficiaries/") && req.method === "DELETE") {
        const id = recordIdFromPath(pathname, "/api/nutrition/beneficiaries/");
        const beneficiary = id ? await database.deleteNutritionBeneficiary(id) : null;

        if (!beneficiary) {
          sendError(res, 404, "Nutrition beneficiary was not found.");
          return;
        }

        await captureForBin(database, authenticatedSession, "nutrition", "nutrition-beneficiary", beneficiary);
        clearResponseCache();
        sendJson(res, 200, { beneficiary });
        return;
      }

      if (pathname === "/api/bin" && req.method === "GET") {
        await sendCachedJson(res, cacheKey(req, url), SHORT_CACHE_MS, async () => ({
          records: await database.listDeletedRecords({
            limit: url.searchParams.get("limit") || 100,
            offset: url.searchParams.get("offset") || 0
          }),
          total: typeof database.countDeletedRecords === "function" ? await database.countDeletedRecords() : 0
        }));
        return;
      }

      if (pathname.startsWith("/api/bin/") && pathname.endsWith("/restore") && req.method === "POST") {
        const id = recordIdFromPath(pathname, "/api/bin/");
        clearResponseCache();
        sendJson(res, 200, { record: await database.restoreDeletedRecord(id) });
        return;
      }

      if (pathname === "/api/export" && req.method === "GET") {
        if (authenticatedSession?.user?.role !== "superadmin") {
          sendError(res, 403, "Only the superadmin can export the complete PAOFI database.");
          return;
        }
        const exported = await database.exportData();
        if (database.scholarship) exported.scholarship = await database.scholarship.exportAll();
        if (database.operations) exported.operations = await database.operations.exportAll();
        sendJson(res, 200, exported);
        return;
      }

      if (pathname.startsWith("/api/")) {
        sendError(res, 404, "API endpoint was not found.");
        return;
      }

      sendStatic(req, res);
    } catch (error) {
      const statusCode = statusCodeForError(error);
      sendError(
        res,
        statusCode,
        statusCode === 503 ? databaseConnectionMessage(error) : error?.message || "Unexpected server error."
      );
    }
  });

  server.setDatabase = nextDatabase => {
    database = nextDatabase;
    databaseError = null;
  };

  server.setDatabaseError = error => {
    databaseError = error;
  };

  return server;
}

function openBrowser(url) {
  if (process.env.NO_OPEN === "1" || process.argv.includes("--no-open")) return;

  if (process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], {
      detached: true,
      stdio: "ignore",
      windowsHide: true
    }).unref();
  }
}

async function main() {
  let activeDatabase = null;
  let startupError = null;
  let connectPromise = null;

  async function connectDatabase() {
    if (activeDatabase) return activeDatabase;
    if (connectPromise) return connectPromise;

    connectPromise = createDatabase()
      .then(async database => {
        await database.warmup?.();
        activeDatabase = database;
        server.setDatabase(database);
        console.log(`Database: ${activeDatabase.dbPath}`);
        return activeDatabase;
      })
      .catch(error => {
        startupError = error;
        server.setDatabaseError(error);
        console.error(error?.stack || error?.message || error);
        throw error;
      })
      .finally(() => {
        connectPromise = null;
      });

    return connectPromise;
  }

  const server = createServer(activeDatabase, startupError, connectDatabase);

  server.listen(PORT, HOST, () => {
    const url = `http://${HOST}:${PORT}`;
    console.log(`PAOFI Database is running at ${url}`);
    console.log("Database: Connecting");
    openBrowser(url);
    connectDatabase().catch(() => {});
  });

  process.on("SIGINT", () => {
    Promise.resolve(activeDatabase?.close?.()).finally(() => {
      server.close(() => process.exit(0));
    });
  });
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = {
  createServer
};
