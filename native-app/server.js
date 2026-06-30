const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { BeneficiaryDatabase } = require("./src/database");
const { BENEFICIARY_FIELDS, fieldSectionMap } = require("./src/metadata");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 3417);
const PUBLIC_DIR = path.join(__dirname, "public");
const BODY_LIMIT_BYTES = 20 * 1024 * 1024;

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

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
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

function createServer(database = new BeneficiaryDatabase()) {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      const pathname = url.pathname;

      if (pathname === "/api/metadata" && req.method === "GET") {
        sendJson(res, 200, {
          fields: BENEFICIARY_FIELDS,
          sections: fieldSectionMap()
        });
        return;
      }

      if (pathname === "/api/stats" && req.method === "GET") {
        sendJson(res, 200, database.stats());
        return;
      }

      if (pathname === "/api/next-control-no" && req.method === "GET") {
        const year = Number(url.searchParams.get("year")) || new Date().getFullYear();
        sendJson(res, 200, { controlNo: database.nextControlNo(year) });
        return;
      }

      if (pathname === "/api/records" && req.method === "GET") {
        sendJson(res, 200, {
          records: database.listRecords({
            search: url.searchParams.get("search") || "",
            limit: url.searchParams.get("limit") || 50,
            detail: url.searchParams.get("detail") || "summary"
          })
        });
        return;
      }

      if (pathname === "/api/records" && req.method === "POST") {
        const payload = await readJsonBody(req);
        sendJson(res, 200, { record: database.saveRecord(payload) });
        return;
      }

      if (pathname.startsWith("/api/records/") && req.method === "GET") {
        const id = recordIdFromPath(pathname, "/api/records/");
        const record = id ? database.getRecord(id) : null;

        if (!record) {
          sendError(res, 404, "Record was not found.");
          return;
        }

        sendJson(res, 200, { record });
        return;
      }

      if (pathname.startsWith("/api/records/") && req.method === "DELETE") {
        const id = recordIdFromPath(pathname, "/api/records/");
        const record = id ? database.deleteRecord(id) : null;

        if (!record) {
          sendError(res, 404, "Record was not found.");
          return;
        }

        sendJson(res, 200, { record });
        return;
      }

      if (pathname === "/api/bin" && req.method === "GET") {
        sendJson(res, 200, { records: database.listDeletedRecords() });
        return;
      }

      if (pathname.startsWith("/api/bin/") && pathname.endsWith("/restore") && req.method === "POST") {
        const id = recordIdFromPath(pathname, "/api/bin/");
        sendJson(res, 200, { record: database.restoreDeletedRecord(id) });
        return;
      }

      if (pathname === "/api/export" && req.method === "GET") {
        sendJson(res, 200, database.exportData());
        return;
      }

      if (pathname.startsWith("/api/")) {
        sendError(res, 404, "API endpoint was not found.");
        return;
      }

      sendStatic(req, res);
    } catch (error) {
      sendError(res, 500, error.message || "Unexpected server error.");
    }
  });
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

if (require.main === module) {
  const database = new BeneficiaryDatabase();
  const server = createServer(database);

  server.listen(PORT, HOST, () => {
    const url = `http://${HOST}:${PORT}`;
    console.log(`LP Database is running at ${url}`);
    console.log(`Database file: ${database.dbPath}`);
    openBrowser(url);
  });

  process.on("SIGINT", () => {
    database.close();
    server.close(() => process.exit(0));
  });
}

module.exports = {
  createServer
};
