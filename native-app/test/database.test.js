const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { BeneficiaryDatabase } = require("../src/database");

function tempDbPath() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpdb-test-"));
  return path.join(dir, "test.sqlite");
}

test("creates, searches, updates, deletes, and restores a record", () => {
  const db = new BeneficiaryDatabase(tempDbPath());

  const created = db.saveRecord({
    control_no: "LP-2026-001",
    status: "Active",
    last_name: "Santos",
    first_name: "Ana",
    middle_name: "Cruz"
  });

  assert.equal(created.control_no, "LP-2026-001");
  assert.equal(db.stats().active, 1);
  assert.equal(db.listRecords({ search: "ana" }).length, 1);

  const updated = db.saveRecord({
    ...created,
    status: "Inactive"
  });

  assert.equal(updated.id, created.id);
  assert.equal(updated.status, "Inactive");

  db.deleteRecord(created.id);
  assert.equal(db.stats().active, 0);
  assert.equal(db.stats().deleted, 1);

  const deleted = db.listDeletedRecords()[0];
  const restored = db.restoreDeletedRecord(deleted.id);
  assert.equal(restored.control_no, "LP-2026-001");
  assert.equal(db.stats().active, 1);
  assert.equal(db.stats().deleted, 0);

  db.close();
});

test("generates the next control number from active and deleted records", () => {
  const db = new BeneficiaryDatabase(tempDbPath());

  const first = db.saveRecord({ control_no: "LP-2026-001", last_name: "One" });
  db.saveRecord({ control_no: "LP-2026-003", last_name: "Three" });
  db.deleteRecord(first.id);

  assert.equal(db.nextControlNo(2026), "LP-2026-004");

  db.close();
});

test("creates, updates, lists, exports, and deletes monitoring reports", () => {
  const db = new BeneficiaryDatabase(tempDbPath());
  const beneficiary = db.saveRecord({
    control_no: "LP-2026-010",
    last_name: "Dela Cruz",
    first_name: "Maria",
    field_c12: "Lourdes",
    field_l11: "09507089825"
  });

  const created = db.saveMonitoringReport({
    beneficiary_id: beneficiary.id,
    report_month: "2026-03",
    project_type: "dishwashing liquid production",
    forwarded_balance: "100",
    materials: [
      {
        entry_date: "2026-03-05",
        materials_received: "soap base",
        quantity: "10 liters",
        materials_used: "5 liters",
        inventory: "5 liters"
      }
    ],
    sales: [
      {
        entry_date: "2026-03-10",
        quantity_produced: "20",
        quantity_sold: "12",
        price_per_unit: "25"
      }
    ],
    expenses: [
      {
        entry_date: "2026-03-12",
        payee: "supplier",
        description: "bottles",
        amount: "75"
      }
    ],
    challenges: "slow sales",
    success_stories: "repeat buyers"
  });

  assert.equal(created.control_no, "LP-2026-010");
  assert.equal(created.beneficiary_name, "Dela Cruz, Maria");
  assert.equal(created.project_type, "Dishwashing Liquid Production");
  assert.equal(created.forwarded_balance, 0);
  assert.equal(created.total_sales, 300);
  assert.equal(created.total_expenses, 75);
  assert.equal(created.net_income, 225);
  assert.equal(created.challenges, "Slow sales");
  assert.equal(created.success_stories, "Repeat buyers");
  assert.equal(created.prepared_by, "Dela Cruz, Maria");
  assert.equal(created.materials.length, 1);
  assert.equal(created.sales.length, 1);
  assert.equal(created.expenses.length, 1);
  assert.equal(db.stats().monitoringReports, 1);
  assert.equal(db.listMonitoringReports({ search: "dela" }).length, 1);

  const nextMonth = db.saveMonitoringReport({
    beneficiary_id: beneficiary.id,
    report_month: "2026-04",
    project_type: "dishwashing liquid production",
    forwarded_balance: 9999,
    sales: [
      {
        quantity_sold: "10",
        price_per_unit: "20"
      }
    ],
    expenses: [
      {
        payee: "supplier",
        description: "soap",
        amount: "50"
      }
    ]
  });

  assert.equal(nextMonth.forwarded_balance, 225);
  assert.equal(nextMonth.net_income, 375);

  const updated = db.saveMonitoringReport({
    ...created,
    forwarded_balance: 50,
    expenses: []
  });

  assert.equal(updated.id, created.id);
  assert.equal(updated.forwarded_balance, 0);
  assert.equal(updated.total_expenses, 0);
  assert.equal(updated.net_income, 300);
  assert.equal(db.getMonitoringReport(nextMonth.id).forwarded_balance, 300);
  assert.equal(db.getMonitoringReport(nextMonth.id).net_income, 450);

  const exported = db.exportData();
  assert.equal(exported.monitoringReports.length, 2);
  assert.equal(exported.monitoringReports.find(report => report.id === created.id).sales[0].total_sales, 300);

  db.deleteMonitoringReport(created.id);
  assert.equal(db.getMonitoringReport(nextMonth.id).forwarded_balance, 0);
  assert.equal(db.getMonitoringReport(nextMonth.id).net_income, 150);
  db.deleteMonitoringReport(nextMonth.id);
  assert.equal(db.stats().monitoringReports, 0);

  db.close();
});

