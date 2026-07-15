const {
  ENTITY_DEFINITIONS,
  PROGRAM_CODES,
  PROGRAM_ROLES
} = require("./operations-store");
const {
  FINANCE_ARCHIVE_ROLES,
  FINANCE_WRITE_ROLES,
  ROUTINE_WRITE_ROLES,
  WORKSPACE_READ_ROLES
} = require("./program-roles");

const ENTITY_WRITE_ROLES = {
  cases: ["program_officer", "encoder"],
  people: ROUTINE_WRITE_ROLES,
  personnelActions: [...ROUTINE_WRITE_ROLES, "finance"],
  assets: ROUTINE_WRITE_ROLES,
  procurements: [...ROUTINE_WRITE_ROLES, "finance"],
  finance: FINANCE_WRITE_ROLES,
  donations: ["program_officer", "finance"],
  distributions: ["program_officer", "finance", "encoder"],
  compliance: ROUTINE_WRITE_ROLES,
  policies: ["program_officer"],
  nutritionAdmissions: ROUTINE_WRITE_ROLES,
  nutritionAttendance: ROUTINE_WRITE_ROLES,
  nutritionHealthSafety: ROUTINE_WRITE_ROLES,
  scholarshipApplications: ROUTINE_WRITE_ROLES,
  scholarshipCommunications: ROUTINE_WRITE_ROLES,
  scholarshipTutorials: ROUTINE_WRITE_ROLES,
  healthPatients: ROUTINE_WRITE_ROLES,
  healthEncounters: ROUTINE_WRITE_ROLES,
  healthTbRecords: ROUTINE_WRITE_ROLES,
  healthInventory: ROUTINE_WRITE_ROLES,
  healthEquipment: ROUTINE_WRITE_ROLES,
  audit: []
};

const ENTITY_READ_ROLES = {
  cases: ["program_officer"],
  finance: WORKSPACE_READ_ROLES,
  donations: WORKSPACE_READ_ROLES,
  distributions: WORKSPACE_READ_ROLES,
  audit: ["program_officer"],
  default: WORKSPACE_READ_ROLES
};

function rolesFor(session, programCode) {
  if (session?.user?.role === "superadmin") return ["superadmin"];
  return session?.user?.program_roles?.[programCode] || [];
}

function hasRole(session, programCode, allowedRoles) {
  if (session?.user?.role === "superadmin") return true;
  const assigned = new Set(rolesFor(session, programCode));
  return allowedRoles.some(role => assigned.has(role));
}

function requireEntityRead(session, entity, sendError, res) {
  const definition = ENTITY_DEFINITIONS[entity];
  const allowed = ENTITY_READ_ROLES[entity] || ENTITY_READ_ROLES.default;
  if (definition && hasRole(session, definition.program, allowed)) return true;
  sendError(res, 403, "Your account does not have access to this operational record.");
  return false;
}

function requireEntityWrite(session, entity, sendError, res) {
  const definition = ENTITY_DEFINITIONS[entity];
  if (definition && hasRole(session, definition.program, ENTITY_WRITE_ROLES[entity] || [])) return true;
  sendError(res, 403, "Your program roles do not allow this change.");
  return false;
}

function requireEntityOfficer(session, entity, sendError, res) {
  const definition = ENTITY_DEFINITIONS[entity];
  const allowed = ["program_officer"];
  if (["finance", "donations", "distributions", "personnelActions"].includes(entity)) allowed.push("finance");
  if (definition && hasRole(session, definition.program, allowed)) return true;
  sendError(res, 403, "A Program Officer must archive or restore this record.");
  return false;
}

function entityPath(pathname) {
  const match = /^\/api\/operations\/entities\/([A-Za-z]+)(?:\/(\d+))?(?:\/([A-Za-z-]+))?$/.exec(pathname);
  if (!match) return null;
  return { entity: match[1], id: Number(match[2] || 0), action: match[3] || "" };
}

function programFinancePath(pathname) {
  const match = /^\/api\/operations\/program-finance\/([a-z]+)(?:\/(\d+))?(?:\/(restore))?$/.exec(pathname);
  if (!match) return null;
  return { programCode: match[1], id: Number(match[2] || 0), action: match[3] || "" };
}

