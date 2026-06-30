const BENEFICIARY_FIELDS = [
  { name: "date_updated", label: "Latest Update", section: "Record", input: "date" },
  { name: "control_no", label: "Control No.", section: "Record", input: "text", required: true },
  { name: "status", label: "Status", section: "Record", input: "select", options: ["Active", "Inactive", "Pending"] },
  { name: "picture_data", label: "Picture", section: "Record", input: "image" },

  { name: "last_name", label: "Last Name", section: "I. Personal Information", input: "text" },
  { name: "first_name", label: "First Name", section: "I. Personal Information", input: "text" },
  { name: "middle_name", label: "Middle Name", section: "I. Personal Information", input: "text" },
  { name: "field_c11", label: "Age", section: "I. Personal Information", input: "text" },
  { name: "field_h11", label: "Gender", section: "I. Personal Information", input: "text" },
  { name: "field_l11", label: "Contact No.", section: "I. Personal Information", input: "text" },
  { name: "field_c12", label: "Chapel", section: "I. Personal Information", input: "text" },
  { name: "field_c13", label: "Address", section: "I. Personal Information", input: "textarea", rows: 2 },
  { name: "field_c14", label: "Special Circumstance", section: "I. Personal Information", input: "text" },

  { name: "list_a18", label: "Last Name, First Name, Middle Name", section: "II. Family Composition", input: "textarea", rows: 3 },
  { name: "list_c18", label: "Age", section: "II. Family Composition", input: "textarea", rows: 3 },
  { name: "list_d18", label: "Gender", section: "II. Family Composition", input: "textarea", rows: 3 },
  { name: "list_f18", label: "Relationship w/ the Applicant", section: "II. Family Composition", input: "textarea", rows: 3 },
  { name: "list_h18", label: "Civil Status", section: "II. Family Composition", input: "textarea", rows: 3 },
  { name: "list_j18", label: "Educ. Level/Completed", section: "II. Family Composition", input: "textarea", rows: 3 },
  { name: "list_k18", label: "Occupation", section: "II. Family Composition", input: "textarea", rows: 3 },
  { name: "list_m18", label: "Monthly Income", section: "II. Family Composition", input: "textarea", rows: 3 },

  { name: "paofi_active", label: "May Registered PAOFI Beneficiary ba sa mga kasama mo sa bahay?", section: "PAOFI Beneficiary", input: "text" },
  { name: "field_k30", label: "Kung Mayroon, Sa anong Program ng PAOFI", section: "PAOFI Beneficiary", input: "text" },

  { name: "field_e32", label: "Kasalukuyang pangkabuhayan o negosyo", section: "III. Livelihood Information", input: "text" },
  { name: "with_business", label: "Mayroon ka bang maliit na negosyo?", section: "III. Livelihood Information", input: "text" },
  { name: "field_j33", label: "Kung Mayroon, Pakisulat", section: "III. Livelihood Information", input: "text" },
  { name: "business_duration", label: "Gaano ka na katagal sa iyong negosyo o livelihood?", section: "III. Livelihood Information", input: "text" },

  { name: "livelihood_interest", label: "Livelihood na gustong salihan", section: "IV. Livelihood Project Interest", input: "text" },
  { name: "field_c38", label: "Bakit gusto mo itong salihan?", section: "IV. Livelihood Project Interest", input: "textarea", rows: 2 },
  { name: "field_f39", label: "Ano ang gusto mong matutunan sa proyektong ito?", section: "IV. Livelihood Project Interest", input: "textarea", rows: 2 },

  { name: "seminar", label: "Nag-seminar ka na ba para sa livelihood o business?", section: "V. Skills and Experience", input: "text" },
  { name: "field_k43", label: "Kung Oo, anong training/s o seminar/s ang nasalihan mo?", section: "V. Skills and Experience", input: "textarea", rows: 2 },

  { name: "willingness", label: "Willing ka ba na umattend ng mga trainings, seminars, at mentoring sessions?", section: "VI. Availability and Commitment", input: "text" },
  { name: "commit_days", label: "Ilang araw ka pwedeng mag commit sa livelihood activity mo kada linggo?", section: "VI. Availability and Commitment", input: "text" }
];

const FIELD_NAMES = BENEFICIARY_FIELDS.map(field => field.name);

const SUMMARY_FIELDS = [
  "id",
  "date_updated",
  "control_no",
  "status",
  "picture_data",
  "last_name",
  "first_name",
  "middle_name",
  "updated_at"
];

function fieldSectionMap() {
  return BENEFICIARY_FIELDS.reduce((sections, field) => {
    if (!sections[field.section]) sections[field.section] = [];
    sections[field.section].push(field);
    return sections;
  }, {});
}

module.exports = {
  BENEFICIARY_FIELDS,
  FIELD_NAMES,
  SUMMARY_FIELDS,
  fieldSectionMap
};
