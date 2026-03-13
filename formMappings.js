/* ============================================================
   CSC Sahayak — Form Mappings
   CSS selectors for each service's government form fields
   ============================================================ */

const FORM_MAPPINGS = {
  // ─── Birth Certificate ─────────────────────────────────────
  birth_certificate: {
    domain: "edistrict.cgstate.gov.in",
    selectors: {
      childName:      'input[name="childName"], input[name="child_name"], #childName, #txtChildName',
      dateOfBirth:    'input[name="dob"], input[name="dateOfBirth"], #dob, #txtDOB, input[type="date"][name*="birth"]',
      gender:         'select[name="gender"], #gender, #ddlGender, input[name="gender"]',
      placeOfBirth:   'input[name="placeOfBirth"], #placeOfBirth, #txtPlaceOfBirth',
      fatherName:     'input[name="fatherName"], input[name="father_name"], #fatherName, #txtFatherName',
      motherName:     'input[name="motherName"], input[name="mother_name"], #motherName, #txtMotherName',
      fatherAadhaar:  'input[name="fatherAadhaar"], #fatherAadhaar, #txtFatherAadhaar',
      motherAadhaar:  'input[name="motherAadhaar"], #motherAadhaar, #txtMotherAadhaar',
      hospitalName:   'input[name="hospitalName"], #hospitalName, #txtHospitalName',
      address:        'textarea[name="address"], input[name="address"], #address, #txtAddress',
      district:       'select[name="district"], #district, #ddlDistrict',
      state:          'select[name="state"], #state, #ddlState'
    }
  },

  // ─── Death Certificate ─────────────────────────────────────
  death_certificate: {
    domain: "edistrict.cgstate.gov.in",
    selectors: {
      deceasedName:     'input[name="deceasedName"], #deceasedName, #txtDeceasedName',
      dateOfDeath:      'input[name="dateOfDeath"], #dateOfDeath, #txtDateOfDeath',
      placeOfDeath:     'input[name="placeOfDeath"], #placeOfDeath',
      causeOfDeath:     'input[name="causeOfDeath"], select[name="causeOfDeath"], #causeOfDeath',
      gender:           'select[name="gender"], #gender, #ddlGender',
      age:              'input[name="age"], #age, #txtAge',
      fatherOrSpouseName: 'input[name="fatherOrSpouseName"], #fatherOrSpouseName',
      address:          'textarea[name="address"], input[name="address"], #address',
      applicantName:    'input[name="applicantName"], #applicantName',
      applicantRelation:'select[name="applicantRelation"], #applicantRelation'
    }
  },

  // ─── Domicile Certificate ──────────────────────────────────
  domicile_certificate: {
    domain: "edistrict.cgstate.gov.in",
    selectors: {
      applicantName:    'input[name="applicantName"], #applicantName, #txtApplicantName',
      fatherName:       'input[name="fatherName"], #fatherName, #txtFatherName',
      dateOfBirth:      'input[name="dob"], #dob, #txtDOB',
      gender:           'select[name="gender"], #gender, #ddlGender',
      currentAddress:   'textarea[name="currentAddress"], #currentAddress',
      permanentAddress: 'textarea[name="permanentAddress"], #permanentAddress',
      residenceSinceYear: 'input[name="residenceSince"], #residenceSince',
      district:         'select[name="district"], #district, #ddlDistrict',
      tehsil:           'select[name="tehsil"], #tehsil, #ddlTehsil',
      village:          'input[name="village"], select[name="village"], #village'
    }
  },

  // ─── Income Certificate ────────────────────────────────────
  income_certificate: {
    domain: "edistrict.cgstate.gov.in",
    selectors: {
      applicantName:  'input[name="applicantName"], #applicantName, #txtApplicantName',
      fatherName:     'input[name="fatherName"], #fatherName, #txtFatherName, input[name="54"], #54',
      occupation:     'input[name="occupation"], select[name="occupation"], #occupation, select[name="126"], #126',
      annualIncome:   'input[name="annualIncome"], #annualIncome, #txtAnnualIncome, input[name="128"], #128',
      sourceOfIncome: 'input[name="sourceOfIncome"], #sourceOfIncome',
      address:        'textarea[name="address"], input[name="address"], #address',
      district:       'select[name="district"], #district, #ddlDistrict, select[name="196"], #196',
      tehsil:         'select[name="tehsil"], #tehsil, #ddlTehsil'
    }
  },

  // ─── CG Edistrict — User Registration (Additional Details) ──
  // URL: cgedistrict.cgstate.gov.in/userRegistrationAdditionalDetails.do
  // Field IDs are numeric — discovered by DOM inspection
  cgedistrict_user_registration: {
    domain: "cgedistrict.cgstate.gov.in",
    selectors: {
      dateOfBirth:     'input[name="7"], #7',
      annualIncome:    'input[name="128"], #128',
      casteCategory:   'select[name="98"], #98',
      caste:           'select[name="436"], #436',
      fatherName:      'input[name="54"], #54',
      motherName:      'input[name="2963"], #2963',
      pinCode:         'input[name="82"], #82',
      gender:          'select[name="8"], #8',
      nationality:     'select[name="476"], #476',
      voterId:         'input[name="230"], #230',
      district:        'select[name="196"], #196',
      bplNumber:       'input[name="900"], #900',
      education:       'select[name="800"], #800',
      occupation:      'select[name="126"], #126',
      maritalStatus:   'select[name="92"], #92'
    }
  },

  // ─── Caste Certificate ─────────────────────────────────────
  caste_certificate: {
    domain: "edistrict.cgstate.gov.in",
    selectors: {
      applicantName:  'input[name="applicantName"], #applicantName',
      fatherName:     'input[name="fatherName"], #fatherName',
      caste:          'input[name="caste"], select[name="caste"], #caste',
      subCaste:       'input[name="subCaste"], #subCaste',
      category:       'select[name="category"], #category, #ddlCategory',
      address:        'textarea[name="address"], input[name="address"], #address',
      district:       'select[name="district"], #district',
      tehsil:         'select[name="tehsil"], #tehsil',
      village:        'input[name="village"], #village'
    }
  },

  // ─── Old Age Pension ───────────────────────────────────────
  old_age_pension: {
    domain: "sw.cg.gov.in",
    selectors: {
      applicantName:      'input[name="applicantName"], #applicantName',
      fatherOrSpouseName: 'input[name="fatherOrSpouseName"], #fatherOrSpouseName',
      dateOfBirth:        'input[name="dob"], #dob',
      age:                'input[name="age"], #age',
      gender:             'select[name="gender"], #gender',
      address:            'textarea[name="address"], #address',
      bankAccountNumber:  'input[name="bankAccount"], #bankAccount',
      ifscCode:           'input[name="ifsc"], #ifsc',
      bankName:           'input[name="bankName"], #bankName',
      branchName:         'input[name="branchName"], #branchName'
    }
  },

  // ─── Widow Pension ─────────────────────────────────────────
  widow_pension: {
    domain: "sw.cg.gov.in",
    selectors: {
      applicantName:      'input[name="applicantName"], #applicantName',
      husbandName:        'input[name="husbandName"], #husbandName',
      dateOfBirth:        'input[name="dob"], #dob',
      age:                'input[name="age"], #age',
      dateOfHusbandDeath: 'input[name="husbandDeathDate"], #husbandDeathDate',
      address:            'textarea[name="address"], #address',
      bankAccountNumber:  'input[name="bankAccount"], #bankAccount',
      ifscCode:           'input[name="ifsc"], #ifsc',
      bankName:           'input[name="bankName"], #bankName'
    }
  },

  // ─── Kisan Registration ────────────────────────────────────
  kisan_registration: {
    domain: "kisan.cg.nic.in",
    selectors: {
      farmerName:         'input[name="farmerName"], #farmerName',
      fatherName:         'input[name="fatherName"], #fatherName',
      aadhaarNumber:      'input[name="aadhaar"], #aadhaar, #txtAadhaar',
      mobileNumber:       'input[name="mobile"], #mobile, #txtMobile',
      village:            'input[name="village"], select[name="village"], #village',
      tehsil:             'select[name="tehsil"], #tehsil',
      district:           'select[name="district"], #district',
      khasraNumber:       'input[name="khasra"], #khasra',
      landArea:           'input[name="landArea"], #landArea',
      cropType:           'select[name="cropType"], input[name="cropType"], #cropType',
      bankAccountNumber:  'input[name="bankAccount"], #bankAccount',
      ifscCode:           'input[name="ifsc"], #ifsc'
    }
  },

  // ─── Ration Card ───────────────────────────────────────────
  ration_card: {
    domain: "khadya.cg.nic.in",
    selectors: {
      headOfFamily:       'input[name="headOfFamily"], #headOfFamily',
      fatherOrSpouseName: 'input[name="fatherOrSpouseName"], #fatherOrSpouseName',
      address:            'textarea[name="address"], input[name="address"], #address',
      familyMembersCount: 'input[name="familyMembers"], #familyMembers',
      annualIncome:       'input[name="annualIncome"], #annualIncome',
      category:           'select[name="category"], #category',
      district:           'select[name="district"], #district',
      ward:               'input[name="ward"], select[name="ward"], #ward',
      gasConnection:      'select[name="gasConnection"], #gasConnection'
    }
  },

  // ─── Other ─────────────────────────────────────────────────
  other: {
    domain: "edistrict.cgstate.gov.in",
    selectors: {
      applicantName:  'input[name="applicantName"], #applicantName',
      fatherName:     'input[name="fatherName"], #fatherName',
      address:        'textarea[name="address"], input[name="address"], #address',
      district:       'select[name="district"], #district',
      serviceType:    'select[name="serviceType"], #serviceType'
    }
  }
};

/**
 * Get form mappings for a given service.
 * @param {string} serviceId
 * @returns {object|null}
 */
function getFormMapping(serviceId) {
  return FORM_MAPPINGS[serviceId] || null;
}

/**
 * Try multiple selectors to find a form element.
 * @param {string} selectorString — comma-separated selectors
 * @returns {Element|null}
 */
function findFormElement(selectorString) {
  const selectors = selectorString.split(",").map(s => s.trim());
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // Invalid selector, skip
    }
  }

  // Fallback: try to find by label text or placeholder
  return null;
}
