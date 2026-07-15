const {
  ENTITY_DEFINITIONS,
  SCHOLARSHIP_ATTENDANCE_TYPES,
  SCHOLARSHIP_REQUIREMENT_STATUSES,
  SCHOLARSHIP_RENEWAL_DECISIONS,
  SCHOLARSHIP_ROLES
} = require("./scholarship-store");
const { ROUTINE_WRITE_ROLES, WORKSPACE_READ_ROLES } = require("./program-roles");
const {
  commitScholarshipImport,
  previewScholarshipImport,
  scholarshipImportTemplate
} = require("./scholarship-import");

const VIEW_ROLES = new Set(WORKSPACE_READ_ROLES);
const ENTITY_WRITE_ROLES = {
  chapels: ["program_officer"],
  scholars: ROUTINE_WRITE_ROLES,
  academicYears: ["program_officer"],
  academicPeriods: ["program_officer"],
  enrollments: ROUTINE_WRITE_ROLES,
  sponsors: ["program_officer", "finance", "program_assistant"],
  sponsorships: ["program_officer", "finance", "program_assistant"],
  pledges: ["finance"],
  invoices: ["finance"],
  payments: ["finance"],
  receipts: ["finance"],
  allocations: ["finance"],
  documentSettings: ["finance"],
  grades: ROUTINE_WRITE_ROLES,
  events: ROUTINE_WRITE_ROLES,
  attendance: ROUTINE_WRITE_ROLES,
  guardianAttendance: ROUTINE_WRITE_ROLES,
  renewalTemplates: ["program_officer"],
  renewals: ROUTINE_WRITE_ROLES,
  renewalEvaluations: ["program_officer"],
  evaluationTemplates: ["program_officer"],
  evaluations: ROUTINE_WRITE_ROLES,
  documentLinks: ROUTINE_WRITE_ROLES,
  audit: []
};

function sessionRoles(session) {
  if (session?.user?.role === "superadmin") return ["superadmin"];
  return session?.user?.program_roles?.scholarship || [];
}

function hasRole(session, allowedRoles) {
  if (session?.user?.role === "superadmin") return true;
  const assigned = new Set(sessionRoles(session));
  return allowedRoles.some(role => assigned.has(role));
}

function requireScholarshipAccess(session, sendError, res) {
  if (hasRole(session, [...VIEW_ROLES])) return true;
  sendError(res, 403, "Your account does not have access to the Scholarship Program.");
  return false;
}

function requireEntityWrite(session, entity, sendError, res) {
  const roles = ENTITY_WRITE_ROLES[entity] || [];
  if (hasRole(session, roles)) return true;
  sendError(res, 403, "Your Scholarship roles do not allow this change.");
  return false;
}

function requireOfficer(session, sendError, res) {
  if (hasRole(session, ["program_officer"])) return true;
  sendError(res, 403, "A Scholarship Program Officer must approve this action.");
  return false;
}

function requireFinance(session, sendError, res) {
  if (hasRole(session, ["finance"])) return true;
  sendError(res, 403, "A Scholarship Finance role is required for this action.");
  return false;
}

