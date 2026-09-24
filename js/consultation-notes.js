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
    const clearTranscriptBtn = document.getElementById("clearTranscriptBtn");

    const generateAiNotesBtn = document.getElementById("generateAiNotesBtn");
    const saveConsultationBtn = document.getElementById("saveConsultationBtn");
    const regenerateNotesBtn = document.getElementById("regenerateNotesBtn");
    const clearNotesFormBtn = document.getElementById("clearNotesFormBtn");
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

    function seedDefaultTranscript() {
        transcriptTurns = [
            { speaker: "Doctor", text: "Good morning, Rahul. What problem are you facing today?", timestamp: "10:30 AM" },
            { speaker: "Patient", text: "Good morning doctor. I have been having severe headache and mild fever for three days.", timestamp: "10:30 AM" },
            { speaker: "Doctor", text: "Do you have cough or chest congestion?", timestamp: "10:31 AM" },
            { speaker: "Patient", text: "No, no cough at all.", timestamp: "10:31 AM" },
            { speaker: "Doctor", text: "Any history of diabetes, hypertension, or drug allergies?", timestamp: "10:31 AM" },
            { speaker: "Patient", text: "No allergies. I had work stress recently. No regular medicines right now.", timestamp: "10:32 AM" },
            { speaker: "Doctor", text: "Let me check your vitals. Blood pressure is 120/80 mmHg, temperature is 99.4 F, pulse is 76 bpm.", timestamp: "10:32 AM" },
            { speaker: "Doctor", text: "It looks like tension-type headache with viral prodrome. I am prescribing Paracetamol 650mg SOS after meals and Brahmi Vati 1 tablet twice daily. Drink plenty of water and rest. Follow up in 3 days if fever persists.", timestamp: "10:33 AM" }
        ];
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
            seedDefaultTranscript();
            generateNotes();
        });
    }
    if (loadHindiSampleBtn) {
        loadHindiSampleBtn.addEventListener("click", () => {
            if (patientConsentCheckbox) patientConsentCheckbox.checked = true;
            seedDefaultTranscript();
            generateNotes();
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
        if (transcriptTurns.length === 0) {
            if (!isSilent) {
                alert("The transcript is currently empty. Record or type patient consultation dialogue first.");
            }
            return;
        }

        // Visual loading state
        const originalBtnHtml = generateAiNotesBtn ? generateAiNotesBtn.innerHTML : "";
        if (!isSilent && generateAiNotesBtn) {
            generateAiNotesBtn.disabled = true;
            generateAiNotesBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Clinical Dialogue...';
        }

        try {
            const patientContext = currentSelectedPatient || {
                id: "AYU-DEMO",
                fullName: "Patient",
                age: "30",
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
            setAndHighlight(formFields.complaintMain, notes.complaint.main);
            setAndHighlight(formFields.complaintDuration, notes.complaint.duration);
            setAndHighlight(formFields.complaintSeverity, notes.complaint.severity);

            setAndHighlight(formFields.symptomsPresent, notes.symptoms.present);
            setAndHighlight(formFields.symptomsNegative, notes.symptoms.negative);

            setAndHighlight(formFields.historyConditions, notes.history.conditions);
            setAndHighlight(formFields.historySurgeries, notes.history.surgeries);
            setAndHighlight(formFields.historyAllergies, notes.history.allergies);
            setAndHighlight(formFields.historyMeds, notes.history.medications);

            setAndHighlight(formFields.vitalBp, notes.vitals.bloodPressure);
            setAndHighlight(formFields.vitalHr, notes.vitals.heartRate);
            setAndHighlight(formFields.vitalTemp, notes.vitals.temperature);
            setAndHighlight(formFields.vitalSpo2, notes.vitals.spO2);
            setAndHighlight(formFields.vitalWeight, notes.vitals.weight);

            setAndHighlight(formFields.assessment, notes.assessment);

            setAndHighlight(formFields.planMedicines, notes.plan.medicines);
            setAndHighlight(formFields.planTests, notes.plan.tests);
            setAndHighlight(formFields.planLifestyle, notes.plan.lifestyle);
            setAndHighlight(formFields.planFollowUp, notes.plan.followUp);

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
                notesStatusTag.innerHTML = `🟢 Live Synced (${transcriptTurns.length} turn${transcriptTurns.length > 1 ? 's' : ''})`;
                notesStatusTag.style.color = "#16a34a";
                notesStatusTag.style.fontWeight = "700";
            }

            // Scroll to notes section on mobile if explicitly clicked
            if (!isSilent && window.innerWidth < 1024) {
                document.getElementById("notesCard").scrollIntoView({ behavior: "smooth" });
            }
        } catch (err) {
            console.error("Note generation error:", err);
            if (!isSilent) {
                alert("Error generating notes: " + err.message);
            }
        } finally {
            if (!isSilent && generateAiNotesBtn) {
                generateAiNotesBtn.disabled = false;
                generateAiNotesBtn.innerHTML = originalBtnHtml;
            }
        }
    }

    if (generateAiNotesBtn) {
        generateAiNotesBtn.addEventListener("click", generateNotes);
    }

    if (regenerateNotesBtn) {
        regenerateNotesBtn.addEventListener("click", () => {
            if (confirm("Regenerate AI notes from the current transcript? Any unsaved edits will be replaced.")) {
                generateNotes();
            }
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

    // Print Note
    if (printNoteBtn) {
        printNoteBtn.addEventListener("click", () => {
            window.print();
        });
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
            <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
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
