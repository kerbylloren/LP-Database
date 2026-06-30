const fs = require("node:fs");
const path = require("node:path");
const { BeneficiaryDatabase } = require("../src/database");
const { FIELD_NAMES } = require("../src/metadata");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows.filter(items => items.some(item => String(item).trim()));
}

function rowToRecord(row) {
  return FIELD_NAMES.reduce((record, fieldName, index) => {
    record[fieldName] = row[index] || "";
    return record;
  }, {});
}

function main() {
  const csvPath = process.argv[2];

  if (!csvPath) {
    console.error("Usage: node scripts/import-masterlist-csv.js <masterlist.csv>");
    process.exit(1);
  }

  const absoluteCsvPath = path.resolve(csvPath);
  const text = fs.readFileSync(absoluteCsvPath, "utf8").replace(/^\uFEFF/, "");
  const rows = parseCsv(text);

  if (rows.length < 2) {
    console.error("CSV does not contain data rows.");
    process.exit(1);
  }

  const dataRows = rows.slice(1);
  const database = new BeneficiaryDatabase();
  let imported = 0;
  let skipped = 0;

  dataRows.forEach(row => {
    const record = rowToRecord(row);

    if (!record.control_no) {
      skipped++;
      return;
    }

    database.saveRecord(record);
    imported++;
  });

  const stats = database.stats();
  database.close();

  console.log(`Imported or updated ${imported} records from ${absoluteCsvPath}.`);
  if (skipped) console.log(`Skipped ${skipped} rows without a Control No.`);
  console.log(`Database now has ${stats.active} active records and ${stats.deleted} deleted records.`);
}

main();
