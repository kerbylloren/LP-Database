const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const { FIELD_NAMES, SUMMARY_FIELDS } = require("./metadata");

const DATA_DIR = path.join(__dirname, "..", "data");
const DEFAULT_DB_PATH = path.join(DATA_DIR, "lp_database.sqlite");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function quoted(name) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(name)) {
    throw new Error(`Unsafe column name: ${name}`);
  }

  return `"${name}"`;
}

function normalizeText(value) {
  if (value === null || typeof value === "undefined") return "";
  return String(value);
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeRecord(input = {}) {
  const output = {};

  FIELD_NAMES.forEach(fieldName => {
    output[fieldName] = normalizeText(input[fieldName]);
  });

  if (!output.date_updated) output.date_updated = todayDate();
  if (!output.status) output.status = "Active";
  output.control_no = output.control_no.trim();

  return output;
}

class BeneficiaryDatabase {
  constructor(dbPath = process.env.LPDB_DB_PATH || DEFAULT_DB_PATH) {
    this.dbPath = dbPath;
    ensureDir(path.dirname(dbPath));
    this.db = new DatabaseSync(dbPath);
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.db.exec("PRAGMA foreign_keys = ON;");
    this.init();
  }

  init() {
    const fieldColumns = FIELD_NAMES
      .map(fieldName => `${quoted(fieldName)} TEXT NOT NULL DEFAULT ''`)
      .join(",\n        ");

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS beneficiaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ${fieldColumns},
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_beneficiaries_control_no
        ON beneficiaries(control_no);

      CREATE INDEX IF NOT EXISTS idx_beneficiaries_name
        ON beneficiaries(last_name, first_name, middle_name);

      CREATE TABLE IF NOT EXISTS deleted_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_id INTEGER,
        control_no TEXT NOT NULL,
        display_name TEXT NOT NULL,
        deleted_at TEXT NOT NULL,
        snapshot_json TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_deleted_records_control_no
        ON deleted_records(control_no);
    `);
  }

  close() {
    this.db.close();
  }

  stats() {
    const active = this.db.prepare("SELECT COUNT(*) AS count FROM beneficiaries").get().count;
    const deleted = this.db.prepare("SELECT COUNT(*) AS count FROM deleted_records").get().count;

    return {
      active,
      deleted,
      databasePath: this.dbPath
    };
  }

  nextControlNo(year = new Date().getFullYear()) {
    const prefix = `LP-${year}-`;
    const activeRows = this.db
      .prepare("SELECT control_no FROM beneficiaries WHERE control_no LIKE ?")
      .all(`${prefix}%`);
    const deletedRows = this.db
      .prepare("SELECT control_no FROM deleted_records WHERE control_no LIKE ?")
      .all(`${prefix}%`);
    const highest = [...activeRows, ...deletedRows].reduce((max, row) => {
      const numberPart = Number(String(row.control_no || "").slice(prefix.length));
      return Number.isFinite(numberPart) && numberPart > max ? numberPart : max;
    }, 0);

    return `${prefix}${String(highest + 1).padStart(3, "0")}`;
  }

  listRecords({ search = "", limit = 50, detail = "summary" } = {}) {
    const max = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const selectedFields = detail === "full"
      ? ["id", ...FIELD_NAMES, "created_at", "updated_at"]
      : SUMMARY_FIELDS;
    const columns = selectedFields.map(quoted).join(", ");

    if (!search.trim()) {
      return this.db
        .prepare(`SELECT ${columns} FROM beneficiaries ORDER BY updated_at DESC, id DESC LIMIT ?`)
        .all(max);
    }

    const pattern = `%${search.trim().toLowerCase()}%`;
    return this.db
      .prepare(`
        SELECT ${columns}
        FROM beneficiaries
        WHERE lower(control_no) LIKE ?
          OR lower(last_name) LIKE ?
          OR lower(first_name) LIKE ?
          OR lower(middle_name) LIKE ?
          OR lower(first_name || ' ' || middle_name || ' ' || last_name) LIKE ?
          OR lower(last_name || ' ' || first_name || ' ' || middle_name) LIKE ?
        ORDER BY updated_at DESC, id DESC
        LIMIT ?
      `)
      .all(pattern, pattern, pattern, pattern, pattern, pattern, max);
  }

  getRecord(id) {
    const row = this.db.prepare("SELECT * FROM beneficiaries WHERE id = ?").get(Number(id));
    return row || null;
  }

  getRecordByControlNo(controlNo) {
    const key = String(controlNo || "").trim();
    if (!key) return null;

    return this.db.prepare("SELECT * FROM beneficiaries WHERE control_no = ?").get(key) || null;
  }

  saveRecord(input) {
    const record = normalizeRecord(input);

    if (!record.control_no) {
      throw new Error("Control No. is required.");
    }

    const id = Number(input.id || 0);
    const existing = id ? this.getRecord(id) : this.getRecordByControlNo(record.control_no);

    return existing ? this.updateRecord(existing.id, record) : this.insertRecord(record);
  }

  insertRecord(record) {
    const timestamp = nowIso();
    const columns = FIELD_NAMES.map(quoted).join(", ");
    const placeholders = FIELD_NAMES.map(() => "?").join(", ");
    const values = FIELD_NAMES.map(fieldName => record[fieldName]);
    const result = this.db
      .prepare(`
        INSERT INTO beneficiaries (${columns}, created_at, updated_at)
        VALUES (${placeholders}, ?, ?)
      `)
      .run(...values, timestamp, timestamp);

    return this.getRecord(Number(result.lastInsertRowid));
  }

  updateRecord(id, record) {
    const existing = this.getRecord(id);

    if (!existing) {
      throw new Error("Record was not found.");
    }

    const duplicate = this.getRecordByControlNo(record.control_no);
    if (duplicate && duplicate.id !== existing.id) {
      throw new Error(`Control No. already exists: ${record.control_no}`);
    }

    const timestamp = nowIso();
    const assignments = FIELD_NAMES.map(fieldName => `${quoted(fieldName)} = ?`).join(", ");
    const values = FIELD_NAMES.map(fieldName => record[fieldName]);

    this.db
      .prepare(`UPDATE beneficiaries SET ${assignments}, updated_at = ? WHERE id = ?`)
      .run(...values, timestamp, id);

    return this.getRecord(id);
  }

  deleteRecord(id) {
    const record = this.getRecord(id);

    if (!record) {
      throw new Error("Record was not found.");
    }

    const displayName = [record.last_name, record.first_name, record.middle_name]
      .filter(Boolean)
      .join(", ");

    this.db.exec("BEGIN");
    try {
      this.db
        .prepare(`
          INSERT INTO deleted_records (original_id, control_no, display_name, deleted_at, snapshot_json)
          VALUES (?, ?, ?, ?, ?)
        `)
        .run(
          record.id,
          record.control_no,
          displayName || record.control_no,
          nowIso(),
          JSON.stringify(record)
        );

      this.db.prepare("DELETE FROM beneficiaries WHERE id = ?").run(id);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }

    return record;
  }

  listDeletedRecords() {
    return this.db
      .prepare(`
        SELECT id, original_id, control_no, display_name, deleted_at
        FROM deleted_records
        ORDER BY deleted_at DESC, id DESC
      `)
      .all();
  }

  restoreDeletedRecord(id) {
    const deleted = this.db.prepare("SELECT * FROM deleted_records WHERE id = ?").get(Number(id));

    if (!deleted) {
      throw new Error("Deleted record was not found.");
    }

    if (this.getRecordByControlNo(deleted.control_no)) {
      throw new Error(`Cannot restore. Control No. already exists: ${deleted.control_no}`);
    }

    const snapshot = JSON.parse(deleted.snapshot_json);
    delete snapshot.id;
    const restored = normalizeRecord(snapshot);

    this.db.exec("BEGIN");
    try {
      const saved = this.insertRecord(restored);
      this.db.prepare("DELETE FROM deleted_records WHERE id = ?").run(Number(id));
      this.db.exec("COMMIT");
      return saved;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  exportData() {
    return {
      exportedAt: nowIso(),
      fields: FIELD_NAMES,
      records: this.db.prepare("SELECT * FROM beneficiaries ORDER BY control_no").all(),
      deletedRecords: this.db
        .prepare("SELECT * FROM deleted_records ORDER BY deleted_at DESC, id DESC")
        .all()
    };
  }
}

module.exports = {
  BeneficiaryDatabase,
  DEFAULT_DB_PATH,
  normalizeRecord,
  todayDate
};
