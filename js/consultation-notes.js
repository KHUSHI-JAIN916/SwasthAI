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
        doctorNotes: document.getElementById("noteDoctorNotes")
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
        loadConsultationHistory();
        seedDefaultTranscript();
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

    function populatePatients() {
        if (!patientSelect) return;
        let patients = [];
        if (typeof ClinicalStorage !== "undefined") {
            patients = ClinicalStorage.getPatients();
        }

        patientSelect.innerHTML = '<option value="">-- Select Registered Patient --</option>';
        patients.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = `${p.fullName} (${p.id} - ${p.gender}, ${p.age}y)`;
            patientSelect.appendChild(opt);
        });

        // Add an option to enter guest / custom patient
        const guestOpt = document.createElement("option");
        guestOpt.value = "custom";
        guestOpt.textContent = "+ Walk-in / New Patient";
        patientSelect.appendChild(guestOpt);

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

            if (currentSelectedPatient && patientQuickDetails) {
                patientQuickDetails.style.display = "inline-block";
                displayPatientId.textContent = currentSelectedPatient.id;
                displayPatientAge.textContent = currentSelectedPatient.age ? `${currentSelectedPatient.age}y` : "--";
                displayPatientGender.textContent = currentSelectedPatient.gender || "--";
            }
        });

        // Auto-select first patient for demonstration
        if (patients.length > 0) {
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
                    micStatusHint.textContent = `${currentSpeaker} speaking... (Listening)`;
                }
            };

            speechRecognition.onresult = (event) => {
                let interimStr = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const res = event.results[i];
                    const transcript = res[0].transcript;
                    if (res.isFinal) {
                        const trimmed = transcript.trim();
                        if (trimmed) {
                            addTranscriptTurn(currentSpeaker, trimmed);
                        }
                    } else {
                        interimStr += transcript;
                    }
                }

                if (interimStr.trim()) {
                    if (interimPreview) interimPreview.style.display = "flex";
                    if (interimText) interimText.textContent = `${currentSpeaker}: "${interimStr.trim()}"`;
                } else {
                    if (interimPreview) interimPreview.style.display = "none";
                }
            };

            speechRecognition.onerror = (event) => {
                console.warn("Speech recognition error:", event.error);
                if (event.error === "not-allowed") {
                    alert("Microphone permission was denied. Please allow microphone access in your browser settings to record consultations.");
                    stopConsultation();
                }
            };

            speechRecognition.onend = () => {
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
        // Privacy & Consent Check (Mandatory Req 11)
        if (!patientConsentCheckbox || !patientConsentCheckbox.checked) {
            if (consentBanner) {
                consentBanner.classList.remove("shake-highlight");
                void consentBanner.offsetWidth; // trigger reflow
                consentBanner.classList.add("shake-highlight");
            }
            alert("Patient Consent Required:\nPlease confirm that appropriate patient consent has been obtained before recording.");
            return;
        }

        // Request microphone permission explicitly via browser mediaDevices
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // Release temporary stream tracks so SpeechRecognition can bind without conflict
                stream.getTracks().forEach(t => t.stop());
            } catch (micErr) {
                console.warn("Microphone access error:", micErr);
                alert("Microphone Permission Required:\nPlease allow microphone access in your browser to transcribe consultations.");
                return;
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
        }
    }

    function pauseConsultation() {
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

    // Quick Demo Dialogue Loaders
    const loadEnglishSampleBtn = document.getElementById("loadEnglishSampleBtn");
    const loadHindiSampleBtn = document.getElementById("loadHindiSampleBtn");

    if (loadEnglishSampleBtn) {
        loadEnglishSampleBtn.addEventListener("click", () => {
            transcriptTurns = [
                { speaker: "Doctor", text: "Good morning, Rahul. What problem are you facing today?", timestamp: "10:30 AM" },
                { speaker: "Patient", text: "Good morning doctor. I have been having severe headache and mild fever for three days.", timestamp: "10:30 AM" },
                { speaker: "Doctor", text: "Do you have cough?", timestamp: "10:31 AM" },
                { speaker: "Patient", text: "No.", timestamp: "10:31 AM" },
                { speaker: "Doctor", text: "Any history of diabetes, hypertension, or drug allergies?", timestamp: "10:31 AM" },
                { speaker: "Patient", text: "No allergies. I had work stress recently. No regular medicines right now.", timestamp: "10:32 AM" },
                { speaker: "Doctor", text: "Let me check your vitals. Blood pressure is 120/80 mmHg, temperature is 99.4 F, pulse is 76 bpm.", timestamp: "10:32 AM" },
                { speaker: "Doctor", text: "It looks like tension-type headache with viral prodrome. I am prescribing Paracetamol 650mg SOS after meals and Brahmi Vati 1 tablet twice daily. Drink plenty of water and rest. Follow up in 3 days if fever persists.", timestamp: "10:33 AM" }
            ];
            renderTranscriptStream();
            if (patientConsentCheckbox) patientConsentCheckbox.checked = true;
        });
    }

    if (loadHindiSampleBtn) {
        loadHindiSampleBtn.addEventListener("click", () => {
            transcriptTurns = [
                { speaker: "Doctor", text: "नमस्ते राहुल जी, आपको क्या तकलीफ हो रही है?", timestamp: "10:30 AM" },
                { speaker: "Patient", text: "नमस्ते डॉक्टर साहब, मुझे तीन दिन से तेज़ सिरदर्द और हल्का बुखार आ रहा है।", timestamp: "10:30 AM" },
                { speaker: "Doctor", text: "क्या आपको खांसी या सीने में भारीपन है?", timestamp: "10:31 AM" },
                { speaker: "Patient", text: "नहीं, खांसी बिल्कुल नहीं है।", timestamp: "10:31 AM" },
                { speaker: "Doctor", text: "क्या पहले से बीपी, शुगर या किसी दवा से कोई एलर्जी है?", timestamp: "10:31 AM" },
                { speaker: "Patient", text: "किसी दवा से एलर्जी नहीं है। कोई नियमित दवाइयाँ भी नहीं चल रहीं।", timestamp: "10:32 AM" },
                { speaker: "Doctor", text: "मैं आपके वाइटल्स चेक कर रहा हूँ। ब्लड प्रेशर 120/80 mmHg है, बुखार 99.4 F और नब्ज 76 bpm है।", timestamp: "10:32 AM" },
                { speaker: "Doctor", text: "यह वायरल बुखार और तनाव जनित सिरदर्द प्रतीत होता है। मैं पैरासिटामोल 650mg खाने के बाद और ब्राह्मी वटी 1 गोली सुबह-शाम दे रहा हूँ। खूब पानी पिएं और आराम करें। तीन दिन बाद यदि बुखार रहे तो फॉलो-अप करें।", timestamp: "10:33 AM" }
            ];
            renderTranscriptStream();
            if (patientConsentCheckbox) patientConsentCheckbox.checked = true;
        });
    }

    // Speaker Switchers
    if (setDoctorSpeakerBtn && setPatientSpeakerBtn) {
        setDoctorSpeakerBtn.addEventListener("click", () => {
            currentSpeaker = "Doctor";
            setDoctorSpeakerBtn.className = "speaker-btn active doctor";
            setPatientSpeakerBtn.className = "speaker-btn patient";
            if (sessionState === "recording") {
                micStatusHint.textContent = "🔴 Listening actively to Doctor";
            }
        });

        setPatientSpeakerBtn.addEventListener("click", () => {
            currentSpeaker = "Patient";
            setPatientSpeakerBtn.className = "speaker-btn active patient";
            setDoctorSpeakerBtn.className = "speaker-btn doctor";
            if (sessionState === "recording") {
                micStatusHint.textContent = "🔴 Listening actively to Patient";
            }
        });
    }

    // =========================================================================
    // 4. TRANSCRIPT RENDERING & MANUAL EDITS
    // =========================================================================

    function addTranscriptTurn(speaker, text) {
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        transcriptTurns.push({ speaker, text, timestamp: time });
        renderTranscriptStream();
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
                addTranscriptTurn(currentSpeaker, val);
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

    async function generateNotes() {
        if (transcriptTurns.length === 0) {
            alert("The transcript is currently empty. Record or type patient consultation dialogue first.");
            return;
        }

        // Visual loading state
        const originalBtnHtml = generateAiNotesBtn.innerHTML;
        generateAiNotesBtn.disabled = true;
        generateAiNotesBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Clinical Dialogue...';

        try {
            const patientContext = currentSelectedPatient || {
                id: "AYU-DEMO",
                fullName: "Patient",
                age: "30",
                gender: "Male"
            };

            const notes = await AIService.generateStructuredConsultationNotes(transcriptTurns, patientContext);
            lastGeneratedNotes = notes;

            // Populate form fields with extracted data
            formFields.complaintMain.value = notes.complaint.main || "Not mentioned";
            formFields.complaintDuration.value = notes.complaint.duration || "Not mentioned";
            formFields.complaintSeverity.value = notes.complaint.severity || "Not mentioned";

            formFields.symptomsPresent.value = notes.symptoms.present || "Not mentioned";
            formFields.symptomsNegative.value = notes.symptoms.negative || "Not mentioned";

            formFields.historyConditions.value = notes.history.conditions || "Not mentioned";
            formFields.historySurgeries.value = notes.history.surgeries || "Not mentioned";
            formFields.historyAllergies.value = notes.history.allergies || "Not mentioned";
            formFields.historyMeds.value = notes.history.medications || "Not mentioned";

            formFields.vitalBp.value = notes.vitals.bloodPressure || "Not mentioned";
            formFields.vitalHr.value = notes.vitals.heartRate || "Not mentioned";
            formFields.vitalTemp.value = notes.vitals.temperature || "Not mentioned";
            formFields.vitalSpo2.value = notes.vitals.spO2 || "Not mentioned";
            formFields.vitalWeight.value = notes.vitals.weight || "Not mentioned";

            formFields.assessment.value = notes.assessment || "Doctor clinical assessment not explicitly stated in conversation.";

            formFields.planMedicines.value = notes.plan.medicines || "Not mentioned";
            formFields.planTests.value = notes.plan.tests || "Not mentioned";
            formFields.planLifestyle.value = notes.plan.lifestyle || "Not mentioned";
            formFields.planFollowUp.value = notes.plan.followUp || "Not mentioned";

            formFields.doctorNotes.value = notes.doctorNotes || "Not mentioned";

            const notesStatusTag = document.getElementById("notesStatusTag");
            if (notesStatusTag) {
                notesStatusTag.textContent = "Generated (Doctor Review Required)";
                notesStatusTag.style.color = "#16a34a";
            }

            // Scroll to notes section on mobile
            if (window.innerWidth < 1024) {
                document.getElementById("notesCard").scrollIntoView({ behavior: "smooth" });
            }
        } catch (err) {
            console.error("Note generation error:", err);
            alert("Error generating notes: " + err.message);
        } finally {
            generateAiNotesBtn.disabled = false;
            generateAiNotesBtn.innerHTML = originalBtnHtml;
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
            doctorNotes: formFields.doctorNotes.value.trim()
        };

        const rawTranscriptText = transcriptTurns.map(t => `${t.speaker}: ${t.text}`).join("
");

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
        if (typeof I18nService !== "undefined" && typeof I18nService.translatePage === "function") {
            I18nService.translatePage();
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
