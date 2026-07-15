const ExcelJS = require("exceljs");

const IMPORT_DEFINITIONS = {
  scholars: {
    label: "Scholar Profiles",
    fields: [
      "scholar_no", "last_name", "first_name", "middle_name", "birth_date", "place_of_birth", "gender", "chapel", "contact_no",
      "email", "address", "hobbies", "ambition", "special_circumstances", "other_income_source", "birth_order",
      "total_siblings", "married_siblings", "household_contribution", "guardian_name", "guardian_relationship", "guardian_contact", "status", "notes"
    ],
    required: ["last_name", "first_name"],
    aliases: {
      "scholar no": "scholar_no", "scholar number": "scholar_no", surname: "last_name", "last name": "last_name",
      "first name": "first_name", "middle name": "middle_name", birthday: "birth_date", "birth date": "birth_date",
      birthplace: "place_of_birth", "place of birth": "place_of_birth", sex: "gender", "contact number": "contact_no",
      "home address": "address", "special circumstance": "special_circumstances", "special circumstances": "special_circumstances",
      "other source of income": "other_income_source", "total number of siblings": "total_siblings",
      "number of married siblings": "married_siblings", contribution: "household_contribution", guardian: "guardian_name",
      "guardian relationship": "guardian_relationship", "guardian contact": "guardian_contact"
    }
  },
  sponsors: {
    label: "Sponsor Profiles",
    fields: [
      "sponsor_no", "sponsor_type", "sponsor_name", "contact_person", "email", "contact_no", "address",
      "consent_status", "communication_preference", "status", "notes"
    ],
    required: ["sponsor_name"],
    aliases: {
      "sponsor no": "sponsor_no", "sponsor number": "sponsor_no", type: "sponsor_type", name: "sponsor_name",
      sponsor: "sponsor_name", "contact person": "contact_person", "contact number": "contact_no",
      consent: "consent_status", "communication preference": "communication_preference"
    }
  },
  enrollments: {
    label: "Yearly Enrollments",
    fields: [
      "scholar_no", "academic_year", "school_name", "education_level", "grade_or_year", "course", "scholarship_category", "admission_date",
      "scholarship_status", "renewal_status", "coverage_status", "notes"
    ],
    required: ["scholar_no", "academic_year", "education_level"],
    aliases: {
      "scholar no": "scholar_no", "scholar number": "scholar_no", "school year": "academic_year",
      "academic year": "academic_year", school: "school_name", level: "education_level",
      "education level": "education_level", "grade/year": "grade_or_year", grade: "grade_or_year",
      "year level": "grade_or_year", category: "scholarship_category", "scholarship category": "scholarship_category",
      "admission date": "admission_date", status: "scholarship_status",
      "renewal status": "renewal_status", "coverage status": "coverage_status"
    }
  }
};

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function isoDate(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/.exec(text);
  if (match) return `${match[3]}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`;
  return text;
}

function cellValue(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return isoDate(value);
  if (typeof value === "object") {
    if ("text" in value) return String(value.text || "").trim();
    if ("result" in value) return cellValue(value.result);
    if (Array.isArray(value.richText)) return value.richText.map(item => item.text || "").join("").trim();
  }
  return String(value).trim();
}

function definitionFor(type) {
  const definition = IMPORT_DEFINITIONS[type];
  if (!definition) throw new Error("Unsupported Scholarship import type.");
  return definition;
}

async function workbookFromBase64(fileData) {
  const encoded = String(fileData || "").replace(/^data:[^;]+;base64,/, "");
  if (!encoded) throw new Error("Choose an XLSX file to import.");
  const buffer = Buffer.from(encoded, "base64");
  if (!buffer.length) throw new Error("The XLSX file is empty.");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  if (!workbook.worksheets.length) throw new Error("The XLSX file does not contain a worksheet.");
  return workbook;
}

function extractRows(worksheet, definition) {
  const headerRow = worksheet.getRow(1);
  const fieldByColumn = new Map();
  headerRow.eachCell({ includeEmpty: false }, (cell, columnNumber) => {
    const header = normalizeHeader(cellValue(cell.value));
    const canonical = definition.aliases[header] || header.replace(/\s+/g, "_");
    if (definition.fields.includes(canonical)) fieldByColumn.set(columnNumber, canonical);
  });
  if (!fieldByColumn.size) throw new Error("No recognized Scholarship columns were found in the first row.");

  const rows = [];
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const worksheetRow = worksheet.getRow(rowNumber);
    const record = {};
    for (const [columnNumber, field] of fieldByColumn.entries()) {
      const value = cellValue(worksheetRow.getCell(columnNumber).value);
      record[field] = field.endsWith("_date") || field === "birth_date" ? isoDate(value) : value;
    }
    if (!Object.values(record).some(Boolean)) continue;
    rows.push({ row_number: rowNumber, data: record });
  }
  return rows;
}

