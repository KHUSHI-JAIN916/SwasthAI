/* ==========================================================================
   SwasthAI / SWASTHAI — Clinical State & Knowledge Rules
   Strictly for practitioner assistance and structured case-taking.
   ========================================================================== */

const ClinicalRules = {
    // Red-flag emergency triggers requiring immediate practitioner assessment
    RED_FLAGS: [
        {
            id: "RF_CHEST_PAIN",
            category: "Cardiovascular / Respiratory",
            title: "Severe Chest Pain / Pressure",
            keywords: ["chest pain", "seene mein dard", "chhati me dard", "chest pressure", "radiating to arm", "left arm pain", "jaw pain", "chhati mein jalan"],
            severity: "HIGH PRIORITY",
            guidance: "Potential urgent cardiac or thoracic symptom identified. Immediate practitioner assessment recommended.",
            ruleReference: "Clinical Protocol RF-01: Chest pain / radiating discomfort warrants urgent exclusion of acute coronary syndrome."
        },
        {
            id: "RF_BREATHING",
            category: "Respiratory",
            title: "Difficulty Breathing / Shortness of Breath",
            keywords: ["difficulty breathing", "saans lene me taklif", "saans phoolna", "breathlessness", "cannot breathe", "stridor", "wheezing severe", "gasping"],
            severity: "HIGH PRIORITY",
            guidance: "Potential urgent respiratory distress identified. Immediate practitioner assessment recommended.",
            ruleReference: "Clinical Protocol RF-02: Acute shortness of breath requires immediate clinical evaluation."
        },
        {
            id: "RF_NEURO",
            category: "Neurological",
            title: "Sudden Neurological Symptoms",
            keywords: ["slurred speech", "bolne me dikkat", "face droop", "facial weakness", "one side weak", "hath sunn", "loss of consciousness", "behosh", "fainting", "seizure", "chakkar severe"],
            severity: "HIGH PRIORITY",
            guidance: "Potential acute neurological symptoms identified. Urgent professional evaluation recommended.",
            ruleReference: "Clinical Protocol RF-03: Sudden unilateral motor/speech deficit warrants immediate exclusion of stroke or transient ischemic event."
        },
        {
            id: "RF_ACUTE_ABDOMEN",
            category: "Gastrointestinal",
            title: "Acute Severe Localized Abdominal Pain with Fever",
            keywords: ["severe stomach pain", "bahut tez pet dard", "intense abdominal pain", "unbearable pain right side", "rigid abdomen", "vomiting blood", "khoon ki ulti"],
            severity: "HIGH PRIORITY",
            guidance: "Potential acute abdominal condition identified. Urgent practitioner evaluation recommended.",
            ruleReference: "Clinical Protocol RF-04: Severe localized abdominal pain accompanied by systemic symptoms requires urgent clinical rule-out of acute abdomen."
        },
        {
            id: "RF_ANAPHYLAXIS",
            category: "Immunological / Allergic",
            title: "Severe Allergic Reaction / Anaphylaxis Symptoms",
            keywords: ["throat swelling", "gale me sujan", "swollen lips", "lip swelling", "hives all over", "difficulty swallowing", "rashes severe itching breathing"],
            severity: "HIGH PRIORITY",
            guidance: "Potential severe systemic allergic reaction identified. Immediate emergency attention recommended.",
            ruleReference: "Clinical Protocol RF-05: Angioedema with mucosal involvement warrants immediate clinical airway triage."
        },
        {
            id: "RF_SEVERE_BLEEDING",
            category: "Hematological / Vascular",
            title: "Severe or Uncontrolled Bleeding",
            keywords: ["heavy bleeding", "severe bleeding", "khoon behna", "rectal bleeding", "blood in urine", "continuous bleeding"],
            severity: "HIGH PRIORITY",
            guidance: "Active bleeding identified. Urgent practitioner assessment recommended.",
            ruleReference: "Clinical Protocol RF-06: Clinically significant bleeding warrants rapid diagnostic evaluation."
        }
    ],

    // Allergy classes and cross-reacting medication families
    ALLERGY_CLASSES: {
        "penicillin": {
            relatedMeds: ["amoxicillin", "ampicillin", "augmentin", "penicillin v", "piperacillin", "clavulanate", "moxikind"],
            warning: "Patient reports Penicillin allergy. Potential cross-reactivity with beta-lactam antibiotics. Practitioner verification required."
        },
        "cephalosporin": {
            relatedMeds: ["ceftriaxone", "cefixime", "cephalexin", "cefuroxime", "cefpodoxime"],
            warning: "Patient reports Cephalosporin allergy. Cross-reactivity with cephalosporin antibiotics possible."
        },
        "sulfa": {
            relatedMeds: ["cotrimoxazole", "bactrim", "septra", "sulfamethoxazole", "dapsone"],
            warning: "Patient reports Sulfonamide allergy. Avoid sulfonamide-containing formulations."
        },
        "nsaid": {
            relatedMeds: ["aspirin", "ibuprofen", "diclofenac", "naproxen", "combiflam", "brufen", "voveran", "ketorolac"],
            warning: "Patient reports NSAID / Aspirin sensitivity. Verify analgesic alternatives."
        }
    },

    // Known drug classes for duplicate detection
    DRUG_CLASSES: {
        "paracetamol": ["paracetamol", "crocin", "calpol", "dolo", "pacimol"],
        "antihypertensive_ccb": ["amlodipine", "stamlo", "amlopres", "cilnidipine"],
        "antihypertensive_arb": ["telmisartan", "telma", "losartan", "olmesartan"],
        "antidiabetic_metformin": ["metformin", "glycomet", "gluformin"],
        "nsaid": ["ibuprofen", "combiflam", "brufen", "diclofenac", "voveran", "naproxen", "aspirin", "disprin"],
        "antacid_ppi": ["pantoprazole", "pan 40", "omeprazole", "rabeprazole", "rabicer", "omez"]
    }
};

