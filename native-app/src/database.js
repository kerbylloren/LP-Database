const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");
const { FIELD_NAMES, SUMMARY_FIELDS } = require("./metadata");
const {
  calculateAgeMonths,
  cgsReferencePayload,
  classifyCgs,
  normalizeReportMonth,
  parseMeasurementNumber
} = require("./nutrition-cgs");

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
const UPPERCASE_TERMS = new Set([
  "ALS",
  "BPI",
  "ICC",
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
const DEFAULT_SUPERADMIN_USERNAME = process.env.LPDB_SUPERADMIN_USERNAME || "superadmin";
const DEFAULT_SUPERADMIN_PASSWORD = process.env.LPDB_SUPERADMIN_PASSWORD || "ChangeMe123!";
const PASSWORD_ITERATIONS = 210000;
const PASSWORD_KEY_LENGTH = 32;
const PASSWORD_DIGEST = "sha256";
const NUTRITION_CENTER_FIELDS = [
  "center_name",
  "location",
  "coordinator",
  "contact_no",
  "capacity",
  "status",
  "notes"
];
const NUTRITION_BENEFICIARY_FIELDS = [
  "center_id",
  "beneficiary_no",
  "feeding_center",
  "picture_data",
  "child_last_name",
  "child_first_name",
  "child_middle_name",
  "birth_date",
  "age",
  "gender",
  "home_address",
  "school",
  "grade_level",
  "mother_name",
  "mother_occupation",
  "father_name",
  "father_occupation",
  "contact_no",
  "sibling_count",
  "birth_order",
  "admission_date",
  "profile_status",
  "remarks",
  "initial_age_months",
  "initial_weight_kg",
  "initial_height_cm",
  "initial_nutrition_status",
  "current_update_date",
  "current_age_months",
  "current_weight_kg",
  "current_height_cm",
  "current_nutrition_status"
];
const NUTRITION_HOUSEHOLD_FIELDS = [
  "member_name",
  "age",
  "relationship",
  "occupation"
];
const NUTRITION_GROWTH_REPORT_FIELDS = [
  "center_id",
  "center_name",
  "submitted_date",
  "report_month"
];
const NUTRITION_GROWTH_ENTRY_FIELDS = [
  "report_id",
  "beneficiary_id",
  "beneficiary_no",
  "beneficiary_name",
  "gender",
  "birth_date",
  "age_months",
  "height_cm",
  "weight_kg",
  "height_change_cm",
  "weight_change_kg",
  "cgs_classification",
  "previous_record_date",
  "previous_height_cm",
  "previous_weight_kg",
  "previous_cgs_classification",
  "row_order"
];

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

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .pbkdf2Sync(String(password || ""), salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST)
    .toString("hex");

  return `pbkdf2:${PASSWORD_DIGEST}:${PASSWORD_ITERATIONS}:${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [scheme, digest, iterations, salt, expected] = String(storedHash || "").split(":");

  if (scheme !== "pbkdf2" || !digest || !iterations || !salt || !expected) return false;

  const candidate = crypto
    .pbkdf2Sync(String(password || ""), salt, Number(iterations), Buffer.from(expected, "hex").length, digest)
    .toString("hex");

  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(expected, "hex"));
}

function normalizeRecord(input = {}) {
  const output = {};

  FIELD_NAMES.forEach(fieldName => {
    output[fieldName] = normalizeFieldValue(fieldName, input[fieldName]);
  });

  if (!output.current_group) output.current_group = output.livelihood_interest;
  if (!output.date_updated) output.date_updated = todayDate();
  if (!output.status) output.status = "Active";
  output.control_no = output.control_no.trim();
  sortRecordFamilyFields(output);

  return output;
}

function normalizeAmount(value) {
  const number = Number(normalizeText(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function normalizePositiveIntegerText(value, maxLength = 3) {
  return normalizeText(value).replace(/[^\d]/g, "").slice(0, maxLength);
}

function normalizeDecimalText(value) {
  const text = normalizeText(value).replace(/[^\d.]/g, "");
  if (!text) return "";

  const number = Number(text);
  return Number.isFinite(number) ? String(number) : "";
}

function normalizeProfileDate(value) {
  const text = normalizeText(value).trim();
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

function parseProfileDate(value) {
  const normalized = normalizeProfileDate(value);
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(normalized);
  if (!match) return null;

  const date = new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function calculateAgeYearsText(value, referenceDate = new Date()) {
  const birthDate = parseProfileDate(value);
  if (!birthDate) return "";

  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const beforeBirthday = referenceDate.getMonth() < birthDate.getMonth()
    || (referenceDate.getMonth() === birthDate.getMonth() && referenceDate.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 130 ? String(age) : "";
}

function splitRecordLines(value) {
  return normalizeText(value)
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean);
}

function ageSortNumber(value) {
  const text = normalizePositiveIntegerText(value);
  if (!text) return null;

  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function compareRowsByAgeDesc(left, right, ageField = "age") {
  const leftAge = ageSortNumber(left?.[ageField]);
  const rightAge = ageSortNumber(right?.[ageField]);

  if (leftAge !== null && rightAge !== null && leftAge !== rightAge) return rightAge - leftAge;
  if (leftAge !== null && rightAge === null) return -1;
  if (leftAge === null && rightAge !== null) return 1;

  const leftName = normalizeText(left?.member_name || left?.list_a18).toLowerCase();
  const rightName = normalizeText(right?.member_name || right?.list_a18).toLowerCase();
  return leftName.localeCompare(rightName);
}

function sortRecordFamilyFields(record) {
  const columns = FAMILY_FIELDS.reduce((items, fieldName) => {
    items[fieldName] = splitRecordLines(record[fieldName]);
    return items;
  }, {});
  const rowCount = Math.max(0, ...FAMILY_FIELDS.map(fieldName => columns[fieldName].length));
  if (!rowCount) return record;

  const rows = Array.from({ length: rowCount }, (_, index) => {
    return FAMILY_FIELDS.reduce((row, fieldName) => {
      row[fieldName] = columns[fieldName][index] || "";
      return row;
    }, {});
  })
    .filter(row => rowHasValue(row, FAMILY_FIELDS))
    .sort((left, right) => compareRowsByAgeDesc(left, right, "list_c18"));

  FAMILY_FIELDS.forEach(fieldName => {
    record[fieldName] = rows.map(row => row[fieldName] || "-").join("\n");
  });

  return record;
}

function normalizeMonitoringText(value) {
  return titleCaseValue(value);
}

function sentenceCaseValue(value) {
  const text = normalizeText(value).trim().toLowerCase();
  if (!text) return "";

  return text.replace(/(^|[.!?]\s+|\n+\s*)([a-z])/g, (match, prefix, letter) => {
    return `${prefix}${letter.toUpperCase()}`;
  });
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
  const displayBeneficiaryName = normalizeMonitoringText(input.beneficiary_name || beneficiaryName);

  return {
    id: Number(input.id || 0) || 0,
    beneficiary_id: beneficiaryId,
    control_no: normalizeText(input.control_no || beneficiary?.control_no).trim(),
    beneficiary_name: displayBeneficiaryName,
    chapel: normalizeMonitoringText(input.chapel || beneficiary?.field_c12),
    contact_no: normalizeContactNumber(input.contact_no || beneficiary?.field_l11),
    project_type: normalizeMonitoringText(input.project_type || ""),
    report_month: normalizeText(input.report_month).trim(),
    forwarded_balance: forwardedBalance,
    total_sales: totalSales,
    total_expenses: totalExpenses,
    net_income: forwardedBalance + totalSales - totalExpenses,
    challenges: sentenceCaseValue(input.challenges),
    success_stories: sentenceCaseValue(input.success_stories),
    prepared_by: normalizeMonitoringText(input.prepared_by || displayBeneficiaryName),
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

function nutritionBeneficiaryName(record = {}) {
  return [record.child_last_name, record.child_first_name, record.child_middle_name]
    .filter(Boolean)
    .join(", ") || record.beneficiary_no;
}

function normalizeNutritionCenter(input = {}) {
  return {
    id: Number(input.id || 0) || 0,
    center_name: titleCaseValue(input.center_name || input.centerName),
    location: titleCaseValue(input.location),
    coordinator: titleCaseValue(input.coordinator),
    contact_no: normalizeContactNumber(input.contact_no || input.contactNo),
    capacity: Number(normalizePositiveIntegerText(input.capacity, 5)) || 0,
    status: titleCaseValue(input.status || "Active") || "Active",
    notes: titleCaseValue(input.notes)
  };
}

function normalizeNutritionHouseholdMembers(rows = []) {
  return mergeNutritionHouseholdMembers(Array.isArray(rows) ? rows : []);
}

function nutritionHouseholdMemberKey(row = {}) {
  const relationship = titleCaseValue(row.relationship).toLowerCase();
  const name = titleCaseValue(row.member_name || row.memberName).toLowerCase();

  if (relationship === "father" || relationship === "mother") return `parent:${relationship}`;
  if (name) return `name:${name}`;
  return relationship ? `relationship:${relationship}:${titleCaseValue(row.occupation).toLowerCase()}` : "";
}

function mergeNutritionHouseholdMembers(...rowGroups) {
  const merged = new Map();

  rowGroups.flat()
    .filter(Boolean)
    .map(row => ({
      member_name: titleCaseValue(row.member_name || row.memberName),
      age: normalizePositiveIntegerText(row.age),
      relationship: titleCaseValue(row.relationship),
      occupation: titleCaseValue(row.occupation)
    }))
    .filter(row => rowHasValue(row, NUTRITION_HOUSEHOLD_FIELDS))
    .forEach(row => {
      const key = nutritionHouseholdMemberKey(row);
      if (!key) return;

      const existing = merged.get(key);
      merged.set(key, existing
        ? {
            member_name: existing.member_name || row.member_name,
            age: existing.age || row.age,
            relationship: existing.relationship || row.relationship,
            occupation: existing.occupation || row.occupation
          }
        : row);
    });

  return [...merged.values()].sort(compareRowsByAgeDesc);
}

function ensureNutritionParentHouseholdMembers(beneficiary, rows = []) {
  const prepared = normalizeNutritionHouseholdMembers(rows);

  const upsertParent = (relationship, name, occupation) => {
    const parentName = titleCaseValue(name);
    const parentOccupation = titleCaseValue(occupation);
    if (!parentName && !parentOccupation) return;

    const index = prepared.findIndex(row => {
      return titleCaseValue(row.relationship).toLowerCase() === relationship.toLowerCase()
        || (parentName && titleCaseValue(row.member_name).toLowerCase() === parentName.toLowerCase());
    });

    const parentRow = {
      member_name: parentName,
      age: index >= 0 ? prepared[index].age : "",
      relationship,
      occupation: parentOccupation || (index >= 0 ? prepared[index].occupation : "")
    };

    if (index >= 0) prepared[index] = parentRow;
    else prepared.push(parentRow);
  };

  upsertParent("Mother", beneficiary.mother_name, beneficiary.mother_occupation);
  upsertParent("Father", beneficiary.father_name, beneficiary.father_occupation);

  return mergeNutritionHouseholdMembers(prepared);
}

function normalizeNutritionBeneficiary(input = {}, center = null) {
  const centerId = Number(input.center_id || input.centerId || center?.id || 0) || null;
  const birthDate = normalizeProfileDate(input.birth_date || input.birthDate);

  const beneficiary = {
    id: Number(input.id || 0) || 0,
    center_id: centerId,
    beneficiary_no: normalizeText(input.beneficiary_no || input.beneficiaryNo).trim(),
    feeding_center: titleCaseValue(input.feeding_center || input.feedingCenter || center?.center_name),
    picture_data: normalizeText(input.picture_data || input.pictureData),
    child_last_name: titleCaseValue(input.child_last_name || input.childLastName),
    child_first_name: titleCaseValue(input.child_first_name || input.childFirstName),
    child_middle_name: titleCaseValue(input.child_middle_name || input.childMiddleName),
    birth_date: birthDate,
    age: calculateAgeYearsText(birthDate),
    gender: titleCaseValue(input.gender),
    home_address: titleCaseValue(input.home_address || input.homeAddress),
    school: titleCaseValue(input.school),
    grade_level: titleCaseValue(input.grade_level || input.gradeLevel),
    mother_name: titleCaseValue(input.mother_name || input.motherName),
    mother_occupation: titleCaseValue(input.mother_occupation || input.motherOccupation),
    father_name: titleCaseValue(input.father_name || input.fatherName),
    father_occupation: titleCaseValue(input.father_occupation || input.fatherOccupation),
    contact_no: normalizeContactNumber(input.contact_no || input.contactNo),
    sibling_count: normalizePositiveIntegerText(input.sibling_count || input.siblingCount, 2),
    birth_order: titleCaseValue(input.birth_order || input.birthOrder),
    admission_date: normalizeProfileDate(input.admission_date || input.admissionDate),
    profile_status: titleCaseValue(input.profile_status || input.profileStatus || "New") || "New",
    remarks: titleCaseValue(input.remarks || "Active") || "Active",
    initial_age_months: normalizePositiveIntegerText(input.initial_age_months || input.initialAgeMonths, 3),
    initial_weight_kg: normalizeDecimalText(input.initial_weight_kg || input.initialWeightKg),
    initial_height_cm: normalizeDecimalText(input.initial_height_cm || input.initialHeightCm),
    initial_nutrition_status: titleCaseValue(input.initial_nutrition_status || input.initialNutritionStatus),
    current_update_date: normalizeProfileDate(input.current_update_date || input.currentUpdateDate),
    current_age_months: normalizePositiveIntegerText(input.current_age_months || input.currentAgeMonths, 3),
    current_weight_kg: normalizeDecimalText(input.current_weight_kg || input.currentWeightKg),
    current_height_cm: normalizeDecimalText(input.current_height_cm || input.currentHeightCm),
    current_nutrition_status: titleCaseValue(input.current_nutrition_status || input.currentNutritionStatus),
    household_members: normalizeNutritionHouseholdMembers(input.household_members || input.householdMembers)
  };

  beneficiary.household_members = ensureNutritionParentHouseholdMembers(beneficiary, beneficiary.household_members);
  return beneficiary;
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
      );

      CREATE INDEX IF NOT EXISTS idx_nutrition_centers_name
        ON nutrition_centers(center_name);

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
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_nutrition_beneficiaries_no
        ON nutrition_beneficiaries(beneficiary_no)
        WHERE beneficiary_no <> '';

      CREATE INDEX IF NOT EXISTS idx_nutrition_beneficiaries_name
        ON nutrition_beneficiaries(child_last_name, child_first_name, child_middle_name);

      CREATE INDEX IF NOT EXISTS idx_nutrition_beneficiaries_center
        ON nutrition_beneficiaries(center_id);

      CREATE TABLE IF NOT EXISTS nutrition_household_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        beneficiary_id INTEGER NOT NULL,
        row_order INTEGER NOT NULL DEFAULT 0,
        member_name TEXT NOT NULL DEFAULT '',
        age TEXT NOT NULL DEFAULT '',
        relationship TEXT NOT NULL DEFAULT '',
        occupation TEXT NOT NULL DEFAULT '',
        FOREIGN KEY (beneficiary_id) REFERENCES nutrition_beneficiaries(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_nutrition_household_beneficiary
        ON nutrition_household_members(beneficiary_id);

      CREATE TABLE IF NOT EXISTS nutrition_growth_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        center_id INTEGER,
        center_name TEXT NOT NULL DEFAULT '',
        submitted_date TEXT NOT NULL DEFAULT '',
        report_month TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (center_id) REFERENCES nutrition_centers(id) ON DELETE SET NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_nutrition_growth_center_month
        ON nutrition_growth_reports(center_id, report_month);

      CREATE INDEX IF NOT EXISTS idx_nutrition_growth_reports_month
        ON nutrition_growth_reports(report_month);

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
      );

      CREATE INDEX IF NOT EXISTS idx_nutrition_growth_entries_report
        ON nutrition_growth_entries(report_id);

      CREATE INDEX IF NOT EXISTS idx_nutrition_growth_entries_beneficiary
        ON nutrition_growth_entries(beneficiary_id);

      CREATE TABLE IF NOT EXISTS app_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL DEFAULT '',
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_app_users_username
        ON app_users(username);
    `);

    this.ensureBeneficiaryColumns();
    this.backfillCurrentGroup();
    this.ensureSuperadmin();
  }

  ensureBeneficiaryColumns() {
    const existingColumns = new Set(
      this.db.prepare("PRAGMA table_info(beneficiaries)").all().map(column => column.name)
    );

    FIELD_NAMES.forEach(fieldName => {
      if (!existingColumns.has(fieldName)) {
        this.db.exec(`ALTER TABLE beneficiaries ADD COLUMN ${quoted(fieldName)} TEXT NOT NULL DEFAULT '';`);
      }
    });
  }

  backfillCurrentGroup() {
    this.db
      .prepare(`
        UPDATE beneficiaries
        SET current_group = livelihood_interest
        WHERE trim(COALESCE(current_group, '')) = ''
          AND trim(COALESCE(livelihood_interest, '')) <> ''
      `)
      .run();
  }

  ensureSuperadmin() {
    const existing = this.db.prepare("SELECT id FROM app_users WHERE role = 'superadmin' LIMIT 1").get();
    if (existing) return;

    const timestamp = nowIso();
    this.db
      .prepare(`
        INSERT INTO app_users (username, display_name, password_hash, role, active, created_at, updated_at)
        VALUES (?, ?, ?, 'superadmin', 1, ?, ?)
      `)
      .run(
        DEFAULT_SUPERADMIN_USERNAME,
        "Superadmin",
        hashPassword(DEFAULT_SUPERADMIN_PASSWORD),
        timestamp,
        timestamp
      );
  }

  close() {
    this.db.close();
  }

  stats() {
    const active = this.db.prepare("SELECT COUNT(*) AS count FROM beneficiaries").get().count;
    const deleted = this.db.prepare("SELECT COUNT(*) AS count FROM deleted_records").get().count;
    const monitoringReports = this.db.prepare("SELECT COUNT(*) AS count FROM monitoring_reports").get().count;
    const nutritionCenters = this.db.prepare("SELECT COUNT(*) AS count FROM nutrition_centers").get().count;
    const nutritionBeneficiaries = this.db.prepare("SELECT COUNT(*) AS count FROM nutrition_beneficiaries").get().count;
    const nutritionGrowthReports = this.db.prepare("SELECT COUNT(*) AS count FROM nutrition_growth_reports").get().count;

    return {
      active,
      deleted,
      monitoringReports,
      nutritionCenters,
      nutritionBeneficiaries,
      nutritionGrowthReports,
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

  authenticateUser(username, password) {
    const user = this.db.prepare("SELECT * FROM app_users WHERE lower(username) = lower(?)").get(
      String(username || "").trim()
    );

    if (!user || !user.active || !verifyPassword(password, user.password_hash)) {
      throw new Error("Invalid username or password.");
    }

    return this.sanitizeUser(user);
  }

  listUsers() {
    return this.db
      .prepare("SELECT * FROM app_users ORDER BY role DESC, username")
      .all()
      .map(user => this.sanitizeUser(user));
  }

  saveUser(input = {}) {
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
      ? this.db.prepare("SELECT * FROM app_users WHERE id = ?").get(id)
      : this.db.prepare("SELECT * FROM app_users WHERE lower(username) = lower(?)").get(username);

    if (!existing && password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    if (existing?.role === "superadmin" && active === 0) {
      throw new Error("The starter superadmin account cannot be deactivated.");
    }

    const duplicate = this.db
      .prepare("SELECT id FROM app_users WHERE lower(username) = lower(?) AND id <> ?")
      .get(username, id || 0);

    if (duplicate) throw new Error("Username already exists.");

    const timestamp = nowIso();

    if (existing) {
      if (password) {
        this.db
          .prepare(`
            UPDATE app_users
            SET username = ?, display_name = ?, password_hash = ?, active = ?, updated_at = ?
            WHERE id = ?
          `)
          .run(username, displayName, hashPassword(password), active, timestamp, existing.id);
      } else {
        this.db
          .prepare(`
            UPDATE app_users
            SET username = ?, display_name = ?, active = ?, updated_at = ?
            WHERE id = ?
          `)
          .run(username, displayName, active, timestamp, existing.id);
      }

      return this.sanitizeUser(this.db.prepare("SELECT * FROM app_users WHERE id = ?").get(existing.id));
    }

    const result = this.db
      .prepare(`
        INSERT INTO app_users (username, display_name, password_hash, role, active, created_at, updated_at)
        VALUES (?, ?, ?, 'user', ?, ?, ?)
      `)
      .run(username, displayName, hashPassword(password), active, timestamp, timestamp);

    return this.sanitizeUser(this.db.prepare("SELECT * FROM app_users WHERE id = ?").get(Number(result.lastInsertRowid)));
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

  getPreviousMonitoringReport(beneficiaryId, reportMonth, excludeId = 0) {
    if (!beneficiaryId || !reportMonth) return null;

    return this.db
      .prepare(`
        SELECT *
        FROM monitoring_reports
        WHERE beneficiary_id = ?
          AND report_month < ?
          AND id <> ?
        ORDER BY report_month DESC, id DESC
        LIMIT 1
      `)
      .get(Number(beneficiaryId), String(reportMonth), Number(excludeId || 0)) || null;
  }

  getMonitoringForwardedBalance({ beneficiaryId = "", reportMonth = "", excludeId = 0 } = {}) {
    const previous = this.getPreviousMonitoringReport(beneficiaryId, reportMonth, excludeId);
    return {
      forwardedBalance: previous ? normalizeAmount(previous.net_income) : 0,
      previousReport: previous
    };
  }

  recomputeMonitoringBalances(beneficiaryId) {
    if (!beneficiaryId) return;

    const rows = this.db
      .prepare(`
        SELECT id, total_sales, total_expenses
        FROM monitoring_reports
        WHERE beneficiary_id = ?
        ORDER BY report_month ASC, id ASC
      `)
      .all(Number(beneficiaryId));
    const update = this.db.prepare(`
      UPDATE monitoring_reports
      SET forwarded_balance = ?,
          net_income = ?,
          updated_at = ?
      WHERE id = ?
    `);
    let forwardedBalance = 0;

    rows.forEach(row => {
      const netIncome = forwardedBalance + normalizeAmount(row.total_sales) - normalizeAmount(row.total_expenses);
      update.run(forwardedBalance, netIncome, nowIso(), row.id);
      forwardedBalance = netIncome;
    });
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

    const carryForward = this.getMonitoringForwardedBalance({
      beneficiaryId: report.beneficiary_id,
      reportMonth: report.report_month,
      excludeId: id || 0
    });
    report.forwarded_balance = carryForward.forwardedBalance;
    report.net_income = report.forwarded_balance + report.total_sales - report.total_expenses;

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

      this.recomputeMonitoringBalances(report.beneficiary_id);
      if (existing?.beneficiary_id && Number(existing.beneficiary_id) !== Number(report.beneficiary_id)) {
        this.recomputeMonitoringBalances(existing.beneficiary_id);
      }
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
    this.recomputeMonitoringBalances(report.beneficiary_id);
    return report;
  }

  exportMonitoringReports() {
    return this.db
      .prepare("SELECT * FROM monitoring_reports ORDER BY report_month DESC, control_no")
      .all()
      .map(report => this.getMonitoringReport(report.id));
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

  listNutritionCenters({ search = "", limit = 200 } = {}) {
    const max = Math.min(Math.max(Number(limit) || 200, 1), 500);
    const pattern = `%${search.trim().toLowerCase()}%`;
    const where = search.trim()
      ? `WHERE lower(c.center_name) LIKE ?
          OR lower(c.location) LIKE ?
          OR lower(c.coordinator) LIKE ?
          OR lower(c.status) LIKE ?`
      : "";
    const args = search.trim() ? [pattern, pattern, pattern, pattern] : [];

    return this.db
      .prepare(`
        ${this.nutritionCenterWithCountsSelect()}
        ${where}
        GROUP BY c.id
        ORDER BY c.center_name, c.id
        LIMIT ?
      `)
      .all(...args, max);
  }

  getNutritionCenter(id) {
    const row = this.db
      .prepare(`
        ${this.nutritionCenterWithCountsSelect()}
        WHERE c.id = ?
        GROUP BY c.id
      `)
      .get(Number(id));
    return row || null;
  }

  saveNutritionCenter(input = {}) {
    const center = normalizeNutritionCenter(input);
    if (!center.center_name) {
      throw new Error("Feeding center name is required.");
    }

    const id = Number(input.id || 0);
    const existing = id ? this.getNutritionCenter(id) : null;
    const timestamp = nowIso();

    if (existing) {
      this.db.exec("BEGIN");
      try {
        this.db
          .prepare(`
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
          `)
          .run(
            center.center_name,
            center.location,
            center.coordinator,
            center.contact_no,
            center.capacity,
            center.status,
            center.notes,
            timestamp,
            existing.id
          );
        this.db
          .prepare(`
            UPDATE nutrition_beneficiaries
            SET feeding_center = ?, updated_at = ?
            WHERE center_id = ?
          `)
          .run(center.center_name, timestamp, existing.id);
        this.db.exec("COMMIT");
      } catch (error) {
        this.db.exec("ROLLBACK");
        throw error;
      }
      return this.getNutritionCenter(existing.id);
    }

    const result = this.db
      .prepare(`
        INSERT INTO nutrition_centers (
          center_name, location, coordinator, contact_no, capacity, status, notes, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        center.center_name,
        center.location,
        center.coordinator,
        center.contact_no,
        center.capacity,
        center.status,
        center.notes,
        timestamp,
        timestamp
      );

    return this.getNutritionCenter(Number(result.lastInsertRowid));
  }

  deleteNutritionCenter(id) {
    const center = this.getNutritionCenter(id);
    if (!center) {
      throw new Error("Feeding center was not found.");
    }

    this.db.prepare("DELETE FROM nutrition_centers WHERE id = ?").run(Number(id));
    return center;
  }

  nextNutritionBeneficiaryNo(year = new Date().getFullYear()) {
    const prefix = `NP-${year}-`;
    const rows = this.db
      .prepare("SELECT beneficiary_no FROM nutrition_beneficiaries WHERE beneficiary_no LIKE ?")
      .all(`${prefix}%`);
    const highest = rows.reduce((max, row) => {
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

  listNutritionBeneficiaries({ search = "", centerId = "", limit = 200 } = {}) {
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
    return this.db
      .prepare(`
        ${this.nutritionBeneficiarySelect()}
        ${where}
        ORDER BY b.updated_at DESC, b.id DESC
        LIMIT ?
      `)
      .all(...args, max);
  }

  getNutritionBeneficiary(id) {
    const row = this.db
      .prepare(`
        ${this.nutritionBeneficiarySelect()}
        WHERE b.id = ?
      `)
      .get(Number(id));
    if (!row) return null;

    return {
      ...row,
      household_members: this.db
        .prepare("SELECT * FROM nutrition_household_members WHERE beneficiary_id = ? ORDER BY row_order, id")
        .all(row.id)
    };
  }

  getNutritionBeneficiaryByNo(beneficiaryNo) {
    const key = String(beneficiaryNo || "").trim();
    if (!key) return null;

    const row = this.db
      .prepare(`
        ${this.nutritionBeneficiarySelect()}
        WHERE b.beneficiary_no = ?
      `)
      .get(key);
    return row || null;
  }

  nutritionSiblingConditions(beneficiary, beneficiaryId) {
    const conditions = ["id <> ?"];
    const args = [Number(beneficiaryId || 0)];
    const mother = normalizeText(beneficiary.mother_name).trim().toLowerCase();
    const father = normalizeText(beneficiary.father_name).trim().toLowerCase();
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

  findNutritionSiblingIds(beneficiary, beneficiaryId) {
    const filter = this.nutritionSiblingConditions(beneficiary, beneficiaryId);
    if (!filter) return [];

    return this.db
      .prepare(`SELECT id FROM nutrition_beneficiaries WHERE ${filter.where}`)
      .all(...filter.args)
      .map(row => Number(row.id))
      .filter(Boolean);
  }

  nutritionHouseholdMembersFor(beneficiaryId) {
    return this.db
      .prepare(`
        SELECT member_name, age, relationship, occupation
        FROM nutrition_household_members
        WHERE beneficiary_id = ?
        ORDER BY row_order, id
      `)
      .all(Number(beneficiaryId));
  }

  writeNutritionHouseholdMembers(beneficiaryId, members, memberInsert) {
    this.db.prepare("DELETE FROM nutrition_household_members WHERE beneficiary_id = ?").run(Number(beneficiaryId));
    members.forEach((member, index) => {
      memberInsert.run(
        Number(beneficiaryId),
        index,
        member.member_name,
        member.age,
        member.relationship,
        member.occupation
      );
    });
  }

  saveNutritionBeneficiary(input = {}) {
    const id = Number(input.id || 0);
    const existing = id ? this.getNutritionBeneficiary(id) : null;
    const requestedCenterId = Number(input.center_id || input.centerId || existing?.center_id || 0) || 0;
    const center = requestedCenterId ? this.getNutritionCenter(requestedCenterId) : null;
    const beneficiary = normalizeNutritionBeneficiary({
      ...existing,
      ...input,
      center_id: requestedCenterId || null
    }, center);

    if (!beneficiary.beneficiary_no) {
      beneficiary.beneficiary_no = this.nextNutritionBeneficiaryNo();
    }

    if (!beneficiary.child_last_name || !beneficiary.child_first_name) {
      throw new Error("Child first and last name are required.");
    }

    const duplicate = this.getNutritionBeneficiaryByNo(beneficiary.beneficiary_no);
    if (duplicate && duplicate.id !== existing?.id) {
      throw new Error(`Nutrition beneficiary no. already exists: ${beneficiary.beneficiary_no}`);
    }

    const timestamp = nowIso();
    const values = NUTRITION_BENEFICIARY_FIELDS.map(fieldName => beneficiary[fieldName]);

    this.db.exec("BEGIN");
    try {
      let beneficiaryId = existing?.id || 0;

      if (existing) {
        const assignments = NUTRITION_BENEFICIARY_FIELDS.map(fieldName => `${quoted(fieldName)} = ?`).join(", ");
        this.db
          .prepare(`UPDATE nutrition_beneficiaries SET ${assignments}, updated_at = ? WHERE id = ?`)
          .run(...values, timestamp, existing.id);
        beneficiaryId = existing.id;
      } else {
        const columns = NUTRITION_BENEFICIARY_FIELDS.map(quoted).join(", ");
        const placeholders = NUTRITION_BENEFICIARY_FIELDS.map(() => "?").join(", ");
        const result = this.db
          .prepare(`
            INSERT INTO nutrition_beneficiaries (${columns}, created_at, updated_at)
            VALUES (${placeholders}, ?, ?)
          `)
          .run(...values, timestamp, timestamp);
        beneficiaryId = Number(result.lastInsertRowid);
      }

      const memberInsert = this.db.prepare(`
        INSERT INTO nutrition_household_members (
          beneficiary_id, row_order, member_name, age, relationship, occupation
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const siblingIds = this.findNutritionSiblingIds(beneficiary, beneficiaryId);
      const siblingHouseholdRows = siblingIds.flatMap(siblingId => this.nutritionHouseholdMembersFor(siblingId));
      const householdMembers = mergeNutritionHouseholdMembers(beneficiary.household_members, siblingHouseholdRows);

      [beneficiaryId, ...siblingIds].forEach(targetId => {
        this.writeNutritionHouseholdMembers(targetId, householdMembers, memberInsert);
      });

      this.db.exec("COMMIT");
      this.refreshNutritionBeneficiaryGrowthSnapshot(beneficiaryId);
      return this.getNutritionBeneficiary(beneficiaryId);
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  deleteNutritionBeneficiary(id) {
    const beneficiary = this.getNutritionBeneficiary(id);
    if (!beneficiary) {
      throw new Error("Nutrition beneficiary was not found.");
    }

    this.db.prepare("DELETE FROM nutrition_beneficiaries WHERE id = ?").run(Number(id));
    return beneficiary;
  }

  exportNutritionBeneficiaries() {
    return this.db
      .prepare("SELECT id FROM nutrition_beneficiaries ORDER BY beneficiary_no, child_last_name, child_first_name")
      .all()
      .map(row => this.getNutritionBeneficiary(row.id));
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

  listNutritionGrowthReports({ search = "", centerId = "", limit = 200 } = {}) {
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
    return this.db
      .prepare(`
        ${this.nutritionGrowthReportSelect()}
        ${where}
        GROUP BY r.id
        ORDER BY r.report_month DESC, r.updated_at DESC, r.id DESC
        LIMIT ?
      `)
      .all(...args, max);
  }

  getNutritionGrowthReport(id) {
    const report = this.db
      .prepare(`
        ${this.nutritionGrowthReportSelect()}
        WHERE r.id = ?
        GROUP BY r.id
      `)
      .get(Number(id));
    if (!report) return null;

    return {
      ...report,
      entries: this.db
        .prepare("SELECT * FROM nutrition_growth_entries WHERE report_id = ? ORDER BY row_order, id")
        .all(report.id)
    };
  }

  listNutritionBeneficiariesForGrowth(centerId) {
    return this.db
      .prepare(`
        ${this.nutritionBeneficiarySelect()}
        WHERE b.center_id = ?
        ORDER BY b.beneficiary_no, b.child_last_name, b.child_first_name, b.id
      `)
      .all(Number(centerId));
  }

  getPreviousNutritionGrowthEntry(beneficiaryId, reportMonth, excludeReportId = 0) {
    if (!beneficiaryId || !reportMonth) return null;

    return this.db
      .prepare(`
        SELECT e.*, r.report_month, r.submitted_date
        FROM nutrition_growth_entries e
        JOIN nutrition_growth_reports r ON r.id = e.report_id
        WHERE e.beneficiary_id = ?
          AND r.report_month < ?
          AND r.id <> ?
        ORDER BY r.report_month DESC, r.id DESC, e.id DESC
        LIMIT 1
      `)
      .get(Number(beneficiaryId), String(reportMonth), Number(excludeReportId || 0)) || null;
  }

  latestNutritionGrowthEntry(beneficiaryId) {
    if (!beneficiaryId) return null;

    return this.db
      .prepare(`
        SELECT e.*, r.report_month, r.submitted_date
        FROM nutrition_growth_entries e
        JOIN nutrition_growth_reports r ON r.id = e.report_id
        WHERE e.beneficiary_id = ?
          AND (trim(COALESCE(e.height_cm, '')) <> '' OR trim(COALESCE(e.weight_kg, '')) <> '')
        ORDER BY r.report_month DESC, r.id DESC, e.id DESC
        LIMIT 1
      `)
      .get(Number(beneficiaryId)) || null;
  }

  nutritionGrowthReference(beneficiary, reportMonth, excludeReportId = 0) {
    const previous = this.getPreviousNutritionGrowthEntry(beneficiary.id, reportMonth, excludeReportId);
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

  buildNutritionGrowthEntry(beneficiary, inputEntry = {}, reportMonth, excludeReportId = 0, rowOrder = 0) {
    const reference = this.nutritionGrowthReference(beneficiary, reportMonth, excludeReportId);
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
      beneficiary_name: nutritionBeneficiaryName(beneficiary),
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

  buildNutritionGrowthDraft(input = {}) {
    const id = Number(input.id || 0) || 0;
    const existing = id ? this.getNutritionGrowthReport(id) : null;
    const centerId = Number(input.center_id || input.centerId || existing?.center_id || 0) || 0;
    const center = centerId ? this.getNutritionCenter(centerId) : null;
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
    const beneficiaries = this.listNutritionBeneficiariesForGrowth(center.id);
    const entries = beneficiaries.map((beneficiary, index) => {
      const entry = this.buildNutritionGrowthEntry(
        beneficiary,
        entryMap.get(Number(beneficiary.id)) || {},
        report.report_month,
        id || 0,
        index
      );
      entry.report_id = id || 0;
      return entry;
    });

    return {
      ...report,
      entries
    };
  }

  saveNutritionGrowthReport(input = {}) {
    const id = Number(input.id || 0) || 0;
    const existing = id ? this.getNutritionGrowthReport(id) : null;
    const report = this.buildNutritionGrowthDraft(input);
    const duplicate = this.db
      .prepare("SELECT id FROM nutrition_growth_reports WHERE center_id = ? AND report_month = ? AND id <> ?")
      .get(report.center_id, report.report_month, id || 0);

    if (duplicate) {
      throw new Error("This feeding center already has a growth monitoring report for that month.");
    }

    const timestamp = nowIso();
    this.db.exec("BEGIN");
    try {
      let reportId = id;
      const reportValues = [
        report.center_id,
        report.center_name,
        report.submitted_date,
        report.report_month
      ];

      if (existing) {
        this.db
          .prepare(`
            UPDATE nutrition_growth_reports
            SET center_id = ?,
                center_name = ?,
                submitted_date = ?,
                report_month = ?,
                updated_at = ?
            WHERE id = ?
          `)
          .run(...reportValues, timestamp, reportId);
      } else {
        const result = this.db
          .prepare(`
            INSERT INTO nutrition_growth_reports (
              center_id, center_name, submitted_date, report_month, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
          `)
          .run(...reportValues, timestamp, timestamp);
        reportId = Number(result.lastInsertRowid);
      }

      this.db.prepare("DELETE FROM nutrition_growth_entries WHERE report_id = ?").run(reportId);
      const insertEntry = this.db.prepare(`
        INSERT INTO nutrition_growth_entries (
          report_id, beneficiary_id, beneficiary_no, beneficiary_name, gender, birth_date,
          age_months, height_cm, weight_kg, height_change_cm, weight_change_kg,
          cgs_classification, previous_record_date, previous_height_cm, previous_weight_kg,
          previous_cgs_classification, row_order
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      report.entries.forEach((entry, index) => {
        const values = NUTRITION_GROWTH_ENTRY_FIELDS.map(fieldName => (
          fieldName === "report_id" ? reportId :
          fieldName === "row_order" ? index :
          entry[fieldName]
        ));
        insertEntry.run(...values);
      });

      this.db.exec("COMMIT");
      report.entries.forEach(entry => this.refreshNutritionBeneficiaryGrowthSnapshot(entry.beneficiary_id));
      if (existing?.center_id && Number(existing.center_id) !== Number(report.center_id)) {
        existing.entries.forEach(entry => this.refreshNutritionBeneficiaryGrowthSnapshot(entry.beneficiary_id));
      }
      return this.getNutritionGrowthReport(reportId);
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  refreshNutritionBeneficiaryGrowthSnapshot(beneficiaryId) {
    if (!beneficiaryId) return;

    const latest = this.latestNutritionGrowthEntry(beneficiaryId);
    if (!latest) return;

    this.db
      .prepare(`
        UPDATE nutrition_beneficiaries
        SET current_update_date = ?,
            current_age_months = ?,
            current_weight_kg = ?,
            current_height_cm = ?,
            current_nutrition_status = ?,
            updated_at = ?
        WHERE id = ?
      `)
      .run(
        latest.submitted_date || monthEndProfileDate(latest.report_month),
        latest.age_months || "",
        latest.weight_kg || "",
        latest.height_cm || "",
        latest.cgs_classification || "",
        nowIso(),
        Number(beneficiaryId)
      );
  }

  deleteNutritionGrowthReport(id) {
    const report = this.getNutritionGrowthReport(id);
    if (!report) {
      throw new Error("Growth monitoring report was not found.");
    }

    this.db.exec("BEGIN");
    try {
      this.db.prepare("DELETE FROM nutrition_growth_reports WHERE id = ?").run(Number(id));
      this.db.exec("COMMIT");
      report.entries.forEach(entry => this.refreshNutritionBeneficiaryGrowthSnapshot(entry.beneficiary_id));
      return report;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  exportNutritionGrowthReports() {
    return this.db
      .prepare("SELECT id FROM nutrition_growth_reports ORDER BY report_month DESC, center_name")
      .all()
      .map(row => this.getNutritionGrowthReport(row.id));
  }

  nutritionCgsReference() {
    return cgsReferencePayload();
  }

  nutritionOverview() {
    const centers = this.listNutritionCenters({ limit: 500 });
    const beneficiaries = this.listNutritionBeneficiaries({ limit: 500 });
    const growthReports = this.listNutritionGrowthReports({ limit: 500 });
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

  exportData() {
    const nutrition = this.nutritionOverview();

    return {
      exportedAt: nowIso(),
      fields: FIELD_NAMES,
      records: this.db.prepare("SELECT * FROM beneficiaries ORDER BY control_no").all(),
      monitoringReports: this.exportMonitoringReports(),
      nutritionCenters: nutrition.centers,
      nutritionBeneficiaries: this.exportNutritionBeneficiaries(),
      nutritionGrowthReports: this.exportNutritionGrowthReports(),
      deletedRecords: this.db
        .prepare("SELECT * FROM deleted_records ORDER BY deleted_at DESC, id DESC")
        .all()
    };
  }
}

module.exports = {
  BeneficiaryDatabase,
  DEFAULT_DB_PATH,
  NUTRITION_BENEFICIARY_FIELDS,
  NUTRITION_CENTER_FIELDS,
  NUTRITION_GROWTH_ENTRY_FIELDS,
  NUTRITION_GROWTH_REPORT_FIELDS,
  NUTRITION_HOUSEHOLD_FIELDS,
  hashPassword,
  normalizeContactNumber,
  normalizeAmount,
  normalizeFieldValue,
  mergeNutritionHouseholdMembers,
  normalizeMonitoringReport,
  normalizeNutritionBeneficiary,
  normalizeNutritionCenter,
  normalizeNutritionHouseholdMembers,
  normalizeRecord,
  nutritionBeneficiaryName,
  nowIso,
  quoted,
  sentenceCaseValue,
  verifyPassword,
  titleCaseValue,
  todayDate
};
