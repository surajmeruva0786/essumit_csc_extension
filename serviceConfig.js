/* ============================================================
   CSC Sahayak — Service Configuration
   All 10 government services with documents, URLs, fields, eligibility
   ============================================================ */

const SERVICE_CONFIG = {
  birth_certificate: {
    id: "birth_certificate",
    emoji: "🎂",
    name: "Birth Certificate",
    nameHindi: "जन्म प्रमाण पत्र",
    formUrl: "https://edistrict.cgstate.gov.in/CRMS/birthRegistrationAction",
    requiredDocuments: [
      {
        id: "hospital_slip",
        name: "Hospital Birth Slip / Discharge Summary",
        nameHindi: "अस्पताल जन्म पर्ची / डिस्चार्ज सारांश",
        description: "Original birth slip issued by hospital or birth report from ANM for home delivery",
        mandatory: true
      },
      {
        id: "parent_aadhaar",
        name: "Aadhaar Card of Parent (Father or Mother)",
        nameHindi: "माता या पिता का आधार कार्ड",
        description: "Aadhaar card of either parent for identity verification",
        mandatory: true
      },
      {
        id: "marriage_cert",
        name: "Parent Marriage Certificate",
        nameHindi: "माता-पिता का विवाह प्रमाण पत्र",
        description: "Marriage certificate of parents, if available",
        mandatory: false
      },
      {
        id: "address_proof",
        name: "Address Proof",
        nameHindi: "पता प्रमाण",
        description: "Ration card, electricity bill, or any government address proof",
        mandatory: true
      }
    ],
    formFields: [
      "childName", "dateOfBirth", "gender", "placeOfBirth",
      "fatherName", "motherName", "fatherAadhaar", "motherAadhaar",
      "hospitalName", "address", "district", "state"
    ],
    eligibilityCriteria: [
      "Birth should have occurred in Indian territory",
      "Application within 21 days of birth — free registration",
      "After 21 days — late registration fee applicable",
      "After 1 year — requires court order for registration"
    ]
  },

  death_certificate: {
    id: "death_certificate",
    emoji: "☠️",
    name: "Death Certificate",
    nameHindi: "मृत्यु प्रमाण पत्र",
    formUrl: "https://edistrict.cgstate.gov.in/CRMS/deathRegistrationAction",
    requiredDocuments: [
      {
        id: "death_report",
        name: "Death Report from Hospital / Doctor",
        nameHindi: "अस्पताल / डॉक्टर से मृत्यु रिपोर्ट",
        description: "Medical certificate of cause of death (MCCD) from attending doctor or hospital",
        mandatory: true
      },
      {
        id: "deceased_aadhaar",
        name: "Aadhaar Card of Deceased",
        nameHindi: "मृतक का आधार कार्ड",
        description: "Aadhaar card of the deceased person",
        mandatory: true
      },
      {
        id: "applicant_aadhaar",
        name: "Aadhaar Card of Applicant",
        nameHindi: "आवेदक का आधार कार्ड",
        description: "Aadhaar of the person applying (family member)",
        mandatory: true
      },
      {
        id: "cremation_cert",
        name: "Cremation / Burial Certificate",
        nameHindi: "दाह संस्कार / दफन प्रमाण पत्र",
        description: "Certificate from cremation ground or burial ground",
        mandatory: false
      }
    ],
    formFields: [
      "deceasedName", "dateOfDeath", "placeOfDeath", "causeOfDeath",
      "gender", "age", "fatherOrSpouseName", "address",
      "applicantName", "applicantRelation"
    ],
    eligibilityCriteria: [
      "Death should have occurred in India",
      "Registration within 21 days of death — free",
      "After 21 days — late fee applicable",
      "After 1 year — requires magistrate order"
    ]
  },

  domicile_certificate: {
    id: "domicile_certificate",
    emoji: "🏠",
    name: "Domicile Certificate",
    nameHindi: "मूल निवास प्रमाण पत्र",
    formUrl: "https://edistrict.cgstate.gov.in/RJSS/citizenHome",
    requiredDocuments: [
      {
        id: "aadhaar",
        name: "Aadhaar Card",
        nameHindi: "आधार कार्ड",
        description: "Applicant's Aadhaar card",
        mandatory: true
      },
      {
        id: "ration_card",
        name: "Ration Card",
        nameHindi: "राशन कार्ड",
        description: "Family ration card showing address",
        mandatory: true
      },
      {
        id: "voter_id",
        name: "Voter ID Card",
        nameHindi: "मतदाता पहचान पत्र",
        description: "Voter ID showing current address in the state",
        mandatory: false
      },
      {
        id: "electricity_bill",
        name: "Electricity Bill / Property Tax Receipt",
        nameHindi: "बिजली बिल / संपत्ति कर रसीद",
        description: "Latest electricity bill or property tax receipt as address proof",
        mandatory: true
      },
      {
        id: "school_cert",
        name: "School Leaving Certificate / Transfer Certificate",
        nameHindi: "स्कूल छोड़ने का प्रमाण पत्र",
        description: "To verify duration of residence in the state",
        mandatory: false
      }
    ],
    formFields: [
      "applicantName", "fatherName", "dateOfBirth", "gender",
      "currentAddress", "permanentAddress", "residenceSinceYear",
      "district", "tehsil", "village"
    ],
    eligibilityCriteria: [
      "Must have resided in Chhattisgarh for minimum 15 years",
      "Or born in the state",
      "Patwari verification report is required",
      "Valid for lifetime unless address changes"
    ]
  },

  income_certificate: {
    id: "income_certificate",
    emoji: "💰",
    name: "Income Certificate",
    nameHindi: "आय प्रमाण पत्र",
    formUrl: "https://edistrict.cgstate.gov.in/RJSS/citizenHome",
    requiredDocuments: [
      {
        id: "aadhaar",
        name: "Aadhaar Card",
        nameHindi: "आधार कार्ड",
        description: "Applicant's Aadhaar card",
        mandatory: true
      },
      {
        id: "ration_card",
        name: "Ration Card",
        nameHindi: "राशन कार्ड",
        description: "Family ration card",
        mandatory: true
      },
      {
        id: "self_declaration",
        name: "Self Declaration / Affidavit",
        nameHindi: "स्व-घोषणा / शपथ पत्र",
        description: "Self-declaration of annual income on stamp paper or notarized affidavit",
        mandatory: true
      },
      {
        id: "salary_slip",
        name: "Salary Slip / Income Proof",
        nameHindi: "वेतन पर्ची / आय प्रमाण",
        description: "Latest salary slip if employed, or farm income declaration if farmer",
        mandatory: false
      }
    ],
    formFields: [
      "applicantName", "fatherName", "occupation",
      "annualIncome", "sourceOfIncome", "address",
      "district", "tehsil"
    ],
    eligibilityCriteria: [
      "Resident of the district where applying",
      "Income declared must be verifiable",
      "Certificate valid for 1 year from issue date",
      "Patwari / Sarpanch verification required"
    ]
  },

  caste_certificate: {
    id: "caste_certificate",
    emoji: "🪪",
    name: "Caste Certificate",
    nameHindi: "जाति प्रमाण पत्र",
    formUrl: "https://edistrict.cgstate.gov.in/RJSS/citizenHome",
    requiredDocuments: [
      {
        id: "aadhaar",
        name: "Aadhaar Card",
        nameHindi: "आधार कार्ड",
        description: "Applicant's Aadhaar card",
        mandatory: true
      },
      {
        id: "father_caste_cert",
        name: "Father's Caste Certificate",
        nameHindi: "पिता का जाति प्रमाण पत्र",
        description: "Caste certificate of father or any family elder",
        mandatory: true
      },
      {
        id: "ration_card",
        name: "Ration Card",
        nameHindi: "राशन कार्ड",
        description: "Family ration card with caste details if available",
        mandatory: false
      },
      {
        id: "school_cert",
        name: "School Certificate with Caste Entry",
        nameHindi: "जाति प्रविष्टि वाला स्कूल प्रमाण पत्र",
        description: "School leaving or transfer certificate mentioning caste",
        mandatory: false
      },
      {
        id: "affidavit",
        name: "Affidavit / Self-Declaration",
        nameHindi: "शपथ पत्र / स्व-घोषणा",
        description: "Notarized affidavit declaring caste on stamp paper",
        mandatory: true
      }
    ],
    formFields: [
      "applicantName", "fatherName", "caste", "subCaste",
      "category", "address", "district", "tehsil", "village"
    ],
    eligibilityCriteria: [
      "Applicant must belong to SC/ST/OBC category as per state list",
      "Father's or family caste proof is essential",
      "Patwari / village-level verification required",
      "Certificate valid for lifetime unless challenged"
    ]
  },

  old_age_pension: {
    id: "old_age_pension",
    emoji: "👴",
    name: "Old Age Pension",
    nameHindi: "वृद्धावस्था पेंशन",
    formUrl: "https://sw.cg.gov.in/en/old-age-pension-scheme",
    requiredDocuments: [
      {
        id: "aadhaar",
        name: "Aadhaar Card",
        nameHindi: "आधार कार्ड",
        description: "Applicant's Aadhaar card",
        mandatory: true
      },
      {
        id: "age_proof",
        name: "Age Proof (Birth Certificate / School Certificate)",
        nameHindi: "आयु प्रमाण (जन्म प्रमाण पत्र / स्कूल प्रमाण पत्र)",
        description: "Any document proving age 60+ years",
        mandatory: true
      },
      {
        id: "bpl_card",
        name: "BPL Card / Ration Card",
        nameHindi: "बीपीएल कार्ड / राशन कार्ड",
        description: "Below Poverty Line card or ration card",
        mandatory: true
      },
      {
        id: "bank_passbook",
        name: "Bank Passbook (front page)",
        nameHindi: "बैंक पासबुक (पहला पन्ना)",
        description: "Passbook showing account number, IFSC, and name",
        mandatory: true
      },
      {
        id: "photo",
        name: "Passport Size Photo",
        nameHindi: "पासपोर्ट साइज फोटो",
        description: "Recent passport size photograph",
        mandatory: true
      }
    ],
    formFields: [
      "applicantName", "fatherOrSpouseName", "dateOfBirth", "age",
      "gender", "address", "bankAccountNumber", "ifscCode",
      "bankName", "branchName"
    ],
    eligibilityCriteria: [
      "Age must be 60 years or above",
      "Must be resident of Chhattisgarh",
      "Must belong to BPL category or have annual income below ₹2,00,000",
      "Should not be receiving any other government pension",
      "Pension amount: ₹350/month (60-79 yrs), ₹650/month (80+ yrs)"
    ]
  },

  widow_pension: {
    id: "widow_pension",
    emoji: "👩",
    name: "Widow Pension",
    nameHindi: "विधवा पेंशन",
    formUrl: "https://sw.cg.gov.in/en/indira-gandhi-national-widow-pension-scheme",
    requiredDocuments: [
      {
        id: "aadhaar",
        name: "Aadhaar Card",
        nameHindi: "आधार कार्ड",
        description: "Applicant's Aadhaar card",
        mandatory: true
      },
      {
        id: "husband_death_cert",
        name: "Husband's Death Certificate",
        nameHindi: "पति का मृत्यु प्रमाण पत्र",
        description: "Death certificate of the deceased husband",
        mandatory: true
      },
      {
        id: "age_proof",
        name: "Age Proof",
        nameHindi: "आयु प्रमाण",
        description: "Birth certificate, school certificate, or Aadhaar showing age",
        mandatory: true
      },
      {
        id: "bpl_card",
        name: "BPL Card / Ration Card",
        nameHindi: "बीपीएल कार्ड / राशन कार्ड",
        description: "Below Poverty Line card or family ration card",
        mandatory: true
      },
      {
        id: "bank_passbook",
        name: "Bank Passbook (front page)",
        nameHindi: "बैंक पासबुक (पहला पन्ना)",
        description: "Passbook showing account number, IFSC, and name",
        mandatory: true
      },
      {
        id: "photo",
        name: "Passport Size Photo",
        nameHindi: "पासपोर्ट साइज फोटो",
        description: "Recent passport size photograph",
        mandatory: false
      }
    ],
    formFields: [
      "applicantName", "husbandName", "dateOfBirth", "age",
      "dateOfHusbandDeath", "address", "bankAccountNumber",
      "ifscCode", "bankName"
    ],
    eligibilityCriteria: [
      "Applicant must be a widow (husband deceased)",
      "Must be resident of Chhattisgarh",
      "Age must be between 40-79 years (IGWPS)",
      "Must belong to BPL category or have annual income below ₹2,00,000",
      "Should not have remarried",
      "Pension amount: ₹350/month"
    ]
  },

  kisan_registration: {
    id: "kisan_registration",
    emoji: "🌾",
    name: "Kisan Registration",
    nameHindi: "किसान पंजीयन",
    formUrl: "https://kisan.cg.nic.in/",
    requiredDocuments: [
      {
        id: "aadhaar",
        name: "Aadhaar Card",
        nameHindi: "आधार कार्ड",
        description: "Farmer's Aadhaar card",
        mandatory: true
      },
      {
        id: "khasra",
        name: "Khasra / B1 (Land Record)",
        nameHindi: "खसरा / बी-1 (भूमि रिकॉर्ड)",
        description: "Land ownership record from Patwari",
        mandatory: true
      },
      {
        id: "bank_passbook",
        name: "Bank Passbook (front page)",
        nameHindi: "बैंक पासबुक (पहला पन्ना)",
        description: "Passbook showing account number, IFSC, and name",
        mandatory: true
      },
      {
        id: "photo",
        name: "Passport Size Photo",
        nameHindi: "पासपोर्ट साइज फोटो",
        description: "Recent passport size photograph",
        mandatory: true
      },
      {
        id: "ration_card",
        name: "Ration Card",
        nameHindi: "राशन कार्ड",
        description: "Family ration card",
        mandatory: false
      }
    ],
    formFields: [
      "farmerName", "fatherName", "aadhaarNumber", "mobileNumber",
      "village", "tehsil", "district", "khasraNumber",
      "landArea", "cropType", "bankAccountNumber", "ifscCode"
    ],
    eligibilityCriteria: [
      "Must own agricultural land in Chhattisgarh",
      "Land records must be updated and verified",
      "Bank account must be linked to Aadhaar (for DBT)",
      "Eligible for PM-KISAN (₹6000/year) and Rajiv Gandhi Kisan Nyay Yojana"
    ]
  },

  ration_card: {
    id: "ration_card",
    emoji: "🔧",
    name: "Ration Card",
    nameHindi: "राशन कार्ड",
    formUrl: "https://khadya.cg.nic.in/",
    requiredDocuments: [
      {
        id: "aadhaar",
        name: "Aadhaar Card (All Family Members)",
        nameHindi: "आधार कार्ड (सभी परिवार के सदस्यों का)",
        description: "Aadhaar cards of all family members to be included in ration card",
        mandatory: true
      },
      {
        id: "address_proof",
        name: "Address Proof",
        nameHindi: "पता प्रमाण",
        description: "Electricity bill, rent agreement, or property document",
        mandatory: true
      },
      {
        id: "income_cert",
        name: "Income Certificate",
        nameHindi: "आय प्रमाण पत्र",
        description: "Income certificate for category determination (APL/BPL/AAY)",
        mandatory: true
      },
      {
        id: "family_photo",
        name: "Family Photograph",
        nameHindi: "परिवार का फोटो",
        description: "Joint family photograph of all members",
        mandatory: true
      },
      {
        id: "surrender_cert",
        name: "Old Ration Card Surrender (if any)",
        nameHindi: "पुराना राशन कार्ड समर्पण (यदि कोई हो)",
        description: "Surrender certificate of previous ration card if transferring",
        mandatory: false
      }
    ],
    formFields: [
      "headOfFamily", "fatherOrSpouseName", "address",
      "familyMembersCount", "annualIncome", "category",
      "district", "ward", "gasConnection"
    ],
    eligibilityCriteria: [
      "Must be resident of Chhattisgarh",
      "Should not already have a ration card in the state",
      "Family annual income determines category: AAY/BPL/APL",
      "All family members' Aadhaar must be linked",
      "Application verified by local Food Inspector"
    ]
  },

  other: {
    id: "other",
    emoji: "📋",
    name: "Other Service",
    nameHindi: "अन्य सेवा",
    formUrl: "https://edistrict.cgstate.gov.in/",
    requiredDocuments: [
      {
        id: "aadhaar",
        name: "Aadhaar Card",
        nameHindi: "आधार कार्ड",
        description: "Applicant's Aadhaar card as primary ID",
        mandatory: true
      },
      {
        id: "address_proof",
        name: "Address Proof",
        nameHindi: "पता प्रमाण",
        description: "Any valid address proof document",
        mandatory: true
      },
      {
        id: "additional_doc",
        name: "Additional Supporting Document",
        nameHindi: "अतिरिक्त सहायक दस्तावेज़",
        description: "Any service-specific document as needed",
        mandatory: false
      }
    ],
    formFields: [
      "applicantName", "fatherName", "address",
      "district", "serviceType"
    ],
    eligibilityCriteria: [
      "Requirements vary by service",
      "Contact local CSC for specific eligibility",
      "General: Must be a resident of the state"
    ]
  }
};

// ─── Service list for rendering (ordered) ─────────────────
const SERVICE_LIST = [
  SERVICE_CONFIG.birth_certificate,
  SERVICE_CONFIG.death_certificate,
  SERVICE_CONFIG.domicile_certificate,
  SERVICE_CONFIG.income_certificate,
  SERVICE_CONFIG.caste_certificate,
  SERVICE_CONFIG.old_age_pension,
  SERVICE_CONFIG.widow_pension,
  SERVICE_CONFIG.kisan_registration,
  SERVICE_CONFIG.ration_card,
  SERVICE_CONFIG.other
];
