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

const CHOICE_OPTIONS = {
  paofi_active: ["Mayroon", "Wala"],
  with_business: ["Mayroon", "Wala"],
  business_duration: ["0 Experience", "< 1 Year", "1-3 Years", "> 3 Years"],
  livelihood_interest: ["Rag Making", "Dishwashing", "Sewing"],
  seminar: ["Oo", "Hindi"],
  willingness: ["Oo", "Hindi"],
  commit_days: ["1-2 Days", "3-4 Days"]
};

const CHAPEL_OPTIONS = [
  "Ascension",
  "Lourdes",
  "MDPP/Center",
  "Nazareno",
  "Benedict",
  "Sto. Nino",
  "Molave",
  "Sagrada",
  "San Isidro",
  "Litex",
  "Sta. Cruz",
  "ICC",
  "Fatima"
];

const DROPDOWN_OPTIONS = {
  field_h11: ["Female", "Male"],
  field_c12: CHAPEL_OPTIONS,
  current_group: ["Dishwashing", "Sewing", "Rag Making"],
  field_k30: ["None", "Feeding Program", "Scholarship Program", "Scholarship Program, Feeding Program"]
};

const FAMILY_DROPDOWN_OPTIONS = {
  list_d18: ["F", "M"],
  list_f18: [
    "Self",
    "Husband",
    "Wife",
    "Live-In Partner",
    "Parent",
    "Son",
    "Daughter",
    "Brother",
    "Sister",
    "Grandson",
    "Granddaughter",
    "Nephew",
    "Niece",
    "Uncle",
    "Aunt"
  ],
  list_h18: ["Single", "Married", "Widowed", "Separated"],
  list_j18: [
    "No. Formal Education",
    "Kindergarten",
    "Elementary Undergraduate",
    "Elementary Graduate",
    "High School Undergraduate",
    "High School Graduate",
    "College Undergraduate",
    "Bachelor's Degree",
    "TVET/TESDA Graduate"
  ]
};

const DATABASE_TABLE_FIELDS = [
  "date_updated",
  "control_no",
  "status",
  "last_name",
  "first_name",
  "middle_name",
  "field_c11",
  "field_h11",
  "field_l11",
  "field_c12",
  "field_c13",
  "field_c14",
  "paofi_active",
  "field_k30",
  "field_e32",
  "with_business",
  "field_j33",
  "business_duration",
  "livelihood_interest",
  "current_group",
  "field_c38",
  "field_f39",
  "seminar",
  "field_k43",
  "willingness",
  "commit_days"
];
const DATABASE_FILTER_FIELDS = [
  "status",
  "current_group",
  "field_h11",
  "field_c12",
  "field_c14",
  "paofi_active",
  "field_k30",
  "field_e32",
  "with_business",
  "field_j33",
  "business_duration",
  "livelihood_interest",
  "seminar",
  "willingness",
  "commit_days"
];

const MONITORING_PROJECT_OPTIONS = [
  "Dishwashing Liquid Production",
  "Rag Making",
  "Sewing",
  "Other"
];
const LIVELIHOOD_GROUP_OPTIONS = ["Dishwashing", "Sewing", "Rag Making"];
const NUTRITION_GENDER_OPTIONS = ["Female", "Male"];
const NUTRITION_PROFILE_STATUS_OPTIONS = ["New", "Old", "Active", "Inactive", "Graduated", "Transferred"];
const NUTRITION_REMARK_OPTIONS = ["Active", "Inactive", "For Follow-Up", "Transferred", "Graduated"];
const NUTRITION_STATUS_OPTIONS = ["Severely Underweight", "Underweight", "Normal", "Overweight"];
const NUTRITION_RELATIONSHIP_OPTIONS = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Grandfather",
  "Grandmother",
  "Guardian",
  "Feeding Child",
  "Other"
];
const NUTRITION_BASIC_GROUPS = [
  {
    title: "Profile Details",
    fields: [
      { name: "beneficiary_no", label: "Beneficiary No.", input: "text" },
      { name: "center_id", label: "Feeding Center", input: "center" }
    ]
  },
  {
    title: "Child's Name",
    fields: [
      { name: "child_last_name", label: "Last Name", input: "text", required: true },
      { name: "child_first_name", label: "First Name", input: "text", required: true },
      { name: "child_middle_name", label: "Middle Name", input: "text" }
    ]
  },
  {
    title: "Birth & Gender",
    fields: [
      { name: "birth_date", label: "Birth Date", input: "date" },
      { name: "age", label: "Age", input: "computed-age" },
      { name: "gender", label: "Gender", input: "select", options: NUTRITION_GENDER_OPTIONS }
    ]
  },
  {
    title: "Home & School",
    fields: [
      { name: "home_address", label: "Home Address", input: "textarea", wide: true },
      { name: "school", label: "School", input: "text" },
      { name: "grade_level", label: "Grade Level", input: "text" }
    ]
  }
];
const NUTRITION_FAMILY_GROUPS = [
  {
    title: "Mother's Details",
    fields: [
      { name: "mother_name", label: "Mother's Name", input: "text" },
      { name: "mother_occupation", label: "Mother's Occupation", input: "text" }
    ]
  },
  {
    title: "Father's Details",
    fields: [
      { name: "father_name", label: "Father's Name", input: "text" },
      { name: "father_occupation", label: "Father's Occupation", input: "text" }
    ]
  },
  {
    title: "Family Contact & Position",
    fields: [
      { name: "contact_no", label: "Contact No.", input: "tel" },
      { name: "sibling_count", label: "No. of Siblings", input: "number" },
      { name: "birth_order", label: "Birth Order", input: "text" }
    ]
  }
];
const NUTRITION_SNAPSHOT_GROUPS = [
  {
    title: "Admission Details",
    fields: [
      { name: "admission_date", label: "Admission Date", input: "date" },
      { name: "initial_age_months", label: "Initial Age (months)", input: "number" },
      { name: "initial_weight_kg", label: "Initial Weight (kg)", input: "decimal" },
      { name: "initial_height_cm", label: "Initial Height (cm)", input: "decimal" },
      { name: "initial_nutrition_status", label: "Initial Nutrition Status", input: "select", options: NUTRITION_STATUS_OPTIONS }
    ]
  },
  {
    title: "Current Nutrition Details (From Growth Monitoring)",
    fields: [
      { name: "current_update_date", label: "Date Updated", input: "growth-current" },
      { name: "current_age_months", label: "Current Age (months)", input: "growth-current" },
      { name: "current_weight_kg", label: "Current Weight (kg)", input: "growth-current" },
      { name: "current_height_cm", label: "Current Height (cm)", input: "growth-current" },
      { name: "current_nutrition_status", label: "Current Nutrition Status", input: "growth-current" }
    ]
  },
  {
    title: "Current Status & Overall Progress",
    fields: [
      { name: "profile_status", label: "Current Status", input: "select", options: NUTRITION_PROFILE_STATUS_OPTIONS },
      { name: "remarks", label: "Remarks", input: "select", options: NUTRITION_REMARK_OPTIONS },
      { name: "overall_weight_gain_kg", label: "Overall Weight Gain", input: "computed", unit: "kg" },
      { name: "overall_height_gain_cm", label: "Overall Height Gain", input: "computed", unit: "cm" }
    ]
  }
];
const NUTRITION_CENTER_FIELDS = [
  { name: "center_name", label: "Feeding Center Name", input: "text", required: true },
  { name: "status", label: "Status", input: "select", options: ["Active", "Inactive", "Under Development"] },
  { name: "location", label: "Location", input: "textarea", wide: true },
  { name: "coordinator", label: "Coordinator", input: "text" },
  { name: "contact_no", label: "Contact No.", input: "tel" },
  { name: "capacity", label: "Capacity", input: "number" },
  { name: "notes", label: "Notes", input: "textarea", wide: true }
];
const NUTRITION_HOUSEHOLD_FIELDS = [
  { name: "member_name", label: "Household Member" },
  { name: "age", label: "Age" },
  { name: "relationship", label: "Relationship" },
  { name: "occupation", label: "Occupation" }
];

const MONITORING_TABLES = {
  materials: {
    title: "A. Materials Received & Used",
    addLabel: "Add Material",
    columns: [
      { name: "entry_date", label: "Date", input: "date" },
      { name: "materials_received", label: "Materials Received", input: "text" },
      { name: "quantity", label: "Quantity", input: "text" },
      { name: "materials_used", label: "Materials Used", input: "text" },
      { name: "inventory", label: "Inventory", input: "text" }
    ]
  },
  sales: {
    title: "B. Production & Sales",
    addLabel: "Add Sale",
    columns: [
      { name: "entry_date", label: "Date", input: "date" },
      { name: "quantity_produced", label: "Quantity Produced", input: "text" },
      { name: "quantity_sold", label: "Quantity Sold", input: "text" },
      { name: "price_per_unit", label: "Price per Unit", input: "number" },
      { name: "total_sales", label: "Total Sales (P)", input: "number" }
    ]
  },
  expenses: {
    title: "C. Expenses",
    addLabel: "Add Expense",
    columns: [
      { name: "entry_date", label: "Date", input: "date" },
      { name: "payee", label: "Payee", input: "text" },
      { name: "description", label: "Description", input: "text" },
      { name: "amount", label: "Amount (P)", input: "number" }
    ]
  }
};

const PRINT_WIDE_FIELDS = new Set([
  "field_c13",
  "livelihood_interest",
  "field_c38",
  "field_f39",
  "seminar",
  "field_k43"
]);

