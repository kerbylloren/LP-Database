const { createDatabase } = require("../src/database-factory");
const { importScholarshipRoster } = require("../src/scholarship-roster-import");

function sourceRows() {
  const encoded = String(process.env.PAOFI_SCHOLARSHIP_ROSTER_BASE64 || "").trim();
  if (!encoded) throw new Error("Scholarship roster input was not provided.");
  const parsed = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  if (!Array.isArray(parsed)) throw new Error("Scholarship roster input must be an array.");
  return parsed;
}

async function main() {
  const database = await createDatabase();
  try {
    await database.warmup?.();
    const result = await importScholarshipRoster(database, sourceRows(), { academicYear: "2026-2027" });
    console.log(JSON.stringify(result));
  } finally {
    await database.close?.();
  }
}

main().catch(error => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
