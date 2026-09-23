/* ==========================================================================
   SWASTHAI — Patient Portal Controller
   Coordinates voice symptom capture, visual body symptom selection,
   AI lab report extraction, disease reporting, past doctor records,
   and prescription management.
   ========================================================================== */

const PatientPortal = (() => {
    let currentPatient = null;
    let isRecording = false;

    function init() {
        loadPatientData();
        setupVoiceRecording();
        setupSymptomSubmission();
        setupFileInput();
        renderPrescriptions();
        renderDiseasesList();
        renderPastRecordsList();
        renderDailyReminders();
        renderWeeklyMedChart();
        renderSmartTimeline("all");
        initHealthMonitoring();

        setupModalListeners();

        const symptomInput = document.getElementById("patientSymptomInput");
        if (symptomInput) {
            symptomInput.addEventListener("input", (e) => {
                checkForEmergency(e.target.value);
            });
        }

        // Listen for language switch
        window.addEventListener("languageChanged", () => {
            renderPrescriptions();
            renderDiseasesList();
            renderPastRecordsList();
            renderDailyReminders();
            renderWeeklyMedChart();
            renderSmartTimeline("all");
            if (typeof I18nService !== "undefined") {
                I18nService.translatePage();
            }
        });
    }

    function setupModalListeners() {
        const modals = ["addDiseaseModal", "addPastDoctorModal", "addHealthReadingModal"];
        modals.forEach(id => {
            const modal = document.getElementById(id);
            if (modal) {
                modal.addEventListener("click", (e) => {
                    if (e.target === modal) {
                        modal.classList.remove("active");
                    }
                });
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeAddDiseaseModal();
                closeAddPastDoctorModal();
            }
        });
    }

    function loadPatientData() {
        const storedPatientId = localStorage.getItem("swasthai_active_patient_id");
        if (!storedPatientId) {
            window.location.href = "patient-login.html";
            return;
        }
        currentPatient = ClinicalStorage.getPatientById(storedPatientId);
        if (!currentPatient) {
            currentPatient = (ClinicalStorage.getPatients() || [])[0];
        }

        if (currentPatient) {
            localStorage.setItem("swasthai_active_patient_id", currentPatient.id);
            if (typeof DigitalTwin !== "undefined") {
                DigitalTwin.renderPanel("dtPatientContainer", "patient", currentPatient.id);
            }
        }

        // Populate header & badge
        const nameEl = document.getElementById("patientNameHeader");
        const idBadge = document.getElementById("patientIdHeaderBadge");
        const welcomeEl = document.getElementById("welcomePatientName");
        const welcomeId = document.getElementById("welcomePatientId");
        const avatarEl = document.getElementById("patientAvatarEl");

        if (nameEl) nameEl.textContent = currentPatient.fullName;
        if (idBadge) idBadge.textContent = `ID: ${currentPatient.id}`;
        if (welcomeEl) welcomeEl.textContent = currentPatient.fullName;
        if (welcomeId) welcomeId.textContent = currentPatient.id;
        
        const initials = (currentPatient.fullName || "P").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
        if (avatarEl) avatarEl.textContent = initials;

        // Populate Clinical Dossier Summary Card
        const dFullName = document.getElementById("dossierFullName");
        const dIdBadge = document.getElementById("dossierIdBadge");
        const dAvatar = document.getElementById("dossierAvatar");
        const dAgeGender = document.getElementById("dossierAgeGender");
        const dBlood = document.getElementById("dossierBloodGroup");
        const dPhone = document.getElementById("dossierPhone");
        const dEmergency = document.getElementById("dossierEmergency");
        const dAllergies = document.getElementById("dossierAllergiesText");

        if (dFullName) dFullName.textContent = currentPatient.fullName;
        if (dIdBadge) dIdBadge.textContent = `Patient ID: ${currentPatient.id}`;
        if (dAvatar) dAvatar.textContent = initials;
        if (dAgeGender) dAgeGender.textContent = `${currentPatient.age || 35} yrs / ${currentPatient.gender || 'Other'}`;
        if (dBlood) dBlood.textContent = `${currentPatient.bloodGroup || 'Not recorded'}`;
        if (dPhone) dPhone.textContent = currentPatient.phone || "Not recorded";
        if (dEmergency) dEmergency.textContent = `${currentPatient.emergencyName || 'Emergency Contact'} (${currentPatient.emergencyPhone || 'N/A'})`;
        if (dAllergies) dAllergies.textContent = currentPatient.allergies || "No Known Drug Allergies (NKDA)";

        const logoutBtn = document.getElementById("patientLogoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                ClinicalStorage.logoutUser();
            });
        }
    }

    function playWelcomeAudio() {
        const lang = I18nService.getLanguage();
        let promptText = "नमस्ते। स्वास्थ AI में आपका स्वागत है। आप नीचे दिए गए हरे बटन को दबाकर बोलकर अपनी तकलीफ बता सकते हैं, नई बीमारी जोड़ सकते हैं, या पुराने डॉक्टर की पर्ची अपलोड कर सकते हैं।";
        if (lang === "en") {
            promptText = "Hello, welcome to SwasthAI Patient Portal. Press the green microphone to speak symptoms, add your diseases, or upload past doctor records.";
        }
        if (typeof SpeechService !== "undefined") {
            SpeechService.speakText(promptText, { lang: lang === "hi" ? "hi-IN" : "en-IN", rate: 0.85 });
        }
    }

    function setupVoiceRecording() {
        const micBtn = document.getElementById("patientMicBtn");
        const statusText = document.getElementById("micStatusText");
        const textInput = document.getElementById("patientSymptomInput");
        const confBadge = document.getElementById("speechConfidenceBadge");
        const confScore = document.getElementById("confidenceScoreText");

        if (!micBtn) return;

        micBtn.addEventListener("click", () => {
            if (!SpeechService.isSupported()) {
                alert("Speech recognition is not supported on this browser. Please use Chrome or Edge.");
                return;
            }

            if (!isRecording) {
                const lang = I18nService.getLanguage() === "hi" ? "hi-IN" : "en-IN";
                SpeechService.startRecognition({
                    lang: lang,
                    onInterim: (interim) => {
                        statusText.innerHTML = `<span style="color: #fef08a;"><i class="fa-solid fa-microphone-lines fa-fade"></i> सुन रहे हैं: "${interim.slice(-30)}..."</span>`;
                    },
                    onFinal: (finalText, confidence) => {
                        textInput.value += (textInput.value ? " " : "") + finalText;
                        if (confBadge && confScore) {
                            confScore.textContent = `${confidence}% Clarity`;
                            confBadge.style.display = "inline-flex";
                        }
                        checkForEmergency(textInput.value);
                    },
                    onError: (err) => {
                        isRecording = false;
                        micBtn.classList.remove("recording");
                        statusText.textContent = "कृपया दोबारा बोलें (Retry)";
                    },
                    onStatusChange: (s) => {
                        if (s.status === "listening") {
                            isRecording = true;
                            micBtn.classList.add("recording");
                            statusText.textContent = "सुन रहे हैं... कृपया अपनी तकलीफ बताएं (Listening...)";
                        } else {
                            isRecording = false;
                            micBtn.classList.remove("recording");
                            statusText.textContent = "बोलना पूरा हुआ (Done speaking)";
                        }
                    }
                });
            } else {
                SpeechService.stopRecognition();
                isRecording = false;
                micBtn.classList.remove("recording");
                statusText.textContent = "माइक दबाकर बोलें (Tap to Speak)";
            }
        });

        const clearBtn = document.getElementById("clearSymptomBtn");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                if (textInput) textInput.value = "";
                if (confBadge) confBadge.style.display = "none";
                if (statusText) statusText.textContent = "माइक दबाकर बोलें (Tap to Speak)";
            });
        }
    }

    function toggleBodySymptom(elementOrText, defaultText) {
        const textInput = document.getElementById("patientSymptomInput");
        if (!textInput) return;

        let cardElement = null;
        let symptomText = defaultText;

        if (elementOrText && typeof elementOrText === "object" && elementOrText.nodeType) {
            cardElement = elementOrText;
            const span = cardElement.querySelector("span");
            symptomText = span ? span.textContent.trim() : defaultText;
        } else if (typeof elementOrText === "string") {
            symptomText = elementOrText;
        }

        // Determine localized text if possible
        const lang = (typeof I18nService !== "undefined") ? I18nService.getLanguage() : "hi";
        let displaySymptom = symptomText;
        if (symptomText.includes("Headache")) displaySymptom = (lang === "hi") ? "सिरदर्द व चक्कर" : "Headache & Dizziness";
        else if (symptomText.includes("Stomach")) displaySymptom = (lang === "hi") ? "पेट दर्द व गैस" : "Stomach Pain & Acidity";
        else if (symptomText.includes("Chest")) displaySymptom = (lang === "hi") ? "छाती में दर्द व भारीपन" : "Chest Pain & Heaviness";
        else if (symptomText.includes("Joint")) displaySymptom = (lang === "hi") ? "जोड़ों व घुटने का दर्द" : "Joint Pain & Arthritis";
        else if (symptomText.includes("Fever")) displaySymptom = (lang === "hi") ? "तेज़ बुखार व कंपकंपी" : "Fever & Shivering";
        else if (symptomText.includes("Cough")) displaySymptom = (lang === "hi") ? "खांसी व गले में खराश" : "Cough & Sore Throat";
        else if (symptomText.includes("Skin")) displaySymptom = (lang === "hi") ? "त्वचा पर खुजली व एलर्जी" : "Skin Rash & Itching";
        else if (symptomText.includes("Sugar")) displaySymptom = (lang === "hi") ? "शुगर व कमजोरी" : "Sugar & Weakness";
        else if (symptomText.includes("Other") || symptomText.includes("अन्य")) {
            const customInput = prompt(
                (lang === "hi") ? "कृपया अपने अन्य लक्षण विस्तार से दर्ज करें (Enter your other symptoms):" : "Please enter your other symptoms:",
                ""
            );
            if (customInput && customInput.trim()) {
                displaySymptom = customInput.trim();
            } else {
                textInput.focus();
                textInput.scrollIntoView({ behavior: "smooth" });
                return;
            }
        }

        if (cardElement) {
            cardElement.classList.toggle("selected");
        }

        if (textInput.value.includes(displaySymptom)) {
            textInput.value = textInput.value.replace(new RegExp(",?\\s*" + displaySymptom.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')), "").trim();
            if (textInput.value.startsWith(",")) textInput.value = textInput.value.substring(1).trim();
        } else {
            textInput.value += (textInput.value ? ", " : "") + displaySymptom;
        }

        // Voice audio feedback
        const cleanName = displaySymptom.indexOf("(") !== -1 ? displaySymptom.split("(")[0].trim() : displaySymptom;
        const feedback = (lang === "hi") ? "लक्षण जोड़ा गया: " + cleanName : "Added symptom: " + cleanName;
        if (typeof SpeechService !== "undefined") {
            SpeechService.speakText(feedback, { lang: (lang === "hi") ? "hi-IN" : "en-IN", rate: 0.9 });
        }
    }

    function setupSymptomSubmission() {
        const sendBtn = document.getElementById("sendSymptomBtn");
        const textInput = document.getElementById("patientSymptomInput");

        if (!sendBtn) return;

        sendBtn.addEventListener("click", () => {
            const symptoms = textInput ? textInput.value.trim() : "";
            if (!symptoms) {
                alert("कृपया पहले अपनी तकलीफ बोलें या लिखें (Please enter your symptoms).");
                return;
            }

            // Create patient consultation case in ClinicalStorage
            const newCase = createEmptyCaseState(currentPatient.id, currentPatient.fullName);
            newCase.chiefComplaint = symptoms;
            newCase.status = "PRACTITIONER REVIEW";
            newCase.transcript = [{
                id: "pat-portal-entry",
                speaker: "patient",
                text: symptoms,
                originalLanguage: I18nService.getLanguage(),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }];

            ClinicalStorage.saveOrUpdateCase(newCase);
            ClinicalStorage.logAudit("Patient Submitted Symptoms from Portal", "Patient", "Chief Complaint", newCase.id, `Patient reported: "${symptoms}"`);

            // Success feedback
            const lang = I18nService.getLanguage();
            const msg = lang === "hi"
                ? `आपकी तकलीफ और लक्षण डॉक्टर के पास भेज दिए गए हैं! (Case ID: ${newCase.id})\n\nडॉक्टर इसे जल्द ही चेक करेंगे।`
                : `Your symptoms have been submitted to Dr. Sharma! (Case ID: ${newCase.id})\n\nDoctor will review shortly.`;

            alert(msg);
            textInput.value = "";
            renderPrescriptions();
        });
    }

    function setupFileInput() {
        const fileInput = document.getElementById("patientReportFileInput");
        if (fileInput) {
            fileInput.addEventListener("change", (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    const fileName = e.target.files[0].name;
                    simulateReportUpload("CUSTOM", fileName);
                }
            });
        }
    }

    function simulateReportUpload(reportType, customFileName) {
        const previewBox = document.getElementById("aiExtractedReportBox");
        const paramList = document.getElementById("reportParametersList");
        const reportTitle = document.getElementById("reportTitleText");
        const explanationText = document.getElementById("reportAiExplanation");

        if (!previewBox || !paramList) return;

        let report = DocumentService.SAMPLE_REPORTS[0]; // LFT Report
        if (reportType === "CBC") {
            report = {
                title: "Complete Blood Count (CBC) Report",
                facility: "Apex Diagnostic Pathology",
                date: "Aug 2026",
                parameters: [
                    { name: "Hemoglobin (Hb)", baseline: "13.8", current: "11.2", delta: "-2.6", trend: "decreased", flag: "HIGH", unit: "g/dL", referenceRange: "13.0 - 17.0" },
                    { name: "Total WBC Count", baseline: "7,500", current: "11,200", delta: "+3,700", trend: "increased", flag: "HIGH", unit: "/cumm", referenceRange: "4,000 - 10,000" },
                    { name: "Platelet Count", baseline: "2.4", current: "2.1", delta: "-0.3", trend: "decreased", flag: "NORMAL", unit: "Lakhs/cumm", referenceRange: "1.5 - 4.5" }
                ]
            };
        } else if (customFileName) {
            report = {
                title: `Medical Document (${customFileName})`,
                facility: "Patient Uploaded Document",
                date: "Today",
                parameters: [
                    { name: "Blood Sugar (Fasting)", baseline: "95", current: "142", delta: "+47", trend: "increased", flag: "HIGH", unit: "mg/dL", referenceRange: "70 - 100" },
                    { name: "Blood Pressure", baseline: "120/80", current: "138/88", delta: "+18/8", trend: "increased", flag: "HIGH", unit: "mmHg", referenceRange: "120/80" },
                    { name: "Oxygen Saturation (SpO2)", baseline: "98%", current: "97%", delta: "-1%", trend: "normal", flag: "NORMAL", unit: "%", referenceRange: "95 - 100%" }
                ]
            };
        }

        const compared = report.parameters;

        paramList.innerHTML = "";
        compared.forEach(p => {
            const isHigh = p.flag === "HIGH";
            const badgeClass = isHigh ? "badge-alert" : "badge-normal";
            const badgeLabel = isHigh ? "डॉक्टर समीक्षा (Doctor Review)" : "सामान्य (Normal)";

            const div = document.createElement("div");
            div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;";
            div.innerHTML = `
                <div>
                    <strong>${p.name}</strong>
                    <div style="font-size: 11px; color: #64748b;">मान (Value): ${p.current} ${p.unit} (सामान्य: ${p.referenceRange})</div>
                </div>
                <span class="report-parameter-badge ${badgeClass}">${badgeLabel}</span>
            `;
            paramList.appendChild(div);
        });

        reportTitle.textContent = `${report.title} (${report.facility})`;
        explanationText.textContent = "AI ने आपकी रिपोर्ट जांच ली है। महत्वपूर्ण टेस्ट पैरामीटर व्यवस्थित कर दिए गए हैं और डॉक्टर के पास सुरक्षित सेव कर दिए गए हैं।";

        previewBox.style.display = "block";

        // Speak aloud
        const lang = I18nService.getLanguage();
        if (typeof SpeechService !== "undefined") {
            const voiceMsg = lang === "hi"
                ? "आपकी मेडिकल रिपोर्ट को AI ने व्यवस्थित कर दिया है। इसे डॉक्टर के पास समीक्षा के लिए भेज दिया गया है।"
                : "Your medical report has been organized by AI and saved to your doctor records.";
            SpeechService.speakText(voiceMsg, { lang: lang === "hi" ? "hi-IN" : "en-IN" });
        }
    }

    /* =========================================================================
       DISEASE MANAGEMENT & PAST DOCTOR RECORDS
       ========================================================================= */
    function openAddDiseaseModal() {
        const modal = document.getElementById("addDiseaseModal");
        if (modal) {
            modal.classList.add("active");
            if (typeof I18nService !== "undefined") {
                I18nService.translatePage();
            }
        }
    }

    function closeAddDiseaseModal() {
        document.getElementById("addDiseaseModal").classList.remove("active");
    }

    function submitAddDisease(e) {
        e.preventDefault();
        const diseaseName = document.getElementById("diseaseNameInput").value.trim();
        const duration = document.getElementById("diseaseDurationInput").value.trim();
        const severity = document.getElementById("diseaseSeverityInput").value;
        const symptoms = document.getElementById("diseaseSymptomsInput").value.trim();

        if (!diseaseName) return;

        ClinicalStorage.addPatientReportedDisease(currentPatient.id, {
            diseaseName,
            duration,
            severity,
            symptoms
        });

        alert("बीमारी सफलतापूर्वक दर्ज कर ली गई है और डॉक्टर के पास भेज दी गई है!");
        closeAddDiseaseModal();
        document.getElementById("addDiseaseForm").reset();
        
        // Reload and re-render
        currentPatient = ClinicalStorage.getPatientById(currentPatient.id);
        renderDiseasesList();
    }

    function renderDiseasesList() {
        const container = document.getElementById("patientDiseasesListContainer");
        if (!container) return;

        const diseases = currentPatient.patientReportedDiseases || [];
        container.innerHTML = "";

        if (diseases.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 14px; color: #64748b; font-size: 13px; background: #f8fafc; border-radius: 8px;">
                    अभी कोई बीमारी दर्ज नहीं है। ऊपर दिए गए बटन से नई बीमारी जोड़ें।
                </div>
            `;
            return;
        }

        diseases.forEach(d => {
            const card = document.createElement("div");
            card.style.cssText = "background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px;";
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="font-size: 14px; color: #166534;"><i class="fa-solid fa-virus"></i> ${d.diseaseName}</strong>
                    <span style="font-size: 11px; background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 12px; font-weight: 700;">${d.severity || 'Moderate'}</span>
                </div>
                <div style="font-size: 12px; color: #374151; margin-bottom: 2px;"><strong>Duration:</strong> ${d.duration || 'Recently'}</div>
                ${d.symptoms ? `<div style="font-size: 11px; color: #64748b;"><strong>Symptoms:</strong> ${d.symptoms}</div>` : ''}
            `;
            container.appendChild(card);
        });
    }

    function openAddPastDoctorModal() {
        const modal = document.getElementById("addPastDoctorModal");
        if (modal) {
            modal.classList.add("active");
            if (typeof I18nService !== "undefined") {
                I18nService.translatePage();
            }
        }
    }

    function closeAddPastDoctorModal() {
        document.getElementById("addPastDoctorModal").classList.remove("active");
    }

    function submitAddPastDoctor(e) {
        e.preventDefault();
        const doctorName = document.getElementById("pastDocNameInput").value.trim();
        const clinicOrHospital = document.getElementById("pastClinicInput").value.trim();
        const diagnosis = document.getElementById("pastDiagnosisInput").value.trim();
        const year = document.getElementById("pastYearInput").value.trim();
        const pastMedicines = document.getElementById("pastMedsInput").value.trim();
        const notes = document.getElementById("pastNotesInput").value.trim();

        if (!doctorName || !diagnosis) return;

        ClinicalStorage.addPastDoctorRecord(currentPatient.id, {
            doctorName,
            clinicOrHospital,
            diagnosis,
            year,
            pastMedicines,
            notes
        });

        alert("पुराने डॉक्टर का डेटा सफलतापूर्वक सुरक्षित कर लिया गया है!");
        closeAddPastDoctorModal();
        document.getElementById("addPastDoctorForm").reset();

        // Reload and re-render
        currentPatient = ClinicalStorage.getPatientById(currentPatient.id);
        renderPastRecordsList();
    }

    function renderPastRecordsList() {
        const container = document.getElementById("patientPastRecordsListContainer");
        if (!container) return;

        const records = currentPatient.pastDoctorRecords || [];
        container.innerHTML = "";

        if (records.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 14px; color: #64748b; font-size: 13px; background: #f8fafc; border-radius: 8px;">
                    No previous doctor consultations recorded.
                </div>
            `;
            return;
        }

        records.forEach(r => {
            const card = document.createElement("div");
            card.style.cssText = "background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px;";
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="font-size: 14px; color: #1e40af;"><i class="fa-solid fa-user-doctor"></i> ${r.doctorName}</strong>
                    <span style="font-size: 11px; background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 12px; font-weight: 700;">${r.year || 'Past'}</span>
                </div>
                <div style="font-size: 12px; color: #374151; margin-bottom: 2px;"><strong>Diagnosis:</strong> ${r.diagnosis}</div>
                ${r.clinicOrHospital ? `<div style="font-size: 11px; color: #475569;"><strong>Clinic/Hospital:</strong> ${r.clinicOrHospital}</div>` : ''}
                ${r.pastMedicines ? `<div style="font-size: 11px; color: #166534; margin-top: 2px;"><strong>Medicines:</strong> ${r.pastMedicines}</div>` : ''}
            `;
            container.appendChild(card);
        });
    }

    function renderPrescriptions() {
        const container = document.getElementById("patientPrescriptionsContainer");
        if (!container) return;

        const cases = ClinicalStorage.getCases().filter(c => c.patientId === currentPatient.id);
        const verifiedCases = cases.filter(c => c.currentMedications && c.currentMedications.length > 0);

        container.innerHTML = "";

        if (verifiedCases.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 18px; text-align: center; color: #64748b; background: #f8fafc; border-radius: 8px;">
                    <i class="fa-solid fa-notes-medical" style="font-size: 24px; color: #1f7a57; margin-bottom: 6px; display: block;"></i>
                    No prescriptions issued yet. Speak or submit your symptoms above.
                </div>
            `;
            return;
        }

        const activeCase = verifiedCases[0];
        activeCase.currentMedications.forEach(med => {
            const card = document.createElement("div");
            card.style.cssText = "background: #ffffff; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);";
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <h4 style="margin: 0; font-size: 14px; color: #166534; font-weight: 800;"><i class="fa-solid fa-pills"></i> ${med.name}</h4>
                    <span class="report-parameter-badge badge-normal">${med.dose || '1 Dose'}</span>
                </div>
                <div style="font-size: 12px; color: #374151; margin-bottom: 4px;"><strong>Frequency:</strong> ${med.frequency || 'Twice Daily'}</div>
                <div style="font-size: 11px; color: #6b7280;">Doctor Advice: ${med.reason || 'Take regularly'}</div>
            `;
            container.appendChild(card);
        });
    }

