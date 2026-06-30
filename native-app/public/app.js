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
  business_duration: ["0 experience", "< 1 year", "1-3 years", "> 3 years"],
  livelihood_interest: ["Rag Making", "Dishwashing", "Sewing"],
  seminar: ["Oo", "Hindi"],
  willingness: ["Oo", "Hindi"],
  commit_days: ["1-2 days", "3-4 days"]
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

async function renderMenuPage() {
  setTitle("Main Menu");
  setTopbarActions([
    { id: "menuExport", label: "Export", icon: "export", onClick: () => exportData().catch(error => showToast(error.message)) }
  ]);

  const [stats, recentPayload, binPayload] = await Promise.all([
    refreshStats(),
    api("/api/records?limit=5"),
    api("/api/bin")
  ]);

  elements.pageRoot.innerHTML = `
    <section class="menu-hero">
      <div class="menu-hero-copy">
        <p class="eyebrow">Livelihood Program Application Form</p>
        <h2>PAYATAS ORIONE FOUNDATION INC.</h2>
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
    <div class="photo-box editable-photo">
      <div id="photoPreview" class="photo-preview">${preview}</div>
      <div class="photo-actions">
        <label for="pictureInput" class="text-button">Choose</label>
        <button id="removePictureButton" type="button" class="text-button">Remove</button>
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
  const value = record[meta.name] || "";
  const isWide = meta.input === "textarea" || meta.label.length > 42 || meta.name === "field_c13";

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

  if (meta.input === "select") {
    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label for="${escapeHtml(meta.name)}">${escapeHtml(meta.label)}</label>
        <select id="${escapeHtml(meta.name)}" data-field="${escapeHtml(meta.name)}">
          ${(meta.options || []).map(option => `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
        </select>
      </div>
    `;
  }

  if (meta.input === "textarea") {
    return `
      <div class="paper-field ${isWide ? "wide" : ""}">
        <label for="${escapeHtml(meta.name)}">${escapeHtml(meta.label)}</label>
        <textarea id="${escapeHtml(meta.name)}" rows="${meta.rows || 3}" data-field="${escapeHtml(meta.name)}">${escapeHtml(value)}</textarea>
      </div>
    `;
  }

  return `
    <div class="paper-field ${isWide ? "wide" : ""}">
      <label for="${escapeHtml(meta.name)}">${escapeHtml(meta.label)}</label>
      <input id="${escapeHtml(meta.name)}" type="${meta.input || "text"}" data-field="${escapeHtml(meta.name)}" value="${escapeHtml(value)}" ${meta.required ? "required" : ""}>
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

function renderFamilySection(record, readonly) {
  const rows = familyRows(record, readonly ? null : 10);
  const headers = FAMILY_FIELDS.map(name => field(name).label);

  return `
    <section class="paper-section">
      <h3>II. Family Composition</h3>
      <div class="family-table-wrap">
        <table class="family-table">
          <thead>
            <tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows.map((row, rowIndex) => `
              <tr>
                ${FAMILY_FIELDS.map(name => `
                  <td>
                    ${readonly
                      ? escapeHtml(row[name] || "")
                      : `<input type="text" data-family-field="${escapeHtml(name)}" data-family-row="${rowIndex}" value="${escapeHtml(row[name] || "")}">`
                    }
                  </td>
                `).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function familyRows(record, fixedRows) {
  const columns = FAMILY_FIELDS.reduce((items, name) => {
    items[name] = splitLines(record[name]);
    return items;
  }, {});
  const rowCount = fixedRows || Math.max(1, ...FAMILY_FIELDS.map(name => columns[name].length));

  return Array.from({ length: rowCount }, (_, index) => {
    return FAMILY_FIELDS.reduce((row, name) => {
      row[name] = columns[name][index] || "";
      return row;
    }, {});
  });
}

function attachEditorFormHandlers() {
  const fileInput = document.getElementById("pictureInput");
  fileInput?.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      state.pictureData = String(reader.result || "");
      const preview = document.getElementById("photoPreview");
      if (preview) {
        preview.innerHTML = `<img src="${escapeHtml(state.pictureData)}" alt="Beneficiary picture">`;
      }
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("removePictureButton")?.addEventListener("click", () => {
    state.pictureData = "";
    const preview = document.getElementById("photoPreview");
    if (preview) preview.innerHTML = "<span>Picture</span>";
  });
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
    record[name] = input.value;
  });

  FAMILY_FIELDS.forEach(name => {
    const values = [...elements.pageRoot.querySelectorAll(`[data-family-field="${name}"]`)]
      .map(input => input.value.trim())
      .filter(Boolean);
    record[name] = values.join("\n");
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

  elements.pageRoot.innerHTML = `
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
              ${columns.map(column => `<td>${escapeHtml(record[column.name] || "")}</td>`).join("")}
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

function printableSections(record) {
  const sectionNames = [
    "I. Personal Information",
    "PAOFI Beneficiary",
    "III. Livelihood Information",
    "IV. Livelihood Project Interest",
    "V. Skills and Experience",
    "VI. Availability and Commitment"
  ];

  return sectionNames.map(sectionName => {
    const rows = (state.sections[sectionName] || [])
      .filter(item => item.name !== "picture_data" && !FAMILY_FIELDS.includes(item.name))
      .map(item => `
        <tr>
          <th>${escapeHtml(item.label)}</th>
          <td>${escapeHtml(record[item.name] || "").replaceAll("\n", "<br>")}</td>
        </tr>
      `)
      .join("");

    return `<h2>${escapeHtml(sectionName)}</h2><table>${rows}</table>`;
  }).join("");
}

function printRecord(record) {
  const printWindow = window.open("", "_blank", "width=940,height=760");
  if (!printWindow) {
    showToast("Allow popups to print records.");
    return;
  }

  const family = familyRows(record, null);
  const picture = record.picture_data
    ? `<img class="picture" src="${escapeHtml(record.picture_data)}" alt="">`
    : "";

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(record.control_no || "LP Record")}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1f2933; margin: 24px; }
          h1, h2, h3, p { margin: 0; }
          header { display: grid; grid-template-columns: 1fr 120px; gap: 18px; align-items: start; border-bottom: 2px solid #1f7a4f; padding-bottom: 14px; }
          h1 { font-size: 18px; }
          h2 { margin: 18px 0 7px; font-size: 14px; color: #1f7a4f; }
          .picture { width: 120px; height: 120px; object-fit: cover; border: 1px solid #9aa5a0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th, td { border: 1px solid #d6ded7; padding: 6px 8px; text-align: left; vertical-align: top; font-size: 11px; }
          th { width: 220px; background: #eef7f1; }
          .family th { width: auto; }
          button { margin-bottom: 18px; }
          @media print { button { display: none; } body { margin: 10mm; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Print</button>
        <header>
          <div>
            <h1>PAYATAS ORIONE FOUNDATION INC.</h1>
            <p>"A simple effort can make a great impact"</p>
            <h3>LIVELIHOOD PROGRAM APPLICATION FORM</h3>
            <p>${escapeHtml(record.control_no || "")} | ${escapeHtml(fullName(record))} | ${escapeHtml(record.status || "")}</p>
          </div>
          ${picture}
        </header>
        ${printableSections(record)}
        <h2>II. Family Composition</h2>
        <table class="family">
          <thead><tr>${FAMILY_FIELDS.map(name => `<th>${escapeHtml(field(name).label)}</th>`).join("")}</tr></thead>
          <tbody>
            ${family.map(row => `<tr>${FAMILY_FIELDS.map(name => `<td>${escapeHtml(row[name] || "")}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
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