/**
 * Creates a clean default clinical case state object.
 */
function createEmptyCaseState(patientId = "", patientName = "") {
    return {
        id: "CASE-" + Date.now().toString(36).toUpperCase(),
        patientId: patientId,
        patientName: patientName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "IN PROGRESS", // DRAFT | IN PROGRESS | AI REVIEW | PRACTITIONER REVIEW | VERIFIED | COMPLETED
        language: "en-IN", // en-IN | hi-IN | hinglish
        
        // Structured clinical entities
        chiefComplaint: "",
        symptoms: [],
        onset: "",
        duration: "",
        location: "",
        severity: "",
        frequency: "",
        associatedSymptoms: [],
        aggravatingFactors: "",
        relievingFactors: "",
        
        // Histories
        medicalHistory: [],
        surgicalHistory: [],
        familyHistory: [],
        lifestyle: {
            sleep: "",
            activity: "",
            stress: "",
            diet: ""
        },
        previousTreatment: "",
        
        // AYUSH specific
        ayushAssessment: {
            prakriti: "", // Vata | Pitta | Kapha | Dual
            agni: "", // Mandagni | Tikshnagni | Vishamagni | Samagni
            koshtha: "",
            notes: ""
        },
        
        // Medications
        currentMedications: [],
        stoppedMedications: [],
        
        // Allergies
        allergies: [],
        allergyStatus: "unknown", // known | unknown | no_known_allergies
        
        // Safety & Intelligence evaluations
        redFlags: [],
        missingInformation: [],
        contradictions: [],
        fieldConfidence: {}, // e.g. { chiefComplaint: 95, duration: 92, ... }
        sourceTraceability: {}, // e.g. { chiefComplaint: { utterance, timestamp, confidence } }
        
        // Practitioner workspace state
        fieldVerification: {}, // e.g. { chiefComplaint: 'confirmed'|'edited'|'rejected' }
        practitionerNotes: "",
        clinicalImpression: "",
        followUp: null, // { date, reason, note, status, nextAction }
        
        // Caregiver & Consent
        consent: {
            patientConsent: true,
            caregiverConsent: false,
            caregiverName: "",
            caregiverRelation: "",
            caregiverPhone: "",
            timestamp: new Date().toISOString()
        },
        
        // Full conversation transcript
        transcript: [] // Array of { id, speaker: 'patient'|'ai'|'practitioner', text, originalLanguage, timestamp }
    };
}
