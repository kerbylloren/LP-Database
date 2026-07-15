const { PROGRAM_ROLES: SCHOLARSHIP_ROLES } = require("./program-roles");
const SCHOLARSHIP_PROGRAM_CODE = "scholarship";
const SCHOLARSHIP_CHAPELS = [
  ["ASCENSION", "Ascension"],
  ["BENEDICT", "Benedict"],
  ["CENTER", "Center"],
  ["FATIMA", "Fatima"],
  ["IMMACULATE", "Immaculate"],
  ["LITEX", "Litex"],
  ["LOURDES", "Lourdes"],
  ["MOLAVE", "Molave"],
  ["NAZARENO", "Nazareno"],
  ["SAGRADA", "Sagrada"],
  ["SAN_ISIDRO", "San Isidro"],
  ["STO_NINO", "Sto. Nino"],
  ["STA_CRUZ", "Sta. Cruz"]
];

const SCHOLARSHIP_ATTENDANCE_TYPES = [
  { value: "Mass", participant_scope: "Scholar and Parent" },
  { value: "Activities", participant_scope: "Scholar" },
  { value: "Cleaning", participant_scope: "Parent" },
  { value: "Tutorial", participant_scope: "Scholar" },
  { value: "Community Service", participant_scope: "Scholar" }
];

const SCHOLARSHIP_REQUIREMENT_STATUSES = ["Missing", "Passed", "Sent to ANCOP", "Late", "Exempted"];
const SCHOLARSHIP_RENEWAL_DECISIONS = ["Pass", "Terminated", "Warning", "Pending", "Graduating", "Withdrawn"];

