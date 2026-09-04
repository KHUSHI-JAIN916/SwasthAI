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

        setupModalListeners();

        // Listen for language switch
        window.addEventListener("languageChanged", () => {
            renderPrescriptions();
            renderDiseasesList();
            renderPastRecordsList();
            if (typeof I18nService !== "undefined") {
                I18nService.translatePage();
            }
        });
    }

    function setupModalListeners() {
        const modals = ["addDiseaseModal", "addPastDoctorModal"];
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
        const storedPatientId = localStorage.getItem("swasthai_active_patient_id") || "AYU-2026-DEMO";
        currentPatient = ClinicalStorage.getPatientById(storedPatientId);
        if (!currentPatient) {
            currentPatient = ClinicalStorage.getPatients()[0];
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
        if (avatarEl) {
            const initials = (currentPatient.fullName || "P").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            avatarEl.textContent = initials;
        }

        const logoutBtn = document.getElementById("patientLogoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("swasthai_active_patient_id");
                window.location.href = "patient-login.html";
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

    function toggleBodySymptom(symptomText) {
        const textInput = document.getElementById("patientSymptomInput");
        if (!textInput) return;

        if (textInput.value.includes(symptomText)) {
            textInput.value = textInput.value.replace(symptomText, "").trim();
        } else {
            textInput.value += (textInput.value ? ", " : "") + symptomText;
        }

        // Voice audio feedback
        const lang = I18nService.getLanguage();
        const cleanName = symptomText.indexOf("(") !== -1 ? symptomText.split("(")[0].trim() : symptomText;
        const feedback = lang === "hi" ? "लक्षण जोड़ा गया: " + cleanName : "Added symptom: " + cleanName;
        if (typeof SpeechService !== "undefined") {
            SpeechService.speakText(feedback, { lang: lang === "hi" ? "hi-IN" : "en-IN", rate: 0.9 });
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
        document.getElementById("addDiseaseModal").classList.add("active");
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
                <div style="font-size: 12px; color: #374151; margin-bottom: 2px;"><strong>समय:</strong> ${d.duration || 'हाल ही में'}</div>
                ${d.symptoms ? `<div style="font-size: 11px; color: #64748b;"><strong>लक्षण:</strong> ${d.symptoms}</div>` : ''}
            `;
            container.appendChild(card);
        });
    }

    function openAddPastDoctorModal() {
        document.getElementById("addPastDoctorModal").classList.add("active");
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
                    अभी कोई पुराना डॉक्टर रिकॉर्ड नहीं जोड़ा गया है।
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
                <div style="font-size: 12px; color: #374151; margin-bottom: 2px;"><strong>निदान (Diagnosis):</strong> ${r.diagnosis}</div>
                ${r.clinicOrHospital ? `<div style="font-size: 11px; color: #475569;"><strong>क्लिनिक/अस्पताल:</strong> ${r.clinicOrHospital}</div>` : ''}
                ${r.pastMedicines ? `<div style="font-size: 11px; color: #166534; margin-top: 2px;"><strong>दवाइयां:</strong> ${r.pastMedicines}</div>` : ''}
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
                    वर्तमान में कोई नई दवा की पर्ची लंबित नहीं है। नई तकलीफ के लिए ऊपर बोलकर बताएं।
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
                    <span class="report-parameter-badge badge-normal">${med.dose || '1 गोली'}</span>
                </div>
                <div style="font-size: 12px; color: #374151; margin-bottom: 4px;"><strong>समय:</strong> ${med.frequency || 'दिन में दो बार (खाने के बाद)'}</div>
                <div style="font-size: 11px; color: #6b7280;">डॉक्टर का निर्देश: ${med.reason || 'नियमित सेवन करें'}</div>
            `;
            container.appendChild(card);
        });
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
        submitAddPastDoctor
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    PatientPortal.init();
});
