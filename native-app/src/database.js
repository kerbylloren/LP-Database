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
const { initializeLocalScholarship } = require("./scholarship-store");
const { initializeLocalOperations } = require("./operations-store");

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

function clampLimit(limit, fallback = 50, max = 500) {
  return Math.min(Math.max(Number(limit) || fallback, 1), max);
}

function clampOffset(offset) {
  return Math.max(Number(offset) || 0, 0);
}

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
const NUTRITION_FINANCIAL_CATEGORIES = [
  "viands",
  "milk",
  "rice",
  "gas",
  "mineral_water",
  "utilities",
  "others"
];
const NUTRITION_FINANCIAL_REPORT_FIELDS = [
  "center_id",
  "center_name",
  "submitted_date",
  "report_month",
  "beginning_balance",
  "cash_receipts",
  "prepared_by",
  "prepared_title",
  "noted_by",
  "noted_title"
];
const NUTRITION_FINANCIAL_ENTRY_FIELDS = [
  "report_id",
  "entry_date",
  "rep_no",
  "particulars",
  "cv_no",
  ...NUTRITION_FINANCIAL_CATEGORIES,
  "row_order"
];
const NUTRITION_FINANCIAL_BUDGET_FIELDS = [
  "center_id",
  "center_name",
  "budget_year",
  "feeding_days",
  "approved_budget_per_child",
  ...NUTRITION_FINANCIAL_CATEGORIES,
  "notes"
];
const FINANCIAL_MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
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
  if (currentNumber === null) return "";
  if (!normalizeText(previous).trim()) return "0";
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

function normalizeFinancialYear(value, fallback = new Date().getFullYear()) {
  const year = Number(String(value ?? "").trim());
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : Number(fallback);
}

function roundFinancialValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(2)) : 0;
}

function normalizeNutritionFinancialEntry(input = {}, rowOrder = 0) {
  const entry = {
    entry_date: normalizeProfileDate(input.entry_date || input.entryDate),
    rep_no: normalizeText(input.rep_no || input.repNo).trim(),
    particulars: sentenceCaseValue(input.particulars),
    cv_no: normalizeText(input.cv_no || input.cvNo).trim(),
    row_order: Number(input.row_order ?? input.rowOrder ?? rowOrder) || 0
  };

  NUTRITION_FINANCIAL_CATEGORIES.forEach(category => {
    entry[category] = roundFinancialValue(normalizeAmount(input[category]));
  });

  entry.cash = roundFinancialValue(NUTRITION_FINANCIAL_CATEGORIES.reduce((sum, category) => sum + entry[category], 0));
  return entry;
}

function financialEntryHasValue(entry = {}) {
  return Boolean(
    entry.entry_date
      || entry.rep_no
      || entry.particulars
      || entry.cv_no
      || NUTRITION_FINANCIAL_CATEGORIES.some(category => Number(entry[category] || 0) !== 0)
  );
}

function normalizeNutritionFinancialReport(input = {}, center = null, existing = null) {
  const entries = (Array.isArray(input.entries) ? input.entries : existing?.entries || [])
    .map((entry, index) => normalizeNutritionFinancialEntry(entry, index))
    .filter(financialEntryHasValue)
    .map((entry, index) => ({ ...entry, row_order: index }));

  return {
    id: Number(input.id || existing?.id || 0) || 0,
    center_id: Number(input.center_id || input.centerId || existing?.center_id || center?.id || 0) || 0,
    center_name: titleCaseValue(input.center_name || input.centerName || existing?.center_name || center?.center_name),
    submitted_date: normalizeProfileDate(input.submitted_date || input.submittedDate || existing?.submitted_date) || normalizeProfileDate(todayDate()),
    report_month: normalizeReportMonth(input.report_month || input.reportMonth || existing?.report_month),
    beginning_balance: roundFinancialValue(normalizeAmount(input.beginning_balance ?? input.beginningBalance ?? existing?.beginning_balance)),
    cash_receipts: roundFinancialValue(normalizeAmount(input.cash_receipts ?? input.cashReceipts ?? existing?.cash_receipts)),
    prepared_by: titleCaseValue(input.prepared_by || input.preparedBy || existing?.prepared_by),
    prepared_title: titleCaseValue(input.prepared_title || input.preparedTitle || existing?.prepared_title),
    noted_by: titleCaseValue(input.noted_by || input.notedBy || existing?.noted_by),
    noted_title: titleCaseValue(input.noted_title || input.notedTitle || existing?.noted_title),
    entries
  };
}

function nutritionFinancialCategoryTotals(entries = []) {
  return Object.fromEntries(NUTRITION_FINANCIAL_CATEGORIES.map(category => [
    category,
    roundFinancialValue(entries.reduce((sum, entry) => sum + Number(entry[category] || 0), 0))
  ]));
}

function decorateNutritionFinancialReport(report = {}, entries = null) {
  const preparedEntries = Array.isArray(entries) ? entries.map((entry, index) => normalizeNutritionFinancialEntry(entry, index)) : null;
  const categoryTotals = preparedEntries
    ? nutritionFinancialCategoryTotals(preparedEntries)
    : Object.fromEntries(NUTRITION_FINANCIAL_CATEGORIES.map(category => [
        category,
        roundFinancialValue(report[`${category}_total`] ?? report.category_totals?.[category])
      ]));
  const totalDisbursements = roundFinancialValue(
    NUTRITION_FINANCIAL_CATEGORIES.reduce((sum, category) => sum + categoryTotals[category], 0)
  );

  return {
    ...report,
    beginning_balance: roundFinancialValue(report.beginning_balance),
    cash_receipts: roundFinancialValue(report.cash_receipts),
    line_count: Number(report.line_count ?? preparedEntries?.length ?? 0),
    category_totals: categoryTotals,
    total_disbursements: totalDisbursements,
    total_cash_receipts: roundFinancialValue(Number(report.beginning_balance || 0) + Number(report.cash_receipts || 0)),
    balance: roundFinancialValue(Number(report.beginning_balance || 0) + Number(report.cash_receipts || 0) - totalDisbursements),
    ...(preparedEntries ? { entries: preparedEntries } : {})
  };
}

