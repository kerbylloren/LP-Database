const { PROGRAM_CODES, PROGRAM_ROLES } = require("./program-roles");

const OPERATIONS_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS operations_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_no TEXT NOT NULL DEFAULT '',
    case_type TEXT NOT NULL DEFAULT 'Program Incident',
    confidentiality_level TEXT NOT NULL DEFAULT 'Restricted',
    program_code TEXT NOT NULL DEFAULT 'administration',
    incident_date TEXT NOT NULL DEFAULT '',
    reported_date TEXT NOT NULL DEFAULT '',
    subject_name TEXT NOT NULL DEFAULT '',
    subject_reference TEXT NOT NULL DEFAULT '',
    reporter_name TEXT NOT NULL DEFAULT '',
    assigned_to TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    evidence_url TEXT NOT NULL DEFAULT '',
    immediate_response TEXT NOT NULL DEFAULT '',
    referral_details TEXT NOT NULL DEFAULT '',
    follow_up_date TEXT NOT NULL DEFAULT '',
    resolution TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Open',
    approved_by TEXT NOT NULL DEFAULT '',
    approved_at TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_operations_cases_no ON operations_cases(case_no) WHERE case_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_operations_cases_status ON operations_cases(program_code, case_type, status, incident_date)",
  `CREATE TABLE IF NOT EXISTS operations_people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_no TEXT NOT NULL DEFAULT '',
    person_type TEXT NOT NULL DEFAULT 'Volunteer',
    program_code TEXT NOT NULL DEFAULT 'administration',
    role_title TEXT NOT NULL DEFAULT '',
    full_name TEXT NOT NULL DEFAULT '',
    contact_no TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    emergency_contact TEXT NOT NULL DEFAULT '',
    start_date TEXT NOT NULL DEFAULT '',
    end_date TEXT NOT NULL DEFAULT '',
    moa_status TEXT NOT NULL DEFAULT 'Pending',
    moa_date TEXT NOT NULL DEFAULT '',
    id_status TEXT NOT NULL DEFAULT 'Pending',
    background_check_status TEXT NOT NULL DEFAULT 'Pending',
    background_check_date TEXT NOT NULL DEFAULT '',
    health_check_date TEXT NOT NULL DEFAULT '',
    training_status TEXT NOT NULL DEFAULT 'Pending',
    status TEXT NOT NULL DEFAULT 'Active',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_operations_people_no ON operations_people(person_no) WHERE person_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_operations_people_program ON operations_people(program_code, person_type, status, full_name)",
  `CREATE TABLE IF NOT EXISTS operations_personnel_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_no TEXT NOT NULL DEFAULT '',
    person_id INTEGER,
    program_code TEXT NOT NULL DEFAULT 'administration',
    action_type TEXT NOT NULL DEFAULT 'Training',
    period_label TEXT NOT NULL DEFAULT '',
    start_date TEXT NOT NULL DEFAULT '',
    end_date TEXT NOT NULL DEFAULT '',
    hours REAL NOT NULL DEFAULT 0,
    days REAL NOT NULL DEFAULT 0,
    amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Draft',
    approved_by TEXT NOT NULL DEFAULT '',
    approval_date TEXT NOT NULL DEFAULT '',
    document_url TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (person_id) REFERENCES operations_people(id) ON DELETE SET NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_operations_personnel_action_no ON operations_personnel_actions(action_no) WHERE action_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_operations_personnel_actions ON operations_personnel_actions(program_code, action_type, status, start_date)",
  `CREATE TABLE IF NOT EXISTS operations_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_no TEXT NOT NULL DEFAULT '',
    program_code TEXT NOT NULL DEFAULT 'administration',
    location TEXT NOT NULL DEFAULT '',
    item_name TEXT NOT NULL DEFAULT '',
    asset_type TEXT NOT NULL DEFAULT 'Equipment',
    quantity REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT '',
    acquisition_type TEXT NOT NULL DEFAULT 'Procured',
    acquisition_date TEXT NOT NULL DEFAULT '',
    acquisition_cost REAL NOT NULL DEFAULT 0,
    donor_name TEXT NOT NULL DEFAULT '',
    item_condition TEXT NOT NULL DEFAULT 'Good',
    custodian TEXT NOT NULL DEFAULT '',
    tag_date TEXT NOT NULL DEFAULT '',
    last_maintenance_date TEXT NOT NULL DEFAULT '',
    next_maintenance_date TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'In Service',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_operations_assets_no ON operations_assets(asset_no) WHERE asset_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_operations_assets_program ON operations_assets(program_code, asset_type, status, item_name)",
  `CREATE TABLE IF NOT EXISTS operations_procurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_no TEXT NOT NULL DEFAULT '',
    program_code TEXT NOT NULL DEFAULT 'administration',
    request_date TEXT NOT NULL DEFAULT '',
    requested_by TEXT NOT NULL DEFAULT '',
    purpose TEXT NOT NULL DEFAULT '',
    item_summary TEXT NOT NULL DEFAULT '',
    quantity REAL NOT NULL DEFAULT 0,
    estimated_amount REAL NOT NULL DEFAULT 0,
    quotation_details TEXT NOT NULL DEFAULT '',
    supplier TEXT NOT NULL DEFAULT '',
    approved_by TEXT NOT NULL DEFAULT '',
    approved_date TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Requested',
    received_by TEXT NOT NULL DEFAULT '',
    received_date TEXT NOT NULL DEFAULT '',
    inspected_by TEXT NOT NULL DEFAULT '',
    inspection_result TEXT NOT NULL DEFAULT '',
    cash_voucher_no TEXT NOT NULL DEFAULT '',
    document_url TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_operations_procurements_no ON operations_procurements(request_no) WHERE request_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_operations_procurements_program ON operations_procurements(program_code, status, request_date)",
  `CREATE TABLE IF NOT EXISTS operations_finance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference_no TEXT NOT NULL DEFAULT '',
    record_type TEXT NOT NULL DEFAULT 'Disbursement',
    program_code TEXT NOT NULL DEFAULT 'administration',
    transaction_date TEXT NOT NULL DEFAULT '',
    period_label TEXT NOT NULL DEFAULT '',
    fund_name TEXT NOT NULL DEFAULT '',
    restriction_type TEXT NOT NULL DEFAULT 'Unrestricted',
    counterparty TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    amount REAL NOT NULL DEFAULT 0,
    due_date TEXT NOT NULL DEFAULT '',
    liquidation_date TEXT NOT NULL DEFAULT '',
    bank_reference TEXT NOT NULL DEFAULT '',
    prepared_by TEXT NOT NULL DEFAULT '',
    approved_by TEXT NOT NULL DEFAULT '',
    approval_date TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Draft',
    document_url TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_operations_finance_no ON operations_finance(reference_no) WHERE reference_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_operations_finance_program ON operations_finance(program_code, record_type, status, transaction_date)",
  `CREATE TABLE IF NOT EXISTS operations_donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donation_no TEXT NOT NULL DEFAULT '',
    donor_name TEXT NOT NULL DEFAULT '',
    anonymous INTEGER NOT NULL DEFAULT 0,
    donation_type TEXT NOT NULL DEFAULT 'Cash',
    program_code TEXT NOT NULL DEFAULT 'administration',
    restriction_type TEXT NOT NULL DEFAULT 'Unrestricted',
    purpose TEXT NOT NULL DEFAULT '',
    received_date TEXT NOT NULL DEFAULT '',
    cash_amount REAL NOT NULL DEFAULT 0,
    item_description TEXT NOT NULL DEFAULT '',
    quantity REAL NOT NULL DEFAULT 0,
    item_condition TEXT NOT NULL DEFAULT '',
    estimated_value REAL NOT NULL DEFAULT 0,
    acknowledgment_no TEXT NOT NULL DEFAULT '',
    deposit_reference TEXT NOT NULL DEFAULT '',
    recipient_summary TEXT NOT NULL DEFAULT '',
    distribution_date TEXT NOT NULL DEFAULT '',
    consent_status TEXT NOT NULL DEFAULT 'Not Required',
    status TEXT NOT NULL DEFAULT 'Received',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_operations_donations_no ON operations_donations(donation_no) WHERE donation_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_operations_donations_program ON operations_donations(program_code, donation_type, received_date)",
  `CREATE TABLE IF NOT EXISTS operations_donation_distributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    distribution_no TEXT NOT NULL DEFAULT '',
    donation_id INTEGER,
    program_code TEXT NOT NULL DEFAULT 'administration',
    distribution_date TEXT NOT NULL DEFAULT '',
    recipient_name TEXT NOT NULL DEFAULT '',
    recipient_reference TEXT NOT NULL DEFAULT '',
    item_description TEXT NOT NULL DEFAULT '',
    quantity REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT '',
    amount_value REAL NOT NULL DEFAULT 0,
    received_by TEXT NOT NULL DEFAULT '',
    acknowledgment_status TEXT NOT NULL DEFAULT 'Pending',
    consent_status TEXT NOT NULL DEFAULT 'Not Required',
    photo_reference_url TEXT NOT NULL DEFAULT '',
    distributed_by TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (donation_id) REFERENCES operations_donations(id) ON DELETE SET NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_operations_distribution_no ON operations_donation_distributions(distribution_no) WHERE distribution_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_operations_distributions ON operations_donation_distributions(program_code, distribution_date, acknowledgment_status)",
  `CREATE TABLE IF NOT EXISTS operations_compliance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_no TEXT NOT NULL DEFAULT '',
    item_type TEXT NOT NULL DEFAULT 'Report',
    program_code TEXT NOT NULL DEFAULT 'administration',
    title TEXT NOT NULL DEFAULT '',
    frequency TEXT NOT NULL DEFAULT 'As Needed',
    due_date TEXT NOT NULL DEFAULT '',
    completed_date TEXT NOT NULL DEFAULT '',
    responsible_person TEXT NOT NULL DEFAULT '',
    approver TEXT NOT NULL DEFAULT '',
    approval_date TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pending',
    document_url TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_operations_compliance_no ON operations_compliance(item_no) WHERE item_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_operations_compliance_due ON operations_compliance(program_code, status, due_date)",
  `CREATE TABLE IF NOT EXISTS operations_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_no TEXT NOT NULL DEFAULT '',
    program_code TEXT NOT NULL DEFAULT 'administration',
    policy_area TEXT NOT NULL DEFAULT 'Operations',
    title TEXT NOT NULL DEFAULT '',
    version TEXT NOT NULL DEFAULT '1.0',
    effective_date TEXT NOT NULL DEFAULT '',
    review_date TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Draft',
    approved_by TEXT NOT NULL DEFAULT '',
    approval_date TEXT NOT NULL DEFAULT '',
    supersedes_policy_id INTEGER,
    policy_text TEXT NOT NULL DEFAULT '',
    document_url TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (supersedes_policy_id) REFERENCES operations_policies(id) ON DELETE SET NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_operations_policy_no ON operations_policies(policy_no) WHERE policy_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_operations_policies ON operations_policies(program_code, policy_area, status, review_date)",
  `CREATE TABLE IF NOT EXISTS nutrition_admissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiary_id INTEGER,
    center_id INTEGER,
    application_date TEXT NOT NULL DEFAULT '',
    screening_age INTEGER,
    solid_food_capable INTEGER NOT NULL DEFAULT 0,
    nutrition_screening TEXT NOT NULL DEFAULT '',
    residence_eligible INTEGER NOT NULL DEFAULT 0,
    indigent_assessment TEXT NOT NULL DEFAULT '',
    house_visit_date TEXT NOT NULL DEFAULT '',
    socioeconomic_findings TEXT NOT NULL DEFAULT '',
    parent_agreement INTEGER NOT NULL DEFAULT 0,
    duty_commitment INTEGER NOT NULL DEFAULT 0,
    orientation_date TEXT NOT NULL DEFAULT '',
    decision TEXT NOT NULL DEFAULT 'Pending',
    decision_date TEXT NOT NULL DEFAULT '',
    rejection_reason TEXT NOT NULL DEFAULT '',
    approved_by TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (beneficiary_id) REFERENCES nutrition_beneficiaries(id) ON DELETE SET NULL,
    FOREIGN KEY (center_id) REFERENCES nutrition_centers(id) ON DELETE SET NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_nutrition_admissions_decision ON nutrition_admissions(center_id, decision, application_date)",
  `CREATE TABLE IF NOT EXISTS nutrition_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiary_id INTEGER NOT NULL,
    center_id INTEGER,
    attendance_date TEXT NOT NULL,
    attendance_status TEXT NOT NULL DEFAULT 'Present',
    meal_received INTEGER NOT NULL DEFAULT 1,
    guardian_present INTEGER NOT NULL DEFAULT 0,
    parent_duty INTEGER NOT NULL DEFAULT 0,
    recorded_by_name TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(beneficiary_id, attendance_date),
    FOREIGN KEY (beneficiary_id) REFERENCES nutrition_beneficiaries(id) ON DELETE CASCADE,
    FOREIGN KEY (center_id) REFERENCES nutrition_centers(id) ON DELETE SET NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_nutrition_attendance_date ON nutrition_attendance(center_id, attendance_date, attendance_status)",
  `CREATE TABLE IF NOT EXISTS nutrition_health_safety (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_scope TEXT NOT NULL DEFAULT 'Child',
    beneficiary_id INTEGER,
    center_id INTEGER,
    record_type TEXT NOT NULL DEFAULT 'Health Screening',
    record_date TEXT NOT NULL DEFAULT '',
    finding TEXT NOT NULL DEFAULT '',
    action_taken TEXT NOT NULL DEFAULT '',
    provider TEXT NOT NULL DEFAULT '',
    next_due_date TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Completed',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (beneficiary_id) REFERENCES nutrition_beneficiaries(id) ON DELETE SET NULL,
    FOREIGN KEY (center_id) REFERENCES nutrition_centers(id) ON DELETE SET NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_nutrition_health_safety ON nutrition_health_safety(center_id, record_type, record_date)",
  `CREATE TABLE IF NOT EXISTS scholarship_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scholar_id INTEGER,
    chapel_id INTEGER,
    academic_year_id INTEGER,
    application_date TEXT NOT NULL DEFAULT '',
    slot_status TEXT NOT NULL DEFAULT 'Pending',
    final_rating REAL NOT NULL DEFAULT 0,
    house_visit_date TEXT NOT NULL DEFAULT '',
    socioeconomic_findings TEXT NOT NULL DEFAULT '',
    decision TEXT NOT NULL DEFAULT 'Pending',
    decision_date TEXT NOT NULL DEFAULT '',
    orientation_date TEXT NOT NULL DEFAULT '',
    moa_status TEXT NOT NULL DEFAULT 'Pending',
    moa_date TEXT NOT NULL DEFAULT '',
    approved_by_name TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (scholar_id) REFERENCES scholarship_scholars(id) ON DELETE SET NULL,
    FOREIGN KEY (chapel_id) REFERENCES scholarship_chapels(id) ON DELETE SET NULL,
    FOREIGN KEY (academic_year_id) REFERENCES scholarship_academic_years(id) ON DELETE SET NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_applications ON scholarship_applications(academic_year_id, chapel_id, decision)",
  `CREATE TABLE IF NOT EXISTS scholarship_communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scholar_id INTEGER,
    sponsor_id INTEGER,
    communication_type TEXT NOT NULL DEFAULT 'Progress Report',
    due_date TEXT NOT NULL DEFAULT '',
    sent_date TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pending',
    document_url TEXT NOT NULL DEFAULT '',
    delivery_channel TEXT NOT NULL DEFAULT '',
    case_summary TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (scholar_id) REFERENCES scholarship_scholars(id) ON DELETE SET NULL,
    FOREIGN KEY (sponsor_id) REFERENCES scholarship_sponsors(id) ON DELETE SET NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_communications ON scholarship_communications(status, due_date, communication_type)",
  `CREATE TABLE IF NOT EXISTS scholarship_tutorials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scholar_id INTEGER,
    enrollment_id INTEGER,
    tutorial_type TEXT NOT NULL DEFAULT 'Math',
    enrollment_date TEXT NOT NULL DEFAULT '',
    schedule TEXT NOT NULL DEFAULT '',
    diagnostic_score REAL NOT NULL DEFAULT 0,
    post_diagnostic_score REAL NOT NULL DEFAULT 0,
    worksheet_level TEXT NOT NULL DEFAULT '',
    progress_status TEXT NOT NULL DEFAULT 'Enrolled',
    last_session_date TEXT NOT NULL DEFAULT '',
    instructor TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (scholar_id) REFERENCES scholarship_scholars(id) ON DELETE SET NULL,
    FOREIGN KEY (enrollment_id) REFERENCES scholarship_enrollments(id) ON DELETE SET NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_scholarship_tutorials ON scholarship_tutorials(tutorial_type, progress_status, last_session_date)",
  `CREATE TABLE IF NOT EXISTS health_patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_no TEXT NOT NULL DEFAULT '',
    full_name TEXT NOT NULL DEFAULT '',
    birth_date TEXT NOT NULL DEFAULT '',
    gender TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    contact_no TEXT NOT NULL DEFAULT '',
    companion_name TEXT NOT NULL DEFAULT '',
    companion_contact TEXT NOT NULL DEFAULT '',
    indigent_status TEXT NOT NULL DEFAULT 'For Assessment',
    allergies TEXT NOT NULL DEFAULT '',
    medical_history TEXT NOT NULL DEFAULT '',
    tb_status TEXT NOT NULL DEFAULT 'Not Assessed',
    confidentiality_level TEXT NOT NULL DEFAULT 'Restricted',
    status TEXT NOT NULL DEFAULT 'Active',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_health_patients_no ON health_patients(patient_no) WHERE patient_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_health_patients_name ON health_patients(full_name, status, tb_status)",
  `CREATE TABLE IF NOT EXISTS health_encounters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    visit_date TEXT NOT NULL DEFAULT '',
    visit_type TEXT NOT NULL DEFAULT 'Regular Consultation',
    queue_no INTEGER,
    companion_name TEXT NOT NULL DEFAULT '',
    temperature REAL NOT NULL DEFAULT 0,
    screening_result TEXT NOT NULL DEFAULT '',
    consultation_notes TEXT NOT NULL DEFAULT '',
    diagnosis TEXT NOT NULL DEFAULT '',
    prescription_summary TEXT NOT NULL DEFAULT '',
    laboratory_request TEXT NOT NULL DEFAULT '',
    charges REAL NOT NULL DEFAULT 0,
    minimum_donation REAL NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'Pending',
    attending_staff TEXT NOT NULL DEFAULT '',
    next_visit_date TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Open',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES health_patients(id) ON DELETE CASCADE
  )`,
  "CREATE INDEX IF NOT EXISTS idx_health_encounters_date ON health_encounters(visit_date, visit_type, status)",
  `CREATE TABLE IF NOT EXISTS health_tb_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    record_type TEXT NOT NULL DEFAULT 'DOT Administration',
    tb_case_no TEXT NOT NULL DEFAULT '',
    record_date TEXT NOT NULL DEFAULT '',
    medicine TEXT NOT NULL DEFAULT '',
    dose TEXT NOT NULL DEFAULT '',
    observed_by TEXT NOT NULL DEFAULT '',
    result TEXT NOT NULL DEFAULT '',
    next_date TEXT NOT NULL DEFAULT '',
    treatment_status TEXT NOT NULL DEFAULT 'Ongoing',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES health_patients(id) ON DELETE CASCADE
  )`,
  "CREATE INDEX IF NOT EXISTS idx_health_tb_records ON health_tb_records(patient_id, record_type, record_date)",
  `CREATE TABLE IF NOT EXISTS health_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_no TEXT NOT NULL DEFAULT '',
    item_name TEXT NOT NULL DEFAULT '',
    item_type TEXT NOT NULL DEFAULT 'Medicine',
    batch_no TEXT NOT NULL DEFAULT '',
    expiry_date TEXT NOT NULL DEFAULT '',
    quantity REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT '',
    reorder_level REAL NOT NULL DEFAULT 0,
    storage_location TEXT NOT NULL DEFAULT '',
    supplier TEXT NOT NULL DEFAULT '',
    last_movement_date TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Available',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_health_inventory_no ON health_inventory(item_no) WHERE item_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_health_inventory_fefo ON health_inventory(item_type, expiry_date, quantity)",
  `CREATE TABLE IF NOT EXISTS health_equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_no TEXT NOT NULL DEFAULT '',
    equipment_name TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    item_condition TEXT NOT NULL DEFAULT 'Good',
    purchase_date TEXT NOT NULL DEFAULT '',
    acquisition_cost REAL NOT NULL DEFAULT 0,
    last_maintenance_date TEXT NOT NULL DEFAULT '',
    next_maintenance_date TEXT NOT NULL DEFAULT '',
    custodian TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'In Service',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    deleted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_health_equipment_no ON health_equipment(equipment_no) WHERE equipment_no <> ''",
  "CREATE INDEX IF NOT EXISTS idx_health_equipment_maintenance ON health_equipment(status, next_maintenance_date)",
  `CREATE TABLE IF NOT EXISTS app_record_bin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_code TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    source_id INTEGER,
    display_label TEXT NOT NULL DEFAULT '',
    snapshot_json TEXT NOT NULL,
    deleted_by INTEGER,
    deleted_at TEXT NOT NULL,
    restored_by INTEGER,
    restored_at TEXT NOT NULL DEFAULT ''
  )`,
  "CREATE INDEX IF NOT EXISTS idx_app_record_bin_program ON app_record_bin(program_code, restored_at, deleted_at DESC)",
  `CREATE TABLE IF NOT EXISTS operations_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    program_code TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    summary TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_operations_audit_created ON operations_audit_log(created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_operations_audit_entity ON operations_audit_log(program_code, entity_type, entity_id)"
];

const ENTITY_DEFINITIONS = {
  cases: definition("operations_cases", "administration", "case_no", "CAS", ["case_no", "case_type", "program_code", "incident_date", "subject_name", "subject_reference", "reporter_name", "assigned_to", "description", "immediate_response", "referral_details", "resolution", "status"], ["program_code", "case_type", "confidentiality_level", "status"], "incident_date DESC, id DESC", ["case_type", "program_code", "incident_date", "description"]),
  people: definition("operations_people", "administration", "person_no", "PER", ["person_no", "person_type", "program_code", "role_title", "full_name", "contact_no", "email", "address", "emergency_contact", "moa_status", "id_status", "background_check_status", "training_status", "status", "notes"], ["program_code", "person_type", "status", "moa_status", "background_check_status"], "full_name, id", ["full_name", "person_type", "program_code"]),
  personnelActions: definition("operations_personnel_actions", "administration", "action_no", "PRA", ["action_no", "program_code", "action_type", "period_label", "approved_by", "status", "notes"], ["person_id", "program_code", "action_type", "status"], "start_date DESC, id DESC", ["person_id", "action_type"]),
  assets: definition("operations_assets", "administration", "asset_no", "AST", ["asset_no", "program_code", "location", "item_name", "asset_type", "donor_name", "item_condition", "custodian", "status", "notes"], ["program_code", "asset_type", "item_condition", "status", "location"], "item_name, id", ["program_code", "item_name", "asset_type"]),
  procurements: definition("operations_procurements", "administration", "request_no", "PRQ", ["request_no", "program_code", "requested_by", "purpose", "item_summary", "quotation_details", "supplier", "approved_by", "status", "cash_voucher_no", "notes"], ["program_code", "status", "supplier"], "request_date DESC, id DESC", ["request_date", "item_summary"]),
  finance: definition("operations_finance", "administration", "reference_no", "FIN", ["reference_no", "record_type", "program_code", "period_label", "fund_name", "restriction_type", "counterparty", "description", "bank_reference", "prepared_by", "approved_by", "status", "notes"], ["program_code", "record_type", "restriction_type", "status"], "transaction_date DESC, id DESC", ["record_type", "program_code", "transaction_date", "description"]),
  donations: definition("operations_donations", "administration", "donation_no", "DON", ["donation_no", "donor_name", "donation_type", "program_code", "restriction_type", "purpose", "item_description", "item_condition", "acknowledgment_no", "deposit_reference", "recipient_summary", "consent_status", "status", "notes"], ["program_code", "donation_type", "restriction_type", "anonymous", "status"], "received_date DESC, id DESC", ["donor_name", "donation_type", "program_code", "received_date"]),
  distributions: definition("operations_donation_distributions", "administration", "distribution_no", "DST", ["distribution_no", "program_code", "recipient_name", "recipient_reference", "item_description", "received_by", "acknowledgment_status", "consent_status", "distributed_by", "notes"], ["donation_id", "program_code", "acknowledgment_status", "consent_status"], "distribution_date DESC, id DESC", ["recipient_name", "item_description", "distribution_date"]),
  compliance: definition("operations_compliance", "administration", "item_no", "CMP", ["item_no", "item_type", "program_code", "title", "frequency", "responsible_person", "approver", "status", "notes"], ["program_code", "item_type", "frequency", "status"], "CASE WHEN due_date = '' THEN 1 ELSE 0 END, due_date, id DESC", ["title"]),
  policies: definition("operations_policies", "administration", "policy_no", "POL", ["policy_no", "program_code", "policy_area", "title", "version", "approved_by", "status", "policy_text", "notes"], ["program_code", "policy_area", "status", "supersedes_policy_id"], "CASE WHEN review_date = '' THEN 1 ELSE 0 END, review_date, id DESC", ["title", "program_code", "policy_area"]),
  nutritionAdmissions: definition("nutrition_admissions", "nutrition", "", "", ["nutrition_screening", "indigent_assessment", "socioeconomic_findings", "decision", "rejection_reason", "approved_by", "notes"], ["center_id", "decision", "beneficiary_id"], "application_date DESC, id DESC", ["beneficiary_id", "application_date", "decision"]),
  nutritionAttendance: definition("nutrition_attendance", "nutrition", "", "", ["attendance_status", "recorded_by_name", "notes"], ["center_id", "beneficiary_id", "attendance_status", "attendance_date"], "attendance_date DESC, id DESC", ["beneficiary_id", "attendance_date", "attendance_status"]),
  nutritionHealthSafety: definition("nutrition_health_safety", "nutrition", "", "", ["record_scope", "record_type", "finding", "action_taken", "provider", "status", "notes"], ["record_scope", "center_id", "beneficiary_id", "record_type", "status"], "record_date DESC, id DESC", ["record_type", "record_date"]),
  scholarshipApplications: definition("scholarship_applications", "scholarship", "", "", ["slot_status", "socioeconomic_findings", "decision", "moa_status", "approved_by_name", "notes"], ["chapel_id", "academic_year_id", "decision", "slot_status", "moa_status", "scholar_id"], "application_date DESC, id DESC", ["scholar_id", "application_date", "decision"]),
  scholarshipCommunications: definition("scholarship_communications", "scholarship", "", "", ["communication_type", "status", "document_url", "delivery_channel", "case_summary", "notes"], ["scholar_id", "sponsor_id", "communication_type", "status"], "due_date DESC, id DESC", ["communication_type", "due_date", "status"]),
  scholarshipTutorials: definition("scholarship_tutorials", "scholarship", "", "", ["tutorial_type", "schedule", "worksheet_level", "progress_status", "instructor", "notes"], ["scholar_id", "enrollment_id", "tutorial_type", "progress_status"], "last_session_date DESC, id DESC", ["scholar_id", "tutorial_type"]),
  healthPatients: definition("health_patients", "health", "patient_no", "PAT", ["patient_no", "full_name", "gender", "address", "contact_no", "companion_name", "indigent_status", "allergies", "medical_history", "tb_status", "status", "notes"], ["gender", "indigent_status", "tb_status", "status", "confidentiality_level"], "full_name, id", ["full_name"]),
  healthEncounters: definition("health_encounters", "health", "", "", ["visit_type", "companion_name", "screening_result", "consultation_notes", "diagnosis", "prescription_summary", "laboratory_request", "payment_status", "attending_staff", "status", "notes"], ["patient_id", "visit_type", "payment_status", "status", "visit_date"], "visit_date DESC, id DESC", ["patient_id", "visit_date", "visit_type"]),
  healthTbRecords: definition("health_tb_records", "health", "", "", ["record_type", "tb_case_no", "medicine", "dose", "observed_by", "result", "treatment_status", "notes"], ["patient_id", "record_type", "treatment_status"], "record_date DESC, id DESC", ["patient_id", "record_type", "record_date"]),
  healthInventory: definition("health_inventory", "health", "item_no", "MED", ["item_no", "item_name", "item_type", "batch_no", "unit", "storage_location", "supplier", "status", "notes"], ["item_type", "status", "storage_location"], "CASE WHEN expiry_date = '' THEN 1 ELSE 0 END, expiry_date, item_name, id", ["item_name", "item_type"]),
  healthEquipment: definition("health_equipment", "health", "equipment_no", "EQP", ["equipment_no", "equipment_name", "category", "location", "item_condition", "custodian", "status", "notes"], ["category", "location", "item_condition", "status"], "equipment_name, id", ["equipment_name"]),
  audit: {
    table: "operations_audit_log",
    program: "administration",
    fields: ["user_id", "action", "program_code", "entity_type", "entity_id", "summary", "created_at"],
    required: [],
    search: ["action", "program_code", "entity_type", "summary"],
    filters: ["user_id", "action", "program_code", "entity_type", "entity_id"],
    order: "created_at DESC, id DESC",
    readOnly: true,
    noArchiveFilter: true
  }
};

function definition(table, program, numberField, prefix, search, filters, order, required) {
  return { table, program, number: numberField ? { field: numberField, prefix } : null, fields: [], required, search, filters, order };
}

const TABLE_FIELDS = {
  operations_cases: ["case_no", "case_type", "confidentiality_level", "program_code", "incident_date", "reported_date", "subject_name", "subject_reference", "reporter_name", "assigned_to", "description", "evidence_url", "immediate_response", "referral_details", "follow_up_date", "resolution", "status", "approved_by", "approved_at", "created_by"],
  operations_people: ["person_no", "person_type", "program_code", "role_title", "full_name", "contact_no", "email", "address", "emergency_contact", "start_date", "end_date", "moa_status", "moa_date", "id_status", "background_check_status", "background_check_date", "health_check_date", "training_status", "status", "notes", "created_by"],
  operations_personnel_actions: ["action_no", "person_id", "program_code", "action_type", "period_label", "start_date", "end_date", "hours", "days", "amount", "status", "approved_by", "approval_date", "document_url", "notes", "created_by"],
  operations_assets: ["asset_no", "program_code", "location", "item_name", "asset_type", "quantity", "unit", "acquisition_type", "acquisition_date", "acquisition_cost", "donor_name", "item_condition", "custodian", "tag_date", "last_maintenance_date", "next_maintenance_date", "status", "notes", "created_by"],
  operations_procurements: ["request_no", "program_code", "request_date", "requested_by", "purpose", "item_summary", "quantity", "estimated_amount", "quotation_details", "supplier", "approved_by", "approved_date", "status", "received_by", "received_date", "inspected_by", "inspection_result", "cash_voucher_no", "document_url", "notes", "created_by"],
  operations_finance: ["reference_no", "record_type", "program_code", "transaction_date", "period_label", "fund_name", "restriction_type", "counterparty", "description", "amount", "due_date", "liquidation_date", "bank_reference", "prepared_by", "approved_by", "approval_date", "status", "document_url", "notes", "created_by"],
  operations_donations: ["donation_no", "donor_name", "anonymous", "donation_type", "program_code", "restriction_type", "purpose", "received_date", "cash_amount", "item_description", "quantity", "item_condition", "estimated_value", "acknowledgment_no", "deposit_reference", "recipient_summary", "distribution_date", "consent_status", "status", "notes", "created_by"],
  operations_donation_distributions: ["distribution_no", "donation_id", "program_code", "distribution_date", "recipient_name", "recipient_reference", "item_description", "quantity", "unit", "amount_value", "received_by", "acknowledgment_status", "consent_status", "photo_reference_url", "distributed_by", "notes", "created_by"],
  operations_compliance: ["item_no", "item_type", "program_code", "title", "frequency", "due_date", "completed_date", "responsible_person", "approver", "approval_date", "status", "document_url", "notes", "created_by"],
  operations_policies: ["policy_no", "program_code", "policy_area", "title", "version", "effective_date", "review_date", "status", "approved_by", "approval_date", "supersedes_policy_id", "policy_text", "document_url", "notes", "created_by"],
  nutrition_admissions: ["beneficiary_id", "center_id", "application_date", "screening_age", "solid_food_capable", "nutrition_screening", "residence_eligible", "indigent_assessment", "house_visit_date", "socioeconomic_findings", "parent_agreement", "duty_commitment", "orientation_date", "decision", "decision_date", "rejection_reason", "approved_by", "notes", "created_by"],
  nutrition_attendance: ["beneficiary_id", "center_id", "attendance_date", "attendance_status", "meal_received", "guardian_present", "parent_duty", "recorded_by_name", "notes", "created_by"],
  nutrition_health_safety: ["record_scope", "beneficiary_id", "center_id", "record_type", "record_date", "finding", "action_taken", "provider", "next_due_date", "status", "notes", "created_by"],
  scholarship_applications: ["scholar_id", "chapel_id", "academic_year_id", "application_date", "slot_status", "final_rating", "house_visit_date", "socioeconomic_findings", "decision", "decision_date", "orientation_date", "moa_status", "moa_date", "approved_by_name", "notes", "created_by"],
  scholarship_communications: ["scholar_id", "sponsor_id", "communication_type", "due_date", "sent_date", "status", "document_url", "delivery_channel", "case_summary", "notes", "created_by"],
  scholarship_tutorials: ["scholar_id", "enrollment_id", "tutorial_type", "enrollment_date", "schedule", "diagnostic_score", "post_diagnostic_score", "worksheet_level", "progress_status", "last_session_date", "instructor", "notes", "created_by"],
  health_patients: ["patient_no", "full_name", "birth_date", "gender", "address", "contact_no", "companion_name", "companion_contact", "indigent_status", "allergies", "medical_history", "tb_status", "confidentiality_level", "status", "notes", "created_by"],
  health_encounters: ["patient_id", "visit_date", "visit_type", "queue_no", "companion_name", "temperature", "screening_result", "consultation_notes", "diagnosis", "prescription_summary", "laboratory_request", "charges", "minimum_donation", "payment_status", "attending_staff", "next_visit_date", "status", "notes", "created_by"],
  health_tb_records: ["patient_id", "record_type", "tb_case_no", "record_date", "medicine", "dose", "observed_by", "result", "next_date", "treatment_status", "notes", "created_by"],
  health_inventory: ["item_no", "item_name", "item_type", "batch_no", "expiry_date", "quantity", "unit", "reorder_level", "storage_location", "supplier", "last_movement_date", "status", "notes", "created_by"],
  health_equipment: ["equipment_no", "equipment_name", "category", "location", "item_condition", "purchase_date", "acquisition_cost", "last_maintenance_date", "next_maintenance_date", "custodian", "status", "notes", "created_by"]
};

// Definitions are declared before TABLE_FIELDS for readability; attach their field lists now.
for (const definitionValue of Object.values(ENTITY_DEFINITIONS)) {
  if (!definitionValue.fields?.length && TABLE_FIELDS[definitionValue.table]) definitionValue.fields = TABLE_FIELDS[definitionValue.table];
}

const NUMERIC_FIELDS = new Set([
  "user_id", "entity_id", "created_by", "beneficiary_id", "center_id", "scholar_id", "sponsor_id", "chapel_id", "academic_year_id", "enrollment_id", "patient_id", "person_id", "donation_id", "supersedes_policy_id",
  "screening_age", "queue_no", "solid_food_capable", "residence_eligible", "parent_agreement", "duty_commitment", "meal_received", "guardian_present", "parent_duty", "anonymous",
  "quantity", "acquisition_cost", "estimated_amount", "amount", "cash_amount", "estimated_value", "final_rating", "diagnostic_score", "post_diagnostic_score", "temperature", "charges", "minimum_donation", "reorder_level", "hours", "days", "amount_value"
]);

const DECIMAL_FIELDS = new Set(["quantity", "acquisition_cost", "estimated_amount", "amount", "cash_amount", "estimated_value", "final_rating", "diagnostic_score", "post_diagnostic_score", "temperature", "charges", "minimum_donation", "reorder_level", "hours", "days", "amount_value"]);
const NULLABLE_NUMERIC_FIELDS = new Set(["user_id", "entity_id", "created_by", "beneficiary_id", "center_id", "scholar_id", "sponsor_id", "chapel_id", "academic_year_id", "enrollment_id", "patient_id", "person_id", "donation_id", "supersedes_policy_id", "screening_age", "queue_no"]);
const TABLE_DEFAULTS = {
  operations_cases: { case_type: "Program Incident", confidentiality_level: "Restricted", program_code: "administration", status: "Open" },
  operations_people: { person_type: "Volunteer", program_code: "administration", moa_status: "Pending", id_status: "Pending", background_check_status: "Pending", training_status: "Pending", status: "Active" },
  operations_personnel_actions: { program_code: "administration", action_type: "Training", status: "Draft" },
  operations_assets: { program_code: "administration", asset_type: "Equipment", acquisition_type: "Procured", item_condition: "Good", status: "In Service" },
  operations_procurements: { program_code: "administration", status: "Requested" },
  operations_finance: { record_type: "Disbursement", program_code: "administration", restriction_type: "Unrestricted", status: "Draft" },
  operations_donations: { donation_type: "Cash", program_code: "administration", restriction_type: "Unrestricted", consent_status: "Not Required", status: "Received" },
  operations_donation_distributions: { program_code: "administration", acknowledgment_status: "Pending", consent_status: "Not Required" },
  operations_compliance: { item_type: "Report", program_code: "administration", frequency: "As Needed", status: "Pending" },
  operations_policies: { program_code: "administration", policy_area: "Operations", version: "1.0", status: "Draft" },
  nutrition_admissions: { decision: "Pending" },
  nutrition_attendance: { attendance_status: "Present", meal_received: 1 },
  nutrition_health_safety: { record_scope: "Child", record_type: "Health Screening", status: "Completed" },
  scholarship_applications: { slot_status: "Pending", decision: "Pending", moa_status: "Pending" },
  scholarship_communications: { communication_type: "Progress Report", status: "Pending" },
  scholarship_tutorials: { tutorial_type: "Math", progress_status: "Enrolled" },
  health_patients: { indigent_status: "For Assessment", tb_status: "Not Assessed", confidentiality_level: "Restricted", status: "Active" },
  health_encounters: { visit_type: "Regular Consultation", payment_status: "Pending", status: "Open" },
  health_tb_records: { record_type: "DOT Administration", treatment_status: "Ongoing" },
  health_inventory: { item_type: "Medicine", status: "Available" },
  health_equipment: { item_condition: "Good", status: "In Service" }
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeField(field, value) {
  if (!NUMERIC_FIELDS.has(field)) return String(value ?? "").trim();
  if (value === "" || value === null || value === undefined) return NULLABLE_NUMERIC_FIELDS.has(field) ? null : 0;
  const number = Number(value);
  if (!Number.isFinite(number)) return DECIMAL_FIELDS.has(field) ? 0 : null;
  return DECIMAL_FIELDS.has(field) ? Math.round(number * 100) / 100 : Math.trunc(number);
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
      return { changes: Number(result.changes || 0), lastInsertRowid: Number(result.lastInsertRowid || 0) };
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
      return { changes: Number(result.rowsAffected || 0), lastInsertRowid: Number(result.lastInsertRowid || 0) };
    }
  };
}

class OperationsStore {
  constructor(driver) {
    this.driver = driver;
  }

  definition(entity) {
    const value = ENTITY_DEFINITIONS[entity];
    if (!value) throw new Error("Unsupported operational record type.");
    return value;
  }

  async listProgramRoles(userId) {
    const rows = await this.driver.all(
      `SELECT program_code, role_code FROM app_user_program_roles
       WHERE user_id = ? ORDER BY program_code, role_code`,
      [Number(userId)]
    );
    const result = Object.fromEntries(PROGRAM_CODES.map(code => [code, []]));
    for (const row of rows) {
      if (PROGRAM_CODES.includes(row.program_code) && PROGRAM_ROLES.includes(row.role_code)) result[row.program_code].push(row.role_code);
    }
    return result;
  }

  async setUserRoles(userId, programRoles = {}) {
    const user = await this.driver.get("SELECT id, role FROM app_users WHERE id = ?", [Number(userId)]);
    if (!user) throw new Error("User account was not found.");
    await this.driver.run("DELETE FROM app_user_program_roles WHERE user_id = ?", [Number(userId)]);
    for (const programCode of PROGRAM_CODES) {
      const roles = [...new Set((Array.isArray(programRoles?.[programCode]) ? programRoles[programCode] : []).filter(role => PROGRAM_ROLES.includes(role)))];
      for (const role of roles) {
        await this.driver.run(
          `INSERT INTO app_user_program_roles (user_id, program_code, role_code, created_at)
           VALUES (?, ?, ?, ?)`,
          [Number(userId), programCode, role, nowIso()]
        );
      }
    }
    return this.listProgramRoles(userId);
  }

  async decorateUser(user) {
    if (!user) return null;
    return { ...user, program_roles: { ...(user.program_roles || {}), ...(await this.listProgramRoles(user.id)) } };
  }

  buildFilters(definitionValue, options = {}) {
    const clauses = [];
    const args = [];
    if (!definitionValue.noArchiveFilter && String(options.archived_only || "") === "1") clauses.push("COALESCE(deleted_at, '') <> ''");
    else if (!definitionValue.noArchiveFilter && String(options.include_archived || "") !== "1") clauses.push("COALESCE(deleted_at, '') = ''");
    const search = String(options.search || "").trim().toLowerCase();
    if (search && definitionValue.search?.length) {
      clauses.push(`(${definitionValue.search.map(field => `lower(COALESCE(${field}, '')) LIKE ?`).join(" OR ")})`);
      for (let index = 0; index < definitionValue.search.length; index += 1) args.push(`%${search}%`);
    }
    for (const field of definitionValue.filters || []) {
      const value = options[field] ?? options[field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())];
      if (value === "" || value === null || value === undefined) continue;
      clauses.push(`${field} = ?`);
      args.push(normalizeField(field, value));
    }
    return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", args };
  }

  async list(entity, options = {}) {
    const definitionValue = this.definition(entity);
    const { where, args } = this.buildFilters(definitionValue, options);
    const records = await this.driver.all(
      `SELECT * FROM ${definitionValue.table} ${where}
       ORDER BY ${definitionValue.order}
       LIMIT ? OFFSET ?`,
      [...args, safeLimit(options.limit), safeOffset(options.offset)]
    );
    return this.decorateRecords(entity, records);
  }

  async count(entity, options = {}) {
    const definitionValue = this.definition(entity);
    const { where, args } = this.buildFilters(definitionValue, options);
    const row = await this.driver.get(`SELECT COUNT(*) AS count FROM ${definitionValue.table} ${where}`, args);
    return Number(row?.count || 0);
  }

  async get(entity, id) {
    const definitionValue = this.definition(entity);
    const record = await this.driver.get(`SELECT * FROM ${definitionValue.table} WHERE id = ?`, [Number(id)]);
    return record ? (await this.decorateRecords(entity, [record]))[0] : null;
  }

  async lookupMap(table, ids, selectFields, labelBuilder) {
    const unique = [...new Set(ids.map(Number).filter(Number.isFinite).filter(Boolean))];
    if (!unique.length) return new Map();
    const rows = await this.driver.all(
      `SELECT ${selectFields} FROM ${table} WHERE id IN (${placeholders(unique.length)})`,
      unique
    );
    return new Map(rows.map(row => [Number(row.id), labelBuilder(row)]));
  }

  async decorateRecords(entity, records) {
    if (!records.length) return records;
    const copy = records.map(record => ({ ...record }));
    if (["nutritionAdmissions", "nutritionAttendance", "nutritionHealthSafety"].includes(entity)) {
      const beneficiaries = await this.lookupMap(
        "nutrition_beneficiaries",
        copy.map(row => row.beneficiary_id),
        "id, beneficiary_no, child_last_name, child_first_name, child_middle_name",
        row => `${[row.child_last_name, row.child_first_name, row.child_middle_name].filter(Boolean).join(", ")}${row.beneficiary_no ? ` (${row.beneficiary_no})` : ""}`
      );
      const centers = await this.lookupMap("nutrition_centers", copy.map(row => row.center_id), "id, center_name", row => row.center_name);
      for (const row of copy) {
        row.beneficiary_name = beneficiaries.get(Number(row.beneficiary_id)) || "";
        row.center_name = centers.get(Number(row.center_id)) || "";
      }
    }
    if (["scholarshipApplications", "scholarshipCommunications", "scholarshipTutorials"].includes(entity)) {
      const scholars = await this.lookupMap(
        "scholarship_scholars",
        copy.map(row => row.scholar_id),
        "id, scholar_no, last_name, first_name, middle_name",
        row => `${[row.last_name, row.first_name, row.middle_name].filter(Boolean).join(", ")}${row.scholar_no ? ` (${row.scholar_no})` : ""}`
      );
      const sponsors = await this.lookupMap("scholarship_sponsors", copy.map(row => row.sponsor_id), "id, sponsor_name", row => row.sponsor_name);
      const chapels = await this.lookupMap("scholarship_chapels", copy.map(row => row.chapel_id), "id, chapel_name", row => row.chapel_name);
      const years = await this.lookupMap("scholarship_academic_years", copy.map(row => row.academic_year_id), "id, label", row => row.label);
      for (const row of copy) {
        row.scholar_name = scholars.get(Number(row.scholar_id)) || "";
        row.sponsor_name = sponsors.get(Number(row.sponsor_id)) || "";
        row.chapel_name = chapels.get(Number(row.chapel_id)) || "";
        row.academic_year_label = years.get(Number(row.academic_year_id)) || "";
      }
    }
    if (["healthEncounters", "healthTbRecords"].includes(entity)) {
      const patients = await this.lookupMap("health_patients", copy.map(row => row.patient_id), "id, patient_no, full_name", row => `${row.full_name}${row.patient_no ? ` (${row.patient_no})` : ""}`);
      for (const row of copy) row.patient_name = patients.get(Number(row.patient_id)) || "";
    }
    if (entity === "personnelActions") {
      const people = await this.lookupMap("operations_people", copy.map(row => row.person_id), "id, person_no, full_name", row => `${row.full_name}${row.person_no ? ` (${row.person_no})` : ""}`);
      for (const row of copy) row.person_name = people.get(Number(row.person_id)) || "";
    }
    if (entity === "distributions") {
      const donations = await this.lookupMap("operations_donations", copy.map(row => row.donation_id), "id, donation_no, donor_name", row => `${row.donation_no}${row.donor_name ? ` - ${row.donor_name}` : ""}`);
      for (const row of copy) row.donation_name = donations.get(Number(row.donation_id)) || "";
    }
    if (entity === "policies") {
      const policies = await this.lookupMap("operations_policies", copy.map(row => row.supersedes_policy_id), "id, policy_no, title", row => `${row.policy_no}${row.title ? ` - ${row.title}` : ""}`);
      for (const row of copy) row.supersedes_policy_name = policies.get(Number(row.supersedes_policy_id)) || "";
    }
    return copy;
  }

  validate(definitionValue, input) {
    for (const field of definitionValue.required || []) {
      const value = input[field];
      if (value === "" || value === null || value === undefined) throw new Error(`${field.replaceAll("_", " ")} is required.`);
    }
    for (const field of definitionValue.fields || []) {
      if (!field.endsWith("_date") && !["incident_date", "reported_date", "follow_up_date", "approved_at", "due_date", "next_date"].includes(field)) continue;
      const value = String(input[field] || "");
      if (value && !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) throw new Error(`${field.replaceAll("_", " ")} must use a valid date.`);
    }
  }

  async nextNumber(definitionValue) {
    if (!definitionValue.number) return "";
    const year = new Date().getFullYear();
    const prefix = `${definitionValue.number.prefix}-${year}-`;
    const rows = await this.driver.all(
      `SELECT ${definitionValue.number.field} AS value FROM ${definitionValue.table}
       WHERE ${definitionValue.number.field} LIKE ? ORDER BY ${definitionValue.number.field} DESC LIMIT 1`,
      [`${prefix}%`]
    );
    const current = Number(String(rows[0]?.value || "").split("-").pop()) || 0;
    return `${prefix}${String(current + 1).padStart(4, "0")}`;
  }

  async save(entity, input = {}, userId = null) {
    const definitionValue = this.definition(entity);
    if (definitionValue.readOnly) throw new Error("This operational record is read-only.");
    const id = Number(input.id || 0);
    const existing = id ? await this.get(entity, id) : null;
    if (id && !existing) throw new Error("Operational record was not found.");
    const values = {};
    const defaults = TABLE_DEFAULTS[definitionValue.table] || {};
    for (const field of definitionValue.fields) values[field] = normalizeField(field, input[field] ?? existing?.[field] ?? defaults[field]);
    if (definitionValue.number && !values[definitionValue.number.field]) values[definitionValue.number.field] = await this.nextNumber(definitionValue);
    if (!existing && definitionValue.fields.includes("created_by")) values.created_by = Number(userId || 0) || null;
    this.validate(definitionValue, values);
    const timestamp = nowIso();
    if (existing) {
      const fields = definitionValue.fields.filter(field => field !== "created_by");
      await this.driver.run(
        `UPDATE ${definitionValue.table} SET ${fields.map(field => `${field} = ?`).join(", ")}, updated_at = ? WHERE id = ?`,
        [...fields.map(field => values[field]), timestamp, id]
      );
      await this.audit(userId, "updated", definitionValue.program, entity, id, this.recordSummary(definitionValue, values));
      return this.get(entity, id);
    }
    const fields = definitionValue.fields;
    const result = await this.driver.run(
      `INSERT INTO ${definitionValue.table} (${fields.join(", ")}, deleted_at, created_at, updated_at)
       VALUES (${fields.map(() => "?").join(", ")}, '', ?, ?)`,
      [...fields.map(field => values[field]), timestamp, timestamp]
    );
    await this.audit(userId, "created", definitionValue.program, entity, result.lastInsertRowid, this.recordSummary(definitionValue, values));
    return this.get(entity, result.lastInsertRowid);
  }

  recordSummary(definitionValue, values) {
    const preferred = definitionValue.number?.field || definitionValue.required?.[0] || "";
    return String(values[preferred] || values.full_name || values.item_name || values.title || values.description || "").slice(0, 240);
  }

  async archive(entity, id, userId = null) {
    const definitionValue = this.definition(entity);
    if (definitionValue.readOnly) throw new Error("This operational record is read-only.");
    const record = await this.get(entity, id);
    if (!record) return null;
    await this.driver.run(`UPDATE ${definitionValue.table} SET deleted_at = ?, updated_at = ? WHERE id = ?`, [nowIso(), nowIso(), Number(id)]);
    await this.audit(userId, "archived", definitionValue.program, entity, Number(id), this.recordSummary(definitionValue, record));
    return this.get(entity, id);
  }

  async restore(entity, id, userId = null) {
    const definitionValue = this.definition(entity);
    const record = await this.get(entity, id);
    if (!record) return null;
    await this.driver.run(`UPDATE ${definitionValue.table} SET deleted_at = '', updated_at = ? WHERE id = ?`, [nowIso(), Number(id)]);
    await this.audit(userId, "restored", definitionValue.program, entity, Number(id), this.recordSummary(definitionValue, record));
    return this.get(entity, id);
  }

  async listArchived(programCode) {
    if (!PROGRAM_CODES.includes(programCode)) return [];
    const records = [];
    for (const [entity, definitionValue] of Object.entries(ENTITY_DEFINITIONS)) {
      if (definitionValue.readOnly) continue;
      if (entity === "finance") {
        const rows = await this.list(entity, { archived_only: 1, program_code: programCode, limit: 500 });
        records.push(...rows.map(record => this.binRecord(entity, definitionValue, record, programCode)));
      } else if (definitionValue.program === programCode) {
        const rows = await this.list(entity, { archived_only: 1, limit: 500 });
        records.push(...rows.map(record => this.binRecord(entity, definitionValue, record, programCode)));
      }
    }
    return records;
  }

  binRecord(entity, definitionValue, record, programCode) {
    return {
      source: "operations",
      id: Number(record.id),
      program_code: programCode,
      entity_type: entity,
      display_label: this.recordSummary(definitionValue, record) || `${entity} #${record.id}`,
      deleted_at: record.deleted_at || ""
    };
  }

  async captureDeletedRecord(programCode, entityType, sourceId, displayLabel, snapshot, userId = null) {
    if (!PROGRAM_CODES.includes(programCode)) throw new Error("Unsupported record-bin program.");
    const result = await this.driver.run(
      `INSERT INTO app_record_bin
       (program_code, entity_type, source_id, display_label, snapshot_json, deleted_by, deleted_at, restored_by, restored_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, '')`,
      [programCode, String(entityType), Number(sourceId || 0) || null, String(displayLabel || ""), JSON.stringify(snapshot || {}), Number(userId || 0) || null, nowIso()]
    );
    return this.getCapturedBin(result.lastInsertRowid);
  }

  async getCapturedBin(id) {
    const row = await this.driver.get("SELECT * FROM app_record_bin WHERE id = ?", [Number(id)]);
    if (!row) return null;
    let snapshot = {};
    try { snapshot = JSON.parse(row.snapshot_json || "{}"); } catch { snapshot = {}; }
    return { ...row, snapshot };
  }

  async listCapturedBin(programCode) {
    const rows = await this.driver.all(
      `SELECT id, program_code, entity_type, source_id, display_label, deleted_at
       FROM app_record_bin WHERE program_code = ? AND restored_at = '' ORDER BY deleted_at DESC`,
      [programCode]
    );
    return rows.map(row => ({ ...row, source: "captured" }));
  }

  async markCapturedRestored(id, userId = null) {
    await this.driver.run(
      "UPDATE app_record_bin SET restored_by = ?, restored_at = ? WHERE id = ? AND restored_at = ''",
      [Number(userId || 0) || null, nowIso(), Number(id)]
    );
    return this.getCapturedBin(id);
  }

  async audit(userId, action, programCode, entityType, entityId, summary = "") {
    await this.driver.run(
      `INSERT INTO operations_audit_log (user_id, action, program_code, entity_type, entity_id, summary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [Number(userId || 0) || null, action, programCode, entityType, Number(entityId || 0) || null, String(summary || ""), nowIso()]
    );
  }

  async overview(programCode = "") {
    const programFilter = programCode && PROGRAM_CODES.includes(programCode) ? programCode : "";
    const count = async (table, extra = "", args = []) => Number((await this.driver.get(
      `SELECT COUNT(*) AS count FROM ${table} WHERE COALESCE(deleted_at, '') = '' ${extra}`, args
    ))?.count || 0);
    const scoped = programFilter ? "AND program_code = ?" : "";
    const scopedArgs = programFilter ? [programFilter] : [];
    return {
      openCases: await count("operations_cases", `${scoped} AND status NOT IN ('Closed', 'Resolved')`, scopedArgs),
      activePeople: await count("operations_people", `${scoped} AND status = 'Active'`, scopedArgs),
      assets: await count("operations_assets", scoped, scopedArgs),
      pendingProcurements: await count("operations_procurements", `${scoped} AND status NOT IN ('Completed', 'Cancelled')`, scopedArgs),
      pendingCompliance: await count("operations_compliance", `${scoped} AND status NOT IN ('Completed', 'Approved')`, scopedArgs),
      nutritionAttendance: await count("nutrition_attendance"),
      scholarshipApplications: await count("scholarship_applications"),
      healthPatients: await count("health_patients"),
      healthEncounters: await count("health_encounters")
    };
  }

  async exportEntity(entity, options = {}) {
    const records = [];
    const pageSize = 500;
    let offset = 0;
    while (true) {
      const page = await this.list(entity, { ...options, limit: pageSize, offset });
      records.push(...page);
      if (page.length < pageSize) return records;
      offset += pageSize;
    }
  }

  async exportAll() {
    const result = {};
    for (const entity of Object.keys(ENTITY_DEFINITIONS)) result[entity] = await this.exportEntity(entity, { include_archived: 1 });
    return result;
  }
}

function initializeLocalOperations(db) {
  for (const statement of OPERATIONS_SCHEMA_STATEMENTS) db.exec(statement);
  const timestamp = nowIso();
  const backfill = db.prepare(
    `INSERT OR IGNORE INTO app_user_program_roles (user_id, program_code, role_code, created_at)
     SELECT id, ?, 'encoder', ? FROM app_users u
     WHERE role <> 'superadmin'
       AND NOT EXISTS (
         SELECT 1 FROM app_user_program_roles r
         WHERE r.user_id = u.id AND r.program_code = ?
       )`
  );
  backfill.run("livelihood", timestamp, "livelihood");
  backfill.run("nutrition", timestamp, "nutrition");
  return new OperationsStore(localDriver(db));
}

async function initializeTursoOperations(database) {
  for (const statement of OPERATIONS_SCHEMA_STATEMENTS) await database.execute(statement);
  const timestamp = nowIso();
  for (const programCode of ["livelihood", "nutrition"]) {
    await database.execute(
      `INSERT OR IGNORE INTO app_user_program_roles (user_id, program_code, role_code, created_at)
       SELECT id, ?, 'encoder', ? FROM app_users u
       WHERE role <> 'superadmin'
         AND NOT EXISTS (
           SELECT 1 FROM app_user_program_roles r
           WHERE r.user_id = u.id AND r.program_code = ?
         )`,
      [programCode, timestamp, programCode]
    );
  }
  return new OperationsStore(tursoDriver(database));
}

module.exports = {
  ENTITY_DEFINITIONS,
  OPERATIONS_SCHEMA_STATEMENTS,
  PROGRAM_CODES,
  PROGRAM_ROLES,
  OperationsStore,
  initializeLocalOperations,
  initializeTursoOperations
};