const SCHOLARSHIP_ARCHIVE_MIGRATION_KEY = "scholarship-soft-delete-v1";
const SCHOLARSHIP_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS app_schema_migrations (
    migration_key TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS app_user_program_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    program_code TEXT NOT NULL,
    role_code TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, program_code, role_code),
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
  )`,
  "CREATE INDEX IF NOT EXISTS idx_program_roles_user ON app_user_program_roles(user_id, program_code)",
  `CREATE TABLE IF NOT EXISTS scholarship_chapels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapel_code TEXT NOT NULL UNIQUE,
    chapel_name TEXT NOT NULL UNIQUE,
    coordinator_name TEXT NOT NULL DEFAULT '',
    assistant_coordinator_name TEXT NOT NULL DEFAULT '',
    coordinator_contact TEXT NOT NULL DEFAULT '',
    assistant_contact TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Active',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_chapels_status ON scholarship_chapels(status, chapel_name)",
  `CREATE TABLE IF NOT EXISTS scholarship_scholars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scholar_no TEXT NOT NULL DEFAULT '',
    picture_data TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    first_name TEXT NOT NULL DEFAULT '',
    middle_name TEXT NOT NULL DEFAULT '',
    birth_date TEXT NOT NULL DEFAULT '',
    place_of_birth TEXT NOT NULL DEFAULT '',
    gender TEXT NOT NULL DEFAULT '',
    contact_no TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    chapel_id INTEGER,
    hobbies TEXT NOT NULL DEFAULT '',
    ambition TEXT NOT NULL DEFAULT '',
    special_circumstances TEXT NOT NULL DEFAULT '',
    other_income_source TEXT NOT NULL DEFAULT '',
    birth_order TEXT NOT NULL DEFAULT '',
    total_siblings INTEGER NOT NULL DEFAULT 0,
    married_siblings INTEGER NOT NULL DEFAULT 0,
    household_contribution REAL NOT NULL DEFAULT 0,
    guardian_name TEXT NOT NULL DEFAULT '',
    guardian_relationship TEXT NOT NULL DEFAULT '',
    guardian_contact TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Active',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarship_scholars_no ON scholarship_scholars(scholar_no) WHERE scholar_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_scholarship_scholars_name ON scholarship_scholars(last_name, first_name, middle_name)",
  "CREATE INDEX IF NOT EXISTS idx_scholarship_scholars_status ON scholarship_scholars(status)",
  `CREATE TABLE IF NOT EXISTS scholarship_household_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scholar_id INTEGER NOT NULL,
    row_order INTEGER NOT NULL DEFAULT 0,
    member_name TEXT NOT NULL DEFAULT '',
    relationship TEXT NOT NULL DEFAULT '',
    birth_date TEXT NOT NULL DEFAULT '',
    age TEXT NOT NULL DEFAULT '',
    gender TEXT NOT NULL DEFAULT '',
    civil_status TEXT NOT NULL DEFAULT '',
    education_attainment TEXT NOT NULL DEFAULT '',
    occupation TEXT NOT NULL DEFAULT '',
    school TEXT NOT NULL DEFAULT '',
    monthly_income REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (scholar_id) REFERENCES scholarship_scholars(id) ON DELETE CASCADE
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_household_scholar ON scholarship_household_members(scholar_id)",
  `CREATE TABLE IF NOT EXISTS scholarship_academic_years (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    start_date TEXT NOT NULL DEFAULT '',
    end_date TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Planned',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarship_year_label ON scholarship_academic_years(label)",
  `CREATE TABLE IF NOT EXISTS scholarship_academic_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    academic_year_id INTEGER NOT NULL,
    period_name TEXT NOT NULL,
    period_type TEXT NOT NULL DEFAULT 'Custom',
    period_order INTEGER NOT NULL DEFAULT 0,
    start_date TEXT NOT NULL DEFAULT '',
    end_date TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(academic_year_id, period_name),
    FOREIGN KEY (academic_year_id) REFERENCES scholarship_academic_years(id) ON DELETE CASCADE
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_period_year ON scholarship_academic_periods(academic_year_id, period_order)",
  `CREATE TABLE IF NOT EXISTS scholarship_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scholar_id INTEGER NOT NULL,
    academic_year_id INTEGER NOT NULL,
    school_name TEXT NOT NULL DEFAULT '',
    education_level TEXT NOT NULL DEFAULT '',
    grade_or_year TEXT NOT NULL DEFAULT '',
    course TEXT NOT NULL DEFAULT '',
    scholarship_category TEXT NOT NULL DEFAULT '',
    admission_date TEXT NOT NULL DEFAULT '',
    scholarship_status TEXT NOT NULL DEFAULT 'Active',
    renewal_status TEXT NOT NULL DEFAULT 'Not Started',
    coverage_status TEXT NOT NULL DEFAULT 'Unassigned',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(scholar_id, academic_year_id),
    FOREIGN KEY (scholar_id) REFERENCES scholarship_scholars(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES scholarship_academic_years(id) ON DELETE RESTRICT
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_enrollment_year ON scholarship_enrollments(academic_year_id, scholarship_status)",
  "CREATE INDEX IF NOT EXISTS idx_scholarship_enrollment_scholar ON scholarship_enrollments(scholar_id)",
  `CREATE TABLE IF NOT EXISTS scholarship_sponsors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sponsor_no TEXT NOT NULL DEFAULT '',
    sponsor_type TEXT NOT NULL DEFAULT 'Individual',
    sponsor_name TEXT NOT NULL DEFAULT '',
    contact_person TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    contact_no TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    consent_status TEXT NOT NULL DEFAULT 'Not Recorded',
    communication_preference TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Active',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarship_sponsors_no ON scholarship_sponsors(sponsor_no) WHERE sponsor_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_scholarship_sponsors_name ON scholarship_sponsors(sponsor_name)",
  `CREATE TABLE IF NOT EXISTS scholarship_sponsorships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sponsor_id INTEGER NOT NULL,
    enrollment_id INTEGER NOT NULL,
    start_date TEXT NOT NULL DEFAULT '',
    end_date TEXT NOT NULL DEFAULT '',
    commitment_amount_php REAL NOT NULL DEFAULT 0,
    frequency TEXT NOT NULL DEFAULT 'Annual',
    status TEXT NOT NULL DEFAULT 'Active',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(sponsor_id, enrollment_id),
    FOREIGN KEY (sponsor_id) REFERENCES scholarship_sponsors(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES scholarship_enrollments(id) ON DELETE CASCADE
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_sponsorship_enrollment ON scholarship_sponsorships(enrollment_id)",
  `CREATE TABLE IF NOT EXISTS scholarship_pledges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pledge_no TEXT NOT NULL DEFAULT '',
    sponsor_id INTEGER NOT NULL,
    sponsorship_id INTEGER,
    scholar_id INTEGER,
    enrollment_id INTEGER,
    pledge_date TEXT NOT NULL DEFAULT '',
    due_date TEXT NOT NULL DEFAULT '',
    purpose_type TEXT NOT NULL DEFAULT 'Unrestricted',
    frequency TEXT NOT NULL DEFAULT 'One-time',
    amount_php REAL NOT NULL DEFAULT 0,
    source_currency TEXT NOT NULL DEFAULT 'PHP',
    source_amount REAL NOT NULL DEFAULT 0,
    exchange_rate REAL NOT NULL DEFAULT 1,
    conversion_date TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Open',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (sponsor_id) REFERENCES scholarship_sponsors(id) ON DELETE RESTRICT,
    FOREIGN KEY (sponsorship_id) REFERENCES scholarship_sponsorships(id) ON DELETE SET NULL,
    FOREIGN KEY (scholar_id) REFERENCES scholarship_scholars(id) ON DELETE SET NULL,
    FOREIGN KEY (enrollment_id) REFERENCES scholarship_enrollments(id) ON DELETE SET NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarship_pledges_no ON scholarship_pledges(pledge_no) WHERE pledge_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_scholarship_pledges_sponsor ON scholarship_pledges(sponsor_id, status)",
  `CREATE TABLE IF NOT EXISTS scholarship_invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_no TEXT NOT NULL DEFAULT '',
    sponsor_id INTEGER NOT NULL,
    pledge_id INTEGER,
    issue_date TEXT NOT NULL DEFAULT '',
    due_date TEXT NOT NULL DEFAULT '',
    amount_php REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Draft',
    notes TEXT NOT NULL DEFAULT '',
    reissued_from_id INTEGER,
    voided_at TEXT NOT NULL DEFAULT '',
    voided_by INTEGER,
    void_reason TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (sponsor_id) REFERENCES scholarship_sponsors(id) ON DELETE RESTRICT,
    FOREIGN KEY (pledge_id) REFERENCES scholarship_pledges(id) ON DELETE SET NULL,
    FOREIGN KEY (reissued_from_id) REFERENCES scholarship_invoices(id) ON DELETE SET NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarship_invoice_no ON scholarship_invoices(invoice_no) WHERE invoice_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_scholarship_invoices_sponsor ON scholarship_invoices(sponsor_id, status)",
  `CREATE TABLE IF NOT EXISTS scholarship_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_no TEXT NOT NULL DEFAULT '',
    sponsor_id INTEGER NOT NULL,
    pledge_id INTEGER,
    invoice_id INTEGER,
    payment_date TEXT NOT NULL DEFAULT '',
    amount_php REAL NOT NULL DEFAULT 0,
    source_currency TEXT NOT NULL DEFAULT 'PHP',
    source_amount REAL NOT NULL DEFAULT 0,
    exchange_rate REAL NOT NULL DEFAULT 1,
    conversion_date TEXT NOT NULL DEFAULT '',
    payment_method TEXT NOT NULL DEFAULT '',
    reference_no TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pending',
    notes TEXT NOT NULL DEFAULT '',
    reversed_at TEXT NOT NULL DEFAULT '',
    reversed_by INTEGER,
    reversal_reason TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (sponsor_id) REFERENCES scholarship_sponsors(id) ON DELETE RESTRICT,
    FOREIGN KEY (pledge_id) REFERENCES scholarship_pledges(id) ON DELETE SET NULL,
    FOREIGN KEY (invoice_id) REFERENCES scholarship_invoices(id) ON DELETE SET NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarship_payment_no ON scholarship_payments(payment_no) WHERE payment_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_scholarship_payments_sponsor ON scholarship_payments(sponsor_id, status)",
  `CREATE TABLE IF NOT EXISTS scholarship_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_no TEXT NOT NULL DEFAULT '',
    payment_id INTEGER NOT NULL,
    issue_date TEXT NOT NULL DEFAULT '',
    amount_php REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Draft',
    notes TEXT NOT NULL DEFAULT '',
    reissued_from_id INTEGER,
    voided_at TEXT NOT NULL DEFAULT '',
    voided_by INTEGER,
    void_reason TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (payment_id) REFERENCES scholarship_payments(id) ON DELETE RESTRICT,
    FOREIGN KEY (reissued_from_id) REFERENCES scholarship_receipts(id) ON DELETE SET NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarship_receipt_no ON scholarship_receipts(receipt_no) WHERE receipt_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_scholarship_receipt_payment ON scholarship_receipts(payment_id, status)",
  `CREATE TABLE IF NOT EXISTS scholarship_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER NOT NULL,
    scholar_id INTEGER,
    enrollment_id INTEGER,
    allocation_date TEXT NOT NULL DEFAULT '',
    allocation_type TEXT NOT NULL DEFAULT 'Unrestricted',
    purpose TEXT NOT NULL DEFAULT '',
    amount_php REAL NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (payment_id) REFERENCES scholarship_payments(id) ON DELETE CASCADE,
    FOREIGN KEY (scholar_id) REFERENCES scholarship_scholars(id) ON DELETE SET NULL,
    FOREIGN KEY (enrollment_id) REFERENCES scholarship_enrollments(id) ON DELETE SET NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_allocations_payment ON scholarship_allocations(payment_id)",
  `CREATE TABLE IF NOT EXISTS scholarship_document_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    effective_year INTEGER NOT NULL UNIQUE,
    organization_name TEXT NOT NULL DEFAULT 'Payatas Orione Foundation Inc.',
    registered_address TEXT NOT NULL DEFAULT '',
    tax_identifier TEXT NOT NULL DEFAULT '',
    contact_details TEXT NOT NULL DEFAULT '',
    service_invoice_prefix TEXT NOT NULL DEFAULT 'SI',
    official_receipt_prefix TEXT NOT NULL DEFAULT 'OR',
    invoice_serial_start INTEGER NOT NULL DEFAULT 1,
    invoice_serial_end INTEGER NOT NULL DEFAULT 999999,
    receipt_serial_start INTEGER NOT NULL DEFAULT 1,
    receipt_serial_end INTEGER NOT NULL DEFAULT 999999,
    accountant_approved INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Draft',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_document_settings_status ON scholarship_document_settings(status, effective_year)",
  `CREATE TABLE IF NOT EXISTS scholarship_document_sequences (
    document_type TEXT NOT NULL,
    document_year INTEGER NOT NULL,
    prefix TEXT NOT NULL,
    next_number INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (document_type, document_year)
  )`,
  `CREATE TABLE IF NOT EXISTS scholarship_grade_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER NOT NULL,
    academic_period_id INTEGER NOT NULL,
    subject_name TEXT NOT NULL,
    subject_order INTEGER NOT NULL DEFAULT 0,
    grading_scale TEXT NOT NULL DEFAULT 'Percentage',
    grade_value TEXT NOT NULL DEFAULT '',
    numeric_value REAL,
    credit_units REAL,
    standardized_score REAL,
    remarks TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Recorded',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(enrollment_id, academic_period_id, subject_name),
    FOREIGN KEY (enrollment_id) REFERENCES scholarship_enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_period_id) REFERENCES scholarship_academic_periods(id) ON DELETE CASCADE
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_grades_enrollment ON scholarship_grade_records(enrollment_id, academic_period_id)",
  `CREATE TABLE IF NOT EXISTS scholarship_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_title TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'PAOFI Activity',
    participant_scope TEXT NOT NULL DEFAULT 'Scholar',
    academic_year_id INTEGER,
    chapel_id INTEGER,
    event_date TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    required INTEGER NOT NULL DEFAULT 1,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_events_date ON scholarship_events(event_date)",
  `CREATE TABLE IF NOT EXISTS scholarship_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    scholar_id INTEGER NOT NULL,
    enrollment_id INTEGER,
    attendance_status TEXT NOT NULL DEFAULT 'Absent',
    remarks TEXT NOT NULL DEFAULT '',
    recorded_by INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(event_id, scholar_id),
    FOREIGN KEY (event_id) REFERENCES scholarship_events(id) ON DELETE CASCADE,
    FOREIGN KEY (scholar_id) REFERENCES scholarship_scholars(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES scholarship_enrollments(id) ON DELETE SET NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_attendance_scholar ON scholarship_attendance(scholar_id, attendance_status)",
  `CREATE TABLE IF NOT EXISTS scholarship_guardian_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    scholar_id INTEGER NOT NULL,
    enrollment_id INTEGER,
    guardian_name TEXT NOT NULL DEFAULT '',
    attendance_status TEXT NOT NULL DEFAULT 'Absent',
    remarks TEXT NOT NULL DEFAULT '',
    recorded_by INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(event_id, scholar_id),
    FOREIGN KEY (event_id) REFERENCES scholarship_events(id) ON DELETE CASCADE,
    FOREIGN KEY (scholar_id) REFERENCES scholarship_scholars(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES scholarship_enrollments(id) ON DELETE SET NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_guardian_attendance ON scholarship_guardian_attendance(scholar_id, attendance_status)",
  `CREATE TABLE IF NOT EXISTS scholarship_renewal_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT NOT NULL,
    academic_year_id INTEGER,
    education_level TEXT NOT NULL DEFAULT 'All',
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'Draft',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(template_name, version),
    FOREIGN KEY (academic_year_id) REFERENCES scholarship_academic_years(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS scholarship_renewal_template_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    row_order INTEGER NOT NULL DEFAULT 0,
    requirement_code TEXT NOT NULL DEFAULT '',
    item_label TEXT NOT NULL,
    quarter_group TEXT NOT NULL DEFAULT 'General',
    applicability TEXT NOT NULL DEFAULT 'All',
    deadline TEXT NOT NULL DEFAULT '',
    required INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (template_id) REFERENCES scholarship_renewal_templates(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS scholarship_renewals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER NOT NULL,
    template_id INTEGER NOT NULL,
    due_date TEXT NOT NULL DEFAULT '',
    submitted_date TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Not Started',
    notes TEXT NOT NULL DEFAULT '',
    approved_at TEXT NOT NULL DEFAULT '',
    approved_by INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(enrollment_id, template_id),
    FOREIGN KEY (enrollment_id) REFERENCES scholarship_enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES scholarship_renewal_templates(id) ON DELETE RESTRICT
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_renewals_status ON scholarship_renewals(status, due_date)",
  `CREATE TABLE IF NOT EXISTS scholarship_renewal_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    renewal_id INTEGER NOT NULL,
    template_item_id INTEGER NOT NULL,
    deadline TEXT NOT NULL DEFAULT '',
    item_status TEXT NOT NULL DEFAULT 'Pending',
    status_date TEXT NOT NULL DEFAULT '',
    document_url TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    verified_at TEXT NOT NULL DEFAULT '',
    verified_by INTEGER,
    UNIQUE(renewal_id, template_item_id),
    FOREIGN KEY (renewal_id) REFERENCES scholarship_renewals(id) ON DELETE CASCADE,
    FOREIGN KEY (template_item_id) REFERENCES scholarship_renewal_template_items(id) ON DELETE RESTRICT
  )`,
  `CREATE TABLE IF NOT EXISTS scholarship_evaluation_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT NOT NULL,
    academic_year_id INTEGER,
    education_level TEXT NOT NULL DEFAULT 'All',
    version INTEGER NOT NULL DEFAULT 1,
    scale_min REAL NOT NULL DEFAULT 1,
    scale_max REAL NOT NULL DEFAULT 5,
    status TEXT NOT NULL DEFAULT 'Draft',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(template_name, version),
    FOREIGN KEY (academic_year_id) REFERENCES scholarship_academic_years(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS scholarship_evaluation_criteria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    row_order INTEGER NOT NULL DEFAULT 0,
    criterion_label TEXT NOT NULL,
    weight REAL NOT NULL DEFAULT 1,
    FOREIGN KEY (template_id) REFERENCES scholarship_evaluation_templates(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS scholarship_evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER NOT NULL,
    template_id INTEGER NOT NULL,
    evaluation_date TEXT NOT NULL DEFAULT '',
    evaluator_id INTEGER,
    status TEXT NOT NULL DEFAULT 'Draft',
    overall_score REAL NOT NULL DEFAULT 0,
    narrative TEXT NOT NULL DEFAULT '',
    recommendations TEXT NOT NULL DEFAULT '',
    revision_of_id INTEGER,
    approved_at TEXT NOT NULL DEFAULT '',
    approved_by INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (enrollment_id) REFERENCES scholarship_enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES scholarship_evaluation_templates(id) ON DELETE RESTRICT,
    FOREIGN KEY (revision_of_id) REFERENCES scholarship_evaluations(id) ON DELETE SET NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_evaluations_enrollment ON scholarship_evaluations(enrollment_id, evaluation_date)",
  `CREATE TABLE IF NOT EXISTS scholarship_renewal_evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    renewal_id INTEGER NOT NULL UNIQUE,
    report_card_score REAL NOT NULL DEFAULT 0,
    tutorial_activities_score REAL NOT NULL DEFAULT 0,
    parent_service_score REAL NOT NULL DEFAULT 0,
    compliance_score REAL NOT NULL DEFAULT 0,
    mass_score REAL NOT NULL DEFAULT 0,
    adjustment_score REAL NOT NULL DEFAULT 0,
    overall_rating REAL NOT NULL DEFAULT 0,
    ranking INTEGER,
    numerical_evaluation TEXT NOT NULL DEFAULT 'Pending',
    coordinator_evaluation TEXT NOT NULL DEFAULT 'Pending',
    education_team_evaluation TEXT NOT NULL DEFAULT 'Pending',
    overall_evaluation TEXT NOT NULL DEFAULT 'Pending',
    coordinator_remarks TEXT NOT NULL DEFAULT '',
    education_team_remarks TEXT NOT NULL DEFAULT '',
    remarks TEXT NOT NULL DEFAULT '',
    calculated_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (renewal_id) REFERENCES scholarship_renewals(id) ON DELETE CASCADE
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_renewal_evaluation_result ON scholarship_renewal_evaluations(overall_evaluation, numerical_evaluation)",
  `CREATE TABLE IF NOT EXISTS scholarship_evaluation_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evaluation_id INTEGER NOT NULL,
    criterion_id INTEGER NOT NULL,
    score REAL NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    UNIQUE(evaluation_id, criterion_id),
    FOREIGN KEY (evaluation_id) REFERENCES scholarship_evaluations(id) ON DELETE CASCADE,
    FOREIGN KEY (criterion_id) REFERENCES scholarship_evaluation_criteria(id) ON DELETE RESTRICT
  )`,
  `CREATE TABLE IF NOT EXISTS scholarship_document_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    document_type TEXT NOT NULL DEFAULT '',
    label TEXT NOT NULL DEFAULT '',
    document_url TEXT NOT NULL,
    verified_at TEXT NOT NULL DEFAULT '',
    verified_by INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_document_entity ON scholarship_document_links(entity_type, entity_id)",
  `CREATE TABLE IF NOT EXISTS scholarship_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    summary TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_audit_created ON scholarship_audit_log(created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_scholarship_audit_entity ON scholarship_audit_log(entity_type, entity_id)"
];

const SCHOLARSHIP_MIGRATION_STATEMENTS = [
  "ALTER TABLE scholarship_scholars ADD COLUMN chapel_id INTEGER",
  "ALTER TABLE scholarship_scholars ADD COLUMN place_of_birth TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE scholarship_scholars ADD COLUMN hobbies TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE scholarship_scholars ADD COLUMN ambition TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE scholarship_scholars ADD COLUMN special_circumstances TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE scholarship_scholars ADD COLUMN other_income_source TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE scholarship_scholars ADD COLUMN birth_order TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE scholarship_scholars ADD COLUMN total_siblings INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE scholarship_scholars ADD COLUMN married_siblings INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE scholarship_scholars ADD COLUMN household_contribution REAL NOT NULL DEFAULT 0",
  "ALTER TABLE scholarship_enrollments ADD COLUMN scholarship_category TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE scholarship_household_members ADD COLUMN gender TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE scholarship_household_members ADD COLUMN civil_status TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE scholarship_household_members ADD COLUMN education_attainment TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE scholarship_household_members ADD COLUMN monthly_income REAL NOT NULL DEFAULT 0",
  "ALTER TABLE scholarship_grade_records ADD COLUMN subject_order INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE scholarship_grade_records ADD COLUMN credit_units REAL",
  "ALTER TABLE scholarship_grade_records ADD COLUMN standardized_score REAL",
  "ALTER TABLE scholarship_events ADD COLUMN participant_scope TEXT NOT NULL DEFAULT 'Scholar'",
  "ALTER TABLE scholarship_events ADD COLUMN academic_year_id INTEGER",
  "ALTER TABLE scholarship_events ADD COLUMN chapel_id INTEGER",
  "ALTER TABLE scholarship_renewal_template_items ADD COLUMN requirement_code TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE scholarship_renewal_template_items ADD COLUMN quarter_group TEXT NOT NULL DEFAULT 'General'",
  "ALTER TABLE scholarship_renewal_template_items ADD COLUMN applicability TEXT NOT NULL DEFAULT 'All'",
  "ALTER TABLE scholarship_renewal_template_items ADD COLUMN deadline TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE scholarship_renewal_responses ADD COLUMN deadline TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE scholarship_renewal_responses ADD COLUMN status_date TEXT NOT NULL DEFAULT ''"
];

const SCHOLARSHIP_POST_MIGRATION_STATEMENTS = [
  `UPDATE scholarship_renewal_template_items
   SET deadline = COALESCE(
     NULLIF((
       SELECT MAX(r.due_date)
       FROM scholarship_renewals r
       WHERE r.template_id = scholarship_renewal_template_items.template_id
         AND r.due_date <> ''
     ), ''),
     NULLIF((
       SELECT y.end_date
       FROM scholarship_renewal_templates t
       LEFT JOIN scholarship_academic_years y ON y.id = t.academic_year_id
       WHERE t.id = scholarship_renewal_template_items.template_id
     ), ''),
     NULLIF((
       SELECT CASE
         WHEN instr(t.template_name, '20') > 0
          AND substr(t.template_name, instr(t.template_name, '20') + 4, 1) = '-'
         THEN substr(t.template_name, instr(t.template_name, '20') + 5, 4) || '-05-31'
         ELSE ''
       END
       FROM scholarship_renewal_templates t
       WHERE t.id = scholarship_renewal_template_items.template_id
     ), ''),
     ''
   )
   WHERE deadline = ''`,
  `UPDATE scholarship_renewal_responses
   SET deadline = COALESCE(
     NULLIF((SELECT i.deadline FROM scholarship_renewal_template_items i WHERE i.id = scholarship_renewal_responses.template_item_id), ''),
     NULLIF((SELECT r.due_date FROM scholarship_renewals r WHERE r.id = scholarship_renewal_responses.renewal_id), ''),
     ''
   )
   WHERE deadline = ''`,
  `UPDATE scholarship_renewals
   SET due_date = COALESCE((
     SELECT MAX(NULLIF(rr.deadline, ''))
     FROM scholarship_renewal_responses rr
     WHERE rr.renewal_id = scholarship_renewals.id
   ), '')`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_renewal_response_deadline ON scholarship_renewal_responses(deadline, item_status)"
];

const ENTITY_DEFINITIONS = {
  chapels: {
    table: "scholarship_chapels",
    fields: ["chapel_code", "chapel_name", "coordinator_name", "assistant_coordinator_name", "coordinator_contact", "assistant_contact", "status", "notes"],
    required: ["chapel_code", "chapel_name"],
    search: ["chapel_code", "chapel_name", "coordinator_name", "assistant_coordinator_name"],
    filters: ["status"],
    order: "chapel_name, id"
  },
  scholars: {
    table: "scholarship_scholars",
    fields: ["scholar_no", "picture_data", "last_name", "first_name", "middle_name", "birth_date", "place_of_birth", "gender", "contact_no", "email", "address", "chapel_id", "hobbies", "ambition", "special_circumstances", "other_income_source", "birth_order", "total_siblings", "married_siblings", "household_contribution", "guardian_name", "guardian_relationship", "guardian_contact", "status", "notes"],
    required: ["last_name", "first_name"],
    search: ["scholar_no", "last_name", "first_name", "middle_name", "place_of_birth", "address", "hobbies", "ambition", "special_circumstances", "guardian_name"],
    filters: ["status", "gender", "chapel_id", "birth_order"],
    order: "last_name, first_name, middle_name, id",
    number: { field: "scholar_no", prefix: "SCH" }
  },
  academicYears: {
    table: "scholarship_academic_years",
    fields: ["label", "start_date", "end_date", "status"],
    required: ["label"],
    search: ["label", "status"],
    filters: ["status"],
    order: "start_date DESC, label DESC, id DESC"
  },
  academicPeriods: {
    table: "scholarship_academic_periods",
    fields: ["academic_year_id", "period_name", "period_type", "period_order", "start_date", "end_date"],
    required: ["academic_year_id", "period_name"],
    search: ["period_name", "period_type"],
    filters: ["academic_year_id", "period_type"],
    order: "academic_year_id DESC, period_order, id"
  },
  enrollments: {
    table: "scholarship_enrollments",
    fields: ["scholar_id", "academic_year_id", "school_name", "education_level", "grade_or_year", "course", "scholarship_category", "admission_date", "scholarship_status", "renewal_status", "coverage_status", "notes"],
    required: ["scholar_id", "academic_year_id", "education_level"],
    search: ["school_name", "education_level", "grade_or_year", "course", "scholarship_category", "scholarship_status"],
    filters: ["scholar_id", "academic_year_id", "education_level", "scholarship_category", "scholarship_status", "renewal_status", "coverage_status"],
    order: "academic_year_id DESC, id DESC"
  },
  sponsors: {
    table: "scholarship_sponsors",
    fields: ["sponsor_no", "sponsor_type", "sponsor_name", "contact_person", "email", "contact_no", "address", "consent_status", "communication_preference", "status", "notes"],
    required: ["sponsor_name"],
    search: ["sponsor_no", "sponsor_name", "contact_person", "email", "contact_no"],
    filters: ["sponsor_type", "status", "consent_status"],
    order: "sponsor_name, id",
    number: { field: "sponsor_no", prefix: "SPN" }
  },
  sponsorships: {
    table: "scholarship_sponsorships",
    fields: ["sponsor_id", "enrollment_id", "start_date", "end_date", "commitment_amount_php", "frequency", "status", "notes"],
    required: ["sponsor_id", "enrollment_id"],
    search: ["frequency", "status", "notes"],
    filters: ["sponsor_id", "enrollment_id", "status", "frequency"],
    order: "start_date DESC, id DESC"
  },
  pledges: {
    table: "scholarship_pledges",
    fields: ["pledge_no", "sponsor_id", "sponsorship_id", "scholar_id", "enrollment_id", "pledge_date", "due_date", "purpose_type", "frequency", "amount_php", "source_currency", "source_amount", "exchange_rate", "conversion_date", "status", "notes"],
    required: ["sponsor_id", "pledge_date", "amount_php"],
    search: ["pledge_no", "purpose_type", "frequency", "status", "notes"],
    filters: ["sponsor_id", "scholar_id", "enrollment_id", "status", "purpose_type"],
    order: "pledge_date DESC, id DESC",
    number: { field: "pledge_no", prefix: "PLG" }
  },
  invoices: {
    table: "scholarship_invoices",
    fields: ["invoice_no", "sponsor_id", "pledge_id", "issue_date", "due_date", "amount_php", "status", "notes", "reissued_from_id", "voided_at", "voided_by", "void_reason", "created_by"],
    required: ["sponsor_id", "amount_php"],
    search: ["invoice_no", "status", "notes"],
    filters: ["sponsor_id", "pledge_id", "status"],
    order: "issue_date DESC, id DESC",
    controlled: true
  },
  payments: {
    table: "scholarship_payments",
    fields: ["payment_no", "sponsor_id", "pledge_id", "invoice_id", "payment_date", "amount_php", "source_currency", "source_amount", "exchange_rate", "conversion_date", "payment_method", "reference_no", "status", "notes", "reversed_at", "reversed_by", "reversal_reason", "created_by"],
    required: ["sponsor_id", "payment_date", "amount_php"],
    search: ["payment_no", "payment_method", "reference_no", "status", "notes"],
    filters: ["sponsor_id", "pledge_id", "invoice_id", "status"],
    order: "payment_date DESC, id DESC",
    number: { field: "payment_no", prefix: "PAY" }
  },
  receipts: {
    table: "scholarship_receipts",
    fields: ["receipt_no", "payment_id", "issue_date", "amount_php", "status", "notes", "reissued_from_id", "voided_at", "voided_by", "void_reason", "created_by"],
    required: ["payment_id", "amount_php"],
    search: ["receipt_no", "status", "notes"],
    filters: ["payment_id", "status"],
    order: "issue_date DESC, id DESC",
    controlled: true
  },
  allocations: {
    table: "scholarship_allocations",
    fields: ["payment_id", "scholar_id", "enrollment_id", "allocation_date", "allocation_type", "purpose", "amount_php", "notes"],
    required: ["payment_id", "allocation_date", "amount_php"],
    search: ["allocation_type", "purpose", "notes"],
    filters: ["payment_id", "scholar_id", "enrollment_id", "allocation_type"],
    order: "allocation_date DESC, id DESC"
  },
  documentSettings: {
    table: "scholarship_document_settings",
    fields: ["effective_year", "organization_name", "registered_address", "tax_identifier", "contact_details", "service_invoice_prefix", "official_receipt_prefix", "invoice_serial_start", "invoice_serial_end", "receipt_serial_start", "receipt_serial_end", "accountant_approved", "status", "notes"],
    required: ["effective_year", "organization_name", "service_invoice_prefix", "official_receipt_prefix", "invoice_serial_start", "invoice_serial_end", "receipt_serial_start", "receipt_serial_end"],
    search: ["organization_name", "registered_address", "tax_identifier", "status", "notes"],
    filters: ["effective_year", "status", "accountant_approved"],
    order: "effective_year DESC, id DESC",
    immutableStatuses: ["Active", "Retired"]
  },
  grades: {
    table: "scholarship_grade_records",
    fields: ["enrollment_id", "academic_period_id", "subject_name", "subject_order", "grading_scale", "grade_value", "numeric_value", "credit_units", "standardized_score", "remarks", "status"],
    required: ["enrollment_id", "academic_period_id", "subject_name", "grading_scale", "grade_value"],
    search: ["subject_name", "grading_scale", "grade_value", "remarks", "status"],
    filters: ["enrollment_id", "academic_period_id", "grading_scale", "status"],
    order: "academic_period_id DESC, subject_order, subject_name, id"
  },
  events: {
    table: "scholarship_events",
    fields: ["event_title", "event_type", "participant_scope", "academic_year_id", "chapel_id", "event_date", "location", "required", "notes"],
    required: ["event_title", "event_type", "event_date"],
    search: ["event_title", "event_type", "location", "notes"],
    filters: ["event_type", "participant_scope", "academic_year_id", "chapel_id", "required"],
    order: "event_date DESC, id DESC"
  },
  attendance: {
    table: "scholarship_attendance",
    fields: ["event_id", "scholar_id", "enrollment_id", "attendance_status", "remarks", "recorded_by"],
    required: ["event_id", "scholar_id", "attendance_status"],
    search: ["attendance_status", "remarks"],
    filters: ["event_id", "scholar_id", "enrollment_id", "attendance_status"],
    order: "event_id DESC, scholar_id, id"
  },
  guardianAttendance: {
    table: "scholarship_guardian_attendance",
    fields: ["event_id", "scholar_id", "enrollment_id", "guardian_name", "attendance_status", "remarks", "recorded_by"],
    required: ["event_id", "scholar_id", "attendance_status"],
    search: ["guardian_name", "attendance_status", "remarks"],
    filters: ["event_id", "scholar_id", "enrollment_id", "attendance_status"],
    order: "event_id DESC, scholar_id, id"
  },
  renewalTemplates: {
    table: "scholarship_renewal_templates",
    fields: ["template_name", "academic_year_id", "education_level", "version", "status"],
    required: ["template_name", "version"],
    search: ["template_name", "education_level", "status"],
    filters: ["academic_year_id", "education_level", "status"],
    order: "version DESC, template_name, id DESC",
    immutableStatuses: ["Published", "Retired"]
  },
  renewals: {
    table: "scholarship_renewals",
    fields: ["enrollment_id", "template_id", "due_date", "submitted_date", "status", "notes", "approved_at", "approved_by"],
    required: ["enrollment_id", "template_id"],
    search: ["status", "notes"],
    filters: ["enrollment_id", "template_id", "status"],
    order: "due_date DESC, id DESC"
  },
  renewalEvaluations: {
    table: "scholarship_renewal_evaluations",
    fields: ["renewal_id", "report_card_score", "tutorial_activities_score", "parent_service_score", "compliance_score", "mass_score", "adjustment_score", "overall_rating", "ranking", "numerical_evaluation", "coordinator_evaluation", "education_team_evaluation", "overall_evaluation", "coordinator_remarks", "education_team_remarks", "remarks", "calculated_at"],
    required: ["renewal_id"],
    search: ["numerical_evaluation", "coordinator_evaluation", "education_team_evaluation", "overall_evaluation", "coordinator_remarks", "education_team_remarks", "remarks"],
    filters: ["renewal_id", "numerical_evaluation", "overall_evaluation"],
    order: "updated_at DESC, id DESC"
  },
  evaluationTemplates: {
    table: "scholarship_evaluation_templates",
    fields: ["template_name", "academic_year_id", "education_level", "version", "scale_min", "scale_max", "status"],
    required: ["template_name", "version"],
    search: ["template_name", "education_level", "status"],
    filters: ["academic_year_id", "education_level", "status"],
    order: "version DESC, template_name, id DESC",
    immutableStatuses: ["Published", "Retired"]
  },
  evaluations: {
    table: "scholarship_evaluations",
    fields: ["enrollment_id", "template_id", "evaluation_date", "evaluator_id", "status", "overall_score", "narrative", "recommendations", "revision_of_id", "approved_at", "approved_by"],
    required: ["enrollment_id", "template_id", "evaluation_date"],
    search: ["status", "narrative", "recommendations"],
    filters: ["enrollment_id", "template_id", "status"],
    order: "evaluation_date DESC, id DESC",
    immutableStatuses: ["Completed", "Revised"]
  },
  documentLinks: {
    table: "scholarship_document_links",
    fields: ["entity_type", "entity_id", "document_type", "label", "document_url", "verified_at", "verified_by"],
    required: ["entity_type", "entity_id", "document_url"],
    search: ["entity_type", "document_type", "label", "document_url"],
    filters: ["entity_type", "entity_id", "document_type"],
    order: "created_at DESC, id DESC"
  },
  audit: {
    table: "scholarship_audit_log",
    fields: ["user_id", "action", "entity_type", "entity_id", "summary", "created_at"],
    required: [],
    search: ["action", "entity_type", "summary"],
    filters: ["user_id", "action", "entity_type", "entity_id"],
    order: "created_at DESC, id DESC",
    readOnly: true
  }
};

const NUMERIC_FIELDS = new Set([
  "academic_year_id", "period_order", "subject_order", "chapel_id", "scholar_id", "enrollment_id", "sponsor_id", "sponsorship_id",
  "pledge_id", "invoice_id", "payment_id", "template_id", "event_id", "academic_period_id", "recorded_by",
  "evaluator_id", "approved_by", "verified_by", "created_by", "voided_by", "reversed_by", "revision_of_id",
  "reissued_from_id", "version", "required", "effective_year", "invoice_serial_start", "invoice_serial_end",
  "receipt_serial_start", "receipt_serial_end", "accountant_approved", "commitment_amount_php", "amount_php", "source_amount",
  "exchange_rate", "numeric_value", "credit_units", "standardized_score", "scale_min", "scale_max", "overall_score", "weight", "score",
  "report_card_score", "tutorial_activities_score", "parent_service_score", "compliance_score", "mass_score", "adjustment_score", "overall_rating", "ranking",
  "total_siblings", "married_siblings", "household_contribution", "monthly_income"
]);

function nowIso() {
  return new Date().toISOString();
}

function todayLocalIso() {
  const value = new Date();
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 10);
}

function isIsoDate(value) {
  const text = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const parsed = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === text;
}

function normalizeInteger(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : null;
}

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
}

function normalizeField(field, value) {
  if (!NUMERIC_FIELDS.has(field)) return String(value ?? "").trim();
  if (["commitment_amount_php", "amount_php", "source_amount", "exchange_rate", "numeric_value", "scale_min", "scale_max", "overall_score", "weight", "score", "household_contribution", "monthly_income"].includes(field)) {
    return normalizeNumber(value);
  }
  return normalizeInteger(value);
}

function safeLimit(value, fallback = 50) {
  return Math.min(Math.max(Number(value) || fallback, 1), 500);
}

function safeOffset(value) {
  return Math.max(Number(value) || 0, 0);
}

function placeholders(count) {
  return Array.from({ length: count }, () => "?").join(", ");
}

function localDriver(db) {
  return {
    all: async (sql, args = []) => db.prepare(sql).all(...args),
    get: async (sql, args = []) => db.prepare(sql).get(...args) || null,
    run: async (sql, args = []) => {
      const result = db.prepare(sql).run(...args);
      return {
        changes: Number(result.changes || 0),
        lastInsertRowid: Number(result.lastInsertRowid || 0)
      };
    }
  };
}

function resultRows(result) {
  return (result?.rows || []).map(row => ({ ...row }));
}

function tursoDriver(database) {
  return {
    all: async (sql, args = []) => resultRows(await database.execute(sql, args)),
    get: async (sql, args = []) => resultRows(await database.execute(sql, args))[0] || null,
    run: async (sql, args = []) => {
      const result = await database.execute(sql, args);
      return {
        changes: Number(result.rowsAffected || 0),
        lastInsertRowid: Number(result.lastInsertRowid || 0)
      };
    }
  };
}

function scholarName(row = {}) {
  return [row.last_name, row.first_name, row.middle_name].filter(Boolean).join(", ");
}

function ageFromBirthDate(value, today = new Date()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return "";
  let age = today.getFullYear() - Number(match[1]);
  if (today.getMonth() + 1 < Number(match[2]) || (today.getMonth() + 1 === Number(match[2]) && today.getDate() < Number(match[3]))) age -= 1;
  return age >= 0 ? String(age) : "";
}

class ScholarshipStore {
  constructor(driver) {
    this.driver = driver;
  }

  definition(entity) {
    const definition = ENTITY_DEFINITIONS[entity];
    if (!definition) throw new Error("Unsupported Scholarship record type.");
    return definition;
  }

  async listUserRoles(userId) {
    const rows = await this.driver.all(
      `SELECT role_code FROM app_user_program_roles
       WHERE user_id = ? AND program_code = ?
       ORDER BY role_code`,
      [Number(userId), SCHOLARSHIP_PROGRAM_CODE]
    );
    return rows.map(row => row.role_code).filter(role => SCHOLARSHIP_ROLES.includes(role));
  }

  async setUserRoles(userId, roles = []) {
    const user = await this.driver.get("SELECT id, role FROM app_users WHERE id = ?", [Number(userId)]);
    if (!user) throw new Error("User account was not found.");
    const normalized = [...new Set((Array.isArray(roles) ? roles : []).filter(role => SCHOLARSHIP_ROLES.includes(role)))];
    await this.driver.run(
      "DELETE FROM app_user_program_roles WHERE user_id = ? AND program_code = ?",
      [Number(userId), SCHOLARSHIP_PROGRAM_CODE]
    );
    for (const role of normalized) {
      await this.driver.run(
        `INSERT INTO app_user_program_roles (user_id, program_code, role_code, created_at)
         VALUES (?, ?, ?, ?)`,
        [Number(userId), SCHOLARSHIP_PROGRAM_CODE, role, nowIso()]
      );
    }
    return normalized;
  }

  async decorateUser(user) {
    if (!user) return null;
    return { ...user, program_roles: { scholarship: await this.listUserRoles(user.id) } };
  }

  buildFilters(definition, options = {}) {
    const clauses = [];
    const args = [];
    if (!definition.readOnly && String(options.archived_only || "") === "1") clauses.push("COALESCE(deleted_at, '') <> ''");
    else if (!definition.readOnly && String(options.include_archived || "") !== "1") clauses.push("COALESCE(deleted_at, '') = ''");
    const search = String(options.search || "").trim().toLowerCase();
    if (search && definition.search?.length) {
      clauses.push(`(${definition.search.map(field => `lower(COALESCE(${field}, '')) LIKE ?`).join(" OR ")})`);
      for (let index = 0; index < definition.search.length; index += 1) args.push(`%${search}%`);
    }
    for (const field of definition.filters || []) {
      const value = options[field] ?? options[field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())];
      if (value === "" || value === null || value === undefined) continue;
      clauses.push(`${field} = ?`);
      args.push(normalizeField(field, value));
    }
    return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", args };
  }

  buildRenewalEvaluationFilters(options = {}) {
    const clauses = [];
    const args = [];
    if (String(options.archived_only || "") === "1") clauses.push("COALESCE(v.deleted_at, '') <> ''");
    else if (String(options.include_archived || "") !== "1") clauses.push("COALESCE(v.deleted_at, '') = ''");
    const search = String(options.search || "").trim().toLowerCase();
    if (search) {
      const fields = [
        "s.scholar_no", "s.last_name", "s.first_name", "s.middle_name", "y.label",
        "v.numerical_evaluation", "v.coordinator_evaluation", "v.education_team_evaluation",
        "v.overall_evaluation", "v.coordinator_remarks", "v.education_team_remarks", "v.remarks"
      ];
      clauses.push(`(${fields.map(field => `lower(COALESCE(${field}, '')) LIKE ?`).join(" OR ")})`);
      for (let index = 0; index < fields.length; index += 1) args.push(`%${search}%`);
    }
    for (const field of ["renewal_id", "numerical_evaluation", "overall_evaluation"]) {
      const value = options[field] ?? options[field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())];
      if (value === "" || value === null || value === undefined) continue;
      clauses.push(`v.${field} = ?`);
      args.push(normalizeField(field, value));
    }
    return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", args };
  }

  async count(entity, options = {}) {
    const definition = this.definition(entity);
    if (entity === "renewalEvaluations") {
      const { where, args } = this.buildRenewalEvaluationFilters(options);
      const row = await this.driver.get(
        `SELECT COUNT(*) AS count
         FROM scholarship_renewal_evaluations v
         JOIN scholarship_renewals r ON r.id = v.renewal_id
         JOIN scholarship_enrollments e ON e.id = r.enrollment_id
         JOIN scholarship_scholars s ON s.id = e.scholar_id
         LEFT JOIN scholarship_academic_years y ON y.id = e.academic_year_id
         ${where}`,
        args
      );
      return Number(row?.count || 0);
    }
    const { where, args } = this.buildFilters(definition, options);
    const row = await this.driver.get(`SELECT COUNT(*) AS count FROM ${definition.table} ${where}`, args);
    return Number(row?.count || 0);
  }

  async list(entity, options = {}) {
    const definition = this.definition(entity);
    if (entity === "renewalEvaluations") {
      const { where, args } = this.buildRenewalEvaluationFilters(options);
      const rows = await this.driver.all(
        `SELECT v.*
         FROM scholarship_renewal_evaluations v
         JOIN scholarship_renewals r ON r.id = v.renewal_id
         JOIN scholarship_enrollments e ON e.id = r.enrollment_id
         JOIN scholarship_scholars s ON s.id = e.scholar_id
         LEFT JOIN scholarship_academic_years y ON y.id = e.academic_year_id
         ${where}
         ORDER BY v.updated_at DESC, v.id DESC LIMIT ? OFFSET ?`,
        [...args, safeLimit(options.limit), safeOffset(options.offset)]
      );
      return this.enrich(entity, rows);
    }
    const { where, args } = this.buildFilters(definition, options);
    const rows = await this.driver.all(
      `SELECT * FROM ${definition.table} ${where} ORDER BY ${definition.order} LIMIT ? OFFSET ?`,
      [...args, safeLimit(options.limit), safeOffset(options.offset)]
    );
    return this.enrich(entity, rows);
  }

  async enrich(entity, rows) {
    if (!rows.length) return rows;
    const scholarIds = new Set();
    const sponsorIds = new Set();
    const enrollmentIds = new Set();
    const yearIds = new Set();
    const periodIds = new Set();
    const eventIds = new Set();
    const paymentIds = new Set();
    const templateIds = new Set();
    const chapelIds = new Set();
    const renewalIds = new Set();
    for (const row of rows) {
      if (row.scholar_id) scholarIds.add(Number(row.scholar_id));
      if (row.sponsor_id) sponsorIds.add(Number(row.sponsor_id));
      if (row.enrollment_id) enrollmentIds.add(Number(row.enrollment_id));
      if (row.academic_year_id) yearIds.add(Number(row.academic_year_id));
      if (row.academic_period_id) periodIds.add(Number(row.academic_period_id));
      if (row.event_id) eventIds.add(Number(row.event_id));
      if (row.payment_id) paymentIds.add(Number(row.payment_id));
      if (row.template_id) templateIds.add(Number(row.template_id));
      if (row.chapel_id) chapelIds.add(Number(row.chapel_id));
      if (row.renewal_id) renewalIds.add(Number(row.renewal_id));
    }
    const selectMap = async (table, ids, columns = "*") => {
      if (!ids.size) return new Map();
      const values = [...ids];
      const found = await this.driver.all(`SELECT ${columns} FROM ${table} WHERE id IN (${placeholders(values.length)})`, values);
      return new Map(found.map(item => [Number(item.id), item]));
    };
    const renewalRecords = await selectMap("scholarship_renewals", renewalIds, "id, enrollment_id, status, due_date");
    for (const renewal of renewalRecords.values()) enrollmentIds.add(Number(renewal.enrollment_id));
    let enrollments = await selectMap("scholarship_enrollments", enrollmentIds);
    for (const enrollment of enrollments.values()) {
      scholarIds.add(Number(enrollment.scholar_id));
      yearIds.add(Number(enrollment.academic_year_id));
    }
    const scholars = await selectMap("scholarship_scholars", scholarIds, "id, scholar_no, last_name, first_name, middle_name, chapel_id, guardian_name");
    for (const scholar of scholars.values()) if (scholar.chapel_id) chapelIds.add(Number(scholar.chapel_id));
    const chapels = await selectMap("scholarship_chapels", chapelIds, "id, chapel_code, chapel_name, coordinator_name, assistant_coordinator_name");
    const sponsors = await selectMap("scholarship_sponsors", sponsorIds, "id, sponsor_no, sponsor_name, sponsor_type");
    const years = await selectMap("scholarship_academic_years", yearIds, "id, label");
    const periods = await selectMap("scholarship_academic_periods", periodIds, "id, period_name, academic_year_id");
    const events = await selectMap("scholarship_events", eventIds, "id, event_title, event_date");
    const payments = await selectMap("scholarship_payments", paymentIds, "id, payment_no, sponsor_id, amount_php, status");
    const renewalTemplates = entity === "renewals" ? await selectMap("scholarship_renewal_templates", templateIds, "id, template_name, version") : new Map();
    const evaluationTemplates = entity === "evaluations" ? await selectMap("scholarship_evaluation_templates", templateIds, "id, template_name, version") : new Map();

    return rows.map(row => {
      const result = { ...row };
      if (entity === "scholars") result.scholar_name = scholarName(result);
      const renewalRecord = renewalRecords.get(Number(row.renewal_id));
      const enrollment = enrollments.get(Number(row.enrollment_id || renewalRecord?.enrollment_id));
      const scholar = scholars.get(Number(row.scholar_id || enrollment?.scholar_id));
      const year = years.get(Number(row.academic_year_id || enrollment?.academic_year_id));
      const sponsor = sponsors.get(Number(row.sponsor_id));
      const period = periods.get(Number(row.academic_period_id));
      const event = events.get(Number(row.event_id));
      const payment = payments.get(Number(row.payment_id));
      if (scholar) {
        result.scholar_name = scholarName(scholar);
        result.scholar_no = result.scholar_no || scholar.scholar_no;
        result.guardian_name = result.guardian_name || scholar.guardian_name;
      }
      const chapel = chapels.get(Number(row.chapel_id || scholar?.chapel_id));
      if (chapel) {
        result.chapel_name = chapel.chapel_name;
        result.coordinator_name = chapel.coordinator_name;
        result.assistant_coordinator_name = chapel.assistant_coordinator_name;
      }
      if (sponsor) result.sponsor_name = sponsor.sponsor_name;
      if (year) result.academic_year_label = year.label;
      if (period) result.period_name = period.period_name;
      if (event) {
        result.event_title = event.event_title;
        result.event_date = event.event_date;
      }
      if (payment) {
        result.payment_no = payment.payment_no;
        result.payment_status = payment.status;
      }
      const renewalTemplate = renewalTemplates.get(Number(row.template_id));
      const evaluationTemplate = evaluationTemplates.get(Number(row.template_id));
      if (renewalTemplate) result.template_name = renewalTemplate.template_name;
      if (evaluationTemplate) result.template_name = evaluationTemplate.template_name;
      if (renewalRecord) {
        result.renewal_status = renewalRecord.status;
        result.renewal_due_date = renewalRecord.due_date;
      }
      return result;
    });
  }

  async get(entity, id) {
    const definition = this.definition(entity);
    const record = await this.driver.get(`SELECT * FROM ${definition.table} WHERE id = ?`, [Number(id)]);
    if (!record) return null;
    const [enriched] = await this.enrich(entity, [record]);
    if (entity === "scholars") {
      const [householdMembers, enrollments, documentLinks, grades, attendance, guardianAttendance, renewals, evaluations, sponsorships] = await Promise.all([
        this.driver.all("SELECT * FROM scholarship_household_members WHERE scholar_id = ? ORDER BY row_order, id", [Number(id)]),
        this.driver.all("SELECT * FROM scholarship_enrollments WHERE scholar_id = ? ORDER BY academic_year_id DESC, id DESC", [Number(id)]),
        this.driver.all("SELECT * FROM scholarship_document_links WHERE entity_type = 'scholar' AND entity_id = ? ORDER BY created_at DESC", [Number(id)]),
        this.driver.all(`
          SELECT g.* FROM scholarship_grade_records g
          JOIN scholarship_enrollments e ON e.id = g.enrollment_id
          WHERE e.scholar_id = ? ORDER BY g.academic_period_id DESC, g.subject_name, g.id DESC LIMIT 200
        `, [Number(id)]),
        this.driver.all("SELECT * FROM scholarship_attendance WHERE scholar_id = ? ORDER BY event_id DESC, id DESC LIMIT 200", [Number(id)]),
        this.driver.all("SELECT * FROM scholarship_guardian_attendance WHERE scholar_id = ? ORDER BY event_id DESC, id DESC LIMIT 200", [Number(id)]),
        this.driver.all(`
          SELECT r.* FROM scholarship_renewals r
          JOIN scholarship_enrollments e ON e.id = r.enrollment_id
          WHERE e.scholar_id = ? ORDER BY r.due_date DESC, r.id DESC LIMIT 50
        `, [Number(id)]),
        this.driver.all(`
          SELECT v.* FROM scholarship_evaluations v
          JOIN scholarship_enrollments e ON e.id = v.enrollment_id
          WHERE e.scholar_id = ? ORDER BY v.evaluation_date DESC, v.id DESC LIMIT 50
        `, [Number(id)]),
        this.driver.all(`
          SELECT s.* FROM scholarship_sponsorships s
          JOIN scholarship_enrollments e ON e.id = s.enrollment_id
          WHERE e.scholar_id = ? ORDER BY s.start_date DESC, s.id DESC LIMIT 100
        `, [Number(id)])
      ]);
      enriched.household_members = householdMembers;
      enriched.enrollments = await this.enrich("enrollments", enrollments);
      enriched.document_links = documentLinks;
      enriched.grades = await this.enrich("grades", grades);
      enriched.attendance = await this.enrich("attendance", attendance);
      enriched.guardian_attendance = await this.enrich("guardianAttendance", guardianAttendance);
      enriched.renewals = await this.enrich("renewals", renewals);
      enriched.evaluations = await this.enrich("evaluations", evaluations);
      enriched.sponsorships = await this.enrich("sponsorships", sponsorships);
      const percentageGrades = enriched.grades.filter(item => item.grading_scale === "Percentage" && Number.isFinite(Number(item.numeric_value)));
      const attended = enriched.attendance.filter(item => ["Present", "Late"].includes(item.attendance_status)).length;
      const guardianAttended = enriched.guardian_attendance.filter(item => ["Present", "Late"].includes(item.attendance_status)).length;
      const weightedGroups = new Map();
      for (const grade of enriched.grades) {
        const units = Number(grade.credit_units || 0);
        const value = Number(grade.numeric_value);
        if (!(units > 0) || !Number.isFinite(value)) continue;
        const current = weightedGroups.get(grade.grading_scale) || { weighted: 0, units: 0 };
        current.weighted += value * units;
        current.units += units;
        weightedGroups.set(grade.grading_scale, current);
      }
      enriched.academic_summary = {
        gradeRecords: enriched.grades.length,
        percentageAverage: percentageGrades.length
          ? Math.round(percentageGrades.reduce((sum, item) => sum + Number(item.numeric_value), 0) / percentageGrades.length * 100) / 100
          : null,
        percentageAlerts: percentageGrades.filter(item => Number(item.numeric_value) < 75).length,
        weightedAverages: [...weightedGroups.entries()].map(([scale, item]) => ({ scale, value: Math.round(item.weighted / item.units * 100) / 100, units: item.units })),
        attendanceRecords: enriched.attendance.length,
        attendanceRate: enriched.attendance.length ? Math.round(attended / enriched.attendance.length * 10000) / 100 : null,
        guardianAttendanceRecords: enriched.guardian_attendance.length,
        guardianAttendanceRate: enriched.guardian_attendance.length ? Math.round(guardianAttended / enriched.guardian_attendance.length * 10000) / 100 : null
      };
    }
    if (entity === "sponsors") {
      enriched.sponsorships = await this.enrich("sponsorships", await this.driver.all(
        "SELECT * FROM scholarship_sponsorships WHERE sponsor_id = ? ORDER BY start_date DESC, id DESC",
        [Number(id)]
      ));
      enriched.pledges = await this.enrich("pledges", await this.driver.all(
        "SELECT * FROM scholarship_pledges WHERE sponsor_id = ? ORDER BY pledge_date DESC, id DESC",
        [Number(id)]
      ));
      enriched.payments = await this.enrich("payments", await this.driver.all(
        "SELECT * FROM scholarship_payments WHERE sponsor_id = ? ORDER BY payment_date DESC, id DESC",
        [Number(id)]
      ));
    }
    if (entity === "renewalTemplates") {
      enriched.items = await this.driver.all(
        "SELECT * FROM scholarship_renewal_template_items WHERE template_id = ? ORDER BY row_order, id",
        [Number(id)]
      );
    }
    if (entity === "renewals") {
      enriched.responses = await this.driver.all(
        `SELECT r.*, i.requirement_code, i.item_label, i.quarter_group, i.applicability, i.required, i.row_order
         FROM scholarship_renewal_responses r
         JOIN scholarship_renewal_template_items i ON i.id = r.template_item_id
         WHERE r.renewal_id = ? ORDER BY i.row_order, i.id`,
        [Number(id)]
      );
      enriched.evaluation = await this.driver.get(
        "SELECT * FROM scholarship_renewal_evaluations WHERE renewal_id = ?",
        [Number(id)]
      );
    }
    if (entity === "evaluationTemplates") {
      enriched.criteria = await this.driver.all(
        "SELECT * FROM scholarship_evaluation_criteria WHERE template_id = ? ORDER BY row_order, id",
        [Number(id)]
      );
    }
    if (entity === "evaluations") {
      enriched.scores = await this.driver.all(
        `SELECT s.*, c.criterion_label, c.weight, c.row_order
         FROM scholarship_evaluation_scores s
         JOIN scholarship_evaluation_criteria c ON c.id = s.criterion_id
         WHERE s.evaluation_id = ? ORDER BY c.row_order, c.id`,
        [Number(id)]
      );
    }
    if (entity === "events") {
      enriched.attendance = await this.enrich("attendance", await this.driver.all(
        "SELECT * FROM scholarship_attendance WHERE event_id = ? ORDER BY scholar_id, id",
        [Number(id)]
      ));
      enriched.guardian_attendance = await this.enrich("guardianAttendance", await this.driver.all(
        "SELECT * FROM scholarship_guardian_attendance WHERE event_id = ? ORDER BY scholar_id, id",
        [Number(id)]
      ));
    }
    if (entity === "invoices") enriched.payment_summary = await this.invoicePaymentSummary(Number(id));
    if (entity === "payments") {
      enriched.allocations = await this.enrich("allocations", await this.driver.all(
        "SELECT * FROM scholarship_allocations WHERE payment_id = ? ORDER BY allocation_date, id",
        [Number(id)]
      ));
      enriched.receipts = await this.driver.all(
        "SELECT * FROM scholarship_receipts WHERE payment_id = ? ORDER BY issue_date DESC, id DESC",
        [Number(id)]
      );
    }
    if (["invoices", "receipts"].includes(entity)) {
      const year = Number(String(enriched.issue_date || "").slice(0, 4)) || new Date().getFullYear();
      enriched.document_settings = await this.driver.get(
        "SELECT * FROM scholarship_document_settings WHERE effective_year = ? ORDER BY CASE status WHEN 'Active' THEN 0 ELSE 1 END, id DESC LIMIT 1",
        [year]
      );
    }
    return enriched;
  }

  async nextReference(table, field, prefix, year = new Date().getFullYear()) {
    const pattern = `${prefix}-${year}-%`;
    const rows = await this.driver.all(`SELECT ${field} AS reference FROM ${table} WHERE ${field} LIKE ?`, [pattern]);
    const highest = rows.reduce((value, row) => {
      const number = Number(String(row.reference || "").split("-").pop());
      return Number.isFinite(number) ? Math.max(value, number) : value;
    }, 0);
    return `${prefix}-${year}-${String(highest + 1).padStart(4, "0")}`;
  }

  async save(entity, input = {}, userId = null) {
    const definition = this.definition(entity);
    if (definition.readOnly) throw new Error("This record type is read-only.");
    const id = Number(input.id || 0);
    const existing = id ? await this.driver.get(`SELECT * FROM ${definition.table} WHERE id = ?`, [id]) : null;
    if (id && !existing) throw new Error("Scholarship record was not found.");
    if (existing && definition.controlled && existing.status !== "Draft") {
      throw new Error("Issued or voided financial documents cannot be edited.");
    }
    if (existing && definition.immutableStatuses?.includes(existing.status)) {
      throw new Error("This finalized record is immutable. Create a new version or revision instead.");
    }

    const values = {};
    for (const field of definition.fields) {
      if (field in input) values[field] = normalizeField(field, input[field]);
    }
    for (const field of definition.required || []) {
      const candidate = values[field] ?? existing?.[field];
      if (candidate === undefined || candidate === "" || candidate === null || candidate === 0) {
        throw new Error(`${field.replaceAll("_", " ")} is required.`);
      }
    }
    if (!existing && definition.number && !values[definition.number.field]) {
      values[definition.number.field] = await this.nextReference(definition.table, definition.number.field, definition.number.prefix);
    }
    if (["pledges", "invoices", "payments", "receipts", "allocations", "sponsorships"].includes(entity)) {
      await this.validateFinancialRecord(entity, values, id);
    }
    if (entity === "grades") {
      this.validateGrade(values);
      await this.validateGradeApplicability(values, existing);
    }
    if (entity === "events") {
      const attendanceType = SCHOLARSHIP_ATTENDANCE_TYPES.find(item => item.value === values.event_type);
      if (!attendanceType) throw new Error("Select a valid PAOFI attendance monitoring type.");
      values.participant_scope = attendanceType.participant_scope;
    }
    if (entity === "renewalEvaluations") {
      for (const field of ["coordinator_evaluation", "education_team_evaluation", "overall_evaluation"]) {
        if (values[field] && !SCHOLARSHIP_RENEWAL_DECISIONS.includes(values[field])) throw new Error("Invalid renewal decision status.");
      }
    }
    if (entity === "evaluationTemplates" && Number(values.scale_max) <= Number(values.scale_min)) {
      throw new Error("Evaluation scale maximum must be greater than its minimum.");
    }
    if (entity === "documentSettings") {
      if (Number(values.invoice_serial_end) < Number(values.invoice_serial_start)
          || Number(values.receipt_serial_end) < Number(values.receipt_serial_start)) {
        throw new Error("Financial document serial range endings must be greater than or equal to their starting numbers.");
      }
      if (values.status === "Active" && !Number(values.accountant_approved)) {
        throw new Error("Accountant approval is required before financial document settings can become active.");
      }
    }
    if (["renewals", "evaluations"].includes(entity)) {
      const templateEntity = entity === "renewals" ? "renewalTemplates" : "evaluationTemplates";
      const templateDefinition = this.definition(templateEntity);
      const templateId = Number(values.template_id ?? existing?.template_id);
      const template = await this.driver.get(
        `SELECT status FROM ${templateDefinition.table} WHERE id = ?`,
        [templateId]
      );
      if (!template) throw new Error("The selected template was not found.");
      if (template.status !== "Published") throw new Error("Only published template versions can be assigned.");
    }
    if (entity === "renewalTemplates" && String(values.status ?? existing?.status ?? "Draft") === "Published") {
      const items = Array.isArray(input.items)
        ? input.items.filter(item => String(item.item_label || "").trim())
        : await this.driver.all("SELECT item_label, deadline FROM scholarship_renewal_template_items WHERE template_id = ?", [id]);
      if (!items.length) throw new Error("A published renewal template must contain at least one checklist item.");
      if (items.some(item => !isIsoDate(item.deadline))) {
        throw new Error("Every checklist item needs a valid deadline before the template can be published.");
      }
    }

    const timestamp = nowIso();
    let recordId = id;
    if (existing) {
      const fields = Object.keys(values);
      await this.driver.run(
        `UPDATE ${definition.table} SET ${fields.map(field => `${field} = ?`).join(", ")}, updated_at = ? WHERE id = ?`,
        [...fields.map(field => values[field]), timestamp, id]
      );
    } else {
      const fields = Object.keys(values);
      const result = await this.driver.run(
        `INSERT INTO ${definition.table} (${fields.join(", ")}, created_at, updated_at)
         VALUES (${placeholders(fields.length + 2)})`,
        [...fields.map(field => values[field]), timestamp, timestamp]
      );
      recordId = result.lastInsertRowid;
    }

    if (entity === "scholars" && (!existing || "household_members" in input || "document_links" in input)) {
      if (!existing || "household_members" in input) {
        const householdMembers = [...(Array.isArray(input.household_members) ? input.household_members : [])]
          .map(member => ({ ...member, age: ageFromBirthDate(member.birth_date) || String(member.age || "") }))
          .sort((left, right) => Number(right.age || 0) - Number(left.age || 0));
        await this.replaceChildren("scholarship_household_members", "scholar_id", recordId,
          ["row_order", "member_name", "relationship", "birth_date", "age", "gender", "civil_status", "education_attainment", "occupation", "school", "monthly_income"], householdMembers);
      }
      if (!existing || "document_links" in input) await this.replaceDocumentLinks("scholar", recordId, input.document_links || []);
    }
    if (entity === "renewalTemplates" && (!existing || "items" in input)) {
      await this.replaceChildren("scholarship_renewal_template_items", "template_id", recordId,
        ["row_order", "requirement_code", "item_label", "quarter_group", "applicability", "deadline", "required"], input.items || []);
    }
    if (entity === "renewals" && (!existing || "responses" in input)) {
      await this.saveRenewalResponses(recordId, Number(values.template_id || existing?.template_id), input.responses);
      await this.refreshRenewalDeadline(recordId);
    }
    if (entity === "evaluationTemplates" && (!existing || "criteria" in input)) {
      await this.replaceChildren("scholarship_evaluation_criteria", "template_id", recordId,
        ["row_order", "criterion_label", "weight"], input.criteria || []);
    }
    if (entity === "evaluations" && (!existing || "scores" in input)) {
      await this.saveEvaluationScores(recordId, Number(values.template_id || existing?.template_id), input.scores || []);
    }
    if (entity === "events") {
      const scope = values.participant_scope || existing?.participant_scope || "Scholar";
      if (scope === "Parent") await this.driver.run("DELETE FROM scholarship_attendance WHERE event_id = ?", [Number(recordId)]);
      else if (Array.isArray(input.attendance)) await this.saveAttendanceBatch(recordId, input.attendance, userId);
      if (scope === "Scholar") await this.driver.run("DELETE FROM scholarship_guardian_attendance WHERE event_id = ?", [Number(recordId)]);
      else if (Array.isArray(input.guardian_attendance)) await this.saveGuardianAttendanceBatch(recordId, input.guardian_attendance, userId);
    }
    if (entity === "grades") {
      const enrollmentId = values.enrollment_id || existing?.enrollment_id;
      await this.synchronizeGradeRequirements(enrollmentId, userId);
      await this.refreshRenewalEvaluationsForEnrollments([enrollmentId], userId);
    }
    if (entity === "renewals") {
      await this.synchronizeGradeRequirements(values.enrollment_id || existing?.enrollment_id, userId);
      await this.calculateRenewalEvaluation(recordId, {}, userId);
    }

    await this.audit(userId, existing ? "updated" : "created", entity, recordId, input.audit_summary || "");
    return this.get(entity, recordId);
  }

  async refreshRenewalDeadline(renewalId) {
    const summary = await this.driver.get(
      `SELECT COALESCE(MAX(NULLIF(deadline, '')), '') AS final_deadline
       FROM scholarship_renewal_responses WHERE renewal_id = ?`,
      [Number(renewalId)]
    );
    await this.driver.run(
      "UPDATE scholarship_renewals SET due_date = ?, updated_at = ? WHERE id = ?",
      [String(summary?.final_deadline || ""), nowIso(), Number(renewalId)]
    );
  }

  async replaceChildren(table, foreignKey, parentId, fields, rows = []) {
    await this.driver.run(`DELETE FROM ${table} WHERE ${foreignKey} = ?`, [Number(parentId)]);
    let rowOrder = 0;
    for (const row of Array.isArray(rows) ? rows : []) {
      const values = fields.map(field => field === "row_order" ? rowOrder : normalizeField(field, row[field]));
      const meaningful = fields.some((field, index) => field !== "row_order" && values[index] !== "" && values[index] !== 0 && values[index] !== null);
      if (!meaningful) continue;
      await this.driver.run(
        `INSERT INTO ${table} (${foreignKey}, ${fields.join(", ")}) VALUES (${placeholders(fields.length + 1)})`,
        [Number(parentId), ...values]
      );
      rowOrder += 1;
    }
  }

  async replaceDocumentLinks(entityType, entityId, links = []) {
    await this.driver.run("DELETE FROM scholarship_document_links WHERE entity_type = ? AND entity_id = ?", [entityType, Number(entityId)]);
    const timestamp = nowIso();
    for (const link of Array.isArray(links) ? links : []) {
      const url = String(link.document_url || link.url || "").trim();
      if (!url) continue;
      if (!/^https:\/\//i.test(url)) throw new Error("Supporting document links must use HTTPS.");
      await this.driver.run(
        `INSERT INTO scholarship_document_links
         (entity_type, entity_id, document_type, label, document_url, verified_at, verified_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [entityType, Number(entityId), String(link.document_type || ""), String(link.label || ""), url,
          String(link.verified_at || ""), normalizeInteger(link.verified_by), timestamp, timestamp]
      );
    }
  }

  async saveRenewalResponses(renewalId, templateId, inputResponses) {
    const items = await this.driver.all(
      "SELECT * FROM scholarship_renewal_template_items WHERE template_id = ? ORDER BY row_order, id",
      [Number(templateId)]
    );
    const enrollment = await this.driver.get(
      `SELECT e.* FROM scholarship_renewals r JOIN scholarship_enrollments e ON e.id = r.enrollment_id WHERE r.id = ?`,
      [Number(renewalId)]
    );
    const sponsorRows = enrollment ? await this.driver.all(
      `SELECT s.sponsor_name FROM scholarship_sponsorships x
       JOIN scholarship_sponsors s ON s.id = x.sponsor_id
       WHERE x.enrollment_id = ? AND x.status = 'Active'`,
      [Number(enrollment.id)]
    ) : [];
    const isCollege = /college/i.test(`${enrollment?.education_level || ""} ${enrollment?.grade_or_year || ""}`);
    const isFirstYearCollege = isCollege && /(?:1st|first|year 1|1st year)/i.test(String(enrollment?.grade_or_year || ""));
    const hasAncop = sponsorRows.some(row => /ancop/i.test(row.sponsor_name || ""));
    const applies = item => {
      const rule = String(item.applicability || "All");
      if (rule === "College") return isCollege;
      if (rule === "Non-College") return !isCollege;
      if (rule === "First Year College") return isFirstYearCollege;
      if (rule === "ANCOP") return hasAncop;
      return true;
    };
    const responses = Array.isArray(inputResponses) ? inputResponses : [];
    const today = todayLocalIso();
    const completedStatuses = new Set(["Passed", "Sent to ANCOP", "Complete"]);
    for (const item of items) {
      const input = responses.find(response => Number(response.template_item_id) === Number(item.id)) || {};
      const existing = await this.driver.get(
        "SELECT * FROM scholarship_renewal_responses WHERE renewal_id = ? AND template_item_id = ?",
        [Number(renewalId), Number(item.id)]
      );
      const url = String(input.document_url ?? existing?.document_url ?? "").trim();
      if (url && !/^https:\/\//i.test(url)) throw new Error("Renewal document links must use HTTPS.");
      const deadline = String(input.deadline || existing?.deadline || item.deadline || "").trim();
      if (!isIsoDate(deadline)) throw new Error(`Set a valid deadline for ${item.item_label}.`);
      let requestedStatus = String(input.item_status || existing?.item_status || "Missing");
      if (requestedStatus === "Complete") requestedStatus = "Passed";
      if (requestedStatus === "Not Applicable") requestedStatus = "Exempted";
      if (![...SCHOLARSHIP_REQUIREMENT_STATUSES, "Pending"].includes(requestedStatus)) {
        throw new Error("Invalid renewal requirement status.");
      }
      const isApplicable = applies(item);
      const existingCompletedOnTime = Boolean(existing && completedStatuses.has(existing.item_status)
        && (!existing.status_date || existing.status_date <= deadline));
      let itemStatus = isApplicable ? requestedStatus : "Exempted";
      if (isApplicable && deadline < today && completedStatuses.has(itemStatus) && !existingCompletedOnTime) itemStatus = "Late";

      const datedStatuses = new Set(["Passed", "Sent to ANCOP", "Late", "Exempted"]);
      let statusDate = "";
      if (datedStatuses.has(itemStatus)) {
        if (existing?.item_status === itemStatus) statusDate = String(existing.status_date || (existingCompletedOnTime ? existing.deadline : "") || today);
        else if (existingCompletedOnTime && completedStatuses.has(itemStatus)) statusDate = String(existing.status_date || existing.deadline || today);
        else statusDate = today;
      }
      const values = [deadline, itemStatus, statusDate, url,
        String(input.notes ?? existing?.notes ?? ""),
        String(input.verified_at ?? existing?.verified_at ?? ""),
        normalizeInteger(input.verified_by ?? existing?.verified_by)];
      if (existing) {
        await this.driver.run(
          `UPDATE scholarship_renewal_responses
           SET deadline = ?, item_status = ?, status_date = ?, document_url = ?, notes = ?, verified_at = ?, verified_by = ?
           WHERE id = ?`,
          [...values, existing.id]
        );
      } else {
        await this.driver.run(
          `INSERT INTO scholarship_renewal_responses
           (renewal_id, template_item_id, deadline, item_status, status_date, document_url, notes, verified_at, verified_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [Number(renewalId), Number(item.id), ...values]
        );
      }
    }
  }

  async saveEvaluationScores(evaluationId, templateId, inputScores) {
    const criteria = await this.driver.all(
      "SELECT * FROM scholarship_evaluation_criteria WHERE template_id = ? ORDER BY row_order, id",
      [Number(templateId)]
    );
    const template = await this.driver.get("SELECT * FROM scholarship_evaluation_templates WHERE id = ?", [Number(templateId)]);
    const scores = Array.isArray(inputScores) ? inputScores : [];
    await this.driver.run("DELETE FROM scholarship_evaluation_scores WHERE evaluation_id = ?", [Number(evaluationId)]);
    let weighted = 0;
    let totalWeight = 0;
    for (const criterion of criteria) {
      const input = scores.find(score => Number(score.criterion_id) === Number(criterion.id)) || {};
      const score = normalizeNumber(input.score);
      if (score < Number(template.scale_min) || score > Number(template.scale_max)) {
        throw new Error(`Evaluation scores must be between ${template.scale_min} and ${template.scale_max}.`);
      }
      await this.driver.run(
        `INSERT INTO scholarship_evaluation_scores (evaluation_id, criterion_id, score, notes) VALUES (?, ?, ?, ?)`,
        [Number(evaluationId), Number(criterion.id), score, String(input.notes || "")]
      );
      const weight = Number(criterion.weight || 1);
      weighted += score * weight;
      totalWeight += weight;
    }
    const overall = totalWeight ? Math.round((weighted / totalWeight) * 100) / 100 : 0;
    await this.driver.run("UPDATE scholarship_evaluations SET overall_score = ?, updated_at = ? WHERE id = ?", [overall, nowIso(), Number(evaluationId)]);
  }

  async saveAttendanceBatch(eventId, attendance = [], userId = null) {
    const timestamp = nowIso();
    for (const item of attendance) {
      const scholarId = Number(item.scholar_id || 0);
      if (!scholarId) continue;
      const existing = await this.driver.get(
        "SELECT id FROM scholarship_attendance WHERE event_id = ? AND scholar_id = ?",
        [Number(eventId), scholarId]
      );
      const status = String(item.attendance_status || "Absent");
      if (!["Present", "Late", "Excused", "Absent"].includes(status)) throw new Error("Invalid scholar attendance status.");
      const values = [normalizeInteger(item.enrollment_id), status, String(item.remarks || ""), Number(userId) || null, timestamp];
      if (existing) {
        await this.driver.run(
          "UPDATE scholarship_attendance SET enrollment_id = ?, attendance_status = ?, remarks = ?, recorded_by = ?, updated_at = ? WHERE id = ?",
          [...values, existing.id]
        );
      } else {
        await this.driver.run(
          `INSERT INTO scholarship_attendance
           (event_id, scholar_id, enrollment_id, attendance_status, remarks, recorded_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [Number(eventId), scholarId, ...values, timestamp]
        );
      }
    }
    await this.audit(userId, "attendance_recorded", "events", Number(eventId), `${attendance.length} attendance rows`);
    await this.refreshRenewalEvaluationsForEnrollments(attendance.map(item => item.enrollment_id), userId);
  }

  async saveGuardianAttendanceBatch(eventId, attendance = [], userId = null) {
    const timestamp = nowIso();
    for (const item of attendance) {
      const scholarId = Number(item.scholar_id || 0);
      if (!scholarId) continue;
      const existing = await this.driver.get(
        "SELECT id FROM scholarship_guardian_attendance WHERE event_id = ? AND scholar_id = ?",
        [Number(eventId), scholarId]
      );
      const scholar = await this.driver.get("SELECT guardian_name FROM scholarship_scholars WHERE id = ?", [scholarId]);
      const status = String(item.attendance_status || "Absent");
      if (!["Present", "Late", "Excused", "Absent"].includes(status)) throw new Error("Invalid parent or guardian attendance status.");
      const values = [normalizeInteger(item.enrollment_id), String(item.guardian_name || scholar?.guardian_name || ""), status, String(item.remarks || ""), Number(userId) || null, timestamp];
      if (existing) {
        await this.driver.run(
          "UPDATE scholarship_guardian_attendance SET enrollment_id = ?, guardian_name = ?, attendance_status = ?, remarks = ?, recorded_by = ?, updated_at = ? WHERE id = ?",
          [...values, existing.id]
        );
      } else {
        await this.driver.run(
          `INSERT INTO scholarship_guardian_attendance
           (event_id, scholar_id, enrollment_id, guardian_name, attendance_status, remarks, recorded_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [Number(eventId), scholarId, ...values, timestamp]
        );
      }
    }
    await this.audit(userId, "guardian_attendance_recorded", "events", Number(eventId), `${attendance.length} guardian attendance rows`);
    await this.refreshRenewalEvaluationsForEnrollments(attendance.map(item => item.enrollment_id), userId);
  }

  validateGrade(values) {
    const scale = String(values.grading_scale || "");
    const value = String(values.grade_value || "").trim();
    if (scale === "Percentage") {
      const number = Number(value);
      if (!Number.isFinite(number) || number < 0 || number > 100) throw new Error("Percentage grades must be between 0 and 100.");
      values.numeric_value = number;
    } else if (scale === "GPA") {
      const number = Number(value);
      if (!Number.isFinite(number) || number < 0 || number > 5) throw new Error("GPA grades must be between 0 and 5.");
      values.numeric_value = number;
    } else {
      values.numeric_value = null;
    }
    if (values.credit_units !== undefined && values.credit_units !== null && Number(values.credit_units) < 0) {
      throw new Error("Credit units cannot be negative.");
    }
    if (values.standardized_score !== undefined && values.standardized_score !== null
        && (Number(values.standardized_score) < 0 || Number(values.standardized_score) > 100)) {
      throw new Error("A standardized score must be between 0 and 100.");
    }
  }

  async validateGradeApplicability(values, existing = null) {
    const enrollmentId = Number(values.enrollment_id || existing?.enrollment_id || 0);
    const enrollment = await this.driver.get(
      "SELECT education_level, grade_or_year FROM scholarship_enrollments WHERE id = ?",
      [enrollmentId]
    );
    if (!enrollment) throw new Error("The selected scholar enrollment was not found.");
    const levelText = `${enrollment.education_level} ${enrollment.grade_or_year}`;
    const gradeNumber = Number((String(enrollment.grade_or_year).match(/\d+/) || [0])[0]);
    const subject = String(values.subject_name || existing?.subject_name || "").trim().toLowerCase();
    if (/elementary|junior high/i.test(levelText)) {
      if (subject === "science" && gradeNumber > 0 && gradeNumber <= 2) throw new Error("Science is not applicable to Grade 1-2 monitoring.");
      if (["tle", "technology and livelihood education"].includes(subject) && gradeNumber > 0 && gradeNumber <= 3) {
        throw new Error("TLE is not applicable to Grade 1-3 monitoring.");
      }
    }
    if (/senior high|college/i.test(levelText) && !(Number(values.credit_units ?? existing?.credit_units) > 0)) {
      throw new Error("Subject units are required for Senior High School and College grade records.");
    }
  }

  async synchronizeGradeRequirements(enrollmentId, userId = null) {
    const normalizedEnrollmentId = Number(enrollmentId || 0);
    if (!normalizedEnrollmentId) return;
    const periods = await this.driver.all(
      `SELECT p.period_name, p.period_type, p.period_order, COUNT(g.id) AS grade_count
       FROM scholarship_academic_periods p
       LEFT JOIN scholarship_grade_records g ON g.academic_period_id = p.id AND g.enrollment_id = ?
       WHERE p.academic_year_id = (SELECT academic_year_id FROM scholarship_enrollments WHERE id = ?)
       GROUP BY p.id, p.period_name, p.period_type, p.period_order`,
      [normalizedEnrollmentId, normalizedEnrollmentId]
    );
    const hasGrades = matcher => periods.some(period => Number(period.grade_count || 0) > 0 && matcher(period));
    const periodText = period => `${period.period_name || ""} ${period.period_type || ""}`.toLowerCase();
    const isQuarter = period => /quarter/i.test(String(period.period_type || period.period_name || ""));
    const isSemester = period => /semester/i.test(String(period.period_type || period.period_name || ""));
    const availability = new Map([
      ["Q1_REPORT_CARD", hasGrades(period => isQuarter(period) && (Number(period.period_order) === 1 || /first quarter|quarter 1|q1/.test(periodText(period))))],
      ["S1_Q2_REPORT_CARD", hasGrades(period => (isQuarter(period) && (Number(period.period_order) === 2 || /second quarter|quarter 2|q2/.test(periodText(period)))) || (isSemester(period) && (Number(period.period_order) === 1 || /first semester|semester 1/.test(periodText(period)))))],
      ["Q3_REPORT_CARD", hasGrades(period => isQuarter(period) && (Number(period.period_order) === 3 || /third quarter|quarter 3|q3/.test(periodText(period))))],
      ["S2_Q4_REPORT_CARD", hasGrades(period => (isQuarter(period) && (Number(period.period_order) === 4 || /fourth quarter|quarter 4|q4/.test(periodText(period)))) || (isSemester(period) && (Number(period.period_order) === 2 || /second semester|semester 2/.test(periodText(period)))))]
    ]);
    const responses = await this.driver.all(
      `SELECT rr.id, rr.item_status, rr.deadline, rr.status_date, i.requirement_code
       FROM scholarship_renewals r
       JOIN scholarship_renewal_responses rr ON rr.renewal_id = r.id
       JOIN scholarship_renewal_template_items i ON i.id = rr.template_item_id
       WHERE r.enrollment_id = ? AND i.requirement_code IN ('Q1_REPORT_CARD', 'S1_Q2_REPORT_CARD', 'Q3_REPORT_CARD', 'S2_Q4_REPORT_CARD')`,
      [normalizedEnrollmentId]
    );
    const protectedStatuses = new Set(["Sent to ANCOP", "Late", "Exempted"]);
    const today = todayLocalIso();
    let changed = 0;
    for (const response of responses) {
      if (protectedStatuses.has(response.item_status)) continue;
      const available = availability.get(response.requirement_code);
      if (available && response.item_status === "Passed") continue;
      const nextStatus = available ? (response.deadline && response.deadline < today ? "Late" : "Passed") : "Missing";
      if (nextStatus === response.item_status) continue;
      await this.driver.run(
        "UPDATE scholarship_renewal_responses SET item_status = ?, status_date = ? WHERE id = ?",
        [nextStatus, nextStatus === "Missing" ? "" : today, Number(response.id)]
      );
      changed += 1;
    }
    if (changed) await this.audit(userId, "grade_requirements_synchronized", "enrollments", normalizedEnrollmentId, `${changed} report-card requirements updated`);
  }

  async attendanceScore(scholarId, eventTypes, guardian = false, academicYearId = null) {
    const table = guardian ? "scholarship_guardian_attendance" : "scholarship_attendance";
    const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
    const yearFilter = Number(academicYearId || 0) ? " AND (e.academic_year_id = ? OR e.academic_year_id IS NULL)" : "";
    const row = await this.driver.get(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(CASE WHEN a.attendance_status IN ('Present', 'Late') THEN 1 ELSE 0 END), 0) AS attended
       FROM ${table} a
       JOIN scholarship_events e ON e.id = a.event_id
       WHERE a.scholar_id = ? AND e.event_type IN (${placeholders(types.length)})${yearFilter}`,
      [Number(scholarId), ...types, ...(Number(academicYearId || 0) ? [Number(academicYearId)] : [])]
    );
    return Number(row?.total || 0) ? Math.round(Number(row.attended || 0) / Number(row.total) * 10000) / 100 : 0;
  }

  async renewalComplianceScore(renewalId) {
    const rows = await this.driver.all(
      `SELECT r.item_status, i.applicability, i.required
       FROM scholarship_renewal_responses r
       JOIN scholarship_renewal_template_items i ON i.id = r.template_item_id
       WHERE r.renewal_id = ?`,
      [Number(renewalId)]
    );
    const applicable = rows.filter(row => Number(row.required) && row.item_status !== "Exempted");
    if (!applicable.length) return 0;
    const passed = applicable.filter(row => ["Passed", "Sent to ANCOP", "Complete"].includes(row.item_status)).length;
    return Math.round(passed / applicable.length * 10000) / 100;
  }

  async calculateRenewalEvaluation(renewalId, overrides = {}, userId = null, options = {}) {
    const renewal = await this.driver.get(
      `SELECT r.*, e.scholar_id, e.education_level, e.grade_or_year, e.academic_year_id
       FROM scholarship_renewals r
       JOIN scholarship_enrollments e ON e.id = r.enrollment_id
       WHERE r.id = ?`,
      [Number(renewalId)]
    );
    if (!renewal) throw new Error("Scholar renewal was not found.");
    const grade = await this.driver.get(
      `SELECT ROUND(AVG(CASE
          WHEN g.standardized_score IS NOT NULL THEN g.standardized_score
          WHEN g.grading_scale = 'Percentage' THEN g.numeric_value
          ELSE NULL END), 2) AS score
       FROM scholarship_grade_records g WHERE g.enrollment_id = ?`,
      [Number(renewal.enrollment_id)]
    );
    const tutorial = await this.attendanceScore(renewal.scholar_id, "Tutorial", false, renewal.academic_year_id);
    const activities = await this.attendanceScore(renewal.scholar_id, "Activities", false, renewal.academic_year_id);
    const cleaning = await this.attendanceScore(renewal.scholar_id, "Cleaning", true, renewal.academic_year_id);
    const community = await this.attendanceScore(renewal.scholar_id, "Community Service", false, renewal.academic_year_id);
    const scholarMass = await this.attendanceScore(renewal.scholar_id, "Mass", false, renewal.academic_year_id);
    const guardianMass = await this.attendanceScore(renewal.scholar_id, "Mass", true, renewal.academic_year_id);
    const senior = /senior high|college/i.test(`${renewal.education_level} ${renewal.grade_or_year}`);
    const existing = await this.driver.get("SELECT * FROM scholarship_renewal_evaluations WHERE renewal_id = ?", [Number(renewalId)]);
    const scores = {
      report_card_score: Number(grade?.score || 0),
      tutorial_activities_score: Math.max(tutorial, activities),
      parent_service_score: senior ? Math.max(cleaning, community) : cleaning,
      compliance_score: await this.renewalComplianceScore(renewalId),
      mass_score: scholarMass && guardianMass ? Math.round((scholarMass + guardianMass) / 2 * 100) / 100 : Math.max(scholarMass, guardianMass),
      adjustment_score: Number(overrides.adjustment_score ?? existing?.adjustment_score ?? 0)
    };
    const overall = Math.round((scores.report_card_score * 0.8
      + scores.tutorial_activities_score * 0.05
      + scores.parent_service_score * 0.05
      + scores.compliance_score * 0.05
      + scores.mass_score * 0.05
      + scores.adjustment_score) * 100) / 100;
    const decisionValue = key => {
      const value = String(overrides[key] ?? existing?.[key] ?? "Pending");
      if (!SCHOLARSHIP_RENEWAL_DECISIONS.includes(value)) throw new Error("Invalid renewal decision status.");
      return value;
    };
    const timestamp = nowIso();
    const values = [scores.report_card_score, scores.tutorial_activities_score, scores.parent_service_score,
      scores.compliance_score, scores.mass_score, scores.adjustment_score, overall,
      String(overrides.numerical_evaluation || (overall >= 83.5 ? "Pass" : "Fail")),
      decisionValue("coordinator_evaluation"), decisionValue("education_team_evaluation"), decisionValue("overall_evaluation"),
      String(overrides.coordinator_remarks ?? existing?.coordinator_remarks ?? ""),
      String(overrides.education_team_remarks ?? existing?.education_team_remarks ?? ""),
      String(overrides.remarks ?? existing?.remarks ?? ""), timestamp, timestamp];
    if (existing) {
      await this.driver.run(
        `UPDATE scholarship_renewal_evaluations SET
         report_card_score = ?, tutorial_activities_score = ?, parent_service_score = ?, compliance_score = ?, mass_score = ?, adjustment_score = ?,
         overall_rating = ?, numerical_evaluation = ?, coordinator_evaluation = ?, education_team_evaluation = ?, overall_evaluation = ?,
         coordinator_remarks = ?, education_team_remarks = ?, remarks = ?, calculated_at = ?, updated_at = ? WHERE id = ?`,
        [...values, existing.id]
      );
    } else {
      await this.driver.run(
        `INSERT INTO scholarship_renewal_evaluations
         (renewal_id, report_card_score, tutorial_activities_score, parent_service_score, compliance_score, mass_score, adjustment_score,
          overall_rating, numerical_evaluation, coordinator_evaluation, education_team_evaluation, overall_evaluation,
          coordinator_remarks, education_team_remarks, remarks, calculated_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [Number(renewalId), ...values, timestamp]
      );
    }
    if (!options.skipRanking) await this.refreshRenewalRankings([renewal.academic_year_id]);
    await this.audit(userId, "renewal_evaluation_calculated", "renewals", Number(renewalId), `Overall rating ${overall}`);
    return options.returnRecord === false ? null : this.get("renewals", renewalId);
  }

  async refreshRenewalRankings(academicYearIds = []) {
    const ids = [...new Set((Array.isArray(academicYearIds) ? academicYearIds : []).map(Number).filter(Boolean))];
    for (const academicYearId of ids) {
      const peers = await this.driver.all(
        `SELECT v.id, v.overall_rating FROM scholarship_renewal_evaluations v
         JOIN scholarship_renewals r ON r.id = v.renewal_id
         JOIN scholarship_enrollments e ON e.id = r.enrollment_id
         WHERE e.academic_year_id = ? ORDER BY v.overall_rating DESC, v.id`,
        [academicYearId]
      );
      for (let index = 0; index < peers.length; index += 1) {
        await this.driver.run("UPDATE scholarship_renewal_evaluations SET ranking = ? WHERE id = ?", [index + 1, peers[index].id]);
      }
    }
  }

  async renewalBatchRecords(ids = []) {
    const normalizedIds = [...new Set((Array.isArray(ids) ? ids : []).map(Number).filter(Boolean))].slice(0, 500);
    const records = await this.driver.all(
      `SELECT * FROM scholarship_renewals
       ${normalizedIds.length ? `WHERE id IN (${placeholders(normalizedIds.length)})` : ""}
       ORDER BY due_date DESC, id DESC LIMIT 500`,
      normalizedIds
    );
    if (!records.length) return [];
    const enriched = await this.enrich("renewals", records);
    const renewalIds = enriched.map(record => Number(record.id));
    const responses = await this.driver.all(
      `SELECT rr.*, i.requirement_code, i.item_label, i.quarter_group, i.applicability, i.required, i.row_order
       FROM scholarship_renewal_responses rr
       JOIN scholarship_renewal_template_items i ON i.id = rr.template_item_id
       WHERE rr.renewal_id IN (${placeholders(renewalIds.length)})
       ORDER BY rr.renewal_id, i.row_order, i.id`,
      renewalIds
    );
    const grouped = new Map();
    for (const response of responses) {
      const rows = grouped.get(Number(response.renewal_id)) || [];
      rows.push(response);
      grouped.set(Number(response.renewal_id), rows);
    }
    return enriched.map(record => ({ ...record, responses: grouped.get(Number(record.id)) || [] }));
  }

  async batchUpdateRenewalEvaluations(inputRows = [], userId = null) {
    const rows = Array.isArray(inputRows) ? inputRows.slice(0, 500) : [];
    if (!rows.length) throw new Error("Select at least one scholar evaluation to update.");
    const renewalIds = [...new Set(rows.map(row => Number(row.renewal_id)).filter(Boolean))];
    if (renewalIds.length !== rows.length) throw new Error("Each evaluation row must reference one unique scholar renewal.");
    const renewals = await this.driver.all(
      `SELECT r.id, e.academic_year_id FROM scholarship_renewals r
       JOIN scholarship_enrollments e ON e.id = r.enrollment_id
       WHERE r.id IN (${placeholders(renewalIds.length)})`,
      renewalIds
    );
    if (renewals.length !== renewalIds.length) throw new Error("One or more scholar renewals were not found.");
    for (const row of rows) {
      for (const field of ["coordinator_evaluation", "education_team_evaluation", "overall_evaluation"]) {
        if (!SCHOLARSHIP_RENEWAL_DECISIONS.includes(String(row[field] || "Pending"))) throw new Error("Invalid renewal decision status.");
      }
    }
    for (const row of rows) {
      await this.calculateRenewalEvaluation(Number(row.renewal_id), row, userId, { skipRanking: true, returnRecord: false });
    }
    await this.refreshRenewalRankings(renewals.map(row => row.academic_year_id));
    await this.audit(userId, "batch_updated", "renewalEvaluations", null, `${rows.length} weighted renewal evaluations updated`);
    return { updated: rows.length };
  }

  async batchUpdateRenewals(inputRows = [], userId = null) {
    const rows = Array.isArray(inputRows) ? inputRows.slice(0, 500) : [];
    if (!rows.length) throw new Error("Select at least one renewal checklist to update.");
    const renewalIds = [...new Set(rows.map(row => Number(row.renewal_id)).filter(Boolean))];
    if (renewalIds.length !== rows.length) throw new Error("Each batch row must reference one unique renewal checklist.");
    const renewals = await this.driver.all(
      `SELECT r.*, e.academic_year_id FROM scholarship_renewals r
       JOIN scholarship_enrollments e ON e.id = r.enrollment_id
       WHERE r.id IN (${placeholders(renewalIds.length)})`,
      renewalIds
    );
    if (renewals.length !== renewalIds.length) throw new Error("One or more renewal checklists were not found.");
    const renewalMap = new Map(renewals.map(row => [Number(row.id), row]));
    for (const row of rows) {
      const renewal = renewalMap.get(Number(row.renewal_id));
      if (renewal.status === "Approved") throw new Error("Approved renewal checklists cannot be batch edited.");
      if (!["Not Started", "In Progress", "Submitted"].includes(String(row.status || renewal.status))) throw new Error("Invalid renewal checklist status.");
      const response = row.response || {};
      if (!Number(response.template_item_id)) throw new Error("Choose a checklist requirement to batch edit.");
      if (!isIsoDate(response.deadline)) throw new Error("Every edited checklist requirement needs a valid deadline.");
      if (![...SCHOLARSHIP_REQUIREMENT_STATUSES, "Pending"].includes(String(response.item_status || "Missing"))) throw new Error("Invalid renewal requirement status.");
      if (response.document_url && !/^https:\/\//i.test(String(response.document_url))) throw new Error("Renewal document links must use HTTPS.");
    }
    const academicYearIds = [];
    for (const row of rows) {
      const renewal = renewalMap.get(Number(row.renewal_id));
      await this.driver.run(
        "UPDATE scholarship_renewals SET status = ?, notes = ?, updated_at = ? WHERE id = ?",
        [String(row.status || renewal.status), String(row.notes ?? renewal.notes ?? ""), nowIso(), Number(renewal.id)]
      );
      await this.saveRenewalResponses(Number(renewal.id), Number(renewal.template_id), [row.response]);
      await this.refreshRenewalDeadline(Number(renewal.id));
      await this.synchronizeGradeRequirements(Number(renewal.enrollment_id), userId);
      await this.calculateRenewalEvaluation(Number(renewal.id), {}, userId, { skipRanking: true, returnRecord: false });
      academicYearIds.push(renewal.academic_year_id);
    }
    await this.refreshRenewalRankings(academicYearIds);
    await this.audit(userId, "batch_updated", "renewals", null, `${rows.length} renewal checklists updated`);
    return { updated: rows.length };
  }

  async refreshRenewalEvaluationsForEnrollments(enrollmentIds = [], userId = null) {
    const ids = [...new Set((Array.isArray(enrollmentIds) ? enrollmentIds : []).map(Number).filter(Boolean))];
    if (!ids.length) return;
    const renewals = await this.driver.all(
      `SELECT id FROM scholarship_renewals WHERE enrollment_id IN (${placeholders(ids.length)})`, ids
    );
    for (const renewal of renewals) await this.calculateRenewalEvaluation(renewal.id, {}, userId);
  }

  async validateFinancialRecord(entity, values, id = 0) {
    if ("amount_php" in values && Number(values.amount_php) <= 0) throw new Error("Amount must be greater than zero.");
    if (values.source_currency && values.source_currency !== "PHP") {
      if (Number(values.source_amount) <= 0 || Number(values.exchange_rate) <= 0 || !values.conversion_date) {
        throw new Error("Foreign-currency records require source amount, exchange rate, and conversion date.");
      }
      const converted = Math.round(Number(values.source_amount) * Number(values.exchange_rate) * 100) / 100;
      if (Math.abs(converted - Number(values.amount_php)) > 0.01) throw new Error("PHP amount must equal source amount multiplied by the exchange rate.");
    }
    if (entity === "payments" && String(values.status) === "Cleared") {
      if (values.pledge_id) {
        const pledge = await this.driver.get("SELECT amount_php FROM scholarship_pledges WHERE id = ?", [values.pledge_id]);
        if (!pledge) throw new Error("Pledge was not found.");
        const row = await this.driver.get(
          "SELECT COALESCE(SUM(amount_php), 0) AS total FROM scholarship_payments WHERE pledge_id = ? AND status = 'Cleared' AND id <> ?",
          [values.pledge_id, Number(id)]
        );
        if (Number(row.total) + Number(values.amount_php) > Number(pledge.amount_php) + 0.01) throw new Error("Payment exceeds the remaining pledge balance.");
      }
      if (values.invoice_id) {
        const invoice = await this.driver.get("SELECT amount_php, status FROM scholarship_invoices WHERE id = ?", [values.invoice_id]);
        if (!invoice) throw new Error("Service Invoice was not found.");
        if (invoice.status !== "Issued") throw new Error("Payments can only be cleared against an issued Service Invoice.");
        const row = await this.driver.get(
          "SELECT COALESCE(SUM(amount_php), 0) AS total FROM scholarship_payments WHERE invoice_id = ? AND status = 'Cleared' AND id <> ?",
          [values.invoice_id, Number(id)]
        );
        if (Number(row.total) + Number(values.amount_php) > Number(invoice.amount_php) + 0.01) throw new Error("Payment exceeds the remaining invoice balance.");
      }
    }
    if (entity === "allocations") {
      const payment = await this.driver.get("SELECT amount_php, status FROM scholarship_payments WHERE id = ?", [values.payment_id]);
      if (!payment || payment.status !== "Cleared") throw new Error("Only cleared payments can be allocated.");
      const row = await this.driver.get(
        "SELECT COALESCE(SUM(amount_php), 0) AS total FROM scholarship_allocations WHERE payment_id = ? AND id <> ?",
        [values.payment_id, Number(id)]
      );
      if (Number(row.total) + Number(values.amount_php) > Number(payment.amount_php) + 0.01) throw new Error("Allocation exceeds the available payment balance.");
      if (String(values.allocation_type) === "Scholar-specific" && !values.scholar_id) throw new Error("Scholar-specific allocations require a scholar.");
    }
    if (entity === "receipts") {
      const payment = await this.driver.get("SELECT amount_php, status FROM scholarship_payments WHERE id = ?", [values.payment_id]);
      if (!payment || payment.status !== "Cleared") throw new Error("Official Receipts can only be prepared for cleared payments.");
      if (Math.abs(Number(values.amount_php) - Number(payment.amount_php)) > 0.01) throw new Error("Official Receipt amount must match its payment.");
    }
  }

  async invoicePaymentSummary(invoiceId) {
    const invoice = await this.driver.get("SELECT amount_php FROM scholarship_invoices WHERE id = ?", [Number(invoiceId)]);
    const row = await this.driver.get(
      "SELECT COALESCE(SUM(amount_php), 0) AS paid FROM scholarship_payments WHERE invoice_id = ? AND status = 'Cleared'",
      [Number(invoiceId)]
    );
    const total = Number(invoice?.amount_php || 0);
    const paid = Number(row?.paid || 0);
    return { total, paid, balance: Math.max(0, Math.round((total - paid) * 100) / 100) };
  }

  async issueDocument(entity, id, userId) {
    if (!["invoices", "receipts"].includes(entity)) throw new Error("Unsupported financial document type.");
    const definition = this.definition(entity);
    const record = await this.driver.get(`SELECT * FROM ${definition.table} WHERE id = ?`, [Number(id)]);
    if (!record) throw new Error("Financial document was not found.");
    if (record.status !== "Draft") throw new Error("Only draft documents can be issued.");
    await this.validateFinancialRecord(entity, record, Number(id));
    if (entity === "receipts") {
      const existing = await this.driver.get(
        "SELECT id FROM scholarship_receipts WHERE payment_id = ? AND status = 'Issued' AND id <> ? LIMIT 1",
        [record.payment_id, Number(id)]
      );
      if (existing) throw new Error("This cleared payment already has an issued Official Receipt.");
    }
    const issueDate = record.issue_date || new Date().toISOString().slice(0, 10);
    const year = Number(issueDate.slice(0, 4)) || new Date().getFullYear();
    const settings = await this.driver.get(
      `SELECT * FROM scholarship_document_settings
       WHERE effective_year = ? AND status = 'Active' AND accountant_approved = 1 LIMIT 1`,
      [year]
    );
    if (!settings) throw new Error("Approved financial document settings are required for this issue year.");
    const documentType = entity === "invoices" ? "service_invoice" : "official_receipt";
    const prefix = entity === "invoices" ? settings.service_invoice_prefix : settings.official_receipt_prefix;
    const serialStart = Number(entity === "invoices" ? settings.invoice_serial_start : settings.receipt_serial_start);
    const serialEnd = Number(entity === "invoices" ? settings.invoice_serial_end : settings.receipt_serial_end);
    await this.driver.run(
      `INSERT OR IGNORE INTO scholarship_document_sequences
       (document_type, document_year, prefix, next_number, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [documentType, year, prefix, serialStart, nowIso()]
    );
    const sequence = await this.driver.get(
      `UPDATE scholarship_document_sequences
        SET next_number = next_number + 1, updated_at = ?
       WHERE document_type = ? AND document_year = ? AND next_number <= ?
       RETURNING next_number - 1 AS allocated_number`,
      [nowIso(), documentType, year, serialEnd]
    );
    if (!sequence) throw new Error("The approved financial document serial range is exhausted.");
    const reference = `${prefix}-${year}-${String(Number(sequence.allocated_number)).padStart(6, "0")}`;
    const referenceField = entity === "invoices" ? "invoice_no" : "receipt_no";
    await this.driver.run(
      `UPDATE ${definition.table} SET ${referenceField} = ?, issue_date = ?, status = 'Issued', updated_at = ? WHERE id = ?`,
      [reference, issueDate, nowIso(), Number(id)]
    );
    await this.audit(userId, "issued", entity, Number(id), reference);
    return this.get(entity, Number(id));
  }

  async voidDocument(entity, id, reason, userId) {
    if (!["invoices", "receipts"].includes(entity)) throw new Error("Unsupported financial document type.");
    const definition = this.definition(entity);
    const record = await this.driver.get(`SELECT * FROM ${definition.table} WHERE id = ?`, [Number(id)]);
    if (!record) throw new Error("Financial document was not found.");
    if (record.status !== "Issued") throw new Error("Only issued documents can be voided.");
    const voidReason = String(reason || "").trim();
    if (!voidReason) throw new Error("A void reason is required.");
    await this.driver.run(
      `UPDATE ${definition.table}
       SET status = 'Voided', voided_at = ?, voided_by = ?, void_reason = ?, updated_at = ? WHERE id = ?`,
      [nowIso(), Number(userId) || null, voidReason, nowIso(), Number(id)]
    );
    await this.audit(userId, "voided", entity, Number(id), voidReason);
    return this.get(entity, Number(id));
  }

  async reissueDocument(entity, id, userId) {
    if (!["invoices", "receipts"].includes(entity)) throw new Error("Unsupported financial document type.");
    const definition = this.definition(entity);
    const record = await this.driver.get(`SELECT * FROM ${definition.table} WHERE id = ?`, [Number(id)]);
    if (!record || record.status !== "Voided") throw new Error("Only voided documents can be reissued.");
    const input = { ...record, id: 0, status: "Draft", reissued_from_id: Number(id), voided_at: "", voided_by: null, void_reason: "", created_by: Number(userId) || null };
    if (entity === "invoices") input.invoice_no = "";
    else input.receipt_no = "";
    const created = await this.save(entity, input, userId);
    await this.audit(userId, "reissued_as_draft", entity, created.id, `From ${id}`);
    return created;
  }

  async reversePayment(id, reason, userId) {
    const payment = await this.driver.get("SELECT * FROM scholarship_payments WHERE id = ?", [Number(id)]);
    if (!payment) throw new Error("Payment was not found.");
    if (payment.status !== "Cleared") throw new Error("Only cleared payments can be reversed.");
    const receipts = await this.driver.get(
      "SELECT COUNT(*) AS count FROM scholarship_receipts WHERE payment_id = ? AND status = 'Issued'",
      [Number(id)]
    );
    if (Number(receipts.count) > 0) throw new Error("Void issued receipts before reversing this payment.");
    const reversalReason = String(reason || "").trim();
    if (!reversalReason) throw new Error("A reversal reason is required.");
    await this.driver.run(
      `UPDATE scholarship_payments SET status = 'Reversed', reversed_at = ?, reversed_by = ?, reversal_reason = ?, updated_at = ? WHERE id = ?`,
      [nowIso(), Number(userId) || null, reversalReason, nowIso(), Number(id)]
    );
    await this.audit(userId, "reversed", "payments", Number(id), reversalReason);
    return this.get("payments", Number(id));
  }

  async approveRenewal(id, userId) {
    const renewal = await this.get("renewals", Number(id));
    if (!renewal) throw new Error("Renewal record was not found.");
    const accepted = new Set(["Complete", "Passed", "Sent to ANCOP", "Late", "Exempted"]);
    const incompleteRequired = (renewal.responses || []).filter(item => Number(item.required) && !accepted.has(item.item_status));
    if (incompleteRequired.length) throw new Error("All required checklist items must be complete before approval.");
    if (renewal.evaluation && !["Pass", "Graduating"].includes(renewal.evaluation.overall_evaluation)) {
      throw new Error("Coordinator and Education Team renewal decisions must be finalized before approval.");
    }
    await this.driver.run(
      "UPDATE scholarship_renewals SET status = 'Approved', approved_at = ?, approved_by = ?, updated_at = ? WHERE id = ?",
      [nowIso(), Number(userId) || null, nowIso(), Number(id)]
    );
    await this.driver.run(
      "UPDATE scholarship_enrollments SET renewal_status = 'Approved', updated_at = ? WHERE id = ?",
      [nowIso(), Number(renewal.enrollment_id)]
    );
    await this.audit(userId, "approved", "renewals", Number(id), "Renewal approved");
    return this.get("renewals", Number(id));
  }

  async completeEvaluation(id, userId) {
    const evaluation = await this.get("evaluations", Number(id));
    if (!evaluation) throw new Error("Evaluation was not found.");
    if (!(evaluation.scores || []).length) throw new Error("Evaluation scores are required.");
    await this.driver.run(
      "UPDATE scholarship_evaluations SET status = 'Completed', approved_at = ?, approved_by = ?, updated_at = ? WHERE id = ?",
      [nowIso(), Number(userId) || null, nowIso(), Number(id)]
    );
    await this.audit(userId, "completed", "evaluations", Number(id), "Evaluation completed");
    return this.get("evaluations", Number(id));
  }

  async reviseEvaluation(id, userId) {
    const evaluation = await this.get("evaluations", Number(id));
    if (!evaluation || evaluation.status !== "Completed") throw new Error("Only completed evaluations can be revised.");
    await this.driver.run("UPDATE scholarship_evaluations SET status = 'Revised', updated_at = ? WHERE id = ?", [nowIso(), Number(id)]);
    const draft = await this.save("evaluations", {
      enrollment_id: evaluation.enrollment_id,
      template_id: evaluation.template_id,
      evaluation_date: new Date().toISOString().slice(0, 10),
      evaluator_id: Number(userId) || null,
      status: "Draft",
      narrative: evaluation.narrative,
      recommendations: evaluation.recommendations,
      revision_of_id: Number(id),
      scores: evaluation.scores
    }, userId);
    await this.audit(userId, "revision_created", "evaluations", draft.id, `Revises ${id}`);
    return draft;
  }

  async remove(entity, id, userId = null) {
    const definition = this.definition(entity);
    if (definition.readOnly) throw new Error("This record type cannot be deleted.");
    const existing = await this.driver.get(`SELECT * FROM ${definition.table} WHERE id = ?`, [Number(id)]);
    if (!existing) return null;
    if (definition.controlled && existing.status !== "Draft") throw new Error("Issued or voided documents cannot be deleted.");
    if (definition.immutableStatuses?.includes(existing.status)) throw new Error("Completed records cannot be deleted.");
    await this.driver.run(
      `UPDATE ${definition.table} SET deleted_at = ?, updated_at = ? WHERE id = ?`,
      [nowIso(), nowIso(), Number(id)]
    );
    if (entity === "grades") {
      await this.synchronizeGradeRequirements(existing.enrollment_id, userId);
      await this.refreshRenewalEvaluationsForEnrollments([existing.enrollment_id], userId);
    }
    await this.audit(userId, "archived", entity, Number(id), this.recordSummary(existing));
    return existing;
  }

  async restore(entity, id, userId = null) {
    const definition = this.definition(entity);
    if (definition.readOnly) throw new Error("This record type cannot be restored.");
    const existing = await this.driver.get(`SELECT * FROM ${definition.table} WHERE id = ?`, [Number(id)]);
    if (!existing) return null;
    await this.driver.run(
      `UPDATE ${definition.table} SET deleted_at = '', updated_at = ? WHERE id = ?`,
      [nowIso(), Number(id)]
    );
    await this.audit(userId, "restored", entity, Number(id), this.recordSummary(existing));
    return this.get(entity, id);
  }

  recordSummary(record = {}) {
    return String(
      record.scholar_no || record.sponsor_no || record.sponsor_name || record.invoice_no ||
      record.receipt_no || record.pledge_no || record.event_name || record.template_name ||
      record.title || record.label || record.subject_name || `Record #${record.id || ""}`
    ).slice(0, 240);
  }

  async listArchived() {
    const records = [];
    for (const [entity, definition] of Object.entries(ENTITY_DEFINITIONS)) {
      if (definition.readOnly) continue;
      const rows = await this.list(entity, { archived_only: 1, limit: 500 });
      records.push(...rows.map(record => ({
        source: "scholarship",
        id: Number(record.id),
        program_code: "scholarship",
        entity_type: entity,
        display_label: this.recordSummary(record),
        deleted_at: record.deleted_at || ""
      })));
    }
    return records;
  }

  async audit(userId, action, entityType, entityId, summary = "") {
    await this.driver.run(
      `INSERT INTO scholarship_audit_log (user_id, action, entity_type, entity_id, summary, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [Number(userId) || null, String(action), String(entityType), Number(entityId) || null, String(summary || ""), nowIso()]
    );
  }

  async dashboard() {
    const [counts, finance, attendanceStats, byLevel, byStatus, attendance, renewal, gradeScales, attendanceByLevel, attendanceByYear, attendanceByEvent, evaluationByLevel, evaluationByYear, byChapel, attendanceByType, renewalComponents, renewalDecisions, recent] = await Promise.all([
      this.driver.get(`
        SELECT
          (SELECT COUNT(*) FROM scholarship_scholars) AS scholars,
          (SELECT COUNT(*) FROM scholarship_scholars WHERE status = 'Active') AS active_scholars,
          (SELECT COUNT(*) FROM scholarship_sponsors WHERE status = 'Active') AS active_sponsors,
          (SELECT COUNT(*) FROM scholarship_enrollments WHERE scholarship_status = 'Active') AS active_enrollments,
          (SELECT COUNT(*) FROM scholarship_renewals WHERE status IN ('Not Started', 'In Progress', 'Submitted')) AS pending_renewals,
          (SELECT COUNT(DISTINCT r.id)
           FROM scholarship_renewals r
           JOIN scholarship_renewal_responses rr ON rr.renewal_id = r.id
           JOIN scholarship_renewal_template_items ri ON ri.id = rr.template_item_id
           WHERE r.status IN ('Not Started', 'In Progress', 'Submitted')
             AND ri.required = 1
             AND rr.deadline <> ''
             AND rr.deadline < ?
             AND rr.item_status IN ('Missing', 'Pending')) AS overdue_renewals,
          (SELECT COUNT(*) FROM scholarship_renewal_evaluations) AS weighted_evaluations,
          (SELECT COUNT(*) FROM scholarship_renewal_evaluations WHERE overall_evaluation = 'Pending') AS pending_weighted_decisions,
          (SELECT COUNT(*) FROM scholarship_renewal_evaluations
           WHERE numerical_evaluation = 'Fail' OR overall_evaluation IN ('Warning', 'Terminated')) AS weighted_needs_review,
          (SELECT ROUND(COALESCE(AVG(overall_rating), 0), 2) FROM scholarship_renewal_evaluations) AS average_renewal_rating,
          (SELECT COUNT(*) FROM scholarship_evaluations WHERE status = 'Completed') AS completed_evaluations,
          (SELECT COUNT(*) FROM scholarship_evaluations v JOIN scholarship_evaluation_templates t ON t.id = v.template_id WHERE v.status = 'Completed' AND v.overall_score < ((t.scale_min + t.scale_max) / 2.0)) AS flagged_evaluations,
          (SELECT COUNT(*) FROM scholarship_events) AS events,
          (SELECT COUNT(*) FROM scholarship_grade_records) AS grade_records,
          (SELECT COUNT(*) FROM scholarship_grade_records WHERE grading_scale = 'Percentage' AND numeric_value < 75) AS percentage_alerts
      `, [todayLocalIso()]),
      this.driver.get(`
        SELECT
          (SELECT COALESCE(SUM(amount_php), 0) FROM scholarship_pledges WHERE status <> 'Cancelled') AS pledged,
          (SELECT COALESCE(SUM(amount_php), 0) FROM scholarship_payments WHERE status = 'Cleared') AS received,
          (SELECT COALESCE(SUM(amount_php), 0) FROM scholarship_allocations) AS allocated
      `),
      this.driver.get(`
        SELECT COALESCE(SUM(total), 0) AS total, COALESCE(SUM(attended), 0) AS attended FROM (
          SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN attendance_status IN ('Present', 'Late') THEN 1 ELSE 0 END), 0) AS attended
          FROM scholarship_attendance
          UNION ALL
          SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN attendance_status IN ('Present', 'Late') THEN 1 ELSE 0 END), 0) AS attended
          FROM scholarship_guardian_attendance
        )
      `),
      this.driver.all(`
        SELECT COALESCE(NULLIF(education_level, ''), 'Not Specified') AS label, COUNT(*) AS count
        FROM scholarship_enrollments WHERE scholarship_status = 'Active'
        GROUP BY label ORDER BY count DESC, label
      `),
      this.driver.all(`
        SELECT COALESCE(NULLIF(status, ''), 'Not Specified') AS label, COUNT(*) AS count
        FROM scholarship_scholars GROUP BY label ORDER BY count DESC, label
      `),
      this.driver.all(`
        SELECT attendance_status AS label, SUM(count) AS count FROM (
          SELECT attendance_status, COUNT(*) AS count FROM scholarship_attendance GROUP BY attendance_status
          UNION ALL
          SELECT attendance_status, COUNT(*) AS count FROM scholarship_guardian_attendance GROUP BY attendance_status
        ) GROUP BY attendance_status ORDER BY count DESC
      `),
      this.driver.all(`
        SELECT status AS label, COUNT(*) AS count
        FROM scholarship_renewals GROUP BY status ORDER BY count DESC
      `),
      this.driver.all(`
        SELECT grading_scale AS label, COUNT(*) AS count
        FROM scholarship_grade_records GROUP BY grading_scale ORDER BY count DESC, label
      `),
      this.driver.all(`
        SELECT COALESCE(NULLIF(e.education_level, ''), 'Not Specified') AS label, COUNT(*) AS count
        FROM scholarship_attendance a
        LEFT JOIN scholarship_enrollments e ON e.id = a.enrollment_id
        GROUP BY label ORDER BY count DESC, label
      `),
      this.driver.all(`
        SELECT COALESCE(y.label, 'Not Specified') AS label, COUNT(*) AS count
        FROM scholarship_attendance a
        LEFT JOIN scholarship_enrollments e ON e.id = a.enrollment_id
        LEFT JOIN scholarship_academic_years y ON y.id = e.academic_year_id
        GROUP BY y.id, label ORDER BY label DESC
      `),
      this.driver.all(`
        SELECT COALESCE(NULLIF(e.event_title, ''), 'Not Specified') AS label, COUNT(*) AS count
        FROM scholarship_attendance a
        LEFT JOIN scholarship_events e ON e.id = a.event_id
        GROUP BY e.id, label ORDER BY e.event_date DESC, count DESC LIMIT 12
      `),
      this.driver.all(`
        SELECT COALESCE(NULLIF(e.education_level, ''), 'Not Specified') AS label,
               ROUND(AVG(v.overall_score), 2) AS count
        FROM scholarship_evaluations v
        JOIN scholarship_enrollments e ON e.id = v.enrollment_id
        WHERE v.status = 'Completed'
        GROUP BY label ORDER BY count DESC, label
      `),
      this.driver.all(`
        SELECT COALESCE(y.label, 'Not Specified') AS label, ROUND(AVG(v.overall_score), 2) AS count
        FROM scholarship_evaluations v
        JOIN scholarship_enrollments e ON e.id = v.enrollment_id
        LEFT JOIN scholarship_academic_years y ON y.id = e.academic_year_id
        WHERE v.status = 'Completed'
        GROUP BY y.id, label ORDER BY label DESC
      `),
      this.driver.all(`
        SELECT COALESCE(c.chapel_name, 'Not Specified') AS label, COUNT(*) AS count
        FROM scholarship_scholars s LEFT JOIN scholarship_chapels c ON c.id = s.chapel_id
        WHERE s.status = 'Active' GROUP BY c.id, label ORDER BY count DESC, label
      `),
      this.driver.all(`
        SELECT event_type AS label, COUNT(*) AS count
        FROM scholarship_events GROUP BY event_type ORDER BY count DESC, label
      `),
      this.driver.all(`
        SELECT 'Report Card (80%)' AS label, ROUND(COALESCE(AVG(report_card_score), 0) * 0.80, 2) AS count FROM scholarship_renewal_evaluations
        UNION ALL
        SELECT 'Tutorial / Activities (5%)', ROUND(COALESCE(AVG(tutorial_activities_score), 0) * 0.05, 2) FROM scholarship_renewal_evaluations
        UNION ALL
        SELECT 'Parent / Service (5%)', ROUND(COALESCE(AVG(parent_service_score), 0) * 0.05, 2) FROM scholarship_renewal_evaluations
        UNION ALL
        SELECT 'Compliance (5%)', ROUND(COALESCE(AVG(compliance_score), 0) * 0.05, 2) FROM scholarship_renewal_evaluations
        UNION ALL
        SELECT 'Mass (5%)', ROUND(COALESCE(AVG(mass_score), 0) * 0.05, 2) FROM scholarship_renewal_evaluations
        UNION ALL
        SELECT 'Adjustment', ROUND(COALESCE(AVG(adjustment_score), 0), 2) FROM scholarship_renewal_evaluations
      `),
      this.driver.all(`
        SELECT overall_evaluation AS label, COUNT(*) AS count
        FROM scholarship_renewal_evaluations GROUP BY overall_evaluation ORDER BY count DESC, label
      `),
      this.driver.all("SELECT * FROM scholarship_audit_log ORDER BY created_at DESC, id DESC LIMIT 12")
    ]);
    return {
      stats: {
        scholars: Number(counts?.scholars || 0),
        activeScholars: Number(counts?.active_scholars || 0),
        activeSponsors: Number(counts?.active_sponsors || 0),
        activeEnrollments: Number(counts?.active_enrollments || 0),
        pendingRenewals: Number(counts?.pending_renewals || 0),
        overdueRenewals: Number(counts?.overdue_renewals || 0),
        weightedEvaluations: Number(counts?.weighted_evaluations || 0),
        pendingWeightedDecisions: Number(counts?.pending_weighted_decisions || 0),
        weightedNeedsReview: Number(counts?.weighted_needs_review || 0),
        averageRenewalRating: Number(counts?.average_renewal_rating || 0),
        completedEvaluations: Number(counts?.completed_evaluations || 0),
        flaggedEvaluations: Number(counts?.flagged_evaluations || 0),
        events: Number(counts?.events || 0),
        gradeRecords: Number(counts?.grade_records || 0),
        percentageAlerts: Number(counts?.percentage_alerts || 0),
        attendanceRate: Number(attendanceStats?.total || 0)
          ? Math.round(Number(attendanceStats.attended || 0) / Number(attendanceStats.total) * 10000) / 100
          : 0,
        pledged: Number(finance?.pledged || 0),
        received: Number(finance?.received || 0),
        allocated: Number(finance?.allocated || 0),
        unallocated: Math.max(0, Number(finance?.received || 0) - Number(finance?.allocated || 0))
      },
      analytics: {
        byLevel,
        byStatus,
        attendance,
        renewal,
        gradeScales,
        attendanceByLevel,
        attendanceByYear,
        attendanceByEvent,
        evaluationByLevel,
        evaluationByYear,
        byChapel,
        attendanceByType,
        renewalComponents,
        renewalDecisions
      },
      recent
    };
  }

  async financialYearSummary(year) {
    const normalizedYear = String(Number(year) || new Date().getFullYear());
    const [totals, monthly, sponsors, invoiceStates, receiptStates] = await Promise.all([
      this.driver.get(`
        SELECT
          (SELECT COALESCE(SUM(amount_php), 0) FROM scholarship_pledges WHERE substr(pledge_date, 1, 4) = ? AND status <> 'Cancelled') AS pledged,
          (SELECT COALESCE(SUM(amount_php), 0) FROM scholarship_payments WHERE substr(payment_date, 1, 4) = ? AND status = 'Cleared') AS received,
          (SELECT COALESCE(SUM(amount_php), 0) FROM scholarship_payments WHERE substr(payment_date, 1, 4) = ? AND status = 'Reversed') AS reversed,
          (SELECT COALESCE(SUM(amount_php), 0) FROM scholarship_allocations WHERE substr(allocation_date, 1, 4) = ?) AS allocated
      `, [normalizedYear, normalizedYear, normalizedYear, normalizedYear]),
      this.driver.all(`
        SELECT month,
               ROUND(SUM(pledged), 2) AS pledged,
               ROUND(SUM(received), 2) AS received,
               ROUND(SUM(reversed), 2) AS reversed,
               ROUND(SUM(allocated), 2) AS allocated
        FROM (
          SELECT substr(pledge_date, 1, 7) AS month, amount_php AS pledged, 0 AS received, 0 AS reversed, 0 AS allocated
          FROM scholarship_pledges WHERE substr(pledge_date, 1, 4) = ? AND status <> 'Cancelled'
          UNION ALL
          SELECT substr(payment_date, 1, 7), 0, CASE WHEN status = 'Cleared' THEN amount_php ELSE 0 END,
                 CASE WHEN status = 'Reversed' THEN amount_php ELSE 0 END, 0
          FROM scholarship_payments WHERE substr(payment_date, 1, 4) = ?
          UNION ALL
          SELECT substr(allocation_date, 1, 7), 0, 0, 0, amount_php
          FROM scholarship_allocations WHERE substr(allocation_date, 1, 4) = ?
        ) movements
        GROUP BY month ORDER BY month
      `, [normalizedYear, normalizedYear, normalizedYear]),
      this.driver.all(`
        SELECT s.id, s.sponsor_no, s.sponsor_name,
               (SELECT COALESCE(SUM(p.amount_php), 0) FROM scholarship_pledges p WHERE p.sponsor_id = s.id AND substr(p.pledge_date, 1, 4) = ? AND p.status <> 'Cancelled') AS pledged,
               (SELECT COALESCE(SUM(p.amount_php), 0) FROM scholarship_payments p WHERE p.sponsor_id = s.id AND substr(p.payment_date, 1, 4) = ? AND p.status = 'Cleared') AS received
        FROM scholarship_sponsors s
        WHERE EXISTS (SELECT 1 FROM scholarship_pledges p WHERE p.sponsor_id = s.id AND substr(p.pledge_date, 1, 4) = ?)
           OR EXISTS (SELECT 1 FROM scholarship_payments p WHERE p.sponsor_id = s.id AND substr(p.payment_date, 1, 4) = ?)
        ORDER BY s.sponsor_name
      `, [normalizedYear, normalizedYear, normalizedYear, normalizedYear]),
      this.driver.all(`
        SELECT status AS label, COUNT(*) AS count FROM scholarship_invoices
        WHERE substr(issue_date, 1, 4) = ? GROUP BY status ORDER BY status
      `, [normalizedYear]),
      this.driver.all(`
        SELECT status AS label, COUNT(*) AS count FROM scholarship_receipts
        WHERE substr(issue_date, 1, 4) = ? GROUP BY status ORDER BY status
      `, [normalizedYear])
    ]);
    const pledged = Number(totals?.pledged || 0);
    const received = Number(totals?.received || 0);
    const reversed = Number(totals?.reversed || 0);
    const allocated = Number(totals?.allocated || 0);
    return {
      year: Number(normalizedYear),
      totals: {
        pledged,
        received,
        reversed,
        allocated,
        outstanding: Math.max(0, Math.round((pledged - received) * 100) / 100),
        unallocated: Math.max(0, Math.round((received - allocated) * 100) / 100)
      },
      monthly,
      sponsors: sponsors.map(item => ({
        ...item,
        pledged: Number(item.pledged || 0),
        received: Number(item.received || 0),
        outstanding: Math.max(0, Math.round((Number(item.pledged || 0) - Number(item.received || 0)) * 100) / 100)
      })),
      documents: { invoices: invoiceStates, receipts: receiptStates }
    };
  }

  async exportAll() {
    const result = { exportedAt: nowIso() };
    for (const entity of Object.keys(ENTITY_DEFINITIONS)) {
      if (entity === "audit") continue;
      result[entity] = await this.exportEntity(entity);
    }
    result.householdMembers = await this.driver.all("SELECT * FROM scholarship_household_members ORDER BY scholar_id, row_order, id");
    result.renewalTemplateItems = await this.driver.all("SELECT * FROM scholarship_renewal_template_items ORDER BY template_id, row_order, id");
    result.renewalResponses = await this.driver.all("SELECT * FROM scholarship_renewal_responses ORDER BY renewal_id, template_item_id");
    result.evaluationCriteria = await this.driver.all("SELECT * FROM scholarship_evaluation_criteria ORDER BY template_id, row_order, id");
    result.evaluationScores = await this.driver.all("SELECT * FROM scholarship_evaluation_scores ORDER BY evaluation_id, criterion_id");
    return result;
  }

  async exportEntity(entity, options = {}) {
    const records = [];
    const pageSize = 500;
    const total = await this.count(entity, options);
    for (let offset = 0; offset < total; offset += pageSize) {
      records.push(...await this.list(entity, { ...options, limit: pageSize, offset }));
    }
    return records;
  }
}

function initializeLocalScholarship(db) {
  db.exec(`${SCHOLARSHIP_SCHEMA_STATEMENTS.join(";\n")};`);
  for (const statement of SCHOLARSHIP_MIGRATION_STATEMENTS) {
    try { db.exec(statement); } catch (error) {
      if (!/duplicate column name|already exists/i.test(String(error?.message || error))) throw error;
    }
  }
  const archiveMigration = db.prepare("SELECT migration_key FROM app_schema_migrations WHERE migration_key = ?").get(SCHOLARSHIP_ARCHIVE_MIGRATION_KEY);
  if (!archiveMigration) {
    for (const table of archivableScholarshipTables()) {
      try { db.exec(`ALTER TABLE ${table} ADD COLUMN deleted_at TEXT NOT NULL DEFAULT ''`); } catch (error) {
        if (!/duplicate column name|already exists/i.test(String(error?.message || error))) throw error;
      }
    }
    db.prepare("INSERT OR REPLACE INTO app_schema_migrations (migration_key, applied_at) VALUES (?, ?)").run(SCHOLARSHIP_ARCHIVE_MIGRATION_KEY, nowIso());
  }
  for (const statement of SCHOLARSHIP_POST_MIGRATION_STATEMENTS) db.exec(statement);
  const timestamp = nowIso();
  const insertChapel = db.prepare(`
    INSERT OR IGNORE INTO scholarship_chapels
    (chapel_code, chapel_name, created_at, updated_at) VALUES (?, ?, ?, ?)
  `);
  for (const [code, name] of SCHOLARSHIP_CHAPELS) insertChapel.run(code, name, timestamp, timestamp);
  db.prepare("UPDATE scholarship_chapels SET chapel_name = ?, updated_at = ? WHERE chapel_code = ?").run("Sto. Nino", timestamp, "STO_NINO");
  return new ScholarshipStore(localDriver(db));
}

async function initializeTursoScholarship(database) {
  await database.executeBatch(SCHOLARSHIP_SCHEMA_STATEMENTS, "write", true);
  for (const statement of SCHOLARSHIP_MIGRATION_STATEMENTS) {
    try { await database.execute(statement); } catch (error) {
      if (!/duplicate column name|already exists/i.test(String(error?.message || error))) throw error;
    }
  }
  const archiveMigration = await database.execute("SELECT migration_key FROM app_schema_migrations WHERE migration_key = ?", [SCHOLARSHIP_ARCHIVE_MIGRATION_KEY]);
  if (!(archiveMigration.rows || []).length) {
    for (const table of archivableScholarshipTables()) {
      try { await database.execute(`ALTER TABLE ${table} ADD COLUMN deleted_at TEXT NOT NULL DEFAULT ''`); } catch (error) {
        if (!/duplicate column name|already exists/i.test(String(error?.message || error))) throw error;
      }
    }
    await database.execute("INSERT OR REPLACE INTO app_schema_migrations (migration_key, applied_at) VALUES (?, ?)", [SCHOLARSHIP_ARCHIVE_MIGRATION_KEY, nowIso()]);
  }
  await database.executeBatch(SCHOLARSHIP_POST_MIGRATION_STATEMENTS, "write", true);
  const timestamp = nowIso();
  await database.executeBatch(SCHOLARSHIP_CHAPELS.map(([code, name]) => ({
    sql: `INSERT OR IGNORE INTO scholarship_chapels
          (chapel_code, chapel_name, created_at, updated_at) VALUES (?, ?, ?, ?)`,
    args: [code, name, timestamp, timestamp]
  })), "write", true);
  await database.execute("UPDATE scholarship_chapels SET chapel_name = ?, updated_at = ? WHERE chapel_code = ?", ["Sto. Nino", timestamp, "STO_NINO"]);
  return new ScholarshipStore(tursoDriver(database));
}

function archivableScholarshipTables() {
  return [...new Set(Object.values(ENTITY_DEFINITIONS).filter(definition => !definition.readOnly).map(definition => definition.table))];
}

module.exports = {
  ENTITY_DEFINITIONS,
  SCHOLARSHIP_PROGRAM_CODE,
  SCHOLARSHIP_ROLES,
  SCHOLARSHIP_ATTENDANCE_TYPES,
  SCHOLARSHIP_CHAPELS,
  SCHOLARSHIP_REQUIREMENT_STATUSES,
  SCHOLARSHIP_RENEWAL_DECISIONS,
  SCHOLARSHIP_SCHEMA_STATEMENTS,
  SCHOLARSHIP_MIGRATION_STATEMENTS,
  SCHOLARSHIP_POST_MIGRATION_STATEMENTS,
  ScholarshipStore,
  initializeLocalScholarship,
  initializeTursoScholarship
};
