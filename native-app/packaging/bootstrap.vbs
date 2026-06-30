Option Explicit

Dim shell, fso, tempDir, payloadZip, appRoot, dataRoot, appDir, nodeExe, serverFile, psCommand, runCommand

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

tempDir = fso.GetParentFolderName(WScript.ScriptFullName)
payloadZip = tempDir & "\payload.zip"
appRoot = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\PAOFI-LP-Database-Preview"
dataRoot = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\PAOFI-LP-Database-Data"
appDir = appRoot & "\app"
nodeExe = appRoot & "\runtime\node.exe"
serverFile = appDir & "\server.js"

If Not fso.FileExists(payloadZip) Then
  MsgBox "The packaged app payload was not found.", vbCritical, "PAOFI LP Database"
  WScript.Quit 1
End If

If Not fso.FolderExists(appRoot) Then fso.CreateFolder(appRoot)
If Not fso.FolderExists(dataRoot) Then fso.CreateFolder(dataRoot)

psCommand = "powershell.exe -NoProfile -ExecutionPolicy Bypass -Command " & _
  Chr(34) & "Expand-Archive -LiteralPath '" & Replace(payloadZip, "'", "''") & _
  "' -DestinationPath '" & Replace(appRoot, "'", "''") & "' -Force" & Chr(34)

If shell.Run(psCommand, 0, True) <> 0 Then
  MsgBox "The packaged app could not be extracted.", vbCritical, "PAOFI LP Database"
  WScript.Quit 1
End If

If Not fso.FileExists(nodeExe) Or Not fso.FileExists(serverFile) Then
  MsgBox "The packaged app is incomplete after extraction.", vbCritical, "PAOFI LP Database"
  WScript.Quit 1
End If

shell.Environment("PROCESS")("LPDB_DB_PATH") = dataRoot & "\lp_database.sqlite"
shell.Environment("PROCESS")("PORT") = "3417"
shell.CurrentDirectory = appDir

runCommand = Chr(34) & nodeExe & Chr(34) & " " & Chr(34) & serverFile & Chr(34)
shell.Run runCommand, 0, False
WScript.Sleep 1500
shell.Run "http://127.0.0.1:3417/", 1, False
