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

const DROPDOWN_OPTIONS = {
  field_h11: ["Female", "Male"],
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
  "field_c38",
  "field_f39",
  "seminar",
  "field_k43",
  "willingness",
  "commit_days"
];

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
  bin: '<svg viewBox="0 0 24 24"><path d="M4 7h16"></path><path d="M10 11v6M14 11v6"></path><path d="m6 7 1 14h10l1-14"></path><path d="M9 7V4h6v3"></path></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M5 3h12l2 2v16H5V3Z"></path><path d="M8 3v6h8V3"></path><path d="M8 21v-7h8v7"></path></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>',
  print: '<svg viewBox="0 0 24 24"><path d="M7 9V3h10v6"></path><path d="M7 17H5a2 2 0 0 1-2-2v-4h18v4a2 2 0 0 1-2 2h-2"></path><path d="M7 14h10v7H7z"></path></svg>',
  export: '<svg viewBox="0 0 24 24"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7"></path><path d="M20 4v6h-6"></path></svg>'
};

const state = {
  fields: [],
  sections: {},
  fieldMap: {},
  stats: null,
  currentRecord: null,
  pictureData: "",
  route: "menu",
  routeId: "",
  toastTimer: null
};

const elements = {
  pageTitle: document.getElementById("pageTitle"),
  pageRoot: document.getElementById("pageRoot"),
  topbarActions: document.getElementById("topbarActions"),
  databaseLocation: document.getElementById("databaseLocation"),
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
    item.classList.toggle("active", item.dataset.route === route);
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
  const parsed = parseRoute();
  state.route = parsed.route;
  state.routeId = parsed.id;
  setActiveNav(parsed.route);

  try {
    if (parsed.route === "search") await renderSearchPage();
    else if (parsed.route === "editor") await renderEditorPage(parsed.id);
    else if (parsed.route === "viewer") await renderViewerPage(parsed.id);
    else if (parsed.route === "database") await renderDatabasePage();
    else if (parsed.route === "bin") await renderBinPage();
    else await renderMenuPage();
  } catch (error) {
    showToast(error.message);
  }
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
    seminarCounts: countBy(activeRecords, record => analyticsValue(record, "seminar")),
    willingnessCounts: countBy(activeRecords, record => analyticsValue(record, "willingness")),
    commitmentCounts: countBy(activeRecords, record => analyticsValue(record, "commit_days"))
  };
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