test("seeds a superadmin and creates standard user accounts", () => {
  const db = new BeneficiaryDatabase(tempDbPath());

  const superadmin = db.authenticateUser("superadmin", "ChangeMe123!");
  assert.equal(superadmin.role, "superadmin");
  assert.equal(superadmin.active, true);

  const user = db.saveUser({
    username: "staff.user",
    display_name: "staff member",
    password: "StaffPass123"
  });

  assert.equal(user.username, "staff.user");
  assert.equal(user.display_name, "Staff Member");
  assert.equal(user.role, "user");
  assert.equal(user.active, true);

  const authenticated = db.authenticateUser("staff.user", "StaffPass123");
  assert.equal(authenticated.role, "user");
  assert.equal(db.listUsers().length, 2);

  assert.throws(() => db.authenticateUser("staff.user", "wrong-password"), /Invalid username or password/);

  db.close();
});

test("backfills current group from livelihood interest", () => {
  const db = new BeneficiaryDatabase(tempDbPath());
  const beneficiary = db.saveRecord({
    control_no: "LP-2026-020",
    last_name: "Group",
    first_name: "Member",
    livelihood_interest: "Rag Making"
  });

  assert.equal(beneficiary.current_group, "Rag Making");

  const updated = db.saveRecord({
    ...beneficiary,
    current_group: "Sewing"
  });

  assert.equal(updated.current_group, "Sewing");

  db.close();
});

test("sorts livelihood family composition rows by age", () => {
  const db = new BeneficiaryDatabase(tempDbPath());
  const beneficiary = db.saveRecord({
    control_no: "LP-2026-030",
    last_name: "Sorted",
    first_name: "Family",
    list_a18: "Young Member\nOlder Parent\nTeen Member",
    list_c18: "7\n44\n16",
    list_d18: "Male\nFemale\nFemale"
  });

  assert.equal(beneficiary.list_a18, "Older Parent\nTeen Member\nYoung Member");
  assert.equal(beneficiary.list_c18, "44\n16\n7");
  assert.equal(beneficiary.list_d18, "Female\nFemale\nMale");

  db.close();
});

