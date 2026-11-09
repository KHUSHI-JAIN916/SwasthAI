/* ==========================================================================
   SWASTHAI — Universal Localization (i18n) & Full-Page Translation Service
   Complete, instantaneous bidirectional DOM translation across English,
   Hindi, and Hinglish. Covers all portals, forms, tables, modals, sidebars,
   clinical terminology, and dynamic elements.
   ========================================================================== */

const I18nService = (() => {
    const STORAGE_KEY = "swasthai_selected_lang";
    let currentLang = localStorage.getItem(STORAGE_KEY) || "hi"; // Default to Hindi

    // 1. Core UI Dictionary for data-i18n attributes
    const DICTIONARY = {
        en: {
            appName: "SWASTHAI",
            appTagline: "From Patient's Voice to Doctor's Insight",
            langName: "English",
            selectLang: "Language",
            roleDoctor: "Doctor / Practitioner",
            rolePatient: "Patient / Caregiver",
            roleAdmin: "Administrator",
            audioGuideBtn: "🔊 Listen in Audio",
            audioGuidePrompt: "Welcome to SwasthAI. If you are a patient, speak your symptoms or upload reports. If you are a doctor, access the Doctor Portal.",
            
            // Portals
            patientPortalTitle: "Patient Health Portal",
            patientPortalSubtitle: "Speak your symptoms, upload medical reports, and view doctor prescriptions.",
            doctorPortalTitle: "Doctor / Practitioner Portal",
            doctorPortalSubtitle: "Case taking, clinical review workspace, attention queue, and patient timeline.",
            enterPatientPortal: "Open Patient Portal",
            enterDoctorPortal: "Open Doctor Portal",
            patientPortalLoginTitle: "Patient Health Portal Login",
            patientPortalLoginSub: "Keep your diseases, symptoms & past prescriptions safe",
            tabPatientLogin: "Patient Login",
            tabPatientRegister: "Register New Account",
            loginFieldId: "Patient ID or Mobile Number",
            loginFieldPassword: "Password",
            defaultDemoPassword: "Default Demo Password:",
            enterPortalBtn: "Enter Portal",
            areYouDoctor: "Are you a doctor or clinic?",
            addDiseaseCardTitle: "Add New Disease / Problem",
            addDiseaseCardSub: "Send current problem & symptoms to doctor",
            addPastDoctorCardTitle: "Add Past Doctor Records / Prescription",
            addPastDoctorCardSub: "Past doctor name, clinic & medicines",
            modalAddDiseaseTitle: "Add New Disease / Problem",
            modalDiseaseNameLabel: "Disease Name / Primary Issue *",
            modalDiseaseNamePlaceholder: "e.g. Joint Pain (Arthritis), Migraine, Asthma",
            modalDurationLabel: "Duration",
            modalDurationPlaceholder: "e.g. 6 months, 2 weeks",
            modalSeverityLabel: "Severity",
            severityMild: "Mild",
            severityModerate: "Moderate",
            severitySevere: "Severe",
            modalSymptomsLabel: "Symptoms & Additional Details",
            modalSymptomsPlaceholder: "e.g. Morning stiffness, swelling while walking...",
            modalSaveDiseaseBtn: "Save Disease & Send to Doctor",
            modalAddPastDoctorTitle: "Add Past Doctor Record / Previous Treatment",
            modalDoctorNameLabel: "Doctor Name *",
            modalDoctorNamePlaceholder: "e.g. Dr. R. K. Sharma",
            modalClinicNameLabel: "Clinic / Hospital Name",
            modalClinicNamePlaceholder: "e.g. City Hospital, Delhi",
            modalDiagnosisLabel: "Diagnosis / Disease *",
            modalDiagnosisPlaceholder: "e.g. High Blood Pressure, Acidity",
            modalYearDateLabel: "Year / Date",
            modalYearDatePlaceholder: "e.g. 2023 or Aug 2024",
            modalPastMedsLabel: "Previous Medications Prescribed",
            modalPastMedsPlaceholder: "e.g. Amlodipine 5mg, Pantocid 40mg",
            modalPastNotesLabel: "Doctor Advice / Previous Tests",
            modalPastNotesPlaceholder: "e.g. Advised low salt diet, Echo test normal...",
            modalSavePastRecordBtn: "Save Record",
            
            // Patient Portal
            patientWelcome: "Hello",
            patientTag: "Registered Patient",
            voiceAssistantHeading: "Tell us your symptoms (Speak or Type)",
            voiceAssistantSub: "Press the big green microphone and speak naturally in Hindi or English.",
            startSpeakingBtn: "Tap to Speak",
            listeningNow: "Listening... Please speak your health problem.",
            stopSpeakingBtn: "Stop Speaking",
            orTypeHere: "Or type your symptoms here...",
            sendSymptomsBtn: "Submit Symptoms to Doctor",
            clearBtnText: "Clear Text",
            
            // Report Arranger
            reportArrangerTitle: "AI Medical Report & Prescription Arranger",
            reportArrangerSub: "Upload photos or PDFs of blood tests, LFT, CBC, or doctor prescriptions. AI will organize and explain them in simple words.",
            uploadReportBtn: "Choose Photo from Device",
            sampleLftBtn: "Sample Liver (LFT) Report",
            sampleCbcBtn: "Sample Blood Test (CBC)",
            samplePrescriptionBtn: "Sample Prescription",
            analyzingReport: "AI is reading and organizing your report...",
            normalStatus: "Normal / Safe",
            attentionStatus: "Doctor Review Needed",
            highStatus: "High / Alert",
            
            // Visual Symptom Selector
            visualSymptomTitle: "Quick Body Symptom Selector",
            visualSymptomSub: "Tap the body part or health issue you are experiencing:",
            symptomHead: "Headache / Dizziness",
            symptomStomach: "Stomach Pain / Acidity",
            symptomChest: "Chest Pain / Heaviness",
            symptomJoints: "Joint Pain / Arthritis",
            symptomFever: "Fever / Shivering",
            symptomSkin: "Skin Rash / Itching",
            symptomThroat: "Cough / Sore Throat",
            symptomDiabetes: "Sugar / Weakness",
            
            // Prescriptions & Follow-ups
            myPrescriptions: "Doctor Verified Prescriptions",
            nextFollowup: "Next Doctor Follow-up",
            emergencyCall: "Emergency Help (Call 108)",
            emergencySub: "If facing severe breathlessness or acute chest pain, visit the nearest emergency room or dial 108 immediately.",
            call108Btn: "Call 108 Emergency",
            
            // Common Navigation
            navDashboard: "Dashboard",
            navPatients: "Patients",
            navAddPatient: "Add Patient",
            navNewCase: "New Case",
            navReview: "Review Workspace",
            navCaseHistory: "Case History",
            navAnalytics: "Analytics",
            navAiAssistant: "AI Assistant",
            navVoiceCase: "Voice Case Taking",
            navProfile: "My Profile",
            navLogout: "Logout",
            overviewTitle: "Overview",
            overviewSub: "Quick insights about your patients and cases.",
            totalPatientsText: "Total Patients",
            casesTodayText: "Cases Today",
            pendingReviewText: "Pending Review",
            completedCasesText: "Completed Cases",
            urgentRedFlagsText: "Urgent Red Flags",
            needsAttentionText: "Needs Attention",
            followupsDueText: "Follow-ups Due",
            systemAccuracyText: "System Accuracy"
        },
        hi: {
            appName: "स्वास्थ AI",
            appTagline: "मरीज़ की आवाज़ से डॉक्टर के परामर्श तक",
            langName: "हिंदी (Hindi)",
            selectLang: "भाषा चुनें",
            roleDoctor: "डॉक्टर / चिकित्सक",
            rolePatient: "मरीज़ / तीमारदार",
            roleAdmin: "प्रशासक (Admin)",
            audioGuideBtn: "🔊 आवाज़ में सुनें",
            audioGuidePrompt: "स्वास्थ AI में आपका स्वागत है। अगर आप मरीज़ हैं, तो अपनी तकलीफ बोलकर बताने या रिपोर्ट अपलोड करने के लिए हरा बटन दबाएं। यदि आप डॉक्टर हैं, तो डॉक्टर पोर्टल चुनें।",
            
            // Portals
            patientPortalTitle: "मरीज़ स्वास्थ्य सेवा पोर्टल",
            patientPortalSubtitle: "अपनी तकलीफ बोलकर बताएं, डॉक्टर की पर्ची व टेस्ट रिपोर्ट अपलोड करें और दवाइयां देखें।",
            doctorPortalTitle: "डॉक्टर / चिकित्सक पोर्टल",
            doctorPortalSubtitle: "केस-टेकिंग, समीक्षा कार्यक्षेत्र और मरीज़ हिस्ट्री।",
            enterPatientPortal: "मरीज़ पोर्टल खोलें",
            enterDoctorPortal: "डॉक्टर पोर्टल खोलें",
            patientPortalLoginTitle: "मरीज़ स्वास्थ्य पोर्टल लॉगिन",
            patientPortalLoginSub: "अपनी बीमारी, लक्षण व पुराने डॉक्टर के पर्चे सुरक्षित रखें",
            tabPatientLogin: "मरीज़ लॉगिन (Login)",
            tabPatientRegister: "नया खाता बनाएं (Register)",
            loginFieldId: "Patient ID या मोबाइल नंबर",
            loginFieldPassword: "पासवर्ड (Password)",
            defaultDemoPassword: "डिफ़ॉल्ट डेमो पासवर्ड:",
            enterPortalBtn: "पोर्टल में प्रवेश करें (Enter Portal)",
            areYouDoctor: "क्या आप डॉक्टर या क्लिनिक हैं?",
            addDiseaseCardTitle: "नई बीमारी / तकलीफ जोड़ें",
            addDiseaseCardSub: "वर्तमान समस्या व लक्षण डॉक्टर को भेजें",
            addPastDoctorCardTitle: "पुराने डॉक्टर का डेटा / पर्चा जोड़ें",
            addPastDoctorCardSub: "पुराने डॉक्टर का नाम, क्लिनिक व दवाइयां",
            modalAddDiseaseTitle: "नई बीमारी / तकलीफ जोड़ें",
            modalDiseaseNameLabel: "बीमारी का नाम / मुख्य समस्या *",
            modalDiseaseNamePlaceholder: "उदा. जोड़ों का दर्द (Arthritis), माइग्रेन, अस्थमा",
            modalDurationLabel: "कब से है (Duration)",
            modalDurationPlaceholder: "उदा. 6 महीने से, 2 हफ्ते से",
            modalSeverityLabel: "तीव्रता (Severity)",
            severityMild: "हल्का (Mild)",
            severityModerate: "मध्यम (Moderate)",
            severitySevere: "गंभीर (Severe)",
            modalSymptomsLabel: "लक्षण व अतिरिक्त विवरण",
            modalSymptomsPlaceholder: "उदा. सुबह उठते ही अकड़न, चलने में सूजन...",
            modalSaveDiseaseBtn: "बीमारी सेव करें व डॉक्टर को भेजें",
            modalAddPastDoctorTitle: "पुराने डॉक्टर का डेटा / पिछला इलाज जोड़ें",
            modalDoctorNameLabel: "डॉक्टर का नाम *",
            modalDoctorNamePlaceholder: "उदा. Dr. R. K. Sharma",
            modalClinicNameLabel: "क्लिनिक / अस्पताल का नाम",
            modalClinicNamePlaceholder: "उदा. City Hospital, Delhi",
            modalDiagnosisLabel: "निदान / बीमारी (Diagnosis) *",
            modalDiagnosisPlaceholder: "उदा. High Blood Pressure, Acidity",
            modalYearDateLabel: "साल / तारीख (Year/Date)",
            modalYearDatePlaceholder: "उदा. 2023 या Aug 2024",
            modalPastMedsLabel: "पिछली दवाइयां जो दी गई थीं",
            modalPastMedsPlaceholder: "उदा. Amlodipine 5mg, Pantocid 40mg",
            modalPastNotesLabel: "डॉक्टर के निर्देश / कोई पुरानी जांच",
            modalPastNotesPlaceholder: "उदा. नमक कम खाने की सलाह दी थी, इको टेस्ट नॉर्मल था...",
            modalSavePastRecordBtn: "पुराना रिकॉर्ड सुरक्षित करें (Save Record)",
            
            // Patient Portal
            patientWelcome: "नमस्ते",
            patientTag: "पंजीकृत मरीज़",
            voiceAssistantHeading: "अपनी बीमारी या तकलीफ बोलकर बताएं",
            voiceAssistantSub: "नीचे दिए गए हरे माइक बटन को दबाएं और अपनी भाषा में खुलकर बोलें।",
            startSpeakingBtn: "माइक दबाकर बोलें",
            listeningNow: "सुन रहे हैं... कृपया अपनी तकलीफ बताएं।",
            stopSpeakingBtn: "बोलना समाप्त हुआ",
            orTypeHere: "या यहाँ अपनी समस्या लिखें...",
            sendSymptomsBtn: "तकलीफ डॉक्टर को भेजें",
            clearBtnText: "साफ करें",
            
            // Report Arranger
            reportArrangerTitle: "AI मेडिकल रिपोर्ट व पर्चा व्यवस्थापक",
            reportArrangerSub: "खून की जांच, लिवर टेस्ट या डॉक्टर के पर्चे का फोटो डालें। AI इसे आसान भाषा में व्यवस्थित करके समझाएगा।",
            uploadReportBtn: "डिवाइस से फोटो चुनें",
            sampleLftBtn: "सैंपल लिवर (LFT) रिपोर्ट",
            sampleCbcBtn: "सैंपल खून जांच (CBC)",
            samplePrescriptionBtn: "सैंपल डॉक्टर पर्चा",
            analyzingReport: "AI आपकी रिपोर्ट को पढ़कर व्यवस्थित कर रहा है...",
            normalStatus: "सामान्य / सुरक्षित",
            attentionStatus: "डॉक्टर को दिखाना ज़रूरी",
            highStatus: "अधिक / चेतावनी",
            
            // Visual Symptom Selector
            visualSymptomTitle: "शरीर के अंगों के अनुसार लक्षण चुनें",
            visualSymptomSub: "जिस अंग में दर्द या तकलीफ हो, उस पर स्पर्श (टैप) करें:",
            symptomHead: "सिरदर्द / चक्कर",
            symptomStomach: "पेट दर्द / गैस",
            symptomChest: "छाती में दर्द",
            symptomJoints: "जोड़ों का दर्द",
            symptomFever: "बुखार / कंपकंपी",
            symptomSkin: "त्वचा / खुजली",
            symptomThroat: "खांसी / गला",
            symptomDiabetes: "शुगर / कमजोरी",
            
            // Prescriptions & Follow-ups
            myPrescriptions: "डॉक्टर द्वारा जांची गई दवाइयां",
            nextFollowup: "अगली डॉक्टर मुलाक़ात",
            emergencyCall: "आपातकालीन मदद (108 कॉल करें)",
            emergencySub: "अगर सांस लेने में भारी तकलीफ या सीने में तेज़ दर्द हो, तो तुरंत नजदीकी अस्पताल जाएं या 108 डायल करें।",
            call108Btn: "108 पर कॉल करें",
            
            // Common Navigation
            navDashboard: "डैशबोर्ड",
            navPatients: "मरीज़ सूची",
            navAddPatient: "नया मरीज़ जोड़ें",
            navNewCase: "नया केस",
            navReview: "समीक्षा कार्यक्षेत्र",
            navCaseHistory: "केस इतिहास",
            navAnalytics: "एनालिटिक्स",
            navAiAssistant: "AI सहायक",
            navVoiceCase: "वॉइस केस-टेकिंग",
            navProfile: "मेरी प्रोफाइल",
            navLogout: "लॉगआउट",
            overviewTitle: "विवरण",
            overviewSub: "मरीज़ों और केसों की महत्वपूर्ण जानकारी।",
            totalPatientsText: "कुल मरीज़",
            casesTodayText: "आज के केस",
            pendingReviewText: "समीक्षा हेतु लंबित",
            completedCasesText: "पूरे हुए केस",
            urgentRedFlagsText: "अति-गंभीर लक्षण",
            needsAttentionText: "ध्यान देने योग्य",
            followupsDueText: "नियत फॉलो-अप",
            systemAccuracyText: "सिस्टम सटीकता"
        },
        hinglish: {
            appName: "SWASTH AI",
            appTagline: "Patient ki Voice se Doctor ke Insight tak",
            langName: "Hinglish (हिन्दी-English)",
            selectLang: "Language Chunein",
            roleDoctor: "Doctor / Practitioner",
            rolePatient: "Patient / Caregiver",
            roleAdmin: "Admin",
            audioGuideBtn: "🔊 Audio me Sunein",
            audioGuidePrompt: "Swasth AI me aapka swagat hai. Agar aap patient hain, to apni problem bolkar batane ke liye green button dabayein. Agar aap doctor hain, to Doctor Portal choose karein.",
            
            // Portals
            patientPortalTitle: "Patient Health Portal",
            patientPortalSubtitle: "Apni bimari bolkar batayein, medical reports upload karein aur dawaiyan dekhein.",
            doctorPortalTitle: "Doctor / Practitioner Portal",
            doctorPortalSubtitle: "Case taking, clinical review workspace aur patient timeline.",
            enterPatientPortal: "Patient Portal Kholein",
            enterDoctorPortal: "Doctor Portal Kholein",
            
            // Patient Portal
            patientWelcome: "Namaste",
            patientTag: "Registered Patient",
            voiceAssistantHeading: "Apni bimari ya problem bolkar batayein",
            voiceAssistantSub: "Neeche green mic button dabakar aasaani se bolein.",
            startSpeakingBtn: "Mic dabakar bolein",
            listeningNow: "Sun rahe hain... Apni problem bolein.",
            stopSpeakingBtn: "Bolna complete hua",
            orTypeHere: "Ya yahan apni bimari type karein...",
            sendSymptomsBtn: "Symptoms Doctor ko Bhejein",
            clearBtnText: "Clear Karein",
            
            // Report Arranger
            reportArrangerTitle: "AI Medical Report & Prescription Arranger",
            reportArrangerSub: "Lab test ya doctor prescription ki photo dalein. AI isko simple language me organize karega.",
            uploadReportBtn: "Device se Photo Chunein",
            sampleLftBtn: "Sample LFT Liver Report",
            sampleCbcBtn: "Sample CBC Blood Report",
            samplePrescriptionBtn: "Sample Prescription",
            analyzingReport: "AI report ko read aur arrange kar raha hai...",
            normalStatus: "Normal / Safe",
            attentionStatus: "Doctor Review Zaruri",
            highStatus: "High / Alert",
            
            // Visual Symptom Selector
            visualSymptomTitle: "Body Parts ke according problem chunein",
            visualSymptomSub: "Jis body part me dard ya problem ho uspe tap karein:",
            symptomHead: "Sar Dard / Chakkar",
            symptomStomach: "Pet Dard / Gas / Acidity",
            symptomChest: "Chest Pain / Saans me dikkat",
            symptomJoints: "Jodon & Ghutne ka Dard",
            symptomFever: "Bukhar / Thand lagna",
            symptomSkin: "Skin Allergy / Khujli",
            symptomThroat: "Khansi / Gale me dard",
            symptomDiabetes: "Sugar / Kamzori",
            
            // Prescriptions & Follow-ups
            myPrescriptions: "Doctor ki Verified Dawaiyan",
            nextFollowup: "Next Doctor Consultation",
            emergencyCall: "Emergency Help (108 Call Karein)",
            emergencySub: "Agar saans lene me dikkat ya chest pain ho, to turant hospital jayein ya 108 call karein.",
            call108Btn: "108 Call Karein",
            
            // Common Navigation
            navDashboard: "Dashboard",
            navPatients: "Patients List",
            navAddPatient: "Add Patient",
            navNewCase: "New Case",
            navReview: "Review Workspace",
            navCaseHistory: "Case History",
            navAnalytics: "Analytics",
            navAiAssistant: "AI Assistant",
            navVoiceCase: "Voice Case Taking",
            navProfile: "My Profile",
            navLogout: "Logout",
            overviewTitle: "Overview",
            overviewSub: "Patients aur cases ki quick summary.",
            totalPatientsText: "Total Patients",
            casesTodayText: "Aaj ke Cases",
            pendingReviewText: "Pending Review",
            completedCasesText: "Completed Cases",
            urgentRedFlagsText: "Urgent Red Flags",
            needsAttentionText: "Needs Attention",
            followupsDueText: "Follow-ups Due",
            systemAccuracyText: "System Accuracy"
        }
    };

    // 2. Comprehensive Bidirectional Phrase Book for Universal Full-Page DOM Translation
    const PHRASE_BOOK = [
        // App Branding & General
        { en: "SWASTHAI", hi: "स्वास्थ AI", hinglish: "SWASTH AI" },
        { en: "From Patient's Voice to Doctor's Insight", hi: "मरीज़ की आवाज़ से डॉक्टर के परामर्श तक", hinglish: "Patient ki Voice se Doctor ke Insight tak" },
        { en: "MAIN MENU", hi: "मुख्य मेन्यू", hinglish: "MAIN MENU" },
        { en: "Language", hi: "भाषा", hinglish: "Language" },
        { en: "Audio Help", hi: "आवाज़ में सुनें", hinglish: "Audio Help" },
        { en: "🔊 Listen in Audio", hi: "🔊 आवाज़ में सुनें", hinglish: "🔊 Audio me Sunein" },

        // Sidebar Navigation
        { en: "Patient Portal", hi: "मरीज़ स्वास्थ्य पोर्टल", hinglish: "Patient Portal" },
        { en: "Dashboard", hi: "डैशबोर्ड", hinglish: "Dashboard" },
        { en: "Patients", hi: "मरीज़ सूची", hinglish: "Patients" },
        { en: "Patients List", hi: "मरीज़ सूची", hinglish: "Patients List" },
        { en: "Add Patient", hi: "नया मरीज़ जोड़ें", hinglish: "Add Patient" },
        { en: "New Case", hi: "नया केस", hinglish: "New Case" },
        { en: "Review Workspace", hi: "समीक्षा कार्यक्षेत्र", hinglish: "Review Workspace" },
        { en: "Case History", hi: "केस इतिहास", hinglish: "Case History" },
        { en: "Analytics", hi: "एनालिटिक्स", hinglish: "Analytics" },
        { en: "AI Assistant", hi: "AI सहायक", hinglish: "AI Assistant" },
        { en: "Voice Case Taking", hi: "वॉइस केस-टेकिंग", hinglish: "Voice Case Taking" },
        { en: "Settings", hi: "सेटिंग्स", hinglish: "Settings" },
        { en: "Logout", hi: "लॉगआउट", hinglish: "Logout" },
        { en: "My Profile", hi: "मेरी प्रोफाइल", hinglish: "My Profile" },

        // Topbar & Roles
        { en: "Doctor / Practitioner", hi: "डॉक्टर / चिकित्सक", hinglish: "Doctor / Practitioner" },
        { en: "Patient / Caregiver", hi: "मरीज़ / तीमारदार", hinglish: "Patient / Caregiver" },
        { en: "Administrator", hi: "प्रशासक", hinglish: "Admin" },

        // Landing Page (index.html)
        { en: "SWASTHAI — Intelligent Patient Care Platform", hi: "स्वास्थ AI — बुद्धिमान मरीज़ स्वास्थ्य सेवा मंच", hinglish: "SWASTHAI — Intelligent Patient Care Platform" },
        { en: "Simple & Powerful Digital Healthcare Companion", hi: "स्वास्थ्य सेवा का सरल व सशक्त डिजिटल साथी", hinglish: "Swasthya Sewa ka Simple & Powerful Digital Saathi" },
        { en: "Patients can speak their symptoms and upload medical reports. Doctors can conduct safe and accurate case reviews.", hi: "मरीज़ बोलकर अपनी तकलीफ बता सकते हैं और मेडिकल रिपोर्ट अपलोड कर सकते हैं। डॉक्टर सुरक्षित व सटीक केस समीक्षा कर सकते हैं।", hinglish: "Patients bolkar apni dikkat bata sakte hain aur reports upload kar sakte hain. Doctors accurate review kar sakte hain." },
        { en: "Voice & Easy Touch", hi: "बोलकर व आसान स्पर्श से", hinglish: "Voice & Easy Touch" },
        { en: "Patient Health Portal", hi: "मरीज़ स्वास्थ्य सेवा पोर्टल", hinglish: "Patient Health Portal" },
        { en: "Speak your symptoms, upload medical reports, and view doctor prescriptions.", hi: "अपनी तकलीफ बोलकर बताएं, डॉक्टर की पर्ची व टेस्ट रिपोर्ट अपलोड करें और दवाइयां देखें।", hinglish: "Apni dikkat bolkar batayein, medical reports upload karein aur dawaiyan dekhein." },
        { en: "Speak symptoms: In Hindi, English & Hinglish", hi: "बोलकर बताएं: हिंदी, अंग्रेजी व हिंग्लिश में", hinglish: "Bolkar batayein: Hindi, English aur Hinglish me" },
        { en: "Open Patient Portal (Patient Login / Portal)", hi: "मरीज़ पोर्टल खोलें", hinglish: "Patient Portal Kholein" },
        { en: "Open Patient Portal", hi: "मरीज़ पोर्टल खोलें", hinglish: "Patient Portal Kholein" },
        { en: "New Patient Login / Register", hi: "नया मरीज़ लॉगिन / रजिस्टर करें", hinglish: "Naya Patient Login / Register" },
        { en: "Clinical AI Workspace", hi: "क्लिनिकल AI कार्यक्षेत्र", hinglish: "Clinical AI Workspace" },
        { en: "Doctor / Practitioner Portal", hi: "डॉक्टर / चिकित्सक पोर्टल", hinglish: "Doctor / Practitioner Portal" },
        { en: "Open Doctor Portal (Doctor)", hi: "डॉक्टर पोर्टल खोलें", hinglish: "Doctor Portal Kholein" },
        { en: "Open Doctor Portal", hi: "डॉक्टर पोर्टल खोलें", hinglish: "Doctor Portal Kholein" },
        { en: "Doctor Login (Dr. Sharma)", hi: "डॉक्टर लॉगिन (Dr. Sharma)", hinglish: "Doctor Login (Dr. Sharma)" },

        // Patient Portal (patient-portal.html)
        { en: "Tell us your symptoms (Speak or Type)", hi: "अपनी बीमारी या तकलीफ बोलकर बताएं", hinglish: "Apni bimari ya dikkat bolkar batayein" },
        { en: "Press the big green microphone and speak naturally in Hindi or English.", hi: "नीचे दिए गए हरे माइक बटन को दबाएं और अपनी भाषा में खुलकर बोलें।", hinglish: "Neeche green mic button dabayein aur simple bhasha me bolein." },
        { en: "Tap to Speak", hi: "माइक दबाकर बोलें", hinglish: "Mic dabakar bolein" },
        { en: "Press to Speak", hi: "माइक दबाकर बोलें", hinglish: "Mic dabakar bolein" },
        { en: "Listening... Please speak your health problem.", hi: "सुन रहे हैं... कृपया अपनी तकलीफ बताएं।", hinglish: "Sun rahe hain... Apni problem bolein." },
        { en: "Done", hi: "बोलना समाप्त हुआ", hinglish: "Bolna complete hua" },
        { en: "Or type your symptoms here...", hi: "या यहाँ अपनी समस्या लिखें...", hinglish: "Ya yahan apni bimari type karein..." },
        { en: "Submit Symptoms to Doctor", hi: "तकलीफ डॉक्टर को भेजें", hinglish: "Symptoms Doctor ko Bhejein" },
        { en: "Clear Text", hi: "साफ करें", hinglish: "Clear Karein" },

        // Quick Actions & Lists
        { en: "Add New Disease / Problem", hi: "नई बीमारी / तकलीफ जोड़ें", hinglish: "Nayi Bimari / Problem Jodein" },
        { en: "Send current problem & symptoms to doctor", hi: "वर्तमान समस्या व लक्षण डॉक्टर को भेजें", hinglish: "Current problem aur symptoms doctor ko bhejein" },
        { en: "Add Past Doctor Records / Prescription", hi: "पुराने डॉक्टर का डेटा / पर्चा जोड़ें", hinglish: "Purane Doctor ka Data / Parcha Jodein" },
        { en: "Past doctor name, clinic & medicines", hi: "पुराने डॉक्टर का नाम, क्लिनिक व दवाइयां", hinglish: "Purane doctor ka naam, clinic aur medicines" },
        { en: "Quick Body Symptom Selector", hi: "शरीर के अंगों के अनुसार लक्षण चुनें", hinglish: "Body parts ke according problem chunein" },
        { en: "Tap the body part or health issue you are experiencing:", hi: "जिस अंग में दर्द या तकलीफ हो, उस पर स्पर्श (टैप) करें:", hinglish: "Jis body part me dard ya problem ho uspe tap karein:" },
        { en: "Headache / Dizziness", hi: "सिरदर्द / चक्कर", hinglish: "Sar Dard / Chakkar" },
        { en: "Stomach Pain / Acidity", hi: "पेट दर्द / गैस", hinglish: "Pet Dard / Gas" },
        { en: "Chest Pain / Heaviness", hi: "छाती में दर्द", hinglish: "Chest Pain / Bhari Pan" },
        { en: "Joint Pain / Arthritis", hi: "जोड़ों का दर्द", hinglish: "Jodon ka Dard" },
        { en: "Fever / Shivering", hi: "बुखार / कंपकंपी", hinglish: "Bukhar / Thand" },
        { en: "Cough / Sore Throat", hi: "खांसी / गला", hinglish: "Khansi / Gale me dard" },
        { en: "Skin Rash / Itching", hi: "त्वचा / खुजली", hinglish: "Skin Allergy / Khujli" },
        { en: "Sugar / Weakness", hi: "शुगर / कमजोरी", hinglish: "Sugar / Kamzori" },
        { en: "My Reported Diseases", hi: "मेरी दर्ज की गई बीमारियां", hinglish: "Meri Reported Bimariyan" },
        { en: "Conditions you have informed the doctor", hi: "जो आपने डॉक्टर को बताई हैं", hinglish: "Jo aapne doctor ko batayi hain" },
        { en: "+ Add New", hi: "+ नई जोड़ें", hinglish: "+ Nayi Jodein" },
        { en: "Past Doctor Records", hi: "पुराने डॉक्टर का डेटा", hinglish: "Purane Doctor ka Data" },
        { en: "Previous doctor, clinic and medications", hi: "पिछले डॉक्टर, क्लिनिक व इलाज", hinglish: "Pichle doctor, clinic aur treatment" },
        { en: "+ Add Past Record", hi: "+ पुराना डेटा जोड़ें", hinglish: "+ Purana Data Jodein" },

        // Dynamic Card Labels
        { en: "Duration", hi: "अवधि", hinglish: "Duration" },
        { en: "Duration:", hi: "अवधि:", hinglish: "Duration:" },
        { en: "Time:", hi: "समय:", hinglish: "Time:" },
        { en: "Symptoms", hi: "लक्षण", hinglish: "Symptoms" },
        { en: "Symptoms:", hi: "लक्षण:", hinglish: "Symptoms:" },
        { en: "Severity", hi: "तीव्रता", hinglish: "Severity" },
        { en: "Severity:", hi: "तीव्रता:", hinglish: "Severity:" },
        { en: "Doctor:", hi: "डॉक्टर:", hinglish: "Doctor:" },
        { en: "Clinic/Hospital:", hi: "क्लिनिक/अस्पताल:", hinglish: "Clinic/Hospital:" },
        { en: "Diagnosis:", hi: "बीमारी:", hinglish: "Diagnosis:" },
        { en: "Year/Date:", hi: "साल/तारीख:", hinglish: "Year/Date:" },
        { en: "Medicines:", hi: "दवाइयां:", hinglish: "Medicines:" },
        { en: "Advice/Tests:", hi: "सलाह/जांच:", hinglish: "Advice/Tests:" },
        { en: "Formulation:", hi: "औषधि:", hinglish: "Formulation:" },
        { en: "Dosage:", hi: "मात्रा:", hinglish: "Dosage:" },
        { en: "Frequency:", hi: "आवृत्ति:", hinglish: "Frequency:" },
        { en: "Instructions:", hi: "निर्देश:", hinglish: "Instructions:" },
        { en: "No self-reported diseases on file.", hi: "अभी कोई बीमारी दर्ज नहीं है।", hinglish: "Abhi koi bimari recorded nahi hai." },
        { en: "No previous doctor consultations recorded.", hi: "अभी कोई पुराना रिकॉर्ड दर्ज नहीं है।", hinglish: "Abhi koi purana record nahi hai." },
        { en: "No prescriptions issued yet.", hi: "डॉक्टर द्वारा कोई दवा अभी जांची नहीं गई है।", hinglish: "Doctor dwara koi dawai abhi verify nahi hui hai." },
        { en: "Value:", hi: "मान:", hinglish: "Value:" },
        { en: "Doctor Review Needed", hi: "डॉक्टर समीक्षा ज़रूरी", hinglish: "Doctor Review Zaruri" },
        { en: "Doctor Review", hi: "डॉक्टर समीक्षा", hinglish: "Doctor Review" },
        { en: "Normal / Safe", hi: "सामान्य / सुरक्षित", hinglish: "Normal / Safe" },
        { en: "Normal", hi: "सामान्य", hinglish: "Normal" },
        { en: "High / Alert", hi: "अधिक / चेतावनी", hinglish: "High / Alert" },

        // Prescriptions & Emergency
        { en: "Doctor Verified Prescriptions", hi: "डॉक्टर द्वारा जांची गई दवाइयां", hinglish: "Doctor ki Verified Dawaiyan" },
        { en: "Verified by Dr. Sharma", hi: "डॉ. शर्मा द्वारा सत्यापित", hinglish: "Dr. Sharma dwara Verified" },
        { en: "Emergency Help (Call 108)", hi: "आपातकालीन मदद (108 कॉल करें)", hinglish: "Emergency Help (108 Call Karein)" },
        { en: "Call 108 Emergency", hi: "108 पर कॉल करें", hinglish: "108 Call Karein" },
        { en: "108 Call Karein", hi: "108 पर कॉल करें", hinglish: "108 Call Karein" },

        // Dashboard & Queue
        { en: "AYUSH DIGITAL HEALTHCARE", hi: "आयुष डिजिटल स्वास्थ्य सेवा", hinglish: "AYUSH Digital Healthcare" },
        { en: "Manage Patient Cases Smarter with AI", hi: "AI के साथ मरीज़ केस प्रबंधन को बनाएं सुगम व स्मार्ट", hinglish: "AI ke saath Manage Patient Cases Smarter" },
        { en: "Overview", hi: "विवरण", hinglish: "Overview" },
        { en: "Total Patients", hi: "कुल मरीज़", hinglish: "Total Patients" },
        { en: "Cases Today", hi: "आज के केस", hinglish: "Aaj ke Cases" },
        { en: "Pending Review", hi: "समीक्षा लंबित", hinglish: "Pending Review" },
        { en: "Active Treatments", hi: "सक्रिय उपचार", hinglish: "Active Treatments" },
        { en: "Urgent Attention Queue", hi: "तत्काल ध्यान कतार", hinglish: "Urgent Attention Queue" },
        { en: "Recent Patient Cases", hi: "हाल के मरीज़ केस", hinglish: "Recent Patient Cases" },
        { en: "View All Patients", hi: "सभी मरीज़ देखें", hinglish: "View All Patients" },
        { en: "Patient Name", hi: "मरीज़ का नाम", hinglish: "Patient Name" },
        { en: "Ayush System", hi: "आयुष चिकित्सा पद्धति", hinglish: "Ayush System" },
        { en: "Chief Complaint", hi: "मुख्य समस्या / लक्षण", hinglish: "Chief Complaint" },
        { en: "Status", hi: "स्थिति", hinglish: "Status" },
        { en: "Action", hi: "कार्रवाई", hinglish: "Action" },
        { en: "Review", hi: "समीक्षा करें", hinglish: "Review" },
        { en: "Pending review", hi: "समीक्षा लंबित", hinglish: "Pending review" },
        { en: "Review Now", hi: "अभी समीक्षा करें", hinglish: "Review Now" },
        { en: "Trigger:", hi: "कारण:", hinglish: "Trigger:" },
        { en: "Completed Cases", hi: "पूर्ण हुए केस", hinglish: "Completed Cases" },
        { en: "Urgent Red Flags", hi: "अति-गंभीर लक्षण", hinglish: "Urgent Red Flags" },
        { en: "Needs Attention", hi: "ध्यान देने योग्य", hinglish: "Needs Attention" },
        { en: "Follow-ups Due", hi: "नियत फॉलो-अप", hinglish: "Follow-ups Due" },
        { en: "System Accuracy", hi: "सिस्टम सटीकता", hinglish: "System Accuracy" },

        // Patient Table & Dossier
        { en: "Patient Management", hi: "मरीज़ प्रबंधन", hinglish: "Patient Management" },
        { en: "All Patients", hi: "सभी मरीज़", hinglish: "All Patients" },
        { en: "Search by patient name or ID...", hi: "मरीज़ के नाम या ID से खोजें...", hinglish: "Patient ke naam ya ID se search karein..." },
        { en: "View Dossier", hi: "दस्तावेज़ देखें", hinglish: "Dossier Dekhein" },
        { en: "Active", hi: "सक्रिय", hinglish: "Active" },
        { en: "Follow-up", hi: "फॉलो-अप", hinglish: "Follow-up" },
        { en: "New", hi: "नया", hinglish: "New" },
        { en: "No patients match your search criteria.", hi: "आपकी खोज के अनुसार कोई मरीज़ नहीं मिला।", hinglish: "Aapke search ke mutabik koi patient nahi mila." },
        { en: "Offline Mode Active", hi: "ऑफ़लाइन मोड सक्रिय", hinglish: "Offline Mode Active" },

        // Patient Login (patient-login.html)
        { en: "Patient Health Portal Login", hi: "मरीज़ स्वास्थ्य पोर्टल लॉगिन", hinglish: "Patient Health Portal Login" },
        { en: "Keep your diseases, symptoms & past prescriptions safe", hi: "अपनी बीमारी, लक्षण व पुराने डॉक्टर के पर्चे सुरक्षित रखें", hinglish: "Apni bimari, symptoms aur purane parchayein safe rakhein" },
        { en: "Patient Login", hi: "मरीज़ लॉगिन", hinglish: "Patient Login" },
        { en: "New Account", hi: "नया खाता बनाएं", hinglish: "Naya Account Banaayein" },
        { en: "Patient Login (Login)", hi: "मरीज़ लॉगिन (Login)", hinglish: "Patient Login (Login)" },
        { en: "Register New Account", hi: "नया खाता बनाएं (Register)", hinglish: "Naya Account (Register)" },
        { en: "Patient ID or Mobile Number", hi: "Patient ID या मोबाइल नंबर", hinglish: "Patient ID ya Mobile Number" },
        { en: "Password", hi: "पासवर्ड", hinglish: "Password" },
        { en: "Password (Password)", hi: "पासवर्ड (Password)", hinglish: "Password (Password)" },
        { en: "Enter Portal", hi: "पोर्टल में प्रवेश करें", hinglish: "Portal me Enter Karein" },
        { en: "Enter Portal (Enter Portal)", hi: "पोर्टल में प्रवेश करें (Enter Portal)", hinglish: "Portal me Enter Karein" },
        { en: "Default Demo Password:", hi: "डिफ़ॉल्ट डेमो पासवर्ड:", hinglish: "Default Demo Password:" },
        { en: "Are you a doctor or clinic?", hi: "क्या आप डॉक्टर या क्लिनिक हैं?", hinglish: "Kya aap doctor ya clinic hain?" },
        { en: "Open Doctor Portal", hi: "डॉक्टर पोर्टल खोलें", hinglish: "Doctor Portal Kholein" },
        { en: "Home", hi: "होम", hinglish: "Home" },
        { en: "Home (Home)", hi: "होम (Home)", hinglish: "Home (Home)" },

        // Common Buttons & Actions
        { en: "Save", hi: "सुरक्षित करें", hinglish: "Save" },
        { en: "Cancel", hi: "रद्द करें", hinglish: "Cancel" },
        { en: "Submit", hi: "जमा करें", hinglish: "Submit" },
        { en: "Back", hi: "वापस जाएं", hinglish: "Back" },
        { en: "Edit", hi: "संपादित करें", hinglish: "Edit" },
        { en: "Delete", hi: "हटाएं", hinglish: "Delete" },
        { en: "Close", hi: "बंद करें", hinglish: "Close" }
    ];

    // Build indexing maps for ultra-fast bidirectional lookup
    const lookupMap = new Map();

    function normalizeKey(str) {
        if (!str) return "";
        return str
            .replace(/[\u200B-\u200D\uFEFF]/g, "") // strip zero-width chars
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }

    function stripParentheses(str) {
        if (!str) return "";
        return str.replace(/\s*\([\s\S]*?\)/g, "").trim();
    }

    function buildIndex() {
        lookupMap.clear();
        PHRASE_BOOK.forEach(item => {
            ["en", "hi", "hinglish", "mr", "bn", "ta", "te"].forEach(lang => {
                const val = item[lang];
                if (!val) return;

                const norm = normalizeKey(val);
                if (norm) lookupMap.set(norm, item);

                const stripped = stripParentheses(val);
                if (stripped && stripped !== val) {
                    const strippedNorm = normalizeKey(stripped);
                    if (strippedNorm && !lookupMap.has(strippedNorm)) {
                        lookupMap.set(strippedNorm, item);
                    }
                }
            });
        });
    }

    buildIndex();

    let isTranslating = false;
    let observer = null;

    function init() {
        renderLanguageSwitcher();
        applyTranslations(currentLang);
        initMutationObserver();
    }

    function setLanguage(lang) {
        const supported = ["en", "hi", "hinglish", "mr", "bn", "ta", "te"];
        if (!supported.includes(lang) && !DICTIONARY[lang]) lang = "en";
        currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        
        // Disconnect observer briefly to prevent loops during translation
        if (observer) observer.disconnect();
        
        // Clear cached original texts when switching back to English or another language so full translation re-evaluates
        clearNodeCache(document.body);

        applyTranslations(lang);
        updateSwitcherUI();
        
        initMutationObserver();
        window.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang } }));
    }

    function clearNodeCache(node) {
        if (!node) return;
        if (node.__origText !== undefined) delete node.__origText;
        if (node.__origPlaceholder !== undefined) delete node.__origPlaceholder;
        if (node.__origTitle !== undefined) delete node.__origTitle;
        for (let child = node.firstChild; child; child = child.nextSibling) {
            clearNodeCache(child);
        }
    }

    function getLanguage() {
        return currentLang;
    }

    function t(key) {
        const dict = DICTIONARY[currentLang] || DICTIONARY.en;
        return dict[key] || DICTIONARY.en[key] || key;
    }

    // Smart sentence & phrase translation
    function translateText(text, targetLang) {
        if (!text || typeof text !== "string") return text;
        const trimmed = text.trim();
        if (!trimmed || trimmed.length <= 1) return text;

        // Preserve leading and trailing whitespace
        const leadMatch = text.match(/^\s*/);
        const trailMatch = text.match(/\s*$/);
        const lead = leadMatch ? leadMatch[0] : "";
        const trail = trailMatch ? trailMatch[0] : "";

        // 1. Direct normalized lookup
        const norm = normalizeKey(trimmed);
        let match = lookupMap.get(norm);
        if (match) {
            const translated = match[targetLang] || match.hi || match.en;
            return lead + translated + trail;
        }

        // 2. Trailing punctuation check (e.g. "Doctor:", "Chief Complaint:", "Age:")
        const punctMatch = trimmed.match(/^([\s\S]+?)([:\-\.\!\?\*]+)$/);
        if (punctMatch) {
            const baseText = punctMatch[1].trim();
            const trailingPunct = punctMatch[2];
            const baseNorm = normalizeKey(baseText);
            const baseMatch = lookupMap.get(baseNorm);
            if (baseMatch) {
                const translated = baseMatch[targetLang] || baseMatch.hi || baseMatch.en;
                return lead + translated + trailingPunct + trail;
            }
        }

        // 3. Parenthetical bilingual text extraction (e.g. "बीमारी का नाम / मुख्य समस्या *" or "हल्का (Mild)")
        if (trimmed.includes("/") || trimmed.includes("(")) {
            const parts = trimmed.split(/[\/\(\)]+/).map(p => p.trim()).filter(Boolean);
            for (let part of parts) {
                const pNorm = normalizeKey(part);
                const pMatch = lookupMap.get(pNorm);
                if (pMatch) {
                    const translated = pMatch[targetLang] || pMatch.en;
                    if (translated) return lead + translated + trail;
                }
            }
        }

        return text;
    }

    function walkAndTranslate(node, targetLang) {
        if (!node) return;

        // Skip untranslatable tags
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toUpperCase();
            if (tag === "SCRIPT" || tag === "STYLE" || tag === "CODE" || tag === "PRE" || tag === "NOSCRIPT" || node.classList.contains("notranslate")) {
                return;
            }

            // Translate placeholders on inputs and textareas
            if (tag === "INPUT" || tag === "TEXTAREA") {
                if (node.hasAttribute("data-i18n")) {
                    const key = node.getAttribute("data-i18n");
                    const dict = DICTIONARY[targetLang] || DICTIONARY.en;
                    if (dict[key]) {
                        node.placeholder = dict[key];
                    }
                } else if (node.placeholder) {
                    if (!node.__origPlaceholder) node.__origPlaceholder = node.placeholder;
                    const translated = translateText(node.__origPlaceholder, targetLang);
                    if (translated) node.placeholder = translated;
                }
            }

            // Translate options inside select (skip language options)
            if (tag === "OPTION") {
                if (!node.classList.contains("lang-option") && !node.closest(".global-lang-select")) {
                    if (!node.__origText) node.__origText = node.textContent;
                    const translated = translateText(node.__origText, targetLang);
                    if (translated && translated !== node.textContent) {
                        node.textContent = translated;
                    }
                }
                return;
            }

            // Translate title and aria-label attributes
            if (node.title && !node.classList.contains("global-lang-select")) {
                if (!node.__origTitle) node.__origTitle = node.title;
                const translatedTitle = translateText(node.__origTitle, targetLang);
                if (translatedTitle) node.title = translatedTitle;
            }
        }

        // Text nodes
        if (node.nodeType === Node.TEXT_NODE) {
            const raw = node.textContent;
            const trimmed = raw.trim();
            if (trimmed && trimmed.length > 0) {
                // If parent has data-i18n, let data-i18n handler manage it
                if (node.parentElement && node.parentElement.hasAttribute("data-i18n")) {
                    return;
                }
                if (node.__origText === undefined) {
                    node.__origText = raw;
                }
                const translated = translateText(node.__origText, targetLang);
                if (translated && translated !== raw) {
                    node.textContent = translated;
                } else if (targetLang === "en" && node.textContent !== node.__origText) {
                    node.textContent = node.__origText;
                }
            }
        } else {
            for (let child = node.firstChild; child; child = child.nextSibling) {
                walkAndTranslate(child, targetLang);
            }
        }
    }

    function applyTranslations(lang) {
        if (isTranslating) return;
        isTranslating = true;

        try {
            const dict = DICTIONARY[lang] || DICTIONARY.en;

            // 1. Apply data-i18n attributes safely without destroying child icons
            document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.getAttribute("data-i18n");
                const val = dict[key];
                if (!val) return;

                if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                    el.placeholder = val;
                } else {
                    // Check if element has child elements like icons (<i>, <svg>)
                    if (el.children.length === 0) {
                        el.textContent = val;
                    } else {
                        // Find the first text node child and update only that
                        let textNodeFound = false;
                        for (let i = 0; i < el.childNodes.length; i++) {
                            const child = el.childNodes[i];
                            if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
                                child.textContent = " " + val;
                                textNodeFound = true;
                                break;
                            }
                        }
                        if (!textNodeFound) {
                            // If no text node was present, append or set
                            const span = el.querySelector("span") || el;
                            span.textContent = val;
                        }
                    }
                }
            });

            // 2. Walk the entire DOM tree and translate all text nodes & attributes
            if (document.body) {
                walkAndTranslate(document.body, lang);
            }
        } finally {
            isTranslating = false;
        }
    }

    function initMutationObserver() {
        if (observer) observer.disconnect();
        if (!window.MutationObserver || !document.body) return;

        let debounceTimer = null;
        observer = new MutationObserver((mutations) => {
            if (isTranslating) return;
            let shouldTranslate = false;
            for (const m of mutations) {
                if (m.type === "childList" && m.addedNodes.length > 0) {
                    for (let i = 0; i < m.addedNodes.length; i++) {
                        const added = m.addedNodes[i];
                        if (added.nodeType === Node.ELEMENT_NODE && !added.classList.contains("notranslate")) {
                            shouldTranslate = true;
                            break;
                        }
                    }
                }
                if (shouldTranslate) break;
            }
            if (shouldTranslate) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    applyTranslations(currentLang);
                }, 80);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function renderLanguageSwitcher() {
        let switcherContainers = document.querySelectorAll("#globalLanguageSwitcherContainer, .lang-switcher-wrapper");
        
        if (switcherContainers.length === 0) {
            const topbarRight = document.querySelector(".topbar-right, .landing-nav div:last-child");
            if (topbarRight) {
                const wrapper = document.createElement("div");
                wrapper.id = "globalLanguageSwitcherContainer";
                wrapper.className = "lang-switcher-wrapper notranslate";
                topbarRight.prepend(wrapper);
                switcherContainers = [wrapper];
            }
        }

        switcherContainers.forEach(container => {
            container.classList.add("notranslate");
            container.innerHTML = `
                <i class="fa-solid fa-language" style="color: #1f7a57; font-size: 16px; margin-right: 4px;"></i>
                <select class="lang-dropdown global-lang-select notranslate" title="Change Language / भाषा बदलें" style="padding: 6px 12px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-size: 13px; font-weight: 700; background: #ffffff; color: #1e293b; cursor: pointer; outline: none;">
                    <option class="lang-option notranslate" value="hi" ${currentLang === 'hi' ? 'selected' : ''}>🇮🇳 हिंदी (Hindi)</option>
                    <option class="lang-option notranslate" value="hinglish" ${currentLang === 'hinglish' ? 'selected' : ''}>🗣️ Hinglish</option>
                    <option class="lang-option notranslate" value="en" ${currentLang === 'en' ? 'selected' : ''}>🇬🇧 English</option>
                    <option class="lang-option notranslate" value="mr" ${currentLang === 'mr' ? 'selected' : ''}>🇮🇳 मराठी (Marathi)</option>
                    <option class="lang-option notranslate" value="bn" ${currentLang === 'bn' ? 'selected' : ''}>🇮🇳 বাংলা (Bengali)</option>
                    <option class="lang-option notranslate" value="ta" ${currentLang === 'ta' ? 'selected' : ''}>🇮🇳 தமிழ் (Tamil)</option>
                    <option class="lang-option notranslate" value="te" ${currentLang === 'te' ? 'selected' : ''}>🇮🇳 తెలుగు (Telugu)</option>
                </select>
            `;
        });

        document.querySelectorAll(".global-lang-select, #globalLanguageSelect").forEach(selectEl => {
            selectEl.value = currentLang;
            selectEl.removeEventListener("change", handleSwitcherChange);
            selectEl.addEventListener("change", handleSwitcherChange);
        });
    }

    function handleSwitcherChange(e) {
        setLanguage(e.target.value);
    }

    function updateSwitcherUI() {
        document.querySelectorAll(".global-lang-select, #globalLanguageSelect").forEach(selectEl => {
            selectEl.value = currentLang;
        });
    }

    function playAudioGuide(customKey) {
        const key = customKey || "audioGuidePrompt";
        const text = t(key);
        const speechLang = currentLang === "hi" ? "hi-IN" : "en-IN";
        if (typeof SpeechService !== "undefined") {
            SpeechService.speakText(text, { lang: speechLang, rate: 0.85 });
        } else if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = speechLang;
            u.rate = 0.85;
            window.speechSynthesis.speak(u);
        }
    }

    // Expose translatePage to manually trigger translation on dynamic updates
    function translatePage() {
        applyTranslations(currentLang);
    }

    return {
        init,
        setLanguage,
        getLanguage,
        t,
        translateText,
        translatePage,
        playAudioGuide,
        DICTIONARY,
        PHRASE_BOOK
    };
})();

if (typeof window !== "undefined") window.I18nService = I18nService;
if (typeof globalThis !== "undefined") globalThis.I18nService = I18nService;

// Automatically initialize when DOM is ready
if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            I18nService.init();
        });
    } else {
        I18nService.init();
    }
}
