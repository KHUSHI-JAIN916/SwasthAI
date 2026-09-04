/* ==========================================================================
   SwasthAI / SWASTHAI — Patient Management Controller
   Dynamically loads registered patients from storage, handles search,
   status filters, patient details dossier, and case taking initiation.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("patientSearch");
    const statusFilter = document.getElementById("statusFilter");
    const tableBody = document.getElementById("patientTableBody");
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => sidebar.classList.toggle("show"));
    }

    let allPatients = [];

    function loadPatients() {
        if (typeof ClinicalStorage !== "undefined") {
            allPatients = ClinicalStorage.getPatients();
        } else {
            allPatients = JSON.parse(localStorage.getItem("ayushPatients")) || [];
        }
        renderPatientTable();
    }

    function renderPatientTable() {
        if (!tableBody) return;

        const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
        const selectedStatus = (statusFilter ? statusFilter.value : "all").toLowerCase();

        const filtered = allPatients.filter(p => {
            const matchesQuery = !query ||
                p.fullName.toLowerCase().includes(query) ||
                p.id.toLowerCase().includes(query) ||
                (p.email && p.email.toLowerCase().includes(query)) ||
                (p.phone && p.phone.toLowerCase().includes(query));

            let matchesStatus = true;
            if (selectedStatus !== "all") {
                matchesStatus = (p.status || "").toLowerCase() === selectedStatus;
            }

            return matchesQuery && matchesStatus;
        });

        tableBody.innerHTML = "";

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #6b7280; padding: 24px;">No patients match your search criteria.</td></tr>`;
            return;
        }

        filtered.forEach(p => {
            const initials = (p.fullName || "P").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

            let statusBadge = `<span class="status new-status">${p.status || 'Active'}</span>`;
            if (p.status === "active") {
                statusBadge = `<span class="status active-status">Active</span>`;
            } else if (p.status === "followup") {
                statusBadge = `<span class="status follow-status">Follow-up</span>`;
            }

            const tr = document.createElement("tr");
            tr.dataset.status = (p.status || "active").toLowerCase();
            tr.innerHTML = `
                <td>
                    <div class="patient-name">
                        <div class="patient-avatar avatar-1" style="background: #1f7a57; color: white;">
                            ${initials}
                        </div>
                        <div>
                            <h4>${p.fullName}</h4>
                            <p>${p.email || 'No email'}</p>
                        </div>
                    </div>
                </td>
                <td><strong style="color: #1f7a57;">${p.id}</strong></td>
                <td>${p.age || 'N/A'} / ${p.gender || 'N/A'}</td>
                <td>${p.registeredDate || 'Aug 2026'}</td>
                <td>${statusBadge}</td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <a href="case-taking.html?patientId=${p.id}" onclick="localStorage.setItem('swasthai_active_patient_id', '${p.id}')" class="action-btn" style="background: #1f7a57; color: white; padding: 5px 10px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600;">
                            <i class="fa-solid fa-plus"></i> New Case
                        </a>
                        <button class="action-btn" onclick="showPatientCard('${p.id}')" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700;">
                            <i class="fa-solid fa-eye"></i> View Dossier
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    window.showPatientCard = function(patientId) {
        localStorage.setItem("swasthai_active_patient_id", patientId);
        const fullProfile = ClinicalStorage.searchPatientFullProfile(patientId);
        if (!fullProfile) return;

        const p = fullProfile.patient;

        // Populate header & demographics
        document.getElementById("dossierPatientName").innerHTML = `<i class="fa-solid fa-id-card-clip"></i> ${p.fullName} (${p.id})`;
        document.getElementById("dossierSubtitle").textContent = `Contact: ${p.phone || 'N/A'} | Registered: ${p.registeredDate || 'Aug 2026'}`;
        document.getElementById("dossierAgeGender").textContent = `${p.age || 35}y / ${p.gender || 'Other'}`;
        document.getElementById("dossierBloodGroup").textContent = p.bloodGroup || "Not recorded";
        document.getElementById("dossierPhone").textContent = p.phone || "N/A";
        document.getElementById("dossierAllergies").textContent = p.allergies || "No Known Drug Allergies";

        document.getElementById("dossierLoginCreds").textContent = `Patient Portal Login -> ID: ${p.id} | Password: ${p.password || '123456'}`;
        document.getElementById("dossierStartCaseBtn").href = `case-taking.html?patientId=${p.id}`;

        // Populate Reported Diseases
        const diseasesContainer = document.getElementById("dossierReportedDiseases");
        if (diseasesContainer) {
            diseasesContainer.innerHTML = "";
            const diseases = fullProfile.patientReportedDiseases || [];
            if (diseases.length === 0) {
                diseasesContainer.innerHTML = `<div style="font-size: 12px; color: #64748b; background: #f8fafc; padding: 8px; border-radius: 6px;">No self-reported diseases on file.</div>`;
            } else {
                diseases.forEach(d => {
                    const div = document.createElement("div");
                    div.style.cssText = "background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px;";
                    div.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="color: #166534; font-size: 13px;">${d.diseaseName}</strong>
                            <span style="font-size: 11px; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-weight: 700;">${d.severity || 'Moderate'}</span>
                        </div>
                        <div style="font-size: 11px; color: #374151; margin-top: 2px;">Duration: ${d.duration || 'N/A'} | Symptoms: ${d.symptoms || 'N/A'}</div>
                    `;
                    diseasesContainer.appendChild(div);
                });
            }
        }

        // Populate Past Doctor Records
        const pastRecordsContainer = document.getElementById("dossierPastDoctorRecords");
        if (pastRecordsContainer) {
            pastRecordsContainer.innerHTML = "";
            const records = fullProfile.pastDoctorRecords || [];
            if (records.length === 0) {
                pastRecordsContainer.innerHTML = `<div style="font-size: 12px; color: #64748b; background: #f8fafc; padding: 8px; border-radius: 6px;">No previous doctor consultations recorded.</div>`;
            } else {
                records.forEach(r => {
                    const div = document.createElement("div");
                    div.style.cssText = "background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px;";
                    div.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="color: #1e40af; font-size: 13px;">${r.doctorName} (${r.clinicOrHospital || 'Clinic'})</strong>
                            <span style="font-size: 11px; background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 10px; font-weight: 700;">${r.year || 'Past'}</span>
                        </div>
                        <div style="font-size: 11px; color: #1e293b; margin-top: 2px;">Diagnosis: <strong>${r.diagnosis}</strong> | Meds: ${r.pastMedicines || 'N/A'}</div>
                        ${r.notes ? `<div style="font-size: 11px; color: #64748b;">Notes: ${r.notes}</div>` : ''}
                    `;
                    pastRecordsContainer.appendChild(div);
                });
            }
        }

        // Populate Timeline & Cases
        const timelineContainer = document.getElementById("dossierTimelineList");
        if (timelineContainer) {
            timelineContainer.innerHTML = "";
            const timeline = fullProfile.timeline || [];
            if (timeline.length === 0) {
                timelineContainer.innerHTML = `<div style="font-size: 12px; color: #64748b; padding: 8px;">No timeline events recorded.</div>`;
            } else {
                timeline.slice(0, 4).forEach(t => {
                    const div = document.createElement("div");
                    div.style.cssText = "padding: 6px 10px; background: #f8fafc; border-left: 3px solid #1f7a57; border-radius: 4px;";
                    div.innerHTML = `<strong>${t.date} — ${t.title}:</strong> <span style="color: #4b5563;">${t.details}</span>`;
                    timelineContainer.appendChild(div);
                });
            }
        }

        document.getElementById("patientDossierModal").classList.add("active");
    };

    window.closePatientDossierModal = function() {
        const modal = document.getElementById("patientDossierModal");
        if (modal) modal.classList.remove("active");
    };

    const dossierModal = document.getElementById("patientDossierModal");
    if (dossierModal) {
        dossierModal.addEventListener("click", (e) => {
            if (e.target === dossierModal) {
                closePatientDossierModal();
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closePatientDossierModal();
        }
    });

    if (searchInput) searchInput.addEventListener("input", renderPatientTable);
    if (statusFilter) statusFilter.addEventListener("change", renderPatientTable);

    // Language switch listener
    window.addEventListener("languageChanged", () => {
        renderPatientTable();
        if (typeof I18nService !== "undefined") {
            I18nService.translatePage();
        }
    });

    loadPatients();
});