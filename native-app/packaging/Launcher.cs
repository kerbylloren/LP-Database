using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;

namespace PaofiLpDatabase
{
    internal static class Launcher
    {
        private const string AppFolderName = "PAOFI-LP-Database-Preview";
        private const string DataFolderName = "PAOFI-LP-Database-Data";
        private const string AppUrl = "http://127.0.0.1:3417/";

        [STAThread]
        private static int Main()
        {
            try
            {
                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string appRoot = Path.Combine(localAppData, AppFolderName);
                string dataRoot = Path.Combine(localAppData, DataFolderName);
                string appDir = Path.Combine(appRoot, "app");
                string nodeExe = Path.Combine(appRoot, "runtime", "node.exe");
                string serverFile = Path.Combine(appDir, "server.js");

                Directory.CreateDirectory(appRoot);
                Directory.CreateDirectory(dataRoot);

                ExtractPayload(appRoot);

                if (!File.Exists(nodeExe) || !File.Exists(serverFile))
                {
                    MessageBox.Show(
                        "The packaged PAOFI LP Database app is incomplete after extraction.",
                        "PAOFI LP Database",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return 1;
                }

                if (!ServerIsRunning())
                {
                    StartServer(nodeExe, serverFile, appDir, Path.Combine(dataRoot, "lp_database.sqlite"));
                    Thread.Sleep(1800);
                }

                Process.Start(new ProcessStartInfo(AppUrl) { UseShellExecute = true });
                return 0;
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    ex.Message,
                    "PAOFI LP Database",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                return 1;
            }
        }

        private static void ExtractPayload(string appRoot)
        {
            string tempZip = Path.Combine(Path.GetTempPath(), "paofi-lp-database-payload.zip");
            Assembly assembly = Assembly.GetExecutingAssembly();

            using (Stream resource = assembly.GetManifestResourceStream("payload.zip"))
            {
                if (resource == null)
                {
                    throw new InvalidOperationException("Embedded payload.zip was not found.");
                }

                using (FileStream output = File.Create(tempZip))
                {
                    resource.CopyTo(output);
                }
            }

            using (ZipArchive archive = ZipFile.OpenRead(tempZip))
            {
                foreach (ZipArchiveEntry entry in archive.Entries)
                {
                    string destination = Path.GetFullPath(Path.Combine(appRoot, entry.FullName));

                    if (!destination.StartsWith(appRoot, StringComparison.OrdinalIgnoreCase))
                    {
                        throw new InvalidOperationException("Unsafe path found in packaged payload.");
                    }

                    if (String.IsNullOrEmpty(entry.Name))
                    {
                        Directory.CreateDirectory(destination);
                        continue;
                    }

                    string directory = Path.GetDirectoryName(destination);
                    if (!String.IsNullOrEmpty(directory))
                    {
                        Directory.CreateDirectory(directory);
                    }

                    entry.ExtractToFile(destination, true);
                }
            }
        }

        private static bool ServerIsRunning()
        {
            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(AppUrl + "api/stats");
                request.Timeout = 500;

                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                {
                    return response.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        private static void StartServer(string nodeExe, string serverFile, string appDir, string dbPath)
        {
            ProcessStartInfo info = new ProcessStartInfo
            {
                FileName = nodeExe,
                Arguments = "\"" + serverFile + "\"",
                WorkingDirectory = appDir,
                UseShellExecute = false,
                CreateNoWindow = true,
                WindowStyle = ProcessWindowStyle.Hidden
            };

            info.EnvironmentVariables["LPDB_DB_PATH"] = dbPath;
            info.EnvironmentVariables["PORT"] = "3417";

            Process.Start(info);
        }
    }
}
