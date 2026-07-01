const { FIELD_NAMES, SUMMARY_FIELDS } = require("./metadata");
const { cloudLocationLabel } = require("./cloud-config");
const { normalizeMonitoringReport, normalizeRecord, nowIso, quoted } = require("./database");

function plainRow(row) {
  if (!row) return null;

  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      typeof value === "bigint" ? Number(value) : value
    ])
  );
}

function rows(result) {
  return result.rows.map(plainRow);
}

function displayName(record) {
  return [record.last_name, record.first_name, record.middle_name]
    .filter(Boolean)
    .join(", ") || record.control_no;
}

class TursoBeneficiaryDatabase {
  constructor(client, config) {
    this.client = client;
    this.url = config.url;
    this.dbPath = cloudLocationLabel(config.url);
  }

  static async create(config) {
    const { createClient } = await import("@libsql/client");
    const database = new TursoBeneficiaryDatabase(
      createClient({
        url: config.url,
        authToken: config.authToken
      }),
      config
    );

    await database.init();
    return database;
  }

  async execute(sql, args = []) {
    return this.client.execute({ sql, args });
  }

  async init() {
    const fieldColumns = FIELD_NAMES
      .map(fieldName => `${quoted(fieldName)} TEXT NOT NULL DEFAULT ''`)
      .join(",\n        ");

    const statements = [
      `
        CREATE TABLE IF NOT EXISTS beneficiaries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ${fieldColumns},
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `,
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_beneficiaries_control_no ON beneficiaries(control_no)",
      "CREATE INDEX IF NOT EXISTS idx_beneficiaries_name ON beneficiaries(last_name, first_name, middle_name)",
      `
        CREATE TABLE IF NOT EXISTS deleted_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          original_id INTEGER,
          control_no TEXT NOT NULL,
          display_name TEXT NOT NULL,
          deleted_at TEXT NOT NULL,
          snapshot_json TEXT NOT NULL
        )
      `,
      "CREATE INDEX IF NOT EXISTS idx_deleted_records_control_no ON deleted_records(control_no)"
      ,
      `
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
        )
      `,
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_monitoring_reports_beneficiary_month ON monitoring_reports(beneficiary_id, report_month)",
      "CREATE INDEX IF NOT EXISTS idx_monitoring_reports_month ON monitoring_reports(report_month)",
      `
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
        )
      `,
      `
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
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS monitoring_expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_id INTEGER NOT NULL,
          row_order INTEGER NOT NULL DEFAULT 0,
          entry_date TEXT NOT NULL DEFAULT '',
          payee TEXT NOT NULL DEFAULT '',
          description TEXT NOT NULL DEFAULT '',
          amount REAL NOT NULL DEFAULT 0,
          FOREIGN KEY (report_id) REFERENCES monitoring_reports(id) ON DELETE CASCADE
        )
      `,
      "CREATE INDEX IF NOT EXISTS idx_monitoring_materials_report ON monitoring_materials(report_id)",
      "CREATE INDEX IF NOT EXISTS idx_monitoring_sales_report ON monitoring_sales(report_id)",
      "CREATE INDEX IF NOT EXISTS idx_monitoring_expenses_report ON monitoring_expenses(report_id)"
    ];

    for (const sql of statements) {
      await this.execute(sql);
    }
  }

  async close() {
    if (typeof this.client.close === "function") {
      await this.client.close();
    }
  }

  async stats() {
    const active = await this.execute("SELECT COUNT(*) AS count FROM beneficiaries");
    const deleted = await this.execute("SELECT COUNT(*) AS count FROM deleted_records");
    const monitoringReports = await this.execute("SELECT COUNT(*) AS count FROM monitoring_reports");

    return {
      active: Number(active.rows[0].count || 0),
      deleted: Number(deleted.rows[0].count || 0),
      monitoringReports: Number(monitoringReports.rows[0].count || 0),
      databasePath: this.dbPath
    };
  }

  async nextControlNo(year = new Date().getFullYear()) {
    const prefix = `LP-${year}-`;
    const activeRows = rows(
      await this.execute("SELECT control_no FROM beneficiaries WHERE control_no LIKE ?", [`${prefix}%`])
    );
    const deletedRows = rows(
      await this.execute("SELECT control_no FROM deleted_records WHERE control_no LIKE ?", [`${prefix}%`])
    );
    const highest = [...activeRows, ...deletedRows].reduce((max, row) => {
      const numberPart = Number(String(row.control_no || "").slice(prefix.length));
      return Number.isFinite(numberPart) && numberPart > max ? numberPart : max;
    }, 0);

    return `${prefix}${String(highest + 1).padStart(3, "0")}`;
  }

