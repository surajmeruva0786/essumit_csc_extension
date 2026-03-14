// Service config aligned with backend serviceConfig.js
// Maps React service IDs to backend service types, required docs, and form fields.

export interface RequiredDocument {
  id: string;
  name: string;
  nameHindi: string;
  description?: string;
  mandatory: boolean;
}

export interface ServiceConfigEntry {
  backendId: string;
  formUrl: string;
  requiredDocuments: RequiredDocument[];
  formFields: string[];
}

const SERVICE_CONFIG: Record<string, ServiceConfigEntry> = {
  birth: {
    backendId: 'birth_certificate',
    formUrl: 'https://edistrict.cgstate.gov.in/CRMS/birthRegistrationAction',
    requiredDocuments: [
      { id: 'hospital_slip', name: 'Hospital Birth Slip / Discharge Summary', nameHindi: 'अस्पताल जन्म पर्ची / डिस्चार्ज सारांश', description: 'Original birth slip from hospital or birth report from ANM', mandatory: true },
      { id: 'parent_aadhaar', name: 'Aadhaar Card of Parent', nameHindi: 'माता या पिता का आधार कार्ड', mandatory: true },
      { id: 'marriage_cert', name: 'Parent Marriage Certificate', nameHindi: 'माता-पिता का विवाह प्रमाण पत्र', mandatory: false },
      { id: 'address_proof', name: 'Address Proof', nameHindi: 'पता प्रमाण', mandatory: true },
    ],
    formFields: ['childName', 'dateOfBirth', 'gender', 'placeOfBirth', 'fatherName', 'motherName', 'fatherAadhaar', 'motherAadhaar', 'hospitalName', 'address', 'district', 'state'],
  },
  death: {
    backendId: 'death_certificate',
    formUrl: 'https://edistrict.cgstate.gov.in/CRMS/deathRegistrationAction',
    requiredDocuments: [
      { id: 'death_report', name: 'Death Report from Hospital / Doctor', nameHindi: 'अस्पताल / डॉक्टर से मृत्यु रिपोर्ट', mandatory: true },
      { id: 'deceased_aadhaar', name: 'Aadhaar Card of Deceased', nameHindi: 'मृतक का आधार कार्ड', mandatory: true },
      { id: 'applicant_aadhaar', name: 'Aadhaar Card of Applicant', nameHindi: 'आवेदक का आधार कार्ड', mandatory: true },
      { id: 'cremation_cert', name: 'Cremation / Burial Certificate', nameHindi: 'दाह संस्कार प्रमाण पत्र', mandatory: false },
    ],
    formFields: ['deceasedName', 'dateOfDeath', 'placeOfDeath', 'causeOfDeath', 'gender', 'age', 'fatherOrSpouseName', 'address', 'applicantName', 'applicantRelation'],
  },
  domicile: {
    backendId: 'domicile_certificate',
    formUrl: 'https://edistrict.cgstate.gov.in/RJSS/citizenHome',
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', mandatory: true },
      { id: 'ration_card', name: 'Ration Card', nameHindi: 'राशन कार्ड', mandatory: true },
      { id: 'voter_id', name: 'Voter ID Card', nameHindi: 'मतदाता पहचान पत्र', mandatory: false },
      { id: 'electricity_bill', name: 'Electricity Bill / Property Tax Receipt', nameHindi: 'बिजली बिल / संपत्ति कर रसीद', mandatory: true },
      { id: 'school_cert', name: 'School Leaving Certificate', nameHindi: 'स्कूल छोड़ने का प्रमाण पत्र', mandatory: false },
    ],
    formFields: ['applicantName', 'fatherName', 'dateOfBirth', 'gender', 'currentAddress', 'permanentAddress', 'residenceSinceYear', 'district', 'tehsil', 'village'],
  },
  income: {
    backendId: 'income_certificate',
    formUrl: 'https://edistrict.cgstate.gov.in/RJSS/citizenHome',
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', mandatory: true },
      { id: 'ration_card', name: 'Ration Card', nameHindi: 'राशन कार्ड', mandatory: true },
      { id: 'self_declaration', name: 'Self Declaration / Affidavit', nameHindi: 'स्व-घोषणा / शपथ पत्र', mandatory: true },
      { id: 'salary_slip', name: 'Salary Slip / Income Proof', nameHindi: 'वेतन पर्ची / आय प्रमाण', mandatory: false },
    ],
    formFields: ['applicantName', 'fatherName', 'occupation', 'annualIncome', 'sourceOfIncome', 'address', 'district', 'tehsil'],
  },
  caste: {
    backendId: 'caste_certificate',
    formUrl: 'https://edistrict.cgstate.gov.in/RJSS/citizenHome',
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', mandatory: true },
      { id: 'father_caste_cert', name: "Father's Caste Certificate", nameHindi: 'पिता का जाति प्रमाण पत्र', mandatory: true },
      { id: 'ration_card', name: 'Ration Card', nameHindi: 'राशन कार्ड', mandatory: false },
      { id: 'school_cert', name: 'School Certificate with Caste Entry', nameHindi: 'जाति प्रविष्टि वाला स्कूल प्रमाण पत्र', mandatory: false },
      { id: 'affidavit', name: 'Affidavit / Self-Declaration', nameHindi: 'शपथ पत्र / स्व-घोषणा', mandatory: true },
    ],
    formFields: ['applicantName', 'fatherName', 'caste', 'subCaste', 'category', 'address', 'district', 'tehsil', 'village'],
  },
  'pension-old': {
    backendId: 'old_age_pension',
    formUrl: 'https://sw.cg.gov.in/en/old-age-pension-scheme',
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', mandatory: true },
      { id: 'age_proof', name: 'Age Proof (Birth Certificate / School Certificate)', nameHindi: 'आयु प्रमाण', mandatory: true },
      { id: 'bpl_card', name: 'BPL Card / Ration Card', nameHindi: 'बीपीएल कार्ड / राशन कार्ड', mandatory: true },
      { id: 'bank_passbook', name: 'Bank Passbook (front page)', nameHindi: 'बैंक पासबुक', mandatory: true },
      { id: 'photo', name: 'Passport Size Photo', nameHindi: 'पासपोर्ट साइज फोटो', mandatory: true },
    ],
    formFields: ['applicantName', 'fatherOrSpouseName', 'dateOfBirth', 'age', 'gender', 'address', 'bankAccountNumber', 'ifscCode', 'bankName', 'branchName'],
  },
  'pension-widow': {
    backendId: 'widow_pension',
    formUrl: 'https://sw.cg.gov.in/en/indira-gandhi-national-widow-pension-scheme',
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', mandatory: true },
      { id: 'husband_death_cert', name: "Husband's Death Certificate", nameHindi: 'पति का मृत्यु प्रमाण पत्र', mandatory: true },
      { id: 'age_proof', name: 'Age Proof', nameHindi: 'आयु प्रमाण', mandatory: true },
      { id: 'bpl_card', name: 'BPL Card / Ration Card', nameHindi: 'बीपीएल कार्ड / राशन कार्ड', mandatory: true },
      { id: 'bank_passbook', name: 'Bank Passbook (front page)', nameHindi: 'बैंक पासबुक', mandatory: true },
      { id: 'photo', name: 'Passport Size Photo', nameHindi: 'पासपोर्ट साइज फोटो', mandatory: false },
    ],
    formFields: ['applicantName', 'husbandName', 'dateOfBirth', 'age', 'dateOfHusbandDeath', 'address', 'bankAccountNumber', 'ifscCode', 'bankName'],
  },
  kisan: {
    backendId: 'kisan_registration',
    formUrl: 'https://kisan.cg.nic.in/',
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', mandatory: true },
      { id: 'khasra', name: 'Khasra / B1 (Land Record)', nameHindi: 'खसरा / बी-1 भूमि रिकॉर्ड', mandatory: true },
      { id: 'bank_passbook', name: 'Bank Passbook (front page)', nameHindi: 'बैंक पासबुक', mandatory: true },
      { id: 'photo', name: 'Passport Size Photo', nameHindi: 'पासपोर्ट साइज फोटो', mandatory: true },
      { id: 'ration_card', name: 'Ration Card', nameHindi: 'राशन कार्ड', mandatory: false },
    ],
    formFields: ['farmerName', 'fatherName', 'aadhaarNumber', 'mobileNumber', 'village', 'tehsil', 'district', 'khasraNumber', 'landArea', 'cropType', 'bankAccountNumber', 'ifscCode'],
  },
  ration: {
    backendId: 'ration_card',
    formUrl: 'https://khadya.cg.nic.in/',
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card (All Family Members)', nameHindi: 'आधार कार्ड (सभी परिवार सदस्य)', mandatory: true },
      { id: 'address_proof', name: 'Address Proof', nameHindi: 'पता प्रमाण', mandatory: true },
      { id: 'income_cert', name: 'Income Certificate', nameHindi: 'आय प्रमाण पत्र', mandatory: true },
      { id: 'family_photo', name: 'Family Photograph', nameHindi: 'परिवार का फोटो', mandatory: true },
      { id: 'surrender_cert', name: 'Old Ration Card Surrender (if any)', nameHindi: 'पुराना राशन कार्ड समर्पण', mandatory: false },
    ],
    formFields: ['headOfFamily', 'fatherOrSpouseName', 'address', 'familyMembersCount', 'annualIncome', 'category', 'district', 'ward', 'gasConnection'],
  },
  other: {
    backendId: 'other',
    formUrl: 'https://edistrict.cgstate.gov.in/',
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', mandatory: true },
      { id: 'address_proof', name: 'Address Proof', nameHindi: 'पता प्रमाण', mandatory: true },
      { id: 'additional_doc', name: 'Additional Supporting Document', nameHindi: 'अतिरिक्त सहायक दस्तावेज़', mandatory: false },
    ],
    formFields: ['applicantName', 'fatherName', 'address', 'district', 'serviceType'],
  },
};

export function getServiceConfig(serviceId: string): ServiceConfigEntry | null {
  return SERVICE_CONFIG[serviceId] ?? null;
}

export function getBackendServiceId(serviceId: string): string | null {
  return SERVICE_CONFIG[serviceId]?.backendId ?? null;
}