<<<<<<< HEAD
    function getMedicationListForPatient() {
        const cases = ClinicalStorage.getCases().filter(c => c.patientId === currentPatient.id);
        const verifiedCases = cases.filter(c => c.currentMedications && c.currentMedications.length > 0);

        let meds = [];
        if (verifiedCases.length > 0 && verifiedCases[0].currentMedications) {
            meds = verifiedCases[0].currentMedications;
        }

        if (meds.length === 0) {
            meds = [
                { id: "demo-m1", name: "Amlodipine 5mg", dose: "1 Tablet", frequency: "Morning (08:00 AM)", timing: "morning", timeStr: "08:00 AM", instructions: "Take after breakfast" },
                { id: "demo-m2", name: "Pantocid 40mg", dose: "1 Capsule", frequency: "Afternoon (01:30 PM)", timing: "afternoon", timeStr: "01:30 PM", instructions: "Take 30 mins before lunch" },
                { id: "demo-m3", name: "Ashwagandha Churna 3g", dose: "1 Teaspoon", frequency: "Night (08:30 PM)", timing: "night", timeStr: "08:30 PM", instructions: "Take with warm milk at bedtime" }
            ];
        } else {
            meds = meds.map((m, idx) => {
                const timing = idx === 0 ? "morning" : idx === 1 ? "afternoon" : "night";
                const timeStr = timing === "morning" ? "08:00 AM" : timing === "afternoon" ? "01:30 PM" : "08:30 PM";
                return {
                    id: m.id || `med-${idx}`,
                    name: m.name,
                    dose: m.dose || "1 Dose",
                    frequency: m.frequency || "Daily",
                    timing: timing,
                    timeStr: timeStr,
                    instructions: m.reason || "Take with water regularly"
                };
            });
        }
        return meds;
    }

    function renderDailyReminders() {
        const container = document.getElementById("dailyMedRemindersContainer");
        if (!container) return;

        const meds = getMedicationListForPatient();
        const todayKey = new Date().toISOString().slice(0, 10);

        container.innerHTML = "";

        meds.forEach(med => {
            const storageKey = `swasthai_dose_${currentPatient.id}_${todayKey}_${med.id}`;
            const isTaken = localStorage.getItem(storageKey) === "true";

            let iconClass = "fa-sun";
            let timingLabel = "सुबह (Morning 8:00 AM)";
            let badgeBg = "#fef3c7";
            let badgeColor = "#b45309";

            if (med.timing === "afternoon") {
                iconClass = "fa-cloud-sun";
                timingLabel = "दोपहर (Afternoon 1:30 PM)";
                badgeBg = "#e0f2fe";
                badgeColor = "#0369a1";
            } else if (med.timing === "night") {
                iconClass = "fa-moon";
                timingLabel = "रात (Night 8:30 PM)";
                badgeBg = "#f3e8ff";
                badgeColor = "#6b21a8";
            }

            const card = document.createElement("div");
            card.style.cssText = `background: ${isTaken ? '#f0fdf4' : '#ffffff'}; border: 1.5px solid ${isTaken ? '#86efac' : '#e2e8f0'}; border-radius: 14px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); transition: all 0.2s ease;`;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: 800; background: ${badgeBg}; color: ${badgeColor}; padding: 4px 10px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;">
                        <i class="fa-solid ${iconClass}"></i> ${timingLabel}
                    </span>
                    <span style="font-size: 12px; font-weight: 800; color: ${isTaken ? '#166534' : '#dc2626'};">
                        ${isTaken ? '✓ Taken' : '⏰ Pending'}
                    </span>
                </div>
                <h4 style="margin: 4px 0; font-size: 15px; font-weight: 800; color: #1e293b;">
                    <i class="fa-solid fa-capsules" style="color: #1f7a57;"></i> ${med.name}
                </h4>
                <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">
                    <strong>Dose:</strong> ${med.dose} &nbsp;·&nbsp; ${med.instructions}
                </div>
                <button type="button" onclick="PatientPortal.toggleDoseStatus('${med.id}')" style="width: 100%; margin-top: 6px; padding: 8px 12px; border-radius: 8px; border: none; font-weight: 800; font-size: 12px; cursor: pointer; background: ${isTaken ? '#166534' : '#1f7a57'}; color: white;">
                    ${isTaken ? '<i class="fa-solid fa-circle-check"></i> खुराक ली गई (Taken)' : '<i class="fa-solid fa-check"></i> खुराक लें (Mark as Taken)'}
                </button>
            `;
            container.appendChild(card);
        });
    }

    function toggleDoseStatus(medId) {
        const todayKey = new Date().toISOString().slice(0, 10);
        const storageKey = `swasthai_dose_${currentPatient.id}_${todayKey}_${medId}`;
        const currentStatus = localStorage.getItem(storageKey) === "true";
        localStorage.setItem(storageKey, String(!currentStatus));

        const lang = (typeof I18nService !== "undefined") ? I18nService.getLanguage() : "hi";
        const msg = !currentStatus
            ? (lang === "hi" ? "शाबाश! आपने आज की खुराक दर्ज कर ली है।" : "Great! Dose marked as taken for today.")
            : (lang === "hi" ? "खुराक पेंडिंग के रूप में सेट की गई।" : "Dose marked as pending.");

        if (typeof SpeechService !== "undefined") {
            SpeechService.speakText(msg, { lang: lang === "hi" ? "hi-IN" : "en-IN" });
        }

        renderDailyReminders();
        renderWeeklyMedChart();
    }

    function triggerVoiceMedReminder() {
        const meds = getMedicationListForPatient();
        const todayKey = new Date().toISOString().slice(0, 10);
        const pendingMeds = meds.filter(m => localStorage.getItem(`swasthai_dose_${currentPatient.id}_${todayKey}_${m.id}`) !== "true");

        const lang = (typeof I18nService !== "undefined") ? I18nService.getLanguage() : "hi";

        let text = "";
        if (pendingMeds.length === 0) {
            text = (lang === "hi")
                ? `बहुत बढ़िया ${currentPatient.fullName}! आपने आज की सभी दवाइयां समय पर ले ली हैं।`
                : `Great job ${currentPatient.fullName}! You have taken all your scheduled medicines for today.`;
        } else {
            const medNames = pendingMeds.map(m => m.name).join(", ");
            text = (lang === "hi")
                ? `नमस्ते ${currentPatient.fullName}! आपकी आज की बकाया दवाइयां हैं: ${medNames}। कृपया इन्हें समय पर लें।`
                : `Hello ${currentPatient.fullName}! Your pending medicines for today are: ${medNames}. Please take them on time.`;
        }

        if (typeof SpeechService !== "undefined") {
            SpeechService.speakText(text, { lang: lang === "hi" ? "hi-IN" : "en-IN", rate: 0.85 });
        } else {
            alert(text);
        }
    }

    function renderWeeklyMedChart() {
        const container = document.getElementById("weeklyMedChartContainer");
        if (!container) return;

        const days = [
            { short: "Mon", full: "Monday", hi: "सोमवार" },
            { short: "Tue", full: "Tuesday", hi: "मंगलवार" },
            { short: "Wed", full: "Wednesday", hi: "बुधवार" },
            { short: "Thu", full: "Thursday", hi: "गुरुवार" },
            { short: "Fri", full: "Friday", hi: "शुक्रवार" },
            { short: "Sat", full: "Saturday", hi: "शनिवार" },
            { short: "Sun", full: "Sunday", hi: "रविवार" }
        ];

        const meds = getMedicationListForPatient();
        const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

        const lang = (typeof I18nService !== "undefined") ? I18nService.getLanguage() : "hi";

        let totalSlots = days.length * meds.length;
        let takenSlots = 0;

        let gridHTML = `<div style="display: grid; grid-template-columns: repeat(7, minmax(130px, 1fr)); gap: 10px; min-width: 900px;">`;

        days.forEach((day, index) => {
            const isToday = index === todayIndex;
            const isPast = index <= todayIndex;

            let dayMedsHTML = "";
            meds.forEach(med => {
                const dayDoseKey = `swasthai_weekly_${currentPatient.id}_day${index}_${med.id}`;
                const isTaken = isPast && (localStorage.getItem(dayDoseKey) === "true" || (isToday && localStorage.getItem(`swasthai_dose_${currentPatient.id}_${new Date().toISOString().slice(0, 10)}_${med.id}`) === "true"));

                if (isTaken) takenSlots++;

                let icon = "☀️";
                if (med.timing === "afternoon") icon = "🌤️";
                if (med.timing === "night") icon = "🌙";

                dayMedsHTML += `
                    <div style="background: ${isTaken ? '#dcfce7' : '#f8fafc'}; border: 1px solid ${isTaken ? '#86efac' : '#e2e8f0'}; border-radius: 8px; padding: 6px 8px; margin-bottom: 6px; font-size: 11px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 800; color: #1e293b;">${icon} ${med.name.split(' ')[0]}</span>
                            <span style="font-weight: 800; color: ${isTaken ? '#15803d' : '#94a3b8'};">${isTaken ? '✓' : '○'}</span>
                        </div>
                        <div style="font-size: 10px; color: #64748b;">${med.timeStr}</div>
                    </div>
                `;
            });

            gridHTML += `
                <div style="background: ${isToday ? '#f0fdf4' : '#ffffff'}; border: 2px solid ${isToday ? '#1f7a57' : '#e2e8f0'}; border-radius: 12px; padding: 12px 10px; text-align: center; box-shadow: ${isToday ? '0 4px 12px rgba(31,122,87,0.15)' : 'none'};">
                    <div style="font-size: 13px; font-weight: 900; color: ${isToday ? '#1f7a57' : '#334155'}; margin-bottom: 2px;">
                        ${lang === 'hi' ? day.hi : day.full}
                    </div>
                    <span style="font-size: 10px; font-weight: 800; background: ${isToday ? '#1f7a57' : '#f1f5f9'}; color: ${isToday ? '#ffffff' : '#64748b'}; padding: 2px 8px; border-radius: 10px; display: inline-block; margin-bottom: 10px;">
                        ${isToday ? (lang === 'hi' ? 'आज (Today)' : 'Today') : day.short}
                    </span>
                    <div>${dayMedsHTML}</div>
                </div>
            `;
        });

        gridHTML += `</div>`;
        container.innerHTML = gridHTML;

        const adherenceRate = Math.round((takenSlots / totalSlots) * 100);
        const adherenceEl = document.getElementById("weeklyAdherenceText");
        if (adherenceEl) {
            adherenceEl.textContent = `Weekly Adherence: ${adherenceRate}% Completed (${takenSlots}/${totalSlots} Doses)`;
        }
    }

    const EMERGENCY_KEYWORDS = [
        { kw: "chest pain", label: "Severe Chest Pain / Dil Me Dard (Cardiac Signal)" },
        { kw: "chhati mein dard", label: "Chest Pain / Dil Me Dard" },
        { kw: "shortness of breath", label: "Severe Breathlessness / Difficulty Breathing" },
        { kw: "saans lene mein takleef", label: "Severe Breathlessness" },
        { kw: "unconscious", label: "Loss of Consciousness / Syncope" },
        { kw: "severe bleeding", label: "Severe Bleeding / Hemorrhage" },
        { kw: "khoon ulti", label: "Blood Vomiting / Hematemesis" },
        { kw: "blood vomiting", label: "Blood Vomiting / Hematemesis" },
        { kw: "paralysis", label: "Sudden Weakness / Stroke Warning" },
        { kw: "stroke", label: "Stroke Warning" },
        { kw: "heart attack", label: "Heart Attack Warning" },
        { kw: "tez bukhar", label: "High Fever Prodrome" },
        { kw: "seizure", label: "Convulsion / Seizure Alert" }
    ];

    function checkForEmergency(text) {
        const alertBox = document.getElementById("liveEmergencyAlertBox");
        if (!alertBox) return;

        if (!text || !text.trim()) {
            alertBox.style.display = "none";
            return;
        }

        const lower = text.toLowerCase();
        const found = EMERGENCY_KEYWORDS.find(item => lower.includes(item.kw));

        if (found) {
            const lang = (typeof I18nService !== "undefined") ? I18nService.getLanguage() : "hi";
            alertBox.style.display = "block";
            alertBox.innerHTML = `
                <div style="background: #fef2f2; border: 2.5px solid #ef4444; border-radius: 16px; padding: 18px 20px; box-shadow: 0 4px 16px rgba(239,68,68,0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
                        <div style="display: flex; align-items: flex-start; gap: 14px;">
                            <div style="background: #fee2e2; color: #dc2626; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <div>
                                <span style="font-size: 11px; font-weight: 900; background: #dc2626; color: white; padding: 3px 10px; border-radius: 10px; text-transform: uppercase;">
                                    🚨 AI EMERGENCY SIGNAL DETECTED — TRIAGE LEVEL 1
                                </span>
                                <h4 style="font-size: 16px; font-weight: 900; color: #991b1b; margin: 6px 0 2px 0;">
                                    गंभीर आपातकालीन लक्षण: ${found.label}
                                </h4>
                                <p style="font-size: 13px; color: #7f1d1d; margin: 0; line-height: 1.4;">
                                    यह लक्षण गंभीर स्वास्थ्य जोखिम की ओर इशारा करता है। डॉक्टर को अलर्ट भेज दिया गया है। तुरंत 108 एम्बुलेंस से संपर्क करें या नजदीकी आपातकालीन कक्ष (Emergency Room) जाएं।
                                </p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; align-self: center;">
                            <a href="tel:108" class="sih-btn" style="background: #dc2626; color: white; font-weight: 900; font-size: 13px; padding: 10px 18px; border-radius: 10px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                                <i class="fa-solid fa-phone-volume"></i> 108 पर कॉल करें
                            </a>
                        </div>
                    </div>
                </div>
            `;

            if (!alertBox.dataset.spoken) {
                alertBox.dataset.spoken = "true";
                const voiceMsg = (lang === "hi")
                    ? `सावधान! आपातकालीन लक्षण पाए गए हैं: ${found.label}। कृपया तुरंत 108 पर कॉल करें या नजदीकी अस्पताल जाएं।`
                    : `Warning! Emergency symptom detected: ${found.label}. Please call 108 or go to the nearest emergency hospital immediately.`;
                if (typeof SpeechService !== "undefined") {
                    SpeechService.speakText(voiceMsg, { lang: lang === "hi" ? "hi-IN" : "en-IN", rate: 0.9 });
                }
            }
        } else {
            alertBox.style.display = "none";
            delete alertBox.dataset.spoken;
        }
    }

    function renderSmartTimeline(filterType = "all") {
        const container = document.getElementById("smartTimelineContainer");
        if (!container || !currentPatient) return;

        const events = [];

        if (currentPatient.registeredDate) {
            events.push({
                type: "registration",
                category: "consultation",
                title: "Patient Registered at SwasthAI Portal",
                date: currentPatient.registeredDate,
                icon: "fa-user-check",
                color: "#16a34a",
                bg: "#f0fdf4",
                details: `Registered Patient ID: ${currentPatient.id} | Age: ${currentPatient.age || 35}y | Blood Group: ${currentPatient.bloodGroup || 'O+'}`
            });
        }

        const cases = ClinicalStorage.getCases().filter(c => c.patientId === currentPatient.id);
        cases.forEach(c => {
            const dateStr = c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : "2026-09-01";
            events.push({
                type: "consultation",
                category: "consultation",
                title: `Doctor Consultation: ${c.chiefComplaint || 'Clinical Assessment'}`,
                date: dateStr,
                icon: "fa-user-doctor",
                color: "#2563eb",
                bg: "#eff6ff",
                details: `Status: ${c.status || 'Verified'} | Doctor Assessment: ${c.ayushAssessment ? c.ayushAssessment.notes : 'Clinical examination completed'}`
            });

            if (c.currentMedications && c.currentMedications.length > 0) {
                const medNames = c.currentMedications.map(m => `${m.name} (${m.dose || '1 Dose'})`).join(", ");
                events.push({
                    type: "prescription",
                    category: "prescription",
                    title: `Verified Doctor Prescription Issued`,
                    date: dateStr,
                    icon: "fa-pills",
                    color: "#059669",
                    bg: "#ecfdf5",
                    details: `Prescribed Regimen: ${medNames}`
                });
            }

            if (c.redFlags && c.redFlags.length > 0) {
                events.push({
                    type: "emergency",
                    category: "report",
                    title: `🚨 Emergency Signal Detected: ${c.redFlags[0].title || 'Alert'}`,
                    date: dateStr,
                    icon: "fa-triangle-exclamation",
                    color: "#dc2626",
                    bg: "#fef2f2",
                    details: `Emergency triage flag logged. Practitioner verification assigned.`
                });
            }
        });

        (currentPatient.pastDoctorRecords || []).forEach(r => {
            events.push({
                type: "report",
                category: "report",
                title: `Past Doctor Consultation: ${r.doctorName || 'Previous Clinic'}`,
                date: r.year || "Past Record",
                icon: "fa-book-medical",
                color: "#0284c7",
                bg: "#f0f9ff",
                details: `Diagnosis: ${r.diagnosis} | Clinic: ${r.clinicOrHospital || 'Clinic'} | Past Medicines: ${r.pastMedicines || 'N/A'}`
            });
        });

        (currentPatient.patientReportedDiseases || []).forEach(d => {
            events.push({
                type: "disease",
                category: "report",
                title: `Patient Reported Disease: ${d.diseaseName}`,
                date: "Self-Reported",
                icon: "fa-virus",
                color: "#d97706",
                bg: "#fffbe6",
                details: `Severity: ${d.severity || 'Moderate'} | Duration: ${d.duration || 'N/A'} | Symptoms: ${d.symptoms || 'N/A'}`
            });
        });

        const filteredEvents = events.filter(e => {
            if (filterType === "all") return true;
            return e.category === filterType || e.type === filterType;
        });

        container.innerHTML = "";

        if (filteredEvents.length === 0) {
            container.innerHTML = `<div style="padding: 12px; color: #64748b; font-size: 13px;">No timeline events found for this category.</div>`;
            return;
        }

        filteredEvents.forEach(item => {
            const node = document.createElement("div");
            node.style.cssText = "position: relative; margin-bottom: 20px; padding-left: 10px;";

            node.innerHTML = `
                <div style="position: absolute; left: -35px; top: 2px; width: 22px; height: 22px; border-radius: 50%; background: ${item.color}; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 0 0 3px white;">
                    <i class="fa-solid ${item.icon}"></i>
                </div>
                <div style="background: ${item.bg}; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 6px;">
                        <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #1e293b;">${item.title}</h4>
                        <span style="font-size: 11px; font-weight: 700; color: #64748b; background: rgba(255,255,255,0.8); padding: 2px 8px; border-radius: 10px; border: 1px solid #cbd5e1;">
                            <i class="fa-regular fa-clock"></i> ${item.date}
                        </span>
                    </div>
                    <div style="font-size: 12px; color: #475569; line-height: 1.4;">${item.details}</div>
                </div>
            `;
            container.appendChild(node);
        });
    }

    function filterTimeline(type, btnEl) {
        if (btnEl && btnEl.parentElement) {
            const btns = btnEl.parentElement.querySelectorAll("button");
            btns.forEach(b => {
                b.style.background = "#f1f5f9";
                b.style.color = "#475569";
                b.style.border = "1px solid #cbd5e1";
            });
            btnEl.style.background = "#1f7a57";
            btnEl.style.color = "white";
            btnEl.style.border = "none";
        }
        renderSmartTimeline(type);
=======
    /* =========================================================================
       DAILY HEALTH MONITORING CONTROLLER
       ========================================================================= */
    let healthChartInstance = null;
    let currentChartMetric = "bp";
    let currentChartDays = 30;
    let currentChartCustomStart = null;
    let currentChartCustomEnd = null;

    function initHealthMonitoring() {
        if (!currentPatient) return;

        // Set default date/time in modal to today/now
        const todayStr = new Date().toISOString().split("T")[0];
        const nowTime = new Date().toTimeString().slice(0, 5);
        const dateEl = document.getElementById("readingDate");
        const timeEl = document.getElementById("readingTime");
        if (dateEl && !dateEl.value) dateEl.value = todayStr;
        if (timeEl && !timeEl.value) timeEl.value = nowTime;

        renderHealthSummaryCards();
        renderHealthReadingsTable();
        renderPatientHealthChart(currentChartMetric, currentChartDays);

        // Wire up health reading modal close on backdrop click
        const modal = document.getElementById("addHealthReadingModal");
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) closeAddReadingModal();
            });
        }
    }

    function openAddReadingModal(readingId) {
        const modal = document.getElementById("addHealthReadingModal");
        const titleEl = document.getElementById("healthReadingModalTitle");
        const editIdEl = document.getElementById("editReadingId");
        const form = document.getElementById("addHealthReadingForm");
        const successMsg = document.getElementById("healthReadingSuccessMsg");
        const errorMsg = document.getElementById("healthReadingErrorMsg");

        if (!modal) return;

        // Reset messages
        if (successMsg) successMsg.style.display = "none";
        if (errorMsg) errorMsg.style.display = "none";

        if (readingId) {
            // Edit mode
            const reading = ClinicalStorage.getHealthReadingById(readingId);
            if (!reading) { alert("Reading not found."); return; }

            titleEl.textContent = "Edit Health Reading";
            editIdEl.value = readingId;
            document.getElementById("readingDate").value = reading.date || "";
            document.getElementById("readingTime").value = reading.time || "";
            document.getElementById("readingSystolic").value = reading.systolic || "";
            document.getElementById("readingDiastolic").value = reading.diastolic || "";
            document.getElementById("readingBloodSugar").value = reading.bloodSugar || "";
            document.getElementById("readingHeartRate").value = reading.heartRate || "";
            document.getElementById("readingTemperature").value = reading.temperature || "";
            document.getElementById("readingSpO2").value = reading.spo2 || "";
            document.getElementById("readingWeight").value = reading.weight || "";
            document.getElementById("readingNotes").value = reading.notes || "";
        } else {
            // Add mode
            titleEl.textContent = "Add Today's Health Reading";
            editIdEl.value = "";
            if (form) form.reset();
            // Re-set defaults after reset
            const todayStr = new Date().toISOString().split("T")[0];
            const nowTime = new Date().toTimeString().slice(0, 5);
            document.getElementById("readingDate").value = todayStr;
            document.getElementById("readingTime").value = nowTime;
        }

        modal.classList.add("active");
    }

    function closeAddReadingModal() {
        const modal = document.getElementById("addHealthReadingModal");
        if (modal) modal.classList.remove("active");
    }

    function submitHealthReading(e) {
        e.preventDefault();
        const successMsg = document.getElementById("healthReadingSuccessMsg");
        const successText = document.getElementById("healthReadingSuccessText");
        const errorMsg = document.getElementById("healthReadingErrorMsg");
        const errorText = document.getElementById("healthReadingErrorText");

        if (successMsg) successMsg.style.display = "none";
        if (errorMsg) errorMsg.style.display = "none";

        const editId = document.getElementById("editReadingId").value.trim();

        const readingData = {
            patientId: currentPatient.id,
            date: document.getElementById("readingDate").value,
            time: document.getElementById("readingTime").value,
            systolic: document.getElementById("readingSystolic").value,
            diastolic: document.getElementById("readingDiastolic").value,
            bloodSugar: document.getElementById("readingBloodSugar").value,
            heartRate: document.getElementById("readingHeartRate").value,
            temperature: document.getElementById("readingTemperature").value,
            spo2: document.getElementById("readingSpO2").value,
            weight: document.getElementById("readingWeight").value,
            notes: document.getElementById("readingNotes").value
        };

        if (editId) readingData.id = editId;

        const result = ClinicalStorage.saveHealthReading(readingData);

        if (!result.success) {
            if (errorMsg) {
                errorText.textContent = result.message;
                errorMsg.style.display = "block";
            }
            return;
        }

        // Show success
        if (successMsg) {
            successText.textContent = result.isUpdate
                ? "Reading updated successfully!"
                : "Today's reading saved successfully! Your health data is up to date.";
            successMsg.style.display = "block";
        }

        // Refresh UI
        renderHealthSummaryCards();
        renderHealthReadingsTable();
        renderPatientHealthChart(currentChartMetric, currentChartDays);

        // Auto-close modal after short delay
        setTimeout(() => {
            closeAddReadingModal();
        }, 1400);
    }

    function deleteHealthReading(readingId) {
        if (!confirm("Are you sure you want to delete this reading? This action cannot be undone.")) return;
        const result = ClinicalStorage.deleteHealthReading(readingId);
        if (result.success) {
            renderHealthSummaryCards();
            renderHealthReadingsTable();
            renderPatientHealthChart(currentChartMetric, currentChartDays);
        } else {
            alert("Could not delete reading: " + result.message);
        }
    }

    function renderHealthSummaryCards() {
        const container = document.getElementById("vitalsSummaryGrid");
        if (!container || !currentPatient) return;

        const summary = ClinicalStorage.getHealthSummary(currentPatient.id);

        if (!summary.hasData) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1;" class="vitals-empty-state">
                    <i class="fa-solid fa-heart-pulse"></i>
                    <p style="font-size: 14px; font-weight: 600; margin: 0 0 6px 0;">No health readings yet</p>
                    <p style="font-size: 12px; margin: 0;">Click "Add Today's Reading" to start tracking your vitals.</p>
                </div>
            `;
            // Hide chart wrapper
            const chartWrapper = document.getElementById("healthChartWrapper");
            if (chartWrapper) chartWrapper.style.display = "none";
            return;
        }

        const chartWrapper = document.getElementById("healthChartWrapper");
        if (chartWrapper) chartWrapper.style.display = "block";

        const r = summary.latest;
        const ev = summary.evaluation;

        const bpStr = (r.systolic && r.diastolic) ? `${r.systolic}/${r.diastolic}` : "—";
        const sugarStr = r.bloodSugar ? `${r.bloodSugar}` : "—";
        const hrStr = r.heartRate ? `${r.heartRate}` : "—";
        const tempStr = r.temperature ? `${r.temperature}` : "—";
        const spo2Str = r.spo2 ? `${r.spo2}` : "—";
        const weightStr = r.weight ? `${r.weight}` : "—";

        function getBadgeClass(status) {
            if (status === "danger") return "vital-badge vital-badge-danger";
            if (status === "warning") return "vital-badge vital-badge-warning";
            if (status === "info") return "vital-badge vital-badge-info";
            return "vital-badge vital-badge-normal";
        }

        container.innerHTML = `
            <div class="vital-summary-card">
                <div class="vital-card-header">
                    <span class="vital-card-title">Blood Pressure</span>
                    <span class="vital-card-icon" style="background: #fee2e2; color: #dc2626;"><i class="fa-solid fa-heart-pulse"></i></span>
                </div>
                <div class="vital-card-value">${bpStr} <span class="vital-card-unit">mmHg</span></div>
                <div class="vital-card-footer">
                    <span class="${getBadgeClass(ev.bp ? ev.bp.status : 'normal')}">${ev.bp ? ev.bp.label : 'Normal'}</span>
                    <span style="font-size: 11px; color: #94a3b8;">${r.date}</span>
                </div>
            </div>
            <div class="vital-summary-card">
                <div class="vital-card-header">
                    <span class="vital-card-title">Blood Sugar</span>
                    <span class="vital-card-icon" style="background: #eff6ff; color: #2563eb;"><i class="fa-solid fa-droplet"></i></span>
                </div>
                <div class="vital-card-value">${sugarStr} <span class="vital-card-unit">mg/dL</span></div>
                <div class="vital-card-footer">
                    <span class="${getBadgeClass(ev.bloodSugar ? ev.bloodSugar.status : 'normal')}">${ev.bloodSugar ? ev.bloodSugar.label : 'Normal'}</span>
                    <span style="font-size: 11px; color: #94a3b8;">${r.date}</span>
                </div>
            </div>
            <div class="vital-summary-card">
                <div class="vital-card-header">
                    <span class="vital-card-title">Heart Rate</span>
                    <span class="vital-card-icon" style="background: #f5f3ff; color: #7c3aed;"><i class="fa-solid fa-stethoscope"></i></span>
                </div>
                <div class="vital-card-value">${hrStr} <span class="vital-card-unit">bpm</span></div>
                <div class="vital-card-footer">
                    <span class="${getBadgeClass(ev.heartRate ? ev.heartRate.status : 'normal')}">${ev.heartRate ? ev.heartRate.label : 'Normal'}</span>
                    <span style="font-size: 11px; color: #94a3b8;">${r.date}</span>
                </div>
            </div>
            <div class="vital-summary-card">
                <div class="vital-card-header">
                    <span class="vital-card-title">Temperature</span>
                    <span class="vital-card-icon" style="background: #fff7ed; color: #ea580c;"><i class="fa-solid fa-thermometer"></i></span>
                </div>
                <div class="vital-card-value">${tempStr} <span class="vital-card-unit">°F</span></div>
                <div class="vital-card-footer">
                    <span class="${getBadgeClass(ev.temperature ? ev.temperature.status : 'normal')}">${ev.temperature ? ev.temperature.label : 'Normal'}</span>
                    <span style="font-size: 11px; color: #94a3b8;">${r.date}</span>
                </div>
            </div>
            <div class="vital-summary-card">
                <div class="vital-card-header">
                    <span class="vital-card-title">SpO₂</span>
                    <span class="vital-card-icon" style="background: #e0f2fe; color: #0284c7;"><i class="fa-solid fa-lungs"></i></span>
                </div>
                <div class="vital-card-value">${spo2Str} <span class="vital-card-unit">%</span></div>
                <div class="vital-card-footer">
                    <span class="${getBadgeClass(ev.spo2 ? ev.spo2.status : 'normal')}">${ev.spo2 ? ev.spo2.label : 'Normal'}</span>
                    <span style="font-size: 11px; color: #94a3b8;">${r.date}</span>
                </div>
            </div>
            <div class="vital-summary-card">
                <div class="vital-card-header">
                    <span class="vital-card-title">Weight</span>
                    <span class="vital-card-icon" style="background: #f0fdfa; color: #0f766e;"><i class="fa-solid fa-weight-scale"></i></span>
                </div>
                <div class="vital-card-value">${weightStr} <span class="vital-card-unit">kg</span></div>
                <div class="vital-card-footer">
                    <span class="vital-badge vital-badge-normal"><i class="fa-solid fa-circle-check"></i> Recorded</span>
                    <span style="font-size: 11px; color: #94a3b8;">${r.date}</span>
                </div>
            </div>
        `;
    }

    function renderHealthReadingsTable() {
        const tbody = document.getElementById("healthReadingsTableBody");
        const countBadge = document.getElementById("readingsCountBadge");
        if (!tbody || !currentPatient) return;

        const readings = ClinicalStorage.getHealthReadings(currentPatient.id);
        if (countBadge) countBadge.textContent = `${readings.length} Total Reading${readings.length !== 1 ? "s" : ""}`;

        if (readings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 40px 20px; color: #64748b;">
                        <i class="fa-solid fa-heart-pulse" style="font-size: 32px; color: #cbd5e1; display: block; margin-bottom: 10px;"></i>
                        No readings recorded yet. Click <strong>"Add Today's Reading"</strong> to start tracking.
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = "";
        readings.forEach(r => {
            const ev = ClinicalStorage.evaluateVitals(r);
            const bpStr = (r.systolic && r.diastolic) ? `${r.systolic}/${r.diastolic}` : "—";

            function cellBadge(val, unit, evalObj) {
                if (!val && val !== 0) return `<span style="color: #94a3b8;">—</span>`;
                const badgeClass = evalObj && evalObj.status !== "normal"
                    ? (evalObj.status === "danger" ? "vital-badge vital-badge-danger" : (evalObj.status === "info" ? "vital-badge vital-badge-info" : "vital-badge vital-badge-warning"))
                    : "";
                const label = evalObj && evalObj.status !== "normal" ? ` <span class="${badgeClass}" style="font-size:10px;">${evalObj.label}</span>` : "";
                return `<strong>${val}</strong> <span style="font-size:11px;color:#94a3b8;">${unit}</span>${label}`;
            }

            const bpEv = ev.bp;
            const bpCellBadge = (r.systolic && r.diastolic)
                ? `<strong>${r.systolic}/${r.diastolic}</strong> <span style="font-size:11px;color:#94a3b8;">mmHg</span>${bpEv.status !== "normal" ? ` <span class="vital-badge ${bpEv.status === 'danger' ? 'vital-badge-danger' : (bpEv.status === 'info' ? 'vital-badge-info' : 'vital-badge-warning')}" style="font-size:10px;">${bpEv.label}</span>` : ""}`
                : `<span style="color:#94a3b8;">—</span>`;

            const dateFmt = r.date ? new Date(r.date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
            const notesStr = r.notes ? `<span title="${r.notes}" style="cursor:help; max-width:100px; display:inline-block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:11px; color:#475569;">${r.notes}</span>` : `<span style="color:#94a3b8;font-size:11px;">—</span>`;

            const rowStyle = ev.isAbnormal ? 'border-left: 3px solid #fca5a5;' : '';

            const tr = document.createElement("tr");
            if (rowStyle) tr.style.cssText = rowStyle;
            tr.innerHTML = `
                <td style="font-weight: 700; color: #1e293b; font-size:13px;">${dateFmt}</td>
                <td style="color: #475569; font-size:13px;">${r.time || "—"}</td>
                <td>${bpCellBadge}</td>
                <td>${cellBadge(r.bloodSugar, "mg/dL", ev.bloodSugar)}</td>
                <td>${cellBadge(r.heartRate, "bpm", ev.heartRate)}</td>
                <td>${cellBadge(r.temperature, "°F", ev.temperature)}</td>
                <td>${cellBadge(r.spo2, "%", ev.spo2)}</td>
                <td>${(r.weight != null) ? `<strong>${r.weight}</strong> <span style="font-size:11px;color:#94a3b8;">kg</span>` : '<span style="color:#94a3b8;">—</span>'}</td>
                <td>${notesStr}</td>
                <td>
                    <button class="table-action-btn edit-btn" onclick="PatientPortal.openAddReadingModal('${r.id}')" title="Edit Reading"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="table-action-btn delete-btn" onclick="PatientPortal.deleteHealthReading('${r.id}')" title="Delete Reading"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderPatientHealthChart(metric, days) {
        const canvas = document.getElementById("patientHealthChart");
        if (!canvas || !currentPatient) return;

        // Calculate options
        const opts = {};
        if (currentChartCustomStart && currentChartCustomEnd) {
            opts.startDate = currentChartCustomStart;
            opts.endDate = currentChartCustomEnd;
        } else if (days && days !== "all") {
            opts.days = days;
        }

        const readings = ClinicalStorage.getHealthReadings(currentPatient.id, opts);
        const sorted = [...readings].reverse(); // oldest first for chart

        let labels = sorted.map(r => {
            if (!r.date) return "";
            const d = new Date(r.date + "T00:00:00");
            return `${d.getDate()} ${d.toLocaleString("en-IN", { month: "short" })}`;
        });

        const metricConfigs = {
            bp: {
                label: "Blood Pressure",
                datasets: [
                    {
                        label: "Systolic (mmHg)",
                        data: sorted.map(r => r.systolic || null),
                        borderColor: "#dc2626",
                        backgroundColor: "rgba(220, 38, 38, 0.08)",
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderWidth: 2
                    },
                    {
                        label: "Diastolic (mmHg)",
                        data: sorted.map(r => r.diastolic || null),
                        borderColor: "#fb923c",
                        backgroundColor: "rgba(251, 146, 60, 0.06)",
                        fill: false,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderWidth: 2,
                        borderDash: [4, 3]
                    }
                ],
                yMin: 50
            },
            bloodSugar: {
                label: "Blood Sugar (mg/dL)",
                datasets: [{
                    label: "Blood Sugar (mg/dL)",
                    data: sorted.map(r => r.bloodSugar || null),
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 2
                }],
                yMin: 50
            },
            heartRate: {
                label: "Heart Rate (bpm)",
                datasets: [{
                    label: "Heart Rate (bpm)",
                    data: sorted.map(r => r.heartRate || null),
                    borderColor: "#7c3aed",
                    backgroundColor: "rgba(124, 58, 237, 0.1)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 2
                }],
                yMin: 40
            },
            spo2: {
                label: "SpO₂ (%)",
                datasets: [{
                    label: "SpO₂ (%)",
                    data: sorted.map(r => r.spo2 || null),
                    borderColor: "#0284c7",
                    backgroundColor: "rgba(2, 132, 199, 0.1)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 2
                }],
                yMin: 80
            },
            weight: {
                label: "Weight (kg)",
                datasets: [{
                    label: "Weight (kg)",
                    data: sorted.map(r => r.weight || null),
                    borderColor: "#0f766e",
                    backgroundColor: "rgba(15, 118, 110, 0.1)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 2
                }],
                yMin: 0
            }
        };

        const config = metricConfigs[metric] || metricConfigs.bp;

        // Destroy existing chart
        if (healthChartInstance) {
            healthChartInstance.destroy();
            healthChartInstance = null;
        }

        if (sorted.length === 0) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = "14px Inter, sans-serif";
            ctx.fillStyle = "#94a3b8";
            ctx.textAlign = "center";
            ctx.fillText("No readings in selected range", canvas.width / 2, canvas.height / 2);
            return;
        }

        healthChartInstance = new Chart(canvas.getContext("2d"), {
            type: "line",
            data: { labels, datasets: config.datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: "index" },
                plugins: {
                    legend: { position: "top", labels: { font: { size: 12, weight: "700" }, usePointStyle: true, boxWidth: 8 } },
                    tooltip: {
                        backgroundColor: "#0f172a",
                        titleFont: { size: 12, weight: "700" },
                        bodyFont: { size: 12 },
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    x: {
                        grid: { color: "rgba(0,0,0,0.04)" },
                        ticks: { font: { size: 11 }, color: "#64748b" }
                    },
                    y: {
                        min: config.yMin,
                        grid: { color: "rgba(0,0,0,0.04)" },
                        ticks: { font: { size: 11 }, color: "#64748b" }
                    }
                }
            }
        });
    }

    function switchChartMetric(metric, btnEl) {
        currentChartMetric = metric;
        document.querySelectorAll(".chart-tab-btn").forEach(b => b.classList.remove("active"));
        if (btnEl) btnEl.classList.add("active");
        renderPatientHealthChart(metric, currentChartDays);
    }

    function switchChartRange(days, btnEl) {
        currentChartDays = days;
        currentChartCustomStart = null;
        currentChartCustomEnd = null;
        document.querySelectorAll(".chart-range-btn").forEach(b => b.classList.remove("active"));
        if (btnEl) btnEl.classList.add("active");
        renderPatientHealthChart(currentChartMetric, days);
    }

    function applyCustomRange() {
        const from = document.getElementById("chartFromDate");
        const to = document.getElementById("chartToDate");
        if (!from || !to || !from.value || !to.value) {
            alert("Please select both start and end dates.");
            return;
        }
        currentChartCustomStart = from.value;
        currentChartCustomEnd = to.value;
        currentChartDays = "custom";
        document.querySelectorAll(".chart-range-btn").forEach(b => b.classList.remove("active"));
        renderPatientHealthChart(currentChartMetric, "custom");
>>>>>>> c581b0e (Add daily health monitoring feature)
    }

    return {
        init,
        playWelcomeAudio,
        toggleBodySymptom,
        simulateReportUpload,
        openAddDiseaseModal,
        closeAddDiseaseModal,
        submitAddDisease,
        openAddPastDoctorModal,
        closeAddPastDoctorModal,
        submitAddPastDoctor,
<<<<<<< HEAD
        renderDailyReminders,
        toggleDoseStatus,
        triggerVoiceMedReminder,
        renderWeeklyMedChart,
        checkForEmergency,
        renderSmartTimeline,
        filterTimeline
=======
        openAddReadingModal,
        closeAddReadingModal,
        submitHealthReading,
        deleteHealthReading,
        switchChartMetric,
        switchChartRange,
        applyCustomRange
>>>>>>> c581b0e (Add daily health monitoring feature)
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    PatientPortal.init();
});
