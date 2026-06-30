function submitData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSheet = getSheet_(ss, LPDB.sheets.form);
  const dataSheet = getSheet_(ss, LPDB.sheets.master);
  const values = formSheet.getRange("A1:M52").getValues();
  const cell = createCellReader_(values);
  const rangeValues = createRangeReader_(values);

  const businessDurationData = rangeValues("F34:I35");
  const livelihoodInterestData = rangeValues("D37:I37");
  const seminarData = rangeValues("A43:D43");
  const willingnessData = rangeValues("A46:D46");
  const commitDaysData = rangeValues("A48:D48");

  const rowData = [
    cell("C6"),
    cell("K6"),
    cell("K7"),
    "",
    cell("C10"),
    cell("H10"),
    cell("L10"),
    cell("C11"),
    cell("H11"),
    cell("L11"),
    cell("C12"),
    cell("C13"),
    cell("C14"),
    joinFirstColumn_(rangeValues("A18:A27")),
    joinFirstColumn_(rangeValues("C18:C27")),
    joinFirstColumn_(rangeValues("D18:D27")),
    joinFirstColumn_(rangeValues("F18:F27")),
    joinFirstColumn_(rangeValues("H18:H27")),
    joinFirstColumn_(rangeValues("J18:J27")),
    joinFirstColumn_(rangeValues("K18:K27")),
    joinFirstColumn_(rangeValues("M18:M27")),
    chooseCheckedLabel_([
      [cell("A30"), cell("B30")],
      [cell("C30"), cell("D30")]
    ]),
    cell("K30"),
    cell("E32"),
    chooseCheckedLabel_([
      [cell("D33"), cell("E33")],
      [cell("F33"), cell("G33")]
    ]),
    cell("J33"),
    chooseCheckedLabel_([
      [businessDurationData[0][0], businessDurationData[0][1]],
      [businessDurationData[0][2], businessDurationData[0][3]],
      [businessDurationData[1][0], businessDurationData[1][1]],
      [businessDurationData[1][2], businessDurationData[1][3]]
    ]),
    chooseCheckedLabel_([
      [livelihoodInterestData[0][0], livelihoodInterestData[0][1]],
      [livelihoodInterestData[0][2], livelihoodInterestData[0][3]],
      [livelihoodInterestData[0][4], livelihoodInterestData[0][5]]
    ]),
    cell("C38"),
    cell("F39"),
    chooseCheckedLabel_([
      [seminarData[0][0], seminarData[0][1]],
      [seminarData[0][2], seminarData[0][3]]
    ]),
    cell("K43"),
    chooseCheckedLabel_([
      [willingnessData[0][0], willingnessData[0][1]],
      [willingnessData[0][2], willingnessData[0][3]]
    ]),
    chooseCheckedLabel_([
      [commitDaysData[0][0], commitDaysData[0][1]],
      [commitDaysData[0][2], commitDaysData[0][3]]
    ])
  ];

  const controlNo = normalizeComparable_(cell("K6"));
  const existingRow = findRecordRowByControlNo_(dataSheet, controlNo);
  const targetRow = existingRow || dataSheet.getLastRow() + 1;

  dataSheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);

  formSheet
    .getRange("L1")
    .copyTo(
      dataSheet.getRange(targetRow, 4),
      SpreadsheetApp.CopyPasteType.PASTE_VALUES,
      false
    );

  clearActiveForm_(formSheet);

  SpreadsheetApp.getUi().alert("Data successfully submitted/saved!");
  backToMainMenu();
}

function createCellReader_(values) {
  return a1 => {
    const position = parseA1_(a1);
    return values[position.row][position.col];
  };
}

function createRangeReader_(values) {
  return a1Range => {
    const [start, end] = a1Range.split(":");
    const startPosition = parseA1_(start);
    const endPosition = parseA1_(end);
    const output = [];

    for (let row = startPosition.row; row <= endPosition.row; row++) {
      const outputRow = [];

      for (let col = startPosition.col; col <= endPosition.col; col++) {
        outputRow.push(values[row][col]);
      }

      output.push(outputRow);
    }

    return output;
  };
}

function parseA1_(a1) {
  const match = String(a1).match(/^([A-Z]+)(\d+)$/);

  if (!match) {
    throw new Error(`Invalid A1 reference: ${a1}`);
  }

  return {
    col: columnToIndex_(match[1]),
    row: Number(match[2]) - 1
  };
}

function columnToIndex_(columnName) {
  let index = 0;

  for (let i = 0; i < columnName.length; i++) {
    index = index * 26 + columnName.charCodeAt(i) - 64;
  }

  return index - 1;
}

function joinFirstColumn_(rows) {
  return rows
    .map(row => row[0])
    .filter(isPresent_)
    .join("\n");
}

function chooseCheckedLabel_(pairs) {
  for (const [condition, value] of pairs) {
    if (isChecked_(condition)) return value;
  }

  return "";
}