function entityPath(pathname) {
  const match = /^\/api\/scholarship\/entities\/([A-Za-z]+)(?:\/(\d+))?(?:\/([A-Za-z-]+))?$/.exec(pathname);
  if (!match) return null;
  return { entity: match[1], id: Number(match[2] || 0), action: match[3] || "" };
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

async function handleEntityAction({ store, entity, id, action, payload, session }) {
  const userId = session.user.id;
  if (action === "issue") return store.issueDocument(entity, id, userId);
  if (action === "void") return store.voidDocument(entity, id, payload.reason, userId);
  if (action === "reissue") return store.reissueDocument(entity, id, userId);
  if (action === "reverse" && entity === "payments") return store.reversePayment(id, payload.reason, userId);
  if (action === "approve" && entity === "renewals") return store.approveRenewal(id, userId);
  if (action === "recalculate" && entity === "renewals") return store.calculateRenewalEvaluation(id, {}, userId);
  if (action === "evaluate" && entity === "renewals") return store.calculateRenewalEvaluation(id, payload, userId);
  if (action === "complete" && entity === "evaluations") return store.completeEvaluation(id, userId);
  if (action === "revise" && entity === "evaluations") return store.reviseEvaluation(id, userId);
  throw new Error("Unsupported Scholarship action.");
}

async function handleScholarshipRequest(context) {
  const {
    req, res, url, database, session, sendJson, sendError, readJsonBody,
    sendCachedJson, cacheKey, clearResponseCache, shortCacheMs, mediumCacheMs
  } = context;
  const pathname = url.pathname;
  if (!pathname.startsWith("/api/scholarship/")) return false;
  if (!requireScholarshipAccess(session, sendError, res)) return true;
  const store = database.scholarship;
  if (!store) {
    sendError(res, 503, "Scholarship data services are not ready.");
    return true;
  }

  if (pathname === "/api/scholarship/meta" && req.method === "GET") {
    sendJson(res, 200, {
      roles: SCHOLARSHIP_ROLES,
      assigned_roles: sessionRoles(session),
      entities: Object.keys(ENTITY_DEFINITIONS),
      permissions: ENTITY_WRITE_ROLES,
      attendance_types: SCHOLARSHIP_ATTENDANCE_TYPES,
      requirement_statuses: SCHOLARSHIP_REQUIREMENT_STATUSES,
      renewal_decisions: SCHOLARSHIP_RENEWAL_DECISIONS
    });
    return true;
  }

  if (pathname === "/api/scholarship/dashboard" && req.method === "GET") {
    await sendCachedJson(res, cacheKey(req, url), shortCacheMs, () => store.dashboard());
    return true;
  }

  if (pathname === "/api/scholarship/finance/yearly" && req.method === "GET") {
    const year = url.searchParams.get("year") || new Date().getFullYear();
    await sendCachedJson(res, cacheKey(req, url), mediumCacheMs, () => store.financialYearSummary(year));
    return true;
  }

  if (pathname === "/api/scholarship/export" && req.method === "GET") {
    const entity = url.searchParams.get("entity") || "";
    if (entity) {
      if (!ENTITY_DEFINITIONS[entity]) {
        sendError(res, 400, "Unsupported Scholarship export type.");
        return true;
      }
      const options = { ...listOptions(url), limit: 500, offset: 0 };
      sendJson(res, 200, {
        exportedAt: new Date().toISOString(),
        entity,
        filters: options,
        records: await store.exportEntity(entity, options)
      });
      return true;
    }
    await sendCachedJson(res, cacheKey(req, url), mediumCacheMs, () => store.exportAll());
    return true;
  }

  if (pathname === "/api/scholarship/import/template" && req.method === "GET") {
    const type = url.searchParams.get("type") || "scholars";
    sendJson(res, 200, await scholarshipImportTemplate(type));
    return true;
  }

  if (pathname === "/api/scholarship/import/preview" && req.method === "POST") {
    const payload = await readJsonBody(req);
    const entity = payload.type === "sponsors" ? "sponsors" : payload.type === "enrollments" ? "enrollments" : "scholars";
    if (!requireEntityWrite(session, entity, sendError, res)) return true;
    sendJson(res, 200, await previewScholarshipImport(store, payload.type, payload.file_data));
    return true;
  }

  if (pathname === "/api/scholarship/import/commit" && req.method === "POST") {
    const payload = await readJsonBody(req);
    const entity = payload.type === "sponsors" ? "sponsors" : payload.type === "enrollments" ? "enrollments" : "scholars";
    if (!requireEntityWrite(session, entity, sendError, res)) return true;
    const result = await commitScholarshipImport(store, payload.type, payload.rows, session.user.id);
    clearResponseCache();
    sendJson(res, 200, result);
    return true;
  }

  if (pathname === "/api/scholarship/batch/renewals/load" && req.method === "POST") {
    const payload = await readJsonBody(req);
    sendJson(res, 200, { records: await store.renewalBatchRecords(payload.ids || []) });
    return true;
  }

  if (pathname === "/api/scholarship/batch/renewals" && req.method === "POST") {
    if (!requireEntityWrite(session, "renewals", sendError, res)) return true;
    const payload = await readJsonBody(req);
    if (!Array.isArray(payload.rows) || !payload.rows.length) {
      sendError(res, 400, "Select at least one renewal checklist to update.");
      return true;
    }
    const result = await store.batchUpdateRenewals(payload.rows, session.user.id);
    clearResponseCache();
    sendJson(res, 200, result);
    return true;
  }

  if (pathname === "/api/scholarship/batch/renewal-evaluations" && req.method === "POST") {
    if (!requireOfficer(session, sendError, res)) return true;
    const payload = await readJsonBody(req);
    if (!Array.isArray(payload.rows) || !payload.rows.length) {
      sendError(res, 400, "Select at least one scholar evaluation to update.");
      return true;
    }
    const result = await store.batchUpdateRenewalEvaluations(payload.rows, session.user.id);
    clearResponseCache();
    sendJson(res, 200, result);
    return true;
  }

  const parsed = entityPath(pathname);
  if (!parsed || !ENTITY_DEFINITIONS[parsed.entity]) return false;

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
    if (!record) sendError(res, 404, "Scholarship record was not found.");
    else sendJson(res, 200, { record });
    return true;
  }

  if (req.method === "POST" && !parsed.id) {
    if (!requireEntityWrite(session, parsed.entity, sendError, res)) return true;
    const payload = await readJsonBody(req);
    const record = await store.save(parsed.entity, payload, session.user.id);
    clearResponseCache();
    sendJson(res, 200, { record });
    return true;
  }

  if (req.method === "POST" && parsed.id && parsed.action) {
    if (parsed.action === "restore") {
      if (session.user.role !== "superadmin" && !hasRole(session, ["program_officer", "finance"])) {
        sendError(res, 403, "A Program Officer or Finance user must restore Scholarship records.");
        return true;
      }
      const record = await store.restore(parsed.entity, parsed.id, session.user.id);
      if (!record) sendError(res, 404, "Scholarship record was not found.");
      else {
        clearResponseCache();
        sendJson(res, 200, { record });
      }
      return true;
    }
    if (["issue", "void", "reissue", "reverse"].includes(parsed.action)) {
      if (!requireFinance(session, sendError, res)) return true;
    } else if (["approve", "evaluate", "complete", "revise"].includes(parsed.action)) {
      if (!requireOfficer(session, sendError, res)) return true;
    } else if (!requireEntityWrite(session, parsed.entity, sendError, res)) {
      return true;
    }
    const payload = await readJsonBody(req);
    const record = await handleEntityAction({ store, ...parsed, payload, session });
    clearResponseCache();
    sendJson(res, 200, { record });
    return true;
  }

  if (req.method === "DELETE" && parsed.id && !parsed.action) {
    if (!requireEntityWrite(session, parsed.entity, sendError, res)) return true;
    if (session.user.role !== "superadmin" && !hasRole(session, ["program_officer", "finance"])) {
      sendError(res, 403, "Encoders and viewers cannot delete Scholarship records.");
      return true;
    }
    const record = await store.remove(parsed.entity, parsed.id, session.user.id);
    if (!record) sendError(res, 404, "Scholarship record was not found.");
    else {
      clearResponseCache();
      sendJson(res, 200, { record });
    }
    return true;
  }

  return false;
}

module.exports = {
  ENTITY_WRITE_ROLES,
  handleScholarshipRequest,
  hasRole,
  sessionRoles
};
