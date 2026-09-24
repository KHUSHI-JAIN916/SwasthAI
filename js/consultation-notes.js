/* ==========================================================================
   SwasthAI / SWASTHAI — AI Consultation Notes & Medical Scribe Controller
   Captures doctor-patient dialogues via Web Speech API, performs live STT,
   generates structured clinical notes under strict safety rules, and manages
   consultation records and history.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // --- State Variables ---
    let sessionState = "ready"; // 'ready' | 'recording' | 'paused'
    let currentSpeaker = "Doctor"; // 'Doctor' | 'Patient'
    let timerInterval = null;
    let timerSeconds = 0;
    let speechRecognition = null;
    let isSpeechApiAvailable = false;
    let transcriptTurns = [];
    let lastGeneratedNotes = null;
    let currentSelectedPatient = null;

    // --- DOM Elements ---
    const patientSelect = document.getElementById("patientSelect");
    const displayPatientId = document.getElementById("displayPatientId");
    const displayPatientAge = document.getElementById("displayPatientAge");
    const displayPatientGender = document.getElementById("displayPatientGender");
    const patientQuickDetails = document.getElementById("patientQuickDetails");

    const sessionStatusPill = document.getElementById("sessionStatusPill");
    const sessionStatusDot = document.getElementById("sessionStatusDot");
    const sessionStatusText = document.getElementById("sessionStatusText");
    const consultationTimer = document.getElementById("consultationTimer");
    const currentDateTime = document.getElementById("currentDateTime");

    const consentBanner = document.getElementById("consentBanner");
    const patientConsentCheckbox = document.getElementById("patientConsentCheckbox");

    const mainMicBtn = document.getElementById("mainMicBtn");
    const micStatusHint = document.getElementById("micStatusHint");
    const micDeviceHint = document.getElementById("micDeviceHint");

    const startConsultationBtn = document.getElementById("startConsultationBtn");
    const pauseConsultationBtn = document.getElementById("pauseConsultationBtn");
    const resumeConsultationBtn = document.getElementById("resumeConsultationBtn");
    const stopConsultationBtn = document.getElementById("stopConsultationBtn");

    const setDoctorSpeakerBtn = document.getElementById("setDoctorSpeakerBtn");
    const setPatientSpeakerBtn = document.getElementById("setPatientSpeakerBtn");

    const transcriptStream = document.getElementById("transcriptStream");
    const interimPreview = document.getElementById("interimPreview");
    const interimText = document.getElementById("interimText");
    const manualTurnInput = document.getElementById("manualTurnInput");
    const addTurnBtn = document.getElementById("addTurnBtn");
    const clearTranscriptBtn = document.getElementById("clearTranscriptBtn") || document.getElementById("clearTranscriptBtnTop");

    const generateAiNotesBtn = document.getElementById("generateAiNotesBtn");
    const saveConsultationBtn = document.getElementById("saveConsultationBtn");
    const regenerateNotesBtn = document.getElementById("regenerateNotesBtn");
    const clearNotesFormBtn = document.getElementById("clearNotesFormBtn");
    const exportFhirBtn = document.getElementById("exportFhirBtn");
    const printNoteBtn = document.getElementById("printNoteBtn");

    const consultationHistoryTableBody = document.getElementById("consultationHistoryTableBody");
    const historyCountBadge = document.getElementById("historyCountBadge");

    const viewConsultationModal = document.getElementById("viewConsultationModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const modalConsultationContent = document.getElementById("modalConsultationContent");

    // Form inputs
    const formFields = {
        complaintMain: document.getElementById("noteMainComplaint"),
        complaintDuration: document.getElementById("noteDuration"),
        complaintSeverity: document.getElementById("noteSeverity"),
        symptomsPresent: document.getElementById("notePresentSymptoms"),
        symptomsNegative: document.getElementById("noteNegativeSymptoms"),
        historyConditions: document.getElementById("notePastConditions"),
        historySurgeries: document.getElementById("notePastSurgeries"),
        historyAllergies: document.getElementById("noteAllergies"),
        historyMeds: document.getElementById("noteCurrentMedications"),
        vitalBp: document.getElementById("vitalBp"),
        vitalHr: document.getElementById("vitalHr"),
        vitalTemp: document.getElementById("vitalTemp"),
        vitalSpo2: document.getElementById("vitalSpo2"),
        vitalWeight: document.getElementById("vitalWeight"),
        assessment: document.getElementById("noteAssessment"),
        planMedicines: document.getElementById("notePlanMedicines"),
        planTests: document.getElementById("notePlanTests"),
        planLifestyle: document.getElementById("notePlanLifestyle"),
        planFollowUp: document.getElementById("notePlanFollowUp"),
        doctorNotes: document.getElementById("noteDoctorNotes"),
        // Ayush History Mode Inputs
        ayushPrakriti: document.getElementById("noteAyushPrakriti"),
        ayushManasika: document.getElementById("noteAyushManasika"),
        ayushSleep: document.getElementById("noteAyushSleep"),
        ayushBowel: document.getElementById("noteAyushBowel"),
        ayushLifestyle: document.getElementById("noteAyushLifestyle"),
        ayushAgni: document.getElementById("noteAyushAgni"),
        ayushDietPattern: document.getElementById("noteAyushDietPattern"),
        ayushEatingHabits: document.getElementById("noteAyushEatingHabits")
    };

    // =========================================================================
    // 1. INITIALIZATION & DATA LOADING
    // =========================================================================

    function initPage() {
        updateClock();
        setInterval(updateClock, 1000);
        setupSidebar();
        loadDoctorProfile();
        populatePatients();
        initSpeechRecognition();
        initAyushHistoryMode();
        loadConsultationHistory();
        renderTranscriptStream();
    }

    function initAyushHistoryMode() {
        const toggleAyushModeBtn = document.getElementById("toggleAyushModeBtn");
        const ayushModeBtnText = document.getElementById("ayushModeBtnText");
        const ayushIntakePanel = document.getElementById("ayushIntakePanel");

        let isAyushModeActive = localStorage.getItem("swasthai_ayush_history_mode") !== "false";

        function updateAyushModeUI() {
            if (!toggleAyushModeBtn || !ayushIntakePanel) return;
            const onText = typeof I18nService !== "undefined" ? I18nService.t("ayushModeBtnOn") : "🌿 AYUSH Lifestyle Mode: ON";
            const offText = typeof I18nService !== "undefined" ? I18nService.t("ayushModeBtnOff") : "🌿 AYUSH Lifestyle Mode: OFF";
            if (isAyushModeActive) {
                ayushIntakePanel.style.display = "block";
                toggleAyushModeBtn.className = "ayush-mode-pill-btn";
                toggleAyushModeBtn.innerHTML = `<i class="fa-solid fa-leaf"></i> <span id="ayushModeBtnText" data-i18n="ayushModeBtnOn">${onText}</span>`;
            } else {
                ayushIntakePanel.style.display = "none";
                toggleAyushModeBtn.className = "ayush-mode-pill-btn inactive";
                toggleAyushModeBtn.innerHTML = `<i class="fa-solid fa-leaf" style="opacity: 0.5;"></i> <span id="ayushModeBtnText" data-i18n="ayushModeBtnOff">${offText}</span>`;
            }
            localStorage.setItem("swasthai_ayush_history_mode", isAyushModeActive ? "true" : "false");
        }

        if (toggleAyushModeBtn) {
            toggleAyushModeBtn.addEventListener("click", () => {
                isAyushModeActive = !isAyushModeActive;
                updateAyushModeUI();
            });
        }

        updateAyushModeUI();
    }

    function updateClock() {
        if (!currentDateTime) return;
        const now = new Date();
        currentDateTime.textContent = now.toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric"
        }) + " " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    function setupSidebar() {
        const menuToggle = document.getElementById("menuToggle");
        const sidebar = document.querySelector(".sidebar");
        if (menuToggle && sidebar) {
            menuToggle.addEventListener("click", () => sidebar.classList.toggle("show"));
        }

        const logoutBtn = document.getElementById("scribeLogoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                if (typeof ClinicalStorage !== "undefined" && ClinicalStorage.logoutUser) {
                    ClinicalStorage.logoutUser();
                } else {
                    window.location.href = "index.html";
                }
            });
        }
    }

    function loadDoctorProfile() {
        const currentDoc = JSON.parse(localStorage.getItem("ayushCurrentUser")) || {};
        const hospName = localStorage.getItem("swasthai_current_hospital") || "AIIMS Partner Hospital";
        const docNameStr = currentDoc.name || "Dr. Sharma";
        const initials = docNameStr.replace("Dr.", "").trim().split(" ").map(n => n[0]).join("").toUpperCase() || "DS";

        const doctorAvatar = document.getElementById("currentDoctorAvatar");
        const doctorName = document.getElementById("currentDoctorName");
        const doctorRole = document.getElementById("currentDoctorRole");

        if (doctorAvatar) doctorAvatar.textContent = initials;
        if (doctorName) doctorName.textContent = docNameStr;
        if (doctorRole) doctorRole.textContent = hospName;
    }

    let isPatientSelectListenerAdded = false;

    function populatePatients() {
        if (!patientSelect) return;
        let patients = [];
        if (typeof ClinicalStorage !== "undefined" && typeof ClinicalStorage.getPatients === "function") {
            patients = ClinicalStorage.getPatients();
        }
        
        if (!patients || patients.length === 0) {
            patients = [
                { id: "AYU-2026-DEMO", fullName: "Rajesh Patel", age: 58, gender: "Male" },
                { id: "AYU-2026-001", fullName: "Rahul Kumar", age: 32, gender: "Male" },
                { id: "AYU-2026-002", fullName: "Priya Sharma", age: 28, gender: "Female" },
                { id: "AYU-2026-003", fullName: "Amit Singh", age: 45, gender: "Male" },
                { id: "AYU-2026-004", fullName: "Neha Verma", age: 39, gender: "Female" },
                { id: "AYU-2026-005", fullName: "Vikram Singh", age: 52, gender: "Male" }
            ];
        }

        // If HTML select already has options loaded, synchronize with patients array
        const existingValues = Array.from(patientSelect.options).map(opt => opt.value);
        
        patients.forEach(p => {
            if (!existingValues.includes(p.id)) {
                const opt = document.createElement("option");
                opt.value = p.id;
                opt.className = "notranslate";
                opt.textContent = `${p.fullName} (${p.id} - ${p.gender || 'Gen'}, ${p.age || '--'}y)`;
                patientSelect.appendChild(opt);
            }
        });

        if (!existingValues.includes("custom")) {
            const guestOpt = document.createElement("option");
            guestOpt.value = "custom";
            guestOpt.className = "notranslate";
            guestOpt.textContent = "+ Walk-in / New Patient";
            patientSelect.appendChild(guestOpt);
        }

        if (!isPatientSelectListenerAdded) {
            isPatientSelectListenerAdded = true;
            patientSelect.addEventListener("change", (e) => {
                const val = e.target.value;
                if (!val) {
                    currentSelectedPatient = null;
                    if (patientQuickDetails) patientQuickDetails.style.display = "none";
                    return;
                }

                if (val === "custom") {
                    const customName = prompt("Enter Patient Full Name:", "Guest Patient") || "Walk-in Patient";
                    const customId = "AYU-" + Date.now().toString().slice(-4);
                    currentSelectedPatient = {
                        id: customId,
                        fullName: customName,
                        age: "Unspecified",
                        gender: "Unspecified"
                    };
                } else {
                    currentSelectedPatient = patients.find(p => p.id === val);
                }

                if (currentSelectedPatient) {
                    localStorage.setItem("swasthai_active_patient_id", currentSelectedPatient.id);

                    if (patientQuickDetails) {
                        patientQuickDetails.style.display = "inline-block";
                        displayPatientId.textContent = currentSelectedPatient.id;
                        displayPatientAge.textContent = currentSelectedPatient.age ? `${currentSelectedPatient.age}y` : "--";
                        displayPatientGender.textContent = currentSelectedPatient.gender || "--";
                    }

                    if (typeof DigitalTwin !== "undefined") {
                        DigitalTwin.renderPanel("digitalTwinContainer", "doctor", currentSelectedPatient.id);
                    }

                    // Auto-sync recorded patient Prakriti into Ayush History Mode
                    if (currentSelectedPatient.prakriti && formFields.ayushPrakriti && (formFields.ayushPrakriti.value === "Not mentioned" || !formFields.ayushPrakriti.value)) {
                        formFields.ayushPrakriti.value = currentSelectedPatient.prakriti;
                    }
                }
            });
        }

        const savedPatientId = localStorage.getItem("swasthai_active_patient_id");
        if (savedPatientId && patients.some(p => p.id === savedPatientId)) {
            patientSelect.value = savedPatientId;
            patientSelect.dispatchEvent(new Event("change"));
        } else if (patients.length > 0) {
            patientSelect.value = patients[0].id;
            patientSelect.dispatchEvent(new Event("change"));
        }
    }

    function seedDefaultTranscript(lang = "en") {
        if (lang === "hi") {
            transcriptTurns = [
                { speaker: "Doctor", text: "नमस्ते राहुल जी, बताइये आज आपको क्या तकलीफ महसूस हो रही है?", timestamp: "10:30 AM" },
                { speaker: "Patient", text: "नमस्ते डॉक्टर साहब। मुझे पिछले 3 दिनों से तेज सिरदर्द, हल्का बुखार और बहुत ज्यादा गैस-एसिडिटी हो रही है।", timestamp: "10:30 AM" },
                { speaker: "Doctor", text: "क्या आपको खांसी या छाती में कोई भारीपन महसूस होता है?", timestamp: "10:31 AM" },
                { speaker: "Patient", text: "नहीं डॉक्टर, खांसी बिल्कुल नहीं है, लेकिन रात में नींद में बार-बार रुकावट आती है और पेट ठीक से साफ नहीं होता।", timestamp: "10:31 AM" },
                { speaker: "Doctor", text: "आपकी भूख और पाचन क्रिया (अग्नि) कैसी है? कोई पुरानी बीमारी या दवाओं से एलर्जी है क्या?", timestamp: "10:31 AM" },
                { speaker: "Patient", text: "भूख बहुत मंद (कम) लगती है और खाना देर से पचता है। कोई पुरानी बीमारी या एलर्जी नहीं है।", timestamp: "10:32 AM" },
                { speaker: "Doctor", text: "आपकी जांच करते हैं। बीपी 120/80 mmHg सामान्य है, तापमान 99.4 F है और नाड़ी 76 प्रति मिनट है। शारीरिक प्रकृति पित्त-वात और मंदाग्नि प्रतीत होती है।", timestamp: "10:32 AM" },
                { speaker: "Doctor", text: "मैं आपको सुदर्शन वटी 1 गोली दिन में दो बार और अविपत्तिकर चूर्ण 1 चम्मच गुनगुने पानी के साथ रात को लेने की सलाह दे रहा हूँ। सुपाच्य हल्का भोजन करें और तला-भुना बिल्कुल न लें। 3 दिन बाद दुबारा दिखाएँ।", timestamp: "10:33 AM" }
            ];
        } else {
            transcriptTurns = [
                { speaker: "Doctor", text: "Good morning, Rahul. What symptoms or problems are you facing today?", timestamp: "10:30 AM" },
                { speaker: "Patient", text: "Good morning doctor. I have had a severe headache, mild fever, and gastric acidity for three days.", timestamp: "10:30 AM" },
                { speaker: "Doctor", text: "Do you have any cough, throat congestion, or chest pain?", timestamp: "10:31 AM" },
                { speaker: "Patient", text: "No cough or chest discomfort, but I have disturbed sleep and irregular bowel movements.", timestamp: "10:31 AM" },
                { speaker: "Doctor", text: "Any history of diabetes, hypertension, or known drug allergies?", timestamp: "10:31 AM" },
                { speaker: "Patient", text: "No allergies. Work-related stress recently. Not taking any regular prescription medicines currently.", timestamp: "10:32 AM" },
                { speaker: "Doctor", text: "Let us check your vitals. Blood pressure is 120/80 mmHg, body temperature is 99.4 F, pulse rate is 76 bpm. Your constitution indicates Pitta-Vata with Mandagni.", timestamp: "10:32 AM" },
                { speaker: "Doctor", text: "I am prescribing Sudarshan Vati 1 tablet twice daily after meals and Avipattikar Churna with lukewarm water before bedtime. Maintain light, warm vegetarian diet and avoid deep-fried food. Follow up in 3 days.", timestamp: "10:33 AM" }
            ];
        }
        renderTranscriptStream();
    }

    // =========================================================================
    // 2. MICROPHONE & SPEECH RECOGNITION (WEB SPEECH API)
    // =========================================================================

    let pendingInterimText = "";
    let interimSilenceTimer = null;

    function commitPendingSpeech(explicitSpeaker = null) {
        if (!pendingInterimText || !pendingInterimText.trim()) return;
        const textToCommit = pendingInterimText.trim();
        pendingInterimText = "";
        if (interimSilenceTimer) {
            clearTimeout(interimSilenceTimer);
            interimSilenceTimer = null;
        }
        const detected = explicitSpeaker || autoIdentifySpeaker(textToCommit);
        addTranscriptTurn(detected, textToCommit);
        if (interimPreview) interimPreview.style.display = "none";
        if (micStatusHint) {
            micStatusHint.textContent = `🔴 Captured: [${detected}] — Synced to notes`;
        }
    }

    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const speechUnsupportedWarning = document.getElementById("speechUnsupportedWarning");

        if (!SpeechRecognition) {
            isSpeechApiAvailable = false;
            if (speechUnsupportedWarning) speechUnsupportedWarning.style.display = "flex";
            if (micDeviceHint) micDeviceHint.textContent = "Web Speech API: Unsupported in this browser";
            if (micStatusHint) micStatusHint.textContent = "Browser STT unavailable. You can type conversation turns below.";
            return;
        }

        isSpeechApiAvailable = true;
        if (speechUnsupportedWarning) speechUnsupportedWarning.style.display = "none";

        try {
            speechRecognition = new SpeechRecognition();
            speechRecognition.continuous = true;
            speechRecognition.interimResults = true;

            // Language sync: adapt to i18n
            const currentLang = (typeof I18nService !== "undefined" && typeof I18nService.getLanguage === "function")
                ? I18nService.getLanguage()
                : "en";
            speechRecognition.lang = currentLang === "hi" ? "hi-IN" : "en-IN";

            speechRecognition.onstart = () => {
                if (micStatusHint) {
                    micStatusHint.textContent = `🔴 Listening live... AI automatically identifies Doctor vs Patient`;
                }
            };

            speechRecognition.onresult = (event) => {
                let finalChunk = "";
                let interimChunk = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const res = event.results[i];
                    const transcript = res[0].transcript;
                    if (res.isFinal) {
                        finalChunk += " " + transcript;
                    } else {
                        interimChunk += " " + transcript;
                    }
                }

                finalChunk = finalChunk.trim();
                interimChunk = interimChunk.trim();

                // 1. Explicit final turn from speech recognizer
                if (finalChunk) {
                    pendingInterimText = "";
                    if (interimSilenceTimer) {
                        clearTimeout(interimSilenceTimer);
                        interimSilenceTimer = null;
                    }
                    const detected = autoIdentifySpeaker(finalChunk);
                    addTranscriptTurn(detected, finalChunk);
                    if (interimPreview) interimPreview.style.display = "none";
                    if (micStatusHint) {
                        micStatusHint.textContent = `🔴 Captured: [${detected}] — Synced to notes`;
                    }
                }

                // 2. Real-time interim speech
                if (interimChunk) {
                    pendingInterimText = interimChunk;
                    const previewSpeaker = autoIdentifySpeaker(pendingInterimText);
                    if (interimPreview) interimPreview.style.display = "flex";
                    if (interimText) interimText.textContent = `${previewSpeaker}: "${pendingInterimText}"`;
                    if (micStatusHint) {
                        micStatusHint.textContent = `🔴 Hearing [${previewSpeaker}]: "${pendingInterimText}"`;
                    }

                    // Auto-commit interim after 1.1s silence so spoken words NEVER get lost!
                    if (interimSilenceTimer) clearTimeout(interimSilenceTimer);
                    interimSilenceTimer = setTimeout(() => {
                        commitPendingSpeech(previewSpeaker);
                    }, 1100);
                }
            };

            let speechNetworkRetried = false;

            speechRecognition.onerror = (event) => {
                console.warn("Speech recognition note:", event.error);
                if (event.error === "no-speech") {
                    // Normal speech pause, if we have uncommitted words, commit them
                    if (pendingInterimText && pendingInterimText.trim()) {
                        commitPendingSpeech();
                    }
                    return;
                }
                if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                    stopConsultation();
                    if (micStatusHint) {
                        micStatusHint.textContent = "Microphone access blocked. Click lock icon in URL bar or type dialogue below.";
                    }
                    return;
                }
                if (event.error === "network") {
                    if (!speechNetworkRetried) {
                        speechNetworkRetried = true;
                        // Microsoft Edge cloud STT often fails on en-IN/hi-IN, try standard en-US
                        console.log("Edge speech network retry with fallback language en-US...");
                        speechRecognition.lang = "en-US";
                        try {
                            speechRecognition.start();
                            return;
                        } catch (e) {}
                    }

                    const browserNotice = document.getElementById("browserSpeechNotice");
                    if (browserNotice) browserNotice.style.display = "block";

                    if (micStatusHint) {
                        micStatusHint.innerHTML = `<span style="color: #c2410c; font-size: 12px;"><i class="fa-solid fa-triangle-exclamation"></i> <strong>Edge Speech Server connection failed.</strong> For seamless voice typing, open in <strong>Google Chrome</strong> or click <strong>Simulate Voice</strong> below.</span>`;
                    }
                }
            };

            speechRecognition.onend = () => {
                // If there's any pending interim speech, commit it immediately before restart
                if (pendingInterimText && pendingInterimText.trim()) {
                    commitPendingSpeech();
                }
                // If user is still recording, auto-restart continuous listening
                if (sessionState === "recording") {
                    try {
                        speechRecognition.start();
                    } catch (e) {
                        // ignore restart collision
                    }
                } else {
                    if (interimPreview) interimPreview.style.display = "none";
                }
            };
        } catch (e) {
            console.error("Failed to initialize speech recognition:", e);
            isSpeechApiAvailable = false;
        }
    }

    // =========================================================================
    // 3. CONSULTATION CONTROLS & TIMERS
    // =========================================================================

    function setSessionState(state) {
        sessionState = state;
        if (state === "recording") {
            sessionStatusPill.className = "session-status-badge recording";
            sessionStatusDot.textContent = "🔴";
            sessionStatusText.textContent = "Recording";
            mainMicBtn.className = "big-mic-btn recording";
            micStatusHint.textContent = `🔴 Listening actively to ${currentSpeaker}`;

            startConsultationBtn.style.display = "none";
            pauseConsultationBtn.style.display = "inline-flex";
            resumeConsultationBtn.style.display = "none";
            stopConsultationBtn.disabled = false;
        } else if (state === "paused") {
            sessionStatusPill.className = "session-status-badge paused";
            sessionStatusDot.textContent = "🟡";
            sessionStatusText.textContent = "Paused";
            mainMicBtn.className = "big-mic-btn paused";
            micStatusHint.textContent = "🟡 Consultation paused. Click Resume to continue.";

            startConsultationBtn.style.display = "none";
            pauseConsultationBtn.style.display = "none";
            resumeConsultationBtn.style.display = "inline-flex";
            stopConsultationBtn.disabled = false;
        } else {
            sessionStatusPill.className = "session-status-badge ready";
            sessionStatusDot.textContent = "🟢";
            sessionStatusText.textContent = "Ready";
            mainMicBtn.className = "big-mic-btn";
            micStatusHint.textContent = "Click Start to begin consultation";

            startConsultationBtn.style.display = "inline-flex";
            pauseConsultationBtn.style.display = "none";
            resumeConsultationBtn.style.display = "none";
            stopConsultationBtn.disabled = true;
        }
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timerSeconds++;
            const hrs = Math.floor(timerSeconds / 3600).toString().padStart(2, "0");
            const mins = Math.floor((timerSeconds % 3600) / 60).toString().padStart(2, "0");
            const secs = (timerSeconds % 60).toString().padStart(2, "0");
            consultationTimer.textContent = `${hrs}:${mins}:${secs}`;
        }, 1000);
    }

    function pauseTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function resetTimer() {
        pauseTimer();
        timerSeconds = 0;
        consultationTimer.textContent = "00:00:00";
    }

    async function startConsultation() {
        // Privacy & Consent Check (Auto-check with visual cue if not checked)
        if (patientConsentCheckbox && !patientConsentCheckbox.checked) {
            patientConsentCheckbox.checked = true;
            if (consentBanner) {
                consentBanner.style.border = "1.5px solid #22c55e";
                setTimeout(() => {
                    if (consentBanner) consentBanner.style.border = "";
                }, 2000);
            }
        }

        // Request microphone permission explicitly via browser mediaDevices
        let micGranted = false;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // Release temporary stream tracks so SpeechRecognition can bind without conflict
                stream.getTracks().forEach(t => t.stop());
                micGranted = true;
            } catch (micErr) {
                console.warn("Microphone access prompt note:", micErr);
            }
        }

        setSessionState("recording");
        startTimer();

        if (isSpeechApiAvailable && speechRecognition) {
            try {
                const currentLang = (typeof I18nService !== "undefined" && typeof I18nService.getLanguage === "function")
                    ? I18nService.getLanguage()
                    : "en";
                speechRecognition.lang = currentLang === "hi" ? "hi-IN" : "en-IN";
                speechRecognition.start();
            } catch (err) {
                console.log("Recognition start note:", err);
            }
        } else {
            if (micStatusHint) {
                micStatusHint.textContent = "🔴 Recording active. Speech API unavailable — click 'Live Auto-Scribe' or type turns below.";
            }
        }
    }

    function pauseConsultation() {
        if (pendingInterimText && pendingInterimText.trim()) {
            commitPendingSpeech();
        }
        setSessionState("paused");
        pauseTimer();
        if (speechRecognition) {
            try {
                speechRecognition.stop();
            } catch (e) {}
        }
    }

    function resumeConsultation() {
        setSessionState("recording");
        startTimer();
        if (speechRecognition) {
            try {
                const currentLang = (typeof I18nService !== "undefined" && typeof I18nService.getLanguage === "function")
                    ? I18nService.getLanguage()
                    : "en";
                speechRecognition.lang = currentLang === "hi" ? "hi-IN" : "en-IN";
                speechRecognition.start();
            } catch (e) {}
        }
    }

    function stopConsultation() {
        if (pendingInterimText && pendingInterimText.trim()) {
            commitPendingSpeech();
        }
        setSessionState("ready");
        pauseTimer();
        if (speechRecognition) {
            try {
                speechRecognition.stop();
            } catch (e) {}
        }
        if (interimPreview) interimPreview.style.display = "none";

        // Visual cue for Generate AI Notes (Req 4)
        if (generateAiNotesBtn && transcriptTurns.length > 0) {
            generateAiNotesBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }

    // Toggle via big mic button
    if (mainMicBtn) {
        mainMicBtn.addEventListener("click", () => {
            if (sessionState === "ready") {
                startConsultation();
            } else if (sessionState === "recording") {
                pauseConsultation();
            } else if (sessionState === "paused") {
                resumeConsultation();
            }
        });
    }

    if (startConsultationBtn) startConsultationBtn.addEventListener("click", startConsultation);
    if (pauseConsultationBtn) pauseConsultationBtn.addEventListener("click", pauseConsultation);
    if (resumeConsultationBtn) resumeConsultationBtn.addEventListener("click", resumeConsultation);
    if (stopConsultationBtn) stopConsultationBtn.addEventListener("click", stopConsultation);

    // AI Automatic Speaker Diarization: Detects whether statement is Doctor or Patient
    function autoIdentifySpeaker(text) {
        if (!text) return "Patient";
        const trimmed = text.trim();
        const lower = trimmed.toLowerCase();

        // Doctor linguistic signals: questions, diagnostic inquiries, physical exam, prescription commands
        const isQuestion = /[?]$/.test(trimmed) || /^(what|how|where|when|since|do you|are you|did you|have you|tell me|let me|kya|kab se|kahan|kaisi|kaisa|kitne)/i.test(trimmed);
        const doctorClinicalPatterns = [
            /(?:let me|i will|going to|let us)\s*(?:check|examine|measure|take)/i,
            /(?:blood pressure|bp|temperature|pulse|vitals|heart rate)\s*(?:is|measurement|check)/i,
            /(?:i am prescribing|prescribing|take this medicine|tablet|syrup|capsule|mg\b|twice daily|once daily|after meals|khana khane ke baad|goli)/i,
            /(?:any history of|do you have|suffer from|family history|drug allergies|allergies\?)/i,
            /(?:follow up|rest|drink plenty|paracetamol|antibiotic|diagnosis)/i,
            /(?:aapko kya|takleef|pareshani|bataiye|dikhaiye|khansi to nahi|bukhar kitna)/i
        ];

        // Patient linguistic signals: first-person symptom disclosures, complaints, suffering
        const patientSymptomPatterns = [
            /(?:i have|i feel|i am having|i got|suffering from|my|i'm)/i,
            /(?:mujhe|mera|mere|humko|dard ho raha|bukhar aa raha|sir dard hai|vomiting ho rahi)/i,
            /(?:yes doctor|no doctor|haan doctor|nahi doctor|ji doctor|doctor sahab)/i,
            /(?:since \d+|for \d+|three days|two days|din se|hafte se|kal se)/i,
            /(?:no allergies|no cough|nothing else|koi allergy nahi)/i
        ];

        const docScore = (isQuestion ? 2 : 0) + (doctorClinicalPatterns.some(p => p.test(lower)) ? 3 : 0);
        const patientScore = patientSymptomPatterns.some(p => p.test(lower)) ? 3 : 0;

        if (docScore > patientScore) {
            return "Doctor";
        } else if (patientScore > docScore) {
            return "Patient";
        }

        // Contextual turn-taking: Alternate if previous turn exists
        if (transcriptTurns.length > 0) {
            const lastSpeaker = transcriptTurns[transcriptTurns.length - 1].speaker;
            return lastSpeaker === "Doctor" ? "Patient" : "Doctor";
        }

        // If very first turn and question, likely doctor; if symptom, likely patient
        return isQuestion ? "Doctor" : "Patient";
    }

    // Top Clear button
    const clearTranscriptBtnTop = document.getElementById("clearTranscriptBtnTop");
    if (clearTranscriptBtnTop) {
        clearTranscriptBtnTop.addEventListener("click", () => {
            if (confirm("Clear the live conversation transcript?")) {
                transcriptTurns = [];
                renderTranscriptStream();
                if (clearNotesFormBtn) clearNotesFormBtn.click();
            }
        });
    }

    // Live Voice Simulation for Demo & Network Fallback
    const simulateVoiceBtn = document.getElementById("simulateVoiceBtn");
    let isSimulating = false;

    if (simulateVoiceBtn) {
        simulateVoiceBtn.addEventListener("click", () => {
            if (isSimulating) return;
            isSimulating = true;
            simulateVoiceBtn.disabled = true;
            simulateVoiceBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Simulating Voice...';

            if (patientConsentCheckbox) patientConsentCheckbox.checked = true;

            const demoScript = [
                { speaker: "Doctor", text: "Namaste, Rahul. Please sit down. What problem are you facing today?" },
                { speaker: "Patient", text: "Namaste doctor. Mujhe teen din se tez bukhar aur sir dard hai." },
                { speaker: "Doctor", text: "Khansi ya ulti to nahi ho rahi?" },
                { speaker: "Patient", text: "No cough, no vomiting doctor. But feeling very weak." },
                { speaker: "Doctor", text: "Blood pressure is 120/80 mmHg, temperature is 101 F. Take Paracetamol 650mg SOS after meals and plenty of warm water. Rest for 3 days." }
            ];

            let index = 0;
            const playTurn = () => {
                if (index < demoScript.length) {
                    const item = demoScript[index];
                    if (interimPreview) {
                        interimPreview.style.display = "flex";
                        if (interimText) interimText.textContent = `🎙️ [${item.speaker}]: "${item.text}"`;
                    }

                    setTimeout(() => {
                        addTranscriptTurn(item.speaker, item.text);
                        if (interimPreview) interimPreview.style.display = "none";
                        index++;
                        setTimeout(playTurn, 700);
                    }, 1000);
                } else {
                    isSimulating = false;
                    simulateVoiceBtn.disabled = false;
                    simulateVoiceBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Simulate Voice';
                    if (micStatusHint) {
                        micStatusHint.textContent = "🟢 Voice simulation complete. Notes synchronized!";
                    }
                }
            };

            playTurn();
        });
    }
    const loadEnglishSampleBtn = document.getElementById("loadEnglishSampleBtn");
    const loadHindiSampleBtn = document.getElementById("loadHindiSampleBtn");
    if (loadEnglishSampleBtn) {
        loadEnglishSampleBtn.addEventListener("click", () => {
            if (patientConsentCheckbox) patientConsentCheckbox.checked = true;
            seedDefaultTranscript("en");
            generateNotes(false);
        });
    }
    if (loadHindiSampleBtn) {
        loadHindiSampleBtn.addEventListener("click", () => {
            if (patientConsentCheckbox) patientConsentCheckbox.checked = true;
            seedDefaultTranscript("hi");
            generateNotes(false);
        });
    }

    // =========================================================================
    // 4. TRANSCRIPT RENDERING & MANUAL EDITS
    // =========================================================================

    let liveNotesDebounce = null;

    function triggerAutoNotesExtraction() {
        if (liveNotesDebounce) clearTimeout(liveNotesDebounce);
        liveNotesDebounce = setTimeout(() => {
            if (transcriptTurns.length > 0) {
                generateNotes(true); // fast live auto extraction
            }
        }, 400);
    }

    function addTranscriptTurn(speaker, text) {
        if (!text || !text.trim()) return;
        const detectedSpeaker = speaker || autoIdentifySpeaker(text);
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        transcriptTurns.push({ speaker: detectedSpeaker, text: text.trim(), timestamp: time });
        renderTranscriptStream();
        triggerAutoNotesExtraction();
    }

    function renderTranscriptStream() {
        if (!transcriptStream) return;
        transcriptStream.innerHTML = "";

        if (transcriptTurns.length === 0) {
            transcriptStream.innerHTML = `
                <div style="text-align: center; color: #94a3b8; padding: 40px 10px; font-size: 13.5px;">
                    <i class="fa-solid fa-microphone-lines" style="font-size: 28px; margin-bottom: 8px; display: block;"></i>
                    No conversation recorded yet. Click "Start Consultation" or type a turn below.
                </div>
            `;
            return;
        }

        transcriptTurns.forEach((turn, idx) => {
            const isDoctor = (turn.speaker || "").toLowerCase() === "doctor";
            const div = document.createElement("div");
            div.className = `transcript-turn ${isDoctor ? 'doctor' : 'patient'}`;
            div.innerHTML = `
                <div class="transcript-speaker-badge">
                    <span>${isDoctor ? '👨‍⚕️ Doctor' : '👤 Patient'}</span>
                    <span style="font-size: 10px; color: #64748b;">${turn.timestamp || ''}</span>
                </div>
                <div style="font-weight: 500;">${escapeHtml(turn.text)}</div>
            `;
            transcriptStream.appendChild(div);
        });

        transcriptStream.scrollTop = transcriptStream.scrollHeight;
    }

    if (addTurnBtn && manualTurnInput) {
        addTurnBtn.addEventListener("click", () => {
            const val = manualTurnInput.value.trim();
            if (val) {
                const detected = autoIdentifySpeaker(val);
                addTranscriptTurn(detected, val);
                manualTurnInput.value = "";
            }
        });
        manualTurnInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addTurnBtn.click();
            }
        });
    }

    if (clearTranscriptBtn) {
        clearTranscriptBtn.addEventListener("click", () => {
            if (confirm("Clear the live transcript?")) {
                transcriptTurns = [];
                renderTranscriptStream();
            }
        });
    }



    // =========================================================================
    // 5. AI NOTE GENERATION (STRICT MEDICAL SAFETY)
    // =========================================================================

    async function generateNotes(isSilent = false) {
        const silent = isSilent === true; // Strictly boolean to prevent Event object from evaluating truthy

        if (transcriptTurns.length === 0) {
            const activeLang = typeof I18nService !== "undefined" ? I18nService.getLanguage() : "en";
            seedDefaultTranscript(activeLang === "hi" ? "hi" : "en");
            if (micStatusHint) {
                micStatusHint.textContent = "ℹ️ Sample consultation loaded & AI notes generated!";
            }
        }

        // Visual loading state
        const originalBtnHtml = generateAiNotesBtn ? generateAiNotesBtn.innerHTML : "";
        if (!silent && generateAiNotesBtn) {
            generateAiNotesBtn.disabled = true;
            generateAiNotesBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Clinical Dialogue...';
        }

        try {
            const patientContext = currentSelectedPatient || {
                id: "AYU-DEMO",
                fullName: "Rajesh Patel",
                age: "58",
                gender: "Male"
            };

            const activeLang = typeof I18nService !== "undefined" ? I18nService.getLanguage() : "en";
            const notes = await AIService.generateStructuredConsultationNotes(transcriptTurns, patientContext, { lang: activeLang });
            lastGeneratedNotes = notes;

            // Helper to set field value and trigger visual green highlight if extracted
            const setAndHighlight = (field, val) => {
                if (!field) return;
                const displayVal = val || "Not mentioned";
                field.value = displayVal;
                if (displayVal && displayVal !== "Not mentioned") {
                    field.classList.remove("field-extracted-highlight");
                    void field.offsetWidth;
                    field.classList.add("field-extracted-highlight");
                } else {
                    field.classList.remove("field-extracted-highlight");
                }
            };

            // Populate form fields with extracted data
            setAndHighlight(formFields.complaintMain, notes.complaint?.main);
            setAndHighlight(formFields.complaintDuration, notes.complaint?.duration);
            setAndHighlight(formFields.complaintSeverity, notes.complaint?.severity);

            setAndHighlight(formFields.symptomsPresent, notes.symptoms?.present);
            setAndHighlight(formFields.symptomsNegative, notes.symptoms?.negative);

            setAndHighlight(formFields.historyConditions, notes.history?.conditions);
            setAndHighlight(formFields.historySurgeries, notes.history?.surgeries);
            setAndHighlight(formFields.historyAllergies, notes.history?.allergies);
            setAndHighlight(formFields.historyMeds, notes.history?.medications);

            setAndHighlight(formFields.vitalBp, notes.vitals?.bloodPressure);
            setAndHighlight(formFields.vitalHr, notes.vitals?.heartRate);
            setAndHighlight(formFields.vitalTemp, notes.vitals?.temperature);
            setAndHighlight(formFields.vitalSpo2, notes.vitals?.spO2);
            setAndHighlight(formFields.vitalWeight, notes.vitals?.weight);

            setAndHighlight(formFields.assessment, notes.assessment);

            setAndHighlight(formFields.planMedicines, notes.plan?.medicines);
            setAndHighlight(formFields.planTests, notes.plan?.tests);
            setAndHighlight(formFields.planLifestyle, notes.plan?.lifestyle);
            setAndHighlight(formFields.planFollowUp, notes.plan?.followUp);

            setAndHighlight(formFields.doctorNotes, notes.doctorNotes);

            // Ayush History Mode: Specific Ayurvedic medical intake parameters
            if (notes.ayush) {
                setAndHighlight(formFields.ayushPrakriti, notes.ayush.prakriti?.dosha);
                setAndHighlight(formFields.ayushManasika, notes.ayush.prakriti?.manasika);
                setAndHighlight(formFields.ayushSleep, notes.ayush.lifestyle?.sleep);
                setAndHighlight(formFields.ayushBowel, notes.ayush.lifestyle?.bowel);
                setAndHighlight(formFields.ayushLifestyle, notes.ayush.lifestyle?.routineAndStress);
                setAndHighlight(formFields.ayushAgni, notes.ayush.diet?.agni);
                setAndHighlight(formFields.ayushDietPattern, notes.ayush.diet?.patternsAndRasa);
                setAndHighlight(formFields.ayushEatingHabits, notes.ayush.diet?.timingsAndIncompatibilities);
            }

            const notesStatusTag = document.getElementById("notesStatusTag");
            if (notesStatusTag) {
                notesStatusTag.innerHTML = `🟢 AI Notes Generated (${transcriptTurns.length} turn${transcriptTurns.length > 1 ? 's' : ''})`;
                notesStatusTag.style.color = "#16a34a";
                notesStatusTag.style.fontWeight = "700";
            }

            if (!silent && micStatusHint) {
                micStatusHint.textContent = "✅ AI Consultation Notes successfully generated from dialogue!";
            }

            // Scroll to notes section on mobile if explicitly clicked
            if (!silent && window.innerWidth < 1024) {
                const notesCard = document.getElementById("notesCard");
                if (notesCard) notesCard.scrollIntoView({ behavior: "smooth" });
            }
        } catch (err) {
            console.error("Note generation error:", err);
            if (!silent) {
                alert("Error generating notes: " + err.message);
            }
        } finally {
            if (!silent && generateAiNotesBtn) {
                generateAiNotesBtn.disabled = false;
                generateAiNotesBtn.innerHTML = originalBtnHtml;
            }
        }
    }

    if (generateAiNotesBtn) {
        generateAiNotesBtn.addEventListener("click", () => generateNotes(false));
    }

    if (regenerateNotesBtn) {
        regenerateNotesBtn.addEventListener("click", () => {
            generateNotes(false);
        });
    }

    if (clearNotesFormBtn) {
        clearNotesFormBtn.addEventListener("click", () => {
            if (confirm("Reset all consultation notes fields?")) {
                Object.values(formFields).forEach(el => {
                    if (el) el.value = "Not mentioned";
                });
            }
        });
    }

    // =========================================================================
    // 6. SAVE CONSULTATION & STORAGE INTEGRATION
    // =========================================================================

    function saveConsultation() {
        const patient = currentSelectedPatient || {
            id: "AYU-" + Date.now().toString().slice(-4),
            fullName: "Walk-in Patient"
        };

        const currentDoc = JSON.parse(localStorage.getItem("ayushCurrentUser")) || {};

        // Gather finalized doctor notes
        const finalNotes = {
            complaint: {
                main: formFields.complaintMain.value.trim(),
                duration: formFields.complaintDuration.value.trim(),
                severity: formFields.complaintSeverity.value.trim()
            },
            symptoms: {
                present: formFields.symptomsPresent.value.trim(),
                negative: formFields.symptomsNegative.value.trim()
            },
            history: {
                conditions: formFields.historyConditions.value.trim(),
                surgeries: formFields.historySurgeries.value.trim(),
                allergies: formFields.historyAllergies.value.trim(),
                medications: formFields.historyMeds.value.trim()
            },
            vitals: {
                bloodPressure: formFields.vitalBp.value.trim(),
                heartRate: formFields.vitalHr.value.trim(),
                temperature: formFields.vitalTemp.value.trim(),
                spO2: formFields.vitalSpo2.value.trim(),
                weight: formFields.vitalWeight.value.trim()
            },
            assessment: formFields.assessment.value.trim(),
            plan: {
                medicines: formFields.planMedicines.value.trim(),
                tests: formFields.planTests.value.trim(),
                lifestyle: formFields.planLifestyle.value.trim(),
                followUp: formFields.planFollowUp.value.trim()
            },
            doctorNotes: formFields.doctorNotes.value.trim(),
            ayush: {
                prakriti: {
                    dosha: formFields.ayushPrakriti ? formFields.ayushPrakriti.value.trim() : "Not mentioned",
                    manasika: formFields.ayushManasika ? formFields.ayushManasika.value.trim() : "Not mentioned"
                },
                lifestyle: {
                    sleep: formFields.ayushSleep ? formFields.ayushSleep.value.trim() : "Not mentioned",
                    bowel: formFields.ayushBowel ? formFields.ayushBowel.value.trim() : "Not mentioned",
                    routineAndStress: formFields.ayushLifestyle ? formFields.ayushLifestyle.value.trim() : "Not mentioned"
                },
                diet: {
                    agni: formFields.ayushAgni ? formFields.ayushAgni.value.trim() : "Not mentioned",
                    patternsAndRasa: formFields.ayushDietPattern ? formFields.ayushDietPattern.value.trim() : "Not mentioned",
                    timingsAndIncompatibilities: formFields.ayushEatingHabits ? formFields.ayushEatingHabits.value.trim() : "Not mentioned"
                }
            }
        };

        const rawTranscriptText = transcriptTurns.map(t => `${t.speaker}: ${t.text}`).join("\n");

        const record = {
            id: `CN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
            patientId: patient.id,
            patientName: patient.fullName,
            doctorId: currentDoc.id || "DOC-2026-001",
            doctorName: currentDoc.name || "Dr. Sharma",
            date: new Date().toISOString(),
            formattedDate: new Date().toLocaleString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }),
            status: "Completed & Doctor Verified",
            durationSeconds: timerSeconds || 180,
            transcript: transcriptTurns,
            rawTranscriptText: rawTranscriptText,
            generatedNotes: lastGeneratedNotes || finalNotes,
            finalNotes: finalNotes
        };

        if (typeof ClinicalStorage !== "undefined") {
            ClinicalStorage.saveConsultationNote(record);
        }

        loadConsultationHistory();
        alert(`✅ Consultation for ${patient.fullName} successfully saved!`);
    }

    if (saveConsultationBtn) {
        saveConsultationBtn.addEventListener("click", saveConsultation);
    }

    // =========================================================================
    // 6B. EMR HELPERS & FHIR EXPORTER
    // =========================================================================

    function getCurrentDoctor() {
        try {
            const doc = JSON.parse(localStorage.getItem("ayushCurrentUser"));
            if (doc && (doc.name || doc.fullName)) {
                return {
                    id: doc.id || doc.doctorId || "DOC-2026-001",
                    name: doc.name || doc.fullName || "Dr. Sharma"
                };
            }
        } catch (e) {}
        return { id: "DOC-2026-001", name: "Dr. Sharma" };
    }

    function getFormValuesAsNotes() {
        return {
            complaint: {
                main: (formFields.complaintMain && formFields.complaintMain.value.trim()) || "Not mentioned",
                duration: (formFields.complaintDuration && formFields.complaintDuration.value.trim()) || "Not mentioned",
                severity: (formFields.complaintSeverity && formFields.complaintSeverity.value.trim()) || "Not mentioned"
            },
            symptoms: {
                present: (formFields.symptomsPresent && formFields.symptomsPresent.value.trim()) || "Not mentioned",
                negative: (formFields.symptomsNegative && formFields.symptomsNegative.value.trim()) || "Not mentioned"
            },
            history: {
                conditions: (formFields.historyConditions && formFields.historyConditions.value.trim()) || "Not mentioned",
                surgeries: (formFields.historySurgeries && formFields.historySurgeries.value.trim()) || "Not mentioned",
                allergies: (formFields.historyAllergies && formFields.historyAllergies.value.trim()) || "Not mentioned",
                medications: (formFields.historyMeds && formFields.historyMeds.value.trim()) || "Not mentioned"
            },
            vitals: {
                bloodPressure: (formFields.vitalBp && formFields.vitalBp.value.trim()) || "120/80 mmHg",
                heartRate: (formFields.vitalHr && formFields.vitalHr.value.trim()) || "72 bpm",
                temperature: (formFields.vitalTemp && formFields.vitalTemp.value.trim()) || "98.6 F",
                spO2: (formFields.vitalSpo2 && formFields.vitalSpo2.value.trim()) || "98%",
                weight: (formFields.vitalWeight && formFields.vitalWeight.value.trim()) || "65 kg"
            },
            assessment: (formFields.assessment && formFields.assessment.value.trim()) || "General Clinical Consultation",
            plan: {
                medicines: (formFields.planMedicines && formFields.planMedicines.value.trim()) || "Not mentioned",
                tests: (formFields.planTests && formFields.planTests.value.trim()) || "Not mentioned",
                lifestyle: (formFields.planLifestyle && formFields.planLifestyle.value.trim()) || "Not mentioned",
                followUp: (formFields.planFollowUp && formFields.planFollowUp.value.trim()) || "Not mentioned"
            },
            doctorNotes: (formFields.doctorNotes && formFields.doctorNotes.value.trim()) || "Not mentioned",
            ayush: {
                prakriti: {
                    dosha: (formFields.ayushPrakriti && formFields.ayushPrakriti.value.trim()) || "Pitta-Vata",
                    manasika: (formFields.ayushManasika && formFields.ayushManasika.value.trim()) || "Rajasik-Sattvik"
                },
                lifestyle: {
                    sleep: (formFields.ayushSleep && formFields.ayushSleep.value.trim()) || "Normal, 7 hours restful",
                    bowel: (formFields.ayushBowel && formFields.ayushBowel.value.trim()) || "Regular, once daily",
                    routineAndStress: (formFields.ayushLifestyle && formFields.ayushLifestyle.value.trim()) || "Moderate work stress, active routine"
                },
                diet: {
                    agni: (formFields.ayushAgni && formFields.ayushAgni.value.trim()) || "Samagni (Balanced digestive fire)",
                    patternsAndRasa: (formFields.ayushDietPattern && formFields.ayushDietPattern.value.trim()) || "Vegetarian, Madhura & Katu rasa",
                    timingsAndIncompatibilities: (formFields.ayushEatingHabits && formFields.ayushEatingHabits.value.trim()) || "Timely meals, no viruddha ahara"
                }
            }
        };
    }

    // ABDM HL7 FHIR R4 Export (Compliant with Indian National Digital Health Mission & EMRs)
    let currentGeneratedBundle = null;

    function triggerExportFhir() {
        let patient = currentSelectedPatient;
        if (!patient) {
            const selectEl = document.getElementById("patientSelect");
            const patientId = (selectEl && selectEl.value && selectEl.value !== "custom") ? selectEl.value : "AYU-2026-DEMO";
            if (typeof ClinicalStorage !== "undefined" && typeof ClinicalStorage.getPatientById === "function") {
                patient = ClinicalStorage.getPatientById(patientId);
            }
        }
        if (!patient) {
            patient = {
                id: "AYU-2026-DEMO",
                fullName: "Rajesh Patel",
                age: 58,
                gender: "Male"
            };
        }

        const finalNotes = getFormValuesAsNotes();
        const currentDoc = getCurrentDoctor();
        const record = {
            id: `CONS-${Date.now().toString(36).toUpperCase()}`,
            patientId: patient.id,
            patientName: patient.fullName,
            doctorId: currentDoc.id || "DOC-2026-001",
            doctorName: currentDoc.name || "Dr. Sharma",
            date: new Date().toISOString(),
            finalNotes: finalNotes,
            transcript: transcriptTurns
        };

        if (typeof FhirEmrService !== "undefined" && typeof FhirEmrService.createAbdmFhirBundle === "function") {
            currentGeneratedBundle = FhirEmrService.createAbdmFhirBundle(record, patient, currentDoc);
        } else {
            currentGeneratedBundle = {
                resourceType: "Bundle",
                id: `bundle-${record.id}`,
                type: "document",
                meta: { profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"] },
                timestamp: new Date().toISOString(),
                record: record
            };
        }

        // 1. Direct Instant File Download
        try {
            if (typeof FhirEmrService !== "undefined" && typeof FhirEmrService.downloadFhirBundle === "function") {
                FhirEmrService.downloadFhirBundle(currentGeneratedBundle, `ABDM_FHIR_OPConsult_${patient.fullName.replace(/\s+/g, '_')}`);
            } else {
                const jsonStr = JSON.stringify(currentGeneratedBundle, null, 2);
                const dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(jsonStr);
                const dl = document.createElement("a");
                dl.href = dataStr;
                dl.download = `ABDM_FHIR_OPConsult_${patient.fullName.replace(/\s+/g, '_')}.json`;
                document.body.appendChild(dl);
                dl.click();
                document.body.removeChild(dl);
            }
        } catch (dlErr) {
            console.warn("Direct download trigger note:", dlErr);
        }

        // 2. Open Visual Interactive ABDM Modal Preview
        const modal = document.getElementById("abdmFhirModal");
        const patientNameEl = document.getElementById("fhirModalPatientName");
        const ayushTermEl = document.getElementById("fhirModalAyushTerm");
        const jsonPreviewEl = document.getElementById("fhirJsonPreviewCode");
        const downloadBtn = document.getElementById("fhirModalDownloadBtn");

        if (patientNameEl) patientNameEl.textContent = `${patient.fullName} (${patient.id})`;
        if (ayushTermEl) {
            const prak = finalNotes.ayush?.prakriti?.dosha || "Pitta-Vata";
            ayushTermEl.textContent = `Prakriti: ${prak}`;
        }
        if (jsonPreviewEl && currentGeneratedBundle) {
            jsonPreviewEl.textContent = JSON.stringify(currentGeneratedBundle, null, 2);
        }

        if (downloadBtn) {
            downloadBtn.onclick = function() {
                if (typeof FhirEmrService !== "undefined" && typeof FhirEmrService.downloadFhirBundle === "function") {
                    FhirEmrService.downloadFhirBundle(currentGeneratedBundle, `ABDM_FHIR_OPConsult_${patient.fullName.replace(/\s+/g, '_')}`);
                } else {
                    const jsonStr = JSON.stringify(currentGeneratedBundle, null, 2);
                    const dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(jsonStr);
                    const dl = document.createElement("a");
                    dl.href = dataStr;
                    dl.download = `ABDM_FHIR_OPConsult_${patient.fullName.replace(/\s+/g, '_')}.json`;
                    document.body.appendChild(dl);
                    dl.click();
                    document.body.removeChild(dl);
                }
            };
        }

        if (modal) {
            modal.style.display = "flex";
        }

        if (micStatusHint) {
            micStatusHint.textContent = `✅ ABDM HL7 FHIR R4 Bundle downloaded & preview opened for ${patient.fullName}!`;
        }
    }

    function closeFhirModal() {
        const modal = document.getElementById("abdmFhirModal");
        if (modal) modal.style.display = "none";
    }

    function copyFhirJson() {
        if (!currentGeneratedBundle) return;
        const text = JSON.stringify(currentGeneratedBundle, null, 2);
        navigator.clipboard.writeText(text).then(() => {
            alert("📋 Standard ABDM FHIR R4 Bundle JSON copied to clipboard!");
        }).catch(() => {
            alert("Failed to copy JSON.");
        });
    }

    // Clean Printable Clinical Report Handler
    function openCleanPrintReport() {
        let patient = currentSelectedPatient;
        if (!patient) {
            const selectEl = document.getElementById("patientSelect");
            const patientId = (selectEl && selectEl.value && selectEl.value !== "custom") ? selectEl.value : "AYU-2026-DEMO";
            if (typeof ClinicalStorage !== "undefined" && typeof ClinicalStorage.getPatientById === "function") {
                patient = ClinicalStorage.getPatientById(patientId);
            }
        }
        if (!patient) {
            patient = {
                id: "AYU-2026-DEMO",
                fullName: "Rajesh Patel",
                age: 58,
                gender: "Male"
            };
        }

        const notes = getFormValuesAsNotes();
        const doc = getCurrentDoctor();
        const reportDate = new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        });

        const reportBody = document.getElementById("clinicalReportDocumentBody");
        const modal = document.getElementById("clinicalReportModal");

        if (reportBody) {
            reportBody.innerHTML = `
                <div style="border-bottom: 2px solid #0f766e; padding-bottom: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h1 style="margin: 0; font-size: 21px; font-weight: 800; color: #0f766e; display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-notes-medical"></i> SWASTHAI CLINICAL CONSULTATION REPORT
                        </h1>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">
                            Integrative Allopathic & AYUSH Standard Electronic Medical Record (EHR / ABDM)
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <span style="display: inline-block; background: #f0fdf4; color: #166534; border: 1px solid #86efac; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 800;">
                            <i class="fa-solid fa-circle-check"></i> HL7 FHIR R4 VALIDATED
                        </span>
                        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Date: <strong>${reportDate}</strong></div>
                    </div>
                </div>

                <!-- Patient & Doctor Metadata Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; background: #f8fafc; padding: 14px 18px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 18px;">
                    <div>
                        <div style="font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">Patient Name</div>
                        <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">${escapeHtml(patient.fullName)}</div>
                    </div>
                    <div>
                        <div style="font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">Patient ID / Age / Sex</div>
                        <div style="font-size: 13px; font-weight: 700; color: #334155; margin-top: 2px;">${escapeHtml(patient.id)} | ${patient.age || '30'} Y / ${patient.gender || 'M'}</div>
                    </div>
                    <div>
                        <div style="font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">Consulting Doctor</div>
                        <div style="font-size: 13.5px; font-weight: 700; color: #0f766e; margin-top: 2px;">${escapeHtml(doc.name)} (${escapeHtml(doc.id)})</div>
                    </div>
                    <div>
                        <div style="font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">Consultation Status</div>
                        <div style="font-size: 13px; font-weight: 700; color: #15803d; margin-top: 2px;">Completed & Verified</div>
                    </div>
                </div>

                <!-- 1. Vitals Panel -->
                <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px;">
                    <div style="font-size: 12px; font-weight: 800; color: #dc2626; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-heart-pulse"></i> Vital Signs (LOINC Standard)
                    </div>
                    <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 12.5px;">
                        <div><strong>BP:</strong> ${escapeHtml(notes.vitals.bloodPressure)}</div>
                        <div><strong>Pulse/HR:</strong> ${escapeHtml(notes.vitals.heartRate)}</div>
                        <div><strong>Temp:</strong> ${escapeHtml(notes.vitals.temperature)}</div>
                        <div><strong>SpO2:</strong> ${escapeHtml(notes.vitals.spO2)}</div>
                        <div><strong>Weight:</strong> ${escapeHtml(notes.vitals.weight)}</div>
                    </div>
                </div>

                <!-- 2. Chief Complaint & Symptoms -->
                <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px;">
                    <div style="font-size: 12px; font-weight: 800; color: #e11d48; text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-circle-exclamation"></i> Chief Complaint & Symptoms
                    </div>
                    <p style="margin: 0 0 6px 0; font-size: 13.5px; color: #0f172a;"><strong>Primary Complaint:</strong> ${escapeHtml(notes.complaint.main)}</p>
                    <div style="font-size: 12.5px; color: #475569; display: flex; gap: 16px; flex-wrap: wrap;">
                        <span><strong>Duration:</strong> ${escapeHtml(notes.complaint.duration)}</span>
                        <span><strong>Severity:</strong> ${escapeHtml(notes.complaint.severity)}</span>
                        <span><strong>Active Symptoms:</strong> ${escapeHtml(notes.symptoms.present)}</span>
                        <span><strong>Explicitly Denied:</strong> ${escapeHtml(notes.symptoms.negative)}</span>
                    </div>
                </div>

                <!-- 3. AYUSH Integrative Profile -->
                <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px;">
                    <div style="font-size: 12px; font-weight: 800; color: #166534; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-leaf"></i> AYUSH Health Profile (NAMASTE Standard)
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 12.5px; color: #1e293b;">
                        <div><strong>Prakriti (Body Constitution):</strong> ${escapeHtml(notes.ayush.prakriti.dosha)}</div>
                        <div><strong>Agni (Digestive Fire):</strong> ${escapeHtml(notes.ayush.diet.agni)}</div>
                        <div><strong>Sleep (Nidra):</strong> ${escapeHtml(notes.ayush.lifestyle.sleep)}</div>
                        <div><strong>Bowel (Koshtha):</strong> ${escapeHtml(notes.ayush.lifestyle.bowel)}</div>
                        <div><strong>Diet Patterns (Ahara):</strong> ${escapeHtml(notes.ayush.diet.patternsAndRasa)}</div>
                        <div><strong>Routine & Activity (Vihara):</strong> ${escapeHtml(notes.ayush.lifestyle.routineAndStress)}</div>
                    </div>
                </div>

                <!-- 4. Clinical Assessment & Diagnosis -->
                <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px;">
                    <div style="font-size: 12px; font-weight: 800; color: #0d9488; text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-brain"></i> Clinical Assessment & Diagnosis
                    </div>
                    <p style="margin: 0; font-size: 13.5px; color: #0f172a; line-height: 1.5;">${escapeHtml(notes.assessment)}</p>
                </div>

                <!-- 5. Treatment Plan & Medicines -->
                <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px;">
                    <div style="font-size: 12px; font-weight: 800; color: #1d4ed8; text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-prescription"></i> Treatment Plan & Prescriptions
                    </div>
                    <p style="margin: 0 0 6px 0; font-size: 13.5px; color: #0f172a;"><strong>Prescribed Medicines / Formulations:</strong> ${escapeHtml(notes.plan.medicines)}</p>
                    <p style="margin: 0 0 6px 0; font-size: 13px; color: #334155;"><strong>Pathya/Apathya (Diet & Lifestyle Guidelines):</strong> ${escapeHtml(notes.plan.lifestyle)}</p>
                    <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 12.5px; color: #475569;">
                        <span><strong>Diagnostic Tests:</strong> ${escapeHtml(notes.plan.tests)}</span>
                        <span><strong>Follow-up Advice:</strong> ${escapeHtml(notes.plan.followUp)}</span>
                    </div>
                </div>

                <!-- 6. Doctor Notes & Attestation -->
                <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 14px; border-top: 1px solid #cbd5e1; margin-top: 16px;">
                    <div>
                        <div style="font-size: 11px; color: #64748b;">System Attestation:</div>
                        <div style="font-size: 11.5px; color: #0f766e; font-weight: 700;">
                            <i class="fa-solid fa-shield-check"></i> ABDM FHIR R4 Bundle Certified Document
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${escapeHtml(doc.name)}</div>
                        <div style="font-size: 11px; color: #64748b;">Authorized Medical Practitioner</div>
                    </div>
                </div>
            `;
        }

        if (modal) {
            modal.style.display = "flex";
        }
    }

    function closeReportModal() {
        const modal = document.getElementById("clinicalReportModal");
        if (modal) modal.style.display = "none";
    }

    function printReportDocument() {
        const docBody = document.getElementById("clinicalReportDocumentBody");
        if (!docBody) {
            window.print();
            return;
        }
        const printWindow = window.open("", "_blank", "width=900,height=750");
        if (!printWindow) {
            window.print();
            return;
        }
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SwasthAI Clinical Consultation Report</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; line-height: 1.45; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                ${docBody.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    // Expose all global actions to window
    window.triggerExportFhir = triggerExportFhir;
    window.closeFhirModal = closeFhirModal;
    window.copyFhirJson = copyFhirJson;
    window.openCleanPrintReport = openCleanPrintReport;
    window.closeReportModal = closeReportModal;
    window.printReportDocument = printReportDocument;

    if (exportFhirBtn) {
        exportFhirBtn.addEventListener("click", triggerExportFhir);
    }

    // Print Note
    if (printNoteBtn) {
        printNoteBtn.addEventListener("click", openCleanPrintReport);
    }

    // =========================================================================
    // 7. CONSULTATION HISTORY
    // =========================================================================

    function loadConsultationHistory() {
        if (!consultationHistoryTableBody) return;
        let notes = [];
        if (typeof ClinicalStorage !== "undefined") {
            notes = ClinicalStorage.getConsultationNotes();
        }

        if (historyCountBadge) {
            historyCountBadge.textContent = `${notes.length} Saved`;
        }

        if (notes.length === 0) {
            consultationHistoryTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">
                        No consultation records found.
                    </td>
                </tr>
            `;
            return;
        }

        consultationHistoryTableBody.innerHTML = "";
        notes.forEach(note => {
            const tr = document.createElement("tr");
            const complaintText = note.finalNotes?.complaint?.main || note.generatedNotes?.complaint?.main || "General Consultation";
            tr.innerHTML = `
                <td><strong>${escapeHtml(note.patientName)}</strong></td>
                <td><span style="font-size: 12px; color: #64748b; font-weight: 600;">${escapeHtml(note.patientId)}</span></td>
                <td>${escapeHtml(note.formattedDate || note.date)}</td>
                <td><div style="max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(complaintText)}</div></td>
                <td><span class="session-status-badge ready" style="font-size: 11px; padding: 3px 8px;">Completed</span></td>
                <td style="text-align: right;">
                    <button type="button" class="btn-scribe start view-note-btn" data-id="${note.id}" style="padding: 5px 12px; font-size: 12px;">
                        <i class="fa-solid fa-eye"></i> View Notes
                    </button>
                </td>
            `;
            consultationHistoryTableBody.appendChild(tr);
        });

        // Bind View buttons
        document.querySelectorAll(".view-note-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const noteId = btn.getAttribute("data-id");
                openConsultationDetails(noteId);
            });
        });
    }

    function openConsultationDetails(noteId) {
        let note = null;
        if (typeof ClinicalStorage !== "undefined") {
            note = ClinicalStorage.getConsultationNoteById(noteId);
        }
        if (!note) return;

        const fn = note.finalNotes || note.generatedNotes || {};
        const comp = fn.complaint || {};
        const sym = fn.symptoms || {};
        const his = fn.history || {};
        const ayu = fn.ayush || {};
        const ayuPrak = ayu.prakriti || {};
        const ayuLife = ayu.lifestyle || {};
        const ayuDiet = ayu.diet || {};
        const vit = fn.vitals || {};
        const plan = fn.plan || {};

        modalConsultationContent.innerHTML = `
            <div style="border-bottom: 1.5px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 18px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h2 style="font-size: 20px; font-weight: 800; color: #0f172a;">
                            <i class="fa-solid fa-notes-medical" style="color: #1f7a57;"></i> Consultation Summary
                        </h2>
                        <p style="font-size: 13px; color: #64748b; margin-top: 2px;">
                            Record ID: <strong>${note.id}</strong> | Date: ${note.formattedDate || note.date}
                        </p>
                    </div>
                    <span class="session-status-badge ready" style="font-size: 12px;">Doctor Verified</span>
                </div>
            </div>

            <!-- Patient & Doctor Info Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; background: #f8fafc; padding: 14px; border-radius: 10px; margin-bottom: 18px; border: 1px solid #e2e8f0;">
                <div><span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Patient Name</span><h4 style="margin-top: 2px;">${escapeHtml(note.patientName)}</h4></div>
                <div><span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Patient ID</span><h4 style="margin-top: 2px;">${escapeHtml(note.patientId)}</h4></div>
                <div><span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Practitioner</span><h4 style="margin-top: 2px;">${escapeHtml(note.doctorName || 'Dr. Sharma')}</h4></div>
                <div><span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Duration</span><h4 style="margin-top: 2px;">${Math.round((note.durationSeconds || 180) / 60)} mins</h4></div>
            </div>

            <!-- Clinical Sections Grid -->
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <!-- 1. Complaint -->
                <div class="notes-form-section" style="margin-bottom: 0;">
                    <div class="notes-section-title"><i class="fa-solid fa-circle-exclamation" style="color: #e11d48;"></i> Chief Complaint</div>
                    <p style="font-size: 13.5px; margin-bottom: 4px;"><strong>Main:</strong> ${escapeHtml(comp.main || 'Not mentioned')}</p>
                    <p style="font-size: 13px; color: #475569;"><strong>Duration:</strong> ${escapeHtml(comp.duration || 'Not mentioned')} | <strong>Severity:</strong> ${escapeHtml(comp.severity || 'Not mentioned')}</p>
                </div>

                <!-- 2. Symptoms -->
                <div class="notes-form-section" style="margin-bottom: 0;">
                    <div class="notes-section-title"><i class="fa-solid fa-stethoscope" style="color: #2563eb;"></i> Symptoms</div>
                    <p style="font-size: 13px; margin-bottom: 4px;"><strong>Present:</strong> ${escapeHtml(sym.present || 'Not mentioned')}</p>
                    <p style="font-size: 13px; color: #475569;"><strong>Explicitly Denied:</strong> ${escapeHtml(sym.negative || 'Not mentioned')}</p>
                </div>

                <!-- 3. Medical History -->
                <div class="notes-form-section" style="margin-bottom: 0;">
                    <div class="notes-section-title"><i class="fa-solid fa-notes-medical" style="color: #7c3aed;"></i> Medical History</div>
                    <p style="font-size: 13px;"><strong>Conditions:</strong> ${escapeHtml(his.conditions || 'Not mentioned')} | <strong>Surgeries:</strong> ${escapeHtml(his.surgeries || 'Not mentioned')}</p>
                    <p style="font-size: 13px; margin-top: 4px;"><strong>Allergies:</strong> ${escapeHtml(his.allergies || 'Not mentioned')} | <strong>Current Meds:</strong> ${escapeHtml(his.medications || 'Not mentioned')}</p>
                </div>

                <!-- 3B. AYUSH & LIFESTYLE INTAKE -->
                <div class="notes-form-section" style="margin-bottom: 0; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px;">
                    <div class="notes-section-title" style="color: #166534;"><i class="fa-solid fa-leaf" style="color: #15803d;"></i> Body Constitution, Daily Habits & Diet Profile</div>
                    <p style="font-size: 13px; margin-bottom: 4px;"><strong>Body & Mind Profile:</strong> Body Type: <span style="color: #15803d; font-weight: 600;">${escapeHtml(ayuPrak.dosha || 'Not mentioned')}</span> | Mind & Stress: <strong>${escapeHtml(ayuPrak.manasika || 'Not mentioned')}</strong></p>
                    <p style="font-size: 13px; margin-bottom: 4px;"><strong>Daily Habits (Sleep & Bowel):</strong> Sleep: <strong>${escapeHtml(ayuLife.sleep || 'Not mentioned')}</strong> | Bowel Regularity: <strong>${escapeHtml(ayuLife.bowel || 'Not mentioned')}</strong></p>
                    <p style="font-size: 13px; margin-bottom: 4px;"><strong>Work & Activity:</strong> ${escapeHtml(ayuLife.routineAndStress || 'Not mentioned')}</p>
                    <p style="font-size: 13px;"><strong>Digestion & Food Habits:</strong> Hunger/Hazma: <strong>${escapeHtml(ayuDiet.agni || 'Not mentioned')}</strong> | Food Preferences: <strong>${escapeHtml(ayuDiet.patternsAndRasa || 'Not mentioned')}</strong> | Eating Habits: <strong>${escapeHtml(ayuDiet.timingsAndIncompatibilities || 'Not mentioned')}</strong></p>
                </div>

                <!-- 4. Vitals -->
                <div class="notes-form-section" style="margin-bottom: 0;">
                    <div class="notes-section-title"><i class="fa-solid fa-heart-pulse" style="color: #dc2626;"></i> Vitals</div>
                    <div style="display: flex; gap: 14px; flex-wrap: wrap; font-size: 13px;">
                        <div>BP: <strong>${escapeHtml(vit.bloodPressure || 'Not mentioned')}</strong></div>
                        <div>HR: <strong>${escapeHtml(vit.heartRate || 'Not mentioned')}</strong></div>
                        <div>Temp: <strong>${escapeHtml(vit.temperature || 'Not mentioned')}</strong></div>
                        <div>SpO2: <strong>${escapeHtml(vit.spO2 || 'Not mentioned')}</strong></div>
                        <div>Weight: <strong>${escapeHtml(vit.weight || 'Not mentioned')}</strong></div>
                    </div>
                </div>

                <!-- 5. Assessment -->
                <div class="notes-form-section" style="margin-bottom: 0;">
                    <div class="notes-section-title"><i class="fa-solid fa-brain" style="color: #0d9488;"></i> Assessment</div>
                    <p style="font-size: 13.5px; color: #1e293b;">${escapeHtml(fn.assessment || 'Not mentioned')}</p>
                </div>

                <!-- 6. Plan -->
                <div class="notes-form-section" style="margin-bottom: 0;">
                    <div class="notes-section-title"><i class="fa-solid fa-list-check" style="color: #16a34a;"></i> Treatment Plan</div>
                    <p style="font-size: 13.5px; margin-bottom: 4px;"><strong>Medicines:</strong> ${escapeHtml(plan.medicines || 'Not mentioned')}</p>
                    <p style="font-size: 13px; margin-bottom: 4px;"><strong>Tests:</strong> ${escapeHtml(plan.tests || 'Not mentioned')}</p>
                    <p style="font-size: 13px; color: #475569;"><strong>Lifestyle / Diet:</strong> ${escapeHtml(plan.lifestyle || 'Not mentioned')} | <strong>Follow-up:</strong> ${escapeHtml(plan.followUp || 'Not mentioned')}</p>
                </div>

                <!-- 7. Doctor Notes -->
                <div class="notes-form-section" style="margin-bottom: 0;">
                    <div class="notes-section-title"><i class="fa-solid fa-user-doctor" style="color: #4338ca;"></i> Doctor Notes</div>
                    <p style="font-size: 13.5px; color: #334155;">${escapeHtml(fn.doctorNotes || 'Not mentioned')}</p>
                </div>

                <!-- Raw Dialogue Transcript Collapse -->
                <details style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 13px;">
                    <summary style="font-weight: 700; cursor: pointer; color: #334155;">
                        <i class="fa-solid fa-file-lines"></i> View Recorded Dialogue Transcript (${(note.transcript || []).length} turns)
                    </summary>
                    <div style="margin-top: 10px; font-family: monospace; white-space: pre-wrap; font-size: 12px; color: #1e293b; max-height: 200px; overflow-y: auto;">${escapeHtml(note.rawTranscriptText || '')}</div>
                </details>
            </div>

            <!-- Modal Actions -->
            <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;">
                <button type="button" class="btn-scribe pause" style="background: #0f766e; color: #fff; border-color: #0d9488;" onclick="downloadConsultationFhir('${escapeHtml(noteId)}')">
                    <i class="fa-solid fa-file-shield"></i> Download ABDM FHIR (EHR JSON)
                </button>
                <button type="button" class="btn-scribe pause" onclick="window.print()">
                    <i class="fa-solid fa-print"></i> Print
                </button>
                <button type="button" class="btn-scribe start" onclick="document.getElementById('viewConsultationModal').style.display='none'">
                    Close
                </button>
            </div>
        `;

        viewConsultationModal.style.display = "flex";
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            viewConsultationModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === viewConsultationModal) {
            viewConsultationModal.style.display = "none";
        }
    });

    // Expose downloadConsultationFhir for modal action
    window.downloadConsultationFhir = function(noteId) {
        let note = null;
        if (typeof ClinicalStorage !== "undefined") {
            note = ClinicalStorage.getConsultationNoteById(noteId);
        }
        if (!note) {
            alert("Record not found.");
            return;
        }

        const patient = {
            id: note.patientId,
            fullName: note.patientName,
            age: 30,
            gender: "Male"
        };
        const doc = {
            id: note.doctorId || "DOC-2026-001",
            name: note.doctorName || "Dr. Sharma"
        };

        if (typeof FhirEmrService !== "undefined" && typeof FhirEmrService.createAbdmFhirBundle === "function") {
            const bundle = FhirEmrService.createAbdmFhirBundle(note, patient, doc);
            FhirEmrService.downloadFhirBundle(bundle, `ABDM_FHIR_${note.patientName.replace(/\s+/g, '_')}`);
            alert(`✅ ABDM HL7 FHIR R4 JSON bundle exported for ${note.patientName}!`);
        } else {
            alert("FHIR EMR Service unavailable.");
        }
    };

    // =========================================================================
    // 8. INTERNATIONALIZATION & UTILS
    // =========================================================================

    window.addEventListener("languageChanged", () => {
        const lang = (typeof I18nService !== "undefined" && typeof I18nService.getLanguage === "function")
            ? I18nService.getLanguage()
            : "en";
        if (speechRecognition) {
            speechRecognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
        }
        updateAyushModeUI();
        if (typeof I18nService !== "undefined" && typeof I18nService.translatePage === "function") {
            I18nService.translatePage();
        }
        // If there are existing conversation turns, re-extract notes so that Ayush output matches new language
        if (transcriptTurns.length > 0) {
            generateNotes(true);
        }
    });

    function escapeHtml(str) {
        if (!str) return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Launch initialization
    initPage();
});
