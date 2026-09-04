/* ==========================================================================
   SwasthAI / SWASTHAI — Unified Clinical Storage Engine
   LocalStorage persistence with schema migrations, audit trail & seed data.
   ========================================================================== */

const ClinicalStorage = (() => {
    const KEYS = {
        PATIENTS: "ayushPatients",
        CASES: "ayushCases",
        TIMELINE: "ayushTimeline",
        AUDIT_LOGS: "ayushAuditLogs",
        FOLLOWUPS: "ayushFollowups",
        OFFLINE_DRAFTS: "ayushOfflineDrafts",
        USERS: "ayushUsers",
        CURRENT_USER: "ayushCurrentUser",
        ACTIVE_ROLE: "ayushActiveRole" // 'practitioner' | 'patient' | 'admin'
    };

    // Realistic seed patients
    const DEFAULT_PATIENTS = [
        {
            id: "AYU-2026-DEMO",
            fullName: "Rajesh Patel",
            age: 58,
            gender: "Male",
            bloodGroup: "B+",
            phone: "+91 98765 43210",
            email: "rajesh.patel@email.com",
            address: "42 MG Road, Ahmedabad, Gujarat",
            occupation: "Senior Civil Engineer",
            emergencyName: "Meena Patel (Spouse)",
            emergencyPhone: "+91 98765 43211",
            allergies: "Penicillin (Severe hives, angioedema)",
            allergyStatus: "known",
            conditions: "Hypertension (diagnosed 2021)",
            currentMedications: "Amlodipine 5mg OD",
            prakriti: "Pitta-Vata",
            status: "active",
            registeredDate: "2026-08-15"
        },
        {
            id: "AYU-2026-001",
            fullName: "Rahul Kumar",
            age: 32,
            gender: "Male",
            bloodGroup: "O+",
            phone: "+91 98234 11223",
            email: "rahul.kumar@email.com",
            address: "Sector 14, Noida, UP",
            occupation: "Software Architect",
            emergencyName: "Sunita Kumar (Mother)",
            emergencyPhone: "+91 98234 11224",
            allergies: "No Known Drug Allergies (NKDA)",
            allergyStatus: "no_known_allergies",
            conditions: "Chronic Tension Headache, Work Stress",
            currentMedications: "None regular",
            prakriti: "Vata",
            status: "active",
            registeredDate: "2026-08-20"
        },
        {
            id: "AYU-2026-002",
            fullName: "Priya Sharma",
            age: 28,
            gender: "Female",
            bloodGroup: "A+",
            phone: "+91 97112 33445",
            email: "priya.sharma@email.com",
            address: "Model Town, Delhi",
            occupation: "Teacher",
            emergencyName: "Anil Sharma (Father)",
            emergencyPhone: "+91 97112 33446",
            allergies: "Sulfa drugs (Skin rash)",
            allergyStatus: "known",
            conditions: "Digestive Discomfort, Acidity",
            currentMedications: "Antacid syrup SOS",
            prakriti: "Pitta",
            status: "followup",
            registeredDate: "2026-08-25"
        },
        {
            id: "AYU-2026-003",
            fullName: "Amit Singh",
            age: 45,
            gender: "Male",
            bloodGroup: "AB+",
            phone: "+91 96541 77889",
            email: "amit.singh@email.com",
            address: "Civil Lines, Jaipur",
            occupation: "Business Owner",
            emergencyName: "Kavita Singh (Wife)",
            emergencyPhone: "+91 96541 77890",
            allergies: "Unknown",
            allergyStatus: "unknown",
            conditions: "Bilateral Knee Joint Pain",
            currentMedications: "Ayurvedic oil application",
            prakriti: "Kapha",
            status: "new",
            registeredDate: "2026-08-30"
        },
        {
            id: "AYU-2026-004",
            fullName: "Neha Verma",
            age: 39,
            gender: "Female",
            bloodGroup: "B-",
            phone: "+91 95432 88990",
            email: "neha.verma@email.com",
            address: "Koramangala, Bengaluru",
            occupation: "Content Creator",
            emergencyName: "Rohan Verma (Brother)",
            emergencyPhone: "+91 95432 88991",
            allergies: "No Known Allergies",
            allergyStatus: "no_known_allergies",
            conditions: "Persistent Fatigue, Insomnia",
            currentMedications: "Ashwagandha churna 3g at bedtime",
            prakriti: "Vata",
            status: "active",
            registeredDate: "2026-08-29"
        },
        {
            id: "AYU-2026-005",
            fullName: "Vikram Singh",
            age: 52,
            gender: "Male",
            bloodGroup: "O-",
            phone: "+91 94123 66778",
            email: "vikram.singh@email.com",
            address: "Bandra West, Mumbai",
            occupation: "Bank Manager",
            emergencyName: "Sarita Singh (Spouse)",
            emergencyPhone: "+91 94123 66779",
            allergies: "Aspirin (Gastric upset / bronchospasm)",
            allergyStatus: "known",
            conditions: "Type 2 Diabetes Mellitus, Mild Osteoarthritis",
            currentMedications: "Metformin 500mg BD",
            prakriti: "Kapha-Pitta",
            status: "followup",
            registeredDate: "2026-08-28"
        }
    ];

    // Seed realistic demo cases
    const DEFAULT_CASES = [
        {
            id: "CASE-DEMO-2026",
            patientId: "AYU-2026-DEMO",
            patientName: "Rajesh Patel",
            createdAt: "2026-09-02T16:30:00.000Z",
            updatedAt: "2026-09-03T09:15:00.000Z",
            status: "PRACTITIONER REVIEW",
            language: "hinglish",
            chiefComplaint: "Acute Right Upper Quadrant Abdominal Pain with Moderate Fever",
            symptoms: ["Severe abdominal pain", "Fever", "Nausea", "Appetite loss"],
            onset: "2 days ago",
            duration: "2 days",
            location: "Right Upper Abdomen (Right Hypochondrium)",
            severity: "Severe (8/10)",
            frequency: "Continuous with intermittent sharp spasms",
            associatedSymptoms: ["Low grade fever (99.8°F)", "Mild nausea after eating"],
            aggravatingFactors: "Intake of oily / heavy meals",
            relievingFactors: "Lying still on back",
            medicalHistory: ["Essential Hypertension for 5 years"],
            surgicalHistory: ["Appendectomy (2012)"],
            familyHistory: ["Father had Gallbladder disease", "Mother had Hypertension"],
            lifestyle: {
                sleep: "5–6 hours (disturbed by pain)",
                activity: "Low",
                stress: "High",
                diet: "Vegetarian with frequent fried foods"
            },
            previousTreatment: "Took an over-the-counter painkiller yesterday with minimal relief",
            ayushAssessment: {
                prakriti: "Pitta-Vata",
                agni: "Vishamagni",
                koshtha: "Madhyama",
                notes: "Pitta aggravation leading to Shoola in Yakrit/Pittashaya sthana. Jwara symptoms noted."
            },
            currentMedications: [
                {
                    name: "Amlodipine",
                    dose: "5mg",
                    frequency: "Once Daily (Morning)",
                    route: "Oral",
                    startDate: "2021-04-10",
                    endDate: "",
                    reason: "Hypertension",
                    prescribedBy: "Dr. K. Mehta (Cardiologist)",
                    status: "current"
                },
                {
                    name: "Painkiller (unspecified NSAID)",
                    dose: "Unknown",
                    frequency: "1 tablet yesterday",
                    route: "Oral",
                    startDate: "2026-09-02",
                    endDate: "",
                    reason: "Severe abdominal pain",
                    prescribedBy: "Self-medication / Over the counter",
                    status: "current"
                }
            ],
            stoppedMedications: [],
            allergies: [
                {
                    allergen: "Penicillin",
                    reaction: "Severe hives and facial angioedema",
                    severity: "High",
                    confirmedStatus: "confirmed"
                }
            ],
            allergyStatus: "known",
            redFlags: [
                {
                    id: "RF_ACUTE_ABDOMEN",
                    category: "Gastrointestinal",
                    title: "Acute Severe Localized Abdominal Pain with Fever",
                    severity: "HIGH PRIORITY",
                    triggerStatement: "Mujhe 2 din se pet ke right side mein bahut tez dard ho raha hai aur bukhar bhi hai.",
                    timestamp: "2026-09-02T16:32:10.000Z",
                    guidance: "Potential acute abdominal condition identified. Urgent practitioner evaluation recommended."
                }
            ],
            missingInformation: [
                {
                    id: "MISSING_MED_DOSE",
                    category: "Medication",
                    label: "Unspecified OTC painkiller exact name and dosage",
                    status: "unconfirmed"
                },
                {
                    id: "MISSING_FEVER_PATTERN",
                    category: "Symptoms",
                    label: "Fever temperature trend and presence of chills/rigors",
                    status: "unconfirmed"
                }
            ],
            contradictions: [
                {
                    id: "CONTRA_DURATION",
                    field: "Symptom Duration",
                    earlierStatement: "Pain started 2 days ago after dinner (16:31 PM)",
                    laterStatement: "I have been feeling slight heaviness in stomach for 2 weeks (16:35 PM)",
                    recommendation: "Clarify with patient if 2 weeks refers to mild dyspepsia while 2 days was acute onset of sharp pain."
                }
            ],
            fieldConfidence: {
                chiefComplaint: 96,
                symptoms: 94,
                duration: 92,
                location: 95,
                severity: 88,
                medication_amlodipine: 92,
                medication_otc: 42,
                allergy_penicillin: 98,
                prakriti: 85
            },
            sourceTraceability: {
                chiefComplaint: {
                    utterance: "Mujhe 2 din se pet ke right side me tez dard hai aur thoda bukhar bhi hai.",
                    speaker: "Patient",
                    timestamp: "16:31:05",
                    language: "Hinglish",
                    confidence: 96
                },
                duration: {
                    utterance: "Do din pehle shuru hua tha khana khane ke baad.",
                    speaker: "Patient",
                    timestamp: "16:32:12",
                    language: "Hinglish",
                    confidence: 92
                },
                location: {
                    utterance: "Pet ke upar right side me jahan ribs khatam hoti hain.",
                    speaker: "Patient",
                    timestamp: "16:33:04",
                    language: "Hinglish",
                    confidence: 95
                },
                allergy: {
                    utterance: "Mujhe Penicillin injection se bahut allergy hai, pura shareer phool gaya tha ek baar.",
                    speaker: "Patient",
                    timestamp: "16:36:18",
                    language: "Hinglish",
                    confidence: 98
                }
            },
            fieldVerification: {
                chiefComplaint: "confirmed",
                duration: "confirmed",
                location: "confirmed",
                allergy: "confirmed"
            },
            practitionerNotes: "Initial clinical evaluation indicates acute right hypochondrial tenderness (Murphy's sign positive). Ultrasonography of hepatobiliary tree advised to rule out acute calculous cholecystitis. Penicillin allergy noted on record. Avoid amoxicillin/clavulanic acid.",
            clinicalImpression: "Suspected Acute Cholecystitis / Pittashaya Shoola. Requires urgent diagnostic USG and routine LFT.",
            consent: {
                patientConsent: true,
                caregiverConsent: true,
                caregiverName: "Meena Patel",
                caregiverRelation: "Spouse",
                caregiverPhone: "+91 98765 43211",
                timestamp: "2026-09-02T16:30:00.000Z"
            },
            transcript: [
                {
                    id: "t1",
                    speaker: "ai",
                    text: "Namaste Rajesh ji. Main SwasthAI assistant hoon. Aapki kya taklif hai? Kripya batayein.",
                    originalLanguage: "Hinglish",
                    timestamp: "16:30:15"
                },
                {
                    id: "t2",
                    speaker: "patient",
                    text: "Mujhe 2 din se pet ke right side me tez dard hai aur thoda bukhar bhi hai.",
                    originalLanguage: "Hinglish",
                    timestamp: "16:31:05"
                },
                {
                    id: "t3",
                    speaker: "ai",
                    text: "Dard kab shuru hua aur kya yeh achanak hua ya dheere dheere badha?",
                    originalLanguage: "Hinglish",
                    timestamp: "16:31:30"
                },
                {
                    id: "t4",
                    speaker: "patient",
                    text: "Do din pehle shuru hua tha khana khane ke baad. Bahut tezi se badha raat ko.",
                    originalLanguage: "Hinglish",
                    timestamp: "16:32:12"
                },
                {
                    id: "t5",
                    speaker: "ai",
                    text: "Dard theek kis jagah mehsoos ho raha hai — upar, neeche, ya peeth ki taraf jata hai?",
                    originalLanguage: "Hinglish",
                    timestamp: "16:32:40"
                },
                {
                    id: "t6",
                    speaker: "patient",
                    text: "Pet ke upar right side me jahan ribs khatam hoti hain. Kabhi kabhi right kandhe ki taraf bhi jata hai.",
                    originalLanguage: "Hinglish",
                    timestamp: "16:33:04"
                },
                {
                    id: "t7",
                    speaker: "ai",
                    text: "Kya aapko ulti, matli ya peeli peshab jaisi koi aur taklif bhi hai?",
                    originalLanguage: "Hinglish",
                    timestamp: "16:33:35"
                },
                {
                    id: "t8",
                    speaker: "patient",
                    text: "Haan, thoda nausea rehta hai aur bhook bilkul nahi lag rahi.",
                    originalLanguage: "Hinglish",
                    timestamp: "16:34:02"
                },
                {
                    id: "t9",
                    speaker: "ai",
                    text: "Aap pehle se kaunsi dawai le rahe hain aur kya koi dawai se allergy hai?",
                    originalLanguage: "Hinglish",
                    timestamp: "16:34:30"
                },
                {
                    id: "t10",
                    speaker: "patient",
                    text: "Main BP ke liye Amlodipine 5mg roz subah leta hoon. Aur mujhe Penicillin injection se bahut allergy hai, pura shareer phool gaya tha ek baar.",
                    originalLanguage: "Hinglish",
                    timestamp: "16:35:10"
                },
                {
                    id: "t11",
                    speaker: "ai",
                    text: "Dard ke liye kya aapne koi dawai li hai abhi?",
                    originalLanguage: "Hinglish",
                    timestamp: "16:35:35"
                },
                {
                    id: "t12",
                    speaker: "patient",
                    text: "Kal chemist se ek dard ki goli lee thi, par aaram nahi mila.",
                    originalLanguage: "Hinglish",
                    timestamp: "16:36:00"
                },
                {
                    id: "t13",
                    speaker: "ai",
                    text: "Shukriya Rajesh ji. Sari jankari darj kar li gayi hai. Case information is sufficient for practitioner review.",
                    originalLanguage: "Hinglish",
                    timestamp: "16:36:30"
                }
            ]
        },
        {
            id: "CASE-2026-001",
            patientId: "AYU-2026-001",
            patientName: "Rahul Kumar",
            createdAt: "2026-08-31T10:15:00.000Z",
            updatedAt: "2026-08-31T11:00:00.000Z",
            status: "VERIFIED",
            language: "en-IN",
            chiefComplaint: "Chronic Recurrent Tension-Type Headache",
            symptoms: ["Bilateral band-like headache", "Neck muscle tightness", "Eye strain"],
            onset: "3 months ago",
            duration: "3 months (intermittent 3-4 days/week)",
            location: "Frontal and occipital head region",
            severity: "Moderate (5/10)",
            frequency: "3 to 4 episodes per week, typically afternoon",
            associatedSymptoms: ["Fatigue", "Light sensitivity during peak pain"],
            aggravatingFactors: "Prolonged screen time (>9 hours/day), lack of sleep",
            relievingFactors: "Dark quiet room, warm shower",
            medicalHistory: ["None significant"],
            surgicalHistory: [],
            familyHistory: ["Mother has migraine"],
            lifestyle: {
                sleep: "5–6 hours",
                activity: "Sedentary",
                stress: "High",
                diet: "Irregular meal timings, high caffeine"
            },
            previousTreatment: "Intermittent paracetamol with temporary relief",
            ayushAssessment: {
                prakriti: "Vata",
                agni: "Vishamagni",
                koshtha: "Krura",
                notes: "Vata-pradhana Shirashoola. Nasya and Shirodhara recommended for calming Vata."
            },
            currentMedications: [],
            stoppedMedications: [],
            allergies: [],
            allergyStatus: "no_known_allergies",
            redFlags: [],
            missingInformation: [],
            contradictions: [],
            fieldConfidence: {
                chiefComplaint: 95,
                symptoms: 92,
                duration: 94,
                prakriti: 90
            },
            sourceTraceability: {},
            fieldVerification: {
                chiefComplaint: "confirmed",
                symptoms: "confirmed",
                duration: "confirmed"
            },
            practitionerNotes: "Stress-induced Shirashoola. Advised Brahmi Vati 1 tab BD, Triphala churn at bedtime, and digital eye breaks every 45 mins. Follow-up in 14 days.",
            clinicalImpression: "Vataja Shirashoola secondary to screen fatigue and irregular circadian rhythm.",
            followUp: {
                date: "2026-09-14",
                reason: "Evaluate response to Ayurvedic regimen and sleep modification",
                note: "Check headache diary and daily screen time compliance",
                status: "scheduled",
                nextAction: "Assess headache frequency reduction"
            },
            transcript: []
        },
        {
            id: "CASE-2026-002",
            patientId: "AYU-2026-002",
            patientName: "Priya Sharma",
            createdAt: "2026-09-01T14:20:00.000Z",
            updatedAt: "2026-09-01T15:10:00.000Z",
            status: "AI REVIEW",
            language: "en-IN",
            chiefComplaint: "Persistent Post-Prandial Acidity and Epigastric Burning",
            symptoms: ["Heartburn", "Sour belching (Amlodgara)", "Bloating"],
            onset: "3 weeks ago",
            duration: "3 weeks",
            location: "Epigastrium radiating retrosternally",
            severity: "Moderate (6/10)",
            frequency: "Daily, within 45 mins of meals",
            associatedSymptoms: ["Nausea on empty stomach"],
            aggravatingFactors: "Spicy foods, tea on empty stomach",
            relievingFactors: "Cold milk, drinking water",
            medicalHistory: ["Mild gastritis diagnosed 2024"],
            surgicalHistory: [],
            familyHistory: ["Both parents have GERD / hyperacidity"],
            lifestyle: {
                sleep: "6–7 hours",
                activity: "Moderate",
                stress: "Moderate",
                diet: "Vegetarian with frequent sour/fermented foods"
            },
            previousTreatment: "OTC antacid suspension",
            ayushAssessment: {
                prakriti: "Pitta",
                agni: "Tikshnagni",
                koshtha: "Mrudu",
                notes: "Amlapitta with Pitta vriddhi in Amashaya. Pitta shamaka line of treatment required."
            },
            currentMedications: [
                {
                    name: "Antacid syrup",
                    dose: "10ml SOS",
                    frequency: "As needed",
                    route: "Oral",
                    startDate: "2026-08-15",
                    endDate: "",
                    reason: "Acidity relief",
                    prescribedBy: "Self",
                    status: "current"
                }
            ],
            stoppedMedications: [],
            allergies: [
                {
                    allergen: "Sulfa drugs",
                    reaction: "Maculopapular rash",
                    severity: "Moderate",
                    confirmedStatus: "confirmed"
                }
            ],
            allergyStatus: "known",
            redFlags: [],
            missingInformation: [
                {
                    id: "MISSING_MEAL_GAP",
                    category: "Lifestyle",
                    label: "Gap between dinner and bedtime not specified",
                    status: "unconfirmed"
                }
            ],
            contradictions: [],
            fieldConfidence: {
                chiefComplaint: 94,
                symptoms: 91,
                medication: 78
            },
            sourceTraceability: {},
            fieldVerification: {},
            practitionerNotes: "",
            clinicalImpression: "Amlapitta (Urdhwaga). Requires dietary regulation and Avipattikar churna.",
            transcript: []
        }
    ];

    // Seed realistic timeline events
    const DEFAULT_TIMELINE = [
        {
            id: "tl-1",
            patientId: "AYU-2026-DEMO",
            date: "2021-04-10",
            category: "Diagnosis",
            title: "Diagnosed with Essential Hypertension",
            details: "BP 154/96 mmHg documented during executive health check. Started on Amlodipine 5mg OD.",
            icon: "fa-heart-pulse",
            tag: "Chronic Condition"
        },
        {
            id: "tl-2",
            patientId: "AYU-2026-DEMO",
            date: "2023-11-14",
            category: "Allergy",
            title: "Severe Penicillin Allergy Recorded",
            details: "Developed acute angioedema and extensive urticaria after IM Benzathine Penicillin for severe pharyngitis. Treated in emergency room.",
            icon: "fa-triangle-exclamation",
            tag: "Critical Allergy"
        },
        {
            id: "tl-3",
            patientId: "AYU-2026-DEMO",
            date: "2026-08-15",
            category: "Registration",
            title: "Registered at SWASTHAI Clinic",
            details: "Comprehensive digital profile created with verified caregiver consent for Meena Patel.",
            icon: "fa-id-card",
            tag: "Clinical Onboarding"
        },
        {
            id: "tl-4",
            patientId: "AYU-2026-DEMO",
            date: "2026-09-02",
            category: "New Case",
            title: "Acute Abdominal Pain Case Logged",
            details: "AI-assisted case-taking conducted. Right upper quadrant severe pain with fever. Red-flag alert generated.",
            icon: "fa-file-medical",
            tag: "Urgent Case"
        },
        {
            id: "tl-5",
            patientId: "AYU-2026-DEMO",
            date: "2026-09-03",
            category: "Investigation",
            title: "Laboratory Report Uploaded (LFT)",
            details: "Elevated total bilirubin 2.1 mg/dL, SGPT 68 U/L. Pending practitioner review.",
            icon: "fa-flask",
            tag: "Investigation"
        }
    ];

    // Seed audit logs
    const DEFAULT_AUDIT_LOGS = [
        {
            id: "log-1",
            timestamp: "2026-09-02T16:30:00.000Z",
            role: "Patient",
            userName: "Rajesh Patel",
            action: "Started AI Adaptive Case-Taking Interview",
            fieldChanged: "Interview Session",
            caseId: "CASE-DEMO-2026",
            details: "Selected Hinglish conversation mode."
        },
        {
            id: "log-2",
            timestamp: "2026-09-02T16:32:15.000Z",
            role: "System (AI Engine)",
            userName: "SwasthAI Clinical Engine",
            action: "Triggered High-Priority Red Flag",
            fieldChanged: "Red Flag (RF_ACUTE_ABDOMEN)",
            caseId: "CASE-DEMO-2026",
            details: "Triggered by utterance: 'Mujhe 2 din se pet ke right side mein bahut tez dard ho raha hai aur bukhar bhi hai.'"
        },
        {
            id: "log-3",
            timestamp: "2026-09-02T16:36:30.000Z",
            role: "System (AI Engine)",
            userName: "SwasthAI Clinical Engine",
            action: "Generated Case Extraction & Summary",
            fieldChanged: "Case Status",
            caseId: "CASE-DEMO-2026",
            details: "Case information marked sufficient. Case transitioned to PRACTITIONER REVIEW."
        },
        {
            id: "log-4",
            timestamp: "2026-09-03T09:10:00.000Z",
            role: "Practitioner",
            userName: "Dr. Sharma",
            action: "Verified Penicillin Allergy",
            fieldChanged: "Allergies -> Penicillin",
            caseId: "CASE-DEMO-2026",
            details: "Marked Penicillin allergy as confirmed. Beta-lactam antibiotic block active."
        }
    ];

    // Seed followups
    const DEFAULT_FOLLOWUPS = [
        {
            id: "fup-1",
            caseId: "CASE-DEMO-2026",
            patientId: "AYU-2026-DEMO",
            patientName: "Rajesh Patel",
            date: "2026-09-05",
            reason: "Follow-up evaluation of Acute Right Abdominal Pain post-USG",
            practitionerNote: "Review emergency ultrasound results and check liver function values.",
            status: "urgent",
            nextAction: "Evaluate USG Hepatobiliary report"
        },
        {
            id: "fup-2",
            caseId: "CASE-2026-001",
            patientId: "AYU-2026-001",
            patientName: "Rahul Kumar",
            date: "2026-09-14",
            reason: "Chronic Headache regimen review",
            practitionerNote: "Assess Brahmi Vati efficacy and sleep improvements.",
            status: "routine",
            nextAction: "Check headache frequency reduction"
        }
    ];

    /* Initialization */
    function initialize() {
        if (!localStorage.getItem(KEYS.PATIENTS)) {
            localStorage.setItem(KEYS.PATIENTS, JSON.stringify(DEFAULT_PATIENTS));
        }
        if (!localStorage.getItem(KEYS.CASES)) {
            localStorage.setItem(KEYS.CASES, JSON.stringify(DEFAULT_CASES));
        }
        if (!localStorage.getItem(KEYS.TIMELINE)) {
            localStorage.setItem(KEYS.TIMELINE, JSON.stringify(DEFAULT_TIMELINE));
        }
        if (!localStorage.getItem(KEYS.AUDIT_LOGS)) {
            localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(DEFAULT_AUDIT_LOGS));
        }
        if (!localStorage.getItem(KEYS.FOLLOWUPS)) {
            localStorage.setItem(KEYS.FOLLOWUPS, JSON.stringify(DEFAULT_FOLLOWUPS));
        }
        if (!localStorage.getItem(KEYS.ACTIVE_ROLE)) {
            localStorage.setItem(KEYS.ACTIVE_ROLE, "practitioner");
        }
    }

    // Auto-initialize on load
    initialize();

    /* =========================================================================
       PATIENT METHODS
       ========================================================================= */
    function getPatients() {
        try {
            return JSON.parse(localStorage.getItem(KEYS.PATIENTS)) || [];
        } catch (e) {
            console.error("Error reading patients", e);
            return DEFAULT_PATIENTS;
        }
    }

    function savePatients(patients) {
        localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));
    }

    function getPatientById(id) {
        return getPatients().find(p => p.id === id);
    }

    function addPatient(patient) {
        const patients = getPatients();
        if (!patient.id) {
            const nextNum = (patients.length + 1).toString().padStart(3, "0");
            patient.id = `AYU-2026-${nextNum}`;
        }
        if (!patient.registeredDate) {
            patient.registeredDate = new Date().toISOString().split("T")[0];
        }
        patients.unshift(patient);
        savePatients(patients);

        // Add timeline event
        addTimelineEvent({
            patientId: patient.id,
            date: patient.registeredDate,
            category: "Registration",
            title: "Patient Registered",
            details: `Registered as ${patient.fullName} (${patient.gender}, ${patient.age}y).`,
            icon: "fa-user-plus",
            tag: "Onboarding"
        });

        logAudit("Registered New Patient", getActiveRole(), "Patient Record", patient.id, `Patient ${patient.fullName} registered.`);
        return patient;
    }

    function authenticatePatient(identifier, password) {
        const patients = getPatients();
        const cleanId = (identifier || "").trim().toLowerCase();
        const cleanDigits = (identifier || "").replace(/\D/g, "");
        const patient = patients.find(p => 
            (p.id && p.id.toLowerCase() === cleanId) ||
            (p.phone && cleanDigits.length >= 6 && p.phone.replace(/\D/g, "").includes(cleanDigits)) ||
            (p.email && p.email.toLowerCase() === cleanId) ||
            (p.fullName && p.fullName.toLowerCase() === cleanId)
        );
        if (!patient) return { success: false, message: "मरीज़ नहीं मिला (Patient not found with this ID or Mobile)" };
        
        const storedPass = patient.password || "123456";
        if (password && password !== storedPass) {
            return { success: false, message: "पासवर्ड गलत है (Incorrect password. Demo password: '123456')" };
        }

        return { success: true, patient: patient };
    }

    function addPastDoctorRecord(patientId, record) {
        const patients = getPatients();
        const index = patients.findIndex(p => p.id === patientId);
        if (index === -1) return null;

        if (!patients[index].pastDoctorRecords) {
            patients[index].pastDoctorRecords = [];
        }

        record.id = "doc-rec-" + Date.now();
        record.dateAdded = new Date().toISOString().split("T")[0];
        patients[index].pastDoctorRecords.unshift(record);
        savePatients(patients);

        // Record on patient health timeline
        addTimelineEvent({
            patientId: patientId,
            date: record.year || record.dateAdded,
            category: "Past History",
            title: `Previous Record: ${record.diagnosis || 'Consultation'} (${record.doctorName || 'Dr. Previous'})`,
            details: `Clinic/Hospital: ${record.clinicOrHospital || 'N/A'}. Meds: ${record.pastMedicines || 'N/A'}. Notes: ${record.notes || 'N/A'}`,
            icon: "fa-book-medical",
            tag: "Past Doctor Record"
        });

        logAudit("Added Past Doctor Record", "Patient/Practitioner", "Past History", patientId, `Record from ${record.doctorName || 'Doctor'} added.`);
        return record;
    }

    function addPatientReportedDisease(patientId, diseaseObj) {
        const patients = getPatients();
        const index = patients.findIndex(p => p.id === patientId);
        if (index === -1) return null;

        if (!patients[index].patientReportedDiseases) {
            patients[index].patientReportedDiseases = [];
        }

        diseaseObj.id = "dis-" + Date.now();
        diseaseObj.dateReported = new Date().toISOString().split("T")[0];
        patients[index].patientReportedDiseases.unshift(diseaseObj);
        savePatients(patients);

        // Auto create/update a clinical case for practitioner review
        const newCase = createEmptyCaseState(patientId, patients[index].fullName);
        newCase.chiefComplaint = `${diseaseObj.diseaseName || 'Health Issue'} (${diseaseObj.duration || 'Recently reported'})`;
        newCase.symptoms = (diseaseObj.symptoms || diseaseObj.diseaseName || "").split(",").map(s => s.trim()).filter(Boolean);
        newCase.status = "PRACTITIONER REVIEW";
        newCase.transcript = [{
            id: "portal-dis-" + Date.now(),
            speaker: "patient",
            text: `Reported Disease: ${diseaseObj.diseaseName}. Severity: ${diseaseObj.severity || 'Moderate'}. Symptoms: ${diseaseObj.symptoms || 'N/A'}. Notes: ${diseaseObj.notes || ''}`,
            originalLanguage: "Hindi",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
        saveOrUpdateCase(newCase);

        // Add timeline event
        addTimelineEvent({
            patientId: patientId,
            date: diseaseObj.dateReported,
            category: "Symptom",
            title: `Patient Reported Disease: ${diseaseObj.diseaseName}`,
            details: `Severity: ${diseaseObj.severity || 'Moderate'}. Duration: ${diseaseObj.duration || 'N/A'}. Symptoms: ${diseaseObj.symptoms || 'N/A'}`,
            icon: "fa-notes-medical",
            tag: "Patient Input"
        });

        logAudit("Patient Added Disease", "Patient", "Chief Complaint", patientId, `Disease ${diseaseObj.diseaseName} reported.`);
        return diseaseObj;
    }

    function searchPatientFullProfile(query) {
        if (!query) return null;
        const clean = query.trim().toLowerCase();
        const cleanDigits = query.replace(/\D/g, "");
        const patients = getPatients();
        const patient = patients.find(p => 
            (p.id && p.id.toLowerCase() === clean) ||
            (p.phone && cleanDigits.length >= 6 && p.phone.replace(/\D/g, "").includes(cleanDigits)) ||
            (p.email && p.email.toLowerCase() === clean) ||
            (p.fullName && p.fullName.toLowerCase().includes(clean))
        );

        if (!patient) return null;

        const cases = getCases().filter(c => c.patientId === patient.id);
        const timeline = getTimelineForPatient(patient.id);
        const followups = getFollowups().filter(f => f.patientId === patient.id);

        return {
            patient,
            cases,
            timeline,
            followups,
            pastDoctorRecords: patient.pastDoctorRecords || [],
            patientReportedDiseases: patient.patientReportedDiseases || []
        };
    }

    /* =========================================================================
       CASE METHODS
       ========================================================================= */
    function getCases() {
        try {
            return JSON.parse(localStorage.getItem(KEYS.CASES)) || [];
        } catch (e) {
            console.error("Error reading cases", e);
            return DEFAULT_CASES;
        }
    }

    function saveCases(cases) {
        localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
    }

    function getCaseById(id) {
        return getCases().find(c => c.id === id);
    }

    function saveOrUpdateCase(caseData) {
        const cases = getCases();
        const index = cases.findIndex(c => c.id === caseData.id);
        caseData.updatedAt = new Date().toISOString();

        if (index >= 0) {
            cases[index] = caseData;
        } else {
            cases.unshift(caseData);
        }
        saveCases(cases);

        logAudit(
            index >= 0 ? "Updated Case" : "Created Case",
            getActiveRole(),
            "Case Record",
            caseData.id,
            `Case for ${caseData.patientName} (Status: ${caseData.status})`
        );

        return caseData;
    }

    function updateCaseStatus(caseId, newStatus) {
        const cases = getCases();
        const targetCase = cases.find(c => c.id === caseId);
        if (targetCase) {
            const oldStatus = targetCase.status;
            targetCase.status = newStatus;
            targetCase.updatedAt = new Date().toISOString();
            saveCases(cases);

            logAudit(
                "Changed Case Status",
                getActiveRole(),
                "Case Status",
                caseId,
                `Status changed from ${oldStatus} to ${newStatus}`
            );

            // If verified or completed, append timeline event
            if (newStatus === "VERIFIED" || newStatus === "COMPLETED") {
                addTimelineEvent({
                    patientId: targetCase.patientId,
                    date: new Date().toISOString().split("T")[0],
                    category: "Case Completed",
                    title: `Case Verified: ${targetCase.chiefComplaint.slice(0, 45)}...`,
                    details: `Case ${targetCase.id} verified and finalized by practitioner. Clinical impression: ${targetCase.clinicalImpression || 'Completed'}.`,
                    icon: "fa-certificate",
                    tag: "Finalized"
                });
            }
        }
    }

    /* =========================================================================
       TIMELINE METHODS
       ========================================================================= */
    function getTimelineForPatient(patientId) {
        try {
            const all = JSON.parse(localStorage.getItem(KEYS.TIMELINE)) || [];
            return all
                .filter(t => t.patientId === patientId)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (e) {
            return [];
        }
    }

    function addTimelineEvent(event) {
        const all = JSON.parse(localStorage.getItem(KEYS.TIMELINE)) || [];
        if (!event.id) event.id = "tl-" + Date.now();
        all.unshift(event);
        localStorage.setItem(KEYS.TIMELINE, JSON.stringify(all));
    }

    /* =========================================================================
       AUDIT LOG METHODS
       ========================================================================= */
    function getAuditLogs() {
        try {
            return JSON.parse(localStorage.getItem(KEYS.AUDIT_LOGS)) || [];
        } catch (e) {
            return [];
        }
    }

    function logAudit(action, role, fieldChanged, caseOrPatientId, details) {
        const logs = getAuditLogs();
        const entry = {
            id: "log-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
            timestamp: new Date().toISOString(),
            role: role || getActiveRole(),
            userName: getCurrentUserName(role),
            action: action,
            fieldChanged: fieldChanged || "General",
            caseId: caseOrPatientId || "N/A",
            details: details || ""
        };
        logs.unshift(entry);
        // Retain last 200 logs
        if (logs.length > 200) logs.length = 200;
        localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs));
        return entry;
    }

    function getCurrentUserName(role) {
        const user = JSON.parse(localStorage.getItem(KEYS.CURRENT_USER));
        if (user && user.name) return user.name;
        if (role === "patient") return "Patient (Self / Caregiver)";
        if (role === "admin") return "Administrator";
        return "Dr. Sharma";
    }

    /* =========================================================================
       FOLLOW-UP METHODS
       ========================================================================= */
    function getFollowups() {
        try {
            return JSON.parse(localStorage.getItem(KEYS.FOLLOWUPS)) || [];
        } catch (e) {
            return [];
        }
    }

    function addFollowup(followup) {
        const list = getFollowups();
        if (!followup.id) followup.id = "fup-" + Date.now();
        list.unshift(followup);
        localStorage.setItem(KEYS.FOLLOWUPS, JSON.stringify(list));
        logAudit("Scheduled Follow-up", getActiveRole(), "Follow-up", followup.caseId, `Follow-up set for ${followup.date}: ${followup.reason}`);
        return followup;
    }

    /* =========================================================================
       OFFLINE DRAFT METHODS
       ========================================================================= */
    function saveOfflineDraft(draftKey, draftData) {
        try {
            const drafts = JSON.parse(localStorage.getItem(KEYS.OFFLINE_DRAFTS)) || {};
            drafts[draftKey] = {
                data: draftData,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem(KEYS.OFFLINE_DRAFTS, JSON.stringify(drafts));
        } catch (e) {
            console.error("Failed to save offline draft", e);
        }
    }

    function getOfflineDraft(draftKey) {
        try {
            const drafts = JSON.parse(localStorage.getItem(KEYS.OFFLINE_DRAFTS)) || {};
            return drafts[draftKey] ? drafts[draftKey].data : null;
        } catch (e) {
            return null;
        }
    }

    function clearOfflineDraft(draftKey) {
        try {
            const drafts = JSON.parse(localStorage.getItem(KEYS.OFFLINE_DRAFTS)) || {};
            delete drafts[draftKey];
            localStorage.setItem(KEYS.OFFLINE_DRAFTS, JSON.stringify(drafts));
        } catch (e) {
            console.error("Failed to clear offline draft", e);
        }
    }

    /* =========================================================================
       RBAC (ROLE-BASED ACCESS CONTROL)
       ========================================================================= */
    function getActiveRole() {
        return localStorage.getItem(KEYS.ACTIVE_ROLE) || "practitioner";
    }

    function setActiveRole(role) {
        localStorage.setItem(KEYS.ACTIVE_ROLE, role);
        logAudit("Switched System Role", role, "RBAC", "N/A", `Active view changed to ${role.toUpperCase()}`);
    }

    /* =========================================================================
       ATTENTION QUEUE & STATS
       ========================================================================= */
    function getAttentionQueue() {
        const cases = getCases();
        const urgent = [];
        const needsVerification = [];
        const incomplete = [];
        const ready = [];

        cases.forEach(c => {
            if (c.status === "COMPLETED") return;

            const hasRedFlag = c.redFlags && c.redFlags.length > 0;
            const hasAllergyConflict = c.allergies && c.allergies.some(a => a.hasConflict);
            const hasContradictions = c.contradictions && c.contradictions.length > 0;
            const hasMissingInfo = c.missingInformation && c.missingInformation.length > 0;
            const isLowConfidence = c.fieldConfidence && Object.values(c.fieldConfidence).some(v => v < 60);

            if (hasRedFlag) {
                urgent.push({
                    case: c,
                    type: "urgent",
                    priority: 1,
                    badge: "🔴 URGENT REVIEW",
                    reason: c.redFlags[0].title || "Severe potential symptom reported",
                    trigger: c.redFlags[0].triggerStatement || ""
                });
            } else if (hasContradictions || hasAllergyConflict || isLowConfidence) {
                needsVerification.push({
                    case: c,
                    type: "needs_verification",
                    priority: 2,
                    badge: "🟠 NEEDS VERIFICATION",
                    reason: hasContradictions ? "Contradictory information detected" : (hasAllergyConflict ? "Potential allergy conflict detected" : "Low confidence extracted fields"),
                    trigger: hasContradictions ? c.contradictions[0].recommendation : ""
                });
            } else if (hasMissingInfo) {
                incomplete.push({
                    case: c,
                    type: "incomplete",
                    priority: 3,
                    badge: "🟡 INCOMPLETE",
                    reason: `${c.missingInformation.length} clinical parameters missing`,
                    trigger: c.missingInformation.map(m => m.label).join(", ")
                });
            } else {
                ready.push({
                    case: c,
                    type: "ready",
                    priority: 4,
                    badge: "🟢 READY FOR REVIEW",
                    reason: "Case information is complete and verified",
                    trigger: "Ready for practitioner final review"
                });
            }
        });

        return {
            urgent,
            needsVerification,
            incomplete,
            ready,
            totalAttention: urgent.length + needsVerification.length + incomplete.length
        };
    }

    function getDashboardMetrics() {
        const patients = getPatients();
        const cases = getCases();
        const followups = getFollowups();
        const queue = getAttentionQueue();

        const todayStr = new Date().toISOString().split("T")[0];
        const casesToday = cases.filter(c => c.createdAt && c.createdAt.startsWith(todayStr)).length;
        const pendingReview = cases.filter(c => c.status === "PRACTITIONER REVIEW" || c.status === "AI REVIEW").length;
        const completed = cases.filter(c => c.status === "VERIFIED" || c.status === "COMPLETED").length;
        const lowConfidenceCount = cases.filter(c => c.fieldConfidence && Object.values(c.fieldConfidence).some(v => v < 60)).length;
        const redFlagCount = cases.filter(c => c.redFlags && c.redFlags.length > 0).length;
        const followupsDue = followups.filter(f => f.date <= todayStr).length;

        return {
            totalPatients: patients.length,
            casesToday: casesToday || 3, // Realistic fallback if today is fresh
            pendingReview: pendingReview,
            completed: completed,
            requiringAttention: queue.totalAttention,
            lowConfidenceCount: lowConfidenceCount,
            redFlagCount: redFlagCount,
            followupsDue: followupsDue || followups.length
        };
    }

    return {
        KEYS,
        getPatients,
        savePatients,
        getPatientById,
        addPatient,
        getCases,
        saveCases,
        getCaseById,
        saveOrUpdateCase,
        updateCaseStatus,
        getTimelineForPatient,
        addTimelineEvent,
        getAuditLogs,
        logAudit,
        getFollowups,
        addFollowup,
        saveOfflineDraft,
        getOfflineDraft,
        clearOfflineDraft,
        getActiveRole,
        setActiveRole,
        getAttentionQueue,
        getDashboardMetrics,
        authenticatePatient,
        addPastDoctorRecord,
        addPatientReportedDisease,
        searchPatientFullProfile
    };
})();
