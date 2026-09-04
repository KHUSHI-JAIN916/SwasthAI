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
            audioGuideBtn: "🔊 आवाज़ में सुनें (Audio Help)",
            audioGuidePrompt: "स्वास्थ AI में आपका स्वागत है। अगर आप मरीज़ हैं, तो अपनी तकलीफ बोलकर बताने या रिपोर्ट अपलोड करने के लिए हरा बटन दबाएं। यदि आप डॉक्टर हैं, तो डॉक्टर पोर्टल चुनें।",
            
            // Portals
            patientPortalTitle: "मरीज़ स्वास्थ्य सेवा पोर्टल",
            patientPortalSubtitle: "अपनी तकलीफ बोलकर बताएं, डॉक्टर की पर्ची व टेस्ट रिपोर्ट अपलोड करें और दवाइयां देखें।",
            doctorPortalTitle: "डॉक्टर / चिकित्सक पोर्टल",
            doctorPortalSubtitle: "केस-टेकिंग, समीक्षा कार्यक्षेत्र (Review Workspace) और मरीज़ हिस्ट्री।",
            enterPatientPortal: "मरीज़ पोर्टल खोलें (Patient Login / Portal)",
            enterDoctorPortal: "डॉक्टर पोर्टल खोलें (Doctor)",
            
            // Patient Portal
            patientWelcome: "नमस्ते",
            patientTag: "पंजीकृत मरीज़",
            voiceAssistantHeading: "अपनी बीमारी या तकलीफ बोलकर बताएं",
            voiceAssistantSub: "नीचे दिए गए हरे माइक बटन को दबाएं और अपनी भाषा में खुलकर बोलें।",
            startSpeakingBtn: "माइक दबाकर बोलें (Tap to Speak)",
            listeningNow: "सुन रहे हैं... कृपया अपनी तकलीफ बताएं।",
            stopSpeakingBtn: "बोलना समाप्त हुआ (Done)",
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
            overviewTitle: "विवरण (Overview)",
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
            enterPatientPortal: "Patient Portal Kholein (Patient Login / Portal)",
            enterDoctorPortal: "Doctor Portal Kholein (Doctor)",
            
            // Patient Portal
            patientWelcome: "Namaste",
            patientTag: "Registered Patient",
            voiceAssistantHeading: "Apni bimari ya problem bolkar batayein",
            voiceAssistantSub: "Neeche green mic button dabakar aasaani se bolein.",
            startSpeakingBtn: "Mic dabakar bolein (Start Speaking)",
            listeningNow: "Sun rahe hain... Apni problem bolein.",
            stopSpeakingBtn: "Bolna complete hua (Stop)",
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
        { en: "From Voice to Insight", hi: "आवाज़ से परामर्श तक", hinglish: "Voice se Insight tak" },
        { en: "MAIN MENU", hi: "मुख्य मेन्यू", hinglish: "MAIN MENU" },
        { en: "Language", hi: "भाषा", hinglish: "Language" },
        { en: "Change Language / भाषा बदलें", hi: "भाषा बदलें", hinglish: "Language Chunein" },
        { en: "Audio Help", hi: "आवाज़ में सुनें", hinglish: "Audio Help" },
        { en: "🔊 Listen in Audio", hi: "🔊 आवाज़ में सुनें", hinglish: "🔊 Audio me Sunein" },
        { en: "🔊 आवाज़ में सुनें (Audio Help)", hi: "🔊 आवाज़ में सुनें", hinglish: "🔊 Audio me Sunein" },
        { en: "आवाज़ में सुनें", hi: "आवाज़ में सुनें", hinglish: "Audio me Sunein" },
        { en: "बोलकर सुनें", hi: "बोलकर सुनें", hinglish: "Audio me Sunein" },

        // Sidebar Navigation
        { en: "Patient Portal", hi: "मरीज़ स्वास्थ्य पोर्टल", hinglish: "Patient Portal" },
        { en: "Dashboard", hi: "डैशबोर्ड", hinglish: "Dashboard" },
        { en: "Patients", hi: "मरीज़ सूची", hinglish: "Patients" },
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
        { en: "Good Evening, Doctor 👋", hi: "शुभ संध्या, डॉक्टर 👋", hinglish: "Good Evening, Doctor 👋" },
        { en: "Good Morning, Doctor 👋", hi: "शुभ प्रभात, डॉक्टर 👋", hinglish: "Good Morning, Doctor 👋" },
        { en: "Good Afternoon, Doctor 👋", hi: "नमस्कार, डॉक्टर 👋", hinglish: "Good Afternoon, Doctor 👋" },
        { en: "Doctor / Practitioner", hi: "डॉक्टर / चिकित्सक", hinglish: "Doctor / Practitioner" },
        { en: "Patient / Caregiver", hi: "मरीज़ / तीमारदार", hinglish: "Patient / Caregiver" },
        { en: "Administrator", hi: "प्रशासक", hinglish: "Admin" },
        { en: "Role: Practitioner", hi: "भूमिका: चिकित्सक (Doctor)", hinglish: "Role: Doctor" },
        { en: "Role: Patient", hi: "भूमिका: मरीज़ (Patient)", hinglish: "Role: Patient" },
        { en: "Role: Admin", hi: "भूमिका: व्यवस्थापक (Admin)", hinglish: "Role: Admin" },
        { en: "START DEMO", hi: "डेमो शुरू करें", hinglish: "START DEMO" },
        { en: "Start Demo", hi: "डेमो शुरू करें", hinglish: "Start Demo" },
        { en: "Dr. Sharma", hi: "डॉ. शर्मा", hinglish: "Dr. Sharma" },

        // Breadcrumbs
        { en: "Dashboard / Overview", hi: "डैशबोर्ड / विवरण", hinglish: "Dashboard / Overview" },
        { en: "Dashboard / Patients", hi: "डैशबोर्ड / मरीज़ प्रबंधन", hinglish: "Dashboard / Patients" },
        { en: "Dashboard / Add Patient", hi: "डैशबोर्ड / नया मरीज़", hinglish: "Dashboard / Add Patient" },
        { en: "Dashboard / New Case", hi: "डैशबोर्ड / नया केस", hinglish: "Dashboard / New Case" },
        { en: "Dashboard / Review Workspace", hi: "डैशबोर्ड / समीक्षा कार्यक्षेत्र", hinglish: "Dashboard / Review Workspace" },
        { en: "Dashboard / Case History", hi: "डैशबोर्ड / केस इतिहास", hinglish: "Dashboard / Case History" },
        { en: "Dashboard / Analytics", hi: "डैशबोर्ड / एनालिटिक्स", hinglish: "Dashboard / Analytics" },
        { en: "Dashboard / AI Assistant", hi: "डैशबोर्ड / AI सहायक", hinglish: "Dashboard / AI Assistant" },
        { en: "Dashboard / Voice Case Taking", hi: "डैशबोर्ड / वॉइस केस टेकिंग", hinglish: "Dashboard / Voice Case Taking" },

        // Landing Page (index.html)
        { en: "SWASTHAI — Intelligent Patient Care Platform", hi: "स्वास्थ AI — बुद्धिमान मरीज़ स्वास्थ्य सेवा मंच", hinglish: "SWASTHAI — Intelligent Patient Care Platform" },
        { en: "Simple & Powerful Digital Healthcare Companion", hi: "स्वास्थ्य सेवा का सरल व सशक्त डिजिटल साथी", hinglish: "Swasthya Sewa ka Simple & Powerful Digital Saathi" },
        { en: "Patients can speak their symptoms and upload medical reports. Doctors can conduct safe and accurate case reviews.", hi: "मरीज़ बोलकर अपनी तकलीफ बता सकते हैं और मेडिकल रिपोर्ट अपलोड कर सकते हैं। डॉक्टर सुरक्षित व सटीक केस समीक्षा कर सकते हैं।", hinglish: "Patients bolkar apni dikkat bata sakte hain aur reports upload kar sakte hain. Doctors accurate review kar sakte hain." },
        { en: "Voice & Easy Touch", hi: "बोलकर व आसान स्पर्श से", hinglish: "Voice & Easy Touch" },
        { en: "Patient Health Portal", hi: "मरीज़ स्वास्थ्य सेवा पोर्टल", hinglish: "Patient Health Portal" },
        { en: "Speak your symptoms, upload medical reports, and view doctor prescriptions.", hi: "अपनी तकलीफ बोलकर बताएं, डॉक्टर की पर्ची व टेस्ट रिपोर्ट अपलोड करें और दवाइयां देखें।", hinglish: "Apni dikkat bolkar batayein, medical reports upload karein aur dawaiyan dekhein." },
        { en: "Speak symptoms: In Hindi, English & Hinglish", hi: "बोलकर बताएं: हिंदी, अंग्रेजी व हिंग्लिश में", hinglish: "Bolkar batayein: Hindi, English aur Hinglish me" },
        { en: "Speak symptoms:", hi: "बोलकर बताएं:", hinglish: "Bolkar batayein:" },
        { en: "In Hindi, English & Hinglish", hi: "हिंदी, अंग्रेजी व हिंग्लिश में", hinglish: "Hindi, English aur Hinglish me" },
        { en: "AI Report Arranger: Test reports explained simply", hi: "AI रिपोर्ट व्यवस्थापक: टेस्ट रिपोर्ट सरल भाषा में", hinglish: "AI Report Arranger: Test reports simple bhasha me" },
        { en: "AI Report Arranger:", hi: "AI रिपोर्ट व्यवस्थापक:", hinglish: "AI Report Arranger:" },
        { en: "Test reports explained simply", hi: "टेस्ट रिपोर्ट सरल भाषा में", hinglish: "Test reports simple bhasha me" },
        { en: "Prescriptions: Prescriptions verified by doctors", hi: "दवाइयों की पर्ची: डॉक्टर द्वारा जांची गई पर्ची", hinglish: "Prescriptions: Doctor dwara verified parcha" },
        { en: "Prescriptions:", hi: "दवाइयों की पर्ची:", hinglish: "Dawaiyon ka parcha:" },
        { en: "Prescriptions verified by doctors", hi: "डॉक्टर द्वारा जांची गई पर्ची", hinglish: "Doctor dwara verified parcha" },
        { en: "Open Patient Portal (Patient Login / Portal)", hi: "मरीज़ पोर्टल खोलें (Patient Login / Portal)", hinglish: "Patient Portal Kholein (Patient Login / Portal)" },
        { en: "Open Patient Portal", hi: "मरीज़ पोर्टल खोलें", hinglish: "Patient Portal Kholein" },
        { en: "New Patient Login / Register", hi: "नया मरीज़ लॉगिन / रजिस्टर करें", hinglish: "Naya Patient Login / Register" },
        { en: "Clinical AI Workspace", hi: "क्लिनिकल AI कार्यक्षेत्र", hinglish: "Clinical AI Workspace" },
        { en: "Doctor / Practitioner Portal", hi: "डॉक्टर / चिकित्सक पोर्टल", hinglish: "Doctor / Practitioner Portal" },
        { en: "Case taking, clinical review workspace, attention queue, and patient timeline.", hi: "केस-टेकिंग, समीक्षा कार्यक्षेत्र (Review Workspace) और मरीज़ हिस्ट्री।", hinglish: "Case taking, clinical review workspace aur patient timeline." },
        { en: "Red-Flag Urgency Triage: Critical symptom warnings", hi: "Red-Flag Urgency Triage: अति-गंभीर लक्षण चेतावनी", hinglish: "Red-Flag Urgency Triage: Critical symptom warnings" },
        { en: "Red-Flag Urgency Triage:", hi: "Red-Flag Urgency Triage:", hinglish: "Red-Flag Urgency Triage:" },
        { en: "Critical symptom warnings", hi: "अति-गंभीर लक्षण चेतावनी", hinglish: "Critical symptom warnings" },
        { en: "Allergy Conflict Checker: Drug allergy safety cross-checks", hi: "Allergy Conflict Checker: दवा एलर्जी मिलान", hinglish: "Allergy Conflict Checker: Dawa allergy checking" },
        { en: "Allergy Conflict Checker:", hi: "Allergy Conflict Checker:", hinglish: "Allergy Conflict Checker:" },
        { en: "Drug allergy safety cross-checks", hi: "दवा एलर्जी मिलान", hinglish: "Dawa allergy safety cross-checks" },
        { en: "Timeline & Med Reconciliation: Complete patient timeline", hi: "Timeline & Med Reconciliation: मरीज़ इतिहास", hinglish: "Timeline & Med Reconciliation: Patient timeline" },
        { en: "Timeline & Med Reconciliation:", hi: "Timeline & Med Reconciliation:", hinglish: "Timeline & Med Reconciliation:" },
        { en: "Complete patient timeline", hi: "मरीज़ का सम्पूर्ण इतिहास", hinglish: "Patient timeline" },
        { en: "Open Doctor Portal (Doctor)", hi: "डॉक्टर पोर्टल खोलें (Doctor)", hinglish: "Doctor Portal Kholein (Doctor)" },
        { en: "Open Doctor Portal", hi: "डॉक्टर पोर्टल खोलें", hinglish: "Doctor Portal Kholein" },
        { en: "Doctor Login (Dr. Sharma)", hi: "डॉक्टर लॉगिन (Dr. Sharma)", hinglish: "Doctor Login (Dr. Sharma)" },

        // Modals & Forms (Landing & Login)
        { en: "Patient Login / Quick Registration", hi: "मरीज़ लॉगिन / त्वरित पंजीकरण", hinglish: "Patient Login / Quick Registration" },
        { en: "Enter your name or phone number. If you are new, your account will be created instantly.", hi: "अपना नाम या फोन नंबर दर्ज करें। यदि आप नए हैं, तो तुरंत आपका खाता बन जाएगा।", hinglish: "Apna naam ya phone number enter karein. Naye users ka account turant ban jayega." },
        { en: "Patient Full Name", hi: "मरीज़ का पूरा नाम", hinglish: "Patient Full Name" },
        { en: "Patient Full Name (मरीज़ का पूरा नाम)", hi: "मरीज़ का पूरा नाम (Patient Full Name)", hinglish: "Patient Full Name" },
        { en: "Mobile Number / Patient ID", hi: "मोबाइल नंबर / Patient ID", hinglish: "Mobile Number / Patient ID" },
        { en: "Enter Portal", hi: "पोर्टल में प्रवेश करें", hinglish: "Portal me Enter Karein" },
        { en: "AYUSH Doctor Login", hi: "आयुष डॉक्टर लॉगिन", hinglish: "AYUSH Doctor Login" },
        { en: "Doctor Email", hi: "डॉक्टर ईमेल", hinglish: "Doctor Email" },
        { en: "Password", hi: "पासवर्ड", hinglish: "Password" },
        { en: "Login to Doctor Dashboard", hi: "डॉक्टर डैशबोर्ड में लॉगिन करें", hinglish: "Doctor Dashboard me Login karein" },
        { en: "eg. Rajesh Patel or your name", hi: "उदा. Rajesh Patel या आपका नाम", hinglish: "e.g. Rajesh Patel ya aapka naam" },
        { en: "eg. 9876543210 or AYU-2026-DEMO", hi: "उदा. 9876543210 या AYU-2026-DEMO", hinglish: "e.g. 9876543210 ya AYU-2026-DEMO" },

        // Patient Health Portal (patient-portal.html)
        { en: "Tell us your symptoms (Speak or Type)", hi: "अपनी बीमारी या तकलीफ बोलकर बताएं", hinglish: "Apni bimari ya dikkat bolkar batayein" },
        { en: "Press the big green microphone and speak naturally in Hindi or English.", hi: "नीचे दिए गए हरे माइक बटन को दबाएं और अपनी भाषा में खुलकर बोलें।", hinglish: "Neeche green mic button dabayein aur simple bhasha me bolein." },
        { en: "Tap to Speak", hi: "माइक दबाकर बोलें (Tap to Speak)", hinglish: "Mic dabakar bolein" },
        { en: "Press to Speak", hi: "माइक दबाकर बोलें (Tap to Speak)", hinglish: "Mic dabakar bolein" },
        { en: "Listening... Please speak your health problem.", hi: "सुन रहे हैं... कृपया अपनी तकलीफ बताएं।", hinglish: "Sun rahe hain... Apni problem bolein." },
        { en: "Done", hi: "बोलना समाप्त हुआ (Done)", hinglish: "Bolna complete hua (Done)" },
        { en: "Or type your symptoms here...", hi: "या यहाँ अपनी समस्या लिखें...", hinglish: "Ya yahan apni bimari type karein..." },
        { en: "Submit Symptoms to Doctor", hi: "तकलीफ डॉक्टर को भेजें", hinglish: "Symptoms Doctor ko Bhejein" },
        { en: "Clear Text", hi: "साफ करें", hinglish: "Clear Karein" },
        { en: "95% Clarity", hi: "95% स्पष्टता (Clarity)", hinglish: "95% Clarity" },
        { en: "Clarity", hi: "स्पष्टता", hinglish: "Clarity" },

        // Quick Actions (Patient Portal)
        { en: "Add New Disease / Problem", hi: "नई बीमारी / तकलीफ जोड़ें", hinglish: "Nayi Bimari / Problem Jodein" },
        { en: "Send current problem & symptoms to doctor", hi: "वर्तमान समस्या व लक्षण डॉक्टर को भेजें", hinglish: "Current problem aur symptoms doctor ko bhejein" },
        { en: "Add Past Doctor Records / Prescription", hi: "पुराने डॉक्टर का डेटा / पर्चा जोड़ें", hinglish: "Purane Doctor ka Data / Parcha Jodein" },
        { en: "Past doctor name, clinic & medicines", hi: "पुराने डॉक्टर का नाम, क्लिनिक व दवाइयां", hinglish: "Purane doctor ka naam, clinic aur medicines" },

        // Body Tap Selector
        { en: "Quick Body Symptom Selector", hi: "शरीर के अंगों के अनुसार लक्षण चुनें", hinglish: "Body parts ke according problem chunein" },
        { en: "Tap the body part or health issue you are experiencing:", hi: "जिस अंग में दर्द या तकलीफ हो, उस पर स्पर्श (टैप) करें:", hinglish: "Jis body part me dard ya problem ho uspe tap karein:" },
        { en: "Headache / Dizziness", hi: "सिरदर्द / चक्कर", hinglish: "Sar Dard / Chakkar" },
        { en: "Stomach Pain / Acidity", hi: "पेट दर्द / गैस", hinglish: "Pet Dard / Gas" },
        { en: "Chest Pain / Heaviness", hi: "छाती में दर्द", hinglish: "Chest Pain / Bhari Pan" },
        { en: "Chest Pain / Breathlessness", hi: "छाती में दर्द व भारीपन", hinglish: "Chest Pain / Saans me dikkat" },
        { en: "Joint Pain / Arthritis", hi: "जोड़ों का दर्द", hinglish: "Jodon ka Dard" },
        { en: "Fever / Shivering", hi: "बुखार / कंपकंपी", hinglish: "Bukhar / Thand" },
        { en: "Cough / Sore Throat", hi: "खांसी / गला", hinglish: "Khansi / Gale me dard" },
        { en: "Skin Rash / Itching", hi: "त्वचा / खुजली", hinglish: "Skin Allergy / Khujli" },
        { en: "Sugar / Weakness", hi: "शुगर / कमजोरी", hinglish: "Sugar / Kamzori" },

        // AI Report Arranger
        { en: "AI Medical Report & Prescription Arranger", hi: "AI मेडिकल रिपोर्ट व पर्चा व्यवस्थापक", hinglish: "AI Medical Report & Prescription Arranger" },
        { en: "Upload photos or PDFs of blood tests, LFT, CBC, or doctor prescriptions. AI will organize and explain them in simple words.", hi: "खून की जांच या पर्चे का फोटो डालें। AI इसे आसान भाषा में समझाएगा।", hinglish: "Blood test ya parcha upload karein. AI simple language me samjhayega." },
        { en: "Upload Doctor's Prescription or Lab Report", hi: "डॉक्टर का पर्चा या टेस्ट रिपोर्ट अपलोड करें", hinglish: "Doctor ka parcha ya report upload karein" },
        { en: "Take a photo or upload from device", hi: "फोटो खींचें या डिवाइस से अपलोड करें", hinglish: "Photo khechein ya device se upload karein" },
        { en: "Sample Liver (LFT) Report", hi: "सैंपल लिवर (LFT) रिपोर्ट", hinglish: "Sample LFT Liver Report" },
        { en: "Sample Blood Test (CBC)", hi: "सैंपल खून जांच (CBC)", hinglish: "Sample CBC Blood Report" },
        { en: "Choose Photo from Device", hi: "डिवाइस से फोटो चुनें", hinglish: "Device se Photo Chunein" },

        // Diseases & Past Records lists
        { en: "My Reported Diseases", hi: "मेरी दर्ज की गई बीमारियां (My Diseases)", hinglish: "Meri Reported Bimariyan (My Diseases)" },
        { en: "Conditions you have informed the doctor", hi: "जो आपने डॉक्टर को बताई हैं", hinglish: "Jo aapne doctor ko batayi hain" },
        { en: "+ Add New", hi: "+ नई जोड़ें", hinglish: "+ Nayi Jodein" },
        { en: "Past Doctor Records", hi: "पुराने डॉक्टर का डेटा (Past Records)", hinglish: "Purane Doctor ka Data (Past Records)" },
        { en: "Previous doctor, clinic and medications", hi: "पिछले डॉक्टर, क्लिनिक व इलाज", hinglish: "Pichle doctor, clinic aur treatment" },
        { en: "+ Add Past Record", hi: "+ पुराना डेटा जोड़ें", hinglish: "+ Purana Data Jodein" },

        // Prescriptions & Emergency
        { en: "Doctor Verified Prescriptions", hi: "डॉक्टर द्वारा जांची गई दवाइयां", hinglish: "Doctor ki Verified Dawaiyan" },
        { en: "Prescriptions verified by Registered Practitioners.", hi: "Registered Doctor / Practitioner द्वारा सत्यापित पर्चा।", hinglish: "Registered Doctor dwara verified parcha." },
        { en: "Verified by Dr. Sharma", hi: "डॉ. शर्मा द्वारा सत्यापित", hinglish: "Dr. Sharma dwara Verified" },
        { en: "Emergency Help (Call 108)", hi: "आपातकालीन मदद (108 कॉल करें)", hinglish: "Emergency Help (108 Call Karein)" },
        { en: "If facing severe breathlessness or acute chest pain, visit the nearest emergency room or dial 108 immediately.", hi: "अगर सांस लेने में भारी तकलीफ या सीने में तेज़ दर्द हो, तो तुरंत नजदीकी अस्पताल जाएं या 108 डायल करें।", hinglish: "Agar saans lene me dikkat ya chest pain ho, to turant hospital jayein ya 108 dial karein." },
        { en: "Call 108 Emergency", hi: "108 पर कॉल करें", hinglish: "108 Call Karein" },

        // Patient Modal Forms
        { en: "Disease Name / Main Problem *", hi: "बीमारी का नाम / मुख्य समस्या *", hinglish: "Bimari ka Naam / Problem *" },
        { en: "Since when (Duration)", hi: "कब से है (Duration)", hinglish: "Kab se hai (Duration)" },
        { en: "Severity", hi: "तीव्रता (Severity)", hinglish: "Severity" },
        { en: "Mild", hi: "हल्का (Mild)", hinglish: "Halka (Mild)" },
        { en: "Moderate", hi: "मध्यम (Moderate)", hinglish: "Moderate" },
        { en: "Severe", hi: "गंभीर (Severe)", hinglish: "Severe (Gambhir)" },
        { en: "Symptoms & Extra Details", hi: "लक्षण व अतिरिक्त विवरण", hinglish: "Symptoms & Extra Details" },
        { en: "Save Disease & Send to Doctor", hi: "बीमारी सेव करें व डॉक्टर को भेजें", hinglish: "Bimari Save Karein & Send to Doctor" },
        { en: "Doctor's Name *", hi: "डॉक्टर का नाम *", hinglish: "Doctor ka Naam *" },
        { en: "Clinic / Hospital Name", hi: "क्लिनिक / अस्पताल का नाम", hinglish: "Clinic / Hospital Name" },
        { en: "Diagnosis / Condition *", hi: "निदान / बीमारी (Diagnosis) *", hinglish: "Diagnosis / Bimari *" },
        { en: "Year / Date", hi: "साल / तारीख (Year/Date)", hinglish: "Year / Date" },
        { en: "Past Prescribed Medicines", hi: "पिछली दवाइयां जो दी गई थीं", hinglish: "Pichli Dawaiyan" },
        { en: "Doctor's Advice / Old Tests", hi: "डॉक्टर के निर्देश / कोई पुरानी जांच", hinglish: "Doctor Advice / Old Reports" },
        { en: "Save Record (Safe & Secure)", hi: "पुराना रिकॉर्ड सुरक्षित करें (Save Record)", hinglish: "Purana Record Save Karein" },

        // Dashboard (dashboard.html)
        { en: "AYUSH DIGITAL HEALTHCARE", hi: "आयुष डिजिटल स्वास्थ्य सेवा", hinglish: "AYUSH Digital Healthcare" },
        { en: "🌿 AYUSH DIGITAL HEALTHCARE", hi: "🌿 आयुष डिजिटल स्वास्थ्य सेवा", hinglish: "🌿 AYUSH Digital Healthcare" },
        { en: "Manage Patient Cases", hi: "मरीज़ केस प्रबंधन", hinglish: "Manage Patient Cases" },
        { en: "Manage Patient Cases Smarter with AI", hi: "AI के साथ मरीज़ केस प्रबंधन को बनाएं सुगम व स्मार्ट", hinglish: "AI ke saath Manage Patient Cases Smarter" },
        { en: "Smarter with AI", hi: "AI के साथ सुगम व स्मार्ट", hinglish: "Smarter with AI" },
        { en: "Digitize patient case-taking, organize clinical records and get intelligent assistance throughout the consultation process.", hi: "मरीज़ केस-टेकिंग को डिजिटल बनाएं, क्लिनिकल रिकॉर्ड व्यवस्थित करें और परामर्श के दौरान AI सहायता पाएं।", hinglish: "Digitize patient case-taking, clinical records organize karein aur AI assistant payein." },
        { en: "Open AI Assistant", hi: "AI सहायक खोलें", hinglish: "AI Assistant Kholein" },
        { en: "Overview", hi: "अवलोकन (Overview)", hinglish: "Overview" },
        { en: "Quick insights about your patients and cases.", hi: "मरीज़ों और केसों की त्वरित जानकारी।", hinglish: "Patients aur cases ki quick summary." },
        { en: "Total Patients", hi: "कुल मरीज़", hinglish: "Total Patients" },
        { en: "Cases Today", hi: "आज के केस", hinglish: "Aaj ke Cases" },
        { en: "Pending Review", hi: "समीक्षा लंबित", hinglish: "Pending Review" },
        { en: "Active Treatments", hi: "सक्रिय उपचार", hinglish: "Active Treatments" },
        { en: "Urgent Attention Queue", hi: "तत्काल ध्यान कतार (Urgent Queue)", hinglish: "Urgent Attention Queue" },
        { en: "High-priority patient cases requiring clinical review or intervention", hi: "उच्च-प्राथमिकता वाले मरीज़ केस जिन्हें तुरंत डॉक्टर समीक्षा की आवश्यकता है", hinglish: "High-priority cases jinme immediate clinical review zaruri hai" },
        { en: "Clinical Alerts & Red Flags", hi: "क्लिनिकल अलर्ट व अति-गंभीर लक्षण", hinglish: "Clinical Alerts & Red Flags" },
        { en: "Recent Patient Cases", hi: "हाल के मरीज़ केस", hinglish: "Recent Patient Cases" },
        { en: "View All Patients", hi: "सभी मरीज़ देखें", hinglish: "View All Patients" },
        { en: "Patient Name", hi: "मरीज़ का नाम", hinglish: "Patient Name" },
        { en: "Ayush System", hi: "आयुष चिकित्सा पद्धति", hinglish: "Ayush System" },
        { en: "Chief Complaint", hi: "मुख्य समस्या / लक्षण", hinglish: "Chief Complaint" },
        { en: "Status", hi: "स्थिति", hinglish: "Status" },
        { en: "Action", hi: "कार्रवाई", hinglish: "Action" },
        { en: "Actions", hi: "कार्रवाइयां", hinglish: "Actions" },
        { en: "Review", hi: "समीक्षा करें", hinglish: "Review" },
        { en: "View Case", hi: "केस देखें", hinglish: "View Case" },
        { en: "Prescribe", hi: "दवा लिखें", hinglish: "Prescribe" },
        { en: "Completed Cases", hi: "पूर्ण हुए केस", hinglish: "Completed Cases" },
        { en: "Urgent Red Flags", hi: "अति-गंभीर लक्षण (Red Flags)", hinglish: "Urgent Red Flags" },
        { en: "Needs Attention", hi: "ध्यान देने योग्य", hinglish: "Needs Attention" },
        { en: "Follow-ups Due", hi: "नियत फॉलो-अप", hinglish: "Follow-ups Due" },
        { en: "System Accuracy", hi: "सिस्टम सटीकता", hinglish: "System Accuracy" },
        { en: "High Risk", hi: "उच्च जोखिम", hinglish: "High Risk" },
        { en: "Moderate Risk", hi: "मध्यम जोखिम", hinglish: "Moderate Risk" },
        { en: "Low Risk", hi: "सामान्य जोखिम", hinglish: "Low Risk" },

        // Clinical Complaints & Systems
        { en: "Ayurveda", hi: "आयुर्वेद", hinglish: "Ayurveda" },
        { en: "Homeopathy", hi: "होम्योपैथी", hinglish: "Homeopathy" },
        { en: "Unani", hi: "यूनानी", hinglish: "Unani" },
        { en: "Siddha", hi: "सिद्ध", hinglish: "Siddha" },
        { en: "Yoga & Naturopathy", hi: "योग व प्राकृतिक चिकित्सा", hinglish: "Yoga & Naturopathy" },
        { en: "Yoga", hi: "योग", hinglish: "Yoga" },
        { en: "Naturopathy", hi: "प्राकृतिक चिकित्सा", hinglish: "Naturopathy" },
        { en: "Chronic Arthritis", hi: "गंभीर गठिया (Arthritis)", hinglish: "Chronic Arthritis" },
        { en: "Digestive Disorder", hi: "पाचन विकार (Digestive Disorder)", hinglish: "Digestive Disorder" },
        { en: "Respiratory Issue", hi: "श्वसन समस्या (Respiratory)", hinglish: "Respiratory Issue" },
        { en: "Skin Condition", hi: "त्वचा रोग (Skin Condition)", hinglish: "Skin Condition" },
        { en: "Cervical Spondylosis", hi: "गर्दन का दर्द (Cervical Spondylosis)", hinglish: "Cervical Spondylosis" },
        { en: "Migraine", hi: "माइग्रेन (आधा सीसी सिरदर्द)", hinglish: "Migraine" },
        { en: "Chronic Knee Pain & Stiffness", hi: "घुटने का पुराना दर्द व अकड़न", hinglish: "Ghutne ka purana dard & stiffness" },
        { en: "Severe Acidity & Bloating", hi: "गंभीर एसिडिटी व पेट फूलना", hinglish: "Severe Acidity & Bloating" },
        { en: "Persistent Allergic Rhinitis", hi: "लगातार एलर्जी संबंधी सर्दी-जुकाम", hinglish: "Allergic Rhinitis" },
        { en: "Psoriasis Lesions on Elbows", hi: "कोहनी पर सोरायसिस के चकत्ते", hinglish: "Psoriasis Lesions on Elbows" },
        { en: "Neck Stiffness & Dizziness", hi: "गर्दन में अकड़न व चक्कर", hinglish: "Gardan me stiffness & chakkar" },

        // Patients Management Page (patients.html)
        { en: "Patient Management", hi: "मरीज़ प्रबंधन", hinglish: "Patient Management" },
        { en: "All Patients", hi: "सभी मरीज़", hinglish: "All Patients" },
        { en: "Manage and view all registered patient records.", hi: "सभी पंजीकृत मरीज़ों के रिकॉर्ड प्रबंधित करें व देखें।", hinglish: "Sabhi registered patient records manage aur view karein." },
        { en: "Add New Patient", hi: "नया मरीज़ जोड़ें", hinglish: "Add New Patient" },
        { en: "New This Month", hi: "इस महीने नए", hinglish: "Iss Month Naye" },
        { en: "Follow-ups", hi: "फॉलो-अप्स", hinglish: "Follow-ups" },
        { en: "Search by patient name or ID...", hi: "मरीज़ के नाम या ID से खोजें...", hinglish: "Patient ke naam ya ID se search karein..." },
        { en: "All Status", hi: "सभी स्थितियां (All Status)", hinglish: "All Status" },
        { en: "Active", hi: "सक्रिय (Active)", hinglish: "Active" },
        { en: "Follow-up", hi: "फॉलो-अप", hinglish: "Follow-up" },
        { en: "New", hi: "नया", hinglish: "New" },
        { en: "Filter", hi: "फ़िल्टर", hinglish: "Filter" },
        { en: "Patient", hi: "मरीज़", hinglish: "Patient" },
        { en: "Patient ID", hi: "मरीज़ ID", hinglish: "Patient ID" },
        { en: "Age / Gender", hi: "आयु / लिंग", hinglish: "Age / Gender" },
        { en: "Last Visit", hi: "पिछली मुलाक़ात", hinglish: "Last Visit" },
        { en: "View Dossier", hi: "दस्तावेज़ देखें (Dossier)", hinglish: "Dossier Dekhein" },
        { en: "View", hi: "देखें", hinglish: "View" },
        { en: "No patients match your search criteria.", hi: "आपकी खोज के अनुसार कोई मरीज़ नहीं मिला।", hinglish: "Aapke search ke mutabik koi patient nahi mila." },
        { en: "Comprehensive Patient Clinical Dossier", hi: "मरीज़ का सम्पूर्ण क्लिनिकल विवरण (Dossier)", hinglish: "Patient ka Full Clinical Dossier" },
        { en: "Blood Group:", hi: "रक्त समूह:", hinglish: "Blood Group:" },
        { en: "Blood Group", hi: "रक्त समूह", hinglish: "Blood Group" },
        { en: "Phone:", hi: "फोन:", hinglish: "Phone:" },
        { en: "Phone", hi: "फोन", hinglish: "Phone" },
        { en: "Allergies:", hi: "एलर्जी:", hinglish: "Allergies:" },
        { en: "Allergies", hi: "एलर्जी", hinglish: "Allergies" },
        { en: "Start Case Taking", hi: "केस-टेकिंग शुरू करें", hinglish: "Case Taking Shuru Karein" },
        { en: "Close", hi: "बंद करें", hinglish: "Close" },
        { en: "Previous", hi: "पिछला", hinglish: "Previous" },
        { en: "Next", hi: "अगला", hinglish: "Next" },
        { en: "Page", hi: "पृष्ठ", hinglish: "Page" },

        // Add Patient Page (add-patient.html)
        { en: "Patient Demographics & Registration", hi: "मरीज़ विवरण व पंजीकरण", hinglish: "Patient Demographics & Registration" },
        { en: "Full Name *", hi: "पूरा नाम *", hinglish: "Full Name *" },
        { en: "Full Name", hi: "पूरा नाम", hinglish: "Full Name" },
        { en: "Mobile Phone *", hi: "मोबाइल फोन *", hinglish: "Mobile Phone *" },
        { en: "Mobile Phone", hi: "मोबाइल फोन", hinglish: "Mobile Phone" },
        { en: "Age", hi: "आयु (Age)", hinglish: "Age" },
        { en: "Gender", hi: "लिंग (Gender)", hinglish: "Gender" },
        { en: "Male", hi: "पुरुष", hinglish: "Male" },
        { en: "Female", hi: "महिला", hinglish: "Female" },
        { en: "Other", hi: "अन्य", hinglish: "Other" },
        { en: "Known Drug Allergies", hi: "ज्ञात दवा एलर्जी", hinglish: "Drug Allergies" },
        { en: "Address", hi: "पता", hinglish: "Address" },
        { en: "City", hi: "शहर", hinglish: "City" },
        { en: "State", hi: "राज्य", hinglish: "State" },
        { en: "Emergency Contact", hi: "आपातकालीन संपर्क", hinglish: "Emergency Contact" },
        { en: "Save Patient Record", hi: "मरीज़ रिकॉर्ड सेव करें", hinglish: "Save Patient Record" },
        { en: "Cancel", hi: "रद्द करें", hinglish: "Cancel" },

        // Case Taking Page (case-taking.html)
        { en: "Intelligent Case Taking", hi: "बौद्धिक केस-टेकिंग (Intelligent Case Taking)", hinglish: "Intelligent Case Taking" },
        { en: "Ayush Clinical Case-Taking", hi: "आयुष क्लिनिकल केस-टेकिंग", hinglish: "Ayush Clinical Case-Taking" },
        { en: "Patient Selection", hi: "मरीज़ चयन", hinglish: "Patient Selection" },
        { en: "Select Patient", hi: "मरीज़ चुनें", hinglish: "Patient Chunein" },
        { en: "AYUSH System", hi: "आयुष चिकित्सा पद्धति", hinglish: "AYUSH System" },
        { en: "Duration of Complaint", hi: "समस्या की अवधि (Duration)", hinglish: "Duration of Complaint" },
        { en: "Pain / Severity Scale", hi: "दर्द व तीव्रता स्तर (Pain Scale)", hinglish: "Pain / Severity Scale" },
        { en: "Prakriti Assessment", hi: "प्रकृति परीक्षण (वात, पित्त, कफ)", hinglish: "Prakriti Assessment" },
        { en: "Ashtavidha Pariksha", hi: "अष्टविध परीक्षा (8-Fold Clinical Exam)", hinglish: "Ashtavidha Pariksha" },
        { en: "Nadi (Pulse)", hi: "नाड़ी परीक्षा (Pulse)", hinglish: "Nadi (Pulse)" },
        { en: "Mutra (Urine)", hi: "मूत्र परीक्षा (Urine)", hinglish: "Mutra (Urine)" },
        { en: "Mala (Stool)", hi: "मल परीक्षा (Stool)", hinglish: "Mala (Stool)" },
        { en: "Jihva (Tongue)", hi: "जिह्वा परीक्षा (Tongue)", hinglish: "Jihva (Tongue)" },
        { en: "Shabda (Voice/Sound)", hi: "शब्द परीक्षा (Voice/Sound)", hinglish: "Shabda (Voice/Sound)" },
        { en: "Sparsha (Touch/Skin)", hi: "स्पर्श परीक्षा (Touch/Skin)", hinglish: "Sparsha (Touch/Skin)" },
        { en: "Druk (Eyes/Vision)", hi: "दृक् परीक्षा (Eyes/Vision)", hinglish: "Druk (Eyes/Vision)" },
        { en: "Akruti (Physical Build)", hi: "आकृति परीक्षा (Physical Build)", hinglish: "Akruti (Physical Build)" },
        { en: "Vata", hi: "वात (Vata)", hinglish: "Vata" },
        { en: "Pitta", hi: "पित्त (Pitta)", hinglish: "Pitta" },
        { en: "Kapha", hi: "कफ (Kapha)", hinglish: "Kapha" },
        { en: "Dosha Balance", hi: "दोष संतुलन (Dosha Balance)", hinglish: "Dosha Balance" },
        { en: "Clinical Notes & Observations", hi: "क्लिनिकल नोट्स व अवलोकन", hinglish: "Clinical Notes & Observations" },
        { en: "AI Prescription Suggestions", hi: "AI औषधि सुझाव", hinglish: "AI Prescription Suggestions" },
        { en: "Suggested Remedies & Dosage", hi: "सुझाई गई औषधियां व मात्रा", hinglish: "Suggested Remedies & Dosage" },
        { en: "Pathya (Dietary Do's)", hi: "पथ्य (खाने योग्य आहार)", hinglish: "Pathya (Dietary Do's)" },
        { en: "Apathya (Dietary Don'ts)", hi: "अपथ्य (वर्जित आहार)", hinglish: "Apathya (Dietary Don'ts)" },
        { en: "Lifestyle Advice (Vihara)", hi: "जीवनशैली व विहार सलाह", hinglish: "Lifestyle Advice (Vihara)" },
        { en: "Next Follow-up Date", hi: "अगली मुलाक़ात की तारीख", hinglish: "Next Follow-up Date" },
        { en: "Save Case", hi: "केस सेव करें", hinglish: "Case Save Karein" },
        { en: "Submit Case for Review", hi: "समीक्षा हेतु केस भेजें", hinglish: "Submit Case for Review" },

        // Practitioner Review Workspace (practitioner-review.html)
        { en: "Clinical Review & Decision Support", hi: "क्लिनिकल समीक्षा व निर्णय सहायता", hinglish: "Clinical Review & Decision Support" },
        { en: "Pending Review Queue", hi: "समीक्षा लंबित कतार", hinglish: "Pending Review Queue" },
        { en: "Patient Clinical Summary", hi: "मरीज़ क्लिनिकल सारांश", hinglish: "Patient Clinical Summary" },
        { en: "AI Diagnostic Insights", hi: "AI नैदानिक अंतर्दृष्टि", hinglish: "AI Diagnostic Insights" },
        { en: "Drug-Drug Interaction Safety", hi: "दवा परस्पर क्रिया सुरक्षा", hinglish: "Drug-Drug Interaction Safety" },
        { en: "Allergy Conflicts Detected", hi: "पाई गई एलर्जी चेतावनियां", hinglish: "Allergy Conflicts Detected" },
        { en: "Verified Prescriptions", hi: "सत्यापित पर्चा", hinglish: "Verified Prescriptions" },
        { en: "Formulation", hi: "औषधि का नाम", hinglish: "Formulation" },
        { en: "Dosage", hi: "खुराक / मात्रा", hinglish: "Dosage" },
        { en: "Frequency", hi: "आवृत्ति (Frequency)", hinglish: "Frequency" },
        { en: "Duration", hi: "अवधि (Duration)", hinglish: "Duration" },
        { en: "Instructions", hi: "निर्देश", hinglish: "Instructions" },
        { en: "Approve Prescription", hi: "पर्चा स्वीकृत करें", hinglish: "Approve Prescription" },
        { en: "Modify Treatment Plan", hi: "उपचार योजना संशोधित करें", hinglish: "Modify Treatment Plan" },
        { en: "Add Clinical Remark", hi: "क्लिनिकल टिप्पणी जोड़ें", hinglish: "Add Clinical Remark" },

        // AI Assistant & Voice Case Taking (ai-assistant.html, voice-case.html)
        { en: "AI Clinical Assistant", hi: "AI क्लिनिकल सहायक", hinglish: "AI Clinical Assistant" },
        { en: "Ask Clinical Question", hi: "क्लिनिकल प्रश्न पूछें", hinglish: "Ask Clinical Question" },
        { en: "Type your clinical question or symptoms query...", hi: "अपना क्लिनिकल प्रश्न या लक्षण यहाँ लिखें...", hinglish: "Apna clinical question ya symptoms likhein..." },
        { en: "Suggested Queries:", hi: "सुझाई गई पूछताछ:", hinglish: "Suggested Queries:" },
        { en: "Send Query", hi: "प्रश्न भेजें", hinglish: "Send Query" },
        { en: "Voice-Driven Clinical Case Taking", hi: "आवाज़ आधारित क्लिनिकल केस-टेकिंग", hinglish: "Voice-Driven Clinical Case Taking" },
        { en: "Speak clinical consultation in Hindi or English", hi: "हिंदी या अंग्रेजी में परामर्श बोलें", hinglish: "Hindi ya English me consultation bolein" },
        { en: "Click microphone to start recording", hi: "रिकॉर्डिंग शुरू करने के लिए माइक दबाएं", hinglish: "Recording start karne ke liye mic dabayein" },
        { en: "Real-Time Clinical Speech Recognition", hi: "रीयल-टाइम क्लिनिकल वाणी पहचान", hinglish: "Real-Time Speech Recognition" },
        { en: "Extracted Symptoms & Clinical Entities", hi: "निकाले गए लक्षण व क्लिनिकल जानकारी", hinglish: "Extracted Symptoms & Clinical Info" },
        { en: "Transfer to Case Record", hi: "केस रिकॉर्ड में स्थानांतरित करें", hinglish: "Transfer to Case Record" },

        // Common Buttons & Actions
        { en: "Save", hi: "सुरक्षित करें", hinglish: "Save" },
        { en: "Cancel", hi: "रद्द करें", hinglish: "Cancel" },
        { en: "Submit", hi: "जमा करें", hinglish: "Submit" },
        { en: "Back", hi: "वापस जाएं", hinglish: "Back" },
        { en: "Edit", hi: "संपादित करें", hinglish: "Edit" },
        { en: "Delete", hi: "हटाएं", hinglish: "Delete" },
        { en: "Export CSV", hi: "CSV एक्सपोर्ट करें", hinglish: "Export CSV" },
        { en: "Print", hi: "प्रिंट करें", hinglish: "Print" },
        { en: "Download PDF", hi: "PDF डाउनलोड करें", hinglish: "Download PDF" },
        { en: "Under Review", hi: "समीक्षाधीन", hinglish: "Under Review" },
        { en: "Discharged", hi: "डिस्चार्ज", hinglish: "Discharged" },
        { en: "Resolved", hi: "समाधान हुआ", hinglish: "Resolved" },
        { en: "Pending", hi: "लंबित", hinglish: "Pending" },
        { en: "Normal", hi: "सामान्य", hinglish: "Normal" },
        { en: "High", hi: "उच्च", hinglish: "High" },
        { en: "Alert", hi: "चेतावनी", hinglish: "Alert" }
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

    function buildIndex() {
        PHRASE_BOOK.forEach(item => {
            const enKey = normalizeKey(item.en);
            const hiKey = normalizeKey(item.hi);
            const hinglishKey = normalizeKey(item.hinglish);

            if (enKey) lookupMap.set(enKey, item);
            if (hiKey) lookupMap.set(hiKey, item);
            if (hinglishKey) lookupMap.set(hinglishKey, item);
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
        if (!DICTIONARY[lang]) lang = "en";
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
            const translated = match[targetLang] || match.en;
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
                const translated = baseMatch[targetLang] || baseMatch.en;
                return lead + translated + trailingPunct + trail;
            }
        }

        // 3. Dynamic patterns: "Showing X to Y of Z patients"
        if (/Showing\s+\d+.*of\s+\d+.*patients/i.test(trimmed) || /\d+.*में से.*मरीज़.*दिखा/i.test(trimmed)) {
            const numMatch = trimmed.match(/(\d[\d,\.–\-]*)\s*(?:of|में से)\s*(\d[\d,]*)/i);
            const range = numMatch ? numMatch[1] : "1–5";
            const total = numMatch ? numMatch[2] : "1,248";
            if (targetLang === "hi") return `${lead}${total} में से ${range} मरीज़ दिखाए जा रहे हैं${trail}`;
            if (targetLang === "hinglish") return `${lead}Showing ${range} of ${total} patients${trail}`;
            return `${lead}Showing ${range} of ${total} patients${trail}`;
        }

        // 4. Dynamic pattern: "ID: AYU-..."
        if (/^ID:\s*/i.test(trimmed)) {
            const idPart = trimmed.replace(/^ID:\s*/i, "");
            if (targetLang === "hi") return `${lead}मरीज़ ID: ${idPart}${trail}`;
            return `${lead}ID: ${idPart}${trail}`;
        }

        // 5. Dynamic pattern: "Age: XX" or "Age / Gender"
        if (/^Age:\s*(\d+)/i.test(trimmed)) {
            const ageVal = trimmed.replace(/^Age:\s*/i, "");
            if (targetLang === "hi") return `${lead}आयु: ${ageVal}${trail}`;
            return `${lead}Age: ${ageVal}${trail}`;
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
                if (node.placeholder) {
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
                if (translated !== raw) {
                    node.textContent = translated;
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

// Automatically initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        I18nService.init();
    });
} else {
    I18nService.init();
}