test("creates, updates, lists, exports, and deletes nutrition core records", () => {
  const db = new BeneficiaryDatabase(tempDbPath());

  assert.equal(db.nextNutritionBeneficiaryNo(2026), "NP-2026-001");

  const center = db.saveNutritionCenter({
    center_name: "molave feeding center",
    location: "st. payatas b, q.c.",
    coordinator: "kristine salde",
    contact_no: "9707054085",
    capacity: "45",
    notes: "pilot center"
  });

  assert.equal(center.center_name, "Molave Feeding Center");
  assert.equal(center.contact_no, "09707054085");
  assert.equal(db.stats().nutritionCenters, 1);

  const created = db.saveNutritionBeneficiary({
    beneficiary_no: "NP-2026-001",
    center_id: center.id,
    child_last_name: "abot",
    child_first_name: "joan",
    birth_date: "2016-09-16",
    age: "8",
    gender: "female",
    home_address: "diamond hills molave st., st. payatas b, q.c.",
    school: "payatas b elementary school",
    grade_level: "grade 2",
    mother_name: "kristine salde",
    mother_occupation: "service crew",
    father_name: "jonathan abot",
    father_occupation: "garbage collector",
    contact_no: "9707054085",
    sibling_count: "3",
    birth_order: "4th",
    admission_date: "2018-01-08",
    profile_status: "old",
    remarks: "active",
    initial_age_months: "16",
    initial_weight_kg: "7",
    initial_height_cm: "72",
    initial_nutrition_status: "underweight",
    current_update_date: "2026-08-04",
    current_age_months: "101",
    current_weight_kg: "22.1",
    current_height_cm: "127",
    current_nutrition_status: "normal",
    household_members: [
      { member_name: "jonathan abot", age: "30", relationship: "father", occupation: "garbage collector" },
      { member_name: "", age: "", relationship: "", occupation: "" },
      { member_name: "kristine salde", age: "34", relationship: "mother", occupation: "house keeper" }
    ]
  });

  assert.equal(created.beneficiary_no, "NP-2026-001");
  assert.equal(created.feeding_center, "Molave Feeding Center");
  assert.equal(created.child_last_name, "Abot");
  assert.equal(created.child_first_name, "Joan");
  assert.equal(created.birth_date, "09/16/2016");
  assert.equal(created.gender, "Female");
  assert.equal(created.contact_no, "09707054085");
  assert.equal(created.admission_date, "01/08/2018");
  assert.equal(created.current_update_date, "08/04/2026");
  assert.equal(created.current_nutrition_status, "Normal");
  assert.equal(created.household_members.length, 2);
  assert.equal(created.household_members[0].relationship, "Mother");
  assert.equal(created.household_members[0].occupation, "Service Crew");
  assert.equal(db.stats().nutritionBeneficiaries, 1);
  assert.equal(db.nextNutritionBeneficiaryNo(2026), "NP-2026-002");
  assert.equal(db.listNutritionBeneficiaries({ search: "abot" }).length, 1);
  assert.equal(db.listNutritionBeneficiaries({ centerId: center.id }).length, 1);

  const renamedCenter = db.saveNutritionCenter({
    ...center,
    center_name: "molave supplemental feeding center"
  });
  assert.equal(renamedCenter.center_name, "Molave Supplemental Feeding Center");
  assert.equal(db.getNutritionBeneficiary(created.id).feeding_center, "Molave Supplemental Feeding Center");

  const updated = db.saveNutritionBeneficiary({
    ...created,
    current_weight_kg: "23.4",
    current_nutrition_status: "normal",
    household_members: [
      ...created.household_members,
      { member_name: "kenneth abot", age: "2", relationship: "brother", occupation: "n/a" }
    ]
  });

  assert.equal(updated.id, created.id);
  assert.equal(updated.current_weight_kg, "23.4");
  assert.equal(updated.household_members.length, 3);

  const overview = db.nutritionOverview();
  assert.equal(overview.stats.centers, 1);
  assert.equal(overview.stats.activeBeneficiaries, 1);

  const exported = db.exportData();
  assert.equal(exported.nutritionCenters.length, 1);
  assert.equal(exported.nutritionBeneficiaries.length, 1);
  assert.equal(exported.nutritionBeneficiaries[0].household_members.length, 3);

  db.deleteNutritionBeneficiary(created.id);
  assert.equal(db.stats().nutritionBeneficiaries, 0);
  db.deleteNutritionCenter(center.id);
  assert.equal(db.stats().nutritionCenters, 0);

  db.close();
});

test("duplicates nutrition household members across sibling beneficiaries", () => {
  const db = new BeneficiaryDatabase(tempDbPath());
  const center = db.saveNutritionCenter({
    center_name: "molave feeding center"
  });

  const firstChild = db.saveNutritionBeneficiary({
    beneficiary_no: "NP-2026-020",
    center_id: center.id,
    child_last_name: "Abot",
    child_first_name: "Joan",
    birth_date: "2016-09-16",
    mother_name: "Kristine Salde",
    mother_occupation: "Service Crew",
    father_name: "Jonathan Abot",
    father_occupation: "Garbage Collector",
    contact_no: "09707054085",
    household_members: [
      { member_name: "Kristine Salde", age: "34", relationship: "Mother", occupation: "House Keeper" },
      { member_name: "Jonathan Abot", age: "30", relationship: "Father", occupation: "Garbage Collector" },
      { member_name: "Kenneth Abot", age: "2", relationship: "Brother", occupation: "N/A" }
    ]
  });

  const secondChild = db.saveNutritionBeneficiary({
    beneficiary_no: "NP-2026-021",
    center_id: center.id,
    child_last_name: "Abot",
    child_first_name: "John Christopher",
    birth_date: "2011-03-01",
    mother_name: "Kristine Salde",
    mother_occupation: "Service Crew",
    father_name: "Jonathan Abot",
    father_occupation: "Garbage Collector",
    contact_no: "09707054085",
    household_members: [
      { member_name: "Maria Abot", age: "12", relationship: "Sister", occupation: "Student" }
    ]
  });

  const refreshedFirst = db.getNutritionBeneficiary(firstChild.id);
  assert.deepEqual(
    refreshedFirst.household_members.map(member => member.member_name),
    secondChild.household_members.map(member => member.member_name)
  );
  assert.deepEqual(
    refreshedFirst.household_members.map(member => member.age),
    ["34", "30", "12", "2"]
  );
  assert.equal(refreshedFirst.household_members[0].occupation, "Service Crew");

  db.close();
});