function renderDatabaseAnalytics(analytics) {
  const topInterest = topAnalyticsEntry(analytics.interestCounts);
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
        ${renderAnalyticsKpi("Top Interest", topInterest.label, analyticsPlural(topInterest.count, "record"), "blue")}
        ${renderAnalyticsKpi("Has Small Business", String(hasBusiness), `${analyticsPercent(hasBusiness, analytics.total)}% of applicants`, "amber")}
        ${renderAnalyticsKpi("PAOFI Beneficiary", String(paofiBeneficiary), `${analyticsPercent(paofiBeneficiary, analytics.total)}% of households`, "violet")}
        ${renderAnalyticsKpi("Attended Seminar", String(attendedSeminar), `${analyticsPercent(attendedSeminar, analytics.total)}% of applicants`, "red")}
        ${renderAnalyticsKpi("Ready for Training", String(willingCount), `${analyticsPercent(willingCount, analytics.total)}% willing`, "green")}
      </div>
      <div class="analytics-chart-grid">
        ${renderAnalyticsCard("Gender Distribution", "Applicant profile", renderDonutChart(analytics.genderCounts, analytics.total), "wide")}
        ${renderAnalyticsCard("Age Groups", `Average age: ${analytics.averageAge || "N/A"}`, renderBarList(analytics.ageCounts, analytics.total, 6))}
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
  setTitle("Main Menu");
  setTopbarActions([
    { id: "menuExport", label: "Export", icon: "export", onClick: () => exportData().catch(error => showToast(error.message)) }
  ]);

  const [stats, recentPayload, binPayload, exportPayload] = await Promise.all([
    refreshStats(),
    api("/api/records?limit=5"),
    api("/api/bin"),
    api("/api/export")
  ]);
  const analytics = buildAnalytics(exportPayload.records || []);

  elements.pageRoot.innerHTML = `
    <section class="menu-hero">
      <div class="menu-hero-copy">
        <p class="eyebrow">Payatas Orione Foundation Inc.</p>
        <h2>Livelihood Program Database</h2>
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
      <button type="button" class="stat-card accent" data-menu-route="bin">
        <span>Record Bin</span>
        <strong>${stats.deleted}</strong>
      </button>
      <button type="button" class="stat-card blue" data-menu-route="editor">
        <span>Next Control No.</span>
        <strong id="nextControlNo">...</strong>
      </button>
    </section>

    ${renderMenuAnalytics(analytics)}

    <section class="menu-grid">
      ${menuTile("search", "search", "Search Records")}
      ${menuTile("editor", "edit", "New Application")}
      ${menuTile("viewer", "view", "Record Viewer")}
      ${menuTile("database", "table", "Database Table")}
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
      <span>Livelihood Program Database</span>
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

async function renderEditorPage(id = "") {
  setTitle(id ? "Editor" : "New Application");

  const record = id ? await loadRecord(id) : await makeNewRecord();
  state.currentRecord = record;
  state.pictureData = record.picture_data || "";

  setTopbarActions([
    { id: "editorNew", label: "New", icon: "plus", onClick: () => navigate("editor") },
    { id: "editorSave", label: "Save", icon: "save", variant: "primary", onClick: () => saveCurrentRecord().catch(error => showToast(error.message)) },
    { id: "editorPrint", label: "Print", icon: "print", onClick: () => printRecord(collectRecord()) },
    ...(record.id ? [{ id: "editorDelete", label: "Delete", icon: "bin", variant: "danger", onClick: () => deleteCurrentRecord(record.id).catch(error => showToast(error.message)) }] : [])
  ]);

  elements.pageRoot.innerHTML = renderApplicationForm(record, "edit");
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

  const record = await loadRecord(id);
  state.currentRecord = record;
  setTopbarActions([
    { id: "viewerEdit", label: "Edit", icon: "edit", variant: "primary", onClick: () => navigate("editor", record.id) },
    { id: "viewerPrint", label: "Print", icon: "print", onClick: () => printRecord(record) },
    { id: "viewerDelete", label: "Delete", icon: "bin", variant: "danger", onClick: () => deleteCurrentRecord(record.id).catch(error => showToast(error.message)) }
  ]);
  elements.pageRoot.innerHTML = renderApplicationForm(record, "view");
}

function renderApplicationForm(record, mode) {
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
      ${formSection("IV. Livelihood Project Interest", ["livelihood_interest", "field_c38", "field_f39"], record, readonly)}
      ${formSection("V. Skills and Experience", ["seminar", "field_k43"], record, readonly)}
      ${formSection("VI. Availability and Commitment", ["willingness", "commit_days"], record, readonly)}

      <section class="form-certification">
        <p>Pinapatunayan ko na ang lahat ng detalye sa itaas ay totoo at wasto.</p>
        <p>Ako ay seryosong makikibahagi at tatapusin ang buong proseso ng livelihood project hanggang Disyembre 2026</p>
        <div>Name and Signature of the Applicant</div>
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
  });
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

  familyRowIndexes.forEach(rowIndex => {
    const rowValues = FAMILY_FIELDS.reduce((values, name) => {
      const input = elements.pageRoot.querySelector(`[data-family-field="${name}"][data-family-row="${rowIndex}"]`);
      values[name] = normalizeFieldValue(name, input?.value || "").trim();
      return values;
    }, {});
    const hasValue = FAMILY_FIELDS.some(name => rowValues[name]);

    if (!hasValue) return;

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
  const analytics = buildAnalytics(exportPayload.records || []);

  elements.pageRoot.innerHTML = `
    ${renderDatabaseAnalytics(analytics)}

    <section class="database-page">
      <div class="table-toolbar">
        <div class="search-band compact">
          <span class="search-icon">${icon("search")}</span>
          <input id="databaseSearchInput" type="search" placeholder="Filter table">
          <button id="databaseSearchButton" type="button" class="action-button">
            <span class="button-icon">${icon("search")}</span>
            <span>Search</span>
          </button>
        </div>
        <span id="databaseCount" class="table-count"></span>
      </div>
      <div id="databaseTableHost" class="database-table-host"></div>
    </section>
  `;

  async function loadTable() {
    const search = encodeURIComponent(document.getElementById("databaseSearchInput").value.trim());
    const payload = await api(`/api/records?search=${search}&limit=200&detail=full`);
    renderDatabaseTable(payload.records);
  }

  document.getElementById("databaseSearchButton").addEventListener("click", () => loadTable().catch(error => showToast(error.message)));
  document.getElementById("databaseSearchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadTable().catch(error => showToast(error.message));
    }
  });

  await loadTable();
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

function printRecord(record) {
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
  link.download = `lp-database-export-${todayDate()}.json`;
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
  const metadata = await api("/api/metadata");
  state.fields = metadata.fields;
  state.sections = metadata.sections;
  state.fieldMap = metadata.fields.reduce((map, item) => {
    map[item.name] = item;
    return map;
  }, {});

  elements.navItems.forEach(item => {
    item.addEventListener("click", () => navigate(item.dataset.route));
  });
  window.addEventListener("hashchange", renderRoute);

  if (!location.hash) {
    history.replaceState(null, "", "#/menu");
  }

  await refreshStats();
  await renderRoute();
}

initialize().catch(error => {
  showToast(error.message);
});
