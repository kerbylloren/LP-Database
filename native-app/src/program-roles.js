const PROGRAM_CODES = ["livelihood", "nutrition", "scholarship", "health", "administration"];

const PROGRAM_ROLES = [
  "program_officer",
  "finance",
  "program_assistant",
  "coordinator",
  "encoder",
  "viewer",
  "volunteer",
  "scholar"
];

const WORKSPACE_READ_ROLES = [
  "program_officer",
  "finance",
  "program_assistant",
  "coordinator",
  "encoder",
  "viewer"
];

const ROUTINE_WRITE_ROLES = ["program_officer", "program_assistant", "coordinator", "encoder"];
const FINANCE_WRITE_ROLES = ["program_officer", "finance", "program_assistant", "coordinator"];
const ARCHIVE_ROLES = ["program_officer"];
const FINANCE_ARCHIVE_ROLES = ["program_officer", "finance"];
const DASHBOARD_ONLY_ROLES = ["volunteer", "scholar"];

module.exports = {
  ARCHIVE_ROLES,
  DASHBOARD_ONLY_ROLES,
  FINANCE_ARCHIVE_ROLES,
  FINANCE_WRITE_ROLES,
  PROGRAM_CODES,
  PROGRAM_ROLES,
  ROUTINE_WRITE_ROLES,
  WORKSPACE_READ_ROLES
};
