const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const { FIELD_NAMES, SUMMARY_FIELDS } = require("./metadata");

const DATA_DIR = path.join(__dirname, "..", "data");
const DEFAULT_DB_PATH = path.join(DATA_DIR, "lp_database.sqlite");
const RAW_VALUE_FIELDS = new Set([
  "date_updated",
  "control_no",
  "picture_data",
  "field_c11",
  "field_l11",
  "list_c18",
  "list_m18"
]);
const UPPERCASE_TERMS = new Set([
  "ALS",
  "BPI",
  "LP",
  "MDPP",
  "N/A",
  "OFW",
  "PAOFI",
  "PWD",
  "TESDA",
  "TVET"
]);
const ABBREVIATIONS = new Map([
  ["apt", "Apt."],
  ["apt.", "Apt."],
  ["blk", "Blk."],
  ["blk.", "Blk."],
  ["brgy", "Brgy."],
  ["brgy.", "Brgy."],
  ["dr", "Dr."],
  ["dr.", "Dr."],
  ["jr", "Jr."],
  ["jr.", "Jr."],
  ["lot", "Lot"],
  ["mr", "Mr."],
  ["mr.", "Mr."],
  ["mrs", "Mrs."],
  ["mrs.", "Mrs."],
  ["ms", "Ms."],
  ["ms.", "Ms."],
  ["no", "No."],
  ["no.", "No."],
  ["sr", "Sr."],
  ["sr.", "Sr."],
  ["st", "St."],
  ["st.", "St."]
]);

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

function normalizeContactNumber(value) {
  let digits = normalizeText(value).replace(/\D/g, "");

  if (digits.startsWith("63") && digits.length === 12) {
    digits = `0${digits.slice(2)}`;
  }

  if (digits.startsWith("9") && digits.length === 10) {
    digits = `0${digits}`;
  }

  return digits.slice(0, 11);
}

