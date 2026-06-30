const LPDB = {
  sheets: {
    menu: "Main Menu",
    form: "Form Editor",
    viewer: "Record Viewer",
    master: "LP Beneficiaries Masterlist",
    bin: "Record Bin"
  },
  search: {
    firstResultRow: 10,
    maxResults: 13,
    checkboxCol: 2,
    resultStartCol: 3,
    resultColCount: 7,
    controlCol: 4,
    pictureResultCol: 6,
    pictureSourceCol: 4
  },
  placeholders: {
    search: "Search Here"
  },
  status: {
    active: "Active"
  },
  printFolderId: "11ji8uJZOlkPhH3qxehOzWMfkOygqGJpu"
};

const FORM_CONTENT_RANGES = [
  "C6",
  "K6:K7",
  "L1",
  "C10:C14",
  "H10:H11",
  "L10:L11",
  "A18:M27",
  "K30",
  "E32",
  "J33",
  "C38",
  "F39",
  "K43",
  "K52"
];

const FORM_CHECKBOX_RANGES = [
  "A30", "C30",
  "D33", "F33",
  "F34", "H34", "F35", "H35",
  "D37", "F37", "H37",
  "A43", "C43",
  "A46", "C46",
  "A48", "C48"
];

const FORM_SCALAR_FIELDS = [
  ["C6", 0],
  ["K6", 1],
  ["K7", 2],
  ["C10", 4],
  ["H10", 5],
  ["L10", 6],
  ["C11", 7],
  ["H11", 8],
  ["L11", 9],
  ["C12", 10],
  ["C13", 11],
  ["C14", 12],
  ["K30", 22],
  ["E32", 23],
  ["J33", 25],
  ["C38", 28],
  ["F39", 29],
  ["K43", 31]
];

const FORM_COLUMN_FIELDS = [
  ["A18:A27", 13],
  ["C18:C27", 14],
  ["D18:D27", 15],
  ["F18:F27", 16],
  ["H18:H27", 17],
  ["J18:J27", 18],
  ["K18:K27", 19],
  ["M18:M27", 20]
];

function onEdit(e) {
  if (!e || !e.range) return;

  const range = e.range;
  const sheet = range.getSheet();

  if (sheet.getName() !== LPDB.sheets.menu) return;
  if (range.getA1Notation() !== "B6" || range.getNumRows() !== 1 || range.getNumColumns() !== 1) return;

  const currentValue = String(range.getValue() || "");

  if (!currentValue) {
    range.setValue(LPDB.placeholders.search);
    range.setFontColor("#808080");
    return;
  }

  if (currentValue !== LPDB.placeholders.search) {
    range.setFontColor("#000000");
    searchRecords();
  }
}

function displayRecordOnForm_(formSheet, record) {
  clearActiveForm_(formSheet);

  FORM_SCALAR_FIELDS.forEach(([cellA1, recordIndex]) => {
    formSheet.getRange(cellA1).setValue(record[recordIndex] || "");
  });

  FORM_COLUMN_FIELDS.forEach(([rangeA1, recordIndex]) => {
    setColumnValues_(formSheet, rangeA1, record[recordIndex]);
  });

  restoreCheckboxOption_(formSheet, [["A30", "B30"], ["C30", "D30"]], record[21]);
  restoreCheckboxOption_(formSheet, [["D33", "E33"], ["F33", "G33"]], record[24]);
  restoreCheckboxOption_(
    formSheet,
    [["F34", "G34"], ["H34", "I34"], ["F35", "G35"], ["H35", "I35"]],
    record[26]
  );
  restoreCheckboxOption_(formSheet, [["D37", "E37"], ["F37", "G37"], ["H37", "I37"]], record[27]);
  restoreCheckboxOption_(formSheet, [["A43", "B43"], ["C43", "D43"]], record[30]);
  restoreCheckboxOption_(formSheet, [["A46", "B46"], ["C46", "D46"]], record[32]);
  restoreCheckboxOption_(formSheet, [["A48", "B48"], ["C48", "D48"]], record[33]);
}

function setColumnValues_(sheet, rangeA1, value) {
  const range = sheet.getRange(rangeA1);
  const lines = splitLines_(value);
  const output = Array.from(
    { length: range.getNumRows() },
    (_, index) => [lines[index] || ""]
  );

  range.setValues(output);
}

function splitLines_(value) {
  if (!isPresent_(value)) return [];
  return String(value).split("\n");
}

function restoreCheckboxOption_(sheet, options, selectedValue) {
  const checkboxCells = options.map(([checkboxCell]) => checkboxCell);
  sheet.getRangeList(checkboxCells).uncheck();

  if (!isPresent_(selectedValue)) return;

  const normalizedSelectedValue = normalizeComparable_(selectedValue);
  const labelCells = options.map(([, labelCell]) => labelCell);
  const labels = sheet.getRangeList(labelCells).getRanges().map(range => range.getValue());

  for (let i = 0; i < labels.length; i++) {
    if (normalizeComparable_(labels[i]) === normalizedSelectedValue) {
      sheet.getRange(checkboxCells[i]).check();
      return;
    }
  }
}