test("creates monthly nutrition growth reports per feeding center", () => {
  const db = new BeneficiaryDatabase(tempDbPath());
  const center = db.saveNutritionCenter({
    center_name: "molave feeding center"
  });
  const child = db.saveNutritionBeneficiary({
    beneficiary_no: "NP-2026-010",
    center_id: center.id,
    child_last_name: "growth",
    child_first_name: "child",
    birth_date: "2020-01-15",
    gender: "male",
    admission_date: "2020-01-01",
    initial_weight_kg: "3",
    initial_height_cm: "50",
    initial_nutrition_status: "Normal",
    current_update_date: "2020-01-01",
    current_age_months: "0",
    current_weight_kg: "3",
    current_height_cm: "50",
    current_nutrition_status: "normal"
  });

  const draft = db.buildNutritionGrowthDraft({
    center_id: center.id,
    report_month: "2020-01",
    submitted_date: "2020-02-05"
  });

  assert.equal(draft.entries.length, 1);
  assert.equal(draft.entries[0].beneficiary_id, child.id);
  assert.equal(draft.entries[0].age_months, "0");
  assert.equal(draft.entries[0].previous_weight_kg, "3");
  assert.equal(draft.entries[0].previous_height_cm, "50");

  const saved = db.saveNutritionGrowthReport({
    ...draft,
    entries: [
      {
        beneficiary_id: child.id,
        height_cm: "51",
        weight_kg: "3.2"
      }
    ]
  });

  assert.equal(saved.center_name, "Molave Feeding Center");
  assert.equal(saved.submitted_date, "02/05/2020");
  assert.equal(saved.report_month, "2020-01");
  assert.equal(saved.child_count, 1);
  assert.equal(saved.entries[0].age_months, "0");
  assert.equal(saved.entries[0].height_change_cm, "1");
  assert.equal(saved.entries[0].weight_change_kg, "0.2");
  assert.equal(saved.entries[0].cgs_classification, "Normal");

  const updatedChild = db.getNutritionBeneficiary(child.id);
  assert.equal(updatedChild.current_update_date, "02/05/2020");
  assert.equal(updatedChild.current_age_months, "0");
  assert.equal(updatedChild.current_weight_kg, "3.2");
  assert.equal(updatedChild.current_height_cm, "51");
  assert.equal(updatedChild.current_nutrition_status, "Normal");

  const editDraft = db.buildNutritionGrowthDraft({ id: saved.id });
  assert.equal(editDraft.entries[0].previous_weight_kg, "3");
  assert.equal(editDraft.entries[0].previous_height_cm, "50");
  assert.equal(editDraft.entries[0].weight_change_kg, "0.2");
  assert.equal(editDraft.entries[0].height_change_cm, "1");

  const nextDraft = db.buildNutritionGrowthDraft({
    center_id: center.id,
    report_month: "2020-02",
    submitted_date: "2020-03-03"
  });

  assert.equal(nextDraft.entries[0].age_months, "1");
  assert.equal(nextDraft.entries[0].previous_record_date, "2020-01");
  assert.equal(nextDraft.entries[0].previous_weight_kg, "3.2");

  const nextReport = db.saveNutritionGrowthReport({
    ...nextDraft,
    entries: [
      {
        beneficiary_id: child.id,
        height_cm: "52",
        weight_kg: "2.9"
      }
    ]
  });

  assert.equal(nextReport.entries[0].height_change_cm, "1");
  assert.equal(nextReport.entries[0].weight_change_kg, "-0.3");
  assert.equal(nextReport.entries[0].cgs_classification, "Severely Underweight");
  assert.equal(db.stats().nutritionGrowthReports, 2);
  assert.equal(db.listNutritionGrowthReports({ centerId: center.id }).length, 2);

  const protectedSnapshot = db.saveNutritionBeneficiary({
    ...db.getNutritionBeneficiary(child.id),
    current_update_date: "01/01/1999",
    current_weight_kg: "99",
    current_height_cm: "199",
    current_nutrition_status: "Overweight"
  });
  assert.equal(protectedSnapshot.current_update_date, "03/03/2020");
  assert.equal(protectedSnapshot.current_weight_kg, "2.9");
  assert.equal(protectedSnapshot.current_height_cm, "52");
  assert.equal(protectedSnapshot.current_nutrition_status, "Severely Underweight");

  const exported = db.exportData();
  assert.equal(exported.nutritionGrowthReports.length, 2);
  assert.equal(exported.nutritionGrowthReports[0].entries.length, 1);

  db.deleteNutritionGrowthReport(saved.id);
  db.deleteNutritionGrowthReport(nextReport.id);
  assert.equal(db.stats().nutritionGrowthReports, 0);

  db.close();
});
