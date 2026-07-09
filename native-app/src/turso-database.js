const { FIELD_NAMES, SUMMARY_FIELDS } = require("./metadata");
const { cloudLocationLabel } = require("./cloud-config");
const {
  NUTRITION_BENEFICIARY_FIELDS,
  NUTRITION_GROWTH_ENTRY_FIELDS,
  mergeNutritionHouseholdMembers,
  normalizeAmount,
  normalizeContactNumber,
  normalizeMonitoringReport,
  normalizeNutritionBeneficiary,
  normalizeNutritionCenter,
  normalizeRecord,
  nowIso,
  quoted,
  titleCaseValue,
  hashPassword,
  verifyPassword
} = require("./database");
const {
  calculateAgeMonths,
  cgsReferencePayload,
  classifyCgs,
  normalizeReportMonth,
  parseMeasurementNumber
} = require("./nutrition-cgs");

const DEFAULT_SUPERADMIN_USERNAME = process.env.LPDB_SUPERADMIN_USERNAME || "superadmin";
const DEFAULT_SUPERADMIN_PASSWORD = process.env.LPDB_SUPERADMIN_PASSWORD || "ChangeMe123!";

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

function normalizeProfileDate(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";

  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  if (isoMatch) {
    return `${String(Number(isoMatch[2])).padStart(2, "0")}/${String(Number(isoMatch[3])).padStart(2, "0")}/${isoMatch[1]}`;
  }

  const slashMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/.exec(text);
  if (!slashMatch) return text;

  const month = Number(slashMatch[1]);
  const day = Number(slashMatch[2]);
  const year = Number(slashMatch[3]) < 100 ? Number(slashMatch[3]) + 2000 : Number(slashMatch[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) return text;
  return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatMeasurementValue(value) {
  const number = parseMeasurementNumber(value);
  if (number === null) return "";
  return Number(number.toFixed(2)).toString();
}

function formatSignedMeasurement(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return Number(number.toFixed(2)).toString();
}

function measurementChange(current, previous) {
  const currentNumber = parseMeasurementNumber(current);
  const previousNumber = parseMeasurementNumber(previous);
  if (currentNumber === null || previousNumber === null) return "";
  return formatSignedMeasurement(currentNumber - previousNumber);
}

function monthEndProfileDate(reportMonth) {
  const normalized = normalizeReportMonth(reportMonth);
  if (!normalized) return "";

  const [year, month] = normalized.split("-").map(Number);
  return normalizeProfileDate(`${year}-${String(month).padStart(2, "0")}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`);
}

function normalizeNutritionGrowthReport(input = {}, center = null, existing = null) {
  const reportMonth = normalizeReportMonth(input.report_month || input.reportMonth || existing?.report_month);
  const submittedDate = normalizeProfileDate(input.submitted_date || input.submittedDate || existing?.submitted_date) || normalizeProfileDate(todayDate());

  return {
    id: Number(input.id || existing?.id || 0) || 0,
    center_id: Number(input.center_id || input.centerId || existing?.center_id || center?.id || 0) || 0,
    center_name: titleCaseValue(input.center_name || input.centerName || existing?.center_name || center?.center_name),
    submitted_date: submittedDate,
    report_month: reportMonth,
    entries: Array.isArray(input.entries) ? input.entries : []
  };
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
      "CREATE INDEX IF NOT EXISTS idx_monitoring_expenses_report ON monitoring_expenses(report_id)",
      `
        CREATE TABLE IF NOT EXISTS nutrition_centers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          center_name TEXT NOT NULL DEFAULT '',
          location TEXT NOT NULL DEFAULT '',
          coordinator TEXT NOT NULL DEFAULT '',
          contact_no TEXT NOT NULL DEFAULT '',
          capacity INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'Active',
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `,
      "CREATE INDEX IF NOT EXISTS idx_nutrition_centers_name ON nutrition_centers(center_name)",
      `
        CREATE TABLE IF NOT EXISTS nutrition_beneficiaries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          center_id INTEGER,
          beneficiary_no TEXT NOT NULL DEFAULT '',
          feeding_center TEXT NOT NULL DEFAULT '',
          picture_data TEXT NOT NULL DEFAULT '',
          child_last_name TEXT NOT NULL DEFAULT '',
          child_first_name TEXT NOT NULL DEFAULT '',
          child_middle_name TEXT NOT NULL DEFAULT '',
          birth_date TEXT NOT NULL DEFAULT '',
          age TEXT NOT NULL DEFAULT '',
          gender TEXT NOT NULL DEFAULT '',
          home_address TEXT NOT NULL DEFAULT '',
          school TEXT NOT NULL DEFAULT '',
          grade_level TEXT NOT NULL DEFAULT '',
          mother_name TEXT NOT NULL DEFAULT '',
          mother_occupation TEXT NOT NULL DEFAULT '',
          father_name TEXT NOT NULL DEFAULT '',
          father_occupation TEXT NOT NULL DEFAULT '',
          contact_no TEXT NOT NULL DEFAULT '',
          sibling_count TEXT NOT NULL DEFAULT '',
          birth_order TEXT NOT NULL DEFAULT '',
          admission_date TEXT NOT NULL DEFAULT '',
          profile_status TEXT NOT NULL DEFAULT 'New',
          remarks TEXT NOT NULL DEFAULT 'Active',
          initial_age_months TEXT NOT NULL DEFAULT '',
          initial_weight_kg TEXT NOT NULL DEFAULT '',
          initial_height_cm TEXT NOT NULL DEFAULT '',
          initial_nutrition_status TEXT NOT NULL DEFAULT '',
          current_update_date TEXT NOT NULL DEFAULT '',
          current_age_months TEXT NOT NULL DEFAULT '',
          current_weight_kg TEXT NOT NULL DEFAULT '',
          current_height_cm TEXT NOT NULL DEFAULT '',
          current_nutrition_status TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (center_id) REFERENCES nutrition_centers(id) ON DELETE SET NULL
        )
      `,
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_nutrition_beneficiaries_no ON nutrition_beneficiaries(beneficiary_no) WHERE beneficiary_no <> ''",
      "CREATE INDEX IF NOT EXISTS idx_nutrition_beneficiaries_name ON nutrition_beneficiaries(child_last_name, child_first_name, child_middle_name)",
      "CREATE INDEX IF NOT EXISTS idx_nutrition_beneficiaries_center ON nutrition_beneficiaries(center_id)",
      `
        CREATE TABLE IF NOT EXISTS nutrition_household_members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          beneficiary_id INTEGER NOT NULL,
          row_order INTEGER NOT NULL DEFAULT 0,
          member_name TEXT NOT NULL DEFAULT '',
          age TEXT NOT NULL DEFAULT '',
          relationship TEXT NOT NULL DEFAULT '',
          occupation TEXT NOT NULL DEFAULT '',
          FOREIGN KEY (beneficiary_id) REFERENCES nutrition_beneficiaries(id) ON DELETE CASCADE
        )
      `,
      "CREATE INDEX IF NOT EXISTS idx_nutrition_household_beneficiary ON nutrition_household_members(beneficiary_id)",
      `
        CREATE TABLE IF NOT EXISTS nutrition_growth_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          center_id INTEGER,
          center_name TEXT NOT NULL DEFAULT '',
          submitted_date TEXT NOT NULL DEFAULT '',
          report_month TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (center_id) REFERENCES nutrition_centers(id) ON DELETE SET NULL
        )
      `,
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_nutrition_growth_center_month ON nutrition_growth_reports(center_id, report_month)",
      "CREATE INDEX IF NOT EXISTS idx_nutrition_growth_reports_month ON nutrition_growth_reports(report_month)",
      `
        CREATE TABLE IF NOT EXISTS nutrition_growth_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_id INTEGER NOT NULL,
          beneficiary_id INTEGER,
          beneficiary_no TEXT NOT NULL DEFAULT '',
          beneficiary_name TEXT NOT NULL DEFAULT '',
          gender TEXT NOT NULL DEFAULT '',
          birth_date TEXT NOT NULL DEFAULT '',
          age_months TEXT NOT NULL DEFAULT '',
          height_cm TEXT NOT NULL DEFAULT '',
          weight_kg TEXT NOT NULL DEFAULT '',
          height_change_cm TEXT NOT NULL DEFAULT '',
          weight_change_kg TEXT NOT NULL DEFAULT '',
          cgs_classification TEXT NOT NULL DEFAULT '',
          previous_record_date TEXT NOT NULL DEFAULT '',
          previous_height_cm TEXT NOT NULL DEFAULT '',
          previous_weight_kg TEXT NOT NULL DEFAULT '',
          previous_cgs_classification TEXT NOT NULL DEFAULT '',
          row_order INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (report_id) REFERENCES nutrition_growth_reports(id) ON DELETE CASCADE,
          FOREIGN KEY (beneficiary_id) REFERENCES nutrition_beneficiaries(id) ON DELETE SET NULL
        )
      `,
      "CREATE INDEX IF NOT EXISTS idx_nutrition_growth_entries_report ON nutrition_growth_entries(report_id)",
      "CREATE INDEX IF NOT EXISTS idx_nutrition_growth_entries_beneficiary ON nutrition_growth_entries(beneficiary_id)",
      `
        CREATE TABLE IF NOT EXISTS app_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL DEFAULT '',
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `,
      "CREATE INDEX IF NOT EXISTS idx_app_users_username ON app_users(username)"
    ];

    for (const sql of statements) {
      await this.execute(sql);
    }

    await this.ensureBeneficiaryColumns();
    await this.backfillCurrentGroup();
    await this.ensureSuperadmin();
  }

  async ensureBeneficiaryColumns() {
    const existingColumns = new Set(
      rows(await this.execute("PRAGMA table_info(beneficiaries)")).map(column => column.name)
    );

    for (const fieldName of FIELD_NAMES) {
      if (!existingColumns.has(fieldName)) {
        await this.execute(`ALTER TABLE beneficiaries ADD COLUMN ${quoted(fieldName)} TEXT NOT NULL DEFAULT ''`);
      }
    }
  }

  async backfillCurrentGroup() {
    await this.execute(`
      UPDATE beneficiaries
      SET current_group = livelihood_interest
      WHERE trim(COALESCE(current_group, '')) = ''
        AND trim(COALESCE(livelihood_interest, '')) <> ''
    `);
  }

  async ensureSuperadmin() {
    const existing = plainRow((await this.execute(
      "SELECT id FROM app_users WHERE role = 'superadmin' LIMIT 1"
    )).rows[0]);

    if (existing) return;

    const timestamp = nowIso();
    await this.execute(
      `
        INSERT INTO app_users (username, display_name, password_hash, role, active, created_at, updated_at)
        VALUES (?, ?, ?, 'superadmin', 1, ?, ?)
      `,
      [
        DEFAULT_SUPERADMIN_USERNAME,
        "Superadmin",
        hashPassword(DEFAULT_SUPERADMIN_PASSWORD),
        timestamp,
        timestamp
      ]
    );
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
    const nutritionCenters = await this.execute("SELECT COUNT(*) AS count FROM nutrition_centers");
    const nutritionBeneficiaries = await this.execute("SELECT COUNT(*) AS count FROM nutrition_beneficiaries");
    const nutritionGrowthReports = await this.execute("SELECT COUNT(*) AS count FROM nutrition_growth_reports");

    return {
      active: Number(active.rows[0].count || 0),
      deleted: Number(deleted.rows[0].count || 0),
      monitoringReports: Number(monitoringReports.rows[0].count || 0),
      nutritionCenters: Number(nutritionCenters.rows[0].count || 0),
      nutritionBeneficiaries: Number(nutritionBeneficiaries.rows[0].count || 0),
      nutritionGrowthReports: Number(nutritionGrowthReports.rows[0].count || 0),
      databasePath: this.dbPath
    };
  }

  sanitizeUser(user) {
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      role: user.role,
      active: Boolean(user.active),
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  async authenticateUser(username, password) {
    const user = plainRow((await this.execute(
      "SELECT * FROM app_users WHERE lower(username) = lower(?)",
      [String(username || "").trim()]
    )).rows[0]);

    if (!user || !user.active || !verifyPassword(password, user.password_hash)) {
      throw new Error("Invalid username or password.");
    }

    return this.sanitizeUser(user);
  }

  async listUsers() {
    return rows(await this.execute("SELECT * FROM app_users ORDER BY role DESC, username"))
      .map(user => this.sanitizeUser(user));
  }

  async saveUser(input = {}) {
    const username = String(input.username || "").trim();
    const password = String(input.password || "");
    const displayName = titleCaseValue(input.display_name || input.displayName || username);
    const active = input.active === false || input.active === 0 ? 0 : 1;
    const id = Number(input.id || 0);

    if (!username) throw new Error("Username is required.");
    if (!/^[a-z0-9._-]{3,32}$/i.test(username)) {
      throw new Error("Username must be 3-32 characters using letters, numbers, dots, dashes, or underscores.");
    }

    const existing = id
      ? plainRow((await this.execute("SELECT * FROM app_users WHERE id = ?", [id])).rows[0])
      : plainRow((await this.execute("SELECT * FROM app_users WHERE lower(username) = lower(?)", [username])).rows[0]);

    if (!existing && password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    if (existing?.role === "superadmin" && active === 0) {
      throw new Error("The starter superadmin account cannot be deactivated.");
    }

    const duplicate = plainRow((await this.execute(
      "SELECT id FROM app_users WHERE lower(username) = lower(?) AND id <> ?",
      [username, id || 0]
    )).rows[0]);

    if (duplicate) throw new Error("Username already exists.");

    const timestamp = nowIso();

    if (existing) {
      if (password) {
        await this.execute(
          `
            UPDATE app_users
            SET username = ?, display_name = ?, password_hash = ?, active = ?, updated_at = ?
            WHERE id = ?
          `,
          [username, displayName, hashPassword(password), active, timestamp, existing.id]
        );
      } else {
        await this.execute(
          `
            UPDATE app_users
            SET username = ?, display_name = ?, active = ?, updated_at = ?
            WHERE id = ?
          `,
          [username, displayName, active, timestamp, existing.id]
        );
      }

      return this.sanitizeUser(plainRow((await this.execute("SELECT * FROM app_users WHERE id = ?", [existing.id])).rows[0]));
    }

    const result = await this.execute(
      `
        INSERT INTO app_users (username, display_name, password_hash, role, active, created_at, updated_at)
        VALUES (?, ?, ?, 'user', ?, ?, ?)
      `,
      [username, displayName, hashPassword(password), active, timestamp, timestamp]
    );
    const newId = result.lastInsertRowid ? Number(result.lastInsertRowid) : 0;

    return this.sanitizeUser(plainRow((await this.execute("SELECT * FROM app_users WHERE id = ?", [newId])).rows[0]));
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

  async getPreviousMonitoringReport(beneficiaryId, reportMonth, excludeId = 0) {
    if (!beneficiaryId || !reportMonth) return null;

    return plainRow((await this.execute(
      `
        SELECT *
        FROM monitoring_reports
        WHERE beneficiary_id = ?
          AND report_month < ?
          AND id <> ?
        ORDER BY report_month DESC, id DESC
        LIMIT 1
      `,
      [Number(beneficiaryId), String(reportMonth), Number(excludeId || 0)]
    )).rows[0]) || null;
  }

  async getMonitoringForwardedBalance({ beneficiaryId = "", reportMonth = "", excludeId = 0 } = {}) {
    const previous = await this.getPreviousMonitoringReport(beneficiaryId, reportMonth, excludeId);
    return {
      forwardedBalance: previous ? normalizeAmount(previous.net_income) : 0,
      previousReport: previous
    };
  }

  async recomputeMonitoringBalances(beneficiaryId) {
    if (!beneficiaryId) return;

    const reports = rows(await this.execute(
      `
        SELECT id, total_sales, total_expenses
        FROM monitoring_reports
        WHERE beneficiary_id = ?
        ORDER BY report_month ASC, id ASC
      `,
      [Number(beneficiaryId)]
    ));
    let forwardedBalance = 0;

    for (const report of reports) {
      const netIncome = forwardedBalance + normalizeAmount(report.total_sales) - normalizeAmount(report.total_expenses);
      await this.execute(
        `
          UPDATE monitoring_reports
          SET forwarded_balance = ?,
              net_income = ?,
              updated_at = ?
          WHERE id = ?
        `,
        [forwardedBalance, netIncome, nowIso(), report.id]
      );
      forwardedBalance = netIncome;
    }
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

    const carryForward = await this.getMonitoringForwardedBalance({
      beneficiaryId: report.beneficiary_id,
      reportMonth: report.report_month,
      excludeId: id || 0
    });
    report.forwarded_balance = carryForward.forwardedBalance;
    report.net_income = report.forwarded_balance + report.total_sales - report.total_expenses;

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

    await this.recomputeMonitoringBalances(report.beneficiary_id);
    if (existing?.beneficiary_id && Number(existing.beneficiary_id) !== Number(report.beneficiary_id)) {
      await this.recomputeMonitoringBalances(existing.beneficiary_id);
    }
    return this.getMonitoringReport(reportId);
  }

  async deleteMonitoringReport(id) {
    const report = await this.getMonitoringReport(id);
    if (!report) {
      throw new Error("Monitoring report was not found.");
    }

    await this.execute("DELETE FROM monitoring_reports WHERE id = ?", [Number(id)]);
    await this.recomputeMonitoringBalances(report.beneficiary_id);
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

  nutritionCenterWithCountsSelect() {
    return `
      SELECT c.*,
        COUNT(b.id) AS beneficiary_count,
        SUM(CASE
          WHEN lower(COALESCE(b.remarks, '')) = 'active'
            OR lower(COALESCE(b.profile_status, '')) = 'active'
          THEN 1 ELSE 0
        END) AS active_beneficiary_count
      FROM nutrition_centers c
      LEFT JOIN nutrition_beneficiaries b ON b.center_id = c.id
    `;
  }

  async listNutritionCenters({ search = "", limit = 200 } = {}) {
    const max = Math.min(Math.max(Number(limit) || 200, 1), 500);
    const pattern = `%${search.trim().toLowerCase()}%`;
    const where = search.trim()
      ? `WHERE lower(c.center_name) LIKE ?
          OR lower(c.location) LIKE ?
          OR lower(c.coordinator) LIKE ?
          OR lower(c.status) LIKE ?`
      : "";
    const args = search.trim() ? [pattern, pattern, pattern, pattern] : [];

    return rows(await this.execute(
      `
        ${this.nutritionCenterWithCountsSelect()}
        ${where}
        GROUP BY c.id
        ORDER BY c.center_name, c.id
        LIMIT ?
      `,
      [...args, max]
    ));
  }

  async getNutritionCenter(id) {
    const result = await this.execute(
      `
        ${this.nutritionCenterWithCountsSelect()}
        WHERE c.id = ?
        GROUP BY c.id
      `,
      [Number(id)]
    );
    return plainRow(result.rows[0]) || null;
  }

  async saveNutritionCenter(input = {}) {
    const center = normalizeNutritionCenter(input);
    if (!center.center_name) {
      throw new Error("Feeding center name is required.");
    }

    const id = Number(input.id || 0);
    const existing = id ? await this.getNutritionCenter(id) : null;
    const timestamp = nowIso();

    if (existing) {
      await this.client.batch([
        {
          sql: `
            UPDATE nutrition_centers
            SET center_name = ?,
                location = ?,
                coordinator = ?,
                contact_no = ?,
                capacity = ?,
                status = ?,
                notes = ?,
                updated_at = ?
            WHERE id = ?
          `,
          args: [
            center.center_name,
            center.location,
            center.coordinator,
            center.contact_no,
            center.capacity,
            center.status,
            center.notes,
            timestamp,
            existing.id
          ]
        },
        {
          sql: `
            UPDATE nutrition_beneficiaries
            SET feeding_center = ?, updated_at = ?
            WHERE center_id = ?
          `,
          args: [center.center_name, timestamp, existing.id]
        }
      ], "write");
      return this.getNutritionCenter(existing.id);
    }

    const result = await this.execute(
      `
        INSERT INTO nutrition_centers (
          center_name, location, coordinator, contact_no, capacity, status, notes, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        center.center_name,
        center.location,
        center.coordinator,
        center.contact_no,
        center.capacity,
        center.status,
        center.notes,
        timestamp,
        timestamp
      ]
    );
    const newId = result.lastInsertRowid ? Number(result.lastInsertRowid) : 0;

    return this.getNutritionCenter(newId);
  }

  async deleteNutritionCenter(id) {
    const center = await this.getNutritionCenter(id);
    if (!center) {
      throw new Error("Feeding center was not found.");
    }

    await this.execute("DELETE FROM nutrition_centers WHERE id = ?", [Number(id)]);
    return center;
  }

  async nextNutritionBeneficiaryNo(year = new Date().getFullYear()) {
    const prefix = `NP-${year}-`;
    const items = rows(await this.execute(
      "SELECT beneficiary_no FROM nutrition_beneficiaries WHERE beneficiary_no LIKE ?",
      [`${prefix}%`]
    ));
    const highest = items.reduce((max, row) => {
      const numberPart = Number(String(row.beneficiary_no || "").slice(prefix.length));
      return Number.isFinite(numberPart) && numberPart > max ? numberPart : max;
    }, 0);

    return `${prefix}${String(highest + 1).padStart(3, "0")}`;
  }

  nutritionBeneficiarySelect() {
    return `
      SELECT b.*, c.center_name AS center_name, c.location AS center_location
      FROM nutrition_beneficiaries b
      LEFT JOIN nutrition_centers c ON c.id = b.center_id
    `;
  }

  async listNutritionBeneficiaries({ search = "", centerId = "", limit = 200 } = {}) {
    const max = Math.min(Math.max(Number(limit) || 200, 1), 500);
    const conditions = [];
    const args = [];

    if (centerId) {
      conditions.push("b.center_id = ?");
      args.push(Number(centerId));
    }

    if (search.trim()) {
      const pattern = `%${search.trim().toLowerCase()}%`;
      conditions.push(`(
        lower(b.beneficiary_no) LIKE ?
        OR lower(b.child_last_name) LIKE ?
        OR lower(b.child_first_name) LIKE ?
        OR lower(b.child_middle_name) LIKE ?
        OR lower(b.child_last_name || ' ' || b.child_first_name || ' ' || b.child_middle_name) LIKE ?
        OR lower(b.mother_name) LIKE ?
        OR lower(b.father_name) LIKE ?
        OR lower(b.home_address) LIKE ?
        OR lower(b.school) LIKE ?
        OR lower(b.gender) LIKE ?
        OR lower(b.remarks) LIKE ?
        OR lower(b.current_nutrition_status) LIKE ?
        OR lower(b.feeding_center) LIKE ?
        OR lower(COALESCE(c.center_name, '')) LIKE ?
      )`);
      args.push(
        pattern, pattern, pattern, pattern, pattern, pattern, pattern,
        pattern, pattern, pattern, pattern, pattern, pattern, pattern
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    return rows(await this.execute(
      `
        ${this.nutritionBeneficiarySelect()}
        ${where}
        ORDER BY b.updated_at DESC, b.id DESC
        LIMIT ?
      `,
      [...args, max]
    ));
  }

  async getNutritionBeneficiary(id) {
    const result = await this.execute(
      `
        ${this.nutritionBeneficiarySelect()}
        WHERE b.id = ?
      `,
      [Number(id)]
    );
    const beneficiary = plainRow(result.rows[0]);
    if (!beneficiary) return null;

    return {
      ...beneficiary,
      household_members: rows(await this.execute(
        "SELECT * FROM nutrition_household_members WHERE beneficiary_id = ? ORDER BY row_order, id",
        [beneficiary.id]
      ))
    };
  }

  async getNutritionBeneficiaryByNo(beneficiaryNo) {
    const key = String(beneficiaryNo || "").trim();
    if (!key) return null;

    const result = await this.execute(
      `
        ${this.nutritionBeneficiarySelect()}
        WHERE b.beneficiary_no = ?
      `,
      [key]
    );
    return plainRow(result.rows[0]) || null;
  }

  nutritionSiblingConditions(beneficiary, beneficiaryId) {
    const conditions = ["id <> ?"];
    const args = [Number(beneficiaryId || 0)];
    const mother = String(beneficiary.mother_name || "").trim().toLowerCase();
    const father = String(beneficiary.father_name || "").trim().toLowerCase();
    const contact = normalizeContactNumber(beneficiary.contact_no);

    if (mother && father) {
      conditions.push("lower(mother_name) = ? AND lower(father_name) = ?");
      args.push(mother, father);
    } else if (mother && contact) {
      conditions.push("lower(mother_name) = ? AND contact_no = ?");
      args.push(mother, contact);
    } else if (father && contact) {
      conditions.push("lower(father_name) = ? AND contact_no = ?");
      args.push(father, contact);
    } else {
      return null;
    }

    return { where: conditions.join(" AND "), args };
  }

  async findNutritionSiblingIds(beneficiary, beneficiaryId) {
    const filter = this.nutritionSiblingConditions(beneficiary, beneficiaryId);
    if (!filter) return [];

    const result = await this.execute(
      `SELECT id FROM nutrition_beneficiaries WHERE ${filter.where}`,
      filter.args
    );
    return rows(result).map(row => Number(row.id)).filter(Boolean);
  }

  async nutritionHouseholdMembersFor(beneficiaryId) {
    return rows(await this.execute(
      `
        SELECT member_name, age, relationship, occupation
        FROM nutrition_household_members
        WHERE beneficiary_id = ?
        ORDER BY row_order, id
      `,
      [Number(beneficiaryId)]
    ));
  }

  nutritionHouseholdWriteStatements(beneficiaryId, members) {
    return [
      { sql: "DELETE FROM nutrition_household_members WHERE beneficiary_id = ?", args: [Number(beneficiaryId)] },
      ...members.map((member, index) => ({
        sql: `
          INSERT INTO nutrition_household_members (
            beneficiary_id, row_order, member_name, age, relationship, occupation
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
          Number(beneficiaryId),
          index,
          member.member_name,
          member.age,
          member.relationship,
          member.occupation
        ]
      }))
    ];
  }

  async saveNutritionBeneficiary(input = {}) {
    const id = Number(input.id || 0);
    const existing = id ? await this.getNutritionBeneficiary(id) : null;
    const requestedCenterId = Number(input.center_id || input.centerId || existing?.center_id || 0) || 0;
    const center = requestedCenterId ? await this.getNutritionCenter(requestedCenterId) : null;
    const beneficiary = normalizeNutritionBeneficiary({
      ...existing,
      ...input,
      center_id: requestedCenterId || null
    }, center);

    if (!beneficiary.beneficiary_no) {
      beneficiary.beneficiary_no = await this.nextNutritionBeneficiaryNo();
    }

    if (!beneficiary.child_last_name || !beneficiary.child_first_name) {
      throw new Error("Child first and last name are required.");
    }

    const duplicate = await this.getNutritionBeneficiaryByNo(beneficiary.beneficiary_no);
    if (duplicate && duplicate.id !== existing?.id) {
      throw new Error(`Nutrition beneficiary no. already exists: ${beneficiary.beneficiary_no}`);
    }

    const timestamp = nowIso();
    const values = NUTRITION_BENEFICIARY_FIELDS.map(fieldName => beneficiary[fieldName]);
    let beneficiaryId = existing?.id || 0;

    if (existing) {
      const assignments = NUTRITION_BENEFICIARY_FIELDS.map(fieldName => `${quoted(fieldName)} = ?`).join(", ");
      await this.execute(
        `UPDATE nutrition_beneficiaries SET ${assignments}, updated_at = ? WHERE id = ?`,
        [...values, timestamp, existing.id]
      );
      beneficiaryId = existing.id;
    } else {
      const columns = NUTRITION_BENEFICIARY_FIELDS.map(quoted).join(", ");
      const placeholders = NUTRITION_BENEFICIARY_FIELDS.map(() => "?").join(", ");
      const result = await this.execute(
        `
          INSERT INTO nutrition_beneficiaries (${columns}, created_at, updated_at)
          VALUES (${placeholders}, ?, ?)
        `,
        [...values, timestamp, timestamp]
      );
      beneficiaryId = result.lastInsertRowid ? Number(result.lastInsertRowid) : 0;
    }

    const siblingIds = await this.findNutritionSiblingIds(beneficiary, beneficiaryId);
    const siblingHouseholdRows = [];
    for (const siblingId of siblingIds) {
      siblingHouseholdRows.push(...await this.nutritionHouseholdMembersFor(siblingId));
    }
    const householdMembers = mergeNutritionHouseholdMembers(beneficiary.household_members, siblingHouseholdRows);

    await this.client.batch(
      [beneficiaryId, ...siblingIds].flatMap(targetId => this.nutritionHouseholdWriteStatements(targetId, householdMembers)),
      "write"
    );

    await this.refreshNutritionBeneficiaryGrowthSnapshot(beneficiaryId);
    return this.getNutritionBeneficiary(beneficiaryId);
  }

  async deleteNutritionBeneficiary(id) {
    const beneficiary = await this.getNutritionBeneficiary(id);
    if (!beneficiary) {
      throw new Error("Nutrition beneficiary was not found.");
    }

    await this.execute("DELETE FROM nutrition_beneficiaries WHERE id = ?", [Number(id)]);
    return beneficiary;
  }

  async exportNutritionBeneficiaries() {
    const beneficiaries = rows(await this.execute(
      "SELECT id FROM nutrition_beneficiaries ORDER BY beneficiary_no, child_last_name, child_first_name"
    ));
    const detailed = [];

    for (const beneficiary of beneficiaries) {
      detailed.push(await this.getNutritionBeneficiary(beneficiary.id));
    }

    return detailed;
  }

  nutritionGrowthReportSelect() {
    return `
      SELECT r.*,
        COUNT(e.id) AS child_count,
        SUM(CASE WHEN e.cgs_classification = 'Severely Underweight' THEN 1 ELSE 0 END) AS severely_underweight_count,
        SUM(CASE WHEN e.cgs_classification = 'Underweight' THEN 1 ELSE 0 END) AS underweight_count,
        SUM(CASE WHEN e.cgs_classification = 'Normal' THEN 1 ELSE 0 END) AS normal_count,
        SUM(CASE WHEN e.cgs_classification = 'Overweight' THEN 1 ELSE 0 END) AS overweight_count
      FROM nutrition_growth_reports r
      LEFT JOIN nutrition_growth_entries e ON e.report_id = r.id
    `;
  }

  async listNutritionGrowthReports({ search = "", centerId = "", limit = 200 } = {}) {
    const max = Math.min(Math.max(Number(limit) || 200, 1), 500);
    const conditions = [];
    const args = [];

    if (centerId) {
      conditions.push("r.center_id = ?");
      args.push(Number(centerId));
    }

    if (search.trim()) {
      const pattern = `%${search.trim().toLowerCase()}%`;
      conditions.push(`(
        lower(r.center_name) LIKE ?
        OR lower(r.report_month) LIKE ?
        OR lower(r.submitted_date) LIKE ?
      )`);
      args.push(pattern, pattern, pattern);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    return rows(await this.execute(
      `
        ${this.nutritionGrowthReportSelect()}
        ${where}
        GROUP BY r.id
        ORDER BY r.report_month DESC, r.updated_at DESC, r.id DESC
        LIMIT ?
      `,
      [...args, max]
    ));
  }

  async getNutritionGrowthReport(id) {
    const report = plainRow((await this.execute(
      `
        ${this.nutritionGrowthReportSelect()}
        WHERE r.id = ?
        GROUP BY r.id
      `,
      [Number(id)]
    )).rows[0]);
    if (!report) return null;

    return {
      ...report,
      entries: rows(await this.execute(
        "SELECT * FROM nutrition_growth_entries WHERE report_id = ? ORDER BY row_order, id",
        [report.id]
      ))
    };
  }

  async listNutritionBeneficiariesForGrowth(centerId) {
    return rows(await this.execute(
      `
        ${this.nutritionBeneficiarySelect()}
        WHERE b.center_id = ?
        ORDER BY b.beneficiary_no, b.child_last_name, b.child_first_name, b.id
      `,
      [Number(centerId)]
    ));
  }

  async getPreviousNutritionGrowthEntry(beneficiaryId, reportMonth, excludeReportId = 0) {
    if (!beneficiaryId || !reportMonth) return null;

    return plainRow((await this.execute(
      `
        SELECT e.*, r.report_month, r.submitted_date
        FROM nutrition_growth_entries e
        JOIN nutrition_growth_reports r ON r.id = e.report_id
        WHERE e.beneficiary_id = ?
          AND r.report_month < ?
          AND r.id <> ?
        ORDER BY r.report_month DESC, r.id DESC, e.id DESC
        LIMIT 1
      `,
      [Number(beneficiaryId), String(reportMonth), Number(excludeReportId || 0)]
    )).rows[0]) || null;
  }

  async latestNutritionGrowthEntry(beneficiaryId) {
    if (!beneficiaryId) return null;

    return plainRow((await this.execute(
      `
        SELECT e.*, r.report_month, r.submitted_date
        FROM nutrition_growth_entries e
        JOIN nutrition_growth_reports r ON r.id = e.report_id
        WHERE e.beneficiary_id = ?
          AND (trim(COALESCE(e.height_cm, '')) <> '' OR trim(COALESCE(e.weight_kg, '')) <> '')
        ORDER BY r.report_month DESC, r.id DESC, e.id DESC
        LIMIT 1
      `,
      [Number(beneficiaryId)]
    )).rows[0]) || null;
  }

  async nutritionGrowthReference(beneficiary, reportMonth, excludeReportId = 0) {
    const previous = await this.getPreviousNutritionGrowthEntry(beneficiary.id, reportMonth, excludeReportId);
    if (previous) {
      return {
        previous_record_date: previous.report_month || previous.submitted_date || "",
        previous_height_cm: previous.height_cm || "",
        previous_weight_kg: previous.weight_kg || "",
        previous_cgs_classification: previous.cgs_classification || ""
      };
    }

    return {
      previous_record_date: beneficiary.admission_date || "",
      previous_height_cm: beneficiary.initial_height_cm || "",
      previous_weight_kg: beneficiary.initial_weight_kg || "",
      previous_cgs_classification: beneficiary.initial_nutrition_status || ""
    };
  }

  async buildNutritionGrowthEntry(beneficiary, inputEntry = {}, reportMonth, excludeReportId = 0, rowOrder = 0) {
    const reference = await this.nutritionGrowthReference(beneficiary, reportMonth, excludeReportId);
    const height = formatMeasurementValue(inputEntry.height_cm ?? inputEntry.heightCm);
    const weight = formatMeasurementValue(inputEntry.weight_kg ?? inputEntry.weightKg);
    const ageMonths = calculateAgeMonths(beneficiary.birth_date, reportMonth);
    const cgsClassification = weight
      ? classifyCgs({ gender: beneficiary.gender, ageMonths, weightKg: weight })
      : "";

    return {
      report_id: Number(inputEntry.report_id || inputEntry.reportId || 0) || 0,
      beneficiary_id: Number(beneficiary.id),
      beneficiary_no: beneficiary.beneficiary_no || "",
      beneficiary_name: [beneficiary.child_last_name, beneficiary.child_first_name, beneficiary.child_middle_name].filter(Boolean).join(", ") || beneficiary.beneficiary_no,
      gender: beneficiary.gender || "",
      birth_date: beneficiary.birth_date || "",
      age_months: ageMonths,
      height_cm: height,
      weight_kg: weight,
      height_change_cm: measurementChange(height, reference.previous_height_cm),
      weight_change_kg: measurementChange(weight, reference.previous_weight_kg),
      cgs_classification: cgsClassification,
      previous_record_date: reference.previous_record_date,
      previous_height_cm: reference.previous_height_cm,
      previous_weight_kg: reference.previous_weight_kg,
      previous_cgs_classification: reference.previous_cgs_classification,
      row_order: rowOrder
    };
  }

  async buildNutritionGrowthDraft(input = {}) {
    const id = Number(input.id || 0) || 0;
    const existing = id ? await this.getNutritionGrowthReport(id) : null;
    const centerId = Number(input.center_id || input.centerId || existing?.center_id || 0) || 0;
    const center = centerId ? await this.getNutritionCenter(centerId) : null;
    if (!center) {
      throw new Error("Select a feeding center for this growth monitoring report.");
    }

    const report = normalizeNutritionGrowthReport({
      ...existing,
      ...input,
      center_id: center.id
    }, center, existing);

    if (!report.report_month) {
      throw new Error("Report month is required.");
    }

    const entryMap = new Map(
      (Array.isArray(report.entries) ? report.entries : []).map(entry => [
        Number(entry.beneficiary_id || entry.beneficiaryId),
        entry
      ])
    );
    const beneficiaries = await this.listNutritionBeneficiariesForGrowth(center.id);
    const entries = [];

    for (let index = 0; index < beneficiaries.length; index += 1) {
      const beneficiary = beneficiaries[index];
      const entry = await this.buildNutritionGrowthEntry(
        beneficiary,
        entryMap.get(Number(beneficiary.id)) || {},
        report.report_month,
        id || 0,
        index
      );
      entry.report_id = id || 0;
      entries.push(entry);
    }

    return {
      ...report,
      entries
    };
  }

  async saveNutritionGrowthReport(input = {}) {
    const id = Number(input.id || 0) || 0;
    const existing = id ? await this.getNutritionGrowthReport(id) : null;
    const report = await this.buildNutritionGrowthDraft(input);
    const duplicate = plainRow((await this.execute(
      "SELECT id FROM nutrition_growth_reports WHERE center_id = ? AND report_month = ? AND id <> ?",
      [report.center_id, report.report_month, id || 0]
    )).rows[0]);

    if (duplicate) {
      throw new Error("This feeding center already has a growth monitoring report for that month.");
    }

    const timestamp = nowIso();
    let reportId = id;
    const reportValues = [
      report.center_id,
      report.center_name,
      report.submitted_date,
      report.report_month
    ];

    if (existing) {
      await this.execute(
        `
          UPDATE nutrition_growth_reports
          SET center_id = ?,
              center_name = ?,
              submitted_date = ?,
              report_month = ?,
              updated_at = ?
          WHERE id = ?
        `,
        [...reportValues, timestamp, reportId]
      );
    } else {
      const result = await this.execute(
        `
          INSERT INTO nutrition_growth_reports (
            center_id, center_name, submitted_date, report_month, created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [...reportValues, timestamp, timestamp]
      );
      reportId = result.lastInsertRowid ? Number(result.lastInsertRowid) : 0;
    }

    await this.client.batch([
      { sql: "DELETE FROM nutrition_growth_entries WHERE report_id = ?", args: [reportId] },
      ...report.entries.map((entry, index) => ({
        sql: `
          INSERT INTO nutrition_growth_entries (
            report_id, beneficiary_id, beneficiary_no, beneficiary_name, gender, birth_date,
            age_months, height_cm, weight_kg, height_change_cm, weight_change_kg,
            cgs_classification, previous_record_date, previous_height_cm, previous_weight_kg,
            previous_cgs_classification, row_order
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: NUTRITION_GROWTH_ENTRY_FIELDS.map(fieldName => (
          fieldName === "report_id" ? reportId :
          fieldName === "row_order" ? index :
          entry[fieldName]
        ))
      }))
    ], "write");

    for (const entry of report.entries) {
      await this.refreshNutritionBeneficiaryGrowthSnapshot(entry.beneficiary_id);
    }

    if (existing?.center_id && Number(existing.center_id) !== Number(report.center_id)) {
      for (const entry of existing.entries) {
        await this.refreshNutritionBeneficiaryGrowthSnapshot(entry.beneficiary_id);
      }
    }

    return this.getNutritionGrowthReport(reportId);
  }

  async refreshNutritionBeneficiaryGrowthSnapshot(beneficiaryId) {
    if (!beneficiaryId) return;

    const latest = await this.latestNutritionGrowthEntry(beneficiaryId);
    if (!latest) return;

    await this.execute(
      `
        UPDATE nutrition_beneficiaries
        SET current_update_date = ?,
            current_age_months = ?,
            current_weight_kg = ?,
            current_height_cm = ?,
            current_nutrition_status = ?,
            updated_at = ?
        WHERE id = ?
      `,
      [
        latest.submitted_date || monthEndProfileDate(latest.report_month),
        latest.age_months || "",
        latest.weight_kg || "",
        latest.height_cm || "",
        latest.cgs_classification || "",
        nowIso(),
        Number(beneficiaryId)
      ]
    );
  }

  async deleteNutritionGrowthReport(id) {
    const report = await this.getNutritionGrowthReport(id);
    if (!report) {
      throw new Error("Growth monitoring report was not found.");
    }

    await this.execute("DELETE FROM nutrition_growth_reports WHERE id = ?", [Number(id)]);

    for (const entry of report.entries) {
      await this.refreshNutritionBeneficiaryGrowthSnapshot(entry.beneficiary_id);
    }

    return report;
  }

  async exportNutritionGrowthReports() {
    const reports = rows(await this.execute(
      "SELECT id FROM nutrition_growth_reports ORDER BY report_month DESC, center_name"
    ));
    const detailed = [];

    for (const report of reports) {
      detailed.push(await this.getNutritionGrowthReport(report.id));
    }

    return detailed;
  }

  nutritionCgsReference() {
    return cgsReferencePayload();
  }

  async nutritionOverview() {
    const centers = await this.listNutritionCenters({ limit: 500 });
    const beneficiaries = await this.listNutritionBeneficiaries({ limit: 500 });
    const growthReports = await this.listNutritionGrowthReports({ limit: 500 });
    const activeBeneficiaries = beneficiaries.filter(beneficiary => {
      const remarks = String(beneficiary.remarks || "").toLowerCase();
      const profileStatus = String(beneficiary.profile_status || "").toLowerCase();
      return remarks === "active" || profileStatus === "active";
    });

    return {
      centers,
      beneficiaries,
      growthReports,
      stats: {
        centers: centers.length,
        activeCenters: centers.filter(center => String(center.status || "").toLowerCase() === "active").length,
        beneficiaries: beneficiaries.length,
        activeBeneficiaries: activeBeneficiaries.length,
        growthReports: growthReports.length
      }
    };
  }

  async exportData() {
    const nutrition = await this.nutritionOverview();

    return {
      exportedAt: nowIso(),
      fields: FIELD_NAMES,
      records: rows(await this.execute("SELECT * FROM beneficiaries ORDER BY control_no")),
      monitoringReports: await this.exportMonitoringReports(),
      nutritionCenters: nutrition.centers,
      nutritionBeneficiaries: await this.exportNutritionBeneficiaries(),
      nutritionGrowthReports: await this.exportNutritionGrowthReports(),
      deletedRecords: rows(await this.execute("SELECT * FROM deleted_records ORDER BY deleted_at DESC, id DESC"))
    };
  }
}

module.exports = {
  TursoBeneficiaryDatabase
};