async function validateRow(store, type, item) {
  const definition = definitionFor(type);
  const errors = [];
  const data = { ...item.data };
  for (const field of definition.required) {
    if (!String(data[field] || "").trim()) errors.push(`${field.replaceAll("_", " ")} is required`);
  }

  if (type === "scholars") {
    if (data.chapel) {
      const chapel = await store.driver.get(
        "SELECT id FROM scholarship_chapels WHERE lower(chapel_name) = lower(?) OR lower(chapel_code) = lower(?)",
        [data.chapel, data.chapel]
      );
      if (!chapel) errors.push("chapel was not found");
      else data.chapel_id = chapel.id;
      delete data.chapel;
    }
    let duplicate = null;
    if (data.scholar_no) {
      duplicate = await store.driver.get("SELECT id, scholar_no FROM scholarship_scholars WHERE lower(scholar_no) = lower(?)", [data.scholar_no]);
    }
    if (!duplicate && data.last_name && data.first_name && data.birth_date) {
      duplicate = await store.driver.get(
        `SELECT id, scholar_no FROM scholarship_scholars
         WHERE lower(last_name) = lower(?) AND lower(first_name) = lower(?) AND birth_date = ?`,
        [data.last_name, data.first_name, data.birth_date]
      );
    }
    if (duplicate) errors.push(`possible duplicate scholar (record ${duplicate.scholar_no || duplicate.id})`);
  }

  if (type === "sponsors") {
    let duplicate = null;
    if (data.sponsor_no) duplicate = await store.driver.get("SELECT id, sponsor_no FROM scholarship_sponsors WHERE lower(sponsor_no) = lower(?)", [data.sponsor_no]);
    if (!duplicate && data.sponsor_name) {
      duplicate = await store.driver.get(
        "SELECT id, sponsor_no FROM scholarship_sponsors WHERE lower(sponsor_name) = lower(?) AND lower(COALESCE(email, '')) = lower(?)",
        [data.sponsor_name, data.email || ""]
      );
    }
    if (duplicate) errors.push(`possible duplicate sponsor (record ${duplicate.sponsor_no || duplicate.id})`);
  }

  if (type === "enrollments" && data.scholar_no && data.academic_year) {
    const scholar = await store.driver.get("SELECT id FROM scholarship_scholars WHERE lower(scholar_no) = lower(?)", [data.scholar_no]);
    const year = await store.driver.get("SELECT id FROM scholarship_academic_years WHERE lower(label) = lower(?)", [data.academic_year]);
    if (!scholar) errors.push("scholar number was not found");
    if (!year) errors.push("academic year was not found");
    if (scholar && year) {
      const duplicate = await store.driver.get(
        "SELECT id FROM scholarship_enrollments WHERE scholar_id = ? AND academic_year_id = ?",
        [scholar.id, year.id]
      );
      if (duplicate) errors.push("yearly enrollment already exists");
      data.scholar_id = scholar.id;
      data.academic_year_id = year.id;
    }
  }

  return { row_number: item.row_number, data, errors, valid: errors.length === 0 };
}

async function previewScholarshipImport(store, type, fileData) {
  const definition = definitionFor(type);
  const workbook = await workbookFromBase64(fileData);
  const extracted = extractRows(workbook.worksheets[0], definition);
  const rows = [];
  for (const item of extracted) rows.push(await validateRow(store, type, item));
  return {
    type,
    sheet_name: workbook.worksheets[0].name,
    total: rows.length,
    valid: rows.filter(row => row.valid).length,
    invalid: rows.filter(row => !row.valid).length,
    rows
  };
}

async function commitScholarshipImport(store, type, rows, userId) {
  definitionFor(type);
  const entity = type === "scholars" ? "scholars" : type === "sponsors" ? "sponsors" : "enrollments";
  const imported = [];
  const rejected = [];
  for (const item of Array.isArray(rows) ? rows : []) {
    const validation = await validateRow(store, type, { row_number: item.row_number, data: item.data || {} });
    if (!validation.valid) {
      rejected.push(validation);
      continue;
    }
    try {
      imported.push(await store.save(entity, validation.data, userId));
    } catch (error) {
      rejected.push({ ...validation, valid: false, errors: [error.message] });
    }
  }
  await store.audit(userId, "xlsx_import", entity, null, `${imported.length} imported; ${rejected.length} rejected`);
  return { imported: imported.length, rejected: rejected.length, records: imported, errors: rejected };
}

async function scholarshipImportTemplate(type) {
  const definition = definitionFor(type);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Payatas Orione Foundation Inc.";
  const worksheet = workbook.addWorksheet(definition.label);
  worksheet.addRow(definition.fields);
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF146C43" } };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + Math.min(definition.fields.length, 26))}1` };
  definition.fields.forEach((field, index) => {
    worksheet.getColumn(index + 1).width = Math.max(14, Math.min(28, field.length + 4));
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return {
    filename: `PAOFI-Scholarship-${type}-Import-Template.xlsx`,
    mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    file_data: Buffer.from(buffer).toString("base64")
  };
}

module.exports = {
  IMPORT_DEFINITIONS,
  commitScholarshipImport,
  previewScholarshipImport,
  scholarshipImportTemplate
};
