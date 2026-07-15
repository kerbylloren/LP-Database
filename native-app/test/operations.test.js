const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { BeneficiaryDatabase } = require("../src/database");
const { TursoBeneficiaryDatabase } = require("../src/turso-database");
const { createServer } = require("../server");

function tempDb() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "paofi-operations-"));
  return new BeneficiaryDatabase(path.join(directory, "operations.sqlite"));
}

async function withApi(db, callback) {
  const server = createServer(db);
  await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", error => error ? reject(error) : resolve()));
  try {
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

async function login(baseUrl, username, password) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  assert.equal(response.status, 200);
  return (await response.json()).token;
}

function request(baseUrl, token, pathname, options = {}) {
  return fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
}

async function seedProgramRecords(db, userId = 1) {
  const center = await db.saveNutritionCenter({ center_name: "Benedict Feeding Center", capacity: 30, status: "Active" });
  const child = await db.saveNutritionBeneficiary({
    center_id: center.id,
    feeding_center: center.center_name,
    child_last_name: "Santos",
    child_first_name: "Mia",
    birth_date: "2021-04-03",
    remarks: "Active"
  });
  const scholar = await db.scholarship.save("scholars", { last_name: "Reyes", first_name: "Ana", status: "Active" }, userId);
  const chapel = (await db.scholarship.list("chapels", { limit: 20 }))[0];
  const year = await db.scholarship.save("academicYears", { label: "2026-2027", status: "Active" }, userId);
  const enrollment = await db.scholarship.save("enrollments", { scholar_id: scholar.id, academic_year_id: year.id, education_level: "Junior High School" }, userId);
  const sponsor = await db.scholarship.save("sponsors", { sponsor_name: "Example Sponsor", status: "Active" }, userId);
  return { center, child, scholar, chapel, year, enrollment, sponsor };
}

test("stores, audits, archives, and restores MOO administrative records", async () => {
  const db = tempDb();
  const user = db.saveUser({ username: "operations.officer", display_name: "Operations Officer", password: "ExamplePass123" });
  const roles = await db.operations.setUserRoles(user.id, {
    administration: ["program_officer", "finance"],
    nutrition: ["program_officer"],
    scholarship: ["program_officer"],
    health: ["program_officer"],
    livelihood: ["viewer"]
  });
  assert.deepEqual(roles.administration, ["finance", "program_officer"]);
  assert.deepEqual((await db.operations.decorateUser(user)).program_roles.health, ["program_officer"]);

  const caseRecord = await db.operations.save("cases", {
    case_type: "Child Protection",
    program_code: "nutrition",
    incident_date: "2026-07-15",
    reported_date: "2026-07-15",
    description: "Restricted safeguarding concern.",
    status: "Open"
  }, user.id);
  assert.match(caseRecord.case_no, /^CAS-\d{4}-\d{4}$/);
  const person = await db.operations.save("people", { full_name: "Maria Volunteer", person_type: "Volunteer", program_code: "nutrition" }, user.id);
  const personnelAction = await db.operations.save("personnelActions", { person_id: person.id, program_code: "nutrition", action_type: "Training", start_date: "2026-07-15", status: "Completed" }, user.id);
  const asset = await db.operations.save("assets", { item_name: "Digital weighing scale", program_code: "nutrition", quantity: 1 }, user.id);
  const procurement = await db.operations.save("procurements", { program_code: "nutrition", request_date: "2026-07-15", item_summary: "Replacement scale", status: "For Approval" }, user.id);
  const finance = await db.operations.save("finance", { record_type: "Liquidation", program_code: "nutrition", transaction_date: "2026-07-15", description: "Weekly center liquidation", amount: 1200 }, user.id);
  const donation = await db.operations.save("donations", { donor_name: "Anonymous Partner", anonymous: 1, donation_type: "In-kind", program_code: "nutrition", received_date: "2026-07-15", item_description: "Rice", quantity: 10, estimated_value: 600 }, user.id);
  const distribution = await db.operations.save("distributions", { donation_id: donation.id, program_code: "nutrition", distribution_date: "2026-07-16", recipient_name: "Benedict Feeding Center", item_description: "Rice", quantity: 10, unit: "kg", acknowledgment_status: "Signed" }, user.id);
  const compliance = await db.operations.save("compliance", { item_type: "Report", program_code: "nutrition", title: "Monthly accomplishment report", due_date: "2026-07-31" }, user.id);
  const policy = await db.operations.save("policies", { program_code: "livelihood", policy_area: "Program Delivery", title: "Livelihood revolving-fund monitoring", version: "1.0", effective_date: "2026-08-01", policy_text: "Monthly monitoring uses the prior report net income as the next forwarded balance." }, user.id);
  assert.match(person.person_no, /^PER-/);
  assert.match(personnelAction.action_no, /^PRA-/);
  assert.match(personnelAction.person_name, /Maria Volunteer/);
  assert.match(asset.asset_no, /^AST-/);
  assert.match(procurement.request_no, /^PRQ-/);
  assert.match(finance.reference_no, /^FIN-/);
  assert.match(donation.donation_no, /^DON-/);
  assert.match(distribution.distribution_no, /^DST-/);
  assert.match(distribution.donation_name, /Anonymous Partner/);
  assert.match(compliance.item_no, /^CMP-/);
  assert.match(policy.policy_no, /^POL-/);

  await db.operations.archive("people", person.id, user.id);
  assert.equal(await db.operations.count("people"), 0);
  assert.equal(await db.operations.count("people", { include_archived: 1 }), 1);
  await db.operations.restore("people", person.id, user.id);
  assert.equal(await db.operations.count("people"), 1);
  assert.ok((await db.operations.list("audit", { limit: 50 })).length >= 12);
  db.close();
});

test("records Nutrition admission, attendance, Scholarship support, and Health workflows", async () => {
  const db = tempDb();
  const linked = await seedProgramRecords(db);
  const admission = await db.operations.save("nutritionAdmissions", {
    beneficiary_id: linked.child.id,
    center_id: linked.center.id,
    application_date: "2026-01-05",
    screening_age: 4,
    solid_food_capable: 1,
    residence_eligible: 1,
    parent_agreement: 1,
    duty_commitment: 1,
    nutrition_screening: "Underweight",
    decision: "Admitted"
  }, 1);
  const attendance = await db.operations.save("nutritionAttendance", {
    beneficiary_id: linked.child.id,
    center_id: linked.center.id,
    attendance_date: "2026-07-15",
    attendance_status: "Present",
    meal_received: 1,
    guardian_present: 1
  }, 1);
  await db.operations.save("nutritionHealthSafety", {
    beneficiary_id: linked.child.id,
    center_id: linked.center.id,
    record_scope: "Child",
    record_type: "Deworming",
    record_date: "2026-07-15",
    status: "Completed"
  }, 1);
  assert.match(admission.beneficiary_name, /Santos/);
  assert.equal(attendance.center_name, "Benedict Feeding Center");

  const application = await db.operations.save("scholarshipApplications", {
    scholar_id: linked.scholar.id,
    chapel_id: linked.chapel.id,
    academic_year_id: linked.year.id,
    application_date: "2026-06-01",
    decision: "Accepted",
    moa_status: "Signed"
  }, 1);
  const communication = await db.operations.save("scholarshipCommunications", {
    scholar_id: linked.scholar.id,
    sponsor_id: linked.sponsor.id,
    communication_type: "Annual Progress Report",
    due_date: "2027-03-15",
    status: "Pending"
  }, 1);
  const tutorial = await db.operations.save("scholarshipTutorials", {
    scholar_id: linked.scholar.id,
    enrollment_id: linked.enrollment.id,
    tutorial_type: "Math",
    enrollment_date: "2026-06-15",
    diagnostic_score: 68,
    progress_status: "Active"
  }, 1);
  assert.match(application.scholar_name, /Reyes/);
  assert.equal(communication.sponsor_name, "Example Sponsor");
  assert.equal(tutorial.tutorial_type, "Math");

  const patient = await db.operations.save("healthPatients", { full_name: "Jose Patient", birth_date: "1985-02-10", tb_status: "Under Evaluation" }, 1);
  const encounter = await db.operations.save("healthEncounters", { patient_id: patient.id, visit_date: "2026-07-15", visit_type: "TB Consultation", diagnosis: "For sputum examination" }, 1);
  const tb = await db.operations.save("healthTbRecords", { patient_id: patient.id, record_type: "Treatment Initiation", record_date: "2026-07-15", treatment_status: "Ongoing" }, 1);
  await db.operations.save("healthInventory", { item_name: "TB Medicine B", item_type: "TB Drug", batch_no: "B2", expiry_date: "2027-02-01", quantity: 20 }, 1);
  await db.operations.save("healthInventory", { item_name: "TB Medicine A", item_type: "TB Drug", batch_no: "A1", expiry_date: "2026-10-01", quantity: 15 }, 1);
  await db.operations.save("healthEquipment", { equipment_name: "Microscope", category: "Laboratory", next_maintenance_date: "2026-12-01" }, 1);
  assert.equal(encounter.patient_name, "Jose Patient (PAT-2026-0001)");
  assert.equal(tb.patient_name, encounter.patient_name);
  assert.equal((await db.operations.list("healthInventory", { limit: 10 }))[0].batch_no, "A1");
  const overview = await db.operations.overview();
  assert.equal(overview.nutritionAttendance, 1);
  assert.equal(overview.scholarshipApplications, 1);
  assert.equal(overview.healthPatients, 1);
  db.close();
});

test("enforces operational roles and protects complete database export", async () => {
  const db = tempDb();
  const viewer = db.saveUser({ username: "admin.viewer", display_name: "Admin Viewer", password: "ViewerPass123" });
  const encoder = db.saveUser({ username: "admin.encoder", display_name: "Admin Encoder", password: "EncoderPass123" });
  const officer = db.saveUser({ username: "admin.officer", display_name: "Admin Officer", password: "OfficerPass123" });
  await db.operations.setUserRoles(viewer.id, { administration: ["viewer"] });
  await db.operations.setUserRoles(encoder.id, { administration: ["encoder"] });
  await db.operations.setUserRoles(officer.id, { administration: ["program_officer"] });
  await db.operations.save("people", { full_name: "Existing Volunteer" }, officer.id);

  await withApi(db, async baseUrl => {
    const viewerToken = await login(baseUrl, "admin.viewer", "ViewerPass123");
    const encoderToken = await login(baseUrl, "admin.encoder", "EncoderPass123");
    const officerToken = await login(baseUrl, "admin.officer", "OfficerPass123");
    assert.equal((await request(baseUrl, viewerToken, "/api/operations/entities/people")).status, 200);
    assert.equal((await request(baseUrl, viewerToken, "/api/operations/entities/cases")).status, 403);
    assert.equal((await request(baseUrl, viewerToken, "/api/operations/entities/people", { method: "POST", body: JSON.stringify({ full_name: "No Write" }) })).status, 403);
    const createdResponse = await request(baseUrl, encoderToken, "/api/operations/entities/people", { method: "POST", body: JSON.stringify({ full_name: "API Volunteer", person_type: "Volunteer" }) });
    assert.equal(createdResponse.status, 200);
    const created = (await createdResponse.json()).record;
    assert.equal((await request(baseUrl, encoderToken, `/api/operations/entities/people/${created.id}`, { method: "DELETE" })).status, 403);
    assert.equal((await request(baseUrl, officerToken, `/api/operations/entities/people/${created.id}`, { method: "DELETE" })).status, 200);
    assert.equal((await request(baseUrl, viewerToken, "/api/export")).status, 403);
  });
  db.close();
});

test("supports MOO account roles without exposing program records to dashboard-only users", async () => {
  const db = tempDb();
  const assistant = db.saveUser({ username: "nutrition.assistant", display_name: "Nutrition Assistant", password: "AssistantPass123" });
  const coordinator = db.saveUser({ username: "nutrition.coordinator", display_name: "Center Coordinator", password: "CoordinatorPass123" });
  const volunteer = db.saveUser({ username: "program.volunteer", display_name: "Program Volunteer", password: "VolunteerPass123" });
  const scholar = db.saveUser({ username: "program.scholar", display_name: "Program Scholar", password: "ScholarPass123" });
  await db.operations.setUserRoles(assistant.id, { nutrition: ["program_assistant"] });
  await db.operations.setUserRoles(coordinator.id, { nutrition: ["coordinator"] });
  await db.operations.setUserRoles(volunteer.id, { nutrition: ["volunteer"] });
  await db.operations.setUserRoles(scholar.id, { scholarship: ["scholar"] });

  await withApi(db, async baseUrl => {
    const assistantToken = await login(baseUrl, "nutrition.assistant", "AssistantPass123");
    const coordinatorToken = await login(baseUrl, "nutrition.coordinator", "CoordinatorPass123");
    const volunteerToken = await login(baseUrl, "program.volunteer", "VolunteerPass123");
    const scholarToken = await login(baseUrl, "program.scholar", "ScholarPass123");

    assert.equal((await request(baseUrl, volunteerToken, "/api/stats")).status, 200);
    assert.equal((await request(baseUrl, scholarToken, "/api/stats")).status, 200);
    assert.equal((await request(baseUrl, volunteerToken, "/api/nutrition/centers")).status, 403);
    assert.equal((await request(baseUrl, scholarToken, "/api/scholarship/entities/scholars")).status, 403);

    const centerResponse = await request(baseUrl, coordinatorToken, "/api/nutrition/centers", {
      method: "POST",
      body: JSON.stringify({ center_name: "Coordinator Test Center", capacity: 20, status: "Active" })
    });
    assert.equal(centerResponse.status, 200);
    const center = (await centerResponse.json()).center;
    assert.equal((await request(baseUrl, coordinatorToken, `/api/nutrition/centers/${center.id}`, { method: "DELETE" })).status, 403);

    const draftResponse = await request(baseUrl, assistantToken, "/api/operations/program-finance/nutrition", {
      method: "POST",
      body: JSON.stringify({ record_type: "Budget", transaction_date: "2026-07-15", description: "Center operating budget", amount: 12000, status: "Draft" })
    });
    const draftBody = await draftResponse.text();
    assert.equal(draftResponse.status, 200, draftBody);
    assert.equal((await request(baseUrl, assistantToken, "/api/operations/program-finance/nutrition", {
      method: "POST",
      body: JSON.stringify({ record_type: "Budget", transaction_date: "2026-07-15", description: "Unauthorized approval", amount: 12000, status: "Approved" })
    })).status, 403);
  });
  db.close();
});

test("shares program finance with Administration and restores program records through unified bins", async () => {
  const db = tempDb();
  const officer = db.saveUser({ username: "records.officer", display_name: "Records Officer", password: "OfficerPass123" });
  await db.operations.setUserRoles(officer.id, {
    administration: ["program_officer", "finance"],
    nutrition: ["program_officer", "finance"],
    scholarship: ["program_officer"]
  });
  const scholar = await db.scholarship.save("scholars", { last_name: "Bin", first_name: "Scholar", status: "Active" }, officer.id);

  await withApi(db, async baseUrl => {
    const token = await login(baseUrl, "records.officer", "OfficerPass123");
    const financeResponse = await request(baseUrl, token, "/api/operations/program-finance/nutrition", {
      method: "POST",
      body: JSON.stringify({ record_type: "Disbursement", transaction_date: "2026-07-15", description: "Weekly replenishment", amount: 2500, status: "Approved" })
    });
    const financeBody = await financeResponse.text();
    assert.equal(financeResponse.status, 200, financeBody);
    const finance = JSON.parse(financeBody).record;
    const adminLedger = await request(baseUrl, token, "/api/operations/entities/finance?program_code=nutrition");
    assert.equal(adminLedger.status, 200);
    assert.ok((await adminLedger.json()).records.some(record => record.id === finance.id));

    assert.equal((await request(baseUrl, token, `/api/operations/program-finance/nutrition/${finance.id}`, { method: "DELETE" })).status, 200);
    assert.equal((await request(baseUrl, token, `/api/scholarship/entities/scholars/${scholar.id}`, { method: "DELETE" })).status, 200);
    const centerResponse = await request(baseUrl, token, "/api/nutrition/centers", {
      method: "POST",
      body: JSON.stringify({ center_name: "Restorable Center", capacity: 12, status: "Active" })
    });
    const center = (await centerResponse.json()).center;
    assert.equal((await request(baseUrl, token, `/api/nutrition/centers/${center.id}`, { method: "DELETE" })).status, 200);

    const nutritionBin = await request(baseUrl, token, "/api/record-bin?program=nutrition&limit=100");
    assert.equal(nutritionBin.status, 200);
    const nutritionRecords = (await nutritionBin.json()).records;
    const financeBin = nutritionRecords.find(record => record.source === "operations" && record.entity_type === "finance");
    const centerBin = nutritionRecords.find(record => record.source === "captured" && record.entity_type === "nutrition-center");
    assert.ok(financeBin);
    assert.ok(centerBin);
    assert.equal((await request(baseUrl, token, "/api/record-bin/restore", { method: "POST", body: JSON.stringify(financeBin) })).status, 200);
    assert.equal((await request(baseUrl, token, "/api/record-bin/restore", { method: "POST", body: JSON.stringify(centerBin) })).status, 200);

    const scholarshipBin = await request(baseUrl, token, "/api/record-bin?program=scholarship&limit=100");
    const scholarshipRecord = (await scholarshipBin.json()).records.find(record => record.source === "scholarship" && record.entity_type === "scholars");
    assert.ok(scholarshipRecord);
    assert.equal((await request(baseUrl, token, "/api/record-bin/restore", { method: "POST", body: JSON.stringify(scholarshipRecord) })).status, 200);
    assert.equal((await db.scholarship.get("scholars", scholar.id)).deleted_at, "");
  });
  db.close();
});

test("keeps operational schema and behavior equivalent through the libSQL adapter", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "paofi-operations-libsql-"));
  const databasePath = path.join(directory, "operations.sqlite").replaceAll("\\", "/");
  const db = await TursoBeneficiaryDatabase.create({ url: `file:${databasePath}`, authToken: "local-test-token" });
  const user = await db.saveUser({ username: "operations.libsql", display_name: "Operations LibSQL", password: "ExamplePass123" });
  await db.operations.setUserRoles(user.id, { administration: ["program_officer"], health: ["program_officer"] });
  const patient = await db.operations.save("healthPatients", { full_name: "Cloud Patient", status: "Active" }, user.id);
  await db.operations.save("healthEncounters", { patient_id: patient.id, visit_date: "2026-07-15", visit_type: "Regular Consultation" }, user.id);
  const compliance = await db.operations.save("compliance", { title: "Annual policy review", item_type: "Policy Review", due_date: "2026-12-15" }, user.id);
  assert.match(patient.patient_no, /^PAT-/);
  assert.match(compliance.item_no, /^CMP-/);
  assert.equal((await db.operations.list("healthEncounters", { limit: 10 }))[0].patient_name, "Cloud Patient (PAT-2026-0001)");
  assert.equal((await db.operations.decorateUser(user)).program_roles.administration[0], "program_officer");
  assert.ok((await db.operations.exportAll()).audit.length >= 3);
  await db.close();
});