function listOptions(url) {
  const options = {
    search: url.searchParams.get("search") || "",
    limit: url.searchParams.get("limit") || 50,
    offset: url.searchParams.get("offset") || 0,
    include_archived: url.searchParams.get("include_archived") || "",
    archived_only: url.searchParams.get("archived_only") || ""
  };
  for (const [key, value] of url.searchParams.entries()) {
    if (!["search", "limit", "offset", "include_archived", "archived_only"].includes(key)) options[key] = value;
  }
  return options;
}

async function handleOperationsRequest(context) {
  const {
    req, res, url, database, session, sendJson, sendError, readJsonBody,
    sendCachedJson, cacheKey, clearResponseCache, shortCacheMs, mediumCacheMs
  } = context;
  const pathname = url.pathname;
  if (!pathname.startsWith("/api/operations/")) return false;
  const store = database.operations;
  if (!store) {
    sendError(res, 503, "Operational data services are not ready.");
    return true;
  }

  if (pathname === "/api/operations/meta" && req.method === "GET") {
    sendJson(res, 200, {
      programs: PROGRAM_CODES,
      roles: PROGRAM_ROLES,
      assigned_roles: session?.user?.program_roles || {},
      entities: Object.fromEntries(Object.entries(ENTITY_DEFINITIONS).map(([key, value]) => [key, { program: value.program }])),
      permissions: ENTITY_WRITE_ROLES
    });
    return true;
  }

  const financePath = programFinancePath(pathname);
  if (financePath) {
    const { programCode, id, action } = financePath;
    if (!PROGRAM_CODES.includes(programCode) || programCode === "administration") {
      sendError(res, 400, "Choose a valid PAOFI program finance ledger.");
      return true;
    }
    if (!hasRole(session, programCode, WORKSPACE_READ_ROLES)) {
      sendError(res, 403, "Your account does not have access to this program finance ledger.");
      return true;
    }
    if (req.method === "GET" && !id) {
      const options = { ...listOptions(url), program_code: programCode };
      await sendCachedJson(res, cacheKey(req, url), shortCacheMs, async () => {
        const [records, total] = await Promise.all([store.list("finance", options), store.count("finance", options)]);
        return { records, total, program_code: programCode };
      });
      return true;
    }
    if (req.method === "GET" && id && !action) {
      const record = await store.get("finance", id);
      if (!record || record.program_code !== programCode) sendError(res, 404, "Program finance record was not found.");
      else sendJson(res, 200, { record });
      return true;
    }
    if (req.method === "POST" && !id) {
      if (!hasRole(session, programCode, FINANCE_WRITE_ROLES)) {
        sendError(res, 403, "Your program role does not allow finance changes.");
        return true;
      }
      const payload = { ...(await readJsonBody(req)), program_code: programCode };
      if (!hasRole(session, programCode, ["program_officer", "finance"]) && !["Draft", "Submitted"].includes(payload.status || "Draft")) {
        sendError(res, 403, "Only Program Officers and Finance users can approve or close financial records.");
        return true;
      }
      const record = await store.save("finance", payload, session.user.id);
      clearResponseCache();
      sendJson(res, 200, { record });
      return true;
    }
    if (req.method === "POST" && id && action === "restore") {
      if (!hasRole(session, programCode, FINANCE_ARCHIVE_ROLES)) {
        sendError(res, 403, "A Program Officer or Finance user must restore this record.");
        return true;
      }
      const existing = await store.get("finance", id);
      if (!existing || existing.program_code !== programCode) sendError(res, 404, "Program finance record was not found.");
      else {
        const record = await store.restore("finance", id, session.user.id);
        clearResponseCache();
        sendJson(res, 200, { record });
      }
      return true;
    }
    if (req.method === "DELETE" && id && !action) {
      if (!hasRole(session, programCode, FINANCE_ARCHIVE_ROLES)) {
        sendError(res, 403, "A Program Officer or Finance user must archive this record.");
        return true;
      }
      const existing = await store.get("finance", id);
      if (!existing || existing.program_code !== programCode) sendError(res, 404, "Program finance record was not found.");
      else {
        const record = await store.archive("finance", id, session.user.id);
        clearResponseCache();
        sendJson(res, 200, { record });
      }
      return true;
    }
    return false;
  }

  if (pathname === "/api/operations/overview" && req.method === "GET") {
    const programCode = url.searchParams.get("program") || "";
    if (programCode && !PROGRAM_CODES.includes(programCode)) {
      sendError(res, 400, "Unsupported program code.");
      return true;
    }
    if (!programCode && session?.user?.role !== "superadmin") {
      sendError(res, 403, "Choose a program you are assigned to view.");
      return true;
    }
    if (programCode && !hasRole(session, programCode, PROGRAM_ROLES)) {
      sendError(res, 403, "Your account does not have access to this program.");
      return true;
    }
    await sendCachedJson(res, cacheKey(req, url), shortCacheMs, () => store.overview(programCode));
    return true;
  }

  if (pathname === "/api/operations/export" && req.method === "GET") {
    const entity = url.searchParams.get("entity") || "";
    if (!entity || !ENTITY_DEFINITIONS[entity] || !requireEntityRead(session, entity, sendError, res)) return true;
    if (!hasRole(session, ENTITY_DEFINITIONS[entity].program, ["program_officer", "finance"])) {
      sendError(res, 403, "A Program Officer must export operational records.");
      return true;
    }
    const options = { ...listOptions(url), offset: 0 };
    await sendCachedJson(res, cacheKey(req, url), mediumCacheMs, async () => ({
      exportedAt: new Date().toISOString(),
      entity,
      filters: options,
      records: await store.exportEntity(entity, options)
    }));
    return true;
  }

  if (pathname === "/api/operations/batch/nutritionAttendance" && req.method === "POST") {
    if (!requireEntityWrite(session, "nutritionAttendance", sendError, res)) return true;
    const payload = await readJsonBody(req);
    if (!Array.isArray(payload.rows) || !payload.rows.length) {
      sendError(res, 400, "Select at least one child attendance record.");
      return true;
    }
    const records = [];
    for (const row of payload.rows) records.push(await store.save("nutritionAttendance", row, session.user.id));
    clearResponseCache();
    sendJson(res, 200, { records, saved: records.length });
    return true;
  }

  const parsed = entityPath(pathname);
  if (!parsed || !ENTITY_DEFINITIONS[parsed.entity]) return false;
  if (!requireEntityRead(session, parsed.entity, sendError, res)) return true;

  if (req.method === "GET" && !parsed.id) {
    const options = listOptions(url);
    await sendCachedJson(res, cacheKey(req, url), shortCacheMs, async () => {
      const [records, total] = await Promise.all([
        store.list(parsed.entity, options),
        store.count(parsed.entity, options)
      ]);
      return { records, total };
    });
    return true;
  }

  if (req.method === "GET" && parsed.id && !parsed.action) {
    const record = await store.get(parsed.entity, parsed.id);
    if (!record) sendError(res, 404, "Operational record was not found.");
    else sendJson(res, 200, { record });
    return true;
  }

  if (req.method === "POST" && !parsed.id) {
    if (!requireEntityWrite(session, parsed.entity, sendError, res)) return true;
    const payload = await readJsonBody(req);
    if (parsed.entity === "finance"
        && !hasRole(session, "administration", ["program_officer", "finance"])
        && !["Draft", "Submitted"].includes(payload.status || "Draft")) {
      sendError(res, 403, "Only Program Officers and Finance users can approve or close financial records.");
      return true;
    }
    const record = await store.save(parsed.entity, payload, session.user.id);
    clearResponseCache();
    sendJson(res, 200, { record });
    return true;
  }

  if (req.method === "POST" && parsed.id && parsed.action === "restore") {
    if (!requireEntityOfficer(session, parsed.entity, sendError, res)) return true;
    const record = await store.restore(parsed.entity, parsed.id, session.user.id);
    clearResponseCache();
    sendJson(res, 200, { record });
    return true;
  }

  if (req.method === "DELETE" && parsed.id && !parsed.action) {
    if (!requireEntityOfficer(session, parsed.entity, sendError, res)) return true;
    const record = await store.archive(parsed.entity, parsed.id, session.user.id);
    if (!record) sendError(res, 404, "Operational record was not found.");
    else {
      clearResponseCache();
      sendJson(res, 200, { record });
    }
    return true;
  }

  return false;
}

module.exports = {
  ENTITY_READ_ROLES,
  ENTITY_WRITE_ROLES,
  handleOperationsRequest,
  hasRole,
  rolesFor
};
