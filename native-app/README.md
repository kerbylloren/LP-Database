# PAOFI Database Native App

Electron desktop application for PAOFI program records. The current production
module covers the Livelihood Program and can run with either cloud-backed data
or a local fallback database.

## Start

The standalone Windows package is built with Electron and does not use the
user's Edge or Chrome installation.

Build the installer:

```powershell
npm run package:installer
```

Build the portable package:

```powershell
npm run package:standalone
```

The installer removes old generated preview/runtime folders during
install/update while preserving application data. Existing data from legacy
local folders is migrated into the current application data folder when needed.

Run the local web server:

```powershell
npm start
```

Run the desktop shell during development:

```powershell
npm run electron:dev
```

## Cloud Database

Cloud database connection details are runtime-only and must not be committed or
documented in public repository files. Use the internal deployment procedure for
approved devices.

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

- New Livelihood Program records use the same `LP-YYYY-###` control number format.
- Deleting a record moves it to the Record Bin.
- The Export button downloads a JSON backup of active and deleted records.
- The app has separate pages for Main Menu, Search, Editor, Record Viewer,
  Database Table, Monitoring, and Record Bin.
