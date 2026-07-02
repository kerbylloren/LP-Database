# PAOFI Programs Database

A standalone Windows desktop database application for Payatas Orione Foundation
Inc. programs. The app is built with Electron and opens in its own application
window, not as an Edge or Chrome app-mode window.

The current production module focuses on the Livelihood Program. Future major
release lines will expand the same system to other PAOFI programs.

Download the Windows installer from the
[latest GitHub Release](https://github.com/kerbylloren/PAOFI-Database/releases/latest).

## Current Release

Latest version: `1.0.0`

The release includes:

- Windows x64 installer
- Auto-update metadata
- Differential update map

Users on supported builds can receive updates through the built-in auto-update
flow. Older builds should download and run the latest installer manually.

## Program Roadmap

The application will use major version lines to track PAOFI program modules:

- `0.x.x` - Livelihood Program foundation and database
- `1.x.x` - Nutrition Program / Supplemental Feeding section
- `2.x.x` - Scholarship Program section
- `3.x.x` - Health Program section

## Current Features

- Sign-in screen for app access
- Role-based access controls
- Cloud database support for use across multiple PCs
- Local fallback database support
- Livelihood beneficiary record editor and viewer
- Search page and full database table page
- Record Bin for deleted records
- Monitoring and reporting forms for monthly beneficiary progress
- Livelihood group analytics for Dishwashing, Sewing, and Rag Making
- Expanded database filters for beneficiary fields, search, and age range
- Summary analytics on the main dashboard and detailed analytics in database views
- Beneficiary-level monitoring summary in profiles and print output
- JSON export for backup

## Cloud Database

The app supports cloud database mode so records and user access can stay
consistent across approved devices. Runtime connection details are intentionally
not documented in this public README.

Without cloud configuration, the app can use a local database.

## Installation Notes

Run the installer from the latest release.

The installer preserves application data while removing old generated runtime or
duplicate files during install/update.

Microsoft Defender SmartScreen may still warn because the installer is unsigned.

## Development

The application source lives in:

```text
native-app/
```

Install dependencies:

```powershell
cd native-app
npm install
```

Run the local web server:

```powershell
npm start
```

Run the Electron desktop shell:

```powershell
npm run electron:dev
```

Run tests:

```powershell
npm test
```

Build the Windows x64 installer:

```powershell
npm run package:installer
```

## Public Release Builds

For public distribution, use a trusted Windows code-signing certificate.

## Repository Layout

```text
.
|-- native-app/          Electron desktop database application
|-- README.md            Repository overview shown on GitHub
```

## Data Safety

- Sensitive runtime files are not tracked by Git.
- Deleted beneficiary records move to the Record Bin.
- The app can export beneficiary and monitoring records as a JSON backup.
