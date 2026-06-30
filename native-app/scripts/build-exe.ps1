$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$distDir = Join-Path $root "dist"
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) "lpdb-exe-build"
$buildDir = $tempRoot
$payloadDir = Join-Path $buildDir "payload"
$outputExe = Join-Path $distDir "PAOFI-LP-Database-Preview.exe"

function Resolve-FullPath($Path) {
  $executionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Path)
}

function Assert-UnderRoot($Path, $RootPath) {
  $fullPath = Resolve-FullPath $Path
  $fullRoot = Resolve-FullPath $RootPath

  if (-not $fullPath.StartsWith($fullRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to operate outside project root: $fullPath"
  }
}

Assert-UnderRoot $distDir $root
Assert-UnderRoot $outputExe $root
Assert-UnderRoot $buildDir ([System.IO.Path]::GetTempPath())
Assert-UnderRoot $payloadDir ([System.IO.Path]::GetTempPath())

if (Test-Path $buildDir) {
  Remove-Item -LiteralPath $buildDir -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $payloadDir, $distDir | Out-Null

$payloadAppDir = Join-Path $payloadDir "app"
$payloadRuntimeDir = Join-Path $payloadDir "runtime"
New-Item -ItemType Directory -Force -Path $payloadAppDir, $payloadRuntimeDir | Out-Null

Copy-Item -LiteralPath (Join-Path $root "server.js") -Destination $payloadAppDir -Force
Copy-Item -LiteralPath (Join-Path $root "package.json") -Destination $payloadAppDir -Force
Copy-Item -LiteralPath (Join-Path $root "README.md") -Destination $payloadAppDir -Force
Copy-Item -LiteralPath (Join-Path $root "public") -Destination $payloadAppDir -Recurse -Force
Copy-Item -LiteralPath (Join-Path $root "src") -Destination $payloadAppDir -Recurse -Force

$nodeCommand = Get-Command "node.exe" -ErrorAction Stop
Copy-Item -LiteralPath $nodeCommand.Source -Destination (Join-Path $payloadRuntimeDir "node.exe") -Force

$payloadZip = Join-Path $buildDir "payload.zip"
Compress-Archive -Path (Join-Path $payloadDir "*") -DestinationPath $payloadZip -Force

$cscCandidates = @(
  "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\csc.exe",
  "$env:WINDIR\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)
$csc = $cscCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $csc) {
  throw "Could not find the .NET Framework C# compiler."
}

$frameworkDir = Split-Path -Parent $csc
$launcherSource = Join-Path $root "packaging\Launcher.cs"
$compressionRef = Join-Path $frameworkDir "System.IO.Compression.dll"
$fileSystemRef = Join-Path $frameworkDir "System.IO.Compression.FileSystem.dll"
$formsRef = Join-Path $frameworkDir "System.Windows.Forms.dll"

& $csc `
  /nologo `
  /target:winexe `
  /out:$outputExe `
  /resource:$payloadZip,payload.zip `
  /reference:$compressionRef `
  /reference:$fileSystemRef `
  /reference:$formsRef `
  $launcherSource

if ($LASTEXITCODE -ne 0) {
  throw "C# launcher compilation failed with exit code $LASTEXITCODE."
}

if (-not (Test-Path $outputExe)) {
  throw "Compiler did not create the expected EXE: $outputExe"
}

$hash = Get-FileHash -LiteralPath $outputExe -Algorithm SHA256
[PSCustomObject]@{
  ExePath = $outputExe
  SizeBytes = (Get-Item -LiteralPath $outputExe).Length
  Sha256 = $hash.Hash
}
