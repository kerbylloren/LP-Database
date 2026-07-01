# PAOFI Livelihood Program Database

A desktop database application for the Payatas Orione Foundation Inc.
Livelihood Program. The project started as a Google Apps Script and Google
Sheets database workflow, then expanded into a standalone Windows application
with a Turso cloud database backend.

## Current App

The active application lives in:

```text
native-app/
```

It provides separate pages for:

- Main Menu
- Search
- Record Editor
- Record Viewer
- Database Table
- Record Bin

The packaged Windows app opens as a standalone desktop application window and
does not depend on the user's Edge or Chrome installation.

## Cloud Database

The app supports Turso cloud database mode so records can be accessed from
multiple PCs. Credentials are intentionally not stored in Git.

For each PC, create this local config file:

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

Without cloud config, the app falls back to a local SQLite database.

## Development

From the native app folder:

```powershell
cd native-app
npm install
npm start
```

Run tests:

```powershell
npm test
```

Build the standalone Windows executable:

```powershell
npm run package:standalone
```

The standalone build output is:

```text
native-app\dist-electron\PAOFI-LP-Database-Standalone.exe
```

## Repository Layout

```text
.
|-- native-app/          Desktop database application
|-- *.js                 Original Google Apps Script files
|-- appsscript.json      Apps Script manifest
|-- .clasp.json          Apps Script project configuration
```

## Data Safety

- Turso credentials and local database files are ignored by Git.
- Deleted records move to the Record Bin before permanent removal.
- The app can export active and deleted records as a JSON backup.
