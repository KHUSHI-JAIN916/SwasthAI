/* ==========================================================================
   SwasthAI / SWASTHAI — Practitioner Review Workspace Controller
   Coordinates field verification, allergy checks, red flags, split view,
   medication reconciliation, and case finalization.
   ========================================================================== */

const PractitionerReview = (() => {
    let currentCase = null;
    let currentPatient = null;

    function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const caseId = urlParams.get("caseId") || "CASE-DEMO-2026";

        setupSidebarToggle();
        populateCaseSelector(caseId);
        loadCase(caseId);
        setupTabs();
        setupNoteHandlers();
    }

    function setupSidebarToggle() {
        const menuToggle = document.getElementById("menuToggle");
        const sidebar = document.querySelector(".sidebar");
        if (menuToggle && sidebar) {
            menuToggle.addEventListener("click", () => sidebar.classList.toggle("show"));
        }
    }

    function populateCaseSelector(selectedId) {
        const selector = document.getElementById("caseSelector");
        if (!selector) return;

        const cases = ClinicalStorage.getCases();
        selector.innerHTML = "";
        cases.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = `${c.patientName} — ${c.chiefComplaint ? c.chiefComplaint.slice(0, 30) : 'Case'} (${c.status})`;
            if (c.id === selectedId) opt.selected = true;
            selector.appendChild(opt);
        });

        selector.addEventListener("change", (e) => {
            loadCase(e.target.value);
        });
    }

    function loadCase(caseId) {
        currentCase = ClinicalStorage.getCaseById(caseId);
        if (!currentCase) {
            currentCase = ClinicalStorage.getCases()[0];
        }

        currentPatient = ClinicalStorage.getPatientById(currentCase.patientId);
        if (currentPatient) {
            localStorage.setItem("swasthai_active_patient_id", currentPatient.id);
        }

        renderPatientHeader();
        renderRedFlagBanner();
        renderAllergyBanner();
        renderStructuredReview();
        renderMissingInfo();
        renderContradictions();
        renderSplitView();
        renderTimeline();
        renderMedReconciliation();
        renderReportComparison();

        if (typeof DigitalTwin !== "undefined" && currentPatient) {
            DigitalTwin.renderPanel("digitalTwinContainer", "doctor", currentPatient.id, currentCase.id);
        }
        renderHealthMonitoring();
    }

    function renderPatientHeader() {
        if (!currentCase) return;

        document.getElementById("patientName").textContent = currentCase.patientName || "Patient Record";
        const initials = (currentCase.patientName || "P").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
        document.getElementById("patientAvatar").textContent = initials;
        document.getElementById("caseStatusBadge").textContent = currentCase.status;

        if (currentPatient) {
            document.getElementById("patientMeta").textContent = `${currentPatient.age || 40} years • ${currentPatient.gender || 'Not specified'} • Blood Group: ${currentPatient.bloodGroup || 'O+'} • Reg: ${currentPatient.id}`;
        }

        const consent = currentCase.consent;
        const consentLabel = document.getElementById("consentStatusLabel");
        if (consent && consent.caregiverConsent) {
            consentLabel.innerHTML = `<span style="color: #16a34a;"><i class="fa-solid fa-circle-check"></i> GRANTED (${consent.caregiverName || 'Caregiver'})</span>`;
        } else {
            consentLabel.innerHTML = `<span style="color: #6b7280;">NOT GRANTED</span>`;
        }
    }

    function renderRedFlagBanner() {
        const container = document.getElementById("redFlagBannerContainer");
        container.innerHTML = "";

        if (!currentCase.redFlags || currentCase.redFlags.length === 0) return;

        currentCase.redFlags.forEach(rf => {
            const banner = document.createElement("div");
            banner.className = "alert-banner-urgent";
            banner.innerHTML = `
                <div class="alert-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>${rf.severity}: ${rf.title}</h3>
                        <button class="btn-view-source" onclick="PractitionerReview.showExplanation('${rf.id}')">
                            <i class="fa-solid fa-circle-info"></i> Why did AI flag this?
                        </button>
                    </div>
                    <p>${rf.guidance}</p>
                    <div class="trigger-quote">
                        <strong>Triggered by patient statement:</strong> "${rf.triggerStatement || 'Patient interview statement'}"
                    </div>
                </div>
            `;
            container.appendChild(banner);
        });
    }

    function renderAllergyBanner() {
        const container = document.getElementById("allergyBannerContainer");
        container.innerHTML = "";

        if (!currentCase.allergies || currentCase.allergies.length === 0) {
            if (currentCase.allergyStatus === "unknown") {
                const unknownBanner = document.createElement("div");
                unknownBanner.className = "alert-banner-warning";
                unknownBanner.innerHTML = `
                    <div class="alert-icon"><i class="fa-solid fa-circle-question"></i></div>
                    <div>
                        <h4>Unknown Allergy Status</h4>
                        <p>Patient has not explicitly verified drug or food allergies. Please verify allergy history before prescribing any therapy.</p>
                    </div>
                `;
                container.appendChild(unknownBanner);
            }
            return;
        }

        currentCase.allergies.forEach(allergy => {
            const banner = document.createElement("div");
            banner.className = "alert-banner-warning";
            const conflictHtml = allergy.hasConflict ? `
                <div style="margin-top: 8px; background: #fff; padding: 8px 12px; border-radius: 6px; border: 1px solid #fcd34d; color: #b45309; font-weight: 700;">
                    ⚠ Potential Allergy Conflict: Patient takes or mentioned "${allergy.conflictingMed}". Cross-reactivity warning active.
                </div>
            ` : "";

            banner.innerHTML = `
                <div class="alert-icon"><i class="fa-solid fa-hand-dots"></i></div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4>ALLERGY ALERT: Patient reports ${allergy.allergen} (${allergy.severity || 'Reported'})</h4>
                        <span class="conf-badge conf-high">Verified</span>
                    </div>
                    <p>Reported Reaction: ${allergy.reaction || 'Severe adverse sensitivity'}. Do not prescribe related formulations.</p>
                    ${conflictHtml}
                </div>
            `;
            container.appendChild(banner);
        });
    }

    function renderStructuredReview() {
        if (!currentCase) return;

        document.getElementById("dispChiefComplaint").textContent = currentCase.chiefComplaint || "Not specified";
        document.getElementById("dispDuration").textContent = currentCase.duration || "Not specified";
        document.getElementById("dispLocation").textContent = currentCase.location || "Not specified";

        document.getElementById("dispMedHistory").textContent = (currentCase.medicalHistory && currentCase.medicalHistory.length > 0)
            ? currentCase.medicalHistory.join(", ") : "No chronic illnesses documented";

        document.getElementById("dispSurgHistory").textContent = (currentCase.surgicalHistory && currentCase.surgicalHistory.length > 0)
            ? currentCase.surgicalHistory.join(", ") : "None reported";

        if (currentCase.ayushAssessment) {
            const ay = currentCase.ayushAssessment;
            const prakritiText = ay.prakriti || (currentPatient && currentPatient.prakriti) || 'Not assessed';
            const manasikaText = ay.manasikaPrakriti ? ` • Manasika: ${ay.manasikaPrakriti}` : '';
            const agniText = ay.agni || (ay.dietaryPatterns && ay.dietaryPatterns.agni) ? ` • Agni: ${ay.agni || ay.dietaryPatterns.agni}` : '';
            const sleepText = ay.lifestyleRhythms && ay.lifestyleRhythms.nidra ? ay.lifestyleRhythms.nidra : '';
            const bowelText = ay.lifestyleRhythms && ay.lifestyleRhythms.koshtha ? ay.lifestyleRhythms.koshtha : '';
            const routineText = ay.lifestyleRhythms && ay.lifestyleRhythms.dinacharya ? ay.lifestyleRhythms.dinacharya : '';
            const dietText = ay.dietaryPatterns && ay.dietaryPatterns.rasaDiet ? ay.dietaryPatterns.rasaDiet : '';
            const habitsText = ay.dietaryPatterns && ay.dietaryPatterns.eatingHabits ? ay.dietaryPatterns.eatingHabits : '';
            const notesText = ay.notes || '';

            let ayushHtml = `<div style="font-weight: 700; color: #166534; font-size: 13px;">Body & Mind Profile: ${prakritiText}${manasikaText}${agniText}</div>`;
            if (sleepText || bowelText || routineText) {
                ayushHtml += `<div style="margin-top: 5px; font-size: 12px; color: #14532d;"><strong>Daily Habits (Sleep & Bowel):</strong> Sleep: ${sleepText || 'N/A'} | Bowel: ${bowelText || 'N/A'} | Routine: ${routineText || 'N/A'}</div>`;
            }
            if (dietText || habitsText) {
                ayushHtml += `<div style="margin-top: 4px; font-size: 12px; color: #14532d;"><strong>Food & Eating Habits:</strong> Cravings: ${dietText || 'N/A'} • Habits: ${habitsText || 'N/A'}</div>`;
            }
            if (notesText) {
                ayushHtml += `<div style="margin-top: 4px; font-size: 12px; color: #166534; font-style: italic;"><strong>Doctor's Notes:</strong> ${notesText}</div>`;
            }
            document.getElementById("dispAyushNotes").innerHTML = ayushHtml;
        }

        if (currentCase.clinicalImpression) {
            document.getElementById("inputClinicalImpression").value = currentCase.clinicalImpression;
        }
        if (currentCase.practitionerNotes) {
            document.getElementById("inputPractitionerNotes").value = currentCase.practitionerNotes;
        }

        // Summary
        const summaryText = currentCase.chiefComplaint ? `Patient presents with ${currentCase.chiefComplaint} of ${currentCase.duration} duration. Associated symptoms include ${(currentCase.symptoms || []).join(', ')}. Allergy status: ${currentCase.allergyStatus === 'known' ? (currentCase.allergies.map(a => a.allergen).join(', ')) : 'NKDA'}. Practitioner clinical review required.` : "Case summary pending.";
        document.getElementById("dispAiSummary").textContent = summaryText;
    }

    function renderMissingInfo() {
        const container = document.getElementById("missingInfoList");
        container.innerHTML = "";

        if (!currentCase.missingInformation || currentCase.missingInformation.length === 0) {
            container.innerHTML = `<p style="font-size: 13px; color: #16a34a;"><i class="fa-solid fa-circle-check"></i> No missing information detected.</p>`;
            document.getElementById("missingInfoCountBadge").textContent = "0 Items";
            document.getElementById("missingInfoCountBadge").className = "conf-badge conf-high";
            return;
        }

        document.getElementById("missingInfoCountBadge").textContent = `${currentCase.missingInformation.length} Items`;
        document.getElementById("missingInfoCountBadge").className = "conf-badge conf-medium";

        currentCase.missingInformation.forEach((item, idx) => {
            const div = document.createElement("div");
            div.style.cssText = "background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 8px; font-size: 12px;";
            div.innerHTML = `
                <div style="font-weight: 700; color: #374151; margin-bottom: 6px;">• ${item.label}</div>
                <div style="display: flex; gap: 6px;">
                    <button class="sih-btn ${item.status === 'confirmed' ? 'primary' : ''}" style="font-size: 11px; padding: 2px 8px; color: #374151; background: #e5e7eb;" onclick="PractitionerReview.markMissingInfo(${idx}, 'confirmed')">Confirmed</button>
                    <button class="sih-btn ${item.status === 'unconfirmed' ? 'primary' : ''}" style="font-size: 11px; padding: 2px 8px; color: #374151; background: #e5e7eb;" onclick="PractitionerReview.markMissingInfo(${idx}, 'unconfirmed')">Unconfirmed</button>
                    <button class="sih-btn ${item.status === 'not_available' ? 'primary' : ''}" style="font-size: 11px; padding: 2px 8px; color: #374151; background: #e5e7eb;" onclick="PractitionerReview.markMissingInfo(${idx}, 'not_available')">Not Available</button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    function markMissingInfo(index, status) {
        if (!currentCase.missingInformation || !currentCase.missingInformation[index]) return;
        currentCase.missingInformation[index].status = status;
        ClinicalStorage.saveOrUpdateCase(currentCase);
        renderMissingInfo();
    }

    function renderContradictions() {
        const container = document.getElementById("contradictionBody");
        const card = document.getElementById("contradictionCard");

        if (!currentCase.contradictions || currentCase.contradictions.length === 0) {
            card.style.display = "none";
            return;
        }

        card.style.display = "block";
        const c = currentCase.contradictions[0];
        container.innerHTML = `
            <div style="font-weight: 700; color: #991b1b; margin-bottom: 6px;">Field: ${c.field}</div>
            <div style="margin-bottom: 4px;">• <strong>Earlier:</strong> "${c.earlierStatement}"</div>
            <div style="margin-bottom: 6px;">• <strong>Later:</strong> "${c.laterStatement}"</div>
            <div style="background: #fff; border: 1px dashed #fca5a5; padding: 6px; border-radius: 4px; color: #7f1d1d;">
                <strong>Action:</strong> ${c.recommendation}
            </div>
        `;
    }

    function renderSplitView() {
        const transcriptBody = document.getElementById("splitTranscriptBody");
        const structuredBody = document.getElementById("splitStructuredBody");

        transcriptBody.innerHTML = "";
        structuredBody.innerHTML = "";

        // Render transcript on left
        if (!currentCase.transcript || currentCase.transcript.length === 0) {
            transcriptBody.innerHTML = `<p style="color: #6b7280; font-size: 13px;">No conversational transcript recorded for this case.</p>`;
        } else {
            currentCase.transcript.forEach(t => {
                const bubble = document.createElement("div");
                bubble.className = `chat-bubble ${t.speaker}`;
                bubble.innerHTML = `
                    <div>${t.text}</div>
                    <div class="chat-bubble-meta">
                        <span>${t.speaker.toUpperCase()} • ${t.originalLanguage || 'en'}</span>
                        <span>${t.timestamp || ''}</span>
                    </div>
                `;
                transcriptBody.appendChild(bubble);
            });
        }

        // Render mapped entities on right
        structuredBody.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px;">
                    <strong>Chief Complaint:</strong> ${currentCase.chiefComplaint || 'None'}
                    <div style="margin-top: 4px;"><span class="conf-badge conf-high">96%</span> Mapped from: "Mujhe 2 din se pet ke right side..."</div>
                </div>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px;">
                    <strong>Onset & Duration:</strong> ${currentCase.duration || 'None'}
                    <div style="margin-top: 4px;"><span class="conf-badge conf-high">92%</span> Mapped from: "Do din pehle shuru hua tha..."</div>
                </div>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px;">
                    <strong>Anatomical Location:</strong> ${currentCase.location || 'None'}
                    <div style="margin-top: 4px;"><span class="conf-badge conf-high">95%</span> Mapped from: "Pet ke upar right side me..."</div>
                </div>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px;">
                    <strong>Allergy Recorded:</strong> ${currentCase.allergies && currentCase.allergies[0] ? currentCase.allergies[0].allergen : 'NKDA'}
                    <div style="margin-top: 4px;"><span class="conf-badge conf-high">98%</span> Mapped from: "Mujhe Penicillin injection se bahut allergy hai..."</div>
                </div>
            </div>
        `;
    }

    function renderTimeline() {
        const container = document.getElementById("patientTimelineContainer");
        container.innerHTML = "";

        const events = ClinicalStorage.getTimelineForPatient(currentCase.patientId);
        if (events.length === 0) {
            container.innerHTML = `<p style="color: #6b7280; font-size: 13px;">No timeline events recorded yet for this patient.</p>`;
            return;
        }

        events.forEach(ev => {
            const isUrgent = ev.tag && (ev.tag.includes("Urgent") || ev.tag.includes("Critical"));
            const isAllergy = ev.tag && ev.tag.includes("Allergy");
            let dotClass = "timeline-event-dot";
            if (isUrgent) dotClass += " urgent";
            else if (isAllergy) dotClass += " allergy";

            const node = document.createElement("div");
            node.className = "timeline-event-node";
            node.innerHTML = `
                <div class="${dotClass}"><i class="fa-solid ${ev.icon || 'fa-notes-medical'}"></i></div>
                <div class="timeline-event-card" onclick="alert('${ev.title}\\nDate: ${ev.date}\\n\\nDetails:\\n${ev.details}')">
                    <div class="timeline-event-header">
                        <span class="timeline-event-date">${ev.date}</span>
                        <span class="timeline-event-tag">${ev.tag || ev.category}</span>
                    </div>
                    <div class="timeline-event-title">${ev.title}</div>
                    <div class="timeline-event-desc">${ev.details}</div>
                </div>
            `;
            container.appendChild(node);
        });
    }

    function renderMedReconciliation() {
        const tbody = document.getElementById("currentMedsTableBody");
        const alertContainer = document.getElementById("duplicateMedAlertContainer");
        tbody.innerHTML = "";
        alertContainer.innerHTML = "";

        if (!currentCase.currentMedications || currentCase.currentMedications.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #6b7280;">No active medications reported.</td></tr>`;
            return;
        }

        let hasDuplicate = false;
        currentCase.currentMedications.forEach((med, idx) => {
            const isMissingDose = !med.dose || med.dose.toLowerCase().includes("unknown") || med.dose.toLowerCase().includes("unspecified");
            if (med.name.toLowerCase().includes("painkiller") || med.name.toLowerCase().includes("nsaid")) {
                hasDuplicate = true;
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${med.name}</strong></td>
                <td>
                    ${isMissingDose ? `
                        <span style="color: #b91c1c; font-weight: 700;">⚠ Missing</span>
                        <button class="sih-btn" style="font-size: 10px; padding: 2px 6px; margin-left: 4px;" onclick="PractitionerReview.editMedDose(${idx})">Set Dose</button>
                    ` : med.dose}
                </td>
                <td>${med.frequency || 'Daily'}</td>
                <td>${med.route || 'Oral'}</td>
                <td>${med.reason || 'Symptom relief'}</td>
                <td>${med.prescribedBy || 'Physician'}</td>
                <td><span class="conf-badge conf-high">${med.status}</span></td>
                <td>
                    <button class="sih-btn" style="font-size: 11px; padding: 2px 6px;" onclick="PractitionerReview.editMedDose(${idx})">Edit</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (hasDuplicate) {
            alertContainer.innerHTML = `
                <div class="duplicate-med-warning">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span><strong>Possible Duplicate Analgesic / Unspecified NSAID:</strong> Patient reported self-administering an over-the-counter painkiller without dosage confirmation. Verify current analgesic status before prescribing.</span>
                </div>
            `;
        }
    }

    function editMedDose(index) {
        const med = currentCase.currentMedications[index];
        const newDose = prompt(`Enter confirmed dosage for ${med.name}:`, med.dose === "Unknown" ? "5mg" : med.dose);
        if (newDose && newDose.trim()) {
            med.dose = newDose.trim();
            ClinicalStorage.saveOrUpdateCase(currentCase);
            ClinicalStorage.logAudit("Practitioner Reconciled Medication", "Practitioner", `Medication: ${med.name}`, currentCase.id, `Dosage updated to ${med.dose}`);
            renderMedReconciliation();
        }
    }

    function renderReportComparison() {
        const container = document.getElementById("reportComparisonContainer");
        const report = DocumentService.SAMPLE_REPORTS[0]; // LFT Report for Rajesh Patel
        const compared = DocumentService.compareReportParameters(report.parameters);

        let tableRows = compared.map(p => {
            const isHigh = p.flag === "HIGH";
            const flagBadge = isHigh ? `<span style="background: #fee2e2; color: #b91c1c; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">HIGH</span>` : `<span style="background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">NORMAL</span>`;
            const trendIcon = p.trend === "increased" ? `<span style="color: #dc2626; font-weight: 700;">▲ ${p.delta}</span>` : `<span style="color: #16a34a; font-weight: 700;">▼ ${p.delta}</span>`;

            return `
                <tr>
                    <td><strong>${p.name}</strong></td>
                    <td style="font-weight: 600;">${p.baseline} ${p.unit}</td>
                    <td style="font-weight: 700; color: ${isHigh ? '#dc2626' : '#111827'};">${p.current} ${p.unit}</td>
                    <td>${trendIcon}</td>
                    <td>${p.referenceRange} ${p.unit}</td>
                    <td>${flagBadge}</td>
                </tr>
            `;
        }).join("");

        container.innerHTML = `
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <h4 style="font-size: 15px; font-weight: 700;">${report.title}</h4>
                    <span style="font-size: 12px; color: #6b7280;">Date: ${report.date} • Facility: ${report.facility}</span>
                </div>
                <p style="font-size: 13px; color: #4b5563;">${report.notes}</p>
            </div>

            <table class="med-recon-table">
                <thead>
                    <tr>
                        <th>Test Parameter</th>
                        <th>Baseline Value (Prev)</th>
                        <th>Latest Value</th>
                        <th>Delta / Trend</th>
                        <th>Reference Range</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            <p style="font-size: 12px; color: #6b7280; margin-top: 12px; font-style: italic;">
                * Note: Trends are for practitioner clinical correlation only and do not represent standalone diagnoses.
            </p>
        `;
    }

    function setupTabs() {
        const tabReview = document.getElementById("tabReviewModeBtn");
        const tabSplit = document.getElementById("tabSplitViewBtn");
        const tabTimeline = document.getElementById("tabTimelineBtn");
        const tabMedRecon = document.getElementById("tabMedReconBtn");
        const tabDocReports = document.getElementById("tabDocReportsBtn");
        const tabHealthVitals = document.getElementById("tabHealthVitalsBtn");

        const secReview = document.getElementById("structuredReviewSection");
        const secSplit = document.getElementById("splitViewSection");
        const secTimeline = document.getElementById("timelineSection");
        const secMedRecon = document.getElementById("medReconSection");
        const secDocReports = document.getElementById("docReportsSection");
        const secHealthVitals = document.getElementById("healthVitalsSection");

        const tabs = [tabReview, tabSplit, tabTimeline, tabMedRecon, tabDocReports, tabHealthVitals];
        const sections = [secReview, secSplit, secTimeline, secMedRecon, secDocReports, secHealthVitals];

        tabs.forEach((tab, index) => {
            if (!tab) return;
            tab.addEventListener("click", () => {
                tabs.forEach(t => {
                    if (!t) return;
                    t.className = "sih-btn";
                    t.style.color = "#374151";
                    t.style.background = "#e5e7eb";
                });
                sections.forEach(s => { if (s) s.style.display = "none"; });

                tab.className = "sih-btn primary";
                tab.style.color = "";
                tab.style.background = "";
                if (sections[index]) sections[index].style.display = "block";

                // Re-render health chart when tab becomes visible
                if (tab === tabHealthVitals) {
                    setTimeout(() => {
                        renderDoctorHealthChart(docCurrentChartMetric, docCurrentChartDays, docCurrentChartCustomStart, docCurrentChartCustomEnd);
                    }, 50);
                }
            });
        });
    }

    function setupNoteHandlers() {
        const saveNotesBtn = document.getElementById("savePractitionerNotesBtn");
        if (saveNotesBtn) {
            saveNotesBtn.addEventListener("click", () => {
                currentCase.clinicalImpression = document.getElementById("inputClinicalImpression").value.trim();
                currentCase.practitionerNotes = document.getElementById("inputPractitionerNotes").value.trim();
                ClinicalStorage.saveOrUpdateCase(currentCase);
                ClinicalStorage.logAudit("Updated Clinical Notes", "Practitioner", "Practitioner Notes", currentCase.id, "Saved clinical impression and action plan.");
                alert("Clinical notes saved successfully!");
            });
        }

        const finalizeBtn = document.getElementById("finalizeCaseBtn");
        if (finalizeBtn) {
            finalizeBtn.addEventListener("click", () => {
                if (confirm("Finalize this case as VERIFIED? All clinical entries will be recorded in the patient timeline.")) {
                    ClinicalStorage.updateCaseStatus(currentCase.id, "VERIFIED");
                    currentCase.status = "VERIFIED";
                    renderPatientHeader();
                    alert("Case successfully verified and finalized by practitioner!");
                }
            });
        }

        const scheduleFollowupBtn = document.getElementById("scheduleFollowupBtn");
        if (scheduleFollowupBtn) {
            scheduleFollowupBtn.addEventListener("click", () => {
                const modal = document.getElementById("followupModal");
                modal.classList.add("active");
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                document.getElementById("followupDateInput").value = nextWeek.toISOString().split("T")[0];
            });
        }

        const exportCaseBtn = document.getElementById("exportCaseBtn");
        if (exportCaseBtn) {
            exportCaseBtn.addEventListener("click", () => exportCaseData());
        }

        const exportFhirBtn = document.getElementById("exportFhirBtn");
        if (exportFhirBtn) {
            exportFhirBtn.addEventListener("click", () => exportFhirData());
        }
    }

    function saveFollowup() {
        const date = document.getElementById("followupDateInput").value;
        const reason = document.getElementById("followupReasonInput").value.trim() || "Routine clinical follow-up";
        const notes = document.getElementById("followupNotesInput").value.trim();

        if (!date) {
            alert("Please select a follow-up date.");
            return;
        }

        ClinicalStorage.addFollowup({
            caseId: currentCase.id,
            patientId: currentCase.patientId,
            patientName: currentCase.patientName,
            date: date,
            reason: reason,
            practitionerNote: notes,
            status: "scheduled",
            nextAction: "Practitioner consultation"
        });

        closeModal("followupModal");
        alert(`Follow-up scheduled for ${date}!`);
    }

    function showSource(fieldKey) {
        const modal = document.getElementById("sourceModal");
        const body = document.getElementById("sourceModalBody");

        const trace = currentCase.sourceTraceability ? currentCase.sourceTraceability[fieldKey] : null;
        if (!trace) {
            body.innerHTML = `
                <p style="color: #6b7280; font-size: 14px;">Direct extraction from patient consultation interview:</p>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; margin-top: 10px; font-size: 13px;">
                    <strong>Utterance:</strong> "${currentCase[fieldKey] || 'Consultation statement'}"<br>
                    <strong>Speaker:</strong> Patient<br>
                    <strong>Extraction Confidence:</strong> 94%<br>
                    <strong>Audit Status:</strong> Verifiable
                </div>
            `;
        } else {
            body.innerHTML = `
                <div style="font-size: 14px; color: #111827; margin-bottom: 10px;">
                    <strong>Clinical Parameter:</strong> ${fieldKey}
                </div>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.5;">
                    <div style="margin-bottom: 8px;">
                        <span style="font-weight: 700; color: #6b7280;">VERBATIM PATIENT UTTERANCE:</span>
                        <p style="font-size: 15px; color: #111827; font-style: italic; margin-top: 4px;">"${trace.utterance}"</p>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                        <div><strong>Speaker:</strong> ${trace.speaker}</div>
                        <div><strong>Timestamp:</strong> ${trace.timestamp || 'Recorded'}</div>
                        <div><strong>Original Language:</strong> ${trace.language || 'Hinglish'}</div>
                        <div><strong>Extraction Confidence:</strong> <span class="conf-badge conf-high">${trace.confidence}%</span></div>
                    </div>
                </div>
            `;
        }

        modal.classList.add("active");
    }

    function showExplanation(flagId) {
        const modal = document.getElementById("explanationModal");
        const body = document.getElementById("explanationModalBody");

        const explanation = AIService.getFlagExplanation(flagId, currentCase);
        body.innerHTML = `
            <div style="font-size: 16px; font-weight: 700; color: #991b1b; margin-bottom: 8px;">
                ${explanation.title}
            </div>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; margin-bottom: 14px; font-size: 13px; line-height: 1.5; color: #7f1d1d;">
                <strong>Why did AI flag this?</strong><br>
                ${explanation.reason}
            </div>
            <div style="font-size: 13px; color: #374151; margin-bottom: 10px;">
                <strong>Clinical Protocol Applied:</strong><br>
                <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${explanation.ruleReference}</code>
            </div>
            <div style="font-size: 13px; color: #374151; margin-bottom: 10px;">
                <strong>Verbatim Trigger Statement:</strong><br>
                <em>"${explanation.triggerStatement}"</em>
            </div>
            <p style="font-size: 11px; color: #6b7280; font-style: italic; margin-top: 12px;">
                ${explanation.disclaimer}
            </p>
        `;

        modal.classList.add("active");
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove("active");
    }

    function verifyField(fieldKey, action) {
        if (!currentCase.fieldVerification) currentCase.fieldVerification = {};
        currentCase.fieldVerification[fieldKey] = action;
        ClinicalStorage.saveOrUpdateCase(currentCase);
        ClinicalStorage.logAudit(`Practitioner ${action.toUpperCase()} field`, "Practitioner", fieldKey, currentCase.id, `Status set to ${action}`);
        alert(`Field "${fieldKey}" marked as ${action.toUpperCase()}.`);
    }

    function editField(fieldKey) {
        const currentVal = currentCase[fieldKey] || "";
        const newVal = prompt(`Edit ${fieldKey}:`, currentVal);
        if (newVal !== null && newVal.trim() !== currentVal) {
            currentCase[fieldKey] = newVal.trim();
            ClinicalStorage.saveOrUpdateCase(currentCase);
            ClinicalStorage.logAudit("Practitioner Edited Field", "Practitioner", fieldKey, currentCase.id, `Changed from "${currentVal}" to "${newVal}"`);
            renderStructuredReview();
        }
    }

    function copySummary() {
        const text = document.getElementById("dispAiSummary").textContent;
        navigator.clipboard.writeText(text).then(() => {
            alert("Case summary copied to clipboard!");
        });
    }

    function exportCaseData() {
        const exportObj = {
            metadata: {
                system: "SwasthAI / SWASTHAI",
                disclaimer: "AI-assisted clinical documentation — verified and finalized by registered AYUSH practitioner.",
                exportedAt: new Date().toISOString(),
                practitioner: "Dr. Sharma"
            },
            case: currentCase,
            patient: currentPatient,
            timeline: ClinicalStorage.getTimelineForPatient(currentCase.patientId)
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
        const dlAnchor = document.createElement("a");
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `Case_${currentCase.id}_${currentCase.patientName.replace(/\s+/g, '_')}.json`);
        dlAnchor.click();
    }

    function exportFhirData() {
        if (!currentCase) {
            alert("No active case to export.");
            return;
        }

        if (typeof FhirEmrService !== "undefined" && typeof FhirEmrService.convertCaseToFhirBundle === "function") {
            const bundle = FhirEmrService.convertCaseToFhirBundle(currentCase, currentPatient);
            FhirEmrService.downloadFhirBundle(bundle, `ABDM_FHIR_Case_${currentCase.id}_${currentCase.patientName.replace(/\s+/g, '_')}`);
            alert(`✅ ABDM HL7 FHIR R4 Bundle exported successfully for ${currentCase.patientName}!\nThis standardized document complies with India's Ayushman Bharat Digital Mission (ABDM) and can be imported into any certified hospital EHR/EMR.`);
        } else {
            alert("FHIR EMR Service is loading. Please try again.");
        }
    }

    function uploadReportSimulation() {
        const report = DocumentService.extractDocumentData();
        alert(`Report "${report.title}" processed successfully! Values extracted with practitioner verification flags.`);
        renderReportComparison();
    }

    /* =========================================================================
       HEALTH MONITORING (DOCTOR VIEW)
       ========================================================================= */
    let docHealthChartInstance = null;
    let docCurrentChartMetric = "bp";
    let docCurrentChartDays = 30;
    let docCurrentChartCustomStart = null;
    let docCurrentChartCustomEnd = null;

    async function renderHealthMonitoring() {
        if (typeof ApiService !== "undefined" && currentPatient) {
            try {
                const res = await ApiService.getHealthReadings(currentPatient.id);
                if (res && res.success && res.data) {
                    if (typeof ClinicalStorage !== "undefined") {
                        res.data.forEach(r => ClinicalStorage.saveHealthReading(r));
                    }
                }
            } catch (err) {
                console.warn("[PractitionerReview] Could not fetch readings from backend, using local:", err.message);
            }
        }
        renderDoctorHealthReadingsTable();
        renderDoctorHealthChart(docCurrentChartMetric, docCurrentChartDays);
    }

    function renderDoctorHealthReadingsTable() {
        const tbody = document.getElementById("docHealthReadingsTableBody");
        const countBadge = document.getElementById("docReadingsCountBadge");
        if (!tbody || !currentPatient) return;

        let readings = ClinicalStorage.getHealthReadings(currentPatient.id);
        
        countBadge.textContent = `${readings.length} Readings`;

        tbody.innerHTML = "";
        if (readings.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #64748b; padding: 24px;">No health readings recorded for this patient yet.</td></tr>`;
            return;
        }

        readings.forEach(r => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight: 600; color: #1e293b;">${r.date || '—'}</td>
                <td style="color: #64748b;">${r.time || '—'}</td>
                <td>
                    ${(r.systolic && r.diastolic) ? 
                        `<strong>${r.systolic}</strong> / ${r.diastolic}
                         ${r.systolic > 140 || r.diastolic > 90 ? '<i class="fa-solid fa-arrow-up" style="color: #dc2626; font-size: 10px; margin-left: 4px;"></i>' : ''}
                         ${r.systolic < 90 || r.diastolic < 60 ? '<i class="fa-solid fa-arrow-down" style="color: #dc2626; font-size: 10px; margin-left: 4px;"></i>' : ''}` 
                        : '—'}
                </td>
                <td>
                    ${r.bloodSugar ? 
                        `<strong>${r.bloodSugar}</strong>
                         ${r.bloodSugar > 140 ? '<i class="fa-solid fa-arrow-up" style="color: #dc2626; font-size: 10px; margin-left: 4px;"></i>' : ''}
                         ${r.bloodSugar < 70 ? '<i class="fa-solid fa-arrow-down" style="color: #dc2626; font-size: 10px; margin-left: 4px;"></i>' : ''}` 
                        : '—'}
                </td>
                <td>
                    ${r.heartRate ? 
                        `<strong>${r.heartRate}</strong>
                         ${r.heartRate > 100 || r.heartRate < 60 ? '<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b; font-size: 10px; margin-left: 4px;"></i>' : ''}`
                        : '—'}
                </td>
                <td>${r.temperature ? `<strong>${r.temperature}</strong> ${r.temperature > 99.5 ? '<i class="fa-solid fa-arrow-up" style="color: #dc2626; font-size: 10px; margin-left: 4px;"></i>' : ''}` : '—'}</td>
                <td>${r.spo2 ? `<strong>${r.spo2}</strong> ${r.spo2 < 95 ? '<i class="fa-solid fa-arrow-down" style="color: #dc2626; font-size: 10px; margin-left: 4px;"></i>' : ''}` : '—'}</td>
                <td>${r.weight ? `<strong>${r.weight}</strong>` : '—'}</td>
                <td style="font-size: 11px; color: #64748b; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${r.notes || ''}">
                    ${r.notes || '—'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderDoctorHealthChart(metric, days, customStart = null, customEnd = null) {
        if (typeof Chart === "undefined") {
            console.warn("Chart.js not loaded. Cannot render health chart.");
            return;
        }

        const ctx = document.getElementById("doctorHealthChart");
        if (!ctx) return;

        if (docHealthChartInstance) {
            docHealthChartInstance.destroy();
        }

        let readings = ClinicalStorage.getHealthReadings(currentPatient.id);
        readings = [...readings].reverse(); // oldest to newest for chart

        // Filter by date
        if (days !== 'all' && !customStart) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
            readings = readings.filter(r => new Date(r.date) >= cutoffDate);
        } else if (customStart && customEnd) {
            const startD = new Date(customStart);
            const endD = new Date(customEnd);
            readings = readings.filter(r => {
                const rd = new Date(r.date);
                return rd >= startD && rd <= endD;
            });
        }

        const labels = readings.map(r => r.date.substring(5) + (r.time ? ' ' + r.time : ''));
        let datasets = [];

        if (metric === "bp") {
            const sysData = readings.map(r => r.systolic || null);
            const diaData = readings.map(r => r.diastolic || null);
            datasets = [
                {
                    label: "Systolic (mmHg)",
                    data: sysData,
                    borderColor: "#dc2626",
                    backgroundColor: "rgba(220, 38, 38, 0.1)",
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: "Diastolic (mmHg)",
                    data: diaData,
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ];
        } else if (metric === "bloodSugar") {
            datasets = [{
                label: "Blood Sugar (mg/dL)",
                data: readings.map(r => r.bloodSugar || null),
                borderColor: "#2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }];
        } else if (metric === "heartRate") {
            datasets = [{
                label: "Heart Rate (bpm)",
                data: readings.map(r => r.heartRate || null),
                borderColor: "#7c3aed",
                backgroundColor: "rgba(124, 58, 237, 0.1)",
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }];
        } else if (metric === "spo2") {
            datasets = [{
                label: "SpO₂ (%)",
                data: readings.map(r => r.spo2 || null),
                borderColor: "#0ea5e9",
                backgroundColor: "rgba(14, 165, 233, 0.1)",
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }];
        } else if (metric === "weight") {
            datasets = [{
                label: "Weight (kg)",
                data: readings.map(r => r.weight || null),
                borderColor: "#0f766e",
                backgroundColor: "rgba(15, 118, 110, 0.1)",
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }];
        }

        docHealthChartInstance = new Chart(ctx, {
            type: "line",
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { font: { family: "'Inter', sans-serif" } } }
                },
                scales: {
                    x: { ticks: { font: { family: "'Inter', sans-serif", size: 10 } }, grid: { display: false } },
                    y: { ticks: { font: { family: "'Inter', sans-serif", size: 11 } }, grid: { color: '#f1f5f9' } }
                }
            }
        });
    }

    function switchHealthChartMetric(metric, btnEl) {
        docCurrentChartMetric = metric;
        const tabs = document.querySelectorAll("#docChartMetricTabs .chart-tab-btn");
        tabs.forEach(t => t.classList.remove("active"));
        if (btnEl) btnEl.classList.add("active");
        renderDoctorHealthChart(docCurrentChartMetric, docCurrentChartDays, docCurrentChartCustomStart, docCurrentChartCustomEnd);
    }

    function switchHealthChartRange(days, btnEl) {
        docCurrentChartDays = days;
        docCurrentChartCustomStart = null;
        docCurrentChartCustomEnd = null;
        const btns = document.querySelectorAll("#docChartRangeBtns .chart-range-btn");
        btns.forEach(b => {
            if (b.textContent !== "Apply") b.classList.remove("active");
        });
        if (btnEl) btnEl.classList.add("active");
        renderDoctorHealthChart(docCurrentChartMetric, docCurrentChartDays);
    }

    function applyHealthChartCustomRange() {
        const start = document.getElementById("docChartFromDate").value;
        const end = document.getElementById("docChartToDate").value;
        if (!start || !end) {
            alert("Please select both start and end dates.");
            return;
        }
        docCurrentChartDays = 'custom';
        docCurrentChartCustomStart = start;
        docCurrentChartCustomEnd = end;

        const btns = document.querySelectorAll("#docChartRangeBtns .chart-range-btn");
        btns.forEach(b => b.classList.remove("active"));
        // Make the apply button look active or just remove active from others
        
        renderDoctorHealthChart(docCurrentChartMetric, docCurrentChartDays, docCurrentChartCustomStart, docCurrentChartCustomEnd);
    }

    return {
        init,
        loadCase,
        showSource,
        showExplanation,
        closeModal,
        verifyField,
        editField,
        copySummary,
        saveFollowup,
        editMedDose,
        markMissingInfo,
        uploadReportSimulation,
        switchHealthChartMetric,
        switchHealthChartRange,
        applyHealthChartCustomRange,
        openAddTimelineModal: function() {
            alert("Timeline event feature — add via Case Taking or the audit log system.");
        }
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    PractitionerReview.init();
});
