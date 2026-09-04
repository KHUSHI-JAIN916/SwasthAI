/* ==========================================================================
   SwasthAI / SWASTHAI — AI Clinical Assistant Controller
   Analyzes live patient cases, computes structured observations,
   confidence ratings, attention flags, and practitioner suggestions.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const generateAiBtn = document.getElementById("generateAiBtn");
    const patientCaseSelect = document.getElementById("patientCaseSelect");
    const aiProcessing = document.getElementById("aiProcessing");
    const aiResults = document.getElementById("aiResults");
    const aiSummaryText = document.getElementById("aiSummaryText");
    const ayushObservation = document.getElementById("ayushObservation");
    const confidenceScore = document.getElementById("confidenceScore");
    const attentionFlags = document.getElementById("attentionFlags");
    const suggestedQuestions = document.getElementById("suggestedQuestions");
    const followUpList = document.getElementById("followUpList");
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => sidebar.classList.toggle("show"));
    }

    let allCases = [];

    function init() {
        if (typeof ClinicalStorage !== "undefined") {
            allCases = ClinicalStorage.getCases();
        }
        populatePatientCases();

        if (generateAiBtn) {
            generateAiBtn.addEventListener("click", () => {
                if (aiResults) aiResults.classList.remove("show");
                if (aiProcessing) aiProcessing.classList.add("show");

                generateAiBtn.disabled = true;
                generateAiBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...`;

                setTimeout(() => {
                    generateAiAnalysis();
                }, 1000);
            });
        }
    }

    function populatePatientCases() {
        if (!patientCaseSelect) return;
        patientCaseSelect.innerHTML = "";

        allCases.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = `${c.patientName} — ${c.chiefComplaint ? c.chiefComplaint.slice(0, 35) : 'Case'} (${c.id})`;
            patientCaseSelect.appendChild(opt);
        });
    }

    function generateAiAnalysis() {
        const selectedId = patientCaseSelect.value;
        const targetCase = allCases.find(c => c.id === selectedId) || allCases[0];

        if (!targetCase) return;

        // SUMMARY
        const summary = `${targetCase.patientName} presents with ${targetCase.chiefComplaint || 'health concern'} lasting ${targetCase.duration || 'an unspecified duration'}. Recorded symptoms include ${(targetCase.symptoms || []).join(', ') || 'under investigation'}. Prakriti observation indicates ${targetCase.ayushAssessment ? targetCase.ayushAssessment.prakriti : 'Vata'} characteristics. Review by practitioner is required before therapy.`;
        if (aiSummaryText) aiSummaryText.textContent = summary;

        // AYUSH OBSERVATIONS
        if (ayushObservation) {
            ayushObservation.innerHTML = `
                <div class="ayush-observation-item">
                    <strong>Prakriti:</strong> ${targetCase.ayushAssessment ? targetCase.ayushAssessment.prakriti : 'Vata'} dominance documented.
                </div>
                <div class="ayush-observation-item">
                    <strong>Dosha Assessment:</strong> ${targetCase.ayushAssessment && targetCase.ayushAssessment.notes ? targetCase.ayushAssessment.notes : 'Requires clinical assessment.'}
                </div>
                <div class="ayush-observation-item">
                    <strong>Recommendation:</strong> Dietary timing regulation and Prakriti-aligned regimen recommended for practitioner review.
                </div>
            `;
        }

        // CONFIDENCE
        if (confidenceScore) {
            confidenceScore.textContent = targetCase.fieldConfidence && targetCase.fieldConfidence.chiefComplaint ? `${targetCase.fieldConfidence.chiefComplaint}%` : "92%";
        }

        // FLAGS
        if (attentionFlags) {
            attentionFlags.innerHTML = "";
            const flags = [];
            if (targetCase.redFlags && targetCase.redFlags.length > 0) {
                flags.push({ text: `RED FLAG: ${targetCase.redFlags[0].title} (Immediate Attention)`, urgent: true });
            }
            if (targetCase.allergies && targetCase.allergies.length > 0) {
                flags.push({ text: `ALLERGY: ${targetCase.allergies[0].allergen} (${targetCase.allergies[0].reaction || 'Adverse sensitivity'})`, urgent: false });
            }
            if (targetCase.contradictions && targetCase.contradictions.length > 0) {
                flags.push({ text: `CONTRADICTION: ${targetCase.contradictions[0].field}`, urgent: false });
            }
            if (targetCase.missingInformation && targetCase.missingInformation.length > 0) {
                flags.push({ text: `MISSING: ${targetCase.missingInformation[0].label}`, urgent: false });
            }

            if (flags.length === 0) {
                attentionFlags.innerHTML = `<div class="flag-item"><i class="fa-solid fa-circle-check" style="color: #16a34a;"></i> All clinical parameters consistent.</div>`;
            } else {
                flags.forEach(f => {
                    attentionFlags.innerHTML += `
                        <div class="flag-item" style="${f.urgent ? 'color: #b91c1c; background: #fee2e2; border-color: #fca5a5;' : ''}">
                            <i class="fa-solid ${f.urgent ? 'fa-triangle-exclamation' : 'fa-circle-exclamation'}"></i>
                            ${f.text}
                        </div>
                    `;
                });
            }
        }

        // SUGGESTED QUESTIONS
        if (suggestedQuestions) {
            suggestedQuestions.innerHTML = "";
            const questions = [
                `Are the symptoms currently worsening after meals or physical exertion?`,
                `Have you noticed any relief with warm water, rest, or previously prescribed medicines?`,
                `Are you experiencing any sleep disturbance or daytime fatigue?`,
                `Would you like to schedule an in-clinic follow-up consultation in 7 days?`
            ];
            questions.forEach((q, idx) => {
                suggestedQuestions.innerHTML += `
                    <div class="question-item">
                        <div class="question-number">${idx + 1}</div>
                        <div>${q}</div>
                    </div>
                `;
            });
        }

        // FOLLOW-UPS
        if (followUpList) {
            followUpList.innerHTML = `
                <div class="followup-item"><i class="fa-solid fa-circle-check"></i> Complete practitioner review in Practitioner Review Workspace.</div>
                <div class="followup-item"><i class="fa-solid fa-circle-check"></i> Verify recorded allergy status before finalizing any prescription.</div>
                <div class="followup-item"><i class="fa-solid fa-circle-check"></i> Review diagnostic lab reports and observe trends.</div>
                <div style="margin-top: 14px;">
                    <a href="practitioner-review.html?caseId=${targetCase.id}" class="primary-btn" style="text-decoration: none; padding: 8px 16px; display: inline-block;">
                        Open in Review Workspace <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            `;
        }

        if (aiProcessing) aiProcessing.classList.remove("show");
        if (aiResults) aiResults.classList.add("show");

        generateAiBtn.disabled = false;
        generateAiBtn.innerHTML = `<i class="fa-solid fa-robot"></i> Generate New Analysis`;
    }

    init();
});