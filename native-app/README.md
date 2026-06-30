# LP Database Native App

Local desktop-style database app for LP beneficiary records.

## Start

Double-click:

```text
start-lp-database.cmd
```

Or run:

```powershell
npm start
```

The app stores data in:

```text
data\lp_database.sqlite
```

## Import From Google Sheets CSV

Export the `LP Beneficiaries Masterlist` sheet as CSV, then run:

```powershell
npm run import:csv -- "C:\path\to\masterlist.csv"
```

The importer follows the same column order used by the Apps Script `rowData`
array. CSV export usually does not include embedded pictures, so picture fields
may need to be reattached in the app.

## Verify

```powershell
npm test
```

## Notes

- New records use the same `LP-YYYY-###` control number format.
- Deleting a record moves it to the Record Bin.
- The Export button downloads a JSON backup of active and deleted records.
- The app now has separate pages for Main Menu, Search, Editor, Record Viewer,
  Database Table, and Record Bin.