function capitalizeWord(word) {
  const abbreviation = ABBREVIATIONS.get(word.toLowerCase());

  if (abbreviation) return abbreviation;

  const hasTrailingPeriod = word.endsWith(".");
  const base = hasTrailingPeriod ? word.slice(0, -1) : word;
  const uppercaseBase = base.toUpperCase();

  if (UPPERCASE_TERMS.has(uppercaseBase)) {
    return `${uppercaseBase}${hasTrailingPeriod ? "." : ""}`;
  }

  if (/^[A-Za-z]$/.test(base)) {
    return `${base.toUpperCase()}${hasTrailingPeriod ? "." : ""}`;
  }

  const capitalized = base
    .split(/([-'])/)
    .map((part, index, parts) => {
      if (part === "-" || part === "'") return part;
      if (parts[index - 1] === "'" && ["s", "t", "d", "m"].includes(part.toLowerCase())) {
        return part.toLowerCase();
      }
      return part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part;
    })
    .join("");

  return `${capitalized}${hasTrailingPeriod ? "." : ""}`;
}

function titleCaseValue(value) {
  return normalizeText(value)
    .trim()
    .replace(/[A-Za-z]+(?:'[A-Za-z]+)*\.?/g, capitalizeWord);
}

function normalizeFieldValue(fieldName, value) {
  if (fieldName === "field_l11") return normalizeContactNumber(value);
  if (RAW_VALUE_FIELDS.has(fieldName)) return normalizeText(value).trim();
  return titleCaseValue(value);
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
    output[fieldName] = normalizeFieldValue(fieldName, input[fieldName]);
  });

  if (!output.date_updated) output.date_updated = todayDate();
  if (!output.status) output.status = "Active";
  output.control_no = output.control_no.trim();

  return output;
}

function normalizeAmount(value) {
  const number = Number(normalizeText(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function normalizeMonitoringText(value) {
  return titleCaseValue(value);
}

function rowHasValue(row, names) {
  return names.some(name => {
    const value = row[name];
    return typeof value === "number" ? value !== 0 : Boolean(normalizeText(value).trim());
  });
}

function normalizeMonitoringRows(rows = [], normalizer) {
  return (Array.isArray(rows) ? rows : [])
    .map(normalizer)
    .filter(row => rowHasValue(row, Object.keys(row)));
}

function normalizeMonitoringReport(input = {}, beneficiary = null) {
  const beneficiaryId = Number(input.beneficiary_id || input.beneficiaryId || beneficiary?.id || 0) || null;
  const beneficiaryName = beneficiary
    ? [beneficiary.last_name, beneficiary.first_name, beneficiary.middle_name].filter(Boolean).join(", ")
    : "";

  const sales = normalizeMonitoringRows(input.sales, row => {
    const quantitySold = normalizeText(row.quantity_sold).trim();
    const pricePerUnit = normalizeAmount(row.price_per_unit);
    const enteredTotal = normalizeAmount(row.total_sales);
    const computedTotal = normalizeAmount(quantitySold) * pricePerUnit;

    return {
      entry_date: normalizeText(row.entry_date).trim(),
      quantity_produced: normalizeText(row.quantity_produced).trim(),
      quantity_sold: quantitySold,
      price_per_unit: pricePerUnit,
      total_sales: enteredTotal || computedTotal
    };
  });
  const expenses = normalizeMonitoringRows(input.expenses, row => ({
    entry_date: normalizeText(row.entry_date).trim(),
    payee: normalizeMonitoringText(row.payee),
    description: normalizeMonitoringText(row.description),
    amount: normalizeAmount(row.amount)
  }));
  const totalSales = sales.reduce((sum, row) => sum + normalizeAmount(row.total_sales), 0);
  const totalExpenses = expenses.reduce((sum, row) => sum + normalizeAmount(row.amount), 0);
  const forwardedBalance = normalizeAmount(input.forwarded_balance);

  return {
    id: Number(input.id || 0) || 0,
    beneficiary_id: beneficiaryId,
    control_no: normalizeText(input.control_no || beneficiary?.control_no).trim(),
    beneficiary_name: normalizeMonitoringText(input.beneficiary_name || beneficiaryName),
    chapel: normalizeMonitoringText(input.chapel || beneficiary?.field_c12),
    contact_no: normalizeContactNumber(input.contact_no || beneficiary?.field_l11),
    project_type: normalizeMonitoringText(input.project_type || ""),
    report_month: normalizeText(input.report_month).trim(),
    forwarded_balance: forwardedBalance,
    total_sales: totalSales,
    total_expenses: totalExpenses,
    net_income: forwardedBalance + totalSales - totalExpenses,
    challenges: normalizeMonitoringText(input.challenges),
    success_stories: normalizeMonitoringText(input.success_stories),
    prepared_by: normalizeMonitoringText(input.prepared_by),
    prepared_date: normalizeText(input.prepared_date).trim(),
    checked_by: normalizeMonitoringText(input.checked_by),
    checked_date: normalizeText(input.checked_date).trim(),
    materials: normalizeMonitoringRows(input.materials, row => ({
      entry_date: normalizeText(row.entry_date).trim(),
      materials_received: normalizeMonitoringText(row.materials_received),
      quantity: normalizeText(row.quantity).trim(),
      materials_used: normalizeMonitoringText(row.materials_used),
      inventory: normalizeText(row.inventory).trim()
    })),
    sales,
    expenses
  };
}

function displayName(record) {
  return [record.last_name, record.first_name, record.middle_name]
    .filter(Boolean)
    .join(", ") || record.control_no;
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

      CREATE TABLE IF NOT EXISTS monitoring_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        beneficiary_id INTEGER,
        control_no TEXT NOT NULL DEFAULT '',
        beneficiary_name TEXT NOT NULL DEFAULT '',
        chapel TEXT NOT NULL DEFAULT '',
        contact_no TEXT NOT NULL DEFAULT '',
        project_type TEXT NOT NULL DEFAULT '',
        report_month TEXT NOT NULL,
        forwarded_balance REAL NOT NULL DEFAULT 0,
        total_sales REAL NOT NULL DEFAULT 0,
        total_expenses REAL NOT NULL DEFAULT 0,
        net_income REAL NOT NULL DEFAULT 0,
        challenges TEXT NOT NULL DEFAULT '',
        success_stories TEXT NOT NULL DEFAULT '',
        prepared_by TEXT NOT NULL DEFAULT '',
        prepared_date TEXT NOT NULL DEFAULT '',
        checked_by TEXT NOT NULL DEFAULT '',
        checked_date TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE SET NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_monitoring_reports_beneficiary_month
        ON monitoring_reports(beneficiary_id, report_month);

      CREATE INDEX IF NOT EXISTS idx_monitoring_reports_month
        ON monitoring_reports(report_month);

      CREATE TABLE IF NOT EXISTS monitoring_materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER NOT NULL,
        row_order INTEGER NOT NULL DEFAULT 0,
        entry_date TEXT NOT NULL DEFAULT '',
        materials_received TEXT NOT NULL DEFAULT '',
        quantity TEXT NOT NULL DEFAULT '',
        materials_used TEXT NOT NULL DEFAULT '',
        inventory TEXT NOT NULL DEFAULT '',
        FOREIGN KEY (report_id) REFERENCES monitoring_reports(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS monitoring_sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER NOT NULL,
        row_order INTEGER NOT NULL DEFAULT 0,
        entry_date TEXT NOT NULL DEFAULT '',
        quantity_produced TEXT NOT NULL DEFAULT '',
        quantity_sold TEXT NOT NULL DEFAULT '',
        price_per_unit REAL NOT NULL DEFAULT 0,
        total_sales REAL NOT NULL DEFAULT 0,
        FOREIGN KEY (report_id) REFERENCES monitoring_reports(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS monitoring_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER NOT NULL,
        row_order INTEGER NOT NULL DEFAULT 0,
        entry_date TEXT NOT NULL DEFAULT '',
        payee TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        amount REAL NOT NULL DEFAULT 0,
        FOREIGN KEY (report_id) REFERENCES monitoring_reports(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_monitoring_materials_report
        ON monitoring_materials(report_id);

      CREATE INDEX IF NOT EXISTS idx_monitoring_sales_report
        ON monitoring_sales(report_id);

      CREATE INDEX IF NOT EXISTS idx_monitoring_expenses_report
        ON monitoring_expenses(report_id);
    `);
  }

  close() {
    this.db.close();
  }

  stats() {
    const active = this.db.prepare("SELECT COUNT(*) AS count FROM beneficiaries").get().count;
    const deleted = this.db.prepare("SELECT COUNT(*) AS count FROM deleted_records").get().count;
    const monitoringReports = this.db.prepare("SELECT COUNT(*) AS count FROM monitoring_reports").get().count;

    return {
      active,
      deleted,
      monitoringReports,
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
          displayName(record),
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

  listMonitoringReports({ search = "", beneficiaryId = "", limit = 200 } = {}) {
    const max = Math.min(Math.max(Number(limit) || 200, 1), 500);
    const conditions = [];
    const args = [];

    if (beneficiaryId) {
      conditions.push("beneficiary_id = ?");
      args.push(Number(beneficiaryId));
    }

    if (search.trim()) {
      const pattern = `%${search.trim().toLowerCase()}%`;
      conditions.push(`(
        lower(control_no) LIKE ?
        OR lower(beneficiary_name) LIKE ?
        OR lower(chapel) LIKE ?
        OR lower(project_type) LIKE ?
        OR lower(report_month) LIKE ?
      )`);
      args.push(pattern, pattern, pattern, pattern, pattern);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    return this.db
      .prepare(`
        SELECT *
        FROM monitoring_reports
        ${where}
        ORDER BY report_month DESC, updated_at DESC, id DESC
        LIMIT ?
      `)
      .all(...args, max);
  }

  getMonitoringReport(id) {
    const report = this.db.prepare("SELECT * FROM monitoring_reports WHERE id = ?").get(Number(id));
    if (!report) return null;

    return {
      ...report,
      materials: this.db
        .prepare("SELECT * FROM monitoring_materials WHERE report_id = ? ORDER BY row_order, id")
        .all(report.id),
      sales: this.db
        .prepare("SELECT * FROM monitoring_sales WHERE report_id = ? ORDER BY row_order, id")
        .all(report.id),
      expenses: this.db
        .prepare("SELECT * FROM monitoring_expenses WHERE report_id = ? ORDER BY row_order, id")
        .all(report.id)
    };
  }

  saveMonitoringReport(input = {}) {
    const id = Number(input.id || 0) || 0;
    const existing = id ? this.getMonitoringReport(id) : null;
    const beneficiaryId = Number(input.beneficiary_id || input.beneficiaryId || existing?.beneficiary_id || 0) || 0;
    const beneficiary = beneficiaryId ? this.getRecord(beneficiaryId) : null;

    if (!beneficiary && !existing) {
      throw new Error("Select a beneficiary for this monitoring report.");
    }

    const report = normalizeMonitoringReport({
      ...existing,
      ...input,
      beneficiary_id: beneficiaryId || existing?.beneficiary_id || null
    }, beneficiary);

    if (!report.report_month) {
      throw new Error("Report month is required.");
    }

    if (!report.control_no || !report.beneficiary_name) {
      throw new Error("Monitoring report beneficiary details are incomplete.");
    }

    const duplicate = report.beneficiary_id
      ? this.db
        .prepare("SELECT id FROM monitoring_reports WHERE beneficiary_id = ? AND report_month = ? AND id <> ?")
        .get(report.beneficiary_id, report.report_month, id || 0)
      : null;

    if (duplicate) {
      throw new Error("This beneficiary already has a monitoring report for that month.");
    }

    const timestamp = nowIso();
    const reportValues = [
      report.beneficiary_id,
      report.control_no,
      report.beneficiary_name,
      report.chapel,
      report.contact_no,
      report.project_type,
      report.report_month,
      report.forwarded_balance,
      report.total_sales,
      report.total_expenses,
      report.net_income,
      report.challenges,
      report.success_stories,
      report.prepared_by,
      report.prepared_date,
      report.checked_by,
      report.checked_date
    ];

    this.db.exec("BEGIN");
    try {
      let reportId = id;

      if (existing) {
        this.db
          .prepare(`
            UPDATE monitoring_reports
            SET beneficiary_id = ?,
                control_no = ?,
                beneficiary_name = ?,
                chapel = ?,
                contact_no = ?,
                project_type = ?,
                report_month = ?,
                forwarded_balance = ?,
                total_sales = ?,
                total_expenses = ?,
                net_income = ?,
                challenges = ?,
                success_stories = ?,
                prepared_by = ?,
                prepared_date = ?,
                checked_by = ?,
                checked_date = ?,
                updated_at = ?
            WHERE id = ?
          `)
          .run(...reportValues, timestamp, reportId);
      } else {
        const result = this.db
          .prepare(`
            INSERT INTO monitoring_reports (
              beneficiary_id, control_no, beneficiary_name, chapel, contact_no,
              project_type, report_month, forwarded_balance, total_sales,
              total_expenses, net_income, challenges, success_stories,
              prepared_by, prepared_date, checked_by, checked_date,
              created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .run(...reportValues, timestamp, timestamp);
        reportId = Number(result.lastInsertRowid);
      }

      this.db.prepare("DELETE FROM monitoring_materials WHERE report_id = ?").run(reportId);
      this.db.prepare("DELETE FROM monitoring_sales WHERE report_id = ?").run(reportId);
      this.db.prepare("DELETE FROM monitoring_expenses WHERE report_id = ?").run(reportId);

      const materialInsert = this.db.prepare(`
        INSERT INTO monitoring_materials (
          report_id, row_order, entry_date, materials_received, quantity, materials_used, inventory
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      report.materials.forEach((row, index) => {
        materialInsert.run(
          reportId,
          index,
          row.entry_date,
          row.materials_received,
          row.quantity,
          row.materials_used,
          row.inventory
        );
      });

      const salesInsert = this.db.prepare(`
        INSERT INTO monitoring_sales (
          report_id, row_order, entry_date, quantity_produced, quantity_sold, price_per_unit, total_sales
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      report.sales.forEach((row, index) => {
        salesInsert.run(
          reportId,
          index,
          row.entry_date,
          row.quantity_produced,
          row.quantity_sold,
          row.price_per_unit,
          row.total_sales
        );
      });

      const expenseInsert = this.db.prepare(`
        INSERT INTO monitoring_expenses (
          report_id, row_order, entry_date, payee, description, amount
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      report.expenses.forEach((row, index) => {
        expenseInsert.run(
          reportId,
          index,
          row.entry_date,
          row.payee,
          row.description,
          row.amount
        );
      });

      this.db.exec("COMMIT");
      return this.getMonitoringReport(reportId);
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  deleteMonitoringReport(id) {
    const report = this.getMonitoringReport(id);
    if (!report) {
      throw new Error("Monitoring report was not found.");
    }

    this.db.prepare("DELETE FROM monitoring_reports WHERE id = ?").run(Number(id));
    return report;
  }

  exportMonitoringReports() {
    return this.db
      .prepare("SELECT * FROM monitoring_reports ORDER BY report_month DESC, control_no")
      .all()
      .map(report => this.getMonitoringReport(report.id));
  }

  exportData() {
    return {
      exportedAt: nowIso(),
      fields: FIELD_NAMES,
      records: this.db.prepare("SELECT * FROM beneficiaries ORDER BY control_no").all(),
      monitoringReports: this.exportMonitoringReports(),
      deletedRecords: this.db
        .prepare("SELECT * FROM deleted_records ORDER BY deleted_at DESC, id DESC")
        .all()
    };
  }
}

module.exports = {
  BeneficiaryDatabase,
  DEFAULT_DB_PATH,
  normalizeContactNumber,
  normalizeFieldValue,
  normalizeMonitoringReport,
  normalizeRecord,
  nowIso,
  quoted,
  titleCaseValue,
  todayDate
};
