# PAOFI Livelihood Program Database

A standalone Windows database application for the Payatas Orione Foundation
Inc. Livelihood Program. The app stores records in Turso cloud database mode
for multi-PC access and can fall back to a local SQLite database when no cloud
config is present.

## App Source

The application lives in:

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

Download the Windows installer from the
[latest GitHub Release](https://github.com/kerbylloren/LP-Database/releases/latest).

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

Build the Windows x64 installer:

```powershell
npm run package:installer
```

For public distribution, sign the installer with a trusted Windows code-signing
certificate issued to `Kerby Lloren`. Microsoft Defender SmartScreen warnings
cannot be reliably removed with package metadata alone.

```powershell
$env:CSC_LINK = "C:\path\to\kerby-lloren-code-signing.pfx"
$env:CSC_KEY_PASSWORD = "<certificate-password>"
npm run package:installer
Get-AuthenticodeSignature .\dist-electron\PAOFI-LP-Database-Setup-0.1.1-x64.exe
```

The installer output is:

```text
native-app\dist-electron\PAOFI-LP-Database-Setup-0.1.1-x64.exe
```

The portable standalone build output is:

```text
native-app\dist-electron\PAOFI-LP-Database-Standalone-0.1.1-x64.exe
```

## Repository Layout

```text
.
|-- native-app/          Electron desktop database application
|-- README.md            Repository overview
```

## Data Safety

- Turso credentials and local database files are ignored by Git.
- Deleted records move to the Record Bin before permanent removal.
- The app can export active and deleted records as a JSON backup.
