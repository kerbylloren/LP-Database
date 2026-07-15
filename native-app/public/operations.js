(function operationsModule() {
  "use strict";

  const PROGRAM_OPTIONS = [
    ["administration", "Administration"],
    ["livelihood", "Livelihood Program"],
    ["nutrition", "Nutrition Program"],
    ["scholarship", "Scholarship Program"],
    ["health", "Health Program"]
  ];
  const YES_NO = [[1, "Yes"], [0, "No"]];
  const state = { context: null, meta: null, pages: {}, lookups: new Map(), activeRoute: "" };
  const PROGRAM_FINANCE_ROUTES = {
    "livelihood-finance": "livelihood",
    "nutrition-finance": "nutrition",
    "scholarship-finance": "scholarship",
    "health-finance": "health"
  };
  const BIN_ROUTES = {
    "main-bin": "",
    "livelihood-bin": "livelihood",
    "nutrition-bin": "nutrition",
    "scholarship-bin": "scholarship",
    "health-bin": "health",
    "admin-bin": "administration"
  };

  function field(name, label, type = "text", options = [], extra = {}) {
    return { name, label, type, options, ...extra };
  }

  const FORMS = {
    cases: {
      title: "Safeguarding and Case Record",
      subtitle: "Restricted incident, complaint, grievance, whistleblowing, and referral records.",
      fields: [
        field("case_no", "Case No.", "text", [], { readonly: true }),
        field("case_type", "Case Type", "select", ["Child Protection", "Complaint", "Grievance", "Whistleblowing", "Security Incident", "Program Incident"]),
        field("confidentiality_level", "Confidentiality", "select", ["Restricted", "Highly Restricted"]),
        field("program_code", "Program", "select", PROGRAM_OPTIONS),
        field("incident_date", "Incident Date", "date"), field("reported_date", "Reported Date", "date"),
        field("subject_name", "Subject / Person Concerned"), field("subject_reference", "Beneficiary or Record Reference"),
        field("reporter_name", "Reported By"), field("assigned_to", "Assigned Officer"),
        field("description", "Incident or Concern", "textarea", [], { wide: true }),
        field("evidence_url", "Protected Evidence Link", "url", [], { wide: true }),
        field("immediate_response", "Immediate Response", "textarea", [], { wide: true }),
        field("referral_details", "Referral / Support Provided", "textarea", [], { wide: true }),
        field("follow_up_date", "Follow-up Date", "date"),
        field("status", "Status", "select", ["Open", "Under Review", "Referred", "Resolved", "Closed"]),
        field("resolution", "Resolution", "textarea", [], { wide: true }), field("approved_by", "Reviewed / Approved By")
      ],
      columns: [["case_no", "Case No."], ["case_type", "Type"], ["program_code", "Program"], ["incident_date", "Incident"], ["assigned_to", "Assigned"], ["status", "Status"]]
    },
    people: {
      title: "Personnel and Volunteer Record",
      subtitle: "MOA, identification, screening, health check, and training status.",
      fields: [
        field("person_no", "Person No.", "text", [], { readonly: true }), field("person_type", "Type", "select", ["Staff", "Volunteer", "Coordinator", "Intern"]),
        field("program_code", "Program", "select", PROGRAM_OPTIONS), field("role_title", "Role / Assignment"),
        field("full_name", "Full Name", "text", [], { required: true }), field("contact_no", "Contact No."), field("email", "Email", "email"),
        field("address", "Address", "textarea", [], { wide: true }), field("emergency_contact", "Emergency Contact"),
        field("start_date", "Start Date", "date"), field("end_date", "End Date", "date"),
        field("moa_status", "MOA", "select", ["Pending", "Signed", "Expired", "Not Required"]), field("moa_date", "MOA Date", "date"),
        field("id_status", "ID", "select", ["Pending", "Submitted", "Issued", "Returned", "Not Required"]),
        field("background_check_status", "Background Check", "select", ["Pending", "Cleared", "For Review", "Not Required"]), field("background_check_date", "Background Check Date", "date"),
        field("health_check_date", "Latest Health Check", "date"), field("training_status", "Required Training", "select", ["Pending", "In Progress", "Completed"]),
        field("status", "Status", "select", ["Active", "Inactive", "Separated"]), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["person_no", "No."], ["full_name", "Name"], ["person_type", "Type"], ["program_code", "Program"], ["role_title", "Assignment"], ["moa_status", "MOA"], ["status", "Status"]]
    },
    personnelActions: {
      title: "Personnel Actions and Records",
      subtitle: "DTR, leave, payroll, training, health checks, evaluations, assignments, and MOA actions.",
      fields: [
        field("action_no", "Action No.", "text", [], { readonly: true }), field("person_id", "Personnel", "lookup", [], { lookup: "operationsPeople", required: true }),
        field("program_code", "Program", "select", PROGRAM_OPTIONS), field("action_type", "Action Type", "select", ["DTR", "Leave", "Payroll", "Training", "Health Check", "Performance Evaluation", "Assignment", "MOA Action", "Separation"]),
        field("period_label", "Period / Coverage"), field("start_date", "Start Date", "date"), field("end_date", "End Date", "date"),
        field("hours", "Hours", "number"), field("days", "Days", "number"), field("amount", "Amount", "number"),
        field("status", "Status", "select", ["Draft", "Submitted", "Approved", "Completed", "Cancelled"]), field("approved_by", "Approved By"), field("approval_date", "Approval Date", "date"),
        field("document_url", "Protected Document Link", "url", [], { wide: true }), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["action_no", "Action"], ["person_name", "Personnel"], ["action_type", "Type"], ["period_label", "Period"], ["start_date", "Start"], ["amount", "Amount"], ["status", "Status"]]
    },
    assets: {
      title: "Asset and Inventory Record",
      subtitle: "Program supplies, donated assets, assigned custodians, and maintenance dates.",
      fields: [
        field("asset_no", "Asset No.", "text", [], { readonly: true }), field("program_code", "Program", "select", PROGRAM_OPTIONS),
        field("item_name", "Item", "text", [], { required: true }), field("asset_type", "Type", "select", ["Equipment", "Furniture", "Supply", "Food Item", "IT Asset", "Other"]),
        field("location", "Location"), field("quantity", "Quantity", "number"), field("unit", "Unit"),
        field("acquisition_type", "Acquisition", "select", ["Procured", "Donated", "Transferred"]), field("acquisition_date", "Acquisition Date", "date"),
        field("acquisition_cost", "Acquisition Cost", "number"), field("donor_name", "Donor"),
        field("item_condition", "Condition", "select", ["New", "Good", "Fair", "For Repair", "Unserviceable"]), field("custodian", "Custodian"),
        field("tag_date", "Tag Date", "date"), field("last_maintenance_date", "Last Maintenance", "date"), field("next_maintenance_date", "Next Maintenance", "date"),
        field("status", "Status", "select", ["In Service", "In Storage", "For Repair", "Disposed"]), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["asset_no", "Asset No."], ["item_name", "Item"], ["program_code", "Program"], ["location", "Location"], ["quantity", "Qty"], ["item_condition", "Condition"], ["status", "Status"]]
    },
    procurements: {
      title: "Procurement Request",
      subtitle: "Requisition, quotation, approval, inspection, receiving, and cash-voucher trail.",
      fields: [
        field("request_no", "Request No.", "text", [], { readonly: true }), field("program_code", "Program", "select", PROGRAM_OPTIONS),
        field("request_date", "Request Date", "date", [], { required: true }), field("requested_by", "Requested By"),
        field("purpose", "Purpose", "textarea", [], { wide: true }), field("item_summary", "Items Requested", "textarea", [], { wide: true, required: true }),
        field("quantity", "Total Quantity", "number"), field("estimated_amount", "Estimated Amount", "number"),
        field("quotation_details", "Quotation Comparison", "textarea", [], { wide: true }), field("supplier", "Selected Supplier"),
        field("approved_by", "Approved By"), field("approved_date", "Approval Date", "date"),
        field("status", "Status", "select", ["Requested", "For Quotation", "For Approval", "Approved", "Purchased", "Received", "Completed", "Cancelled"]),
        field("received_by", "Received By"), field("received_date", "Received Date", "date"), field("inspected_by", "Inspected By"),
        field("inspection_result", "Inspection Result", "textarea", [], { wide: true }), field("cash_voucher_no", "Cash Voucher No."),
        field("document_url", "Supporting Documents", "url", [], { wide: true }), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["request_no", "Request"], ["request_date", "Date"], ["program_code", "Program"], ["item_summary", "Items"], ["estimated_amount", "Estimate"], ["supplier", "Supplier"], ["status", "Status"]]
    },
    finance: {
      title: "Financial Control Record",
      subtitle: "Cash receipts, disbursements, advances, liquidations, reconciliations, funds, and statements.",
      fields: [
        field("reference_no", "Reference No.", "text", [], { readonly: true }), field("record_type", "Record Type", "select", ["Cash Receipt", "Disbursement", "Petty Cash", "Cash Advance", "Liquidation", "Bank Reconciliation", "Revolving Fund", "Budget", "Financial Statement"]),
        field("program_code", "Program", "select", PROGRAM_OPTIONS), field("transaction_date", "Transaction Date", "date"), field("period_label", "Reporting Period"),
        field("fund_name", "Fund / Account"), field("restriction_type", "Restriction", "select", ["Unrestricted", "Program Restricted", "Purpose Restricted"]),
        field("counterparty", "Payee / Payer"), field("amount", "Amount", "number"),
        field("description", "Description", "textarea", [], { wide: true, required: true }), field("due_date", "Due Date", "date"), field("liquidation_date", "Liquidation Date", "date"),
        field("bank_reference", "Bank / Voucher Reference"), field("prepared_by", "Prepared By"), field("approved_by", "Approved By"), field("approval_date", "Approval Date", "date"),
        field("status", "Status", "select", ["Draft", "Submitted", "Approved", "Reconciled", "Liquidated", "Voided"]),
        field("document_url", "Supporting Document", "url", [], { wide: true }), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["reference_no", "Reference"], ["record_type", "Type"], ["transaction_date", "Date"], ["program_code", "Program"], ["counterparty", "Counterparty"], ["amount", "Amount"], ["status", "Status"]]
    },
    donations: {
      title: "Organization Donation Record",
      subtitle: "Cash and in-kind donations, restrictions, acknowledgments, deposits, and distributions.",
      fields: [
        field("donation_no", "Donation No.", "text", [], { readonly: true }), field("donor_name", "Donor Name"), field("anonymous", "Anonymous", "select", YES_NO),
        field("donation_type", "Donation Type", "select", ["Cash", "In-kind"]), field("program_code", "Program", "select", PROGRAM_OPTIONS),
        field("restriction_type", "Restriction", "select", ["Unrestricted", "Program Restricted", "Purpose Restricted"]), field("purpose", "Purpose"),
        field("received_date", "Date Received", "date"), field("cash_amount", "Cash Amount", "number"),
        field("item_description", "In-kind Items", "textarea", [], { wide: true }), field("quantity", "Quantity", "number"), field("item_condition", "Condition"), field("estimated_value", "Estimated Value", "number"),
        field("acknowledgment_no", "Acknowledgment No."), field("deposit_reference", "Deposit Reference"),
        field("recipient_summary", "Recipients / Distribution", "textarea", [], { wide: true }), field("distribution_date", "Distribution Date", "date"),
        field("consent_status", "Photo / Data Consent", "select", ["Not Required", "Pending", "Granted", "Declined"]),
        field("status", "Status", "select", ["Received", "Deposited", "Distributed", "Closed", "Voided"]), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["donation_no", "Donation"], ["received_date", "Received"], ["donor_name", "Donor"], ["donation_type", "Type"], ["program_code", "Program"], ["cash_amount", "Cash"], ["estimated_value", "In-kind Value"], ["status", "Status"]]
    },
    distributions: {
      title: "Donation Distribution",
      subtitle: "Itemized releases, recipients, acknowledgment, and informed photo or data consent.",
      fields: [
        field("distribution_no", "Distribution No.", "text", [], { readonly: true }), field("donation_id", "Source Donation", "lookup", [], { lookup: "operationsDonations" }),
        field("program_code", "Program", "select", PROGRAM_OPTIONS), field("distribution_date", "Distribution Date", "date", [], { required: true }),
        field("recipient_name", "Recipient Name", "text", [], { required: true }), field("recipient_reference", "Beneficiary / Record Reference"),
        field("item_description", "Cash or Item Released", "textarea", [], { wide: true, required: true }), field("quantity", "Quantity", "number"), field("unit", "Unit"), field("amount_value", "Amount / Value", "number"),
        field("received_by", "Received / Signed By"), field("acknowledgment_status", "Acknowledgment", "select", ["Pending", "Signed", "Witnessed", "Not Required"]),
        field("consent_status", "Photo / Data Consent", "select", ["Not Required", "Pending", "Granted", "Declined"]), field("photo_reference_url", "Protected Photo Reference", "url", [], { wide: true }),
        field("distributed_by", "Distributed By"), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["distribution_no", "Distribution"], ["distribution_date", "Date"], ["donation_name", "Source"], ["recipient_name", "Recipient"], ["item_description", "Release"], ["quantity", "Qty"], ["amount_value", "Value"], ["acknowledgment_status", "Acknowledgment"]]
    },
    compliance: {
      title: "Compliance and Reporting Item",
      subtitle: "Reports, meetings, training, orientations, inspections, drills, and policy reviews.",
      fields: [
        field("item_no", "Item No.", "text", [], { readonly: true }), field("item_type", "Type", "select", ["Report", "Meeting", "Training", "Orientation", "Inspection", "Emergency Drill", "Policy Review", "Regulatory Filing"]),
        field("program_code", "Program", "select", PROGRAM_OPTIONS), field("title", "Title", "text", [], { required: true }),
        field("frequency", "Frequency", "select", ["Weekly", "Monthly", "Quarterly", "Semiannual", "Annual", "As Needed"]),
        field("due_date", "Due Date", "date"), field("completed_date", "Completed Date", "date"),
        field("responsible_person", "Responsible"), field("approver", "Approver"), field("approval_date", "Approval Date", "date"),
        field("status", "Status", "select", ["Pending", "In Progress", "Submitted", "Completed", "Approved", "Overdue", "Cancelled"]),
        field("document_url", "Document Link", "url", [], { wide: true }), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["item_no", "Item"], ["item_type", "Type"], ["program_code", "Program"], ["title", "Title"], ["due_date", "Due"], ["responsible_person", "Responsible"], ["status", "Status"]]
    },
    policies: {
      title: "Policy and SOP Register",
      subtitle: "Versioned program rules, approval dates, review schedules, and superseded procedures.",
      fields: [
        field("policy_no", "Policy No.", "text", [], { readonly: true }), field("program_code", "Program", "select", PROGRAM_OPTIONS),
        field("policy_area", "Policy Area", "select", ["Governance", "Safeguarding", "Eligibility", "Program Delivery", "Monitoring", "Finance", "Procurement", "Human Resources", "Data Protection", "Health and Safety", "Emergency Response", "Operations"]),
        field("title", "Policy / SOP Title", "text", [], { required: true }), field("version", "Version"), field("effective_date", "Effective Date", "date"), field("review_date", "Review Date", "date"),
        field("status", "Status", "select", ["Draft", "For Review", "Approved", "Effective", "Superseded", "Retired"]), field("approved_by", "Approved By"), field("approval_date", "Approval Date", "date"),
        field("supersedes_policy_id", "Supersedes", "lookup", [], { lookup: "operationsPolicies" }), field("policy_text", "Operational Rule / Decision", "textarea", [], { wide: true, required: true }),
        field("document_url", "Approved Document Link", "url", [], { wide: true }), field("notes", "Implementation Notes", "textarea", [], { wide: true })
      ],
      columns: [["policy_no", "Policy"], ["program_code", "Program"], ["policy_area", "Area"], ["title", "Title"], ["version", "Version"], ["effective_date", "Effective"], ["review_date", "Review"], ["status", "Status"]]
    },
    audit: {
      title: "Organization Audit History", subtitle: "Immutable operational changes across Administration, Nutrition, Scholarship, and Health.", fields: [],
      columns: [["created_at", "Time"], ["program_code", "Program"], ["action", "Action"], ["entity_type", "Record Type"], ["entity_id", "Record ID"], ["summary", "Summary"]]
    },
    nutritionAdmissions: {
      title: "Feeding Admission Assessment", subtitle: "Screening, house visit, parent commitment, orientation, and admission decision.",
      fields: [
        field("beneficiary_id", "Beneficiary", "lookup", [], { lookup: "nutritionBeneficiaries", required: true }), field("center_id", "Feeding Center", "lookup", [], { lookup: "nutritionCenters" }),
        field("application_date", "Application Date", "date"), field("screening_age", "Age at Screening", "number"),
        field("solid_food_capable", "Can Consume Solid Food", "select", YES_NO), field("nutrition_screening", "Initial Nutrition Screening"),
        field("residence_eligible", "Residence Eligible", "select", YES_NO), field("indigent_assessment", "Indigent Assessment", "textarea", [], { wide: true }),
        field("house_visit_date", "House Visit Date", "date"), field("socioeconomic_findings", "Socioeconomic Findings", "textarea", [], { wide: true }),
        field("parent_agreement", "Parent Agreement", "select", YES_NO), field("duty_commitment", "Parent Duty Commitment", "select", YES_NO),
        field("orientation_date", "Orientation Date", "date"), field("decision", "Decision", "select", ["Pending", "Qualified", "Waitlisted", "Denied", "Admitted"]),
        field("decision_date", "Decision Date", "date"), field("approved_by", "Approved By"), field("rejection_reason", "Denial / Waitlist Reason", "textarea", [], { wide: true }), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["beneficiary_name", "Beneficiary"], ["center_name", "Center"], ["application_date", "Application"], ["house_visit_date", "House Visit"], ["nutrition_screening", "Screening"], ["decision", "Decision"]]
    },
    nutritionAttendance: {
      title: "Daily Feeding Attendance", subtitle: "Child attendance, meal service, guardian presence, and parent-on-duty participation.",
      fields: [
        field("beneficiary_id", "Beneficiary", "lookup", [], { lookup: "nutritionBeneficiaries", required: true }), field("center_id", "Feeding Center", "lookup", [], { lookup: "nutritionCenters" }),
        field("attendance_date", "Attendance Date", "date", [], { required: true }), field("attendance_status", "Status", "select", ["Present", "Absent", "Excused", "Late"]),
        field("meal_received", "Meal Received", "select", YES_NO), field("guardian_present", "Guardian Present", "select", YES_NO), field("parent_duty", "Parent on Duty", "select", YES_NO),
        field("recorded_by_name", "Recorded By"), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["attendance_date", "Date"], ["beneficiary_name", "Beneficiary"], ["center_name", "Center"], ["attendance_status", "Attendance"], ["meal_received", "Meal"], ["guardian_present", "Guardian"], ["parent_duty", "Parent Duty"]]
    },
    nutritionHealthSafety: {
      title: "Nutrition Health and Safety Record", subtitle: "Medical checks, deworming, allergies, food safety, inspections, drills, and center risks.",
      fields: [
        field("record_scope", "Scope", "select", ["Child", "Center", "Volunteer", "Food"]), field("beneficiary_id", "Beneficiary", "lookup", [], { lookup: "nutritionBeneficiaries" }), field("center_id", "Feeding Center", "lookup", [], { lookup: "nutritionCenters" }),
        field("record_type", "Record Type", "select", ["Health Screening", "Medical Checkup", "Deworming", "Allergy Screening", "Food Safety Inspection", "Equipment Inspection", "Volunteer Health Check", "Emergency Drill", "Risk Review", "Incident"]),
        field("record_date", "Record Date", "date"), field("provider", "Provider / Responsible"), field("finding", "Findings", "textarea", [], { wide: true }),
        field("action_taken", "Action Taken", "textarea", [], { wide: true }), field("next_due_date", "Next Due", "date"),
        field("status", "Status", "select", ["Completed", "For Follow-up", "Open", "Resolved"]), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["record_date", "Date"], ["record_scope", "Scope"], ["record_type", "Type"], ["beneficiary_name", "Beneficiary"], ["center_name", "Center"], ["provider", "Responsible"], ["status", "Status"]]
    },
    scholarshipApplications: {
      title: "Scholarship Application", subtitle: "Chapel slots, ratings, house visits, decisions, orientation, and MOA compliance.",
      fields: [
        field("scholar_id", "Scholar / Applicant", "lookup", [], { lookup: "scholars", required: true }), field("chapel_id", "Chapel", "lookup", [], { lookup: "chapels" }), field("academic_year_id", "School Year", "lookup", [], { lookup: "academicYears" }),
        field("application_date", "Application Date", "date"), field("slot_status", "Chapel Slot", "select", ["Pending", "Available", "Reserved", "Unavailable"]), field("final_rating", "Final Report Card Rating", "number"),
        field("house_visit_date", "House Visit", "date"), field("socioeconomic_findings", "Socioeconomic Findings", "textarea", [], { wide: true }),
        field("decision", "Decision", "select", ["Pending", "Accepted", "Waitlisted", "Denied", "Withdrawn"]), field("decision_date", "Decision Date", "date"),
        field("orientation_date", "Orientation Date", "date"), field("moa_status", "MOA", "select", ["Pending", "Signed", "Declined", "Not Required"]), field("moa_date", "MOA Date", "date"),
        field("approved_by_name", "Approved By"), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["scholar_name", "Applicant"], ["academic_year_label", "School Year"], ["chapel_name", "Chapel"], ["application_date", "Applied"], ["slot_status", "Slot"], ["decision", "Decision"], ["moa_status", "MOA"]]
    },
    scholarshipCommunications: {
      title: "Sponsor Communication and Scholar Case", subtitle: "Scheduled letters, reports, appeals, withdrawals, terminations, and dialogue records.",
      fields: [
        field("scholar_id", "Scholar", "lookup", [], { lookup: "scholars" }), field("sponsor_id", "Sponsor", "lookup", [], { lookup: "sponsors" }),
        field("communication_type", "Type", "select", ["Thank You Letter", "Christmas Letter", "Quarterly Report Card", "Annual Progress Report", "Appeal Letter", "Dialogue Record", "Withdrawal Letter", "Termination Letter", "Case Summary"]),
        field("due_date", "Due Date", "date"), field("sent_date", "Sent / Completed Date", "date"), field("status", "Status", "select", ["Pending", "Prepared", "Approved", "Sent", "Acknowledged", "Overdue", "Cancelled"]),
        field("delivery_channel", "Delivery Channel"), field("document_url", "Protected Document Link", "url", [], { wide: true }),
        field("case_summary", "Case Summary / Dialogue Notes", "textarea", [], { wide: true }), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["due_date", "Due"], ["scholar_name", "Scholar"], ["sponsor_name", "Sponsor"], ["communication_type", "Type"], ["sent_date", "Sent"], ["status", "Status"]]
    },
    scholarshipTutorials: {
      title: "Math and Computer Tutorial Record", subtitle: "Enrollment, diagnostic results, schedules, worksheet progress, and learning status.",
      fields: [
        field("scholar_id", "Scholar", "lookup", [], { lookup: "scholars", required: true }), field("enrollment_id", "School-year Enrollment", "lookup", [], { lookup: "enrollments" }),
        field("tutorial_type", "Tutorial", "select", ["Math", "Computer"]), field("enrollment_date", "Enrollment Date", "date"), field("schedule", "Schedule"),
        field("diagnostic_score", "Diagnostic Score", "number"), field("post_diagnostic_score", "Post-diagnostic Score", "number"),
        field("worksheet_level", "Worksheet / Module Level"), field("progress_status", "Status", "select", ["Enrolled", "Active", "On Hold", "Completed", "Withdrawn"]),
        field("last_session_date", "Latest Session", "date"), field("instructor", "Instructor"), field("notes", "Progress Notes", "textarea", [], { wide: true })
      ],
      columns: [["scholar_name", "Scholar"], ["tutorial_type", "Tutorial"], ["schedule", "Schedule"], ["diagnostic_score", "Diagnostic"], ["post_diagnostic_score", "Post"], ["worksheet_level", "Level"], ["progress_status", "Status"]]
    },
    healthPatients: {
      title: "Patient Profile", subtitle: "Confidential clinic profile with contact, companion, history, allergies, and TB status.",
      fields: [
        field("patient_no", "Patient No.", "text", [], { readonly: true }), field("full_name", "Full Name", "text", [], { required: true }), field("birth_date", "Birth Date", "date"), field("gender", "Gender", "select", ["Female", "Male", "Other", "Not Recorded"]),
        field("address", "Address", "textarea", [], { wide: true }), field("contact_no", "Contact No."), field("companion_name", "Companion"), field("companion_contact", "Companion Contact"),
        field("indigent_status", "Financial Assessment", "select", ["For Assessment", "Indigent", "Standard"]), field("tb_status", "TB Status", "select", ["Not Assessed", "Symptomatic", "Under Evaluation", "Active Treatment", "Completed", "Not TB"]),
        field("allergies", "Allergies", "textarea", [], { wide: true }), field("medical_history", "Medical History", "textarea", [], { wide: true }),
        field("confidentiality_level", "Confidentiality", "select", ["Restricted", "Highly Restricted"]), field("status", "Status", "select", ["Active", "Inactive", "Deceased"]), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["patient_no", "Patient No."], ["full_name", "Name"], ["birth_date", "Birth Date"], ["gender", "Gender"], ["contact_no", "Contact"], ["tb_status", "TB Status"], ["status", "Status"]]
    },
    healthEncounters: {
      title: "Clinic Encounter", subtitle: "Screening, consultation, prescriptions, laboratory requests, charges, and follow-up.",
      fields: [
        field("patient_id", "Patient", "lookup", [], { lookup: "healthPatients", required: true }), field("visit_date", "Visit Date", "date", [], { required: true }),
        field("visit_type", "Visit Type", "select", ["Regular Consultation", "TB Consultation", "Follow-up", "Laboratory", "Medicine Release", "Emergency"]), field("queue_no", "Queue No.", "number"),
        field("companion_name", "Companion"), field("temperature", "Temperature", "number"), field("screening_result", "Screening Result", "textarea", [], { wide: true }),
        field("consultation_notes", "Consultation Notes", "textarea", [], { wide: true }), field("diagnosis", "Diagnosis", "textarea", [], { wide: true }),
        field("prescription_summary", "Prescription / Medicines", "textarea", [], { wide: true }), field("laboratory_request", "Laboratory Request", "textarea", [], { wide: true }),
        field("charges", "Charges", "number"), field("minimum_donation", "Minimum Donation", "number"), field("payment_status", "Payment", "select", ["Pending", "Paid", "Waived", "Partially Paid"]),
        field("attending_staff", "Attending Staff"), field("next_visit_date", "Next Visit", "date"), field("status", "Status", "select", ["Open", "Completed", "Referred", "Cancelled"]), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["visit_date", "Visit"], ["patient_name", "Patient"], ["visit_type", "Type"], ["queue_no", "Queue"], ["diagnosis", "Diagnosis"], ["attending_staff", "Staff"], ["status", "Status"]]
    },
    healthTbRecords: {
      title: "TB, DOT, PPD, and Treatment Record", subtitle: "Observed medication, tests, child medicine releases, registration, and next visits.",
      fields: [
        field("patient_id", "Patient", "lookup", [], { lookup: "healthPatients", required: true }), field("record_type", "Record Type", "select", ["DOT Administration", "PPD Test", "PPD Result", "CAT I Medicine Release", "Treatment Initiation", "TB Registration", "Counseling"]),
        field("tb_case_no", "TB Case No."), field("record_date", "Record Date", "date", [], { required: true }), field("medicine", "Medicine"), field("dose", "Dose"),
        field("observed_by", "Observed / Handled By"), field("result", "Result / Observation", "textarea", [], { wide: true }), field("next_date", "Next Date", "date"),
        field("treatment_status", "Treatment Status", "select", ["Ongoing", "Completed", "Interrupted", "Transferred", "For Evaluation"]), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["record_date", "Date"], ["patient_name", "Patient"], ["record_type", "Type"], ["tb_case_no", "Case No."], ["medicine", "Medicine"], ["next_date", "Next"], ["treatment_status", "Status"]]
    },
    healthInventory: {
      title: "Medicine and Supplies Inventory", subtitle: "Batch and expiry tracking ordered by first-expiry, first-out.",
      fields: [
        field("item_no", "Item No.", "text", [], { readonly: true }), field("item_name", "Item Name", "text", [], { required: true }), field("item_type", "Type", "select", ["Medicine", "Laboratory Supply", "Clinic Supply", "TB Drug", "Other"]),
        field("batch_no", "Batch No."), field("expiry_date", "Expiry Date", "date"), field("quantity", "Quantity", "number"), field("unit", "Unit"), field("reorder_level", "Reorder Level", "number"),
        field("storage_location", "Storage Location"), field("supplier", "Supplier / Source"), field("last_movement_date", "Latest Movement", "date"),
        field("status", "Status", "select", ["Available", "Low Stock", "Out of Stock", "Expired", "Quarantined"]), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["item_no", "Item No."], ["item_name", "Item"], ["item_type", "Type"], ["batch_no", "Batch"], ["expiry_date", "Expiry"], ["quantity", "Quantity"], ["reorder_level", "Reorder"], ["status", "Status"]]
    },
    healthEquipment: {
      title: "Clinic Equipment", subtitle: "Condition, location, custodian, and preventive maintenance schedule.",
      fields: [
        field("equipment_no", "Equipment No.", "text", [], { readonly: true }), field("equipment_name", "Equipment", "text", [], { required: true }), field("category", "Category"), field("location", "Location"),
        field("item_condition", "Condition", "select", ["New", "Good", "Fair", "For Repair", "Unserviceable"]), field("purchase_date", "Purchase Date", "date"), field("acquisition_cost", "Acquisition Cost", "number"),
        field("last_maintenance_date", "Last Maintenance", "date"), field("next_maintenance_date", "Next Maintenance", "date"), field("custodian", "Custodian"),
        field("status", "Status", "select", ["In Service", "For Maintenance", "Out of Service", "Disposed"]), field("notes", "Notes", "textarea", [], { wide: true })
      ],
      columns: [["equipment_no", "No."], ["equipment_name", "Equipment"], ["category", "Category"], ["location", "Location"], ["item_condition", "Condition"], ["next_maintenance_date", "Next Maintenance"], ["status", "Status"]]
    }
  };

  const ROUTES = {
    "admin-cases": ["cases"],
    "admin-people": ["people", "personnelActions"],
    "admin-assets": ["assets", "procurements"],
    "admin-finance": ["finance", "donations", "distributions"],
    "admin-compliance": ["compliance", "policies", "audit"],
    "livelihood-finance": ["finance"],
    "nutrition-finance": ["finance"],
    "scholarship-finance": ["finance"],
    "health-finance": ["finance"],
    "nutrition-operations": ["nutritionAdmissions", "nutritionAttendance", "nutritionHealthSafety"],
    "scholarship-operations": ["scholarshipApplications", "scholarshipCommunications", "scholarshipTutorials"],
    "health-patients": ["healthPatients"],
    "health-monitoring": ["healthEncounters", "healthTbRecords"],
    "health-supplies": ["healthInventory"],
    "health-equipment": ["healthEquipment"]
  };

  function ctx() { return state.context; }
  function escape(value) { return ctx().escapeHtml(String(value ?? "")); }
  function currentPage(entity) { return state.pages[entity] || 1; }
  function programLabel(value) { return PROGRAM_OPTIONS.find(option => option[0] === value)?.[1] || value || ""; }
  function financeProgram() { return PROGRAM_FINANCE_ROUTES[state.activeRoute] || ""; }
  function financeEntityBase(entity) {
    const program = entity === "finance" ? financeProgram() : "";
    return program ? `/api/operations/program-finance/${program}` : `/api/operations/entities/${entity}`;
  }

  async function apiEntityList(entity, options = {}) {
    const params = new URLSearchParams({ limit: String(options.limit || 25), offset: String(options.offset || 0) });
    Object.entries(options).forEach(([key, value]) => { if (!["limit", "offset"].includes(key) && value !== "" && value !== undefined) params.set(key, value); });
    return ctx().api(`${financeEntityBase(entity)}?${params}`);
  }

  async function apiEntityGet(entity, id) {
    return (await ctx().api(`${financeEntityBase(entity)}/${id}`)).record;
  }

  async function apiEntitySave(entity, record) {
    const program = entity === "finance" ? financeProgram() : "";
    return (await ctx().api(financeEntityBase(entity), { method: "POST", body: JSON.stringify(program ? { ...record, program_code: program } : record), loadingMessage: "Saving operational record" })).record;
  }

  function canWrite(entity) {
    if (ctx().currentUser?.role === "superadmin") return true;
    const program = entity === "finance" && financeProgram() ? financeProgram() : state.meta?.entities?.[entity]?.program;
    const roles = new Set(ctx().currentUser?.program_roles?.[program] || []);
    if (entity === "finance" && financeProgram()) return ["program_officer", "finance", "program_assistant", "coordinator"].some(role => roles.has(role));
    return (state.meta?.permissions?.[entity] || []).some(role => roles.has(role));
  }

  function canArchive(entity) {
    if (ctx().currentUser?.role === "superadmin") return true;
    const program = entity === "finance" && financeProgram() ? financeProgram() : state.meta?.entities?.[entity]?.program;
    const roles = new Set(ctx().currentUser?.program_roles?.[program] || []);
    return roles.has("program_officer") || (["finance", "donations", "distributions", "personnelActions"].includes(entity) && roles.has("finance"));
  }

  function displayValue(fieldName, value) {
    if (["program_code"].includes(fieldName)) return programLabel(value);
    if (["amount", "cash_amount", "estimated_value", "estimated_amount", "acquisition_cost", "charges", "minimum_donation", "amount_value"].includes(fieldName)) return ctx().formatMoney(Number(value || 0));
    if (["anonymous", "solid_food_capable", "residence_eligible", "parent_agreement", "duty_commitment", "meal_received", "guardian_present", "parent_duty"].includes(fieldName)) return Number(value) ? "Yes" : "No";
    if (fieldName.endsWith("_at") && value) return new Date(value).toLocaleString();
    return value ?? "";
  }

  function entityTabs(route, activeEntity) {
    const entities = ROUTES[route] || [];
    if (entities.length < 2) return "";
    return `<div class="operations-tabs" role="tablist">${entities.map(entity => `<button type="button" class="${entity === activeEntity ? "active" : ""}" data-entity-tab="${entity}">${escape(FORMS[entity].title)}</button>`).join("")}</div>`;
  }

  function pagination(entity, total, page, pageSize) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    return `<div class="pagination-bar"><span>Page ${page} of ${pages} | ${total} records</span><button type="button" class="text-button" data-page="${page - 1}" ${page <= 1 ? "disabled" : ""}>Previous</button><button type="button" class="text-button" data-page="${page + 1}" ${page >= pages ? "disabled" : ""}>Next</button></div>`;
  }

  function tableHtml(entity, records) {
    const columns = FORMS[entity].columns;
    return `<div class="operations-table-scroll"><table class="records-table operations-table"><thead><tr><th>Actions</th>${columns.map(([, label]) => `<th>${escape(label)}</th>`).join("")}</tr></thead><tbody>${records.length ? records.map(record => `<tr><td class="row-actions"><button type="button" class="icon-button" data-edit-id="${record.id}" title="Edit">${ctx().icon("edit")}</button>${canArchive(entity) && !record.deleted_at ? `<button type="button" class="icon-button danger" data-archive-id="${record.id}" title="Archive">${ctx().icon("bin")}</button>` : ""}${record.deleted_at ? `<button type="button" class="icon-button" data-restore-id="${record.id}" title="Restore">${ctx().icon("refresh")}</button>` : ""}</td>${columns.map(([key]) => `<td>${escape(displayValue(key, record[key]))}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${columns.length + 1}"><div class="empty-state">No records match the current view.</div></td></tr>`}</tbody></table></div>`;
  }

  async function renderEntityPage(route, entity) {
    const form = FORMS[entity];
    const scopedProgram = entity === "finance" ? financeProgram() : "";
    const pageSize = 25;
    const page = currentPage(entity);
    ctx().setTitle(scopedProgram ? `${programLabel(scopedProgram)} Finance` : form.title);
    ctx().setTopbarActions(canWrite(entity) && form.fields.length ? [{ id: "operationsNew", label: "New", icon: "plus", variant: "primary", onClick: () => openEditor(route, entity) }] : []);
    const search = state.search?.[entity] || "";
    const includeArchived = state.archived?.[entity] ? "1" : "";
    const payload = await apiEntityList(entity, { search, include_archived: includeArchived, limit: pageSize, offset: (page - 1) * pageSize });
    const title = scopedProgram ? `${programLabel(scopedProgram)} Finance Ledger` : form.title;
    ctx().root.innerHTML = `<section class="operations-page flow-data-section"><header class="operations-heading"><div><p class="eyebrow">PAOFI Programs Database</p><h2>${escape(title)}</h2><p>${escape(scopedProgram ? "Program transactions linked directly to the Administrative Financial Section." : form.subtitle)}</p></div><span class="operations-count">${payload.total || 0}</span></header>${entityTabs(route, entity)}<div class="operations-toolbar"><label class="search-band"><span class="search-icon">${ctx().icon("search")}</span><input id="operationsSearch" value="${escape(search)}" placeholder="Search ${escape(title.toLowerCase())}"></label><label class="archive-toggle"><input id="operationsArchived" type="checkbox" ${includeArchived ? "checked" : ""}><span>Include archived</span></label>${canWrite(entity) && form.fields.length ? `<button type="button" id="operationsAddInline" class="action-button primary"><span class="button-icon">${ctx().icon("plus")}</span><span>New Record</span></button>` : ""}<button type="button" id="operationsPrint" class="icon-button" title="Print current table">${ctx().icon("print")}</button></div><div id="operationsTableHost">${tableHtml(entity, payload.records || [])}${pagination(entity, payload.total || 0, page, pageSize)}</div></section>`;
    bindEntityPage(route, entity, payload.records || []);
  }

  function bindEntityPage(route, entity) {
    let timer;
    ctx().root.querySelector("#operationsSearch")?.addEventListener("input", event => {
      clearTimeout(timer);
      timer = setTimeout(() => { state.search = { ...(state.search || {}), [entity]: event.target.value }; state.pages[entity] = 1; renderEntityPage(route, entity).catch(error => ctx().showToast(error.message)); }, 250);
    });
    ctx().root.querySelector("#operationsArchived")?.addEventListener("change", event => { state.archived = { ...(state.archived || {}), [entity]: event.target.checked }; state.pages[entity] = 1; renderEntityPage(route, entity).catch(error => ctx().showToast(error.message)); });
    ctx().root.querySelector("#operationsAddInline")?.addEventListener("click", () => openEditor(route, entity));
    ctx().root.querySelector("#operationsPrint")?.addEventListener("click", () => printCurrentEntity(entity));
    ctx().root.querySelectorAll("[data-entity-tab]").forEach(button => button.addEventListener("click", () => ctx().navigate(route, button.dataset.entityTab)));
    ctx().root.querySelectorAll("[data-edit-id]").forEach(button => button.addEventListener("click", () => openEditor(route, entity, button.dataset.editId)));
    ctx().root.querySelectorAll("[data-archive-id]").forEach(button => button.addEventListener("click", async () => {
      if (!confirm("Archive this record? It can be restored later.")) return;
      try { await ctx().api(`${financeEntityBase(entity)}/${button.dataset.archiveId}`, { method: "DELETE" }); ctx().showToast("Record archived."); await renderEntityPage(route, entity); } catch (error) { ctx().showToast(error.message); }
    }));
    ctx().root.querySelectorAll("[data-restore-id]").forEach(button => button.addEventListener("click", async () => {
      try { await ctx().api(`${financeEntityBase(entity)}/${button.dataset.restoreId}/restore`, { method: "POST", body: "{}" }); ctx().showToast("Record restored."); await renderEntityPage(route, entity); } catch (error) { ctx().showToast(error.message); }
    }));
    ctx().root.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => { state.pages[entity] = Number(button.dataset.page); renderEntityPage(route, entity).catch(error => ctx().showToast(error.message)); }));
  }

  async function lookupOptions(type) {
    if (state.lookups.has(type)) return state.lookups.get(type);
    let records = [];
    if (type === "nutritionBeneficiaries") records = (await ctx().api("/api/nutrition/beneficiaries?limit=500")).beneficiaries.map(item => [item.id, `${item.child_last_name}, ${item.child_first_name} (${item.beneficiary_no || "No number"})`]);
    if (type === "nutritionCenters") records = (await ctx().api("/api/nutrition/centers?limit=200")).centers.map(item => [item.id, item.center_name]);
    if (["scholars", "sponsors", "chapels", "academicYears", "enrollments"].includes(type)) {
      const payload = await ctx().api(`/api/scholarship/entities/${type}?limit=500`);
      records = payload.records.map(item => {
        if (type === "scholars") return [item.id, `${item.last_name}, ${item.first_name} (${item.scholar_no || "No number"})`];
        if (type === "sponsors") return [item.id, item.sponsor_name];
        if (type === "chapels") return [item.id, item.chapel_name];
        if (type === "academicYears") return [item.id, item.label];
        return [item.id, item.enrollment_label || `${item.scholar_name || `Scholar ${item.scholar_id}`} - ${item.education_level || "Enrollment"}`];
      });
    }
    if (type === "healthPatients") records = (await apiEntityList("healthPatients", { limit: 500 })).records.map(item => [item.id, `${item.full_name} (${item.patient_no || "No number"})`]);
    if (type === "operationsPeople") records = (await apiEntityList("people", { limit: 500 })).records.map(item => [item.id, `${item.full_name} (${item.person_no || "No number"})`]);
    if (type === "operationsDonations") records = (await apiEntityList("donations", { limit: 500 })).records.map(item => [item.id, `${item.donation_no || "Donation"} - ${item.donor_name || "Anonymous"}`]);
    if (type === "operationsPolicies") records = (await apiEntityList("policies", { limit: 500 })).records.map(item => [item.id, `${item.policy_no || "Policy"} - ${item.title}`]);
    state.lookups.set(type, records);
    return records;
  }

  async function inputHtml(fieldDef, value) {
    const common = `name="${fieldDef.name}" ${fieldDef.required ? "required" : ""} ${fieldDef.readonly ? "readonly" : ""}`;
    if (fieldDef.type === "textarea") return `<textarea ${common}>${escape(value)}</textarea>`;
    if (fieldDef.type === "select" || fieldDef.type === "lookup") {
      const options = fieldDef.type === "lookup" ? await lookupOptions(fieldDef.lookup) : fieldDef.options.map(option => Array.isArray(option) ? option : [option, option]);
      return `<select ${common}><option value="">Select</option>${options.map(([optionValue, label]) => `<option value="${escape(optionValue)}" ${String(optionValue) === String(value ?? "") ? "selected" : ""}>${escape(label)}</option>`).join("")}</select>`;
    }
    const step = fieldDef.type === "number" ? "step=\"0.01\"" : "";
    return `<input ${common} type="${fieldDef.type}" ${step} value="${escape(value)}">`;
  }

  async function openEditor(route, entity, id = "") {
    const form = FORMS[entity];
    const record = id ? await apiEntityGet(entity, id) : {};
    const scopedProgram = entity === "finance" ? financeProgram() : "";
    if (scopedProgram) record.program_code = scopedProgram;
    const inputs = await Promise.all(form.fields.map(async fieldDef => {
      if (scopedProgram && fieldDef.name === "program_code") return `<label><span>Program</span><input value="${escape(programLabel(scopedProgram))}" readonly><input type="hidden" name="program_code" value="${escape(scopedProgram)}"></label>`;
      return `<label class="${fieldDef.wide ? "wide" : ""}"><span>${escape(fieldDef.label)}</span>${await inputHtml(fieldDef, record[fieldDef.name])}</label>`;
    }));
    const overlay = document.createElement("div");
    overlay.className = "modal-backdrop operations-modal-backdrop";
    overlay.innerHTML = `<section class="modal-panel operations-modal"><header><div><p class="eyebrow">${id ? "Edit Record" : "New Record"}</p><h2>${escape(form.title)}</h2></div><button type="button" class="icon-button" data-close title="Close">${ctx().icon("close")}</button></header><form id="operationsForm"><div class="operations-form-grid">${inputs.join("")}</div><div class="form-actions"><button type="button" class="action-button" data-close>Cancel</button><button type="submit" class="action-button primary"><span class="button-icon">${ctx().icon("save")}</span><span>Save</span></button></div></form></section>`;
    const close = () => overlay.remove();
    overlay.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", close));
    overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
    overlay.querySelector("form").addEventListener("submit", async event => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      if (id) payload.id = id;
      try { await apiEntitySave(entity, payload); state.lookups.clear(); close(); ctx().showToast("Record saved."); await renderEntityPage(route, entity); } catch (error) { ctx().showToast(error.message); }
    });
    document.body.appendChild(overlay);
    overlay.querySelector("input:not([readonly]),select,textarea")?.focus();
  }

  async function printCurrentEntity(entity) {
    const scopedProgram = entity === "finance" ? financeProgram() : "";
    const params = new URLSearchParams({ search: state.search?.[entity] || "", limit: "500" });
    if (!scopedProgram) params.set("entity", entity);
    const payload = await ctx().api(scopedProgram ? `/api/operations/program-finance/${scopedProgram}?${params}` : `/api/operations/export?${params}`);
    const form = FORMS[entity];
    const rows = payload.records || [];
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escape(form.title)}</title><style>@page{size:Letter landscape;margin:.45in}*{box-sizing:border-box}body{font:10px Arial;color:#17231e;margin:0}header{display:flex;gap:14px;align-items:center;border-bottom:3px solid #146c43;padding-bottom:10px;margin-bottom:14px}header img{width:54px;height:54px;object-fit:contain}h1{font-size:18px;margin:0 0 3px}p{margin:0;color:#52645b}table{width:100%;border-collapse:collapse}th,td{border:1px solid #aabbb2;padding:5px;text-align:left;vertical-align:top}th{background:#e8f2ec}</style></head><body><header><img src="${location.origin}/assets/paofi-logo.png" alt=""><div><h1>Payatas Orione Foundation Inc.</h1><p>${escape(form.title)} | ${new Date().toLocaleDateString()}</p></div></header><table><thead><tr>${form.columns.map(([, label]) => `<th>${escape(label)}</th>`).join("")}</tr></thead><tbody>${rows.map(record => `<tr>${form.columns.map(([key]) => `<td>${escape(displayValue(key, record[key]))}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
    ctx().showDocumentPrintPreview(form.title, html);
  }

  async function safeList(entity, limit = 6) {
    try { return (await apiEntityList(entity, { limit })).records || []; } catch { return []; }
  }

  async function renderAdminOverview() {
    ctx().setTitle("Administrative Overview");
    ctx().setTopbarActions([]);
    const [overview, cases, compliance, audit] = await Promise.all([
      ctx().api("/api/operations/overview?program=administration"), safeList("cases"), safeList("compliance"), safeList("audit", 8)
    ]);
    const recentRows = audit.length ? audit.map(item => `<li><span>${escape(item.action)}</span><strong>${escape(item.summary || item.entity_type)}</strong><time>${escape(displayValue("created_at", item.created_at))}</time></li>`).join("") : `<li class="empty-state">No operational changes yet.</li>`;
    ctx().root.innerHTML = `<section class="operations-dashboard"><header class="operations-overview-hero"><div><p class="eyebrow">Organization and Administration</p><h2>Operational control, without the filing-cabinet fog.</h2><p>Safeguarding, people, assets, approvals, finance, and report deadlines share one accountable record trail.</p></div><div class="operations-overview-total"><span>Open cases</span><strong>${overview.openCases || 0}</strong><em>restricted access</em></div></header><div class="operations-signal-strip"><button data-go="admin-people"><span>Active personnel</span><strong>${overview.activePeople || 0}</strong></button><button data-go="admin-assets"><span>Assets recorded</span><strong>${overview.assets || 0}</strong></button><button data-go="admin-assets/procurements"><span>Pending procurement</span><strong>${overview.pendingProcurements || 0}</strong></button><button data-go="admin-compliance"><span>Items due</span><strong>${overview.pendingCompliance || 0}</strong></button></div><div class="operations-overview-flow"><section><div class="panel-title-row"><h3>Immediate attention</h3><span>Cases and deadlines</span></div><div class="operations-attention-list">${[...cases.map(item => ({ title: item.case_no || item.case_type, meta: `${item.case_type} | ${item.status}` })), ...compliance.map(item => ({ title: item.title, meta: `${item.due_date || "No due date"} | ${item.status}` }))].slice(0, 8).map(item => `<button data-go="${item.title?.startsWith("CAS-") ? "admin-cases" : "admin-compliance"}"><strong>${escape(item.title)}</strong><span>${escape(item.meta)}</span></button>`).join("") || `<p class="empty-state">No urgent records.</p>`}</div></section><section><div class="panel-title-row"><h3>Recent changes</h3><span>Organization audit</span></div><ol class="operations-audit-stream">${recentRows}</ol></section></div></section>`;
    ctx().root.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => { const [route, id] = button.dataset.go.split("/"); ctx().navigate(route, id || ""); }));
  }

  function binEntityLabel(value) {
    return String(value || "record").replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("-", " ").replace(/\b\w/g, letter => letter.toUpperCase());
  }

  async function renderRecordBin(route) {
    const fixedProgram = BIN_ROUTES[route];
    const pageKey = `bin:${route}`;
    const page = state.pages[pageKey] || 1;
    const pageSize = 40;
    const search = state.search?.[pageKey] || "";
    const selectedProgram = route === "main-bin" ? (state.binProgram || "") : fixedProgram;
    const params = new URLSearchParams({ search, limit: String(pageSize), offset: String((page - 1) * pageSize) });
    if (selectedProgram) params.set("program", selectedProgram);
    const payload = await ctx().api(`/api/record-bin?${params}`);
    const title = route === "main-bin" ? "Main Record Bin" : `${programLabel(fixedProgram)} Record Bin`;
    ctx().setTitle(title);
    ctx().setTopbarActions([]);
    const pages = Math.max(1, Math.ceil((payload.total || 0) / pageSize));
    const programFilter = route === "main-bin" ? `<label class="archive-toggle"><span>Program</span><select id="recordBinProgram"><option value="">All accessible programs</option>${(payload.accessible_programs || []).map(program => `<option value="${escape(program)}" ${program === selectedProgram ? "selected" : ""}>${escape(programLabel(program))}</option>`).join("")}</select></label>` : "";
    ctx().root.innerHTML = `<section class="operations-page record-bin-page flow-data-section"><header class="operations-heading"><div><p class="eyebrow">Recoverable Records</p><h2>${escape(title)}</h2><p>Archived records stay out of active workspaces until an authorized officer restores them.</p></div><span class="operations-count">${payload.total || 0}</span></header><div class="operations-toolbar"><label class="search-band"><span class="search-icon">${ctx().icon("search")}</span><input id="recordBinSearch" value="${escape(search)}" placeholder="Search archived records"></label>${programFilter}</div><div class="operations-table-scroll"><table class="records-table operations-table"><thead><tr><th>Action</th><th>Program</th><th>Record Type</th><th>Record</th><th>Archived</th></tr></thead><tbody>${(payload.records || []).length ? payload.records.map(record => `<tr><td>${record.can_restore ? `<button type="button" class="icon-button" data-bin-restore='${escape(JSON.stringify({ source: record.source, id: record.id, program_code: record.program_code, entity_type: record.entity_type }))}' title="Restore">${ctx().icon("refresh")}</button>` : ""}</td><td>${escape(programLabel(record.program_code))}</td><td>${escape(binEntityLabel(record.entity_type))}</td><td>${escape(record.display_label)}</td><td>${escape(displayValue("deleted_at", record.deleted_at))}</td></tr>`).join("") : `<tr><td colspan="5"><div class="empty-state">No archived records in this view.</div></td></tr>`}</tbody></table></div><div class="pagination-bar"><span>Page ${page} of ${pages} | ${payload.total || 0} records</span><button type="button" class="text-button" data-bin-page="${page - 1}" ${page <= 1 ? "disabled" : ""}>Previous</button><button type="button" class="text-button" data-bin-page="${page + 1}" ${page >= pages ? "disabled" : ""}>Next</button></div></section>`;
    let timer;
    ctx().root.querySelector("#recordBinSearch")?.addEventListener("input", event => { clearTimeout(timer); timer = setTimeout(() => { state.search = { ...(state.search || {}), [pageKey]: event.target.value }; state.pages[pageKey] = 1; renderRecordBin(route).catch(error => ctx().showToast(error.message)); }, 250); });
    ctx().root.querySelector("#recordBinProgram")?.addEventListener("change", event => { state.binProgram = event.target.value; state.pages[pageKey] = 1; renderRecordBin(route).catch(error => ctx().showToast(error.message)); });
    ctx().root.querySelectorAll("[data-bin-page]").forEach(button => button.addEventListener("click", () => { state.pages[pageKey] = Number(button.dataset.binPage); renderRecordBin(route).catch(error => ctx().showToast(error.message)); }));
    ctx().root.querySelectorAll("[data-bin-restore]").forEach(button => button.addEventListener("click", async () => {
      if (!confirm("Restore this record to its program workspace?")) return;
      try { await ctx().api("/api/record-bin/restore", { method: "POST", body: button.dataset.binRestore }); ctx().showToast("Record restored."); await renderRecordBin(route); } catch (error) { ctx().showToast(error.message); }
    }));
  }

  async function renderRoute(route, id, context) {
    state.context = context;
    state.activeRoute = route;
    if (!state.meta) state.meta = await context.api("/api/operations/meta");
    if (Object.prototype.hasOwnProperty.call(BIN_ROUTES, route)) return renderRecordBin(route);
    if (route === "admin-overview") return renderAdminOverview();
    const entities = ROUTES[route];
    if (!entities) return renderAdminOverview();
    const entity = entities.includes(id) ? id : entities[0];
    return renderEntityPage(route, entity);
  }

  window.OperationsApp = { renderRoute };
})();
