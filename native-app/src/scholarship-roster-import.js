const SOURCE_LABEL = "Scholarship Renewal Checklist 2026-2027";

function text(value) {
  return String(value ?? "").trim();
}

function availableValue(value) {
  const normalized = text(value);
  return normalized === "-" ? "" : normalized;
}

function normalizeKey(value) {
  return text(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseScholarName(value) {
  const name = text(value);
  const comma = name.indexOf(",");
  if (comma < 0) return { last_name: name, first_name: "", middle_name: "" };
  return {
    last_name: name.slice(0, comma).trim(),
    first_name: name.slice(comma + 1).trim(),
    middle_name: ""
  };
}

function splitSponsorNames(value) {
  const sponsorCell = text(value);
  if (!sponsorCell || /^(?:no sponsor yet|none|n\/?a|-)$/i.test(sponsorCell)) return [];
  const names = [];
  let current = "";
  let parenthesisDepth = 0;
  for (let index = 0; index < sponsorCell.length; index += 1) {
    const character = sponsorCell[index];
    if (character === "(") parenthesisDepth += 1;
    if (character === ")") parenthesisDepth = Math.max(0, parenthesisDepth - 1);
    const previous = sponsorCell[index - 1] || "";
    const next = sponsorCell[index + 1] || "";
    const isCareOf = character === "/" && previous.toLowerCase() === "c" && next.toLowerCase() === "o";
    if (character === "/" && parenthesisDepth === 0 && !isCareOf) {
      if (current.trim()) names.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  if (current.trim()) names.push(current.trim());
  return [...new Map(names.map(name => [normalizeKey(name), name])).values()];
}

function educationLevel(value) {
  const level = text(value).toLowerCase();
  const grade = Number((/grade\s*(\d+)/i.exec(level) || [])[1]);
  if (grade >= 1 && grade <= 6) return "Elementary";
  if (grade >= 7 && grade <= 10) return "Junior High School";
  if (grade >= 11 && grade <= 12) return "Senior High School";
  if (/college|university/.test(level)) return "College";
  if (/vocational|tvet|technical/.test(level)) return "Vocational";
  return "";
}

function sponsorType(value) {
  return /ancop|foundation|fondazione|inc\.?|corporation|association|organization|company|family|hrod|unilab|macquarie|san vincenzo|immanuel/i.test(text(value))
    ? "Organization"
    : "Individual";
}

function normalizeChapel(value) {
  const key = normalizeKey(value).replace(/^sto nino$/, "sto nino");
  return key;
}

function appendNote(current, addition) {
  const parts = [text(current), text(addition)].filter(Boolean);
  return [...new Map(parts.flatMap(part => part.split("\n")).map(part => [normalizeKey(part), part.trim()])).values()].join("\n");
}

function prepareRosterRows(rows = []) {
  return (Array.isArray(rows) ? rows : []).map((source, index) => {
    const parsedName = parseScholarName(source.scholar_name);
    const sponsors = splitSponsorNames(source.sponsors);
    const sourceChapel = availableValue(source.chapel);
    return {
      source_row: Number(source.source_row || index + 7),
      ...parsedName,
      gender: availableValue(source.gender),
      grade_or_year: availableValue(source.grade_or_year),
      education_level: educationLevel(source.grade_or_year),
      school_name: availableValue(source.school_name),
      course: availableValue(source.course),
      chapel: sourceChapel,
      chapel_key: normalizeChapel(sourceChapel),
      sponsors,
      scholarship_category: availableValue(source.scholarship_category),
      scholarship_status: availableValue(source.scholarship_status) || "Active"
    };
  }).filter(row => row.last_name && row.first_name && row.education_level);
}

function nextReferences(rows, prefix, year, count) {
  const highest = rows.reduce((maximum, row) => {
    const value = Number(text(row.reference).split("-").pop());
    return Number.isFinite(value) ? Math.max(maximum, value) : maximum;
  }, 0);
  return Array.from({ length: count }, (_, index) => `${prefix}-${year}-${String(highest + index + 1).padStart(4, "0")}`);
}

async function runBatch(database, store, statements) {
  if (!statements.length) return;
  const batchSize = 200;
  for (let offset = 0; offset < statements.length; offset += batchSize) {
    const batch = statements.slice(offset, offset + batchSize);
    if (typeof database?.executeBatch === "function") {
      await database.executeBatch(batch, "write", true);
    } else {
      for (const statement of batch) await store.driver.run(statement.sql, statement.args);
    }
  }
}

async function importScholarshipRoster(database, sourceRows, options = {}) {
  const store = database.scholarship;
  if (!store) throw new Error("Scholarship database support is unavailable.");
  const rows = prepareRosterRows(sourceRows);
  const academicYear = text(options.academicYear || "2026-2027");
  const timestamp = new Date().toISOString();
  const referenceYear = Number(academicYear.slice(0, 4)) || new Date().getFullYear();
  const result = {
    sourceRows: sourceRows.length,
    acceptedRows: rows.length,
    scholarsCreated: 0,
    scholarsUpdated: 0,
    sponsorsCreated: 0,
    enrollmentsCreated: 0,
    enrollmentsUpdated: 0,
    sponsorshipsCreated: 0,
    unmatchedChapels: []
  };

  let year = await store.driver.get("SELECT * FROM scholarship_academic_years WHERE lower(label) = lower(?)", [academicYear]);
  if (!year) {
    await runBatch(database, store, [{
      sql: `INSERT INTO scholarship_academic_years (label, start_date, end_date, status, created_at, updated_at)
            VALUES (?, ?, ?, 'Active', ?, ?)`,
      args: [academicYear, `${referenceYear}-06-01`, `${referenceYear + 1}-05-31`, timestamp, timestamp]
    }]);
    year = await store.driver.get("SELECT * FROM scholarship_academic_years WHERE lower(label) = lower(?)", [academicYear]);
  }

  const chapels = await store.driver.all("SELECT id, chapel_name, chapel_code FROM scholarship_chapels");
  const chapelMap = new Map();
  for (const chapel of chapels) {
    chapelMap.set(normalizeChapel(chapel.chapel_name), chapel);
    chapelMap.set(normalizeChapel(chapel.chapel_code), chapel);
  }
  const unmatched = [...new Set(rows.filter(row => row.chapel && !chapelMap.has(row.chapel_key)).map(row => row.chapel))];
  result.unmatchedChapels = unmatched;

  const existingScholars = await store.driver.all("SELECT * FROM scholarship_scholars");
  const scholarMap = new Map(existingScholars.map(scholar => [
    normalizeKey(`${scholar.last_name} ${scholar.first_name} ${scholar.middle_name}`), scholar
  ]));
  const newRows = rows.filter(row => !scholarMap.has(normalizeKey(`${row.last_name} ${row.first_name} ${row.middle_name}`)));
  const references = nextReferences(
    await store.driver.all("SELECT scholar_no AS reference FROM scholarship_scholars WHERE scholar_no LIKE ?", [`SCH-${referenceYear}-%`]),
    "SCH", referenceYear, newRows.length
  );
  const scholarStatements = [];
  for (const row of rows) {
    const key = normalizeKey(`${row.last_name} ${row.first_name} ${row.middle_name}`);
    const chapel = chapelMap.get(row.chapel_key);
    const sourceNote = appendNote(`Imported from ${SOURCE_LABEL}.`, chapel ? "" : `Source chapel: ${row.chapel}`);
    const existing = scholarMap.get(key);
    if (existing) {
      scholarStatements.push({
        sql: `UPDATE scholarship_scholars SET gender = ?, chapel_id = ?, status = ?, notes = ?, updated_at = ? WHERE id = ?`,
        args: [existing.gender || row.gender, existing.chapel_id || chapel?.id || null, row.scholarship_status, appendNote(existing.notes, sourceNote), timestamp, existing.id]
      });
      result.scholarsUpdated += 1;
    } else {
      scholarStatements.push({
        sql: `INSERT INTO scholarship_scholars
              (scholar_no, last_name, first_name, middle_name, gender, chapel_id, status, notes, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [references[result.scholarsCreated], row.last_name, row.first_name, row.middle_name, row.gender, chapel?.id || null,
          row.scholarship_status, sourceNote, timestamp, timestamp]
      });
      result.scholarsCreated += 1;
    }
  }
  await runBatch(database, store, scholarStatements);

  const sponsorNames = [...new Map(rows.flatMap(row => row.sponsors).map(name => [normalizeKey(name), name])).values()];
  const existingSponsors = await store.driver.all("SELECT * FROM scholarship_sponsors");
  const sponsorMap = new Map(existingSponsors.map(sponsor => [normalizeKey(sponsor.sponsor_name), sponsor]));
  const newSponsors = sponsorNames.filter(name => !sponsorMap.has(normalizeKey(name)));
  const sponsorReferences = nextReferences(
    await store.driver.all("SELECT sponsor_no AS reference FROM scholarship_sponsors WHERE sponsor_no LIKE ?", [`SPN-${referenceYear}-%`]),
    "SPN", referenceYear, newSponsors.length
  );
  await runBatch(database, store, newSponsors.map((name, index) => ({
    sql: `INSERT INTO scholarship_sponsors
          (sponsor_no, sponsor_type, sponsor_name, consent_status, status, notes, created_at, updated_at)
          VALUES (?, ?, ?, 'Not Recorded', 'Active', ?, ?, ?)`,
    args: [sponsorReferences[index], sponsorType(name), name, `Imported from the Sponsors column of ${SOURCE_LABEL}.`, timestamp, timestamp]
  })));
  result.sponsorsCreated = newSponsors.length;

  const refreshedScholars = await store.driver.all("SELECT * FROM scholarship_scholars");
  const refreshedScholarMap = new Map(refreshedScholars.map(scholar => [
    normalizeKey(`${scholar.last_name} ${scholar.first_name} ${scholar.middle_name}`), scholar
  ]));
  const existingEnrollments = await store.driver.all("SELECT * FROM scholarship_enrollments WHERE academic_year_id = ?", [year.id]);
  const enrollmentMap = new Map(existingEnrollments.map(enrollment => [Number(enrollment.scholar_id), enrollment]));
  const enrollmentStatements = [];
  for (const row of rows) {
    const scholar = refreshedScholarMap.get(normalizeKey(`${row.last_name} ${row.first_name} ${row.middle_name}`));
    if (!scholar) continue;
    const existing = enrollmentMap.get(Number(scholar.id));
    const chapel = chapelMap.get(row.chapel_key);
    const sourceNote = appendNote(`Imported from ${SOURCE_LABEL}.`, chapel ? "" : `Source chapel: ${row.chapel}`);
    const coverage = row.sponsors.length ? "Covered" : "Unassigned";
    if (existing) {
      enrollmentStatements.push({
        sql: `UPDATE scholarship_enrollments SET school_name = ?, education_level = ?, grade_or_year = ?, course = ?,
              scholarship_category = ?, scholarship_status = ?, coverage_status = ?, notes = ?, updated_at = ? WHERE id = ?`,
        args: [row.school_name || existing.school_name, row.education_level || existing.education_level,
          row.grade_or_year || existing.grade_or_year, row.course || existing.course,
          row.scholarship_category || existing.scholarship_category, row.scholarship_status, coverage,
          appendNote(existing.notes, sourceNote), timestamp, existing.id]
      });
      result.enrollmentsUpdated += 1;
    } else {
      enrollmentStatements.push({
        sql: `INSERT INTO scholarship_enrollments
              (scholar_id, academic_year_id, school_name, education_level, grade_or_year, course, scholarship_category,
               scholarship_status, renewal_status, coverage_status, notes, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Not Started', ?, ?, ?, ?)`,
        args: [scholar.id, year.id, row.school_name, row.education_level, row.grade_or_year, row.course,
          row.scholarship_category, row.scholarship_status, coverage, sourceNote, timestamp, timestamp]
      });
      result.enrollmentsCreated += 1;
    }
  }
  await runBatch(database, store, enrollmentStatements);

  const refreshedSponsors = await store.driver.all("SELECT * FROM scholarship_sponsors");
  const refreshedSponsorMap = new Map(refreshedSponsors.map(sponsor => [normalizeKey(sponsor.sponsor_name), sponsor]));
  const refreshedEnrollments = await store.driver.all("SELECT * FROM scholarship_enrollments WHERE academic_year_id = ?", [year.id]);
  const refreshedEnrollmentMap = new Map(refreshedEnrollments.map(enrollment => [Number(enrollment.scholar_id), enrollment]));
  const existingSponsorships = await store.driver.all(`
    SELECT s.sponsor_id, s.enrollment_id FROM scholarship_sponsorships s
    JOIN scholarship_enrollments e ON e.id = s.enrollment_id WHERE e.academic_year_id = ?
  `, [year.id]);
  const sponsorshipKeys = new Set(existingSponsorships.map(item => `${item.sponsor_id}:${item.enrollment_id}`));
  const sponsorshipStatements = [];
  for (const row of rows) {
    const scholar = refreshedScholarMap.get(normalizeKey(`${row.last_name} ${row.first_name} ${row.middle_name}`));
    const enrollment = refreshedEnrollmentMap.get(Number(scholar?.id));
    if (!enrollment) continue;
    for (const sponsorName of row.sponsors) {
      const sponsor = refreshedSponsorMap.get(normalizeKey(sponsorName));
      const key = `${sponsor?.id}:${enrollment.id}`;
      if (!sponsor || sponsorshipKeys.has(key)) continue;
      sponsorshipKeys.add(key);
      sponsorshipStatements.push({
        sql: `INSERT INTO scholarship_sponsorships
              (sponsor_id, enrollment_id, frequency, status, notes, created_at, updated_at)
              VALUES (?, ?, 'Annual', 'Active', ?, ?, ?)`,
        args: [sponsor.id, enrollment.id, `Imported from ${SOURCE_LABEL}.`, timestamp, timestamp]
      });
      result.sponsorshipsCreated += 1;
    }
  }
  await runBatch(database, store, sponsorshipStatements);
  await runBatch(database, store, [{
    sql: `INSERT INTO scholarship_audit_log (user_id, action, entity_type, entity_id, summary, created_at)
          VALUES (NULL, 'google_sheets_import', 'scholars', NULL, ?, ?)`,
    args: [`${result.acceptedRows} roster rows processed from ${SOURCE_LABEL}.`, timestamp]
  }]);
  return result;
}

module.exports = {
  educationLevel,
  importScholarshipRoster,
  normalizeKey,
  parseScholarName,
  prepareRosterRows,
  splitSponsorNames,
  sponsorType
};
