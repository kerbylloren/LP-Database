# LP Database Native App

Desktop-style database app for LP beneficiary records. It can run against the
local SQLite file or a configured Turso cloud database.

## Start

The standalone Windows package is built with Electron and does not use the
user's Edge or Chrome installation.

Installer:

```powershell
npm run package:installer
```

For a public installer, configure a trusted code-signing certificate issued to
`Kerby Lloren` before building:

```powershell
$env:CSC_LINK = "C:\path\to\kerby-lloren-code-signing.pfx"
$env:CSC_KEY_PASSWORD = "<certificate-password>"
npm run package:installer
```

The output is:

```text
dist-electron\PAOFI-LP-Database-Setup-0.1.1-x64.exe
```

Portable build:

```powershell
npm run package:standalone
```

The output is:

```text
dist-electron\PAOFI-LP-Database-Standalone-0.1.1-x64.exe
```

Or run:

```powershell
npm start
```

For the desktop shell during development:

```powershell
npm run electron:dev
```

Without cloud config, the app stores data in:

```text
data\lp_database.sqlite
```

## Cloud Database

For Turso cloud mode, create:

```text
%LOCALAPPDATA%\PAOFI-LP-Database-Data\cloud-database.json
```

with this shape:

```json
{
  "provider": "turso",
  "url": "<TURSO_DATABASE_URL>",
  "authToken": "<TURSO_AUTH_TOKEN>"
}
```

From the source folder, you can also set `TURSO_DATABASE_URL` and
`TURSO_AUTH_TOKEN`, then run:

```powershell
npm run cloud:config
npm run migrate:cloud
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
