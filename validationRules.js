// validationRules.js
// Hardcoded eligibility and rejection rules for the AI Validation Assistant

const ValidationRules = {
  // 1. Income Certificate
  "income_certificate": [
    "If the applicant's annual income exceeds 800000 INR, they may not be eligible for EWS (Economically Weaker Section) benefits, but the certificate itself can still be issued. Flag it as a warning.",
    "If 'Income Amount' is missing or 0, it's a high risk of rejection.",
    "If the applicant is a minor, the parent's income must be declared.",
    "Check for mismatch between Aadhaar Name and Applicant Name. Any mismatch is a high risk of rejection.",
    "If the 'Purpose' is left empty, the application may face delays. It's a low risk warning.",
    "Affidavit must be notarized to be valid. If standard self-declaration is used instead of a notarized affidavit for non-salaried persons, this might lead to rejection."
  ],

  // 2. Birth Certificate
  "birth_certificate": [
    "Application filed after 21 days of birth requires a late fee and an SDM order. If Date of Birth is more than 21 days ago, flag as HIGH RISK requiring late fee affidavit.",
    "Hospital name must match perfectly between the discharge summary and the application. Mismatch is a critical rejection risk.",
    "If the child's name is not yet decided, it can be left blank, but parent names are mandatory.",
    "Father and Mother name inconsistency across documents (Aadhaar vs Hospital Record) is a high rejection risk.",
    "If the address does not contain a Pincode, the application is likely to be rejected.",
    "Informant's relationship to the child must be declared (e.g., Father, Mother, Uncle)."
  ],

  // 3. Death Certificate
  "death_certificate": [
    "Application filed after 21 days requires SDM approval and late fee. Flag as HIGH RISK if Date of Death is >21 days ago.",
    "Applicant's relationship with the deceased is mandatory. If missing, high risk of rejection.",
    "Place of death must be clearly specified. If it occurred in a hospital, hospital records are mandatory.",
    "The name of the deceased must exactly match their ID proof (Aadhaar/Voter ID).",
    "Age/Date of Birth of the deceased must align with the provided IDs."
  ],

  // 4. Domicile/Resident Certificate
  "domicile_certificate": [
    "Applicant must have continuously resided in the state for at least 15 years. If 'Years of Stay' is less than 15, high risk of rejection.",
    "If the applicant is a minor, the father's/mother's domicile proof is required.",
    "Educational records of the last 3 years or land records are mandatory proofs. If not mentioned in evidence, flag as medium risk.",
    "Complete permanent address with District and Tehsil must be provided."
  ],

  // 5. Caste Certificate
  "caste_certificate": [
    "If applying for OBC, 'Creamy Layer' status must be explicitly stated based on income.",
    "Applicant's caste must exactly match the authorized state/central caste list.",
    "Father's caste certificate or revenue record establishing caste is a mandatory attachment.",
    "If religion is changed, caste certificate rules may vary. Any indication of recent conversion should be flagged for review.",
    "The village/town of birth is mandatory to trace the origin of the caste."
  ],

  // 6. Old Age Pension
  "old_age_pension": [
    "Applicant must be 60 years or older. If calculated age < 60, CRITICAL rejection.",
    "Must belong to Below Poverty Line (BPL) family. BPL number/Ration card is mandatory.",
    "If the applicant already receives another government pension, they are ineligible. Flag as high risk.",
    "Bank Account Name must exactly match the Applicant Name for DBT (Direct Benefit Transfer).",
    "Aadhaar linkage is mandatory. If Aadhaar is missing, rejection is guaranteed."
  ],

  // 7. Widow Pension
  "widow_pension": [
    "Applicant age must be 18 years or older.",
    "Death certificate of the husband is absolutely mandatory.",
    "If the applicant has remarried, she is ineligible. (Status must be Widow).",
    "BPL proof is typically strictly required. Missing BPL info is a high risk.",
    "Bank Account and IFSC must be valid for direct benefit transfer."
  ],

  // 8. Kisan Registration
  "kisan_registration": [
    "Landholding details (Khasra/Khatauni number) must be provided. Missing land records guarantee rejection.",
    "Aadhaar Number is strictly mandatory.",
    "Bank account must match the Aadhaar-seeded account. Any name mismatch is high risk.",
    "Mobile number must be linked with Aadhaar.",
    "Total farm area must align with the category applied for (Marginal/Small/Large)."
  ],

  // 9. Ration Card (New/Modification)
  "ration_card": [
    "Head of the family should ideally be the eldest female member. If not, flag as a warning/info.",
    "Total family members' details (names, ages, Aadhaar) must be fully populated.",
    "If any family member's Aadhaar is missing, they will be excluded from the card.",
    "Annual income proof is required to determine the card category (AAY, PHH, etc.).",
    "Complete residential address is mandatory for FPS (Fair Price Shop) mapping."
  ],

  // 10. Default / Fallback Rules
  "default": [
    "All names should perfectly match exactly across all submitted documents (Aadhaar, PAN, application).",
    "Mandatory fields like Date of Birth, Gender, and Mobile Number cannot be empty.",
    "Any address missing a Pincode or District is a high risk for rejection.",
    "Signatures or self-attestations are required on all uploaded documents."
  ]
};

if (typeof window !== "undefined") {
  window.ValidationRules = ValidationRules;
}