const CAPITALIZE_FIELD_EXCLUSIONS = new Set([
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

const ICONS = {
  home: '<svg viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"></path></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m16.5 16.5 4.5 4.5"></path></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4l11-11-4-4L4 16v4Z"></path><path d="m13.5 6.5 4 4"></path></svg>',
  view: '<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  table: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 10h18M9 4v16M15 4v16"></path></svg>',
  monitoring: '<svg viewBox="0 0 24 24"><path d="M9 3h6l1 3h3v15H5V6h3l1-3Z"></path><path d="M9 13l2 2 4-5"></path><path d="M8 18h8"></path></svg>',
  bin: '<svg viewBox="0 0 24 24"><path d="M4 7h16"></path><path d="M10 11v6M14 11v6"></path><path d="m6 7 1 14h10l1-14"></path><path d="M9 7V4h6v3"></path></svg>',
  users: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.9"></path><path d="M16 3.1a4 4 0 0 1 0 7.8"></path></svg>',
  logout: '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><path d="M16 17l5-5-5-5"></path><path d="M21 12H9"></path></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z"></path><path d="M8 6h8"></path></svg>',
  finance: '<svg viewBox="0 0 24 24"><path d="M3 21h18"></path><path d="M6 21V9"></path><path d="M12 21V4"></path><path d="M18 21v-7"></path><path d="M8 9l4-5 4 10 3-3"></path></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z"></path></svg>',
  inventory: '<svg viewBox="0 0 24 24"><path d="M21 8 12 3 3 8l9 5 9-5Z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M12 13v8"></path></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M5 3h12l2 2v16H5V3Z"></path><path d="M8 3v6h8V3"></path><path d="M8 21v-7h8v7"></path></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>',
  print: '<svg viewBox="0 0 24 24"><path d="M7 9V3h10v6"></path><path d="M7 17H5a2 2 0 0 1-2-2v-4h18v4a2 2 0 0 1-2 2h-2"></path><path d="M7 14h10v7H7z"></path></svg>',
  export: '<svg viewBox="0 0 24 24"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7"></path><path d="M20 4v6h-6"></path></svg>'
};

const COMING_SOON_PAGES = {
  "nutrition-menu": {
    program: "Nutrition Program - Supplemental Feeding",
    title: "Monthly Menu & Weekly Costing",
    description: "Monthly menus connected to weekly menu costing and center schedules."
  },
  "nutrition-recipes": {
    program: "Nutrition Program - Supplemental Feeding",
    title: "Recipe Book",
    description: "Recipes, ingredients, serving sizes, and costing references."
  },
  "nutrition-budget": {
    program: "Nutrition Program - Supplemental Feeding",
    title: "Budget vs Actual",
    description: "Budget planning, actual expenses, and variance monitoring."
  },
  "scholarship-scholars": {
    program: "Scholarship Program",
    title: "Scholar Profiles",
    description: "Scholar records, school details, sponsor links, and academic status."
  },
  "scholarship-sponsors": {
    program: "Scholarship Program",
    title: "Sponsor Profiles",
    description: "Sponsor records, commitments, scholar assignments, and giving history."
  },
  "scholarship-donations": {
    program: "Scholarship Program",
    title: "Donations, Service Invoices & Official Receipts",
    description: "Donation tracking with printable service invoices and official receipts."
  },
  "scholarship-grades": {
    program: "Scholarship Program",
    title: "Grades Monitoring",
    description: "Academic performance tracking by grading period, term, and school year."
  },
  "scholarship-attendance": {
    program: "Scholarship Program",
    title: "Attendance Monitoring",
    description: "Attendance tracking for classes, PAOFI sessions, and required activities."
  },
  "scholarship-renewals": {
    program: "Scholarship Program",
    title: "Renewal Checklist",
    description: "Compliance and submission checklist for every scholar renewal cycle."
  },
  "scholarship-evaluations": {
    program: "Scholarship Program",
    title: "Scholar Evaluation",
    description: "Evaluation records, notes, scores, and renewal recommendations."
  },
  "health-patients": {
    program: "Health Program - Fr. Angelo Falardi Clinic",
    title: "Patient Profiles",
    description: "Patient records, demographic details, history, and clinic identifiers."
  },
  "health-monitoring": {
    program: "Health Program - Fr. Angelo Falardi Clinic",
    title: "Patient Monitoring",
    description: "Clinic visit records, follow-ups, and patient progress monitoring."
  },
  "health-supplies": {
    program: "Health Program - Fr. Angelo Falardi Clinic",
    title: "Supplies & Medicine Inventory",
    description: "Medicine and supplies inventory with stock movement and low-stock tracking."
  },
  "health-equipment": {
    program: "Health Program - Fr. Angelo Falardi Clinic",
    title: "Equipment Inventory",
    description: "Clinic equipment records, status, condition, and maintenance tracking."
  }
};

const state = {
  fields: [],
  sections: {},
  fieldMap: {},
  stats: null,
  currentRecord: null,
  currentMonitoringReport: null,
  currentNutritionBeneficiary: null,
  currentNutritionCenter: null,
  currentNutritionGrowthReport: null,
  nutritionCgsReference: null,
  monitoringBeneficiaries: [],
  pictureData: "",
  nutritionPictureData: "",
  databaseFilters: null,
  databaseFilterVisibility: {
    analytics: false,
    table: false
  },
  authToken: localStorage.getItem("lpdbAuthToken") || "",
  currentUser: null,
  route: "menu",
  routeId: "",
  toastTimer: null
};

const elements = {
  pageTitle: document.getElementById("pageTitle"),
  pageRoot: document.getElementById("pageRoot"),
  topbarActions: document.getElementById("topbarActions"),
  databaseLocation: document.getElementById("databaseLocation"),
  currentUser: document.getElementById("currentUser"),
  logoutButton: document.getElementById("logoutButton"),
  loginScreen: document.getElementById("loginScreen"),
  loginForm: document.getElementById("loginForm"),
  loginUsername: document.getElementById("loginUsername"),
  loginPassword: document.getElementById("loginPassword"),
  loginMessage: document.getElementById("loginMessage"),
  toast: document.getElementById("toast"),
  navItems: [...document.querySelectorAll(".nav-item")]
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function icon(name) {
  return ICONS[name] || "";
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function nutritionTodayDate() {
  const date = new Date();
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
}

function normalizeNutritionDateValue(value) {
  const text = String(value || "").trim();
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

function parseNutritionDate(value) {
  const normalized = normalizeNutritionDateValue(value);
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(normalized);
  if (!match) return null;

  const date = new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function nutritionDateInputValue(value) {
  const date = parseNutritionDate(value);
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function nutritionNumber(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const cleaned = text.replace(/[^\d.-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;

  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function formatNutritionGain(value, unit) {
  if (!Number.isFinite(value)) return "";
  const rounded = Math.round(value * 10) / 10;
  const formatted = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${formatted} ${unit}`;
}

function nutritionComputedValue(record = {}, name) {
  if (name === "overall_weight_gain_kg") {
    const initial = nutritionNumber(record.initial_weight_kg);
    const current = nutritionNumber(record.current_weight_kg);
    return initial === null || current === null ? "" : formatNutritionGain(current - initial, "kg");
  }

  if (name === "overall_height_gain_cm") {
    const initial = nutritionNumber(record.initial_height_cm);
    const current = nutritionNumber(record.current_height_cm);
    return initial === null || current === null ? "" : formatNutritionGain(current - initial, "cm");
  }

  return "";
}

function splitLines(value) {
  return String(value || "")
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeContactNumber(value) {
  let digits = String(value || "").replace(/\D/g, "");

  if (digits.startsWith("63") && digits.length === 12) {
    digits = `0${digits.slice(2)}`;
  }

  if (digits.startsWith("9") && digits.length === 10) {
    digits = `0${digits}`;
  }

  return digits.slice(0, 11);
}

function titleCaseValue(value) {
  return String(value || "")
    .trim()
    .replace(/[A-Za-z]+(?:'[A-Za-z]+)*\.?/g, word => {
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
    });
}

function sentenceCaseValue(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";

  return text.replace(/(^|[.!?]\s+|\n+\s*)([a-z])/g, (match, prefix, letter) => {
    return `${prefix}${letter.toUpperCase()}`;
  });
}

function shouldCapitalizeField(name) {
  return !CAPITALIZE_FIELD_EXCLUSIONS.has(name);
}

function normalizeFieldValue(name, value) {
  if (name === "field_l11") return normalizeContactNumber(value);
  if (shouldCapitalizeField(name)) return titleCaseValue(value);
  return value;
}

function fieldValue(name, value) {
  if (name === "field_l11") return normalizeContactNumber(value);
  if (shouldCapitalizeField(name)) return titleCaseValue(value);
  return String(value || "").trim();
}

function fullName(record = {}) {
  return [record.last_name, record.first_name, record.middle_name]
    .filter(Boolean)
    .join(", ") || "Unnamed record";
}

function beneficiarySignatureName(record = {}) {
  const name = [record.last_name, record.first_name, record.middle_name]
    .map(value => String(value || "").trim())
    .filter(Boolean)
    .join(", ");
  return name || "Name and Signature of the Applicant";
}

function initials(record = {}) {
  const first = String(record.first_name || "").trim()[0] || "L";
  const last = String(record.last_name || "").trim()[0] || "P";
  return `${first}${last}`.toUpperCase();
}

function field(name) {
  return state.fieldMap[name] || { name, label: name, input: "text" };
}

function showToast(message) {
  clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  state.toastTimer = setTimeout(() => {
    elements.toast.classList.remove("visible");
  }, 2600);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(state.authToken ? { Authorization: `Bearer ${state.authToken}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

function setAuthenticatedSession(token, user) {
  state.authToken = token || "";
  state.currentUser = user || null;

  if (state.authToken) {
    localStorage.setItem("lpdbAuthToken", state.authToken);
  } else {
    localStorage.removeItem("lpdbAuthToken");
  }

  document.body.classList.toggle("is-locked", !state.currentUser);
  elements.loginScreen.classList.toggle("hidden", Boolean(state.currentUser));
  document.querySelectorAll(".nav-admin").forEach(item => {
    item.classList.toggle("hidden", state.currentUser?.role !== "superadmin");
  });
  elements.currentUser.textContent = state.currentUser
    ? `${state.currentUser.display_name || state.currentUser.username} (${state.currentUser.role})`
    : "";
}

async function restoreSession() {
  if (!state.authToken) {
    setAuthenticatedSession("", null);
    return false;
  }

  try {
    const payload = await api("/api/auth/me");
    setAuthenticatedSession(state.authToken, payload.user);
    return true;
  } catch {
    setAuthenticatedSession("", null);
    return false;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  elements.loginMessage.textContent = "";

  try {
    const payload = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: elements.loginUsername.value,
        password: elements.loginPassword.value
      })
    });
    setAuthenticatedSession(payload.token, payload.user);
    elements.loginPassword.value = "";
    await loadApplication();
  } catch (error) {
    elements.loginMessage.textContent = error.message;
  }
}

async function logout() {
  try {
    if (state.authToken) {
      await api("/api/auth/logout", { method: "POST" });
    }
  } catch {
    // The local session is cleared even if the server is already gone.
  }

  setAuthenticatedSession("", null);
}

async function refreshStats() {
  state.stats = await api("/api/stats");
  elements.databaseLocation.textContent = state.stats.databasePath;
  return state.stats;
}

function blankRecord() {
  return state.fields.reduce((record, item) => {
    record[item.name] = "";
    return record;
  }, {});
}

async function makeNewRecord() {
  const payload = await api("/api/next-control-no");
  const record = blankRecord();
  record.date_updated = todayDate();
  record.control_no = payload.controlNo;
  record.status = "Active";
  return record;
}

async function loadRecord(id) {
  if (!id) return null;
  const payload = await api(`/api/records/${id}`);
  return payload.record;
}

function setTitle(title) {
  elements.pageTitle.textContent = title;
}

function actionButton(action) {
  const variant = action.variant ? ` ${action.variant}` : "";
  return `
    <button type="button" id="${escapeHtml(action.id)}" class="action-button${variant}">
      <span class="button-icon">${icon(action.icon)}</span>
      <span>${escapeHtml(action.label)}</span>
    </button>
  `;
}

function setTopbarActions(actions = []) {
  elements.topbarActions.innerHTML = actions.map(actionButton).join("");

  actions.forEach(action => {
    document.getElementById(action.id)?.addEventListener("click", action.onClick);
  });
}

function setActiveNav(route) {
  elements.navItems.forEach(item => {
    const isActive = item.dataset.route === route;
    item.classList.toggle("active", isActive);
    if (isActive) {
      const group = item.closest(".nav-program");
      if (group) group.open = true;
    }
  });
}

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  const [route = "menu", id = ""] = hash.split("/");
  return { route: route || "menu", id };
}

function navigate(route, id = "") {
  location.hash = id ? `#/${route}/${id}` : `#/${route}`;
}

async function renderRoute() {
  if (!state.currentUser) return;

  const parsed = parseRoute();
  if (parsed.route === "accounts" && state.currentUser.role !== "superadmin") {
    navigate("menu");
    return;
  }

  state.route = parsed.route;
  state.routeId = parsed.id;
  setActiveNav(parsed.route);

  try {
    if (parsed.route === "search") await renderSearchPage();
    else if (parsed.route === "editor") await renderEditorPage(parsed.id);
    else if (parsed.route === "viewer") await renderViewerPage(parsed.id);
    else if (parsed.route === "database") await renderDatabasePage();
    else if (parsed.route === "monitoring") await renderMonitoringPage(parsed.id);
    else if (parsed.route === "nutrition-profiles") await renderNutritionProfilesPage(parsed.id);
    else if (parsed.route === "nutrition-centers") await renderNutritionCentersPage(parsed.id);
    else if (parsed.route === "nutrition-growth") await renderNutritionGrowthPage(parsed.id);
    else if (parsed.route === "bin") await renderBinPage();
    else if (parsed.route === "accounts") await renderAccountsPage();
    else if (COMING_SOON_PAGES[parsed.route]) await renderComingSoonPage(parsed.route);
    else await renderMenuPage();
  } catch (error) {
    showToast(error.message);
  }
}

function renderComingSoonPage(route) {
  const page = COMING_SOON_PAGES[route];
  setTitle(page.title);
  setTopbarActions([
    { id: "comingSoonBack", label: "Dashboard", icon: "home", onClick: () => navigate("menu") }
  ]);

  elements.pageRoot.innerHTML = `
    <section class="coming-soon-page">
      <div class="coming-soon-mark">${icon("monitoring")}</div>
      <p class="eyebrow">${escapeHtml(page.program)}</p>
      <h2>${escapeHtml(page.title)}</h2>
      <strong>Under Development</strong>
      <p>${escapeHtml(page.description)}</p>
      <div class="coming-soon-note">
        This section is reserved for the next PAOFI Database program modules. Its sidebar entry is available now so the navigation structure reflects the full organization roadmap.
      </div>
    </section>
  `;
}

function recordAvatar(record) {
  if (record.picture_data) {
    return `<img class="avatar" src="${escapeHtml(record.picture_data)}" alt="">`;
  }

  return `<span class="avatar avatar-fallback">${escapeHtml(initials(record))}</span>`;
}

function recordCard(record, viewMode = "search") {
  const primaryRoute = viewMode === "edit" ? "editor" : "viewer";

  return `
    <article class="record-card" data-record-id="${record.id}">
      ${recordAvatar(record)}
      <div class="record-card-body">
        <strong>${escapeHtml(fullName(record))}</strong>
        <span>${escapeHtml(record.control_no || "")} | ${escapeHtml(record.status || "")}</span>
      </div>
      <div class="record-card-actions">
        <button type="button" class="icon-button" title="View" data-view-id="${record.id}">${icon("view")}</button>
        <button type="button" class="icon-button" title="Edit" data-edit-id="${record.id}">${icon("edit")}</button>
        <button type="button" class="icon-button primary-icon" title="${primaryRoute === "editor" ? "Edit" : "Open"}" data-open-route="${primaryRoute}" data-open-id="${record.id}">${icon("arrow")}</button>
      </div>
    </article>
  `;
}

function attachRecordOpenHandlers(scope = document) {
  scope.querySelectorAll("[data-view-id]").forEach(button => {
    button.addEventListener("click", () => navigate("viewer", button.dataset.viewId));
  });
  scope.querySelectorAll("[data-edit-id]").forEach(button => {
    button.addEventListener("click", () => navigate("editor", button.dataset.editId));
  });
  scope.querySelectorAll("[data-open-route]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.openRoute, button.dataset.openId));
  });
}

const ANALYTICS_COLORS = ["#1f7a4f", "#2f68b1", "#b7791f", "#6752b8", "#b33a3a", "#6c746f"];

function analyticsValue(record, name, fallback = "Not Specified") {
  const text = fieldValue(name, record?.[name]);
  if (!text || text === "-" || /^n\/?a$/i.test(text)) return fallback;
  return text;
}

function analyticsTokens(record, name, fallback = "Not Specified") {
  const tokens = fieldValue(name, record?.[name])
    .split(/\r?\n|,|;/)
    .map(item => item.trim())
    .filter(item => item && item !== "-" && !/^n\/?a$/i.test(item));

  return tokens.length ? tokens : [fallback];
}

function countBy(records, getter) {
  const counts = new Map();

  records.forEach(record => {
    const values = getter(record);
    const items = Array.isArray(values) ? values : [values];

    items.forEach(value => {
      const label = String(value || "").trim();
      if (!label) return;
      counts.set(label, (counts.get(label) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function analyticsCount(entries, label) {
  const target = label.toLowerCase();
  return entries.find(entry => entry.label.toLowerCase() === target)?.count || 0;
}

function analyticsPercent(count, total) {
  return total ? Math.round((count / total) * 100) : 0;
}

function analyticsPlural(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function parseAnalyticsNumber(value) {
  const number = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) ? number : null;
}

function ageGroup(age) {
  if (age < 18) return "Under 18";
  if (age <= 24) return "18-24";
  if (age <= 34) return "25-34";
  if (age <= 44) return "35-44";
  if (age <= 54) return "45-54";
  return "55+";
}

function parseAnalyticsDate(value) {
  const text = String(value || "").trim();
  const slashMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]));
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function latestUpdatedRecord(records) {
  return records.reduce((latest, record) => {
    const date = parseAnalyticsDate(record.date_updated) || parseAnalyticsDate(record.updated_at);
    if (!date) return latest;
    if (!latest || date > latest.date) {
      return {
        date,
        label: fieldValue("date_updated", record.date_updated) || fieldValue("updated_at", record.updated_at)
      };
    }
    return latest;
  }, null);
}

function buildAnalytics(records = []) {
  const activeRecords = records.filter(Boolean);
  const total = activeRecords.length;
  const ages = activeRecords
    .map(record => parseAnalyticsNumber(record.field_c11))
    .filter(age => age !== null && age > 0 && age < 120);
  const latest = latestUpdatedRecord(activeRecords);

  return {
    total,
    averageAge: ages.length ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0,
    latestUpdate: latest?.label || "No updates yet",
    statusCounts: countBy(activeRecords, record => analyticsValue(record, "status", "Active")),
    genderCounts: countBy(activeRecords, record => analyticsValue(record, "field_h11")),
    ageCounts: countBy(activeRecords, record => {
      const age = parseAnalyticsNumber(record.field_c11);
      return age !== null && age > 0 && age < 120 ? ageGroup(age) : "Not Specified";
    }),
    chapelCounts: countBy(activeRecords, record => analyticsValue(record, "field_c12")),
    circumstanceCounts: countBy(activeRecords, record => analyticsValue(record, "field_c14", "None")),
    beneficiaryCounts: countBy(activeRecords, record => analyticsValue(record, "paofi_active")),
    programCounts: countBy(activeRecords, record => analyticsTokens(record, "field_k30", "None")),
    livelihoodCounts: countBy(activeRecords, record => analyticsValue(record, "field_e32")),
    businessCounts: countBy(activeRecords, record => analyticsValue(record, "with_business")),
    existingBusinessCounts: countBy(activeRecords, record => analyticsValue(record, "field_j33", "None")),
    durationCounts: countBy(activeRecords, record => analyticsValue(record, "business_duration")),
    interestCounts: countBy(activeRecords, record => analyticsTokens(record, "livelihood_interest")),
    groupCounts: countBy(activeRecords, record => livelihoodGroups(record)),
    seminarCounts: countBy(activeRecords, record => analyticsValue(record, "seminar")),
    willingnessCounts: countBy(activeRecords, record => analyticsValue(record, "willingness")),
    commitmentCounts: countBy(activeRecords, record => analyticsValue(record, "commit_days"))
  };
}

function livelihoodGroups(record = {}) {
  const group = fieldValue("current_group", record.current_group);
  return group ? [group] : ["Not Specified"];
}

function recordMatchesLivelihoodGroup(record, selectedGroup) {
  if (!selectedGroup) return true;
  return livelihoodGroups(record).some(group => group.toLowerCase() === selectedGroup.toLowerCase());
}

function uniqueFieldOptions(records, name) {
  return [...new Set(records
    .map(record => fieldValue(name, record[name]))
    .filter(value => value && value !== "-" && !/^n\/?a$/i.test(value)))]
    .sort((left, right) => left.localeCompare(right));
}

function renderOptionList(options, selected = "") {
  return options.map(option => `
    <option value="${escapeHtml(option)}"${option === selected ? " selected" : ""}>${escapeHtml(option)}</option>
  `).join("");
}

function databaseFilterState() {
  return state.databaseFilters || {
    search: "",
    minAge: "",
    maxAge: "",
    fields: {}
  };
}

function setDatabaseFilterState(partial = {}) {
  state.databaseFilters = {
    ...databaseFilterState(),
    ...partial,
    fields: {
      ...databaseFilterState().fields,
      ...(partial.fields || {})
    }
  };
}

function databaseSearchMatches(record, search) {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const values = [
    fullName(record),
    ...DATABASE_TABLE_FIELDS.map(name => fieldValue(name, record[name]))
  ];

  return values.some(value => String(value || "").toLowerCase().includes(query));
}

function renderDatabaseFilterPanel(records, idPrefix, title) {
  const filters = databaseFilterState();
  const isOpen = state.databaseFilterVisibility[idPrefix] !== false;

  return `
    <section class="database-filter-panel${isOpen ? "" : " collapsed"}" data-filter-panel="${escapeHtml(idPrefix)}">
      <div class="panel-title-row">
        <h3>${escapeHtml(title)}</h3>
        <div class="filter-panel-actions">
          <button type="button" class="text-button" data-toggle-database-filters="${escapeHtml(idPrefix)}">
            ${isOpen ? "Hide Filters" : "Show Filters"}
          </button>
          <button type="button" class="text-button" data-clear-database-filters>Clear Filters</button>
        </div>
      </div>
      <div class="search-band compact database-filter-search">
        <span class="search-icon">${icon("search")}</span>
        <input data-db-filter-search type="search" value="${escapeHtml(filters.search)}" placeholder="Search any visible database field">
      </div>
      <div class="database-filter-body">
        <div class="database-filter-grid">
          <label>
            Min Age
            <input data-db-filter-min-age type="number" min="0" max="120" inputmode="numeric" value="${escapeHtml(filters.minAge)}">
          </label>
          <label>
            Max Age
            <input data-db-filter-max-age type="number" min="0" max="120" inputmode="numeric" value="${escapeHtml(filters.maxAge)}">
          </label>
          ${DATABASE_FILTER_FIELDS.map(name => {
            const meta = field(name);
            const options = uniqueFieldOptions(records, name);
            return `
              <label>
                ${escapeHtml(meta.label)}
                <select data-db-filter-field="${escapeHtml(name)}">
                  <option value="">All</option>
                  ${renderOptionList(options, filters.fields[name] || "")}
                </select>
              </label>
            `;
          }).join("")}
        </div>
      </div>
    </section>
  `;
}
function filterDatabaseRecords(records, filters) {
  const minAge = filters.minAge === "" ? null : Number(filters.minAge);
  const maxAge = filters.maxAge === "" ? null : Number(filters.maxAge);

  return records.filter(record => {
    const age = parseAnalyticsNumber(record.field_c11);

    if (!databaseSearchMatches(record, filters.search)) return false;
    if (minAge !== null && (age === null || age < minAge)) return false;
    if (maxAge !== null && (age === null || age > maxAge)) return false;
    if (Object.entries(filters.fields || {}).some(([name, value]) => {
      if (!value) return false;
      return fieldValue(name, record[name]) !== value;
    })) return false;

    return true;
  });
}

function renderDatabaseFilterSummary(filters) {
  const chips = [
    filters.minAge && `Min Age: ${filters.minAge}`,
    filters.maxAge && `Max Age: ${filters.maxAge}`,
    filters.search.trim() && `Search: ${filters.search.trim()}`,
    ...Object.entries(filters.fields || {})
      .filter(([, value]) => value)
      .map(([name, value]) => `${field(name).label}: ${value}`)
  ].filter(Boolean);

  return chips.length
    ? chips.map(chip => `<span>${escapeHtml(chip)}</span>`).join("")
    : "<span>All active records</span>";
}

function topAnalyticsEntry(entries) {
  return entries[0] || { label: "No Data", count: 0 };
}

function renderAnalyticsKpi(label, value, caption, tone = "") {
  return `
    <article class="analytics-kpi ${tone}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <em>${escapeHtml(caption)}</em>
    </article>
  `;
}

function renderBarList(entries, total, limit = 5) {
  const visible = entries.slice(0, limit);

  if (!visible.length) {
    return `<div class="analytics-empty">No data yet.</div>`;
  }

  return `
    <div class="bar-list">
      ${visible.map((entry, index) => {
        const percent = analyticsPercent(entry.count, total);
        const color = ANALYTICS_COLORS[index % ANALYTICS_COLORS.length];
        return `
          <div class="bar-row">
            <div class="bar-row-meta">
              <span>${escapeHtml(entry.label)}</span>
              <strong>${entry.count} (${percent}%)</strong>
            </div>
            <div class="bar-track">
              <span style="width: ${percent}%; background: ${color};"></span>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderDonutChart(entries, total, limit = 5) {
  const visible = entries.slice(0, limit);
  let offset = 25;

  const segments = visible.map((entry, index) => {
    const percent = total ? (entry.count / total) * 100 : 0;
    const segment = `
      <circle
        class="donut-segment"
        cx="21"
        cy="21"
        r="15.9155"
        stroke="${ANALYTICS_COLORS[index % ANALYTICS_COLORS.length]}"
        stroke-dasharray="${percent} ${100 - percent}"
        stroke-dashoffset="${offset}">
      </circle>
    `;
    offset -= percent;
    return segment;
  }).join("");

  return `
    <div class="donut-wrap">
      <div class="donut-frame">
        <svg class="donut-chart" viewBox="0 0 42 42" aria-hidden="true">
          <circle class="donut-bg" cx="21" cy="21" r="15.9155"></circle>
          ${segments}
        </svg>
        <div class="donut-center">
          <strong>${total}</strong>
          <span>records</span>
        </div>
      </div>
      <div class="chart-legend">
        ${visible.length ? visible.map((entry, index) => `
          <div>
            <span class="legend-swatch" style="background: ${ANALYTICS_COLORS[index % ANALYTICS_COLORS.length]};"></span>
            <strong>${escapeHtml(entry.label)}</strong>
            <em>${analyticsPercent(entry.count, total)}%</em>
          </div>
        `).join("") : `<div class="analytics-empty">No data yet.</div>`}
      </div>
    </div>
  `;
}

function renderAnalyticsCard(title, subtitle, body, className = "") {
  return `
    <article class="analytics-card ${className}">
      <div class="analytics-card-head">
        <h4>${escapeHtml(title)}</h4>
        <span>${escapeHtml(subtitle)}</span>
      </div>
      ${body}
    </article>
  `;
}

function renderMenuAnalytics(analytics) {
  const topInterest = topAnalyticsEntry(analytics.interestCounts);
  const topChapel = topAnalyticsEntry(analytics.chapelCounts);
  const femaleCount = analyticsCount(analytics.genderCounts, "Female");
  const willingCount = analyticsCount(analytics.willingnessCounts, "Oo");

  return `
    <section class="analytics-summary">
      <div class="analytics-title-row">
        <div>
          <span class="analytics-eyebrow">Analytics Snapshot</span>
          <h3>Livelihood Program Overview</h3>
        </div>
        <button type="button" class="text-button" data-menu-route="database">View Details</button>
      </div>
      <div class="analytics-kpi-grid">
        ${renderAnalyticsKpi("Average Age", analytics.averageAge ? String(analytics.averageAge) : "N/A", `${analytics.total} active records`, "green")}
        ${renderAnalyticsKpi("Top Interest", topInterest.label, analyticsPlural(topInterest.count, "record"), "blue")}
        ${renderAnalyticsKpi("Top Chapel", topChapel.label, analyticsPlural(topChapel.count, "record"), "amber")}
        ${renderAnalyticsKpi("Willing to Attend", `${willingCount}`, `${analyticsPercent(willingCount, analytics.total)}% of applicants`, "violet")}
      </div>
      <div class="analytics-preview-grid">
        ${renderAnalyticsCard("Gender Mix", `${femaleCount} female applicants`, renderBarList(analytics.genderCounts, analytics.total, 4))}
        ${renderAnalyticsCard("Livelihood Interest", "Top requested activities", renderBarList(analytics.interestCounts, analytics.total, 4))}
      </div>
    </section>
  `;
}

function renderNutritionDashboardSummary(overview = {}) {
  const centers = overview.centers || [];
  const beneficiaries = overview.beneficiaries || [];
  const analytics = buildNutritionAnalytics(beneficiaries, centers);
  const topCenter = topAnalyticsEntry(analytics.centerCounts);

  return `
    <section class="analytics-summary">
      <div class="analytics-title-row">
        <div>
          <span class="analytics-eyebrow">Nutrition Program</span>
          <h3>Supplemental Feeding Snapshot</h3>
        </div>
        <button type="button" class="text-button" data-menu-route="nutrition-profiles">Open Profiles</button>
      </div>
      <div class="analytics-kpi-grid">
        ${renderAnalyticsKpi("Child Profiles", String(analytics.total), `${analytics.active} active`, "green")}
        ${renderAnalyticsKpi("Feeding Centers", String(analytics.centers), `${analytics.activeCenters} active`, "blue")}
        ${renderAnalyticsKpi("Growth Reports", String((overview.growthReports || []).length), "monthly center reports", "violet")}
        ${renderAnalyticsKpi("Top Center", topCenter.label, analyticsPlural(topCenter.count, "child", "children"), "amber")}
      </div>
      <div class="analytics-preview-grid">
        ${renderAnalyticsCard("Current Nutrition Status", "Profile-level snapshot", renderBarList(analytics.nutritionStatusCounts, analytics.total, 4))}
        ${renderAnalyticsCard("Centers", "Children linked by center", renderBarList(analytics.centerCounts, analytics.total, 4))}
      </div>
    </section>
  `;
}

function renderDatabaseAnalytics(analytics) {
  const topInterest = topAnalyticsEntry(analytics.interestCounts);
  const topGroup = topAnalyticsEntry(analytics.groupCounts);
  const hasBusiness = analyticsCount(analytics.businessCounts, "Mayroon");
  const paofiBeneficiary = analyticsCount(analytics.beneficiaryCounts, "Mayroon");
  const attendedSeminar = analyticsCount(analytics.seminarCounts, "Oo");
  const willingCount = analyticsCount(analytics.willingnessCounts, "Oo");

  return `
    <section class="database-analytics">
      <div class="analytics-title-row">
        <div>
          <span class="analytics-eyebrow">Detailed Analytics</span>
          <h3>Database Visualization</h3>
        </div>
        <span class="analytics-note">Last updated: ${escapeHtml(analytics.latestUpdate)}</span>
      </div>
      <div class="analytics-kpi-grid detailed">
        ${renderAnalyticsKpi("Records Analyzed", String(analytics.total), "Current active database", "green")}
        ${renderAnalyticsKpi("Top Group", topGroup.label, analyticsPlural(topGroup.count, "record"), "blue")}
        ${renderAnalyticsKpi("Has Small Business", String(hasBusiness), `${analyticsPercent(hasBusiness, analytics.total)}% of applicants`, "amber")}
        ${renderAnalyticsKpi("PAOFI Beneficiary", String(paofiBeneficiary), `${analyticsPercent(paofiBeneficiary, analytics.total)}% of households`, "violet")}
        ${renderAnalyticsKpi("Attended Seminar", String(attendedSeminar), `${analyticsPercent(attendedSeminar, analytics.total)}% of applicants`, "red")}
        ${renderAnalyticsKpi("Ready for Training", String(willingCount), `${analyticsPercent(willingCount, analytics.total)}% willing`, "green")}
      </div>
      <div class="analytics-chart-grid">
        ${renderAnalyticsCard("Gender Distribution", "Applicant profile", renderDonutChart(analytics.genderCounts, analytics.total), "wide")}
        ${renderAnalyticsCard("Age Groups", `Average age: ${analytics.averageAge || "N/A"}`, renderBarList(analytics.ageCounts, analytics.total, 6))}
        ${renderAnalyticsCard("Livelihood Groups", "Dishwashing, Sewing, and Rag Making", renderBarList(analytics.groupCounts, analytics.total, 4))}
        ${renderAnalyticsCard("Livelihood Interest", `Top: ${topInterest.label}`, renderBarList(analytics.interestCounts, analytics.total, 6))}
        ${renderAnalyticsCard("Chapel Distribution", "Top represented chapels", renderBarList(analytics.chapelCounts, analytics.total, 7))}
        ${renderAnalyticsCard("PAOFI Beneficiary", "Household affiliation", renderDonutChart(analytics.beneficiaryCounts, analytics.total, 4))}
        ${renderAnalyticsCard("Training Readiness", "Willingness and seminars", `
          <div class="stacked-analytics">
            <div>
              <span>Willingness</span>
              ${renderBarList(analytics.willingnessCounts, analytics.total, 3)}
            </div>
            <div>
              <span>Seminar History</span>
              ${renderBarList(analytics.seminarCounts, analytics.total, 3)}
            </div>
          </div>
        `)}
        ${renderAnalyticsCard("Program History", "Previous PAOFI programs", renderBarList(analytics.programCounts, analytics.total, 6))}
        ${renderAnalyticsCard("Current Livelihood", "Existing income sources", renderBarList(analytics.livelihoodCounts, analytics.total, 6))}
        ${renderAnalyticsCard("Business Duration", "Experience before application", renderBarList(analytics.durationCounts, analytics.total, 5))}
        ${renderAnalyticsCard("Special Circumstance", "Declared circumstances", renderBarList(analytics.circumstanceCounts, analytics.total, 5))}
      </div>
    </section>
  `;
}

async function renderMenuPage() {
  setTitle("Programs Dashboard");
  setTopbarActions([
    { id: "menuExport", label: "Export", icon: "export", onClick: () => exportData().catch(error => showToast(error.message)) }
  ]);

  const [stats, recentPayload, binPayload, exportPayload, nutritionOverview] = await Promise.all([
    refreshStats(),
    api("/api/records?limit=5"),
    api("/api/bin"),
    api("/api/export"),
    api("/api/nutrition/overview")
  ]);
  const analytics = buildAnalytics(exportPayload.records || []);

  elements.pageRoot.innerHTML = `
    <section class="menu-hero">
      <div class="menu-hero-copy">
        <p class="eyebrow">Payatas Orione Foundation Inc.</p>
        <h2>Programs Database</h2>
        <strong>Integrated Program Records</strong>
        <span>"A simple effort can make a great impact"</span>
      </div>
      <div class="form-miniature" aria-hidden="true">
        <div></div><div></div><div></div><div></div>
        <div></div><div></div><div></div><div></div>
      </div>
    </section>

    <section class="stat-grid">
      <button type="button" class="stat-card" data-menu-route="database">
        <span>Active Records</span>
        <strong>${stats.active}</strong>
      </button>
      <button type="button" class="stat-card blue" data-menu-route="monitoring">
        <span>Monitoring Reports</span>
        <strong>${stats.monitoringReports || 0}</strong>
      </button>
      <button type="button" class="stat-card accent" data-menu-route="bin">
        <span>Record Bin</span>
        <strong>${stats.deleted}</strong>
      </button>
      <button type="button" class="stat-card" data-menu-route="editor">
        <span>Next Control No.</span>
        <strong id="nextControlNo">...</strong>
      </button>
      <button type="button" class="stat-card blue" data-menu-route="nutrition-profiles">
        <span>Nutrition Profiles</span>
        <strong>${stats.nutritionBeneficiaries || 0}</strong>
      </button>
      <button type="button" class="stat-card accent" data-menu-route="nutrition-centers">
        <span>Feeding Centers</span>
        <strong>${stats.nutritionCenters || 0}</strong>
      </button>
    </section>

    ${renderMenuAnalytics(analytics)}
    ${renderNutritionDashboardSummary(nutritionOverview)}

    <section class="menu-grid">
      ${menuTile("search", "search", "Search Records")}
      ${menuTile("editor", "edit", "New Application")}
      ${menuTile("viewer", "view", "Record Viewer")}
      ${menuTile("database", "table", "Database Table")}
      ${menuTile("monitoring", "monitoring", "Monitoring Reports")}
      ${menuTile("nutrition-profiles", "users", "Nutrition Profiles")}
      ${menuTile("nutrition-growth", "monitoring", "Growth Monitoring")}
      ${menuTile("nutrition-centers", "home", "Feeding Centers")}
    </section>

    <section class="split-layout">
      <div class="tool-panel">
        <div class="panel-title-row">
          <h3>Recent Records</h3>
          <button type="button" class="text-button" data-menu-route="database">Open Table</button>
        </div>
        <div class="record-stack">
          ${recentPayload.records.length ? recentPayload.records.map(record => recordCard(record)).join("") : emptyState("No records yet.")}
        </div>
      </div>
      <div class="tool-panel">
        <div class="panel-title-row">
          <h3>Record Bin</h3>
          <button type="button" class="text-button" data-menu-route="bin">Open Bin</button>
        </div>
        <div class="bin-preview">
          ${binPayload.records.length ? binPayload.records.slice(0, 5).map(binPreviewRow).join("") : emptyState("Bin is empty.")}
        </div>
      </div>
    </section>

    <footer class="dashboard-copyright">
      <span>&copy; 2026 Kerby Lloren</span>
      <span>&copy; Payatas Orione Foundation Inc.</span>
      <span>PAOFI Programs Database</span>
    </footer>
  `;

  const next = await api("/api/next-control-no");
  document.getElementById("nextControlNo").textContent = next.controlNo;

  document.querySelectorAll("[data-menu-route]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.menuRoute));
  });
  attachRecordOpenHandlers(elements.pageRoot);
}

function menuTile(route, iconName, label) {
  return `
    <button type="button" class="menu-tile" data-menu-route="${route}">
      <span>${icon(iconName)}</span>
      <strong>${label}</strong>
    </button>
  `;
}

function emptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function binPreviewRow(record) {
  return `
    <div class="bin-preview-row">
      <strong>${escapeHtml(record.display_name)}</strong>
      <span>${escapeHtml(record.control_no)} | ${escapeHtml(record.deleted_at)}</span>
    </div>
  `;
}

async function renderSearchPage() {
  setTitle("Search");
  setTopbarActions([
    { id: "searchNew", label: "New", icon: "plus", variant: "primary", onClick: () => navigate("editor") }
  ]);

  elements.pageRoot.innerHTML = `
    <section class="search-page">
      <div class="search-band">
        <span class="search-icon">${icon("search")}</span>
        <input id="searchInput" type="search" placeholder="Search control no. or name">
        <button id="searchButton" type="button" class="action-button primary">
          <span class="button-icon">${icon("search")}</span>
          <span>Search</span>
        </button>
      </div>
      <div id="searchResults" class="record-stack spacious"></div>
    </section>
  `;

  async function runSearch() {
    const search = encodeURIComponent(document.getElementById("searchInput").value.trim());
    const payload = await api(`/api/records?search=${search}&limit=100`);
    document.getElementById("searchResults").innerHTML = payload.records.length
      ? payload.records.map(record => recordCard(record)).join("")
      : emptyState("No matching records found.");
    attachRecordOpenHandlers(elements.pageRoot);
  }

  document.getElementById("searchButton").addEventListener("click", () => runSearch().catch(error => showToast(error.message)));
  document.getElementById("searchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      runSearch().catch(error => showToast(error.message));
    }
  });

  await runSearch();
}

function formatMoney(value) {
  const number = Number(value || 0);
  return `PHP ${number.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function moneyInputValue(value) {
  const number = Number(value || 0);
  return number ? String(number) : "";
}

function parseMoneyInput(value) {
  const number = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function currentReportMonth() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function reportMonthLabel(value) {
  const [year, month] = String(value || "").split("-").map(Number);
  if (!year || !month) return value || "No Month";

  return new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric"
  });
}

function blankMonitoringReport() {
  return {
    beneficiary_id: "",
    control_no: "",
    beneficiary_name: "",
    chapel: "",
    contact_no: "",
    project_type: "",
    report_month: currentReportMonth(),
    forwarded_balance: 0,
    total_sales: 0,
    total_expenses: 0,
    net_income: 0,
    materials: [],
    sales: [],
    expenses: [],
    challenges: "",
    success_stories: "",
    prepared_by: "",
    prepared_date: "",
    checked_by: "",
    checked_date: ""
  };
}

function projectFromBeneficiary(record = {}) {
  const text = `${record.livelihood_interest || ""} ${record.field_e32 || ""} ${record.field_j33 || ""}`.toLowerCase();
  if (text.includes("dishwashing")) return "Dishwashing Liquid Production";
  if (text.includes("rag") || text.includes("rug")) return "Rag Making";
  if (text.includes("sewing")) return "Sewing";
  return "";
}

async function loadMonitoringBeneficiaries() {
  const payload = await api("/api/records?limit=200&detail=full");
  state.monitoringBeneficiaries = payload.records || [];
  return state.monitoringBeneficiaries;
}

async function loadMonitoringReport(id) {
  const payload = await api(`/api/monitoring/reports/${id}`);
  return payload.report;
}

async function loadBeneficiaryMonitoringReports(recordId) {
  if (!recordId) return [];
  const payload = await api(`/api/monitoring/reports?beneficiaryId=${encodeURIComponent(recordId)}&limit=500`);
  return payload.reports || [];
}

function monitoringOverview(reports) {
  const totals = reports.reduce((summary, report) => {
    summary.sales += Number(report.total_sales || 0);
    summary.expenses += Number(report.total_expenses || 0);
    summary.movement += Number(report.total_sales || 0) - Number(report.total_expenses || 0);
    summary.months.add(report.report_month);

    const key = report.beneficiary_id || report.control_no || report.beneficiary_name || report.id;
    const existing = summary.latestByBeneficiary.get(key);
    if (!existing || String(report.report_month || "").localeCompare(String(existing.report_month || "")) > 0) {
      summary.latestByBeneficiary.set(key, report);
    }

    return summary;
  }, { sales: 0, expenses: 0, movement: 0, months: new Set(), latestByBeneficiary: new Map() });
  const monthCounts = countBy(reports, report => reportMonthLabel(report.report_month));
  const currentFund = [...totals.latestByBeneficiary.values()]
    .reduce((sum, report) => sum + Number(report.net_income || 0), 0);

  return {
    count: reports.length,
    sales: totals.sales,
    expenses: totals.expenses,
    movement: totals.movement,
    currentFund,
    months: totals.months.size,
    monthCounts
  };
}

function beneficiaryMonitoringSummary(reports = []) {
  const sortedReports = [...reports].sort((left, right) => String(left.report_month || "").localeCompare(String(right.report_month || "")));
  const totals = sortedReports.reduce((summary, report) => {
    summary.sales += Number(report.total_sales || 0);
    summary.expenses += Number(report.total_expenses || 0);
    summary.movement += Number(report.total_sales || 0) - Number(report.total_expenses || 0);
    return summary;
  }, { sales: 0, expenses: 0, movement: 0 });
  const latest = sortedReports[sortedReports.length - 1] || null;
  const profitableMonths = sortedReports
    .filter(report => Number(report.total_sales || 0) - Number(report.total_expenses || 0) > 0)
    .length;

  return {
    reports: sortedReports,
    count: sortedReports.length,
    months: sortedReports.map(report => report.report_month).filter(Boolean),
    latest,
    sales: totals.sales,
    expenses: totals.expenses,
    movement: totals.movement,
    latestBalance: latest ? Number(latest.net_income || 0) : 0,
    averageMovement: sortedReports.length ? totals.movement / sortedReports.length : 0,
    profitableMonths
  };
}

function renderBeneficiaryMonitoringSummary(reports = [], mode = "profile") {
  const summary = beneficiaryMonitoringSummary(reports);
  const latestLabel = summary.latest ? reportMonthLabel(summary.latest.report_month) : "No Reports Yet";
  const sectionClass = mode === "print" ? "print-monitoring-summary" : "beneficiary-monitoring-summary";

  return `
    <section class="${sectionClass}">
      <div class="beneficiary-monitoring-head">
        <div>
          <span class="analytics-eyebrow">Monitoring Summary</span>
          <h3>Monthly Progress, Financials & Inventory</h3>
        </div>
        <span>${escapeHtml(latestLabel)}</span>
      </div>
      ${summary.count ? `
        <div class="beneficiary-monitoring-kpis">
          ${renderMonitoringSummaryMetric("Reports", String(summary.count), `${summary.months.length} month${summary.months.length === 1 ? "" : "s"} filed`)}
          ${renderMonitoringSummaryMetric("Total Sales", formatMoney(summary.sales), "All submitted reports")}
          ${renderMonitoringSummaryMetric("Total Expenses", formatMoney(summary.expenses), "All submitted reports")}
          ${renderMonitoringSummaryMetric("Current Fund", formatMoney(summary.latestBalance), "Latest running balance")}
          ${renderMonitoringSummaryMetric("Net Movement", formatMoney(summary.movement), `${summary.profitableMonths} positive month${summary.profitableMonths === 1 ? "" : "s"}`)}
        </div>
        <div class="beneficiary-monitoring-table-wrap">
          <table class="beneficiary-monitoring-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Project</th>
                <th>Sales</th>
                <th>Expenses</th>
                <th>Running Income</th>
              </tr>
            </thead>
            <tbody>
              ${summary.reports.slice(-6).reverse().map(report => `
                <tr>
                  <td>${escapeHtml(reportMonthLabel(report.report_month))}</td>
                  <td>${escapeHtml(report.project_type || "")}</td>
                  <td>${escapeHtml(formatMoney(report.total_sales))}</td>
                  <td>${escapeHtml(formatMoney(report.total_expenses))}</td>
                  <td>${escapeHtml(formatMoney(report.net_income))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="beneficiary-monitoring-empty">No monitoring reports have been filed for this beneficiary yet.</div>
      `}
    </section>
  `;
}

function renderMonitoringSummaryMetric(label, value, caption) {
  return `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <em>${escapeHtml(caption)}</em>
    </article>
  `;
}

function renderMonitoringOverview(reports) {
  const overview = monitoringOverview(reports);

  return `
    <section class="monitoring-overview">
      <div class="analytics-title-row">
        <div>
          <span class="analytics-eyebrow">Monitoring Dashboard</span>
          <h3>Monthly Reports Summary</h3>
        </div>
        <span class="analytics-note">${overview.months} month${overview.months === 1 ? "" : "s"} covered</span>
      </div>
      <div class="analytics-kpi-grid">
        ${renderAnalyticsKpi("Reports Filed", String(overview.count), "Submitted monthly forms", "green")}
        ${renderAnalyticsKpi("Total Sales", formatMoney(overview.sales), "Production and sales", "blue")}
        ${renderAnalyticsKpi("Total Expenses", formatMoney(overview.expenses), "Reported expenses", "amber")}
        ${renderAnalyticsKpi("Current Fund", formatMoney(overview.currentFund), "Latest running balances", "violet")}
      </div>
      <div class="analytics-preview-grid">
        ${renderAnalyticsCard("Reports by Month", "Monthly submission volume", renderBarList(overview.monthCounts, overview.count, 6))}
        ${renderAnalyticsCard("Financial Position", "All monitoring reports", `
          <div class="finance-summary">
            <div><span>Sales</span><strong>${escapeHtml(formatMoney(overview.sales))}</strong></div>
            <div><span>Expenses</span><strong>${escapeHtml(formatMoney(overview.expenses))}</strong></div>
            <div><span>Net Movement</span><strong>${escapeHtml(formatMoney(overview.movement))}</strong></div>
          </div>
        `)}
      </div>
    </section>
  `;
}

function nutritionFullName(record = {}) {
  return [record.child_last_name, record.child_first_name, record.child_middle_name]
    .filter(Boolean)
    .join(", ") || "Unnamed child";
}

function nutritionInitials(record = {}) {
  const first = String(record.child_first_name || "").trim()[0] || "N";
  const last = String(record.child_last_name || "").trim()[0] || "P";
  return `${first}${last}`.toUpperCase();
}

function nutritionCenterName(record = {}) {
  return record.feeding_center || record.center_name || "No Center Assigned";
}

function nutritionText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function nutritionActiveRecords(records = []) {
  return records.filter(record => {
    const remarks = String(record.remarks || "").toLowerCase();
    const profileStatus = String(record.profile_status || "").toLowerCase();
    return remarks === "active" || profileStatus === "active";
  });
}

function buildNutritionAnalytics(beneficiaries = [], centers = []) {
  const active = nutritionActiveRecords(beneficiaries);

  return {
    total: beneficiaries.length,
    active: active.length,
    centers: centers.length,
    activeCenters: centers.filter(center => String(center.status || "").toLowerCase() === "active").length,
    genderCounts: countBy(beneficiaries, record => nutritionText(record.gender, "Not Specified")),
    centerCounts: countBy(beneficiaries, record => nutritionCenterName(record)),
    nutritionStatusCounts: countBy(beneficiaries, record => nutritionText(record.current_nutrition_status, "Not Specified")),
    remarkCounts: countBy(beneficiaries, record => nutritionText(record.remarks, "Not Specified")),
    gradeCounts: countBy(beneficiaries, record => nutritionText(record.grade_level, "Not Specified"))
  };
}

function renderNutritionAnalytics(beneficiaries = [], centers = []) {
  const analytics = buildNutritionAnalytics(beneficiaries, centers);
  const topCenter = topAnalyticsEntry(analytics.centerCounts);
  const topNutritionStatus = topAnalyticsEntry(analytics.nutritionStatusCounts);

  return `
    <section class="database-analytics nutrition-analytics">
      <div class="analytics-title-row">
        <div>
          <span class="analytics-eyebrow">Nutrition Program</span>
          <h3>Supplemental Feeding Overview</h3>
        </div>
        <span class="analytics-note">${analytics.active} active child${analytics.active === 1 ? "" : "ren"}</span>
      </div>
      <div class="analytics-kpi-grid">
        ${renderAnalyticsKpi("Beneficiaries", String(analytics.total), "Child profile records", "green")}
        ${renderAnalyticsKpi("Active Children", String(analytics.active), `${analyticsPercent(analytics.active, analytics.total)}% of profiles`, "blue")}
        ${renderAnalyticsKpi("Feeding Centers", String(analytics.centers), `${analytics.activeCenters} active centers`, "amber")}
        ${renderAnalyticsKpi("Top Status", topNutritionStatus.label, analyticsPlural(topNutritionStatus.count, "child", "children"), "violet")}
      </div>
      <div class="analytics-preview-grid">
        ${renderAnalyticsCard("Feeding Centers", `Top: ${topCenter.label}`, renderBarList(analytics.centerCounts, analytics.total, 5))}
        ${renderAnalyticsCard("Nutrition Status", "Current profile snapshot", renderBarList(analytics.nutritionStatusCounts, analytics.total, 5))}
      </div>
    </section>
  `;
}

async function loadNutritionOverview() {
  return api("/api/nutrition/overview");
}

async function loadNutritionCenters(search = "") {
  const payload = await api(`/api/nutrition/centers?search=${encodeURIComponent(search)}&limit=500`);
  return payload.centers || [];
}

async function loadNutritionBeneficiary(id) {
  const payload = await api(`/api/nutrition/beneficiaries/${id}`);
  return payload.beneficiary;
}

async function makeNewNutritionBeneficiary() {
  const payload = await api("/api/nutrition/next-beneficiary-no");
  return {
    beneficiary_no: payload.beneficiaryNo,
    feeding_center: "",
    picture_data: "",
    child_last_name: "",
    child_first_name: "",
    child_middle_name: "",
    birth_date: "",
    age: "",
    gender: "",
    home_address: "",
    school: "",
    grade_level: "",
    mother_name: "",
    mother_occupation: "",
    father_name: "",
    father_occupation: "",
    contact_no: "",
    sibling_count: "",
    birth_order: "",
    admission_date: nutritionTodayDate(),
    profile_status: "New",
    remarks: "Active",
    initial_age_months: "",
    initial_weight_kg: "",
    initial_height_cm: "",
    initial_nutrition_status: "",
    current_update_date: nutritionTodayDate(),
    current_age_months: "",
    current_weight_kg: "",
    current_height_cm: "",
    current_nutrition_status: "",
    household_members: []
  };
}

function parseNutritionRouteId(id = "") {
  if (!id) return { mode: "list", id: "" };
  if (id === "new") return { mode: "new", id: "" };
  if (id.startsWith("edit-")) return { mode: "edit", id: id.slice(5) };
  return { mode: "view", id };
}

async function renderNutritionProfilesPage(id = "") {
  const parsed = parseNutritionRouteId(id);

  if (parsed.mode !== "list") {
    await renderNutritionBeneficiaryDetailPage(parsed.id, parsed.mode !== "edit" && parsed.mode !== "new");
    return;
  }

  setTitle("Nutrition Beneficiary Profiles");
  setTopbarActions([
    { id: "nutritionNew", label: "New Child", icon: "plus", variant: "primary", onClick: () => navigate("nutrition-profiles", "new") },
    { id: "nutritionCenters", label: "Centers", icon: "home", onClick: () => navigate("nutrition-centers") }
  ]);

  const overview = await loadNutritionOverview();
  const centers = overview.centers || [];
  const beneficiaries = overview.beneficiaries || [];

  elements.pageRoot.innerHTML = `
    <div id="nutritionAnalyticsHost">${renderNutritionAnalytics(beneficiaries, centers)}</div>
    <section class="database-page nutrition-page">
      <div class="table-toolbar">
        <div class="search-band compact with-button">
          <span class="search-icon">${icon("search")}</span>
          <input id="nutritionSearchInput" type="search" placeholder="Search child, parent, school, center, or status">
          <button id="nutritionSearchButton" type="button" class="action-button">
            <span class="button-icon">${icon("search")}</span>
            <span>Search</span>
          </button>
        </div>
        <div class="database-filter-grid nutrition-filter-grid">
          <label>
            Feeding Center
            <select id="nutritionCenterFilter">
              <option value="">All Centers</option>
              ${centers.map(center => `<option value="${center.id}">${escapeHtml(center.center_name)}</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="table-toolbar-footer">
          <div class="filter-summary"><span>Nutrition beneficiary profiles</span></div>
          <span id="nutritionCount" class="table-count"></span>
        </div>
      </div>
      <div id="nutritionTableHost" class="database-table-host"></div>
    </section>
  `;

  async function loadProfiles() {
    const search = encodeURIComponent(document.getElementById("nutritionSearchInput").value.trim());
    const centerId = encodeURIComponent(document.getElementById("nutritionCenterFilter").value);
    const payload = await api(`/api/nutrition/beneficiaries?search=${search}&centerId=${centerId}&limit=500`);
    const records = payload.beneficiaries || [];
    document.getElementById("nutritionAnalyticsHost").innerHTML = renderNutritionAnalytics(records, centers);
    renderNutritionProfileTable(records);
  }

  document.getElementById("nutritionSearchButton").addEventListener("click", () => loadProfiles().catch(error => showToast(error.message)));
  document.getElementById("nutritionSearchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadProfiles().catch(error => showToast(error.message));
    }
  });
  document.getElementById("nutritionCenterFilter").addEventListener("change", () => loadProfiles().catch(error => showToast(error.message)));

  renderNutritionProfileTable(beneficiaries);
}

function renderNutritionProfileTable(records = []) {
  document.getElementById("nutritionCount").textContent = `${records.length} shown`;

  if (!records.length) {
    document.getElementById("nutritionTableHost").innerHTML = emptyState("No nutrition beneficiary profiles found.");
    return;
  }

  document.getElementById("nutritionTableHost").innerHTML = `
    <div class="data-table-scroll">
      <table class="data-table nutrition-table">
        <thead>
          <tr>
            <th class="sticky-column">Actions</th>
            <th>Beneficiary No.</th>
            <th>Child's Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Feeding Center</th>
            <th>School</th>
            <th>Grade Level</th>
            <th>Contact No.</th>
            <th>Current Nutrition Status</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(record => `
            <tr>
              <td class="sticky-column">
                <div class="table-actions">
                  <button type="button" class="icon-button" title="View" data-nutrition-view-id="${record.id}">${icon("view")}</button>
                  <button type="button" class="icon-button" title="Edit" data-nutrition-edit-id="${record.id}">${icon("edit")}</button>
                </div>
              </td>
              <td>${escapeHtml(record.beneficiary_no || "")}</td>
              <td>${escapeHtml(nutritionFullName(record))}</td>
              <td>${escapeHtml(record.age || "")}</td>
              <td>${escapeHtml(record.gender || "")}</td>
              <td>${escapeHtml(nutritionCenterName(record))}</td>
              <td>${escapeHtml(record.school || "")}</td>
              <td>${escapeHtml(record.grade_level || "")}</td>
              <td>${escapeHtml(record.contact_no || "")}</td>
              <td>${escapeHtml(record.current_nutrition_status || "")}</td>
              <td>${escapeHtml(record.remarks || "")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
  attachNutritionProfileTableHandlers(elements.pageRoot);
}

function attachNutritionProfileTableHandlers(scope = document) {
  scope.querySelectorAll("[data-nutrition-view-id]").forEach(button => {
    button.addEventListener("click", () => navigate("nutrition-profiles", button.dataset.nutritionViewId));
  });
  scope.querySelectorAll("[data-nutrition-edit-id]").forEach(button => {
    button.addEventListener("click", () => navigate("nutrition-profiles", `edit-${button.dataset.nutritionEditId}`));
  });
}

async function renderNutritionBeneficiaryDetailPage(id = "", readonly = true) {
  const isNew = !id;
  const [record, centers] = await Promise.all([
    isNew ? makeNewNutritionBeneficiary() : loadNutritionBeneficiary(id),
    loadNutritionCenters()
  ]);
  state.currentNutritionBeneficiary = record;
  state.nutritionPictureData = record.picture_data || "";

  setTitle(isNew ? "New Nutrition Beneficiary" : readonly ? "Nutrition Beneficiary Profile" : "Edit Nutrition Beneficiary");
  setTopbarActions([
    { id: "nutritionBack", label: "Profiles", icon: "table", onClick: () => navigate("nutrition-profiles") },
    ...(readonly && record.id ? [
      { id: "nutritionPrint", label: "Print", icon: "print", onClick: () => printNutritionBeneficiary(record) },
      { id: "nutritionEdit", label: "Edit", icon: "edit", variant: "primary", onClick: () => navigate("nutrition-profiles", `edit-${record.id}`) }
    ] : [
      { id: "nutritionOcr", label: "OCR Import", icon: "search", onClick: () => document.getElementById("nutritionOcrInput")?.click() },
      { id: "nutritionPrint", label: "Print", icon: "print", onClick: () => printNutritionBeneficiary(collectNutritionBeneficiary()) },
      { id: "nutritionSave", label: "Save", icon: "save", variant: "primary", onClick: () => saveCurrentNutritionBeneficiary().catch(error => showToast(error.message)) }
    ]),
    ...(!isNew && !readonly ? [
      { id: "nutritionDelete", label: "Delete", icon: "bin", variant: "danger", onClick: () => deleteCurrentNutritionBeneficiary(record.id).catch(error => showToast(error.message)) }
    ] : [])
  ]);

  elements.pageRoot.innerHTML = renderNutritionBeneficiaryForm(record, centers, readonly);
  if (!readonly) attachNutritionBeneficiaryFormHandlers();
}

function renderNutritionBeneficiaryForm(record, centers, readonly) {
  return `
    <section class="application-paper nutrition-paper ${readonly ? "readonly" : "editable"}">
      <header class="form-heading nutrition-form-heading">
        <div>
          <p class="eyebrow">Payatas Orione Foundation Inc.</p>
          <h2>Nutrition Program - Supplemental Feeding</h2>
          <p>${escapeHtml(nutritionCenterName(record))}</p>
          <h3>Beneficiary Profile</h3>
        </div>
        ${renderNutritionPictureBlock(record, readonly)}
      </header>
      ${readonly ? "" : renderNutritionOcrPanel()}
      ${nutritionGroupedFormSection("I. Child's Basic Information", NUTRITION_BASIC_GROUPS, record, centers, readonly)}
      ${nutritionGroupedFormSection("II. Family Background", NUTRITION_FAMILY_GROUPS, record, centers, readonly)}
      ${renderNutritionHouseholdSection(record, readonly)}
      ${nutritionGroupedFormSection("III. Admission & Nutrition Snapshot", NUTRITION_SNAPSHOT_GROUPS, record, centers, readonly)}
    </section>
  `;
}

function renderNutritionPictureBlock(record, readonly) {
  const source = readonly ? record.picture_data : state.nutritionPictureData;
  const preview = source
    ? `<img src="${escapeHtml(source)}" alt="Nutrition beneficiary picture">`
    : `<span>${readonly ? "No picture" : "Picture"}</span>`;

  if (readonly) {
    return `<div class="photo-box"><div class="photo-preview">${preview}</div></div>`;
  }

  return `
    <div class="photo-box editable-photo ${source ? "has-photo" : ""}" id="nutritionPhotoDropZone">
      <div id="nutritionPhotoPreview" class="photo-preview">${preview}</div>
      <div class="photo-actions">
        <label for="nutritionPictureInput" class="text-button photo-choose-button">Choose</label>
        <button id="removeNutritionPictureButton" type="button" class="icon-button photo-remove-button" title="Remove picture" aria-label="Remove picture" ${source ? "" : "hidden"}>
          ${icon("bin")}
        </button>
      </div>
      <input id="nutritionPictureInput" type="file" accept="image/*">
    </div>
  `;
}

function renderNutritionOcrPanel() {
  return `
    <section class="ocr-status-panel" id="nutritionOcrPanel" hidden>
      <input id="nutritionOcrInput" type="file" accept="image/*,application/pdf" hidden>
      <div class="ocr-status-row">
        <span class="search-icon">${icon("search")}</span>
        <div>
          <strong id="nutritionOcrStatus">OCR Import</strong>
          <span id="nutritionOcrSummary"></span>
        </div>
      </div>
      <details id="nutritionOcrDetails" hidden>
        <summary>OCR Text</summary>
        <pre id="nutritionOcrText"></pre>
      </details>
    </section>
  `;
}

function nutritionFormSection(title, fields, record, centers, readonly) {
  return `
    <section class="paper-section">
      <h3>${escapeHtml(title)}</h3>
      <div class="paper-grid">
        ${fields.map(meta => renderNutritionField(meta, record, centers, readonly)).join("")}
      </div>
    </section>
  `;
}

function nutritionGroupedFormSection(title, groups, record, centers, readonly) {
  return `
    <section class="paper-section">
      <h3>${escapeHtml(title)}</h3>
      <div class="nutrition-field-groups">
        ${groups.map(group => `
          <div class="nutrition-field-group">
            <h4>${escapeHtml(group.title)}</h4>
            <div class="paper-grid">
              ${group.fields.map(meta => renderNutritionField(meta, record, centers, readonly)).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function nutritionSelectOptions(options, selected = "", includeBlank = true) {
  const choices = [...options];
  if (selected && !choices.includes(selected)) choices.push(selected);

  return `
    ${includeBlank ? `<option value="" ${selected ? "" : "selected"}></option>` : ""}
    ${choices.map(option => `<option value="${escapeHtml(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
  `;
}

function renderNutritionField(meta, record, centers, readonly) {
  const value = meta.input === "date"
    ? normalizeNutritionDateValue(record[meta.name])
    : meta.input === "computed-age"
      ? nutritionAgeText(record.birth_date)
    : meta.input === "computed"
      ? nutritionComputedValue(record, meta.name)
    : nutritionText(record[meta.name]);
  const isWide = meta.wide || meta.input === "textarea";

  if (meta.input === "computed-age") {
    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label>${escapeHtml(meta.label)}</label>
        <div class="display-value computed-value" data-nutrition-computed-age="${escapeHtml(meta.name)}">${escapeHtml(value) || "&nbsp;"}</div>
      </div>
    `;
  }

  if (meta.input === "computed") {
    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label>${escapeHtml(meta.label)}</label>
        <div class="display-value computed-value" data-nutrition-computed="${escapeHtml(meta.name)}">${escapeHtml(value) || "&nbsp;"}</div>
      </div>
    `;
  }

  if (meta.input === "growth-current") {
    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label>${escapeHtml(meta.label)}</label>
        <div class="display-value growth-derived-value">${escapeHtml(value) || "&nbsp;"}</div>
      </div>
    `;
  }

  if (readonly) {
    const displayValue = meta.input === "center"
      ? nutritionCenterName(record)
      : value;

    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label>${escapeHtml(meta.label)}</label>
        <div class="display-value">${escapeHtml(displayValue).replaceAll("\n", "<br>") || "&nbsp;"}</div>
      </div>
    `;
  }

  if (meta.input === "center") {
    const selectedId = Number(record.center_id || 0);
    const hasSelected = centers.some(center => Number(center.id) === selectedId);

    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label for="nutrition_${escapeHtml(meta.name)}">${escapeHtml(meta.label)}</label>
        <select id="nutrition_${escapeHtml(meta.name)}" data-nutrition-field="${escapeHtml(meta.name)}">
          <option value="" ${selectedId ? "" : "selected"}></option>
          ${!hasSelected && selectedId ? `<option value="${selectedId}" selected>${escapeHtml(record.feeding_center || `Center ${selectedId}`)}</option>` : ""}
          ${centers.map(center => `<option value="${center.id}" ${Number(center.id) === selectedId ? "selected" : ""}>${escapeHtml(center.center_name)}</option>`).join("")}
        </select>
      </div>
    `;
  }

  if (meta.input === "select") {
    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label for="nutrition_${escapeHtml(meta.name)}">${escapeHtml(meta.label)}</label>
        <select id="nutrition_${escapeHtml(meta.name)}" data-nutrition-field="${escapeHtml(meta.name)}">
          ${nutritionSelectOptions(meta.options || [], value, true)}
        </select>
      </div>
    `;
  }

  if (meta.input === "textarea") {
    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label for="nutrition_${escapeHtml(meta.name)}">${escapeHtml(meta.label)}</label>
        <textarea id="nutrition_${escapeHtml(meta.name)}" rows="3" data-nutrition-field="${escapeHtml(meta.name)}" data-capitalize="words" autocapitalize="words">${escapeHtml(value)}</textarea>
      </div>
    `;
  }

  const type = meta.input === "tel" || meta.input === "date" ? "text" : meta.input === "decimal" ? "number" : meta.input || "text";
  const attrs = [
    `id="nutrition_${escapeHtml(meta.name)}"`,
    `type="${type}"`,
    `data-nutrition-field="${escapeHtml(meta.name)}"`,
    `value="${escapeHtml(value)}"`,
    meta.input === "tel" ? 'inputmode="numeric" maxlength="11" autocomplete="tel"' : "",
    meta.input === "date" ? 'inputmode="numeric" placeholder="MM/DD/YYYY"' : "",
    meta.input === "number" ? 'inputmode="numeric" min="0"' : "",
    meta.input === "decimal" ? 'step="0.1" min="0"' : "",
    shouldNutritionCapitalizeField(meta.name) ? 'data-capitalize="words" autocapitalize="words"' : "",
    meta.required ? "required" : ""
  ].filter(Boolean).join(" ");

  return `
    <div class="paper-field ${isWide ? "wide" : ""}">
      <label for="nutrition_${escapeHtml(meta.name)}">${escapeHtml(meta.label)}</label>
      <input ${attrs}>
    </div>
  `;
}

function shouldNutritionCapitalizeField(name) {
  return ![
    "beneficiary_no",
    "center_id",
    "picture_data",
    "birth_date",
    "age",
    "contact_no",
    "sibling_count",
    "admission_date",
    "initial_age_months",
    "initial_weight_kg",
    "initial_height_cm",
    "current_update_date",
    "current_age_months",
    "current_weight_kg",
    "current_height_cm"
  ].includes(name);
}

function ageSortNumber(value) {
  const text = String(value || "").replace(/\D/g, "");
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

  const leftName = String(left?.member_name || left?.list_a18 || "").toLowerCase();
  const rightName = String(right?.member_name || right?.list_a18 || "").toLowerCase();
  return leftName.localeCompare(rightName);
}

function normalizeNutritionHouseholdRow(row = {}) {
  return {
    member_name: titleCaseValue(row.member_name),
    age: normalizeNutritionInputValue("age", row.age || ""),
    relationship: titleCaseValue(row.relationship),
    occupation: titleCaseValue(row.occupation)
  };
}

function nutritionHouseholdRowHasValue(row = {}) {
  return NUTRITION_HOUSEHOLD_FIELDS.some(fieldMeta => String(row[fieldMeta.name] || "").trim());
}

function nutritionHouseholdKey(row = {}) {
  const relationship = titleCaseValue(row.relationship).toLowerCase();
  const name = titleCaseValue(row.member_name).toLowerCase();

  if (relationship === "father" || relationship === "mother") return `parent:${relationship}`;
  if (name) return `name:${name}`;
  return relationship ? `relationship:${relationship}:${titleCaseValue(row.occupation).toLowerCase()}` : "";
}

function mergeNutritionHouseholdRows(...rowGroups) {
  const merged = new Map();

  rowGroups.flat().forEach(rawRow => {
    const row = normalizeNutritionHouseholdRow(rawRow);
    if (!nutritionHouseholdRowHasValue(row)) return;

    const key = nutritionHouseholdKey(row);
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

function ensureNutritionParentHouseholdRows(record = {}, rows = []) {
  const prepared = (Array.isArray(rows) ? rows : [])
    .map(normalizeNutritionHouseholdRow)
    .filter(nutritionHouseholdRowHasValue);

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

  upsertParent("Mother", record.mother_name, record.mother_occupation);
  upsertParent("Father", record.father_name, record.father_occupation);

  return mergeNutritionHouseholdRows(prepared);
}

function nutritionHouseholdRows(record = {}) {
  return ensureNutritionParentHouseholdRows(record, record.household_members || []);
}

function renderNutritionHouseholdCell(fieldMeta, row, rowIndex, readonly) {
  const value = nutritionText(row[fieldMeta.name]);

  if (readonly) return `<td>${escapeHtml(value)}</td>`;

  if (fieldMeta.name === "relationship") {
    return `
      <td>
        <select data-nutrition-household-field="${escapeHtml(fieldMeta.name)}" data-nutrition-household-row="${rowIndex}">
          ${nutritionSelectOptions(NUTRITION_RELATIONSHIP_OPTIONS, value, true)}
        </select>
      </td>
    `;
  }

  const type = fieldMeta.name === "age" ? "number" : "text";
  return `
    <td>
      <input type="${type}" data-nutrition-household-field="${escapeHtml(fieldMeta.name)}" data-nutrition-household-row="${rowIndex}" value="${escapeHtml(value)}"${fieldMeta.name === "age" ? ' inputmode="numeric" min="0"' : ' data-capitalize="words" autocapitalize="words"'}>
    </td>
  `;
}

function renderNutritionHouseholdRow(row, rowIndex, readonly) {
  return `
    <tr data-nutrition-household-container="${rowIndex}">
      ${NUTRITION_HOUSEHOLD_FIELDS.map(fieldMeta => renderNutritionHouseholdCell(fieldMeta, row, rowIndex, readonly)).join("")}
      ${readonly ? "" : `
        <td class="row-remove-cell">
          <button type="button" class="icon-button" title="Remove household member" data-remove-nutrition-household-row="${rowIndex}">
            ${icon("bin")}
          </button>
        </td>
      `}
    </tr>
  `;
}

function renderNutritionHouseholdSection(record, readonly) {
  const rows = nutritionHouseholdRows(record);
  const headers = NUTRITION_HOUSEHOLD_FIELDS.map(fieldMeta => fieldMeta.label);
  const bodyRows = rows.length
    ? rows.map((row, rowIndex) => renderNutritionHouseholdRow(row, rowIndex, readonly)).join("")
    : `<tr class="family-empty-row"><td colspan="${NUTRITION_HOUSEHOLD_FIELDS.length + (readonly ? 0 : 1)}">No household members added.</td></tr>`;

  return `
    <section class="paper-section">
      <div class="family-section-header">
        <h3>Household Members</h3>
        ${readonly ? "" : `
          <button type="button" id="addNutritionHouseholdButton" class="icon-button family-add-button" title="Add household member" aria-label="Add household member">
            ${icon("plus")}
          </button>
        `}
      </div>
      <div class="family-table-wrap">
        <table class="family-table nutrition-household-table">
          <thead>
            <tr>
              ${headers.map(header => `<th>${escapeHtml(header)}</th>`).join("")}
              ${readonly ? "" : `<th class="row-remove-head">Remove</th>`}
            </tr>
          </thead>
          <tbody id="nutritionHouseholdBody">
            ${bodyRows}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function normalizeNutritionInputValue(name, value) {
  if (name === "contact_no") return normalizeContactNumber(value);
  if ([
    "age",
    "sibling_count",
    "initial_age_months",
    "current_age_months"
  ].includes(name)) {
    return String(value || "").replace(/\D/g, "").slice(0, 3);
  }
  if ([
    "initial_weight_kg",
    "initial_height_cm",
    "current_weight_kg",
    "current_height_cm"
  ].includes(name)) {
    const number = Number(String(value || "").replace(/[^\d.]/g, ""));
    return Number.isFinite(number) && String(value || "").trim() ? String(number) : "";
  }
  if ([
    "beneficiary_no",
    "center_id"
  ].includes(name)) {
    return String(value || "").trim();
  }
  if ([
    "birth_date",
    "admission_date",
    "current_update_date"
  ].includes(name)) {
    return normalizeNutritionDateValue(value);
  }
  return titleCaseValue(value);
}

function setNutritionPictureData(data) {
  state.nutritionPictureData = data;

  const preview = document.getElementById("nutritionPhotoPreview");
  if (preview) {
    preview.innerHTML = data
      ? `<img src="${escapeHtml(data)}" alt="Nutrition beneficiary picture">`
      : "<span>Picture</span>";
  }

  const dropZone = document.getElementById("nutritionPhotoDropZone");
  dropZone?.classList.toggle("has-photo", Boolean(data));
  dropZone?.classList.remove("drag-over");

  const removeButton = document.getElementById("removeNutritionPictureButton");
  if (removeButton) removeButton.hidden = !data;
}

function readNutritionPictureFile(file) {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Choose an image file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => setNutritionPictureData(String(reader.result || ""));
  reader.readAsDataURL(file);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      let dataUrl = String(reader.result || "");
      if (dataUrl.startsWith("data:;base64,") && file.name.toLowerCase().endsWith(".pdf")) {
        dataUrl = dataUrl.replace("data:;base64,", "data:application/pdf;base64,");
      }
      resolve(dataUrl);
    };
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

function nextNutritionHouseholdRowIndex() {
  const indexes = [...elements.pageRoot.querySelectorAll("[data-nutrition-household-row]")]
    .map(input => Number(input.dataset.nutritionHouseholdRow))
    .filter(Number.isFinite);

  return indexes.length ? Math.max(...indexes) + 1 : 0;
}

function addNutritionHouseholdRow() {
  const body = document.getElementById("nutritionHouseholdBody");
  if (!body) return;

  body.querySelector(".family-empty-row")?.remove();
  const rowIndex = nextNutritionHouseholdRowIndex();
  body.insertAdjacentHTML("beforeend", renderNutritionHouseholdRow({}, rowIndex, false));
  attachCapitalizationHandlers(body.rows[body.rows.length - 1]);
  attachNutritionHouseholdRemoveHandlers(body.rows[body.rows.length - 1]);
}

function removeNutritionHouseholdRow(rowIndex) {
  const body = document.getElementById("nutritionHouseholdBody");
  body?.querySelector(`[data-nutrition-household-container="${rowIndex}"]`)?.remove();

  if (body && !body.querySelector("[data-nutrition-household-container]")) {
    body.innerHTML = `<tr class="family-empty-row"><td colspan="${NUTRITION_HOUSEHOLD_FIELDS.length + 1}">No household members added.</td></tr>`;
  }
}

function attachNutritionHouseholdRemoveHandlers(scope = document) {
  scope.querySelectorAll("[data-remove-nutrition-household-row]").forEach(button => {
    button.addEventListener("click", () => removeNutritionHouseholdRow(button.dataset.removeNutritionHouseholdRow));
  });
}

function readNutritionHouseholdRowsFromDom() {
  return [...new Set([...elements.pageRoot.querySelectorAll("[data-nutrition-household-row]")]
    .map(input => Number(input.dataset.nutritionHouseholdRow))
    .filter(Number.isFinite))]
    .sort((left, right) => left - right)
    .map(rowIndex => {
      return NUTRITION_HOUSEHOLD_FIELDS.reduce((row, fieldMeta) => {
        const input = elements.pageRoot.querySelector(`[data-nutrition-household-field="${fieldMeta.name}"][data-nutrition-household-row="${rowIndex}"]`);
        row[fieldMeta.name] = normalizeNutritionInputValue(fieldMeta.name, input?.value || "").trim();
        return row;
      }, {});
    })
    .filter(nutritionHouseholdRowHasValue);
}

function renderNutritionHouseholdRowsIntoBody(rows) {
  const body = document.getElementById("nutritionHouseholdBody");
  if (!body) return;

  const sortedRows = mergeNutritionHouseholdRows(rows);
  body.innerHTML = sortedRows.length
    ? sortedRows.map((row, index) => renderNutritionHouseholdRow(row, index, false)).join("")
    : `<tr class="family-empty-row"><td colspan="${NUTRITION_HOUSEHOLD_FIELDS.length + 1}">No household members added.</td></tr>`;
  attachCapitalizationHandlers(body);
  attachNutritionHouseholdRemoveHandlers(body);
}

function nutritionDraftFromInputs() {
  const record = { ...(state.currentNutritionBeneficiary || {}) };
  elements.pageRoot.querySelectorAll("[data-nutrition-field]").forEach(input => {
    record[input.dataset.nutritionField] = input.value;
  });
  record.age = nutritionAgeText(record.birth_date);
  return record;
}

function syncNutritionParentHouseholdRows() {
  const record = nutritionDraftFromInputs();
  renderNutritionHouseholdRowsIntoBody(ensureNutritionParentHouseholdRows(record, readNutritionHouseholdRowsFromDom()));
}

function setNutritionOcrStatus(status, summary = "", text = "") {
  const panel = document.getElementById("nutritionOcrPanel");
  const statusNode = document.getElementById("nutritionOcrStatus");
  const summaryNode = document.getElementById("nutritionOcrSummary");
  const details = document.getElementById("nutritionOcrDetails");
  const textNode = document.getElementById("nutritionOcrText");

  if (panel) panel.hidden = false;
  if (statusNode) statusNode.textContent = status;
  if (summaryNode) summaryNode.textContent = summary;
  if (details) details.hidden = !text;
  if (textNode) textNode.textContent = text || "";
}

function applyNutritionOcrDraft(draft = {}) {
  Object.entries(draft).forEach(([name, value]) => {
    if (name === "household_members") return;

    const input = elements.pageRoot.querySelector(`[data-nutrition-field="${name}"]`);
    if (!input || value === null || typeof value === "undefined" || String(value).trim() === "") return;
    input.value = value;
  });

  if (draft.feeding_center && !draft.center_id) {
    const centerSelect = elements.pageRoot.querySelector('[data-nutrition-field="center_id"]');
    const match = [...(centerSelect?.options || [])].find(option => {
      return option.textContent.trim().toLowerCase() === String(draft.feeding_center).trim().toLowerCase();
    });
    if (match) centerSelect.value = match.value;
  }

  if (Array.isArray(draft.household_members) && draft.household_members.length) {
    const body = document.getElementById("nutritionHouseholdBody");
    if (body) {
      renderNutritionHouseholdRowsIntoBody(ensureNutritionParentHouseholdRows(nutritionDraftFromInputs(), draft.household_members));
    }
  }

  syncNutritionParentHouseholdRows();
  updateNutritionAgeFromBirthDate();
  updateNutritionComputedFields();
}

function nutritionOcrFieldCount(draft = {}) {
  return Object.entries(draft).reduce((count, [key, value]) => {
    if (key === "household_members") return count + (Array.isArray(value) ? value.length : 0);
    return count + (String(value || "").trim() ? 1 : 0);
  }, 0);
}

async function handleNutritionOcrImport(file) {
  if (!file) return;
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!file.type.startsWith("image/") && !isPdf) {
    showToast("Choose an image or PDF file for OCR.");
    return;
  }

  setNutritionOcrStatus("Reading Image", file.name);

  try {
    const imageData = await readFileAsDataUrl(file);
    setNutritionOcrStatus("Scanning Profile", "This may take a moment.");
    const payload = await api("/api/nutrition/ocr-profile", {
      method: "POST",
      body: JSON.stringify({ imageData })
    });
    const draft = payload.draft || {};
    const fieldCount = nutritionOcrFieldCount(draft);

    applyNutritionOcrDraft(draft);
    setNutritionOcrStatus(
      "OCR Import Complete",
      `${fieldCount} field${fieldCount === 1 ? "" : "s"} detected from ${payload.sourceType === "pdf" ? `${payload.pages || 0} PDF page${payload.pages === 1 ? "" : "s"}` : "image"}. Confidence: ${payload.confidence || 0}%`,
      payload.text || ""
    );
    showToast("OCR import applied. Review before saving.");
  } catch (error) {
    setNutritionOcrStatus("OCR Import Failed", error.message);
    showToast(error.message);
  }
}

function updateNutritionAgeFromBirthDate() {
  const birthInput = elements.pageRoot.querySelector('[data-nutrition-field="birth_date"]');
  const ageNode = elements.pageRoot.querySelector('[data-nutrition-computed-age="age"]');
  if (!birthInput || !ageNode) return;

  ageNode.textContent = nutritionAgeText(birthInput.value);
}

function nutritionAgeText(value) {
  const birthDate = parseNutritionDate(value);
  if (!birthDate) return "";

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const beforeBirthday = now.getMonth() < birthDate.getMonth()
    || (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 130 ? String(age) : "";
}

function nutritionComputedDraftFromInputs() {
  return nutritionDraftFromInputs();
}

function updateNutritionComputedFields() {
  const record = nutritionComputedDraftFromInputs();
  elements.pageRoot.querySelectorAll("[data-nutrition-computed]").forEach(node => {
    node.textContent = nutritionComputedValue(record, node.dataset.nutritionComputed) || "";
  });
}

function attachNutritionBeneficiaryFormHandlers() {
  const fileInput = document.getElementById("nutritionPictureInput");
  fileInput?.addEventListener("change", () => {
    readNutritionPictureFile(fileInput.files?.[0]);
  });
  const ocrInput = document.getElementById("nutritionOcrInput");
  ocrInput?.addEventListener("change", () => {
    handleNutritionOcrImport(ocrInput.files?.[0]).finally(() => {
      ocrInput.value = "";
    });
  });

  const dropZone = document.getElementById("nutritionPhotoDropZone");
  dropZone?.addEventListener("dragenter", event => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
  dropZone?.addEventListener("dragover", event => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
  dropZone?.addEventListener("dragleave", event => {
    if (!dropZone.contains(event.relatedTarget)) {
      dropZone.classList.remove("drag-over");
    }
  });
  dropZone?.addEventListener("drop", event => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
    readNutritionPictureFile(event.dataTransfer?.files?.[0]);
  });

  document.getElementById("removeNutritionPictureButton")?.addEventListener("click", () => {
    setNutritionPictureData("");
    if (fileInput) fileInput.value = "";
  });

  elements.pageRoot.querySelectorAll('[data-nutrition-field="contact_no"]').forEach(input => {
    input.addEventListener("input", () => {
      input.value = normalizeContactNumber(input.value);
    });
    input.addEventListener("blur", () => {
      input.value = normalizeContactNumber(input.value);
    });
  });
  elements.pageRoot.querySelector('[data-nutrition-field="birth_date"]')?.addEventListener("change", updateNutritionAgeFromBirthDate);
  elements.pageRoot.querySelectorAll([
    '[data-nutrition-field="birth_date"]',
    '[data-nutrition-field="admission_date"]',
    '[data-nutrition-field="current_update_date"]'
  ].join(",")).forEach(input => {
    input.addEventListener("blur", () => {
      input.value = normalizeNutritionDateValue(input.value);
      if (input.dataset.nutritionField === "birth_date") updateNutritionAgeFromBirthDate();
    });
  });

  elements.pageRoot.querySelectorAll([
    '[data-nutrition-field="mother_name"]',
    '[data-nutrition-field="mother_occupation"]',
    '[data-nutrition-field="father_name"]',
    '[data-nutrition-field="father_occupation"]'
  ].join(",")).forEach(input => {
    input.addEventListener("blur", syncNutritionParentHouseholdRows);
    input.addEventListener("change", syncNutritionParentHouseholdRows);
  });

  elements.pageRoot.querySelectorAll([
    '[data-nutrition-field="initial_weight_kg"]',
    '[data-nutrition-field="current_weight_kg"]',
    '[data-nutrition-field="initial_height_cm"]',
    '[data-nutrition-field="current_height_cm"]'
  ].join(",")).forEach(input => {
    input.addEventListener("input", updateNutritionComputedFields);
    input.addEventListener("change", updateNutritionComputedFields);
  });
  updateNutritionComputedFields();

  attachCapitalizationHandlers(elements.pageRoot);
  attachNutritionHouseholdRemoveHandlers(elements.pageRoot);
  document.getElementById("addNutritionHouseholdButton")?.addEventListener("click", addNutritionHouseholdRow);
  updateNutritionAgeFromBirthDate();
}

function collectNutritionBeneficiary() {
  const record = { ...(state.currentNutritionBeneficiary || {}) };

  if (state.currentNutritionBeneficiary?.id) {
    record.id = state.currentNutritionBeneficiary.id;
  }

  elements.pageRoot.querySelectorAll("[data-nutrition-field]").forEach(input => {
    record[input.dataset.nutritionField] = normalizeNutritionInputValue(input.dataset.nutritionField, input.value);
  });

  const centerInput = elements.pageRoot.querySelector('[data-nutrition-field="center_id"]');
  if (centerInput?.tagName === "SELECT") {
    const selected = centerInput.options[centerInput.selectedIndex];
    record.feeding_center = record.center_id ? String(selected?.textContent || "").trim() : "";
  }

  record.picture_data = state.nutritionPictureData || "";
  record.age = nutritionAgeText(record.birth_date);
  record.household_members = ensureNutritionParentHouseholdRows(record, readNutritionHouseholdRowsFromDom());

  return record;
}

async function saveCurrentNutritionBeneficiary() {
  const record = collectNutritionBeneficiary();
  if (!record.child_last_name || !record.child_first_name) {
    showToast("Child first and last name are required.");
    return;
  }

  if (record.contact_no && !/^\d{11}$/.test(record.contact_no)) {
    showToast("Contact No. must be 11 digits.");
    return;
  }

  const payload = await api("/api/nutrition/beneficiaries", {
    method: "POST",
    body: JSON.stringify(record)
  });

  await refreshStats();
  showToast("Nutrition profile saved.");
  history.replaceState(null, "", `#/nutrition-profiles/edit-${payload.beneficiary.id}`);
  await renderNutritionBeneficiaryDetailPage(String(payload.beneficiary.id), false);
}

async function deleteCurrentNutritionBeneficiary(id) {
  const record = state.currentNutritionBeneficiary || await loadNutritionBeneficiary(id);
  const confirmed = window.confirm(`Delete this nutrition beneficiary profile?\n\n${record.beneficiary_no}\n${nutritionFullName(record)}`);
  if (!confirmed) return;

  await api(`/api/nutrition/beneficiaries/${id}`, { method: "DELETE" });
  await refreshStats();
  showToast("Nutrition profile deleted.");
  navigate("nutrition-profiles");
}

function nutritionPrintDisplayValue(record, meta) {
  if (meta.input === "center") return nutritionCenterName(record);
  if (meta.input === "date") return normalizeNutritionDateValue(record[meta.name]);
  if (meta.input === "computed") return nutritionComputedValue(record, meta.name);
  return nutritionText(record[meta.name]);
}

function nutritionPrintField(record, meta) {
  const value = nutritionPrintDisplayValue(record, meta) || "-";

  return `
    <div class="print-field ${meta.wide || meta.input === "textarea" ? "wide" : ""}">
      <span>${escapeHtml(meta.label)}</span>
      <strong>${escapeHtml(value).replaceAll("\n", "<br>")}</strong>
    </div>
  `;
}

function nutritionPrintGroup(record, group) {
  return `
    <div class="print-group">
      <h4>${escapeHtml(group.title)}</h4>
      <div class="field-grid">
        ${group.fields.map(meta => nutritionPrintField(record, meta)).join("")}
      </div>
    </div>
  `;
}

function nutritionPrintHouseholdRows(record) {
  const rows = nutritionHouseholdRows(record);

  if (!rows.length) {
    return `<tr><td colspan="${NUTRITION_HOUSEHOLD_FIELDS.length}">No household members added.</td></tr>`;
  }

  return rows.map(row => `
    <tr>
      ${NUTRITION_HOUSEHOLD_FIELDS.map(fieldMeta => `<td>${escapeHtml(nutritionText(row[fieldMeta.name], "-"))}</td>`).join("")}
    </tr>
  `).join("");
}

function printNutritionBeneficiary(record) {
  const printWindow = window.open("", "_blank", "width=940,height=760");
  if (!printWindow) {
    showToast("Allow popups to print nutrition profiles.");
    return;
  }

  const logoSrc = `${window.location.origin}/assets/paofi-logo.png`;
  const centerName = nutritionCenterName(record);
  const profileTitle = `${record.beneficiary_no || "Nutrition Profile"} ${nutritionFullName(record)}`;
  const picture = record.picture_data
    ? `<img class="profile-photo" src="${escapeHtml(record.picture_data)}" alt="">`
    : `<div class="profile-photo photo-placeholder">Photo</div>`;

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(profileTitle)}</title>
        <style>
          @page { size: letter; margin: 8mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #edf3ef;
            color: #1d2520;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 9.2px;
            line-height: 1.2;
          }
          button {
            margin: 12px;
            border: 1px solid #bdd3c6;
            border-radius: 7px;
            background: #ffffff;
            padding: 8px 12px;
            color: #155b3c;
            font-weight: 700;
          }
          .sheet {
            width: 8.5in;
            min-height: 11in;
            margin: 0 auto;
            padding: 0.26in 0.3in;
            background: #ffffff;
          }
          h1, h2, h3, h4, p { margin: 0; }
          .header {
            display: grid;
            grid-template-columns: 54px minmax(0, 1fr);
            gap: 10px;
            align-items: center;
            padding-bottom: 8px;
            border-bottom: 2px solid #1f7a4f;
            text-align: center;
          }
          .header img {
            width: 50px;
            height: 50px;
            object-fit: contain;
          }
          .header h1 {
            color: #2f68b1;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 0;
            text-transform: uppercase;
          }
          .header h2 {
            margin-top: 2px;
            color: #c62b26;
            font-size: 14px;
            line-height: 1;
            text-transform: uppercase;
          }
          .form-title {
            margin-top: 3px;
            color: #1d2520;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .profile-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 1.82in;
            gap: 12px;
            align-items: start;
            margin-top: 10px;
          }
          .profile-photo {
            width: 1.82in;
            height: 2.42in;
            border: 1px solid #8ea79a;
            background: #f4f8f6;
            object-fit: cover;
          }
          .photo-placeholder {
            display: grid;
            place-items: center;
            color: #7a8a82;
            font-weight: 800;
            text-transform: uppercase;
          }
          .print-section {
            break-inside: avoid;
            margin-top: 8px;
          }
          .print-section:first-child {
            margin-top: 0;
          }
          .print-section h3 {
            margin-bottom: 5px;
            border-left: 4px solid #1f7a4f;
            border-radius: 4px;
            background: #eaf6ef;
            color: #143d33;
            padding: 5px 7px;
            font-size: 10px;
            line-height: 1;
          }
          .print-group {
            break-inside: avoid;
            margin-bottom: 6px;
          }
          .print-group:last-child {
            margin-bottom: 0;
          }
          .print-group h4 {
            margin-bottom: 3px;
            color: #155b3c;
            font-size: 8.4px;
            text-transform: uppercase;
          }
          .field-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            border-top: 1px solid #cddbd2;
            border-left: 1px solid #cddbd2;
          }
          .family-grid,
          .snapshot-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }
          .family-grid .print-group:last-child,
          .snapshot-grid .print-group:last-child {
            grid-column: 1 / -1;
          }
          .print-field {
            min-height: 26px;
            border-right: 1px solid #cddbd2;
            border-bottom: 1px solid #cddbd2;
            padding: 3px 5px;
            overflow-wrap: anywhere;
          }
          .print-field.wide {
            grid-column: 1 / -1;
          }
          .print-field span {
            display: block;
            margin-bottom: 2px;
            color: #5b6861;
            font-size: 6.8px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .print-field strong {
            display: block;
            color: #1d2520;
            font-size: 8.4px;
            font-weight: 650;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          th, td {
            border: 1px solid #cddbd2;
            padding: 3px 4px;
            text-align: left;
            vertical-align: top;
            overflow-wrap: anywhere;
          }
          th {
            background: #f2f7f4;
            color: #243029;
            font-size: 7px;
            font-weight: 800;
          }
          td {
            font-size: 7.4px;
          }
          th:nth-child(2),
          td:nth-child(2) {
            width: 10%;
            text-align: center;
          }
          th:nth-child(3),
          td:nth-child(3) {
            width: 18%;
          }
          @media print {
            body { background: #ffffff; }
            button { display: none; }
            .sheet {
              width: auto;
              min-height: auto;
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Print</button>
        <main class="sheet">
          <header class="header">
            <img src="${escapeHtml(logoSrc)}" alt="">
            <div>
              <h1>Payatas Orione Foundation, Inc.</h1>
              <h2>${escapeHtml(centerName)}</h2>
              <p class="form-title">Beneficiary Profile</p>
            </div>
          </header>
          <section class="profile-layout">
            <div>
              <section class="print-section">
                <h3>I. Child's Basic Information</h3>
                ${NUTRITION_BASIC_GROUPS.map(group => nutritionPrintGroup(record, group)).join("")}
              </section>
            </div>
            ${picture}
          </section>
          <section class="print-section">
            <h3>II. Family Background</h3>
            <div class="family-grid">
              ${NUTRITION_FAMILY_GROUPS.map(group => nutritionPrintGroup(record, group)).join("")}
            </div>
          </section>
          <section class="print-section">
            <h3>Household Members</h3>
            <table>
              <thead>
                <tr>${NUTRITION_HOUSEHOLD_FIELDS.map(fieldMeta => `<th>${escapeHtml(fieldMeta.label)}</th>`).join("")}</tr>
              </thead>
              <tbody>${nutritionPrintHouseholdRows(record)}</tbody>
            </table>
          </section>
          <section class="print-section">
            <h3>III. Admission & Nutrition Snapshot</h3>
            <div class="snapshot-grid">
              ${NUTRITION_SNAPSHOT_GROUPS.map(group => nutritionPrintGroup(record, group)).join("")}
            </div>
          </section>
        </main>
      </body>
    </html>
  `);
  printWindow.document.close();
}

async function renderNutritionCentersPage(id = "") {
  const parsed = parseNutritionRouteId(id);

  if (parsed.mode !== "list") {
    await renderNutritionCenterDetailPage(parsed.id, parsed.mode !== "edit" && parsed.mode !== "new");
    return;
  }

  setTitle("Feeding Centers");
  setTopbarActions([
    { id: "nutritionCenterNew", label: "New Center", icon: "plus", variant: "primary", onClick: () => navigate("nutrition-centers", "new") },
    { id: "nutritionProfiles", label: "Profiles", icon: "users", onClick: () => navigate("nutrition-profiles") }
  ]);

  const overview = await loadNutritionOverview();
  const centers = overview.centers || [];
  const beneficiaries = overview.beneficiaries || [];

  elements.pageRoot.innerHTML = `
    ${renderNutritionCenterAnalytics(centers, beneficiaries)}
    <section class="database-page nutrition-page">
      <div class="table-toolbar">
        <div class="search-band compact with-button">
          <span class="search-icon">${icon("search")}</span>
          <input id="nutritionCenterSearchInput" type="search" placeholder="Search center, location, coordinator, or status">
          <button id="nutritionCenterSearchButton" type="button" class="action-button">
            <span class="button-icon">${icon("search")}</span>
            <span>Search</span>
          </button>
        </div>
        <div class="table-toolbar-footer">
          <div class="filter-summary"><span>Feeding center profile records</span></div>
          <span id="nutritionCenterCount" class="table-count"></span>
        </div>
      </div>
      <div id="nutritionCenterTableHost" class="database-table-host"></div>
    </section>
  `;

  async function loadCenters() {
    const search = encodeURIComponent(document.getElementById("nutritionCenterSearchInput").value.trim());
    const payload = await api(`/api/nutrition/centers?search=${search}&limit=500`);
    renderNutritionCenterTable(payload.centers || []);
  }

  document.getElementById("nutritionCenterSearchButton").addEventListener("click", () => loadCenters().catch(error => showToast(error.message)));
  document.getElementById("nutritionCenterSearchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadCenters().catch(error => showToast(error.message));
    }
  });

  renderNutritionCenterTable(centers);
}

function renderNutritionCenterAnalytics(centers = [], beneficiaries = []) {
  const analytics = buildNutritionAnalytics(beneficiaries, centers);
  const topCenter = topAnalyticsEntry(analytics.centerCounts);

  return `
    <section class="database-analytics nutrition-analytics">
      <div class="analytics-title-row">
        <div>
          <span class="analytics-eyebrow">Feeding Center Analytics</span>
          <h3>Center Coverage</h3>
        </div>
        <span class="analytics-note">${analytics.activeCenters} active of ${analytics.centers} centers</span>
      </div>
      <div class="analytics-kpi-grid">
        ${renderAnalyticsKpi("Centers", String(analytics.centers), "Profile records", "green")}
        ${renderAnalyticsKpi("Active Centers", String(analytics.activeCenters), "Currently operating", "blue")}
        ${renderAnalyticsKpi("Beneficiaries", String(analytics.total), "Children linked to centers", "amber")}
        ${renderAnalyticsKpi("Largest Center", topCenter.label, analyticsPlural(topCenter.count, "child", "children"), "violet")}
      </div>
      <div class="analytics-preview-grid">
        ${renderAnalyticsCard("Children by Center", "Profile distribution", renderBarList(analytics.centerCounts, analytics.total, 6))}
        ${renderAnalyticsCard("Current Nutrition Status", "Across all centers", renderBarList(analytics.nutritionStatusCounts, analytics.total, 5))}
      </div>
    </section>
  `;
}

function renderNutritionCenterTable(centers = []) {
  document.getElementById("nutritionCenterCount").textContent = `${centers.length} shown`;

  if (!centers.length) {
    document.getElementById("nutritionCenterTableHost").innerHTML = emptyState("No feeding centers found.");
    return;
  }

  document.getElementById("nutritionCenterTableHost").innerHTML = `
    <div class="data-table-scroll">
      <table class="data-table nutrition-center-table">
        <thead>
          <tr>
            <th class="sticky-column">Actions</th>
            <th>Feeding Center</th>
            <th>Location</th>
            <th>Coordinator</th>
            <th>Contact No.</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Beneficiaries</th>
            <th>Active Children</th>
          </tr>
        </thead>
        <tbody>
          ${centers.map(center => `
            <tr>
              <td class="sticky-column">
                <div class="table-actions">
                  <button type="button" class="icon-button" title="View" data-nutrition-center-view-id="${center.id}">${icon("view")}</button>
                  <button type="button" class="icon-button" title="Edit" data-nutrition-center-edit-id="${center.id}">${icon("edit")}</button>
                </div>
              </td>
              <td>${escapeHtml(center.center_name || "")}</td>
              <td>${escapeHtml(center.location || "")}</td>
              <td>${escapeHtml(center.coordinator || "")}</td>
              <td>${escapeHtml(center.contact_no || "")}</td>
              <td>${escapeHtml(center.capacity || "")}</td>
              <td>${escapeHtml(center.status || "")}</td>
              <td>${escapeHtml(center.beneficiary_count || 0)}</td>
              <td>${escapeHtml(center.active_beneficiary_count || 0)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
  attachNutritionCenterTableHandlers(elements.pageRoot);
}

function attachNutritionCenterTableHandlers(scope = document) {
  scope.querySelectorAll("[data-nutrition-center-view-id]").forEach(button => {
    button.addEventListener("click", () => navigate("nutrition-centers", button.dataset.nutritionCenterViewId));
  });
  scope.querySelectorAll("[data-nutrition-center-edit-id]").forEach(button => {
    button.addEventListener("click", () => navigate("nutrition-centers", `edit-${button.dataset.nutritionCenterEditId}`));
  });
}

async function loadNutritionCenter(id) {
  const payload = await api(`/api/nutrition/centers/${id}`);
  return payload.center;
}

function blankNutritionCenter() {
  return {
    center_name: "",
    location: "",
    coordinator: "",
    contact_no: "",
    capacity: "",
    status: "Active",
    notes: ""
  };
}

async function renderNutritionCenterDetailPage(id = "", readonly = true) {
  const isNew = !id;
  const [center, beneficiaries] = await Promise.all([
    isNew ? Promise.resolve(blankNutritionCenter()) : loadNutritionCenter(id),
    id ? api(`/api/nutrition/beneficiaries?centerId=${encodeURIComponent(id)}&limit=500`).then(payload => payload.beneficiaries || []) : Promise.resolve([])
  ]);
  state.currentNutritionCenter = center;

  setTitle(isNew ? "New Feeding Center" : readonly ? "Feeding Center Profile" : "Edit Feeding Center");
  setTopbarActions([
    { id: "nutritionCenterBack", label: "Centers", icon: "table", onClick: () => navigate("nutrition-centers") },
    ...(readonly && center.id ? [
      { id: "nutritionCenterEdit", label: "Edit", icon: "edit", variant: "primary", onClick: () => navigate("nutrition-centers", `edit-${center.id}`) }
    ] : [
      { id: "nutritionCenterSave", label: "Save", icon: "save", variant: "primary", onClick: () => saveCurrentNutritionCenter().catch(error => showToast(error.message)) }
    ]),
    ...(!isNew && !readonly ? [
      { id: "nutritionCenterDelete", label: "Delete", icon: "bin", variant: "danger", onClick: () => deleteCurrentNutritionCenter(center.id).catch(error => showToast(error.message)) }
    ] : [])
  ]);

  elements.pageRoot.innerHTML = renderNutritionCenterForm(center, beneficiaries, readonly);
  if (!readonly) attachNutritionCenterFormHandlers();
}

function renderNutritionCenterForm(center, beneficiaries = [], readonly) {
  return `
    <section class="application-paper nutrition-paper ${readonly ? "readonly" : "editable"}">
      <header class="monitoring-heading">
        <img src="/assets/paofi-logo.png" alt="">
        <div>
          <h2>Payatas Orione Foundation Inc.</h2>
          <h3>Nutrition Program - Supplemental Feeding Center Profile</h3>
        </div>
      </header>
      ${nutritionCenterFormSection("Feeding Center Profile", NUTRITION_CENTER_FIELDS, center, readonly)}
      ${center.id ? `
        <section class="paper-section">
          <h3>Linked Beneficiaries</h3>
          ${beneficiaries.length ? `
            <div class="data-table-scroll">
              <table class="data-table nutrition-center-linked-table">
                <thead>
                  <tr>
                    <th>Beneficiary No.</th>
                    <th>Child's Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Current Height (cm)</th>
                    <th>Current Weight (kg)</th>
                    <th>Current Nutrition Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${beneficiaries.map(record => `
                    <tr>
                      <td>${escapeHtml(record.beneficiary_no || "")}</td>
                      <td>${escapeHtml(nutritionFullName(record))}</td>
                      <td>${escapeHtml(record.age || "")}</td>
                      <td>${escapeHtml(record.gender || "")}</td>
                      <td>${escapeHtml(record.current_height_cm || "")}</td>
                      <td>${escapeHtml(record.current_weight_kg || "")}</td>
                      <td>${escapeHtml(record.current_nutrition_status || "")}</td>
                      <td>${escapeHtml(record.remarks || "")}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          ` : emptyState("No child profiles are linked to this center yet.")}
        </section>
      ` : ""}
    </section>
  `;
}

function nutritionCenterFormSection(title, fields, center, readonly) {
  return `
    <section class="paper-section">
      <h3>${escapeHtml(title)}</h3>
      <div class="paper-grid">
        ${fields.map(meta => renderNutritionCenterField(meta, center, readonly)).join("")}
      </div>
    </section>
  `;
}

function renderNutritionCenterField(meta, center, readonly) {
  const value = nutritionText(center[meta.name]);
  const isWide = meta.wide || meta.input === "textarea";

  if (readonly) {
    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label>${escapeHtml(meta.label)}</label>
        <div class="display-value">${escapeHtml(value).replaceAll("\n", "<br>") || "&nbsp;"}</div>
      </div>
    `;
  }

  if (meta.input === "select") {
    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label for="nutrition_center_${escapeHtml(meta.name)}">${escapeHtml(meta.label)}</label>
        <select id="nutrition_center_${escapeHtml(meta.name)}" data-nutrition-center-field="${escapeHtml(meta.name)}">
          ${nutritionSelectOptions(meta.options || [], value, true)}
        </select>
      </div>
    `;
  }

  if (meta.input === "textarea") {
    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label for="nutrition_center_${escapeHtml(meta.name)}">${escapeHtml(meta.label)}</label>
        <textarea id="nutrition_center_${escapeHtml(meta.name)}" rows="3" data-nutrition-center-field="${escapeHtml(meta.name)}" data-capitalize="words" autocapitalize="words">${escapeHtml(value)}</textarea>
      </div>
    `;
  }

  const type = meta.input === "tel" ? "text" : meta.input || "text";
  const attrs = [
    `id="nutrition_center_${escapeHtml(meta.name)}"`,
    `type="${type}"`,
    `data-nutrition-center-field="${escapeHtml(meta.name)}"`,
    `value="${escapeHtml(value)}"`,
    meta.input === "tel" ? 'inputmode="numeric" maxlength="11" autocomplete="tel"' : "",
    meta.input === "number" ? 'inputmode="numeric" min="0"' : "",
    !["contact_no", "capacity"].includes(meta.name) ? 'data-capitalize="words" autocapitalize="words"' : "",
    meta.required ? "required" : ""
  ].filter(Boolean).join(" ");

  return `
    <div class="paper-field ${isWide ? "wide" : ""}">
      <label for="nutrition_center_${escapeHtml(meta.name)}">${escapeHtml(meta.label)}</label>
      <input ${attrs}>
    </div>
  `;
}

function collectNutritionCenter() {
  const center = {};
  if (state.currentNutritionCenter?.id) center.id = state.currentNutritionCenter.id;

  elements.pageRoot.querySelectorAll("[data-nutrition-center-field]").forEach(input => {
    const name = input.dataset.nutritionCenterField;
    if (name === "contact_no") {
      center[name] = normalizeContactNumber(input.value);
    } else if (name === "capacity") {
      center[name] = String(input.value || "").replace(/\D/g, "").slice(0, 5);
    } else {
      center[name] = titleCaseValue(input.value);
    }
  });

  return center;
}

function attachNutritionCenterFormHandlers() {
  elements.pageRoot.querySelectorAll('[data-nutrition-center-field="contact_no"]').forEach(input => {
    input.addEventListener("input", () => {
      input.value = normalizeContactNumber(input.value);
    });
    input.addEventListener("blur", () => {
      input.value = normalizeContactNumber(input.value);
    });
  });
  attachCapitalizationHandlers(elements.pageRoot);
}

async function saveCurrentNutritionCenter() {
  const center = collectNutritionCenter();
  if (!center.center_name) {
    showToast("Feeding center name is required.");
    return;
  }

  if (center.contact_no && !/^\d{11}$/.test(center.contact_no)) {
    showToast("Contact No. must be 11 digits.");
    return;
  }

  const payload = await api("/api/nutrition/centers", {
    method: "POST",
    body: JSON.stringify(center)
  });

  await refreshStats();
  showToast("Feeding center saved.");
  history.replaceState(null, "", `#/nutrition-centers/edit-${payload.center.id}`);
  await renderNutritionCenterDetailPage(String(payload.center.id), false);
}

async function deleteCurrentNutritionCenter(id) {
  const center = state.currentNutritionCenter || await loadNutritionCenter(id);
  const confirmed = window.confirm(`Delete this feeding center profile?\n\n${center.center_name}`);
  if (!confirmed) return;

  await api(`/api/nutrition/centers/${id}`, { method: "DELETE" });
  await refreshStats();
  showToast("Feeding center deleted.");
  navigate("nutrition-centers");
}

async function loadNutritionCgsReference() {
  if (!state.nutritionCgsReference) {
    state.nutritionCgsReference = await api("/api/nutrition/growth/cgs");
  }

  return state.nutritionCgsReference;
}

async function loadNutritionGrowthReports({ search = "", centerId = "" } = {}) {
  const params = new URLSearchParams({ search, centerId, limit: "500" });
  const payload = await api(`/api/nutrition/growth/reports?${params.toString()}`);
  return payload.reports || [];
}

async function loadNutritionGrowthReport(id) {
  const payload = await api(`/api/nutrition/growth/reports/${id}`);
  return payload.report;
}

async function loadNutritionGrowthDraft({ id = "", centerId = "", reportMonth = "", submittedDate = "" } = {}) {
  const params = new URLSearchParams();
  if (id) params.set("id", id);
  if (centerId) params.set("centerId", centerId);
  if (reportMonth) params.set("reportMonth", reportMonth);
  if (submittedDate) params.set("submittedDate", submittedDate);
  const payload = await api(`/api/nutrition/growth/draft?${params.toString()}`);
  return payload.report;
}

function blankNutritionGrowthReport() {
  return {
    center_id: "",
    center_name: "",
    submitted_date: nutritionTodayDate(),
    report_month: currentReportMonth(),
    entries: []
  };
}

function nutritionGrowthStatusCounts(entries = []) {
  return countBy(entries, entry => nutritionText(entry.cgs_classification, "Not Classified"));
}

function buildNutritionGrowthAnalytics(reports = []) {
  const totals = reports.reduce((summary, report) => {
    summary.children += Number(report.child_count || 0);
    summary.severelyUnderweight += Number(report.severely_underweight_count || 0);
    summary.underweight += Number(report.underweight_count || 0);
    summary.normal += Number(report.normal_count || 0);
    summary.overweight += Number(report.overweight_count || 0);
    summary.centerCounts.set(report.center_name || "No Center", (summary.centerCounts.get(report.center_name || "No Center") || 0) + 1);
    return summary;
  }, {
    children: 0,
    severelyUnderweight: 0,
    underweight: 0,
    normal: 0,
    overweight: 0,
    centerCounts: new Map()
  });

  return {
    reports: reports.length,
    children: totals.children,
    statusCounts: [
      { label: "Severely Underweight", count: totals.severelyUnderweight },
      { label: "Underweight", count: totals.underweight },
      { label: "Normal", count: totals.normal },
      { label: "Overweight", count: totals.overweight }
    ],
    centerCounts: [...totals.centerCounts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)
  };
}

function renderNutritionGrowthAnalytics(reports = []) {
  const analytics = buildNutritionGrowthAnalytics(reports);
  const topCenter = topAnalyticsEntry(analytics.centerCounts);
  const needsFollowUp = analytics.statusCounts
    .filter(entry => ["Severely Underweight", "Underweight"].includes(entry.label))
    .reduce((sum, entry) => sum + entry.count, 0);

  return `
    <section class="database-analytics nutrition-analytics">
      <div class="analytics-title-row">
        <div>
          <span class="analytics-eyebrow">Nutrition Growth Monitoring</span>
          <h3>Monthly Center Reports</h3>
        </div>
        <span class="analytics-note">${analytics.reports} report${analytics.reports === 1 ? "" : "s"} filed</span>
      </div>
      <div class="analytics-kpi-grid">
        ${renderAnalyticsKpi("Reports", String(analytics.reports), "center-month records", "green")}
        ${renderAnalyticsKpi("Children Monitored", String(analytics.children), "rows across reports", "blue")}
        ${renderAnalyticsKpi("Needs Follow-Up", String(needsFollowUp), "SU + Underweight", "red")}
        ${renderAnalyticsKpi("Top Center", topCenter.label, analyticsPlural(topCenter.count, "report"), "amber")}
      </div>
      <div class="analytics-preview-grid">
        ${renderAnalyticsCard("CGS Classification", "All displayed reports", renderBarList(analytics.statusCounts, Math.max(analytics.children, 1), 4))}
        ${renderAnalyticsCard("Reports by Center", "Monitoring coverage", renderBarList(analytics.centerCounts, Math.max(analytics.reports, 1), 6))}
      </div>
    </section>
  `;
}

async function renderNutritionGrowthPage(id = "") {
  const parsed = parseNutritionRouteId(id);

  if (parsed.mode !== "list") {
    await renderNutritionGrowthEditorPage(parsed.id, parsed.mode === "new");
    return;
  }

  setTitle("Nutrition Growth Monitoring");
  setTopbarActions([
    { id: "nutritionGrowthNew", label: "New Report", icon: "plus", variant: "primary", onClick: () => navigate("nutrition-growth", "new") },
    { id: "nutritionGrowthYearly", label: "Yearly Summary", icon: "print", onClick: () => printNutritionGrowthYearlySummary().catch(error => showToast(error.message)) }
  ]);

  const [overview, reports] = await Promise.all([
    loadNutritionOverview(),
    loadNutritionGrowthReports()
  ]);
  const centers = overview.centers || [];

  elements.pageRoot.innerHTML = `
    <div id="nutritionGrowthAnalyticsHost">${renderNutritionGrowthAnalytics(reports)}</div>
    <section class="database-page nutrition-page">
      <div class="table-toolbar">
        <div class="search-band compact with-button">
          <span class="search-icon">${icon("search")}</span>
          <input id="nutritionGrowthSearchInput" type="search" placeholder="Search center, month, or submission date">
          <button id="nutritionGrowthSearchButton" type="button" class="action-button">
            <span class="button-icon">${icon("search")}</span>
            <span>Search</span>
          </button>
        </div>
        <div class="database-filter-grid nutrition-filter-grid">
          <label>
            Feeding Center
            <select id="nutritionGrowthCenterFilter">
              <option value="">All Centers</option>
              ${centers.map(center => `<option value="${center.id}">${escapeHtml(center.center_name)}</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="table-toolbar-footer">
          <div class="filter-summary"><span>Nutrition growth monitoring reports</span></div>
          <span id="nutritionGrowthCount" class="table-count"></span>
        </div>
      </div>
      <div id="nutritionGrowthTableHost" class="database-table-host"></div>
    </section>
  `;

  async function loadReports() {
    const search = document.getElementById("nutritionGrowthSearchInput").value.trim();
    const centerId = document.getElementById("nutritionGrowthCenterFilter").value;
    const filteredReports = await loadNutritionGrowthReports({ search, centerId });
    document.getElementById("nutritionGrowthAnalyticsHost").innerHTML = renderNutritionGrowthAnalytics(filteredReports);
    renderNutritionGrowthTable(filteredReports);
  }

  document.getElementById("nutritionGrowthSearchButton").addEventListener("click", () => loadReports().catch(error => showToast(error.message)));
  document.getElementById("nutritionGrowthSearchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadReports().catch(error => showToast(error.message));
    }
  });
  document.getElementById("nutritionGrowthCenterFilter").addEventListener("change", () => loadReports().catch(error => showToast(error.message)));

  renderNutritionGrowthTable(reports);
}

function renderNutritionGrowthTable(reports = []) {
  document.getElementById("nutritionGrowthCount").textContent = `${reports.length} shown`;

  if (!reports.length) {
    document.getElementById("nutritionGrowthTableHost").innerHTML = emptyState("No nutrition growth monitoring reports yet.");
    return;
  }

  document.getElementById("nutritionGrowthTableHost").innerHTML = `
    <div class="data-table-scroll">
      <table class="data-table nutrition-growth-table">
        <thead>
          <tr>
            <th class="sticky-column">Actions</th>
            <th>Month</th>
            <th>Feeding Center</th>
            <th>Submitted</th>
            <th>Children</th>
            <th>Severely Underweight</th>
            <th>Underweight</th>
            <th>Normal</th>
            <th>Overweight</th>
          </tr>
        </thead>
        <tbody>
          ${reports.map(report => `
            <tr>
              <td class="sticky-column">
                <div class="table-actions">
                  <button type="button" class="icon-button" title="Edit" data-nutrition-growth-edit-id="${report.id}">${icon("edit")}</button>
                  <button type="button" class="icon-button" title="Print" data-nutrition-growth-print-id="${report.id}">${icon("print")}</button>
                </div>
              </td>
              <td>${escapeHtml(reportMonthLabel(report.report_month))}</td>
              <td>${escapeHtml(report.center_name || "")}</td>
              <td>${escapeHtml(report.submitted_date || "")}</td>
              <td>${escapeHtml(report.child_count || 0)}</td>
              <td>${escapeHtml(report.severely_underweight_count || 0)}</td>
              <td>${escapeHtml(report.underweight_count || 0)}</td>
              <td>${escapeHtml(report.normal_count || 0)}</td>
              <td>${escapeHtml(report.overweight_count || 0)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
  attachNutritionGrowthTableHandlers(elements.pageRoot);
}

function attachNutritionGrowthTableHandlers(scope = document) {
  scope.querySelectorAll("[data-nutrition-growth-edit-id]").forEach(button => {
    button.addEventListener("click", () => navigate("nutrition-growth", button.dataset.nutritionGrowthEditId));
  });
  scope.querySelectorAll("[data-nutrition-growth-print-id]").forEach(button => {
    button.addEventListener("click", async () => {
      try {
        const report = await loadNutritionGrowthReport(button.dataset.nutritionGrowthPrintId);
        printNutritionGrowthReport(report);
      } catch (error) {
        showToast(error.message);
      }
    });
  });
}

async function renderNutritionGrowthEditorPage(id = "", isNew = false) {
  const [centers, cgs] = await Promise.all([
    loadNutritionCenters(),
    loadNutritionCgsReference()
  ]);
  state.nutritionCgsReference = cgs;
  const report = isNew ? blankNutritionGrowthReport() : await loadNutritionGrowthDraft({ id });
  state.currentNutritionGrowthReport = report;

  setTitle(isNew ? "New Growth Monitoring Report" : "Growth Monitoring Report");
  setTopbarActions([
    { id: "nutritionGrowthBack", label: "Reports", icon: "table", onClick: () => navigate("nutrition-growth") },
    { id: "nutritionGrowthRefresh", label: "Refresh Children", icon: "refresh", onClick: () => refreshNutritionGrowthDraft().catch(error => showToast(error.message)) },
    { id: "nutritionGrowthSave", label: "Save", icon: "save", variant: "primary", onClick: () => saveCurrentNutritionGrowthReport().catch(error => showToast(error.message)) },
    { id: "nutritionGrowthPrint", label: "Print", icon: "print", onClick: () => printNutritionGrowthReport(collectNutritionGrowthReport(true)) },
    ...(!isNew ? [
      { id: "nutritionGrowthDelete", label: "Delete", icon: "bin", variant: "danger", onClick: () => deleteCurrentNutritionGrowthReport(id).catch(error => showToast(error.message)) }
    ] : [])
  ]);

  elements.pageRoot.innerHTML = renderNutritionGrowthForm(report, centers);
  attachNutritionGrowthFormHandlers();
}

function renderNutritionGrowthForm(report, centers = []) {
  const selectedId = Number(report.center_id || 0);
  const hasSelected = centers.some(center => Number(center.id) === selectedId);

  return `
    <section class="application-paper nutrition-paper nutrition-growth-paper editable">
      <header class="monitoring-heading">
        <img src="/assets/paofi-logo.png" alt="">
        <div>
          <h2>Payatas Orione Foundation Inc.</h2>
          <h3>Nutrition Program - Supplemental Feeding Growth Monitoring</h3>
        </div>
      </header>
      <section class="paper-section">
        <h3>Monthly Report Details</h3>
        <div class="monitoring-identity-grid">
          <div class="paper-field wide">
            <label for="nutritionGrowthCenter">Feeding Center</label>
            <select id="nutritionGrowthCenter" data-growth-field="center_id">
              <option value="" ${selectedId ? "" : "selected"}></option>
              ${!hasSelected && selectedId ? `<option value="${selectedId}" selected>${escapeHtml(report.center_name || `Center ${selectedId}`)}</option>` : ""}
              ${centers.map(center => `<option value="${center.id}" ${Number(center.id) === selectedId ? "selected" : ""}>${escapeHtml(center.center_name)}</option>`).join("")}
            </select>
          </div>
          <div class="paper-field">
            <label for="nutritionGrowthMonth">Report Month</label>
            <input id="nutritionGrowthMonth" type="month" data-growth-field="report_month" value="${escapeHtml(report.report_month || currentReportMonth())}">
          </div>
          <div class="paper-field">
            <label for="nutritionGrowthSubmittedDate">Date of Submission</label>
            <input id="nutritionGrowthSubmittedDate" type="date" data-growth-field="submitted_date" value="${escapeHtml(nutritionDateInputValue(report.submitted_date || nutritionTodayDate()) || todayDate())}">
          </div>
        </div>
      </section>
      <section class="paper-section">
        <div class="family-section-header">
          <h3>Child Growth Records</h3>
          <span id="nutritionGrowthEntryCount" class="table-count">${(report.entries || []).length} child${(report.entries || []).length === 1 ? "" : "ren"}</span>
        </div>
        <div id="nutritionGrowthEntriesHost">
          ${renderNutritionGrowthEntries(report)}
        </div>
      </section>
    </section>
  `;
}

function renderNutritionGrowthEntries(report) {
  const entries = report.entries || [];
  if (!report.center_id) {
    return emptyState("Select a feeding center and report month, then refresh children.");
  }

  if (!entries.length) {
    return emptyState("No beneficiaries are linked to this feeding center yet.");
  }

  return `
    <div class="data-table-scroll nutrition-growth-entry-wrap">
      <table class="family-table nutrition-growth-entry-table">
        <thead>
          <tr>
            <th>Beneficiary</th>
            <th>Gender</th>
            <th>Birth Date</th>
            <th>Age in Months</th>
            <th>Latest Growth Monitoring Record</th>
            <th>Height (cm)</th>
            <th>Weight (kg)</th>
            <th>Height Change</th>
            <th>Weight Change</th>
            <th>CGS Classification</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(entry => renderNutritionGrowthEntryRow(entry)).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderNutritionGrowthEntryRow(entry = {}) {
  const latest = [
    entry.previous_record_date ? `Date: ${entry.previous_record_date}` : "",
    entry.previous_height_cm ? `Height: ${entry.previous_height_cm} cm` : "",
    entry.previous_weight_kg ? `Weight: ${entry.previous_weight_kg} kg` : "",
    entry.previous_cgs_classification ? `CGS: ${entry.previous_cgs_classification}` : ""
  ].filter(Boolean).join(" | ") || "No prior record";

  return `
    <tr
      data-growth-entry-row
      data-beneficiary-id="${escapeHtml(entry.beneficiary_id || "")}"
      data-beneficiary-no="${escapeHtml(entry.beneficiary_no || "")}"
      data-beneficiary-name="${escapeHtml(entry.beneficiary_name || "")}"
      data-gender="${escapeHtml(entry.gender || "")}"
      data-birth-date="${escapeHtml(entry.birth_date || "")}"
      data-previous-height="${escapeHtml(entry.previous_height_cm || "")}"
      data-previous-weight="${escapeHtml(entry.previous_weight_kg || "")}"
      data-previous-date="${escapeHtml(entry.previous_record_date || "")}"
      data-previous-classification="${escapeHtml(entry.previous_cgs_classification || "")}"
    >
      <td>
        <strong>${escapeHtml(entry.beneficiary_name || "")}</strong>
        <span class="subtle-cell">${escapeHtml(entry.beneficiary_no || "")}</span>
      </td>
      <td>${escapeHtml(entry.gender || "")}</td>
      <td>${escapeHtml(entry.birth_date || "")}</td>
      <td data-growth-computed="age_months">${escapeHtml(entry.age_months || "")}</td>
      <td class="latest-growth-cell">${escapeHtml(latest)}</td>
      <td><input type="number" step="0.01" data-growth-entry-field="height_cm" value="${escapeHtml(entry.height_cm || "")}"></td>
      <td><input type="number" step="0.01" data-growth-entry-field="weight_kg" value="${escapeHtml(entry.weight_kg || "")}"></td>
      <td data-growth-computed="height_change_cm">${escapeHtml(entry.height_change_cm || "")}</td>
      <td data-growth-computed="weight_change_kg">${escapeHtml(entry.weight_change_kg || "")}</td>
      <td data-growth-computed="cgs_classification">${escapeHtml(entry.cgs_classification || "")}</td>
    </tr>
  `;
}

function nutritionGrowthNumber(value) {
  const number = nutritionNumber(value);
  return number === null ? null : number;
}

function nutritionGrowthFormatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return Number(number.toFixed(2)).toString();
}

function nutritionGrowthDelta(current, previous) {
  const currentNumber = nutritionGrowthNumber(current);
  const previousNumber = nutritionGrowthNumber(previous);
  if (currentNumber === null || previousNumber === null) return "";
  return nutritionGrowthFormatNumber(currentNumber - previousNumber);
}

function nutritionGrowthGenderKey(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text.startsWith("m")) return "male";
  if (text.startsWith("f")) return "female";
  return "";
}

function nutritionGrowthReportMonthReference(reportMonth) {
  const match = /^(\d{4})-(\d{1,2})$/.exec(String(reportMonth || ""));
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]), 0);
}

function nutritionGrowthAgeMonths(birthDate, reportMonth) {
  const birth = parseNutritionDate(birthDate);
  const reference = nutritionGrowthReportMonthReference(reportMonth);
  if (!birth || !reference || reference < birth) return "";

  let months = (reference.getFullYear() - birth.getFullYear()) * 12;
  months += reference.getMonth() - birth.getMonth();
  if (reference.getDate() < birth.getDate()) months -= 1;
  return months >= 0 ? String(months) : "";
}

function classifyNutritionGrowthRow(row, ageMonths, weightKg) {
  const reference = state.nutritionCgsReference;
  const genderKey = nutritionGrowthGenderKey(row.dataset.gender);
  const standards = reference?.standards?.[genderKey] || [];
  const rowStandard = standards.find(item => Number(item.age_months) === Number(ageMonths));
  const weight = nutritionGrowthNumber(weightKg);
  if (!rowStandard || weight === null) return "";

  const roundedWeight = Math.round(weight * 10) / 10;
  if (roundedWeight <= Number(rowStandard.severely_underweight_max)) return "Severely Underweight";
  if (roundedWeight <= Number(rowStandard.underweight_max)) return "Underweight";
  if (roundedWeight <= Number(rowStandard.normal_max)) return "Normal";
  return "Overweight";
}

function updateNutritionGrowthComputedRow(row) {
  const reportMonth = elements.pageRoot.querySelector('[data-growth-field="report_month"]')?.value || currentReportMonth();
  const heightInput = row.querySelector('[data-growth-entry-field="height_cm"]');
  const weightInput = row.querySelector('[data-growth-entry-field="weight_kg"]');
  const ageMonths = nutritionGrowthAgeMonths(row.dataset.birthDate, reportMonth);
  const heightChange = nutritionGrowthDelta(heightInput?.value, row.dataset.previousHeight);
  const weightChange = nutritionGrowthDelta(weightInput?.value, row.dataset.previousWeight);
  const classification = classifyNutritionGrowthRow(row, ageMonths, weightInput?.value);

  row.querySelector('[data-growth-computed="age_months"]').textContent = ageMonths;
  row.querySelector('[data-growth-computed="height_change_cm"]').textContent = heightChange;
  row.querySelector('[data-growth-computed="weight_change_kg"]').textContent = weightChange;
  row.querySelector('[data-growth-computed="cgs_classification"]').textContent = classification;
}

function updateNutritionGrowthComputedRows() {
  elements.pageRoot.querySelectorAll("[data-growth-entry-row]").forEach(updateNutritionGrowthComputedRow);
}

function updateNutritionGrowthEntryCount() {
  const count = elements.pageRoot.querySelectorAll("[data-growth-entry-row]").length;
  const target = document.getElementById("nutritionGrowthEntryCount");
  if (target) target.textContent = `${count} child${count === 1 ? "" : "ren"}`;
}

function collectNutritionGrowthReport(includeComputed = false) {
  const report = {};
  if (state.currentNutritionGrowthReport?.id) report.id = state.currentNutritionGrowthReport.id;

  elements.pageRoot.querySelectorAll("[data-growth-field]").forEach(input => {
    report[input.dataset.growthField] = input.dataset.growthField === "submitted_date"
      ? normalizeNutritionDateValue(input.value)
      : input.value;
  });

  report.center_name = elements.pageRoot.querySelector("#nutritionGrowthCenter option:checked")?.textContent.trim() || state.currentNutritionGrowthReport?.center_name || "";
  report.entries = [...elements.pageRoot.querySelectorAll("[data-growth-entry-row]")].map((row, index) => {
    const entry = {
      beneficiary_id: row.dataset.beneficiaryId,
      beneficiary_no: row.dataset.beneficiaryNo,
      beneficiary_name: row.dataset.beneficiaryName,
      gender: row.dataset.gender,
      birth_date: row.dataset.birthDate,
      height_cm: row.querySelector('[data-growth-entry-field="height_cm"]')?.value || "",
      weight_kg: row.querySelector('[data-growth-entry-field="weight_kg"]')?.value || "",
      previous_record_date: row.dataset.previousDate,
      previous_height_cm: row.dataset.previousHeight,
      previous_weight_kg: row.dataset.previousWeight,
      previous_cgs_classification: row.dataset.previousClassification,
      row_order: index
    };

    if (includeComputed) {
      entry.age_months = row.querySelector('[data-growth-computed="age_months"]')?.textContent || "";
      entry.height_change_cm = row.querySelector('[data-growth-computed="height_change_cm"]')?.textContent || "";
      entry.weight_change_kg = row.querySelector('[data-growth-computed="weight_change_kg"]')?.textContent || "";
      entry.cgs_classification = row.querySelector('[data-growth-computed="cgs_classification"]')?.textContent || "";
    }

    return entry;
  });

  return report;
}

async function refreshNutritionGrowthDraft() {
  const current = collectNutritionGrowthReport(true);
  const centerId = current.center_id || "";
  const reportMonth = current.report_month || "";
  if (!centerId || !reportMonth) {
    showToast("Select a feeding center and report month first.");
    return;
  }

  const currentEntryMap = new Map(current.entries.map(entry => [Number(entry.beneficiary_id), entry]));
  const draft = await loadNutritionGrowthDraft({
    id: current.id || "",
    centerId,
    reportMonth,
    submittedDate: current.submitted_date
  });

  draft.entries = (draft.entries || []).map(entry => {
    const currentEntry = currentEntryMap.get(Number(entry.beneficiary_id));
    return currentEntry
      ? { ...entry, height_cm: currentEntry.height_cm, weight_kg: currentEntry.weight_kg }
      : entry;
  });
  state.currentNutritionGrowthReport = draft;
  document.getElementById("nutritionGrowthEntriesHost").innerHTML = renderNutritionGrowthEntries(draft);
  attachNutritionGrowthEntryHandlers();
  updateNutritionGrowthComputedRows();
  updateNutritionGrowthEntryCount();
}

function attachNutritionGrowthEntryHandlers(root = elements.pageRoot) {
  root.querySelectorAll("[data-growth-entry-field]").forEach(input => {
    input.addEventListener("input", () => updateNutritionGrowthComputedRow(input.closest("[data-growth-entry-row]")));
  });
}

function attachNutritionGrowthFormHandlers() {
  document.getElementById("nutritionGrowthCenter")?.addEventListener("change", () => refreshNutritionGrowthDraft().catch(error => showToast(error.message)));
  document.getElementById("nutritionGrowthMonth")?.addEventListener("change", () => refreshNutritionGrowthDraft().catch(error => showToast(error.message)));
  document.getElementById("nutritionGrowthSubmittedDate")?.addEventListener("blur", event => {
    if (event.target.type !== "date") event.target.value = normalizeNutritionDateValue(event.target.value);
  });
  attachNutritionGrowthEntryHandlers();
  updateNutritionGrowthComputedRows();
  updateNutritionGrowthEntryCount();
}

async function saveCurrentNutritionGrowthReport() {
  updateNutritionGrowthComputedRows();
  const report = collectNutritionGrowthReport();
  if (!report.center_id) {
    showToast("Feeding center is required.");
    return;
  }
  if (!report.report_month) {
    showToast("Report month is required.");
    return;
  }

  const payload = await api("/api/nutrition/growth/reports", {
    method: "POST",
    body: JSON.stringify(report)
  });

  state.currentNutritionGrowthReport = payload.report;
  await refreshStats();
  showToast("Growth monitoring report saved.");
  history.replaceState(null, "", `#/nutrition-growth/${payload.report.id}`);
  await renderNutritionGrowthEditorPage(String(payload.report.id), false);
}

async function deleteCurrentNutritionGrowthReport(id) {
  const report = state.currentNutritionGrowthReport || await loadNutritionGrowthReport(id);
  const confirmed = window.confirm(`Delete this growth monitoring report?\n\n${reportMonthLabel(report.report_month)}\n${report.center_name}`);
  if (!confirmed) return;

  await api(`/api/nutrition/growth/reports/${id}`, { method: "DELETE" });
  await refreshStats();
  showToast("Growth monitoring report deleted.");
  navigate("nutrition-growth");
}

function monthKeyLabel(reportMonth = "") {
  const match = /^(\d{4})-(\d{2})$/.exec(String(reportMonth || ""));
  if (!match) return reportMonth || "No Month";

  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return date.toLocaleDateString(undefined, { month: "short" });
}

function nutritionGrowthYearlyRows(reports = []) {
  return reports
    .flatMap(report => (report.entries || []).map(entry => ({ report, entry })))
    .sort((left, right) => {
      const monthSort = String(left.report.report_month || "").localeCompare(String(right.report.report_month || ""));
      if (monthSort) return monthSort;
      const centerSort = String(left.report.center_name || "").localeCompare(String(right.report.center_name || ""));
      if (centerSort) return centerSort;
      return String(left.entry.beneficiary_name || "").localeCompare(String(right.entry.beneficiary_name || ""));
    });
}

function nutritionGrowthCountEntries(items = [], labeler) {
  const map = new Map();
  items.forEach(item => {
    const label = labeler(item) || "Not Classified";
    map.set(label, (map.get(label) || 0) + 1);
  });
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function printBarChart(title, rows = [], total = 0) {
  const denominator = Math.max(total, ...rows.map(row => row.count), 1);
  return `
    <section class="chart-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="chart-bars">
        ${rows.length ? rows.map(row => `
          <div class="chart-row">
            <span>${escapeHtml(row.label)}</span>
            <div><i style="width:${Math.max(4, Math.round((row.count / denominator) * 100))}%"></i></div>
            <strong>${escapeHtml(row.count)}</strong>
          </div>
        `).join("") : `<p>No records.</p>`}
      </div>
    </section>
  `;
}

function printNutritionGrowthYearlyTableRows(rows = []) {
  if (!rows.length) {
    return `<tr><td colspan="13">No growth monitoring records found for this year.</td></tr>`;
  }

  return rows.map(({ report, entry }) => `
    <tr>
      <td>${escapeHtml(reportMonthLabel(report.report_month))}</td>
      <td>${escapeHtml(report.submitted_date || "")}</td>
      <td>${escapeHtml(report.center_name || "")}</td>
      <td>${escapeHtml(entry.beneficiary_no || "")}</td>
      <td>${escapeHtml(entry.beneficiary_name || "")}</td>
      <td>${escapeHtml(entry.gender || "")}</td>
      <td>${escapeHtml(entry.age_months || "")}</td>
      <td>${escapeHtml(entry.previous_record_date || "")}</td>
      <td>${escapeHtml(entry.height_cm || "")}</td>
      <td>${escapeHtml(entry.weight_kg || "")}</td>
      <td>${escapeHtml(entry.height_change_cm || "")}</td>
      <td>${escapeHtml(entry.weight_change_kg || "")}</td>
      <td>${escapeHtml(entry.cgs_classification || "")}</td>
    </tr>
  `).join("");
}

async function printNutritionGrowthYearlySummary() {
  const defaultYear = String(new Date().getFullYear());
  const year = String(window.prompt("Print growth monitoring yearly summary for which year?", defaultYear) || "").trim();
  if (!year) return;
  if (!/^\d{4}$/.test(year)) {
    showToast("Enter a valid 4-digit year.");
    return;
  }

  const reports = (await loadNutritionGrowthReports({ search: year }))
    .filter(report => String(report.report_month || "").startsWith(`${year}-`));
  if (!reports.length) {
    showToast(`No growth monitoring reports found for ${year}.`);
    return;
  }

  const detailedReports = [];
  for (const report of reports) {
    detailedReports.push(await loadNutritionGrowthReport(report.id));
  }

  const rows = nutritionGrowthYearlyRows(detailedReports);
  const statusCounts = nutritionGrowthCountEntries(rows, item => item.entry.cgs_classification);
  const centerCounts = nutritionGrowthCountEntries(rows, item => item.report.center_name);
  const monthCounts = nutritionGrowthCountEntries(rows, item => monthKeyLabel(item.report.report_month))
    .sort((left, right) => {
      const order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return order.indexOf(left.label) - order.indexOf(right.label);
    });
  const needsFollowUp = rows.filter(item => ["Severely Underweight", "Underweight"].includes(item.entry.cgs_classification)).length;
  const normalCount = rows.filter(item => item.entry.cgs_classification === "Normal").length;
  const printWindow = window.open("", "_blank", "width=1200,height=820");
  if (!printWindow) {
    showToast("Allow popups to print yearly summaries.");
    return;
  }

  const logoSrc = `${window.location.origin}/assets/paofi-logo.png`;
  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Nutrition Growth Monitoring ${escapeHtml(year)} Summary</title>
        <style>
          @page { size: letter landscape; margin: 8mm; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #1d2520; font-family: "Segoe UI", Arial, sans-serif; font-size: 8.2px; }
          button { margin: 10px; border: 1px solid #bdd3c6; border-radius: 7px; background: #ffffff; padding: 8px 12px; color: #155b3c; font-weight: 700; }
          .sheet { width: 11in; min-height: 8.5in; margin: 0 auto; padding: 0.2in; background: #ffffff; }
          .header { display: grid; grid-template-columns: 48px minmax(0, 1fr) 2.1in; gap: 10px; align-items: center; border-bottom: 2px solid #1f7a4f; padding-bottom: 7px; }
          .header img { width: 44px; height: 44px; object-fit: contain; }
          h1, h2, h3, p { margin: 0; }
          h1 { color: #2f68b1; font-family: Georgia, "Times New Roman", serif; font-size: 14px; text-transform: uppercase; }
          h2 { color: #1d2520; font-size: 11px; text-transform: uppercase; }
          .meta { text-align: right; color: #4f5e55; }
          .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 8px 0; }
          .kpi { border: 1px solid #cddbd2; border-radius: 6px; padding: 6px; background: #f6faf8; }
          .kpi span { display: block; color: #5b6861; font-size: 6.8px; text-transform: uppercase; font-weight: 800; }
          .kpi strong { color: #155b3c; font-size: 13px; }
          .charts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-bottom: 8px; }
          .chart-card { border: 1px solid #cddbd2; border-radius: 7px; padding: 7px; break-inside: avoid; }
          .chart-card h3 { color: #143d33; font-size: 8px; margin-bottom: 6px; text-transform: uppercase; }
          .chart-row { display: grid; grid-template-columns: 1fr 1.8fr 24px; gap: 5px; align-items: center; margin-bottom: 4px; }
          .chart-row span { overflow-wrap: anywhere; }
          .chart-row div { height: 9px; border-radius: 999px; background: #eaf0ed; overflow: hidden; }
          .chart-row i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #1f7a4f, #3f88c5); }
          .chart-row strong { text-align: right; font-variant-numeric: tabular-nums; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 1px solid #cbd8d0; padding: 2.5px 3px; vertical-align: top; overflow-wrap: anywhere; }
          th { background: #eaf6ef; color: #143d33; font-size: 6.4px; text-transform: uppercase; }
          td { font-size: 6.6px; }
          @media print { button { display: none; } .sheet { width: auto; min-height: auto; margin: 0; padding: 0; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Print</button>
        <main class="sheet">
          <header class="header">
            <img src="${escapeHtml(logoSrc)}" alt="">
            <div>
              <h1>Payatas Orione Foundation Inc.</h1>
              <h2>Nutrition Program - Supplemental Feeding Growth Monitoring Yearly Summary</h2>
            </div>
            <div class="meta">
              <p><strong>${escapeHtml(year)}</strong></p>
              <p>${detailedReports.length} monthly report${detailedReports.length === 1 ? "" : "s"}</p>
              <p>${rows.length} raw child record${rows.length === 1 ? "" : "s"}</p>
            </div>
          </header>
          <section class="kpis">
            <div class="kpi"><span>Monthly Reports</span><strong>${detailedReports.length}</strong></div>
            <div class="kpi"><span>Raw Records</span><strong>${rows.length}</strong></div>
            <div class="kpi"><span>Needs Follow-Up</span><strong>${needsFollowUp}</strong></div>
            <div class="kpi"><span>Normal</span><strong>${normalCount}</strong></div>
          </section>
          <section class="charts">
            ${printBarChart("CGS Classification", statusCounts, rows.length)}
            ${printBarChart("Records by Center", centerCounts, rows.length)}
            ${printBarChart("Records by Month", monthCounts, rows.length)}
          </section>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Submitted</th>
                <th>Center</th>
                <th>Beneficiary No.</th>
                <th>Beneficiary</th>
                <th>Gender</th>
                <th>Age Months</th>
                <th>Previous Record</th>
                <th>Height</th>
                <th>Weight</th>
                <th>Height Change</th>
                <th>Weight Change</th>
                <th>CGS</th>
              </tr>
            </thead>
            <tbody>${printNutritionGrowthYearlyTableRows(rows)}</tbody>
          </table>
        </main>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function printNutritionGrowthReport(report) {
  const printWindow = window.open("", "_blank", "width=1040,height=760");
  if (!printWindow) {
    showToast("Allow popups to print growth monitoring reports.");
    return;
  }

  const entries = report.entries || [];
  const logoSrc = `${window.location.origin}/assets/paofi-logo.png`;
  const statusCounts = nutritionGrowthStatusCounts(entries);
  const statusSummary = renderBarList(statusCounts, Math.max(entries.length, 1), 4);

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(report.center_name || "Growth Monitoring")} - ${escapeHtml(reportMonthLabel(report.report_month))}</title>
        <style>
          @page { size: letter landscape; margin: 8mm; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #1d2520; font-family: "Segoe UI", Arial, sans-serif; font-size: 9px; }
          button { margin: 10px; border: 1px solid #bdd3c6; border-radius: 7px; background: #ffffff; padding: 8px 12px; color: #155b3c; font-weight: 700; }
          .sheet { width: 11in; min-height: 8.5in; margin: 0 auto; padding: 0.22in; background: #ffffff; }
          .header { display: grid; grid-template-columns: 48px minmax(0, 1fr) 2.2in; gap: 10px; align-items: center; border-bottom: 2px solid #1f7a4f; padding-bottom: 7px; }
          .header img { width: 44px; height: 44px; object-fit: contain; }
          h1, h2, h3, p { margin: 0; }
          h1 { color: #2f68b1; font-family: Georgia, "Times New Roman", serif; font-size: 14px; text-transform: uppercase; }
          h2 { color: #1d2520; font-size: 12px; text-transform: uppercase; }
          .meta { display: grid; gap: 3px; color: #4f5e55; text-align: right; }
          .summary { margin: 8px 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
          .summary div { border: 1px solid #cddbd2; border-radius: 6px; padding: 5px; background: #f6faf8; }
          .summary span { display: block; color: #5b6861; font-size: 7px; text-transform: uppercase; font-weight: 800; }
          .summary strong { font-size: 12px; color: #155b3c; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 1px solid #cbd8d0; padding: 3px 4px; vertical-align: top; overflow-wrap: anywhere; }
          th { background: #eaf6ef; color: #143d33; font-size: 7.2px; text-transform: uppercase; }
          td { font-size: 7.4px; }
          .latest { width: 21%; }
          .name { width: 16%; }
          @media print { button { display: none; } .sheet { width: auto; min-height: auto; margin: 0; padding: 0; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Print</button>
        <main class="sheet">
          <header class="header">
            <img src="${escapeHtml(logoSrc)}" alt="">
            <div>
              <h1>Payatas Orione Foundation Inc.</h1>
              <h2>Nutrition Program - Supplemental Feeding Growth Monitoring</h2>
            </div>
            <div class="meta">
              <p><strong>${escapeHtml(report.center_name || "")}</strong></p>
              <p>${escapeHtml(reportMonthLabel(report.report_month))}</p>
              <p>Submitted: ${escapeHtml(report.submitted_date || "")}</p>
            </div>
          </header>
          <section class="summary">
            <div><span>Children</span><strong>${entries.length}</strong></div>
            <div><span>Severely Underweight</span><strong>${analyticsCount(statusCounts, "Severely Underweight")}</strong></div>
            <div><span>Underweight</span><strong>${analyticsCount(statusCounts, "Underweight")}</strong></div>
            <div><span>Normal</span><strong>${analyticsCount(statusCounts, "Normal")}</strong></div>
          </section>
          <table>
            <thead>
              <tr>
                <th class="name">Beneficiary</th>
                <th>Gender</th>
                <th>Birth Date</th>
                <th>Age Months</th>
                <th class="latest">Latest Growth Monitoring Record</th>
                <th>Height</th>
                <th>Weight</th>
                <th>Height Change</th>
                <th>Weight Change</th>
                <th>CGS Classification</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map(entry => `
                <tr>
                  <td class="name">${escapeHtml(entry.beneficiary_name || "")}<br>${escapeHtml(entry.beneficiary_no || "")}</td>
                  <td>${escapeHtml(entry.gender || "")}</td>
                  <td>${escapeHtml(entry.birth_date || "")}</td>
                  <td>${escapeHtml(entry.age_months || "")}</td>
                  <td class="latest">${escapeHtml([
                    entry.previous_record_date ? `Date: ${entry.previous_record_date}` : "",
                    entry.previous_height_cm ? `Height: ${entry.previous_height_cm} cm` : "",
                    entry.previous_weight_kg ? `Weight: ${entry.previous_weight_kg} kg` : "",
                    entry.previous_cgs_classification ? `CGS: ${entry.previous_cgs_classification}` : ""
                  ].filter(Boolean).join(" | ") || "No prior record")}</td>
                  <td>${escapeHtml(entry.height_cm || "")}</td>
                  <td>${escapeHtml(entry.weight_kg || "")}</td>
                  <td>${escapeHtml(entry.height_change_cm || "")}</td>
                  <td>${escapeHtml(entry.weight_change_kg || "")}</td>
                  <td>${escapeHtml(entry.cgs_classification || "")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </main>
      </body>
    </html>
  `);
  printWindow.document.close();
}

async function renderMonitoringPage(id = "") {
  if (id && id !== "new") {
    await renderMonitoringEditorPage(id);
    return;
  }

  if (id === "new") {
    await renderMonitoringEditorPage("");
    return;
  }

  setTitle("Monitoring");
  setTopbarActions([
    { id: "monitoringNew", label: "New Report", icon: "plus", variant: "primary", onClick: () => navigate("monitoring", "new") }
  ]);

  const payload = await api("/api/monitoring/reports?limit=500");
  const reports = payload.reports || [];

  elements.pageRoot.innerHTML = `
    ${renderMonitoringOverview(reports)}
    <section class="monitoring-page">
      <div class="table-toolbar">
        <div class="search-band compact with-button">
          <span class="search-icon">${icon("search")}</span>
          <input id="monitoringSearchInput" type="search" placeholder="Filter monitoring reports">
          <button id="monitoringSearchButton" type="button" class="action-button">
            <span class="button-icon">${icon("search")}</span>
            <span>Search</span>
          </button>
        </div>
        <span id="monitoringCount" class="table-count"></span>
      </div>
      <div id="monitoringListHost" class="monitoring-list-host"></div>
    </section>
  `;

  async function loadReports() {
    const search = encodeURIComponent(document.getElementById("monitoringSearchInput").value.trim());
    const reportPayload = await api(`/api/monitoring/reports?search=${search}&limit=500`);
    renderMonitoringList(reportPayload.reports || []);
  }

  document.getElementById("monitoringSearchButton").addEventListener("click", () => loadReports().catch(error => showToast(error.message)));
  document.getElementById("monitoringSearchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadReports().catch(error => showToast(error.message));
    }
  });

  renderMonitoringList(reports);
}

function renderMonitoringList(reports) {
  document.getElementById("monitoringCount").textContent = `${reports.length} shown`;

  if (!reports.length) {
    document.getElementById("monitoringListHost").innerHTML = emptyState("No monitoring reports yet.");
    return;
  }

  document.getElementById("monitoringListHost").innerHTML = `
    <div class="data-table-scroll">
      <table class="data-table monitoring-table">
        <thead>
          <tr>
            <th class="sticky-column">Actions</th>
            <th>Month</th>
            <th>Beneficiary</th>
            <th>Application No.</th>
            <th>Project</th>
            <th>Sales</th>
            <th>Expenses</th>
            <th>Running Income</th>
          </tr>
        </thead>
        <tbody>
          ${reports.map(report => `
            <tr>
              <td class="sticky-column">
                <div class="table-actions">
                  <button type="button" class="icon-button" title="Edit" data-monitoring-edit-id="${report.id}">${icon("edit")}</button>
                  <button type="button" class="icon-button" title="Print" data-monitoring-print-id="${report.id}">${icon("print")}</button>
                </div>
              </td>
              <td>${escapeHtml(reportMonthLabel(report.report_month))}</td>
              <td>${escapeHtml(report.beneficiary_name || "")}</td>
              <td>${escapeHtml(report.control_no || "")}</td>
              <td>${escapeHtml(report.project_type || "")}</td>
              <td>${escapeHtml(formatMoney(report.total_sales))}</td>
              <td>${escapeHtml(formatMoney(report.total_expenses))}</td>
              <td>${escapeHtml(formatMoney(report.net_income))}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
  attachMonitoringReportHandlers(elements.pageRoot);
}

function attachMonitoringReportHandlers(scope = document) {
  scope.querySelectorAll("[data-monitoring-edit-id]").forEach(button => {
    button.addEventListener("click", () => navigate("monitoring", button.dataset.monitoringEditId));
  });
  scope.querySelectorAll("[data-monitoring-print-id]").forEach(button => {
    button.addEventListener("click", async () => {
      try {
        const report = await loadMonitoringReport(button.dataset.monitoringPrintId);
        printMonitoringReport(report);
      } catch (error) {
        showToast(error.message);
      }
    });
  });
}

async function renderMonitoringEditorPage(id = "") {
  setTitle(id ? "Monitoring Report" : "New Monitoring Report");
  const [report] = await Promise.all([
    id ? loadMonitoringReport(id) : Promise.resolve(blankMonitoringReport()),
    loadMonitoringBeneficiaries()
  ]);
  state.currentMonitoringReport = report;

  setTopbarActions([
    { id: "monitoringBack", label: "Reports", icon: "table", onClick: () => navigate("monitoring") },
    { id: "monitoringSave", label: "Save", icon: "save", variant: "primary", onClick: () => saveCurrentMonitoringReport().catch(error => showToast(error.message)) },
    ...(id ? [
      { id: "monitoringPrint", label: "Print", icon: "print", onClick: () => printMonitoringReport(collectMonitoringReport()) },
      { id: "monitoringDelete", label: "Delete", icon: "bin", variant: "danger", onClick: () => deleteCurrentMonitoringReport(id).catch(error => showToast(error.message)) }
    ] : [])
  ]);

  elements.pageRoot.innerHTML = renderMonitoringForm(report);
  attachMonitoringFormHandlers();
  recalculateMonitoringTotals();
}

function monitoringBeneficiaryOption(record, selectedId) {
  const label = `${record.control_no || ""} | ${fullName(record)}`;
  return `<option value="${record.id}" ${Number(selectedId) === Number(record.id) ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function renderMonitoringForm(report) {
  const selectedId = Number(report.beneficiary_id || 0);
  const hasSelected = state.monitoringBeneficiaries.some(record => Number(record.id) === selectedId);
  const projectOptions = [...MONITORING_PROJECT_OPTIONS];
  if (report.project_type && !projectOptions.includes(report.project_type)) projectOptions.push(report.project_type);

  return `
    <section class="application-paper monitoring-paper editable">
      <div class="monitoring-heading">
        <img src="/assets/paofi-logo.png" alt="">
        <div>
          <h2>Payatas Orione Foundation Inc.</h2>
          <h3>Livelihood Project Monitoring & Reporting Form</h3>
        </div>
      </div>

      <div class="monitoring-identity-grid">
        <div class="paper-field wide">
          <label for="monitoringBeneficiary">Name of Beneficiary</label>
          <select id="monitoringBeneficiary" data-monitoring-field="beneficiary_id">
            <option value="" ${selectedId ? "" : "selected"}></option>
            ${!hasSelected && selectedId ? `<option value="${selectedId}" selected>${escapeHtml(`${report.control_no || ""} | ${report.beneficiary_name || ""}`)}</option>` : ""}
            ${state.monitoringBeneficiaries.map(record => monitoringBeneficiaryOption(record, selectedId)).join("")}
          </select>
        </div>
        <div class="paper-field">
          <label for="monitoringMonth">For the Month Of</label>
          <input id="monitoringMonth" type="month" data-monitoring-field="report_month" value="${escapeHtml(report.report_month || currentReportMonth())}">
        </div>
        <div class="paper-field wide">
          <label for="monitoringProject">Project</label>
          <select id="monitoringProject" data-monitoring-field="project_type">
            <option value="" ${report.project_type ? "" : "selected"}></option>
            ${projectOptions.map(option => `<option value="${escapeHtml(option)}" ${option === report.project_type ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
          </select>
        </div>
        ${monitoringField("Application No.", "control_no", report.control_no, { readonly: true })}
        ${monitoringField("Beneficiary Name", "beneficiary_name", report.beneficiary_name, { readonly: true })}
        ${monitoringField("Chapel", "chapel", report.chapel)}
        ${monitoringField("Contact No.", "contact_no", report.contact_no, { numeric: true })}
      </div>

      ${renderMonitoringEntryTable("materials", report.materials || [])}
      ${renderMonitoringEntryTable("sales", report.sales || [])}
      ${renderMonitoringEntryTable("expenses", report.expenses || [])}

      <section class="paper-section monitoring-summary-section">
        <h3>D. Income & Expenses</h3>
        <div class="income-grid">
          <div class="paper-field">
            <label for="forwardedBalance">Forwarded Balance (last month)</label>
            <input id="forwardedBalance" type="number" step="0.01" data-monitoring-field="forwarded_balance" value="${escapeHtml(String(Number(report.forwarded_balance || 0)))}" readonly>
          </div>
          <div class="paper-field">
            <label>Add (B) Sales</label>
            <div class="display-value" id="monitoringTotalSales">${escapeHtml(formatMoney(report.total_sales))}</div>
          </div>
          <div class="paper-field">
            <label>Less (C) Expenses</label>
            <div class="display-value" id="monitoringTotalExpenses">${escapeHtml(formatMoney(report.total_expenses))}</div>
          </div>
          <div class="paper-field">
            <label>Net Income / Running Balance</label>
            <div class="display-value strong-value" id="monitoringNetIncome">${escapeHtml(formatMoney(report.net_income))}</div>
          </div>
        </div>
      </section>

      <section class="paper-section">
        <h3>E. Challenges / Issues Encountered</h3>
        <textarea rows="3" data-monitoring-field="challenges" data-capitalize="sentence" autocapitalize="sentences">${escapeHtml(report.challenges || "")}</textarea>
      </section>

      <section class="paper-section">
        <h3>F. Success Stories / Good Practices</h3>
        <textarea rows="3" data-monitoring-field="success_stories" data-capitalize="sentence" autocapitalize="sentences">${escapeHtml(report.success_stories || "")}</textarea>
      </section>

      <section class="paper-section">
        <div class="signature-grid">
          <div>
            <h3>Prepared by</h3>
            ${monitoringField("Name and Signature", "prepared_by", report.prepared_by)}
            ${monitoringField("Date", "prepared_date", report.prepared_date, { type: "date" })}
          </div>
          <div>
            <h3>Received and Checked</h3>
            ${monitoringField("Name and Signature", "checked_by", report.checked_by)}
            ${monitoringField("Date", "checked_date", report.checked_date, { type: "date" })}
          </div>
        </div>
      </section>
    </section>
  `;
}

function monitoringField(label, name, value, options = {}) {
  const type = options.type || "text";
  const numeric = options.numeric ? ' inputmode="numeric"' : "";
  const readonly = options.readonly ? " readonly" : "";
  const capitalize = !options.numeric && type !== "date" ? ' data-capitalize="words" autocapitalize="words"' : "";

  return `
    <div class="paper-field">
      <label for="monitoring_${escapeHtml(name)}">${escapeHtml(label)}</label>
      <input id="monitoring_${escapeHtml(name)}" type="${type}" data-monitoring-field="${escapeHtml(name)}" value="${escapeHtml(value || "")}"${numeric}${readonly}${capitalize}>
    </div>
  `;
}

function renderMonitoringEntryTable(type, rows) {
  const table = MONITORING_TABLES[type];
  const body = rows.length
    ? rows.map((row, index) => renderMonitoringEntryRow(type, row, index)).join("")
    : `<tr class="monitoring-empty-row"><td colspan="${table.columns.length + 1}">No entries added.</td></tr>`;

  return `
    <section class="paper-section monitoring-entry-section">
      <div class="family-section-header">
        <h3>${escapeHtml(table.title)}</h3>
        <button type="button" class="action-button compact-action" data-add-monitoring-row="${escapeHtml(type)}">
          <span class="button-icon">${icon("plus")}</span>
          <span>${escapeHtml(table.addLabel)}</span>
        </button>
      </div>
      <div class="data-table-scroll monitoring-table-wrap">
        <table class="family-table monitoring-entry-table">
          <thead>
            <tr>${table.columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join("")}<th class="row-remove-head"></th></tr>
          </thead>
          <tbody data-monitoring-table-body="${escapeHtml(type)}">
            ${body}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderMonitoringEntryRow(type, row = {}, index = 0) {
  const table = MONITORING_TABLES[type];

  return `
    <tr data-monitoring-row-container="${escapeHtml(type)}" data-monitoring-row-index="${index}">
      ${table.columns.map(column => `
        <td>
          ${renderMonitoringEntryInput(type, column, row[column.name] || "", index)}
        </td>
      `).join("")}
      <td class="row-remove-cell">
        <button type="button" class="icon-button" title="Remove row" data-remove-monitoring-row="${escapeHtml(type)}" data-monitoring-row-index="${index}">
          ${icon("bin")}
        </button>
      </td>
    </tr>
  `;
}

function renderMonitoringEntryInput(type, column, value, index) {
  const numberAttrs = column.input === "number" ? ' step="0.01"' : "";
  const normalizedValue = column.input === "number" ? moneyInputValue(value) : value;
  const capitalize = column.input === "text" && !["quantity", "inventory", "quantity_produced", "quantity_sold"].includes(column.name)
    ? ' data-capitalize="words" autocapitalize="words"'
    : "";

  return `
    <input
      type="${column.input || "text"}"
      data-monitoring-table="${escapeHtml(type)}"
      data-monitoring-row="${index}"
      data-monitoring-column="${escapeHtml(column.name)}"
      value="${escapeHtml(normalizedValue || "")}"${numberAttrs}${capitalize}>
  `;
}

function nextMonitoringRowIndex(type) {
  const indexes = [...elements.pageRoot.querySelectorAll(`[data-monitoring-row-container="${type}"]`)]
    .map(row => Number(row.dataset.monitoringRowIndex))
    .filter(Number.isFinite);

  return indexes.length ? Math.max(...indexes) + 1 : 0;
}

function addMonitoringEntryRow(type) {
  const body = elements.pageRoot.querySelector(`[data-monitoring-table-body="${type}"]`);
  if (!body) return;

  body.querySelector(".monitoring-empty-row")?.remove();
  const rowIndex = nextMonitoringRowIndex(type);
  body.insertAdjacentHTML("beforeend", renderMonitoringEntryRow(type, {}, rowIndex));
  attachCapitalizationHandlers(body.rows[body.rows.length - 1]);
  attachMonitoringRowHandlers(body.rows[body.rows.length - 1]);
}

function removeMonitoringEntryRow(button) {
  const row = button.closest("tr");
  const type = button.dataset.removeMonitoringRow;
  const body = elements.pageRoot.querySelector(`[data-monitoring-table-body="${type}"]`);
  row?.remove();

  if (body && !body.querySelector("[data-monitoring-row-container]")) {
    body.innerHTML = `<tr class="monitoring-empty-row"><td colspan="${MONITORING_TABLES[type].columns.length + 1}">No entries added.</td></tr>`;
  }

  recalculateMonitoringTotals();
}

function collectMonitoringRows(type) {
  const rows = new Map();

  elements.pageRoot.querySelectorAll(`[data-monitoring-table="${type}"]`).forEach(input => {
    const rowIndex = Number(input.dataset.monitoringRow);
    if (!Number.isFinite(rowIndex)) return;
    if (!rows.has(rowIndex)) rows.set(rowIndex, {});
    rows.get(rowIndex)[input.dataset.monitoringColumn] = input.value;
  });

  return [...rows.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([, row]) => row)
    .filter(row => Object.values(row).some(value => String(value || "").trim()));
}

function normalizeMonitoringFieldValue(name, value) {
  if (name === "contact_no") return normalizeContactNumber(value);
  if (["challenges", "success_stories"].includes(name)) return sentenceCaseValue(value);
  if (["forwarded_balance", "total_sales", "total_expenses", "net_income"].includes(name)) return moneyInputValue(value);
  return titleCaseValue(value);
}

function collectMonitoringReport() {
  const report = {};
  if (state.currentMonitoringReport?.id) report.id = state.currentMonitoringReport.id;

  elements.pageRoot.querySelectorAll("[data-monitoring-field]").forEach(input => {
    report[input.dataset.monitoringField] = normalizeMonitoringFieldValue(input.dataset.monitoringField, input.value);
  });

  report.materials = collectMonitoringRows("materials");
  report.sales = collectMonitoringRows("sales");
  report.expenses = collectMonitoringRows("expenses");
  return report;
}

function setMonitoringPreparedBy(value, force = false) {
  const input = elements.pageRoot.querySelector('[data-monitoring-field="prepared_by"]');
  if (!input) return;
  if (force || !String(input.value || "").trim()) input.value = value || "";
}

async function updateMonitoringForwardedBalance() {
  const beneficiaryId = document.getElementById("monitoringBeneficiary")?.value || "";
  const reportMonth = elements.pageRoot.querySelector('[data-monitoring-field="report_month"]')?.value || "";
  const target = elements.pageRoot.querySelector('[data-monitoring-field="forwarded_balance"]');
  if (!target) return;

  if (!beneficiaryId || !reportMonth) {
    target.value = "0";
    recalculateMonitoringTotals();
    return;
  }

  const params = new URLSearchParams({
    beneficiaryId,
    reportMonth,
    excludeId: String(state.currentMonitoringReport?.id || 0)
  });
  const payload = await api(`/api/monitoring/forwarded-balance?${params.toString()}`);
  target.value = String(Number(payload.forwardedBalance || 0));
  recalculateMonitoringTotals();
}

async function updateMonitoringBeneficiarySnapshot() {
  const select = document.getElementById("monitoringBeneficiary");
  const beneficiary = state.monitoringBeneficiaries.find(record => Number(record.id) === Number(select?.value || 0));
  if (!beneficiary) return;

  const beneficiaryName = fullName(beneficiary);
  const values = {
    control_no: beneficiary.control_no || "",
    beneficiary_name: beneficiaryName,
    chapel: fieldValue("field_c12", beneficiary.field_c12),
    contact_no: fieldValue("field_l11", beneficiary.field_l11)
  };

  Object.entries(values).forEach(([name, value]) => {
    const input = elements.pageRoot.querySelector(`[data-monitoring-field="${name}"]`);
    if (input) input.value = value;
  });

  const projectInput = elements.pageRoot.querySelector('[data-monitoring-field="project_type"]');
  if (projectInput && !projectInput.value) {
    projectInput.value = projectFromBeneficiary(beneficiary);
  }

  setMonitoringPreparedBy(beneficiaryName, true);
  await updateMonitoringForwardedBalance();
}

function recalculateMonitoringTotals() {
  elements.pageRoot.querySelectorAll('[data-monitoring-table="sales"]').forEach(input => {
    if (!["quantity_sold", "price_per_unit"].includes(input.dataset.monitoringColumn)) return;

    const row = input.closest("tr");
    const quantity = parseMoneyInput(row?.querySelector('[data-monitoring-column="quantity_sold"]')?.value);
    const price = parseMoneyInput(row?.querySelector('[data-monitoring-column="price_per_unit"]')?.value);
    const totalInput = row?.querySelector('[data-monitoring-column="total_sales"]');
    if (totalInput && quantity && price) totalInput.value = String(quantity * price);
  });

  const totalSales = [...elements.pageRoot.querySelectorAll('[data-monitoring-table="sales"][data-monitoring-column="total_sales"]')]
    .reduce((sum, input) => sum + parseMoneyInput(input.value), 0);
  const totalExpenses = [...elements.pageRoot.querySelectorAll('[data-monitoring-table="expenses"][data-monitoring-column="amount"]')]
    .reduce((sum, input) => sum + parseMoneyInput(input.value), 0);
  const forwardedBalance = parseMoneyInput(elements.pageRoot.querySelector('[data-monitoring-field="forwarded_balance"]')?.value);
  const netIncome = forwardedBalance + totalSales - totalExpenses;

  const salesTarget = document.getElementById("monitoringTotalSales");
  const expensesTarget = document.getElementById("monitoringTotalExpenses");
  const netTarget = document.getElementById("monitoringNetIncome");
  if (salesTarget) salesTarget.textContent = formatMoney(totalSales);
  if (expensesTarget) expensesTarget.textContent = formatMoney(totalExpenses);
  if (netTarget) netTarget.textContent = formatMoney(netIncome);
}

function attachMonitoringRowHandlers(root = elements.pageRoot) {
  root.querySelectorAll("[data-remove-monitoring-row]").forEach(button => {
    button.addEventListener("click", () => removeMonitoringEntryRow(button));
  });
  root.querySelectorAll('[data-monitoring-table="sales"], [data-monitoring-table="expenses"], [data-monitoring-field="forwarded_balance"]').forEach(input => {
    input.addEventListener("input", recalculateMonitoringTotals);
  });
}

function attachMonitoringFormHandlers() {
  document.getElementById("monitoringBeneficiary")?.addEventListener("change", () => {
    updateMonitoringBeneficiarySnapshot().catch(error => showToast(error.message));
  });
  document.getElementById("monitoringMonth")?.addEventListener("change", () => {
    updateMonitoringForwardedBalance().catch(error => showToast(error.message));
  });
  elements.pageRoot.querySelectorAll("[data-add-monitoring-row]").forEach(button => {
    button.addEventListener("click", () => addMonitoringEntryRow(button.dataset.addMonitoringRow));
  });
  elements.pageRoot.querySelectorAll('[data-monitoring-field="contact_no"]').forEach(input => {
    input.addEventListener("input", () => {
      input.value = normalizeContactNumber(input.value);
    });
  });
  attachCapitalizationHandlers(elements.pageRoot);
  attachMonitoringRowHandlers(elements.pageRoot);
  setMonitoringPreparedBy(elements.pageRoot.querySelector('[data-monitoring-field="beneficiary_name"]')?.value || "", false);
  updateMonitoringForwardedBalance().catch(error => showToast(error.message));
}

async function saveCurrentMonitoringReport() {
  await updateMonitoringForwardedBalance();
  const report = collectMonitoringReport();

  if (!report.beneficiary_id) {
    showToast("Select a beneficiary.");
    return;
  }

  if (!report.report_month) {
    showToast("Report month is required.");
    return;
  }

  const payload = await api("/api/monitoring/reports", {
    method: "POST",
    body: JSON.stringify(report)
  });

  await refreshStats();
  showToast("Monitoring report saved.");
  history.replaceState(null, "", `#/monitoring/${payload.report.id}`);
  await renderMonitoringPage(String(payload.report.id));
}

async function deleteCurrentMonitoringReport(id) {
  const report = state.currentMonitoringReport || await loadMonitoringReport(id);
  const confirmed = window.confirm(`Delete this monitoring report?\n\n${report.control_no}\n${reportMonthLabel(report.report_month)}`);
  if (!confirmed) return;

  await api(`/api/monitoring/reports/${id}`, { method: "DELETE" });
  await refreshStats();
  showToast("Monitoring report deleted.");
  navigate("monitoring");
}

function printMonitoringRows(rows, columns, totalLabel = "", totalValue = "") {
  const rowHtml = rows.length
    ? rows.map(row => `<tr>${columns.map(column => `<td>${escapeHtml(column.format ? column.format(row[column.name]) : row[column.name] || "")}</td>`).join("")}</tr>`).join("")
    : `<tr>${columns.map(() => "<td>&nbsp;</td>").join("")}</tr>`;

  return `
    ${rowHtml}
    ${totalLabel ? `<tr class="total-row"><td colspan="${columns.length - 1}">${escapeHtml(totalLabel)}</td><td>${escapeHtml(totalValue)}</td></tr>` : ""}
  `;
}

function printMonitoringReport(report) {
  const printWindow = window.open("", "_blank", "width=940,height=760");
  if (!printWindow) {
    showToast("Allow popups to print reports.");
    return;
  }

  const logoSrc = `${window.location.origin}/assets/paofi-logo.png`;
  const salesColumns = MONITORING_TABLES.sales.columns.map(column => ({
    ...column,
    format: ["price_per_unit", "total_sales"].includes(column.name) ? formatMoney : value => value
  }));
  const expenseColumns = MONITORING_TABLES.expenses.columns.map(column => ({
    ...column,
    format: column.name === "amount" ? formatMoney : value => value
  }));

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(report.control_no || "Monitoring Report")} ${escapeHtml(report.report_month || "")}</title>
        <style>
          @page { size: letter; margin: 8mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #1d2520;
            background: #edf3ef;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 10px;
          }
          button {
            margin: 12px;
            border: 1px solid #bdd3c6;
            border-radius: 7px;
            background: #ffffff;
            padding: 8px 12px;
            color: #155b3c;
            font-weight: 700;
          }
          .sheet {
            width: 8.5in;
            min-height: 11in;
            margin: 0 auto;
            padding: 0.28in;
            background: #ffffff;
          }
          h1, h2, h3, p { margin: 0; }
          .header {
            display: grid;
            grid-template-columns: 58px 1fr;
            gap: 10px;
            align-items: center;
            padding-bottom: 10px;
            border-bottom: 2px solid #1f7a4f;
            text-align: center;
          }
          .header img {
            width: 54px;
            height: 54px;
            object-fit: contain;
          }
          .header h1 {
            font-size: 15px;
          }
          .header h2 {
            font-size: 14px;
          }
          .project {
            margin: 12px 0 8px;
            text-align: center;
            font-size: 13px;
          }
          .identity {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px 14px;
            margin-bottom: 12px;
          }
          .identity div {
            border-bottom: 1px solid #98a69e;
            padding: 2px 0;
          }
          .identity span {
            color: #5b6861;
            font-weight: 700;
          }
          section {
            break-inside: avoid;
            margin-top: 10px;
          }
          section h3 {
            margin-bottom: 4px;
            font-size: 11px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          th, td {
            border: 1px solid #8fa098;
            padding: 4px;
            min-height: 22px;
            text-align: left;
            vertical-align: top;
            overflow-wrap: anywhere;
          }
          th {
            background: #eef7f1;
            text-align: center;
            font-weight: 800;
          }
          .total-row td {
            font-weight: 800;
            text-align: right;
          }
          .income td:first-child {
            width: 68%;
            font-weight: 700;
          }
          .lines {
            min-height: 42px;
            border-bottom: 1px solid #98a69e;
            padding: 4px 0;
            white-space: pre-wrap;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 70px;
            margin-top: 34px;
          }
          .signature-line {
            margin-top: 36px;
            border-top: 1px solid #1d2520;
            padding-top: 4px;
            text-align: center;
            font-weight: 700;
          }
          @media print {
            body { background: #ffffff; }
            button { display: none; }
            .sheet {
              width: auto;
              min-height: auto;
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Print</button>
        <main class="sheet">
          <header class="header">
            <img src="${escapeHtml(logoSrc)}" alt="">
            <div>
              <h1>Payatas Orione Foundation, Inc.</h1>
              <h2>Livelihood Project Monitoring & Reporting Form</h2>
            </div>
          </header>
          <h2 class="project">${escapeHtml(report.project_type || "")}</h2>
          <div class="identity">
            <div><span>For the month of:</span> ${escapeHtml(reportMonthLabel(report.report_month))}</div>
            <div><span>Chapel:</span> ${escapeHtml(report.chapel || "")}</div>
            <div><span>Name of Beneficiary:</span> ${escapeHtml(report.beneficiary_name || "")}</div>
            <div><span>Contact No.:</span> ${escapeHtml(report.contact_no || "")}</div>
            <div><span>Application No.:</span> ${escapeHtml(report.control_no || "")}</div>
          </div>
          <section>
            <h3>A. Materials Received & Used</h3>
            <table>
              <thead><tr>${MONITORING_TABLES.materials.columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
              <tbody>${printMonitoringRows(report.materials || [], MONITORING_TABLES.materials.columns)}</tbody>
            </table>
          </section>
          <section>
            <h3>B. Production & Sales</h3>
            <table>
              <thead><tr>${MONITORING_TABLES.sales.columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
              <tbody>${printMonitoringRows(report.sales || [], salesColumns, "Total", formatMoney(report.total_sales))}</tbody>
            </table>
          </section>
          <section>
            <h3>C. Expenses</h3>
            <table>
              <thead><tr>${MONITORING_TABLES.expenses.columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
              <tbody>${printMonitoringRows(report.expenses || [], expenseColumns, "Total", formatMoney(report.total_expenses))}</tbody>
            </table>
          </section>
          <section>
            <h3>D. Income & Expenses</h3>
            <table class="income">
              <tbody>
                <tr><td>Forwarded Balance (last month)</td><td>${escapeHtml(formatMoney(report.forwarded_balance))}</td></tr>
                <tr><td>Add (B) Sales</td><td>${escapeHtml(formatMoney(report.total_sales))}</td></tr>
                <tr><td>Less (C) Expenses</td><td>${escapeHtml(formatMoney(report.total_expenses))}</td></tr>
                <tr><td>Net Income / Running Balance</td><td>${escapeHtml(formatMoney(report.net_income))}</td></tr>
              </tbody>
            </table>
          </section>
          <section>
            <h3>E. Challenges / Issues Encountered</h3>
            <div class="lines">${escapeHtml(report.challenges || "")}</div>
          </section>
          <section>
            <h3>F. Success Stories / Good Practices</h3>
            <div class="lines">${escapeHtml(report.success_stories || "")}</div>
          </section>
          <div class="signatures">
            <div>
              <strong>Prepared by:</strong>
              <div class="signature-line">${escapeHtml(report.prepared_by || "Name and Signature")}</div>
              <p>Date: ${escapeHtml(report.prepared_date || "")}</p>
            </div>
            <div>
              <strong>Received and Checked</strong>
              <div class="signature-line">${escapeHtml(report.checked_by || "Name and Signature")}</div>
              <p>Date: ${escapeHtml(report.checked_date || "")}</p>
            </div>
          </div>
        </main>
      </body>
    </html>
  `);
  printWindow.document.close();
}

async function renderEditorPage(id = "") {
  setTitle(id ? "Editor" : "New Application");

  const [record, monitoringReports] = id
    ? await Promise.all([loadRecord(id), loadBeneficiaryMonitoringReports(id)])
    : [await makeNewRecord(), []];
  state.currentRecord = record;
  state.pictureData = record.picture_data || "";

  setTopbarActions([
    { id: "editorNew", label: "New", icon: "plus", onClick: () => navigate("editor") },
    { id: "editorSave", label: "Save", icon: "save", variant: "primary", onClick: () => saveCurrentRecord().catch(error => showToast(error.message)) },
    { id: "editorPrint", label: "Print", icon: "print", onClick: () => printRecord(collectRecord(), monitoringReports) },
    ...(record.id ? [{ id: "editorDelete", label: "Delete", icon: "bin", variant: "danger", onClick: () => deleteCurrentRecord(record.id).catch(error => showToast(error.message)) }] : [])
  ]);

  elements.pageRoot.innerHTML = renderApplicationForm(record, "edit", monitoringReports);
  attachEditorFormHandlers();
}

async function renderViewerPage(id = "") {
  setTitle("Record Viewer");

  if (!id) {
    const payload = await api("/api/records?limit=25");
    setTopbarActions([
      { id: "viewerNew", label: "New", icon: "plus", onClick: () => navigate("editor") }
    ]);
    elements.pageRoot.innerHTML = `
      <section class="tool-panel viewer-picker">
        <div class="panel-title-row">
          <h3>Select Record</h3>
          <button type="button" class="text-button" data-menu-route="search">Search</button>
        </div>
        <div class="record-stack">
          ${payload.records.length ? payload.records.map(record => recordCard(record, "view")).join("") : emptyState("No records yet.")}
        </div>
      </section>
    `;
    document.querySelectorAll("[data-menu-route]").forEach(button => {
      button.addEventListener("click", () => navigate(button.dataset.menuRoute));
    });
    attachRecordOpenHandlers(elements.pageRoot);
    return;
  }

  const [record, monitoringReports] = await Promise.all([
    loadRecord(id),
    loadBeneficiaryMonitoringReports(id)
  ]);
  state.currentRecord = record;
  setTopbarActions([
    { id: "viewerEdit", label: "Edit", icon: "edit", variant: "primary", onClick: () => navigate("editor", record.id) },
    { id: "viewerPrint", label: "Print", icon: "print", onClick: () => printRecord(record, monitoringReports) },
    { id: "viewerDelete", label: "Delete", icon: "bin", variant: "danger", onClick: () => deleteCurrentRecord(record.id).catch(error => showToast(error.message)) }
  ]);
  elements.pageRoot.innerHTML = renderApplicationForm(record, "view", monitoringReports);
}

function renderApplicationForm(record, mode, monitoringReports = []) {
  const readonly = mode !== "edit";
  return `
    <section class="application-paper ${readonly ? "readonly" : "editable"}">
      <div class="form-heading">
        <div class="form-heading-text">
          <h2>PAYATAS ORIONE FOUNDATION INC.</h2>
          <p>"A simple effort can make a great impact"</p>
          <h3>LIVELIHOOD PROGRAM APPLICATION FORM</h3>
        </div>
        ${renderPictureBlock(record, readonly)}
      </div>

      <div class="record-strip">
        ${renderField(field("date_updated"), record, readonly)}
        ${renderField(field("control_no"), record, readonly)}
        ${renderField(field("status"), record, readonly)}
      </div>

      ${formSection("I. Personal Information", [
        "last_name", "first_name", "middle_name",
        "field_c11", "field_h11", "field_l11",
        "field_c12", "field_c13", "field_c14"
      ], record, readonly)}

      ${renderFamilySection(record, readonly)}

      ${formSection("PAOFI Beneficiary", ["paofi_active", "field_k30"], record, readonly)}
      ${formSection("III. Livelihood Information", ["field_e32", "with_business", "field_j33", "business_duration"], record, readonly)}
      ${formSection("IV. Livelihood Project Interest", ["livelihood_interest", "current_group", "field_c38", "field_f39"], record, readonly)}
      ${formSection("V. Skills and Experience", ["seminar", "field_k43"], record, readonly)}
      ${formSection("VI. Availability and Commitment", ["willingness", "commit_days"], record, readonly)}
      ${record.id ? renderBeneficiaryMonitoringSummary(monitoringReports) : ""}

      <section class="form-certification">
        <p>Pinapatunayan ko na ang lahat ng detalye sa itaas ay totoo at wasto.</p>
        <p>Ako ay seryosong makikibahagi at tatapusin ang buong proseso ng livelihood project hanggang Disyembre 2026</p>
        <div>
          <strong id="applicantSignatureName">${escapeHtml(beneficiarySignatureName(record))}</strong>
          <span>Name and Signature of the Applicant</span>
        </div>
      </section>
    </section>
  `;
}

function renderPictureBlock(record, readonly) {
  const source = readonly ? record.picture_data : state.pictureData;
  const preview = source
    ? `<img src="${escapeHtml(source)}" alt="Beneficiary picture">`
    : `<span>${readonly ? "No picture" : "Picture"}</span>`;

  if (readonly) {
    return `<div class="photo-box"><div class="photo-preview">${preview}</div></div>`;
  }

  return `
    <div class="photo-box editable-photo ${source ? "has-photo" : ""}" id="photoDropZone">
      <div id="photoPreview" class="photo-preview">${preview}</div>
      <div class="photo-actions">
        <label for="pictureInput" class="text-button photo-choose-button">Choose</label>
        <button id="removePictureButton" type="button" class="icon-button photo-remove-button" title="Remove picture" aria-label="Remove picture" ${source ? "" : "hidden"}>
          ${icon("bin")}
        </button>
      </div>
      <input id="pictureInput" type="file" accept="image/*">
    </div>
  `;
}

function formSection(title, names, record, readonly) {
  return `
    <section class="paper-section">
      <h3>${escapeHtml(title)}</h3>
      <div class="paper-grid">
        ${names.map(name => renderField(field(name), record, readonly)).join("")}
      </div>
    </section>
  `;
}

function renderField(meta, record, readonly) {
  const value = fieldValue(meta.name, record[meta.name]);
  const isWide = meta.input === "textarea" || meta.label.length > 42 || meta.name === "field_c13";
  const capitalize = shouldCapitalizeField(meta.name) ? ' data-capitalize="words" autocapitalize="words"' : "";

  if (readonly) {
    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label>${escapeHtml(meta.label)}</label>
        <div class="display-value">${escapeHtml(value).replaceAll("\n", "<br>") || "&nbsp;"}</div>
      </div>
    `;
  }

  if (meta.name in CHOICE_OPTIONS) {
    return renderChoiceField(meta, value, isWide);
  }

  if (meta.name in DROPDOWN_OPTIONS) {
    return renderDropdownField(meta, value, isWide, DROPDOWN_OPTIONS[meta.name], true);
  }

  if (meta.input === "select") {
    return renderDropdownField(meta, value, isWide, meta.options || [], false);
  }

  if (meta.input === "textarea") {
    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label for="${escapeHtml(meta.name)}">${escapeHtml(meta.label)}</label>
        <textarea id="${escapeHtml(meta.name)}" rows="${meta.rows || 3}" data-field="${escapeHtml(meta.name)}"${capitalize}>${escapeHtml(value)}</textarea>
      </div>
    `;
  }

  if (meta.name === "field_l11") {
    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label for="${escapeHtml(meta.name)}">${escapeHtml(meta.label)}</label>
        <input id="${escapeHtml(meta.name)}" type="text" inputmode="numeric" autocomplete="tel" maxlength="11" pattern="[0-9]{11}" data-field="${escapeHtml(meta.name)}" value="${escapeHtml(value)}">
      </div>
    `;
  }

  return `
    <div class="paper-field ${isWide ? "wide" : ""}">
      <label for="${escapeHtml(meta.name)}">${escapeHtml(meta.label)}</label>
      <input id="${escapeHtml(meta.name)}" type="${meta.input || "text"}" data-field="${escapeHtml(meta.name)}" value="${escapeHtml(value)}"${capitalize} ${meta.required ? "required" : ""}>
    </div>
  `;
}

function selectOptions(name, value, options, includeBlank) {
  const normalizedValue = fieldValue(name, value);
  const choices = [...options];
  if (normalizedValue && !choices.includes(normalizedValue)) choices.push(normalizedValue);

  return `
    ${includeBlank ? `<option value="" ${normalizedValue ? "" : "selected"}></option>` : ""}
    ${choices.map(option => `<option value="${escapeHtml(option)}" ${option === normalizedValue ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
  `;
}

function renderDropdownField(meta, value, isWide, options, includeBlank) {
  return `
    <div class="paper-field ${isWide ? "wide" : ""}">
      <label for="${escapeHtml(meta.name)}">${escapeHtml(meta.label)}</label>
      <select id="${escapeHtml(meta.name)}" data-field="${escapeHtml(meta.name)}">
        ${selectOptions(meta.name, value, options, includeBlank)}
      </select>
    </div>
  `;
}

function renderChoiceField(meta, value, isWide) {
  const options = [...CHOICE_OPTIONS[meta.name]];
  if (value && !options.includes(value)) options.push(value);

  return `
    <div class="paper-field ${isWide ? "wide" : ""}">
      <label>${escapeHtml(meta.label)}</label>
      <div class="choice-group">
        ${options.map(option => `
          <label class="choice-pill">
            <input type="radio" name="choice_${escapeHtml(meta.name)}" data-field="${escapeHtml(meta.name)}" value="${escapeHtml(option)}" ${option === value ? "checked" : ""}>
            <span>${escapeHtml(option)}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function renderFamilyCell(name, row, rowIndex, readonly) {
  const value = fieldValue(name, row[name] || "");

  if (readonly) {
    return `<td>${escapeHtml(value)}</td>`;
  }

  if (name in FAMILY_DROPDOWN_OPTIONS) {
    return `
      <td>
        <select data-family-field="${escapeHtml(name)}" data-family-row="${rowIndex}">
          ${selectOptions(name, value, FAMILY_DROPDOWN_OPTIONS[name], true)}
        </select>
      </td>
    `;
  }

  return `
    <td>
      <input type="text" data-family-field="${escapeHtml(name)}" data-family-row="${rowIndex}" value="${escapeHtml(value)}"${shouldCapitalizeField(name) ? ' data-capitalize="words" autocapitalize="words"' : ""}>
    </td>
  `;
}

function renderFamilyRow(row, rowIndex, readonly) {
  return `
    <tr>
      ${FAMILY_FIELDS.map(name => renderFamilyCell(name, row, rowIndex, readonly)).join("")}
    </tr>
  `;
}

function renderFamilySection(record, readonly) {
  const rows = familyRows(record);
  const headers = FAMILY_FIELDS.map(name => field(name).label);
  const bodyRows = rows.length
    ? rows.map((row, rowIndex) => renderFamilyRow(row, rowIndex, readonly)).join("")
    : `<tr class="family-empty-row"><td colspan="${FAMILY_FIELDS.length}">No family members added.</td></tr>`;

  return `
    <section class="paper-section">
      <div class="family-section-header">
        <h3>II. Family Composition</h3>
        ${readonly ? "" : `
          <button type="button" id="addFamilyMemberButton" class="icon-button family-add-button" title="Add family member" aria-label="Add family member">
            ${icon("plus")}
          </button>
        `}
      </div>
      <div class="family-table-wrap">
        <table class="family-table">
          <thead>
            <tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
          </thead>
          <tbody id="familyTableBody">
            ${bodyRows}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function familyRows(record) {
  const columns = FAMILY_FIELDS.reduce((items, name) => {
    items[name] = splitLines(record[name]);
    return items;
  }, {});
  const rowCount = Math.max(0, ...FAMILY_FIELDS.map(name => columns[name].length));

  return Array.from({ length: rowCount }, (_, index) => {
    return FAMILY_FIELDS.reduce((row, name) => {
      row[name] = columns[name][index] || "";
      return row;
    }, {});
  }).sort((left, right) => compareRowsByAgeDesc(left, right, "list_c18"));
}

function nextFamilyRowIndex() {
  const rowIndexes = [...elements.pageRoot.querySelectorAll("[data-family-row]")]
    .map(input => Number(input.dataset.familyRow))
    .filter(Number.isFinite);

  return rowIndexes.length ? Math.max(...rowIndexes) + 1 : 0;
}

function attachCapitalizationHandlers(root) {
  root.querySelectorAll('[data-capitalize="words"]').forEach(input => {
    input.addEventListener("blur", () => {
      input.value = titleCaseValue(input.value);
    });
  });
  root.querySelectorAll('[data-capitalize="sentence"]').forEach(input => {
    input.addEventListener("blur", () => {
      input.value = sentenceCaseValue(input.value);
    });
  });
}

function addFamilyMemberRow() {
  const body = document.getElementById("familyTableBody");
  if (!body) return;

  body.querySelector(".family-empty-row")?.remove();
  const rowIndex = nextFamilyRowIndex();
  body.insertAdjacentHTML("beforeend", renderFamilyRow({}, rowIndex, false));
  attachCapitalizationHandlers(body.rows[body.rows.length - 1]);
}

function setPictureData(data) {
  state.pictureData = data;

  const preview = document.getElementById("photoPreview");
  if (preview) {
    preview.innerHTML = data
      ? `<img src="${escapeHtml(data)}" alt="Beneficiary picture">`
      : "<span>Picture</span>";
  }

  const dropZone = document.getElementById("photoDropZone");
  dropZone?.classList.toggle("has-photo", Boolean(data));
  dropZone?.classList.remove("drag-over");

  const removeButton = document.getElementById("removePictureButton");
  if (removeButton) removeButton.hidden = !data;
}

function readPictureFile(file) {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Choose an image file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => setPictureData(String(reader.result || ""));
  reader.readAsDataURL(file);
}

function updateApplicantSignatureName() {
  const target = document.getElementById("applicantSignatureName");
  if (!target) return;

  target.textContent = beneficiarySignatureName({
    last_name: elements.pageRoot.querySelector('[data-field="last_name"]')?.value,
    first_name: elements.pageRoot.querySelector('[data-field="first_name"]')?.value,
    middle_name: elements.pageRoot.querySelector('[data-field="middle_name"]')?.value
  });
}

function attachEditorFormHandlers() {
  const fileInput = document.getElementById("pictureInput");
  fileInput?.addEventListener("change", () => {
    readPictureFile(fileInput.files?.[0]);
  });

  const dropZone = document.getElementById("photoDropZone");
  dropZone?.addEventListener("dragenter", event => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
  dropZone?.addEventListener("dragover", event => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
  dropZone?.addEventListener("dragleave", event => {
    if (!dropZone.contains(event.relatedTarget)) {
      dropZone.classList.remove("drag-over");
    }
  });
  dropZone?.addEventListener("drop", event => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
    readPictureFile(event.dataTransfer?.files?.[0]);
  });

  elements.pageRoot.querySelectorAll('[data-field="field_l11"]').forEach(input => {
    input.addEventListener("input", () => {
      input.value = normalizeContactNumber(input.value);
    });
    input.addEventListener("blur", () => {
      input.value = normalizeContactNumber(input.value);
    });
  });

  attachCapitalizationHandlers(elements.pageRoot);

  elements.pageRoot.querySelectorAll('[data-field="last_name"], [data-field="first_name"], [data-field="middle_name"]').forEach(input => {
    input.addEventListener("input", updateApplicantSignatureName);
    input.addEventListener("blur", updateApplicantSignatureName);
  });
  updateApplicantSignatureName();

  document.getElementById("removePictureButton")?.addEventListener("click", () => {
    setPictureData("");
    if (fileInput) fileInput.value = "";
  });

  document.getElementById("addFamilyMemberButton")?.addEventListener("click", addFamilyMemberRow);
}

function collectRecord() {
  const record = blankRecord();

  if (state.currentRecord?.id) {
    record.id = state.currentRecord.id;
  }

  elements.pageRoot.querySelectorAll("[data-field]").forEach(input => {
    const name = input.dataset.field;
    if (input.type === "radio") {
      if (input.checked) record[name] = input.value;
      return;
    }
    record[name] = normalizeFieldValue(name, input.value);
  });

  const familyRowIndexes = [...new Set([...elements.pageRoot.querySelectorAll("[data-family-row]")]
    .map(input => Number(input.dataset.familyRow))
    .filter(Number.isFinite))]
    .sort((left, right) => left - right);
  const familyValues = FAMILY_FIELDS.reduce((values, name) => {
    values[name] = [];
    return values;
  }, {});

  const sortedFamilyRows = familyRowIndexes.map(rowIndex => {
    const rowValues = FAMILY_FIELDS.reduce((values, name) => {
      const input = elements.pageRoot.querySelector(`[data-family-field="${name}"][data-family-row="${rowIndex}"]`);
      values[name] = normalizeFieldValue(name, input?.value || "").trim();
      return values;
    }, {});
    const hasValue = FAMILY_FIELDS.some(name => rowValues[name]);

    return hasValue ? rowValues : null;
  })
    .filter(Boolean)
    .sort((left, right) => compareRowsByAgeDesc(left, right, "list_c18"));

  sortedFamilyRows.forEach(rowValues => {
    FAMILY_FIELDS.forEach(name => {
      familyValues[name].push(rowValues[name] || "-");
    });
  });

  FAMILY_FIELDS.forEach(name => {
    record[name] = familyValues[name].join("\n");
  });

  record.picture_data = state.pictureData || "";
  return record;
}

async function saveCurrentRecord() {
  const record = collectRecord();
  if (!record.control_no.trim()) {
    showToast("Control No. is required.");
    return;
  }

  if (record.field_l11 && !/^\d{11}$/.test(record.field_l11)) {
    showToast("Contact No. must be 11 digits.");
    return;
  }

  const payload = await api("/api/records", {
    method: "POST",
    body: JSON.stringify(record)
  });

  await refreshStats();
  showToast("Record saved.");
  history.replaceState(null, "", `#/editor/${payload.record.id}`);
  await renderEditorPage(String(payload.record.id));
}

async function deleteCurrentRecord(id) {
  const record = state.currentRecord || await loadRecord(id);
  const confirmed = window.confirm(`Move this record to the bin?\n\n${record.control_no}\n${fullName(record)}`);
  if (!confirmed) return;

  await api(`/api/records/${id}`, { method: "DELETE" });
  await refreshStats();
  showToast("Record moved to bin.");
  navigate("bin");
}

async function renderDatabasePage() {
  setTitle("Database");
  setTopbarActions([
    { id: "databaseNew", label: "New", icon: "plus", variant: "primary", onClick: () => navigate("editor") },
    { id: "databaseExport", label: "Export", icon: "export", onClick: () => exportData().catch(error => showToast(error.message)) }
  ]);

  const exportPayload = await api("/api/export");
  const allRecords = exportPayload.records || [];
  setDatabaseFilterState(databaseFilterState());

  elements.pageRoot.innerHTML = `
    <div id="databaseAnalyticsFilters"></div>
    <div id="databaseAnalyticsHost"></div>

    <section class="database-page">
      <div class="table-toolbar">
        <div id="databaseTableFilters"></div>
        <div class="table-toolbar-footer">
          <div id="databaseFilterSummary" class="filter-summary"></div>
          <span id="databaseCount" class="table-count"></span>
        </div>
      </div>
      <div id="databaseTableHost" class="database-table-host"></div>
    </section>
  `;

  function bindDatabaseFilterPanel(scope) {
    scope.querySelectorAll("[data-db-filter-search]").forEach(input => {
      input.addEventListener("input", () => {
        setDatabaseFilterState({ search: input.value });
        applyFilters();
      });
    });
    scope.querySelectorAll("[data-db-filter-min-age]").forEach(input => {
      input.addEventListener("input", () => {
        setDatabaseFilterState({ minAge: input.value });
        applyFilters();
      });
    });
    scope.querySelectorAll("[data-db-filter-max-age]").forEach(input => {
      input.addEventListener("input", () => {
        setDatabaseFilterState({ maxAge: input.value });
        applyFilters();
      });
    });
    scope.querySelectorAll("[data-db-filter-field]").forEach(input => {
      input.addEventListener("change", () => {
        setDatabaseFilterState({ fields: { [input.dataset.dbFilterField]: input.value } });
        applyFilters();
      });
    });
    scope.querySelectorAll("[data-clear-database-filters]").forEach(button => {
      button.addEventListener("click", () => {
        state.databaseFilters = {
          search: "",
          minAge: "",
          maxAge: "",
          fields: {}
        };
        applyFilters();
      });
    });
    scope.querySelectorAll("[data-toggle-database-filters]").forEach(button => {
      button.addEventListener("click", () => {
        const key = button.dataset.toggleDatabaseFilters;
        state.databaseFilterVisibility[key] = state.databaseFilterVisibility[key] === false;
        renderFilterPanels();
        applyFilters();
      });
    });
  }

  function renderFilterPanels() {
    document.getElementById("databaseAnalyticsFilters").innerHTML = renderDatabaseFilterPanel(
      allRecords,
      "analytics",
      "Analytics Filters"
    );
    document.getElementById("databaseTableFilters").innerHTML = renderDatabaseFilterPanel(
      allRecords,
      "table",
      "Table Filters"
    );
    bindDatabaseFilterPanel(document.getElementById("databaseAnalyticsFilters"));
    bindDatabaseFilterPanel(document.getElementById("databaseTableFilters"));
  }

  function syncDatabaseFilterPanels() {
    const filters = databaseFilterState();
    document.querySelectorAll("[data-db-filter-search]").forEach(input => {
      if (input.value !== filters.search) input.value = filters.search;
    });
    document.querySelectorAll("[data-db-filter-min-age]").forEach(input => {
      if (input.value !== filters.minAge) input.value = filters.minAge;
    });
    document.querySelectorAll("[data-db-filter-max-age]").forEach(input => {
      if (input.value !== filters.maxAge) input.value = filters.maxAge;
    });
    document.querySelectorAll("[data-db-filter-field]").forEach(input => {
      const value = filters.fields[input.dataset.dbFilterField] || "";
      if (input.value !== value) input.value = value;
    });
  }

  function applyFilters() {
    const filters = databaseFilterState();
    const filteredRecords = filterDatabaseRecords(allRecords, filters);
    syncDatabaseFilterPanels();
    document.getElementById("databaseAnalyticsHost").innerHTML = renderDatabaseAnalytics(buildAnalytics(filteredRecords));
    document.getElementById("databaseFilterSummary").innerHTML = renderDatabaseFilterSummary(filters);
    renderDatabaseTable(filteredRecords);
  }

  renderFilterPanels();
  applyFilters();
}

function renderDatabaseTable(records) {
  document.getElementById("databaseCount").textContent = `${records.length} shown`;

  if (!records.length) {
    document.getElementById("databaseTableHost").innerHTML = emptyState("No records found.");
    return;
  }

  const columns = DATABASE_TABLE_FIELDS.map(name => field(name));
  document.getElementById("databaseTableHost").innerHTML = `
    <div class="data-table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th class="sticky-column">Actions</th>
            ${columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${records.map(record => `
            <tr>
              <td class="sticky-column">
                <div class="table-actions">
                  <button type="button" class="icon-button" title="View" data-view-id="${record.id}">${icon("view")}</button>
                  <button type="button" class="icon-button" title="Edit" data-edit-id="${record.id}">${icon("edit")}</button>
                </div>
              </td>
              ${columns.map(column => `<td>${escapeHtml(fieldValue(column.name, record[column.name]))}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
  attachRecordOpenHandlers(elements.pageRoot);
}

async function renderBinPage() {
  setTitle("Record Bin");
  setTopbarActions([
    { id: "binRefresh", label: "Refresh", icon: "refresh", onClick: () => renderBinPage().catch(error => showToast(error.message)) }
  ]);

  const payload = await api("/api/bin");
  elements.pageRoot.innerHTML = `
    <section class="tool-panel">
      <div class="panel-title-row">
        <h3>Deleted Records</h3>
        <span>${payload.records.length} total</span>
      </div>
      <div class="bin-list-modern">
        ${payload.records.length ? payload.records.map(record => `
          <article class="bin-record">
            <div>
              <strong>${escapeHtml(record.display_name)}</strong>
              <span>${escapeHtml(record.control_no)} | ${escapeHtml(record.deleted_at)}</span>
            </div>
            <button type="button" class="action-button" data-restore-id="${record.id}">
              <span class="button-icon">${icon("refresh")}</span>
              <span>Restore</span>
            </button>
          </article>
        `).join("") : emptyState("Bin is empty.")}
      </div>
    </section>
  `;

  elements.pageRoot.querySelectorAll("[data-restore-id]").forEach(button => {
    button.addEventListener("click", async () => {
      try {
        await api(`/api/bin/${button.dataset.restoreId}/restore`, { method: "POST" });
        await refreshStats();
        showToast("Record restored.");
        await renderBinPage();
      } catch (error) {
        showToast(error.message);
      }
    });
  });
}

async function renderAccountsPage() {
  setTitle("Accounts");
  setTopbarActions([
    { id: "accountsRefresh", label: "Refresh", icon: "refresh", onClick: () => renderAccountsPage().catch(error => showToast(error.message)) }
  ]);

  const payload = await api("/api/users");
  elements.pageRoot.innerHTML = `
    <section class="accounts-layout">
      <form id="accountForm" class="tool-panel account-form">
        <div class="panel-title-row">
          <h3>Add User Account</h3>
          <span>Standard users cannot create accounts</span>
        </div>
        <input type="hidden" id="accountId">
        <label>
          Display Name
          <input id="accountDisplayName" autocomplete="name" required>
        </label>
        <label>
          Username
          <input id="accountUsername" autocomplete="username" required>
        </label>
        <label>
          Password
          <input id="accountPassword" type="password" autocomplete="new-password" placeholder="Required for new users">
        </label>
        <label class="checkbox-row">
          <input id="accountActive" type="checkbox" checked>
          <span>Active account</span>
        </label>
        <div class="form-actions">
          <button type="button" id="accountReset" class="action-button">Clear</button>
          <button type="submit" class="action-button primary">
            <span class="button-icon">${icon("save")}</span>
            <span>Save Account</span>
          </button>
        </div>
      </form>
      <section class="tool-panel">
        <div class="panel-title-row">
          <h3>User Accounts</h3>
          <span>${payload.users.length} total</span>
        </div>
        <div class="account-list">
          ${payload.users.map(user => `
            <article class="account-card">
              <div>
                <strong>${escapeHtml(user.display_name || user.username)}</strong>
                <span>${escapeHtml(user.username)} | ${escapeHtml(user.role)} | ${user.active ? "Active" : "Inactive"}</span>
              </div>
              <button type="button" class="icon-button" title="Edit account" data-account-id="${user.id}">
                ${icon("edit")}
              </button>
            </article>
          `).join("")}
        </div>
      </section>
    </section>
  `;

  const form = document.getElementById("accountForm");
  const accountId = document.getElementById("accountId");
  const displayName = document.getElementById("accountDisplayName");
  const username = document.getElementById("accountUsername");
  const password = document.getElementById("accountPassword");
  const active = document.getElementById("accountActive");

  function resetForm() {
    accountId.value = "";
    displayName.value = "";
    username.value = "";
    password.value = "";
    password.placeholder = "Required for new users";
    active.checked = true;
  }

  document.getElementById("accountReset").addEventListener("click", resetForm);

  elements.pageRoot.querySelectorAll("[data-account-id]").forEach(button => {
    button.addEventListener("click", () => {
      const user = payload.users.find(item => String(item.id) === button.dataset.accountId);
      if (!user) return;

      accountId.value = user.id;
      displayName.value = user.display_name || "";
      username.value = user.username || "";
      password.value = "";
      password.placeholder = "Leave blank to keep current password";
      active.checked = Boolean(user.active);
      displayName.focus();
    });
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    try {
      await api("/api/users", {
        method: "POST",
        body: JSON.stringify({
          id: accountId.value,
          display_name: displayName.value,
          username: username.value,
          password: password.value,
          active: active.checked
        })
      });
      showToast("Account saved.");
      await renderAccountsPage();
    } catch (error) {
      showToast(error.message);
    }
  });
}

function printableSections(record, familySectionHtml) {
  const sectionGroups = [
    { title: "I. Personal Information", className: "personal-grid" },
    { title: "PAOFI Beneficiary", className: "two-grid" },
    { title: "III. Livelihood Information", className: "two-grid" },
    { title: "IV. Livelihood Project Interest", className: "two-grid" },
    { title: "V. Skills and Experience", className: "two-grid" },
    { title: "VI. Availability and Commitment", className: "two-grid" }
  ];

  return sectionGroups.map(group => {
    const cells = (state.sections[group.title] || [])
      .filter(item => item.name !== "picture_data" && !FAMILY_FIELDS.includes(item.name))
      .map(item => {
        const value = fieldValue(item.name, record[item.name] || "");
        const isLong = PRINT_WIDE_FIELDS.has(item.name);
        return `
          <div class="print-field${isLong ? " wide" : ""}">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(value || "-").replaceAll("\n", "<br>")}</strong>
          </div>
        `;
      })
      .join("");

    const sectionHtml = `
      <section class="print-section ${escapeHtml(group.className)}">
        <h2>${escapeHtml(group.title)}</h2>
        <div class="field-grid">${cells}</div>
      </section>
    `;

    return group.title === "I. Personal Information" ? `${sectionHtml}${familySectionHtml}` : sectionHtml;
  }).join("");
}

function printRecord(record, monitoringReports = []) {
  const printWindow = window.open("", "_blank", "width=940,height=760");
  if (!printWindow) {
    showToast("Allow popups to print records.");
    return;
  }

  const family = familyRows(record, null);
  const familySectionHtml = `
    <section class="print-section family-section">
      <h2>II. Family Composition</h2>
      <table class="family">
        <thead><tr>${FAMILY_FIELDS.map(name => `<th>${escapeHtml(field(name).label)}</th>`).join("")}</tr></thead>
        <tbody>
          ${family.map(row => `<tr>${FAMILY_FIELDS.map(name => `<td>${escapeHtml(fieldValue(name, row[name] || ""))}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </section>
  `;
  const picture = record.picture_data
    ? `<img class="picture" src="${escapeHtml(record.picture_data)}" alt="">`
    : `<div class="picture picture-placeholder">Photo</div>`;
  const logoSrc = `${window.location.origin}/assets/paofi-logo.png`;
  const monitoringSummaryHtml = renderBeneficiaryMonitoringSummary(monitoringReports, "print");

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(record.control_no || "LP Record")}</title>
        <style>
          @page { size: letter; margin: 7mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #edf3ef;
            color: #1d2520;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 8.2px;
            line-height: 1.16;
          }
          button {
            margin: 12px;
            border: 1px solid #bdd3c6;
            border-radius: 7px;
            background: #ffffff;
            padding: 8px 12px;
            color: #155b3c;
            font-weight: 700;
          }
          .sheet {
            width: 8.5in;
            min-height: 11in;
            margin: 0 auto;
            padding: 0.24in 0.28in;
            background: #ffffff;
          }
          h1, h2, h3, p { margin: 0; }
          .print-header {
            display: grid;
            grid-template-columns: 56px 1fr 78px;
            gap: 10px;
            align-items: center;
            padding-bottom: 8px;
            border-bottom: 2px solid #16784f;
          }
          .logo {
            width: 54px;
            height: 54px;
            object-fit: contain;
          }
          .header-title {
            display: grid;
            gap: 2px;
          }
          .header-title h1 {
            color: #143d33;
            font-size: 14.5px;
            line-height: 1;
            letter-spacing: 0;
            text-transform: uppercase;
          }
          .tagline {
            color: #55625b;
            font-size: 8.6px;
          }
          .form-title {
            display: inline-flex;
            width: fit-content;
            margin-top: 2px;
            border-radius: 4px;
            background: #1f7a4f;
            color: #ffffff;
            padding: 4px 8px;
            font-size: 10px;
            line-height: 1;
            text-transform: uppercase;
          }
          .record-line {
            color: #243029;
            font-size: 9px;
            font-weight: 700;
          }
          .picture {
            width: 74px;
            height: 74px;
            justify-self: end;
            border: 1px solid #93b7a3;
            object-fit: cover;
            background: #f4f8f6;
          }
          .picture-placeholder {
            display: grid;
            place-items: center;
            color: #80908a;
            font-weight: 700;
          }
          .print-body {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 8px;
            row-gap: 7px;
            padding-top: 8px;
          }
          .print-section {
            break-inside: avoid;
          }
          .print-section h2 {
            margin-bottom: 3px;
            border-left: 4px solid #1f7a4f;
            border-radius: 4px;
            background: #eaf6ef;
            color: #143d33;
            padding: 4px 6px;
            font-size: 9.2px;
            line-height: 1;
          }
          .print-section.personal-grid,
          .print-section.family-section {
            grid-column: 1 / -1;
          }
          .field-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            border-top: 1px solid #cddbd2;
            border-left: 1px solid #cddbd2;
          }
          .personal-grid .field-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
          .print-field {
            min-height: 29px;
            border-right: 1px solid #cddbd2;
            border-bottom: 1px solid #cddbd2;
            padding: 3px 5px;
            overflow-wrap: anywhere;
          }
          .print-field.wide {
            grid-column: span 2;
          }
          .personal-grid .print-field.wide {
            grid-column: span 3;
          }
          .print-field span {
            display: block;
            margin-bottom: 2px;
            color: #5b6861;
            font-size: 6.8px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .print-field strong {
            display: block;
            color: #1d2520;
            font-size: 8.4px;
            font-weight: 650;
          }
          .family {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .family th,
          .family td {
            border: 1px solid #cddbd2;
            padding: 3px 4px;
            text-align: left;
            vertical-align: top;
            overflow-wrap: anywhere;
          }
          .family th {
            background: #f2f7f4;
            color: #243029;
            font-size: 6.8px;
            line-height: 1.05;
            font-weight: 800;
          }
          .family td {
            font-size: 7.2px;
            line-height: 1.08;
          }
          .family th:nth-child(1),
          .family td:nth-child(1) { width: 19%; }
          .family th:nth-child(2),
          .family td:nth-child(2) { width: 6%; text-align: center; }
          .family th:nth-child(3),
          .family td:nth-child(3) { width: 7%; text-align: center; }
          .family th:nth-child(4),
          .family td:nth-child(4) { width: 16%; }
          .family th:nth-child(5),
          .family td:nth-child(5) { width: 10%; }
          .family th:nth-child(6),
          .family td:nth-child(6) { width: 18%; }
          .family th:nth-child(7),
          .family td:nth-child(7) { width: 14%; }
          .family th:nth-child(8),
          .family td:nth-child(8) { width: 10%; }
          .print-monitoring-summary {
            grid-column: 1 / -1;
            break-inside: avoid;
          }
          .beneficiary-monitoring-head {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: flex-end;
            margin-bottom: 4px;
          }
          .beneficiary-monitoring-head h3 {
            margin: 0;
            color: #143d33;
            font-size: 9.2px;
          }
          .beneficiary-monitoring-head span {
            color: #5b6861;
            font-size: 7px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .beneficiary-monitoring-kpis {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 4px;
            margin-bottom: 5px;
          }
          .beneficiary-monitoring-kpis article {
            min-height: 36px;
            border: 1px solid #cddbd2;
            border-left: 3px solid #1f7a4f;
            padding: 3px 4px;
            background: #fbfdfc;
          }
          .beneficiary-monitoring-kpis span,
          .beneficiary-monitoring-kpis em {
            display: block;
            color: #5b6861;
            font-size: 6.4px;
            font-style: normal;
          }
          .beneficiary-monitoring-kpis strong {
            display: block;
            color: #143d33;
            font-size: 8px;
            line-height: 1.1;
          }
          .beneficiary-monitoring-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .beneficiary-monitoring-table th,
          .beneficiary-monitoring-table td {
            border: 1px solid #cddbd2;
            padding: 3px 4px;
            font-size: 6.8px;
            overflow-wrap: anywhere;
          }
          .beneficiary-monitoring-table th {
            background: #f2f7f4;
            color: #243029;
            font-weight: 800;
          }
          .beneficiary-monitoring-empty {
            border: 1px dashed #cddbd2;
            padding: 8px;
            color: #5b6861;
            text-align: center;
          }
          .analytics-eyebrow {
            display: block;
            color: #155b3c;
            font-size: 6.5px;
            font-weight: 800;
            letter-spacing: 0;
            text-transform: uppercase;
          }
          @media print {
            body { background: #ffffff; }
            button { display: none; }
            .sheet {
              width: auto;
              min-height: auto;
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Print</button>
        <main class="sheet">
        <header class="print-header">
          <img class="logo" src="${escapeHtml(logoSrc)}" alt="">
          <div>
            <div class="header-title">
              <h1>Payatas Orione Foundation Inc.</h1>
              <p class="tagline">"A simple effort can make a great impact"</p>
              <h3 class="form-title">Livelihood Program Application Form</h3>
              <p class="record-line">${escapeHtml(record.control_no || "")} | ${escapeHtml(fullName(record))} | ${escapeHtml(fieldValue("status", record.status || ""))}</p>
            </div>
          </div>
          ${picture}
        </header>
        <div class="print-body">
          ${printableSections(record, familySectionHtml)}
          ${monitoringSummaryHtml}
        </div>
        </main>
      </body>
    </html>
  `);
  printWindow.document.close();
}

async function exportData() {
  const payload = await api("/api/export");
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `paofi-database-export-${todayDate()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function hydrateStaticIcons() {
  document.querySelectorAll("[data-icon]").forEach(target => {
    target.innerHTML = icon(target.dataset.icon);
  });
}

async function initialize() {
  hydrateStaticIcons();
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.logoutButton.addEventListener("click", logout);

  const restored = await restoreSession();
  if (!restored) {
    elements.loginUsername.focus();
    return;
  }

  await loadApplication();
}

async function loadApplication() {
  const metadata = await api("/api/metadata");
  state.fields = metadata.fields;
  state.sections = metadata.sections;
  state.fieldMap = metadata.fields.reduce((map, item) => {
    map[item.name] = item;
    return map;
  }, {});

  elements.navItems.forEach(item => {
    if (item.dataset.lpdbBound === "1") return;
    item.dataset.lpdbBound = "1";
    item.addEventListener("click", () => navigate(item.dataset.route));
  });
  if (!window.lpdbStaticListenersBound) {
    window.lpdbStaticListenersBound = true;
    window.addEventListener("lpdb:update-status", event => {
      showToast(event.detail || "Downloading update...");
    });
    window.addEventListener("hashchange", renderRoute);
  }

  if (!location.hash) {
    history.replaceState(null, "", "#/menu");
  }

  await refreshStats();
  await renderRoute();
}

initialize().catch(error => {
  showToast(error.message);
});
