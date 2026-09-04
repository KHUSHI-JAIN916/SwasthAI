/* ==========================================================================
   SwasthAI / SWASTHAI — Universal Prescription & Treatment Plan Service
   Enables Doctors to prescribe medicines, dosage, timing, duration, advice,
   and recommended tests, and syncs 100% in real-time with Patient Portal.
   ========================================================================== */

const PrescriptionService = (() => {
    let rowCounter = 0;

    function init() {
        createPrescriptionModalHTML();
    }

    function createPrescriptionModalHTML() {
        if (document.getElementById("doctorPrescriptionModal")) return;

        const modal = document.createElement("div");
        modal.id = "doctorPrescriptionModal";
        modal.className = "clinical-modal";
        modal.innerHTML = `
            <div class="clinical-modal-content" style="max-width: 800px; max-height: 92vh; overflow-y: auto; border-radius: 20px;">
                <div class="clinical-modal-header" style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); color: white; padding: 18px 24px; border-radius: 20px 20px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin:0; font-size: 18px; font-weight: 800; display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid fa-prescription" style="font-size: 22px; color: #86efac;"></i>
                        <span>Doctor Prescription & Treatment Plan Generator (डॉक्टर पर्चा)</span>
                    </h3>
                    <button type="button" onclick="PrescriptionService.closeModal()" style="color: white; font-size: 26px; background: none; border: none; cursor: pointer; line-height: 1;">&times;</button>
                </div>
                <div class="clinical-modal-body" style="padding: 24px;">
                    <form id="doctorPrescriptionForm" onsubmit="PrescriptionService.submitPrescription(event)">
                        <!-- PATIENT & DOCTOR META -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; background: #f0fdf4; border: 1.5px solid #bbf7d0; padding: 16px; border-radius: 14px;">
                            <div>
                                <label style="font-size: 12px; font-weight: 800; color: #166534; display: block; margin-bottom: 4px;">Select Patient (मरीज़ चुनें) *</label>
                                <select id="rxPatientSelect" style="width: 100%; padding: 10px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-weight: 700; font-size: 14px;" required>
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 12px; font-weight: 800; color: #166534; display: block; margin-bottom: 4px;">Diagnosis / Primary Disease (निदान / बीमारी) *</label>
                                <input type="text" id="rxDiagnosisInput" placeholder="e.g. Pittashaya Shoola / Hyperacidity" style="width: 100%; padding: 10px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-weight: 600; font-size: 14px;" required value="Pitta-Vata Shoola & Hyperacidity">
                            </div>
                        </div>

                        <!-- MEDICINES SECTION -->
                        <div style="margin-bottom: 18px; background: #ffffff; border: 1.5px solid #e2e8f0; padding: 16px; border-radius: 14px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-pills" style="color: #16a34a;"></i>
                                    <span>Prescribed Medicines List (दवाइयों की सूची)</span>
                                </h4>
                                <button type="button" onclick="PrescriptionService.addMedicineRow()" style="background: #dcfce7; color: #15803d; border: 1.5px solid #86efac; border-radius: 8px; padding: 8px 14px; font-weight: 800; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                                    <i class="fa-solid fa-plus"></i> Add Medicine (और दवा जोड़ें)
                                </button>
                            </div>

                            <div id="rxMedicinesContainer" style="display: flex; flex-direction: column; gap: 12px;">
                                <!-- Dynamic rows -->
                            </div>
                        </div>

                        <!-- ADVICE & TESTS SECTION -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
                            <div>
                                <label style="font-size: 12px; font-weight: 800; color: #334155; display: block; margin-bottom: 4px;">Diet & Lifestyle Advice (सलाह व परहेज़)</label>
                                <textarea id="rxAdviceInput" rows="3" placeholder="e.g. Avoid spicy/fried food, drink 3L warm water daily, light walk after meals" style="width: 100%; padding: 10px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-size: 13px; box-sizing: border-box;">कम नमक व सुपाच्य भोजन लें। सुबह 30 मिनट टहलें। अत्यधिक तला-भुना खाने से बचें।</textarea>
                            </div>
                            <div>
                                <label style="font-size: 12px; font-weight: 800; color: #334155; display: block; margin-bottom: 4px;">Recommended Tests / Investigations (आवश्यक जाँचें)</label>
                                <textarea id="rxTestsInput" rows="3" placeholder="e.g. Ultrasound Abdomen, LFT, CBC test" style="width: 100%; padding: 10px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-size: 13px; box-sizing: border-box;">Ultrasound (USG) Abdomen & LFT Blood Test</textarea>
                            </div>
                        </div>

                        <!-- FOLLOWUP DATE & DOCTOR NOTES -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
                            <div>
                                <label style="font-size: 12px; font-weight: 800; color: #334155; display: block; margin-bottom: 4px;">Next Follow-Up Appointment Date (अगली डॉक्टर मुलाक़ात)</label>
                                <input type="date" id="rxFollowupDateInput" style="width: 100%; padding: 10px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-weight: 700; font-size: 14px;" required>
                            </div>
                            <div>
                                <label style="font-size: 12px; font-weight: 800; color: #334155; display: block; margin-bottom: 4px;">Prescribing Doctor Name & Designation</label>
                                <input type="text" id="rxDoctorNameInput" value="Dr. R. K. Sharma (MD Ayush - Senior Physician)" style="width: 100%; padding: 10px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-weight: 700; font-size: 14px;">
                            </div>
                        </div>

                        <button type="submit" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3);">
                            <i class="fa-solid fa-paper-plane"></i> Save & Send Prescription to Patient Portal (पर्चा जारी करें)
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function openModal(preselectedPatientId) {
        createPrescriptionModalHTML();
        const modal = document.getElementById("doctorPrescriptionModal");
        if (!modal) return;

        // Populate Patients Dropdown
        const select = document.getElementById("rxPatientSelect");
        if (select) {
            select.innerHTML = "";
            const patients = ClinicalStorage.getPatients() || [];
            patients.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.id;
                opt.textContent = `${p.fullName} (ID: ${p.id}) — ${p.phone || ''}`;
                if (preselectedPatientId && p.id === preselectedPatientId) {
                    opt.selected = true;
                }
                select.appendChild(opt);
            });
        }

        // Set default follow up date (7 days from today)
        const dateInput = document.getElementById("rxFollowupDateInput");
        if (dateInput) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            dateInput.value = nextWeek.toISOString().split("T")[0];
        }

        // Clear existing rows and add 2 initial default medicine rows
        const container = document.getElementById("rxMedicinesContainer");
        if (container) {
            container.innerHTML = "";
            rowCounter = 0;
            addMedicineRow("Sankha Vati", "Tablet", "1 Tablet", "Morning & Evening", "After Meals", "7 Days");
            addMedicineRow("Amlodipine", "Tablet", "5mg", "Once Daily (Morning)", "After Meals", "30 Days");
        }

        modal.classList.add("active");
    }

    function closeModal() {
        const modal = document.getElementById("doctorPrescriptionModal");
        if (modal) modal.classList.remove("active");
    }

    function addMedicineRow(name = "", type = "Tablet", dose = "1 Tablet", timing = "Morning & Night (1-0-1)", food = "After Meals", duration = "7 Days") {
        const container = document.getElementById("rxMedicinesContainer");
        if (!container) return;

        rowCounter++;
        const rowId = `medRow_${rowCounter}`;

        const row = document.createElement("div");
        row.id = rowId;
        row.style.cssText = "background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; display: grid; grid-template-columns: 2fr 1.2fr 1fr 1.5fr 1.5fr 1fr 40px; gap: 8px; align-items: center;";

        row.innerHTML = `
            <div>
                <span style="font-size: 10px; font-weight: 800; color: #64748b;">MEDICINE NAME</span>
                <input type="text" class="rx-med-name" value="${name}" placeholder="e.g. Pantocid 40mg" style="width: 100%; padding: 6px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px; font-weight: 700;" required>
            </div>
            <div>
                <span style="font-size: 10px; font-weight: 800; color: #64748b;">FORM</span>
                <select class="rx-med-type" style="width: 100%; padding: 6px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 12px;">
                    <option value="Tablet" ${type === 'Tablet' ? 'selected' : ''}>Tablet</option>
                    <option value="Capsule" ${type === 'Capsule' ? 'selected' : ''}>Capsule</option>
                    <option value="Syrup" ${type === 'Syrup' ? 'selected' : ''}>Syrup</option>
                    <option value="Churna" ${type === 'Churna' ? 'selected' : ''}>Churna</option>
                    <option value="Oil" ${type === 'Oil' ? 'selected' : ''}>Oil / Ointment</option>
                </select>
            </div>
            <div>
                <span style="font-size: 10px; font-weight: 800; color: #64748b;">DOSE</span>
                <input type="text" class="rx-med-dose" value="${dose}" placeholder="1 Tab / 5ml" style="width: 100%; padding: 6px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 12px;" required>
            </div>
            <div>
                <span style="font-size: 10px; font-weight: 800; color: #64748b;">SCHEDULE</span>
                <select class="rx-med-timing" style="width: 100%; padding: 6px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 12px;">
                    <option value="Morning (08:00 AM)" ${timing.includes('Morning') ? 'selected' : ''}>Morning (08:00 AM)</option>
                    <option value="Afternoon (01:30 PM)" ${timing.includes('Afternoon') ? 'selected' : ''}>Afternoon (01:30 PM)</option>
                    <option value="Night (08:30 PM)" ${timing.includes('Night') ? 'selected' : ''}>Night (08:30 PM)</option>
                    <option value="Morning & Night (1-0-1)" ${timing.includes('1-0-1') ? 'selected' : ''}>Morning & Night (1-0-1)</option>
                    <option value="Thrice Daily (1-1-1)" ${timing.includes('1-1-1') ? 'selected' : ''}>Thrice Daily (1-1-1)</option>
                </select>
            </div>
            <div>
                <span style="font-size: 10px; font-weight: 800; color: #64748b;">INSTRUCTION</span>
                <select class="rx-med-food" style="width: 100%; padding: 6px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 12px;">
                    <option value="After Meals (खाने के बाद)" ${food.includes('After') ? 'selected' : ''}>After Meals (खाने के बाद)</option>
                    <option value="Before Meals (खाली पेट)" ${food.includes('Before') ? 'selected' : ''}>Before Meals (खाली पेट)</option>
                    <option value="At Bedtime (सोते समय)" ${food.includes('Bedtime') ? 'selected' : ''}>At Bedtime (सोते समय)</option>
                    <option value="With Warm Water / Milk" ${food.includes('Water') ? 'selected' : ''}>With Warm Water/Milk</option>
                </select>
            </div>
            <div>
                <span style="font-size: 10px; font-weight: 800; color: #64748b;">DURATION</span>
                <input type="text" class="rx-med-duration" value="${duration}" placeholder="7 Days" style="width: 100%; padding: 6px 8px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 12px;">
            </div>
            <div style="text-align: center; margin-top: 14px;">
                <button type="button" onclick="document.getElementById('${rowId}').remove()" style="background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; width: 28px; height: 28px; font-weight: 900; cursor: pointer;">&times;</button>
            </div>
        `;

        container.appendChild(row);
    }

    function submitPrescription(e) {
        e.preventDefault();

        const patientId = document.getElementById("rxPatientSelect").value;
        const diagnosis = document.getElementById("rxDiagnosisInput").value.trim();
        const advice = document.getElementById("rxAdviceInput").value.trim();
        const tests = document.getElementById("rxTestsInput").value.trim();
        const followupDate = document.getElementById("rxFollowupDateInput").value;
        const doctorName = document.getElementById("rxDoctorNameInput").value.trim();

        const patient = ClinicalStorage.getPatientById(patientId);
        if (!patient) {
            alert("Patient not found!");
            return;
        }

        // Gather all medicine rows
        const medicineRows = document.querySelectorAll("#rxMedicinesContainer > div");
        const medicinesList = [];

        medicineRows.forEach(row => {
            const name = row.querySelector(".rx-med-name") ? row.querySelector(".rx-med-name").value.trim() : "";
            const type = row.querySelector(".rx-med-type") ? row.querySelector(".rx-med-type").value : "Tablet";
            const dose = row.querySelector(".rx-med-dose") ? row.querySelector(".rx-med-dose").value.trim() : "1 Dose";
            const timing = row.querySelector(".rx-med-timing") ? row.querySelector(".rx-med-timing").value : "Morning";
            const food = row.querySelector(".rx-med-food") ? row.querySelector(".rx-med-food").value : "After Meals";
            const duration = row.querySelector(".rx-med-duration") ? row.querySelector(".rx-med-duration").value.trim() : "7 Days";

            if (name) {
                medicinesList.push({
                    name: `${name} (${type})`,
                    dose,
                    frequency: timing,
                    instructions: food,
                    duration,
                    reason: advice || "Prescribed by doctor"
                });
            }
        });

        if (medicinesList.length === 0) {
            alert("Please add at least one medicine!");
            return;
        }

        // 1. Create or update patient active case with medications
        const cases = ClinicalStorage.getCases().filter(c => c.patientId === patientId);
        let activeCase = cases.length > 0 ? cases[0] : null;

        if (!activeCase) {
            activeCase = {
                id: "CASE-" + Date.now(),
                patientId: patient.id,
                patientName: patient.fullName,
                createdAt: new Date().toISOString(),
                status: "VERIFIED"
            };
        }

        activeCase.status = "VERIFIED";
        activeCase.chiefComplaint = diagnosis;
        activeCase.currentMedications = medicinesList;
        activeCase.practitionerNotes = `Prescription issued by ${doctorName}.\nDiagnosis: ${diagnosis}\nAdvice: ${advice}\nTests: ${tests}`;
        ClinicalStorage.saveOrUpdateCase(activeCase);

        // 2. Add follow up appointment
        if (followupDate) {
            ClinicalStorage.addFollowup({
                caseId: activeCase.id,
                patientId: patient.id,
                patientName: patient.fullName,
                date: followupDate,
                reason: `Doctor Prescription Follow-up (${diagnosis})`,
                practitionerNote: advice,
                status: "scheduled"
            });
        }

        // 3. Log Timeline Event
        const timelineFn = ClinicalStorage.addTimelineEvent || ClinicalStorage.logTimelineEvent;
        if (typeof timelineFn === "function") {
            timelineFn({
                patientId: patient.id,
                category: "prescription",
                title: `Doctor Prescription Issued by ${doctorName}`,
                description: `Diagnosis: ${diagnosis}. Prescribed ${medicinesList.length} medicines: ${medicinesList.map(m => m.name).join(", ")}. Advice: ${advice}`,
                date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
                icon: "fa-prescription",
                badgeText: "Doctor Prescribed"
            });
        }

        if (typeof ClinicalStorage.logAudit === "function") {
            ClinicalStorage.logAudit("Doctor Issued Prescription", doctorName, "Prescription", activeCase.id, `Prescribed ${medicinesList.length} medicines to ${patient.fullName}`);
        }

        // Set active patient for patient portal sync
        localStorage.setItem("swasthai_active_patient_id", patient.id);

        closeModal();

        // Success Alert with Action
        const msg = `✅ Prescription successfully issued for ${patient.fullName}!\n\n` +
                    `• Prescribed Medicines: ${medicinesList.length}\n` +
                    `• Follow-up Date: ${followupDate}\n\n` +
                    `The prescription has been sent directly to the Patient's Portal!`;

        alert(msg);

        // Notify open listeners
        window.dispatchEvent(new CustomEvent("prescriptionIssued", { detail: { patientId: patient.id } }));
    }

    return {
        init,
        openModal,
        closeModal,
        addMedicineRow,
        submitPrescription
    };
})();

// Auto-initialize when script loads
if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => PrescriptionService.init());
    } else {
        PrescriptionService.init();
    }
}
