function createNew() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSheet = getSheet_(ss, LPDB.sheets.form);
  const dataSheet = getSheet_(ss, LPDB.sheets.master);
  const year = new Date().getFullYear();
  const nextControlNo = getNextControlNo_(dataSheet, year);

  clearActiveForm_(formSheet);

  formSheet.getRange("C6").setValue(new Date());
  formSheet.getRange("K6:K7").setValues([[nextControlNo], [LPDB.status.active]]);

  ss.setActiveSheet(formSheet);
}

function getNextControlNo_(dataSheet, year) {
  const prefix = `LP-${year}-`;
  const lastRow = dataSheet.getLastRow();

  if (lastRow < 2) {
    return `${prefix}001`;
  }

  const controlNumbers = dataSheet.getRange(2, 2, lastRow - 1, 1).getValues();
  let highestNumber = 0;

  controlNumbers.forEach(row => {
    const controlNo = normalizeComparable_(row[0]);

    if (controlNo.startsWith(prefix)) {
      const numberPart = Number(controlNo.slice(prefix.length));

      if (!isNaN(numberPart) && numberPart > highestNumber) {
        highestNumber = numberPart;
      }
    }
  });

  return `${prefix}${String(highestNumber + 1).padStart(3, "0")}`;
}
