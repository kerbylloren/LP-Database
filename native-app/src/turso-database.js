const { FIELD_NAMES, SUMMARY_FIELDS } = require("./metadata");
const { cloudLocationLabel } = require("./cloud-config");
const {
  NUTRITION_BENEFICIARY_FIELDS,
  NUTRITION_FINANCIAL_CATEGORIES,
  NUTRITION_GROWTH_ENTRY_FIELDS,
  buildNutritionFinancialSummaryPayload,
  decorateNutritionFinancialReport,
  mergeNutritionHouseholdMembers,
  normalizeAmount,
  normalizeContactNumber,
  normalizeMonitoringReport,
  normalizeNutritionBeneficiary,
  normalizeNutritionCenter,
  normalizeNutritionFinancialBudget,
  normalizeNutritionFinancialReport,
  normalizeRecord,
  nowIso,
  quoted,
  titleCaseValue,
  hashPassword,
  verifyPassword
} = require("./database");
const { initializeTursoScholarship } = require("./scholarship-store");
const { initializeTursoOperations } = require("./operations-store");
const {
  calculateAgeMonths,
  cgsReferencePayload,
  classifyCgs,
  normalizeReportMonth,
  parseMeasurementNumber
} = require("./nutrition-cgs");
const {
  decorateCosting,
  decorateRecipe,
  groupMenuEntriesByWeek,
  normalizeCosting,
  normalizeMenu,
  normalizeRecipe,
  recipeKey,
  scalePurchaseBudget
} = require("./nutrition-menu");

const DEFAULT_SUPERADMIN_USERNAME = process.env.LPDB_SUPERADMIN_USERNAME || "superadmin";
const DEFAULT_SUPERADMIN_PASSWORD = process.env.LPDB_SUPERADMIN_PASSWORD || "ChangeMe123!";
const TURSO_SAFE_RETRY_ATTEMPTS = 3;
const FAMILY_FIELDS = [
  "list_a18",
  "list_c18",
  "list_d18",
  "list_f18",
  "list_h18",
  "list_j18",
  "list_k18",
  "list_m18"
];

function clampLimit(limit, fallback = 50, max = 500) {
  return Math.min(Math.max(Number(limit) || fallback, 1), max);
}

