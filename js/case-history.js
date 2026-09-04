/* ==========================================================================
   SwasthAI / SWASTHAI — Case History Controller
   Renders case records from clinical storage with filtering, search,
   status workflows, timeline previews, and review workspace linking.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const totalCasesEl = document.getElementById("totalCases");
    const activeCasesEl = document.getElementById("activeCases");
    const followupCasesEl = document.getElementById("followupCases");
    const completedCasesEl = document.getElementById("completedCases");

    const searchInput = document.getElementById("caseSearch");
    const statusFilter = document.getElementById("caseStatusFilter");
    const prakritiFilter = document.getElementById("prakritiFilter");
    const clearFiltersBtn = document.getElementById("clearCaseFilters");

    const resultCountEl = document.getElementById("caseResultCount");
    const tableBody = document.getElementById("caseTableBody");
    const emptyState = document.getElementById("caseEmptyState");

    const detailsModal = document.getElementById("caseDetailsModal");
    const closeCaseModal = document.getElementById("closeCaseModal");
    const modalContent = document.getElementById("caseDetailsContent");

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => sidebar.classList.toggle("show"));
    }

    let allCases = [];

    function loadCases() {
        if (typeof ClinicalStorage !== "undefined") {
            allCases = ClinicalStorage.getCases();
        } else {
            allCases = JSON.parse(localStorage.getItem("ayushCases")) || [];
        }
        updateStats();
        renderTable();
    }

    function updateStats() {
        const total = allCases.length;
        const active = allCases.filter(c => c.status === "IN PROGRESS" || c.status === "AI REVIEW" || c.status === "PRACTITIONER REVIEW").length;
        const followup = allCases.filter(c => c.followUp || (c.status && c.status.toLowerCase().includes("follow"))).length;
        const completed = allCases.filter(c => c.status === "VERIFIED" || c.status === "COMPLETED").length;

        if (totalCasesEl) totalCasesEl.textContent = total;
        if (activeCasesEl) activeCasesEl.textContent = active;
        if (followupCasesEl) followupCasesEl.textContent = followup;
        if (completedCasesEl) completedCasesEl.textContent = completed;
    }

    function renderTable() {
        const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
        const selectedStatus = (statusFilter ? statusFilter.value : "all").toLowerCase();
        const selectedPrakriti = (prakritiFilter ? prakritiFilter.value : "all").toLowerCase();

        const filtered = allCases.filter(c => {
            const matchesQuery = !query ||
                (c.id && c.id.toLowerCase().includes(query)) ||
                (c.patientName && c.patientName.toLowerCase().includes(query)) ||
                (c.chiefComplaint && c.chiefComplaint.toLowerCase().includes(query));

            let matchesStatus = true;
            if (selectedStatus !== "all") {
                const cStatus = (c.status || "").toLowerCase();
                if (selectedStatus === "active") {
                    matchesStatus = cStatus === "in progress" || cStatus === "ai review" || cStatus === "practitioner review";
                } else if (selectedStatus === "follow-up") {
                    matchesStatus = c.followUp != null;
                } else if (selectedStatus === "completed") {
                    matchesStatus = cStatus === "verified" || cStatus === "completed";
                }
            }

            let matchesPrakriti = true;
            if (selectedPrakriti !== "all") {
                const prakriti = c.ayushAssessment && c.ayushAssessment.prakriti ? c.ayushAssessment.prakriti.toLowerCase() : "";
                matchesPrakriti = prakriti.includes(selectedPrakriti);
            }

            return matchesQuery && matchesStatus && matchesPrakriti;
        });

        if (resultCountEl) {
            resultCountEl.textContent = `${filtered.length} Case${filtered.length === 1 ? '' : 's'}`;
        }

        if (filtered.length === 0) {
            tableBody.innerHTML = "";
            if (emptyState) emptyState.style.display = "block";
            return;
        }

        if (emptyState) emptyState.style.display = "none";
        tableBody.innerHTML = "";

        filtered.forEach(c => {
            const tr = document.createElement("tr");

            // Format date
            const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently";

            // Status styling
            let statusBadge = `<span class="status new-status">${c.status || 'Draft'}</span>`;
            if (c.status === "VERIFIED" || c.status === "COMPLETED") {
                statusBadge = `<span class="status active-status" style="background: #dcfce7; color: #166534;">Verified</span>`;
            } else if (c.status === "PRACTITIONER REVIEW") {
                statusBadge = `<span class="status follow-status" style="background: #fef3c7; color: #92400e;">Needs Review</span>`;
            } else if (c.status === "AI REVIEW") {
                statusBadge = `<span class="status new-status" style="background: #e0f2fe; color: #0369a1;">AI Review</span>`;
            }

            // Prakriti badge
            const prakritiVal = c.ayushAssessment && c.ayushAssessment.prakriti ? c.ayushAssessment.prakriti : "Vata";

            tr.innerHTML = `
                <td><strong>${c.id}</strong></td>
                <td>
                    <div style="font-weight: 700; color: #111827;">${c.patientName || 'Unknown Patient'}</div>
                    <small style="color: #6b7280;">ID: ${c.patientId || 'N/A'}</small>
                </td>
                <td style="max-width: 240px; font-size: 13px;">
                    <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${c.chiefComplaint || ''}">
                        ${c.chiefComplaint || 'Consultation in progress'}
                    </div>
                </td>
                <td style="font-size: 13px; color: #4b5563;">${dateStr}</td>
                <td><span style="background: #f0fdf4; color: #166534; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 12px;">${prakritiVal}</span></td>
                <td>${statusBadge}</td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <a href="practitioner-review.html?caseId=${c.id}" class="action-btn" style="background: #1f7a57; color: white; padding: 5px 10px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-user-doctor"></i> Review
                        </a>
                        <button class="action-btn view-details-btn" data-id="${c.id}" style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                            Details
                        </button>
                    </div>
                </td>
            `;

            tableBody.appendChild(tr);
        });

        // Attach details click
        document.querySelectorAll(".view-details-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                openCaseDetails(id);
            });
        });
    }

    function openCaseDetails(caseId) {
        const targetCase = allCases.find(c => c.id === caseId);
        if (!targetCase) return;

        const timelineEvents = typeof ClinicalStorage !== "undefined" ? ClinicalStorage.getTimelineForPatient(targetCase.patientId) : [];

        let timelineHtml = "";
        if (timelineEvents.length > 0) {
            timelineHtml = `
                <h4 style="font-size: 14px; font-weight: 700; margin-top: 16px; margin-bottom: 8px;">Patient Timeline Events:</h4>
                <div style="background: #f9fafb; padding: 12px; border-radius: 6px; font-size: 12px;">
                    ${timelineEvents.map(e => `<div>• <strong>${e.date}:</strong> ${e.title} (${e.tag || e.category})</div>`).join("")}
                </div>
            `;
        }

        modalContent.innerHTML = `
            <div style="padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 14px;">
                    <div>
                        <h2 style="font-size: 18px; font-weight: 800; color: #111827;">${targetCase.patientName}</h2>
                        <span style="font-size: 12px; color: #6b7280;">Case ID: ${targetCase.id} • Status: ${targetCase.status}</span>
                    </div>
                    <a href="practitioner-review.html?caseId=${targetCase.id}" class="primary-btn" style="padding: 6px 14px; font-size: 12px; text-decoration: none;">
                        Open in Review Workspace
                    </a>
                </div>

                <div style="font-size: 13px; line-height: 1.6;">
                    <p><strong>Chief Complaint:</strong> ${targetCase.chiefComplaint || 'N/A'}</p>
                    <p><strong>Duration / Onset:</strong> ${targetCase.duration || 'N/A'}</p>
                    <p><strong>Location:</strong> ${targetCase.location || 'N/A'}</p>
                    <p><strong>Allergy Status:</strong> ${targetCase.allergyStatus === 'known' ? (targetCase.allergies.map(a => a.allergen).join(", ")) : 'No known allergies'}</p>
                    <p><strong>Clinical Notes:</strong> ${targetCase.practitionerNotes || 'None recorded yet.'}</p>
                </div>

                ${timelineHtml}

                <div style="margin-top: 16px; display: flex; justify-content: flex-end; gap: 8px;">
                    ${(targetCase.status === 'VERIFIED' || targetCase.status === 'COMPLETED') ? `
                        <button class="secondary-btn" onclick="reopenCase('${targetCase.id}')">Re-open Case</button>
                    ` : ''}
                </div>
            </div>
        `;

        if (detailsModal) detailsModal.style.display = "flex";
    }

    window.reopenCase = function(caseId) {
        const reason = prompt("Enter practitioner rationale for reopening this case:", "Additional symptom investigation requested by patient");
        if (reason && reason.trim()) {
            if (typeof ClinicalStorage !== "undefined") {
                ClinicalStorage.updateCaseStatus(caseId, "PRACTITIONER REVIEW");
                ClinicalStorage.logAudit("Re-opened Completed Case", "Practitioner", "Case Status", caseId, `Reopened with rationale: ${reason}`);
            }
            if (detailsModal) detailsModal.style.display = "none";
            loadCases();
            alert("Case re-opened. Status changed to PRACTITIONER REVIEW.");
        }
    };

    if (closeCaseModal) {
        closeCaseModal.addEventListener("click", () => {
            if (detailsModal) detailsModal.style.display = "none";
        });
    }

    if (searchInput) searchInput.addEventListener("input", renderTable);
    if (statusFilter) statusFilter.addEventListener("change", renderTable);
    if (prakritiFilter) prakritiFilter.addEventListener("change", renderTable);

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (statusFilter) statusFilter.value = "all";
            if (prakritiFilter) prakritiFilter.value = "all";
            renderTable();
        });
    }

    loadCases();
});