function openSelectedRecord_(targetSheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const menuSheet = getSheet_(ss, LPDB.sheets.menu);
  const targetSheet = getSheet_(ss, targetSheetName);
  const dataSheet = getSheet_(ss, LPDB.sheets.master);
  const selectedControlNo = getSelectedControlNoFromMainMenu_(menuSheet);

  if (!selectedControlNo) return;

  const recordMatch = findRecordByControlNo_(dataSheet, selectedControlNo);

  if (!recordMatch) {
    SpreadsheetApp.getUi().alert("Selected record was not found in the masterlist.");
    return;
  }

  displayRecordOnForm_(targetSheet, recordMatch.record);

  dataSheet
    .getRange(recordMatch.rowNumber, 4)
    .copyTo(
      targetSheet.getRange("L1"),
      SpreadsheetApp.CopyPasteType.PASTE_VALUES,
      false
    );

  ss.setActiveSheet(targetSheet);
  SpreadsheetApp.getUi().alert("Data successfully retrieved!");
}

function getSelectedControlNoFromMainMenu_(menuSheet) {
  const config = LPDB.search;
  const resultData = menuSheet
    .getRange(
      config.firstResultRow,
      config.checkboxCol,
      config.maxResults,
      config.controlCol - config.checkboxCol + 1
    )
    .getValues();

  const selected = resultData.filter(row => isChecked_(row[0]) && isPresent_(row[2]));

  if (selected.length === 0) {
    SpreadsheetApp.getUi().alert("Please select one record from the result table first.");
    return "";
  }

  if (selected.length > 1) {
    SpreadsheetApp.getUi().alert("Please select only one record.");
    return "";
  }

  return selected[0][2];
}

function findRecordByControlNo_(dataSheet, controlNo) {
  const key = normalizeComparable_(controlNo);
  const lastRow = dataSheet.getLastRow();

  if (!key || lastRow < 2) return null;

  const lastCol = Math.max(dataSheet.getLastColumn(), 34);
  const records = dataSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  for (let i = 0; i < records.length; i++) {
    if (normalizeComparable_(records[i][1]) === key) {
      return {
        record: records[i],
        rowNumber: i + 2
      };
    }
  }

  return null;
}

function findRecordRowByControlNo_(dataSheet, controlNo) {
  const key = normalizeComparable_(controlNo);
  const lastRow = dataSheet.getLastRow();

  if (!key || lastRow < 2) return 0;

  const controlNumbers = dataSheet.getRange(2, 2, lastRow - 1, 1).getValues();

  for (let i = 0; i < controlNumbers.length; i++) {
    if (normalizeComparable_(controlNumbers[i][0]) === key) {
      return i + 2;
    }
  }

  return 0;
}

function clearActiveForm_(sheet) {
  const sheetName = sheet.getName();

  if (sheetName !== LPDB.sheets.form && sheetName !== LPDB.sheets.viewer) return;

  sheet.getRangeList(FORM_CONTENT_RANGES).clearContent();
  sheet.getRangeList(FORM_CHECKBOX_RANGES).uncheck();
}

function backToMainMenu() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setActiveSheet(getSheet_(ss, LPDB.sheets.menu));
}

function cleanupPrintedForms() {
  const folder = DriveApp.getFolderById(LPDB.printFolderId);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 1);

  const files = folder.getFilesByType(MimeType.PDF);

  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName();
    const created = file.getDateCreated();

    if (/^LP-\d{4}-\d{3}-.+-\d{4}-\d{2}-\d{2}\.pdf$/i.test(name) && created < cutoff) {
      file.setTrashed(true);
    }
  }
}

function createCleanupTrigger() {
  const existingTrigger = ScriptApp
    .getProjectTriggers()
    .some(trigger => trigger.getHandlerFunction() === "cleanupPrintedForms");

  if (existingTrigger) {
    SpreadsheetApp.getUi().alert("Cleanup trigger already exists.");
    return;
  }

  ScriptApp.newTrigger("cleanupPrintedForms")
    .timeBased()
    .everyDays(1)
    .atHour(1)
    .create();
}

function getSheet_(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Missing required sheet: ${sheetName}`);
  }

  return sheet;
}

function isChecked_(value) {
  if (value === true) return true;

  const normalized = String(value || "").trim().toUpperCase();
  return normalized === "TRUE" || normalized === "T";
}

function isPresent_(value) {
  return value !== null && value !== "" && typeof value !== "undefined";
}

function normalizeComparable_(value) {
  return String(value || "").trim();
}