function normalizeNutritionFinancialBudget(input = {}, center = null) {
  const budget = {
    id: Number(input.id || 0) || 0,
    center_id: Number(input.center_id || input.centerId || center?.id || 0) || 0,
    center_name: titleCaseValue(input.center_name || input.centerName || center?.center_name),
    budget_year: normalizeFinancialYear(input.budget_year || input.budgetYear),
    feeding_days: Math.max(Number(input.feeding_days || input.feedingDays || 22) || 22, 1),
    approved_budget_per_child: roundFinancialValue(normalizeAmount(
      input.approved_budget_per_child ?? input.approvedBudgetPerChild
    )),
    notes: sentenceCaseValue(input.notes)
  };

  NUTRITION_FINANCIAL_CATEGORIES.forEach(category => {
    budget[category] = roundFinancialValue(normalizeAmount(input[category]));
  });
  return budget;
}

function buildNutritionFinancialSummaryPayload({ year, centers = [], reports = [], budgets = [] } = {}) {
  const summaryYear = normalizeFinancialYear(year);
  const budgetByCenter = new Map(budgets.map(budget => [Number(budget.center_id), normalizeNutritionFinancialBudget(budget)]));
  const reportsByCenter = new Map();

  reports.forEach(report => {
    const centerId = Number(report.center_id || 0);
    if (!centerId || !String(report.report_month || "").startsWith(`${summaryYear}-`)) return;
    if (!reportsByCenter.has(centerId)) reportsByCenter.set(centerId, new Map());
    reportsByCenter.get(centerId).set(report.report_month, decorateNutritionFinancialReport(report));
  });

  const centerSummaries = centers.map(center => {
    const centerId = Number(center.id || 0);
    const centerReports = reportsByCenter.get(centerId) || new Map();
    const budget = budgetByCenter.get(centerId) || normalizeNutritionFinancialBudget({
      center_id: centerId,
      center_name: center.center_name,
      budget_year: summaryYear,
      feeding_days: 22
    }, center);
    const activeKids = Number(center.active_beneficiary_count || 0);
    const capacity = Number(center.capacity || 0);
    const months = FINANCIAL_MONTH_LABELS.map((label, index) => {
      const key = `${summaryYear}-${String(index + 1).padStart(2, "0")}`;
      const report = centerReports.get(key) || decorateNutritionFinancialReport({ report_month: key });
      return {
        key,
        label,
        report_id: Number(report.id || 0) || null,
        submitted_date: report.submitted_date || "",
        beginning_balance: report.beginning_balance,
        cash_receipts: report.cash_receipts,
        total_cash_receipts: report.total_cash_receipts,
        category_totals: report.category_totals,
        total_expenses: report.total_disbursements,
        balance: report.balance,
        filed: Boolean(report.id)
      };
    });
    const reportedMonths = months.filter(month => month.filed).length;
    const divisor = reportedMonths || 1;
    const actualCategoryTotals = Object.fromEntries(NUTRITION_FINANCIAL_CATEGORIES.map(category => [
      category,
      roundFinancialValue(months.reduce((sum, month) => sum + Number(month.category_totals[category] || 0), 0))
    ]));
    const categoryMetrics = Object.fromEntries(NUTRITION_FINANCIAL_CATEGORIES.map(category => {
      const actualTotal = actualCategoryTotals[category];
      const actualMonthly = roundFinancialValue(actualTotal / divisor);
      const actualDaily = roundFinancialValue(actualMonthly / budget.feeding_days);
      const budgetMonthly = roundFinancialValue(budget[category]);
      const budgetDaily = roundFinancialValue(budgetMonthly / budget.feeding_days);
      return [category, {
        actual_total: actualTotal,
        actual_monthly_average: actualMonthly,
        actual_daily_average: actualDaily,
        actual_per_child: activeKids ? roundFinancialValue(actualDaily / activeKids) : 0,
        budget_monthly: budgetMonthly,
        budget_daily: budgetDaily,
        budget_per_child: capacity ? roundFinancialValue(budgetDaily / capacity) : 0,
        variance_monthly: roundFinancialValue(actualMonthly - budgetMonthly)
      }];
    }));
    const totals = {
      beginning_balance: roundFinancialValue(months.reduce((sum, month) => sum + month.beginning_balance, 0)),
      cash_receipts: roundFinancialValue(months.reduce((sum, month) => sum + month.cash_receipts, 0)),
      total_cash_receipts: roundFinancialValue(months.reduce((sum, month) => sum + month.total_cash_receipts, 0)),
      category_totals: actualCategoryTotals,
      total_expenses: roundFinancialValue(Object.values(actualCategoryTotals).reduce((sum, value) => sum + value, 0))
    };
    totals.balance = roundFinancialValue(totals.total_cash_receipts - totals.total_expenses);
    const actualMonthlyAverage = roundFinancialValue(totals.total_expenses / divisor);
    const actualDailyAverage = roundFinancialValue(actualMonthlyAverage / budget.feeding_days);
    const actualPerChild = activeKids ? roundFinancialValue(actualDailyAverage / activeKids) : 0;
    const approvedPerChild = roundFinancialValue(budget.approved_budget_per_child);
    const approvedDaily = roundFinancialValue(approvedPerChild * capacity);
    const approvedMonthly = roundFinancialValue(approvedDaily * budget.feeding_days);
    const proposedMonthlyAllocation = roundFinancialValue(
      NUTRITION_FINANCIAL_CATEGORIES.reduce((sum, category) => sum + Number(budget[category] || 0), 0)
    );

    return {
      id: centerId,
      center_name: center.center_name || budget.center_name || "",
      coordinator: center.coordinator || "",
      status: center.status || "",
      active_kids: activeKids,
      capacity,
      reported_months: reportedMonths,
      feeding_days: budget.feeding_days,
      budget,
      budget_metrics: {
        actual_monthly_average: actualMonthlyAverage,
        actual_daily_average: actualDailyAverage,
        actual_per_child: actualPerChild,
        approved_per_child: approvedPerChild,
        approved_daily: approvedDaily,
        approved_monthly: approvedMonthly,
        approved_annual: roundFinancialValue(approvedMonthly * 12),
        proposed_monthly_allocation: proposedMonthlyAllocation,
        allocation_variance: roundFinancialValue(proposedMonthlyAllocation - approvedMonthly),
        monthly_variance: roundFinancialValue(actualMonthlyAverage - approvedMonthly),
        utilization_percent: approvedMonthly ? roundFinancialValue((actualMonthlyAverage / approvedMonthly) * 100) : 0
      },
      months,
      totals,
      category_metrics: categoryMetrics
    };
  });

  const programCategoryMetrics = Object.fromEntries(NUTRITION_FINANCIAL_CATEGORIES.map(category => [
    category,
    {
      actual_total: roundFinancialValue(centerSummaries.reduce((sum, center) => sum + center.category_metrics[category].actual_total, 0)),
      actual_monthly_average: roundFinancialValue(centerSummaries.reduce((sum, center) => sum + center.category_metrics[category].actual_monthly_average, 0)),
      actual_daily_average: roundFinancialValue(centerSummaries.reduce((sum, center) => sum + center.category_metrics[category].actual_daily_average, 0)),
      actual_per_child: roundFinancialValue(centerSummaries.reduce((sum, center) => sum + center.category_metrics[category].actual_per_child, 0)),
      budget_monthly: roundFinancialValue(centerSummaries.reduce((sum, center) => sum + center.category_metrics[category].budget_monthly, 0)),
      budget_daily: roundFinancialValue(centerSummaries.reduce((sum, center) => sum + center.category_metrics[category].budget_daily, 0)),
      budget_per_child: roundFinancialValue(centerSummaries.reduce((sum, center) => sum + center.category_metrics[category].budget_per_child, 0)),
      variance_monthly: roundFinancialValue(centerSummaries.reduce((sum, center) => sum + center.category_metrics[category].variance_monthly, 0))
    }
  ]));

  const programActiveKids = centerSummaries.reduce((sum, center) => sum + center.active_kids, 0);
  const programCapacity = centerSummaries.reduce((sum, center) => sum + center.capacity, 0);
  const programActualDaily = roundFinancialValue(centerSummaries.reduce((sum, center) => sum + center.budget_metrics.actual_daily_average, 0));
  const programApprovedDaily = roundFinancialValue(centerSummaries.reduce((sum, center) => sum + center.budget_metrics.approved_daily, 0));
  const programApprovedMonthly = roundFinancialValue(centerSummaries.reduce((sum, center) => sum + center.budget_metrics.approved_monthly, 0));

  return {
    year: summaryYear,
    centers: centerSummaries,
    program: {
      center_count: centerSummaries.length,
      active_kids: programActiveKids,
      capacity: programCapacity,
      report_count: centerSummaries.reduce((sum, center) => sum + center.reported_months, 0),
      category_metrics: programCategoryMetrics,
      total_actual: roundFinancialValue(Object.values(programCategoryMetrics).reduce((sum, metric) => sum + metric.actual_total, 0)),
      total_budget_monthly: roundFinancialValue(Object.values(programCategoryMetrics).reduce((sum, metric) => sum + metric.budget_monthly, 0)),
      actual_daily_average: programActualDaily,
      actual_per_child: programActiveKids ? roundFinancialValue(programActualDaily / programActiveKids) : 0,
      approved_budget_per_child: programCapacity ? roundFinancialValue(programApprovedDaily / programCapacity) : 0,
      approved_daily: programApprovedDaily,
      approved_monthly: programApprovedMonthly,
      approved_annual: roundFinancialValue(programApprovedMonthly * 12),
      monthly_variance: roundFinancialValue(
        centerSummaries.reduce((sum, center) => sum + center.budget_metrics.actual_monthly_average, 0) - programApprovedMonthly
      )
    }
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
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_nutrition_financial_center_month
        ON nutrition_financial_reports(center_id, report_month);

      CREATE INDEX IF NOT EXISTS idx_nutrition_financial_reports_month
        ON nutrition_financial_reports(report_month);

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
      );

      CREATE INDEX IF NOT EXISTS idx_nutrition_financial_entries_report
        ON nutrition_financial_entries(report_id);

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
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_nutrition_financial_budget_center_year
        ON nutrition_financial_budgets(center_id, budget_year);

      CREATE TABLE IF NOT EXISTS nutrition_recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_name TEXT NOT NULL,
        recipe_key TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL DEFAULT '',
        base_servings INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'Active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_nutrition_recipes_name
        ON nutrition_recipes(recipe_name);

      CREATE TABLE IF NOT EXISTS nutrition_recipe_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        row_order INTEGER NOT NULL DEFAULT 0,
        ingredient_name TEXT NOT NULL DEFAULT '',
        default_quantity TEXT NOT NULL DEFAULT '',
        default_cost REAL NOT NULL DEFAULT 0,
        FOREIGN KEY (recipe_id) REFERENCES nutrition_recipes(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_nutrition_recipe_ingredients_recipe
        ON nutrition_recipe_ingredients(recipe_id);

      CREATE TABLE IF NOT EXISTS nutrition_monthly_menus (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        menu_month TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'Draft',
        notes TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

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
      );

      CREATE INDEX IF NOT EXISTS idx_nutrition_menu_entries_date
        ON nutrition_monthly_menu_entries(meal_date);

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
      );

      CREATE INDEX IF NOT EXISTS idx_nutrition_costings_month
        ON nutrition_menu_costings(report_month, center_id);

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
      );

      CREATE INDEX IF NOT EXISTS idx_nutrition_costing_days_costing
        ON nutrition_menu_costing_days(costing_id);

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
      );

      CREATE INDEX IF NOT EXISTS idx_nutrition_costing_items_day
        ON nutrition_menu_costing_items(costing_day_id);

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

      CREATE INDEX IF NOT EXISTS idx_app_users_username_lower
        ON app_users(lower(username));
    `);

    this.ensureNutritionFinancialBudgetColumns();

    this.ensureBeneficiaryColumns();
    this.backfillCurrentGroup();
    this.ensureSuperadmin();
    this.scholarship = initializeLocalScholarship(this.db);
    this.operations = initializeLocalOperations(this.db);
  }

  ensureNutritionFinancialBudgetColumns() {
    const existingColumns = new Set(
      this.db.prepare("PRAGMA table_info(nutrition_financial_budgets)").all().map(column => column.name)
    );
    if (!existingColumns.has("approved_budget_per_child")) {
      this.db.exec("ALTER TABLE nutrition_financial_budgets ADD COLUMN approved_budget_per_child REAL NOT NULL DEFAULT 0;");
    }
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

  warmup() {
    this.db.prepare("SELECT id FROM app_users WHERE lower(username) = lower(?) LIMIT 1").get("__warmup__");
  }

  stats() {
    const row = this.db.prepare(`
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
    `).get();

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

  countRecords({ search = "" } = {}) {
    if (!search.trim()) {
      return Number(this.db.prepare("SELECT COUNT(*) AS count FROM beneficiaries").get().count || 0);
    }

    const pattern = `%${search.trim().toLowerCase()}%`;
    return Number(this.db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM beneficiaries
        WHERE lower(control_no) LIKE ?
          OR lower(last_name) LIKE ?
          OR lower(first_name) LIKE ?
          OR lower(middle_name) LIKE ?
          OR lower(first_name || ' ' || middle_name || ' ' || last_name) LIKE ?
          OR lower(last_name || ' ' || first_name || ' ' || middle_name) LIKE ?
      `)
      .get(pattern, pattern, pattern, pattern, pattern, pattern).count || 0);
  }

  listRecords({ search = "", limit = 50, offset = 0, detail = "summary" } = {}) {
    const max = clampLimit(limit, 50, 500);
    const skip = clampOffset(offset);
    const selectedFields = detail === "full"
      ? ["id", ...FIELD_NAMES, "created_at", "updated_at"]
      : detail === "table"
        ? ["id", ...FIELD_NAMES.filter(fieldName => fieldName !== "picture_data" && !FAMILY_FIELDS.includes(fieldName)), "created_at", "updated_at"]
        : SUMMARY_FIELDS;
    const columns = selectedFields.map(quoted).join(", ");

    if (!search.trim()) {
      return this.db
        .prepare(`SELECT ${columns} FROM beneficiaries ORDER BY updated_at DESC, id DESC LIMIT ? OFFSET ?`)
        .all(max, skip);
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
        LIMIT ? OFFSET ?
      `)
      .all(pattern, pattern, pattern, pattern, pattern, pattern, max, skip);
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

  countDeletedRecords() {
    return Number(this.db.prepare("SELECT COUNT(*) AS count FROM deleted_records").get().count || 0);
  }

  listDeletedRecords({ limit = 100, offset = 0 } = {}) {
    const max = clampLimit(limit, 100, 500);
    const skip = clampOffset(offset);

    return this.db
      .prepare(`
        SELECT id, original_id, control_no, display_name, deleted_at
        FROM deleted_records
        ORDER BY deleted_at DESC, id DESC
        LIMIT ? OFFSET ?
      `)
      .all(max, skip);
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

  countMonitoringReports(options = {}) {
    const { where, args } = this.monitoringReportFilters(options);
    return Number(this.db
      .prepare(`SELECT COUNT(*) AS count FROM monitoring_reports ${where}`)
      .get(...args).count || 0);
  }

  listMonitoringReports({ search = "", beneficiaryId = "", limit = 200, offset = 0 } = {}) {
    const max = clampLimit(limit, 200, 500);
    const skip = clampOffset(offset);
    const { where, args } = this.monitoringReportFilters({ search, beneficiaryId });

    return this.db
      .prepare(`
        SELECT *
        FROM monitoring_reports
        ${where}
        ORDER BY report_month DESC, updated_at DESC, id DESC
        LIMIT ? OFFSET ?
      `)
      .all(...args, max, skip);
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

  listNutritionCenters({ search = "", limit = 200, offset = 0 } = {}) {
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

    return this.db
      .prepare(`
        ${this.nutritionCenterWithCountsSelect()}
        ${where}
        GROUP BY c.id
        ORDER BY c.center_name, c.id
        LIMIT ? OFFSET ?
      `)
      .all(...args, max, skip);
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

  countNutritionBeneficiaries(options = {}) {
    const { where, args } = this.nutritionBeneficiaryFilters(options);
    return Number(this.db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM nutrition_beneficiaries b
        LEFT JOIN nutrition_centers c ON c.id = b.center_id
        ${where}
      `)
      .get(...args).count || 0);
  }

  listNutritionBeneficiaries({ search = "", centerId = "", limit = 200, offset = 0 } = {}) {
    const max = clampLimit(limit, 200, 500);
    const skip = clampOffset(offset);
    const { where, args } = this.nutritionBeneficiaryFilters({ search, centerId });

    return this.db
      .prepare(`
        ${this.nutritionBeneficiaryListSelect()}
        ${where}
        ORDER BY b.updated_at DESC, b.id DESC
        LIMIT ? OFFSET ?
      `)
      .all(...args, max, skip);
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

  countNutritionGrowthReports(options = {}) {
    const { where, args } = this.nutritionGrowthReportFilters(options);
    return Number(this.db
      .prepare(`SELECT COUNT(*) AS count FROM nutrition_growth_reports r ${where}`)
      .get(...args).count || 0);
  }

  listNutritionGrowthReports({ search = "", centerId = "", limit = 200, offset = 0 } = {}) {
    const max = clampLimit(limit, 200, 500);
    const skip = clampOffset(offset);
    const { where, args } = this.nutritionGrowthReportFilters({ search, centerId });

    return this.db
      .prepare(`
        ${this.nutritionGrowthReportSelect()}
        ${where}
        GROUP BY r.id
        ORDER BY r.report_month DESC, r.updated_at DESC, r.id DESC
        LIMIT ? OFFSET ?
      `)
      .all(...args, max, skip);
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
      previous_record_date: "",
      previous_height_cm: "",
      previous_weight_kg: "",
      previous_cgs_classification: ""
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

  countNutritionFinancialReports({ search = "", centerId = "", year = "" } = {}) {
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
      args.push(String(normalizeFinancialYear(year)));
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    return Number(this.db.prepare(`SELECT COUNT(*) AS count FROM nutrition_financial_reports r ${where}`).get(...args)?.count || 0);
  }

  listNutritionFinancialReports({ search = "", centerId = "", year = "", limit = 200, offset = 0 } = {}) {
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
      args.push(String(normalizeFinancialYear(year)));
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const max = clampLimit(limit, 200, 500);
    const skip = clampOffset(offset);

    return this.db.prepare(`
      ${this.nutritionFinancialReportSummarySelect()}
      ${where}
      GROUP BY r.id
      ORDER BY r.report_month DESC, r.center_name, r.id DESC
      LIMIT ? OFFSET ?
    `).all(...args, max, skip).map(report => decorateNutritionFinancialReport(report));
  }

  getNutritionFinancialReport(id) {
    const report = this.db.prepare("SELECT * FROM nutrition_financial_reports WHERE id = ?").get(Number(id));
    if (!report) return null;
    const entries = this.db
      .prepare("SELECT * FROM nutrition_financial_entries WHERE report_id = ? ORDER BY row_order, id")
      .all(Number(id));
    return decorateNutritionFinancialReport(report, entries);
  }

  saveNutritionFinancialReport(input = {}) {
    const id = Number(input.id || 0) || 0;
    const existing = id ? this.getNutritionFinancialReport(id) : null;
    const centerId = Number(input.center_id || input.centerId || existing?.center_id || 0) || 0;
    const center = centerId ? this.getNutritionCenter(centerId) : null;
    if (!center) throw new Error("Select a valid feeding center.");

    const report = normalizeNutritionFinancialReport(input, center, existing);
    if (!report.report_month) throw new Error("Report month is required.");
    const duplicate = this.db
      .prepare("SELECT id FROM nutrition_financial_reports WHERE center_id = ? AND report_month = ? AND id <> ?")
      .get(report.center_id, report.report_month, id);
    if (duplicate) throw new Error("A financial report already exists for this center and month.");

    const timestamp = nowIso();
    this.db.exec("BEGIN");
    try {
      let reportId = id;
      if (existing) {
        this.db.prepare(`
          UPDATE nutrition_financial_reports
          SET center_id = ?, center_name = ?, submitted_date = ?, report_month = ?,
              beginning_balance = ?, cash_receipts = ?, prepared_by = ?, prepared_title = ?,
              noted_by = ?, noted_title = ?, updated_at = ?
          WHERE id = ?
        `).run(
          report.center_id, report.center_name, report.submitted_date, report.report_month,
          report.beginning_balance, report.cash_receipts, report.prepared_by, report.prepared_title,
          report.noted_by, report.noted_title, timestamp, existing.id
        );
      } else {
        const result = this.db.prepare(`
          INSERT INTO nutrition_financial_reports (
            center_id, center_name, submitted_date, report_month, beginning_balance, cash_receipts,
            prepared_by, prepared_title, noted_by, noted_title, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          report.center_id, report.center_name, report.submitted_date, report.report_month,
          report.beginning_balance, report.cash_receipts, report.prepared_by, report.prepared_title,
          report.noted_by, report.noted_title, timestamp, timestamp
        );
        reportId = Number(result.lastInsertRowid);
      }

      this.db.prepare("DELETE FROM nutrition_financial_entries WHERE report_id = ?").run(reportId);
      const insertEntry = this.db.prepare(`
        INSERT INTO nutrition_financial_entries (
          report_id, row_order, entry_date, rep_no, particulars, cv_no,
          viands, milk, rice, gas, mineral_water, utilities, others
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      report.entries.forEach((entry, index) => {
        insertEntry.run(
          reportId, index, entry.entry_date, entry.rep_no, entry.particulars, entry.cv_no,
          entry.viands, entry.milk, entry.rice, entry.gas, entry.mineral_water, entry.utilities, entry.others
        );
      });
      this.db.exec("COMMIT");
      return this.getNutritionFinancialReport(reportId);
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  deleteNutritionFinancialReport(id) {
    const report = this.getNutritionFinancialReport(id);
    if (!report) throw new Error("Financial report was not found.");
    this.db.prepare("DELETE FROM nutrition_financial_reports WHERE id = ?").run(Number(id));
    return report;
  }

  listNutritionFinancialBudgets({ year = new Date().getFullYear(), centerId = "" } = {}) {
    const conditions = ["b.budget_year = ?"];
    const args = [normalizeFinancialYear(year)];
    if (Number(centerId)) {
      conditions.push("b.center_id = ?");
      args.push(Number(centerId));
    }
    return this.db.prepare(`
      SELECT b.*, c.capacity, c.status,
        (
          SELECT COUNT(*) FROM nutrition_beneficiaries n
          WHERE n.center_id = b.center_id
            AND (lower(COALESCE(n.remarks, '')) = 'active' OR lower(COALESCE(n.profile_status, '')) = 'active')
        ) AS active_beneficiary_count
      FROM nutrition_financial_budgets b
      LEFT JOIN nutrition_centers c ON c.id = b.center_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY b.center_name, b.id
    `).all(...args).map(budget => normalizeNutritionFinancialBudget(budget));
  }

  saveNutritionFinancialBudgets(input = {}) {
    const budgetYear = normalizeFinancialYear(input.year || input.budget_year);
    const budgets = (Array.isArray(input.budgets) ? input.budgets : [input]).map(item => ({ ...item, budget_year: budgetYear }));
    const timestamp = nowIso();
    this.db.exec("BEGIN");
    try {
      const upsert = this.db.prepare(`
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
      `);

      budgets.forEach(item => {
        const center = this.getNutritionCenter(item.center_id || item.centerId);
        if (!center) throw new Error("A budget row references an invalid feeding center.");
        const budget = normalizeNutritionFinancialBudget(item, center);
        upsert.run(
          budget.center_id, budget.center_name, budget.budget_year, budget.feeding_days, budget.approved_budget_per_child,
          budget.viands, budget.milk, budget.rice, budget.gas, budget.mineral_water,
          budget.utilities, budget.others, budget.notes, timestamp, timestamp
        );
      });
      this.db.exec("COMMIT");
      return this.listNutritionFinancialBudgets({ year: budgetYear });
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  nutritionFinancialSummary({ year = new Date().getFullYear() } = {}) {
    const summaryYear = normalizeFinancialYear(year);
    return buildNutritionFinancialSummaryPayload({
      year: summaryYear,
      centers: this.listNutritionCenters({ limit: 500 }),
      reports: this.listNutritionFinancialReports({ year: summaryYear, limit: 500 }),
      budgets: this.listNutritionFinancialBudgets({ year: summaryYear })
    });
  }

  exportNutritionFinancialReports() {
    return this.db
      .prepare("SELECT id FROM nutrition_financial_reports ORDER BY report_month DESC, center_name")
      .all()
      .map(row => this.getNutritionFinancialReport(row.id));
  }

  countNutritionRecipes({ search = "" } = {}) {
    const term = String(search || "").trim().toLowerCase();
    if (!term) return Number(this.db.prepare("SELECT COUNT(*) AS count FROM nutrition_recipes").get()?.count || 0);
    return Number(this.db.prepare(`
      SELECT COUNT(*) AS count FROM nutrition_recipes
      WHERE lower(recipe_name) LIKE ? OR lower(description) LIKE ?
    `).get(`%${term}%`, `%${term}%`)?.count || 0);
  }

  listNutritionRecipes({ search = "", limit = 100, offset = 0 } = {}) {
    const term = String(search || "").trim().toLowerCase();
    const where = term ? "WHERE lower(r.recipe_name) LIKE ? OR lower(r.description) LIKE ?" : "";
    const args = term ? [`%${term}%`, `%${term}%`] : [];
    return this.db.prepare(`
      SELECT r.*, COUNT(i.id) AS ingredient_count, COALESCE(SUM(i.default_cost), 0) AS budget_cost
      FROM nutrition_recipes r
      LEFT JOIN nutrition_recipe_ingredients i ON i.recipe_id = r.id
      ${where}
      GROUP BY r.id
      ORDER BY r.recipe_name, r.id
      LIMIT ? OFFSET ?
    `).all(...args, clampLimit(limit, 100, 500), clampOffset(offset)).map(recipe => decorateRecipe(recipe));
  }

  getNutritionRecipe(id) {
    const recipe = this.db.prepare("SELECT * FROM nutrition_recipes WHERE id = ?").get(Number(id));
    if (!recipe) return null;
    const ingredients = this.db.prepare(`
      SELECT * FROM nutrition_recipe_ingredients WHERE recipe_id = ? ORDER BY row_order, id
    `).all(Number(id));
    return decorateRecipe(recipe, ingredients);
  }

  findNutritionRecipeByName(name) {
    const row = this.db.prepare("SELECT id FROM nutrition_recipes WHERE recipe_key = ?").get(recipeKey(name));
    return row ? this.getNutritionRecipe(row.id) : null;
  }

  saveNutritionRecipe(input = {}) {
    const id = Number(input.id || 0) || 0;
    const existing = id ? this.getNutritionRecipe(id) : null;
    const recipe = normalizeRecipe(input, existing);
    if (!recipe.recipe_name) throw new Error("Recipe name is required.");
    if (!recipe.ingredients.length) throw new Error("Add at least one ingredient.");
    const duplicate = this.db.prepare("SELECT id FROM nutrition_recipes WHERE recipe_key = ? AND id <> ?")
      .get(recipe.recipe_key, id);
    if (duplicate) throw new Error("A recipe with this name already exists.");

    const timestamp = nowIso();
    this.db.exec("BEGIN");
    try {
      let recipeId = id;
      if (existing) {
        this.db.prepare(`
          UPDATE nutrition_recipes SET recipe_name = ?, recipe_key = ?, description = ?,
            base_servings = ?, status = ?, updated_at = ? WHERE id = ?
        `).run(recipe.recipe_name, recipe.recipe_key, recipe.description, recipe.base_servings, recipe.status, timestamp, id);
      } else {
        const result = this.db.prepare(`
          INSERT INTO nutrition_recipes (
            recipe_name, recipe_key, description, base_servings, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(recipe.recipe_name, recipe.recipe_key, recipe.description, recipe.base_servings, recipe.status, timestamp, timestamp);
        recipeId = Number(result.lastInsertRowid);
      }
      this.db.prepare("DELETE FROM nutrition_recipe_ingredients WHERE recipe_id = ?").run(recipeId);
      const insert = this.db.prepare(`
        INSERT INTO nutrition_recipe_ingredients (
          recipe_id, row_order, ingredient_name, default_quantity, default_cost
        ) VALUES (?, ?, ?, ?, ?)
      `);
      recipe.ingredients.forEach((item, index) => {
        insert.run(recipeId, index, item.ingredient_name, item.default_quantity, item.default_cost);
      });
      this.db.exec("COMMIT");
      return this.getNutritionRecipe(recipeId);
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  deleteNutritionRecipe(id) {
    const recipe = this.getNutritionRecipe(id);
    if (!recipe) throw new Error("Recipe was not found.");
    this.db.prepare("DELETE FROM nutrition_recipes WHERE id = ?").run(Number(id));
    return recipe;
  }

  countNutritionMenus({ year = "" } = {}) {
    if (!String(year || "").trim()) return Number(this.db.prepare("SELECT COUNT(*) AS count FROM nutrition_monthly_menus").get()?.count || 0);
    return Number(this.db.prepare("SELECT COUNT(*) AS count FROM nutrition_monthly_menus WHERE substr(menu_month, 1, 4) = ?")
      .get(String(Number(year)))?.count || 0);
  }

  listNutritionMenus({ year = "", limit = 60, offset = 0 } = {}) {
    const hasYear = Boolean(String(year || "").trim());
    return this.db.prepare(`
      SELECT m.*, COUNT(e.id) AS meal_count
      FROM nutrition_monthly_menus m
      LEFT JOIN nutrition_monthly_menu_entries e ON e.menu_id = m.id
      ${hasYear ? "WHERE substr(m.menu_month, 1, 4) = ?" : ""}
      GROUP BY m.id
      ORDER BY m.menu_month DESC
      LIMIT ? OFFSET ?
    `).all(...(hasYear ? [String(Number(year))] : []), clampLimit(limit, 60, 240), clampOffset(offset));
  }

  getNutritionMenu(id) {
    const menu = this.db.prepare("SELECT * FROM nutrition_monthly_menus WHERE id = ?").get(Number(id));
    if (!menu) return null;
    const entries = this.db.prepare(`
      SELECT e.*, r.recipe_name FROM nutrition_monthly_menu_entries e
      LEFT JOIN nutrition_recipes r ON r.id = e.recipe_id
      WHERE e.menu_id = ? ORDER BY e.meal_date, e.row_order, e.id
    `).all(Number(id));
    return { ...menu, entries };
  }

  getNutritionMenuByMonth(menuMonth) {
    const row = this.db.prepare("SELECT id FROM nutrition_monthly_menus WHERE menu_month = ?").get(String(menuMonth || ""));
    return row ? this.getNutritionMenu(row.id) : null;
  }

  saveNutritionMenu(input = {}) {
    const id = Number(input.id || 0) || 0;
    const existing = id ? this.getNutritionMenu(id) : null;
    const menu = normalizeMenu(input, existing);
    if (!menu.menu_month) throw new Error("Menu month is required.");
    const duplicate = this.db.prepare("SELECT id FROM nutrition_monthly_menus WHERE menu_month = ? AND id <> ?")
      .get(menu.menu_month, id);
    if (duplicate) throw new Error("A monthly menu already exists for this month.");

    const timestamp = nowIso();
    this.db.exec("BEGIN");
    try {
      let menuId = id;
      if (existing) {
        this.db.prepare("UPDATE nutrition_monthly_menus SET menu_month = ?, status = ?, notes = ?, updated_at = ? WHERE id = ?")
          .run(menu.menu_month, menu.status, menu.notes, timestamp, id);
      } else {
        const result = this.db.prepare(`
          INSERT INTO nutrition_monthly_menus (menu_month, status, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(menu.menu_month, menu.status, menu.notes, timestamp, timestamp);
        menuId = Number(result.lastInsertRowid);
      }
      this.db.prepare("DELETE FROM nutrition_monthly_menu_entries WHERE menu_id = ?").run(menuId);
      const insert = this.db.prepare(`
        INSERT INTO nutrition_monthly_menu_entries (
          menu_id, row_order, meal_date, recipe_id, meal_name, notes
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);
      menu.entries.forEach((entry, index) => insert.run(
        menuId, index, entry.meal_date, entry.recipe_id, entry.meal_name, entry.notes
      ));
      this.db.exec("COMMIT");
      this.generateNutritionCostingsForMenu(menuId);
      return this.getNutritionMenu(menuId);
    } catch (error) {
      if (this.db.isTransaction) this.db.exec("ROLLBACK");
      throw error;
    }
  }

  deleteNutritionMenu(id) {
    const menu = this.getNutritionMenu(id);
    if (!menu) throw new Error("Monthly menu was not found.");
    this.db.prepare("DELETE FROM nutrition_monthly_menus WHERE id = ?").run(Number(id));
    return menu;
  }

  countNutritionCostings({ search = "", centerId = "", month = "" } = {}) {
    const filters = this.nutritionCostingFilters({ search, centerId, month });
    return Number(this.db.prepare(`SELECT COUNT(*) AS count FROM nutrition_menu_costings c ${filters.where}`)
      .get(...filters.args)?.count || 0);
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

  listNutritionCostings({ search = "", centerId = "", month = "", limit = 100, offset = 0 } = {}) {
    const { where, args } = this.nutritionCostingFilters({ search, centerId, month });
    return this.db.prepare(`
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
    `).all(...args, clampLimit(limit, 100, 1000), clampOffset(offset)).map(costing => decorateCosting(costing));
  }

  getNutritionCosting(id) {
    const costing = this.db.prepare("SELECT * FROM nutrition_menu_costings WHERE id = ?").get(Number(id));
    if (!costing) return null;
    const days = this.db.prepare(`
      SELECT * FROM nutrition_menu_costing_days WHERE costing_id = ? ORDER BY meal_date, row_order, id
    `).all(Number(id)).map(day => ({
      ...day,
      items: this.db.prepare(`
        SELECT * FROM nutrition_menu_costing_items WHERE costing_day_id = ? ORDER BY row_order, id
      `).all(day.id)
    }));
    return decorateCosting(costing, days);
  }

  saveNutritionCosting(input = {}) {
    const id = Number(input.id || 0) || 0;
    const existing = id ? this.getNutritionCosting(id) : null;
    const centerId = Number(input.center_id || input.centerId || existing?.center_id || 0) || 0;
    const center = this.getNutritionCenter(centerId);
    if (!center) throw new Error("Select a valid feeding center.");
    const costing = normalizeCosting({ ...input, center_id: center.id, center_name: center.center_name }, existing);
    if (!costing.week_start) throw new Error("Week start is required.");
    const duplicate = this.db.prepare("SELECT id FROM nutrition_menu_costings WHERE center_id = ? AND week_start = ? AND id <> ?")
      .get(costing.center_id, costing.week_start, id);
    if (duplicate) throw new Error("A costing sheet already exists for this center and week.");

    const timestamp = nowIso();
    this.db.exec("BEGIN");
    try {
      let costingId = id;
      if (existing) {
        this.db.prepare(`
          UPDATE nutrition_menu_costings SET center_id = ?, center_name = ?, menu_id = ?, report_month = ?,
            week_start = ?, week_end = ?, no_children = ?, inventory_rice = ?, inventory_manna = ?,
            inventory_vitameals = ?, budget_released = ?, status = ?, notes = ?, updated_at = ? WHERE id = ?
        `).run(
          costing.center_id, costing.center_name, costing.menu_id, costing.report_month,
          costing.week_start, costing.week_end, costing.no_children, costing.inventory_rice, costing.inventory_manna,
          costing.inventory_vitameals, costing.budget_released, costing.status, costing.notes, timestamp, id
        );
      } else {
        const result = this.db.prepare(`
          INSERT INTO nutrition_menu_costings (
            center_id, center_name, menu_id, report_month, week_start, week_end, no_children,
            inventory_rice, inventory_manna, inventory_vitameals, budget_released, status, notes,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          costing.center_id, costing.center_name, costing.menu_id, costing.report_month,
          costing.week_start, costing.week_end, costing.no_children, costing.inventory_rice, costing.inventory_manna,
          costing.inventory_vitameals, costing.budget_released, costing.status, costing.notes, timestamp, timestamp
        );
        costingId = Number(result.lastInsertRowid);
      }

      this.db.prepare("DELETE FROM nutrition_menu_costing_days WHERE costing_id = ?").run(costingId);
      const insertDay = this.db.prepare(`
        INSERT INTO nutrition_menu_costing_days (
          costing_id, row_order, meal_date, recipe_id, meal_name, kids_present
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);
      const insertItem = this.db.prepare(`
        INSERT INTO nutrition_menu_costing_items (
          costing_day_id, recipe_ingredient_id, row_order, ingredient_name, budget_quantity,
          budget_cost, actual_quantity, actual_cost
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      costing.days.forEach((day, dayIndex) => {
        const dayResult = insertDay.run(costingId, dayIndex, day.meal_date, day.recipe_id, day.meal_name, day.kids_present);
        const dayId = Number(dayResult.lastInsertRowid);
        day.items.forEach((item, itemIndex) => insertItem.run(
          dayId, item.recipe_ingredient_id, itemIndex, item.ingredient_name, item.budget_quantity,
          item.budget_cost, item.actual_quantity, item.actual_cost
        ));
      });
      this.db.exec("COMMIT");
      return this.getNutritionCosting(costingId);
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  deleteNutritionCosting(id) {
    const costing = this.getNutritionCosting(id);
    if (!costing) throw new Error("Menu costing sheet was not found.");
    this.db.prepare("DELETE FROM nutrition_menu_costings WHERE id = ?").run(Number(id));
    return costing;
  }

  generateNutritionCostingsForMenu(menuId) {
    const menu = this.getNutritionMenu(menuId);
    if (!menu) throw new Error("Monthly menu was not found.");
    const centers = this.listNutritionCenters({ limit: 500 });
    const weeks = groupMenuEntriesByWeek(menu.entries);
    let generated = 0;

    centers.forEach(center => {
      weeks.forEach(week => {
        const existingRow = this.db.prepare(`
          SELECT id FROM nutrition_menu_costings WHERE center_id = ? AND week_start = ?
        `).get(center.id, week.week_start);
        const existing = existingRow ? this.getNutritionCosting(existingRow.id) : null;
        if (existing && String(existing.status).toLowerCase() === "submitted") return;
        const actualByKey = new Map();
        (existing?.days || []).forEach(day => day.items.forEach(item => {
          actualByKey.set(`${day.meal_date}|${String(item.ingredient_name).trim().toLowerCase()}`, item);
        }));
        const days = week.entries.map((entry, dayIndex) => {
          const recipe = entry.recipe_id ? this.getNutritionRecipe(entry.recipe_id) : this.findNutritionRecipeByName(entry.meal_name);
          return {
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
          };
        });
        const budget = this.db.prepare(`
          SELECT approved_budget_per_child FROM nutrition_financial_budgets
          WHERE center_id = ? AND budget_year = ?
        `).get(center.id, Number(menu.menu_month.slice(0, 4)));
        const children = Number(existing?.no_children || center.capacity || 0);
        days.forEach(day => {
          const recipe = day.recipe_id ? this.getNutritionRecipe(day.recipe_id) : null;
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
        });
        const released = Number(budget?.approved_budget_per_child || 0) * children * days.length;
        this.saveNutritionCosting({
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
      });
    });
    return { menu: this.getNutritionMenu(menu.id), generated };
  }

  exportNutritionMenus() {
    return this.db.prepare("SELECT id FROM nutrition_monthly_menus ORDER BY menu_month").all()
      .map(row => this.getNutritionMenu(row.id));
  }

  exportNutritionCostings() {
    return this.db.prepare("SELECT id FROM nutrition_menu_costings ORDER BY week_start, center_name").all()
      .map(row => this.getNutritionCosting(row.id));
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

  nutritionDashboardSummary() {
    const stats = this.db.prepare(`
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
    `).get();

    const centerCounts = this.db.prepare(`
      SELECT
        COALESCE(NULLIF(trim(b.feeding_center), ''), NULLIF(trim(c.center_name), ''), 'No Center') AS label,
        COUNT(*) AS count
      FROM nutrition_beneficiaries b
      LEFT JOIN nutrition_centers c ON c.id = b.center_id
      GROUP BY label
      ORDER BY count DESC, label
      LIMIT 8
    `).all();

    const nutritionStatusCounts = this.db.prepare(`
      SELECT COALESCE(NULLIF(trim(current_nutrition_status), ''), 'Not Specified') AS label,
             COUNT(*) AS count
      FROM nutrition_beneficiaries
      GROUP BY label
      ORDER BY count DESC, label
      LIMIT 8
    `).all();

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
      nutritionFinancialReports: this.exportNutritionFinancialReports(),
      nutritionFinancialBudgets: this.db.prepare("SELECT * FROM nutrition_financial_budgets ORDER BY budget_year DESC, center_name").all(),
      nutritionRecipes: this.listNutritionRecipes({ limit: 500 }),
      nutritionMonthlyMenus: this.exportNutritionMenus(),
      nutritionMenuCostings: this.exportNutritionCostings(),
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
  NUTRITION_FINANCIAL_BUDGET_FIELDS,
  NUTRITION_FINANCIAL_CATEGORIES,
  NUTRITION_FINANCIAL_ENTRY_FIELDS,
  NUTRITION_FINANCIAL_REPORT_FIELDS,
  buildNutritionFinancialSummaryPayload,
  decorateNutritionFinancialReport,
  hashPassword,
  normalizeContactNumber,
  normalizeAmount,
  normalizeFieldValue,
  mergeNutritionHouseholdMembers,
  normalizeMonitoringReport,
  normalizeNutritionBeneficiary,
  normalizeNutritionCenter,
  normalizeNutritionFinancialBudget,
  normalizeNutritionFinancialEntry,
  normalizeNutritionFinancialReport,
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
