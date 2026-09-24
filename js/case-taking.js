/* ==========================================================================
   SwasthAI / SWASTHAI — Case Taking Controller
   Integrates AI Adaptive Interview, Speech Recognition & Elderly Mode,
   alongside the existing stepped clinical case documentation form.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Current Active Case State
    let activeCaseState = createEmptyCaseState("AYU-2026-DEMO", "Rajesh Patel");

    // Stepped Form Elements (Preserved)
    const caseSteps = document.querySelectorAll(".case-form-step");
    const caseNextBtn = document.getElementById("caseNextBtn");
    const casePrevBtn = document.getElementById("casePrevBtn");
    const caseSubmitBtn = document.getElementById("caseSubmitBtn");
    const currentCaseStep = document.getElementById("currentCaseStep");
    const progressFill = document.querySelector(".case-progress-fill");
    const caseForm = document.getElementById("caseForm");
    const generateSummaryBtn = document.getElementById("generateSummaryBtn");
    const aiCaseSummary = document.getElementById("aiCaseSummary");
    const caseSuccessModal = document.getElementById("caseSuccessModal");
    const casePatientSelect = document.getElementById("casePatient");

    let currentStep = 0;

    // Adaptive Interview Elements
    const modeAdaptiveBtn = document.getElementById("modeAdaptiveBtn");
    const modeFormBtn = document.getElementById("modeFormBtn");
    const adaptiveWrapper = document.getElementById("adaptiveInterviewWrapper");
    const formSection = document.getElementById("formBasedSection");
    const languageSelect = document.getElementById("interviewLanguageSelect");
    const elderlyToggle = document.getElementById("elderlyModeToggle");
    const elderlyActionBar = document.getElementById("elderlyActionBar");
    const chatStreamBody = document.getElementById("chatStreamBody");
    const chatInputForm = document.getElementById("chatInputForm");
    const adaptiveTextInput = document.getElementById("adaptiveTextInput");
    const adaptiveMicBtn = document.getElementById("adaptiveMicBtn");
    const speechStatusBadge = document.getElementById("speechRecognitionStatus");
    const loadDemoPatientBtn = document.getElementById("loadDemoPatientBtn");
    const caseSufficientBanner = document.getElementById("caseSufficientBanner");
    const proceedToReviewBtn = document.getElementById("proceedToReviewBtn");
    const redFlagAlertContainer = document.getElementById("liveRedFlagAlertContainer");

    // Mobile Sidebar
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => sidebar.classList.toggle("show"));
    }

    /* =========================================================================
       INITIALIZATION
       ========================================================================= */
    function init() {
        populatePatientOptions();
        checkIncomingUrlParams();
        checkIncomingVoiceTranscript();
        setupModeSwitching();
        setupElderlyMode();
        setupAdaptiveChat();
        setupSteppedForm();
    }

    function populatePatientOptions() {
        if (!casePatientSelect) return;
        const patients = ClinicalStorage.getPatients();
        casePatientSelect.innerHTML = `<option value="">Select Patient</option>`;
        patients.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = `${p.fullName} — ${p.id} (${p.gender}, ${p.age}y)`;
            casePatientSelect.appendChild(opt);
        });

        casePatientSelect.addEventListener("change", (e) => {
            const val = e.target.value;
            if (!val) return;
            const patients = ClinicalStorage.getPatients();
            const selected = patients.find(p => p.id === val || p.fullName === val);
            if (selected) {
                setPatient(selected);
            }
        });
    }

    function checkIncomingUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const patientId = urlParams.get("patientId") || localStorage.getItem("swasthai_active_patient_id");
        if (patientId) {
            const p = ClinicalStorage.getPatientById(patientId);
            if (p) {
                setPatient(p);
                return;
            }
        }
        // Fallback to first active patient or demo patient
        const demoPatient = ClinicalStorage.getPatientById("AYU-2026-DEMO") || (ClinicalStorage.getPatients() || [])[0];
        if (demoPatient) setPatient(demoPatient);
    }

    function setPatient(patient) {
        activeCaseState.patientId = patient.id;
        activeCaseState.patientName = patient.fullName;
        if (casePatientSelect) casePatientSelect.value = patient.id;

        localStorage.setItem("swasthai_active_patient_id", patient.id);

        // Auto-seed patient history into case state
        if (patient.conditions) activeCaseState.medicalHistory = [patient.conditions];
        if (patient.allergies && patient.allergyStatus === "known") {
            activeCaseState.allergies = [{ allergen: patient.allergies, reaction: "Documented allergy", severity: "High" }];
            activeCaseState.allergyStatus = "known";
        }

        if (patient.prakriti) {
            const exactRad = document.querySelector(`input[name="prakriti"][value="${patient.prakriti}"]`);
            if (exactRad) {
                exactRad.checked = true;
            } else if (patient.prakriti.includes("-") || patient.prakriti.toLowerCase().includes("sama")) {
                const dualRad = document.querySelector(`input[name="prakriti"][value="Dvandvaja/Sama"]`);
                if (dualRad) dualRad.checked = true;
            }
            if (!activeCaseState.ayushAssessment) {
                activeCaseState.ayushAssessment = { prakriti: patient.prakriti };
            } else {
                activeCaseState.ayushAssessment.prakriti = patient.prakriti;
            }
        }

        updateSlotTracker();

        if (typeof DigitalTwin !== "undefined") {
            DigitalTwin.renderPanel("digitalTwinContainer", "doctor", patient.id);
        }
    }

    function checkIncomingVoiceTranscript() {
        const incomingVoice = localStorage.getItem("voiceCaseTranscript");
        if (incomingVoice && incomingVoice.trim()) {
            localStorage.removeItem("voiceCaseTranscript");
            // Feed voice transcript into adaptive chat after greeting
            setTimeout(() => {
                handleUserUtterance(incomingVoice.trim());
            }, 800);
        }
    }

    /* =========================================================================
       MODE SWITCHING (Adaptive vs Stepped Form)
       ========================================================================= */
    function setupModeSwitching() {
        if (modeAdaptiveBtn && modeFormBtn) {
            modeAdaptiveBtn.addEventListener("click", () => {
                modeAdaptiveBtn.className = "sih-btn primary";
                modeAdaptiveBtn.style.color = "";
                modeAdaptiveBtn.style.background = "";

                modeFormBtn.className = "sih-btn";
                modeFormBtn.style.color = "#374151";
                modeFormBtn.style.background = "#f3f4f6";

                adaptiveWrapper.style.display = "block";
                formSection.style.display = "none";
            });

            modeFormBtn.addEventListener("click", () => {
                modeFormBtn.className = "sih-btn primary";
                modeFormBtn.style.color = "";
                modeFormBtn.style.background = "";

                modeAdaptiveBtn.className = "sih-btn";
                modeAdaptiveBtn.style.color = "#374151";
                modeAdaptiveBtn.style.background = "#f3f4f6";

                adaptiveWrapper.style.display = "none";
                formSection.style.display = "block";
            });
        }

        if (loadDemoPatientBtn) {
            loadDemoPatientBtn.addEventListener("click", () => {
                const demoP = ClinicalStorage.getPatientById("AYU-2026-DEMO");
                if (demoP) {
                    setPatient(demoP);
                    alert(`Loaded showcase patient: ${demoP.fullName} (${demoP.id}). You can now speak or type symptoms!`);
                }
            });
        }
    }

    /* =========================================================================
       ELDERLY-FRIENDLY ACCESSIBILITY MODE (Req 11)
       ========================================================================= */
    function setupElderlyMode() {
        if (!elderlyToggle) return;

        elderlyToggle.addEventListener("change", (e) => {
            if (e.target.checked) {
                document.body.classList.add("elderly-mode");
                if (elderlyActionBar) elderlyActionBar.style.display = "flex";
                adaptiveTextInput.placeholder = "बोलें या टाइप करें (Talk or type)...";
                SpeechService.speakText("नमस्ते। सुगम मोड सक्रिय है। आप बोलकर अपनी तकलीफ बता सकते हैं।", { lang: "hi-IN" });
            } else {
                document.body.classList.remove("elderly-mode");
                if (elderlyActionBar) elderlyActionBar.style.display = "none";
                SpeechService.stopSpeaking();
            }
        });

        const readAloudBtn = document.getElementById("readAloudBtn");
        const repeatQuestionBtn = document.getElementById("repeatQuestionBtn");
        const slowSpeechBtn = document.getElementById("slowSpeechBtn");

        if (readAloudBtn) {
            readAloudBtn.addEventListener("click", () => {
                const lastAiMsg = activeCaseState.transcript.slice().reverse().find(t => t.speaker === "ai");
                if (lastAiMsg) {
                    SpeechService.speakText(lastAiMsg.text, { lang: languageSelect.value, rate: 0.85 });
                }
            });
        }

        if (repeatQuestionBtn) {
            repeatQuestionBtn.addEventListener("click", () => {
                SpeechService.repeatLastSpoken({ rate: 0.85 });
            });
        }

        if (slowSpeechBtn) {
            slowSpeechBtn.addEventListener("click", () => {
                const lastAiMsg = activeCaseState.transcript.slice().reverse().find(t => t.speaker === "ai");
                if (lastAiMsg) {
                    SpeechService.speakText(lastAiMsg.text, { lang: languageSelect.value, rate: 0.65 });
                }
            });
        }
    }

    /* =========================================================================
       AI ADAPTIVE INTERVIEW ENGINE (Req 1, 6, 8, 10, 18)
       ========================================================================= */
    function setupAdaptiveChat() {
        // Initial AI greeting
        const initialLang = languageSelect ? languageSelect.value : "hinglish";
        const greeting = AIService.getQuestionText("GREETING", initialLang);
        appendChatMessage("ai", greeting, initialLang);
        activeCaseState.transcript.push({
            id: "init-ai",
            speaker: "ai",
            text: greeting,
            originalLanguage: initialLang,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        if (chatInputForm) {
            chatInputForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const text = adaptiveTextInput.value.trim();
                if (text) {
                    handleUserUtterance(text);
                    adaptiveTextInput.value = "";
                }
            });
        }

        // Voice Input Mic Button
        if (adaptiveMicBtn) {
            let isRec = false;
            adaptiveMicBtn.addEventListener("click", () => {
                if (!SpeechService.isSupported()) {
                    alert("Speech recognition is not supported in this browser. Please use Chrome.");
                    return;
                }

                if (!isRec) {
                    const lang = languageSelect.value === "hi" ? "hi-IN" : "en-IN";
                    SpeechService.startRecognition({
                        lang: lang,
                        onInterim: (interim) => {
                            adaptiveTextInput.value = interim;
                        },
                        onFinal: (finalText, confidence) => {
                            adaptiveTextInput.value = finalText;
                            adaptiveMicBtn.classList.remove("recording");
                            isRec = false;
                            handleUserUtterance(finalText);
                        },
                        onError: (errMsg) => {
                            adaptiveMicBtn.classList.remove("recording");
                            isRec = false;
                            speechStatusBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Retry`;
                            speechStatusBadge.className = "conf-badge conf-low";
                        },
                        onStatusChange: (statusObj) => {
                            if (statusObj.status === "listening") {
                                speechStatusBadge.innerHTML = `<i class="fa-solid fa-microphone"></i> Listening...`;
                                speechStatusBadge.className = "conf-badge conf-high";
                            } else {
                                speechStatusBadge.innerHTML = `<i class="fa-solid fa-check"></i> Ready`;
                                speechStatusBadge.className = "conf-badge conf-high";
                            }
                        }
                    });
                    adaptiveMicBtn.classList.add("recording");
                    isRec = true;
                } else {
                    SpeechService.stopRecognition();
                    adaptiveMicBtn.classList.remove("recording");
                    isRec = false;
                }
            });
        }
    }

    function handleUserUtterance(userText) {
        const lang = languageSelect ? languageSelect.value : "hinglish";
        appendChatMessage("patient", userText, lang);

        // Process through AI Engine
        const result = AIService.processPatientUtterance(userText, activeCaseState, lang);

        // Render AI follow-up question
        setTimeout(() => {
            appendChatMessage("ai", result.reply, lang);

            // Read aloud if elderly mode is active
            if (elderlyToggle && elderlyToggle.checked) {
                SpeechService.speakText(result.reply, { lang: lang, rate: 0.8 });
            }

            // Update slot tracker UI
            updateSlotTracker();

            // Check Red Flags
            if (result.redFlagsDetected) {
                renderRedFlagAlert();
            }

            // Check if sufficient info reached
            if (result.isSufficient) {
                if (caseSufficientBanner) {
                    caseSufficientBanner.style.display = "block";
                    // Save case to storage so Review Workspace can access it
                    ClinicalStorage.saveOrUpdateCase(activeCaseState);
                    if (proceedToReviewBtn) {
                        proceedToReviewBtn.href = `practitioner-review.html?caseId=${activeCaseState.id}`;
                    }
                }
            }

            // Auto-save draft locally (Req 28)
            ClinicalStorage.saveOfflineDraft("current_case_draft", activeCaseState);

            // Show Patient Correction prompt (Req 18)
            showPatientCorrectionPrompt(result.extractedSummary);

        }, 500);
    }

    function appendChatMessage(sender, text, lang) {
        if (!chatStreamBody) return;
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${sender}`;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        bubble.innerHTML = `
            <div>${text}</div>
            <div class="chat-bubble-meta">
                <span>${sender === 'ai' ? 'SwasthAI' : (activeCaseState.patientName || 'Patient')} • ${lang}</span>
                <span>${time}</span>
            </div>
        `;
        chatStreamBody.appendChild(bubble);
        chatStreamBody.scrollTop = chatStreamBody.scrollHeight;
    }

    function updateSlotTracker() {
        const setSlot = (id, val) => {
            const el = document.getElementById(id);
            if (el) {
                if (val && val !== "Pending" && val.length > 0) {
                    el.textContent = Array.isArray(val) ? val.join(", ") : val;
                    el.style.color = "#166534";
                    el.style.fontWeight = "700";
                } else {
                    el.textContent = "Pending";
                    el.style.color = "#9ca3af";
                }
            }
        };

        setSlot("slotChiefComplaint", activeCaseState.chiefComplaint);
        setSlot("slotDuration", activeCaseState.duration);
        setSlot("slotLocation", activeCaseState.location);
        setSlot("slotSeverity", activeCaseState.severity);
        setSlot("slotMedications", activeCaseState.currentMedications.map(m => m.name));
        setSlot("slotAllergies", activeCaseState.allergies.map(a => a.allergen));

        // Sync with step form fields if present
        const ccInput = document.getElementById("chiefComplaint");
        if (ccInput && activeCaseState.chiefComplaint) ccInput.value = activeCaseState.chiefComplaint;

        const durInput = document.getElementById("symptomStart");
        if (durInput && activeCaseState.duration) durInput.value = activeCaseState.duration;
    }

    function renderRedFlagAlert() {
        if (!redFlagAlertContainer || !activeCaseState.redFlags.length) return;
        const rf = activeCaseState.redFlags[0];
        redFlagAlertContainer.innerHTML = `
            <div class="alert-banner-urgent" style="margin-bottom: 16px;">
                <div class="alert-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div>
                    <h3>HIGH PRIORITY: ${rf.title}</h3>
                    <p>${rf.guidance}</p>
                    <div class="trigger-quote">Triggered by: "${rf.triggerStatement}"</div>
                </div>
            </div>
        `;
    }

    function showPatientCorrectionPrompt(summary) {
        const card = document.getElementById("patientCorrectionCard");
        const promptText = document.getElementById("correctionPromptText");
        const confirmBtn = document.getElementById("confirmCorrectionBtn");
        const editBtn = document.getElementById("editCorrectionBtn");

        if (!card || !promptText || !activeCaseState.chiefComplaint) return;

        promptText.innerHTML = `<strong>AI Understood:</strong> ${activeCaseState.chiefComplaint} (${activeCaseState.duration || 'duration pending'}, ${activeCaseState.location || 'location pending'}). Is this accurate?`;
        card.style.display = "block";

        confirmBtn.onclick = () => {
            card.style.display = "none";
            ClinicalStorage.logAudit("Patient Confirmed Extraction", "Patient", "Chief Complaint", activeCaseState.id, "Confirmed AI interpretation accuracy.");
        };

        editBtn.onclick = () => {
            const corrected = prompt("Please enter the corrected symptoms/information:", activeCaseState.chiefComplaint);
            if (corrected && corrected.trim()) {
                AIService.applyPatientCorrection(activeCaseState, "chiefComplaint", corrected.trim(), activeCaseState.chiefComplaint);
                updateSlotTracker();
                card.style.display = "none";
                alert("Correction applied and logged in clinical audit trail.");
            }
        };
    }

    /* =========================================================================
       8-STEP FORM (Preserved & Integrated with Storage)
       ========================================================================= */
    function setupSteppedForm() {
        if (!caseSteps.length) return;

        function showCaseStep() {
            caseSteps.forEach((step, index) => {
                step.classList.toggle("active-case-step", index === currentStep);
            });

            if (currentCaseStep) currentCaseStep.textContent = currentStep + 1;
            const progress = ((currentStep + 1) / caseSteps.length) * 100;
            if (progressFill) progressFill.style.width = `${progress}%`;

            if (casePrevBtn) casePrevBtn.style.visibility = currentStep === 0 ? "hidden" : "visible";
            if (caseNextBtn) caseNextBtn.style.display = currentStep === caseSteps.length - 1 ? "none" : "flex";
            if (caseSubmitBtn) caseSubmitBtn.style.display = currentStep === caseSteps.length - 1 ? "flex" : "none";
        }

        function validateCaseStep() {
            const requiredInputs = caseSteps[currentStep].querySelectorAll("[required]");
            for (const input of requiredInputs) {
                if (!input.value.trim()) {
                    input.focus();
                    alert("Please complete all required fields.");
                    return false;
                }
            }
            return true;
        }

        if (caseNextBtn) {
            caseNextBtn.addEventListener("click", () => {
                if (!validateCaseStep()) return;
                currentStep++;
                showCaseStep();
            });
        }

        if (casePrevBtn) {
            casePrevBtn.addEventListener("click", () => {
                if (currentStep > 0) {
                    currentStep--;
                    showCaseStep();
                }
            });
        }

        // Chip selectors
        document.querySelectorAll(".symptom-chips button").forEach(button => {
            button.addEventListener("click", () => {
                const complaint = document.getElementById("chiefComplaint");
                if (complaint) complaint.value = button.textContent.trim();
                document.querySelectorAll(".symptom-chips button").forEach(c => c.classList.remove("selected-chip"));
                button.classList.add("selected-chip");
            });
        });

        function collectAyushFormData() {
            const selectedPrakriti = document.querySelector('input[name="prakriti"]:checked');
            const prakritiVal = selectedPrakriti ? selectedPrakriti.value : "";
            const manasikaVal = document.getElementById("ayushManasika") ? document.getElementById("ayushManasika").value : "";
            const agniVal = document.getElementById("ayushAgni") ? document.getElementById("ayushAgni").value : "";
            const sleepVal = document.getElementById("ayushSleep") ? document.getElementById("ayushSleep").value.trim() : "";
            const bowelVal = document.getElementById("ayushBowel") ? document.getElementById("ayushBowel").value : "";
            const lifestyleVal = document.getElementById("ayushLifestyle") ? document.getElementById("ayushLifestyle").value.trim() : "";
            const dietVal = document.getElementById("ayushDietPattern") ? document.getElementById("ayushDietPattern").value.trim() : "";
            const habitsVal = document.getElementById("ayushEatingHabits") ? document.getElementById("ayushEatingHabits").value.trim() : "";
            const notesVal = document.getElementById("ayushObservations") ? document.getElementById("ayushObservations").value.trim() : "";

            activeCaseState.ayushAssessment = {
                prakriti: prakritiVal || (activeCaseState.ayushAssessment ? activeCaseState.ayushAssessment.prakriti : ""),
                manasikaPrakriti: manasikaVal,
                agni: agniVal,
                lifestyleRhythms: {
                    nidra: sleepVal,
                    koshtha: bowelVal,
                    dinacharya: lifestyleVal
                },
                dietaryPatterns: {
                    agni: agniVal,
                    rasaDiet: dietVal,
                    eatingHabits: habitsVal
                },
                notes: notesVal
            };
        }

        // Generate Summary on step 8
        if (generateSummaryBtn) {
            generateSummaryBtn.addEventListener("click", () => {
                const patientVal = document.getElementById("casePatient").value || activeCaseState.patientName;
                const complaintVal = document.getElementById("chiefComplaint").value || activeCaseState.chiefComplaint;
                const descVal = document.getElementById("complaintDescription").value || "Patient case description recorded.";

                activeCaseState.chiefComplaint = complaintVal;
                activeCaseState.patientName = patientVal;

                collectAyushFormData();
                const ay = activeCaseState.ayushAssessment;
                const hasAyush = ay && (ay.prakriti || ay.manasikaPrakriti || ay.agni || ay.notes || (ay.lifestyleRhythms && (ay.lifestyleRhythms.nidra || ay.lifestyleRhythms.koshtha)) || (ay.dietaryPatterns && (ay.dietaryPatterns.rasaDiet || ay.dietaryPatterns.eatingHabits)));

                if (aiCaseSummary) {
                    aiCaseSummary.innerHTML = `
                        <div class="summary-section">
                            <h4>Patient</h4>
                            <p>${patientVal}</p>
                        </div>
                        <div class="summary-section">
                            <h4>Chief Complaint</h4>
                            <p>${complaintVal}</p>
                        </div>
                        <div class="summary-section">
                            <h4>Description</h4>
                            <p>${descVal}</p>
                        </div>
                        ${hasAyush ? `
                        <div class="summary-section" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-top: 10px;">
                            <h4 style="color: #166534; display: flex; align-items: center; gap: 6px;">
                                <i class="fa-solid fa-leaf"></i> Body Type, Daily Habits & Diet Profile
                            </h4>
                            <p style="margin-top: 4px; font-size: 13px; color: #14532d;"><strong>Body & Mind Profile:</strong> ${ay.prakriti || 'Not assessed'} ${ay.manasikaPrakriti ? '• ' + ay.manasikaPrakriti : ''}</p>
                            <p style="margin-top: 4px; font-size: 13px; color: #14532d;"><strong>Daily Habits:</strong> Sleep: ${ay.lifestyleRhythms.nidra || 'Not noted'} | Bowel Regularity: ${ay.lifestyleRhythms.koshtha || 'Not noted'} | Routine: ${ay.lifestyleRhythms.dinacharya || 'Not noted'}</p>
                            <p style="margin-top: 4px; font-size: 13px; color: #14532d;"><strong>Digestion & Food Habits:</strong> Hunger/Hazma: ${ay.agni || 'Not noted'} | Food Cravings: ${ay.dietaryPatterns.rasaDiet || 'Not noted'} | Eating Habits: ${ay.dietaryPatterns.eatingHabits || 'Not noted'}</p>
                            ${ay.notes ? `<p style="margin-top: 4px; font-size: 13px; color: #166534; font-style: italic;"><strong>Doctor's Holistic Notes:</strong> ${ay.notes}</p>` : ''}
                        </div>
                        ` : ''}
                    `;
                }
            });
        }

        // Form Submit
        if (caseForm) {
            caseForm.addEventListener("submit", (e) => {
                e.preventDefault();
                collectAyushFormData();
                ClinicalStorage.saveOrUpdateCase(activeCaseState);
                if (caseSuccessModal) caseSuccessModal.classList.add("show-case-modal");
            });
        }

        const goToDashboard = document.getElementById("goToDashboard");
        if (goToDashboard) {
            goToDashboard.addEventListener("click", () => {
                window.location.href = "dashboard.html";
            });
        }

        showCaseStep();
    }

    init();
});