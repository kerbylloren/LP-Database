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
  assert.equal(created.total_sales, 300);
  assert.equal(created.total_expenses, 75);
  assert.equal(created.net_income, 325);
  assert.equal(created.materials.length, 1);
  assert.equal(created.sales.length, 1);
  assert.equal(created.expenses.length, 1);
  assert.equal(db.stats().monitoringReports, 1);
  assert.equal(db.listMonitoringReports({ search: "dela" }).length, 1);

  const updated = db.saveMonitoringReport({
    ...created,
    forwarded_balance: 50,
    expenses: []
  });

  assert.equal(updated.id, created.id);
  assert.equal(updated.total_expenses, 0);
  assert.equal(updated.net_income, 350);

  const exported = db.exportData();
  assert.equal(exported.monitoringReports.length, 1);
  assert.equal(exported.monitoringReports[0].sales[0].total_sales, 300);

  db.deleteMonitoringReport(created.id);
  assert.equal(db.stats().monitoringReports, 0);

  db.close();
});
