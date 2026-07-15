const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const ExcelJS = require("exceljs");
const { BeneficiaryDatabase } = require("../src/database");
const { TursoBeneficiaryDatabase } = require("../src/turso-database");
const { createServer } = require("../server");
const { previewScholarshipImport, commitScholarshipImport, scholarshipImportTemplate } = require("../src/scholarship-import");
const { importScholarshipRoster, splitSponsorNames } = require("../src/scholarship-roster-import");

function tempDb() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "paofi-scholarship-"));
  return new BeneficiaryDatabase(path.join(directory, "test.sqlite"));
}

async function withApi(db, callback) {
  const server = createServer(db);
  await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", error => error ? reject(error) : resolve()));
  const address = server.address();
  try {
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

async function apiLogin(baseUrl, username, password) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  assert.equal(response.status, 200);
  return (await response.json()).token;
}

async function apiRequest(baseUrl, token, pathname, options = {}) {
  return fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
}

async function coreRecords(db) {
  const scholar = await db.scholarship.save("scholars", {
    last_name: "Santos",
    first_name: "Ana",
    birth_date: "2010-03-12",
    place_of_birth: "Quezon City",
    gender: "Female",
    hobbies: "Reading",
    ambition: "Teacher",
    special_circumstances: "Solo-parent household",
    other_income_source: "Home-based vending",
    birth_order: "2nd",
    total_siblings: 2,
    married_siblings: 0,
    household_contribution: 1500,
    household_members: [
      { member_name: "Maria Santos", relationship: "Mother", birth_date: "1984-09-27", gender: "Female", civil_status: "Married", education_attainment: "College Undergraduate", occupation: "Housewife", monthly_income: 0 },
      { member_name: "Jose Santos", relationship: "Father", birth_date: "1982-10-22", gender: "Male", civil_status: "Married", education_attainment: "College Undergraduate", occupation: "Driver", monthly_income: 18000 }
    ],
    document_links: [{ document_type: "Report Card", label: "Current report card", document_url: "https://example.org/report-card" }]
  }, 1);
  const year = await db.scholarship.save("academicYears", {
    label: "2026-2027",
    start_date: "2026-06-01",
    end_date: "2027-03-31",
    status: "Active"
  }, 1);
  const enrollment = await db.scholarship.save("enrollments", {
    scholar_id: scholar.id,
    academic_year_id: year.id,
    school_name: "Payatas High School",
    education_level: "Junior High School",
    grade_or_year: "Grade 9",
    scholarship_status: "Active"
  }, 1);
  const sponsor = await db.scholarship.save("sponsors", {
    sponsor_type: "Individual",
    sponsor_name: "Juan Dela Cruz",
    email: "juan@example.org",
    status: "Active"
  }, 1);
  return { scholar, year, enrollment, sponsor };
}

test("creates Scholarship profiles, yearly enrollments, roles, and many-to-many sponsorships", async () => {
  const db = tempDb();
  const chapels = await db.scholarship.list("chapels", { limit: 50 });
  assert.equal(chapels.length, 13);
  assert.ok(chapels.some(chapel => chapel.chapel_name === "Sto. Nino"));
  const user = db.saveUser({ username: "scholarship.encoder", display_name: "Scholarship Encoder", password: "ExamplePass123" });
  assert.deepEqual(await db.scholarship.setUserRoles(user.id, ["encoder", "viewer", "encoder"]), ["encoder", "viewer"]);
  assert.deepEqual((await db.scholarship.decorateUser(user)).program_roles.scholarship, ["encoder", "viewer"]);

  const { scholar, enrollment, sponsor } = await coreRecords(db);
  const chapel = chapels.find(item => item.chapel_code === "ASCENSION");
  await db.scholarship.save("scholars", { id: scholar.id, chapel_id: chapel.id }, 1);
  const sponsorTwo = await db.scholarship.save("sponsors", { sponsor_name: "PAOFI Partner Organization", sponsor_type: "Organization" }, 1);
  await db.scholarship.save("sponsorships", { sponsor_id: sponsor.id, enrollment_id: enrollment.id, commitment_amount_php: 12000, frequency: "Annual" }, 1);
  await db.scholarship.save("sponsorships", { sponsor_id: sponsorTwo.id, enrollment_id: enrollment.id, commitment_amount_php: 6000, frequency: "Annual" }, 1);

  const profile = await db.scholarship.get("scholars", scholar.id);
  assert.equal(profile.scholar_no, "SCH-2026-0001");
  assert.equal(profile.place_of_birth, "Quezon City");
  assert.equal(profile.hobbies, "Reading");
  assert.equal(profile.total_siblings, 2);
  assert.equal(profile.household_members.length, 2);
  assert.equal(profile.household_members[0].member_name, "Jose Santos");
  assert.equal(profile.household_members[0].monthly_income, 18000);
  assert.equal(profile.household_members[1].education_attainment, "College Undergraduate");
  assert.equal(profile.document_links.length, 1);
  assert.equal(profile.enrollments.length, 1);
  assert.equal(profile.chapel_name, "Ascension");
  assert.equal((await db.scholarship.list("sponsorships", { enrollment_id: enrollment.id })).length, 2);
  db.close();
});

test("imports the Google Sheets roster without inventing unavailable profile values", async () => {
  const db = tempDb();
  const rows = [
    {
      scholar_name: "Adigue, Diana",
      gender: "Female",
      grade_or_year: "Grade 8",
      school_name: "-",
      course: "-",
      chapel: "Lourdes",
      sponsors: "Fr. Martin Mroz (Fondazione Don Orione)/Christine Tang",
      scholarship_category: "PAOFI",
      scholarship_status: "Active"
    },
    {
      scholar_name: "Adarayan, Mark Khean",
      gender: "Male",
      grade_or_year: "4th year College",
      school_name: "Saint Anthony Mary Claret College",
      course: "AB Philosophy",
      chapel: "Montalban",
      sponsors: "ANCOP/c/o Ms. Cannon",
      scholarship_category: "ANCOP",
      scholarship_status: "Active"
    }
  ];

  assert.deepEqual(splitSponsorNames("ANCOP/c/o Ms. Cannon"), ["ANCOP", "c/o Ms. Cannon"]);
  const imported = await importScholarshipRoster(db, rows);
  assert.equal(imported.scholarsCreated, 2);
  assert.equal(imported.sponsorsCreated, 4);
  assert.equal(imported.enrollmentsCreated, 2);
  assert.equal(imported.sponsorshipsCreated, 4);
  assert.deepEqual(imported.unmatchedChapels, ["Montalban"]);

  const scholars = await db.scholarship.list("scholars", { limit: 10 });
  const diana = await db.scholarship.get("scholars", scholars.find(item => item.last_name === "Adigue").id);
  assert.equal(diana.birth_date, "");
  assert.equal(diana.contact_no, "");
  assert.equal(diana.chapel_name, "Lourdes");
  assert.equal(diana.enrollments[0].school_name, "");
  assert.equal(diana.enrollments[0].education_level, "Junior High School");
  assert.equal(diana.enrollments[0].scholarship_category, "PAOFI");

  const mark = await db.scholarship.get("scholars", scholars.find(item => item.last_name === "Adarayan").id);
  assert.equal(mark.chapel_id, null);
  assert.match(mark.notes, /Source chapel: Montalban/);

  const repeated = await importScholarshipRoster(db, rows);
  assert.equal(repeated.scholarsCreated, 0);
  assert.equal(repeated.sponsorsCreated, 0);
  assert.equal(repeated.enrollmentsCreated, 0);
  assert.equal(repeated.sponsorshipsCreated, 0);
  assert.equal(await db.scholarship.count("scholars"), 2);
  assert.equal(await db.scholarship.count("sponsors"), 4);
  db.close();
});

test("enforces installment balances, controlled numbering, allocations, voids, and reissues", async () => {
  const db = tempDb();
  const { scholar, enrollment, sponsor } = await coreRecords(db);
  const sponsorship = await db.scholarship.save("sponsorships", {
    sponsor_id: sponsor.id,
    enrollment_id: enrollment.id,
    commitment_amount_php: 10000,
    frequency: "Annual"
  }, 1);
  const pledge = await db.scholarship.save("pledges", {
    sponsor_id: sponsor.id,
    sponsorship_id: sponsorship.id,
    scholar_id: scholar.id,
    enrollment_id: enrollment.id,
    pledge_date: "2026-07-01",
    purpose_type: "Scholar-specific",
    amount_php: 10000,
    source_currency: "PHP",
    source_amount: 10000,
    exchange_rate: 1,
    status: "Open"
  }, 1);
  const invoiceDraft = await db.scholarship.save("invoices", {
    sponsor_id: sponsor.id,
    pledge_id: pledge.id,
    issue_date: "2026-07-02",
    amount_php: 10000,
    status: "Draft"
  }, 1);
  await assert.rejects(() => db.scholarship.issueDocument("invoices", invoiceDraft.id, 1), /Approved financial document settings/i);
  await assert.rejects(() => db.scholarship.save("documentSettings", {
    effective_year: 2026,
    organization_name: "Payatas Orione Foundation Inc.",
    service_invoice_prefix: "SI",
    official_receipt_prefix: "OR",
    invoice_serial_start: 100,
    invoice_serial_end: 999,
    receipt_serial_start: 500,
    receipt_serial_end: 999,
    accountant_approved: false,
    status: "Active"
  }, 1), /Accountant approval/i);
  const documentSettings = await db.scholarship.save("documentSettings", {
    effective_year: 2026,
    organization_name: "Payatas Orione Foundation Inc.",
    registered_address: "Quezon City",
    tax_identifier: "TEST-ONLY",
    service_invoice_prefix: "SI",
    official_receipt_prefix: "OR",
    invoice_serial_start: 100,
    invoice_serial_end: 999,
    receipt_serial_start: 500,
    receipt_serial_end: 999,
    accountant_approved: true,
    status: "Active"
  }, 1);
  await assert.rejects(() => db.scholarship.save("documentSettings", { ...documentSettings, registered_address: "Changed" }, 1), /immutable/i);
  const invoice = await db.scholarship.issueDocument("invoices", invoiceDraft.id, 1);
  assert.equal(invoice.invoice_no, "SI-2026-000100");
  await assert.rejects(() => db.scholarship.save("invoices", { ...invoice, notes: "edited" }, 1), /cannot be edited/i);

  const payment = await db.scholarship.save("payments", {
    sponsor_id: sponsor.id,
    pledge_id: pledge.id,
    invoice_id: invoice.id,
    payment_date: "2026-07-05",
    amount_php: 4000,
    source_currency: "PHP",
    source_amount: 4000,
    exchange_rate: 1,
    payment_method: "Bank Transfer",
    status: "Cleared"
  }, 1);
  assert.equal((await db.scholarship.get("invoices", invoice.id)).payment_summary.balance, 6000);
  await assert.rejects(() => db.scholarship.save("payments", {
    sponsor_id: sponsor.id,
    invoice_id: invoice.id,
    payment_date: "2026-07-06",
    amount_php: 7000,
    status: "Cleared"
  }, 1), /remaining invoice balance/i);

  const receiptDraft = await db.scholarship.save("receipts", {
    payment_id: payment.id,
    issue_date: "2026-07-05",
    amount_php: 4000,
    status: "Draft"
  }, 1);
  const receipt = await db.scholarship.issueDocument("receipts", receiptDraft.id, 1);
  assert.equal(receipt.receipt_no, "OR-2026-000500");
  const duplicateReceipt = await db.scholarship.save("receipts", {
    payment_id: payment.id,
    issue_date: "2026-07-05",
    amount_php: 4000,
    status: "Draft"
  }, 1);
  await assert.rejects(() => db.scholarship.issueDocument("receipts", duplicateReceipt.id, 1), /already has an issued Official Receipt/i);
  await db.scholarship.save("allocations", {
    payment_id: payment.id,
    scholar_id: scholar.id,
    enrollment_id: enrollment.id,
    allocation_date: "2026-07-05",
    allocation_type: "Scholar-specific",
    purpose: "School supplies",
    amount_php: 2500
  }, 1);
  await assert.rejects(() => db.scholarship.save("allocations", {
    payment_id: payment.id,
    allocation_date: "2026-07-05",
    allocation_type: "Unrestricted",
    amount_php: 2000
  }, 1), /available payment balance/i);

  const yearly = await db.scholarship.financialYearSummary(2026);
  assert.deepEqual(yearly.totals, {
    pledged: 10000,
    received: 4000,
    reversed: 0,
    allocated: 2500,
    outstanding: 6000,
    unallocated: 1500
  });
  assert.equal(yearly.monthly.length, 1);
  assert.equal(yearly.sponsors[0].outstanding, 6000);

  const voided = await db.scholarship.voidDocument("receipts", receipt.id, "Encoding correction", 1);
  assert.equal(voided.status, "Voided");
  const reissue = await db.scholarship.reissueDocument("receipts", receipt.id, 1);
  assert.equal(reissue.status, "Draft");
  assert.equal(Number(reissue.reissued_from_id), receipt.id);
  db.close();
});

test("tracks flexible grades, PAOFI attendance, renewals, and immutable evaluations", async () => {
  const db = tempDb();
  const { scholar, year, enrollment } = await coreRecords(db);
  const period = await db.scholarship.save("academicPeriods", {
    academic_year_id: year.id,
    period_name: "First Quarter",
    period_type: "Quarter",
    period_order: 1
  }, 1);
  const percentage = await db.scholarship.save("grades", {
    enrollment_id: enrollment.id,
    academic_period_id: period.id,
    subject_name: "Mathematics",
    grading_scale: "Percentage",
    grade_value: "91"
  }, 1);
  const letter = await db.scholarship.save("grades", {
    enrollment_id: enrollment.id,
    academic_period_id: period.id,
    subject_name: "Conduct",
    grading_scale: "Letter Grade",
    grade_value: "A"
  }, 1);
  assert.equal(percentage.numeric_value, 91);
  assert.equal(letter.numeric_value, null);

  const event = await db.scholarship.save("events", {
    event_title: "Scholar and Parent Mass",
    event_type: "Mass",
    academic_year_id: year.id,
    event_date: "2026-07-10",
    attendance: [{ scholar_id: scholar.id, enrollment_id: enrollment.id, attendance_status: "Present" }],
    guardian_attendance: [{ scholar_id: scholar.id, enrollment_id: enrollment.id, guardian_name: "Maria Santos", attendance_status: "Present" }]
  }, 1);
  const savedMass = await db.scholarship.get("events", event.id);
  assert.equal(savedMass.participant_scope, "Scholar and Parent");
  assert.equal(savedMass.attendance[0].attendance_status, "Present");
  assert.equal(savedMass.guardian_attendance[0].guardian_name, "Maria Santos");
  await db.scholarship.save("events", {
    event_title: "Tutorial Session",
    event_type: "Tutorial",
    academic_year_id: year.id,
    event_date: "2026-07-11",
    attendance: [{ scholar_id: scholar.id, enrollment_id: enrollment.id, attendance_status: "Present" }]
  }, 1);
  await db.scholarship.save("events", {
    event_title: "Parent Cleaning",
    event_type: "Cleaning",
    academic_year_id: year.id,
    event_date: "2026-07-12",
    guardian_attendance: [{ scholar_id: scholar.id, enrollment_id: enrollment.id, guardian_name: "Maria Santos", attendance_status: "Present" }]
  }, 1);

  const draftRenewalTemplate = await db.scholarship.save("renewalTemplates", {
    template_name: "Draft Renewal",
    academic_year_id: year.id,
    education_level: "Junior High School",
    version: 1,
    status: "Draft",
    items: [{ item_label: "Draft requirement", required: true }]
  }, 1);
  await assert.rejects(() => db.scholarship.save("renewals", {
    enrollment_id: enrollment.id,
    template_id: draftRenewalTemplate.id,
    status: "Not Started"
  }, 1), /only published template versions/i);

  const renewalTemplate = await db.scholarship.save("renewalTemplates", {
    template_name: "Annual Renewal",
    academic_year_id: year.id,
    education_level: "Junior High School",
    version: 1,
    status: "Published",
    items: [
      { requirement_code: "Q1_REPORT_CARD", item_label: "Q1 Report Card", quarter_group: "Quarter 2", applicability: "Non-College", deadline: "2099-08-31", required: true },
      { requirement_code: "COE_S1", item_label: "Enrollment Certificate", quarter_group: "Quarter 1", applicability: "All", deadline: "2099-06-30", required: true },
      { requirement_code: "ANCOP_MOA", item_label: "ANCOP Signed MOA", quarter_group: "Quarter 1", applicability: "ANCOP", deadline: "2099-07-15", required: true }
    ]
  }, 1);
  await assert.rejects(() => db.scholarship.save("renewalTemplates", {
    ...renewalTemplate,
    template_name: "Changed after publishing"
  }, 1), /immutable/i);
  const renewal = await db.scholarship.save("renewals", {
    enrollment_id: enrollment.id,
    template_id: renewalTemplate.id,
    status: "Submitted",
    responses: renewalTemplate.items.map(item => ({ template_item_id: item.id, item_status: item.requirement_code === "COE_S1" ? "Passed" : "Missing", document_url: "https://example.org/document" }))
  }, 1);
  const synchronized = await db.scholarship.get("renewals", renewal.id);
  assert.equal(synchronized.responses.find(item => item.requirement_code === "Q1_REPORT_CARD").item_status, "Passed");
  assert.equal(synchronized.responses.find(item => item.requirement_code === "ANCOP_MOA").item_status, "Exempted");
  const reviewed = await db.scholarship.calculateRenewalEvaluation(renewal.id, {
    coordinator_evaluation: "Pass",
    education_team_evaluation: "Pass",
    overall_evaluation: "Pass",
    coordinator_remarks: "Requirements verified.",
    education_team_remarks: "Eligible for renewal."
  }, 1);
  assert.equal(reviewed.evaluation.report_card_score, 91);
  assert.equal(reviewed.evaluation.tutorial_activities_score, 100);
  assert.equal(reviewed.evaluation.parent_service_score, 100);
  assert.equal(reviewed.evaluation.mass_score, 100);
  assert.equal(reviewed.evaluation.numerical_evaluation, "Pass");
  const weightedEvaluations = await db.scholarship.list("renewalEvaluations", { search: "Ana", limit: 10 });
  assert.equal(weightedEvaluations.length, 1);
  assert.equal(weightedEvaluations[0].renewal_id, renewal.id);
  assert.equal(weightedEvaluations[0].scholar_name, "Santos, Ana");
  const batchRecords = await db.scholarship.renewalBatchRecords([renewal.id]);
  assert.equal(batchRecords.length, 1);
  assert.equal(batchRecords[0].scholar_name, "Santos, Ana");
  assert.equal(batchRecords[0].responses.length, renewalTemplate.items.length);
  const enrollmentCertificate = batchRecords[0].responses.find(item => item.requirement_code === "COE_S1");
  const renewalBatch = await db.scholarship.batchUpdateRenewals([{
    renewal_id: renewal.id,
    status: "Submitted",
    notes: "Batch checklist review complete.",
    response: {
      template_item_id: enrollmentCertificate.template_item_id,
      deadline: enrollmentCertificate.deadline,
      item_status: "Passed",
      document_url: "https://example.org/batch-document",
      notes: "Verified in batch."
    }
  }], 1);
  assert.equal(renewalBatch.updated, 1);
  const batchSavedRenewal = await db.scholarship.get("renewals", renewal.id);
  assert.equal(batchSavedRenewal.notes, "Batch checklist review complete.");
  assert.equal(batchSavedRenewal.responses.find(item => item.requirement_code === "COE_S1").notes, "Verified in batch.");
  const evaluationBatch = await db.scholarship.batchUpdateRenewalEvaluations([{
    renewal_id: renewal.id,
    adjustment_score: 1.25,
    coordinator_evaluation: "Pass",
    coordinator_remarks: "Batch coordinator review.",
    education_team_evaluation: "Pass",
    education_team_remarks: "Batch Education Team review.",
    overall_evaluation: "Pass",
    remarks: "Batch final review."
  }], 1);
  assert.equal(evaluationBatch.updated, 1);
  const batchEvaluation = (await db.scholarship.list("renewalEvaluations", { limit: 10 }))[0];
  assert.equal(batchEvaluation.adjustment_score, 1.25);
  assert.equal(batchEvaluation.coordinator_remarks, "Batch coordinator review.");
  assert.equal(batchEvaluation.remarks, "Batch final review.");
  const scholarshipDashboard = await db.scholarship.dashboard();
  assert.equal(scholarshipDashboard.stats.weightedEvaluations, 1);
  assert.equal(scholarshipDashboard.stats.pendingWeightedDecisions, 0);
  assert.equal(scholarshipDashboard.analytics.renewalComponents.find(item => item.label === "Report Card (80%)").count, 72.8);
  assert.equal((await db.scholarship.approveRenewal(renewal.id, 1)).status, "Approved");

  const evaluationTemplate = await db.scholarship.save("evaluationTemplates", {
    template_name: "Annual Scholar Review",
    academic_year_id: year.id,
    education_level: "All",
    version: 1,
    scale_min: 1,
    scale_max: 5,
    status: "Published",
    criteria: [{ criterion_label: "Academic effort", weight: 2 }, { criterion_label: "PAOFI participation", weight: 1 }]
  }, 1);
  const evaluation = await db.scholarship.save("evaluations", {
    enrollment_id: enrollment.id,
    template_id: evaluationTemplate.id,
    evaluation_date: "2026-07-12",
    narrative: "Consistent progress.",
    recommendations: "Continue support.",
    scores: [
      { criterion_id: evaluationTemplate.criteria[0].id, score: 4 },
      { criterion_id: evaluationTemplate.criteria[1].id, score: 5 }
    ]
  }, 1);
  const completed = await db.scholarship.completeEvaluation(evaluation.id, 1);
  assert.equal(completed.status, "Completed");
  assert.equal(completed.overall_score, 4.33);
  await assert.rejects(() => db.scholarship.save("evaluations", { ...completed, narrative: "Changed" }, 1), /immutable/i);
  const revision = await db.scholarship.reviseEvaluation(completed.id, 1);
  assert.equal(revision.status, "Draft");
  assert.equal(Number(revision.revision_of_id), completed.id);
  db.close();
});

test("enforces renewal deadlines per checklist item and records late submissions", async () => {
  const db = tempDb();
  const { year, enrollment } = await coreRecords(db);

  await assert.rejects(() => db.scholarship.save("renewalTemplates", {
    template_name: "Missing Deadlines",
    academic_year_id: year.id,
    version: 1,
    status: "Published",
    items: [{ item_label: "Requirement without a deadline", required: true }]
  }, 1), /every checklist item needs a valid deadline/i);

  const template = await db.scholarship.save("renewalTemplates", {
    template_name: "Per-item Deadlines",
    academic_year_id: year.id,
    version: 1,
    status: "Published",
    items: [
      { item_label: "Past requirement", deadline: "2000-01-15", required: true },
      { item_label: "Future requirement", deadline: "2099-12-15", required: true }
    ]
  }, 1);
  const renewal = await db.scholarship.save("renewals", {
    enrollment_id: enrollment.id,
    template_id: template.id,
    status: "Submitted",
    responses: template.items.map(item => ({ template_item_id: item.id, deadline: item.deadline, item_status: "Passed" }))
  }, 1);

  const past = renewal.responses.find(item => item.item_label === "Past requirement");
  const future = renewal.responses.find(item => item.item_label === "Future requirement");
  assert.equal(past.item_status, "Late");
  assert.match(past.status_date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(future.item_status, "Passed");
  assert.match(future.status_date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(renewal.due_date, "2099-12-15");

  const savedAgain = await db.scholarship.save("renewals", {
    id: renewal.id,
    enrollment_id: renewal.enrollment_id,
    template_id: renewal.template_id,
    status: renewal.status,
    responses: renewal.responses.map(item => ({
      template_item_id: item.template_item_id,
      deadline: item.deadline,
      item_status: item.item_status
    }))
  }, 1);
  assert.equal(savedAgain.responses.find(item => item.item_label === "Future requirement").item_status, "Passed");
  await db.scholarship.calculateRenewalEvaluation(renewal.id, {
    coordinator_evaluation: "Pass",
    education_team_evaluation: "Pass",
    overall_evaluation: "Pass"
  }, 1);
  assert.equal((await db.scholarship.approveRenewal(renewal.id, 1)).status, "Approved");
  db.close();
});

test("previews and commits validated XLSX imports", async () => {
  const db = tempDb();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Scholars");
  sheet.addRow(["Last Name", "First Name", "Birth Date", "Place of Birth", "Gender", "Chapel", "Hobbies", "Ambition"]);
  sheet.addRow(["Reyes", "Maria", "03/14/2011", "Quezon City", "Female", "Nazareno", "Drawing", "Architect"]);
  sheet.addRow(["", "Missing Last Name", "03/14/2012", "Quezon City", "Male", "Nazareno", "Reading", "Teacher"]);
  const buffer = await workbook.xlsx.writeBuffer();
  const preview = await previewScholarshipImport(db.scholarship, "scholars", Buffer.from(buffer).toString("base64"));
  assert.equal(preview.valid, 1);
  assert.equal(preview.invalid, 1);
  const result = await commitScholarshipImport(db.scholarship, "scholars", preview.rows.filter(row => row.valid), 1);
  assert.equal(result.imported, 1);
  assert.equal(await db.scholarship.count("scholars"), 1);
  const importedScholar = (await db.scholarship.list("scholars", { limit: 10 }))[0];
  assert.equal(importedScholar.place_of_birth, "Quezon City");
  assert.equal(importedScholar.chapel_name, "Nazareno");
  assert.equal(importedScholar.ambition, "Architect");
  const template = await scholarshipImportTemplate("sponsors");
  assert.match(template.filename, /sponsors/i);
  assert.ok(template.file_data.length > 100);
  db.close();
});

test("enforces Scholarship API least privilege and unions multiple assigned roles", async () => {
  const db = tempDb();
  const password = "ExamplePass123";
  const noAccess = db.saveUser({ username: "scholar.none", display_name: "No Scholarship Access", password });
  const viewer = db.saveUser({ username: "scholar.viewer", display_name: "Scholarship Viewer", password });
  const encoder = db.saveUser({ username: "scholar.encoder.api", display_name: "Scholarship Encoder", password });
  const officer = db.saveUser({ username: "scholar.officer.api", display_name: "Scholarship Officer", password });
  const financeEncoder = db.saveUser({ username: "scholar.finance.encoder", display_name: "Finance Encoder", password });
  await db.scholarship.setUserRoles(viewer.id, ["viewer"]);
  await db.scholarship.setUserRoles(encoder.id, ["encoder"]);
  await db.scholarship.setUserRoles(officer.id, ["program_officer"]);
  await db.scholarship.setUserRoles(financeEncoder.id, ["finance", "encoder"]);

  await withApi(db, async baseUrl => {
    const noneToken = await apiLogin(baseUrl, noAccess.username, password);
    assert.equal((await apiRequest(baseUrl, noneToken, "/api/scholarship/dashboard")).status, 403);

    const viewerToken = await apiLogin(baseUrl, viewer.username, password);
    assert.equal((await apiRequest(baseUrl, viewerToken, "/api/scholarship/meta")).status, 200);
    assert.equal((await apiRequest(baseUrl, viewerToken, "/api/scholarship/entities/scholars", {
      method: "POST",
      body: JSON.stringify({ first_name: "View", last_name: "Only" })
    })).status, 403);
    assert.equal((await apiRequest(baseUrl, viewerToken, "/api/scholarship/batch/renewals/load", {
      method: "POST",
      body: JSON.stringify({ ids: [] })
    })).status, 200);
    assert.equal((await apiRequest(baseUrl, viewerToken, "/api/scholarship/batch/renewals", {
      method: "POST",
      body: JSON.stringify({ rows: [] })
    })).status, 403);

    const encoderToken = await apiLogin(baseUrl, encoder.username, password);
    const created = await apiRequest(baseUrl, encoderToken, "/api/scholarship/entities/scholars", {
      method: "POST",
      body: JSON.stringify({ first_name: "Encoding", last_name: "Allowed" })
    });
    assert.equal(created.status, 200);
    const scholarId = (await created.json()).record.id;
    assert.equal((await apiRequest(baseUrl, encoderToken, `/api/scholarship/entities/scholars/${scholarId}`, { method: "DELETE" })).status, 403);
    assert.equal((await apiRequest(baseUrl, encoderToken, "/api/scholarship/entities/sponsors", {
      method: "POST",
      body: JSON.stringify({ sponsor_name: "Finance Only" })
    })).status, 403);
    assert.equal((await apiRequest(baseUrl, encoderToken, "/api/scholarship/batch/renewals", {
      method: "POST",
      body: JSON.stringify({ rows: [] })
    })).status, 400);
    assert.equal((await apiRequest(baseUrl, encoderToken, "/api/scholarship/batch/renewal-evaluations", {
      method: "POST",
      body: JSON.stringify({ rows: [] })
    })).status, 403);

    const officerToken = await apiLogin(baseUrl, officer.username, password);
    assert.equal((await apiRequest(baseUrl, officerToken, "/api/scholarship/batch/renewal-evaluations", {
      method: "POST",
      body: JSON.stringify({ rows: [] })
    })).status, 400);

    const unionToken = await apiLogin(baseUrl, financeEncoder.username, password);
    assert.equal((await apiRequest(baseUrl, unionToken, "/api/scholarship/entities/scholars", {
      method: "POST",
      body: JSON.stringify({ first_name: "Union", last_name: "Encoder" })
    })).status, 200);
    assert.equal((await apiRequest(baseUrl, unionToken, "/api/scholarship/entities/sponsors", {
      method: "POST",
      body: JSON.stringify({ sponsor_name: "Union Sponsor", sponsor_type: "Organization" })
    })).status, 200);
  });
  db.close();
});

test("exports every filtered record beyond the API page limit", async () => {
  const db = tempDb();
  const insert = db.db.prepare(`
    INSERT INTO scholarship_scholars (scholar_no, last_name, first_name, status, created_at, updated_at)
    VALUES (?, ?, ?, 'Active', ?, ?)
  `);
  const timestamp = new Date().toISOString();
  db.db.exec("BEGIN");
  for (let index = 1; index <= 505; index += 1) {
    insert.run(`SCH-TEST-${String(index).padStart(4, "0")}`, "Export", `Scholar ${index}`, timestamp, timestamp);
  }
  db.db.exec("COMMIT");
  const records = await db.scholarship.exportEntity("scholars", { status: "Active" });
  assert.equal(records.length, 505);
  db.close();
});

test("keeps Scholarship schema and behavior equivalent through the libSQL adapter", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "paofi-scholarship-libsql-"));
  const databasePath = path.join(directory, "scholarship.sqlite").replaceAll("\\", "/");
  const db = await TursoBeneficiaryDatabase.create({
    url: `file:${databasePath}`,
    authToken: "local-test-token"
  });
  const user = await db.saveUser({ username: "scholarship.libsql", display_name: "Scholarship LibSQL", password: "ExamplePass123" });
  await db.scholarship.setUserRoles(user.id, ["program_officer", "viewer"]);
  const scholar = await db.scholarship.save("scholars", {
    first_name: "Cloud",
    last_name: "Scholar",
    birth_date: "2012-04-08",
    status: "Active"
  }, user.id);
  const sponsor = await db.scholarship.save("sponsors", {
    sponsor_name: "Cloud Sponsor",
    sponsor_type: "Organization",
    status: "Active"
  }, user.id);
  assert.match(scholar.scholar_no, /^SCH-\d{4}-\d{4}$/);
  assert.match(sponsor.sponsor_no, /^SPN-\d{4}-\d{4}$/);
  assert.deepEqual((await db.scholarship.decorateUser(user)).program_roles.scholarship, ["program_officer", "viewer"]);
  assert.equal((await db.scholarship.dashboard()).stats.activeScholars, 1);
  assert.equal((await db.scholarship.list("chapels", { limit: 50 })).length, 13);
  assert.equal((await db.scholarship.exportAll()).scholars.length, 1);
  await db.close();
});
