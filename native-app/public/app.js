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

const WORKSPACE_ROLES = new Set(["program_officer", "finance", "program_assistant", "coordinator", "encoder", "viewer"]);
const ACCOUNT_PROGRAM_ROLES = [
  ["program_officer", "Program Officer"],
  ["finance", "Finance"],
  ["program_assistant", "Program Assistant"],
  ["coordinator", "Coordinator"],
  ["encoder", "Encoder (Legacy)"],
  ["viewer", "Viewer"],
  ["volunteer", "Volunteer"],
  ["scholar", "Scholar"]
];

function userProgramRoles(programCode) {
  return new Set(state.currentUser?.program_roles?.[programCode] || []);
}

function hasWorkspaceAccess(programCode) {
  if (state.currentUser?.role === "superadmin") return true;
  return [...userProgramRoles(programCode)].some(role => WORKSPACE_ROLES.has(role));
}

function accessibleWorkspacePrograms() {
  return ["livelihood", "nutrition", "scholarship", "health", "administration"].filter(hasWorkspaceAccess);
}

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
const NUTRITION_FINANCIAL_CATEGORIES = [
  { key: "viands", label: "Viands" },
  { key: "milk", label: "Milk" },
  { key: "rice", label: "Rice" },
  { key: "gas", label: "Gas" },
  { key: "mineral_water", label: "Mineral Water" },
  { key: "utilities", label: "Utilities" },
  { key: "others", label: "Others / Supplies" }
];
const NUTRITION_FINANCIAL_SIGNATORIES = {
  administrativeOfficer: { name: "Nikki Lou Arcilla", title: "Administrative Officer" },
  president: { name: "Fr. John S. Castillo, FDP", title: "President/CEO" }
};
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
  clipboard: '<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"></rect><path d="M9 4V2h6v2M8 9h8M8 13h8M8 17h5"></path></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path><path d="m9 12 2 2 4-5"></path></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"></path></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M5 3h12l2 2v16H5V3Z"></path><path d="M8 3v6h8V3"></path><path d="M8 21v-7h8v7"></path></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>',
  print: '<svg viewBox="0 0 24 24"><path d="M7 9V3h10v6"></path><path d="M7 17H5a2 2 0 0 1-2-2v-4h18v4a2 2 0 0 1-2 2h-2"></path><path d="M7 14h10v7H7z"></path></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>',
  export: '<svg viewBox="0 0 24 24"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7"></path><path d="M20 4v6h-6"></path></svg>'
};

const COMING_SOON_PAGES = {
  "nutrition-budget": {
    program: "Nutrition Program - Supplemental Feeding",
    title: "Financial",
    description: "Monthly financial reports, center summaries, program-wide actuals, and budget planning."
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
    description: "Weighted 80/5/5/5/5 renewal evaluations, rankings, decisions, and supplementary scholar reviews."
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
  clientCache: new Map(),
  currentRecord: null,
  currentMonitoringReport: null,
  currentNutritionBeneficiary: null,
  currentNutritionCenter: null,
  currentNutritionGrowthReport: null,
  currentNutritionFinancialReport: null,
  nutritionCgsReference: null,
  monitoringBeneficiaries: [],
  dashboardAnalyticsLoaded: false,
  dashboardAnalyticsLoading: false,
  vegaRuntimePromise: null,
  pictureData: "",
  nutritionPictureData: "",
  databaseFilters: null,
  databaseFilterVisibility: {
    analytics: false,
    table: false
  },
  tablePages: {
    database: 1,
    monitoring: 1,
    nutritionProfiles: 1,
    nutritionGrowth: 1,
    nutritionFinancial: 1,
    bin: 1
  },
  authToken: localStorage.getItem("lpdbAuthToken") || "",
  currentUser: null,
  route: "menu",
  routeId: "",
  loadingRequests: 0,
  loadingTimer: null,
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
  loginSubmit: document.querySelector("#loginForm button[type='submit']"),
  loginLoader: document.getElementById("loginLoader"),
  appLoadingOverlay: document.getElementById("appLoadingOverlay"),
  appLoadingMessage: document.getElementById("appLoadingMessage"),
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

function beginLoadingTransition(message = "Loading") {
  state.loadingRequests += 1;
  if (elements.appLoadingMessage) {
    elements.appLoadingMessage.textContent = message;
  }
  clearTimeout(state.loadingTimer);
  state.loadingTimer = setTimeout(() => {
    if (state.loadingRequests > 0 && elements.appLoadingOverlay) {
      elements.appLoadingOverlay.classList.remove("hidden");
      requestAnimationFrame(() => elements.appLoadingOverlay.classList.add("visible"));
    }
  }, 380);

  return true;
}

function endLoadingTransition(token) {
  if (!token) return;
  state.loadingRequests = Math.max(0, state.loadingRequests - 1);
  if (state.loadingRequests > 0) return;

  clearTimeout(state.loadingTimer);
  state.loadingTimer = null;
  if (!elements.appLoadingOverlay) return;
  elements.appLoadingOverlay.classList.remove("visible");
  setTimeout(() => {
    if (state.loadingRequests === 0) {
      elements.appLoadingOverlay.classList.add("hidden");
    }
  }, 180);
}

async function api(path, options = {}) {
  let response;
  const {
    loadingMessage = "Loading",
    showLoading = true,
    ...fetchOptions
  } = options;
  const method = String(fetchOptions.method || "GET").toUpperCase();
  const canUseClientCache = method === "GET" && fetchOptions.cache !== "no-store";
  const cached = canUseClientCache ? state.clientCache.get(path) : null;
  let loadingToken = false;

  if (cached && cached.expiresAt > Date.now()) {
    return JSON.parse(JSON.stringify(cached.payload));
  }

  if (showLoading) {
    loadingToken = beginLoadingTransition(loadingMessage);
  }

  try {
    response = await fetch(path, {
      headers: {
        "Content-Type": "application/json",
        ...(state.authToken ? { Authorization: `Bearer ${state.authToken}` } : {}),
        ...(fetchOptions.headers || {})
      },
      ...fetchOptions
    });
  } catch {
    throw new Error("Cannot reach the PAOFI Database backend. Please keep the app open and try again.");
  } finally {
    endLoadingTransition(loadingToken);
  }

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  if (canUseClientCache) {
    state.clientCache.set(path, {
      payload,
      expiresAt: Date.now() + 10 * 1000
    });
  } else if (method !== "GET") {
    state.clientCache.clear();
  }

  return payload;
}

async function backendHealth() {
  try {
    const response = await fetch("/api/health", { cache: "no-store" });
    return await response.json();
  } catch {
    return { ok: false, database: false, error: "Cannot reach the PAOFI Database backend." };
  }
}

function setLoginBusy(isBusy, message = "") {
  if (elements.loginSubmit) {
    elements.loginSubmit.disabled = isBusy;
    elements.loginSubmit.classList.toggle("disabled", isBusy);
  }
  elements.loginForm?.classList.toggle("is-loading", isBusy);
  elements.loginLoader?.classList.toggle("hidden", !isBusy);
  elements.loginLoader?.setAttribute("aria-hidden", isBusy ? "false" : "true");
  if (isBusy) {
    elements.loginMessage.textContent = "";
  } else if (message) {
    elements.loginMessage.textContent = message;
  }
}

async function waitForDatabaseReady({ updateLogin = false } = {}) {
  for (let attempt = 0; attempt < 45; attempt += 1) {
    const health = await backendHealth();
    if (health.database) {
      if (updateLogin) setLoginBusy(false, "");
      return true;
    }

    if (updateLogin) setLoginBusy(true);

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (updateLogin) {
    setLoginBusy(false, "Cloud database is still connecting. Please try again.");
  }
  return false;
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
  document.querySelectorAll(".nav-program[data-program]").forEach(group => {
    const programCode = group.dataset.program;
    const hasAccess = hasWorkspaceAccess(programCode);
    group.classList.toggle("hidden", !hasAccess);
  });
  document.querySelectorAll("[data-requires-workspace]").forEach(item => {
    item.classList.toggle("hidden", !accessibleWorkspacePrograms().length);
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
  setLoginBusy(true);

  if (!await waitForDatabaseReady({ updateLogin: true })) {
    return;
  }

  let payload;
  try {
    payload = await api("/api/auth/login", {
      method: "POST",
      showLoading: false,
      body: JSON.stringify({
        username: elements.loginUsername.value,
        password: elements.loginPassword.value
      })
    });
  } catch (error) {
    elements.loginMessage.textContent = error.message;
    setLoginBusy(false);
    return;
  }

  setAuthenticatedSession(payload.token, payload.user);
  elements.loginPassword.value = "";

  try {
    await loadApplication();
  } catch (error) {
    showToast(error.message);
    setTitle("Connection Problem");
    setTopbarActions([]);
    elements.pageRoot.innerHTML = `
      <section class="empty-state">
        <h2>Unable to load the dashboard</h2>
        <p>${escapeHtml(error.message)}</p>
        <button type="button" class="btn primary" id="retryLoadApp">${icon("refresh")} Try Again</button>
      </section>
    `;
    document.getElementById("retryLoadApp")?.addEventListener("click", () => {
      loadApplication().catch(loadError => showToast(loadError.message));
    });
  } finally {
    setLoginBusy(false);
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

function programForRoute(route) {
  if (["search", "editor", "viewer", "database", "monitoring", "bin", "livelihood-finance", "livelihood-bin"].includes(route)) return "livelihood";
  if (route.startsWith("nutrition-")) return "nutrition";
  if (route.startsWith("scholarship-")) return "scholarship";
  if (route.startsWith("health-")) return "health";
  if (route.startsWith("admin-")) return "administration";
  return "";
}

async function renderRoute() {
  if (!state.currentUser) return;

  const parsed = parseRoute();
  if (["accounts", "system"].includes(parsed.route) && state.currentUser.role !== "superadmin") {
    navigate("menu");
    return;
  }
  const programCode = programForRoute(parsed.route);
  if (programCode
      && state.currentUser.role !== "superadmin"
      && !hasWorkspaceAccess(programCode)) {
    navigate("menu");
    return;
  }
  if (parsed.route === "main-bin" && !accessibleWorkspacePrograms().length) {
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
    else if (parsed.route === "nutrition-menu") await renderNutritionMenuPage(parsed.id);
    else if (parsed.route === "nutrition-recipes") await renderNutritionRecipePage(parsed.id);
    else if (parsed.route === "nutrition-budget") await renderNutritionFinancialPage(parsed.id);
    else if ((parsed.route === "main-bin"
      || parsed.route === "livelihood-finance"
      || parsed.route === "livelihood-bin"
      || parsed.route === "nutrition-finance"
      || parsed.route === "nutrition-bin"
      || parsed.route === "scholarship-finance"
      || parsed.route === "scholarship-bin"
      || parsed.route === "nutrition-operations"
      || parsed.route === "scholarship-operations"
      || parsed.route.startsWith("health-")
      || parsed.route.startsWith("admin-")) && window.OperationsApp) {
      await window.OperationsApp.renderRoute(parsed.route, parsed.id, {
        root: elements.pageRoot,
        api,
        setTitle,
        setTopbarActions,
        showToast,
        navigate,
        icon,
        escapeHtml,
        formatMoney,
        currentUser: state.currentUser,
        showDocumentPrintPreview
      });
    }
    else if (parsed.route.startsWith("scholarship-") && window.ScholarshipApp) {
      await window.ScholarshipApp.renderRoute(parsed.route, parsed.id, {
        root: elements.pageRoot,
        api,
        setTitle,
        setTopbarActions,
        showToast,
        navigate,
        icon,
        escapeHtml,
        formatMoney,
        currentUser: state.currentUser,
        enforceMinimumPrintFontSize,
        showDocumentPrintPreview
      });
    }
    else if (parsed.route === "bin") await renderBinPage();
    else if (parsed.route === "system") await renderSystemPage();
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

function requestYearInput(scopeLabel, defaultYear = String(new Date().getFullYear())) {
  return new Promise(resolve => {
    const modal = document.createElement("div");
    modal.className = "modal-backdrop";
    modal.innerHTML = `
      <form class="modal-panel year-modal">
        <div>
          <p class="eyebrow">Growth Monitoring</p>
          <h2>Yearly Summary</h2>
          <span>Choose the report year for ${escapeHtml(scopeLabel)}.</span>
        </div>
        <label>
          Year
          <input id="yearSummaryInput" inputmode="numeric" pattern="\\d{4}" maxlength="4" value="${escapeHtml(defaultYear)}" required>
        </label>
        <div class="form-actions">
          <button type="button" class="action-button" data-modal-cancel>Cancel</button>
          <button type="submit" class="action-button primary">
            <span class="button-icon">${icon("print")}</span>
            <span>Preview</span>
          </button>
        </div>
      </form>
    `;

    function close(value = "") {
      document.removeEventListener("keydown", handleKeydown);
      modal.remove();
      resolve(value);
    }

    function handleKeydown(event) {
      if (event.key === "Escape") close("");
    }

    modal.querySelector("[data-modal-cancel]").addEventListener("click", () => close(""));
    modal.addEventListener("click", event => {
      if (event.target === modal) close("");
    });
    modal.querySelector("form").addEventListener("submit", event => {
      event.preventDefault();
      close(modal.querySelector("#yearSummaryInput").value.trim());
    });
    document.addEventListener("keydown", handleKeydown);
    document.body.appendChild(modal);
    modal.querySelector("#yearSummaryInput").focus();
    modal.querySelector("#yearSummaryInput").select();
  });
}

function enforceMinimumPrintFontSize(printDocument, minimumSize = 10) {
  const view = printDocument?.defaultView;
  const body = printDocument?.body;
  if (!view || !body) return;

  [body, ...body.querySelectorAll("*")].forEach(element => {
    const computedSize = Number.parseFloat(view.getComputedStyle(element).fontSize);
    if (Number.isFinite(computedSize) && computedSize < minimumSize) {
      element.style.fontSize = `${minimumSize}px`;
    }
  });
}

function showDocumentPrintPreview(title, documentHtml) {
  const parsed = new DOMParser().parseFromString(documentHtml, "text/html");
  parsed.body.querySelectorAll("button").forEach(button => button.remove());
  const previewHtml = `<!doctype html>${parsed.documentElement.outerHTML}`;

  setTitle(title);
  setTopbarActions([
    { id: "printPreviewPrint", label: "Print", icon: "print", variant: "primary", onClick: () => printPreviewFrame() },
    { id: "printPreviewBack", label: "Back", icon: "arrow", onClick: () => renderRoute().catch(error => showToast(error.message)) }
  ]);

  elements.pageRoot.innerHTML = `
    <section class="print-preview-shell">
      <div class="print-preview-actions">
        <div>
          <p class="eyebrow">Print Preview</p>
          <h2>${escapeHtml(title)}</h2>
        </div>
        <div class="form-actions">
          <button type="button" id="printPreviewBackInline" class="action-button">
            <span class="button-icon">${icon("arrow")}</span>
            <span>Back</span>
          </button>
          <button type="button" id="printPreviewPrintInline" class="action-button primary">
            <span class="button-icon">${icon("print")}</span>
            <span>Print</span>
          </button>
        </div>
      </div>
      <iframe id="printPreviewFrame" class="print-preview-frame" title="${escapeHtml(title)}"></iframe>
    </section>
  `;

  const frame = document.getElementById("printPreviewFrame");
  frame.addEventListener("load", () => enforceMinimumPrintFontSize(frame.contentDocument), { once: true });
  frame.srcdoc = previewHtml;
  document.getElementById("printPreviewBackInline").addEventListener("click", () => {
    renderRoute().catch(error => showToast(error.message));
  });
  document.getElementById("printPreviewPrintInline").addEventListener("click", printPreviewFrame);
}

function printPreviewFrame() {
  const frameWindow = document.getElementById("printPreviewFrame")?.contentWindow;
  if (!frameWindow) {
    showToast("Print preview is still loading.");
    return;
  }

  frameWindow.focus();
  frameWindow.print();
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

const TABLE_PAGE_SIZE = 25;
const MONTHLY_MENU_PAGE_SIZE = 12;
const WEEKLY_COSTING_PAGE_SIZE = 25;

function pagedItems(items = [], key, pageSize = TABLE_PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const page = Math.min(Math.max(Number(state.tablePages[key]) || 1, 1), totalPages);
  const start = total ? (page - 1) * pageSize : 0;
  const end = Math.min(start + pageSize, total);
  state.tablePages[key] = page;

  return {
    items: items.slice(start, end),
    page,
    totalPages,
    start,
    end,
    total
  };
}

function renderPagination(key, pageInfo) {
  if (pageInfo.totalPages <= 1) return "";

  return `
    <div class="pagination-bar" data-pagination-key="${escapeHtml(key)}">
      <button type="button" class="text-button" data-page-step="-1" ${pageInfo.page <= 1 ? "disabled" : ""}>Previous</button>
      <span>Page ${pageInfo.page} of ${pageInfo.totalPages}</span>
      <button type="button" class="text-button" data-page-step="1" ${pageInfo.page >= pageInfo.totalPages ? "disabled" : ""}>Next</button>
    </div>
  `;
}

function remotePageInfo(total, key, pageSize = TABLE_PAGE_SIZE) {
  const safeTotal = Math.max(Number(total) || 0, 0);
  const totalPages = Math.max(Math.ceil(safeTotal / pageSize), 1);
  const page = Math.min(Math.max(Number(state.tablePages[key]) || 1, 1), totalPages);
  const start = safeTotal ? (page - 1) * pageSize : 0;
  const end = Math.min(start + pageSize, safeTotal);
  state.tablePages[key] = page;
  return { page, totalPages, start, end, total: safeTotal };
}

function bindPagination(scope, key, renderCallback) {
  scope.querySelectorAll(`[data-pagination-key="${key}"] [data-page-step]`).forEach(button => {
    button.addEventListener("click", () => {
      state.tablePages[key] = Math.max((Number(state.tablePages[key]) || 1) + Number(button.dataset.pageStep || 0), 1);
      renderCallback();
    });
  });
}

function pageCountText(pageInfo, noun = "shown") {
  if (!pageInfo.total) return `0 ${noun}`;
  return `${pageInfo.start + 1}-${pageInfo.end} of ${pageInfo.total} ${noun}`;
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

function chartCopyButton(title) {
  const label = `Copy ${title} chart as image`;
  return `
    <button type="button" class="icon-button chart-copy-button" data-copy-chart title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">
      ${icon("copy")}
    </button>
  `;
}

function renderAnalyticsCard(title, subtitle, body, className = "") {
  return `
    <article class="analytics-card ${className}" data-chart-copy-surface data-chart-copy-name="${escapeHtml(title)}">
      <div class="analytics-card-head">
        <div class="analytics-card-title">
          <h4>${escapeHtml(title)}</h4>
          <span>${escapeHtml(subtitle)}</span>
        </div>
        ${chartCopyButton(title)}
      </div>
      <div class="analytics-card-body">${body}</div>
    </article>
  `;
}

const CHART_EXPORT_STYLE_PROPERTIES = [
  "align-content", "align-items", "align-self", "background", "background-color", "background-image",
  "background-position", "background-size", "border", "border-radius", "box-shadow", "box-sizing", "color",
  "display", "fill", "flex", "flex-basis", "flex-direction", "flex-grow", "flex-shrink", "flex-wrap", "font",
  "font-family", "font-size", "font-style", "font-weight", "gap", "grid-auto-columns", "grid-auto-flow",
  "grid-auto-rows", "grid-column", "grid-row", "grid-template-columns", "grid-template-rows", "height",
  "justify-content", "justify-items", "justify-self", "left", "line-height", "margin", "max-height", "max-width",
  "min-height", "min-width", "object-fit", "opacity", "overflow", "padding", "position", "right", "stroke",
  "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-width", "text-align",
  "text-anchor", "text-overflow", "text-transform", "top", "transform", "transform-origin", "vertical-align",
  "white-space", "width", "word-break", "z-index"
];

function inlineChartExportStyles(source, clone) {
  const sourceNodes = [source, ...source.querySelectorAll("*")];
  const cloneNodes = [clone, ...clone.querySelectorAll("*")];

  sourceNodes.forEach((node, index) => {
    const target = cloneNodes[index];
    if (!target) return;
    const computed = getComputedStyle(node);
    CHART_EXPORT_STYLE_PROPERTIES.forEach(property => {
      const value = computed.getPropertyValue(property);
      if (!value || /url\s*\(/i.test(value)) return;
      target.style.setProperty(property, value);
    });
  });
}

function imageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The chart image could not be rendered."));
    image.src = url;
  });
}

function canvasPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error("The chart image could not be prepared."));
    }, "image/png");
  });
}

function blobDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The chart image could not be read."));
    reader.readAsDataURL(blob);
  });
}

async function chartSurfacePng(surface) {
  const bounds = surface.getBoundingClientRect();
  const width = Math.max(320, Math.ceil(bounds.width));
  const height = Math.max(180, Math.ceil(bounds.height));
  const scale = 2;
  const clone = surface.cloneNode(true);
  inlineChartExportStyles(surface, clone);
  clone.querySelectorAll("[data-copy-chart]").forEach(button => button.remove());
  clone.classList.add("chart-copy-clone");
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.margin = "0";
  clone.style.animation = "none";
  clone.style.transform = "none";

  const svgNamespace = "http://www.w3.org/2000/svg";
  const htmlNamespace = "http://www.w3.org/1999/xhtml";
  const svg = document.createElementNS(svgNamespace, "svg");
  svg.setAttribute("xmlns", svgNamespace);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const foreignObject = document.createElementNS(svgNamespace, "foreignObject");
  foreignObject.setAttribute("width", "100%");
  foreignObject.setAttribute("height", "100%");

  const wrapper = document.createElementNS(htmlNamespace, "div");
  wrapper.setAttribute("xmlns", htmlNamespace);
  wrapper.setAttribute("class", "chart-copy-export-root");
  wrapper.setAttribute("style", `width:${width}px;height:${height}px;overflow:hidden;background:#f7faf8;`);

  wrapper.append(clone);
  foreignObject.append(wrapper);
  svg.append(foreignObject);

  const svgText = new XMLSerializer().serializeToString(svg);
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
  const image = await imageFromUrl(svgUrl);
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  context.scale(scale, scale);
  context.fillStyle = "#f7faf8";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvasPngBlob(canvas);
}