  async listRecords({ search = "", limit = 50, detail = "summary" } = {}) {
    const max = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const selectedFields = detail === "full"
      ? ["id", ...FIELD_NAMES, "created_at", "updated_at"]
      : SUMMARY_FIELDS;
    const columns = selectedFields.map(quoted).join(", ");

    if (!search.trim()) {
      return rows(await this.execute(
        `SELECT ${columns} FROM beneficiaries ORDER BY updated_at DESC, id DESC LIMIT ?`,
        [max]
      ));
    }

    const pattern = `%${search.trim().toLowerCase()}%`;
    return rows(await this.execute(
      `
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
      `,
      [pattern, pattern, pattern, pattern, pattern, pattern, max]
    ));
  }

  async getRecord(id) {
    const result = await this.execute("SELECT * FROM beneficiaries WHERE id = ?", [Number(id)]);
    return plainRow(result.rows[0]) || null;
  }

  async getRecordByControlNo(controlNo) {
    const key = String(controlNo || "").trim();
    if (!key) return null;

    const result = await this.execute("SELECT * FROM beneficiaries WHERE control_no = ?", [key]);
    return plainRow(result.rows[0]) || null;
  }

  async saveRecord(input) {
    const record = normalizeRecord(input);

    if (!record.control_no) {
      throw new Error("Control No. is required.");
    }

    const id = Number(input.id || 0);
    const existing = id ? await this.getRecord(id) : await this.getRecordByControlNo(record.control_no);

    return existing ? this.updateRecord(existing.id, record) : this.insertRecord(record);
  }

  async insertRecord(record) {
    const timestamp = nowIso();
    const columns = FIELD_NAMES.map(quoted).join(", ");
    const placeholders = FIELD_NAMES.map(() => "?").join(", ");
    const values = FIELD_NAMES.map(fieldName => record[fieldName]);
    const result = await this.execute(
      `
        INSERT INTO beneficiaries (${columns}, created_at, updated_at)
        VALUES (${placeholders}, ?, ?)
      `,
      [...values, timestamp, timestamp]
    );

    const id = result.lastInsertRowid ? Number(result.lastInsertRowid) : 0;
    return id ? this.getRecord(id) : this.getRecordByControlNo(record.control_no);
  }

  async updateRecord(id, record) {
    const existing = await this.getRecord(id);

    if (!existing) {
      throw new Error("Record was not found.");
    }

    const duplicate = await this.getRecordByControlNo(record.control_no);
    if (duplicate && duplicate.id !== existing.id) {
      throw new Error(`Control No. already exists: ${record.control_no}`);
    }

    const timestamp = nowIso();
    const assignments = FIELD_NAMES.map(fieldName => `${quoted(fieldName)} = ?`).join(", ");
    const values = FIELD_NAMES.map(fieldName => record[fieldName]);

    await this.execute(
      `UPDATE beneficiaries SET ${assignments}, updated_at = ? WHERE id = ?`,
      [...values, timestamp, id]
    );

    return this.getRecord(id);
  }