function clampOffset(offset) {
  return Math.max(Number(offset) || 0, 0);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isTransientCloudError(error) {
  const message = [
    error?.message,
    error?.cause?.message,
    error?.cause?.code,
    error?.code
  ].filter(Boolean).join(" ");

  return /fetch failed|timeout|timed out|econnreset|econnrefused|socket|network|terminated|und_err/i.test(message);
}

function isRetryableSql(sql) {
  return /^(select|pragma|create)\b/i.test(String(sql || "").trim());
}

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
  if (currentNumber === null) return "";
  if (!String(previous ?? "").trim()) return "0";
  const previousNumber = parseMeasurementNumber(previous);
  if (previousNumber === null) return "0";
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
    const canRetry = isRetryableSql(sql);
    let lastError = null;

    for (let attempt = 1; attempt <= TURSO_SAFE_RETRY_ATTEMPTS; attempt += 1) {
      try {
        return await this.client.execute({ sql, args });
      } catch (error) {
        lastError = error;
        if (!canRetry || !isTransientCloudError(error) || attempt === TURSO_SAFE_RETRY_ATTEMPTS) {
          throw error;
        }
        await wait(350 * attempt);
      }
    }

    throw lastError;
  }

  async executeBatch(statements, mode = "write", canRetry = false) {
    const batchStatements = statements.map(statement => (
      typeof statement === "string" ? { sql: statement, args: [] } : statement
    ));
    let lastError = null;

    for (let attempt = 1; attempt <= TURSO_SAFE_RETRY_ATTEMPTS; attempt += 1) {
      try {
        return await this.client.batch(batchStatements, mode);
      } catch (error) {
        lastError = error;
        if (!canRetry || !isTransientCloudError(error) || attempt === TURSO_SAFE_RETRY_ATTEMPTS) {
          throw error;
        }
        await wait(350 * attempt);
      }
    }

    throw lastError;
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
        CREATE TABLE IF NOT EXISTS nutrition_financial_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          center_id INTEGER,
          center_name TEXT NOT NULL DEFAULT '',
          submitted_date TEXT NOT NULL DEFAULT '',
          report_month TEXT NOT NULL DEFAULT '',
          beginning_balance REAL NOT NULL DEFAULT 0,
          cash_receipts REAL NOT NULL DEFAULT 0,
          prepared_by TEXT NOT NULL DEFAULT '',
          prepared_title TEXT NOT NULL DEFAULT '',
          noted_by TEXT NOT NULL DEFAULT '',
          noted_title TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (center_id) REFERENCES nutrition_centers(id) ON DELETE SET NULL
        )
      `,
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_nutrition_financial_center_month ON nutrition_financial_reports(center_id, report_month)",
      "CREATE INDEX IF NOT EXISTS idx_nutrition_financial_reports_month ON nutrition_financial_reports(report_month)",
      `
        CREATE TABLE IF NOT EXISTS nutrition_financial_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_id INTEGER NOT NULL,
          row_order INTEGER NOT NULL DEFAULT 0,
          entry_date TEXT NOT NULL DEFAULT '',
          rep_no TEXT NOT NULL DEFAULT '',
          particulars TEXT NOT NULL DEFAULT '',
          cv_no TEXT NOT NULL DEFAULT '',
          viands REAL NOT NULL DEFAULT 0,
          milk REAL NOT NULL DEFAULT 0,
          rice REAL NOT NULL DEFAULT 0,
          gas REAL NOT NULL DEFAULT 0,
          mineral_water REAL NOT NULL DEFAULT 0,
          utilities REAL NOT NULL DEFAULT 0,
          others REAL NOT NULL DEFAULT 0,
          FOREIGN KEY (report_id) REFERENCES nutrition_financial_reports(id) ON DELETE CASCADE
        )
      `,
      "CREATE INDEX IF NOT EXISTS idx_nutrition_financial_entries_report ON nutrition_financial_entries(report_id)",
      `
        CREATE TABLE IF NOT EXISTS nutrition_financial_budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          center_id INTEGER,
          center_name TEXT NOT NULL DEFAULT '',
          budget_year INTEGER NOT NULL,
          feeding_days INTEGER NOT NULL DEFAULT 22,
          approved_budget_per_child REAL NOT NULL DEFAULT 0,
          viands REAL NOT NULL DEFAULT 0,
          milk REAL NOT NULL DEFAULT 0,
          rice REAL NOT NULL DEFAULT 0,
          gas REAL NOT NULL DEFAULT 0,
          mineral_water REAL NOT NULL DEFAULT 0,
          utilities REAL NOT NULL DEFAULT 0,
          others REAL NOT NULL DEFAULT 0,
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (center_id) REFERENCES nutrition_centers(id) ON DELETE CASCADE
        )
      `,
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_nutrition_financial_budget_center_year ON nutrition_financial_budgets(center_id, budget_year)",
      `
        CREATE TABLE IF NOT EXISTS nutrition_recipes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipe_name TEXT NOT NULL,
          recipe_key TEXT NOT NULL UNIQUE,
          description TEXT NOT NULL DEFAULT '',
          base_servings INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'Active',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `,
      "CREATE INDEX IF NOT EXISTS idx_nutrition_recipes_name ON nutrition_recipes(recipe_name)",
      `
        CREATE TABLE IF NOT EXISTS nutrition_recipe_ingredients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipe_id INTEGER NOT NULL,
          row_order INTEGER NOT NULL DEFAULT 0,
          ingredient_name TEXT NOT NULL DEFAULT '',
          default_quantity TEXT NOT NULL DEFAULT '',
          default_cost REAL NOT NULL DEFAULT 0,
          FOREIGN KEY (recipe_id) REFERENCES nutrition_recipes(id) ON DELETE CASCADE
        )
      `,
      "CREATE INDEX IF NOT EXISTS idx_nutrition_recipe_ingredients_recipe ON nutrition_recipe_ingredients(recipe_id)",
      `
        CREATE TABLE IF NOT EXISTS nutrition_monthly_menus (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          menu_month TEXT NOT NULL UNIQUE,
          status TEXT NOT NULL DEFAULT 'Draft',
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS nutrition_monthly_menu_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          menu_id INTEGER NOT NULL,
          row_order INTEGER NOT NULL DEFAULT 0,
          meal_date TEXT NOT NULL,
          recipe_id INTEGER,
          meal_name TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          FOREIGN KEY (menu_id) REFERENCES nutrition_monthly_menus(id) ON DELETE CASCADE,
          FOREIGN KEY (recipe_id) REFERENCES nutrition_recipes(id) ON DELETE SET NULL,
          UNIQUE(menu_id, meal_date)
        )
      `,
      "CREATE INDEX IF NOT EXISTS idx_nutrition_menu_entries_date ON nutrition_monthly_menu_entries(meal_date)",
      `
        CREATE TABLE IF NOT EXISTS nutrition_menu_costings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          center_id INTEGER NOT NULL,
          center_name TEXT NOT NULL DEFAULT '',
          menu_id INTEGER,
          report_month TEXT NOT NULL DEFAULT '',
          week_start TEXT NOT NULL,
          week_end TEXT NOT NULL,
          no_children INTEGER NOT NULL DEFAULT 0,
          inventory_rice REAL NOT NULL DEFAULT 0,
          inventory_manna REAL NOT NULL DEFAULT 0,
          inventory_vitameals REAL NOT NULL DEFAULT 0,
          budget_released REAL NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'Draft',
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (center_id) REFERENCES nutrition_centers(id) ON DELETE CASCADE,
          FOREIGN KEY (menu_id) REFERENCES nutrition_monthly_menus(id) ON DELETE SET NULL,
          UNIQUE(center_id, week_start)
        )
      `,
      "CREATE INDEX IF NOT EXISTS idx_nutrition_costings_month ON nutrition_menu_costings(report_month, center_id)",
      `
        CREATE TABLE IF NOT EXISTS nutrition_menu_costing_days (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          costing_id INTEGER NOT NULL,
          row_order INTEGER NOT NULL DEFAULT 0,
          meal_date TEXT NOT NULL,
          recipe_id INTEGER,
          meal_name TEXT NOT NULL DEFAULT '',
          kids_present INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (costing_id) REFERENCES nutrition_menu_costings(id) ON DELETE CASCADE,
          FOREIGN KEY (recipe_id) REFERENCES nutrition_recipes(id) ON DELETE SET NULL,
          UNIQUE(costing_id, meal_date)
        )
      `,
      "CREATE INDEX IF NOT EXISTS idx_nutrition_costing_days_costing ON nutrition_menu_costing_days(costing_id)",
      `
        CREATE TABLE IF NOT EXISTS nutrition_menu_costing_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          costing_day_id INTEGER NOT NULL,
          recipe_ingredient_id INTEGER,
          row_order INTEGER NOT NULL DEFAULT 0,
          ingredient_name TEXT NOT NULL DEFAULT '',
          budget_quantity TEXT NOT NULL DEFAULT '',
          budget_cost REAL NOT NULL DEFAULT 0,
          actual_quantity TEXT NOT NULL DEFAULT '',
          actual_cost REAL NOT NULL DEFAULT 0,
          FOREIGN KEY (costing_day_id) REFERENCES nutrition_menu_costing_days(id) ON DELETE CASCADE,
          FOREIGN KEY (recipe_ingredient_id) REFERENCES nutrition_recipe_ingredients(id) ON DELETE SET NULL
        )
      `,
      "CREATE INDEX IF NOT EXISTS idx_nutrition_costing_items_day ON nutrition_menu_costing_items(costing_day_id)",
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
      "CREATE INDEX IF NOT EXISTS idx_app_users_username ON app_users(username)",
      "CREATE INDEX IF NOT EXISTS idx_app_users_username_lower ON app_users(lower(username))"
    ];

    await this.executeBatch(statements, "write", true);

    await this.ensureBeneficiaryColumns();
    await this.ensureNutritionFinancialBudgetColumns();
    await this.backfillCurrentGroup();
    await this.ensureSuperadmin();
    this.scholarship = await initializeTursoScholarship(this);
    this.operations = await initializeTursoOperations(this);
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

  async ensureNutritionFinancialBudgetColumns() {
    const existingColumns = new Set(
      rows(await this.execute("PRAGMA table_info(nutrition_financial_budgets)")).map(column => column.name)
    );
    if (!existingColumns.has("approved_budget_per_child")) {
      await this.execute("ALTER TABLE nutrition_financial_budgets ADD COLUMN approved_budget_per_child REAL NOT NULL DEFAULT 0");
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

  async warmup() {
    await this.execute("SELECT id FROM app_users WHERE lower(username) = lower(?) LIMIT 1", ["__warmup__"]);
  }

  async stats() {
    const row = plainRow((await this.execute(`
      SELECT
        (SELECT COUNT(*) FROM beneficiaries) AS active,
        (SELECT COUNT(*) FROM deleted_records) AS deleted,
        (SELECT COUNT(*) FROM monitoring_reports) AS monitoringReports,
        (SELECT COUNT(*) FROM nutrition_centers) AS nutritionCenters,
        (SELECT COUNT(*) FROM nutrition_beneficiaries) AS nutritionBeneficiaries,
        (SELECT COUNT(*) FROM nutrition_growth_reports) AS nutritionGrowthReports,
        (SELECT COUNT(*) FROM nutrition_financial_reports) AS nutritionFinancialReports,
        (SELECT COUNT(*) FROM nutrition_recipes) AS nutritionRecipes,
        (SELECT COUNT(*) FROM nutrition_monthly_menus) AS nutritionMonthlyMenus,
        (SELECT COUNT(*) FROM nutrition_menu_costings) AS nutritionMenuCostings,
        (SELECT COUNT(*) FROM scholarship_scholars WHERE COALESCE(deleted_at, '') = '') AS scholarshipScholars,
        (SELECT COUNT(*) FROM scholarship_sponsors WHERE COALESCE(deleted_at, '') = '') AS scholarshipSponsors,
        (SELECT COUNT(*) FROM scholarship_enrollments WHERE COALESCE(deleted_at, '') = '') AS scholarshipEnrollments,
        (SELECT COUNT(*) FROM scholarship_grade_records WHERE COALESCE(deleted_at, '') = '') AS scholarshipGrades,
        (SELECT COUNT(*) FROM scholarship_attendance WHERE COALESCE(deleted_at, '') = '') AS scholarshipAttendance,
        (SELECT COUNT(*) FROM scholarship_payments WHERE COALESCE(deleted_at, '') = '' AND status = 'Cleared') AS scholarshipPayments,
        (SELECT COUNT(*) FROM health_patients WHERE COALESCE(deleted_at, '') = '') AS healthPatients,
        (SELECT COUNT(*) FROM health_encounters WHERE COALESCE(deleted_at, '') = '') AS healthEncounters,
        (SELECT COUNT(*) FROM operations_people WHERE COALESCE(deleted_at, '') = '' AND status = 'Active') AS administrationPeople,
        (SELECT COUNT(*) FROM operations_assets WHERE COALESCE(deleted_at, '') = '') AS administrationAssets,
        (SELECT COUNT(*) FROM operations_compliance WHERE COALESCE(deleted_at, '') = '') AS administrationCompliance,
        (SELECT COUNT(*) FROM operations_finance WHERE COALESCE(deleted_at, '') = '') AS administrationFinance,
        (SELECT COUNT(*) FROM operations_finance WHERE COALESCE(deleted_at, '') = '' AND program_code = 'livelihood') AS livelihoodFinance,
        (SELECT COUNT(*) FROM operations_finance WHERE COALESCE(deleted_at, '') = '' AND program_code = 'nutrition') AS nutritionFinance,
        (SELECT COUNT(*) FROM operations_finance WHERE COALESCE(deleted_at, '') = '' AND program_code = 'scholarship') AS scholarshipFinance,
        (SELECT COUNT(*) FROM operations_finance WHERE COALESCE(deleted_at, '') = '' AND program_code = 'health') AS healthFinance
    `)).rows[0]) || {};

    return {
      active: Number(row.active || 0),
      deleted: Number(row.deleted || 0),
      monitoringReports: Number(row.monitoringReports || 0),
      nutritionCenters: Number(row.nutritionCenters || 0),
      nutritionBeneficiaries: Number(row.nutritionBeneficiaries || 0),
      nutritionGrowthReports: Number(row.nutritionGrowthReports || 0),
      nutritionFinancialReports: Number(row.nutritionFinancialReports || 0),
      nutritionRecipes: Number(row.nutritionRecipes || 0),
      nutritionMonthlyMenus: Number(row.nutritionMonthlyMenus || 0),
      nutritionMenuCostings: Number(row.nutritionMenuCostings || 0),
      scholarshipScholars: Number(row.scholarshipScholars || 0),
      scholarshipSponsors: Number(row.scholarshipSponsors || 0),
      scholarshipEnrollments: Number(row.scholarshipEnrollments || 0),
      scholarshipGrades: Number(row.scholarshipGrades || 0),
      scholarshipAttendance: Number(row.scholarshipAttendance || 0),
      scholarshipPayments: Number(row.scholarshipPayments || 0),
      healthPatients: Number(row.healthPatients || 0),
      healthEncounters: Number(row.healthEncounters || 0),
      administrationPeople: Number(row.administrationPeople || 0),
      administrationAssets: Number(row.administrationAssets || 0),
      administrationCompliance: Number(row.administrationCompliance || 0),
      administrationFinance: Number(row.administrationFinance || 0),
      livelihoodFinance: Number(row.livelihoodFinance || 0),
      nutritionFinance: Number(row.nutritionFinance || 0),
      scholarshipFinance: Number(row.scholarshipFinance || 0),
      healthFinance: Number(row.healthFinance || 0),
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

  async countRecords({ search = "" } = {}) {
    if (!search.trim()) {
      const row = plainRow((await this.execute("SELECT COUNT(*) AS count FROM beneficiaries")).rows[0]) || {};
      return Number(row.count || 0);
    }

    const pattern = `%${search.trim().toLowerCase()}%`;
    const row = plainRow((await this.execute(
      `
        SELECT COUNT(*) AS count
        FROM beneficiaries
        WHERE lower(control_no) LIKE ?
          OR lower(last_name) LIKE ?
          OR lower(first_name) LIKE ?
          OR lower(middle_name) LIKE ?
          OR lower(first_name || ' ' || middle_name || ' ' || last_name) LIKE ?
          OR lower(last_name || ' ' || first_name || ' ' || middle_name) LIKE ?
      `,
      [pattern, pattern, pattern, pattern, pattern, pattern]
    )).rows[0]) || {};
    return Number(row.count || 0);
  }

  async listRecords({ search = "", limit = 50, offset = 0, detail = "summary" } = {}) {
    const max = clampLimit(limit, 50, 500);
    const skip = clampOffset(offset);
    const selectedFields = detail === "full"
      ? ["id", ...FIELD_NAMES, "created_at", "updated_at"]
      : detail === "table"
        ? ["id", ...FIELD_NAMES.filter(fieldName => fieldName !== "picture_data" && !FAMILY_FIELDS.includes(fieldName)), "created_at", "updated_at"]
        : SUMMARY_FIELDS;
    const columns = selectedFields.map(quoted).join(", ");

    if (!search.trim()) {
      return rows(await this.execute(
        `SELECT ${columns} FROM beneficiaries ORDER BY updated_at DESC, id DESC LIMIT ? OFFSET ?`,
        [max, skip]
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
        LIMIT ? OFFSET ?
      `,
      [pattern, pattern, pattern, pattern, pattern, pattern, max, skip]
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

  async countDeletedRecords() {
    const row = plainRow((await this.execute("SELECT COUNT(*) AS count FROM deleted_records")).rows[0]) || {};
    return Number(row.count || 0);
  }

  async listDeletedRecords({ limit = 100, offset = 0 } = {}) {
    const max = clampLimit(limit, 100, 500);
    const skip = clampOffset(offset);

    return rows(await this.execute(`
      SELECT id, original_id, control_no, display_name, deleted_at
      FROM deleted_records
      ORDER BY deleted_at DESC, id DESC
      LIMIT ? OFFSET ?
    `, [max, skip]));
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

  monitoringReportFilters({ search = "", beneficiaryId = "" } = {}) {
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

    return {
      where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
      args
    };
  }

  async countMonitoringReports(options = {}) {
    const { where, args } = this.monitoringReportFilters(options);
    const row = plainRow((await this.execute(`SELECT COUNT(*) AS count FROM monitoring_reports ${where}`, args)).rows[0]) || {};
    return Number(row.count || 0);
  }

  async listMonitoringReports({ search = "", beneficiaryId = "", limit = 200, offset = 0 } = {}) {
    const max = clampLimit(limit, 200, 500);
    const skip = clampOffset(offset);
    const { where, args } = this.monitoringReportFilters({ search, beneficiaryId });

    return rows(await this.execute(
      `
        SELECT *
        FROM monitoring_reports
        ${where}
        ORDER BY report_month DESC, updated_at DESC, id DESC
        LIMIT ? OFFSET ?
      `,
      [...args, max, skip]
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

  async listNutritionCenters({ search = "", limit = 200, offset = 0 } = {}) {
    const max = clampLimit(limit, 200, 500);
    const skip = clampOffset(offset);
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
        LIMIT ? OFFSET ?
      `,
      [...args, max, skip]
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

  nutritionBeneficiaryListSelect() {
    return `
      SELECT b.id,
             b.center_id,
             b.beneficiary_no,
             b.feeding_center,
             b.child_last_name,
             b.child_first_name,
             b.child_middle_name,
             b.birth_date,
             b.age,
             b.gender,
             b.school,
             b.grade_level,
             b.mother_name,
             b.father_name,
             b.contact_no,
             b.profile_status,
             b.remarks,
             b.current_update_date,
             b.current_age_months,
             b.current_weight_kg,
             b.current_height_cm,
             b.current_nutrition_status,
             b.updated_at,
             c.center_name AS center_name,
             c.location AS center_location
      FROM nutrition_beneficiaries b
      LEFT JOIN nutrition_centers c ON c.id = b.center_id
    `;
  }

  nutritionBeneficiaryFilters({ search = "", centerId = "" } = {}) {
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

    return {
      where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
      args
    };
  }

  async countNutritionBeneficiaries(options = {}) {
    const { where, args } = this.nutritionBeneficiaryFilters(options);
    const row = plainRow((await this.execute(
      `
        SELECT COUNT(*) AS count
        FROM nutrition_beneficiaries b
        LEFT JOIN nutrition_centers c ON c.id = b.center_id
        ${where}
      `,
      args
    )).rows[0]) || {};
    return Number(row.count || 0);
  }

  async listNutritionBeneficiaries({ search = "", centerId = "", limit = 200, offset = 0 } = {}) {
    const max = clampLimit(limit, 200, 500);
    const skip = clampOffset(offset);
    const { where, args } = this.nutritionBeneficiaryFilters({ search, centerId });

    return rows(await this.execute(
      `
        ${this.nutritionBeneficiaryListSelect()}
        ${where}
        ORDER BY b.updated_at DESC, b.id DESC
        LIMIT ? OFFSET ?
      `,
      [...args, max, skip]
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

  nutritionGrowthReportFilters({ search = "", centerId = "" } = {}) {
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

    return {
      where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
      args
    };
  }

  async countNutritionGrowthReports(options = {}) {
    const { where, args } = this.nutritionGrowthReportFilters(options);
    const row = plainRow((await this.execute(`SELECT COUNT(*) AS count FROM nutrition_growth_reports r ${where}`, args)).rows[0]) || {};
    return Number(row.count || 0);
  }

  async listNutritionGrowthReports({ search = "", centerId = "", limit = 200, offset = 0 } = {}) {
    const max = clampLimit(limit, 200, 500);
    const skip = clampOffset(offset);
    const { where, args } = this.nutritionGrowthReportFilters({ search, centerId });

    return rows(await this.execute(
      `
        ${this.nutritionGrowthReportSelect()}
        ${where}
        GROUP BY r.id
        ORDER BY r.report_month DESC, r.updated_at DESC, r.id DESC
        LIMIT ? OFFSET ?
      `,
      [...args, max, skip]
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
      previous_record_date: "",
      previous_height_cm: "",
      previous_weight_kg: "",
      previous_cgs_classification: ""
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

  nutritionFinancialReportSummarySelect() {
    return `
      SELECT r.*,
        COUNT(e.id) AS line_count,
        COALESCE(SUM(e.viands), 0) AS viands_total,
        COALESCE(SUM(e.milk), 0) AS milk_total,
        COALESCE(SUM(e.rice), 0) AS rice_total,
        COALESCE(SUM(e.gas), 0) AS gas_total,
        COALESCE(SUM(e.mineral_water), 0) AS mineral_water_total,
        COALESCE(SUM(e.utilities), 0) AS utilities_total,
        COALESCE(SUM(e.others), 0) AS others_total
      FROM nutrition_financial_reports r
      LEFT JOIN nutrition_financial_entries e ON e.report_id = r.id
    `;
  }

  nutritionFinancialFilters({ search = "", centerId = "", year = "" } = {}) {
    const conditions = [];
    const args = [];
    const term = String(search || "").trim().toLowerCase();
    if (term) {
      const pattern = `%${term}%`;
      conditions.push("(lower(r.center_name) LIKE ? OR lower(r.report_month) LIKE ? OR lower(r.submitted_date) LIKE ?)");
      args.push(pattern, pattern, pattern);
    }
    if (Number(centerId)) {
      conditions.push("r.center_id = ?");
      args.push(Number(centerId));
    }
    if (String(year || "").trim()) {
      conditions.push("substr(r.report_month, 1, 4) = ?");
      args.push(String(Number(year)));
    }
    return { where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "", args };
  }

  async countNutritionFinancialReports(filters = {}) {
    const { where, args } = this.nutritionFinancialFilters(filters);
    const row = plainRow((await this.execute(`SELECT COUNT(*) AS count FROM nutrition_financial_reports r ${where}`, args)).rows[0]) || {};
    return Number(row.count || 0);
  }

  async listNutritionFinancialReports({ search = "", centerId = "", year = "", limit = 200, offset = 0 } = {}) {
    const { where, args } = this.nutritionFinancialFilters({ search, centerId, year });
    const result = await this.execute(`
      ${this.nutritionFinancialReportSummarySelect()}
      ${where}
      GROUP BY r.id
      ORDER BY r.report_month DESC, r.center_name, r.id DESC
      LIMIT ? OFFSET ?
    `, [...args, clampLimit(limit, 200, 500), clampOffset(offset)]);
    return rows(result).map(report => decorateNutritionFinancialReport(report));
  }

  async getNutritionFinancialReport(id) {
    const report = plainRow((await this.execute("SELECT * FROM nutrition_financial_reports WHERE id = ?", [Number(id)])).rows[0]);
    if (!report) return null;
    const entries = rows(await this.execute(
      "SELECT * FROM nutrition_financial_entries WHERE report_id = ? ORDER BY row_order, id",
      [Number(id)]
    ));
    return decorateNutritionFinancialReport(report, entries);
  }

  async saveNutritionFinancialReport(input = {}) {
    const id = Number(input.id || 0) || 0;
    const existing = id ? await this.getNutritionFinancialReport(id) : null;
    const centerId = Number(input.center_id || input.centerId || existing?.center_id || 0) || 0;
    const center = centerId ? await this.getNutritionCenter(centerId) : null;
    if (!center) throw new Error("Select a valid feeding center.");
    const report = normalizeNutritionFinancialReport(input, center, existing);
    if (!report.report_month) throw new Error("Report month is required.");

    const duplicate = plainRow((await this.execute(
      "SELECT id FROM nutrition_financial_reports WHERE center_id = ? AND report_month = ? AND id <> ?",
      [report.center_id, report.report_month, id]
    )).rows[0]);
    if (duplicate) throw new Error("A financial report already exists for this center and month.");

    const timestamp = nowIso();
    let reportId = id;
    const reportValues = [
      report.center_id, report.center_name, report.submitted_date, report.report_month,
      report.beginning_balance, report.cash_receipts, report.prepared_by, report.prepared_title,
      report.noted_by, report.noted_title
    ];

    if (existing) {
      await this.execute(`
        UPDATE nutrition_financial_reports
        SET center_id = ?, center_name = ?, submitted_date = ?, report_month = ?,
            beginning_balance = ?, cash_receipts = ?, prepared_by = ?, prepared_title = ?,
            noted_by = ?, noted_title = ?, updated_at = ?
        WHERE id = ?
      `, [...reportValues, timestamp, reportId]);
    } else {
      const result = await this.execute(`
        INSERT INTO nutrition_financial_reports (
          center_id, center_name, submitted_date, report_month, beginning_balance, cash_receipts,
          prepared_by, prepared_title, noted_by, noted_title, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [...reportValues, timestamp, timestamp]);
      reportId = result.lastInsertRowid ? Number(result.lastInsertRowid) : 0;
    }

    await this.executeBatch([
      { sql: "DELETE FROM nutrition_financial_entries WHERE report_id = ?", args: [reportId] },
      ...report.entries.map((entry, index) => ({
        sql: `
          INSERT INTO nutrition_financial_entries (
            report_id, row_order, entry_date, rep_no, particulars, cv_no,
            viands, milk, rice, gas, mineral_water, utilities, others
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          reportId, index, entry.entry_date, entry.rep_no, entry.particulars, entry.cv_no,
          entry.viands, entry.milk, entry.rice, entry.gas, entry.mineral_water, entry.utilities, entry.others
        ]
      }))
    ], "write");

    return this.getNutritionFinancialReport(reportId);
  }

  async deleteNutritionFinancialReport(id) {
    const report = await this.getNutritionFinancialReport(id);
    if (!report) throw new Error("Financial report was not found.");
    await this.execute("DELETE FROM nutrition_financial_reports WHERE id = ?", [Number(id)]);
    return report;
  }

  async listNutritionFinancialBudgets({ year = new Date().getFullYear(), centerId = "" } = {}) {
    const conditions = ["b.budget_year = ?"];
    const args = [Number(year) || new Date().getFullYear()];
    if (Number(centerId)) {
      conditions.push("b.center_id = ?");
      args.push(Number(centerId));
    }
    const result = await this.execute(`
      SELECT b.* FROM nutrition_financial_budgets b
      WHERE ${conditions.join(" AND ")}
      ORDER BY b.center_name, b.id
    `, args);
    return rows(result).map(budget => normalizeNutritionFinancialBudget(budget));
  }

  async saveNutritionFinancialBudgets(input = {}) {
    const budgetYear = Number(input.year || input.budget_year) || new Date().getFullYear();
    const rawBudgets = Array.isArray(input.budgets) ? input.budgets : [input];
    const statements = [];
    const timestamp = nowIso();

    for (const item of rawBudgets) {
      const center = await this.getNutritionCenter(item.center_id || item.centerId);
      if (!center) throw new Error("A budget row references an invalid feeding center.");
      const budget = normalizeNutritionFinancialBudget({ ...item, budget_year: budgetYear }, center);
      statements.push({
        sql: `
          INSERT INTO nutrition_financial_budgets (
            center_id, center_name, budget_year, feeding_days, approved_budget_per_child,
            viands, milk, rice, gas, mineral_water, utilities, others, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(center_id, budget_year) DO UPDATE SET
            center_name = excluded.center_name,
            feeding_days = excluded.feeding_days,
            approved_budget_per_child = excluded.approved_budget_per_child,
            viands = excluded.viands,
            milk = excluded.milk,
            rice = excluded.rice,
            gas = excluded.gas,
            mineral_water = excluded.mineral_water,
            utilities = excluded.utilities,
            others = excluded.others,
            notes = excluded.notes,
            updated_at = excluded.updated_at
        `,
        args: [
          budget.center_id, budget.center_name, budget.budget_year, budget.feeding_days, budget.approved_budget_per_child,
          budget.viands, budget.milk, budget.rice, budget.gas, budget.mineral_water,
          budget.utilities, budget.others, budget.notes, timestamp, timestamp
        ]
      });
    }

    if (statements.length) await this.executeBatch(statements, "write");
    return this.listNutritionFinancialBudgets({ year: budgetYear });
  }

  async nutritionFinancialSummary({ year = new Date().getFullYear() } = {}) {
    const summaryYear = Number(year) || new Date().getFullYear();
    const [centers, reports, budgets] = await Promise.all([
      this.listNutritionCenters({ limit: 500 }),
      this.listNutritionFinancialReports({ year: summaryYear, limit: 500 }),
      this.listNutritionFinancialBudgets({ year: summaryYear })
    ]);
    return buildNutritionFinancialSummaryPayload({ year: summaryYear, centers, reports, budgets });
  }

  async exportNutritionFinancialReports() {
    const reportIds = rows(await this.execute(
      "SELECT id FROM nutrition_financial_reports ORDER BY report_month DESC, center_name"
    ));
    const detailed = [];
    for (const report of reportIds) detailed.push(await this.getNutritionFinancialReport(report.id));
    return detailed;
  }

  async countNutritionRecipes({ search = "" } = {}) {
    const term = String(search || "").trim().toLowerCase();
    const result = term
      ? await this.execute(`
          SELECT COUNT(*) AS count FROM nutrition_recipes
          WHERE lower(recipe_name) LIKE ? OR lower(description) LIKE ?
        `, [`%${term}%`, `%${term}%`])
      : await this.execute("SELECT COUNT(*) AS count FROM nutrition_recipes");
    return Number(plainRow(result.rows[0])?.count || 0);
  }

  async listNutritionRecipes({ search = "", limit = 100, offset = 0 } = {}) {
    const term = String(search || "").trim().toLowerCase();
    const where = term ? "WHERE lower(r.recipe_name) LIKE ? OR lower(r.description) LIKE ?" : "";
    const args = term ? [`%${term}%`, `%${term}%`] : [];
    const result = await this.execute(`
      SELECT r.*, COUNT(i.id) AS ingredient_count, COALESCE(SUM(i.default_cost), 0) AS budget_cost
      FROM nutrition_recipes r
      LEFT JOIN nutrition_recipe_ingredients i ON i.recipe_id = r.id
      ${where}
      GROUP BY r.id
      ORDER BY r.recipe_name, r.id
      LIMIT ? OFFSET ?
    `, [...args, clampLimit(limit, 100, 1000), clampOffset(offset)]);
    return rows(result).map(recipe => decorateRecipe(recipe));
  }

  async getNutritionRecipe(id) {
    const recipe = plainRow((await this.execute("SELECT * FROM nutrition_recipes WHERE id = ?", [Number(id)])).rows[0]);
    if (!recipe) return null;
    const ingredients = rows(await this.execute(`
      SELECT * FROM nutrition_recipe_ingredients WHERE recipe_id = ? ORDER BY row_order, id
    `, [Number(id)]));
    return decorateRecipe(recipe, ingredients);
  }

  async findNutritionRecipeByName(name) {
    const row = plainRow((await this.execute("SELECT id FROM nutrition_recipes WHERE recipe_key = ?", [recipeKey(name)])).rows[0]);
    return row ? this.getNutritionRecipe(row.id) : null;
  }

  async saveNutritionRecipe(input = {}) {
    const id = Number(input.id || 0) || 0;
    const existing = id ? await this.getNutritionRecipe(id) : null;
    const recipe = normalizeRecipe(input, existing);
    if (!recipe.recipe_name) throw new Error("Recipe name is required.");
    if (!recipe.ingredients.length) throw new Error("Add at least one ingredient.");
    const duplicate = plainRow((await this.execute(
      "SELECT id FROM nutrition_recipes WHERE recipe_key = ? AND id <> ?",
      [recipe.recipe_key, id]
    )).rows[0]);
    if (duplicate) throw new Error("A recipe with this name already exists.");

    const timestamp = nowIso();
    let recipeId = id;
    if (existing) {
      await this.execute(`
        UPDATE nutrition_recipes SET recipe_name = ?, recipe_key = ?, description = ?,
          base_servings = ?, status = ?, updated_at = ? WHERE id = ?
      `, [recipe.recipe_name, recipe.recipe_key, recipe.description, recipe.base_servings, recipe.status, timestamp, id]);
    } else {
      const result = await this.execute(`
        INSERT INTO nutrition_recipes (
          recipe_name, recipe_key, description, base_servings, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [recipe.recipe_name, recipe.recipe_key, recipe.description, recipe.base_servings, recipe.status, timestamp, timestamp]);
      recipeId = Number(result.lastInsertRowid || 0);
    }

    await this.executeBatch([
      { sql: "DELETE FROM nutrition_recipe_ingredients WHERE recipe_id = ?", args: [recipeId] },
      ...recipe.ingredients.map((item, index) => ({
        sql: `
          INSERT INTO nutrition_recipe_ingredients (
            recipe_id, row_order, ingredient_name, default_quantity, default_cost
          ) VALUES (?, ?, ?, ?, ?)
        `,
        args: [recipeId, index, item.ingredient_name, item.default_quantity, item.default_cost]
      }))
    ], "write");
    return this.getNutritionRecipe(recipeId);
  }

  async deleteNutritionRecipe(id) {
    const recipe = await this.getNutritionRecipe(id);
    if (!recipe) throw new Error("Recipe was not found.");
    await this.execute("DELETE FROM nutrition_recipes WHERE id = ?", [Number(id)]);
    return recipe;
  }

  async countNutritionMenus({ year = "" } = {}) {
    const hasYear = Boolean(String(year || "").trim());
    const result = hasYear
      ? await this.execute("SELECT COUNT(*) AS count FROM nutrition_monthly_menus WHERE substr(menu_month, 1, 4) = ?", [String(Number(year))])
      : await this.execute("SELECT COUNT(*) AS count FROM nutrition_monthly_menus");
    return Number(plainRow(result.rows[0])?.count || 0);
  }

  async listNutritionMenus({ year = "", limit = 60, offset = 0 } = {}) {
    const hasYear = Boolean(String(year || "").trim());
    const result = await this.execute(`
      SELECT m.*, COUNT(e.id) AS meal_count
      FROM nutrition_monthly_menus m
      LEFT JOIN nutrition_monthly_menu_entries e ON e.menu_id = m.id
      ${hasYear ? "WHERE substr(m.menu_month, 1, 4) = ?" : ""}
      GROUP BY m.id
      ORDER BY m.menu_month DESC
      LIMIT ? OFFSET ?
    `, [...(hasYear ? [String(Number(year))] : []), clampLimit(limit, 60, 240), clampOffset(offset)]);
    return rows(result);
  }

  async getNutritionMenu(id) {
    const menu = plainRow((await this.execute("SELECT * FROM nutrition_monthly_menus WHERE id = ?", [Number(id)])).rows[0]);
    if (!menu) return null;
    const entries = rows(await this.execute(`
      SELECT e.*, r.recipe_name FROM nutrition_monthly_menu_entries e
      LEFT JOIN nutrition_recipes r ON r.id = e.recipe_id
      WHERE e.menu_id = ? ORDER BY e.meal_date, e.row_order, e.id
    `, [Number(id)]));
    return { ...menu, entries };
  }

  async getNutritionMenuByMonth(menuMonth) {
    const row = plainRow((await this.execute(
      "SELECT id FROM nutrition_monthly_menus WHERE menu_month = ?", [String(menuMonth || "")]
    )).rows[0]);
    return row ? this.getNutritionMenu(row.id) : null;
  }

  async saveNutritionMenu(input = {}) {
    const id = Number(input.id || 0) || 0;
    const existing = id ? await this.getNutritionMenu(id) : null;
    const menu = normalizeMenu(input, existing);
    if (!menu.menu_month) throw new Error("Menu month is required.");
    const duplicate = plainRow((await this.execute(
      "SELECT id FROM nutrition_monthly_menus WHERE menu_month = ? AND id <> ?", [menu.menu_month, id]
    )).rows[0]);
    if (duplicate) throw new Error("A monthly menu already exists for this month.");

    const timestamp = nowIso();
    let menuId = id;
    if (existing) {
      await this.execute(
        "UPDATE nutrition_monthly_menus SET menu_month = ?, status = ?, notes = ?, updated_at = ? WHERE id = ?",
        [menu.menu_month, menu.status, menu.notes, timestamp, id]
      );
    } else {
      const result = await this.execute(`
        INSERT INTO nutrition_monthly_menus (menu_month, status, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `, [menu.menu_month, menu.status, menu.notes, timestamp, timestamp]);
      menuId = Number(result.lastInsertRowid || 0);
    }
    await this.executeBatch([
      { sql: "DELETE FROM nutrition_monthly_menu_entries WHERE menu_id = ?", args: [menuId] },
      ...menu.entries.map((entry, index) => ({
        sql: `
          INSERT INTO nutrition_monthly_menu_entries (
            menu_id, row_order, meal_date, recipe_id, meal_name, notes
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [menuId, index, entry.meal_date, entry.recipe_id, entry.meal_name, entry.notes]
      }))
    ], "write");
    await this.generateNutritionCostingsForMenu(menuId);
    return this.getNutritionMenu(menuId);
  }

  async deleteNutritionMenu(id) {
    const menu = await this.getNutritionMenu(id);
    if (!menu) throw new Error("Monthly menu was not found.");
    await this.execute("DELETE FROM nutrition_monthly_menus WHERE id = ?", [Number(id)]);
    return menu;
  }

  nutritionCostingFilters({ search = "", centerId = "", month = "" } = {}) {
    const conditions = [];
    const args = [];
    const term = String(search || "").trim().toLowerCase();
    if (term) {
      conditions.push("(lower(c.center_name) LIKE ? OR lower(c.report_month) LIKE ? OR lower(c.status) LIKE ?)");
      args.push(`%${term}%`, `%${term}%`, `%${term}%`);
    }
    if (Number(centerId)) {
      conditions.push("c.center_id = ?");
      args.push(Number(centerId));
    }
    if (String(month || "").trim()) {
      conditions.push("c.report_month = ?");
      args.push(String(month));
    }
    return { where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "", args };
  }

  async countNutritionCostings(filters = {}) {
    const { where, args } = this.nutritionCostingFilters(filters);
    const result = await this.execute(`SELECT COUNT(*) AS count FROM nutrition_menu_costings c ${where}`, args);
    return Number(plainRow(result.rows[0])?.count || 0);
  }

  async listNutritionCostings({ search = "", centerId = "", month = "", limit = 100, offset = 0 } = {}) {
    const { where, args } = this.nutritionCostingFilters({ search, centerId, month });
    const result = await this.execute(`
      SELECT c.*, COUNT(DISTINCT d.id) AS day_count,
        COALESCE(SUM(i.budget_cost), 0) AS budget_food_total,
        COALESCE(SUM(i.actual_cost), 0) AS actual_food_total
      FROM nutrition_menu_costings c
      LEFT JOIN nutrition_menu_costing_days d ON d.costing_id = c.id
      LEFT JOIN nutrition_menu_costing_items i ON i.costing_day_id = d.id
      ${where}
      GROUP BY c.id
      ORDER BY c.week_start DESC, c.center_name, c.id DESC
      LIMIT ? OFFSET ?
    `, [...args, clampLimit(limit, 100, 1000), clampOffset(offset)]);
    return rows(result).map(costing => decorateCosting(costing));
  }

  async getNutritionCosting(id) {
    const costing = plainRow((await this.execute(
      "SELECT * FROM nutrition_menu_costings WHERE id = ?", [Number(id)]
    )).rows[0]);
    if (!costing) return null;
    const dayRows = rows(await this.execute(`
      SELECT * FROM nutrition_menu_costing_days WHERE costing_id = ? ORDER BY meal_date, row_order, id
    `, [Number(id)]));
    const days = [];
    for (const day of dayRows) {
      days.push({
        ...day,
        items: rows(await this.execute(`
          SELECT * FROM nutrition_menu_costing_items WHERE costing_day_id = ? ORDER BY row_order, id
        `, [day.id]))
      });
    }
    return decorateCosting(costing, days);
  }

  async saveNutritionCosting(input = {}) {
    const id = Number(input.id || 0) || 0;
    const existing = id ? await this.getNutritionCosting(id) : null;
    const centerId = Number(input.center_id || input.centerId || existing?.center_id || 0) || 0;
    const center = centerId ? await this.getNutritionCenter(centerId) : null;
    if (!center) throw new Error("Select a valid feeding center.");
    const costing = normalizeCosting({ ...input, center_id: center.id, center_name: center.center_name }, existing);
    if (!costing.week_start) throw new Error("Week start is required.");
    const duplicate = plainRow((await this.execute(
      "SELECT id FROM nutrition_menu_costings WHERE center_id = ? AND week_start = ? AND id <> ?",
      [costing.center_id, costing.week_start, id]
    )).rows[0]);
    if (duplicate) throw new Error("A costing sheet already exists for this center and week.");

    const timestamp = nowIso();
    let costingId = id;
    if (existing) {
      await this.execute(`
        UPDATE nutrition_menu_costings SET center_id = ?, center_name = ?, menu_id = ?, report_month = ?,
          week_start = ?, week_end = ?, no_children = ?, inventory_rice = ?, inventory_manna = ?,
          inventory_vitameals = ?, budget_released = ?, status = ?, notes = ?, updated_at = ? WHERE id = ?
      `, [
        costing.center_id, costing.center_name, costing.menu_id, costing.report_month,
        costing.week_start, costing.week_end, costing.no_children, costing.inventory_rice, costing.inventory_manna,
        costing.inventory_vitameals, costing.budget_released, costing.status, costing.notes, timestamp, id
      ]);
    } else {
      const result = await this.execute(`
        INSERT INTO nutrition_menu_costings (
          center_id, center_name, menu_id, report_month, week_start, week_end, no_children,
          inventory_rice, inventory_manna, inventory_vitameals, budget_released, status, notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        costing.center_id, costing.center_name, costing.menu_id, costing.report_month,
        costing.week_start, costing.week_end, costing.no_children, costing.inventory_rice, costing.inventory_manna,
        costing.inventory_vitameals, costing.budget_released, costing.status, costing.notes, timestamp, timestamp
      ]);
      costingId = Number(result.lastInsertRowid || 0);
    }

    const existingDayIds = rows(await this.execute(
      "SELECT id FROM nutrition_menu_costing_days WHERE costing_id = ?", [costingId]
    )).map(row => Number(row.id));
    const statements = [];
    if (existingDayIds.length) {
      statements.push({
        sql: `DELETE FROM nutrition_menu_costing_items WHERE costing_day_id IN (${existingDayIds.map(() => "?").join(",")})`,
        args: existingDayIds
      });
    }
    statements.push({ sql: "DELETE FROM nutrition_menu_costing_days WHERE costing_id = ?", args: [costingId] });
    if (statements.length) await this.executeBatch(statements, "write");

    for (let dayIndex = 0; dayIndex < costing.days.length; dayIndex += 1) {
      const day = costing.days[dayIndex];
      const dayResult = await this.execute(`
        INSERT INTO nutrition_menu_costing_days (
          costing_id, row_order, meal_date, recipe_id, meal_name, kids_present
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [costingId, dayIndex, day.meal_date, day.recipe_id, day.meal_name, day.kids_present]);
      const dayId = Number(dayResult.lastInsertRowid || 0);
      if (day.items.length) {
        await this.executeBatch(day.items.map((item, itemIndex) => ({
          sql: `
            INSERT INTO nutrition_menu_costing_items (
              costing_day_id, recipe_ingredient_id, row_order, ingredient_name, budget_quantity,
              budget_cost, actual_quantity, actual_cost
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            dayId, item.recipe_ingredient_id, itemIndex, item.ingredient_name, item.budget_quantity,
            item.budget_cost, item.actual_quantity, item.actual_cost
          ]
        })), "write");
      }
    }
    return this.getNutritionCosting(costingId);
  }

  async deleteNutritionCosting(id) {
    const costing = await this.getNutritionCosting(id);
    if (!costing) throw new Error("Menu costing sheet was not found.");
    await this.execute("DELETE FROM nutrition_menu_costings WHERE id = ?", [Number(id)]);
    return costing;
  }

  async generateNutritionCostingsForMenu(menuId) {
    const menu = await this.getNutritionMenu(menuId);
    if (!menu) throw new Error("Monthly menu was not found.");
    const centers = await this.listNutritionCenters({ limit: 500 });
    const weeks = groupMenuEntriesByWeek(menu.entries);
    const recipeIds = [...new Set(menu.entries.map(entry => Number(entry.recipe_id || 0)).filter(Boolean))];
    const recipes = new Map();
    for (const recipeId of recipeIds) recipes.set(recipeId, await this.getNutritionRecipe(recipeId));
    let generated = 0;

    for (const center of centers) {
      const budget = plainRow((await this.execute(`
        SELECT approved_budget_per_child FROM nutrition_financial_budgets
        WHERE center_id = ? AND budget_year = ?
      `, [center.id, Number(menu.menu_month.slice(0, 4))])).rows[0]);
      for (const week of weeks) {
        const existingRow = plainRow((await this.execute(`
          SELECT id FROM nutrition_menu_costings WHERE center_id = ? AND week_start = ?
        `, [center.id, week.week_start])).rows[0]);
        const existing = existingRow ? await this.getNutritionCosting(existingRow.id) : null;
        if (existing && String(existing.status).toLowerCase() === "submitted") continue;
        const actualByKey = new Map();
        (existing?.days || []).forEach(day => day.items.forEach(item => {
          actualByKey.set(`${day.meal_date}|${String(item.ingredient_name).trim().toLowerCase()}`, item);
        }));
        const days = [];
        for (let dayIndex = 0; dayIndex < week.entries.length; dayIndex += 1) {
          const entry = week.entries[dayIndex];
          const recipe = entry.recipe_id
            ? recipes.get(Number(entry.recipe_id))
            : await this.findNutritionRecipeByName(entry.meal_name);
          days.push({
            meal_date: entry.meal_date,
            recipe_id: recipe?.id || entry.recipe_id || null,
            meal_name: entry.meal_name || recipe?.recipe_name || "",
            kids_present: existing?.days?.find(day => day.meal_date === entry.meal_date)?.kids_present || 0,
            row_order: dayIndex,
            items: (recipe?.ingredients || []).map((ingredient, itemIndex) => {
              const actual = actualByKey.get(`${entry.meal_date}|${ingredient.ingredient_name.trim().toLowerCase()}`);
              return {
                recipe_ingredient_id: ingredient.id,
                ingredient_name: ingredient.ingredient_name,
                budget_quantity: ingredient.default_quantity,
                budget_cost: ingredient.default_cost,
                actual_quantity: actual?.actual_quantity || "",
                actual_cost: actual?.actual_cost || 0,
                row_order: itemIndex
              };
            })
          });
        }
        const children = Number(existing?.no_children || center.capacity || 0);
        for (const day of days) {
          const recipe = day.recipe_id ? recipes.get(Number(day.recipe_id)) || await this.getNutritionRecipe(day.recipe_id) : null;
          const scale = recipe?.base_servings && children ? children / recipe.base_servings : 1;
          day.items = day.items.map(item => {
            const budget = scalePurchaseBudget({
              ingredientName: item.ingredient_name,
              quantity: item.budget_quantity,
              cost: item.budget_cost,
              factor: scale
            });
            return {
              ...item,
              budget_quantity: budget.quantity,
              budget_cost: budget.cost
            };
          });
        }
        const released = Number(budget?.approved_budget_per_child || 0) * children * days.length;
        await this.saveNutritionCosting({
          ...existing,
          center_id: center.id,
          center_name: center.center_name,
          menu_id: menu.id,
          report_month: menu.menu_month,
          week_start: week.week_start,
          week_end: week.week_end,
          no_children: children,
          budget_released: released || existing?.budget_released || days.reduce(
            (sum, day) => sum + day.items.reduce((daySum, item) => daySum + item.budget_cost, 0), 0
          ),
          status: existing?.status || "Draft",
          days
        });
        generated += 1;
      }
    }
    return { menu: await this.getNutritionMenu(menu.id), generated };
  }

  async exportNutritionMenus() {
    const menuIds = rows(await this.execute("SELECT id FROM nutrition_monthly_menus ORDER BY menu_month"));
    const detailed = [];
    for (const row of menuIds) detailed.push(await this.getNutritionMenu(row.id));
    return detailed;
  }

  async exportNutritionCostings() {
    const costingIds = rows(await this.execute("SELECT id FROM nutrition_menu_costings ORDER BY week_start, center_name"));
    const detailed = [];
    for (const row of costingIds) detailed.push(await this.getNutritionCosting(row.id));
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

  async nutritionDashboardSummary() {
    const stats = plainRow((await this.execute(`
      SELECT
        (SELECT COUNT(*) FROM nutrition_centers) AS centers,
        (SELECT COUNT(*) FROM nutrition_centers WHERE lower(COALESCE(status, '')) = 'active') AS activeCenters,
        (SELECT COUNT(*) FROM nutrition_beneficiaries) AS beneficiaries,
        (
          SELECT COUNT(*)
          FROM nutrition_beneficiaries
          WHERE lower(COALESCE(remarks, '')) = 'active'
             OR lower(COALESCE(profile_status, '')) = 'active'
        ) AS activeBeneficiaries,
        (SELECT COUNT(*) FROM nutrition_growth_reports) AS growthReports
    `)).rows[0]) || {};

    const centerCounts = rows(await this.execute(`
      SELECT
        COALESCE(NULLIF(trim(b.feeding_center), ''), NULLIF(trim(c.center_name), ''), 'No Center') AS label,
        COUNT(*) AS count
      FROM nutrition_beneficiaries b
      LEFT JOIN nutrition_centers c ON c.id = b.center_id
      GROUP BY label
      ORDER BY count DESC, label
      LIMIT 8
    `));

    const nutritionStatusCounts = rows(await this.execute(`
      SELECT COALESCE(NULLIF(trim(current_nutrition_status), ''), 'Not Specified') AS label,
             COUNT(*) AS count
      FROM nutrition_beneficiaries
      GROUP BY label
      ORDER BY count DESC, label
      LIMIT 8
    `));

    return {
      stats: {
        centers: Number(stats.centers || 0),
        activeCenters: Number(stats.activeCenters || 0),
        beneficiaries: Number(stats.beneficiaries || 0),
        activeBeneficiaries: Number(stats.activeBeneficiaries || 0),
        growthReports: Number(stats.growthReports || 0)
      },
      analytics: {
        centerCounts,
        nutritionStatusCounts
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
      nutritionFinancialReports: await this.exportNutritionFinancialReports(),
      nutritionFinancialBudgets: rows(await this.execute("SELECT * FROM nutrition_financial_budgets ORDER BY budget_year DESC, center_name")),
      nutritionRecipes: await this.listNutritionRecipes({ limit: 500 }),
      nutritionMonthlyMenus: await this.exportNutritionMenus(),
      nutritionMenuCostings: await this.exportNutritionCostings(),
      deletedRecords: rows(await this.execute("SELECT * FROM deleted_records ORDER BY deleted_at DESC, id DESC"))
    };
  }
}

module.exports = {
  TursoBeneficiaryDatabase
};
