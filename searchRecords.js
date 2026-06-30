function searchRecords() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const menuSheet = getSheet_(ss, LPDB.sheets.menu);
  const dataSheet = getSheet_(ss, LPDB.sheets.master);
  const config = LPDB.search;
  const searchText = String(menuSheet.getRange("B6").getValue() || "").trim().toLowerCase();

  clearSearchResults_(menuSheet);

  if (!searchText || searchText === LPDB.placeholders.search.toLowerCase()) return;

  const lastRow = dataSheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert("No records found in the masterlist.");
    return;
  }

  const lastCol = Math.max(dataSheet.getLastColumn(), 7);
  const records = dataSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const matches = [];

  for (let i = 0; i < records.length && matches.length < config.maxResults; i++) {
    const row = records[i];

    if (recordMatchesSearch_(row, searchText)) {
      matches.push({
        row,
        sourceRowNumber: i + 2
      });
    }
  }

  if (matches.length === 0) {
    SpreadsheetApp.getUi().alert("No matching records found.");
    return;
  }

  const resultRows = matches.map(match => [
    match.row[0],
    match.row[1],
    match.row[2],
    "",
    match.row[4],
    match.row[5],
    match.row[6]
  ]);

  menuSheet
    .getRange(config.firstResultRow, config.resultStartCol, resultRows.length, config.resultColCount)
    .setValues(resultRows);

  matches.forEach((match, index) => {
    dataSheet
      .getRange(match.sourceRowNumber, config.pictureSourceCol)
      .copyTo(
        menuSheet.getRange(config.firstResultRow + index, config.pictureResultCol),
        SpreadsheetApp.CopyPasteType.PASTE_VALUES,
        false
      );
  });
}

function clearSearchResults_(menuSheet) {
  const config = LPDB.search;

  menuSheet
    .getRange(config.firstResultRow, config.checkboxCol, config.maxResults, 1)
    .uncheck();

  menuSheet
    .getRange(config.firstResultRow, config.resultStartCol, config.maxResults, config.resultColCount)
    .clearContent();
}

function recordMatchesSearch_(row, searchText) {
  const controlNo = String(row[1] || "").toLowerCase();
  const lastName = String(row[4] || "").toLowerCase();
  const firstName = String(row[5] || "").toLowerCase();
  const middleName = String(row[6] || "").toLowerCase();
  const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, " ").trim();
  const reverseFullName = `${lastName} ${firstName} ${middleName}`.replace(/\s+/g, " ").trim();

  return (
    controlNo.includes(searchText) ||
    lastName.includes(searchText) ||
    firstName.includes(searchText) ||
    middleName.includes(searchText) ||
    fullName.includes(searchText) ||
    reverseFullName.includes(searchText)
  );
}