async function writeChartImageToClipboard(blob) {
  if (window.paofiClipboard?.copyPng) {
    await window.paofiClipboard.copyPng(await blobDataUrl(blob));
    return;
  }

  if (!navigator.clipboard?.write || typeof window.ClipboardItem !== "function") {
    throw new Error("Image copying is unavailable in this browser. Use the installed desktop app.");
  }

  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

async function copyChartAsImage(button) {
  const surface = button.closest("[data-chart-copy-surface]");
  if (!surface) return;

  button.disabled = true;
  button.classList.add("is-copying");

  try {
    const image = await chartSurfacePng(surface);
    await writeChartImageToClipboard(image);
    showToast(`${surface.dataset.chartCopyName || "Chart"} copied as an image.`);
  } finally {
    button.disabled = false;
    button.classList.remove("is-copying");
  }
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
  const summaryStats = overview.stats || {};
  const summaryAnalytics = overview.analytics || null;
  const centers = overview.centers || [];
  const beneficiaries = overview.beneficiaries || [];
  const analytics = summaryAnalytics ? {
    total: Number(summaryStats.beneficiaries || 0),
    active: Number(summaryStats.activeBeneficiaries || 0),
    centers: Number(summaryStats.centers || 0),
    activeCenters: Number(summaryStats.activeCenters || 0),
    centerCounts: summaryAnalytics.centerCounts || [],
    nutritionStatusCounts: summaryAnalytics.nutritionStatusCounts || []
  } : buildNutritionAnalytics(beneficiaries, centers);
  const topCenter = topAnalyticsEntry(analytics.centerCounts);
  const growthReportCount = Number(summaryStats.growthReports ?? (overview.growthReports || []).length) || 0;

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
        ${renderAnalyticsKpi("Growth Reports", String(growthReportCount), "monthly center reports", "violet")}
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
    <section class="database-analytics flow-analytics database-flow-analytics">
      <div class="analytics-title-row">
        <div>
          <span class="analytics-eyebrow">Detailed Analytics</span>
          <h3>Database Visualization</h3>
        </div>
        <span class="analytics-note">Last updated: ${escapeHtml(analytics.latestUpdate)}</span>
      </div>
      <div class="analytics-kpi-grid detailed analytics-signal-strip">
        ${renderAnalyticsKpi("Records Analyzed", String(analytics.total), "Current active database", "green")}
        ${renderAnalyticsKpi("Top Group", topGroup.label, analyticsPlural(topGroup.count, "record"), "blue")}
        ${renderAnalyticsKpi("Has Small Business", String(hasBusiness), `${analyticsPercent(hasBusiness, analytics.total)}% of applicants`, "amber")}
        ${renderAnalyticsKpi("PAOFI Beneficiary", String(paofiBeneficiary), `${analyticsPercent(paofiBeneficiary, analytics.total)}% of households`, "violet")}
        ${renderAnalyticsKpi("Attended Seminar", String(attendedSeminar), `${analyticsPercent(attendedSeminar, analytics.total)}% of applicants`, "red")}
        ${renderAnalyticsKpi("Ready for Training", String(willingCount), `${analyticsPercent(willingCount, analytics.total)}% willing`, "green")}
      </div>
      <div class="analytics-chart-grid flow-chart-grid">
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
  setTopbarActions([]);
  state.dashboardAnalyticsLoaded = false;
  state.dashboardAnalyticsLoading = false;

  const stats = await refreshStats();
  const workspaces = accessibleWorkspacePrograms();
  const programCards = [
    { code: "livelihood", label: "Livelihood", value: stats.active || 0, route: "database", caption: "beneficiary profiles" },
    { code: "nutrition", label: "Nutrition", value: stats.nutritionBeneficiaries || 0, route: "nutrition-profiles", caption: "feeding beneficiaries" },
    { code: "scholarship", label: "Scholarship", value: stats.scholarshipScholars || 0, route: "scholarship-scholars", caption: "scholar profiles" },
    { code: "health", label: "Health", value: stats.healthPatients || 0, route: "health-patients", caption: "patient profiles" },
    { code: "administration", label: "Administration", value: stats.administrationPeople || 0, route: "admin-overview", caption: "active personnel" }
  ];
  const workspaceCommands = [
    hasWorkspaceAccess("livelihood") ? dashboardCommand("database", "table", "Livelihood Program", "Profiles, monitoring, analytics, and finance") : "",
    hasWorkspaceAccess("nutrition") ? dashboardCommand("nutrition-profiles", "users", "Nutrition Program", "Feeding profiles, growth, menus, and finance") : "",
    hasWorkspaceAccess("scholarship") ? dashboardCommand("scholarship-scholars", "book", "Scholarship Program", "Scholars, sponsors, monitoring, and finance") : "",
    hasWorkspaceAccess("health") ? dashboardCommand("health-patients", "monitoring", "Health Program", "Patients, encounters, inventory, and finance") : "",
    hasWorkspaceAccess("administration") ? dashboardCommand("admin-overview", "shield", "Administration", "People, assets, compliance, and shared finance") : "",
    workspaces.length ? dashboardCommand("main-bin", "bin", "Main Record Bin", "Restore archived records across your authorized programs") : ""
  ].filter(Boolean);
  const authorityRows = Object.entries(state.currentUser?.program_roles || {})
    .filter(([, roles]) => roles?.length)
    .map(([program, roles]) => ({ program, roles }));

  elements.pageRoot.innerHTML = `
    <section class="dashboard-page">
      <section class="dashboard-intro scroll-reveal">
        <div class="dashboard-intro-copy">
          <p class="eyebrow">Organization-wide overview</p>
          <h2>PAOFI programs at a glance</h2>
          <span>High-level service and record summaries, tailored to your assigned authority.</span>
        </div>
        <div class="dashboard-metrics-strip" aria-label="Key database summaries">
          ${programCards.map(card => dashboardMetric(card.label, card.value, hasWorkspaceAccess(card.code) ? card.route : "", card.caption)).join("")}
        </div>
      </section>

      <section class="dashboard-workspace scroll-reveal">
        <div class="dashboard-actions-panel">
          <div class="dashboard-section-heading">
            <h3>${workspaceCommands.length ? "Your workspaces" : "Organization dashboard"}</h3>
            <span>${workspaceCommands.length ? "Programs available under your assigned roles" : "Your account currently has dashboard-only access"}</span>
          </div>
          <div class="dashboard-command-list">
            ${workspaceCommands.join("") || `<div class="empty-state">You can review organization-wide summaries here. A Program Officer or Superadmin can add operational workspace access when your assignment requires it.</div>`}
          </div>
        </div>

        <div class="dashboard-activity-panel">
          <div class="dashboard-section-heading">
            <h3>Your authority</h3>
            <span>${escapeHtml(state.currentUser?.display_name || state.currentUser?.username || "Signed-in user")}</span>
          </div>
          <div class="dashboard-authority-list">
            ${state.currentUser?.role === "superadmin" ? `<div class="dashboard-authority-row"><strong>Superadmin</strong><span>Organization-wide administration and program access</span></div>` : authorityRows.length ? authorityRows.map(item => `<div class="dashboard-authority-row"><strong>${escapeHtml(item.program.replace(/\b\w/g, letter => letter.toUpperCase()))}</strong><span>${escapeHtml(item.roles.map(role => role.replaceAll("_", " ")).join(", "))}</span></div>`).join("") : `<div class="dashboard-authority-row"><strong>Dashboard access</strong><span>No operational program role is assigned</span></div>`}
          </div>
        </div>
      </section>

      ${renderDashboardAnalyticsPlaceholder()}

      <footer class="dashboard-copyright scroll-reveal">
        <span>&copy; 2026 Kerby Lloren</span>
        <span>&copy; Payatas Orione Foundation Inc.</span>
        <span>PAOFI Programs Database</span>
      </footer>
    </section>
  `;

  document.querySelectorAll("[data-menu-route]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.menuRoute));
  });
  setupDashboardScrollEffects();
  setupDashboardAnalyticsLazyLoad();
}

function renderDashboardAnalyticsPlaceholder() {
  return `
    <section id="dashboardAnalyticsSection" class="dashboard-analytics-section scroll-reveal" data-dashboard-analytics>
      <div class="dashboard-section-heading">
        <div>
          <p class="eyebrow">Growth and Records</p>
          <h3>Analytics Summary</h3>
        </div>
        <span>Loads when this section appears</span>
      </div>
      <div id="dashboardAnalyticsHost" class="dashboard-analytics-loading">
        <div class="analytics-skeleton wide"></div>
        <div class="analytics-skeleton"></div>
        <div class="analytics-skeleton"></div>
      </div>
    </section>
  `;
}

function setupDashboardScrollEffects() {
  const targets = elements.pageRoot.querySelectorAll(".scroll-reveal");
  if (!targets.length) return;
  if (!("IntersectionObserver" in window)) {
    targets.forEach(target => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: elements.pageRoot,
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.08
  });

  targets.forEach(target => observer.observe(target));
}

function setupDashboardAnalyticsLazyLoad() {
  const section = document.getElementById("dashboardAnalyticsSection");
  if (!section) return;
  let observer = null;

  function isSectionNearView() {
    const rootRect = elements.pageRoot.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    return sectionRect.top < rootRect.bottom + 220 && sectionRect.bottom > rootRect.top - 120;
  }

  function triggerIfReady() {
    if (!isSectionNearView()) return;
    cleanup();
    loadDashboardAnalytics().catch(error => showToast(error.message));
  }

  function handleViewportChange() {
    triggerIfReady();
  }

  function cleanup() {
    elements.pageRoot.removeEventListener("scroll", handleViewportChange);
    window.removeEventListener("resize", handleViewportChange);
    observer?.disconnect();
  }

  if (!("IntersectionObserver" in window)) {
    elements.pageRoot.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);
    return;
  }

  observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) triggerIfReady();
  }, {
    root: elements.pageRoot,
    rootMargin: "240px 0px 240px 0px",
    threshold: 0.01
  });

  elements.pageRoot.addEventListener("scroll", handleViewportChange, { passive: true });
  window.addEventListener("resize", handleViewportChange);
  observer.observe(section);
}

