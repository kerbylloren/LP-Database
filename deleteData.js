function deleteRecord() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const dataSheet = getSheet_(ss, LPDB.sheets.master);
  const controlNo = getControlNoForDelete_(activeSheet);

  if (!controlNo) {
    SpreadsheetApp.getUi().alert("No record selected for deletion.");
    return;
  }

  const recordRow = findRecordRowByControlNo_(dataSheet, controlNo);

  if (!recordRow) {
    SpreadsheetApp.getUi().alert("No matching record found for: " + controlNo);
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    "Delete Record",
    "Are you sure you want to delete this record?\n\n" + controlNo,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  const binSheet = getOrCreateBinSheet_(ss);
  const lastCol = dataSheet.getLastColumn();
  const binRow = prepareRecordBin_(dataSheet, binSheet, lastCol);

  dataSheet
    .getRange(recordRow, 1, 1, lastCol)
    .copyTo(
      binSheet.getRange(binRow, 1, 1, lastCol),
      SpreadsheetApp.CopyPasteType.PASTE_VALUES,
      false
    );

  binSheet.getRange(binRow, lastCol + 1).setValue(new Date());
  dataSheet.deleteRow(recordRow);

  if (activeSheet.getName() === LPDB.sheets.menu) {
    searchRecords();
  } else {
    clearActiveForm_(activeSheet);
  }

  SpreadsheetApp.getUi().alert("Record deleted and moved to Record Bin.");
}

function getControlNoForDelete_(sheet) {
  const sheetName = sheet.getName();

  if (sheetName === LPDB.sheets.form || sheetName === LPDB.sheets.viewer) {
    return sheet.getRange("K6").getValue();
  }

  if (sheetName === LPDB.sheets.menu) {
    return getSelectedControlNoFromMainMenu_(sheet);
  }

  SpreadsheetApp.getUi().alert(
    "Please delete from Main Menu, Form Editor, or Record Viewer only."
  );

  return "";
}

function getOrCreateBinSheet_(ss) {
  return ss.getSheetByName(LPDB.sheets.bin) || ss.insertSheet(LPDB.sheets.bin);
}

function prepareRecordBin_(dataSheet, binSheet, lastCol) {
  if (binSheet.getLastRow() === 0) {
    dataSheet
      .getRange(1, 1, 1, lastCol)
      .copyTo(
        binSheet.getRange(1, 1, 1, lastCol),
        SpreadsheetApp.CopyPasteType.PASTE_VALUES,
        false
      );

    binSheet.getRange(1, lastCol + 1).setValue("Deleted At");
  }

  return binSheet.getLastRow() + 1;
}
