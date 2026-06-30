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