function loadScriptOnce(src) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing?.dataset.loaded === "true") return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = existing || document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Unable to load chart runtime: ${src}`));
    if (!existing) document.head.appendChild(script);
  });
}

async function loadVegaRuntime() {
  if (window.vegaEmbed) return;
  if (!state.vegaRuntimePromise) {
    state.vegaRuntimePromise = Promise.resolve()
      .then(() => loadScriptOnce("/vendor/vega/vega.min.js"))
      .then(() => loadScriptOnce("/vendor/vega/vega-lite.min.js"))
      .then(() => loadScriptOnce("/vendor/vega/vega-embed.min.js"));
  }

  await state.vegaRuntimePromise;
}

async function loadDashboardAnalytics() {
  if (state.dashboardAnalyticsLoaded || state.dashboardAnalyticsLoading) return;
  state.dashboardAnalyticsLoading = true;
  const host = document.getElementById("dashboardAnalyticsHost");
  if (host) host.classList.add("is-loading");

  try {
    const activeHost = document.getElementById("dashboardAnalyticsHost");
    if (!activeHost) return;
    activeHost.className = "dashboard-analytics-content";
    activeHost.innerHTML = renderDashboardAnalytics(state.stats || {});
    await renderDashboardVegaCharts(state.stats || {});
    requestAnimationFrame(() => activeHost.classList.add("is-ready"));
    state.dashboardAnalyticsLoaded = true;
  } catch (error) {
    const activeHost = document.getElementById("dashboardAnalyticsHost");
    if (activeHost) {
      activeHost.className = "dashboard-analytics-error";
      activeHost.innerHTML = `
        <strong>Analytics could not be loaded.</strong>
        <span>${escapeHtml(error.message)}</span>
        <button type="button" class="text-button" id="dashboardAnalyticsRetry">Retry</button>
      `;
      document.getElementById("dashboardAnalyticsRetry")?.addEventListener("click", () => {
        state.dashboardAnalyticsLoading = false;
        loadDashboardAnalytics().catch(loadError => showToast(loadError.message));
      });
    }
  } finally {
    state.dashboardAnalyticsLoading = false;
  }
}

function renderDashboardAnalytics(stats = {}) {
  const profileTotal = Number(stats.active || 0) + Number(stats.nutritionBeneficiaries || 0) + Number(stats.scholarshipScholars || 0) + Number(stats.healthPatients || 0);
  const monitoringTotal = Number(stats.monitoringReports || 0) + Number(stats.nutritionGrowthReports || 0) + Number(stats.scholarshipEnrollments || 0) + Number(stats.healthEncounters || 0);
  const financeTotal = Number(stats.administrationFinance || 0);
  const activePrograms = [stats.active, stats.nutritionBeneficiaries, stats.scholarshipScholars, stats.healthPatients].filter(value => Number(value || 0) > 0).length;

  return `
    <div class="dashboard-analytics-landscape">
      <div class="analytics-ribbon">
        ${dashboardAnalyticsStat("Program Profiles", profileTotal, "active service records")}
        ${dashboardAnalyticsStat("Active Programs", activePrograms, "programs with recorded clients")}
        ${dashboardAnalyticsStat("Monitoring Activity", monitoringTotal, "reports and encounters")}
        ${dashboardAnalyticsStat("Finance Ledger", financeTotal, "shared control records")}
      </div>
      <section class="analytics-shape growth-pulse" data-chart-copy-surface data-chart-copy-name="Program Profiles">
        <div class="analytics-shape-heading">
          <span>Program Profiles</span>
          <div class="analytics-shape-insight">
            <strong>Organization reach</strong>
            ${chartCopyButton("Program Profiles")}
          </div>
        </div>
        <div id="dashboardProgramProfilesChart" class="vega-chart"></div>
      </section>
      <section class="analytics-shape month-flow" data-chart-copy-surface data-chart-copy-name="Monitoring Activity">
        <div class="analytics-shape-heading">
          <span>Monitoring Activity</span>
          <div class="analytics-shape-insight">
            <strong>${monitoringTotal} records</strong>
            ${chartCopyButton("Monitoring Activity")}
          </div>
        </div>
        <div id="dashboardMonitoringChart" class="vega-chart"></div>
      </section>
      <section class="analytics-shape group-current" data-chart-copy-surface data-chart-copy-name="Program Finance">
        <div class="analytics-shape-heading">
          <span>Program Finance</span>
          <div class="analytics-shape-insight">
            <strong>Shared ledger</strong>
            ${chartCopyButton("Program Finance")}
          </div>
        </div>
        <div id="dashboardFinanceChart" class="vega-chart"></div>
      </section>
      <section class="analytics-shape status-stream" data-chart-copy-surface data-chart-copy-name="Administrative Coverage">
        <div class="analytics-shape-heading">
          <span>Administrative Coverage</span>
          <div class="analytics-shape-insight">
            <strong>Organization controls</strong>
            ${chartCopyButton("Administrative Coverage")}
          </div>
        </div>
        <div id="dashboardAdministrationChart" class="vega-chart"></div>
      </section>
    </div>
  `;
}

function dashboardAnalyticsStat(label, value, caption) {
  return `
    <div class="dashboard-analytics-stat">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <em>${escapeHtml(caption)}</em>
    </div>
  `;
}

function vegaValues(entries = [], fallbackLabel = "No Data") {
  const values = entries
    .filter(entry => Number(entry.count || 0) > 0)
    .map(entry => ({ label: entry.label || fallbackLabel, count: Number(entry.count || 0) }));
  return values.length ? values : [{ label: fallbackLabel, count: 0 }];
}

function dashboardVegaBase(width = "container", height = 210) {
  return {
    "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
    "width": width,
    "height": height,
    "padding": { "left": 10, "right": 12, "top": 10, "bottom": 10 },
    "autosize": { "type": "fit", "contains": "padding" },
    "background": "transparent",
    "config": {
      "view": { "stroke": null },
      "axis": {
        "labelColor": "#66746d",
        "labelFont": "Segoe UI",
        "labelFontSize": 12,
        "labelFontWeight": 400,
        "labelPadding": 8,
        "title": null,
        "gridColor": "#dfe8e2",
        "domain": false,
        "tickColor": "#cbd8d0",
        "tickSize": 4
      },
      "legend": {
        "labelColor": "#44524a",
        "labelFont": "Segoe UI",
        "labelFontSize": 12,
        "labelFontWeight": 400,
        "labelLimit": 190,
        "columnPadding": 18,
        "rowPadding": 8,
        "symbolSize": 150,
        "title": null,
        "orient": "bottom"
      }
    }
  };
}

function dashboardVegaSpecs(stats = {}) {
  const palette = ["#0d5637", "#9be87d", "#3f88c5", "#f4c84c", "#8f7bdc"];
  const profiles = [
    { label: "Livelihood", count: Number(stats.active || 0) },
    { label: "Nutrition", count: Number(stats.nutritionBeneficiaries || 0) },
    { label: "Scholarship", count: Number(stats.scholarshipScholars || 0) },
    { label: "Health", count: Number(stats.healthPatients || 0) }
  ];
  const monitoring = [
    { label: "Livelihood Reports", count: Number(stats.monitoringReports || 0) },
    { label: "Growth Reports", count: Number(stats.nutritionGrowthReports || 0) },
    { label: "Scholar Enrollments", count: Number(stats.scholarshipEnrollments || 0) },
    { label: "Health Encounters", count: Number(stats.healthEncounters || 0) }
  ];
  const finance = [
    { label: "Livelihood", count: Number(stats.livelihoodFinance || 0) },
    { label: "Nutrition", count: Number(stats.nutritionFinance || 0) },
    { label: "Scholarship", count: Number(stats.scholarshipFinance || 0) },
    { label: "Health", count: Number(stats.healthFinance || 0) }
  ];
  const administration = [
    { label: "People", count: Number(stats.administrationPeople || 0) },
    { label: "Assets", count: Number(stats.administrationAssets || 0) },
    { label: "Compliance", count: Number(stats.administrationCompliance || 0) },
    { label: "Finance", count: Number(stats.administrationFinance || 0) }
  ];

  return {
    dashboardProgramProfilesChart: {
      ...dashboardVegaBase("container", 404),
      "data": { "values": vegaValues(profiles, "No Profiles") },
      "mark": { "type": "arc", "innerRadius": 76, "outerRadius": 138, "cornerRadius": 8, "padAngle": 0.035 },
      "encoding": {
        "theta": { "field": "count", "type": "quantitative" },
        "color": {
          "field": "label",
          "type": "nominal",
          "scale": { "range": palette },
          "legend": { "orient": "bottom", "columns": 2, "labelLimit": 170, "columnPadding": 16, "rowPadding": 10 }
        },
        "tooltip": [
          { "field": "label", "type": "nominal", "title": "Program" },
          { "field": "count", "type": "quantitative", "title": "Profiles" }
        ]
      }
    },
    dashboardMonitoringChart: {
      ...dashboardVegaBase("container", 184),
      "data": { "values": vegaValues(monitoring, "No Monitoring") },
      "mark": { "type": "bar", "cornerRadiusTopLeft": 8, "cornerRadiusTopRight": 8 },
      "encoding": {
        "x": { "field": "label", "type": "nominal", "sort": null, "axis": { "labelAngle": -18, "labelLimit": 120 } },
        "y": { "field": "count", "type": "quantitative", "axis": { "tickCount": 5 } },
        "color": { "field": "label", "type": "nominal", "legend": null, "scale": { "range": palette } },
        "tooltip": [
          { "field": "label", "type": "nominal", "title": "Activity" },
          { "field": "count", "type": "quantitative", "title": "Records" }
        ]
      }
    },
    dashboardFinanceChart: {
      ...dashboardVegaBase("container", 172),
      "data": { "values": vegaValues(finance, "No Finance Records") },
      "mark": { "type": "bar", "cornerRadiusEnd": 10 },
      "encoding": {
        "y": { "field": "label", "type": "nominal", "sort": "-x", "axis": { "labelLimit": 170 } },
        "x": { "field": "count", "type": "quantitative", "axis": { "tickCount": 5 } },
        "color": { "field": "label", "type": "nominal", "legend": null, "scale": { "range": palette } },
        "tooltip": [
          { "field": "label", "type": "nominal", "title": "Program" },
          { "field": "count", "type": "quantitative", "title": "Records" }
        ]
      }
    },
    dashboardAdministrationChart: {
      ...dashboardVegaBase("container", 178),
      "data": { "values": vegaValues(administration, "No Administrative Records") },
      "mark": { "type": "bar", "cornerRadiusEnd": 12, "height": { "band": 0.56 } },
      "encoding": {
        "y": { "field": "label", "type": "nominal", "sort": "-x", "axis": { "labelLimit": 130 } },
        "x": { "field": "count", "type": "quantitative", "axis": { "tickCount": 8 } },
        "color": { "field": "label", "type": "nominal", "legend": null, "scale": { "range": palette } },
        "tooltip": [
          { "field": "label", "type": "nominal", "title": "Area" },
          { "field": "count", "type": "quantitative", "title": "Records" }
        ]
      }
    }
  };
}

async function renderDashboardVegaCharts(stats = {}) {
  await loadVegaRuntime();
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const specs = dashboardVegaSpecs(stats);
  await Promise.all(Object.entries(specs).map(([id, spec]) => {
    const target = document.getElementById(id);
    if (!target || !window.vegaEmbed) return Promise.resolve();
    const bounds = target.getBoundingClientRect();
    const measuredSpec = {
      ...spec,
      width: Math.max(220, Math.floor(bounds.width)),
      height: Math.max(150, Math.floor(bounds.height))
    };
    return window.vegaEmbed(target, measuredSpec, {
      actions: false,
      renderer: "svg",
      theme: "none"
    });
  }));
}

function dashboardMetric(label, value, route, caption = "") {
  const tag = route ? "button" : "div";
  return `
    <${tag} ${route ? `type="button" data-menu-route="${escapeHtml(route)}"` : ""} class="dashboard-metric ${route ? "" : "is-summary-only"}">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
      ${caption ? `<em>${escapeHtml(caption)}</em>` : ""}
    </${tag}>
  `;
}

function dashboardCommand(route, iconName, label, caption) {
  return `
    <button type="button" class="dashboard-command" data-menu-route="${escapeHtml(route)}">
      <span class="dashboard-command-icon">${icon(iconName)}</span>
      <span>
        <strong>${escapeHtml(label)}</strong>
        <em>${escapeHtml(caption)}</em>
      </span>
      <i>${icon("arrow")}</i>
    </button>
  `;
}

function dashboardSummaryRow(label, value, caption, route) {
  return `
    <button type="button" class="dashboard-summary-row" data-menu-route="${escapeHtml(route)}">
      <div>
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(caption)}</span>
      </div>
      <em>${escapeHtml(value)}</em>
    </button>
  `;
}

function formatRecentUpdateDate(record) {
  return fieldValue("date_updated", record.date_updated)
    || fieldValue("updated_at", record.updated_at)
    || "Recently updated";
}

function recentUpdateRow(record) {
  return `
    <button type="button" class="recent-update-row" data-view-id="${record.id}">
      <div>
        <strong>${escapeHtml(fullName(record))}</strong>
        <span>${escapeHtml(record.control_no || "")} | ${escapeHtml(record.status || "")}</span>
      </div>
      <time>${escapeHtml(formatRecentUpdateDate(record))}</time>
      <i>${icon("arrow")}</i>
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
    <section class="monitoring-overview flow-analytics monitoring-flow-analytics">
      <div class="analytics-title-row">
        <div>
          <span class="analytics-eyebrow">Monitoring Dashboard</span>
          <h3>Monthly Reports Summary</h3>
        </div>
        <span class="analytics-note">${overview.months} month${overview.months === 1 ? "" : "s"} covered</span>
      </div>
      <div class="analytics-kpi-grid analytics-signal-strip four-signals">
        ${renderAnalyticsKpi("Reports Filed", String(overview.count), "Submitted monthly forms", "green")}
        ${renderAnalyticsKpi("Total Sales", formatMoney(overview.sales), "Production and sales", "blue")}
        ${renderAnalyticsKpi("Total Expenses", formatMoney(overview.expenses), "Reported expenses", "amber")}
        ${renderAnalyticsKpi("Current Fund", formatMoney(overview.currentFund), "Latest running balances", "violet")}
      </div>
      <div class="analytics-preview-grid flow-chart-grid">
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
    <section class="database-analytics nutrition-analytics flow-analytics nutrition-flow-analytics nutrition-profile-flow-analytics">
      <div class="analytics-title-row">
        <div>
          <span class="analytics-eyebrow">Nutrition Program</span>
          <h3>Supplemental Feeding Overview</h3>
        </div>
        <span class="analytics-note">${analytics.active} active child${analytics.active === 1 ? "" : "ren"}</span>
      </div>
      <div class="analytics-kpi-grid analytics-signal-strip four-signals">
        ${renderAnalyticsKpi("Beneficiaries", String(analytics.total), "Child profile records", "green")}
        ${renderAnalyticsKpi("Active Children", String(analytics.active), `${analyticsPercent(analytics.active, analytics.total)}% of profiles`, "blue")}
        ${renderAnalyticsKpi("Feeding Centers", String(analytics.centers), `${analytics.activeCenters} active centers`, "amber")}
        ${renderAnalyticsKpi("Top Status", topNutritionStatus.label, analyticsPlural(topNutritionStatus.count, "child", "children"), "violet")}
      </div>
      <div class="analytics-preview-grid flow-chart-grid">
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

  const [centers, beneficiariesPayload] = await Promise.all([
    loadNutritionCenters(),
    api("/api/nutrition/beneficiaries?limit=100")
  ]);
  const beneficiaries = beneficiariesPayload.beneficiaries || [];

  elements.pageRoot.innerHTML = `
    <div id="nutritionAnalyticsHost">${renderNutritionAnalytics(beneficiaries, centers)}</div>
    <section class="database-page nutrition-page flow-data-section">
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
    state.tablePages.nutritionProfiles = 1;
    const payload = await api(`/api/nutrition/beneficiaries?search=${search}&centerId=${centerId}&limit=100`);
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
  const pageInfo = pagedItems(records, "nutritionProfiles");
  document.getElementById("nutritionCount").textContent = pageCountText(pageInfo, "profiles");

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
          ${pageInfo.items.map(record => `
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
    ${renderPagination("nutritionProfiles", pageInfo)}
  `;
  bindPagination(document.getElementById("nutritionTableHost"), "nutritionProfiles", () => renderNutritionProfileTable(records));
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
            font-size: 10px;
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
            font-size: 10px;
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
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .print-field strong {
            display: block;
            color: #1d2520;
            font-size: 10px;
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
            font-size: 10px;
            font-weight: 800;
          }
          td {
            font-size: 10px;
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
  enforceMinimumPrintFontSize(printWindow.document);
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
    <section class="database-analytics nutrition-analytics flow-analytics nutrition-flow-analytics">
      <div class="analytics-title-row">
        <div>
          <span class="analytics-eyebrow">Feeding Center Analytics</span>
          <h3>Center Coverage</h3>
        </div>
        <span class="analytics-note">${analytics.activeCenters} active of ${analytics.centers} centers</span>
      </div>
      <div class="analytics-kpi-grid analytics-signal-strip four-signals">
        ${renderAnalyticsKpi("Centers", String(analytics.centers), "Profile records", "green")}
        ${renderAnalyticsKpi("Active Centers", String(analytics.activeCenters), "Currently operating", "blue")}
        ${renderAnalyticsKpi("Beneficiaries", String(analytics.total), "Children linked to centers", "amber")}
        ${renderAnalyticsKpi("Largest Center", topCenter.label, analyticsPlural(topCenter.count, "child", "children"), "violet")}
      </div>
      <div class="analytics-preview-grid flow-chart-grid">
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
  const params = new URLSearchParams({ search, centerId, limit: "100" });
  const payload = await api(`/api/nutrition/growth/reports?${params.toString()}`);
  return payload.reports || [];
}

async function loadNutritionGrowthReport(id) {
  const payload = await api(`/api/nutrition/growth/reports/${id}`);
  return payload.report;
}

async function loadDetailedNutritionGrowthReports(reports = []) {
  return Promise.all(reports.map(report => loadNutritionGrowthReport(report.id)));
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

function nutritionGrowthDetailedRows(reports = []) {
  return reports.flatMap(report => (report.entries || []).map(entry => ({ report, entry })));
}

function nutritionGrowthAgeBucket(ageMonths) {
  const age = nutritionGrowthNumber(ageMonths);
  if (age === null) return "Not Recorded";
  const years = Math.floor(age / 12);
  if (years < 1) return "Under 1 Year";
  if (years >= 10) return "10+ Years";
  return `${years} Year${years === 1 ? "" : "s"}`;
}

function nutritionGrowthAgeBucketRank(label) {
  const text = String(label || "");
  if (text === "10+ Years") return 10;
  if (text === "Under 1 Year") return 0;
  const match = /^(\d+) Year/.exec(text);
  if (match) return Number(match[1]);
  return -1;
}

function sortNutritionGrowthAgeCounts(entries = []) {
  return [...entries].sort((left, right) => {
    const rankSort = nutritionGrowthAgeBucketRank(right.label) - nutritionGrowthAgeBucketRank(left.label);
    return rankSort || left.label.localeCompare(right.label);
  });
}

function nutritionGrowthChangeBucket(value, noun) {
  const number = nutritionGrowthNumber(value);
  if (number === null) return "Not Recorded";
  if (number < 0) return `Lost ${noun}`;
  if (number === 0) return "No Change";
  if (noun === "Weight" && number <= 0.5) return "Gained 0.1-0.5 kg";
  if (noun === "Weight" && number <= 1) return "Gained 0.6-1.0 kg";
  if (noun === "Weight") return "Gained > 1.0 kg";
  if (number <= 1) return "Gained 0.1-1.0 cm";
  if (number <= 3) return "Gained 1.1-3.0 cm";
  return "Gained > 3.0 cm";
}

function nutritionGrowthAverage(rows = [], fieldName) {
  const values = rows
    .map(({ entry }) => nutritionGrowthNumber(entry[fieldName]))
    .filter(value => value !== null);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function nutritionGrowthSignedValue(value, unit) {
  if (value === null || !Number.isFinite(value)) return "N/A";
  const rounded = Math.round(value * 100) / 100;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `${rounded > 0 ? "+" : ""}${text} ${unit}`;
}

function nutritionGrowthLatestMonth(reports = []) {
  const latest = [...reports]
    .map(report => report.report_month)
    .filter(Boolean)
    .sort()
    .pop();
  return latest ? reportMonthLabel(latest) : "No Month";
}

function buildNutritionGrowthAnalytics(reports = [], detailedReports = reports) {
  const rows = nutritionGrowthDetailedRows(detailedReports);
  const totals = reports.reduce((summary, report) => {
    summary.children += Number(report.child_count || 0);
    summary.severelyUnderweight += Number(report.severely_underweight_count || 0);
    summary.underweight += Number(report.underweight_count || 0);
    summary.normal += Number(report.normal_count || 0);
    summary.overweight += Number(report.overweight_count || 0);
    summary.centerCounts.set(report.center_name || "No Center", (summary.centerCounts.get(report.center_name || "No Center") || 0) + 1);
    summary.monthCounts.set(monthKeyLabel(report.report_month), (summary.monthCounts.get(monthKeyLabel(report.report_month)) || 0) + 1);
    return summary;
  }, {
    children: 0,
    severelyUnderweight: 0,
    underweight: 0,
    normal: 0,
    overweight: 0,
    centerCounts: new Map(),
    monthCounts: new Map()
  });
  const averageWeightChange = nutritionGrowthAverage(rows, "weight_change_kg");
  const averageHeightChange = nutritionGrowthAverage(rows, "height_change_cm");

  return {
    reports: reports.length,
    children: rows.length || totals.children,
    statusCounts: [
      { label: "Severely Underweight", count: totals.severelyUnderweight },
      { label: "Underweight", count: totals.underweight },
      { label: "Normal", count: totals.normal },
      { label: "Overweight", count: totals.overweight }
    ],
    centerCounts: [...totals.centerCounts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
    monthCounts: [...totals.monthCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => {
        const order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return order.indexOf(left.label) - order.indexOf(right.label);
      }),
    ageCounts: sortNutritionGrowthAgeCounts(nutritionGrowthCountEntries(rows, item => nutritionGrowthAgeBucket(item.entry.age_months))),
    weightChangeCounts: nutritionGrowthCountEntries(rows, item => nutritionGrowthChangeBucket(item.entry.weight_change_kg, "Weight")),
    heightChangeCounts: nutritionGrowthCountEntries(rows, item => nutritionGrowthChangeBucket(item.entry.height_change_cm, "Height")),
    averageWeightChange,
    averageHeightChange,
    latestMonth: nutritionGrowthLatestMonth(reports)
  };
}

function renderNutritionGrowthAnalytics(reports = [], detailedReports = reports, { centerId = "" } = {}) {
  const analytics = buildNutritionGrowthAnalytics(reports, detailedReports);
  const topCenter = topAnalyticsEntry(analytics.centerCounts);
  const needsFollowUp = analytics.statusCounts
    .filter(entry => ["Severely Underweight", "Underweight"].includes(entry.label))
    .reduce((sum, entry) => sum + entry.count, 0);
  const isAllCenters = !centerId;
  const fourthKpi = isAllCenters
    ? renderAnalyticsKpi("Top Center", topCenter.label, analyticsPlural(topCenter.count, "report"), "amber")
    : renderAnalyticsKpi("Latest Month", analytics.latestMonth, "latest filtered report", "amber");

  return `
    <section class="database-analytics nutrition-analytics flow-analytics nutrition-flow-analytics nutrition-growth-flow-analytics">
      <div class="analytics-title-row">
        <div>
          <span class="analytics-eyebrow">Nutrition Growth Monitoring</span>
          <h3>Monthly Center Reports</h3>
        </div>
        <span class="analytics-note">${analytics.reports} report${analytics.reports === 1 ? "" : "s"} filed</span>
      </div>
      <div class="analytics-kpi-grid analytics-signal-strip">
        ${renderAnalyticsKpi("Reports", String(analytics.reports), "center-month records", "green")}
        ${renderAnalyticsKpi("Children Monitored", String(analytics.children), "rows across reports", "blue")}
        ${renderAnalyticsKpi("Needs Follow-Up", String(needsFollowUp), "SU + Underweight", "red")}
        ${fourthKpi}
        ${renderAnalyticsKpi("Avg Weight Change", nutritionGrowthSignedValue(analytics.averageWeightChange, "kg"), "across child rows", "green")}
        ${renderAnalyticsKpi("Avg Height Change", nutritionGrowthSignedValue(analytics.averageHeightChange, "cm"), "across child rows", "blue")}
      </div>
      <div class="analytics-preview-grid flow-chart-grid">
        ${renderAnalyticsCard("CGS Classification", "All displayed reports", renderBarList(analytics.statusCounts, Math.max(analytics.children, 1), 4))}
        ${renderAnalyticsCard("Age Distribution", "Age in years", renderBarList(analytics.ageCounts, Math.max(analytics.children, 1), 7))}
        ${renderAnalyticsCard("Weight Change", "From latest reference to current record", renderBarList(analytics.weightChangeCounts, Math.max(analytics.children, 1), 6))}
        ${renderAnalyticsCard("Height Change", "From latest reference to current record", renderBarList(analytics.heightChangeCounts, Math.max(analytics.children, 1), 6))}
        ${isAllCenters ? renderAnalyticsCard("Reports by Center", "Monitoring coverage", renderBarList(analytics.centerCounts, Math.max(analytics.reports, 1), 6)) : ""}
        ${isAllCenters ? renderAnalyticsCard("Reports per Month", "Monthly report filing", renderBarList(analytics.monthCounts, Math.max(analytics.reports, 1), 12)) : ""}
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
    { id: "nutritionGrowthYearly", label: "Yearly Summary", icon: "print", onClick: () => printNutritionGrowthYearlySummary(currentNutritionGrowthCenterFilter()).catch(error => showToast(error.message)) }
  ]);

  const [centers, reports] = await Promise.all([
    loadNutritionCenters(),
    loadNutritionGrowthReports()
  ]);

  elements.pageRoot.innerHTML = `
    <div id="nutritionGrowthAnalyticsHost">${renderNutritionGrowthAnalytics(reports, [])}</div>
    <section class="database-page nutrition-page flow-data-section">
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
    state.tablePages.nutritionGrowth = 1;
    const filteredReports = await loadNutritionGrowthReports({ search, centerId });
    document.getElementById("nutritionGrowthAnalyticsHost").innerHTML = renderNutritionGrowthAnalytics(filteredReports, [], { centerId });
    renderNutritionGrowthTable(filteredReports);
    loadDetailedNutritionGrowthReports(filteredReports)
      .then(filteredDetailedReports => {
        if (document.getElementById("nutritionGrowthAnalyticsHost")) {
          document.getElementById("nutritionGrowthAnalyticsHost").innerHTML = renderNutritionGrowthAnalytics(filteredReports, filteredDetailedReports, { centerId });
        }
      })
      .catch(error => showToast(error.message));
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
  loadDetailedNutritionGrowthReports(reports)
    .then(detailedReports => {
      if (document.getElementById("nutritionGrowthAnalyticsHost")) {
        document.getElementById("nutritionGrowthAnalyticsHost").innerHTML = renderNutritionGrowthAnalytics(reports, detailedReports);
      }
    })
    .catch(error => showToast(error.message));
}

function renderNutritionGrowthTable(reports = []) {
  const pageInfo = pagedItems(reports, "nutritionGrowth");
  document.getElementById("nutritionGrowthCount").textContent = pageCountText(pageInfo, "reports");

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
          ${pageInfo.items.map(report => `
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
    ${renderPagination("nutritionGrowth", pageInfo)}
  `;
  bindPagination(document.getElementById("nutritionGrowthTableHost"), "nutritionGrowth", () => renderNutritionGrowthTable(reports));
  attachNutritionGrowthTableHandlers(elements.pageRoot);
}

function currentNutritionGrowthCenterFilter() {
  const select = document.getElementById("nutritionGrowthCenterFilter");
  const centerId = select?.value || "";
  const selected = select?.options[select.selectedIndex];
  return {
    centerId,
    centerName: centerId ? String(selected?.textContent || "").trim() : ""
  };
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
  ].filter(Boolean).join(" | ") || "No Previous records";

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
  if (currentNumber === null) return "";
  if (previousNumber === null) return "0";
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

function nutritionGrowthSignedText(value, unit) {
  return nutritionGrowthSignedValue(nutritionGrowthNumber(value), unit);
}

function nutritionGrowthDisplayValue(value, unit = "") {
  const number = nutritionGrowthNumber(value);
  if (number === null) return "";
  return `${nutritionGrowthFormatNumber(number)}${unit ? ` ${unit}` : ""}`;
}

function nutritionGrowthYearlyMonths(rows = []) {
  return [...new Set(rows.map(({ report }) => report.report_month).filter(Boolean))]
    .sort();
}

function nutritionGrowthChildKey(report = {}, entry = {}) {
  return String(entry.beneficiary_id || `${report.center_name || ""}|${entry.beneficiary_no || ""}|${entry.beneficiary_name || ""}`).trim();
}

function nutritionGrowthYearlyChildren(rows = []) {
  const children = new Map();

  rows.forEach(({ report, entry }) => {
    const key = nutritionGrowthChildKey(report, entry);
    if (!key) return;

    if (!children.has(key)) {
      children.set(key, {
        center_name: report.center_name || "",
        beneficiary_no: entry.beneficiary_no || "",
        beneficiary_name: entry.beneficiary_name || "",
        gender: entry.gender || "",
        birth_date: entry.birth_date || "",
        months: new Map()
      });
    }

    children.get(key).months.set(report.report_month, entry);
  });

  return [...children.values()].sort((left, right) => {
    return String(left.center_name || "").localeCompare(String(right.center_name || ""))
      || String(left.beneficiary_name || "").localeCompare(String(right.beneficiary_name || ""))
      || String(left.beneficiary_no || "").localeCompare(String(right.beneficiary_no || ""));
  });
}

const NUTRITION_GROWTH_YEARLY_COLUMNS = [
  { key: "age_months", label: "Age", average: rows => nutritionGrowthSignedValue(nutritionGrowthAverage(rows, "age_months"), "mo").replace(/^\+/, "") },
  { key: "height_cm", label: "Height", average: rows => nutritionGrowthSignedValue(nutritionGrowthAverage(rows, "height_cm"), "cm").replace(/^\+/, "") },
  { key: "weight_kg", label: "Weight", average: rows => nutritionGrowthSignedValue(nutritionGrowthAverage(rows, "weight_kg"), "kg").replace(/^\+/, "") },
  { key: "height_change_cm", label: "H. Change", average: rows => nutritionGrowthSignedValue(nutritionGrowthAverage(rows, "height_change_cm"), "cm") },
  { key: "weight_change_kg", label: "W. Change", average: rows => nutritionGrowthSignedValue(nutritionGrowthAverage(rows, "weight_change_kg"), "kg") },
  { key: "cgs_classification", label: "CGS", average: rows => {
    const topStatus = nutritionGrowthCountEntries(rows, item => item.entry.cgs_classification)[0];
    return topStatus ? `${topStatus.label} (${topStatus.count})` : "";
  } }
];

function nutritionGrowthYearlyCellValue(entry, column) {
  if (!entry) return "";

  if (column.key === "age_months") return entry.age_months ? `${entry.age_months} mo` : "";
  if (column.key === "height_cm") return nutritionGrowthDisplayValue(entry.height_cm, "cm");
  if (column.key === "weight_kg") return nutritionGrowthDisplayValue(entry.weight_kg, "kg");
  if (column.key === "height_change_cm") return nutritionGrowthSignedText(entry.height_change_cm, "cm");
  if (column.key === "weight_change_kg") return nutritionGrowthSignedText(entry.weight_change_kg, "kg");
  return entry[column.key] || "";
}

function printNutritionGrowthMonthCells(entry) {
  return NUTRITION_GROWTH_YEARLY_COLUMNS
    .map(column => `<td class="${entry ? "" : "growth-muted"}">${escapeHtml(nutritionGrowthYearlyCellValue(entry, column) || "-")}</td>`)
    .join("");
}

function printNutritionGrowthMonthlyAverageCells(rows = []) {
  return NUTRITION_GROWTH_YEARLY_COLUMNS
    .map(column => `<td>${escapeHtml(rows.length ? column.average(rows) || "-" : "-")}</td>`)
    .join("");
}

function printNutritionGrowthYearlyPivotTable(rows = [], { includeCenter = false } = {}) {
  if (!rows.length) {
    const fixedColumns = includeCenter ? 5 : 4;
    const colspan = fixedColumns + NUTRITION_GROWTH_YEARLY_COLUMNS.length;
    return `
      <table class="yearly-pivot">
        <tbody><tr><td colspan="${colspan}">No growth monitoring records found for this year.</td></tr></tbody>
      </table>
    `;
  }

  const months = nutritionGrowthYearlyMonths(rows);
  const children = nutritionGrowthYearlyChildren(rows);
  const fixedColumnCount = includeCenter ? 5 : 4;

  return `
    <table class="yearly-pivot">
      <thead>
        <tr>
          ${includeCenter ? `<th class="child-center" rowspan="2">Center</th>` : ""}
          <th class="child-info" rowspan="2">Beneficiary No.</th>
          <th class="child-name" rowspan="2">Child</th>
          <th class="child-info" rowspan="2">Gender</th>
          <th class="child-info" rowspan="2">Birth Date</th>
          ${months.map(month => `<th class="month-group" colspan="${NUTRITION_GROWTH_YEARLY_COLUMNS.length}">${escapeHtml(reportMonthLabel(month))}</th>`).join("")}
        </tr>
        <tr>
          ${months.map(() => NUTRITION_GROWTH_YEARLY_COLUMNS.map(column => `<th class="month-stat">${escapeHtml(column.label)}</th>`).join("")).join("")}
        </tr>
      </thead>
      <tbody>
        ${children.map(child => `
          <tr>
            ${includeCenter ? `<td class="child-center">${escapeHtml(child.center_name)}</td>` : ""}
            <td class="child-info">${escapeHtml(child.beneficiary_no)}</td>
            <td class="child-name">${escapeHtml(child.beneficiary_name)}</td>
            <td class="child-info">${escapeHtml(child.gender)}</td>
            <td class="child-info">${escapeHtml(child.birth_date)}</td>
            ${months.map(month => printNutritionGrowthMonthCells(child.months.get(month))).join("")}
          </tr>
        `).join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="${fixedColumnCount}"><strong>Monthly Average</strong></td>
          ${months.map(month => {
            const monthRows = rows.filter(({ report }) => report.report_month === month);
            return printNutritionGrowthMonthlyAverageCells(monthRows);
          }).join("")}
        </tr>
      </tfoot>
    </table>
  `;
}

async function printNutritionGrowthYearlySummary({ centerId = "", centerName = "" } = {}) {
  const defaultYear = String(new Date().getFullYear());
  const scopeLabel = centerName || "All Centers";
  const year = String(await requestYearInput(scopeLabel, defaultYear) || "").trim();
  if (!year) return;
  if (!/^\d{4}$/.test(year)) {
    showToast("Enter a valid 4-digit year.");
    return;
  }

  const reports = (await loadNutritionGrowthReports({ search: year, centerId }))
    .filter(report => String(report.report_month || "").startsWith(`${year}-`));
  if (!reports.length) {
    showToast(`No growth monitoring reports found for ${scopeLabel} in ${year}.`);
    return;
  }

  const detailedReports = await loadDetailedNutritionGrowthReports(reports);

  const rows = nutritionGrowthYearlyRows(detailedReports);
  const statusCounts = nutritionGrowthCountEntries(rows, item => item.entry.cgs_classification);
  const centerCounts = nutritionGrowthCountEntries(detailedReports, report => report.center_name);
  const monthCounts = nutritionGrowthCountEntries(detailedReports, report => monthKeyLabel(report.report_month))
    .sort((left, right) => {
      const order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return order.indexOf(left.label) - order.indexOf(right.label);
    });
  const ageCounts = sortNutritionGrowthAgeCounts(nutritionGrowthCountEntries(rows, item => nutritionGrowthAgeBucket(item.entry.age_months)));
  const weightChangeCounts = nutritionGrowthCountEntries(rows, item => nutritionGrowthChangeBucket(item.entry.weight_change_kg, "Weight"));
  const heightChangeCounts = nutritionGrowthCountEntries(rows, item => nutritionGrowthChangeBucket(item.entry.height_change_cm, "Height"));
  const averageWeightChange = nutritionGrowthAverage(rows, "weight_change_kg");
  const needsFollowUp = rows.filter(item => ["Severely Underweight", "Underweight"].includes(item.entry.cgs_classification)).length;
  const isAllCenters = !centerId;
  const chartMarkup = [
    printBarChart("CGS Classification", statusCounts, rows.length),
    isAllCenters ? printBarChart("Reports by Center", centerCounts, detailedReports.length) : "",
    isAllCenters ? printBarChart("Reports per Month", monthCounts, detailedReports.length) : "",
    printBarChart("Age Distribution (Years)", ageCounts, rows.length),
    printBarChart("Weight Change", weightChangeCounts, rows.length),
    printBarChart("Height Change", heightChangeCounts, rows.length)
  ].filter(Boolean).join("");
  const yearlyTableMarkup = printNutritionGrowthYearlyPivotTable(rows, { includeCenter: isAllCenters });

  const logoSrc = `${window.location.origin}/assets/paofi-logo.png`;
  const documentHtml = `
    <!doctype html>
    <html>
      <head>
        <title>Nutrition Growth Monitoring ${escapeHtml(year)} Summary</title>
        <style>
          @page { size: 13in 8.5in; margin: 7mm; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #1d2520; font-family: "Segoe UI", Arial, sans-serif; font-size: 10px; }
          button { margin: 10px; border: 1px solid #bdd3c6; border-radius: 7px; background: #ffffff; padding: 8px 12px; color: #155b3c; font-weight: 700; }
          .sheet { width: 13in; min-height: 0; margin: 0 auto; padding: 0.16in; background: #ffffff; }
          .header { display: grid; grid-template-columns: 48px minmax(0, 1fr) 2.1in; gap: 10px; align-items: center; border-bottom: 2px solid #1f7a4f; padding-bottom: 7px; }
          .header img { width: 44px; height: 44px; object-fit: contain; }
          h1, h2, h3, p { margin: 0; }
          h1 { color: #2f68b1; font-family: Georgia, "Times New Roman", serif; font-size: 14px; text-transform: uppercase; }
          h2 { color: #1d2520; font-size: 11px; text-transform: uppercase; }
          .meta { text-align: right; color: #4f5e55; }
          .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 8px 0; }
          .kpi { border: 1px solid #cddbd2; border-radius: 6px; padding: 6px; background: #f6faf8; }
          .kpi span { display: block; color: #5b6861; font-size: 10px; text-transform: uppercase; font-weight: 800; }
          .kpi strong { color: #155b3c; font-size: 13px; }
          .charts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 7px; }
          .chart-card { border: 1px solid #cddbd2; border-radius: 7px; padding: 7px; break-inside: avoid; }
          .chart-card h3 { color: #143d33; font-size: 10px; margin-bottom: 6px; text-transform: uppercase; }
          .chart-row { display: grid; grid-template-columns: 1fr 1.8fr 24px; gap: 5px; align-items: center; margin-bottom: 4px; }
          .chart-row span { overflow-wrap: anywhere; }
          .chart-row div { height: 9px; border-radius: 999px; background: #eaf0ed; overflow: hidden; }
          .chart-row i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #1f7a4f, #3f88c5); }
          .chart-row strong { text-align: right; font-variant-numeric: tabular-nums; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 1px solid #cbd8d0; padding: 2.5px 3px; vertical-align: top; overflow-wrap: anywhere; }
          th { background: #eaf6ef; color: #143d33; font-size: 10px; text-transform: uppercase; }
          td { font-size: 10px; }
          .yearly-pivot th, .yearly-pivot td { padding: 1.8px 2px; font-size: 10px; line-height: 1.18; text-align: center; }
          .yearly-pivot .month-group { background: #dcefe5; color: #0f5f3e; font-size: 10px; }
          .yearly-pivot .month-stat { background: #eef8f3; font-size: 10px; }
          .yearly-pivot .child-center { width: 0.78in; text-align: left; }
          .yearly-pivot .child-info { width: 0.68in; }
          .yearly-pivot .child-name { width: 1.05in; text-align: left; }
          .growth-muted { color: #89958f; font-style: italic; }
          tfoot td { background: #f6faf8; font-weight: 700; }
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
              <p>${escapeHtml(scopeLabel)}</p>
              <p>${detailedReports.length} monthly report${detailedReports.length === 1 ? "" : "s"}</p>
              <p>${rows.length} raw child record${rows.length === 1 ? "" : "s"}</p>
            </div>
          </header>
          <section class="kpis">
            <div class="kpi"><span>Monthly Reports</span><strong>${detailedReports.length}</strong></div>
            <div class="kpi"><span>Raw Records</span><strong>${rows.length}</strong></div>
            <div class="kpi"><span>Needs Follow-Up</span><strong>${needsFollowUp}</strong></div>
            <div class="kpi"><span>Avg Weight Change</span><strong>${escapeHtml(nutritionGrowthSignedValue(averageWeightChange, "kg"))}</strong></div>
          </section>
          <section class="charts">
            ${chartMarkup}
          </section>
          ${yearlyTableMarkup}
        </main>
      </body>
    </html>
  `;

  showDocumentPrintPreview(`Growth Monitoring ${year} Summary`, documentHtml);
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
          body { margin: 0; color: #1d2520; font-family: "Segoe UI", Arial, sans-serif; font-size: 10px; }
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
          .summary span { display: block; color: #5b6861; font-size: 10px; text-transform: uppercase; font-weight: 800; }
          .summary strong { font-size: 12px; color: #155b3c; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 1px solid #cbd8d0; padding: 3px 4px; vertical-align: top; overflow-wrap: anywhere; }
          th { background: #eaf6ef; color: #143d33; font-size: 10px; text-transform: uppercase; }
          td { font-size: 10px; }
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
                  ].filter(Boolean).join(" | ") || "No Previous records")}</td>
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
  enforceMinimumPrintFontSize(printWindow.document);
}

function parseNutritionFinancialRouteId(id = "") {
  if (!id) return { mode: "list", id: "" };
  if (id === "new") return { mode: "new", id: "" };
  if (id === "budgets") return { mode: "budgets", id: "" };
  if (id.startsWith("edit-")) return { mode: "edit", id: id.slice(5) };
  return { mode: "edit", id };
}

function blankNutritionFinancialEntry() {
  return {
    entry_date: "",
    rep_no: "",
    particulars: "",
    cv_no: "",
    viands: 0,
    milk: 0,
    rice: 0,
    gas: 0,
    mineral_water: 0,
    utilities: 0,
    others: 0
  };
}

function blankNutritionFinancialReport() {
  return {
    center_id: "",
    center_name: "",
    submitted_date: nutritionTodayDate(),
    report_month: currentReportMonth(),
    beginning_balance: 0,
    cash_receipts: 0,
    prepared_by: "",
    prepared_title: "",
    noted_by: "",
    noted_title: "",
    entries: Array.from({ length: 4 }, blankNutritionFinancialEntry)
  };
}

function menuDateLabel(value, options = {}) {
  const date = new Date(`${String(value || "")}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value || "";
  return date.toLocaleDateString("en-US", {
    month: options.short ? "short" : "long",
    day: "numeric",
    year: options.noYear ? undefined : "numeric"
  });
}

const MENU_CALENDAR_WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function monthCalendarCells(monthValue) {
  const [year, month] = String(monthValue || "").split("-").map(Number);
  if (!year || !month) return [];
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cellCount = Math.max(35, Math.ceil((firstWeekday + daysInMonth) / 7) * 7);
  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstWeekday + 1;
    const weekday = index % 7;
    const outside = day < 1 || day > daysInMonth;
    return {
      date: outside ? "" : `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      day: outside ? null : day,
      weekday,
      weekend: weekday === 0 || weekday === 6,
      outside
    };
  });
}

function holidayTypeLabel(type) {
  if (type === "regular") return "Regular Holiday";
  if (type === "special-working") return "Special Working Day";
  return "Special Non-Working Day";
}

function monthlyMenuCalendarMarkup(monthValue, recipes, entries = [], holidays = []) {
  const entryMap = new Map(entries.map(entry => [entry.meal_date, entry]));
  const holidayMap = new Map();
  holidays.forEach(item => {
    if (!holidayMap.has(item.date)) holidayMap.set(item.date, []);
    holidayMap.get(item.date).push(item);
  });
  const headings = MENU_CALENDAR_WEEKDAYS.map((weekday, index) => `<div class="menu-calendar-weekday${index === 0 || index === 6 ? " is-weekend" : ""}">${weekday}</div>`).join("");
  const cells = monthCalendarCells(monthValue).map(cell => {
    if (cell.outside) return `<div class="menu-calendar-cell is-outside${cell.weekend ? " is-weekend" : ""}" aria-hidden="true"></div>`;
    const dayHolidays = holidayMap.get(cell.date) || [];
    const holidayMarkup = dayHolidays.map(item => `<span class="menu-calendar-holiday ${escapeHtml(item.type)}" title="${escapeHtml(`${holidayTypeLabel(item.type)} | ${item.source || "Philippine national holiday"}`)}"><i></i>${escapeHtml(item.name)}</span>`).join("");
    const dateHeading = `<header class="menu-calendar-date"><time datetime="${cell.date}">${cell.day}</time><span>${MENU_CALENDAR_WEEKDAYS[cell.weekday].slice(0, 3)}</span></header>`;
    if (cell.weekend) {
      return `<article class="menu-calendar-cell is-weekend${dayHolidays.length ? " has-holiday" : ""}">${dateHeading}<div class="menu-calendar-holidays">${holidayMarkup}</div><span class="menu-calendar-weekend-label">Weekend</span></article>`;
    }
    const entry = entryMap.get(cell.date) || {};
    return `<article class="menu-calendar-cell is-feeding-day${entry.recipe_id ? " has-event" : ""}${dayHolidays.length ? " has-holiday" : ""}" data-menu-day="${cell.date}">
      ${dateHeading}
      <div class="menu-calendar-holidays">${holidayMarkup}</div>
      <div class="menu-calendar-event"><select data-menu-recipe aria-label="Recipe for ${escapeHtml(menuDateLabel(cell.date))}">${menuRecipeOptions(recipes, entry.recipe_id)}</select><input data-menu-note value="${escapeHtml(entry.notes || "")}" placeholder="Event note" aria-label="Event note for ${escapeHtml(menuDateLabel(cell.date))}"></div>
    </article>`;
  }).join("");
  return `<div class="monthly-menu-calendar" data-menu-calendar data-calendar-month="${escapeHtml(monthValue)}">${headings}${cells}</div>`;
}

function collectRenderedMenuEntries(scope = document) {
  return [...scope.querySelectorAll("[data-menu-day]")].map(day => {
    const select = day.querySelector("[data-menu-recipe]");
    return {
      meal_date: day.dataset.menuDay,
      recipe_id: select.value,
      meal_name: select.selectedOptions[0]?.dataset.recipeName || "",
      notes: day.querySelector("[data-menu-note]").value
    };
  }).filter(entry => entry.recipe_id && entry.meal_name);
}

function renderNutritionWorkspaceTabs(active = "menus") {
  return `<nav class="nutrition-workspace-tabs" aria-label="Menu planning views">
    <button type="button" class="${active === "menus" ? "active" : ""}" data-menu-workspace="menus">Monthly Menus</button>
    <button type="button" class="${active === "costings" ? "active" : ""}" data-menu-workspace="costings">Weekly Costings</button>
  </nav>`;
}

function bindNutritionWorkspaceTabs(scope = document) {
  scope.querySelectorAll("[data-menu-workspace]").forEach(button => {
    button.addEventListener("click", () => navigate("nutrition-menu", button.dataset.menuWorkspace === "costings" ? "costings" : ""));
  });
}

async function renderNutritionRecipePage(id = "") {
  if (id === "new" || id.startsWith("edit-")) {
    await renderNutritionRecipeEditor(id === "new" ? 0 : Number(id.slice(5)));
    return;
  }

  setTitle("Nutrition Recipe Book");
  setTopbarActions([
    { id: "nutritionRecipeNew", label: "Add Recipe", icon: "plus", variant: "primary", onClick: () => navigate("nutrition-recipes", "new") }
  ]);
  const payload = await api("/api/nutrition/recipes?limit=500");
  elements.pageRoot.innerHTML = `
    <section class="nutrition-reference-hero">
      <div><p class="eyebrow">Nutrition Program</p><h2>Recipe Book</h2><span>Ingredient references used to prepare weekly menu costing sheets.</span></div>
      <div class="nutrition-reference-stat"><strong>${Number(payload.total || 0)}</strong><span>active recipes</span></div>
    </section>
    <section class="database-page nutrition-page flow-data-section menu-data-section">
      <div class="table-toolbar">
        <div class="search-band compact with-button">
          <span class="search-icon">${icon("search")}</span>
          <input id="nutritionRecipeSearch" type="search" placeholder="Search recipes or descriptions">
          <button id="nutritionRecipeSearchButton" type="button" class="action-button">${icon("search")}<span>Search</span></button>
        </div>
        <div class="table-toolbar-footer"><span>Recipes remain editable while generated costings keep their own historical ingredient snapshot.</span><span id="nutritionRecipeCount" class="table-count"></span></div>
      </div>
      <div id="nutritionRecipeList"></div>
    </section>`;

  function renderList(recipes, total) {
    document.getElementById("nutritionRecipeCount").textContent = `${total} recipe${total === 1 ? "" : "s"}`;
    const host = document.getElementById("nutritionRecipeList");
    host.innerHTML = recipes.length ? `<div class="recipe-catalog">
      ${recipes.map(recipe => `<button type="button" class="recipe-catalog-row" data-recipe-edit="${recipe.id}">
        <span class="recipe-index">${String(recipe.recipe_name || "R").slice(0, 1).toUpperCase()}</span>
        <span class="recipe-catalog-copy"><strong>${escapeHtml(recipe.recipe_name)}</strong><small>${escapeHtml(recipe.description || `${recipe.ingredient_count} ingredient${Number(recipe.ingredient_count) === 1 ? "" : "s"}`)}</small></span>
        <span class="recipe-cost-reference"><small>Reference cost</small><strong>${escapeHtml(formatMoney(recipe.budget_cost))}</strong></span>
        <span class="recipe-catalog-arrow">${icon("arrow")}</span>
      </button>`).join("")}
    </div>` : emptyState("No recipes match this search.");
    host.querySelectorAll("[data-recipe-edit]").forEach(button => button.addEventListener("click", () => navigate("nutrition-recipes", `edit-${button.dataset.recipeEdit}`)));
  }

  async function searchRecipes() {
    const search = document.getElementById("nutritionRecipeSearch").value.trim();
    const next = await api(`/api/nutrition/recipes?limit=500&search=${encodeURIComponent(search)}`);
    renderList(next.recipes || [], Number(next.total || 0));
  }
  document.getElementById("nutritionRecipeSearchButton").addEventListener("click", () => searchRecipes().catch(error => showToast(error.message)));
  document.getElementById("nutritionRecipeSearch").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchRecipes().catch(error => showToast(error.message));
    }
  });
  renderList(payload.recipes || [], Number(payload.total || 0));
}

function recipeIngredientEditorRow(item = {}, index = 0) {
  return `<tr data-recipe-ingredient-row>
    <td><span class="row-order-badge">${index + 1}</span></td>
    <td><input data-recipe-item="ingredient_name" value="${escapeHtml(item.ingredient_name || "")}" placeholder="Ingredient"></td>
    <td><input data-recipe-item="default_quantity" value="${escapeHtml(item.default_quantity || "")}" placeholder="e.g. 2 kg"></td>
    <td><input data-recipe-item="default_cost" type="number" min="0" step="0.01" value="${Number(item.default_cost || 0) || ""}" placeholder="0.00"></td>
    <td><button type="button" class="icon-button danger" title="Remove ingredient" data-remove-recipe-item>${icon("bin")}</button></td>
  </tr>`;
}

function bindRecipeIngredientRows() {
  const body = document.querySelector("[data-recipe-ingredients]");
  body?.querySelectorAll("[data-remove-recipe-item]").forEach(button => button.addEventListener("click", () => {
    button.closest("tr")?.remove();
    [...body.querySelectorAll("tr")].forEach((row, index) => { row.querySelector(".row-order-badge").textContent = index + 1; });
  }));
}

async function renderNutritionRecipeEditor(id = 0) {
  const recipe = id ? (await api(`/api/nutrition/recipes/${id}`)).recipe : {
    recipe_name: "", description: "", base_servings: "", status: "Active", ingredients: [{}]
  };
  setTitle(id ? "Edit Nutrition Recipe" : "Add Nutrition Recipe");
  setTopbarActions([
    { id: "nutritionRecipeBack", label: "Recipe Book", icon: "arrow", onClick: () => navigate("nutrition-recipes") },
    { id: "nutritionRecipeSave", label: "Save Recipe", icon: "save", variant: "primary", onClick: () => saveNutritionRecipe().catch(error => showToast(error.message)) },
    ...(id ? [{ id: "nutritionRecipeDelete", label: "Delete", icon: "bin", variant: "danger", onClick: () => deleteNutritionRecipe(id).catch(error => showToast(error.message)) }] : [])
  ]);
  elements.pageRoot.innerHTML = `
    <section class="paper-form menu-editor-shell" data-recipe-id="${Number(recipe.id || 0)}">
      <header class="menu-editor-heading"><div><p class="eyebrow">Recipe Reference</p><h2>${escapeHtml(recipe.recipe_name || "New Recipe")}</h2><span>Set the standard ingredients and budget quantities copied into future costing sheets.</span></div></header>
      <div class="paper-grid menu-editor-meta">
        <label class="paper-field wide"><span>Viand / Recipe Name</span><input id="nutritionRecipeName" value="${escapeHtml(recipe.recipe_name || "")}" required></label>
        <label class="paper-field"><span>Base Servings</span><input id="nutritionRecipeServings" type="number" min="0" step="1" value="${Number(recipe.base_servings || 0) || ""}"></label>
        <label class="paper-field"><span>Status</span><select id="nutritionRecipeStatus"><option${recipe.status === "Active" ? " selected" : ""}>Active</option><option${recipe.status === "Inactive" ? " selected" : ""}>Inactive</option></select></label>
        <label class="paper-field wide"><span>Description / Notes</span><textarea id="nutritionRecipeDescription" rows="2">${escapeHtml(recipe.description || "")}</textarea></label>
      </div>
      <section class="menu-ingredient-editor">
        <div class="section-heading-row"><div><span>Standard Recipe</span><h3>Ingredients and budget references</h3></div><button id="addRecipeIngredient" type="button" class="action-button">${icon("plus")}<span>Add Ingredient</span></button></div>
        <div class="data-table-scroll"><table class="family-table recipe-ingredient-table"><thead><tr><th>#</th><th>Ingredient</th><th>Budget Quantity</th><th>Budget Cost</th><th></th></tr></thead><tbody data-recipe-ingredients>${(recipe.ingredients?.length ? recipe.ingredients : [{}]).map(recipeIngredientEditorRow).join("")}</tbody></table></div>
      </section>
    </section>`;
  document.getElementById("addRecipeIngredient").addEventListener("click", () => {
    const body = document.querySelector("[data-recipe-ingredients]");
    body.insertAdjacentHTML("beforeend", recipeIngredientEditorRow({}, body.children.length));
    bindRecipeIngredientRows();
    body.lastElementChild?.querySelector("input")?.focus();
  });
  bindRecipeIngredientRows();
}

function collectNutritionRecipe() {
  return {
    id: Number(document.querySelector("[data-recipe-id]")?.dataset.recipeId || 0),
    recipe_name: document.getElementById("nutritionRecipeName").value,
    description: document.getElementById("nutritionRecipeDescription").value,
    base_servings: document.getElementById("nutritionRecipeServings").value,
    status: document.getElementById("nutritionRecipeStatus").value,
    ingredients: [...document.querySelectorAll("[data-recipe-ingredient-row]")].map(row => ({
      ingredient_name: row.querySelector('[data-recipe-item="ingredient_name"]').value,
      default_quantity: row.querySelector('[data-recipe-item="default_quantity"]').value,
      default_cost: row.querySelector('[data-recipe-item="default_cost"]').value
    }))
  };
}

async function saveNutritionRecipe() {
  const payload = await api("/api/nutrition/recipes", { method: "POST", body: JSON.stringify(collectNutritionRecipe()), loadingMessage: "Saving recipe" });
  showToast("Recipe saved.");
  navigate("nutrition-recipes", `edit-${payload.recipe.id}`);
}

async function deleteNutritionRecipe(id) {
  if (!window.confirm("Delete this recipe? Existing costing sheets will keep their saved ingredient snapshot.")) return;
  await api(`/api/nutrition/recipes/${id}`, { method: "DELETE", loadingMessage: "Deleting recipe" });
  showToast("Recipe deleted.");
  navigate("nutrition-recipes");
}

async function renderNutritionMenuPage(id = "") {
  if (id === "menu-new" || id.startsWith("menu-")) {
    await renderNutritionMonthlyMenuEditor(id === "menu-new" ? 0 : Number(id.slice(5)));
    return;
  }
  if (id.startsWith("costing-")) {
    await renderNutritionCostingEditor(Number(id.slice(8)));
    return;
  }
  if (id === "costings") {
    await renderNutritionCostingList();
    return;
  }
  await renderNutritionMonthlyMenuList();
}

async function renderNutritionMonthlyMenuList() {
  const paginationKey = "nutrition-monthly-menus";
  state.tablePages[paginationKey] = 1;
  const payload = await api(`/api/nutrition/menus?limit=${MONTHLY_MENU_PAGE_SIZE}&offset=0`);
  const initialPageInfo = remotePageInfo(payload.total, paginationKey, MONTHLY_MENU_PAGE_SIZE);
  setTitle("Nutrition Menu Planning");
  setTopbarActions([
    { id: "nutritionMenuNew", label: "New Monthly Menu", icon: "plus", variant: "primary", onClick: () => navigate("nutrition-menu", "menu-new") }
  ]);
  elements.pageRoot.innerHTML = `
    ${renderNutritionWorkspaceTabs("menus")}
    <section class="nutrition-reference-hero menu-planning-hero">
      <div><p class="eyebrow">Program-wide Planning</p><h2>Monthly menus create the weekly work</h2><span>Choose recipes for feeding days, then the app prepares center costing sheets with ingredients and released budgets.</span></div>
      <div class="menu-generation-path" aria-label="Generation sequence"><span>Menu</span>${icon("arrow")}<span>Recipe</span>${icon("arrow")}<span>9 Center Costings</span></div>
    </section>
    <section class="database-page nutrition-page flow-data-section menu-data-section">
      <div class="table-toolbar"><div class="table-toolbar-footer"><span>Saved monthly menus</span><span id="nutritionMonthlyMenuCount" class="table-count"></span></div></div>
      <div id="nutritionMonthlyMenuLedger" class="monthly-menu-ledger"></div>
      <div id="nutritionMonthlyMenuPagination"></div>
    </section>`;
  bindNutritionWorkspaceTabs();

  function renderMenus(menus, pageInfo) {
    document.getElementById("nutritionMonthlyMenuCount").textContent = pageCountText(pageInfo, `month${pageInfo.total === 1 ? "" : "s"}`);
    const ledger = document.getElementById("nutritionMonthlyMenuLedger");
    ledger.innerHTML = menus.length ? menus.map(menu => `<button type="button" class="monthly-menu-row" data-menu-edit="${menu.id}">
      <span class="monthly-menu-month"><strong>${escapeHtml(reportMonthLabel(menu.menu_month))}</strong><small>${escapeHtml(menu.status || "Draft")}</small></span>
      <span class="monthly-menu-meals"><strong>${Number(menu.meal_count || 0)}</strong><small>feeding days</small></span>
      <span class="monthly-menu-updated"><small>Last updated</small><strong>${escapeHtml(String(menu.updated_at || "").slice(0, 10))}</strong></span>
      <span>${icon("arrow")}</span>
    </button>`).join("") : emptyState("No monthly menus yet. Add one to generate weekly costing sheets.");
    document.getElementById("nutritionMonthlyMenuPagination").innerHTML = renderPagination(paginationKey, pageInfo);
    ledger.querySelectorAll("[data-menu-edit]").forEach(button => button.addEventListener("click", () => navigate("nutrition-menu", `menu-${button.dataset.menuEdit}`)));
    bindPagination(document, paginationKey, () => loadMenus().catch(error => showToast(error.message)));
  }

  async function loadMenus() {
    const requestedPage = Math.max(Number(state.tablePages[paginationKey]) || 1, 1);
    const query = new URLSearchParams({
      limit: String(MONTHLY_MENU_PAGE_SIZE),
      offset: String((requestedPage - 1) * MONTHLY_MENU_PAGE_SIZE)
    });
    let next = await api(`/api/nutrition/menus?${query}`);
    const pageInfo = remotePageInfo(next.total, paginationKey, MONTHLY_MENU_PAGE_SIZE);
    if (pageInfo.page !== requestedPage) {
      query.set("offset", String(pageInfo.start));
      next = await api(`/api/nutrition/menus?${query}`);
    }
    renderMenus(next.menus || [], pageInfo);
  }

  renderMenus(payload.menus || [], initialPageInfo);
}

function menuRecipeOptions(recipes, selectedId = "") {
  return `<option value="">No meal scheduled</option>${recipes.map(recipe => `<option value="${recipe.id}" data-recipe-name="${escapeHtml(recipe.recipe_name)}"${Number(recipe.id) === Number(selectedId) ? " selected" : ""}>${escapeHtml(recipe.recipe_name)}</option>`).join("")}`;
}

async function renderNutritionMonthlyMenuEditor(id = 0) {
  const [recipesPayload, menuPayload] = await Promise.all([
    api("/api/nutrition/recipes?limit=500"),
    id ? api(`/api/nutrition/menus/${id}`) : Promise.resolve({ menu: null })
  ]);
  const recipes = recipesPayload.recipes || [];
  const menu = menuPayload.menu || { menu_month: currentReportMonth(), status: "Draft", notes: "", entries: [] };
  const initialYear = Number(String(menu.menu_month).slice(0, 4));
  const initialHolidayPayload = await api(`/api/calendar/philippine-holidays?year=${initialYear}`);
  const holidayCache = new Map([[initialYear, initialHolidayPayload.holidays || []]]);
  const entryDrafts = new Map([[menu.menu_month, menu.entries || []]]);
  const initialMonthHolidays = (initialHolidayPayload.holidays || []).filter(item => item.date.startsWith(`${menu.menu_month}-`));
  setTitle(id ? "Edit Monthly Menu" : "New Monthly Menu");
  setTopbarActions([
    { id: "nutritionMenuBack", label: "Monthly Menus", icon: "arrow", onClick: () => navigate("nutrition-menu") },
    { id: "nutritionMenuSave", label: "Save & Generate", icon: "save", variant: "primary", onClick: () => saveNutritionMonthlyMenu().catch(error => showToast(error.message)) },
    ...(id ? [{ id: "nutritionMenuRegenerate", label: "Regenerate Costings", icon: "refresh", onClick: () => regenerateNutritionCostings(id).catch(error => showToast(error.message)) }] : [])
  ]);
  elements.pageRoot.innerHTML = `
    <section class="paper-form menu-editor-shell" data-menu-id="${Number(menu.id || 0)}">
      <header class="menu-editor-heading"><div><p class="eyebrow">Monthly Feeding Calendar</p><h2>${escapeHtml(reportMonthLabel(menu.menu_month))}</h2><span>Assign a saved recipe to each feeding day. Saving prepares draft costing sheets for every feeding center.</span></div></header>
      <div class="paper-grid menu-editor-meta">
        <label class="paper-field"><span>Menu Month</span><input id="nutritionMenuMonth" type="month" value="${escapeHtml(menu.menu_month)}" required></label>
        <label class="paper-field"><span>Status</span><select id="nutritionMenuStatus"><option${menu.status === "Draft" ? " selected" : ""}>Draft</option><option${menu.status === "Final" ? " selected" : ""}>Final</option></select></label>
        <label class="paper-field wide"><span>Notes</span><textarea id="nutritionMenuNotes" rows="2">${escapeHtml(menu.notes || "")}</textarea></label>
      </div>
      <section class="monthly-menu-calendar-section">
        <div class="section-heading-row calendar-section-heading"><div><span>Sunday to Saturday</span><h3>Feeding Calendar</h3></div><div class="calendar-heading-tools"><div class="calendar-summary"><span>${recipes.length} recipes</span><span data-calendar-holiday-count>${initialMonthHolidays.length} national holiday${initialMonthHolidays.length === 1 ? "" : "s"}</span></div><div class="holiday-legend"><span class="regular"><i></i>Regular</span><span class="special-non-working"><i></i>Special non-working</span><span class="special-working"><i></i>Special working</span></div></div></div>
        <div class="monthly-menu-calendar-frame">${monthlyMenuCalendarMarkup(menu.menu_month, recipes, menu.entries || [], initialHolidayPayload.holidays || [])}</div>
      </section>
    </section>`;

  function bindCalendarEvents() {
    document.querySelectorAll("[data-menu-recipe]").forEach(select => select.addEventListener("change", () => {
      select.closest(".menu-calendar-cell")?.classList.toggle("has-event", Boolean(select.value));
    }));
  }

  async function holidaysForMonth(monthValue) {
    const year = Number(String(monthValue).slice(0, 4));
    if (!holidayCache.has(year)) {
      const payload = await api(`/api/calendar/philippine-holidays?year=${year}`);
      holidayCache.set(year, payload.holidays || []);
    }
    return holidayCache.get(year) || [];
  }

  document.getElementById("nutritionMenuMonth").addEventListener("change", async event => {
    const currentCalendar = document.querySelector("[data-menu-calendar]");
    if (currentCalendar?.dataset.calendarMonth) {
      entryDrafts.set(currentCalendar.dataset.calendarMonth, collectRenderedMenuEntries(currentCalendar));
    }
    const nextMonth = event.target.value;
    if (!nextMonth) return;
    const frame = document.querySelector(".monthly-menu-calendar-frame");
    frame.classList.add("is-refreshing");
    try {
      const holidays = await holidaysForMonth(nextMonth);
      const monthHolidays = holidays.filter(item => item.date.startsWith(`${nextMonth}-`));
      frame.innerHTML = monthlyMenuCalendarMarkup(nextMonth, recipes, entryDrafts.get(nextMonth) || [], holidays);
      document.querySelector("[data-calendar-holiday-count]").textContent = `${monthHolidays.length} national holiday${monthHolidays.length === 1 ? "" : "s"}`;
      document.querySelector(".menu-editor-heading h2").textContent = reportMonthLabel(nextMonth);
      bindCalendarEvents();
    } catch (error) {
      showToast(error.message);
    } finally {
      frame.classList.remove("is-refreshing");
    }
  });
  bindCalendarEvents();
}

function collectNutritionMonthlyMenu() {
  return {
    id: Number(document.querySelector("[data-menu-id]")?.dataset.menuId || 0),
    menu_month: document.getElementById("nutritionMenuMonth").value,
    status: document.getElementById("nutritionMenuStatus").value,
    notes: document.getElementById("nutritionMenuNotes").value,
    entries: collectRenderedMenuEntries()
  };
}

async function saveNutritionMonthlyMenu() {
  const month = document.getElementById("nutritionMenuMonth").value;
  const renderedMonth = document.querySelector("[data-menu-day]")?.dataset.menuDay?.slice(0, 7) || month;
  if (month !== renderedMonth) {
    const current = collectNutritionMonthlyMenu();
    current.entries = [];
    const payload = await api("/api/nutrition/menus", { method: "POST", body: JSON.stringify(current), loadingMessage: "Creating monthly calendar" });
    navigate("nutrition-menu", `menu-${payload.menu.id}`);
    return;
  }
  const payload = await api("/api/nutrition/menus", { method: "POST", body: JSON.stringify(collectNutritionMonthlyMenu()), loadingMessage: "Saving menu and generating center costings" });
  showToast("Monthly menu saved and weekly costing drafts generated.");
  navigate("nutrition-menu", `menu-${payload.menu.id}`);
}

async function regenerateNutritionCostings(id) {
  const payload = await api(`/api/nutrition/menus/${id}/generate`, { method: "POST", loadingMessage: "Refreshing weekly costing drafts" });
  showToast(`${Number(payload.generated || 0)} draft costing sheet${Number(payload.generated) === 1 ? "" : "s"} refreshed.`);
}

async function renderNutritionCostingList() {
  const paginationKey = "nutrition-weekly-costings";
  state.tablePages[paginationKey] = 1;
  const [centers, payload] = await Promise.all([loadNutritionCenters(), api(`/api/nutrition/costings?limit=${WEEKLY_COSTING_PAGE_SIZE}&offset=0`)]);
  const initialPageInfo = remotePageInfo(payload.total, paginationKey, WEEKLY_COSTING_PAGE_SIZE);
  setTitle("Weekly Menu Costing");
  setTopbarActions([{ id: "nutritionCostingMenus", label: "Monthly Menus", icon: "table", onClick: () => navigate("nutrition-menu") }]);
  elements.pageRoot.innerHTML = `
    ${renderNutritionWorkspaceTabs("costings")}
    <section class="nutrition-reference-hero costing-hero"><div><p class="eyebrow">Center Coordinator Workspace</p><h2>Budget released, actual cost recorded</h2><span>Each draft is generated from the monthly menu and its linked recipes.</span></div><div class="nutrition-reference-stat"><strong>${Number(payload.total || 0)}</strong><span>weekly sheets</span></div></section>
    <section class="database-page nutrition-page flow-data-section menu-data-section">
      <div class="table-toolbar">
        <div class="menu-costing-filters">
          <div class="search-band compact"><span class="search-icon">${icon("search")}</span><input id="nutritionCostingSearch" type="search" placeholder="Search center or status"></div>
          <label><span>Month</span><input id="nutritionCostingMonth" type="month"></label>
          <label><span>Feeding Center</span><select id="nutritionCostingCenter"><option value="">All Centers</option>${centers.map(center => `<option value="${center.id}">${escapeHtml(center.center_name)}</option>`).join("")}</select></label>
          <button id="nutritionCostingFilter" type="button" class="action-button">${icon("search")}<span>Apply</span></button>
        </div>
        <div class="table-toolbar-footer"><span>Generated weekly center costing sheets</span><span id="nutritionCostingCount" class="table-count"></span></div>
      </div>
      <div id="nutritionCostingTable"></div>
      <div id="nutritionCostingPagination"></div>
    </section>`;
  bindNutritionWorkspaceTabs();

  function renderTable(costings, pageInfo) {
    document.getElementById("nutritionCostingCount").textContent = pageCountText(pageInfo, `sheet${pageInfo.total === 1 ? "" : "s"}`);
    const host = document.getElementById("nutritionCostingTable");
    host.innerHTML = costings.length ? `<div class="data-table-scroll"><table class="data-table menu-costing-table"><thead><tr><th>Actions</th><th>Week</th><th>Center</th><th>Days</th><th>Budget Released</th><th>Actual Cost</th><th>Actual Balance</th><th>Status</th></tr></thead><tbody>${costings.map(costing => `<tr><td><div class="table-actions"><button type="button" class="icon-button" title="Edit costing" data-costing-edit="${costing.id}">${icon("edit")}</button><button type="button" class="icon-button" title="Print costing" data-costing-print="${costing.id}">${icon("print")}</button></div></td><td>${escapeHtml(menuDateLabel(costing.week_start, { short: true }))}<br><small>to ${escapeHtml(menuDateLabel(costing.week_end, { short: true }))}</small></td><td>${escapeHtml(costing.center_name)}</td><td>${Number(costing.day_count || 0)}</td><td>${escapeHtml(formatMoney(costing.budget_released))}</td><td>${escapeHtml(formatMoney(costing.actual_food_total))}</td><td>${escapeHtml(formatMoney(costing.actual_balance))}</td><td><span class="status-chip ${String(costing.status).toLowerCase()}">${escapeHtml(costing.status)}</span></td></tr>`).join("")}</tbody></table></div>` : emptyState("No weekly costing sheets match these filters.");
    document.getElementById("nutritionCostingPagination").innerHTML = renderPagination(paginationKey, pageInfo);
    host.querySelectorAll("[data-costing-edit]").forEach(button => button.addEventListener("click", () => navigate("nutrition-menu", `costing-${button.dataset.costingEdit}`)));
    host.querySelectorAll("[data-costing-print]").forEach(button => button.addEventListener("click", async () => {
      try {
        const result = await api(`/api/nutrition/costings/${button.dataset.costingPrint}`);
        printNutritionMenuCosting(result.costing);
      } catch (error) { showToast(error.message); }
    }));
    bindPagination(document, paginationKey, () => loadCostings().catch(error => showToast(error.message)));
  }
  async function loadCostings(resetPage = false) {
    if (resetPage) state.tablePages[paginationKey] = 1;
    const requestedPage = Math.max(Number(state.tablePages[paginationKey]) || 1, 1);
    const query = new URLSearchParams({
      limit: String(WEEKLY_COSTING_PAGE_SIZE),
      offset: String((requestedPage - 1) * WEEKLY_COSTING_PAGE_SIZE)
    });
    const search = document.getElementById("nutritionCostingSearch").value.trim();
    const month = document.getElementById("nutritionCostingMonth").value;
    const centerId = document.getElementById("nutritionCostingCenter").value;
    if (search) query.set("search", search);
    if (month) query.set("month", month);
    if (centerId) query.set("centerId", centerId);
    let next = await api(`/api/nutrition/costings?${query}`);
    const pageInfo = remotePageInfo(next.total, paginationKey, WEEKLY_COSTING_PAGE_SIZE);
    if (pageInfo.page !== requestedPage) {
      query.set("offset", String(pageInfo.start));
      next = await api(`/api/nutrition/costings?${query}`);
    }
    renderTable(next.costings || [], pageInfo);
  }
  document.getElementById("nutritionCostingFilter").addEventListener("click", () => loadCostings(true).catch(error => showToast(error.message)));
  document.getElementById("nutritionCostingSearch").addEventListener("keydown", event => {
    if (event.key === "Enter") { event.preventDefault(); loadCostings(true).catch(error => showToast(error.message)); }
  });
  renderTable(payload.costings || [], initialPageInfo);
}

function costingDayEditor(day, dayIndex) {
  return `<article class="costing-day-card" data-costing-day data-meal-date="${escapeHtml(day.meal_date)}" data-recipe-id="${Number(day.recipe_id || 0)}">
    <header><div><span>${escapeHtml(new Date(`${day.meal_date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" }))}</span><h3>${escapeHtml(day.meal_name)}</h3><small>${escapeHtml(menuDateLabel(day.meal_date))}</small></div><label><span>Kids Present</span><input data-costing-day-field="kids_present" type="number" min="0" step="1" value="${Number(day.kids_present || 0) || ""}"></label></header>
    <div class="data-table-scroll"><table class="family-table costing-entry-table"><thead><tr><th rowspan="2">Ingredient</th><th colspan="2">Budget Released</th><th colspan="2">Actual</th></tr><tr><th>Quantity</th><th>Cost</th><th>Quantity</th><th>Cost</th></tr></thead><tbody>${(day.items || []).map((item, itemIndex) => `<tr data-costing-item data-recipe-ingredient-id="${Number(item.recipe_ingredient_id || 0)}"><th><input data-costing-item-field="ingredient_name" value="${escapeHtml(item.ingredient_name || "")}" readonly></th><td><input data-costing-item-field="budget_quantity" value="${escapeHtml(item.budget_quantity || "")}" readonly></td><td><input data-costing-item-field="budget_cost" type="number" value="${Number(item.budget_cost || 0) || ""}" readonly></td><td><input data-costing-item-field="actual_quantity" value="${escapeHtml(item.actual_quantity || "")}" placeholder="Enter actual"></td><td><input data-costing-item-field="actual_cost" type="number" min="0" step="0.01" value="${Number(item.actual_cost || 0) || ""}" placeholder="0.00"></td></tr>`).join("") || `<tr><td colspan="5">No recipe ingredients are linked to this menu item.</td></tr>`}</tbody><tfoot><tr><th>Total</th><td></td><td data-day-budget-total></td><td></td><td data-day-actual-total></td></tr></tfoot></table></div>
  </article>`;
}

async function renderNutritionCostingEditor(id) {
  const costing = (await api(`/api/nutrition/costings/${id}`)).costing;
  setTitle("Weekly Menu Costing Editor");
  setTopbarActions([
    { id: "nutritionCostingBack", label: "Weekly Costings", icon: "arrow", onClick: () => navigate("nutrition-menu", "costings") },
    { id: "nutritionCostingPrint", label: "Print", icon: "print", onClick: () => printNutritionMenuCosting(collectNutritionCosting()) },
    { id: "nutritionCostingSave", label: "Save Costing", icon: "save", variant: "primary", onClick: () => saveNutritionCosting().catch(error => showToast(error.message)) }
  ]);
  elements.pageRoot.innerHTML = `
    <section class="paper-form menu-editor-shell costing-editor-shell" data-costing-id="${costing.id}" data-center-id="${costing.center_id}" data-menu-id="${costing.menu_id || ""}" data-report-month="${escapeHtml(costing.report_month)}" data-week-start="${escapeHtml(costing.week_start)}" data-week-end="${escapeHtml(costing.week_end)}">
      <header class="menu-editor-heading costing-editor-heading"><div><p class="eyebrow">${escapeHtml(costing.center_name)}</p><h2>Menu Costing for ${escapeHtml(reportMonthLabel(costing.report_month))}</h2><span>${escapeHtml(menuDateLabel(costing.week_start))} to ${escapeHtml(menuDateLabel(costing.week_end))}</span></div><div class="costing-budget-display"><span>Budget Released</span><strong>${escapeHtml(formatMoney(costing.budget_released))}</strong></div></header>
      <div class="paper-grid costing-editor-meta">
        <label class="paper-field"><span>No. of Children</span><input id="costingChildren" type="number" min="0" step="1" value="${Number(costing.no_children || 0)}"></label>
        <label class="paper-field"><span>Status</span><select id="costingStatus"><option${costing.status === "Draft" ? " selected" : ""}>Draft</option><option${costing.status === "Submitted" ? " selected" : ""}>Submitted</option></select></label>
        <label class="paper-field"><span>Rice Inventory</span><input id="costingRice" type="number" min="0" step="0.01" value="${Number(costing.inventory_rice || 0) || ""}"></label>
        <label class="paper-field"><span>Manna Pack Inventory</span><input id="costingManna" type="number" min="0" step="0.01" value="${Number(costing.inventory_manna || 0) || ""}"></label>
        <label class="paper-field"><span>Vitameals Inventory</span><input id="costingVitameals" type="number" min="0" step="0.01" value="${Number(costing.inventory_vitameals || 0) || ""}"></label>
        <label class="paper-field"><span>Budget Released</span><input id="costingBudgetReleased" type="number" min="0" step="0.01" value="${Number(costing.budget_released || 0)}" readonly></label>
        <label class="paper-field wide"><span>Notes</span><textarea id="costingNotes" rows="2">${escapeHtml(costing.notes || "")}</textarea></label>
      </div>
      <section class="weekly-costing-days"><div class="section-heading-row"><div><span>Weekly Actual Entry</span><h3>Viands and ingredients</h3></div><div class="weekly-costing-live-summary"><span>Budget ingredients <strong id="costingBudgetFoodTotal"></strong></span><span>Actual ingredients <strong id="costingActualFoodTotal"></strong></span><span>Balance <strong id="costingActualBalance"></strong></span></div></div><div class="costing-day-grid">${(costing.days || []).map(costingDayEditor).join("")}</div></section>
    </section>`;
  document.querySelectorAll('[data-costing-item-field="actual_cost"], #costingBudgetReleased').forEach(input => input.addEventListener("input", updateCostingEditorTotals));
  updateCostingEditorTotals();
}

function collectNutritionCosting() {
  const shell = document.querySelector("[data-costing-id]");
  return {
    id: Number(shell.dataset.costingId), center_id: Number(shell.dataset.centerId), menu_id: Number(shell.dataset.menuId || 0) || null,
    report_month: shell.dataset.reportMonth, week_start: shell.dataset.weekStart, week_end: shell.dataset.weekEnd,
    no_children: document.getElementById("costingChildren").value,
    inventory_rice: document.getElementById("costingRice").value,
    inventory_manna: document.getElementById("costingManna").value,
    inventory_vitameals: document.getElementById("costingVitameals").value,
    budget_released: document.getElementById("costingBudgetReleased").value,
    status: document.getElementById("costingStatus").value,
    notes: document.getElementById("costingNotes").value,
    center_name: document.querySelector(".costing-editor-heading .eyebrow")?.textContent || "",
    days: [...document.querySelectorAll("[data-costing-day]")].map(day => ({
      meal_date: day.dataset.mealDate,
      recipe_id: Number(day.dataset.recipeId || 0) || null,
      meal_name: day.querySelector("h3")?.textContent || "",
      kids_present: day.querySelector('[data-costing-day-field="kids_present"]').value,
      items: [...day.querySelectorAll("[data-costing-item]")].map(item => ({
        recipe_ingredient_id: Number(item.dataset.recipeIngredientId || 0) || null,
        ingredient_name: item.querySelector('[data-costing-item-field="ingredient_name"]').value,
        budget_quantity: item.querySelector('[data-costing-item-field="budget_quantity"]').value,
        budget_cost: item.querySelector('[data-costing-item-field="budget_cost"]').value,
        actual_quantity: item.querySelector('[data-costing-item-field="actual_quantity"]').value,
        actual_cost: item.querySelector('[data-costing-item-field="actual_cost"]').value
      }))
    }))
  };
}

function updateCostingEditorTotals() {
  let budget = 0;
  let actual = 0;
  document.querySelectorAll("[data-costing-day]").forEach(day => {
    const dayBudget = [...day.querySelectorAll('[data-costing-item-field="budget_cost"]')].reduce((sum, input) => sum + financialAmount(input.value), 0);
    const dayActual = [...day.querySelectorAll('[data-costing-item-field="actual_cost"]')].reduce((sum, input) => sum + financialAmount(input.value), 0);
    day.querySelector("[data-day-budget-total]").textContent = formatMoney(dayBudget);
    day.querySelector("[data-day-actual-total]").textContent = formatMoney(dayActual);
    budget += dayBudget;
    actual += dayActual;
  });
  const released = financialAmount(document.getElementById("costingBudgetReleased")?.value);
  document.getElementById("costingBudgetFoodTotal").textContent = formatMoney(budget);
  document.getElementById("costingActualFoodTotal").textContent = formatMoney(actual);
  document.getElementById("costingActualBalance").textContent = formatMoney(released - actual);
}

async function saveNutritionCosting() {
  const result = await api("/api/nutrition/costings", { method: "POST", body: JSON.stringify(collectNutritionCosting()), loadingMessage: "Saving weekly costing" });
  showToast("Weekly costing saved.");
  navigate("nutrition-menu", `costing-${result.costing.id}`);
}

function nutritionCostingPrintDocument(costing) {
  const budgetFoodTotal = (costing.days || []).reduce((sum, day) => sum + (day.items || []).reduce((daySum, item) => daySum + financialAmount(item.budget_cost), 0), 0);
  const actualFoodTotal = (costing.days || []).reduce((sum, day) => sum + (day.items || []).reduce((daySum, item) => daySum + financialAmount(item.actual_cost), 0), 0);
  const released = financialAmount(costing.budget_released);
  const body = `<div class="meta"><div><span>Feeding Center</span><strong>${escapeHtml(costing.center_name || "")}</strong></div><div><span>Week</span><strong>${escapeHtml(menuDateLabel(costing.week_start, { short: true }))} - ${escapeHtml(menuDateLabel(costing.week_end, { short: true }))}</strong></div><div><span>No. of Children</span><strong>${Number(costing.no_children || 0)}</strong></div><div><span>Budget Released</span><strong>${escapeHtml(formatMoney(released))}</strong></div></div>
    <div class="print-inventory"><span>Rice Inventory <strong>${Number(costing.inventory_rice || 0)}</strong></span><span>Manna Pack <strong>${Number(costing.inventory_manna || 0)}</strong></span><span>Vitameals <strong>${Number(costing.inventory_vitameals || 0)}</strong></span></div>
    <div class="print-costing-grid">${(costing.days || []).map(day => `<section class="print-costing-day"><header><strong>${escapeHtml(day.meal_name)}</strong><span>${escapeHtml(menuDateLabel(day.meal_date, { short: true }))} | ${Number(day.kids_present || 0)} kids</span></header><table><thead><tr><th rowspan="2">Ingredient</th><th colspan="2">Budget Released</th><th colspan="2">Actual</th></tr><tr><th>Qty.</th><th>Cost</th><th>Qty.</th><th>Cost</th></tr></thead><tbody>${(day.items || []).map(item => `<tr><td>${escapeHtml(item.ingredient_name || "")}</td><td>${escapeHtml(item.budget_quantity || "")}</td><td class="number">${financialPlainAmount(item.budget_cost)}</td><td>${escapeHtml(item.actual_quantity || "")}</td><td class="number">${financialPlainAmount(item.actual_cost)}</td></tr>`).join("")}</tbody><tfoot><tr><th colspan="2">Total</th><td class="number">${financialPlainAmount((day.items || []).reduce((sum, item) => sum + financialAmount(item.budget_cost), 0))}</td><td></td><td class="number">${financialPlainAmount((day.items || []).reduce((sum, item) => sum + financialAmount(item.actual_cost), 0))}</td></tr></tfoot></table></section>`).join("")}</div>
    <table class="print-costing-summary"><tbody><tr><th>Weekly Budget Released</th><td>${financialPlainAmount(released)}</td><th>Budget Ingredient Total</th><td>${financialPlainAmount(budgetFoodTotal)}</td><th>Actual Ingredient Total</th><td>${financialPlainAmount(actualFoodTotal)}</td><th>Actual Balance</th><td>${financialPlainAmount(released - actualFoodTotal)}</td></tr></tbody></table>`;
  const styles = `.print-inventory{display:flex;gap:18px;margin:0 0 8px;padding:6px 8px;background:#edf6f0;border:1px solid #b9cfc1;font-size:10px}.print-inventory span{flex:1}.print-costing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.print-costing-day{break-inside:avoid;border:1px solid #6f7d74}.print-costing-day header{display:flex;justify-content:space-between;gap:6px;padding:5px 7px;background:#dfeee5;color:#184c36;font-size:10px}.print-costing-day table{margin:0;border:0}.print-costing-day th,.print-costing-day td{font-size:10px;padding:2px 3px}.print-costing-day:nth-child(4){grid-column:1/2}.print-costing-day:nth-child(5){grid-column:2/3}.print-costing-summary{margin-top:8px}.print-costing-summary th,.print-costing-summary td{font-size:10px;padding:4px}`;
  return financialPrintDocument(`${costing.center_name || "Feeding Center"} - Weekly Menu Costing`, body, "letter landscape", styles);
}

function printNutritionMenuCosting(costing) {
  showDocumentPrintPreview(`Weekly Menu Costing - ${costing.center_name || "Feeding Center"}`, nutritionCostingPrintDocument(costing));
}

function financialAmount(value) {
  const number = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function financialPlainAmount(value, zero = "-") {
  const number = financialAmount(value);
  if (!number && zero) return zero;
  return number.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function financialCategoryLabel(key) {
  return NUTRITION_FINANCIAL_CATEGORIES.find(category => category.key === key)?.label || key;
}

function nutritionFinancialCenter(summary, centerId) {
  return (summary?.centers || []).find(center => Number(center.id) === Number(centerId)) || null;
}

async function loadNutritionFinancialSummary(year) {
  return api(`/api/nutrition/financial/summary?year=${encodeURIComponent(year)}`);
}

function renderNutritionFinancialAnalytics(summary, centerId = "") {
  const selectedCenter = centerId ? nutritionFinancialCenter(summary, centerId) : null;
  const centers = selectedCenter ? [selectedCenter] : (summary.centers || []);
  const reportCount = centers.reduce((sum, center) => sum + Number(center.reported_months || 0), 0);
  const activeKids = centers.reduce((sum, center) => sum + Number(center.active_kids || 0), 0);
  const capacity = centers.reduce((sum, center) => sum + Number(center.capacity || 0), 0);
  const actualByCategory = NUTRITION_FINANCIAL_CATEGORIES.map(category => ({
    label: category.label,
    count: centers.reduce((sum, center) => sum + Number(center.category_metrics?.[category.key]?.actual_total || 0), 0)
  }));
  const budgetByCategory = NUTRITION_FINANCIAL_CATEGORIES.map(category => ({
    label: category.label,
    count: centers.reduce((sum, center) => sum + Number(center.category_metrics?.[category.key]?.budget_monthly || 0), 0)
  }));
  const actualTotal = actualByCategory.reduce((sum, entry) => sum + entry.count, 0);
  const budgetMonthly = budgetByCategory.reduce((sum, entry) => sum + entry.count, 0);
  const actualMonthly = centers.reduce((sum, center) => {
    return sum + NUTRITION_FINANCIAL_CATEGORIES.reduce((categorySum, category) => (
      categorySum + Number(center.category_metrics?.[category.key]?.actual_monthly_average || 0)
    ), 0);
  }, 0);
  const variance = actualMonthly - budgetMonthly;

  return `
    <section class="database-analytics nutrition-analytics flow-analytics nutrition-flow-analytics financial-flow-analytics">
      <div class="analytics-title-row">
        <div>
          <span class="analytics-eyebrow">Nutrition Program Financial</span>
          <h3>${escapeHtml(selectedCenter?.center_name || "Program Financial Overview")}</h3>
        </div>
        <span class="analytics-note">${escapeHtml(summary.year)} | ${reportCount} monthly report${reportCount === 1 ? "" : "s"}</span>
      </div>
      <div class="analytics-kpi-grid analytics-signal-strip four-signals">
        ${renderAnalyticsKpi("Actual Expenses", formatMoney(actualTotal), "Year-to-date reports", "green")}
        ${renderAnalyticsKpi("Monthly Budget", formatMoney(budgetMonthly), "Current center plans", "blue")}
        ${renderAnalyticsKpi("Monthly Variance", formatMoney(variance), variance > 0 ? "Above budget" : "Within budget", variance > 0 ? "amber" : "green")}
        ${renderAnalyticsKpi("Children", `${activeKids} / ${capacity}`, "Active / center capacity", "violet")}
      </div>
      <div class="analytics-preview-grid flow-chart-grid">
        ${renderAnalyticsCard("Actual Spending by Category", "Saved monthly reports", renderBarList(actualByCategory, Math.max(actualTotal, 1), 7))}
        ${renderAnalyticsCard("Monthly Budget by Category", "Current annual setup", renderBarList(budgetByCategory, Math.max(budgetMonthly, 1), 7))}
      </div>
    </section>
  `;
}

async function renderNutritionFinancialPage(id = "") {
  const parsed = parseNutritionFinancialRouteId(id);
  if (parsed.mode === "budgets") {
    await renderNutritionFinancialBudgetPage();
    return;
  }
  if (parsed.mode !== "list") {
    await renderNutritionFinancialEditorPage(parsed.id, parsed.mode === "new");
    return;
  }

  const year = new Date().getFullYear();
  const [centers, reportsPayload, summary] = await Promise.all([
    loadNutritionCenters(),
    api(`/api/nutrition/financial/reports?year=${year}&limit=500`),
    loadNutritionFinancialSummary(year)
  ]);

  setTitle("Nutrition Financial");
  setTopbarActions([
    { id: "nutritionFinancialNew", label: "New Monthly Report", icon: "plus", variant: "primary", onClick: () => navigate("nutrition-budget", "new") },
    { id: "nutritionFinancialBudgets", label: "Budget Setup", icon: "finance", onClick: () => navigate("nutrition-budget", "budgets") }
  ]);

  elements.pageRoot.innerHTML = `
    <section class="financial-command-band">
      <div>
        <p class="eyebrow">Summary period</p>
        <h2>Financial reports and budget comparisons</h2>
      </div>
      <label>
        <span>Year</span>
        <input id="nutritionFinancialYear" type="number" min="2000" max="2100" value="${year}">
      </label>
      <label>
        <span>Feeding Center</span>
        <select id="nutritionFinancialCenterFilter">
          <option value="">All Centers</option>
          ${centers.map(center => `<option value="${center.id}">${escapeHtml(center.center_name)}</option>`).join("")}
        </select>
      </label>
      <div class="financial-command-actions">
        <button id="nutritionFinancialCenterSummary" type="button" class="action-button">${icon("print")}<span>Center Yearly</span></button>
        <button id="nutritionFinancialProgramSummary" type="button" class="action-button">${icon("print")}<span>Program Yearly</span></button>
      </div>
    </section>
    <div id="nutritionFinancialAnalyticsHost">${renderNutritionFinancialAnalytics(summary)}</div>
    <section class="database-page nutrition-page flow-data-section financial-data-section">
      <div class="table-toolbar">
        <div class="search-band compact with-button">
          <span class="search-icon">${icon("search")}</span>
          <input id="nutritionFinancialSearch" type="search" placeholder="Search center, month, or submission date">
          <button id="nutritionFinancialSearchButton" type="button" class="action-button">${icon("search")}<span>Search</span></button>
        </div>
        <div class="table-toolbar-footer">
          <div class="filter-summary"><span>Monthly financial summaries per feeding center</span></div>
          <span id="nutritionFinancialCount" class="table-count"></span>
        </div>
      </div>
      <div id="nutritionFinancialTableHost" class="database-table-host"></div>
    </section>
  `;

  async function refreshFinancialWorkspace() {
    const selectedYear = Number(document.getElementById("nutritionFinancialYear").value) || year;
    const centerId = document.getElementById("nutritionFinancialCenterFilter").value;
    const search = document.getElementById("nutritionFinancialSearch").value.trim();
    const query = new URLSearchParams({ year: String(selectedYear), limit: "500" });
    if (centerId) query.set("centerId", centerId);
    if (search) query.set("search", search);
    const [payload, nextSummary] = await Promise.all([
      api(`/api/nutrition/financial/reports?${query.toString()}`),
      loadNutritionFinancialSummary(selectedYear)
    ]);
    document.getElementById("nutritionFinancialAnalyticsHost").innerHTML = renderNutritionFinancialAnalytics(nextSummary, centerId);
    renderNutritionFinancialTable(payload.reports || [], payload.total || 0);
  }

  document.getElementById("nutritionFinancialSearchButton").addEventListener("click", () => refreshFinancialWorkspace().catch(error => showToast(error.message)));
  document.getElementById("nutritionFinancialSearch").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      refreshFinancialWorkspace().catch(error => showToast(error.message));
    }
  });
  document.getElementById("nutritionFinancialYear").addEventListener("change", () => refreshFinancialWorkspace().catch(error => showToast(error.message)));
  document.getElementById("nutritionFinancialCenterFilter").addEventListener("change", () => refreshFinancialWorkspace().catch(error => showToast(error.message)));
  document.getElementById("nutritionFinancialCenterSummary").addEventListener("click", () => {
    const centerId = document.getElementById("nutritionFinancialCenterFilter").value;
    if (!centerId) {
      showToast("Choose a feeding center for the center yearly summary.");
      return;
    }
    printNutritionFinancialCenterYearly(centerId, document.getElementById("nutritionFinancialYear").value).catch(error => showToast(error.message));
  });
  document.getElementById("nutritionFinancialProgramSummary").addEventListener("click", () => {
    printNutritionFinancialProgramYearly(document.getElementById("nutritionFinancialYear").value).catch(error => showToast(error.message));
  });

  renderNutritionFinancialTable(reportsPayload.reports || [], reportsPayload.total || 0);
}

function renderNutritionFinancialTable(reports = [], total = reports.length) {
  const count = document.getElementById("nutritionFinancialCount");
  if (count) count.textContent = `${total} report${total === 1 ? "" : "s"}`;
  const host = document.getElementById("nutritionFinancialTableHost");
  if (!host) return;
  if (!reports.length) {
    host.innerHTML = emptyState("No financial reports match this period and center.");
    return;
  }
  const pageInfo = pagedItems(reports, "nutritionFinancial");
  host.innerHTML = `
    <div class="data-table-scroll">
      <table class="data-table financial-report-table">
        <thead><tr><th class="sticky-column">Actions</th><th>Month</th><th>Feeding Center</th><th>Submitted</th><th>Lines</th><th>Cash Receipts</th><th>Expenses</th><th>Balance</th></tr></thead>
        <tbody>${pageInfo.items.map(report => `
          <tr>
            <td class="sticky-column"><div class="table-actions">
              <button type="button" class="icon-button" title="Edit" data-financial-edit-id="${report.id}">${icon("edit")}</button>
              <button type="button" class="icon-button" title="Print" data-financial-print-id="${report.id}">${icon("print")}</button>
            </div></td>
            <td>${escapeHtml(reportMonthLabel(report.report_month))}</td>
            <td>${escapeHtml(report.center_name || "")}</td>
            <td>${escapeHtml(report.submitted_date || "")}</td>
            <td>${escapeHtml(report.line_count || 0)}</td>
            <td>${escapeHtml(formatMoney(report.total_cash_receipts))}</td>
            <td>${escapeHtml(formatMoney(report.total_disbursements))}</td>
            <td class="${Number(report.balance) < 0 ? "financial-negative" : ""}">${escapeHtml(formatMoney(report.balance))}</td>
          </tr>
        `).join("")}</tbody>
      </table>
    </div>
    ${renderPagination("nutritionFinancial", pageInfo)}
  `;
  bindPagination(host, "nutritionFinancial", () => renderNutritionFinancialTable(reports, total));
  attachNutritionFinancialTableHandlers(host);
}

function attachNutritionFinancialTableHandlers(scope = document) {
  scope.querySelectorAll("[data-financial-edit-id]").forEach(button => {
    button.addEventListener("click", () => navigate("nutrition-budget", `edit-${button.dataset.financialEditId}`));
  });
  scope.querySelectorAll("[data-financial-print-id]").forEach(button => {
    button.addEventListener("click", async () => {
      try {
        const payload = await api(`/api/nutrition/financial/reports/${button.dataset.financialPrintId}`);
        printNutritionFinancialMonthly(payload.report);
      } catch (error) {
        showToast(error.message);
      }
    });
  });
}

async function renderNutritionFinancialBudgetPage() {
  const year = new Date().getFullYear();
  const [centers, payload, summary] = await Promise.all([
    loadNutritionCenters(),
    api(`/api/nutrition/financial/budgets?year=${year}`),
    loadNutritionFinancialSummary(year)
  ]);
  setTitle("Nutrition Financial Budget Setup");
  setTopbarActions([
    { id: "financialBudgetBack", label: "Financial", icon: "arrow", onClick: () => navigate("nutrition-budget") },
    { id: "financialBudgetSave", label: "Save Budgets", icon: "save", variant: "primary", onClick: () => saveNutritionFinancialBudgets().catch(error => showToast(error.message)) }
  ]);
  elements.pageRoot.innerHTML = `
    <section class="financial-budget-shell">
      <header class="financial-page-heading">
        <div><p class="eyebrow">Annual Budget Setup & Proposal</p><h2>Set the approved budget per child</h2><span>Actual spending is a reference only. The Program Officer sets the approved per-child limit for each operational year.</span></div>
        <label><span>Budget Year</span><input id="financialBudgetYear" type="number" min="2000" max="2100" value="${year}"></label>
      </header>
      <div class="financial-budget-guidance">
        <strong>How the limit works</strong>
        <span>Approved monthly center allowance = approved budget per child x center capacity x feeding days. Category allocations help shape the proposal but do not replace the Program Officer's approved amount.</span>
      </div>
      <div id="financialBudgetTableHost">${renderNutritionFinancialBudgetTable(centers, payload.budgets || [], summary, year)}</div>
    </section>
  `;
  document.getElementById("financialBudgetYear").addEventListener("change", async event => {
    try {
      const nextYear = Number(event.target.value) || year;
      const [nextPayload, nextSummary] = await Promise.all([
        api(`/api/nutrition/financial/budgets?year=${nextYear}`),
        loadNutritionFinancialSummary(nextYear)
      ]);
      document.getElementById("financialBudgetTableHost").innerHTML = renderNutritionFinancialBudgetTable(centers, nextPayload.budgets || [], nextSummary, nextYear);
      attachFinancialBudgetInputs();
    } catch (error) {
      showToast(error.message);
    }
  });
  attachFinancialBudgetInputs();
}

function renderNutritionFinancialBudgetTable(centers, budgets, summary, year) {
  const budgetMap = new Map(budgets.map(budget => [Number(budget.center_id), budget]));
  const summaryMap = new Map((summary?.centers || []).map(center => [Number(center.id), center]));
  return `
    <div class="financial-budget-centers">
      ${centers.map(center => {
        const budget = budgetMap.get(Number(center.id)) || { feeding_days: 22, approved_budget_per_child: 0 };
        const centerSummary = summaryMap.get(Number(center.id));
        const actualPerChild = Number(centerSummary?.budget_metrics?.actual_per_child || 0);
        const reportedMonths = Number(centerSummary?.reported_months || 0);
        return `<article class="financial-budget-center" data-financial-budget-row data-center-id="${center.id}" data-center-name="${escapeHtml(center.center_name)}" data-capacity="${Number(center.capacity || 0)}" data-active-kids="${Number(center.active_beneficiary_count || 0)}" data-year="${year}">
          <header class="financial-budget-center-heading">
            <div><span>Feeding Center</span><h3>${escapeHtml(center.center_name)}</h3></div>
            <span class="financial-budget-year-chip">${year} setup</span>
          </header>
          <div class="financial-budget-center-metrics">
            <div><span>Active Children</span><strong>${Number(center.active_beneficiary_count || 0)}</strong></div>
            <div><span>Center Capacity</span><strong>${Number(center.capacity || 0)}</strong></div>
            <div class="financial-actual-reference"><span>Actual Cost / Active Child</span><strong>${reportedMonths ? formatMoney(actualPerChild) : "No reports yet"}</strong><small>${reportedMonths} month${reportedMonths === 1 ? "" : "s"} filed in ${year}</small></div>
            <label><span>Feeding Days / Month</span><input type="number" min="1" step="1" data-budget-field="feeding_days" value="${Number(budget.feeding_days || 22)}"></label>
            <label class="financial-approved-input"><span>Approved Budget / Child / Day</span><input type="number" min="0" step="0.01" data-budget-field="approved_budget_per_child" value="${financialAmount(budget.approved_budget_per_child) || ""}"></label>
          </div>
          <div class="financial-budget-proposal-grid">
            <div class="financial-category-proposal">
              <div class="financial-budget-subheading"><div><span>Proposal Detail</span><h4>Monthly category allocations</h4></div><small>Use actual per-child costs as a reference.</small></div>
              <div class="data-table-scroll financial-budget-category-wrap">
                <table class="family-table financial-budget-category-table">
                  <thead><tr><th>Category</th><th>Actual / Active Child</th><th>Proposed Monthly Allocation</th></tr></thead>
                  <tbody>${NUTRITION_FINANCIAL_CATEGORIES.map(category => `<tr><th>${escapeHtml(category.label)}</th><td>${reportedMonths ? formatMoney(centerSummary?.category_metrics?.[category.key]?.actual_per_child || 0) : "-"}</td><td><input type="number" min="0" step="0.01" data-budget-field="${category.key}" value="${financialAmount(budget[category.key]) || ""}"></td></tr>`).join("")}</tbody>
                </table>
              </div>
            </div>
            <aside class="financial-budget-decision">
              <span class="financial-budget-decision-label">Approved Limit</span>
              <div><span>Per-day center allowance</span><strong data-budget-computed="approved_daily">-</strong></div>
              <div><span>Monthly center allowance</span><strong data-budget-computed="approved_monthly">-</strong></div>
              <div><span>Proposed allocation total</span><strong data-budget-computed="proposed_monthly">-</strong></div>
              <div><span>Allocation against limit</span><strong data-budget-computed="allocation_gap">-</strong></div>
              <label><span>Program Officer Notes</span><textarea rows="4" data-budget-field="notes">${escapeHtml(budget.notes || "")}</textarea></label>
            </aside>
          </div>
        </article>`;
      }).join("")}
    </div>
  `;
}

function attachFinancialBudgetInputs() {
  elements.pageRoot.querySelectorAll("[data-financial-budget-row] input, [data-financial-budget-row] textarea").forEach(input => input.addEventListener("input", updateNutritionFinancialBudgetRows));
  updateNutritionFinancialBudgetRows();
}

function updateNutritionFinancialBudgetRows() {
  elements.pageRoot.querySelectorAll("[data-financial-budget-row]").forEach(row => {
    const proposedMonthly = NUTRITION_FINANCIAL_CATEGORIES.reduce((sum, category) => sum + financialAmount(row.querySelector(`[data-budget-field="${category.key}"]`)?.value), 0);
    const days = Math.max(financialAmount(row.querySelector('[data-budget-field="feeding_days"]')?.value), 1);
    const capacity = Math.max(Number(row.dataset.capacity || 0), 0);
    const approvedPerChild = financialAmount(row.querySelector('[data-budget-field="approved_budget_per_child"]')?.value);
    const approvedDaily = approvedPerChild * capacity;
    const approvedMonthly = approvedDaily * days;
    const gap = proposedMonthly - approvedMonthly;
    row.querySelector('[data-budget-computed="approved_daily"]').textContent = formatMoney(approvedDaily);
    row.querySelector('[data-budget-computed="approved_monthly"]').textContent = formatMoney(approvedMonthly);
    row.querySelector('[data-budget-computed="proposed_monthly"]').textContent = formatMoney(proposedMonthly);
    const gapElement = row.querySelector('[data-budget-computed="allocation_gap"]');
    gapElement.textContent = approvedMonthly ? `${gap > 0 ? "+" : ""}${formatMoney(gap)} ${gap > 0 ? "over" : "remaining"}` : "Set approved amount";
    gapElement.classList.toggle("financial-negative", gap > 0 && approvedMonthly > 0);
  });
}

async function saveNutritionFinancialBudgets() {
  const year = Number(document.getElementById("financialBudgetYear").value) || new Date().getFullYear();
  const budgets = [...elements.pageRoot.querySelectorAll("[data-financial-budget-row]")].map(row => {
    const budget = { center_id: row.dataset.centerId, center_name: row.dataset.centerName, budget_year: year };
    row.querySelectorAll("[data-budget-field]").forEach(input => { budget[input.dataset.budgetField] = input.value; });
    return budget;
  });
  await api("/api/nutrition/financial/budgets", { method: "POST", body: JSON.stringify({ year, budgets }) });
  showToast("Financial budgets saved.");
}

async function renderNutritionFinancialEditorPage(id = "", isNew = false) {
  const [centers, report] = await Promise.all([
    loadNutritionCenters(),
    isNew ? Promise.resolve(blankNutritionFinancialReport()) : api(`/api/nutrition/financial/reports/${id}`).then(payload => payload.report)
  ]);
  state.currentNutritionFinancialReport = report;
  setTitle(isNew ? "New Monthly Financial Report" : "Monthly Financial Report");
  setTopbarActions([
    { id: "financialReportBack", label: "Financial", icon: "arrow", onClick: () => navigate("nutrition-budget") },
    { id: "financialReportSave", label: "Save", icon: "save", variant: "primary", onClick: () => saveNutritionFinancialReport().catch(error => showToast(error.message)) },
    { id: "financialReportPrint", label: "Print", icon: "print", onClick: () => printNutritionFinancialMonthly(collectNutritionFinancialReport(true)) },
    ...(!isNew ? [{ id: "financialReportDelete", label: "Delete", icon: "bin", variant: "danger", onClick: () => deleteNutritionFinancialReport(id).catch(error => showToast(error.message)) }] : [])
  ]);
  elements.pageRoot.innerHTML = renderNutritionFinancialForm(report, centers);
  attachNutritionFinancialFormHandlers();
}

function renderNutritionFinancialForm(report, centers) {
  const selectedId = Number(report.center_id || 0);
  return `
    <section class="application-paper nutrition-paper financial-report-paper editable">
      <header class="monitoring-heading"><img src="/assets/paofi-logo.png" alt=""><div><h2>Payatas Orione Foundation Inc.</h2><h3>Nutrition Program Monthly Financial Summary</h3></div></header>
      <section class="paper-section">
        <h3>Report Details</h3>
        <div class="monitoring-identity-grid">
          <div class="paper-field wide"><label>Feeding Center</label><select id="financialReportCenter" data-financial-field="center_id"><option value=""></option>${centers.map(center => `<option value="${center.id}" data-coordinator="${escapeHtml(center.coordinator || "")}" ${Number(center.id) === selectedId ? "selected" : ""}>${escapeHtml(center.center_name)}</option>`).join("")}</select></div>
          <div class="paper-field"><label>Report Month</label><input type="month" data-financial-field="report_month" value="${escapeHtml(report.report_month || currentReportMonth())}"></div>
          <div class="paper-field"><label>Date of Submission</label><input type="date" data-financial-field="submitted_date" value="${escapeHtml(nutritionDateInputValue(report.submitted_date || nutritionTodayDate()) || todayDate())}"></div>
          <div class="paper-field"><label>Beginning Balance</label><input type="number" step="0.01" data-financial-field="beginning_balance" value="${financialAmount(report.beginning_balance) || ""}"></div>
          <div class="paper-field"><label>Additional Cash Receipts</label><input type="number" step="0.01" data-financial-field="cash_receipts" value="${financialAmount(report.cash_receipts) || ""}"></div>
        </div>
      </section>
      <section class="paper-section">
        <div class="family-section-header"><h3>Summary of Disbursements</h3><button id="financialAddEntry" type="button" class="action-button">${icon("plus")}<span>Add Line</span></button></div>
        <div class="data-table-scroll financial-entry-wrap"><table class="family-table financial-entry-table"><thead><tr><th>Date</th><th>Rep. No.</th><th>Particulars</th><th>CV #</th><th>Cash</th>${NUTRITION_FINANCIAL_CATEGORIES.map(category => `<th>${escapeHtml(category.label)}</th>`).join("")}<th aria-label="Remove"></th></tr></thead><tbody id="financialEntryRows">${(report.entries?.length ? report.entries : Array.from({ length: 4 }, blankNutritionFinancialEntry)).map(renderNutritionFinancialEntryRow).join("")}</tbody><tfoot><tr><th colspan="4">Total</th><th data-financial-total="cash">-</th>${NUTRITION_FINANCIAL_CATEGORIES.map(category => `<th data-financial-total="${category.key}">-</th>`).join("")}<th></th></tr></tfoot></table></div>
      </section>
      <section class="paper-section financial-closing-section">
        <div class="financial-balance-strip"><div><span>Total Cash Receipts</span><strong id="financialTotalReceipts">PHP 0.00</strong></div><div><span>Total Expenses</span><strong id="financialTotalExpenses">PHP 0.00</strong></div><div><span>Ending Balance</span><strong id="financialEndingBalance">PHP 0.00</strong></div></div>
        <div class="financial-signature-grid financial-form-signatures">
          <label class="financial-form-signature editable-signature"><span>Prepared by / Center Coordinator</span><input data-financial-field="prepared_by" value="${escapeHtml(report.prepared_by || "")}" placeholder="Coordinator's full name"><small>Center Coordinator</small></label>
          <div class="financial-form-signature"><span>Reviewed by</span><strong>${escapeHtml(NUTRITION_FINANCIAL_SIGNATORIES.administrativeOfficer.name)}</strong><small>${escapeHtml(NUTRITION_FINANCIAL_SIGNATORIES.administrativeOfficer.title)}</small></div>
          <div class="financial-form-signature"><span>Approved by</span><strong>${escapeHtml(NUTRITION_FINANCIAL_SIGNATORIES.president.name)}</strong><small>${escapeHtml(NUTRITION_FINANCIAL_SIGNATORIES.president.title)}</small></div>
          <input type="hidden" data-financial-field="prepared_title" value="Center Coordinator">
          <input type="hidden" data-financial-field="noted_by" value="${escapeHtml(NUTRITION_FINANCIAL_SIGNATORIES.administrativeOfficer.name)}">
          <input type="hidden" data-financial-field="noted_title" value="${escapeHtml(NUTRITION_FINANCIAL_SIGNATORIES.administrativeOfficer.title)}">
        </div>
      </section>
    </section>
  `;
}

function renderNutritionFinancialEntryRow(entry = {}) {
  return `<tr data-financial-entry-row>
    <td><input type="date" data-financial-entry-field="entry_date" value="${escapeHtml(nutritionDateInputValue(entry.entry_date) || "")}"></td>
    <td><input data-financial-entry-field="rep_no" value="${escapeHtml(entry.rep_no || "")}"></td>
    <td><input data-financial-entry-field="particulars" value="${escapeHtml(entry.particulars || "")}"></td>
    <td><input data-financial-entry-field="cv_no" value="${escapeHtml(entry.cv_no || "")}"></td>
    <td data-financial-row-cash>${financialPlainAmount(entry.cash || 0)}</td>
    ${NUTRITION_FINANCIAL_CATEGORIES.map(category => `<td><input type="number" min="0" step="0.01" data-financial-entry-field="${category.key}" value="${financialAmount(entry[category.key]) || ""}"></td>`).join("")}
    <td><button type="button" class="icon-button danger" title="Remove line" data-financial-remove>${icon("bin")}</button></td>
  </tr>`;
}

function attachNutritionFinancialFormHandlers() {
  document.getElementById("financialAddEntry")?.addEventListener("click", () => {
    document.getElementById("financialEntryRows").insertAdjacentHTML("beforeend", renderNutritionFinancialEntryRow(blankNutritionFinancialEntry()));
    attachNutritionFinancialEntryHandlers();
    updateNutritionFinancialTotals();
  });
  elements.pageRoot.querySelectorAll('[data-financial-field="beginning_balance"], [data-financial-field="cash_receipts"]').forEach(input => input.addEventListener("input", updateNutritionFinancialTotals));
  document.getElementById("financialReportCenter")?.addEventListener("change", event => {
    const coordinator = event.target.selectedOptions[0]?.dataset.coordinator || "";
    const preparedBy = elements.pageRoot.querySelector('[data-financial-field="prepared_by"]');
    if (preparedBy && coordinator) preparedBy.value = coordinator;
  });
  attachNutritionFinancialEntryHandlers();
  updateNutritionFinancialTotals();
}

function attachNutritionFinancialEntryHandlers() {
  elements.pageRoot.querySelectorAll("[data-financial-entry-row]").forEach(row => {
    if (row.dataset.bound === "1") return;
    row.dataset.bound = "1";
    row.querySelectorAll('[data-financial-entry-field="viands"], [data-financial-entry-field="milk"], [data-financial-entry-field="rice"], [data-financial-entry-field="gas"], [data-financial-entry-field="mineral_water"], [data-financial-entry-field="utilities"], [data-financial-entry-field="others"]').forEach(input => input.addEventListener("input", updateNutritionFinancialTotals));
    row.querySelector("[data-financial-remove]")?.addEventListener("click", () => { row.remove(); updateNutritionFinancialTotals(); });
  });
}

function updateNutritionFinancialTotals() {
  const totals = Object.fromEntries(NUTRITION_FINANCIAL_CATEGORIES.map(category => [category.key, 0]));
  let expenses = 0;
  elements.pageRoot.querySelectorAll("[data-financial-entry-row]").forEach(row => {
    const cash = NUTRITION_FINANCIAL_CATEGORIES.reduce((sum, category) => {
      const value = financialAmount(row.querySelector(`[data-financial-entry-field="${category.key}"]`)?.value);
      totals[category.key] += value;
      return sum + value;
    }, 0);
    expenses += cash;
    row.querySelector("[data-financial-row-cash]").textContent = financialPlainAmount(cash);
  });
  NUTRITION_FINANCIAL_CATEGORIES.forEach(category => {
    const cell = elements.pageRoot.querySelector(`[data-financial-total="${category.key}"]`);
    if (cell) cell.textContent = financialPlainAmount(totals[category.key]);
  });
  const cashCell = elements.pageRoot.querySelector('[data-financial-total="cash"]');
  if (cashCell) cashCell.textContent = financialPlainAmount(expenses);
  const beginning = financialAmount(elements.pageRoot.querySelector('[data-financial-field="beginning_balance"]')?.value);
  const receipts = financialAmount(elements.pageRoot.querySelector('[data-financial-field="cash_receipts"]')?.value);
  const totalReceipts = beginning + receipts;
  document.getElementById("financialTotalReceipts").textContent = formatMoney(totalReceipts);
  document.getElementById("financialTotalExpenses").textContent = formatMoney(expenses);
  document.getElementById("financialEndingBalance").textContent = formatMoney(totalReceipts - expenses);
  document.getElementById("financialEndingBalance").classList.toggle("financial-negative", totalReceipts - expenses < 0);
}

function collectNutritionFinancialReport(includeDerived = false) {
  const report = {};
  if (state.currentNutritionFinancialReport?.id) report.id = state.currentNutritionFinancialReport.id;
  elements.pageRoot.querySelectorAll("[data-financial-field]").forEach(input => {
    report[input.dataset.financialField] = input.dataset.financialField === "submitted_date" ? normalizeNutritionDateValue(input.value) : input.value;
  });
  report.center_name = elements.pageRoot.querySelector("#financialReportCenter option:checked")?.textContent.trim() || "";
  report.entries = [...elements.pageRoot.querySelectorAll("[data-financial-entry-row]")].map((row, index) => {
    const entry = { row_order: index };
    row.querySelectorAll("[data-financial-entry-field]").forEach(input => {
      entry[input.dataset.financialEntryField] = input.dataset.financialEntryField === "entry_date" ? normalizeNutritionDateValue(input.value) : input.value;
    });
    if (includeDerived) entry.cash = NUTRITION_FINANCIAL_CATEGORIES.reduce((sum, category) => sum + financialAmount(entry[category.key]), 0);
    return entry;
  });
  return report;
}

async function saveNutritionFinancialReport() {
  const payload = await api("/api/nutrition/financial/reports", { method: "POST", body: JSON.stringify(collectNutritionFinancialReport()) });
  state.currentNutritionFinancialReport = payload.report;
  await refreshStats();
  showToast("Monthly financial report saved.");
  history.replaceState(null, "", `#/nutrition-budget/edit-${payload.report.id}`);
  await renderNutritionFinancialEditorPage(String(payload.report.id), false);
}

async function deleteNutritionFinancialReport(id) {
  const report = state.currentNutritionFinancialReport || (await api(`/api/nutrition/financial/reports/${id}`)).report;
  if (!window.confirm(`Delete this financial report?\n\n${reportMonthLabel(report.report_month)}\n${report.center_name}`)) return;
  await api(`/api/nutrition/financial/reports/${id}`, { method: "DELETE" });
  await refreshStats();
  showToast("Financial report deleted.");
  navigate("nutrition-budget");
}

function financialPrintDocument(title, body, pageSize = "letter landscape", extraStyles = "") {
  const logoSrc = `${window.location.origin}/assets/paofi-logo.png`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    @page { size: ${pageSize}; margin: 0.35in; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #17231d; font-family: Arial, sans-serif; background: #fff; }
    .report { width: 100%; }
    .report-header { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 14px; text-align: center; }
    .report-header img { width: 52px; height: 52px; object-fit: contain; }
    h1 { margin: 0; font-size: 17px; } h2 { margin: 3px 0 0; font-size: 14px; } h3 { margin: 3px 0 0; font-size: 12px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border: 1px solid #48534d; padding: 4px 5px; font-size: 10px; vertical-align: middle; }
    th { background: #e7f1eb; font-weight: 800; text-align: center; }
    td.number { text-align: right; font-variant-numeric: tabular-nums; }
    .section-row th { background: #0d5637; color: #fff; text-align: left; }
    .total-row th, .total-row td { background: #fff5a8; font-weight: 800; }
    .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 0 0 12px; }
    .meta div { padding: 7px; border: 1px solid #cbd8d0; }
    .meta span { display: block; color: #65716a; font-size: 10px; text-transform: uppercase; }
    .meta strong { display: block; margin-top: 3px; font-size: 10px; }
    .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-top: 28px; page-break-inside: avoid; }
    .signature { padding-top: 15px; border-top: 1px solid #27332c; font-size: 10px; text-align: center; }
    .signature strong, .signature span, .signature small { display: block; }
    .signature strong { font-size: 10px; }
    .signature small { margin-top: 2px; color: #536159; font-size: 10px; }
    .signature-role { margin-bottom: 16px; color: #647169; font-size: 10px; font-weight: 700; text-align: left; text-transform: uppercase; }
    .actual-group { background: #dcefe5 !important; color: #164d35; }
    .budget-group { background: #f8edc9 !important; color: #5e4a0d; border-left: 2px solid #a88422 !important; }
    .budget-divider { border-left: 2px solid #a88422 !important; }
    .summary-table { margin: 12px 0 16px; }
    .summary-table caption { margin-bottom: 6px; color: #1b4f38; font-size: 11px; font-weight: 800; text-align: left; }
    ${extraStyles}
  </style></head><body><main class="report"><header class="report-header"><img src="${escapeHtml(logoSrc)}" alt=""><div><h1>Payatas Orione Foundation, Inc.</h1><h2>${escapeHtml(title)}</h2></div></header>${body}</main></body></html>`;
}

function financialReportSignatures(preparedName = "", preparedTitle = "Center Coordinator") {
  return `<div class="signatures">
    <div class="signature"><span class="signature-role">Prepared by</span><strong>${escapeHtml(preparedName || "Name and Signature")}</strong><small>${escapeHtml(preparedTitle)}</small></div>
    <div class="signature"><span class="signature-role">Reviewed by</span><strong>${escapeHtml(NUTRITION_FINANCIAL_SIGNATORIES.administrativeOfficer.name)}</strong><small>${escapeHtml(NUTRITION_FINANCIAL_SIGNATORIES.administrativeOfficer.title)}</small></div>
    <div class="signature"><span class="signature-role">Approved by</span><strong>${escapeHtml(NUTRITION_FINANCIAL_SIGNATORIES.president.name)}</strong><small>${escapeHtml(NUTRITION_FINANCIAL_SIGNATORIES.president.title)}</small></div>
  </div>`;
}

function printNutritionFinancialMonthly(report) {
  const entries = report.entries?.length ? report.entries : Array.from({ length: 4 }, blankNutritionFinancialEntry);
  const totals = report.category_totals || Object.fromEntries(NUTRITION_FINANCIAL_CATEGORIES.map(category => [category.key, entries.reduce((sum, entry) => sum + financialAmount(entry[category.key]), 0)]));
  const totalExpenses = report.total_disbursements ?? Object.values(totals).reduce((sum, value) => sum + value, 0);
  const totalReceipts = financialAmount(report.beginning_balance) + financialAmount(report.cash_receipts);
  const body = `
    <div class="meta"><div><span>Feeding Center</span><strong>${escapeHtml(report.center_name || "")}</strong></div><div><span>Report Month</span><strong>${escapeHtml(reportMonthLabel(report.report_month))}</strong></div><div><span>Date Submitted</span><strong>${escapeHtml(report.submitted_date || "")}</strong></div><div><span>Ending Balance</span><strong>${escapeHtml(formatMoney(totalReceipts - totalExpenses))}</strong></div></div>
    <table><thead><tr><th style="width:8%">Date</th><th style="width:7%">Rep. No.</th><th style="width:20%">Particulars</th><th style="width:7%">CV #</th><th>Cash</th>${NUTRITION_FINANCIAL_CATEGORIES.map(category => `<th>${escapeHtml(category.label)}</th>`).join("")}</tr></thead><tbody>
      ${entries.map(entry => `<tr><td>${escapeHtml(entry.entry_date || "")}</td><td>${escapeHtml(entry.rep_no || "")}</td><td>${escapeHtml(entry.particulars || "")}</td><td>${escapeHtml(entry.cv_no || "")}</td><td class="number">${financialPlainAmount(entry.cash ?? NUTRITION_FINANCIAL_CATEGORIES.reduce((sum, category) => sum + financialAmount(entry[category.key]), 0))}</td>${NUTRITION_FINANCIAL_CATEGORIES.map(category => `<td class="number">${financialPlainAmount(entry[category.key])}</td>`).join("")}</tr>`).join("")}
      <tr class="total-row"><th colspan="4">Total</th><td class="number">${financialPlainAmount(totalExpenses)}</td>${NUTRITION_FINANCIAL_CATEGORIES.map(category => `<td class="number">${financialPlainAmount(totals[category.key])}</td>`).join("")}</tr>
    </tbody></table>
    <div class="meta" style="margin-top:12px"><div><span>Beginning Balance</span><strong>${escapeHtml(formatMoney(report.beginning_balance))}</strong></div><div><span>Additional Cash Receipts</span><strong>${escapeHtml(formatMoney(report.cash_receipts))}</strong></div><div><span>Total Expenses</span><strong>${escapeHtml(formatMoney(totalExpenses))}</strong></div><div><span>Ending Balance</span><strong>${escapeHtml(formatMoney(totalReceipts - totalExpenses))}</strong></div></div>
    ${financialReportSignatures(report.prepared_by, report.prepared_title || "Center Coordinator")}`;
  showDocumentPrintPreview(`Monthly Financial Report - ${report.center_name || "Feeding Center"}`, financialPrintDocument(`${report.center_name || "Feeding Center"} - Summary of Disbursements`, body));
}

function financialCenterYearlyRows(center) {
  const monthCells = valueGetter => center.months.map(month => `<td class="number">${financialPlainAmount(valueGetter(month))}</td>`).join("");
  const totalCell = value => `<td class="number">${financialPlainAmount(value)}</td>`;
  return `
    <tr class="section-row"><th colspan="14">Cash Receipts</th></tr>
    <tr><th>Beginning Balance</th>${monthCells(month => month.beginning_balance)}${totalCell(center.totals.beginning_balance)}</tr>
    <tr><th>Additional Cash Receipts</th>${monthCells(month => month.cash_receipts)}${totalCell(center.totals.cash_receipts)}</tr>
    <tr class="total-row"><th>Total Cash Receipts</th>${monthCells(month => month.total_cash_receipts)}${totalCell(center.totals.total_cash_receipts)}</tr>
    <tr class="section-row"><th colspan="14">Expenses</th></tr>
    ${NUTRITION_FINANCIAL_CATEGORIES.map(category => `<tr><th>${escapeHtml(category.label)}</th>${monthCells(month => month.category_totals[category.key])}${totalCell(center.totals.category_totals[category.key])}</tr>`).join("")}
    <tr class="total-row"><th>Total Expenses</th>${monthCells(month => month.total_expenses)}${totalCell(center.totals.total_expenses)}</tr>
    <tr class="total-row"><th>Cash Receipts over Expenses</th>${monthCells(month => month.balance)}${totalCell(center.totals.balance)}</tr>`;
}

async function printNutritionFinancialCenterYearly(centerId, year) {
  const summary = await loadNutritionFinancialSummary(Number(year) || new Date().getFullYear());
  const center = nutritionFinancialCenter(summary, centerId);
  if (!center) throw new Error("Feeding center was not found in this financial year.");
  const body = `<div class="meta"><div><span>Year</span><strong>${summary.year}</strong></div><div><span>Active Children</span><strong>${center.active_kids}</strong></div><div><span>Capacity</span><strong>${center.capacity}</strong></div><div><span>Reports Filed</span><strong>${center.reported_months} of 12</strong></div></div><table><thead><tr><th style="width:16%">Item</th>${center.months.map(month => `<th>${month.label}</th>`).join("")}<th>Total</th></tr></thead><tbody>${financialCenterYearlyRows(center)}</tbody></table>${financialReportSignatures(center.coordinator, "Center Coordinator")}`;
  showDocumentPrintPreview(`${center.center_name} Financial Summary ${summary.year}`, financialPrintDocument(`${center.center_name} - Summary of Cash Receipts and Disbursements`, body, "legal landscape", "th,td{font-size:10px;padding:3px}"));
}

function programFinancialCenterBlock(center) {
  const monthTotal = month => month.total_expenses;
  const totalMetric = key => NUTRITION_FINANCIAL_CATEGORIES.reduce((sum, category) => sum + Number(center.category_metrics[category.key]?.[key] || 0), 0);
  return `<section class="program-center-block"><table><thead>
    <tr><th rowspan="2" style="width:12%">${escapeHtml(center.center_name)}</th><th colspan="16" class="actual-group">Actual Disbursements from Submitted Reports</th><th colspan="4" class="budget-group">Annual Budget Setup / Proposal</th></tr>
    <tr><th>Total</th>${center.months.map(month => `<th>${month.label}</th>`).join("")}<th>Monthly Avg.</th><th>Daily Avg.</th><th>Actual / Active Child</th><th class="budget-divider">Proposed Monthly</th><th>Proposed Daily</th><th>Proposal / Capacity</th><th>Approved / Child</th></tr>
    </thead><tbody>
    <tr class="kids-row"><th># of Kids / Days</th><td>${center.active_kids}</td>${center.months.map(() => `<td>${center.active_kids}</td>`).join("")}<td>${center.active_kids}</td><td>${center.feeding_days} days</td><td>${center.active_kids}</td><td class="budget-divider">${center.capacity}</td><td>${center.feeding_days} days</td><td>${center.capacity}</td><td>${center.capacity}</td></tr>
    ${NUTRITION_FINANCIAL_CATEGORIES.map(category => { const metric = center.category_metrics[category.key]; return `<tr><th>${escapeHtml(category.label)}</th><td class="number">${financialPlainAmount(metric.actual_total)}</td>${center.months.map(month => `<td class="number">${financialPlainAmount(month.category_totals[category.key])}</td>`).join("")}<td class="number">${financialPlainAmount(metric.actual_monthly_average)}</td><td class="number">${financialPlainAmount(metric.actual_daily_average)}</td><td class="number">${financialPlainAmount(metric.actual_per_child)}</td><td class="number budget-divider">${financialPlainAmount(metric.budget_monthly)}</td><td class="number">${financialPlainAmount(metric.budget_daily)}</td><td class="number">${financialPlainAmount(metric.budget_per_child)}</td><td class="number">-</td></tr>`; }).join("")}
    <tr class="total-row"><th>Total Expenses</th><td class="number">${financialPlainAmount(center.totals.total_expenses)}</td>${center.months.map(month => `<td class="number">${financialPlainAmount(monthTotal(month))}</td>`).join("")}<td class="number">${financialPlainAmount(center.budget_metrics.actual_monthly_average)}</td><td class="number">${financialPlainAmount(center.budget_metrics.actual_daily_average)}</td><td class="number">${financialPlainAmount(center.budget_metrics.actual_per_child)}</td><td class="number budget-divider">${financialPlainAmount(totalMetric("budget_monthly"))}</td><td class="number">${financialPlainAmount(totalMetric("budget_daily"))}</td><td class="number">${financialPlainAmount(totalMetric("budget_per_child"))}</td><td class="number">${financialPlainAmount(center.budget_metrics.approved_per_child)}</td></tr>
  </tbody></table></section>`;
}

function programFinancialSummaryTable(summary) {
  return `<table class="summary-table"><caption>Program Financial Summary</caption><thead>
    <tr><th rowspan="2">Feeding Center</th><th rowspan="2">Reports</th><th rowspan="2">Active Kids</th><th rowspan="2">Capacity</th><th colspan="3" class="actual-group">Actual</th><th colspan="4" class="budget-group">Approved Budget</th></tr>
    <tr><th>Total Disbursements</th><th>Monthly Average</th><th>Actual / Child / Day</th><th class="budget-divider">Approved / Child / Day</th><th>Monthly Allowance</th><th>Annual Allowance</th><th>Monthly Variance</th></tr>
    </thead><tbody>
    ${summary.centers.map(center => `<tr><th>${escapeHtml(center.center_name)}</th><td>${center.reported_months} / 12</td><td>${center.active_kids}</td><td>${center.capacity}</td><td class="number">${financialPlainAmount(center.totals.total_expenses)}</td><td class="number">${financialPlainAmount(center.budget_metrics.actual_monthly_average)}</td><td class="number">${financialPlainAmount(center.budget_metrics.actual_per_child)}</td><td class="number budget-divider">${financialPlainAmount(center.budget_metrics.approved_per_child)}</td><td class="number">${financialPlainAmount(center.budget_metrics.approved_monthly)}</td><td class="number">${financialPlainAmount(center.budget_metrics.approved_annual)}</td><td class="number">${financialPlainAmount(center.budget_metrics.monthly_variance)}</td></tr>`).join("")}
    <tr class="total-row"><th>Program Total / Weighted Average</th><td>${summary.program.report_count}</td><td>${summary.program.active_kids}</td><td>${summary.program.capacity}</td><td class="number">${financialPlainAmount(summary.program.total_actual)}</td><td class="number">${financialPlainAmount(summary.centers.reduce((sum, center) => sum + center.budget_metrics.actual_monthly_average, 0))}</td><td class="number">${financialPlainAmount(summary.program.actual_per_child)}</td><td class="number budget-divider">${financialPlainAmount(summary.program.approved_budget_per_child)}</td><td class="number">${financialPlainAmount(summary.program.approved_monthly)}</td><td class="number">${financialPlainAmount(summary.program.approved_annual)}</td><td class="number">${financialPlainAmount(summary.program.monthly_variance)}</td></tr>
    </tbody></table>`;
}

async function printNutritionFinancialProgramYearly(year) {
  const summary = await loadNutritionFinancialSummary(Number(year) || new Date().getFullYear());
  const body = `<div class="meta"><div><span>Year</span><strong>${summary.year}</strong></div><div><span>Feeding Centers</span><strong>${summary.program.center_count}</strong></div><div><span>Active Children</span><strong>${summary.program.active_kids}</strong></div><div><span>Total Capacity</span><strong>${summary.program.capacity}</strong></div></div>${programFinancialSummaryTable(summary)}${summary.centers.map(programFinancialCenterBlock).join("")}${financialReportSignatures("", "Program Officer")}`;
  const extraStyles = `.program-center-block{margin:0 0 10px;break-inside:avoid}.program-center-block table{table-layout:fixed}.program-center-block th,.program-center-block td{font-size:10px;padding:2px}.kids-row td,.kids-row th{background:#d9e9f5;font-weight:800}.summary-table th,.summary-table td{font-size:10px;padding:3px}`;
  showDocumentPrintPreview(`General Feeding Actual vs Budget ${summary.year}`, financialPrintDocument(`General Feeding Actual vs. Budget ${summary.year}`, body, "legal landscape", extraStyles));
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

  const payload = await api("/api/monitoring/reports?limit=100");
  const reports = payload.reports || [];

  elements.pageRoot.innerHTML = `
    <div id="monitoringAnalyticsHost">${renderMonitoringOverview(reports)}</div>
    <section class="monitoring-page flow-data-section">
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
    state.tablePages.monitoring = 1;
    const reportPayload = await api(`/api/monitoring/reports?search=${search}&limit=100`);
    const filteredReports = reportPayload.reports || [];
    document.getElementById("monitoringAnalyticsHost").innerHTML = renderMonitoringOverview(filteredReports);
    renderMonitoringList(filteredReports);
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
  const pageInfo = pagedItems(reports, "monitoring");
  document.getElementById("monitoringCount").textContent = pageCountText(pageInfo, "reports");

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
          ${pageInfo.items.map(report => `
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
    ${renderPagination("monitoring", pageInfo)}
  `;
  bindPagination(document.getElementById("monitoringListHost"), "monitoring", () => renderMonitoringList(reports));
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
  enforceMinimumPrintFontSize(printWindow.document);
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

  const recordsPayload = await api("/api/records?limit=500&detail=table");
  const allRecords = recordsPayload.records || [];
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
        state.tablePages.database = 1;
        setDatabaseFilterState({ search: input.value });
        applyFilters();
      });
    });
    scope.querySelectorAll("[data-db-filter-min-age]").forEach(input => {
      input.addEventListener("input", () => {
        state.tablePages.database = 1;
        setDatabaseFilterState({ minAge: input.value });
        applyFilters();
      });
    });
    scope.querySelectorAll("[data-db-filter-max-age]").forEach(input => {
      input.addEventListener("input", () => {
        state.tablePages.database = 1;
        setDatabaseFilterState({ maxAge: input.value });
        applyFilters();
      });
    });
    scope.querySelectorAll("[data-db-filter-field]").forEach(input => {
      input.addEventListener("change", () => {
        state.tablePages.database = 1;
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
        state.tablePages.database = 1;
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
  const pageInfo = pagedItems(records, "database");
  document.getElementById("databaseCount").textContent = pageCountText(pageInfo, "records");

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
          ${pageInfo.items.map(record => `
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
    ${renderPagination("database", pageInfo)}
  `;
  bindPagination(document.getElementById("databaseTableHost"), "database", () => renderDatabaseTable(records));
  attachRecordOpenHandlers(elements.pageRoot);
}

async function renderBinPage() {
  setTitle("Record Bin");
  setTopbarActions([
    { id: "binRefresh", label: "Refresh", icon: "refresh", onClick: () => renderBinPage().catch(error => showToast(error.message)) }
  ]);

  const payload = await api("/api/bin?limit=100");
  const records = payload.records || [];
  const pageInfo = pagedItems(records, "bin");
  elements.pageRoot.innerHTML = `
    <section class="tool-panel">
      <div class="panel-title-row">
        <h3>Deleted Records</h3>
        <span>${pageCountText(pageInfo, "records")}</span>
      </div>
      <div class="bin-list-modern">
        ${records.length ? pageInfo.items.map(record => `
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
      ${renderPagination("bin", pageInfo)}
    </section>
  `;
  bindPagination(elements.pageRoot, "bin", () => renderBinPage().catch(error => showToast(error.message)));

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

async function renderSystemPage() {
  setTitle("System Tools");
  setTopbarActions([
    { id: "systemExportTopbar", label: "Export", icon: "export", variant: "primary", onClick: () => exportData().catch(error => showToast(error.message)) }
  ]);

  const stats = await refreshStats();
  elements.pageRoot.innerHTML = `
    <section class="system-tools-page">
      <div class="tool-panel">
        <div class="panel-title-row">
          <h3>Data Export</h3>
          <span>System backup file</span>
        </div>
        <p class="system-tool-copy">
          Download a JSON export of the PAOFI Programs Database for backup or migration work.
        </p>
        <div class="system-tool-actions">
          <button type="button" id="systemExportButton" class="action-button primary">
            <span class="button-icon">${icon("export")}</span>
            <span>Export Database</span>
          </button>
        </div>
      </div>

      <div class="tool-panel">
        <div class="panel-title-row">
          <h3>Database Summary</h3>
          <span>Current totals</span>
        </div>
        <div class="dashboard-summary-list">
          ${dashboardSummaryRow("Livelihood records", stats.active, "Active application profiles", "database")}
          ${dashboardSummaryRow("Record bin", stats.deleted, "Deleted records available for restore", "bin")}
          ${dashboardSummaryRow("Nutrition profiles", stats.nutritionBeneficiaries || 0, "Supplemental feeding beneficiaries", "nutrition-profiles")}
          ${dashboardSummaryRow("Growth reports", stats.nutritionGrowthReports || 0, "Nutrition monitoring reports", "nutrition-growth")}
          ${dashboardSummaryRow("Scholarship profiles", stats.scholarshipScholars || 0, "Scholar profile records", "scholarship-scholars")}
          ${dashboardSummaryRow("Scholarship sponsors", stats.scholarshipSponsors || 0, "Sponsor relationship records", "scholarship-sponsors")}
        </div>
      </div>
    </section>
  `;

  document.getElementById("systemExportButton").addEventListener("click", () => {
    exportData().catch(error => showToast(error.message));
  });
  elements.pageRoot.querySelectorAll("[data-menu-route]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.menuRoute));
  });
}

async function renderAccountsPage() {
  const programRoleGroups = [
    ["livelihood", "Livelihood Program"],
    ["nutrition", "Nutrition Program"],
    ["scholarship", "Scholarship Program"],
    ["health", "Health Program"],
    ["administration", "Administration"]
  ];
  const availableRoles = ACCOUNT_PROGRAM_ROLES;
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
        <div class="account-program-roles">
          <p class="account-role-guidance">Program Officers approve and administer; Finance controls financial records; Program Assistants and Coordinators handle routine records; Volunteer and Scholar are dashboard-only affiliations until a specific record assignment is configured.</p>
          ${programRoleGroups.map(([programCode, programLabel]) => `
            <fieldset class="account-role-fieldset">
              <legend>${programLabel}</legend>
              <div class="account-role-grid">
                ${availableRoles.map(([value, label]) => `
                  <label class="checkbox-row">
                    <input type="checkbox" data-program-role="${programCode}" value="${value}">
                    <span>${label}</span>
                  </label>
                `).join("")}
              </div>
            </fieldset>
          `).join("")}
        </div>
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
                <span>
                  ${escapeHtml(user.username)} | ${escapeHtml(user.role)} | ${user.active ? "Active" : "Inactive"}
                  ${programRoleGroups.map(([programCode, programLabel]) => user.program_roles?.[programCode]?.length ? ` | ${programLabel}: ${escapeHtml(user.program_roles[programCode].map(role => role.replaceAll("_", " ")).join(", "))}` : "").join("")}
                </span>
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
  const programRoleInputs = [...document.querySelectorAll("[data-program-role]")];

  function resetForm() {
    accountId.value = "";
    displayName.value = "";
    username.value = "";
    password.value = "";
    password.placeholder = "Required for new users";
    active.checked = true;
    programRoleInputs.forEach(input => { input.checked = false; });
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
      programRoleInputs.forEach(input => {
        input.checked = new Set(user.program_roles?.[input.dataset.programRole] || []).has(input.value);
      });
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
          active: active.checked,
          program_roles: Object.fromEntries(programRoleGroups.map(([programCode]) => [
            programCode,
            programRoleInputs.filter(input => input.dataset.programRole === programCode && input.checked).map(input => input.value)
          ]))
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
            font-size: 10px;
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
            font-size: 10px;
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
            font-size: 10px;
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
            font-size: 10px;
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
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .print-field strong {
            display: block;
            color: #1d2520;
            font-size: 10px;
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
            font-size: 10px;
            line-height: 1.05;
            font-weight: 800;
          }
          .family td {
            font-size: 10px;
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
            font-size: 10px;
          }
          .beneficiary-monitoring-head span {
            color: #5b6861;
            font-size: 10px;
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
            font-size: 10px;
            font-style: normal;
          }
          .beneficiary-monitoring-kpis strong {
            display: block;
            color: #143d33;
            font-size: 10px;
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
            font-size: 10px;
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
            font-size: 10px;
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
  enforceMinimumPrintFontSize(printWindow.document);
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
  document.addEventListener("click", event => {
    const button = event.target.closest?.("[data-copy-chart]");
    if (!button) return;
    copyChartAsImage(button).catch(error => showToast(error.message));
  });

  const restored = await restoreSession();
  if (!restored) {
    waitForDatabaseReady({ updateLogin: true }).finally(() => {
      elements.loginUsername.focus();
    });
    return;
  }

  await loadApplication();
}

async function loadApplication() {
  if (hasWorkspaceAccess("livelihood")) {
    const metadata = await api("/api/metadata");
    state.fields = metadata.fields;
    state.sections = metadata.sections;
    state.fieldMap = metadata.fields.reduce((map, item) => {
      map[item.name] = item;
      return map;
    }, {});
  } else {
    state.fields = [];
    state.sections = {};
    state.fieldMap = {};
  }

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

  await renderRoute();

  if (!state.stats) {
    refreshStats().catch(error => showToast(error.message));
  }
}

initialize().catch(error => {
  showToast(error.message);
});
