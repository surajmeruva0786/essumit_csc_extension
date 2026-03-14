// Validation rules aligned with validationRules.js for AI validation

export const VALIDATION_RULES: Record<string, string[]> = {
  income_certificate: [
    "If the applicant's annual income exceeds 800000 INR, they may not be eligible for EWS benefits. Flag it as a warning.",
    "If 'Income Amount' is missing or 0, it's a high risk of rejection.",
    "If the applicant is a minor, the parent's income must be declared.",
    "Check for mismatch between Aadhaar Name and Applicant Name. Any mismatch is a high risk of rejection.",
    "If the 'Purpose' is left empty, the application may face delays. It's a low risk warning.",
    "Affidavit must be notarized to be valid.",
  ],
  birth_certificate: [
    "Application filed after 21 days of birth requires a late fee and an SDM order. Flag as HIGH RISK if Date of Birth is more than 21 days ago.",
    "Hospital name must match perfectly between the discharge summary and the application. Mismatch is a critical rejection risk.",
    "Father and Mother name inconsistency across documents is a high rejection risk.",
    "If the address does not contain a Pincode, the application is likely to be rejected.",
    "Informant's relationship to the child must be declared.",
  ],
  death_certificate: [
    "Application filed after 21 days requires SDM approval and late fee. Flag as HIGH RISK if Date of Death is >21 days ago.",
    "Applicant's relationship with the deceased is mandatory. If missing, high risk of rejection.",
    "Place of death must be clearly specified.",
    "The name of the deceased must exactly match their ID proof (Aadhaar/Voter ID).",
  ],
  domicile_certificate: [
    "Applicant must have continuously resided in the state for at least 15 years. If 'Years of Stay' is less than 15, high risk of rejection.",
    "If the applicant is a minor, the father's/mother's domicile proof is required.",
    "Complete permanent address with District and Tehsil must be provided.",
  ],
  caste_certificate: [
    "If applying for OBC, 'Creamy Layer' status must be explicitly stated based on income.",
    "Father's caste certificate or revenue record establishing caste is a mandatory attachment.",
    "The village/town of birth is mandatory to trace the origin of the caste.",
  ],
  old_age_pension: [
    "Applicant must be 60 years or older. If calculated age < 60, CRITICAL rejection.",
    "Must belong to Below Poverty Line (BPL) family. BPL number/Ration card is mandatory.",
    "Bank Account Name must exactly match the Applicant Name for DBT.",
    "Aadhaar linkage is mandatory. If Aadhaar is missing, rejection is guaranteed.",
  ],
  widow_pension: [
    "Applicant age must be 18 years or older.",
    "Death certificate of the husband is absolutely mandatory.",
    "If the applicant has remarried, she is ineligible.",
    "Bank Account and IFSC must be valid for direct benefit transfer.",
  ],
  kisan_registration: [
    "Landholding details (Khasra/Khatauni number) must be provided. Missing land records guarantee rejection.",
    "Aadhaar Number is strictly mandatory.",
    "Bank account must match the Aadhaar-seeded account.",
  ],
  ration_card: [
    "Total family members' details (names, ages, Aadhaar) must be fully populated.",
    "If any family member's Aadhaar is missing, they will be excluded from the card.",
    "Annual income proof is required to determine the card category.",
    "Complete residential address is mandatory for FPS mapping.",
  ],
  default: [
    "All names should perfectly match exactly across all submitted documents.",
    "Mandatory fields like Date of Birth, Gender, and Mobile Number cannot be empty.",
    "Any address missing a Pincode or District is a high risk for rejection.",
  ],
};

export function getValidationRules(backendServiceId: string): string[] {
  const rules = VALIDATION_RULES[backendServiceId] || VALIDATION_RULES.default || [];
  const defaultRules = VALIDATION_RULES.default || [];
  return [...new Set([...rules, ...defaultRules])];
}