  async deleteRecord(id) {
    const record = await this.getRecord(id);

    if (!record) {
      throw new Error("Record was not found.");
    }

    await this.client.batch([
      {
        sql: `
          INSERT INTO deleted_records (original_id, control_no, display_name, deleted_at, snapshot_json)
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [
          record.id,
          record.control_no,
          displayName(record),
          nowIso(),
          JSON.stringify(record)
        ]
      },
      {
        sql: "DELETE FROM beneficiaries WHERE id = ?",
        args: [Number(id)]
      }
    ], "write");

    return record;
  }

  async listDeletedRecords() {
    return rows(await this.execute(`
      SELECT id, original_id, control_no, display_name, deleted_at
      FROM deleted_records
      ORDER BY deleted_at DESC, id DESC
    `));
  }

  async restoreDeletedRecord(id) {
    const deleted = plainRow(
      (await this.execute("SELECT * FROM deleted_records WHERE id = ?", [Number(id)])).rows[0]
    );

    if (!deleted) {
      throw new Error("Deleted record was not found.");
    }

    if (await this.getRecordByControlNo(deleted.control_no)) {
      throw new Error(`Cannot restore. Control No. already exists: ${deleted.control_no}`);
    }

    const snapshot = JSON.parse(deleted.snapshot_json);
    delete snapshot.id;
    const restored = normalizeRecord(snapshot);
    const timestamp = nowIso();
    const columns = FIELD_NAMES.map(quoted).join(", ");
    const placeholders = FIELD_NAMES.map(() => "?").join(", ");
    const values = FIELD_NAMES.map(fieldName => restored[fieldName]);

    await this.client.batch([
      {
        sql: `
          INSERT INTO beneficiaries (${columns}, created_at, updated_at)
          VALUES (${placeholders}, ?, ?)
        `,
        args: [...values, timestamp, timestamp]
      },
      {
        sql: "DELETE FROM deleted_records WHERE id = ?",
        args: [Number(id)]
      }
    ], "write");

    return this.getRecordByControlNo(restored.control_no);
  }

  async listMonitoringReports({ search = "", beneficiaryId = "", limit = 200 } = {}) {
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
    return rows(await this.execute(
      `
        SELECT *
        FROM monitoring_reports
        ${where}
        ORDER BY report_month DESC, updated_at DESC, id DESC
        LIMIT ?
      `,
      [...args, max]
    ));
  }

  async getMonitoringReport(id) {
    const report = plainRow(
      (await this.execute("SELECT * FROM monitoring_reports WHERE id = ?", [Number(id)])).rows[0]
    );
    if (!report) return null;

    return {
      ...report,
      materials: rows(await this.execute(
        "SELECT * FROM monitoring_materials WHERE report_id = ? ORDER BY row_order, id",
        [report.id]
      )),
      sales: rows(await this.execute(
        "SELECT * FROM monitoring_sales WHERE report_id = ? ORDER BY row_order, id",
        [report.id]
      )),
      expenses: rows(await this.execute(
        "SELECT * FROM monitoring_expenses WHERE report_id = ? ORDER BY row_order, id",
        [report.id]
      ))
    };
  }

  async saveMonitoringReport(input = {}) {
    const id = Number(input.id || 0) || 0;
    const existing = id ? await this.getMonitoringReport(id) : null;
    const beneficiaryId = Number(input.beneficiary_id || input.beneficiaryId || existing?.beneficiary_id || 0) || 0;
    const beneficiary = beneficiaryId ? await this.getRecord(beneficiaryId) : null;

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

    if (report.beneficiary_id) {
      const duplicate = plainRow((await this.execute(
        "SELECT id FROM monitoring_reports WHERE beneficiary_id = ? AND report_month = ? AND id <> ?",
        [report.beneficiary_id, report.report_month, id || 0]
      )).rows[0]);

      if (duplicate) {
        throw new Error("This beneficiary already has a monitoring report for that month.");
      }
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
    let reportId = id;

    if (existing) {
      await this.execute(
        `
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
        `,
        [...reportValues, timestamp, reportId]
      );
    } else {
      const result = await this.execute(
        `
          INSERT INTO monitoring_reports (
            beneficiary_id, control_no, beneficiary_name, chapel, contact_no,
            project_type, report_month, forwarded_balance, total_sales,
            total_expenses, net_income, challenges, success_stories,
            prepared_by, prepared_date, checked_by, checked_date,
            created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [...reportValues, timestamp, timestamp]
      );
      reportId = result.lastInsertRowid ? Number(result.lastInsertRowid) : 0;
    }

    await this.client.batch([
      { sql: "DELETE FROM monitoring_materials WHERE report_id = ?", args: [reportId] },
      { sql: "DELETE FROM monitoring_sales WHERE report_id = ?", args: [reportId] },
      { sql: "DELETE FROM monitoring_expenses WHERE report_id = ?", args: [reportId] },
      ...report.materials.map((row, index) => ({
        sql: `
          INSERT INTO monitoring_materials (
            report_id, row_order, entry_date, materials_received, quantity, materials_used, inventory
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          reportId,
          index,
          row.entry_date,
          row.materials_received,
          row.quantity,
          row.materials_used,
          row.inventory
        ]
      })),
      ...report.sales.map((row, index) => ({
        sql: `
          INSERT INTO monitoring_sales (
            report_id, row_order, entry_date, quantity_produced, quantity_sold, price_per_unit, total_sales
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          reportId,
          index,
          row.entry_date,
          row.quantity_produced,
          row.quantity_sold,
          row.price_per_unit,
          row.total_sales
        ]
      })),
      ...report.expenses.map((row, index) => ({
        sql: `
          INSERT INTO monitoring_expenses (
            report_id, row_order, entry_date, payee, description, amount
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
          reportId,
          index,
          row.entry_date,
          row.payee,
          row.description,
          row.amount
        ]
      }))
    ], "write");

    return this.getMonitoringReport(reportId);
  }

  async deleteMonitoringReport(id) {
    const report = await this.getMonitoringReport(id);
    if (!report) {
      throw new Error("Monitoring report was not found.");
    }

    await this.execute("DELETE FROM monitoring_reports WHERE id = ?", [Number(id)]);
    return report;
  }

  async exportMonitoringReports() {
    const reports = rows(await this.execute("SELECT id FROM monitoring_reports ORDER BY report_month DESC, control_no"));
    const detailed = [];

    for (const report of reports) {
      detailed.push(await this.getMonitoringReport(report.id));
    }

    return detailed;
  }

  async exportData() {
    return {
      exportedAt: nowIso(),
      fields: FIELD_NAMES,
      records: rows(await this.execute("SELECT * FROM beneficiaries ORDER BY control_no")),
      monitoringReports: await this.exportMonitoringReports(),
      deletedRecords: rows(await this.execute("SELECT * FROM deleted_records ORDER BY deleted_at DESC, id DESC"))
    };
  }
}

module.exports = {
  TursoBeneficiaryDatabase
};
