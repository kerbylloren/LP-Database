function printForm() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getSheet_(ss, LPDB.sheets.viewer);
  const range = "A1:M53";
  const sheetId = sheet.getSheetId();

  SpreadsheetApp.flush();

  const controlNo = sheet.getRange("K6").getDisplayValue();
  const surname = sheet.getRange("C10").getDisplayValue();
  const firstName = sheet.getRange("H10").getDisplayValue();
  const middleName = sheet.getRange("L10").getDisplayValue();
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  const fileName = sanitizeFileName_(
    `${controlNo}-${surname}-${firstName}-${middleName}-${today}`
  );
  const pdfUrl = buildSheetPdfUrl_(ss, sheetId, range);
  const response = UrlFetchApp.fetch(pdfUrl, {
    headers: {
      Authorization: "Bearer " + ScriptApp.getOAuthToken()
    }
  });
  const blob = response.getBlob().setName(fileName + ".pdf");
  const folder = DriveApp.getFolderById(LPDB.printFolderId);
  const pdfFile = folder.createFile(blob);
  const fileUrl = JSON.stringify(pdfFile.getUrl());
  const html = HtmlService.createHtmlOutput(`
    <script>
      window.open(${fileUrl}, "_blank");
      google.script.host.close();
    </script>
  `)
    .setWidth(100)
    .setHeight(50);

  SpreadsheetApp.getUi().showModalDialog(html, "Opening print file...");
}

function buildSheetPdfUrl_(spreadsheet, sheetId, rangeA1) {
  return (
    spreadsheet.getUrl().replace(/edit.*$/, "") +
    "export?format=pdf" +
    "&gid=" + sheetId +
    "&range=" + encodeURIComponent(rangeA1) +
    "&size=A4" +
    "&portrait=true" +
    "&fitw=true" +
    "&sheetnames=false" +
    "&printtitle=false" +
    "&pagenumbers=false" +
    "&gridlines=false" +
    "&fzr=false" +
    "&top_margin=0.25" +
    "&bottom_margin=0.25" +
    "&left_margin=0.25" +
    "&right_margin=0.25"
  );
}

function sanitizeFileName_(name) {
  return String(name)
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}
