(function scholarshipModule() {
  "use strict";

  const EDUCATION_LEVELS = ["Elementary", "Junior High School", "Senior High School", "Vocational", "College"];
  const ATTENDANCE_TYPES = [
    ["Mass", "Scholar and Parent"],
    ["Activities", "Scholar"],
    ["Cleaning", "Parent"],
    ["Tutorial", "Scholar"],
    ["Community Service", "Scholar"]
  ];
  const REQUIREMENT_STATUSES = ["Missing", "Passed", "Sent to ANCOP", "Late", "Exempted"];
  const RENEWAL_DECISIONS = ["Pass", "Terminated", "Warning", "Pending", "Graduating", "Withdrawn"];
  const PAOFI_RENEWAL_ITEMS = [
    ["PREVIOUS_REPORT_CARD", "Report Cards from Previous School Year", "Quarter 1", "All"],
    ["COE_S1", "Certificate of Enrollment Q1-Q2 / Semester 1", "Quarter 1", "All"],
    ["TYL_SCAN", "Scanned Thank You Letter", "Quarter 1", "All"],
    ["TYL_PHOTO", "Photo for Thank You Letter", "Quarter 1", "All"],
    ["RENEWED_PROFILE", "Renewed Scholar Profile", "Quarter 1", "All"],
    ["PAOFI_MOA", "PAOFI Signed MOA", "Quarter 1", "All"],
    ["ANCOP_MOA", "ANCOP Signed MOA", "Quarter 1", "ANCOP"],
    ["COMMITMENT_LETTER", "Commitment Letter", "Quarter 1", "First Year College"],
    ["Q1_REPORT_CARD", "Q1 Report Card", "Quarter 2", "Non-College"],
    ["S1_Q2_REPORT_CARD", "Semester 1 / Q2 Report Card", "Quarter 2", "All"],
    ["CHRISTMAS_LETTER", "Christmas Letter", "Quarter 2", "All"],
    ["CHRISTMAS_PHOTO", "Christmas Letter Photo", "Quarter 2", "All"],
    ["Q3_REPORT_CARD", "Q3 Report Card", "Quarter 3", "Non-College"],
    ["COE_S2", "Certificate of Enrollment Q3-Q4 / Semester 2", "Quarter 3", "College"],
    ["APR", "Annual Progress Report", "Quarter 3", "All"],
    ["APR_PHOTO", "Annual Progress Report Photo", "Quarter 3", "All"],
    ["S2_Q4_REPORT_CARD", "Semester 2 / Q4 Report Card", "Quarter 4", "All"]
  ];
  const state = {
    context: null,
    meta: null,
    pages: {},
    donationEntity: "pledges",
    academicEntity: "grades",
    renewalEntity: "renewals",
    evaluationEntity: "renewalEvaluations"
  };

  const FORM_DEFINITIONS = {
    chapels: {
      title: "Chapel Coordination",
      fields: [
        { name: "chapel_code", label: "Chapel Code", required: true, readonly: true },
        { name: "chapel_name", label: "Chapel", required: true, readonly: true },
        { name: "coordinator_name", label: "Chapel Coordinator" },
        { name: "coordinator_contact", label: "Coordinator Contact" },
        { name: "assistant_coordinator_name", label: "Assistant Coordinator" },
        { name: "assistant_contact", label: "Assistant Contact" },
        { name: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
        { name: "notes", label: "Notes", type: "textarea", wide: true }
      ]
    },
    academicYears: {
      title: "Academic Year",
      fields: [
        { name: "label", label: "School Year", required: true, placeholder: "2026-2027" },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "status", label: "Status", type: "select", options: ["Planned", "Active", "Closed"] }
      ]
    },
    academicPeriods: {
      title: "Academic Period",
      fields: [
        { name: "academic_year_id", label: "Academic Year", type: "lookup", entity: "academicYears", key: "label", required: true },
        { name: "period_name", label: "Period Name", required: true, placeholder: "First Quarter" },
        { name: "period_type", label: "Period Type", type: "select", options: ["Quarter", "Semester", "Trimester", "Custom"] },
        { name: "period_order", label: "Display Order", type: "number", min: 0 },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" }
      ]
    },
    enrollments: {
      title: "Yearly Enrollment",
      fields: [
        { name: "scholar_id", label: "Scholar", type: "lookup", entity: "scholars", key: "scholar_name", required: true },
        { name: "academic_year_id", label: "Academic Year", type: "lookup", entity: "academicYears", key: "label", required: true },
        { name: "school_name", label: "School" },
        { name: "education_level", label: "Education Level", type: "select", options: EDUCATION_LEVELS, required: true },
        { name: "grade_or_year", label: "Grade / Year Level" },
        { name: "course", label: "Course / Track" },
        { name: "scholarship_category", label: "Scholarship Category" },
        { name: "admission_date", label: "Admission Date", type: "date" },
        { name: "scholarship_status", label: "Scholarship Status", type: "select", options: ["Active", "On Hold", "Completed", "Withdrawn"] },
        { name: "renewal_status", label: "Renewal Status", type: "select", options: ["Not Started", "In Progress", "Submitted", "Approved", "Declined"] },
        { name: "coverage_status", label: "Sponsor Coverage", type: "select", options: ["Unassigned", "Partial", "Covered"] },
        { name: "notes", label: "Notes", type: "textarea", wide: true }
      ]
    },
    sponsorships: {
      title: "Sponsor Assignment",
      fields: [
        { name: "sponsor_id", label: "Sponsor", type: "lookup", entity: "sponsors", key: "sponsor_name", required: true },
        { name: "enrollment_id", label: "Scholar Enrollment", type: "lookup", entity: "enrollments", key: "enrollment_label", required: true },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "commitment_amount_php", label: "Commitment Amount (PHP)", type: "number", min: 0, step: "0.01" },
        { name: "frequency", label: "Frequency", type: "select", options: ["One-time", "Monthly", "Quarterly", "Semester", "Annual"] },
        { name: "status", label: "Status", type: "select", options: ["Active", "Completed", "Cancelled"] },
        { name: "notes", label: "Notes", type: "textarea", wide: true }
      ]
    },
    pledges: {
      title: "Pledge",
      fields: [
        { name: "pledge_no", label: "Pledge No.", readonly: true, placeholder: "Generated on save" },
        { name: "sponsor_id", label: "Sponsor", type: "lookup", entity: "sponsors", key: "sponsor_name", required: true },
        { name: "sponsorship_id", label: "Sponsor Assignment", type: "lookup", entity: "sponsorships", key: "sponsorship_label", allowBlank: true },
        { name: "scholar_id", label: "Restricted Scholar", type: "lookup", entity: "scholars", key: "scholar_name", allowBlank: true },
        { name: "enrollment_id", label: "Restricted Enrollment", type: "lookup", entity: "enrollments", key: "enrollment_label", allowBlank: true },
        { name: "pledge_date", label: "Pledge Date", type: "date", required: true },
        { name: "due_date", label: "Due Date", type: "date" },
        { name: "purpose_type", label: "Purpose", type: "select", options: ["Unrestricted", "Scholar-specific"] },
        { name: "frequency", label: "Frequency", type: "select", options: ["One-time", "Monthly", "Quarterly", "Semester", "Annual"] },
        { name: "amount_php", label: "Amount in PHP", type: "number", min: 0.01, step: "0.01", required: true },
        { name: "source_currency", label: "Source Currency", placeholder: "PHP" },
        { name: "source_amount", label: "Source Amount", type: "number", min: 0, step: "0.01" },
        { name: "exchange_rate", label: "Exchange Rate to PHP", type: "number", min: 0, step: "0.0001" },
        { name: "conversion_date", label: "Conversion Date", type: "date" },
        { name: "status", label: "Status", type: "select", options: ["Open", "Fulfilled", "Cancelled"] },
        { name: "notes", label: "Notes", type: "textarea", wide: true }
      ]
    },
    invoices: {
      title: "Service Invoice",
      fields: [
        { name: "invoice_no", label: "Invoice No.", readonly: true, placeholder: "Assigned when issued" },
        { name: "sponsor_id", label: "Sponsor", type: "lookup", entity: "sponsors", key: "sponsor_name", required: true },
        { name: "pledge_id", label: "Pledge", type: "lookup", entity: "pledges", key: "pledge_label", allowBlank: true },
        { name: "issue_date", label: "Issue Date", type: "date" },
        { name: "due_date", label: "Due Date", type: "date" },
        { name: "amount_php", label: "Amount in PHP", type: "number", min: 0.01, step: "0.01", required: true },
        { name: "status", label: "Status", type: "select", options: ["Draft"], readonly: true },
        { name: "notes", label: "Particulars / Notes", type: "textarea", wide: true }
      ]
    },
    payments: {
      title: "Donation Payment",
      fields: [
        { name: "payment_no", label: "Payment No.", readonly: true, placeholder: "Generated on save" },
        { name: "sponsor_id", label: "Sponsor", type: "lookup", entity: "sponsors", key: "sponsor_name", required: true },
        { name: "pledge_id", label: "Pledge", type: "lookup", entity: "pledges", key: "pledge_label", allowBlank: true },
        { name: "invoice_id", label: "Issued Service Invoice", type: "lookup", entity: "invoices", key: "invoice_label", allowBlank: true },
        { name: "payment_date", label: "Payment Date", type: "date", required: true },
        { name: "amount_php", label: "Amount in PHP", type: "number", min: 0.01, step: "0.01", required: true },
        { name: "source_currency", label: "Source Currency", placeholder: "PHP" },
        { name: "source_amount", label: "Source Amount", type: "number", min: 0, step: "0.01" },
        { name: "exchange_rate", label: "Exchange Rate to PHP", type: "number", min: 0, step: "0.0001" },
        { name: "conversion_date", label: "Conversion Date", type: "date" },
        { name: "payment_method", label: "Payment Method", type: "select", options: ["Cash", "Bank Transfer", "Check", "Online Payment", "Other"] },
        { name: "reference_no", label: "Reference No." },
        { name: "status", label: "Status", type: "select", options: ["Pending", "Cleared"] },
        { name: "notes", label: "Notes", type: "textarea", wide: true }
      ]
    },
    receipts: {
      title: "Official Receipt",
      fields: [
        { name: "receipt_no", label: "Receipt No.", readonly: true, placeholder: "Assigned when issued" },
        { name: "payment_id", label: "Cleared Payment", type: "lookup", entity: "payments", key: "payment_label", required: true },
        { name: "issue_date", label: "Issue Date", type: "date" },
        { name: "amount_php", label: "Amount in PHP", type: "number", min: 0.01, step: "0.01", required: true },
        { name: "status", label: "Status", type: "select", options: ["Draft"], readonly: true },
        { name: "notes", label: "Notes", type: "textarea", wide: true }
      ]
    },
    allocations: {
      title: "Fund Allocation",
      fields: [
        { name: "payment_id", label: "Cleared Payment", type: "lookup", entity: "payments", key: "payment_label", required: true },
        { name: "scholar_id", label: "Scholar", type: "lookup", entity: "scholars", key: "scholar_name", allowBlank: true },
        { name: "enrollment_id", label: "Yearly Enrollment", type: "lookup", entity: "enrollments", key: "enrollment_label", allowBlank: true },
        { name: "allocation_date", label: "Allocation Date", type: "date", required: true },
        { name: "allocation_type", label: "Allocation Type", type: "select", options: ["Unrestricted", "Scholar-specific"] },
        { name: "purpose", label: "Purpose" },
        { name: "amount_php", label: "Amount in PHP", type: "number", min: 0.01, step: "0.01", required: true },
        { name: "notes", label: "Notes", type: "textarea", wide: true }
      ]
    },
    documentSettings: {
      title: "Financial Document Setup",
      fields: [
        { name: "effective_year", label: "Effective Year", type: "number", min: 2000, max: 2100, required: true },
        { name: "organization_name", label: "Registered Organization Name", required: true, wide: true },
        { name: "registered_address", label: "Registered Address", type: "textarea", wide: true },
        { name: "tax_identifier", label: "Organization Tax Identifier" },
        { name: "contact_details", label: "Contact Details" },
        { name: "service_invoice_prefix", label: "Service Invoice Prefix", required: true },
        { name: "official_receipt_prefix", label: "Official Receipt Prefix", required: true },
        { name: "invoice_serial_start", label: "Invoice Serial Start", type: "number", min: 1, required: true },
        { name: "invoice_serial_end", label: "Invoice Serial End", type: "number", min: 1, required: true },
        { name: "receipt_serial_start", label: "Receipt Serial Start", type: "number", min: 1, required: true },
        { name: "receipt_serial_end", label: "Receipt Serial End", type: "number", min: 1, required: true },
        { name: "accountant_approved", label: "Accountant Approved", type: "checkbox" },
        { name: "status", label: "Status", type: "select", options: ["Draft", "Active"] },
        { name: "notes", label: "Approval / Template Notes", type: "textarea", wide: true }
      ]
    },
    grades: {
      title: "Grade Record",
      fields: [
        { name: "enrollment_id", label: "Scholar Enrollment", type: "lookup", entity: "enrollments", key: "enrollment_label", required: true },
        { name: "academic_period_id", label: "Academic Period", type: "lookup", entity: "academicPeriods", key: "period_label", required: true },
        { name: "subject_name", label: "Subject", required: true },
        { name: "subject_order", label: "Subject Order", type: "number", min: 0 },
        { name: "grading_scale", label: "Grading Scale", type: "select", options: ["Percentage", "GPA", "Letter Grade", "Pass/Fail"] },
        { name: "grade_value", label: "Grade", required: true },
        { name: "credit_units", label: "Units (SHS / College)", type: "number", min: 0, step: "0.01" },
        { name: "standardized_score", label: "Standardized Score (Optional)", type: "number", min: 0, max: 100, step: "0.01" },
        { name: "remarks", label: "Remarks", type: "textarea", wide: true },
        { name: "status", label: "Status", type: "select", options: ["Recorded", "Final"] }
      ]
    },
    events: {
      title: "PAOFI Activity",
      fields: [
        { name: "event_title", label: "Activity / Event", required: true },
        { name: "event_type", label: "Monitoring Type", type: "select", options: ATTENDANCE_TYPES.map(item => item[0]) },
        { name: "participant_scope", label: "Participants", type: "select", options: ["Scholar", "Parent", "Scholar and Parent"], readonly: true },
        { name: "academic_year_id", label: "Academic Year", type: "lookup", entity: "academicYears", key: "label", allowBlank: true },
        { name: "chapel_id", label: "Chapel", type: "lookup", entity: "chapels", key: "chapel_name", allowBlank: true },
        { name: "event_date", label: "Date", type: "date", required: true },
        { name: "location", label: "Location" },
        { name: "required", label: "Required Activity", type: "checkbox" },
        { name: "notes", label: "Notes", type: "textarea", wide: true }
      ]
    }
  };

  const LIST_COLUMNS = {
    chapels: [["chapel_name", "Chapel"], ["coordinator_name", "Coordinator"], ["assistant_coordinator_name", "Assistant Coordinator"], ["status", "Status"]],
    scholars: [
      ["scholar_no", "Scholar No."], ["scholar_name", "Scholar"], ["birth_date", "Birth Date"],
      ["gender", "Gender"], ["chapel_name", "Chapel"], ["status", "Status"]
    ],
    sponsors: [
      ["sponsor_no", "Sponsor No."], ["sponsor_name", "Sponsor"], ["sponsor_type", "Type"],
      ["contact_person", "Contact Person"], ["status", "Status"]
    ],
    academicYears: [["label", "School Year"], ["start_date", "Start"], ["end_date", "End"], ["status", "Status"]],
    academicPeriods: [["academic_year_label", "School Year"], ["period_name", "Period"], ["period_type", "Type"], ["period_order", "Order"]],
    enrollments: [["scholar_name", "Scholar"], ["academic_year_label", "School Year"], ["school_name", "School"], ["education_level", "Level"], ["grade_or_year", "Grade / Year"], ["scholarship_category", "Category"], ["scholarship_status", "Status"]],
    sponsorships: [["sponsor_name", "Sponsor"], ["scholar_name", "Scholar"], ["academic_year_label", "School Year"], ["commitment_amount_php", "Commitment"], ["frequency", "Frequency"], ["status", "Status"]],
    pledges: [["pledge_no", "Pledge No."], ["sponsor_name", "Sponsor"], ["pledge_date", "Date"], ["purpose_type", "Purpose"], ["amount_php", "Amount"], ["status", "Status"]],
    invoices: [["invoice_no", "Invoice No."], ["sponsor_name", "Sponsor"], ["issue_date", "Issue Date"], ["amount_php", "Amount"], ["status", "Status"]],
    payments: [["payment_no", "Payment No."], ["sponsor_name", "Sponsor"], ["payment_date", "Date"], ["amount_php", "Amount"], ["payment_method", "Method"], ["status", "Status"]],
    receipts: [["receipt_no", "Receipt No."], ["payment_no", "Payment"], ["issue_date", "Issue Date"], ["amount_php", "Amount"], ["status", "Status"]],
    allocations: [["allocation_date", "Date"], ["payment_no", "Payment"], ["scholar_name", "Scholar"], ["allocation_type", "Type"], ["purpose", "Purpose"], ["amount_php", "Amount"]],
    documentSettings: [["effective_year", "Year"], ["organization_name", "Organization"], ["service_invoice_prefix", "Invoice Prefix"], ["official_receipt_prefix", "Receipt Prefix"], ["accountant_approved", "Approved"], ["status", "Status"]],
    grades: [["scholar_name", "Scholar"], ["academic_year_label", "School Year"], ["period_name", "Period"], ["subject_name", "Subject"], ["grading_scale", "Scale"], ["grade_value", "Grade"], ["credit_units", "Units"]],
    events: [["event_date", "Date"], ["event_title", "Activity"], ["event_type", "Type"], ["participant_scope", "Participants"], ["chapel_name", "Chapel"], ["required", "Required"]],
    renewalTemplates: [["template_name", "Template"], ["version", "Version"], ["education_level", "Level"], ["status", "Status"]],
    renewals: [["scholar_name", "Scholar"], ["academic_year_label", "School Year"], ["template_name", "Checklist"], ["due_date", "Final Deadline"], ["status", "Status"]],
    renewalEvaluations: [["scholar_name", "Scholar"], ["academic_year_label", "School Year"], ["report_card_score", "Report Card"], ["tutorial_activities_score", "Tutorial / Activities"], ["parent_service_score", "Parent / Service"], ["compliance_score", "Compliance"], ["mass_score", "Mass"], ["adjustment_score", "Adjustment"], ["overall_rating", "Overall Rating"], ["ranking", "Rank"], ["numerical_evaluation", "Numerical"], ["coordinator_evaluation", "Coordinator"], ["education_team_evaluation", "Education Team"], ["overall_evaluation", "Final Decision"]],
    evaluationTemplates: [["template_name", "Template"], ["version", "Version"], ["education_level", "Level"], ["scale_min", "Minimum"], ["scale_max", "Maximum"], ["status", "Status"]],
    evaluations: [["scholar_name", "Scholar"], ["academic_year_label", "School Year"], ["template_name", "Evaluation"], ["evaluation_date", "Date"], ["overall_score", "Score"], ["status", "Status"]]
  };

  function ctx() {
    return state.context;
  }

  function escapeHtml(value) {
    return ctx().escapeHtml(String(value ?? ""));
  }

  function icon(name) {
    return ctx().icon(name);
  }

  function formatMoney(value) {
    return ctx().formatMoney(Number(value || 0));
  }

  function displayDate(value) {
    const text = String(value || "");
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
    return match ? `${match[2]}/${match[3]}/${match[1]}` : text;
  }

  function todayDate() {
    const value = new Date();
    value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
    return value.toISOString().slice(0, 10);
  }

  function ageFromBirthDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!match) return "";
    const today = new Date();
    let age = today.getFullYear() - Number(match[1]);
    if (today.getMonth() + 1 < Number(match[2]) || (today.getMonth() + 1 === Number(match[2]) && today.getDate() < Number(match[3]))) age -= 1;
    return age >= 0 ? String(age) : "";
  }

  function displayValue(field, value) {
    if (field.includes("amount") || field === "commitment_amount_php" || field === "overall_score" || field === "monthly_income" || field === "household_contribution") {
      return field === "overall_score" ? escapeHtml(value || "0") : escapeHtml(formatMoney(value));
    }
    if (field.endsWith("_date") || field === "birth_date" || field === "start_date" || field === "end_date" || field === "due_date") {
      return escapeHtml(displayDate(value));
    }
    if (field === "required") return Number(value) ? "Yes" : "No";
    return escapeHtml(value || "");
  }

  function roles() {
    if (ctx().currentUser?.role === "superadmin") return new Set(["superadmin"]);
    return new Set(state.meta?.assigned_roles || ctx().currentUser?.program_roles?.scholarship || []);
  }

  function canWrite(entity) {
    const assigned = roles();
    if (assigned.has("superadmin")) return true;
    return (state.meta?.permissions?.[entity] || []).some(role => assigned.has(role));
  }

  function canOfficer() {
    const assigned = roles();
    return assigned.has("superadmin") || assigned.has("program_officer");
  }

  function canFinance() {
    const assigned = roles();
    return assigned.has("superadmin") || assigned.has("finance");
  }

  async function entityList(entity, options = {}) {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) params.set(key, value);
    });
    return ctx().api(`/api/scholarship/entities/${entity}?${params.toString()}`);
  }

  async function entityGet(entity, id) {
    return (await ctx().api(`/api/scholarship/entities/${entity}/${id}`)).record;
  }

  async function entitySave(entity, record) {
    return (await ctx().api(`/api/scholarship/entities/${entity}`, {
      method: "POST",
      loadingMessage: "Saving Scholarship record",
      body: JSON.stringify(record)
    })).record;
  }

  async function entityDelete(entity, id) {
    return ctx().api(`/api/scholarship/entities/${entity}/${id}`, { method: "DELETE" });
  }

  function pageNumber(key) {
    return Math.max(1, Number(state.pages[key] || 1));
  }

  function pageSize() {
    return 25;
  }

  function pagination(key, total) {
    const page = pageNumber(key);
    const pages = Math.max(1, Math.ceil(Number(total || 0) / pageSize()));
    return `
      <div class="scholarship-pagination">
        <span>Page ${page} of ${pages}</span>
        <div>
          <button type="button" class="icon-button" data-scholar-page="${key}" data-page-value="${Math.max(1, page - 1)}" ${page <= 1 ? "disabled" : ""} title="Previous page">${icon("arrow")}</button>
          <button type="button" class="icon-button next" data-scholar-page="${key}" data-page-value="${Math.min(pages, page + 1)}" ${page >= pages ? "disabled" : ""} title="Next page">${icon("arrow")}</button>
        </div>
      </div>
    `;
  }

  function copyButton(label) {
    return `<button type="button" class="icon-button chart-copy-button" data-copy-chart title="Copy ${escapeHtml(label)} as image">${icon("copy")}</button>`;
  }

  function barChart(title, data, className = "") {
    const rows = Array.isArray(data) ? data : [];
    const max = Math.max(1, ...rows.map(item => Number(item.count || 0)));
    return `
      <article class="scholarship-chart ${className}" data-chart-copy-surface data-chart-copy-name="${escapeHtml(title)}">
        <header><div><span>Scholarship analytics</span><h3>${escapeHtml(title)}</h3></div>${copyButton(title)}</header>
        <div class="scholarship-bars">
          ${rows.length ? rows.map(item => `
            <div class="scholarship-bar-row">
              <span>${escapeHtml(item.label)}</span>
              <div><i style="width:${Math.max(3, Number(item.count || 0) / max * 100)}%"></i></div>
              <strong>${Number(item.count || 0)}</strong>
            </div>
          `).join("") : `<div class="scholarship-chart-empty">No records yet</div>`}
        </div>
      </article>
    `;
  }

  function metricStrip(items) {
    return `
      <div class="scholarship-metric-strip">
        ${items.map(item => `
          <div>
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
            <small>${escapeHtml(item.note || "")}</small>
          </div>
        `).join("")}
      </div>
    `;
  }

  function workspaceHeader(title, copy, actions = "") {
    return `
      <section class="scholarship-command-band">
        <div>
          <p class="eyebrow">Scholarship Program</p>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(copy)}</p>
        </div>
        <div class="scholarship-command-actions">${actions}</div>
      </section>
    `;
  }

  function actionButton(label, action, iconName, primary = false) {
    return `<button type="button" class="action-button${primary ? " primary" : ""}" data-scholar-action="${action}"><span class="button-icon">${icon(iconName)}</span><span>${escapeHtml(label)}</span></button>`;
  }

  function table(entity, records, options = {}) {
    const columns = options.columns || LIST_COLUMNS[entity] || [];
    if (!records.length) return `<div class="scholarship-empty"><strong>No records yet</strong><span>Use the available action to create the first record.</span></div>`;
    return `
      <div class="data-table-scroll scholarship-table-scroll">
        <table class="data-table scholarship-table">
          <thead><tr><th class="sticky-column">${options.selectable ? `<input type="checkbox" data-scholar-select-all="${entity}" aria-label="Select all visible ${escapeHtml(entity)} records">` : ""}<span>Actions</span></th>${columns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join("")}</tr></thead>
          <tbody>${records.map(record => `
            <tr>
              <td class="sticky-column">
                <div class="table-actions">
                  ${options.selectable ? `<input type="checkbox" data-scholar-select-row="${entity}" value="${record.id}" aria-label="Select ${escapeHtml(record.scholar_name || record.template_name || `record ${record.id}`)}">` : ""}
                  ${options.view !== false ? `<button type="button" class="icon-button" data-scholar-view="${entity}:${record.id}" title="View">${icon("view")}</button>` : ""}
                  ${canWrite(entity) && options.edit !== false ? `<button type="button" class="icon-button" data-scholar-edit="${entity}:${record.id}" title="Edit">${icon("edit")}</button>` : ""}
                  ${options.print ? `<button type="button" class="icon-button" data-scholar-print="${entity}:${record.id}" title="Print">${icon("print")}</button>` : ""}
                  ${options.extraActions ? options.extraActions(record) : ""}
                </div>
              </td>
              ${columns.map(([field]) => `<td>${displayValue(field, record[field])}</td>`).join("")}
            </tr>
          `).join("")}</tbody>
        </table>
      </div>
    `;
  }

  function searchToolbar(entity, total, extraFilters = "") {
    const searchLabel = FORM_DEFINITIONS[entity]?.title || (entity === "renewalEvaluations" ? "weighted renewal evaluation" : entity);
    return `
      <div class="scholarship-data-toolbar">
        <div class="search-band">
          <span>${icon("search")}</span>
          <input type="search" data-scholar-search="${entity}" placeholder="Search ${escapeHtml(searchLabel)} records">
        </div>
        ${extraFilters}
        <span>${Number(total || 0)} records</span>
      </div>
    `;
  }

  function modalShell(title, subtitle, body, actions = "") {
    const overlay = document.createElement("div");
    overlay.className = "modal-backdrop scholarship-modal-backdrop";
    overlay.innerHTML = `
      <section class="modal-panel scholarship-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <header class="scholarship-modal-header">
          <div><p class="eyebrow">Scholarship Program</p><h2>${escapeHtml(title)}</h2><span>${escapeHtml(subtitle || "")}</span></div>
          <button type="button" class="icon-button" data-modal-close title="Close">&#215;</button>
        </header>
        <div class="scholarship-modal-body">${body}</div>
        ${actions ? `<footer class="scholarship-modal-footer">${actions}</footer>` : ""}
      </section>
    `;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector("[data-modal-close]")?.addEventListener("click", close);
    overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
    return { overlay, close };
  }

  async function lookupRows(entity) {
    const payload = await entityList(entity, { limit: 500, offset: 0 });
    return (payload.records || []).map(record => {
      if (entity === "scholars") record.scholar_name = record.scholar_name || [record.last_name, record.first_name, record.middle_name].filter(Boolean).join(", ");
      if (entity === "enrollments") record.enrollment_label = `${record.scholar_name || "Scholar"} | ${record.academic_year_label || "Year"} | ${record.school_name || "School"}`;
      if (entity === "academicPeriods") record.period_label = `${record.academic_year_label || "Year"} | ${record.period_name}`;
      if (entity === "sponsorships") record.sponsorship_label = `${record.sponsor_name || "Sponsor"} | ${record.scholar_name || "Scholar"}`;
      if (entity === "pledges") record.pledge_label = `${record.pledge_no || "Draft"} | ${record.sponsor_name || "Sponsor"} | ${formatMoney(record.amount_php)}`;
      if (entity === "invoices") record.invoice_label = `${record.invoice_no || "Draft"} | ${record.sponsor_name || "Sponsor"} | ${formatMoney(record.amount_php)}`;
      if (entity === "payments") record.payment_label = `${record.payment_no || "Payment"} | ${record.sponsor_name || "Sponsor"} | ${formatMoney(record.amount_php)}`;
      return record;
    });
  }

  async function fieldHtml(field, value, lookupCache) {
    const required = field.required ? " required" : "";
    const readonly = field.readonly ? " readonly" : "";
    const wide = field.wide ? " wide" : "";
    const escaped = escapeHtml(value ?? "");
    if (field.type === "textarea") {
      return `<label class="${wide}"><span>${escapeHtml(field.label)}</span><textarea name="${field.name}" rows="3"${required}${readonly}>${escaped}</textarea></label>`;
    }
    if (field.type === "select") {
      return `<label class="${wide}"><span>${escapeHtml(field.label)}</span><select name="${field.name}"${required}${readonly}>${field.options.map(option => `<option value="${escapeHtml(option)}" ${String(value || "") === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select></label>`;
    }
    if (field.type === "lookup") {
      const rows = lookupCache[field.entity] || [];
      return `<label class="${wide}"><span>${escapeHtml(field.label)}</span><select name="${field.name}"${required}><option value="">${field.allowBlank ? "None" : "Select"}</option>${rows.map(row => `<option value="${row.id}" ${Number(value) === Number(row.id) ? "selected" : ""}>${escapeHtml(row[field.key] || row.id)}</option>`).join("")}</select></label>`;
    }
    if (field.type === "checkbox") {
      return `<label class="checkbox-row ${wide}"><input type="checkbox" name="${field.name}" ${Number(value ?? 1) ? "checked" : ""}><span>${escapeHtml(field.label)}</span></label>`;
    }
    return `<label class="${wide}"><span>${escapeHtml(field.label)}</span><input name="${field.name}" type="${field.type || "text"}" value="${escaped}" placeholder="${escapeHtml(field.placeholder || "")}"${required}${readonly}${field.min !== undefined ? ` min="${field.min}"` : ""}${field.step ? ` step="${field.step}"` : ""}></label>`;
  }

  async function openSimpleEditor(entity, id = 0, afterSave = null, seed = {}) {
    const definition = FORM_DEFINITIONS[entity];
    if (!definition) throw new Error("This editor is not configured.");
    const record = id ? await entityGet(entity, id) : { ...seed };
    const lookupEntities = [...new Set(definition.fields.filter(field => field.type === "lookup").map(field => field.entity))];
    const lookupCache = {};
    await Promise.all(lookupEntities.map(async lookupEntity => { lookupCache[lookupEntity] = await lookupRows(lookupEntity); }));
    const fields = [];
    for (const field of definition.fields) fields.push(await fieldHtml(field, record[field.name], lookupCache));
    const { overlay, close } = modalShell(
      `${id ? "Edit" : "New"} ${definition.title}`,
      id ? "Update the record and save your changes." : "Complete the required fields.",
      `<form id="scholarshipSimpleForm" class="scholarship-form-grid">${fields.join("")}</form>`,
      `<button type="button" class="action-button" data-modal-cancel>Cancel</button><button type="submit" form="scholarshipSimpleForm" class="action-button primary"><span class="button-icon">${icon("save")}</span><span>Save</span></button>`
    );
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    const form = overlay.querySelector("#scholarshipSimpleForm");
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const payload = { ...record, id: id || undefined };
      for (const field of definition.fields) {
        const input = form.elements[field.name];
        if (!input || field.readonly && !input.value) continue;
        payload[field.name] = field.type === "checkbox" ? input.checked : input.value;
      }
      try {
        const saved = await entitySave(entity, payload);
        ctx().showToast(`${definition.title} saved.`);
        close();
        if (afterSave) await afterSave(saved);
      } catch (error) {
        ctx().showToast(error.message);
      }
    });
  }

  async function openGradeEditor(id = 0) {
    const [record, enrollments, periods] = await Promise.all([
      id ? entityGet("grades", id) : Promise.resolve({ grading_scale: "Percentage", status: "Recorded", subject_order: 0 }),
      lookupRows("enrollments"),
      lookupRows("academicPeriods")
    ]);
    const coreSubjects = ["Filipino", "English", "Mathematics", "Science", "Araling Panlipunan", "TLE", "MAPEH", "ESP"];
    const { overlay, close } = modalShell(
      id ? "Edit Grade Record" : "New Grade Record",
      "Elementary and JHS use quarterly subject grades. SHS and College records include subject units for weighted GWA.",
      `<form id="gradeRecordForm" class="scholarship-form-grid">
        <label class="wide"><span>Scholar Enrollment</span><select name="enrollment_id" required><option value="">Select</option>${enrollments.map(item => `<option value="${item.id}" ${Number(record.enrollment_id) === Number(item.id) ? "selected" : ""}>${escapeHtml(item.enrollment_label)}</option>`).join("")}</select></label>
        <div class="grade-model-note wide" id="gradeModelNote"></div>
        <label><span>Academic Period</span><select name="academic_period_id" required><option value="">Select</option>${periods.map(item => `<option value="${item.id}" ${Number(record.academic_period_id) === Number(item.id) ? "selected" : ""}>${escapeHtml(item.period_label)}</option>`).join("")}</select></label>
        <label><span>Subject</span><input name="subject_name" list="paofiCoreSubjects" value="${escapeHtml(record.subject_name || "")}" required><datalist id="paofiCoreSubjects">${coreSubjects.map(value => `<option value="${value}">`).join("")}</datalist></label>
        <label><span>Subject Order</span><input name="subject_order" type="number" min="0" value="${Number(record.subject_order || 0)}"></label>
        <label><span>Grading Scale</span><select name="grading_scale">${["Percentage", "GPA", "Letter Grade", "Pass/Fail"].map(value => `<option ${record.grading_scale === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
        <label><span>Grade</span><input name="grade_value" value="${escapeHtml(record.grade_value || "")}" required></label>
        <label><span>Units</span><input name="credit_units" type="number" min="0" step="0.01" value="${escapeHtml(record.credit_units ?? "")}"></label>
        <label><span>Standardized Score</span><input name="standardized_score" type="number" min="0" max="100" step="0.01" value="${escapeHtml(record.standardized_score ?? "")}" placeholder="Optional 0-100"></label>
        <label><span>Status</span><select name="status">${["Recorded", "Final"].map(value => `<option ${record.status === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
        <label class="wide"><span>Remarks</span><textarea name="remarks">${escapeHtml(record.remarks || "")}</textarea></label>
      </form>`,
      `<button type="button" class="action-button" data-modal-cancel>Cancel</button><button type="submit" form="gradeRecordForm" class="action-button primary">Save Grade</button>`
    );
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    const form = overlay.querySelector("#gradeRecordForm");
    const enrollmentSelect = form.elements.enrollment_id;
    const updateModel = () => {
      const enrollment = enrollments.find(item => Number(item.id) === Number(enrollmentSelect.value));
      const senior = /Senior High|College/i.test(enrollment?.education_level || "");
      overlay.querySelector("#gradeModelNote").innerHTML = senior
        ? `<strong>SHS / College subject-and-unit model</strong><span>Units are required. GWA is calculated only within the recorded grading scale.</span>`
        : `<strong>Elementary / Junior High quarterly model</strong><span>Core subjects follow the PAOFI monitoring sheet. Science starts at Grade 3 and TLE at Grade 4.</span>`;
      form.elements.credit_units.required = senior;
    };
    enrollmentSelect.addEventListener("change", updateModel);
    updateModel();
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      try { await entitySave("grades", { ...record, ...data, id: id || undefined }); close(); await renderGradesPage(); } catch (error) { ctx().showToast(error.message); }
    });
  }

  function dynamicRows(container, rowClass, values, template) {
    container.innerHTML = (values.length ? values : [{}]).map((value, index) => template(value, index)).join("");
    if (container.dataset.dynamicRowsBound !== "1") {
      container.dataset.dynamicRowsBound = "1";
      container.addEventListener("click", event => {
        const button = event.target.closest("[data-remove-row]");
        if (!button) return;
        button.closest(`.${rowClass}`)?.remove();
        if (!container.querySelector(`.${rowClass}`)) container.insertAdjacentHTML("beforeend", template({}, 0));
      });
    }
  }

  function collectRows(container, rowClass, fields) {
    return [...container.querySelectorAll(`.${rowClass}`)].map(row => {
      const output = {};
      fields.forEach(field => { output[field] = row.querySelector(`[name="${field}"]`)?.value || ""; });
      return output;
    }).filter(row => Object.values(row).some(Boolean));
  }

  async function openScholarEditor(id = 0, afterSave = null) {
    const [record, chapels] = await Promise.all([
      id ? entityGet("scholars", id) : Promise.resolve({ status: "Active", household_members: [], document_links: [] }),
      lookupRows("chapels")
    ]);
    const { overlay, close } = modalShell(
      id ? "Edit Scholar Profile" : "New Scholar Profile",
      "Permanent personal and household information. School-year details are recorded separately.",
      `<form id="scholarProfileForm" class="scholar-profile-form">
        <section class="scholar-photo-editor">
          <div class="scholar-photo-preview">${record.picture_data ? `<img src="${record.picture_data}" alt="Scholar">` : `<span>${icon("users")}</span><strong>Scholar photo</strong>`}</div>
          <input type="file" id="scholarPhotoInput" accept="image/*">
          <input type="hidden" name="picture_data" value="${escapeHtml(record.picture_data || "")}">
        </section>
        <section class="scholar-form-section">
          <h3>I. Personal Information</h3>
          <div class="scholarship-form-grid">
            <label><span>Scholar No.</span><input name="scholar_no" value="${escapeHtml(record.scholar_no || "")}" placeholder="Generated on save" readonly></label>
            <label><span>Status</span><select name="status">${["Active", "Inactive", "Graduated", "Withdrawn"].map(option => `<option ${record.status === option ? "selected" : ""}>${option}</option>`).join("")}</select></label>
            <label><span>Last Name</span><input name="last_name" value="${escapeHtml(record.last_name || "")}" required></label>
            <label><span>First Name</span><input name="first_name" value="${escapeHtml(record.first_name || "")}" required></label>
            <label><span>Middle Name</span><input name="middle_name" value="${escapeHtml(record.middle_name || "")}"></label>
            <label><span>Birth Date</span><input name="birth_date" type="date" value="${escapeHtml(record.birth_date || "")}"></label>
            <label><span>Age</span><input id="scholarAgeDisplay" value="${escapeHtml(ageFromBirthDate(record.birth_date))}" readonly></label>
            <label><span>Gender</span><select name="gender"><option value="">Select</option>${["Female", "Male", "Other", "Prefer not to say"].map(option => `<option ${record.gender === option ? "selected" : ""}>${option}</option>`).join("")}</select></label>
            <label><span>Place of Birth</span><input name="place_of_birth" value="${escapeHtml(record.place_of_birth || "")}"></label>
            <label><span>Contact No.</span><input name="contact_no" value="${escapeHtml(record.contact_no || "")}" inputmode="tel"></label>
            <label><span>Email</span><input name="email" type="email" value="${escapeHtml(record.email || "")}"></label>
            <label><span>Chapel</span><select name="chapel_id"><option value="">Select chapel</option>${chapels.filter(item => item.status === "Active" || Number(item.id) === Number(record.chapel_id)).map(item => `<option value="${item.id}" ${Number(record.chapel_id) === Number(item.id) ? "selected" : ""}>${escapeHtml(item.chapel_name)}</option>`).join("")}</select></label>
            <label><span>Hobbies</span><input name="hobbies" value="${escapeHtml(record.hobbies || "")}"></label>
            <label><span>Ambition</span><input name="ambition" value="${escapeHtml(record.ambition || "")}"></label>
            <label class="wide"><span>Home Address</span><textarea name="address" rows="2">${escapeHtml(record.address || "")}</textarea></label>
            <label class="wide"><span>Special Circumstances</span><textarea name="special_circumstances" rows="2">${escapeHtml(record.special_circumstances || "")}</textarea></label>
          </div>
        </section>
        <section class="scholar-form-section family-composition-section">
          <div class="section-title-row"><h3>II. Family Composition</h3><button type="button" class="icon-button" id="addScholarHousehold" title="Add household member">+</button></div>
          <div class="scholar-household-table">
            <div class="scholar-household-grid household-grid-header"><span>Name</span><span>Age</span><span>Birth Date</span><span>Gender</span><span>Relationship</span><span>Civil Status</span><span>Educational Attainment</span><span>Occupation</span><span>Monthly Income</span><span></span></div>
            <div id="scholarHouseholdRows" class="scholar-dynamic-rows"></div>
          </div>
          <datalist id="educationAttainmentOptions">${["No Formal Education", "Elementary Level", "Elementary Graduate", "Junior High Level", "Junior High Graduate", "Senior High Level", "Senior High Graduate", "Vocational", "College Undergraduate", "College Graduate", "Postgraduate"].map(value => `<option value="${value}">`).join("")}</datalist>
          <div class="scholarship-form-grid">
            <label class="wide"><span>Other Source of Income</span><input name="other_income_source" value="${escapeHtml(record.other_income_source || "")}"></label>
            <label><span>Birth Order</span><input name="birth_order" value="${escapeHtml(record.birth_order || "")}" placeholder="Example: 1st"></label>
            <label><span>Total Number of Siblings</span><input name="total_siblings" type="number" min="0" value="${escapeHtml(record.total_siblings ?? 0)}"></label>
            <label><span>Number of Married Siblings</span><input name="married_siblings" type="number" min="0" value="${escapeHtml(record.married_siblings ?? 0)}"></label>
            <label><span>Household Contribution</span><input name="household_contribution" type="number" min="0" step="0.01" value="${escapeHtml(record.household_contribution ?? 0)}"></label>
          </div>
        </section>
        <section class="scholar-form-section">
          <h3>Primary Guardian and Profile Notes</h3>
          <div class="scholarship-form-grid">
            <label><span>Guardian Name</span><input name="guardian_name" value="${escapeHtml(record.guardian_name || "")}"></label>
            <label><span>Relationship</span><input name="guardian_relationship" value="${escapeHtml(record.guardian_relationship || "")}"></label>
            <label><span>Contact No.</span><input name="guardian_contact" value="${escapeHtml(record.guardian_contact || "")}" inputmode="tel"></label>
            <label class="wide"><span>Profile Notes</span><textarea name="notes" rows="2">${escapeHtml(record.notes || "")}</textarea></label>
          </div>
        </section>
        <section class="scholar-form-section">
          <div class="section-title-row"><h3>Supporting Document Links</h3><button type="button" class="icon-button" id="addScholarDocument" title="Add document link">+</button></div>
          <div id="scholarDocumentRows" class="scholar-dynamic-rows"></div>
        </section>
      </form>`,
      `<button type="button" class="action-button" data-modal-cancel>Cancel</button><button type="submit" form="scholarProfileForm" class="action-button primary"><span class="button-icon">${icon("save")}</span><span>Save Profile</span></button>`
    );
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    const householdHost = overlay.querySelector("#scholarHouseholdRows");
    const documentHost = overlay.querySelector("#scholarDocumentRows");
    const householdTemplate = (item = {}) => {
      const genderOptions = ["Female", "Male", "Other", "Prefer not to say"];
      const relationshipOptions = ["Mother", "Father", "Brother", "Sister", "Grandmother", "Grandfather", "Guardian", "Spouse", "Child", "Other"];
      const civilStatusOptions = ["Single", "Married", "Widowed", "Separated", "Other"];
      const options = (values, selected, placeholder) => `<option value="">${placeholder}</option>${selected && !values.includes(selected) ? `<option selected>${escapeHtml(selected)}</option>` : ""}${values.map(value => `<option ${selected === value ? "selected" : ""}>${value}</option>`).join("")}`;
      return `<div class="scholar-dynamic-row household-row scholar-household-grid"><input name="member_name" placeholder="Member name" value="${escapeHtml(item.member_name || "")}"><input name="age" placeholder="Age" value="${escapeHtml(item.age || ageFromBirthDate(item.birth_date))}" readonly><input name="birth_date" type="date" value="${escapeHtml(item.birth_date || "")}"><select name="gender">${options(genderOptions, item.gender, "Gender")}</select><select name="relationship">${options(relationshipOptions, item.relationship, "Relationship")}</select><select name="civil_status">${options(civilStatusOptions, item.civil_status, "Civil status")}</select><input name="education_attainment" list="educationAttainmentOptions" placeholder="Educational attainment" value="${escapeHtml(item.education_attainment || "")}"><input name="occupation" placeholder="Occupation" value="${escapeHtml(item.occupation || "")}"><input name="monthly_income" type="number" min="0" step="0.01" placeholder="0.00" value="${escapeHtml(item.monthly_income ?? "")}"><button type="button" class="icon-button danger" data-remove-row title="Remove">${icon("bin")}</button></div>`;
    };
    const documentTemplate = (item = {}) => `<div class="scholar-dynamic-row document-row"><input name="document_type" placeholder="Document type" value="${escapeHtml(item.document_type || "")}"><input name="label" placeholder="Label" value="${escapeHtml(item.label || "")}"><input name="document_url" type="url" placeholder="https:// protected file link" value="${escapeHtml(item.document_url || "")}"><button type="button" class="icon-button danger" data-remove-row title="Remove">${icon("bin")}</button></div>`;
    const rerenderHousehold = values => dynamicRows(householdHost, "household-row", values, householdTemplate);
    const rerenderDocuments = values => dynamicRows(documentHost, "document-row", values, documentTemplate);
    rerenderHousehold(record.household_members || []);
    rerenderDocuments(record.document_links || []);
    overlay.querySelector("#addScholarHousehold").addEventListener("click", () => householdHost.insertAdjacentHTML("beforeend", householdTemplate({})));
    overlay.querySelector("#addScholarDocument").addEventListener("click", () => documentHost.insertAdjacentHTML("beforeend", documentTemplate({})));
    overlay.querySelector("#scholarPhotoInput").addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        overlay.querySelector('[name="picture_data"]').value = reader.result;
        overlay.querySelector(".scholar-photo-preview").innerHTML = `<img src="${reader.result}" alt="Scholar">`;
      };
      reader.readAsDataURL(file);
    });
    const form = overlay.querySelector("#scholarProfileForm");
    const updateScholarAge = () => { overlay.querySelector("#scholarAgeDisplay").value = ageFromBirthDate(form.elements.birth_date.value); };
    form.elements.birth_date.addEventListener("change", updateScholarAge);
    householdHost.addEventListener("change", event => {
      if (event.target.name !== "birth_date") return;
      const row = event.target.closest(".household-row");
      row.querySelector('[name="age"]').value = ageFromBirthDate(event.target.value);
    });
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = { ...record, id: id || undefined };
      ["scholar_no", "picture_data", "last_name", "first_name", "middle_name", "birth_date", "place_of_birth", "gender", "contact_no", "email", "address", "chapel_id", "hobbies", "ambition", "special_circumstances", "other_income_source", "birth_order", "total_siblings", "married_siblings", "household_contribution", "guardian_name", "guardian_relationship", "guardian_contact", "status", "notes"].forEach(field => { payload[field] = formData.get(field) || ""; });
      payload.household_members = collectRows(householdHost, "household-row", ["member_name", "age", "birth_date", "gender", "relationship", "civil_status", "education_attainment", "occupation", "monthly_income"]);
      payload.document_links = collectRows(documentHost, "document-row", ["document_type", "label", "document_url"]);
      try {
        const saved = await entitySave("scholars", payload);
        ctx().showToast("Scholar profile saved.");
        close();
        if (afterSave) await afterSave(saved);
      } catch (error) { ctx().showToast(error.message); }
    });
  }

  async function openSponsorEditor(id = 0, afterSave = null) {
    const record = id ? await entityGet("sponsors", id) : { sponsor_type: "Individual", consent_status: "Not Recorded", status: "Active" };
    const { overlay, close } = modalShell(
      id ? "Edit Sponsor Profile" : "New Sponsor Profile",
      "Store only operational contact, consent, and sponsorship information.",
      `<form id="sponsorProfileForm" class="scholarship-form-grid">
        <label><span>Sponsor No.</span><input name="sponsor_no" value="${escapeHtml(record.sponsor_no || "")}" placeholder="Generated on save" readonly></label>
        <label><span>Sponsor Type</span><select name="sponsor_type">${["Individual", "Organization"].map(option => `<option ${record.sponsor_type === option ? "selected" : ""}>${option}</option>`).join("")}</select></label>
        <label class="wide"><span>Sponsor / Organization Name</span><input name="sponsor_name" value="${escapeHtml(record.sponsor_name || "")}" required></label>
        <label><span>Contact Person</span><input name="contact_person" value="${escapeHtml(record.contact_person || "")}"></label>
        <label><span>Email</span><input name="email" type="email" value="${escapeHtml(record.email || "")}"></label>
        <label><span>Contact No.</span><input name="contact_no" value="${escapeHtml(record.contact_no || "")}"></label>
        <label><span>Consent Status</span><select name="consent_status">${["Not Recorded", "Granted", "Withdrawn"].map(option => `<option ${record.consent_status === option ? "selected" : ""}>${option}</option>`).join("")}</select></label>
        <label><span>Communication Preference</span><select name="communication_preference"><option value="">Not specified</option>${["Email", "Phone", "SMS", "Mail"].map(option => `<option ${record.communication_preference === option ? "selected" : ""}>${option}</option>`).join("")}</select></label>
        <label><span>Status</span><select name="status">${["Active", "Inactive"].map(option => `<option ${record.status === option ? "selected" : ""}>${option}</option>`).join("")}</select></label>
        <label class="wide"><span>Address</span><textarea name="address" rows="2">${escapeHtml(record.address || "")}</textarea></label>
        <label class="wide"><span>Notes</span><textarea name="notes" rows="2">${escapeHtml(record.notes || "")}</textarea></label>
      </form>`,
      `<button type="button" class="action-button" data-modal-cancel>Cancel</button><button type="submit" form="sponsorProfileForm" class="action-button primary"><span class="button-icon">${icon("save")}</span><span>Save Profile</span></button>`
    );
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    overlay.querySelector("#sponsorProfileForm").addEventListener("submit", async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      try {
        const saved = await entitySave("sponsors", { ...record, ...data, id: id || undefined });
        ctx().showToast("Sponsor profile saved.");
        close();
        if (afterSave) await afterSave(saved);
      } catch (error) { ctx().showToast(error.message); }
    });
  }

  function profileField(label, value) {
    const display = value === null || value === undefined || value === "" ? "Not recorded" : value;
    return `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(display)}</strong></div>`;
  }

  async function openProfileViewer(entity, id) {
    const record = await entityGet(entity, id);
    const isScholar = entity === "scholars";
    const title = isScholar ? (record.scholar_name || [record.last_name, record.first_name].filter(Boolean).join(", ")) : record.sponsor_name;
    const academicSummary = record.academic_summary || {};
    const body = isScholar ? `
      <section class="scholar-view-hero">
        <div class="scholar-view-photo">${record.picture_data ? `<img src="${record.picture_data}" alt="${escapeHtml(title)}">` : icon("users")}</div>
        <div><p class="eyebrow">${escapeHtml(record.scholar_no)}</p><h2>${escapeHtml(title)}</h2><strong class="status-pill">${escapeHtml(record.status)}</strong></div>
      </section>
      <section class="scholar-view-grid">
        ${profileField("Birth Date", displayDate(record.birth_date))}${profileField("Age", ageFromBirthDate(record.birth_date))}${profileField("Gender", record.gender)}${profileField("Place of Birth", record.place_of_birth)}
        ${profileField("Chapel", record.chapel_name)}${profileField("Contact No.", record.contact_no)}${profileField("Email", record.email)}${profileField("Hobbies", record.hobbies)}
        ${profileField("Ambition", record.ambition)}${profileField("Home Address", record.address)}${profileField("Special Circumstances", record.special_circumstances)}
      </section>
      <section class="scholar-view-section"><h3>Family Composition Summary</h3><div class="scholar-view-grid">${profileField("Other Source of Income", record.other_income_source)}${profileField("Birth Order", record.birth_order)}${profileField("Total Number of Siblings", record.total_siblings)}${profileField("Number of Married Siblings", record.married_siblings)}${profileField("Household Contribution", formatMoney(record.household_contribution))}${profileField("Guardian", record.guardian_name)}${profileField("Guardian Relationship", record.guardian_relationship)}${profileField("Guardian Contact", record.guardian_contact)}</div></section>
      <section class="scholar-view-section"><h3>Yearly Enrollments</h3>${table("enrollments", record.enrollments || [], { view: false })}</section>
      <section class="scholar-view-section"><h3>Academic and Attendance Summary</h3>${metricStrip([
        { label: "Grade Records", value: academicSummary.gradeRecords || 0, note: "kept in original grading scales" },
        { label: "Percentage Average", value: academicSummary.percentageAverage == null ? "No percentage grades" : academicSummary.percentageAverage, note: "percentage records only" },
        { label: "Scholar Attendance", value: academicSummary.attendanceRate == null ? "No attendance" : `${academicSummary.attendanceRate}%`, note: "present and late records" },
        { label: "Parent Attendance", value: academicSummary.guardianAttendanceRate == null ? "No attendance" : `${academicSummary.guardianAttendanceRate}%`, note: "mass and cleaning records" }
      ])}${academicSummary.weightedAverages?.length ? `<h3>Weighted SHS / College Averages</h3>${printTable(academicSummary.weightedAverages, [["scale", "Scale"], ["value", "Weighted Average"], ["units", "Units"]])}` : ""}<h3>Recent Grades</h3>${table("grades", (record.grades || []).slice(0, 10), { view: false })}<h3>Recent PAOFI Attendance</h3>${table("attendance", (record.attendance || []).slice(0, 10), { view: false, columns: [["event_date", "Date"], ["event_title", "Activity"], ["attendance_status", "Status"], ["remarks", "Remarks"]] })}</section>
      <section class="scholar-view-section"><h3>Household Members</h3>${record.household_members?.length ? printTable(record.household_members, [["member_name", "Name"], ["age", "Age"], ["birth_date", "Birth Date"], ["gender", "Gender"], ["relationship", "Relationship"], ["civil_status", "Civil Status"], ["education_attainment", "Educational Attainment"], ["occupation", "Occupation"], ["monthly_income", "Monthly Income"]]) : `<p>No household members recorded.</p>`}</section>
      <section class="scholar-view-section"><h3>Supporting Documents</h3>${record.document_links?.length ? record.document_links.map(item => `<a class="scholar-document-link" href="${escapeHtml(item.document_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label || item.document_type || "Open document")}</a>`).join("") : `<p>No document links recorded.</p>`}</section>
    ` : `
      <section class="sponsor-view-hero"><p class="eyebrow">${escapeHtml(record.sponsor_no)}</p><h2>${escapeHtml(title)}</h2><span>${escapeHtml(record.sponsor_type)} | ${escapeHtml(record.status)}</span></section>
      <section class="scholar-view-grid">${profileField("Contact Person", record.contact_person)}${profileField("Email", record.email)}${profileField("Contact No.", record.contact_no)}${profileField("Consent", record.consent_status)}${profileField("Communication", record.communication_preference)}${profileField("Address", record.address)}</section>
      <section class="scholar-view-section"><h3>Scholar Assignments</h3>${table("sponsorships", record.sponsorships || [], { view: false })}</section>
      <section class="scholar-view-section"><h3>Giving History</h3>${table("payments", record.payments || [], { view: false })}</section>
    `;
    const { overlay, close } = modalShell(title, isScholar ? "Complete Scholarship profile" : "Sponsor relationship and giving history", body,
      `<button type="button" class="action-button" data-profile-print><span class="button-icon">${icon("print")}</span><span>Print</span></button>${canWrite(entity) ? `<button type="button" class="action-button primary" data-profile-edit><span class="button-icon">${icon("edit")}</span><span>Edit</span></button>` : ""}`);
    overlay.querySelector("[data-profile-print]").addEventListener("click", () => printProfile(entity, record));
    overlay.querySelector("[data-profile-edit]")?.addEventListener("click", () => {
      close();
      const editor = isScholar ? openScholarEditor : openSponsorEditor;
      editor(id, () => renderCurrent()).catch(error => ctx().showToast(error.message));
    });
  }

  function openPrintWindow(title, body, options = {}) {
    const orientation = options.landscape ? "landscape" : "portrait";
    const documentHtml = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
      @page { size: Letter ${orientation}; margin: 0.45in; }
      * { box-sizing: border-box; }
      body { margin:0; color:#17231e; font: 10px Arial, sans-serif; background:#fff; }
      .print-toolbar { display:flex; justify-content:flex-end; padding:10px; background:#eef5f0; }
      .print-toolbar button { padding:8px 14px; border:0; background:#146c43; color:white; font-weight:700; }
      .document { max-width: 100%; margin:auto; }
      .document-header { display:grid; grid-template-columns:70px 1fr; gap:14px; align-items:center; border-bottom:3px solid #146c43; padding-bottom:12px; margin-bottom:14px; }
      .document-header img { width:64px; height:64px; object-fit:contain; }
      .document-header h1 { font-size:20px; margin:0 0 4px; }
      .document-header p { margin:0; color:#4d6258; }
      h2 { font-size:14px; margin:16px 0 8px; color:#0f5d3a; }
      table { width:100%; border-collapse:collapse; margin:8px 0 14px; }
      th, td { border:1px solid #aabbb2; padding:5px 6px; text-align:left; vertical-align:top; }
      th { background:#e8f2ec; }
      .print-profile { display:grid; grid-template-columns:150px 1fr; gap:16px; }
      .print-photo { width:150px; min-height:180px; border:1px solid #b8c8bf; display:grid; place-items:center; }
      .print-photo img { width:100%; height:180px; object-fit:cover; }
      .print-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:0; border:1px solid #b8c8bf; }
      .print-grid div { padding:6px 8px; border-bottom:1px solid #d3ddd7; }
      .print-grid span { display:block; font-size:10px; color:#5f7067; }
      .print-grid strong { display:block; margin-top:2px; font-size:11px; }
      .money { text-align:right; }
      .signature-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:48px; margin-top:42px; }
      .signature-grid div { border-top:1px solid #333; padding-top:5px; text-align:center; }
      @media print { .print-toolbar { display:none; } }
    </style></head><body><div class="print-toolbar"><button onclick="window.print()">Print</button></div><main class="document">${body}</main></body></html>`;
    if (ctx().showDocumentPrintPreview) {
      document.querySelectorAll(".scholarship-modal-backdrop").forEach(element => element.remove());
      ctx().showDocumentPrintPreview(title, documentHtml);
      return;
    }
    const win = window.open("", "_blank", "width=1040,height=820");
    if (!win) throw new Error("The print preview could not be opened.");
    win.document.write(documentHtml);
    win.document.close();
    ctx().enforceMinimumPrintFontSize?.(win.document);
  }

  function printHeader(subtitle) {
    return `<header class="document-header"><img src="${location.origin}/assets/paofi-logo.png" alt=""><div><h1>Payatas Orione Foundation Inc.</h1><p>Scholarship Program | ${escapeHtml(subtitle)}</p></div></header>`;
  }

  function printTable(records, columns) {
    return `<table><thead><tr>${columns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join("")}</tr></thead><tbody>${records.map(record => `<tr>${columns.map(([field]) => `<td>${displayValue(field, record[field])}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }

  function printProfile(entity, record) {
    const isScholar = entity === "scholars";
    const title = isScholar
      ? (record.scholar_name || [record.last_name, record.first_name, record.middle_name].filter(Boolean).join(", "))
      : record.sponsor_name;
    let content;
    if (isScholar) {
      const summary = record.academic_summary || {};
      content = `${printHeader("Scholar Profile")}<div class="print-profile"><div class="print-photo">${record.picture_data ? `<img src="${record.picture_data}" alt="">` : "No photo"}</div><div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(record.scholar_no)} | ${escapeHtml(record.status)}</p><h2>I. Personal Information</h2><div class="print-grid">${profileField("Birth Date", displayDate(record.birth_date))}${profileField("Age", ageFromBirthDate(record.birth_date))}${profileField("Gender", record.gender)}${profileField("Place of Birth", record.place_of_birth)}${profileField("Chapel", record.chapel_name)}${profileField("Contact No.", record.contact_no)}${profileField("Email", record.email)}${profileField("Hobbies", record.hobbies)}${profileField("Ambition", record.ambition)}${profileField("Home Address", record.address)}${profileField("Special Circumstances", record.special_circumstances)}</div></div></div><h2>II. Family Composition</h2>${printTable(record.household_members || [], [["member_name", "Name"], ["age", "Age"], ["birth_date", "Birth Date"], ["gender", "Gender"], ["relationship", "Relationship"], ["civil_status", "Civil Status"], ["education_attainment", "Educational Attainment"], ["occupation", "Occupation"], ["monthly_income", "Monthly Income"]])}<div class="print-grid">${profileField("Other Source of Income", record.other_income_source)}${profileField("Birth Order", record.birth_order)}${profileField("Total Number of Siblings", record.total_siblings)}${profileField("Number of Married Siblings", record.married_siblings)}${profileField("Household Contribution", formatMoney(record.household_contribution))}${profileField("Guardian", record.guardian_name)}${profileField("Guardian Relationship", record.guardian_relationship)}${profileField("Guardian Contact", record.guardian_contact)}</div><h2>Academic and Attendance Summary</h2><div class="print-grid">${profileField("Grade Records", summary.gradeRecords || 0)}${profileField("Percentage Average", summary.percentageAverage == null ? "No percentage grades" : summary.percentageAverage)}${profileField("Scholar Attendance", summary.attendanceRate == null ? "No attendance records" : `${summary.attendanceRate}%`)}${profileField("Parent Attendance", summary.guardianAttendanceRate == null ? "No attendance records" : `${summary.guardianAttendanceRate}%`)}</div>${summary.weightedAverages?.length ? `<h2>Weighted SHS / College Averages</h2>${printTable(summary.weightedAverages, [["scale", "Scale"], ["value", "Weighted Average"], ["units", "Units"]])}` : ""}<h2>Yearly Enrollments</h2>${printTable(record.enrollments || [], LIST_COLUMNS.enrollments.slice(1))}<h2>Recent Grades</h2>${printTable((record.grades || []).slice(0, 20), LIST_COLUMNS.grades)}`;
    } else {
      content = `${printHeader("Sponsor Profile")}<h1>${escapeHtml(title)}</h1><p>${escapeHtml(record.sponsor_no)} | ${escapeHtml(record.sponsor_type)} | ${escapeHtml(record.status)}</p><div class="print-grid">${profileField("Contact Person", record.contact_person)}${profileField("Email", record.email)}${profileField("Contact No.", record.contact_no)}${profileField("Consent", record.consent_status)}${profileField("Communication", record.communication_preference)}${profileField("Address", record.address)}</div><h2>Scholar Assignments</h2>${printTable(record.sponsorships || [], LIST_COLUMNS.sponsorships)}<h2>Giving History</h2>${printTable(record.payments || [], LIST_COLUMNS.payments)}`;
    }
    openPrintWindow(title, content, { landscape: isScholar });
  }

  async function openImportDialog(type, afterImport) {
    const labels = { scholars: "Scholar Profiles", sponsors: "Sponsor Profiles", enrollments: "Yearly Enrollments" };
    const { overlay, close } = modalShell(
      `Import ${labels[type]}`,
      "Review every row before it is written to the database.",
      `<div class="scholar-import-workspace"><div class="scholar-import-drop"><input type="file" id="scholarImportFile" accept=".xlsx"><strong>Choose an XLSX workbook</strong><span>The first row must contain column headers.</span></div><div class="scholar-import-summary" id="scholarImportSummary">No workbook selected.</div><div id="scholarImportPreview"></div></div>`,
      `<button type="button" class="action-button" data-download-template><span class="button-icon">${icon("export")}</span><span>Template</span></button><button type="button" class="action-button" data-modal-cancel>Cancel</button><button type="button" class="action-button primary" data-import-commit disabled><span class="button-icon">${icon("save")}</span><span>Import Valid Rows</span></button>`
    );
    let preview = null;
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    overlay.querySelector("[data-download-template]").addEventListener("click", async () => {
      try {
        const template = await ctx().api(`/api/scholarship/import/template?type=${type}`);
        downloadBase64(template.file_data, template.mime_type, template.filename);
      } catch (error) { ctx().showToast(error.message); }
    });
    overlay.querySelector("#scholarImportFile").addEventListener("change", async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const data = await fileAsDataUrl(file);
        preview = await ctx().api("/api/scholarship/import/preview", {
          method: "POST", loadingMessage: "Reviewing workbook", body: JSON.stringify({ type, file_data: data })
        });
        overlay.querySelector("#scholarImportSummary").innerHTML = `<strong>${preview.valid} valid</strong><span>${preview.invalid} need attention | ${preview.total} total</span>`;
        overlay.querySelector("#scholarImportPreview").innerHTML = `<div class="data-table-scroll"><table class="data-table"><thead><tr><th>Row</th><th>Status</th><th>Details</th></tr></thead><tbody>${preview.rows.map(row => `<tr><td>${row.row_number}</td><td><span class="status-pill ${row.valid ? "success" : "warning"}">${row.valid ? "Ready" : "Review"}</span></td><td>${row.valid ? escapeHtml(Object.values(row.data).filter(Boolean).slice(0, 4).join(" | ")) : escapeHtml(row.errors.join("; "))}</td></tr>`).join("")}</tbody></table></div>`;
        overlay.querySelector("[data-import-commit]").disabled = preview.valid === 0;
      } catch (error) { ctx().showToast(error.message); }
    });
    overlay.querySelector("[data-import-commit]").addEventListener("click", async () => {
      if (!preview) return;
      try {
        const result = await ctx().api("/api/scholarship/import/commit", {
          method: "POST", loadingMessage: "Importing Scholarship records",
          body: JSON.stringify({ type, rows: preview.rows.filter(row => row.valid) })
        });
        ctx().showToast(`${result.imported} records imported.`);
        close();
        if (afterImport) await afterImport();
      } catch (error) { ctx().showToast(error.message); }
    });
  }

  function fileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("The file could not be read."));
      reader.readAsDataURL(file);
    });
  }

  function downloadBase64(data, mime, filename) {
    const bytes = atob(data);
    const buffer = new Uint8Array(bytes.length);
    for (let index = 0; index < bytes.length; index += 1) buffer[index] = bytes.charCodeAt(index);
    const url = URL.createObjectURL(new Blob([buffer], { type: mime }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadJson(filename, payload) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function renderProfilesPage() {
    ctx().setTitle("Scholar Profiles");
    const page = pageNumber("scholars");
    const [dashboard, payload, chapelPayload] = await Promise.all([
      ctx().api("/api/scholarship/dashboard"),
      entityList("scholars", { limit: pageSize(), offset: (page - 1) * pageSize() }),
      entityList("chapels", { limit: 50 })
    ]);
    ctx().setTopbarActions([]);
    ctx().root.innerHTML = `
      <section class="scholarship-page">
        ${workspaceHeader("Scholar Profiles", "Permanent scholar records connected to yearly school enrollment, sponsorship, chapel coordination, renewal, and academic history.", `${canWrite("scholars") ? actionButton("New Scholar", "new-scholar", "users", true) : ""}${canWrite("scholars") ? actionButton("Import", "import-scholars", "export") : ""}${actionButton("Chapel Coordinators", "manage-chapels", "users")}`)}
        ${metricStrip([
          { label: "Active Scholars", value: dashboard.stats.activeScholars, note: `${dashboard.stats.scholars} total profiles` },
          { label: "Current Enrollments", value: dashboard.stats.activeEnrollments, note: "active school-year records" },
          { label: "Pending Renewals", value: dashboard.stats.pendingRenewals, note: "requiring follow-up" },
          { label: "Completed Evaluations", value: dashboard.stats.completedEvaluations, note: "approved evaluations" }
        ])}
        <div class="scholarship-analytics-flow">${barChart("Scholars by education level", dashboard.analytics.byLevel, "wide")}${barChart("Scholars by chapel", dashboard.analytics.byChapel)}${barChart("Profile status", dashboard.analytics.byStatus)}</div>
        <section class="scholarship-data-surface">
          ${searchToolbar("scholars", payload.total, `<select data-scholar-filter="status"><option value="">All statuses</option>${["Active", "Inactive", "Graduated", "Withdrawn"].map(value => `<option>${value}</option>`).join("")}</select><select data-scholar-filter="chapel_id"><option value="">All chapels</option>${chapelPayload.records.map(item => `<option value="${item.id}">${escapeHtml(item.chapel_name)}</option>`).join("")}</select>`)}
          <div id="scholarProfilesTable">${table("scholars", payload.records || [], { print: true })}${pagination("scholars", payload.total)}</div>
        </section>
      </section>`;
    bindProfilePage("scholars", renderProfilesPage);
    ctx().root.querySelector('[data-scholar-action="manage-chapels"]')?.addEventListener("click", () => openChapelManager());
  }

  async function renderSponsorsPage() {
    ctx().setTitle("Sponsor Profiles");
    const page = pageNumber("sponsors");
    const [dashboard, payload] = await Promise.all([
      ctx().api("/api/scholarship/dashboard"),
      entityList("sponsors", { limit: pageSize(), offset: (page - 1) * pageSize() })
    ]);
    ctx().setTopbarActions([]);
    ctx().root.innerHTML = `
      <section class="scholarship-page">
        ${workspaceHeader("Sponsor Profiles", "Individuals and organizations supporting scholars, with consent, assignments, commitments, and giving history.", `${canWrite("sponsors") ? actionButton("New Sponsor", "new-sponsor", "heart", true) : ""}${canWrite("sponsors") ? actionButton("Assign Scholar", "new-sponsorship", "users") : ""}${canWrite("sponsors") ? actionButton("Import", "import-sponsors", "export") : ""}`)}
        ${metricStrip([
          { label: "Active Sponsors", value: dashboard.stats.activeSponsors, note: "current relationships" },
          { label: "Pledged", value: formatMoney(dashboard.stats.pledged), note: "recorded commitments" },
          { label: "Received", value: formatMoney(dashboard.stats.received), note: "cleared payments" },
          { label: "Unallocated", value: formatMoney(dashboard.stats.unallocated), note: "available funds" }
        ])}
        <section class="scholarship-data-surface">
          ${searchToolbar("sponsors", payload.total, `<select data-scholar-filter="sponsor_type"><option value="">All sponsor types</option><option>Individual</option><option>Organization</option></select>`)}
          <div id="sponsorProfilesTable">${table("sponsors", payload.records || [], { print: true })}${pagination("sponsors", payload.total)}</div>
        </section>
      </section>`;
    bindProfilePage("sponsors", renderSponsorsPage);
  }

  function bindProfilePage(entity, rerender) {
    ctx().root.querySelector('[data-scholar-action="new-scholar"]')?.addEventListener("click", () => openScholarEditor(0, rerender));
    ctx().root.querySelector('[data-scholar-action="new-sponsor"]')?.addEventListener("click", () => openSponsorEditor(0, rerender));
    ctx().root.querySelector('[data-scholar-action="new-sponsorship"]')?.addEventListener("click", () => openSimpleEditor("sponsorships", 0, rerender));
    ctx().root.querySelector('[data-scholar-action="import-scholars"]')?.addEventListener("click", () => openImportDialog("scholars", rerender));
    ctx().root.querySelector('[data-scholar-action="import-sponsors"]')?.addEventListener("click", () => openImportDialog("sponsors", rerender));
    bindCommonTableActions(rerender);
    const search = ctx().root.querySelector(`[data-scholar-search="${entity}"]`);
    const filters = [...ctx().root.querySelectorAll("[data-scholar-filter]")];
    let timer;
    const refresh = async () => {
      const filterOptions = Object.fromEntries(filters.filter(filter => filter.value).map(filter => [filter.dataset.scholarFilter, filter.value]));
      const payload = await entityList(entity, { search: search?.value || "", ...filterOptions, limit: pageSize(), offset: 0 });
      state.pages[entity] = 1;
      const host = ctx().root.querySelector(entity === "scholars" ? "#scholarProfilesTable" : "#sponsorProfilesTable");
      host.innerHTML = `${table(entity, payload.records || [], { print: true })}${pagination(entity, payload.total)}`;
      bindCommonTableActions(rerender);
    };
    search?.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => refresh().catch(error => ctx().showToast(error.message)), 280); });
    filters.forEach(filter => filter.addEventListener("change", () => refresh().catch(error => ctx().showToast(error.message))));
  }

  async function openChapelManager() {
    const payload = await entityList("chapels", { limit: 50 });
    const { overlay, close } = modalShell(
      "Scholarship Chapel Coordinators",
      "Maintain the coordinator and assistant coordinator assigned to each affiliated chapel.",
      `<section class="scholarship-data-surface chapel-manager-table">${table("chapels", payload.records || [], { view: false })}</section>`,
      `<button type="button" class="action-button" data-modal-cancel>Close</button>`
    );
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    overlay.querySelectorAll('[data-scholar-edit^="chapels:"]').forEach(button => button.addEventListener("click", () => {
      const id = button.dataset.scholarEdit.split(":")[1];
      close();
      openSimpleEditor("chapels", id, openChapelManager).catch(error => ctx().showToast(error.message));
    }));
  }

  function bindCommonTableActions(rerender) {
    ctx().root.querySelectorAll("[data-scholar-select-all]").forEach(master => {
      const entity = master.dataset.scholarSelectAll;
      const rows = [...ctx().root.querySelectorAll(`[data-scholar-select-row="${entity}"]`)];
      master.addEventListener("change", () => rows.forEach(row => { row.checked = master.checked; }));
      rows.forEach(row => row.addEventListener("change", () => {
        master.checked = rows.length > 0 && rows.every(item => item.checked);
        master.indeterminate = rows.some(item => item.checked) && !master.checked;
      }));
    });
    ctx().root.querySelectorAll("[data-scholar-view]").forEach(button => button.addEventListener("click", () => {
      const [entity, id] = button.dataset.scholarView.split(":");
      if (["scholars", "sponsors"].includes(entity)) openProfileViewer(entity, id).catch(error => ctx().showToast(error.message));
      else openRecordViewer(entity, id, rerender).catch(error => ctx().showToast(error.message));
    }));
    ctx().root.querySelectorAll("[data-scholar-edit]").forEach(button => button.addEventListener("click", () => {
      const [entity, id] = button.dataset.scholarEdit.split(":");
      let editorPromise;
      if (entity === "scholars") editorPromise = openScholarEditor(id, rerender);
      else if (entity === "sponsors") editorPromise = openSponsorEditor(id, rerender);
      else if (entity === "grades") editorPromise = openGradeEditor(id);
      else if (entity === "events") editorPromise = openEventEditor(id);
      else if (entity === "renewalTemplates") editorPromise = openRenewalTemplateEditor(id);
      else if (entity === "renewals") editorPromise = openRenewalEditor(id);
      else if (entity === "evaluationTemplates") editorPromise = openEvaluationTemplateEditor(id);
      else if (entity === "evaluations") editorPromise = openEvaluationEditor(id);
      else editorPromise = openSimpleEditor(entity, id, rerender);
      Promise.resolve(editorPromise).catch(error => ctx().showToast(error.message));
    }));
    ctx().root.querySelectorAll("[data-scholar-print]").forEach(button => button.addEventListener("click", async () => {
      const [entity, id] = button.dataset.scholarPrint.split(":");
      if (!["scholars", "sponsors"].includes(entity)) return;
      try { printProfile(entity, await entityGet(entity, id)); } catch (error) { ctx().showToast(error.message); }
    }));
    ctx().root.querySelectorAll("[data-scholar-page]").forEach(button => button.addEventListener("click", () => {
      state.pages[button.dataset.scholarPage] = Number(button.dataset.pageValue);
      rerender().catch(error => ctx().showToast(error.message));
    }));
  }

  function selectedTableIds(entity) {
    return [...ctx().root.querySelectorAll(`[data-scholar-select-row="${entity}"]:checked`)].map(input => Number(input.value)).filter(Boolean);
  }

  async function openRecordViewer(entity, id, rerender) {
    const record = await entityGet(entity, id);
    const columns = Object.entries(record).filter(([key, value]) => !Array.isArray(value) && !["picture_data"].includes(key));
    const { overlay, close } = modalShell(
      FORM_DEFINITIONS[entity]?.title || entity.replace(/([A-Z])/g, " $1"),
      "Recorded Scholarship information",
      `<div class="scholar-view-grid">${columns.map(([key, value]) => profileField(key.replaceAll("_", " "), key.endsWith("_date") ? displayDate(value) : value)).join("")}</div>`,
      `${canWrite(entity) && FORM_DEFINITIONS[entity] ? `<button type="button" class="action-button primary" data-record-edit><span class="button-icon">${icon("edit")}</span><span>Edit</span></button>` : ""}${canWrite(entity) ? `<button type="button" class="action-button danger" data-record-delete><span class="button-icon">${icon("bin")}</span><span>Delete</span></button>` : ""}`
    );
    overlay.querySelector("[data-record-edit]")?.addEventListener("click", () => { close(); openSimpleEditor(entity, id, rerender); });
    overlay.querySelector("[data-record-delete]")?.addEventListener("click", async () => {
      if (!confirm("Delete this draft or editable record?")) return;
      try { await entityDelete(entity, id); close(); await rerender(); } catch (error) { ctx().showToast(error.message); }
    });
  }

  async function renderDonationPage() {
    ctx().setTitle("Donations & Financial Documents");
    const entity = state.donationEntity;
    const pageKey = `donations-${entity}`;
    const page = pageNumber(pageKey);
    const [dashboard, payload] = await Promise.all([
      ctx().api("/api/scholarship/dashboard"),
      entityList(entity, { limit: pageSize(), offset: (page - 1) * pageSize() })
    ]);
    ctx().setTopbarActions([]);
    const tabs = [
      ["pledges", "Pledges"], ["invoices", "Service Invoices"], ["payments", "Payments"],
      ["receipts", "Official Receipts"], ["allocations", "Allocations"], ["documentSettings", "Document Setup"]
    ];
    ctx().root.innerHTML = `
      <section class="scholarship-page scholarship-finance-page">
        ${workspaceHeader("Donations and Financial Documents", "Track commitments, installment payments, PHP conversion, fund allocation, and controlled financial documents.", `${canWrite(entity) ? actionButton(`New ${FORM_DEFINITIONS[entity].title}`, "new-finance", "finance", true) : ""}${actionButton("Yearly Summary", "yearly-finance", "print")}${actionButton("Export", "export-finance", "export")}`)}
        ${metricStrip([
          { label: "Pledged", value: formatMoney(dashboard.stats.pledged), note: "active commitments" },
          { label: "Received", value: formatMoney(dashboard.stats.received), note: "cleared payments" },
          { label: "Allocated", value: formatMoney(dashboard.stats.allocated), note: "assigned program funds" },
          { label: "Available", value: formatMoney(dashboard.stats.unallocated), note: "unallocated balance" }
        ])}
        <nav class="scholarship-segmented" aria-label="Financial records">${tabs.map(([value, label]) => `<button type="button" data-finance-tab="${value}" class="${entity === value ? "active" : ""}">${escapeHtml(label)}</button>`).join("")}</nav>
        <section class="scholarship-data-surface">
          ${searchToolbar(entity, payload.total)}
          <div id="scholarFinanceTable">${table(entity, payload.records || [], { view: true, print: ["invoices", "receipts"].includes(entity), extraActions: financeActions })}${pagination(pageKey, payload.total)}</div>
        </section>
        <p class="scholarship-compliance-note">Service Invoices are principal financial documents. Official Receipts are supplementary payment records. PAOFI accounting must approve production numbering and required document details.</p>
      </section>`;
    ctx().root.querySelectorAll("[data-finance-tab]").forEach(button => button.addEventListener("click", () => { state.donationEntity = button.dataset.financeTab; renderDonationPage().catch(error => ctx().showToast(error.message)); }));
    ctx().root.querySelector('[data-scholar-action="new-finance"]')?.addEventListener("click", () => openSimpleEditor(entity, 0, renderDonationPage, financeSeed(entity)));
    ctx().root.querySelector('[data-scholar-action="yearly-finance"]')?.addEventListener("click", openFinanceYearlySummary);
    ctx().root.querySelector('[data-scholar-action="export-finance"]')?.addEventListener("click", async () => {
      try { downloadJson(`PAOFI-Scholarship-${entity}.json`, await ctx().api(`/api/scholarship/export?entity=${entity}`)); } catch (error) { ctx().showToast(error.message); }
    });
    bindCommonTableActions(renderDonationPage);
    bindFinanceActions(entity);
    bindSearch(entity, "#scholarFinanceTable", records => `${table(entity, records.records || [], { view: true, print: ["invoices", "receipts"].includes(entity), extraActions: financeActions })}${pagination(pageKey, records.total)}`, renderDonationPage);
  }

  function openFinanceYearlySummary() {
    const currentYear = new Date().getFullYear();
    const { overlay, close } = modalShell(
      "Scholarship Financial Yearly Summary",
      "Create a printable annual financial summary without changing source records.",
      `<form id="financeYearForm" class="scholarship-form-grid"><label class="wide"><span>Report Year</span><input name="year" type="number" min="2000" max="2100" value="${currentYear}" required></label></form>`,
      `<button type="button" class="action-button" data-modal-cancel>Cancel</button><button type="submit" form="financeYearForm" class="action-button primary"><span class="button-icon">${icon("print")}</span><span>Open Print Preview</span></button>`
    );
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    overlay.querySelector("#financeYearForm").addEventListener("submit", async event => {
      event.preventDefault();
      const year = new FormData(event.currentTarget).get("year");
      try {
        const summary = await ctx().api(`/api/scholarship/finance/yearly?year=${encodeURIComponent(year)}`);
        close();
        printFinanceYearlySummary(summary);
      } catch (error) { ctx().showToast(error.message); }
    });
  }

  function printFinanceYearlySummary(summary) {
    const moneyRows = (summary.monthly || []).map(item => ({
      month: item.month,
      pledged: formatMoney(item.pledged),
      received: formatMoney(item.received),
      reversed: formatMoney(item.reversed),
      allocated: formatMoney(item.allocated)
    }));
    const sponsorRows = (summary.sponsors || []).map(item => ({
      sponsor_name: item.sponsor_name,
      pledged: formatMoney(item.pledged),
      received: formatMoney(item.received),
      outstanding: formatMoney(item.outstanding)
    }));
    const documentRows = [
      ...(summary.documents?.invoices || []).map(item => ({ document: "Service Invoice", status: item.label, count: item.count })),
      ...(summary.documents?.receipts || []).map(item => ({ document: "Official Receipt", status: item.label, count: item.count }))
    ];
    const totals = summary.totals || {};
    const content = `${printHeader(`Financial Summary | ${summary.year}`)}<h1>Scholarship Financial Yearly Summary</h1><div class="print-grid">${profileField("Pledged", formatMoney(totals.pledged))}${profileField("Cleared Payments", formatMoney(totals.received))}${profileField("Reversed", formatMoney(totals.reversed))}${profileField("Allocated", formatMoney(totals.allocated))}${profileField("Outstanding Commitments", formatMoney(totals.outstanding))}${profileField("Unallocated Funds", formatMoney(totals.unallocated))}</div><h2>Monthly Movement</h2>${printTable(moneyRows, [["month", "Month"], ["pledged", "Pledged"], ["received", "Received"], ["reversed", "Reversed"], ["allocated", "Allocated"]])}<h2>Sponsor Summary</h2>${printTable(sponsorRows, [["sponsor_name", "Sponsor"], ["pledged", "Pledged"], ["received", "Received"], ["outstanding", "Outstanding"]])}<h2>Controlled Documents</h2>${printTable(documentRows, [["document", "Document"], ["status", "Status"], ["count", "Count"]])}<div class="signature-grid"><div>Scholarship Program Officer</div><div>Finance</div></div>`;
    openPrintWindow(`Scholarship Financial Summary ${summary.year}`, content, { landscape: true });
  }

  function financeSeed(entity) {
    const today = new Date().toISOString().slice(0, 10);
    if (entity === "pledges") return { pledge_date: today, purpose_type: "Unrestricted", frequency: "One-time", source_currency: "PHP", exchange_rate: 1, status: "Open" };
    if (entity === "invoices") return { issue_date: today, status: "Draft" };
    if (entity === "payments") return { payment_date: today, source_currency: "PHP", exchange_rate: 1, status: "Pending" };
    if (entity === "receipts") return { issue_date: today, status: "Draft" };
    if (entity === "documentSettings") return { effective_year: new Date().getFullYear(), organization_name: "Payatas Orione Foundation Inc.", service_invoice_prefix: "SI", official_receipt_prefix: "OR", invoice_serial_start: 1, invoice_serial_end: 999999, receipt_serial_start: 1, receipt_serial_end: 999999, accountant_approved: 0, status: "Draft" };
    return { allocation_date: today, allocation_type: "Unrestricted" };
  }

  function financeActions(record) {
    if (!canFinance()) return "";
    if (["invoices", "receipts"].includes(state.donationEntity) && record.status === "Draft") return `<button type="button" class="icon-button" data-finance-action="issue:${state.donationEntity}:${record.id}" title="Issue document">${icon("arrow")}</button>`;
    if (["invoices", "receipts"].includes(state.donationEntity) && record.status === "Issued") return `<button type="button" class="icon-button danger" data-finance-action="void:${state.donationEntity}:${record.id}" title="Void document">${icon("bin")}</button>`;
    if (["invoices", "receipts"].includes(state.donationEntity) && record.status === "Voided") return `<button type="button" class="icon-button" data-finance-action="reissue:${state.donationEntity}:${record.id}" title="Create reissue draft">${icon("refresh")}</button>`;
    if (state.donationEntity === "payments" && record.status === "Cleared") return `<button type="button" class="icon-button danger" data-finance-action="reverse:payments:${record.id}" title="Reverse payment">${icon("refresh")}</button>`;
    return "";
  }

  function bindFinanceActions() {
    ctx().root.querySelectorAll("[data-finance-action]").forEach(button => button.addEventListener("click", async () => {
      const [action, entity, id] = button.dataset.financeAction.split(":");
      const reason = ["void", "reverse"].includes(action) ? prompt(`Reason to ${action} this record:`) : "";
      if (["void", "reverse"].includes(action) && !reason) return;
      try {
        await ctx().api(`/api/scholarship/entities/${entity}/${id}/${action}`, { method: "POST", body: JSON.stringify({ reason }) });
        ctx().showToast(`Record ${action} action completed.`);
        await renderDonationPage();
      } catch (error) { ctx().showToast(error.message); }
    }));
    ctx().root.querySelectorAll('[data-scholar-print^="invoices:"], [data-scholar-print^="receipts:"]').forEach(button => {
      button.addEventListener("click", async event => {
        event.stopImmediatePropagation();
        const [entity, id] = button.dataset.scholarPrint.split(":");
        try { printFinancialDocument(entity, await entityGet(entity, id)); } catch (error) { ctx().showToast(error.message); }
      });
    });
  }

  function printFinancialDocument(entity, record) {
    const invoice = entity === "invoices";
    const number = invoice ? record.invoice_no : record.receipt_no;
    const subtitle = invoice ? "SERVICE INVOICE" : "OFFICIAL RECEIPT (SUPPLEMENTARY)";
    const settings = record.document_settings || {};
    const content = `${printHeader(subtitle)}<h1>${subtitle}</h1><div class="print-grid">${profileField("Registered Organization", settings.organization_name || "Payatas Orione Foundation Inc.")}${profileField("Organization Tax Identifier", settings.tax_identifier)}${profileField("Registered Address", settings.registered_address)}${profileField("Contact Details", settings.contact_details)}${profileField("Document No.", number || "DRAFT")}${profileField("Status", record.status)}${profileField("Date", displayDate(record.issue_date))}${profileField(invoice ? "Sponsor" : "Payment No.", invoice ? record.sponsor_name : record.payment_no)}${profileField("Amount", formatMoney(record.amount_php))}${profileField("Notes", record.notes)}</div><h2>Amount</h2><table><tbody><tr><th>Total</th><td class="money"><strong>${escapeHtml(formatMoney(record.amount_php))}</strong></td></tr></tbody></table><div class="signature-grid"><div>Prepared by</div><div>Authorized representative</div></div>`;
    openPrintWindow(`${subtitle} ${number || "Draft"}`, content);
  }

  function bindSearch(entity, hostSelector, htmlBuilder, rerender) {
    const input = ctx().root.querySelector(`[data-scholar-search="${entity}"]`);
    let timer;
    input?.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const payload = await entityList(entity, { search: input.value, limit: pageSize(), offset: 0 });
          ctx().root.querySelector(hostSelector).innerHTML = htmlBuilder(payload);
          bindCommonTableActions(rerender);
          if (["pledges", "invoices", "payments", "receipts", "allocations"].includes(entity)) bindFinanceActions(entity);
          if (entity === "renewalEvaluations") bindWeightedRenewalActions();
          if (entity === "evaluations") bindEvaluationActions();
        } catch (error) { ctx().showToast(error.message); }
      }, 280);
    });
  }

  async function renderGradesPage() {
    ctx().setTitle("Grades Monitoring");
    const entity = state.academicEntity;
    const pageKey = `academic-${entity}`;
    const page = pageNumber(pageKey);
    const [dashboard, payload] = await Promise.all([
      ctx().api("/api/scholarship/dashboard"),
      entityList(entity, { limit: pageSize(), offset: (page - 1) * pageSize() })
    ]);
    const tabs = [["grades", "Grade Records"], ["enrollments", "Yearly Enrollments"], ["academicYears", "School Years"], ["academicPeriods", "Grading Periods"]];
    ctx().setTopbarActions([]);
    ctx().root.innerHTML = `
      <section class="scholarship-page">
        ${workspaceHeader("Academic Monitoring", "Flexible grading scales and historical school-year records without unsafe conversion between scales.", `${canWrite(entity) ? actionButton(`New ${FORM_DEFINITIONS[entity].title}`, "new-academic", "book", true) : ""}${entity === "enrollments" && canWrite(entity) ? actionButton("Import", "import-enrollments", "export") : ""}${entity === "grades" ? actionButton("Print Summary", "print-grades", "print") : ""}`)}
        ${metricStrip([
          { label: "Active Scholars", value: dashboard.stats.activeScholars, note: "profile records" },
          { label: "Current Enrollments", value: dashboard.stats.activeEnrollments, note: "active school years" },
          { label: "Grade Records", value: dashboard.stats.gradeRecords, note: "all grading scales" },
          { label: "Percentage Alerts", value: dashboard.stats.percentageAlerts, note: "records below 75" }
        ])}
        <div class="scholarship-analytics-flow">${barChart("Grade records by scale", dashboard.analytics.gradeScales, "wide")}</div>
        <nav class="scholarship-segmented">${tabs.map(([value, label]) => `<button type="button" data-academic-tab="${value}" class="${entity === value ? "active" : ""}">${label}</button>`).join("")}</nav>
        <section class="scholarship-data-surface">${searchToolbar(entity, payload.total)}<div id="academicTable">${table(entity, payload.records || [], { view: true })}${pagination(pageKey, payload.total)}</div></section>
      </section>`;
    ctx().root.querySelectorAll("[data-academic-tab]").forEach(button => button.addEventListener("click", () => { state.academicEntity = button.dataset.academicTab; renderGradesPage().catch(error => ctx().showToast(error.message)); }));
    ctx().root.querySelector('[data-scholar-action="new-academic"]')?.addEventListener("click", () => entity === "grades" ? openGradeEditor(0) : openSimpleEditor(entity, 0, renderGradesPage));
    ctx().root.querySelector('[data-scholar-action="import-enrollments"]')?.addEventListener("click", () => openImportDialog("enrollments", renderGradesPage));
    ctx().root.querySelector('[data-scholar-action="print-grades"]')?.addEventListener("click", () => printAcademicSummary().catch(error => ctx().showToast(error.message)));
    bindCommonTableActions(renderGradesPage);
    bindSearch(entity, "#academicTable", records => `${table(entity, records.records || [], { view: true })}${pagination(pageKey, records.total)}`, renderGradesPage);
  }

  async function printAcademicSummary() {
    const payload = await entityList("grades", { limit: 500, offset: 0 });
    openPrintWindow("Scholarship Grades Summary", `${printHeader("Grades Monitoring Summary")}<h1>Grades Monitoring</h1><p>Grades remain in their recorded scale and are not converted across percentage, GPA, letter, or pass/fail systems.</p>${printTable(payload.records || [], LIST_COLUMNS.grades)}`, { landscape: true });
  }

  async function renderAttendancePage() {
    ctx().setTitle("Attendance Monitoring");
    const page = pageNumber("events");
    const [dashboard, payload] = await Promise.all([
      ctx().api("/api/scholarship/dashboard"),
      entityList("events", { limit: pageSize(), offset: (page - 1) * pageSize() })
    ]);
    ctx().setTopbarActions([]);
    ctx().root.innerHTML = `
      <section class="scholarship-page">
        ${workspaceHeader("Scholarship Attendance Monitoring", "Mass, activities, cleaning, tutorial, and community-service attendance with the appropriate scholar and parent participation scope.", `${canWrite("events") ? actionButton("New Attendance Sheet", "new-event", "monitoring", true) : ""}${actionButton("Print Summary", "print-attendance", "print")}`)}
        ${metricStrip([{ label: "Activities", value: dashboard.stats.events, note: "recorded events" }, { label: "Active Scholars", value: dashboard.stats.activeScholars, note: "attendance population" }, { label: "Attendance Rate", value: `${dashboard.stats.attendanceRate}%`, note: "present and late records" }])}
        <div class="scholarship-analytics-flow">${barChart("Attendance monitoring types", dashboard.analytics.attendanceByType, "wide")}${barChart("Attendance status", dashboard.analytics.attendance)}${barChart("Attendance by education level", dashboard.analytics.attendanceByLevel)}${barChart("Attendance by school year", dashboard.analytics.attendanceByYear)}</div>
        <section class="scholarship-data-surface">${searchToolbar("events", payload.total)}<div id="attendanceTable">${table("events", payload.records || [], { view: true, extraActions: eventActions })}${pagination("events", payload.total)}</div></section>
      </section>`;
    ctx().root.querySelector('[data-scholar-action="new-event"]')?.addEventListener("click", () => openEventEditor(0));
    ctx().root.querySelector('[data-scholar-action="print-attendance"]')?.addEventListener("click", () => printAttendanceSummary().catch(error => ctx().showToast(error.message)));
    bindCommonTableActions(renderAttendancePage);
    bindEventActions();
    bindSearch("events", "#attendanceTable", records => `${table("events", records.records || [], { view: true, extraActions: eventActions })}${pagination("events", records.total)}`, renderAttendancePage);
  }

  function eventActions(record) {
    return `<button type="button" class="icon-button" data-event-attendance="${record.id}" title="Record attendance">${icon("users")}</button><button type="button" class="icon-button" data-event-print="${record.id}" title="Print attendance">${icon("print")}</button>`;
  }

  function bindEventActions() {
    ctx().root.querySelectorAll("[data-event-attendance]").forEach(button => button.addEventListener("click", () => openEventEditor(button.dataset.eventAttendance)));
    ctx().root.querySelectorAll("[data-event-print]").forEach(button => button.addEventListener("click", async () => { try { printEvent(await entityGet("events", button.dataset.eventPrint)); } catch (error) { ctx().showToast(error.message); } }));
  }

  async function openEventEditor(id = 0) {
    const [event, scholarsPayload, enrollmentsPayload, chapels, years] = await Promise.all([
      id ? entityGet("events", id) : Promise.resolve({ event_type: "Mass", participant_scope: "Scholar and Parent", event_date: new Date().toISOString().slice(0, 10), required: 1, attendance: [], guardian_attendance: [] }),
      entityList("scholars", { status: "Active", limit: 500 }),
      entityList("enrollments", { scholarship_status: "Active", limit: 500 }),
      lookupRows("chapels"),
      lookupRows("academicYears")
    ]);
    const existing = new Map((event.attendance || []).map(item => [Number(item.scholar_id), item]));
    const existingGuardians = new Map((event.guardian_attendance || []).map(item => [Number(item.scholar_id), item]));
    const enrollments = new Map((enrollmentsPayload.records || []).map(item => [Number(item.scholar_id), item]));
    const scopeForType = new Map(ATTENDANCE_TYPES);
    const { overlay, close } = modalShell(
      id ? "Attendance Sheet" : "New Attendance Sheet",
      "The monitoring type determines whether scholar, parent, or both attendance lists are required.",
      `<form id="attendanceEventForm">
        <div class="scholarship-form-grid">
          <label class="wide"><span>Activity / Event</span><input name="event_title" value="${escapeHtml(event.event_title || "")}" required></label>
          <label><span>Monitoring Type</span><select name="event_type">${ATTENDANCE_TYPES.map(([option]) => `<option ${event.event_type === option ? "selected" : ""}>${option}</option>`).join("")}</select></label>
          <label><span>Participants</span><input id="participantScopeDisplay" value="${escapeHtml(event.participant_scope || scopeForType.get(event.event_type) || "Scholar")}" readonly><input type="hidden" name="participant_scope" value="${escapeHtml(event.participant_scope || scopeForType.get(event.event_type) || "Scholar")}"></label>
          <label><span>Academic Year</span><select name="academic_year_id"><option value="">Select year</option>${years.map(item => `<option value="${item.id}" ${Number(event.academic_year_id) === Number(item.id) ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>
          <label><span>Chapel</span><select name="chapel_id"><option value="">All chapels</option>${chapels.map(item => `<option value="${item.id}" ${Number(event.chapel_id) === Number(item.id) ? "selected" : ""}>${escapeHtml(item.chapel_name)}</option>`).join("")}</select></label>
          <label><span>Date</span><input name="event_date" type="date" value="${escapeHtml(event.event_date || "")}" required></label>
          <label><span>Location</span><input name="location" value="${escapeHtml(event.location || "")}"></label>
          <label class="checkbox-row"><input name="required" type="checkbox" ${Number(event.required) ? "checked" : ""}><span>Required activity</span></label>
          <label class="wide"><span>Notes</span><textarea name="notes">${escapeHtml(event.notes || "")}</textarea></label>
        </div>
        <section class="attendance-batch" data-attendance-scope="scholar"><div class="section-title-row"><h3>Scholar Attendance</h3><span>${scholarsPayload.records.length} active scholars</span></div>
          <div class="data-table-scroll"><table class="data-table"><thead><tr><th>Scholar</th><th>School Year</th><th>Status</th><th>Remarks</th></tr></thead><tbody>${scholarsPayload.records.map(scholar => {
            const attendance = existing.get(Number(scholar.id)) || {};
            const enrollment = enrollments.get(Number(scholar.id));
            return `<tr data-attendance-scholar="${scholar.id}" data-enrollment-id="${enrollment?.id || ""}"><td>${escapeHtml(scholar.scholar_name)}</td><td>${escapeHtml(enrollment?.academic_year_label || "No active enrollment")}</td><td><select name="attendance_status">${["Present", "Late", "Excused", "Absent"].map(option => `<option ${String(attendance.attendance_status || "Absent") === option ? "selected" : ""}>${option}</option>`).join("")}</select></td><td><input name="remarks" value="${escapeHtml(attendance.remarks || "")}"></td></tr>`;
          }).join("")}</tbody></table></div>
        </section>
        <section class="attendance-batch" data-attendance-scope="parent"><div class="section-title-row"><h3>Parent / Guardian Attendance</h3><span>linked to each scholar</span></div>
          <div class="data-table-scroll"><table class="data-table"><thead><tr><th>Scholar</th><th>Parent / Guardian</th><th>Status</th><th>Remarks</th></tr></thead><tbody>${scholarsPayload.records.map(scholar => {
            const attendance = existingGuardians.get(Number(scholar.id)) || {};
            const enrollment = enrollments.get(Number(scholar.id));
            return `<tr data-guardian-attendance-scholar="${scholar.id}" data-enrollment-id="${enrollment?.id || ""}"><td>${escapeHtml(scholar.scholar_name)}</td><td><input name="guardian_name" value="${escapeHtml(attendance.guardian_name || scholar.guardian_name || "")}" placeholder="Parent or guardian"></td><td><select name="attendance_status">${["Present", "Late", "Excused", "Absent"].map(option => `<option ${String(attendance.attendance_status || "Absent") === option ? "selected" : ""}>${option}</option>`).join("")}</select></td><td><input name="remarks" value="${escapeHtml(attendance.remarks || "")}"></td></tr>`;
          }).join("")}</tbody></table></div>
        </section>
      </form>`,
      `<button type="button" class="action-button" data-modal-cancel>Cancel</button>${canWrite("events") ? `<button type="submit" form="attendanceEventForm" class="action-button primary"><span class="button-icon">${icon("save")}</span><span>Save Attendance</span></button>` : ""}`
    );
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    const typeSelect = overlay.querySelector('[name="event_type"]');
    const updateScope = () => {
      const scope = scopeForType.get(typeSelect.value) || "Scholar";
      overlay.querySelector('[name="participant_scope"]').value = scope;
      overlay.querySelector("#participantScopeDisplay").value = scope;
      overlay.querySelector('[data-attendance-scope="scholar"]').hidden = scope === "Parent";
      overlay.querySelector('[data-attendance-scope="parent"]').hidden = scope === "Scholar";
    };
    typeSelect.addEventListener("change", updateScope);
    updateScope();
    overlay.querySelector("#attendanceEventForm").addEventListener("submit", async submitEvent => {
      submitEvent.preventDefault();
      const data = Object.fromEntries(new FormData(submitEvent.currentTarget).entries());
      data.required = submitEvent.currentTarget.elements.required.checked;
      data.id = id || undefined;
      data.attendance = [...overlay.querySelectorAll("[data-attendance-scholar]")].map(row => ({
        scholar_id: row.dataset.attendanceScholar,
        enrollment_id: row.dataset.enrollmentId,
        attendance_status: row.querySelector('[name="attendance_status"]').value,
        remarks: row.querySelector('[name="remarks"]').value
      }));
      data.guardian_attendance = [...overlay.querySelectorAll("[data-guardian-attendance-scholar]")].map(row => ({
        scholar_id: row.dataset.guardianAttendanceScholar,
        enrollment_id: row.dataset.enrollmentId,
        guardian_name: row.querySelector('[name="guardian_name"]').value,
        attendance_status: row.querySelector('[name="attendance_status"]').value,
        remarks: row.querySelector('[name="remarks"]').value
      }));
      if (data.participant_scope === "Parent") data.attendance = [];
      if (data.participant_scope === "Scholar") data.guardian_attendance = [];
      try { await entitySave("events", data); close(); await renderAttendancePage(); } catch (error) { ctx().showToast(error.message); }
    });
  }

  function printEvent(event) {
    const scholarSection = event.participant_scope === "Parent" ? "" : `<h2>Scholar Attendance</h2>${printTable(event.attendance || [], [["scholar_name", "Scholar"], ["scholar_no", "Scholar No."], ["attendance_status", "Status"], ["remarks", "Remarks"]])}`;
    const guardianSection = event.participant_scope === "Scholar" ? "" : `<h2>Parent / Guardian Attendance</h2>${printTable(event.guardian_attendance || [], [["scholar_name", "Scholar"], ["guardian_name", "Parent / Guardian"], ["attendance_status", "Status"], ["remarks", "Remarks"]])}`;
    const content = `${printHeader("Attendance Sheet")}<h1>${escapeHtml(event.event_title)}</h1><p>${escapeHtml(displayDate(event.event_date))} | ${escapeHtml(event.chapel_name || "All chapels")} | ${escapeHtml(event.event_type)} | ${escapeHtml(event.participant_scope)}</p>${scholarSection}${guardianSection}<div class="signature-grid"><div>Prepared by</div><div>Scholarship Program Officer</div></div>`;
    openPrintWindow(`Attendance - ${event.event_title}`, content);
  }

  async function printAttendanceSummary() {
    const [scholars, guardians] = await Promise.all([entityList("attendance", { limit: 500 }), entityList("guardianAttendance", { limit: 500 })]);
    const rows = [...(scholars.records || []).map(item => ({ ...item, participant: "Scholar" })), ...(guardians.records || []).map(item => ({ ...item, participant: "Parent / Guardian" }))];
    openPrintWindow("Scholarship Attendance Summary", `${printHeader("Attendance Monitoring Summary")}${printTable(rows, [["event_date", "Date"], ["event_title", "Activity"], ["scholar_name", "Scholar"], ["participant", "Participant"], ["attendance_status", "Status"], ["remarks", "Remarks"]])}`, { landscape: true });
  }

  async function renderRenewalsPage() {
    ctx().setTitle("Renewal Checklist");
    const entity = state.renewalEntity;
    const page = pageNumber(`renewal-${entity}`);
    const [dashboard, payload] = await Promise.all([ctx().api("/api/scholarship/dashboard"), entityList(entity, { limit: pageSize(), offset: (page - 1) * pageSize() })]);
    const tabs = [["renewals", "Scholar Renewals"], ["renewalTemplates", "Checklist Templates"]];
    const headerActions = `${canWrite(entity) ? actionButton(entity === "renewals" ? "Assign Checklist" : "New Template", "new-renewal-record", "view", true) : ""}${entity === "renewals" && canOfficer() ? actionButton("Batch Assign", "batch-renewals", "users") : ""}${entity === "renewals" && canWrite(entity) ? `${actionButton("Edit Selected", "batch-edit-selected-renewals", "edit")}${actionButton("Edit All", "batch-edit-all-renewals", "users")}` : ""}`;
    const tableOptions = { view: true, print: entity === "renewals", selectable: entity === "renewals", extraActions: renewalActions };
    ctx().setTopbarActions([]);
    ctx().root.innerHTML = `<section class="scholarship-page">${workspaceHeader("Renewal Management", "Maintain reportorial requirements, individual deadlines, and checklist submission status before final eligibility approval.", headerActions)}${metricStrip([{ label: "Pending Renewals", value: dashboard.stats.pendingRenewals, note: "open checklists" }, { label: "Overdue", value: dashboard.stats.overdueRenewals, note: "requires follow-up" }, { label: "Active Enrollments", value: dashboard.stats.activeEnrollments, note: "current scholars" }])}<div class="scholarship-analytics-flow">${barChart("Renewal progress", dashboard.analytics.renewal, "wide")}</div><nav class="scholarship-segmented">${tabs.map(([value, label]) => `<button data-renewal-tab="${value}" class="${value === entity ? "active" : ""}">${label}</button>`).join("")}</nav><section class="scholarship-data-surface">${searchToolbar(entity, payload.total)}<div id="renewalTable">${table(entity, payload.records || [], tableOptions)}${pagination(`renewal-${entity}`, payload.total)}</div></section></section>`;
    ctx().root.querySelectorAll("[data-renewal-tab]").forEach(button => button.addEventListener("click", () => { state.renewalEntity = button.dataset.renewalTab; renderRenewalsPage().catch(error => ctx().showToast(error.message)); }));
    ctx().root.querySelector('[data-scholar-action="new-renewal-record"]')?.addEventListener("click", () => entity === "renewalTemplates" ? openRenewalTemplateEditor(0) : openRenewalEditor(0));
    ctx().root.querySelector('[data-scholar-action="batch-renewals"]')?.addEventListener("click", () => openBatchRenewal());
    ctx().root.querySelector('[data-scholar-action="batch-edit-selected-renewals"]')?.addEventListener("click", () => {
      const ids = selectedTableIds("renewals");
      if (!ids.length) return ctx().showToast("Select at least one renewal checklist first.");
      openBatchRenewalChecklistEditor(ids).catch(error => ctx().showToast(error.message));
    });
    ctx().root.querySelector('[data-scholar-action="batch-edit-all-renewals"]')?.addEventListener("click", () => openBatchRenewalChecklistEditor([]).catch(error => ctx().showToast(error.message)));
    bindCommonTableActions(renderRenewalsPage);
    bindRenewalActions();
    bindSearch(entity, "#renewalTable", records => `${table(entity, records.records || [], tableOptions)}${pagination(`renewal-${entity}`, records.total)}`, renderRenewalsPage);
  }

  function renewalActions(record) {
    return record.status === "Submitted" && canOfficer() ? `<button type="button" class="icon-button" data-renewal-approve="${record.id}" title="Approve renewal">${icon("arrow")}</button>` : "";
  }

  function bindRenewalActions() {
    ctx().root.querySelectorAll("[data-renewal-approve]").forEach(button => button.addEventListener("click", async () => {
      try { await ctx().api(`/api/scholarship/entities/renewals/${button.dataset.renewalApprove}/approve`, { method: "POST", body: "{}" }); await renderRenewalsPage(); } catch (error) { ctx().showToast(error.message); }
    }));
    ctx().root.querySelectorAll('[data-scholar-print^="renewals:"]').forEach(button => button.addEventListener("click", async event => { event.stopImmediatePropagation(); try { printRenewal(await entityGet("renewals", button.dataset.scholarPrint.split(":")[1])); } catch (error) { ctx().showToast(error.message); } }));
  }

  async function openRenewalTemplateEditor(id = 0) {
    const record = id ? await entityGet("renewalTemplates", id) : { version: 1, education_level: "All", status: "Draft", items: [] };
    const years = await lookupRows("academicYears");
    const { overlay, close } = modalShell("Renewal Checklist Template", "Set a deadline for every requirement. Published versions remain stable for assigned scholar renewals.", `<form id="renewalTemplateForm"><div class="scholarship-form-grid"><label class="wide"><span>Template Name</span><input name="template_name" value="${escapeHtml(record.template_name || "")}" required></label><label><span>Academic Year</span><select name="academic_year_id"><option value="">Any year</option>${years.map(year => `<option value="${year.id}" ${Number(record.academic_year_id) === Number(year.id) ? "selected" : ""}>${escapeHtml(year.label)}</option>`).join("")}</select></label><label><span>Education Level</span><select name="education_level">${["All", ...EDUCATION_LEVELS].map(value => `<option ${record.education_level === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label><span>Version</span><input name="version" type="number" min="1" value="${record.version || 1}"></label><label><span>Status</span><select name="status">${["Draft", "Published", "Retired"].map(value => `<option ${record.status === value ? "selected" : ""}>${value}</option>`).join("")}</select></label></div><section class="scholar-form-section"><div class="section-title-row"><h3>Checklist Items</h3><div><button type="button" id="loadPaofiRenewalItems" class="action-button">Use PAOFI Requirements</button><button type="button" id="addRenewalItem" class="icon-button">+</button></div></div><div id="renewalTemplateItems" class="scholar-dynamic-rows"></div></section></form>`, `<button type="button" class="action-button" data-modal-cancel>Cancel</button><button type="submit" form="renewalTemplateForm" class="action-button primary">Save Template</button>`);
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    const host = overlay.querySelector("#renewalTemplateItems");
    const rowTemplate = item => `<div class="scholar-dynamic-row renewal-item-row"><input name="requirement_code" placeholder="Code" value="${escapeHtml(item.requirement_code || "")}"><input name="item_label" placeholder="Checklist requirement" value="${escapeHtml(item.item_label || "")}"><select name="quarter_group">${["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4", "General"].map(value => `<option ${item.quarter_group === value ? "selected" : ""}>${value}</option>`).join("")}</select><select name="applicability">${["All", "College", "Non-College", "First Year College", "ANCOP"].map(value => `<option ${item.applicability === value ? "selected" : ""}>${value}</option>`).join("")}</select><label class="renewal-item-deadline"><span>Deadline</span><input name="deadline" type="date" value="${escapeHtml(item.deadline || "")}" required></label><label class="checkbox-row"><input name="required" type="checkbox" ${item.required === undefined || Number(item.required) ? "checked" : ""}><span>Required</span></label><button type="button" class="icon-button danger" data-remove-row>${icon("bin")}</button></div>`;
    dynamicRows(host, "renewal-item-row", record.items || [], rowTemplate);
    overlay.querySelector("#addRenewalItem").addEventListener("click", () => host.insertAdjacentHTML("beforeend", rowTemplate({})));
    overlay.querySelector("#loadPaofiRenewalItems").addEventListener("click", () => {
      host.innerHTML = PAOFI_RENEWAL_ITEMS.map(([requirement_code, item_label, quarter_group, applicability]) => rowTemplate({ requirement_code, item_label, quarter_group, applicability, required: 1 })).join("");
    });
    overlay.querySelector("#renewalTemplateForm").addEventListener("submit", async event => {
      event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      data.id = id || undefined; data.items = [...host.querySelectorAll(".renewal-item-row")].map((row, index) => ({ row_order: index, requirement_code: row.querySelector('[name="requirement_code"]').value, item_label: row.querySelector('[name="item_label"]').value, quarter_group: row.querySelector('[name="quarter_group"]').value, applicability: row.querySelector('[name="applicability"]').value, deadline: row.querySelector('[name="deadline"]').value, required: row.querySelector('[name="required"]').checked })).filter(item => item.item_label);
      try { await entitySave("renewalTemplates", data); close(); await renderRenewalsPage(); } catch (error) { ctx().showToast(error.message); }
    });
  }

  async function openRenewalEditor(id = 0) {
    const [record, enrollments, templates] = await Promise.all([id ? entityGet("renewals", id) : Promise.resolve({ status: "Not Started", responses: [] }), lookupRows("enrollments"), lookupRows("renewalTemplates")]);
    const selectedTemplate = record.template_id ? await entityGet("renewalTemplates", record.template_id) : null;
    const responseMap = new Map((record.responses || []).map(item => [Number(item.template_item_id), item]));
    const renderItems = template => (template?.items || []).map(item => {
      const response = responseMap.get(Number(item.id)) || {};
      const currentStatus = response.item_status === "Complete" ? "Passed" : response.item_status === "Not Applicable" ? "Exempted" : response.item_status || "Missing";
      const deadline = response.deadline || item.deadline || "";
      const completedOnTime = ["Passed", "Sent to ANCOP"].includes(currentStatus)
        && (!response.status_date || !deadline || response.status_date <= deadline);
      const overdue = Boolean(deadline && deadline < todayDate() && !completedOnTime);
      return `<div class="renewal-response-row ${overdue ? "is-overdue" : ""}" data-template-item="${item.id}" data-completed="${["Passed", "Sent to ANCOP"].includes(currentStatus) ? "1" : "0"}" data-status-date="${escapeHtml(response.status_date || "")}"><div class="renewal-response-copy"><strong>${escapeHtml(item.item_label)}</strong><span>${escapeHtml(item.quarter_group || "General")} | ${escapeHtml(item.applicability || "All")} | ${Number(item.required) ? "Required" : "Optional"}</span>${response.status_date ? `<span>Status recorded ${escapeHtml(displayDate(response.status_date))}</span>` : ""}<small class="renewal-overdue-note" ${overdue ? "" : "hidden"}>Deadline passed. A new accepted submission will be recorded as Late.</small></div><label class="renewal-response-field"><span>Deadline</span><input name="deadline" type="date" value="${escapeHtml(deadline)}" required></label><label class="renewal-response-field"><span>Status</span><select name="item_status">${REQUIREMENT_STATUSES.map(value => `<option ${currentStatus === value ? "selected" : ""} ${overdue && ["Passed", "Sent to ANCOP"].includes(value) ? "disabled" : ""}>${value}</option>`).join("")}</select></label><input name="document_url" type="url" placeholder="https:// protected document link" value="${escapeHtml(response.document_url || "")}"><input name="notes" placeholder="Verification notes" value="${escapeHtml(response.notes || "")}"></div>`;
    }).join("") || `<p>Select a checklist template.</p>`;
    const { overlay, close } = modalShell("Scholar Renewal Checklist", "Each requirement is evaluated against its own deadline. Document links remain protected by the external cloud provider.", `<form id="renewalForm"><div class="scholarship-form-grid"><label class="wide"><span>Scholar Enrollment</span><select name="enrollment_id" required><option value="">Select</option>${enrollments.map(item => `<option value="${item.id}" ${Number(record.enrollment_id) === Number(item.id) ? "selected" : ""}>${escapeHtml(item.enrollment_label)}</option>`).join("")}</select></label><label><span>Checklist Template</span><select name="template_id" required><option value="">Select</option>${templates.filter(item => item.status === "Published" || Number(item.id) === Number(record.template_id)).map(item => `<option value="${item.id}" ${Number(record.template_id) === Number(item.id) ? "selected" : ""}>${escapeHtml(item.template_name)} v${item.version}</option>`).join("")}</select></label><label><span>Checklist Status</span><select name="status">${["Not Started", "In Progress", "Submitted"].map(value => `<option ${record.status === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="wide"><span>Notes</span><textarea name="notes">${escapeHtml(record.notes || "")}</textarea></label></div><section class="renewal-responses" id="renewalResponses">${renderItems(selectedTemplate)}</section></form>`, `<button type="button" class="action-button" data-modal-cancel>Cancel</button><button type="submit" form="renewalForm" class="action-button primary">Save Checklist</button>`);
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    const templateSelect = overlay.querySelector('[name="template_id"]');
    const applyDeadlineGuard = row => {
      const deadline = row.querySelector('[name="deadline"]').value;
      const select = row.querySelector('[name="item_status"]');
      const completedOnTime = row.dataset.completed === "1" && (!row.dataset.statusDate || row.dataset.statusDate <= deadline);
      const overdue = Boolean(deadline && deadline < todayDate() && !completedOnTime);
      for (const option of select.options) option.disabled = overdue && ["Passed", "Sent to ANCOP"].includes(option.value);
      if (overdue && ["Passed", "Sent to ANCOP"].includes(select.value)) select.value = "Late";
      row.classList.toggle("is-overdue", overdue);
      row.querySelector(".renewal-overdue-note")?.toggleAttribute("hidden", !overdue);
    };
    const bindDeadlineGuards = () => overlay.querySelectorAll("[data-template-item]").forEach(row => {
      applyDeadlineGuard(row);
      row.querySelector('[name="deadline"]').addEventListener("change", () => applyDeadlineGuard(row));
    });
    bindDeadlineGuards();
    templateSelect.addEventListener("change", async () => { const template = templateSelect.value ? await entityGet("renewalTemplates", templateSelect.value) : null; overlay.querySelector("#renewalResponses").innerHTML = renderItems(template); bindDeadlineGuards(); });
    overlay.querySelector("#renewalForm").addEventListener("submit", async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget).entries()); data.id = id || undefined; data.responses = [...overlay.querySelectorAll("[data-template-item]")].map(row => ({ template_item_id: row.dataset.templateItem, deadline: row.querySelector('[name="deadline"]').value, item_status: row.querySelector('[name="item_status"]').value, document_url: row.querySelector('[name="document_url"]').value, notes: row.querySelector('[name="notes"]').value })); try { await entitySave("renewals", data); close(); await renderRenewalsPage(); } catch (error) { ctx().showToast(error.message); } });
  }

  async function openRenewalEvaluationEditor(id, rerender = renderRenewalsPage) {
    let record = await entityGet("renewals", id);
    if (!record.evaluation) {
      record = (await ctx().api(`/api/scholarship/entities/renewals/${id}/recalculate`, { method: "POST", body: "{}" })).record;
    }
    const evaluation = record.evaluation || {};
    const score = (field, label, weight, note) => `<div class="renewal-score-line"><div><span>${escapeHtml(label)}</span><small>${escapeHtml(note)}</small></div><strong>${Number(evaluation[field] || 0).toFixed(2)}%</strong><b>${weight}</b></div>`;
    const decisionOptions = selected => RENEWAL_DECISIONS.map(value => `<option ${String(selected || "Pending") === value ? "selected" : ""}>${value}</option>`).join("");
    const { overlay, close } = modalShell(
      "Renewal Eligibility Review",
      "PAOFI's numerical result supports the decision; coordinators and the Education Team retain the final review authority.",
      `<form id="renewalEvaluationForm">
        <section class="renewal-evaluation-hero">
          <div><span>Scholar</span><h3>${escapeHtml(record.scholar_name)}</h3><p>${escapeHtml(record.academic_year_label)} | ${escapeHtml(record.education_level || "")}</p></div>
          <div class="renewal-rating"><span>Overall Rating</span><strong>${Number(evaluation.overall_rating || 0).toFixed(2)}</strong><small>Rank ${escapeHtml(evaluation.ranking || "-")}</small></div>
        </section>
        <section class="renewal-score-sheet">
          ${score("report_card_score", "Report Card", "80%", "Average recorded percentage or approved standardized score")}
          ${score("tutorial_activities_score", "Tutorial / Activities", "5%", "Higher attendance rate from the two scholar activities")}
          ${score("parent_service_score", "Parent Cleaning / Community Service", "5%", "Applicable participation based on education level")}
          ${score("compliance_score", "Reportorial Compliance", "5%", "Passed requirements divided by applicable required items")}
          ${score("mass_score", "Mass Attendance", "5%", "Scholar and parent attendance when both are required")}
          <label class="renewal-adjustment"><span>Tinig Orione Adjustment</span><input name="adjustment_score" type="number" step="0.01" value="${escapeHtml(evaluation.adjustment_score ?? 0)}"><small>Added after the weighted components.</small></label>
        </section>
        <div class="scholarship-form-grid renewal-decision-grid">
          <label><span>Numerical Evaluation</span><input value="${escapeHtml(evaluation.numerical_evaluation || "Pending")}" readonly></label>
          <label><span>Coordinator Evaluation</span><select name="coordinator_evaluation">${decisionOptions(evaluation.coordinator_evaluation)}</select></label>
          <label class="wide"><span>Coordinator Remarks</span><textarea name="coordinator_remarks">${escapeHtml(evaluation.coordinator_remarks || "")}</textarea></label>
          <label><span>Education Team Evaluation</span><select name="education_team_evaluation">${decisionOptions(evaluation.education_team_evaluation)}</select></label>
          <label class="wide"><span>Education Team Remarks</span><textarea name="education_team_remarks">${escapeHtml(evaluation.education_team_remarks || "")}</textarea></label>
          <label><span>Overall Evaluation</span><select name="overall_evaluation">${decisionOptions(evaluation.overall_evaluation)}</select></label>
          <label class="wide"><span>Overall Remarks</span><textarea name="remarks">${escapeHtml(evaluation.remarks || "")}</textarea></label>
        </div>
      </form>`,
      `<button type="button" class="action-button" data-modal-cancel>Cancel</button><button type="submit" form="renewalEvaluationForm" class="action-button primary"><span class="button-icon">${icon("save")}</span><span>Save Evaluation</span></button>`
    );
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    overlay.querySelector("#renewalEvaluationForm").addEventListener("submit", async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      try {
        await ctx().api(`/api/scholarship/entities/renewals/${id}/evaluate`, { method: "POST", loadingMessage: "Recalculating renewal evaluation", body: JSON.stringify(data) });
        ctx().showToast("Renewal evaluation saved.");
        close();
        await rerender();
      } catch (error) { ctx().showToast(error.message); }
    });
  }

  async function openBatchRenewal() {
    const [templates, years] = await Promise.all([lookupRows("renewalTemplates"), lookupRows("academicYears")]);
    const { overlay, close } = modalShell("Batch Assign Renewal Checklists", "Each assigned checklist copies the deadlines defined by its published template.", `<form id="batchRenewalForm" class="scholarship-form-grid"><label><span>Academic Year</span><select name="academic_year_id" required><option value="">Select</option>${years.map(item => `<option value="${item.id}">${escapeHtml(item.label)}</option>`).join("")}</select></label><label><span>Education Level</span><select name="education_level"><option value="">All levels</option>${EDUCATION_LEVELS.map(value => `<option>${value}</option>`).join("")}</select></label><label class="wide"><span>Checklist Template</span><select name="template_id" required><option value="">Select</option>${templates.filter(item => item.status === "Published").map(item => `<option value="${item.id}">${escapeHtml(item.template_name)} v${item.version}</option>`).join("")}</select></label><section id="batchRenewalDeadlines" class="batch-renewal-deadlines wide"><p>Select a template to review its requirement deadlines.</p></section></form>`, `<button type="button" class="action-button" data-modal-cancel>Cancel</button><button type="submit" form="batchRenewalForm" class="action-button primary">Assign</button>`);
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    let selectedTemplate = null;
    const templateSelect = overlay.querySelector('[name="template_id"]');
    templateSelect.addEventListener("change", async () => {
      selectedTemplate = templateSelect.value ? await entityGet("renewalTemplates", templateSelect.value) : null;
      const items = selectedTemplate?.items || [];
      overlay.querySelector("#batchRenewalDeadlines").innerHTML = items.length
        ? `<h3>Requirement Deadlines</h3>${items.map(item => `<div><span>${escapeHtml(item.item_label)}</span><strong>${escapeHtml(displayDate(item.deadline) || "Not set")}</strong></div>`).join("")}`
        : `<p>Select a template to review its requirement deadlines.</p>`;
    });
    overlay.querySelector("#batchRenewalForm").addEventListener("submit", async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      try {
        selectedTemplate = selectedTemplate && Number(selectedTemplate.id) === Number(data.template_id) ? selectedTemplate : await entityGet("renewalTemplates", data.template_id);
        if ((selectedTemplate.items || []).some(item => !item.deadline)) throw new Error("Every template requirement must have a deadline before batch assignment.");
        const payload = await entityList("enrollments", { academic_year_id: data.academic_year_id, education_level: data.education_level, scholarship_status: "Active", limit: 500 });
        let created = 0;
        for (const enrollment of payload.records) {
          try {
            await entitySave("renewals", {
              enrollment_id: enrollment.id,
              template_id: data.template_id,
              status: "Not Started",
              responses: selectedTemplate.items.map(item => ({ template_item_id: item.id, deadline: item.deadline, item_status: "Missing" }))
            });
            created += 1;
          } catch (error) { if (!/unique/i.test(error.message)) console.warn(error); }
        }
        ctx().showToast(`${created} renewal checklists assigned.`);
        close();
        await renderRenewalsPage();
      } catch (error) { ctx().showToast(error.message); }
    });
  }

  async function openBatchRenewalChecklistEditor(selectedRenewalIds = []) {
    const payload = await ctx().api("/api/scholarship/batch/renewals/load", {
      method: "POST",
      loadingMessage: "Loading renewal checklists",
      body: JSON.stringify({ ids: selectedRenewalIds })
    });
    const loadedRecords = payload.records || [];
    const approvedCount = loadedRecords.filter(record => record.status === "Approved").length;
    const records = loadedRecords.filter(record => record.status !== "Approved");
    if (!records.length) throw new Error(approvedCount ? "Approved renewal checklists cannot be batch edited." : "No renewal checklists are available to edit.");

    const requirementMap = new Map();
    for (const record of records) {
      for (const response of record.responses || []) {
        const key = String(response.requirement_code || response.item_label || response.template_item_id);
        if (!requirementMap.has(key)) requirementMap.set(key, response.item_label || response.requirement_code || `Requirement ${response.template_item_id}`);
      }
    }
    const requirements = [...requirementMap.entries()];
    if (!requirements.length) throw new Error("The selected renewal checklists do not contain requirements.");

    const { overlay, close } = modalShell(
      "Batch Edit Renewal Checklists",
      "Choose one requirement, update it across scholars, then save that requirement as one batch.",
      `<form id="batchRenewalChecklistForm" class="batch-edit-workspace">
        <div class="batch-edit-summary">
          <div><strong>${records.length} editable checklist${records.length === 1 ? "" : "s"}</strong><span>${approvedCount ? `${approvedCount} approved checklist${approvedCount === 1 ? " was" : "s were"} excluded.` : "Changes are applied together when you save."}</span></div>
          <label><span>Checklist Requirement</span><select id="batchRenewalRequirement">${requirements.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("")}</select></label>
        </div>
        <div id="batchRenewalChecklistRows"></div>
      </form>`,
      `<button type="button" class="action-button" data-modal-cancel>Cancel</button><button type="submit" form="batchRenewalChecklistForm" class="action-button primary"><span class="button-icon">${icon("save")}</span><span>Save Requirement</span></button>`
    );
    overlay.querySelector(".scholarship-modal")?.classList.add("batch-edit-modal");
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    const requirementSelect = overlay.querySelector("#batchRenewalRequirement");
    const rowsHost = overlay.querySelector("#batchRenewalChecklistRows");
    const statusOptions = selected => REQUIREMENT_STATUSES.map(value => `<option value="${value}" ${selected === value ? "selected" : ""}>${value}</option>`).join("");
    const checklistStatusOptions = selected => ["Not Started", "In Progress", "Submitted"].map(value => `<option value="${value}" ${selected === value ? "selected" : ""}>${value}</option>`).join("");
    const responseKey = response => String(response.requirement_code || response.item_label || response.template_item_id);

    const renderRequirementRows = () => {
      const requirementKey = requirementSelect.value;
      const applicable = records.map(record => ({ record, response: (record.responses || []).find(item => responseKey(item) === requirementKey) })).filter(item => item.response);
      rowsHost.innerHTML = applicable.length ? `
        <div class="batch-edit-table" role="region" aria-label="Renewal checklist batch editor" tabindex="0">
          <table>
            <thead><tr><th>Scholar</th><th>Checklist Status</th><th>Requirement Status</th><th>Deadline</th><th>Evidence Link</th><th>Requirement Notes</th><th>Checklist Notes</th></tr></thead>
            <tbody>${applicable.map(({ record, response }) => {
              const deadline = response.deadline || "";
              const completedOnTime = ["Passed", "Sent to ANCOP"].includes(response.item_status) && (!response.status_date || !deadline || response.status_date <= deadline);
              const overdue = Boolean(deadline && deadline < todayDate() && !completedOnTime);
              const currentStatus = overdue && ["Passed", "Sent to ANCOP"].includes(response.item_status) ? "Late" : (response.item_status || "Missing");
              return `<tr data-batch-renewal="${record.id}" data-template-item="${response.template_item_id}" data-completed-on-time="${completedOnTime ? "1" : "0"}">
                <td class="batch-scholar-cell"><strong>${escapeHtml(record.scholar_name || "Scholar")}</strong><span>${escapeHtml(record.academic_year_label || "")}</span>${overdue ? `<small>Deadline passed; accepted work will be marked Late.</small>` : ""}</td>
                <td><select name="status">${checklistStatusOptions(record.status)}</select></td>
                <td><select name="item_status">${statusOptions(currentStatus)}</select></td>
                <td><input name="deadline" type="date" value="${escapeHtml(deadline)}" required></td>
                <td><input name="document_url" type="url" placeholder="https://" value="${escapeHtml(response.document_url || "")}"></td>
                <td><textarea name="response_notes" rows="2">${escapeHtml(response.notes || "")}</textarea></td>
                <td><textarea name="renewal_notes" rows="2">${escapeHtml(record.notes || "")}</textarea></td>
              </tr>`;
            }).join("")}</tbody>
          </table>
        </div>
        <p class="batch-edit-footnote">${applicable.length} scholar${applicable.length === 1 ? "" : "s"} use this requirement. Saving updates only this requirement and preserves every other checklist item.</p>` : `<div class="scholarship-empty"><strong>No matching scholar records</strong><span>This requirement is not assigned to the selected checklists.</span></div>`;
      rowsHost.querySelectorAll("[data-batch-renewal]").forEach(row => {
        const deadlineInput = row.querySelector('[name="deadline"]');
        const statusSelect = row.querySelector('[name="item_status"]');
        const enforceDeadline = () => {
          const overdue = Boolean(deadlineInput.value && deadlineInput.value < todayDate() && row.dataset.completedOnTime !== "1");
          for (const option of statusSelect.options) option.disabled = overdue && ["Passed", "Sent to ANCOP"].includes(option.value);
          if (overdue && ["Passed", "Sent to ANCOP"].includes(statusSelect.value)) statusSelect.value = "Late";
        };
        enforceDeadline();
        deadlineInput.addEventListener("change", enforceDeadline);
      });
    };
    renderRequirementRows();
    requirementSelect.addEventListener("change", renderRequirementRows);
    overlay.querySelector("#batchRenewalChecklistForm").addEventListener("submit", async event => {
      event.preventDefault();
      const rows = [...rowsHost.querySelectorAll("[data-batch-renewal]")].map(row => ({
        renewal_id: Number(row.dataset.batchRenewal),
        status: row.querySelector('[name="status"]').value,
        notes: row.querySelector('[name="renewal_notes"]').value,
        response: {
          template_item_id: Number(row.dataset.templateItem),
          item_status: row.querySelector('[name="item_status"]').value,
          deadline: row.querySelector('[name="deadline"]').value,
          document_url: row.querySelector('[name="document_url"]').value,
          notes: row.querySelector('[name="response_notes"]').value
        }
      }));
      if (!rows.length) return ctx().showToast("No scholar records use the selected requirement.");
      try {
        const result = await ctx().api("/api/scholarship/batch/renewals", {
          method: "POST",
          loadingMessage: "Updating renewal checklists",
          body: JSON.stringify({ rows })
        });
        ctx().showToast(`${result.updated} renewal checklist${result.updated === 1 ? "" : "s"} updated.`);
        close();
        await renderRenewalsPage();
      } catch (error) { ctx().showToast(error.message); }
    });
  }

  async function openBatchWeightedEvaluationEditor(selectedEvaluationIds = []) {
    const payload = await entityList("renewalEvaluations", { limit: 500, offset: 0 });
    const selected = new Set(selectedEvaluationIds.map(Number));
    const records = (payload.records || []).filter(record => !selected.size || selected.has(Number(record.id)));
    if (!records.length) throw new Error("No weighted scholar evaluations are available to edit.");
    const decisionOptions = selectedValue => RENEWAL_DECISIONS.map(value => `<option value="${value}" ${String(selectedValue || "Pending") === value ? "selected" : ""}>${value}</option>`).join("");
    const { overlay, close } = modalShell(
      "Batch Edit Scholar Evaluations",
      "Update coordinator, Education Team, and final renewal decisions across scholars in one workspace.",
      `<form id="batchWeightedEvaluationForm" class="batch-edit-workspace">
        <div class="batch-edit-summary"><div><strong>${records.length} weighted evaluation${records.length === 1 ? "" : "s"}</strong><span>Calculated components remain read-only; rankings refresh once after the batch is saved.</span></div></div>
        <div class="batch-edit-table" role="region" aria-label="Weighted scholar evaluation batch editor" tabindex="0">
          <table>
            <thead><tr><th>Scholar</th><th>Calculated Result</th><th>Adjustment</th><th>Coordinator Decision</th><th>Coordinator Remarks</th><th>Education Team Decision</th><th>Education Team Remarks</th><th>Final Decision</th><th>Overall Remarks</th></tr></thead>
            <tbody>${records.map(record => `<tr data-batch-evaluation="${record.renewal_id}">
              <td class="batch-scholar-cell"><strong>${escapeHtml(record.scholar_name || "Scholar")}</strong><span>${escapeHtml(record.academic_year_label || "")}</span></td>
              <td class="batch-result-cell"><strong>${Number(record.overall_rating || 0).toFixed(2)}</strong><span>${escapeHtml(record.numerical_evaluation || "Pending")} | Rank ${escapeHtml(record.ranking || "-")}</span></td>
              <td><input name="adjustment_score" type="number" step="0.01" value="${escapeHtml(record.adjustment_score || 0)}"></td>
              <td><select name="coordinator_evaluation">${decisionOptions(record.coordinator_evaluation)}</select></td>
              <td><textarea name="coordinator_remarks" rows="2">${escapeHtml(record.coordinator_remarks || "")}</textarea></td>
              <td><select name="education_team_evaluation">${decisionOptions(record.education_team_evaluation)}</select></td>
              <td><textarea name="education_team_remarks" rows="2">${escapeHtml(record.education_team_remarks || "")}</textarea></td>
              <td><select name="overall_evaluation">${decisionOptions(record.overall_evaluation)}</select></td>
              <td><textarea name="remarks" rows="2">${escapeHtml(record.remarks || "")}</textarea></td>
            </tr>`).join("")}</tbody>
          </table>
        </div>
      </form>`,
      `<button type="button" class="action-button" data-modal-cancel>Cancel</button><button type="submit" form="batchWeightedEvaluationForm" class="action-button primary"><span class="button-icon">${icon("save")}</span><span>Save Evaluations</span></button>`
    );
    overlay.querySelector(".scholarship-modal")?.classList.add("batch-edit-modal");
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    overlay.querySelector("#batchWeightedEvaluationForm").addEventListener("submit", async event => {
      event.preventDefault();
      const rows = [...overlay.querySelectorAll("[data-batch-evaluation]")].map(row => ({
        renewal_id: Number(row.dataset.batchEvaluation),
        adjustment_score: Number(row.querySelector('[name="adjustment_score"]').value || 0),
        coordinator_evaluation: row.querySelector('[name="coordinator_evaluation"]').value,
        coordinator_remarks: row.querySelector('[name="coordinator_remarks"]').value,
        education_team_evaluation: row.querySelector('[name="education_team_evaluation"]').value,
        education_team_remarks: row.querySelector('[name="education_team_remarks"]').value,
        overall_evaluation: row.querySelector('[name="overall_evaluation"]').value,
        remarks: row.querySelector('[name="remarks"]').value
      }));
      try {
        const result = await ctx().api("/api/scholarship/batch/renewal-evaluations", {
          method: "POST",
          loadingMessage: "Updating weighted scholar evaluations",
          body: JSON.stringify({ rows })
        });
        ctx().showToast(`${result.updated} scholar evaluation${result.updated === 1 ? "" : "s"} updated.`);
        close();
        await renderEvaluationsPage();
      } catch (error) { ctx().showToast(error.message); }
    });
  }

  function printRenewal(record) {
    const evaluation = record.evaluation;
    const evaluationSection = evaluation ? `<h2>Renewal Evaluation</h2><div class="print-grid">${profileField("Report Card (80%)", `${Number(evaluation.report_card_score || 0).toFixed(2)}%`)}${profileField("Tutorial / Activities (5%)", `${Number(evaluation.tutorial_activities_score || 0).toFixed(2)}%`)}${profileField("Parent / Service (5%)", `${Number(evaluation.parent_service_score || 0).toFixed(2)}%`)}${profileField("Compliance (5%)", `${Number(evaluation.compliance_score || 0).toFixed(2)}%`)}${profileField("Mass (5%)", `${Number(evaluation.mass_score || 0).toFixed(2)}%`)}${profileField("Adjustment", evaluation.adjustment_score)}${profileField("Overall Rating", evaluation.overall_rating)}${profileField("Rank", evaluation.ranking)}${profileField("Numerical Evaluation", evaluation.numerical_evaluation)}${profileField("Coordinator Evaluation", evaluation.coordinator_evaluation)}${profileField("Education Team Evaluation", evaluation.education_team_evaluation)}${profileField("Overall Evaluation", evaluation.overall_evaluation)}</div><div class="print-grid">${profileField("Coordinator Remarks", evaluation.coordinator_remarks)}${profileField("Education Team Remarks", evaluation.education_team_remarks)}${profileField("Overall Remarks", evaluation.remarks)}</div>` : "";
    const content = `${printHeader("Scholar Renewal Checklist")}<h1>${escapeHtml(record.scholar_name)}</h1><p>${escapeHtml(record.academic_year_label)} | ${escapeHtml(record.status)}</p>${printTable(record.responses || [], [["quarter_group", "Quarter"], ["item_label", "Requirement"], ["applicability", "Applies To"], ["deadline", "Deadline"], ["item_status", "Status"], ["status_date", "Date Recorded"], ["notes", "Notes"]])}${evaluationSection}<div class="signature-grid"><div>Chapel Coordinator</div><div>Scholarship Program Officer / Education Team</div></div>`;
    openPrintWindow(`Renewal - ${record.scholar_name}`, content);
  }

  async function renderEvaluationsPage() {
    ctx().setTitle("Scholar Evaluation");
    const entity = state.evaluationEntity;
    const page = pageNumber(`evaluation-${entity}`);
    const [dashboard, payload] = await Promise.all([ctx().api("/api/scholarship/dashboard"), entityList(entity, { limit: pageSize(), offset: (page - 1) * pageSize() })]);
    const weighted = entity === "renewalEvaluations";
    const tabs = [["renewalEvaluations", "Weighted Renewal Evaluations"], ["evaluations", "Additional Evaluations"], ["evaluationTemplates", "Evaluation Templates"]];
    const actions = weighted
      ? `${actionButton("Print Weighted Summary", "print-weighted-evaluations", "print")}${canOfficer() ? `${actionButton("Edit Selected", "batch-edit-selected-evaluations", "edit")}${actionButton("Edit All", "batch-edit-all-evaluations", "users")}` : ""}`
      : `${canWrite(entity) ? actionButton(entity === "evaluations" ? "New Evaluation" : "New Template", "new-evaluation-record", "edit", true) : ""}${entity === "evaluations" ? actionButton("Print Summary", "print-evaluations", "print") : ""}`;
    const metrics = weighted
      ? [
          { label: "Weighted Evaluations", value: dashboard.stats.weightedEvaluations, note: "linked renewal reviews" },
          { label: "Average Rating", value: Number(dashboard.stats.averageRenewalRating || 0).toFixed(2), note: "80/5/5/5/5 result" },
          { label: "Pending Decisions", value: dashboard.stats.pendingWeightedDecisions, note: "awaiting final review" },
          { label: "Needs Review", value: dashboard.stats.weightedNeedsReview, note: "failed or flagged results" }
        ]
      : [
          { label: "Completed Evaluations", value: dashboard.stats.completedEvaluations, note: "approved records" },
          { label: "Flagged Cases", value: dashboard.stats.flaggedEvaluations, note: "below template midpoint" },
          { label: "Active Scholars", value: dashboard.stats.activeScholars, note: "evaluation population" }
        ];
    const analytics = weighted
      ? `${barChart("Average weighted contribution", dashboard.analytics.renewalComponents, "wide")}${barChart("Renewal decisions", dashboard.analytics.renewalDecisions)}`
      : `${barChart("Average evaluation by education level", dashboard.analytics.evaluationByLevel)}${barChart("Average evaluation by school year", dashboard.analytics.evaluationByYear)}`;
    const tableOptions = weighted
      ? { view: false, edit: false, print: true, selectable: canOfficer(), extraActions: weightedRenewalActions }
      : { view: true, print: entity === "evaluations", extraActions: entity === "evaluations" ? evaluationActions : null };
    ctx().setTopbarActions([]);
    ctx().root.innerHTML = `<section class="scholarship-page">${workspaceHeader("Scholar Evaluation", weighted ? "Review the PAOFI weighted renewal evaluation: Report Card 80%, Tutorial or Activities 5%, Parent or Service 5%, Reportorial Compliance 5%, and Mass Attendance 5%." : "Maintain supplementary versioned evaluations, narrative findings, recommendations, and documented revisions.", actions)}${metricStrip(metrics)}<div class="scholarship-analytics-flow">${analytics}</div><nav class="scholarship-segmented">${tabs.map(([value, label]) => `<button data-evaluation-tab="${value}" class="${value === entity ? "active" : ""}">${label}</button>`).join("")}</nav><section class="scholarship-data-surface">${searchToolbar(entity, payload.total)}<div id="evaluationTable">${table(entity, payload.records || [], tableOptions)}${pagination(`evaluation-${entity}`, payload.total)}</div></section></section>`;
    ctx().root.querySelectorAll("[data-evaluation-tab]").forEach(button => button.addEventListener("click", () => { state.evaluationEntity = button.dataset.evaluationTab; renderEvaluationsPage().catch(error => ctx().showToast(error.message)); }));
    ctx().root.querySelector('[data-scholar-action="new-evaluation-record"]')?.addEventListener("click", () => entity === "evaluationTemplates" ? openEvaluationTemplateEditor(0) : openEvaluationEditor(0));
    ctx().root.querySelector('[data-scholar-action="print-evaluations"]')?.addEventListener("click", () => printEvaluationSummary());
    ctx().root.querySelector('[data-scholar-action="print-weighted-evaluations"]')?.addEventListener("click", () => printWeightedRenewalSummary());
    ctx().root.querySelector('[data-scholar-action="batch-edit-selected-evaluations"]')?.addEventListener("click", () => {
      const ids = selectedTableIds("renewalEvaluations");
      if (!ids.length) return ctx().showToast("Select at least one scholar evaluation first.");
      openBatchWeightedEvaluationEditor(ids).catch(error => ctx().showToast(error.message));
    });
    ctx().root.querySelector('[data-scholar-action="batch-edit-all-evaluations"]')?.addEventListener("click", () => openBatchWeightedEvaluationEditor([]).catch(error => ctx().showToast(error.message)));
    bindCommonTableActions(renderEvaluationsPage);
    if (weighted) bindWeightedRenewalActions();
    else bindEvaluationActions();
    bindSearch(entity, "#evaluationTable", records => `${table(entity, records.records || [], tableOptions)}${pagination(`evaluation-${entity}`, records.total)}`, renderEvaluationsPage);
  }

  function weightedRenewalActions(record) {
    if (!canOfficer()) return "";
    return `<button type="button" class="icon-button" data-weighted-renewal-review="${record.renewal_id}" title="Review weighted renewal evaluation">${icon("monitoring")}</button>${record.renewal_status === "Submitted" ? `<button type="button" class="icon-button" data-weighted-renewal-approve="${record.renewal_id}" title="Approve renewal">${icon("arrow")}</button>` : ""}`;
  }

  function bindWeightedRenewalActions() {
    ctx().root.querySelectorAll("[data-weighted-renewal-review]").forEach(button => button.addEventListener("click", () => openRenewalEvaluationEditor(button.dataset.weightedRenewalReview, renderEvaluationsPage)));
    ctx().root.querySelectorAll("[data-weighted-renewal-approve]").forEach(button => button.addEventListener("click", async () => {
      try {
        await ctx().api(`/api/scholarship/entities/renewals/${button.dataset.weightedRenewalApprove}/approve`, { method: "POST", body: "{}" });
        ctx().showToast("Scholar renewal approved.");
        await renderEvaluationsPage();
      } catch (error) { ctx().showToast(error.message); }
    }));
    ctx().root.querySelectorAll('[data-scholar-print^="renewalEvaluations:"]').forEach(button => button.addEventListener("click", async event => {
      event.stopImmediatePropagation();
      try { printWeightedRenewalEvaluation(await entityGet("renewalEvaluations", button.dataset.scholarPrint.split(":")[1])); } catch (error) { ctx().showToast(error.message); }
    }));
  }

  function evaluationActions(record) {
    if (!canOfficer()) return "";
    if (record.status === "Draft") return `<button type="button" class="icon-button" data-evaluation-action="complete:${record.id}" title="Complete evaluation">${icon("arrow")}</button>`;
    if (record.status === "Completed") return `<button type="button" class="icon-button" data-evaluation-action="revise:${record.id}" title="Create revision">${icon("refresh")}</button>`;
    return "";
  }

  function bindEvaluationActions() {
    ctx().root.querySelectorAll("[data-evaluation-action]").forEach(button => button.addEventListener("click", async () => { const [action, id] = button.dataset.evaluationAction.split(":"); try { await ctx().api(`/api/scholarship/entities/evaluations/${id}/${action}`, { method: "POST", body: "{}" }); await renderEvaluationsPage(); } catch (error) { ctx().showToast(error.message); } }));
    ctx().root.querySelectorAll('[data-scholar-print^="evaluations:"]').forEach(button => button.addEventListener("click", async event => { event.stopImmediatePropagation(); try { printEvaluation(await entityGet("evaluations", button.dataset.scholarPrint.split(":")[1])); } catch (error) { ctx().showToast(error.message); } }));
  }

  async function openEvaluationTemplateEditor(id = 0) {
    const record = id ? await entityGet("evaluationTemplates", id) : { version: 1, scale_min: 1, scale_max: 5, education_level: "All", status: "Draft", criteria: [] };
    const years = await lookupRows("academicYears");
    const { overlay, close } = modalShell("Evaluation Template", "Criteria weights produce a weighted score while preserving the configured scale.", `<form id="evaluationTemplateForm"><div class="scholarship-form-grid"><label class="wide"><span>Template Name</span><input name="template_name" value="${escapeHtml(record.template_name || "")}" required></label><label><span>Academic Year</span><select name="academic_year_id"><option value="">Any year</option>${years.map(year => `<option value="${year.id}" ${Number(record.academic_year_id) === Number(year.id) ? "selected" : ""}>${escapeHtml(year.label)}</option>`).join("")}</select></label><label><span>Education Level</span><select name="education_level">${["All", ...EDUCATION_LEVELS].map(value => `<option ${record.education_level === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label><span>Version</span><input name="version" type="number" min="1" value="${record.version || 1}"></label><label><span>Scale Minimum</span><input name="scale_min" type="number" step="0.01" value="${record.scale_min}"></label><label><span>Scale Maximum</span><input name="scale_max" type="number" step="0.01" value="${record.scale_max}"></label><label><span>Status</span><select name="status">${["Draft", "Published", "Retired"].map(value => `<option ${record.status === value ? "selected" : ""}>${value}</option>`).join("")}</select></label></div><section class="scholar-form-section"><div class="section-title-row"><h3>Scored Criteria</h3><button type="button" id="addEvaluationCriterion" class="icon-button">+</button></div><div id="evaluationCriteria" class="scholar-dynamic-rows"></div></section></form>`, `<button type="button" class="action-button" data-modal-cancel>Cancel</button><button type="submit" form="evaluationTemplateForm" class="action-button primary">Save Template</button>`);
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    const host = overlay.querySelector("#evaluationCriteria");
    const rowTemplate = item => `<div class="scholar-dynamic-row evaluation-criterion-row"><input name="criterion_label" placeholder="Evaluation criterion" value="${escapeHtml(item.criterion_label || "")}"><input name="weight" type="number" min="0.01" step="0.01" placeholder="Weight" value="${escapeHtml(item.weight || 1)}"><button type="button" class="icon-button danger" data-remove-row>${icon("bin")}</button></div>`;
    dynamicRows(host, "evaluation-criterion-row", record.criteria || [], rowTemplate); overlay.querySelector("#addEvaluationCriterion").addEventListener("click", () => host.insertAdjacentHTML("beforeend", rowTemplate({})));
    overlay.querySelector("#evaluationTemplateForm").addEventListener("submit", async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget).entries()); data.id = id || undefined; data.criteria = [...host.querySelectorAll(".evaluation-criterion-row")].map((row, index) => ({ row_order: index, criterion_label: row.querySelector('[name="criterion_label"]').value, weight: row.querySelector('[name="weight"]').value })).filter(item => item.criterion_label); try { await entitySave("evaluationTemplates", data); close(); await renderEvaluationsPage(); } catch (error) { ctx().showToast(error.message); } });
  }

  async function openEvaluationEditor(id = 0) {
    const [record, enrollments, templates] = await Promise.all([id ? entityGet("evaluations", id) : Promise.resolve({ evaluation_date: new Date().toISOString().slice(0, 10), status: "Draft", scores: [] }), lookupRows("enrollments"), lookupRows("evaluationTemplates")]);
    const scoreMap = new Map((record.scores || []).map(item => [Number(item.criterion_id), item]));
    const selectedTemplate = record.template_id ? await entityGet("evaluationTemplates", record.template_id) : null;
    const renderScores = template => (template?.criteria || []).map(item => { const score = scoreMap.get(Number(item.id)) || {}; return `<div class="evaluation-score-row" data-criterion-id="${item.id}"><div><strong>${escapeHtml(item.criterion_label)}</strong><span>Weight ${item.weight}</span></div><input name="score" type="number" min="${template.scale_min}" max="${template.scale_max}" step="0.01" value="${escapeHtml(score.score || template.scale_min)}"><input name="notes" placeholder="Criterion notes" value="${escapeHtml(score.notes || "")}"></div>`; }).join("") || `<p>Select an evaluation template.</p>`;
    const { overlay, close } = modalShell("Scholar Evaluation", "Completed evaluations become immutable. Corrections create linked revisions.", `<form id="evaluationForm"><div class="scholarship-form-grid"><label class="wide"><span>Scholar Enrollment</span><select name="enrollment_id" required><option value="">Select</option>${enrollments.map(item => `<option value="${item.id}" ${Number(record.enrollment_id) === Number(item.id) ? "selected" : ""}>${escapeHtml(item.enrollment_label)}</option>`).join("")}</select></label><label><span>Evaluation Template</span><select name="template_id" required><option value="">Select</option>${templates.filter(item => item.status === "Published" || Number(item.id) === Number(record.template_id)).map(item => `<option value="${item.id}" ${Number(record.template_id) === Number(item.id) ? "selected" : ""}>${escapeHtml(item.template_name)} v${item.version}</option>`).join("")}</select></label><label><span>Evaluation Date</span><input name="evaluation_date" type="date" value="${escapeHtml(record.evaluation_date || "")}" required></label><label class="wide"><span>Narrative Findings</span><textarea name="narrative">${escapeHtml(record.narrative || "")}</textarea></label><label class="wide"><span>Recommendations</span><textarea name="recommendations">${escapeHtml(record.recommendations || "")}</textarea></label></div><section id="evaluationScores" class="evaluation-scores">${renderScores(selectedTemplate)}</section></form>`, `<button type="button" class="action-button" data-modal-cancel>Cancel</button><button type="submit" form="evaluationForm" class="action-button primary">Save Draft</button>`);
    overlay.querySelector("[data-modal-cancel]").addEventListener("click", close);
    const templateSelect = overlay.querySelector('[name="template_id"]'); templateSelect.addEventListener("change", async () => { const template = templateSelect.value ? await entityGet("evaluationTemplates", templateSelect.value) : null; overlay.querySelector("#evaluationScores").innerHTML = renderScores(template); });
    overlay.querySelector("#evaluationForm").addEventListener("submit", async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget).entries()); data.id = id || undefined; data.status = "Draft"; data.scores = [...overlay.querySelectorAll("[data-criterion-id]")].map(row => ({ criterion_id: row.dataset.criterionId, score: row.querySelector('[name="score"]').value, notes: row.querySelector('[name="notes"]').value })); try { await entitySave("evaluations", data); close(); await renderEvaluationsPage(); } catch (error) { ctx().showToast(error.message); } });
  }

  function printWeightedRenewalEvaluation(record) {
    const weightedValue = (value, weight) => `${Number(value || 0).toFixed(2)}% x ${weight}% = ${(Number(value || 0) * weight / 100).toFixed(2)}`;
    const content = `${printHeader("Weighted Renewal Evaluation")}<h1>${escapeHtml(record.scholar_name)}</h1><p>${escapeHtml(record.academic_year_label)} | ${escapeHtml(record.renewal_status || "Renewal Review")} | Calculated ${escapeHtml(displayDate(record.calculated_at))}</p><h2>80/5/5/5/5 Weighted Components</h2><div class="print-grid">${profileField("Report Card (80%)", weightedValue(record.report_card_score, 80))}${profileField("Tutorial / Activities (5%)", weightedValue(record.tutorial_activities_score, 5))}${profileField("Parent / Service (5%)", weightedValue(record.parent_service_score, 5))}${profileField("Reportorial Compliance (5%)", weightedValue(record.compliance_score, 5))}${profileField("Mass Attendance (5%)", weightedValue(record.mass_score, 5))}${profileField("Tinig Orione Adjustment", Number(record.adjustment_score || 0).toFixed(2))}</div><h2>Evaluation Result</h2><div class="print-grid">${profileField("Overall Rating", Number(record.overall_rating || 0).toFixed(2))}${profileField("Rank", record.ranking)}${profileField("Numerical Evaluation", record.numerical_evaluation)}${profileField("Coordinator Evaluation", record.coordinator_evaluation)}${profileField("Education Team Evaluation", record.education_team_evaluation)}${profileField("Final Decision", record.overall_evaluation)}${profileField("Coordinator Remarks", record.coordinator_remarks)}${profileField("Education Team Remarks", record.education_team_remarks)}${profileField("Overall Remarks", record.remarks)}</div><div class="signature-grid"><div>Chapel Coordinator</div><div>Scholarship Program Officer / Education Team</div></div>`;
    openPrintWindow(`Weighted Evaluation - ${record.scholar_name}`, content);
  }

  async function printWeightedRenewalSummary() {
    const payload = await entityList("renewalEvaluations", { limit: 500 });
    openPrintWindow("Weighted Renewal Evaluation Summary", `${printHeader("Weighted Renewal Evaluation Summary")}<p>PAOFI 80/5/5/5/5 renewal evaluation results</p>${printTable(payload.records || [], LIST_COLUMNS.renewalEvaluations)}`, { landscape: true });
  }

  function printEvaluation(record) {
    const content = `${printHeader("Scholar Evaluation")}<h1>${escapeHtml(record.scholar_name)}</h1><p>${escapeHtml(record.academic_year_label)} | ${escapeHtml(displayDate(record.evaluation_date))} | ${escapeHtml(record.status)}</p>${printTable(record.scores || [], [["criterion_label", "Criterion"], ["weight", "Weight"], ["score", "Score"], ["notes", "Notes"]])}<h2>Overall Score: ${escapeHtml(record.overall_score)}</h2><div class="print-grid">${profileField("Narrative Findings", record.narrative)}${profileField("Recommendations", record.recommendations)}</div><div class="signature-grid"><div>Evaluator</div><div>Scholarship Program Officer</div></div>`;
    openPrintWindow(`Evaluation - ${record.scholar_name}`, content);
  }

  async function printEvaluationSummary() {
    const payload = await entityList("evaluations", { limit: 500 });
    openPrintWindow("Scholar Evaluation Summary", `${printHeader("Scholar Evaluation Summary")}${printTable(payload.records || [], LIST_COLUMNS.evaluations)}`, { landscape: true });
  }

  async function renderCurrent() {
    const route = location.hash.replace(/^#\/?/, "").split("/")[0];
    return renderRoute(route, "", state.context);
  }

  async function renderRoute(route, id, context) {
    state.context = context;
    if (!state.meta) state.meta = await context.api("/api/scholarship/meta");
    if (route === "scholarship-scholars") return renderProfilesPage(id);
    if (route === "scholarship-sponsors") return renderSponsorsPage(id);
    if (route === "scholarship-donations") return renderDonationPage(id);
    if (route === "scholarship-grades") return renderGradesPage(id);
    if (route === "scholarship-attendance") return renderAttendancePage(id);
    if (route === "scholarship-renewals") return renderRenewalsPage(id);
    if (route === "scholarship-evaluations") return renderEvaluationsPage(id);
    return renderProfilesPage();
  }

  window.ScholarshipApp = { renderRoute };
})();
