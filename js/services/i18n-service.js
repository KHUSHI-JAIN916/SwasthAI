/* ==========================================================================
   SWASTHAI — Universal Localization (i18n) & Full-Page Translation Service
   Complete, instantaneous bidirectional DOM translation across English,
   Hindi, and Hinglish. Covers all portals, forms, tables, modals, sidebars,
   clinical terminology, and dynamic elements.
   ========================================================================== */

const I18nService = (() => {
    const STORAGE_KEY = "swasthai_selected_lang";
    // Keep user's chosen language, or default to English
    let currentLang = localStorage.getItem(STORAGE_KEY) || "en";

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
            doctorPortalLoginTitle: "Doctor & Hospital Portal Login",
            doctorPortalLoginSub: "Access Clinical AI review, Red-Flag alerts & patient history",
            selectHospitalLabel: "Hospital / Clinic Name",
            enterPatientPortal: "Open Patient Portal",
            enterDoctorPortal: "Open Doctor & Hospital Portal",
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
            navConsultationNotes: "AI Consultation Notes",
            navProfile: "My Profile",
            navLogout: "Logout",
            // Consultation Notes & Scribe
            consultationNotesTitle: "AI Consultation Notes",
            consultationNotesSubtitle: "Listen, transcribe and generate patient notes automatically",
            scribePageTitle: "AI Consultation Notes & Medical Scribe",
            patientLabel: "Patient:",
            selectPatientOption: "-- Select Registered Patient --",
            privacyNotice: "Patient conversation is processed only with the doctor's permission. Please follow applicable privacy and consent requirements before recording a consultation.",
            consentCheckboxText: "I confirm that appropriate patient consent has been obtained for recording/transcription.",
            liveScribeTitle: "Live Medical Scribe",
            clickStartHint: "Click Start to begin consultation",
            startConsultationBtn: "Start Consultation",
            pauseConsultationBtn: "Pause",
            resumeConsultationBtn: "Resume",
            stopConsultationBtn: "Stop Consultation",
            speakingTurnLabel: "Speaking Turn:",
            speakerDoctor: "👨‍⚕️ Doctor",
            speakerPatient: "👤 Patient",
            manualTurnPlaceholder: "Type or correct conversation turn...",
            addTurnBtn: "Add",
            generateNotesBtn: "Generate AI Notes",
            generateAiSub: "Transcribes dialogue & extracts symptoms, vitals, history, assessment and plan.",
            structuredNotesTitle: "Structured Consultation Notes",
            aiDraftBadge: "AI-generated draft — doctor review required.",
            sectionComplaint: "1. Patient Complaint",
            labelMainComplaint: "Main Complaint",
            labelDuration: "Duration",
            labelSeverity: "Severity",
            sectionSymptoms: "2. Symptoms",
            labelPresentSymptoms: "Present Symptoms",
            labelNegativeSymptoms: "Negative Symptoms (Explicitly Denied)",
            sectionHistory: "3. Medical History",
            labelConditions: "Previous Conditions",
            labelSurgeries: "Previous Surgeries",
            labelAllergies: "Allergies",
            labelMedications: "Current Medications",
            sectionVitals: "4. Vitals (Only if mentioned)",
            labelBp: "Blood Pressure",
            labelHr: "Heart Rate",
            labelTemp: "Temperature",
            labelSpo2: "SpO2",
            labelWeight: "Weight",
            sectionAssessment: "5. Assessment",
            labelAssessment: "Clinical Assessment (Doctor summary from conversation)",
            sectionPlan: "6. Plan",
            labelPlanMedicines: "Medicines Mentioned",
            labelPlanTests: "Tests Recommended",
            labelPlanLifestyle: "Lifestyle / Diet Advice",
            labelPlanFollowUp: "Follow-up Instructions",
            sectionDoctorNotes: "7. Doctor Notes & Observations",
            labelDoctorNotes: "Additional Observations",
            saveConsultationBtn: "Save Consultation",
            regenerateNotesBtn: "Regenerate Notes",
            clearNotesBtn: "Clear",
            printExportBtn: "Print / Export",
            consultationHistoryTitle: "Consultation History",
            consultationHistorySub: "Archived AI Medical Scribe consultations and doctor-verified notes.",
            colPatientName: "Patient Name",
            colPatientId: "Patient ID",
            colDateTime: "Date & Time",
            colComplaintSummary: "Complaint Summary",
            colStatus: "Status",
            colAction: "Action",
            viewNotesBtn: "View Notes",
            statusReady: "Ready",
            statusRecording: "Recording",
            statusPaused: "Paused"
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
            navConsultationNotes: "एआई परामर्श नोट्स",
            navProfile: "मेरी प्रोफाइल",
            navLogout: "लॉगआउट",
            // Consultation Notes & Scribe
            consultationNotesTitle: "एआई परामर्श नोट्स",
            consultationNotesSubtitle: "बातचीत सुनें, ट्रांसक्राइब करें और स्वचालित रूप से मरीज़ नोट्स बनाएं",
            scribePageTitle: "एआई परामर्श नोट्स एवं मेडिकल स्क्राइब",
            patientLabel: "मरीज़:",
            selectPatientOption: "-- पंजीकृत मरीज़ चुनें --",
            privacyNotice: "मरीज़ की बातचीत केवल डॉक्टर की सहमति से ही प्रोसेस की जाती है। रिकॉर्डिंग से पूर्व कृपया लागू गोपनीयता एवं सहमति नियमों का पालन करें।",
            consentCheckboxText: "मैं पुष्टि करता/करती हूँ कि रिकॉर्डिंग/ट्रांसक्रिप्शन के लिए मरीज़ से उचित सहमति प्राप्त कर ली गई है।",
            liveScribeTitle: "लाइव मेडिकल स्क्राइब",
            clickStartHint: "परामर्श शुरू करने के लिए 'परामर्श शुरू करें' पर क्लिक करें",
            startConsultationBtn: "परामर्श शुरू करें",
            pauseConsultationBtn: "रोकें",
            resumeConsultationBtn: "फिर से शुरू करें",
            stopConsultationBtn: "परामर्श समाप्त करें",
            speakingTurnLabel: "बोलने की बारी:",
            speakerDoctor: "👨‍⚕️ डॉक्टर",
            speakerPatient: "👤 मरीज़",
            manualTurnPlaceholder: "संवाद यहाँ टाइप करें या सुधारें...",
            addTurnBtn: "जोड़ें",
            generateNotesBtn: "एआई नोट्स बनाएं",
            generateAiSub: "बातचीत का विश्लेषण कर मुख्य लक्षण, वाइटल्स, इतिहास और उपचार योजना निकालता है।",
            structuredNotesTitle: "संरचित परामर्श नोट्स",
            aiDraftBadge: "एआई-जनित प्रारूप — डॉक्टर समीक्षा आवश्यक",
            sectionComplaint: "1. मरीज़ की मुख्य समस्या",
            labelMainComplaint: "मुख्य तकलीफ",
            labelDuration: "अवधि / समय",
            labelSeverity: "तीव्रता (Severity)",
            sectionSymptoms: "2. लक्षण (Symptoms)",
            labelPresentSymptoms: "मौजूदा लक्षण",
            labelNegativeSymptoms: "नकारे गए लक्षण (Explicitly Denied)",
            sectionHistory: "3. पुराना चिकित्सीय इतिहास",
            labelConditions: "पुरानी बीमारियाँ",
            labelSurgeries: "पूर्व ऑपरेशन / सर्जरी",
            labelAllergies: "दवा या अन्य एलर्जी",
            labelMedications: "वर्तमान दवाइयाँ",
            sectionVitals: "4. वाइटल्स (शारीरिक माप - केवल यदि उल्लिखित हों)",
            labelBp: "रक्तचाप (Blood Pressure)",
            labelHr: "हृदय गति (Heart Rate)",
            labelTemp: "तापमान (Temperature)",
            labelSpo2: "ऑक्सीजन स्तर (SpO2)",
            labelWeight: "वजन (Weight)",
            sectionAssessment: "5. डॉक्टर का नैदानिक आकलन (Assessment)",
            labelAssessment: "क्लिनिकल मूल्यांकन (बातचीत से डॉक्टर का निष्कर्ष)",
            sectionPlan: "6. उपचार एवं परामर्श योजना (Plan)",
            labelPlanMedicines: "सुझाई गई दवाइयाँ",
            labelPlanTests: "आवश्यक जाँच / टेस्ट",
            labelPlanLifestyle: "खान-पान एवं जीवनशैली सलाह",
            labelPlanFollowUp: "पुनः परामर्श / फॉलो-अप निर्देश",
            sectionDoctorNotes: "7. डॉक्टर की अतिरिक्त टिप्पणियाँ",
            labelDoctorNotes: "अतिरिक्त क्लिनिकल प्रेक्षण",
            saveConsultationBtn: "परामर्श सुरक्षित करें",
            regenerateNotesBtn: "नोट्स पुनः बनाएं",
            clearNotesBtn: "साफ़ करें",
            printExportBtn: "प्रिंट / एक्सपोर्ट",
            consultationHistoryTitle: "परामर्श इतिहास",
            consultationHistorySub: "सुरक्षित किए गए एआई मेडिकल स्क्राइब परामर्श एवं डॉक्टर-सत्यापित नोट्स।",
            colPatientName: "मरीज़ का नाम",
            colPatientId: "मरीज़ आईडी",
            colDateTime: "तारीख व समय",
            colComplaintSummary: "समस्या का सारांश",
            colStatus: "स्थिति",
            colAction: "कार्रवाई",
            viewNotesBtn: "नोट्स देखें",
            statusReady: "तैयार",
            statusRecording: "रिकॉर्डिंग चालू",
            statusPaused: "रुका हुआ"
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
            navConsultationNotes: "AI Consultation Notes",
            navProfile: "My Profile",
            navLogout: "Logout",
            consultationNotesTitle: "AI Consultation Notes",
            consultationNotesSubtitle: "Baat sunein, transcribe karein aur patient notes automatically generate karein",
            startConsultationBtn: "Consultation Shuru Karein",
            pauseConsultationBtn: "Pause",
            resumeConsultationBtn: "Resume",
            stopConsultationBtn: "Consultation Stop Karein",
            generateNotesBtn: "AI Notes Generate Karein",
            saveConsultationBtn: "Consultation Save Karein",
            consultationHistoryTitle: "Consultation History",
            aiDraftBadge: "AI-generated draft — doctor review zaruri hai."
        }
    };

    // 2. Comprehensive Bidirectional Phrase Book for Universal Full-Page DOM Translation
    const PHRASE_BOOK = [
    {
        "en": "SWASTHAI",
        "hi": "स्वास्थ AI",
        "hinglish": "SWASTH AI"
    },
    {
        "en": "From Patient's Voice to Doctor's Insight",
        "hi": "मरीज़ की आवाज़ से डॉक्टर के परामर्श तक",
        "hinglish": "Patient ki Voice se Doctor ke Insight tak"
    },
    {
        "en": "From Voice to Insight",
        "hi": "आवाज़ से परामर्श तक",
        "hinglish": "Voice se Insight tak"
    },
    {
        "en": "MAIN MENU",
        "hi": "मुख्य मेन्यू",
        "hinglish": "MAIN MENU"
    },
    {
        "en": "Language",
        "hi": "भाषा",
        "hinglish": "Language"
    },
    {
        "en": "Select Language",
        "hi": "भाषा चुनें",
        "hinglish": "Language Chunein"
    },
    {
        "en": "Audio Help",
        "hi": "आवाज़ में सुनें",
        "hinglish": "Audio Help"
    },
    {
        "en": "🔊 Listen in Audio",
        "hi": "🔊 आवाज़ में सुनें",
        "hinglish": "🔊 Audio me Sunein"
    },
    {
        "en": "🔊 Audio me Sunein",
        "hi": "🔊 आवाज़ में सुनें",
        "hinglish": "🔊 Audio me Sunein"
    },
    {
        "en": "बोलकर सुनें",
        "hi": "बोलकर सुनें",
        "hinglish": "Bolkar Sunein"
    },
    {
        "en": "Patient Portal",
        "hi": "मरीज़ स्वास्थ्य पोर्टल",
        "hinglish": "Patient Portal"
    },
    {
        "en": "Dashboard",
        "hi": "डैशबोर्ड",
        "hinglish": "Dashboard"
    },
    {
        "en": "Patients",
        "hi": "मरीज़ सूची",
        "hinglish": "Patients"
    },
    {
        "en": "Patients List",
        "hi": "मरीज़ सूची",
        "hinglish": "Patients List"
    },
    {
        "en": "Add Patient",
        "hi": "नया मरीज़ जोड़ें",
        "hinglish": "Add Patient"
    },
    {
        "en": "New Case",
        "hi": "नया केस",
        "hinglish": "New Case"
    },
    {
        "en": "Review Workspace",
        "hi": "समीक्षा कार्यक्षेत्र",
        "hinglish": "Review Workspace"
    },
    {
        "en": "Case History",
        "hi": "केस इतिहास",
        "hinglish": "Case History"
    },
    {
        "en": "Analytics",
        "hi": "एनालिटिक्स",
        "hinglish": "Analytics"
    },
    {
        "en": "AI Assistant",
        "hi": "AI सहायक",
        "hinglish": "AI Assistant"
    },
    {
        "en": "Voice Case Taking",
        "hi": "वॉइस केस-टेकिंग",
        "hinglish": "Voice Case Taking"
    },
    {
        "en": "AI Consultation Notes",
        "hi": "एआई परामर्श नोट्स",
        "hinglish": "AI Consultation Notes"
    },
    {
        "en": "AI Medical Scribe",
        "hi": "एआई मेडिकल स्क्राइब",
        "hinglish": "AI Medical Scribe"
    },
    {
        "en": "Listen, transcribe and generate patient notes automatically",
        "hi": "बातचीत सुनें, ट्रांसक्राइब करें और स्वचालित रूप से मरीज़ नोट्स बनाएं",
        "hinglish": "Baat sunein, transcribe karein aur patient notes automatically generate karein"
    },
    {
        "en": "Start Consultation",
        "hi": "परामर्श शुरू करें",
        "hinglish": "Consultation Shuru Karein"
    },
    {
        "en": "Pause Consultation",
        "hi": "रोकें",
        "hinglish": "Pause"
    },
    {
        "en": "Resume Consultation",
        "hi": "फिर से शुरू करें",
        "hinglish": "Resume"
    },
    {
        "en": "Stop Consultation",
        "hi": "परामर्श समाप्त करें",
        "hinglish": "Consultation Stop Karein"
    },
    {
        "en": "Generate AI Notes",
        "hi": "एआई नोट्स बनाएं",
        "hinglish": "AI Notes Generate Karein"
    },
    {
        "en": "Save Consultation",
        "hi": "परामर्श सुरक्षित करें",
        "hinglish": "Consultation Save Karein"
    },
    {
        "en": "Regenerate Notes",
        "hi": "नोट्स पुनः बनाएं",
        "hinglish": "Notes Regenerate Karein"
    },
    {
        "en": "Consultation History",
        "hi": "परामर्श इतिहास",
        "hinglish": "Consultation History"
    },
    {
        "en": "Patient Complaint",
        "hi": "मरीज़ की शिकायत",
        "hinglish": "Patient Complaint"
    },
    {
        "en": "Medical History",
        "hi": "चिकित्सीय इतिहास",
        "hinglish": "Medical History"
    },
    {
        "en": "Doctor Notes",
        "hi": "डॉक्टर नोट्स",
        "hinglish": "Doctor Notes"
    },
    {
        "en": "AI-generated draft — doctor review required.",
        "hi": "एआई-जनित प्रारूप — डॉक्टर समीक्षा आवश्यक।",
        "hinglish": "AI-generated draft — doctor review zaruri hai."
    },
    {
        "en": "Patient conversation is processed only with the doctor's permission. Please follow applicable privacy and consent requirements before recording a consultation.",
        "hi": "मरीज़ की बातचीत केवल डॉक्टर की अनुमति से प्रोसेस की जाती है। परामर्श रिकॉर्ड करने से पहले आवश्यक गोपनीयता व सहमति नियमों का पालन करें।",
        "hinglish": "Patient conversation doctor ki permission se process hoti hai. Recording se pehle patient consent lena anivarya hai."
    },
    {
        "en": "I confirm that appropriate patient consent has been obtained for recording/transcription.",
        "hi": "मैं पुष्टि करता/करती हूँ कि रिकॉर्डिंग/ट्रांसक्रिप्शन के लिए मरीज़ से उचित सहमति प्राप्त कर ली गई है।",
        "hinglish": "Main confirm karta hoon ki recording ke liye patient consent le liya gaya hai."
    },
    {
        "en": "View Notes",
        "hi": "नोट्स देखें",
        "hinglish": "View Notes"
    },
    {
        "en": "Settings",
        "hi": "सेटिंग्स",
        "hinglish": "Settings"
    },
    {
        "en": "Logout",
        "hi": "लॉगआउट",
        "hinglish": "Logout"
    },
    {
        "en": "My Profile",
        "hi": "मेरी प्रोफाइल",
        "hinglish": "My Profile"
    },
    {
        "en": "Doctor / Practitioner",
        "hi": "डॉक्टर / चिकित्सक",
        "hinglish": "Doctor / Practitioner"
    },
    {
        "en": "Patient / Caregiver",
        "hi": "मरीज़ / तीमारदार",
        "hinglish": "Patient / Caregiver"
    },
    {
        "en": "Administrator",
        "hi": "प्रशासक",
        "hinglish": "Admin"
    },
    {
        "en": "Good Morning, Doctor 👋",
        "hi": "शुभ प्रभात, डॉक्टर 👋",
        "hinglish": "Good Morning, Doctor 👋"
    },
    {
        "en": "Good Afternoon, Doctor 👋",
        "hi": "शुभ दोपहर, डॉक्टर 👋",
        "hinglish": "Good Afternoon, Doctor 👋"
    },
    {
        "en": "Good Evening, Doctor 👋",
        "hi": "शुभ संध्या, डॉक्टर 👋",
        "hinglish": "Good Evening, Doctor 👋"
    },
    {
        "en": "Good Morning, Doctor",
        "hi": "शुभ प्रभात, डॉक्टर",
        "hinglish": "Good Morning, Doctor"
    },
    {
        "en": "Good Afternoon, Doctor",
        "hi": "शुभ दोपहर, डॉक्टर",
        "hinglish": "Good Afternoon, Doctor"
    },
    {
        "en": "Good Evening, Doctor",
        "hi": "शुभ संध्या, डॉक्टर",
        "hinglish": "Good Evening, Doctor"
    },
    {
        "en": "START DEMO",
        "hi": "डेमो शुरू करें",
        "hinglish": "START DEMO"
    },
    {
        "en": "START DEMO 🎯",
        "hi": "डेमो शुरू करें 🎯",
        "hinglish": "START DEMO 🎯"
    },
    {
        "en": "Start Demo",
        "hi": "डेमो शुरू करें",
        "hinglish": "Start Demo"
    },
    {
        "en": "AIIMS Partner Hospital",
        "hi": "एम्स पार्टनर अस्पताल",
        "hinglish": "AIIMS Partner Hospital"
    },
    {
        "en": "AIIMS & SWASTHAI Partner Hospital",
        "hi": "एम्स व स्वास्थ AI पार्टनर अस्पताल",
        "hinglish": "AIIMS & SWASTHAI Partner Hospital"
    },
    {
        "en": "AIIMS Clinical Center & Hospital",
        "hi": "एम्स क्लिनिकल सेंटर एवं अस्पताल",
        "hinglish": "AIIMS Clinical Center & Hospital"
    },
    {
        "en": "Department of Clinical Medicine & AYUSH Healthcare",
        "hi": "क्लिनिकल मेडिसिन एवं आयुष स्वास्थ्य विभाग",
        "hinglish": "Department of Clinical Medicine & AYUSH Healthcare"
    },
    {
        "en": "Fortis Healthcare & Research Center",
        "hi": "फोर्टिस हेल्थकेयर एवं रिसर्च सेंटर",
        "hinglish": "Fortis Healthcare & Research Center"
    },
    {
        "en": "Apollo AYUSH Specialty Hospital",
        "hi": "अपोलो आयुष स्पेशलिटी अस्पताल",
        "hinglish": "Apollo AYUSH Specialty Hospital"
    },
    {
        "en": "Max Super Specialty Hospital",
        "hi": "मैक्स सुपर स्पेशलिटी अस्पताल",
        "hinglish": "Max Super Specialty Hospital"
    },
    {
        "en": "SWASTHAI Digital Healthcare Clinic",
        "hi": "स्वास्थ AI डिजिटल स्वास्थ्य सेवा क्लिनिक",
        "hinglish": "SWASTHAI Digital Healthcare Clinic"
    },
    {
        "en": "AYUSH DIGITAL HEALTHCARE",
        "hi": "आयुष डिजिटल स्वास्थ्य सेवा",
        "hinglish": "AYUSH Digital Healthcare"
    },
    {
        "en": "🌿 AYUSH DIGITAL HEALTHCARE",
        "hi": "🌿 आयुष डिजिटल स्वास्थ्य सेवा",
        "hinglish": "🌿 AYUSH Digital Healthcare"
    },
    {
        "en": "Elderly Mode (सुगम मोड)",
        "hi": "वरिष्ठ नागरिक मोड (सुगम मोड)",
        "hinglish": "Elderly Mode (Sugam Mode)"
    },
    {
        "en": "👴 Elderly Mode (सुगम मोड)",
        "hi": "👴 वरिष्ठ नागरिक मोड (सुगम मोड)",
        "hinglish": "👴 Elderly Mode (Sugam Mode)"
    },
    {
        "en": "Dashboard / Overview",
        "hi": "डैशबोर्ड / विवरण",
        "hinglish": "Dashboard / Overview"
    },
    {
        "en": "Dashboard / AI Assistant",
        "hi": "डैशबोर्ड / AI सहायक",
        "hinglish": "Dashboard / AI Assistant"
    },
    {
        "en": "Dashboard / Analytics",
        "hi": "डैशबोर्ड / एनालिटिक्स",
        "hinglish": "Dashboard / Analytics"
    },
    {
        "en": "Dashboard / Case History",
        "hi": "डैशबोर्ड / केस इतिहास",
        "hinglish": "Dashboard / Case History"
    },
    {
        "en": "Dashboard / My Profile",
        "hi": "डैशबोर्ड / मेरी प्रोफाइल",
        "hinglish": "Dashboard / My Profile"
    },
    {
        "en": "Dashboard / New Case",
        "hi": "डैशबोर्ड / नया केस",
        "hinglish": "Dashboard / New Case"
    },
    {
        "en": "Dashboard / Patients",
        "hi": "डैशबोर्ड / मरीज़",
        "hinglish": "Dashboard / Patients"
    },
    {
        "en": "Dashboard / Patients / Add Patient",
        "hi": "डैशबोर्ड / मरीज़ / नया मरीज़ जोड़ें",
        "hinglish": "Dashboard / Patients / Add Patient"
    },
    {
        "en": "Dashboard / Voice Case Taking",
        "hi": "डैशबोर्ड / वॉइस केस-टेकिंग",
        "hinglish": "Dashboard / Voice Case Taking"
    },
    {
        "en": "Manage Patient Cases Smarter with AI",
        "hi": "AI के साथ मरीज़ केस प्रबंधन को बनाएं सुगम व स्मार्ट",
        "hinglish": "AI ke saath Patient Cases manage karein"
    },
    {
        "en": "Overview",
        "hi": "विवरण",
        "hinglish": "Overview"
    },
    {
        "en": "Quick insights about your patients and cases.",
        "hi": "मरीज़ों और केसों की महत्वपूर्ण जानकारी।",
        "hinglish": "Patients aur cases ki quick summary."
    },
    {
        "en": "Total Patients",
        "hi": "कुल मरीज़",
        "hinglish": "Total Patients"
    },
    {
        "en": "Cases Today",
        "hi": "आज के केस",
        "hinglish": "Aaj ke Cases"
    },
    {
        "en": "Today's Cases",
        "hi": "आज के केस",
        "hinglish": "Aaj ke Cases"
    },
    {
        "en": "Pending Review",
        "hi": "समीक्षा हेतु लंबित",
        "hinglish": "Pending Review"
    },
    {
        "en": "Active Treatments",
        "hi": "सक्रिय उपचार",
        "hinglish": "Active Treatments"
    },
    {
        "en": "Completed Cases",
        "hi": "पूर्ण हुए केस",
        "hinglish": "Completed Cases"
    },
    {
        "en": "Urgent Red Flags",
        "hi": "अति-गंभीर लक्षण",
        "hinglish": "Urgent Red Flags"
    },
    {
        "en": "Needs Attention",
        "hi": "ध्यान देने योग्य",
        "hinglish": "Needs Attention"
    },
    {
        "en": "Follow-ups Due",
        "hi": "नियत फॉलो-अप",
        "hinglish": "Follow-ups Due"
    },
    {
        "en": "System Accuracy",
        "hi": "सिस्टम सटीकता",
        "hinglish": "System Accuracy"
    },
    {
        "en": "Urgent Attention Queue",
        "hi": "तत्काल ध्यान कतार",
        "hinglish": "Urgent Attention Queue"
    },
    {
        "en": "Recent Patient Cases",
        "hi": "हाल के मरीज़ केस",
        "hinglish": "Recent Patient Cases"
    },
    {
        "en": "View All Patients",
        "hi": "सभी मरीज़ देखें",
        "hinglish": "View All Patients"
    },
    {
        "en": "Patient Name",
        "hi": "मरीज़ का नाम",
        "hinglish": "Patient Name"
    },
    {
        "en": "Ayush System",
        "hi": "आयुष चिकित्सा पद्धति",
        "hinglish": "Ayush System"
    },
    {
        "en": "Chief Complaint",
        "hi": "मुख्य समस्या / लक्षण",
        "hinglish": "Chief Complaint"
    },
    {
        "en": "Status",
        "hi": "स्थिति",
        "hinglish": "Status"
    },
    {
        "en": "Action",
        "hi": "कार्रवाई",
        "hinglish": "Action"
    },
    {
        "en": "Review",
        "hi": "समीक्षा करें",
        "hinglish": "Review"
    },
    {
        "en": "Pending review",
        "hi": "समीक्षा लंबित",
        "hinglish": "Pending review"
    },
    {
        "en": "Review Now",
        "hi": "अभी समीक्षा करें",
        "hinglish": "Review Now"
    },
    {
        "en": "Trigger",
        "hi": "कारण",
        "hinglish": "Trigger"
    },
    {
        "en": "Offline Mode Active",
        "hi": "ऑफ़लाइन मोड सक्रिय",
        "hinglish": "Offline Mode Active"
    },
    {
        "en": "No internet connection detected. Case-taking, patient files, and offline drafts are securely saved locally. Data will synchronize automatically once reconnected.",
        "hi": "कोई इंटरनेट कनेक्शन नहीं मिला। केस-टेकिंग, मरीज़ फाइलें और ड्राफ्ट सुरक्षित रूप से स्थानीय रूप से सहेजे गए हैं। फिर से कनेक्ट होने पर डेटा स्वतः सिंक हो जाएगा।",
        "hinglish": "Internet connection nahi mila. Case files securely save ho chuki hain."
    },
    {
        "en": "No cases requiring attention in queue.",
        "hi": "कतार में ध्यान देने योग्य कोई केस नहीं है.",
        "hinglish": "Queue me koi case pending nahi hai."
    },
    {
        "en": "SWASTHAI — Intelligent Patient Care Platform",
        "hi": "स्वास्थ AI — बुद्धिमान मरीज़ स्वास्थ्य सेवा मंच",
        "hinglish": "SWASTHAI — Intelligent Patient Care Platform"
    },
    {
        "en": "Simple & Powerful Digital Healthcare Companion",
        "hi": "स्वास्थ्य सेवा का सरल व सशक्त डिजिटल साथी",
        "hinglish": "Swasthya Sewa ka Simple & Powerful Digital Saathi"
    },
    {
        "en": "Patients can speak their symptoms and upload medical reports. Doctors can conduct safe and accurate case reviews.",
        "hi": "मरीज़ बोलकर अपनी तकलीफ बता सकते हैं और मेडिकल रिपोर्ट अपलोड कर सकते हैं। डॉक्टर सुरक्षित व सटीक केस समीक्षा कर सकते हैं।",
        "hinglish": "Patients bolkar dikkat bata sakte hain aur reports upload kar sakte hain."
    },
    {
        "en": "Voice & Easy Touch",
        "hi": "बोलकर व आसान स्पर्श से",
        "hinglish": "Voice & Easy Touch"
    },
    {
        "en": "Patient Health Portal",
        "hi": "मरीज़ स्वास्थ्य सेवा पोर्टल",
        "hinglish": "Patient Health Portal"
    },
    {
        "en": "Speak your symptoms, upload medical reports, and view doctor prescriptions.",
        "hi": "अपनी तकलीफ बोलकर बताएं, डॉक्टर की पर्ची व टेस्ट रिपोर्ट अपलोड करें और दवाइयां देखें।",
        "hinglish": "Apni dikkat bolkar batayein, medical reports upload karein aur dawaiyan dekhein."
    },
    {
        "en": "Speak symptoms: In Hindi, English & Hinglish",
        "hi": "बोलकर बताएं: हिंदी, अंग्रेजी व हिंग्लिश में",
        "hinglish": "Bolkar batayein: Hindi, English aur Hinglish me"
    },
    {
        "en": "Open Patient Portal (Patient Login / Portal)",
        "hi": "मरीज़ पोर्टल खोलें",
        "hinglish": "Patient Portal Kholein"
    },
    {
        "en": "Open Patient Portal",
        "hi": "मरीज़ पोर्टल खोलें",
        "hinglish": "Patient Portal Kholein"
    },
    {
        "en": "मरीज़ पोर्टल खोलें (Patient Login / Portal)",
        "hi": "मरीज़ पोर्टल खोलें",
        "hinglish": "Patient Portal Kholein"
    },
    {
        "en": "New Patient Login / Register",
        "hi": "नया मरीज़ लॉगिन / रजिस्टर करें",
        "hinglish": "Naya Patient Login / Register"
    },
    {
        "en": "Clinical AI Workspace",
        "hi": "क्लिनिकल AI कार्यक्षेत्र",
        "hinglish": "Clinical AI Workspace"
    },
    {
        "en": "Doctor / Practitioner Portal",
        "hi": "डॉक्टर / चिकित्सक पोर्टल",
        "hinglish": "Doctor / Practitioner Portal"
    },
    {
        "en": "Case taking, clinical review workspace, attention queue, and patient timeline.",
        "hi": "केस टेकिंग, क्लिनिकल समीक्षा कार्यक्षेत्र, ध्यान कतार और मरीज़ टाइमलाइन।",
        "hinglish": "Case taking, clinical review workspace aur timeline."
    },
    {
        "en": "Open Doctor Portal (Doctor)",
        "hi": "डॉक्टर पोर्टल खोलें",
        "hinglish": "Doctor Portal Kholein"
    },
    {
        "en": "Open Doctor Portal",
        "hi": "डॉक्टर पोर्टल खोलें",
        "hinglish": "Doctor Portal Kholein"
    },
    {
        "en": "Doctor Login (Dr. Sharma)",
        "hi": "डॉक्टर लॉगिन (Dr. Sharma)",
        "hinglish": "Doctor Login (Dr. Sharma)"
    },
    {
        "en": "डॉक्टर व अस्पताल लॉगिन (Doctor & Hospital Login)",
        "hi": "डॉक्टर व अस्पताल लॉगिन",
        "hinglish": "Doctor & Hospital Login"
    },
    {
        "en": "Doctor & Hospital Login",
        "hi": "डॉक्टर व अस्पताल लॉगिन",
        "hinglish": "Doctor & Hospital Login"
    },
    {
        "en": "Tell us your symptoms (Speak or Type)",
        "hi": "अपनी बीमारी या तकलीफ बोलकर बताएं",
        "hinglish": "Apni bimari ya dikkat bolkar batayein"
    },
    {
        "en": "Press the big green microphone and speak naturally in Hindi or English.",
        "hi": "नीचे दिए गए हरे माइक बटन को दबाएं और अपनी भाषा में खुलकर बोलें।",
        "hinglish": "Neeche green mic button dabayein aur simple bhasha me bolein."
    },
    {
        "en": "Tap to Speak",
        "hi": "माइक दबाकर बोलें",
        "hinglish": "Mic dabakar bolein"
    },
    {
        "en": "Press to Speak",
        "hi": "माइक दबाकर बोलें",
        "hinglish": "Mic dabakar bolein"
    },
    {
        "en": "माइक दबाकर बोलें (Tap to Speak)",
        "hi": "माइक दबाकर बोलें",
        "hinglish": "Mic dabakar bolein"
    },
    {
        "en": "Listening... Please speak your health problem.",
        "hi": "सुन रहे हैं... कृपया अपनी तकलीफ बताएं।",
        "hinglish": "Sun rahe hain... Apni problem bolein."
    },
    {
        "en": "Done",
        "hi": "बोलना समाप्त हुआ",
        "hinglish": "Bolna complete hua"
    },
    {
        "en": "Stop Speaking",
        "hi": "बोलना समाप्त हुआ",
        "hinglish": "Bolna complete hua"
    },
    {
        "en": "Or type your symptoms here...",
        "hi": "या यहाँ अपनी समस्या लिखें...",
        "hinglish": "Ya yahan apni bimari type karein..."
    },
    {
        "en": "या यहाँ अपनी समस्या लिखें (Or type symptoms here)...",
        "hi": "या यहाँ अपनी समस्या लिखें...",
        "hinglish": "Ya yahan apni dikkat likhein..."
    },
    {
        "en": "Submit Symptoms to Doctor",
        "hi": "तकलीफ डॉक्टर को भेजें",
        "hinglish": "Symptoms Doctor ko Bhejein"
    },
    {
        "en": "Clear Text",
        "hi": "साफ करें",
        "hinglish": "Clear Karein"
    },
    {
        "en": "Add New Disease / Problem",
        "hi": "नई बीमारी / तकलीफ जोड़ें",
        "hinglish": "Nayi Bimari / Problem Jodein"
    },
    {
        "en": "Send current problem & symptoms to doctor",
        "hi": "वर्तमान समस्या व लक्षण डॉक्टर को भेजें",
        "hinglish": "Current problem aur symptoms doctor ko bhejein"
    },
    {
        "en": "Add Past Doctor Records / Prescription",
        "hi": "पुराने डॉक्टर का डेटा / पर्चा जोड़ें",
        "hinglish": "Purane Doctor ka Data / Parcha Jodein"
    },
    {
        "en": "Past doctor name, clinic & medicines",
        "hi": "पुराने डॉक्टर का नाम, क्लिनिक व दवाइयां",
        "hinglish": "Purane doctor ka naam, clinic aur medicines"
    },
    {
        "en": "Quick Body Symptom Selector",
        "hi": "शरीर के अंगों के अनुसार लक्षण चुनें",
        "hinglish": "Body parts ke according problem chunein"
    },
    {
        "en": "Tap the body part or health issue you are experiencing:",
        "hi": "जिस अंग में दर्द या तकलीफ हो, उस पर स्पर्श (टैप) करें:",
        "hinglish": "Jis body part me dard ya problem ho uspe tap karein:"
    },
    {
        "en": "Headache / Dizziness",
        "hi": "सिरदर्द / चक्कर",
        "hinglish": "Sar Dard / Chakkar"
    },
    {
        "en": "Stomach Pain / Acidity",
        "hi": "पेट दर्द / गैस",
        "hinglish": "Pet Dard / Gas"
    },
    {
        "en": "Chest Pain / Heaviness",
        "hi": "छाती में दर्द",
        "hinglish": "Chest Pain / Bhari Pan"
    },
    {
        "en": "Joint Pain / Arthritis",
        "hi": "जोड़ों का दर्द",
        "hinglish": "Jodon ka Dard"
    },
    {
        "en": "Fever / Shivering",
        "hi": "बुखार / कंपकंपी",
        "hinglish": "Bukhar / Thand"
    },
    {
        "en": "Cough / Sore Throat",
        "hi": "खांसी / गला",
        "hinglish": "Khansi / Gale me dard"
    },
    {
        "en": "Skin Rash / Itching",
        "hi": "त्वचा / खुजली",
        "hinglish": "Skin Allergy / Khujli"
    },
    {
        "en": "Sugar / Weakness",
        "hi": "शुगर / कमजोरी",
        "hinglish": "Sugar / Kamzori"
    },
    {
        "en": "My Reported Diseases",
        "hi": "मेरी दर्ज की गई बीमारियां",
        "hinglish": "Meri Reported Bimariyan"
    },
    {
        "en": "Conditions you have informed the doctor",
        "hi": "जो आपने डॉक्टर को बताई हैं",
        "hinglish": "Jo aapne doctor ko batayi hain"
    },
    {
        "en": "+ Add New",
        "hi": "+ नई जोड़ें",
        "hinglish": "+ Nayi Jodein"
    },
    {
        "en": "Past Doctor Records",
        "hi": "पुराने डॉक्टर का डेटा",
        "hinglish": "Purane Doctor ka Data"
    },
    {
        "en": "Previous doctor, clinic and medications",
        "hi": "पिछले डॉक्टर, क्लिनिक व इलाज",
        "hinglish": "Pichle doctor, clinic aur treatment"
    },
    {
        "en": "+ Add Past Record",
        "hi": "+ पुराना डेटा जोड़ें",
        "hinglish": "+ Purana Data Jodein"
    },
    {
        "en": "AI Medical Report & Prescription Arranger",
        "hi": "AI मेडिकल रिपोर्ट व पर्चा व्यवस्थापक",
        "hinglish": "AI Medical Report & Prescription Arranger"
    },
    {
        "en": "Upload photos or PDFs of blood tests, LFT, CBC, or doctor prescriptions. AI will organize and explain them in simple words.",
        "hi": "खून की जांच, लिवर टेस्ट या डॉक्टर के पर्चे का फोटो डालें। AI इसे आसान भाषा में व्यवस्थित करके समझाएगा।",
        "hinglish": "Lab test ya doctor prescription ki photo dalein. AI simple language me organize karega."
    },
    {
        "en": "Choose Photo from Device",
        "hi": "डिवाइस से फोटो चुनें",
        "hinglish": "Device se Photo Chunein"
    },
    {
        "en": "Sample Liver (LFT) Report",
        "hi": "सैंपल लिवर (LFT) रिपोर्ट",
        "hinglish": "Sample LFT Liver Report"
    },
    {
        "en": "Sample Blood Test (CBC)",
        "hi": "सैंपल खून जांच (CBC)",
        "hinglish": "Sample CBC Blood Report"
    },
    {
        "en": "Sample Prescription",
        "hi": "सैंपल डॉक्टर पर्चा",
        "hinglish": "Sample Prescription"
    },
    {
        "en": "AI is reading and organizing your report...",
        "hi": "AI आपकी रिपोर्ट को पढ़कर व्यवस्थित कर रहा है...",
        "hinglish": "AI report ko read aur arrange kar raha hai..."
    },
    {
        "en": "Normal / Safe",
        "hi": "सामान्य / सुरक्षित",
        "hinglish": "Normal / Safe"
    },
    {
        "en": "Normal",
        "hi": "सामान्य",
        "hinglish": "Normal"
    },
    {
        "en": "Doctor Review Needed",
        "hi": "डॉक्टर को दिखाना ज़रूरी",
        "hinglish": "Doctor Review Zaruri"
    },
    {
        "en": "Doctor Review",
        "hi": "डॉक्टर समीक्षा",
        "hinglish": "Doctor Review"
    },
    {
        "en": "High / Alert",
        "hi": "अधिक / चेतावनी",
        "hinglish": "High / Alert"
    },
    {
        "en": "Doctor Verified Prescriptions",
        "hi": "डॉक्टर द्वारा जांची गई दवाइयां",
        "hinglish": "Doctor ki Verified Dawaiyan"
    },
    {
        "en": "Verified by Dr. Sharma",
        "hi": "डॉ. शर्मा द्वारा सत्यापित",
        "hinglish": "Dr. Sharma dwara Verified"
    },
    {
        "en": "Next Doctor Follow-up",
        "hi": "अगली डॉक्टर मुलाक़ात",
        "hinglish": "Next Doctor Consultation"
    },
    {
        "en": "Emergency Help (Call 108)",
        "hi": "आपातकालीन मदद (108 कॉल करें)",
        "hinglish": "Emergency Help (108 Call Karein)"
    },
    {
        "en": "If facing severe breathlessness or acute chest pain, visit the nearest emergency room or dial 108 immediately.",
        "hi": "अगर सांस लेने में भारी तकलीफ या सीने में तेज़ दर्द हो, तो तुरंत नजदीकी अस्पताल जाएं या 108 डायल करें।",
        "hinglish": "Agar saans lene me dikkat ya chest pain ho, to turant hospital jayein ya 108 call karein."
    },
    {
        "en": "Call 108 Emergency",
        "hi": "108 पर कॉल करें",
        "hinglish": "108 Call Karein"
    },
    {
        "en": "108 पर कॉल करें",
        "hi": "108 पर कॉल करें",
        "hinglish": "108 Call Karein"
    },
    {
        "en": "108 Call Karein",
        "hi": "108 पर कॉल करें",
        "hinglish": "108 Call Karein"
    },
    {
        "en": "Patient Management",
        "hi": "मरीज़ प्रबंधन",
        "hinglish": "Patient Management"
    },
    {
        "en": "All Patients",
        "hi": "सभी मरीज़",
        "hinglish": "All Patients"
    },
    {
        "en": "Search by patient name or ID...",
        "hi": "मरीज़ के नाम या ID से खोजें...",
        "hinglish": "Patient ke naam ya ID se search karein..."
    },
    {
        "en": "All Status",
        "hi": "सभी स्थितियां",
        "hinglish": "All Status"
    },
    {
        "en": "Active",
        "hi": "सक्रिय",
        "hinglish": "Active"
    },
    {
        "en": "Follow-up",
        "hi": "फॉलो-अप",
        "hinglish": "Follow-up"
    },
    {
        "en": "New",
        "hi": "नया",
        "hinglish": "New"
    },
    {
        "en": "Discharged",
        "hi": "डिस्चार्ज",
        "hinglish": "Discharged"
    },
    {
        "en": "View Dossier",
        "hi": "दस्तावेज़ देखें",
        "hinglish": "Dossier Dekhein"
    },
    {
        "en": "Age / Gender",
        "hi": "उम्र / लिंग",
        "hinglish": "Age / Gender"
    },
    {
        "en": "Contact",
        "hi": "संपर्क",
        "hinglish": "Contact"
    },
    {
        "en": "Prakriti",
        "hi": "प्रकृति",
        "hinglish": "Prakriti"
    },
    {
        "en": "Last Visit",
        "hi": "अंतिम परामर्श",
        "hinglish": "Last Visit"
    },
    {
        "en": "No patients match your search criteria.",
        "hi": "आपकी खोज के अनुसार कोई मरीज़ नहीं मिला।",
        "hinglish": "Aapke search ke mutabik koi patient nahi mila."
    },
    {
        "en": "Comprehensive Patient Clinical Dossier",
        "hi": "विस्तृत मरीज़ क्लिनिकल दस्तावेज़",
        "hinglish": "Patient Clinical Dossier"
    },
    {
        "en": "Showing 1–5 of 1,248 patients",
        "hi": "1,248 में से 1–5 मरीज़ प्रदर्शित",
        "hinglish": "1,248 me se 1–5 patients dikhaye gaye"
    },
    {
        "en": "Latest recorded patient cases.",
        "hi": "नवीनतम दर्ज मरीज़ केस।",
        "hinglish": "Latest recorded patient cases."
    },
    {
        "en": "Manage and view all registered patient records.",
        "hi": "सभी पंजीकृत मरीज़ रिकॉर्ड प्रबंधित करें और देखें।",
        "hinglish": "All registered patient records manage karein."
    },
    {
        "en": "Add New Patient",
        "hi": "नया मरीज़ जोड़ें",
        "hinglish": "Add New Patient"
    },
    {
        "en": "Add Patient | SWASTHAI",
        "hi": "नया मरीज़ जोड़ें | स्वास्थ AI",
        "hinglish": "Add Patient | SWASTHAI"
    },
    {
        "en": "Enter the patient's information to create a secure digital healthcare profile.",
        "hi": "सुरक्षित डिजिटल स्वास्थ्य प्रोफ़ाइल बनाने के लिए मरीज़ की जानकारी दर्ज करें।",
        "hinglish": "Patient ki information enter karein."
    },
    {
        "en": "Auto-Fill Patient Details by ID / Password",
        "hi": "ID / पासवर्ड से विवरण स्वतः भरें",
        "hinglish": "ID / Password se details auto-fill karein"
    },
    {
        "en": "Enter existing Patient ID / Mobile Number and Password to automatically fetch and populate all details.",
        "hi": "सभी विवरण प्राप्त करने के लिए मौजूदा Patient ID / मोबाइल नंबर और पासवर्ड दर्ज करें।",
        "hinglish": "Existing Patient ID ya Mobile number aur password enter karein."
    },
    {
        "en": "Fetch & Auto-Fill Details",
        "hi": "विवरण प्राप्त करें व स्वतः भरें",
        "hinglish": "Details Fetch aur Auto-Fill Karein"
    },
    {
        "en": "Basic Information",
        "hi": "बुनियादी जानकारी",
        "hinglish": "Basic Information"
    },
    {
        "en": "Basic details about the patient.",
        "hi": "मरीज़ के बारे में बुनियादी जानकारी।",
        "hinglish": "Patient ke basic details."
    },
    {
        "en": "Full Name",
        "hi": "पूरा नाम",
        "hinglish": "Full Name"
    },
    {
        "en": "Full Name *",
        "hi": "पूरा नाम *",
        "hinglish": "Full Name *"
    },
    {
        "en": "Enter patient's full name",
        "hi": "मरीज़ का पूरा नाम दर्ज करें",
        "hinglish": "Patient ka full name enter karein"
    },
    {
        "en": "Date of Birth *",
        "hi": "जन्म तिथि *",
        "hinglish": "Date of Birth *"
    },
    {
        "en": "Age",
        "hi": "उम्र",
        "hinglish": "Age"
    },
    {
        "en": "Age *",
        "hi": "उम्र *",
        "hinglish": "Age *"
    },
    {
        "en": "उम्र (Age) *",
        "hi": "उम्र *",
        "hinglish": "Age *"
    },
    {
        "en": "Gender",
        "hi": "लिंग",
        "hinglish": "Gender"
    },
    {
        "en": "Gender *",
        "hi": "लिंग *",
        "hinglish": "Gender *"
    },
    {
        "en": "लिंग (Gender) *",
        "hi": "लिंग *",
        "hinglish": "Gender *"
    },
    {
        "en": "Select Gender",
        "hi": "लिंग चुनें",
        "hinglish": "Select Gender"
    },
    {
        "en": "Male",
        "hi": "पुरुष",
        "hinglish": "Male"
    },
    {
        "en": "Female",
        "hi": "महिला",
        "hinglish": "Female"
    },
    {
        "en": "पुरुष (Male)",
        "hi": "पुरुष",
        "hinglish": "Male"
    },
    {
        "en": "महिला (Female)",
        "hi": "महिला",
        "hinglish": "Female"
    },
    {
        "en": "अन्य (Other)",
        "hi": "अन्य",
        "hinglish": "Other"
    },
    {
        "en": "Other",
        "hi": "अन्य",
        "hinglish": "Other"
    },
    {
        "en": "Blood Group",
        "hi": "रक्त समूह",
        "hinglish": "Blood Group"
    },
    {
        "en": "Select Blood Group",
        "hi": "रक्त समूह चुनें",
        "hinglish": "Select Blood Group"
    },
    {
        "en": "Contact Information",
        "hi": "संपर्क जानकारी",
        "hinglish": "Contact Information"
    },
    {
        "en": "How can we contact the patient?",
        "hi": "मरीज़ से कैसे संपर्क करें?",
        "hinglish": "Patient se kaise contact karein?"
    },
    {
        "en": "Phone Number *",
        "hi": "फ़ोन नंबर *",
        "hinglish": "Phone Number *"
    },
    {
        "en": "Email Address",
        "hi": "ईमेल पता",
        "hinglish": "Email Address"
    },
    {
        "en": "Enter your email",
        "hi": "अपना ईमेल दर्ज करें",
        "hinglish": "Apna email enter karein"
    },
    {
        "en": "Residential Address *",
        "hi": "आवासीय पता *",
        "hinglish": "Residential Address *"
    },
    {
        "en": "Enter complete address",
        "hi": "पूरा पता दर्ज करें",
        "hinglish": "Complete address enter karein"
    },
    {
        "en": "Emergency Contact",
        "hi": "आपातकालीन संपर्क",
        "hinglish": "Emergency Contact"
    },
    {
        "en": "Emergency Contact Name *",
        "hi": "आपातकालीन संपर्क का नाम *",
        "hinglish": "Emergency Contact Name *"
    },
    {
        "en": "Emergency Contact Number *",
        "hi": "आपातकालीन संपर्क नंबर *",
        "hinglish": "Emergency Contact Number *"
    },
    {
        "en": "Occupation",
        "hi": "व्यवसाय",
        "hinglish": "Occupation"
    },
    {
        "en": "Enter occupation",
        "hi": "व्यवसाय दर्ज करें",
        "hinglish": "Occupation enter karein"
    },
    {
        "en": "Dietary Preference",
        "hi": "आहार वरीयता",
        "hinglish": "Dietary Preference"
    },
    {
        "en": "Vegetarian",
        "hi": "शाकाहारी",
        "hinglish": "Vegetarian"
    },
    {
        "en": "Non-Vegetarian",
        "hi": "मांसाहारी",
        "hinglish": "Non-Vegetarian"
    },
    {
        "en": "Vegan",
        "hi": "वीगन",
        "hinglish": "Vegan"
    },
    {
        "en": "Medical History",
        "hi": "चिकित्सीय इतिहास",
        "hinglish": "Medical History"
    },
    {
        "en": "General health details and previous history.",
        "hi": "सामान्य स्वास्थ्य विवरण और पिछला इतिहास।",
        "hinglish": "General health details aur previous history."
    },
    {
        "en": "Known Allergies",
        "hi": "ज्ञात एलर्जी",
        "hinglish": "Known Allergies"
    },
    {
        "en": "Current Medication",
        "hi": "वर्तमान दवाइयां",
        "hinglish": "Current Medication"
    },
    {
        "en": "Enter current medication",
        "hi": "वर्तमान दवा दर्ज करें",
        "hinglish": "Current medication enter karein"
    },
    {
        "en": "Enter medication",
        "hi": "दवा दर्ज करें",
        "hinglish": "Medication enter karein"
    },
    {
        "en": "Previous Surgeries",
        "hi": "पिछली सर्जरी",
        "hinglish": "Previous Surgeries"
    },
    {
        "en": "Enter previous surgeries",
        "hi": "पिछली सर्जरी दर्ज करें",
        "hinglish": "Previous surgeries enter karein"
    },
    {
        "en": "Enter surgery details",
        "hi": "सर्जरी का विवरण दर्ज करें",
        "hinglish": "Surgery details enter karein"
    },
    {
        "en": "Family History",
        "hi": "पारिवारिक इतिहास",
        "hinglish": "Family History"
    },
    {
        "en": "Record hereditary and family-related conditions.",
        "hi": "वंशानुगत और परिवार से जुड़ी स्थितियों को दर्ज करें।",
        "hinglish": "Family history record karein."
    },
    {
        "en": "Lifestyle Assessment",
        "hi": "जीवनशैली मूल्यांकन",
        "hinglish": "Lifestyle Assessment"
    },
    {
        "en": "Understand habits and lifestyle factors.",
        "hi": "आदतों और जीवनशैली कारकों को समझें।",
        "hinglish": "Habits aur lifestyle factors ko samjhein."
    },
    {
        "en": "Physical Activity",
        "hi": "शारीरिक गतिविधि",
        "hinglish": "Physical Activity"
    },
    {
        "en": "Sleep Duration",
        "hi": "नींद की अवधि",
        "hinglish": "Sleep Duration"
    },
    {
        "en": "Less than 5 hours",
        "hi": "5 घंटे से कम",
        "hinglish": "5 hours se kam"
    },
    {
        "en": "5–6 hours",
        "hi": "5–6 घंटे",
        "hinglish": "5–6 hours"
    },
    {
        "en": "7–8 hours",
        "hi": "7–8 घंटे",
        "hinglish": "7–8 hours"
    },
    {
        "en": "More than 8 hours",
        "hi": "8 घंटे से अधिक",
        "hinglish": "8 hours se zyada"
    },
    {
        "en": "Stress Level",
        "hi": "तनाव का स्तर",
        "hinglish": "Stress Level"
    },
    {
        "en": "Prakriti Assessment",
        "hi": "प्रकृति मूल्यांकन",
        "hinglish": "Prakriti Assessment"
    },
    {
        "en": "AYUSH patient constitution",
        "hi": "आयुष मरीज़ शारीरिक प्रकृति",
        "hinglish": "AYUSH patient constitution"
    },
    {
        "en": "Vata",
        "hi": "वात (Vata)",
        "hinglish": "Vata"
    },
    {
        "en": "Pitta",
        "hi": "पित्त (Pitta)",
        "hinglish": "Pitta"
    },
    {
        "en": "Kapha",
        "hi": "कफ (Kapha)",
        "hinglish": "Kapha"
    },
    {
        "en": "Save Patient",
        "hi": "मरीज़ सुरक्षित करें",
        "hinglish": "Patient Save Karein"
    },
    {
        "en": "Cancel",
        "hi": "रद्द करें",
        "hinglish": "Cancel"
    },
    {
        "en": "Patient Registered!",
        "hi": "मरीज़ पंजीकृत हुआ!",
        "hinglish": "Patient Registered!"
    },
    {
        "en": "The patient's digital profile has been created successfully.",
        "hi": "मरीज़ की डिजिटल प्रोफ़ाइल सफलतापूर्वक बनाई गई है।",
        "hinglish": "Patient ki profile create ho chuki hai."
    },
    {
        "en": "New Case | SWASTHAI",
        "hi": "नया केस | स्वास्थ AI",
        "hinglish": "New Case | SWASTHAI"
    },
    {
        "en": "New Patient Case Documentation",
        "hi": "नया मरीज़ केस दस्तावेज़ीकरण",
        "hinglish": "New Patient Case Documentation"
    },
    {
        "en": "Digitize patient case-taking, organize clinical records and get intelligent assistance throughout the consultation process.",
        "hi": "मरीज़ केस-टेकिंग को डिजिटल बनाएं, क्लिनिकल रिकॉर्ड व्यवस्थित करें और परामर्श प्रक्रिया के दौरान बुद्धिमान सहायता प्राप्त करें।",
        "hinglish": "Patient case-taking ko digitize karein aur clinical records organize karein."
    },
    {
        "en": "Select Patient",
        "hi": "मरीज़ चुनें",
        "hinglish": "Select Patient"
    },
    {
        "en": "Select a patient from your registered records.",
        "hi": "अपने पंजीकृत रिकॉर्ड से मरीज़ चुनें।",
        "hinglish": "Registered records se patient chunein."
    },
    {
        "en": "Existing Patient",
        "hi": "मौजूदा मरीज़",
        "hinglish": "Existing Patient"
    },
    {
        "en": "Register a New Patient",
        "hi": "नया मरीज़ पंजीकृत करें",
        "hinglish": "Naya Patient Register Karein"
    },
    {
        "en": "Register a new patient before starting a case.",
        "hi": "केस शुरू करने से पहले नया मरीज़ पंजीकृत करें।",
        "hinglish": "Case start karne se pehle naya patient register karein."
    },
    {
        "en": "Start Case Taking",
        "hi": "केस-टेकिंग शुरू करें",
        "hinglish": "Case Taking Start Karein"
    },
    {
        "en": "Start New Case",
        "hi": "नया केस शुरू करें",
        "hinglish": "Start New Case"
    },
    {
        "en": "AI Adaptive Case Taking",
        "hi": "AI अनुकूली केस-टेकिंग",
        "hinglish": "AI Adaptive Case Taking"
    },
    {
        "en": "Interactive AI-assisted case taking for AYUSH practitioners. Patient answers guide dynamic clinical inquiry.",
        "hi": "आयुष चिकित्सकों के लिए संवादात्मक AI-सहायता प्राप्त केस टेकिंग।",
        "hinglish": "AYUSH doctors ke liye AI-assisted case taking."
    },
    {
        "en": "Primary Complaint",
        "hi": "मुख्य समस्या",
        "hinglish": "Primary Complaint"
    },
    {
        "en": "Primary Complaint *",
        "hi": "मुख्य समस्या *",
        "hinglish": "Primary Complaint *"
    },
    {
        "en": "Describe the Complaint *",
        "hi": "समस्या का वर्णन करें *",
        "hinglish": "Complaint describe karein *"
    },
    {
        "en": "Describe the symptoms in the patient's own words...",
        "hi": "मरीज़ के अपने शब्दों में लक्षणों का वर्णन करें...",
        "hinglish": "Patient ke words me symptoms describe karein..."
    },
    {
        "en": "When did symptoms start?",
        "hi": "लक्षण कब शुरू हुए?",
        "hinglish": "Symptoms kab shuru hue?"
    },
    {
        "en": "What makes it worse?",
        "hi": "किससे तकलीफ बढ़ती है?",
        "hinglish": "Kisse problem badhti hai?"
    },
    {
        "en": "ONSET & DURATION",
        "hi": "शुरुआत और अवधि",
        "hinglish": "Onset & Duration"
    },
    {
        "en": "LOCATION",
        "hi": "स्थान",
        "hinglish": "Location"
    },
    {
        "en": "History of Present Illness",
        "hi": "वर्तमान बीमारी का इतिहास",
        "hinglish": "History of Present Illness"
    },
    {
        "en": "Understand when and how the symptoms developed.",
        "hi": "लक्षण कब और कैसे विकसित हुए, समझें।",
        "hinglish": "Symptoms kab develop hue samjhein."
    },
    {
        "en": "Clinical Notes / Details",
        "hi": "क्लिनिकल नोट्स / विवरण",
        "hinglish": "Clinical Notes / Details"
    },
    {
        "en": "Enter AYUSH-based observations...",
        "hi": "आयुष आधारित अवलोकन दर्ज करें...",
        "hinglish": "AYUSH observations enter karein..."
    },
    {
        "en": "Additional Notes",
        "hi": "अतिरिक्त नोट्स",
        "hinglish": "Additional Notes"
    },
    {
        "en": "Additional observations...",
        "hi": "अतिरिक्त अवलोकन...",
        "hinglish": "Additional observations..."
    },
    {
        "en": "Step",
        "hi": "चरण",
        "hinglish": "Step"
    },
    {
        "en": "of 8",
        "hi": "में से 8",
        "hinglish": "of 8"
    },
    {
        "en": "8-Step Form Mode",
        "hi": "8-चरणीय फॉर्म मोड",
        "hinglish": "8-Step Form Mode"
    },
    {
        "en": "Side-by-Side Split View",
        "hi": "स्प्लिट व्यू (दोनों तरफ देखें)",
        "hinglish": "Side-by-Side View"
    },
    {
        "en": "Next",
        "hi": "आगे बढ़ें",
        "hinglish": "Next"
    },
    {
        "en": "Previous",
        "hi": "पिछला",
        "hinglish": "Previous"
    },
    {
        "en": "Save Draft",
        "hi": "ड्राफ्ट सेव करें",
        "hinglish": "Draft Save Karein"
    },
    {
        "en": "Submit Case",
        "hi": "केस जमा करें",
        "hinglish": "Case Submit Karein"
    },
    {
        "en": "Save Case",
        "hi": "केस सुरक्षित करें",
        "hinglish": "Case Save Karein"
    },
    {
        "en": "Case Saved Successfully!",
        "hi": "केस सफलतापूर्वक सहेजा गया!",
        "hinglish": "Case Successfully Save Hua!"
    },
    {
        "en": "The patient case has been recorded and is ready for clinical review.",
        "hi": "मरीज़ केस दर्ज कर लिया गया है और क्लिनिकल समीक्षा के लिए तैयार है।",
        "hinglish": "Patient case record ho gaya hai aur review ke liye ready hai."
    },
    {
        "en": "Open in Review Workspace",
        "hi": "समीक्षा कार्यक्षेत्र में खोलें",
        "hinglish": "Review Workspace me kholein"
    },
    {
        "en": "Back to Dashboard",
        "hi": "डैशबोर्ड पर वापस जाएं",
        "hinglish": "Dashboard par wapas jayein"
    },
    {
        "en": "All essential clinical domains have been collected. Ready for practitioner review.",
        "hi": "सभी आवश्यक क्लिनिकल डोमेन एकत्र कर लिए गए हैं। चिकित्सक समीक्षा के लिए तैयार।",
        "hinglish": "All essential domains collect ho gaye hain. Ready for review."
    },
    {
        "en": "Case Information Sufficient!",
        "hi": "केस की जानकारी पर्याप्त है!",
        "hinglish": "Case information sufficient hai!"
    },
    {
        "en": "Practitioner Review Workspace | SWASTHAI",
        "hi": "समीक्षा कार्यक्षेत्र | स्वास्थ AI",
        "hinglish": "Review Workspace | SWASTHAI"
    },
    {
        "en": "Consultation / Case Review Workspace",
        "hi": "परामर्श / केस समीक्षा कार्यक्षेत्र",
        "hinglish": "Consultation / Case Review Workspace"
    },
    {
        "en": "Select Patient Case",
        "hi": "मरीज़ केस चुनें",
        "hinglish": "Patient Case Chunein"
    },
    {
        "en": "Choose a patient case for AI-assisted analysis.",
        "hi": "AI-सहायता प्राप्त विश्लेषण के लिए मरीज़ केस चुनें।",
        "hinglish": "AI-assisted analysis ke liye patient case chunein."
    },
    {
        "en": "Open Workspace",
        "hi": "कार्यक्षेत्र खोलें",
        "hinglish": "Workspace Kholein"
    },
    {
        "en": "Patient Timeline",
        "hi": "मरीज़ टाइमलाइन",
        "hinglish": "Patient Timeline"
    },
    {
        "en": "Clinical Timeline & Verified Cases",
        "hi": "क्लिनिकल टाइमलाइन व सत्यापित केस",
        "hinglish": "Clinical Timeline & Verified Cases"
    },
    {
        "en": "Case Summary",
        "hi": "केस सारांश",
        "hinglish": "Case Summary"
    },
    {
        "en": "AI Case Summary",
        "hi": "AI केस सारांश",
        "hinglish": "AI Case Summary"
    },
    {
        "en": "AI Clinical Recommendations",
        "hi": "AI क्लिनिकल अनुशंसाएं",
        "hinglish": "AI Clinical Recommendations"
    },
    {
        "en": "Clinical Impression (Differential Diagnosis)",
        "hi": "क्लिनिकल निदान (Differential Diagnosis)",
        "hinglish": "Differential Diagnosis"
    },
    {
        "en": "Potential Drug Interactions",
        "hi": "संभावित दवा पारस्परिक क्रियाएं",
        "hinglish": "Potential Drug Interactions"
    },
    {
        "en": "Red-Flag Alerts",
        "hi": "अति-गंभीर लक्षण चेतावनी",
        "hinglish": "Red-Flag Alerts"
    },
    {
        "en": "Allergy Conflict Checker:",
        "hi": "एलर्जी टकराव जांच:",
        "hinglish": "Allergy Conflict Checker:"
    },
    {
        "en": "Known Drug Allergies & Safety Alert",
        "hi": "ज्ञात दवा एलर्जी व सुरक्षा चेतावनी",
        "hinglish": "Known Drug Allergies Alert"
    },
    {
        "en": "Doctor's Clinical Notes",
        "hi": "डॉक्टर के क्लिनिकल नोट्स",
        "hinglish": "Doctor Clinical Notes"
    },
    {
        "en": "Practitioner Clinical Notes & Action Plan",
        "hi": "चिकित्सक क्लिनिकल नोट्स व कार्य योजना",
        "hinglish": "Doctor Notes & Action Plan"
    },
    {
        "en": "Approve Prescription",
        "hi": "पर्चा स्वीकृत करें",
        "hinglish": "Prescription Approve Karein"
    },
    {
        "en": "Save Clinical Notes",
        "hi": "क्लिनिकल नोट्स सहेजें",
        "hinglish": "Clinical Notes Save Karein"
    },
    {
        "en": "Export PDF",
        "hi": "PDF एक्सपोर्ट करें",
        "hinglish": "PDF Export Karein"
    },
    {
        "en": "Print",
        "hi": "प्रिंट करें",
        "hinglish": "Print Karein"
    },
    {
        "en": "Schedule Patient Follow-Up",
        "hi": "मरीज़ फॉलो-अप निर्धारित करें",
        "hinglish": "Follow-Up Schedule Karein"
    },
    {
        "en": "Follow-up Date *",
        "hi": "फॉलो-अप तारीख *",
        "hinglish": "Follow-up Date *"
    },
    {
        "en": "Reason for Follow-up *",
        "hi": "फॉलो-अप का कारण *",
        "hinglish": "Follow-up Reason *"
    },
    {
        "en": "Save Follow-Up",
        "hi": "फॉलो-अप सुरक्षित करें",
        "hinglish": "Follow-Up Save Karein"
    },
    {
        "en": "Clinical Audit Trail",
        "hi": "क्लिनिकल ऑडिट ट्रेल",
        "hinglish": "Clinical Audit Trail"
    },
    {
        "en": "Immutable log of practitioner verification actions, patient edits, and role activity.",
        "hi": "सत्यापन क्रियाओं, मरीज़ संपादनों और भूमिका गतिविधि का अपरिवर्तनीय लॉग।",
        "hinglish": "Verification actions ka audit trail."
    },
    {
        "en": "AI Evidence & Source Traceability",
        "hi": "AI साक्ष्य एवं स्रोत ट्रेसिबिलिटी",
        "hinglish": "AI Evidence & Traceability"
    },
    {
        "en": "AI-generated — Practitioner verification required",
        "hi": "AI द्वारा जनरेट — चिकित्सक सत्यापन आवश्यक",
        "hinglish": "AI-generated — Doctor verification zaroori"
    },
    {
        "en": "AI-generated observations are intended to support case documentation and practitioner review. They are not a substitute for professional clinical judgement or diagnosis.",
        "hi": "AI द्वारा जनरेट किए गए अवलोकन केवल केस दस्तावेज़ीकरण और चिकित्सक समीक्षा में सहायता के लिए हैं। वे पेशेवर क्लिनिकल निर्णय या निदान का विकल्प नहीं हैं।",
        "hinglish": "AI observations professional clinical diagnosis ka substitute nahi hain."
    },
    {
        "en": "Privacy & Consent Center",
        "hi": "गोपनीयता एवं सहमति केंद्र",
        "hinglish": "Privacy & Consent Center"
    },
    {
        "en": "Privacy Notice: Data collected solely for consultation documentation. Practitioner remains final decision maker.",
        "hi": "गोपनीयता सूचना: डेटा केवल परामर्श दस्तावेज़ीकरण के लिए एकत्र किया गया है। चिकित्सक अंतिम निर्णयकर्ता रहेगा।",
        "hinglish": "Privacy Notice: Doctor final decision maker rahega."
    },
    {
        "en": "Finalize Case",
        "hi": "केस अंतिम रूप दें",
        "hinglish": "Case Finalize Karein"
    },
    {
        "en": "Follow-up Recommendations",
        "hi": "फॉलो-अप अनुशंसाएं",
        "hinglish": "Follow-up Recommendations"
    },
    {
        "en": "Follow-up scheduling can improve patient monitoring and case continuity.",
        "hi": "फॉलो-अप निर्धारण मरीज़ निगरानी और केस निरंतरता में सुधार करता है।",
        "hinglish": "Follow-up scheduling se monitoring improve hoti hai."
    },
    {
        "en": "Clinical State Tracker",
        "hi": "क्लिनिकल स्थिति ट्रैकर",
        "hinglish": "Clinical State Tracker"
    },
    {
        "en": "Clinical Timeline",
        "hi": "क्लिनिकल टाइमलाइन",
        "hinglish": "Clinical Timeline"
    },
    {
        "en": "Case History | SWASTHAI",
        "hi": "केस इतिहास | स्वास्थ AI",
        "hinglish": "Case History | SWASTHAI"
    },
    {
        "en": "Chronological history of diagnoses, cases, allergies, medication updates, and practitioner notes.",
        "hi": "निदान, केस, एलर्जी, दवा अपडेट और चिकित्सक नोट्स का कालानुक्रमिक इतिहास।",
        "hinglish": "Chronological medical history."
    },
    {
        "en": "Search, filter and review previously recorded patient cases.",
        "hi": "पहले से दर्ज मरीज़ केस खोजें, फ़िल्टर करें और समीक्षा करें।",
        "hinglish": "Recorded patient cases search aur filter karein."
    },
    {
        "en": "Search by patient name, Case ID or complaint...",
        "hi": "मरीज़ का नाम, केस ID या समस्या से खोजें...",
        "hinglish": "Patient name, Case ID ya complaint se search karein..."
    },
    {
        "en": "Filter",
        "hi": "फ़िल्टर",
        "hinglish": "Filter"
    },
    {
        "en": "All Patient Cases",
        "hi": "सभी मरीज़ केस",
        "hinglish": "All Patient Cases"
    },
    {
        "en": "Export",
        "hi": "एक्सपोर्ट",
        "hinglish": "Export"
    },
    {
        "en": "Analytics Dashboard",
        "hi": "एनालिटिक्स डैशबोर्ड",
        "hinglish": "Analytics Dashboard"
    },
    {
        "en": "Analytics | SWASTHAI",
        "hi": "एनालिटिक्स | स्वास्थ AI",
        "hinglish": "Analytics | SWASTHAI"
    },
    {
        "en": "Analyze patient cases and AYUSH assessment patterns.",
        "hi": "मरीज़ केसों और आयुष मूल्यांकन पैटर्न का विश्लेषण करें।",
        "hinglish": "Patient cases aur assessment patterns analyze karein."
    },
    {
        "en": "Patient Case Trends",
        "hi": "मरीज़ केस रुझान",
        "hinglish": "Patient Case Trends"
    },
    {
        "en": "Monthly patient case records",
        "hi": "मासिक मरीज़ केस रिकॉर्ड",
        "hinglish": "Monthly patient records"
    },
    {
        "en": "Prakriti Distribution",
        "hi": "प्रकृति वितरण",
        "hinglish": "Prakriti Distribution"
    },
    {
        "en": "Pattern analysis from patient data",
        "hi": "मरीज़ डेटा से पैटर्न विश्लेषण",
        "hinglish": "Patient data se pattern analysis"
    },
    {
        "en": "Common Complaints",
        "hi": "सामान्य समस्याएं",
        "hinglish": "Common Complaints"
    },
    {
        "en": "Frequently reported conditions",
        "hi": "बार-बार रिपोर्ट की जाने वाली बीमारियां",
        "hinglish": "Frequently reported conditions"
    },
    {
        "en": "This Month",
        "hi": "इस महीने",
        "hinglish": "This Month"
    },
    {
        "en": "This Week",
        "hi": "इस हफ्ते",
        "hinglish": "This Week"
    },
    {
        "en": "12% this month",
        "hi": "इस महीने 12%",
        "hinglish": "is month 12%"
    },
    {
        "en": "18% this month",
        "hi": "इस महीने 18%",
        "hinglish": "is month 18%"
    },
    {
        "en": "79% completion rate",
        "hi": "79% पूर्णता दर",
        "hinglish": "79% completion rate"
    },
    {
        "en": "AI Clinical Assistant",
        "hi": "AI क्लिनिकल सहायक",
        "hinglish": "AI Clinical Assistant"
    },
    {
        "en": "AI Clinical Assistant | SWASTHAI",
        "hi": "AI क्लिनिकल सहायक | स्वास्थ AI",
        "hinglish": "AI Assistant | SWASTHAI"
    },
    {
        "en": "AYUSH AI Assistant",
        "hi": "आयुष AI सहायक",
        "hinglish": "AYUSH AI Assistant"
    },
    {
        "en": "Hello Doctor! 👋 I can help you structure patient cases and suggest relevant questions.",
        "hi": "नमस्ते डॉक्टर! 👋 मैं मरीज़ केस को व्यवस्थित करने और प्रासंगिक प्रश्नों के सुझाव देने में आपकी मदद कर सकता हूँ।",
        "hinglish": "Hello Doctor! 👋 Main patient cases structure karne me help kar sakta hu."
    },
    {
        "en": "Generate case summary",
        "hi": "केस सारांश तैयार करें",
        "hinglish": "Case summary generate karein"
    },
    {
        "en": "Generate Summary",
        "hi": "सारांश तैयार करें",
        "hinglish": "Generate Summary"
    },
    {
        "en": "Get suggested questions",
        "hi": "सुझाए गए प्रश्न प्राप्त करें",
        "hinglish": "Suggested questions paayein"
    },
    {
        "en": "Suggested Follow-up Questions",
        "hi": "सुझाए गए फॉलो-अप प्रश्न",
        "hinglish": "Suggested Follow-up Questions"
    },
    {
        "en": "Ask clinical questions",
        "hi": "क्लिनिकल प्रश्न पूछें",
        "hinglish": "Clinical questions poochein"
    },
    {
        "en": "Copy Text",
        "hi": "टेक्स्ट कॉपी करें",
        "hinglish": "Text Copy Karein"
    },
    {
        "en": "Copy",
        "hi": "कॉपी",
        "hinglish": "Copy"
    },
    {
        "en": "Clear Chat",
        "hi": "चैट साफ़ करें",
        "hinglish": "Chat Clear Karein"
    },
    {
        "en": "Voice Case Taking | SWASTHAI",
        "hi": "वॉइस केस-टेकिंग | स्वास्थ AI",
        "hinglish": "Voice Case Taking | SWASTHAI"
    },
    {
        "en": "Voice-Based Case Taking",
        "hi": "आवाज़ आधारित केस-टेकिंग",
        "hinglish": "Voice-Based Case Taking"
    },
    {
        "en": "Speak. Record. Structure.",
        "hi": "बोलें। रिकॉर्ड करें। व्यवस्थित करें।",
        "hinglish": "Bolein. Record karein. Structure karein."
    },
    {
        "en": "Click the button below and start speaking.",
        "hi": "नीचे दिए गए बटन पर क्लिक करें और बोलना शुरू करें।",
        "hinglish": "Neeche button par click karke bolna shuru karein."
    },
    {
        "en": "Start Recording",
        "hi": "रिकॉर्डिंग शुरू करें",
        "hinglish": "Recording Shuru Karein"
    },
    {
        "en": "Stop Recording",
        "hi": "रिकॉर्डिंग समाप्त करें",
        "hinglish": "Recording Stop Karein"
    },
    {
        "en": "Voice Transcript",
        "hi": "वॉइस ट्रांसक्रिप्ट",
        "hinglish": "Voice Transcript"
    },
    {
        "en": "Your spoken case information will appear here.",
        "hi": "आपकी बोली गई केस जानकारी यहाँ दिखाई देगी।",
        "hinglish": "Aapki boli gayi case information yahan dikhegi."
    },
    {
        "en": "Your voice transcript will appear here...",
        "hi": "आपकी आवाज़ का ट्रांसक्रिप्ट यहाँ दिखेगा...",
        "hinglish": "Voice transcript yahan aayega..."
    },
    {
        "en": "Voice recognition depends on browser support. Always review and correct the generated transcript before using it in patient documentation.",
        "hi": "आवाज़ पहचान ब्राउज़र समर्थन पर निर्भर करती है। मरीज़ दस्तावेज़ीकरण में उपयोग करने से पहले जनरेट किए गए ट्रांसक्रिप्ट की हमेशा समीक्षा और सुधार करें।",
        "hinglish": "Voice recognition browser support par depend karta hai. Transcript review karein."
    },
    {
        "en": "Speak or type patient's symptoms (e.g. 'Mujhe 2 din se pet ke right side me dard hai')...",
        "hi": "मरीज़ के लक्षण बोलें या लिखें (उदा. 'मुझे 2 दिन से पेट में दर्द है')...",
        "hinglish": "Patient ke symptoms bolein ya likhein..."
    },
    {
        "en": "My Profile | SWASTHAI",
        "hi": "मेरी प्रोफाइल | स्वास्थ AI",
        "hinglish": "My Profile | SWASTHAI"
    },
    {
        "en": "Doctor Name",
        "hi": "डॉक्टर का नाम",
        "hinglish": "Doctor Name"
    },
    {
        "en": "Edit Profile",
        "hi": "प्रोफाइल संपादित करें",
        "hinglish": "Profile Edit Karein"
    },
    {
        "en": "Edit Practitioner Profile",
        "hi": "चिकित्सक प्रोफाइल संपादित करें",
        "hinglish": "Doctor Profile Edit Karein"
    },
    {
        "en": "Practitioner Information",
        "hi": "चिकित्सक जानकारी",
        "hinglish": "Practitioner Information"
    },
    {
        "en": "Specialization",
        "hi": "विशेषज्ञता",
        "hinglish": "Specialization"
    },
    {
        "en": "Medical Registration Number",
        "hi": "मेडिकल पंजीकरण संख्या",
        "hinglish": "Medical Registration Number"
    },
    {
        "en": "Hospital Affiliation",
        "hi": "अस्पताल संबद्धता",
        "hinglish": "Hospital Affiliation"
    },
    {
        "en": "Save Changes",
        "hi": "बदलाव सहेजें",
        "hinglish": "Changes Save Karein"
    },
    {
        "en": "Create Account",
        "hi": "खाता बनाएं",
        "hinglish": "Account Banayein"
    },
    {
        "en": "Create Account | SWASTHAI",
        "hi": "खाता बनाएं | स्वास्थ AI",
        "hinglish": "Create Account | SWASTHAI"
    },
    {
        "en": "Create Account 🚀",
        "hi": "खाता बनाएं 🚀",
        "hinglish": "Account Banayein 🚀"
    },
    {
        "en": "Start using SWASTHAI today.",
        "hi": "आज ही स्वास्थ AI का उपयोग शुरू करें।",
        "hinglish": "Aaj hi SWASTHAI use karna shuru karein."
    },
    {
        "en": "JOIN THE PLATFORM",
        "hi": "प्लेटफ़ॉर्म से जुड़ें",
        "hinglish": "JOIN THE PLATFORM"
    },
    {
        "en": "Build Better Patient Case Documentation",
        "hi": "मरीज़ केस दस्तावेज़ीकरण को बनाएं बेहतर",
        "hinglish": "Build Better Patient Case Documentation"
    },
    {
        "en": "Build Better Patient",
        "hi": "मरीज़ स्वास्थ्य सेवा को बनाएं बेहतर",
        "hinglish": "Build Better Patient Care"
    },
    {
        "en": "Create your practitioner account and start managing patient cases with intelligent tools.",
        "hi": "अपना चिकित्सक खाता बनाएं और स्मार्ट टूल्स के साथ मरीज़ केस प्रबंधित करना शुरू करें।",
        "hinglish": "Practitioner account banayein aur cases manage karein."
    },
    {
        "en": "Secure Case Documentation",
        "hi": "सुरक्षित केस दस्तावेज़ीकरण",
        "hinglish": "Secure Case Documentation"
    },
    {
        "en": "AI-Powered Insights",
        "hi": "AI-संचालित विश्लेषण",
        "hinglish": "AI-Powered Insights"
    },
    {
        "en": "AI-Powered Case Intelligence",
        "hi": "AI-संचालित केस बुद्धिमत्ता",
        "hinglish": "AI Case Intelligence"
    },
    {
        "en": "AYUSH Focused System",
        "hi": "आयुष केंद्रित प्रणाली",
        "hinglish": "AYUSH Focused System"
    },
    {
        "en": "Sign In",
        "hi": "साइन इन करें",
        "hinglish": "Sign In"
    },
    {
        "en": "Already have an account?",
        "hi": "क्या पहले से खाता है?",
        "hinglish": "Kya pehle se account hai?"
    },
    {
        "en": "Already have an account? Sign In",
        "hi": "क्या पहले से खाता है? साइन इन करें",
        "hinglish": "Already account hai? Sign In"
    },
    {
        "en": "Create Password",
        "hi": "पासवर्ड बनाएं",
        "hinglish": "Password Banayein"
    },
    {
        "en": "Create password",
        "hi": "पासवर्ड बनाएं",
        "hinglish": "Password create karein"
    },
    {
        "en": "Enter your full name",
        "hi": "अपना पूरा नाम दर्ज करें",
        "hinglish": "Full name enter karein"
    },
    {
        "en": "Login to Doctor Dashboard",
        "hi": "डॉक्टर डैशबोर्ड में लॉगिन करें",
        "hinglish": "Doctor Dashboard me login karein"
    },
    {
        "en": "Back to Home",
        "hi": "होम पर वापस जाएं",
        "hinglish": "Home par wapas jayein"
    },
    {
        "en": "होम (Home)",
        "hi": "होम",
        "hinglish": "Home"
    },
    {
        "en": "Home",
        "hi": "होम",
        "hinglish": "Home"
    },
    {
        "en": "Patient Health Portal Login",
        "hi": "मरीज़ स्वास्थ्य पोर्टल लॉगिन",
        "hinglish": "Patient Health Portal Login"
    },
    {
        "en": "Keep your diseases, symptoms & past prescriptions safe",
        "hi": "अपनी बीमारी, लक्षण व पुराने डॉक्टर के पर्चे सुरक्षित रखें",
        "hinglish": "Apni bimari aur parchayein safe rakhein"
    },
    {
        "en": "Patient Login",
        "hi": "मरीज़ लॉगिन",
        "hinglish": "Patient Login"
    },
    {
        "en": "Register New Account",
        "hi": "नया खाता बनाएं",
        "hinglish": "Naya Account"
    },
    {
        "en": "Patient ID or Mobile Number",
        "hi": "Patient ID या मोबाइल नंबर",
        "hinglish": "Patient ID ya Mobile Number"
    },
    {
        "en": "Password",
        "hi": "पासवर्ड",
        "hinglish": "Password"
    },
    {
        "en": "Password (Password)",
        "hi": "पासवर्ड",
        "hinglish": "Password"
    },
    {
        "en": "Default Demo Password:",
        "hi": "डिफ़ॉल्ट डेमो पासवर्ड:",
        "hinglish": "Default Demo Password:"
    },
    {
        "en": "Enter Portal",
        "hi": "पोर्टल में प्रवेश करें",
        "hinglish": "Portal me Enter Karein"
    },
    {
        "en": "Enter Portal (Enter Portal)",
        "hi": "पोर्टल में प्रवेश करें",
        "hinglish": "Portal me Enter Karein"
    },
    {
        "en": "Are you a doctor or clinic?",
        "hi": "क्या आप डॉक्टर या क्लिनिक हैं?",
        "hinglish": "Kya aap doctor ya clinic hain?"
    },
    {
        "en": "Are you a doctor or hospital clinic?",
        "hi": "क्या आप डॉक्टर या अस्पताल क्लिनिक हैं?",
        "hinglish": "Kya aap doctor ya clinic hain?"
    },
    {
        "en": "Open Doctor & Hospital Login",
        "hi": "डॉक्टर व अस्पताल लॉगिन खोलें",
        "hinglish": "Doctor & Hospital Login Kholein"
    },
    {
        "en": "Doctor & Hospital Login | SWASTHAI स्वास्थ AI",
        "hi": "डॉक्टर व अस्पताल लॉगिन | स्वास्थ AI",
        "hinglish": "Doctor & Hospital Login | SWASTHAI"
    },
    {
        "en": "Doctor & Hospital Portal Login",
        "hi": "डॉक्टर व अस्पताल पोर्टल लॉगिन",
        "hinglish": "Doctor & Hospital Portal Login"
    },
    {
        "en": "Access Clinical AI review, Red-Flag alerts & patient history",
        "hi": "क्लिनिकल AI समीक्षा, रेड-फ्लैग अलर्ट एवं मरीज़ रिकॉर्ड एक्सेस करें",
        "hinglish": "Clinical AI review aur alerts access karein"
    },
    {
        "en": "Hospital / Clinic Name",
        "hi": "अस्पताल / क्लिनिक का नाम",
        "hinglish": "Hospital / Clinic Name"
    },
    {
        "en": "अस्पताल / क्लिनिक का नाम (Hospital / Clinic Name) *",
        "hi": "अस्पताल / क्लिनिक का नाम *",
        "hinglish": "Hospital / Clinic Name *"
    },
    {
        "en": "अस्पताल का नाम (Hospital / Clinic Name) *",
        "hi": "अस्पताल का नाम *",
        "hinglish": "Hospital Name *"
    },
    {
        "en": "डॉक्टर आईडी (Doctor ID / License No.) या ईमेल *",
        "hi": "डॉक्टर आईडी या ईमेल *",
        "hinglish": "Doctor ID ya Email *"
    },
    {
        "en": "डॉक्टर का पूरा नाम (Doctor Full Name) *",
        "hi": "डॉक्टर का पूरा नाम *",
        "hinglish": "Doctor Full Name *"
    },
    {
        "en": "मेडिकल लाइसेंस नं. (Medical Reg. No) *",
        "hi": "मेडिकल लाइसेंस नं. *",
        "hinglish": "Medical Reg. No *"
    },
    {
        "en": "स्पेशलाइजेशन (Specialty) *",
        "hi": "विशेषज्ञता (Specialty) *",
        "hinglish": "Specialty *"
    },
    {
        "en": "नया पासवर्ड बनाएं (Create Password) *",
        "hi": "नया पासवर्ड बनाएं *",
        "hinglish": "Naya Password Banayein *"
    },
    {
        "en": "पासवर्ड बनाएं (Create Password) *",
        "hi": "पासवर्ड बनाएं *",
        "hinglish": "Password Banayein *"
    },
    {
        "en": "पंजीकरण करें व प्रवेश करें (Register Hospital & Login)",
        "hi": "पंजीकरण करें व प्रवेश करें",
        "hinglish": "Register & Login"
    },
    {
        "en": "खाता बनाएं व प्रवेश करें (Register & Login)",
        "hi": "खाता बनाएं व प्रवेश करें",
        "hinglish": "Register & Login"
    },
    {
        "en": "डॉक्टर डैशबोर्ड में प्रवेश करें (Enter Workspace)",
        "hi": "डॉक्टर डैशबोर्ड में प्रवेश करें",
        "hinglish": "Doctor Dashboard me Enter Karein"
    },
    {
        "en": "मरीज़ पोर्टल लॉगिन (Patient Login) →",
        "hi": "मरीज़ पोर्टल लॉगिन →",
        "hinglish": "Patient Login →"
    },
    {
        "en": "क्या आप मरीज़ हैं? (Are you a patient?)",
        "hi": "क्या आप मरीज़ हैं?",
        "hinglish": "Kya aap patient hain?"
    },
    {
        "en": "मरीज़ लॉगिन / त्वरित पंजीकरण",
        "hi": "मरीज़ लॉगिन / त्वरित पंजीकरण",
        "hinglish": "Patient Login / Fast Register"
    },
    {
        "en": "मरीज़ का पूरा नाम (Full Name) *",
        "hi": "मरीज़ का पूरा नाम *",
        "hinglish": "Patient Full Name *"
    },
    {
        "en": "मरीज़ का पूरा नाम (Patient Full Name)",
        "hi": "मरीज़ का पूरा नाम",
        "hinglish": "Patient Full Name"
    },
    {
        "en": "मोबाइल नंबर (Mobile Number) *",
        "hi": "मोबाइल नंबर *",
        "hinglish": "Mobile Number *"
    },
    {
        "en": "ईमेल या मोबाइल नंबर (Email / Mobile) *",
        "hi": "ईमेल या मोबाइल नंबर *",
        "hinglish": "Email / Mobile *"
    },
    {
        "en": "कम से कम 4 अक्षर का पासवर्ड",
        "hi": "कम से कम 4 अक्षर का पासवर्ड",
        "hinglish": "Kam se kam 4 digits ka password"
    },
    {
        "en": "पासवर्ड दर्ज करें",
        "hi": "पासवर्ड दर्ज करें",
        "hinglish": "Password enter karein"
    },
    {
        "en": "मोबाइल नंबर / Patient ID",
        "hi": "मोबाइल नंबर / Patient ID",
        "hinglish": "Mobile Number / Patient ID"
    },
    {
        "en": "Duration",
        "hi": "अवधि",
        "hinglish": "Duration"
    },
    {
        "en": "Duration:",
        "hi": "अवधि:",
        "hinglish": "Duration:"
    },
    {
        "en": "Time:",
        "hi": "समय:",
        "hinglish": "Time:"
    },
    {
        "en": "Symptoms",
        "hi": "लक्षण",
        "hinglish": "Symptoms"
    },
    {
        "en": "Symptoms:",
        "hi": "लक्षण:",
        "hinglish": "Symptoms:"
    },
    {
        "en": "Severity",
        "hi": "तीव्रता",
        "hinglish": "Severity"
    },
    {
        "en": "Severity:",
        "hi": "तीव्रता:",
        "hinglish": "Severity:"
    },
    {
        "en": "Doctor:",
        "hi": "डॉक्टर:",
        "hinglish": "Doctor:"
    },
    {
        "en": "Clinic/Hospital:",
        "hi": "क्लिनिक/अस्पताल:",
        "hinglish": "Clinic/Hospital:"
    },
    {
        "en": "Diagnosis:",
        "hi": "बीमारी:",
        "hinglish": "Diagnosis:"
    },
    {
        "en": "Year/Date:",
        "hi": "साल/तारीख:",
        "hinglish": "Year/Date:"
    },
    {
        "en": "Medicines:",
        "hi": "दवाइयां:",
        "hinglish": "Medicines:"
    },
    {
        "en": "Advice/Tests:",
        "hi": "सलाह/जांच:",
        "hinglish": "Advice/Tests:"
    },
    {
        "en": "Formulation:",
        "hi": "औषधि:",
        "hinglish": "Formulation:"
    },
    {
        "en": "Dosage:",
        "hi": "मात्रा:",
        "hinglish": "Dosage:"
    },
    {
        "en": "Frequency:",
        "hi": "आवृत्ति:",
        "hinglish": "Frequency:"
    },
    {
        "en": "Instructions:",
        "hi": "निर्देश:",
        "hinglish": "Instructions:"
    },
    {
        "en": "Value:",
        "hi": "मान:",
        "hinglish": "Value:"
    },
    {
        "en": "Save",
        "hi": "सुरक्षित करें",
        "hinglish": "Save"
    },
    {
        "en": "Submit",
        "hi": "जमा करें",
        "hinglish": "Submit"
    },
    {
        "en": "Back",
        "hi": "वापस जाएं",
        "hinglish": "Back"
    },
    {
        "en": "Edit",
        "hi": "संपादित करें",
        "hinglish": "Edit"
    },
    {
        "en": "Delete",
        "hi": "हटाएं",
        "hinglish": "Delete"
    },
    {
        "en": "Close",
        "hi": "बंद करें",
        "hinglish": "Close"
    },
    {
        "en": "Confirm",
        "hi": "पुष्टि करें",
        "hinglish": "Confirm"
    },
    {
        "en": "Reject",
        "hi": "अस्वीकार करें",
        "hinglish": "Reject"
    },
    {
        "en": "Refresh",
        "hi": "रीफ्रेश करें",
        "hinglish": "Refresh"
    },
    {
        "en": "Reset",
        "hi": "रीसेट करें",
        "hinglish": "Reset"
    },
    {
        "en": "Continue",
        "hi": "जारी रखें",
        "hinglish": "Continue"
    },
    {
        "en": "Yes, Correct",
        "hi": "हाँ, सही है",
        "hinglish": "Haan, Sahi hai"
    },
    {
        "en": "Understood",
        "hi": "समझ गए",
        "hinglish": "Samajh gaye"
    },
    {
        "en": "Repeat",
        "hi": "दोहराएं",
        "hinglish": "Repeat"
    },
    {
        "en": "Read Question",
        "hi": "प्रश्न पढ़ें",
        "hinglish": "Question Padhein"
    },
    {
        "en": "View Source",
        "hi": "स्रोत देखें",
        "hinglish": "Source Dekhein"
    },
    {
        "en": "View Patients",
        "hi": "मरीज़ देखें",
        "hinglish": "Patients Dekhein"
    },
    {
        "en": "Source",
        "hi": "स्रोत",
        "hinglish": "Source"
    },
    {
        "en": "Reason",
        "hi": "कारण",
        "hinglish": "Reason"
    },
    {
        "en": "Ready",
        "hi": "तैयार",
        "hinglish": "Ready"
    },
    {
        "en": "Ready to assist you",
        "hi": "आपकी सहायता के लिए तैयार",
        "hinglish": "Aapki help ke liye ready"
    },
    {
        "en": "Ready to listen",
        "hi": "सुनने के लिए तैयार",
        "hinglish": "Sunne ke liye ready"
    },
    {
        "en": "Interviewing",
        "hi": "साक्षात्कार जारी",
        "hinglish": "Interviewing"
    },
    {
        "en": "Intermittent",
        "hi": "रुक-रुक कर",
        "hinglish": "Ruk-ruk kar"
    },
    {
        "en": "Continuous",
        "hi": "लगातार",
        "hinglish": "Lagaataar"
    },
    {
        "en": "Progressively Increasing",
        "hi": "लगातार बढ़ता हुआ",
        "hinglish": "Dheere dheere badhta hua"
    },
    {
        "en": "Improving",
        "hi": "सुधार हो रहा है",
        "hinglish": "Sudhar ho raha hai"
    },
    {
        "en": "Fatigue",
        "hi": "थकान",
        "hinglish": "Thakaan"
    },
    {
        "en": "Hypertension",
        "hi": "उच्च रक्तचाप (Hypertension)",
        "hinglish": "High BP"
    },
    {
        "en": "Heart Disease",
        "hi": "हृदय रोग",
        "hinglish": "Heart Problem"
    },
    {
        "en": "Cancer",
        "hi": "कैंसर",
        "hinglish": "Cancer"
    },
    {
        "en": "Diabetes",
        "hi": "मधुमेह (शुगर)",
        "hinglish": "Sugar"
    },
    {
        "en": "Asthma",
        "hi": "दमा (अस्थमा)",
        "hinglish": "Asthma"
    },
    {
        "en": "Arthritis",
        "hi": "गठिया (Arthritis)",
        "hinglish": "Arthritis"
    },
    {
        "en": "Mild",
        "hi": "हल्का",
        "hinglish": "Mild"
    },
    {
        "en": "Moderate",
        "hi": "मध्यम",
        "hinglish": "Moderate"
    },
    {
        "en": "Severe",
        "hi": "गंभीर",
        "hinglish": "Severe"
    },
    {
        "en": "हल्का (Mild)",
        "hi": "हल्का",
        "hinglish": "Mild"
    },
    {
        "en": "मध्यम (Moderate)",
        "hi": "मध्यम",
        "hinglish": "Moderate"
    },
    {
        "en": "गंभीर (Severe)",
        "hi": "गंभीर",
        "hinglish": "Severe"
    },
    {
        "en": "Ayurveda Practitioner",
        "hi": "आयुर्वेद चिकित्सक",
        "hinglish": "Ayurveda Practitioner"
    },
    {
        "en": "Yoga Practitioner",
        "hi": "योग चिकित्सक",
        "hinglish": "Yoga Practitioner"
    },
    {
        "en": "Yoga & Naturopathy Practitioner",
        "hi": "योग एवं प्राकृतिक चिकित्सा चिकित्सक",
        "hinglish": "Yoga & Naturopathy"
    },
    {
        "en": "Unani Practitioner",
        "hi": "यूनानी चिकित्सक",
        "hinglish": "Unani Practitioner"
    },
    {
        "en": "Siddha Practitioner",
        "hi": "सिद्ध चिकित्सक",
        "hinglish": "Siddha Practitioner"
    },
    {
        "en": "Homeopathy Practitioner",
        "hi": "होम्योपैथी चिकित्सक",
        "hinglish": "Homeopathy Practitioner"
    },
    {
        "en": "No self-reported diseases on file.",
        "hi": "अभी कोई बीमारी दर्ज नहीं है।",
        "hinglish": "Abhi koi bimari recorded nahi hai."
    },
    {
        "en": "No previous doctor consultations recorded.",
        "hi": "अभी कोई पुराना रिकॉर्ड दर्ज नहीं है।",
        "hinglish": "Abhi koi purana record nahi hai."
    },
    {
        "en": "No prescriptions issued yet.",
        "hi": "डॉक्टर द्वारा कोई दवा अभी जांची नहीं गई है।",
        "hinglish": "Doctor dwara koi dawai verify nahi hui hai."
    },
    {
        "en": "No stopped medications recorded for this patient.",
        "hi": "इस मरीज़ के लिए कोई रोकी गई दवा दर्ज नहीं है।",
        "hinglish": "Koi stopped medication nahi hai."
    },
    {
        "en": "No patient cases match your search criteria.",
        "hi": "आपकी खोज के अनुसार कोई मरीज़ केस नहीं मिला।",
        "hinglish": "Aapke search ke mutabik koi case nahi mila."
    },
    {
        "en": "No Cases Found",
        "hi": "कोई केस नहीं मिला",
        "hinglish": "Koi Case Nahi Mila"
    },
    {
        "en": "ABDM / Clinical AI Aligned",
        "hi": "एबीडीएम / क्लिनिकल AI के अनुरूप",
        "hinglish": "ABDM / Clinical AI Aligned"
    },
    {
        "en": "AI GENERATED",
        "hi": "AI द्वारा जनरेट",
        "hinglish": "AI GENERATED"
    },
    {
        "en": "AI Generated",
        "hi": "AI द्वारा जनरेट",
        "hinglish": "AI Generated"
    },
    {
        "en": "AI Insights",
        "hi": "AI इनसाइट्स",
        "hinglish": "AI Insights"
    },
    {
        "en": "AI Mapped Entities",
        "hi": "AI मैप किए गए तथ्य",
        "hinglish": "AI Mapped Entities"
    },
    {
        "en": "AI Summary Ready",
        "hi": "AI सारांश तैयार है",
        "hinglish": "AI Summary Ready"
    },
    {
        "en": "AI is analyzing the patient case...",
        "hi": "AI मरीज़ केस का विश्लेषण कर रहा है...",
        "hinglish": "AI patient case analyze kar raha hai..."
    },
    {
        "en": "AI understood: ... Is this accurate?",
        "hi": "AI ने समझा: ... क्या यह सही है?",
        "hinglish": "AI ne samjha: ... Kya yeh sahi hai?"
    },
    {
        "en": "AI रिपोर्ट व्यवस्थापक:",
        "hi": "AI रिपोर्ट व्यवस्थापक:",
        "hinglish": "AI Report Arranger:"
    },
    {
        "en": "AI सरल भाषा समझ:",
        "hi": "AI सरल भाषा समझ:",
        "hinglish": "AI Simple Language:"
    },
    {
        "en": "AI-generated observations are intended to support",
        "hi": "AI द्वारा जनरेट अवलोकन केस दस्तावेज़ीकरण",
        "hinglish": "AI observations case documentation"
    },
    {
        "en": "case documentation and practitioner review.",
        "hi": "और चिकित्सक समीक्षा में सहायता के लिए हैं।",
        "hinglish": "aur doctor review ke liye hain."
    },
    {
        "en": "They are not a substitute for professional clinical",
        "hi": "वे पेशेवर क्लिनिकल निर्णय",
        "hinglish": "Yeh professional clinical diagnosis ka"
    },
    {
        "en": "judgement or diagnosis.",
        "hi": "या निदान का विकल्प नहीं हैं।",
        "hinglish": "substitute nahi hain."
    },
    {
        "en": "AYUSH Assessment",
        "hi": "आयुष मूल्यांकन",
        "hinglish": "AYUSH Assessment"
    },
    {
        "en": "AYUSH Doctor Login",
        "hi": "आयुष डॉक्टर लॉगिन",
        "hinglish": "AYUSH Doctor Login"
    },
    {
        "en": "AYUSH Observation",
        "hi": "आयुष अवलोकन",
        "hinglish": "AYUSH Observation"
    },
    {
        "en": "AYUSH Prakriti Assessment",
        "hi": "आयुष प्रकृति मूल्यांकन",
        "hinglish": "AYUSH Prakriti Assessment"
    },
    {
        "en": "Account Status",
        "hi": "खाता स्थिति",
        "hinglish": "Account Status"
    },
    {
        "en": "Action Performed",
        "hi": "की गई कार्रवाई",
        "hinglish": "Action Performed"
    },
    {
        "en": "Acute Right Upper Quadrant Abdominal Pain with Moderate Fever",
        "hi": "मध्यम बुखार के साथ पेट के ऊपरी दाहिने हिस्से में तेज़ दर्द",
        "hinglish": "Acute Abdominal Pain with Fever"
    },
    {
        "en": "Additional Family History",
        "hi": "अतिरिक्त पारिवारिक इतिहास",
        "hinglish": "Additional Family History"
    },
    {
        "en": "All Prakriti",
        "hi": "सभी प्रकृतियां",
        "hinglish": "All Prakriti"
    },
    {
        "en": "Allergies:",
        "hi": "एलर्जी:",
        "hinglish": "Allergies:"
    },
    {
        "en": "Analysis Confidence",
        "hi": "विश्लेषण विश्वास स्तर",
        "hinglish": "Analysis Confidence"
    },
    {
        "en": "Appendectomy (2012)",
        "hi": "अपेंडिक्स सर्जरी (2012)",
        "hinglish": "Appendectomy (2012)"
    },
    {
        "en": "Attention Flags",
        "hi": "चेतावनी ध्वज",
        "hinglish": "Attention Flags"
    },
    {
        "en": "Awaiting Dr.",
        "hi": "डॉक्टर की प्रतीक्षा",
        "hinglish": "Awaiting Doctor"
    },
    {
        "en": "Basic Medical Information",
        "hi": "बुनियादी चिकित्सीय जानकारी",
        "hinglish": "Basic Medical Information"
    },
    {
        "en": "Blood Group:",
        "hi": "रक्त समूह:",
        "hinglish": "Blood Group:"
    },
    {
        "en": "CURRENT MEDICATIONS",
        "hi": "वर्तमान दवाइयां",
        "hinglish": "CURRENT MEDICATIONS"
    },
    {
        "en": "Caregiver Assisting (Meena Patel)",
        "hi": "देखभालकर्ता सहायता (मीना पटेल)",
        "hinglish": "Caregiver Assisting (Meena Patel)"
    },
    {
        "en": "Caregiver Consent:",
        "hi": "देखभालकर्ता सहमति:",
        "hinglish": "Caregiver Consent:"
    },
    {
        "en": "Case Documentation",
        "hi": "केस दस्तावेज़ीकरण",
        "hinglish": "Case Documentation"
    },
    {
        "en": "Case ID",
        "hi": "केस ID",
        "hinglish": "Case ID"
    },
    {
        "en": "Chief Complaint & Symptoms",
        "hi": "मुख्य समस्या व लक्षण",
        "hinglish": "Chief Complaint & Symptoms"
    },
    {
        "en": "Choose an existing patient or register a new one.",
        "hi": "मौजूदा मरीज़ चुनें या नया पंजीकृत करें।",
        "hinglish": "Existing patient chunein ya naya register karein."
    },
    {
        "en": "Choose the language before starting voice recognition.",
        "hi": "आवाज़ पहचान शुरू करने से पहले भाषा चुनें।",
        "hinglish": "Voice recognition se pehle language chunein."
    },
    {
        "en": "Click Generate Summary to create a structured",
        "hi": "संरचित केस अवलोकन बनाने के लिए",
        "hinglish": "Structured overview ke liye"
    },
    {
        "en": "case overview.",
        "hi": "केस सारांश जनरेट करें पर क्लिक करें।",
        "hinglish": "Generate Summary par click karein."
    },
    {
        "en": "Click the microphone or type natural statements in Hinglish like",
        "hi": "माइक पर क्लिक करें या हिंग्लिश में स्वाभाविक वाक्य लिखें जैसे",
        "hinglish": "Mic par click karein ya simple bhasha me bolein jaise"
    },
    {
        "en": "Common Symptoms:",
        "hi": "सामान्य लक्षण:",
        "hinglish": "Common Symptoms:"
    },
    {
        "en": "Compare sequential test values and observe chronological trends.",
        "hi": "क्रमिक परीक्षण मानों की तुलना करें और रुझान देखें।",
        "hinglish": "Lab test values compare karein."
    },
    {
        "en": "Comprehensive Clinical Health Timeline",
        "hi": "व्यापक क्लिनिकल स्वास्थ्य टाइमलाइन",
        "hinglish": "Comprehensive Health Timeline"
    },
    {
        "en": "Confidence is based on completeness",
        "hi": "विश्वास स्तर दर्ज जानकारी की पूर्णता",
        "hinglish": "Confidence information ki completeness"
    },
    {
        "en": "and consistency of entered information.",
        "hi": "और निरंतरता पर आधारित है।",
        "hinglish": "aur consistency par based hai."
    },
    {
        "en": "Create New Case",
        "hi": "नया केस बनाएं",
        "hinglish": "Naya Case Banayein"
    },
    {
        "en": "Create Patient Profile",
        "hi": "मरीज़ प्रोफ़ाइल बनाएं",
        "hinglish": "Patient Profile Banayein"
    },
    {
        "en": "Create your practitioner account and start",
        "hi": "अपना चिकित्सक खाता बनाएं और स्मार्ट टूल्स के साथ",
        "hinglish": "Practitioner account banayein aur"
    },
    {
        "en": "managing patient cases with intelligent tools.",
        "hi": "मरीज़ केस प्रबंधित करना शुरू करें।",
        "hinglish": "cases manage karna shuru karein."
    },
    {
        "en": "Demographics, chief complaints, symptom characteristics, medication history, adverse drug reactions, and AYUSH Prakriti notes entered during consultation.",
        "hi": "परामर्श के दौरान दर्ज जनसांख्यिकी, मुख्य समस्याएं, लक्षण, दवा इतिहास, प्रतिकूल प्रतिक्रियाएं और आयुष प्रकृति नोट्स।",
        "hinglish": "Consultation notes aur patient history."
    },
    {
        "en": "Digitize patient case-taking, organize clinical",
        "hi": "मरीज़ केस-टेकिंग को डिजिटल बनाएं, क्लिनिकल",
        "hinglish": "Patient case-taking ko digitize karein,"
    },
    {
        "en": "records and get intelligent assistance throughout",
        "hi": "रिकॉर्ड व्यवस्थित करें और परामर्श प्रक्रिया के दौरान",
        "hinglish": "records organize karein aur consultation me"
    },
    {
        "en": "the consultation process.",
        "hi": "बुद्धिमान सहायता प्राप्त करें।",
        "hinglish": "intelligent help paayein."
    },
    {
        "en": "Doctor Email",
        "hi": "डॉक्टर ईमेल",
        "hinglish": "Doctor Email"
    },
    {
        "en": "Doctor Verified Safety Record",
        "hi": "डॉक्टर सत्यापित सुरक्षा रिकॉर्ड",
        "hinglish": "Doctor Verified Safety Record"
    },
    {
        "en": "Document Extraction & Lab Report Comparison",
        "hi": "दस्तावेज़ निष्कर्षण एवं लैब रिपोर्ट तुलना",
        "hinglish": "Document Extraction & Report Comparison"
    },
    {
        "en": "Does NOT automatically alter or prescribe medication",
        "hi": "दवा को स्वचालित रूप से बदलता या लिखता नहीं है",
        "hinglish": "Dawai automatically prescribe nahi karta"
    },
    {
        "en": "Dose",
        "hi": "खुराक",
        "hinglish": "Dose"
    },
    {
        "en": "Duration / Onset:",
        "hi": "अवधि / शुरुआत:",
        "hinglish": "Duration / Onset:"
    },
    {
        "en": "Enter the patient's information to create a secure",
        "hi": "सुरक्षित डिजिटल स्वास्थ्य प्रोफ़ाइल बनाने के लिए",
        "hinglish": "Secure digital profile banane ke liye"
    },
    {
        "en": "digital healthcare profile.",
        "hi": "मरीज़ की जानकारी दर्ज करें।",
        "hinglish": "patient information enter karein."
    },
    {
        "en": "Essential Hypertension for 5 years",
        "hi": "5 वर्षों से उच्च रक्तचाप (Hypertension)",
        "hinglish": "5 saal se High BP"
    },
    {
        "en": "Existing Conditions",
        "hi": "मौजूदा स्थितियां",
        "hinglish": "Existing Conditions"
    },
    {
        "en": "Family",
        "hi": "परिवार",
        "hinglish": "Family"
    },
    {
        "en": "Fast Credential Auto-Fill",
        "hi": "त्वरित क्रेडेंशियल ऑटो-फ़िल",
        "hinglish": "Fast Auto-Fill"
    },
    {
        "en": "Field / Entity",
        "hi": "फ़ील्ड / तथ्य",
        "hinglish": "Field / Entity"
    },
    {
        "en": "Follow-up scheduling can improve patient",
        "hi": "फॉलो-अप निर्धारण से मरीज़ निगरानी",
        "hinglish": "Follow-up scheduling se patient monitoring"
    },
    {
        "en": "monitoring and case continuity.",
        "hi": "और केस निरंतरता में सुधार होता है।",
        "hinglish": "improve hoti hai."
    },
    {
        "en": "GRANTED (Meena Patel)",
        "hi": "स्वीकृत (मीना पटेल)",
        "hinglish": "GRANTED (Meena Patel)"
    },
    {
        "en": "Generate AI Insight",
        "hi": "AI इनसाइट जनरेट करें",
        "hinglish": "AI Insight Generate Karein"
    },
    {
        "en": "Generate Analysis",
        "hi": "विश्लेषण जनरेट करें",
        "hinglish": "Analysis Generate Karein"
    },
    {
        "en": "Healthcare Insights",
        "hi": "स्वास्थ्य अंतर्दृष्टि",
        "hinglish": "Healthcare Insights"
    },
    {
        "en": "Hello Doctor! 👋 I can help you structure",
        "hi": "नमस्ते डॉक्टर! 👋 मैं मरीज़ केस को व्यवस्थित करने",
        "hinglish": "Hello Doctor! 👋 Main patient cases structure karne"
    },
    {
        "en": "patient cases and suggest relevant questions.",
        "hi": "और प्रासंगिक प्रश्नों के सुझाव देने में मदद कर सकता हूँ।",
        "hinglish": "aur relevant questions suggest karne me help kar sakta hu."
    },
    {
        "en": "Illness",
        "hi": "बीमारी",
        "hinglish": "Illness"
    },
    {
        "en": "Immediate Attention",
        "hi": "तत्काल ध्यान",
        "hinglish": "Immediate Attention"
    },
    {
        "en": "Intelligent Case Taking",
        "hi": "बुद्धिमान केस-टेकिंग",
        "hinglish": "Intelligent Case Taking"
    },
    {
        "en": "Lab Reports",
        "hi": "लैब रिपोर्ट्स",
        "hinglish": "Lab Reports"
    },
    {
        "en": "Lifestyle",
        "hi": "जीवनशैली",
        "hinglish": "Lifestyle"
    },
    {
        "en": "Liver Function Test (LFT) Report",
        "hi": "लिवर फंक्शन टेस्ट (LFT) रिपोर्ट",
        "hinglish": "Liver Function Test (LFT) Report"
    },
    {
        "en": "Load Demo: Rajesh Patel",
        "hi": "डेमो लोड करें: राजेश पटेल",
        "hinglish": "Demo Load Karein: Rajesh Patel"
    },
    {
        "en": "Location:",
        "hi": "स्थान:",
        "hinglish": "Location:"
    },
    {
        "en": "Manage clinical data governance, role access boundaries, and consent transparency.",
        "hi": "क्लिनिकल डेटा प्रशासन, भूमिका पहुंच और सहमति पारदर्शिता प्रबंधित करें।",
        "hinglish": "Clinical data governance manage karein."
    },
    {
        "en": "Medical History & AYUSH Assessment",
        "hi": "चिकित्सीय इतिहास एवं आयुष मूल्यांकन",
        "hinglish": "Medical History & AYUSH Assessment"
    },
    {
        "en": "Medication Reconciliation",
        "hi": "दवा मिलान (Medication Reconciliation)",
        "hinglish": "Medication Reconciliation"
    },
    {
        "en": "Medicine Name",
        "hi": "दवा का नाम",
        "hinglish": "Medicine Name"
    },
    {
        "en": "Metabolism & transformation characteristics",
        "hi": "चयापचय और परिवर्तन विशेषताएं",
        "hinglish": "Metabolism characteristics"
    },
    {
        "en": "Missing Information",
        "hi": "अनुपलब्ध जानकारी",
        "hinglish": "Missing Information"
    },
    {
        "en": "Mixed",
        "hi": "मिश्रित",
        "hinglish": "Mixed"
    },
    {
        "en": "Mobile Contact",
        "hi": "मोबाइल संपर्क",
        "hinglish": "Mobile Contact"
    },
    {
        "en": "Movement & energy characteristics",
        "hi": "गति और ऊर्जा विशेषताएं",
        "hinglish": "Movement characteristics"
    },
    {
        "en": "New This Month",
        "hi": "इस महीने नए",
        "hinglish": "New This Month"
    },
    {
        "en": "Normalized Structured Clinical Case",
        "hi": "सामान्यीकृत संरचित क्लिनिकल केस",
        "hinglish": "Normalized Clinical Case"
    },
    {
        "en": "Only authenticated AYUSH practitioners and authorized caregivers granted explicit consent by the patient.",
        "hi": "केवल प्रमाणित आयुष चिकित्सक और अधिकृत देखभालकर्ता जिन्हें मरीज़ द्वारा स्पष्ट सहमति दी गई है।",
        "hinglish": "Only authenticated doctors aur authorized caregivers."
    },
    {
        "en": "Open AI Assistant",
        "hi": "AI सहायक खोलें",
        "hinglish": "Open AI Assistant"
    },
    {
        "en": "Original Conversation Transcript",
        "hi": "मूल बातचीत ट्रांसक्रिप्ट",
        "hinglish": "Original Transcript"
    },
    {
        "en": "PAST MEDICAL HISTORY",
        "hi": "पिछला चिकित्सीय इतिहास",
        "hinglish": "PAST MEDICAL HISTORY"
    },
    {
        "en": "PRACTITIONER REVIEW",
        "hi": "चिकित्सक समीक्षा",
        "hinglish": "PRACTITIONER REVIEW"
    },
    {
        "en": "Past Doctor Consultations & Old Clinic Data (पुराने डॉक्टर का डेटा)",
        "hi": "पुराने डॉक्टर का डेटा व परामर्श",
        "hinglish": "Purane Doctor ka Data"
    },
    {
        "en": "Patient Case Records",
        "hi": "मरीज़ केस रिकॉर्ड",
        "hinglish": "Patient Case Records"
    },
    {
        "en": "Patient Login & Register | SWASTHAI स्वास्थ AI",
        "hi": "मरीज़ लॉगिन व पंजीकरण | स्वास्थ AI",
        "hinglish": "Patient Login & Register | SWASTHAI"
    },
    {
        "en": "Patient case registrations have increased",
        "hi": "पिछले महीने की तुलना में मरीज़ केस",
        "hinglish": "Patient case registrations"
    },
    {
        "en": "compared to the previous month.",
        "hi": "पंजीकरण में वृद्धि हुई है।",
        "hinglish": "increase hue hain."
    },
    {
        "en": "Patient-Reported Diseases & Current Symptoms (मरीज़ द्वारा बताई गई बीमारी)",
        "hi": "मरीज़ द्वारा बताई गई बीमारी व वर्तमान लक्षण",
        "hinglish": "Patient-Reported Diseases & Symptoms"
    },
    {
        "en": "Patients | SWASTHAI",
        "hi": "मरीज़ सूची | स्वास्थ AI",
        "hinglish": "Patients | SWASTHAI"
    },
    {
        "en": "Personal",
        "hi": "व्यक्तिगत",
        "hinglish": "Personal"
    },
    {
        "en": "Personal Information",
        "hi": "व्यक्तिगत जानकारी",
        "hinglish": "Personal Information"
    },
    {
        "en": "Phone:",
        "hi": "फ़ोन:",
        "hinglish": "Phone:"
    },
    {
        "en": "Possible Contradiction",
        "hi": "संभावित विरोधाभास",
        "hinglish": "Possible Contradiction"
    },
    {
        "en": "Practitioner Attention Queue",
        "hi": "चिकित्सक ध्यान कतार",
        "hinglish": "Practitioner Attention Queue"
    },
    {
        "en": "Practitioner Clinical Impression & Notes",
        "hi": "चिकित्सक क्लिनिकल निदान व नोट्स",
        "hinglish": "Doctor Clinical Impression & Notes"
    },
    {
        "en": "Practitioner Clinical Instructions",
        "hi": "चिकित्सक क्लिनिकल निर्देश",
        "hinglish": "Doctor Clinical Instructions"
    },
    {
        "en": "Practitioner Observations",
        "hi": "चिकित्सक अवलोकन",
        "hinglish": "Practitioner Observations"
    },
    {
        "en": "Practitioner Review & Verification",
        "hi": "चिकित्सक समीक्षा एवं सत्यापन",
        "hinglish": "Doctor Review & Verification"
    },
    {
        "en": "Practitioner Type",
        "hi": "चिकित्सक प्रकार",
        "hinglish": "Practitioner Type"
    },
    {
        "en": "Prescribed By",
        "hi": "निर्धारितकर्ता डॉक्टर",
        "hinglish": "Prescribed By"
    },
    {
        "en": "Present Illness Notes",
        "hi": "वर्तमान बीमारी के नोट्स",
        "hinglish": "Present Illness Notes"
    },
    {
        "en": "Previous Illnesses",
        "hi": "पिछली बीमारियां",
        "hinglish": "Previous Illnesses"
    },
    {
        "en": "Previous Surgery",
        "hi": "पिछली सर्जरी",
        "hinglish": "Previous Surgery"
    },
    {
        "en": "Prioritized case triage: Urgent review, missing dosage clarification, and allergy verification.",
        "hi": "प्राथमिकता केस छंटनी: तत्काल समीक्षा, अनुपलब्ध खुराक स्पष्टीकरण और एलर्जी सत्यापन।",
        "hinglish": "Prioritized case triage."
    },
    {
        "en": "Privacy & Consent",
        "hi": "गोपनीयता एवं सहमति",
        "hinglish": "Privacy & Consent"
    },
    {
        "en": "Recent Patients",
        "hi": "हाल के मरीज़",
        "hinglish": "Recent Patients"
    },
    {
        "en": "Recently added patient records.",
        "hi": "हाल ही में जोड़े गए मरीज़ रिकॉर्ड।",
        "hinglish": "Recently added patient records."
    },
    {
        "en": "Reconcile current therapies, detect duplicates, and identify missing dosage information.",
        "hi": "वर्तमान उपचारों का मिलान करें, डुप्लिकेट खोजें और अनुपलब्ध खुराक की पहचान करें।",
        "hinglish": "Medications reconcile karein."
    },
    {
        "en": "Record relevant previous medical information.",
        "hi": "प्रासंगिक पिछली चिकित्सीय जानकारी दर्ज करें।",
        "hinglish": "Previous medical info record karein."
    },
    {
        "en": "Record the main reason for the patient's visit.",
        "hi": "मरीज़ के आने का मुख्य कारण दर्ज करें।",
        "hinglish": "Patient visit ka main reason record karein."
    },
    {
        "en": "Record traditional AYUSH observations.",
        "hi": "पारंपरिक आयुष अवलोकन दर्ज करें।",
        "hinglish": "Traditional AYUSH observations record karein."
    },
    {
        "en": "Red-Flag Urgency Triage:",
        "hi": "अति-गंभीर लक्षण छंटनी:",
        "hinglish": "Red-Flag Urgency Triage:"
    },
    {
        "en": "Registered Active Patient",
        "hi": "पंजीकृत सक्रिय मरीज़",
        "hinglish": "Registered Active Patient"
    },
    {
        "en": "Reset All Demo Data to Defaults",
        "hi": "सभी डेमो डेटा डिफ़ॉल्ट पर रीसेट करें",
        "hinglish": "Reset Demo Data"
    },
    {
        "en": "Resets patient registry and mock cases to initial SWASTHAI showcase states.",
        "hi": "मरीज़ रजिस्ट्री और मॉक केस को प्रारंभिक स्वास्थ AI स्थिति पर रीसेट करता है।",
        "hinglish": "Resets patient registry to initial state."
    },
    {
        "en": "Review Patient Information",
        "hi": "मरीज़ जानकारी की समीक्षा करें",
        "hinglish": "Review Patient Information"
    },
    {
        "en": "Review all information before creating",
        "hi": "मरीज़ प्रोफ़ाइल बनाने से पहले",
        "hinglish": "Patient profile banane se pehle"
    },
    {
        "en": "the patient profile.",
        "hi": "सभी जानकारी की समीक्षा करें।",
        "hinglish": "all info review karein."
    },
    {
        "en": "Review structured case observations,",
        "hi": "संरचित केस अवलोकन,",
        "hinglish": "Structured observations,"
    },
    {
        "en": "suggested questions and follow-up insights.",
        "hi": "सुझाए गए प्रश्न और फॉलो-अप इनसाइट्स की समीक्षा करें।",
        "hinglish": "suggested questions review karein."
    },
    {
        "en": "Review the structured summary generated from",
        "hi": "केस जानकारी से जनरेट किए गए",
        "hinglish": "Case information se generated"
    },
    {
        "en": "the case information.",
        "hi": "संरचित सारांश की समीक्षा करें।",
        "hinglish": "summary ko review karein."
    },
    {
        "en": "Reviewing symptoms, history and AYUSH assessment.",
        "hi": "लक्षणों, इतिहास और आयुष मूल्यांकन की समीक्षा की जा रही है।",
        "hinglish": "Symptoms aur history review ho rahi hai."
    },
    {
        "en": "Right Upper Abdomen (Right Hypochondrium)",
        "hi": "ऊपरी दाहिना पेट (Right Hypochondrium)",
        "hinglish": "Right Upper Abdomen"
    },
    {
        "en": "Role / User",
        "hi": "भूमिका / उपयोगकर्ता",
        "hinglish": "Role / User"
    },
    {
        "en": "Route",
        "hi": "मार्ग (Route)",
        "hinglish": "Route"
    },
    {
        "en": "STOPPED MEDICATIONS",
        "hi": "रोकी गई दवाइयां",
        "hinglish": "STOPPED MEDICATIONS"
    },
    {
        "en": "SURGICAL HISTORY",
        "hi": "सर्जरी का इतिहास",
        "hinglish": "SURGICAL HISTORY"
    },
    {
        "en": "SWASTHAI | Dashboard",
        "hi": "स्वास्थ AI | डैशबोर्ड",
        "hinglish": "SWASTHAI | Dashboard"
    },
    {
        "en": "SWASTHAI — From Patient's Voice to Doctor's Insight | स्वास्थ AI",
        "hi": "स्वास्थ AI — मरीज़ की आवाज़ से डॉक्टर के परामर्श तक",
        "hinglish": "SWASTHAI — Voice to Insight"
    },
    {
        "en": "SWASTHAI — Patient Health Portal | मरीज़ स्वास्थ्य सेवा पोर्टल",
        "hi": "स्वास्थ AI — मरीज़ स्वास्थ्य सेवा पोर्टल",
        "hinglish": "SWASTHAI — Patient Health Portal"
    },
    {
        "en": "Scheduled",
        "hi": "निर्धारित",
        "hinglish": "Scheduled"
    },
    {
        "en": "Scheduled patients",
        "hi": "निर्धारित मरीज़",
        "hinglish": "Scheduled patients"
    },
    {
        "en": "Select Pattern",
        "hi": "पैटर्न चुनें",
        "hinglish": "Select Pattern"
    },
    {
        "en": "Select Practitioner Type",
        "hi": "चिकित्सक प्रकार चुनें",
        "hinglish": "Select Practitioner Type"
    },
    {
        "en": "Select Severity",
        "hi": "तीव्रता चुनें",
        "hinglish": "Select Severity"
    },
    {
        "en": "Slow Speech",
        "hi": "धीमी आवाज़ / वाणी",
        "hinglish": "Slow Speech"
    },
    {
        "en": "Solely for clinical case documentation and practitioner decision support. The system never prescribes or diagnoses autonomously.",
        "hi": "केवल क्लिनिकल केस दस्तावेज़ीकरण और चिकित्सक निर्णय सहायता के लिए। सिस्टम कभी भी स्वायत्त रूप से दवा नहीं लिखता या निदान नहीं करता।",
        "hinglish": "System autonomously prescribe nahi karta."
    },
    {
        "en": "Start voice case-taking",
        "hi": "वॉइस केस-टेकिंग शुरू करें",
        "hinglish": "Voice case-taking shuru karein"
    },
    {
        "en": "Structure & stability characteristics",
        "hi": "संरचना और स्थिरता विशेषताएं",
        "hinglish": "Structure & stability characteristics"
    },
    {
        "en": "Structured Review",
        "hi": "संरचित समीक्षा",
        "hinglish": "Structured Review"
    },
    {
        "en": "Structured overview of patient information",
        "hi": "मरीज़ जानकारी का संरचित विवरण",
        "hinglish": "Structured overview of patient info"
    },
    {
        "en": "Suggested actions",
        "hi": "सुझाए गए कार्य",
        "hinglish": "Suggested actions"
    },
    {
        "en": "SwasthAI Clinical Conversational Engine",
        "hi": "स्वास्थ AI क्लिनिकल संवादात्मक इंजन",
        "hinglish": "SwasthAI Clinical Conversational Engine"
    },
    {
        "en": "Symptom Pattern",
        "hi": "लक्षण पैटर्न",
        "hinglish": "Symptom Pattern"
    },
    {
        "en": "Symptom Severity",
        "hi": "लक्षण तीव्रता",
        "hinglish": "Symptom Severity"
    },
    {
        "en": "This AI-assisted summary is for clinical documentation",
        "hi": "यह AI-सहायता प्राप्त सारांश क्लिनिकल दस्तावेज़ीकरण",
        "hinglish": "Yeh AI summary clinical documentation"
    },
    {
        "en": "support and must be reviewed by a qualified practitioner.",
        "hi": "सहायता के लिए है और योग्य चिकित्सक द्वारा समीक्षित होना चाहिए।",
        "hinglish": "ke liye hai aur doctor dwara review honi chahiye."
    },
    {
        "en": "Timeline & Med Reconciliation:",
        "hi": "टाइमलाइन एवं दवा मिलान:",
        "hinglish": "Timeline & Med Reconciliation:"
    },
    {
        "en": "Timestamp",
        "hi": "समय मुहर (Timestamp)",
        "hinglish": "Timestamp"
    },
    {
        "en": "Tip for Judges:",
        "hi": "मूल्यांकनकर्ताओं के लिए सुझाव:",
        "hinglish": "Tip for Judges:"
    },
    {
        "en": "Total Cases",
        "hi": "कुल केस",
        "hinglish": "Total Cases"
    },
    {
        "en": "Upload Diagnostic Report",
        "hi": "डायग्नोस्टिक रिपोर्ट अपलोड करें",
        "hinglish": "Diagnostic Report Upload Karein"
    },
    {
        "en": "Upload Report",
        "hi": "रिपोर्ट अपलोड करें",
        "hinglish": "Report Upload Karein"
    },
    {
        "en": "Use in New Case",
        "hi": "नए केस में उपयोग करें",
        "hinglish": "New Case me use karein"
    },
    {
        "en": "Use voice input to quickly document patient case information.",
        "hi": "मरीज़ केस जानकारी को तेज़ी से दस्तावेज़ित करने के लिए वॉइस इनपुट का उपयोग करें।",
        "hinglish": "Voice input se jaldi document karein."
    },
    {
        "en": "Vata-related assessments appear frequently",
        "hi": "हाल के मरीज़ रिकॉर्ड में वात-संबंधित",
        "hinglish": "Recent records me Vata-related"
    },
    {
        "en": "among recent patient records.",
        "hi": "मूल्यांकन अक्सर दिखाई देते हैं।",
        "hinglish": "assessments frequently dikhte hain."
    },
    {
        "en": "Verbatim Words Preserved",
        "hi": "मूल शब्द सुरक्षित रखे गए",
        "hinglish": "Verbatim Words Preserved"
    },
    {
        "en": "Verification Queue",
        "hi": "सत्यापन कतार",
        "hinglish": "Verification Queue"
    },
    {
        "en": "Voice recognition depends on browser support.",
        "hi": "आवाज़ पहचान ब्राउज़र समर्थन पर निर्भर करती है।",
        "hinglish": "Voice recognition browser support par depend karta hai."
    },
    {
        "en": "Always review and correct the generated transcript",
        "hi": "दस्तावेज़ीकरण में उपयोग करने से पहले जनरेट किए गए",
        "hinglish": "Transcript use karne se pehle"
    },
    {
        "en": "before using it in patient documentation.",
        "hi": "ट्रांसक्रिप्ट की हमेशा समीक्षा और सुधार करें।",
        "hinglish": "review aur correct karein."
    },
    {
        "en": "What data is collected?",
        "hi": "क्या डेटा एकत्र किया जाता है?",
        "hinglish": "Kya data collect hota hai?"
    },
    {
        "en": "Who can access it?",
        "hi": "इसे कौन एक्सेस कर सकता है?",
        "hinglish": "Isko kaun access kar sakta hai?"
    },
    {
        "en": "Why did AI flag this?",
        "hi": "AI ने इसे क्यों फ़्लैग किया?",
        "hinglish": "AI ne isko flag kyu kiya?"
    },
    {
        "en": "Why is it collected?",
        "hi": "यह क्यों एकत्र किया जाता है?",
        "hinglish": "Yeh kyu collect hota hai?"
    },
    {
        "en": "Yesterday",
        "hi": "कल",
        "hinglish": "Yesterday"
    },
    {
        "en": "to see real-time follow-ups and red-flag urgency detection!",
        "hi": "रीयल-टाइम फॉलो-अप और रेड-फ्लैग गंभीरता पहचान देखने के लिए!",
        "hinglish": "real-time follow-ups aur red-flags dekhne ke liye!"
    },
    {
        "en": "अति-गंभीर लक्षण चेतावनी",
        "hi": "अति-गंभीर लक्षण चेतावनी",
        "hinglish": "Red-Flag Alert"
    },
    {
        "en": "अपना नाम या फोन नंबर दर्ज करें। यदि आप नए हैं, तो तुरंत आपका खाता बन जाएगा।",
        "hi": "अपना नाम या फोन नंबर दर्ज करें। यदि आप नए हैं, तो तुरंत आपका खाता बन जाएगा।",
        "hinglish": "Apna naam ya number enter karein. New account turant ban jayega."
    },
    {
        "en": "अपनी बीमारी बोलकर दर्ज करें, पुराने डॉक्टर का पर्चा जोड़ें, रिपोर्ट अपलोड करें और डॉक्टर द्वारा जांची गई दवाइयां देखें।",
        "hi": "अपनी बीमारी बोलकर दर्ज करें, पुराने डॉक्टर का पर्चा जोड़ें, रिपोर्ट अपलोड करें और डॉक्टर द्वारा जांची गई दवाइयां देखें।",
        "hinglish": "Apni problem bolkar record karein, reports upload karein."
    },
    {
        "en": "केस-टेकिंग, समीक्षा कार्यक्षेत्र (Review Workspace) और मरीज़ हिस्ट्री।",
        "hi": "केस-टेकिंग, समीक्षा कार्यक्षेत्र और मरीज़ हिस्ट्री।",
        "hinglish": "Case taking, review workspace aur history."
    },
    {
        "en": "क्लिनिकल AI समीक्षा, रेड-फ्लैग अलर्ट एवं मरीज़ रिकॉर्ड एक्सेस करें",
        "hi": "क्लिनिकल AI समीक्षा, रेड-फ्लैग अलर्ट एवं मरीज़ रिकॉर्ड एक्सेस करें",
        "hinglish": "Clinical AI review aur alerts access karein"
    },
    {
        "en": "खून की जांच या पर्चे का फोटो डालें। AI इसे आसान भाषा में समझाएगा।",
        "hi": "खून की जांच या पर्चे का फोटो डालें। AI इसे आसान भाषा में समझाएगा।",
        "hinglish": "Blood test ya prescription photo dalein. AI simple language me samjhayega."
    },
    {
        "en": "जिस अंग में तकलीफ हो, उस पर स्पर्श (टैप) करें:",
        "hi": "जिस अंग में तकलीफ हो, उस पर स्पर्श (टैप) करें:",
        "hinglish": "Jis part me problem ho uspe tap karein:"
    },
    {
        "en": "टेस्ट रिपोर्ट सरल भाषा में",
        "hi": "टेस्ट रिपोर्ट सरल भाषा में",
        "hinglish": "Test Report in Simple Words"
    },
    {
        "en": "डॉक्टर का पर्चा या टेस्ट रिपोर्ट अपलोड करें",
        "hi": "डॉक्टर का पर्चा या टेस्ट रिपोर्ट अपलोड करें",
        "hinglish": "Doctor prescription ya test report upload karein"
    },
    {
        "en": "डॉक्टर को दिखाएं",
        "hi": "डॉक्टर को दिखाएं",
        "hinglish": "Doctor ko Dikhayein"
    },
    {
        "en": "डॉक्टर द्वारा जांची गई पर्ची",
        "hi": "डॉक्टर द्वारा जांची गई पर्ची",
        "hinglish": "Doctor Verified Prescription"
    },
    {
        "en": "डॉक्टर लॉगिन (Doctor Login)",
        "hi": "डॉक्टर लॉगिन",
        "hinglish": "Doctor Login"
    },
    {
        "en": "डॉक्टर व अस्पताल पोर्टल लॉगिन",
        "hi": "डॉक्टर व अस्पताल पोर्टल लॉगिन",
        "hinglish": "Doctor & Hospital Portal Login"
    },
    {
        "en": "दवा एलर्जी मिलान",
        "hi": "दवा एलर्जी मिलान",
        "hinglish": "Drug Allergy Check"
    },
    {
        "en": "दवाइयों की पर्ची:",
        "hi": "दवाइयों की पर्ची:",
        "hinglish": "Prescription:"
    },
    {
        "en": "नया डॉक्टर / अस्पताल जोड़ें",
        "hi": "नया डॉक्टर / अस्पताल जोड़ें",
        "hinglish": "Naya Doctor / Hospital Jodein"
    },
    {
        "en": "नया डॉक्टर / अस्पताल रजिस्टर करें",
        "hi": "नया डॉक्टर / अस्पताल रजिस्टर करें",
        "hinglish": "Naya Doctor / Hospital Register Karein"
    },
    {
        "en": "पुराने डॉक्टर का डेटा (Past Records)",
        "hi": "पुराने डॉक्टर का डेटा",
        "hinglish": "Past Records"
    },
    {
        "en": "फोटो खींचें या डिवाइस से अपलोड करें",
        "hi": "फोटो खींचें या डिवाइस से अपलोड करें",
        "hinglish": "Device se Upload Karein"
    },
    {
        "en": "ब्लड ग्रुप (Blood Group) व एलर्जी",
        "hi": "ब्लड ग्रुप व एलर्जी",
        "hinglish": "Blood Group & Allergies"
    },
    {
        "en": "मरीज़ इतिहास",
        "hi": "मरीज़ इतिहास",
        "hinglish": "Patient History"
    },
    {
        "en": "मेरी दर्ज की गई बीमारियां (My Diseases)",
        "hi": "मेरी दर्ज की गई बीमारियां",
        "hinglish": "My Reported Diseases"
    },
    {
        "en": "लिवर एंजाइम (SGOT/SGPT) थोड़े बढ़े हुए हैं। इसे आपके डॉक्टर के पास रिव्यू के लिए भेज दिया गया है।",
        "hi": "लिवर एंजाइम (SGOT/SGPT) थोड़े बढ़े हुए हैं। इसे आपके डॉक्टर के पास रिव्यू के लिए भेज दिया गया है।",
        "hinglish": "Liver enzymes thode badhe hue hain. Doctor review ke liye bhej diya gaya hai."
    },
    {
        "en": "● Online",
        "hi": "● ऑनलाइन",
        "hinglish": "● Online"
    },
    {
        "en": "✏ Edit",
        "hi": "✏ संपादित करें",
        "hinglish": "✏ Edit"
    },
    {
        "en": "✓ Confirm",
        "hi": "✓ पुष्टि करें",
        "hinglish": "✓ Confirm"
    },
    {
        "en": "✗ Reject",
        "hi": "✗ अस्वीकार करें",
        "hinglish": "✗ Reject"
    },
    {
        "en": "+91 98765 43210",
        "hi": "+91 98765 43210",
        "hinglish": "+91 98765 43210"
    },
    {
        "en": "35",
        "hi": "35",
        "hinglish": "35"
    },
    {
        "en": "Additional observations or investigations required before next visit...",
        "hi": "अगली मुलाक़ात से पहले आवश्यक अतिरिक्त अवलोकन या जांच...",
        "hinglish": "Agli visit se pehle additional observations ya tests..."
    },
    {
        "en": "Any additional medical information...",
        "hi": "कोई अतिरिक्त चिकित्सीय जानकारी...",
        "hinglish": "Koi additional medical information..."
    },
    {
        "en": "Contact person name",
        "hi": "संपर्क व्यक्ति का नाम",
        "hinglish": "Contact person ka naam"
    },
    {
        "en": "Enter additional family health information...",
        "hi": "अतिरिक्त पारिवारिक स्वास्थ्य जानकारी दर्ज करें...",
        "hinglish": "Additional family health info enter karein..."
    },
    {
        "en": "Example: 3 days ago",
        "hi": "उदा. 3 दिन पहले",
        "hinglish": "Example: 3 din pehle"
    },
    {
        "en": "Example: Cold weather, movement",
        "hi": "उदा. ठंड का मौसम, हलचल",
        "hinglish": "Example: Thand ka mausam, movement"
    },
    {
        "en": "Example: Diabetes, Asthma",
        "hi": "उदा. शुगर, दमा",
        "hinglish": "Example: Diabetes, Asthma"
    },
    {
        "en": "Example: Diabetes, asthma",
        "hi": "उदा. शुगर, दमा",
        "hinglish": "Example: Diabetes, Asthma"
    },
    {
        "en": "Example: Dust, Penicillin",
        "hi": "उदा. धूल, पेनिसिलिन",
        "hinglish": "Example: Dust, Penicillin"
    },
    {
        "en": "Example: Headache, stomach pain, fatigue...",
        "hi": "उदा. सिरदर्द, पेट दर्द, थकान...",
        "hinglish": "Example: Sar dard, pet dard, thakaan..."
    },
    {
        "en": "Example: Penicillin",
        "hi": "उदा. पेनिसिलिन",
        "hinglish": "Example: Penicillin"
    },
    {
        "en": "dr.ananya@hospital.com",
        "hi": "dr.ananya@hospital.com",
        "hinglish": "dr.ananya@hospital.com"
    },
    {
        "en": "e.g. 123456",
        "hi": "उदा. 123456",
        "hinglish": "e.g. 123456"
    },
    {
        "en": "e.g. AYU-2026-DEMO or 9876543210",
        "hi": "उदा. AYU-2026-DEMO या 9876543210",
        "hinglish": "e.g. AYU-2026-DEMO ya 9876543210"
    },
    {
        "en": "e.g. Review response to dietary modification and USG findings",
        "hi": "उदा. आहार परिवर्तन और यूएसजी निष्कर्षों की प्रतिक्रिया की समीक्षा",
        "hinglish": "e.g. Review response to diet and USG"
    },
    {
        "en": "patient@email.com",
        "hi": "patient@email.com",
        "hinglish": "patient@email.com"
    },
    {
        "en": "+ Add Timeline Event",
        "hi": "+ टाइमलाइन घटना जोड़ें",
        "hinglish": "+ Timeline Event Jodein"
    },
    {
        "en": "0 Cases",
        "hi": "0 केस",
        "hinglish": "0 Cases"
    },
    {
        "en": "2 Items",
        "hi": "2 आइटम",
        "hinglish": "2 Items"
    },
    {
        "en": "2 days",
        "hi": "2 दिन",
        "hinglish": "2 din"
    },
    {
        "en": "95% Clarity",
        "hi": "95% स्पष्टता",
        "hinglish": "95% Clarity"
    },
    {
        "en": "96% Confidence",
        "hi": "96% विश्वास स्तर",
        "hinglish": "96% Confidence"
    },
    {
        "en": "AI Adaptive Interview",
        "hi": "AI अनुकूली साक्षात्कार",
        "hinglish": "AI Adaptive Interview"
    },
    {
        "en": "AYUSH",
        "hi": "आयुष",
        "hinglish": "AYUSH"
    },
    {
        "en": "Age / Gender:",
        "hi": "उम्र / लिंग:",
        "hinglish": "Age / Gender:"
    },
    {
        "en": "Demo 1: Rajesh Patel (AYU-2026-DEMO)",
        "hi": "डेमो 1: राजेश पटेल (AYU-2026-DEMO)",
        "hinglish": "Demo 1: Rajesh Patel"
    },
    {
        "en": "Demo 2: Priya Sharma (AYU-2026-002)",
        "hi": "डेमो 2: प्रिया शर्मा (AYU-2026-002)",
        "hinglish": "Demo 2: Priya Sharma"
    },
    {
        "en": "Registered Doctor / Practitioner द्वारा सत्यापित पर्चा।",
        "hi": "पंजीकृत डॉक्टर / चिकित्सक द्वारा सत्यापित पर्चा।",
        "hinglish": "Doctor dwara verified parcha."
    },
    {
        "en": "Actions",
        "hi": "कार्रवाई",
        "hinglish": "Actions"
    },
    {
        "en": "Clear",
        "hi": "साफ़ करें",
        "hinglish": "Clear"
    },
    {
        "en": "Complaint",
        "hi": "समस्या",
        "hinglish": "Complaint"
    },
    {
        "en": "Completed",
        "hi": "पूर्ण हुआ",
        "hinglish": "Completed"
    },
    {
        "en": "Cough",
        "hi": "खांसी",
        "hinglish": "Cough"
    },
    {
        "en": "Date",
        "hi": "तारीख",
        "hinglish": "Date"
    },
    {
        "en": "English",
        "hi": "अंग्रेजी",
        "hinglish": "English"
    },
    {
        "en": "Fever",
        "hi": "बुखार",
        "hinglish": "Fever"
    },
    {
        "en": "Follow-ups",
        "hi": "फॉलो-अप",
        "hinglish": "Follow-ups"
    },
    {
        "en": "Frequency",
        "hi": "आवृत्ति",
        "hinglish": "Frequency"
    },
    {
        "en": "Headache",
        "hi": "सिरदर्द",
        "hinglish": "Headache"
    },
    {
        "en": "High",
        "hi": "अधिक",
        "hinglish": "High"
    },
    {
        "en": "Hindi",
        "hi": "हिंदी",
        "hinglish": "Hindi"
    },
    {
        "en": "Joint Pain",
        "hi": "जोड़ों का दर्द",
        "hinglish": "Joint Pain"
    },
    {
        "en": "Low",
        "hi": "कम",
        "hinglish": "Low"
    },
    {
        "en": "Manage Patient Cases",
        "hi": "मरीज़ केस प्रबंधित करें",
        "hinglish": "Manage Patient Cases"
    },
    {
        "en": "Medical",
        "hi": "चिकित्सीय",
        "hinglish": "Medical"
    },
    {
        "en": "Medications:",
        "hi": "दवाइयां:",
        "hinglish": "Medications:"
    },
    {
        "en": "New Patient",
        "hi": "नया मरीज़",
        "hinglish": "New Patient"
    },
    {
        "en": "Patient",
        "hi": "मरीज़",
        "hinglish": "Patient"
    },
    {
        "en": "Patient ID",
        "hi": "मरीज़ ID",
        "hinglish": "Patient ID"
    },
    {
        "en": "Patient ID or Mobile *",
        "hi": "Patient ID या मोबाइल *",
        "hinglish": "Patient ID ya Mobile *"
    },
    {
        "en": "Patient ID:",
        "hi": "मरीज़ ID:",
        "hinglish": "Patient ID:"
    },
    {
        "en": "Pending",
        "hi": "लंबित",
        "hinglish": "Pending"
    },
    {
        "en": "Registered",
        "hi": "पंजीकृत",
        "hinglish": "Registered"
    },
    {
        "en": "Select",
        "hi": "चुनें",
        "hinglish": "Select"
    },
    {
        "en": "Smarter with AI",
        "hi": "AI के साथ स्मार्ट",
        "hinglish": "Smarter with AI"
    },
    {
        "en": "Today",
        "hi": "आज",
        "hinglish": "Today"
    },
    {
        "en": "Verified",
        "hi": "सत्यापित",
        "hinglish": "Verified"
    },
    {
        "en": "View",
        "hi": "देखें",
        "hinglish": "View"
    },
    {
        "en": "क्लिनिक / अस्पताल का नाम",
        "hi": "क्लिनिक / अस्पताल का नाम",
        "hinglish": "Clinic / Hospital Name"
    },
    {
        "en": "डॉक्टर के निर्देश / कोई पुरानी जांच",
        "hi": "डॉक्टर के निर्देश / कोई पुरानी जांच",
        "hinglish": "Doctor Advice / Previous Tests"
    },
    {
        "en": "नमस्ते",
        "hi": "नमस्ते",
        "hinglish": "Hello"
    },
    {
        "en": "पिछली दवाइयां जो दी गई थीं",
        "hi": "पिछली दवाइयां जो दी गई थीं",
        "hinglish": "Previous Medications Prescribed"
    },
    {
        "en": "पुराना रिकॉर्ड सुरक्षित करें (Save Record)",
        "hi": "पुराना रिकॉर्ड सुरक्षित करें",
        "hinglish": "Save Record"
    },
    {
        "en": "बीमारी सेव करें व डॉक्टर को भेजें",
        "hi": "बीमारी सेव करें व डॉक्टर को भेजें",
        "hinglish": "Save Disease & Send to Doctor"
    },
    {
        "en": "बोलकर बताएं:",
        "hi": "बोलकर बताएं:",
        "hinglish": "Speak symptoms:"
    },
    {
        "en": "लक्षण व अतिरिक्त विवरण",
        "hi": "लक्षण व अतिरिक्त विवरण",
        "hinglish": "Symptoms & Additional Details"
    },
    {
        "en": "साल / तारीख (Year/Date)",
        "hi": "साल / तारीख",
        "hinglish": "Year / Date"
    },
    {
        "en": "हिंदी (Hindi)",
        "hi": "हिंदी",
        "hinglish": "Hindi"
    },
    {
        "en": "हिंदी, अंग्रेजी व हिंग्लिश में",
        "hi": "हिंदी, अंग्रेजी व हिंग्लिश में",
        "hinglish": "In Hindi, English & Hinglish"
    },
    {
        "en": "Hinglish (हिन्दी-English)",
        "hi": "हिंग्लिश",
        "hinglish": "Hinglish"
    },
    {
        "en": "उदा. 2023 या Aug 2024",
        "hi": "उदा. 2023 या Aug 2024",
        "hinglish": "e.g. 2023 or Aug 2024"
    },
    {
        "en": "उदा. 6 महीने से, 2 हफ्ते से",
        "hi": "उदा. 6 महीने से, 2 हफ्ते से",
        "hinglish": "e.g. 6 months, 2 weeks"
    },
    {
        "en": "उदा. 9811223344",
        "hi": "उदा. 9811223344",
        "hinglish": "e.g. 9811223344"
    },
    {
        "en": "उदा. 9876543210 या AYU-2026-DEMO",
        "hi": "उदा. 9876543210 या AYU-2026-DEMO",
        "hinglish": "e.g. 9876543210 or AYU-2026-DEMO"
    },
    {
        "en": "उदा. Amlodipine 5mg, Pantocid 40mg",
        "hi": "उदा. Amlodipine 5mg, Pantocid 40mg",
        "hinglish": "e.g. Amlodipine 5mg, Pantocid 40mg"
    },
    {
        "en": "उदा. City Hospital, Delhi",
        "hi": "उदा. City Hospital, Delhi",
        "hinglish": "e.g. City Hospital, Delhi"
    },
    {
        "en": "उदा. City Life Super Specialty Hospital",
        "hi": "उदा. City Life Super Specialty Hospital",
        "hinglish": "e.g. City Life Super Specialty Hospital"
    },
    {
        "en": "उदा. Dr. Ananya Roy",
        "hi": "उदा. Dr. Ananya Roy",
        "hinglish": "e.g. Dr. Ananya Roy"
    },
    {
        "en": "उदा. Dr. R. K. Sharma",
        "hi": "उदा. Dr. R. K. Sharma",
        "hinglish": "e.g. Dr. R. K. Sharma"
    },
    {
        "en": "उदा. General Physician / AYUSH",
        "hi": "उदा. General Physician / AYUSH",
        "hinglish": "e.g. General Physician / AYUSH"
    },
    {
        "en": "उदा. High Blood Pressure, Acidity",
        "hi": "उदा. High Blood Pressure, Acidity",
        "hinglish": "e.g. High Blood Pressure, Acidity"
    },
    {
        "en": "उदा. MCI-987654",
        "hi": "उदा. MCI-987654",
        "hinglish": "e.g. MCI-987654"
    },
    {
        "en": "उदा. O+, Penicillin से एलर्जी या कोई नहीं",
        "hi": "उदा. O+, Penicillin से एलर्जी या कोई नहीं",
        "hinglish": "e.g. O+, Penicillin Allergy or None"
    },
    {
        "en": "उदा. Rajesh Patel या आपका नाम",
        "hi": "उदा. Rajesh Patel या आपका नाम",
        "hinglish": "e.g. Rajesh Patel or your name"
    },
    {
        "en": "उदा. Ramesh Gupta",
        "hi": "उदा. Ramesh Gupta",
        "hinglish": "e.g. Ramesh Gupta"
    },
    {
        "en": "उदा. नमक कम खाने की सलाह दी थी, इको टेस्ट नॉर्मल था...",
        "hi": "उदा. नमक कम खाने की सलाह दी थी, इको टेस्ट नॉर्मल था...",
        "hinglish": "e.g. Advised low salt diet, Echo test normal..."
    },
    {
        "en": "उदा. सुबह उठते ही अकड़न, चलने में सूजन...",
        "hi": "उदा. सुबह उठते ही अकड़न, चलने में सूजन...",
        "hinglish": "e.g. Morning stiffness, swelling while walking..."
    },
    {
        "en": "उदा. जोड़ों का दर्द (Arthritis), माइग्रेन, अस्थमा",
        "hi": "उदा. जोड़ों का दर्द (Arthritis), माइग्रेन, अस्थमा",
        "hinglish": "e.g. Joint Pain (Arthritis), Migraine, Asthma"
    }
];

    // Build indexing maps for ultra-fast bidirectional lookup
    const lookupMap = new Map();

    function normalizeKey(str) {
        if (!str || typeof str !== "string") return "";
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

        // 1. Index PHRASE_BOOK
        PHRASE_BOOK.forEach(item => {
            ["en", "hi", "hinglish", "mr", "bn", "ta", "te"].forEach(lang => {
                const val = item[lang];
                if (!val) return;

                const norm = normalizeKey(val);
                if (norm && !lookupMap.has(norm)) {
                    lookupMap.set(norm, item);
                }

                const stripped = stripParentheses(val);
                if (stripped && stripped !== val) {
                    const strippedNorm = normalizeKey(stripped);
                    if (strippedNorm && !lookupMap.has(strippedNorm)) {
                        lookupMap.set(strippedNorm, item);
                    }
                }
            });
        });

        // 2. Index DICTIONARY entries
        if (DICTIONARY.en && DICTIONARY.hi) {
            Object.keys(DICTIONARY.en).forEach(key => {
                const enVal = DICTIONARY.en[key];
                const hiVal = DICTIONARY.hi[key] || enVal;
                const hinglishVal = (DICTIONARY.hinglish && DICTIONARY.hinglish[key]) || enVal;
                if (!enVal) return;

                const item = { en: enVal, hi: hiVal, hinglish: hinglishVal };
                const normEn = normalizeKey(enVal);
                if (normEn && !lookupMap.has(normEn)) lookupMap.set(normEn, item);
                const normHi = normalizeKey(hiVal);
                if (normHi && !lookupMap.has(normHi)) lookupMap.set(normHi, item);
            });
        }
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

        applyTranslations(lang);
        updateSwitcherUI();
        
        initMutationObserver();
        window.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang } }));
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
            const translated = match[targetLang] || (targetLang === "en" ? match.en : match.hi);
            if (translated) return lead + translated + trail;
        }

        // 2. Trailing punctuation check (e.g. "Doctor:", "Chief Complaint:", "Age:", "Full Name *")
        const punctMatch = trimmed.match(/^([\s\S]+?)([:\-\.\!\?\*]+)$/);
        if (punctMatch) {
            const baseText = punctMatch[1].trim();
            const trailingPunct = punctMatch[2];
            const baseNorm = normalizeKey(baseText);
            const baseMatch = lookupMap.get(baseNorm);
            if (baseMatch) {
                const translated = baseMatch[targetLang] || (targetLang === "en" ? baseMatch.en : baseMatch.hi);
                if (translated) return lead + translated + trailingPunct + trail;
            }
        }

        // 3. Trailing or Leading Emoji Check (e.g. "Good Morning, Doctor 👋" or "🚀 Create Account")
        const emojiMatch = trimmed.match(/^([\s\S]+?)\s*([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]+)$/u);
        if (emojiMatch) {
            const baseText = emojiMatch[1].trim();
            const emoji = emojiMatch[2];
            const baseNorm = normalizeKey(baseText);
            const baseMatch = lookupMap.get(baseNorm);
            if (baseMatch) {
                const translated = baseMatch[targetLang] || (targetLang === "en" ? baseMatch.en : baseMatch.hi);
                if (translated) return lead + translated + " " + emoji + trail;
            }
        }

        // 4. Parenthetical bilingual text extraction (e.g. "बीमारी का नाम / मुख्य समस्या *" or "हल्का (Mild)")
        if (trimmed.includes("/") || trimmed.includes("(")) {
            const parts = trimmed.split(/[\/\(\)]+/).map(p => p.trim()).filter(Boolean);
            for (let part of parts) {
                const pNorm = normalizeKey(part);
                const pMatch = lookupMap.get(pNorm);
                if (pMatch) {
                    const translated = pMatch[targetLang] || pMatch.en;
                    if (translated && (targetLang !== "en" || part !== trimmed)) {
                        return lead + translated + trail;
                    }
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
                    if (node.__sourcePlaceholder === undefined) {
                        node.__sourcePlaceholder = node.placeholder;
                    }
                    if (targetLang === "en") {
                        const match = lookupMap.get(normalizeKey(node.__sourcePlaceholder));
                        node.placeholder = (match && match.en) ? match.en : node.__sourcePlaceholder;
                    } else {
                        const translated = translateText(node.__sourcePlaceholder, targetLang);
                        if (translated) node.placeholder = translated;
                    }
                }
            }

            // Translate options inside select (skip language options)
            if (tag === "OPTION") {
                if (!node.classList.contains("lang-option") && !node.closest(".global-lang-select")) {
                    if (node.__sourceText === undefined) {
                        node.__sourceText = node.textContent;
                    }
                    if (targetLang === "en") {
                        const match = lookupMap.get(normalizeKey(node.__sourceText));
                        node.textContent = (match && match.en) ? match.en : node.__sourceText;
                    } else {
                        const translated = translateText(node.__sourceText, targetLang);
                        if (translated && translated !== node.textContent) {
                            node.textContent = translated;
                        }
                    }
                }
                return;
            }

            // Translate title and aria-label attributes
            if (node.title && !node.classList.contains("global-lang-select")) {
                if (node.__sourceTitle === undefined) {
                    node.__sourceTitle = node.title;
                }
                if (targetLang === "en") {
                    const match = lookupMap.get(normalizeKey(node.__sourceTitle));
                    node.title = (match && match.en) ? match.en : node.__sourceTitle;
                } else {
                    const translatedTitle = translateText(node.__sourceTitle, targetLang);
                    if (translatedTitle) node.title = translatedTitle;
                }
            }
        }

        // Text nodes
        if (node.nodeType === Node.TEXT_NODE) {
            const raw = node.textContent;
            const trimmed = raw.trim();
            if (trimmed && trimmed.length > 0) {
                // Skip if parent or ancestor is explicitly excluded or has data-i18n
                if (node.parentElement) {
                    if (node.parentElement.closest(".notranslate")) return;
                    if (node.parentElement.closest("[data-i18n]")) return;
                }

                // Save pristine source text permanently (never overwritten once recorded)
                if (node.__sourceText === undefined) {
                    node.__sourceText = raw;
                }

                if (targetLang === "en") {
                    // Check if lookupMap has an English equivalent for bilingual or Hindi originals
                    const match = lookupMap.get(normalizeKey(node.__sourceText)) || lookupMap.get(normalizeKey(raw));
                    if (match && match.en) {
                        // Preserve leading/trailing whitespace
                        const lead = raw.match(/^\s*/) ? raw.match(/^\s*/)[0] : "";
                        const trail = raw.match(/\s*$/) ? raw.match(/\s*$/)[0] : "";
                        node.textContent = lead + match.en + trail;
                    } else {
                        // Restore pristine source text directly
                        node.textContent = node.__sourceText;
                    }
                } else {
                    const translated = translateText(node.__sourceText, targetLang);
                    if (translated && translated !== raw) {
                        node.textContent = translated;
                    }
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
                const val = dict[key] || (DICTIONARY.en ? DICTIONARY.en[key] : "");
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
        
        // If not present in HTML, locate or create container in topbar or navbar
        if (switcherContainers.length === 0) {
            let topbarRight = document.querySelector(".topbar-right");
            if (!topbarRight) {
                const topbar = document.querySelector(".topbar");
                if (topbar) {
                    topbarRight = document.createElement("div");
                    topbarRight.className = "topbar-right";
                    topbar.appendChild(topbarRight);
                }
            }

            if (topbarRight) {
                const wrapper = document.createElement("div");
                wrapper.id = "globalLanguageSwitcherContainer";
                wrapper.className = "lang-switcher-wrapper notranslate";
                topbarRight.prepend(wrapper);
                switcherContainers = [wrapper];
            } else {
                const navRight = document.querySelector(".landing-nav div:last-child");
                if (navRight) {
                    const wrapper = document.createElement("div");
                    wrapper.id = "globalLanguageSwitcherContainer";
                    wrapper.className = "lang-switcher-wrapper notranslate";
                    navRight.prepend(wrapper);
                    switcherContainers = [wrapper];
                }
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
