/* ==========================================================================
   SwasthAI / SWASTHAI — Add Patient Controller
   Validates registration steps, captures medical background and caregiver details,
   and saves new records to ClinicalStorage.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const formSteps = document.querySelectorAll(".form-step");
    const progressSteps = document.querySelectorAll(".progress-step");

    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const submitBtn = document.getElementById("submitBtn");

    const patientForm = document.getElementById("patientForm");
    const reviewData = document.getElementById("reviewData");
    const successModal = document.getElementById("successModal");

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");

    let currentStep = 0;

    // Mobile sidebar
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => sidebar.classList.toggle("show"));
    }

    function showStep() {
        formSteps.forEach((step, index) => {
            step.classList.toggle("active-form-step", index === currentStep);
        });

        progressSteps.forEach((step, index) => {
            step.classList.toggle("active-step", index <= currentStep);
        });

        if (prevBtn) prevBtn.style.visibility = currentStep === 0 ? "hidden" : "visible";
        if (nextBtn) nextBtn.style.display = currentStep === formSteps.length - 1 ? "none" : "flex";
        if (submitBtn) submitBtn.style.display = currentStep === formSteps.length - 1 ? "flex" : "none";
    }

    function validateStep() {
        const inputs = formSteps[currentStep].querySelectorAll("input[required], select[required], textarea[required]");
        for (let input of inputs) {
            if (!input.value.trim()) {
                input.focus();
                alert("Please fill in all required fields.");
                return false;
            }
        }
        return true;
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (!validateStep()) return;
            if (currentStep === 2) {
                generateReview();
            }
            currentStep++;
            showStep();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentStep > 0) {
                currentStep--;
                showStep();
            }
        });
    }

    function generateReview() {
        const fields = [
            ["Full Name", "fullName"],
            ["Date of Birth", "dob"],
            ["Gender", "gender"],
            ["Blood Group", "bloodGroup"],
            ["Occupation", "occupation"],
            ["Phone Number", "phone"],
            ["Email Address", "email"],
            ["Address", "address"],
            ["Emergency Contact", "emergencyName"],
            ["Emergency Phone", "emergencyPhone"],
            ["Allergies", "allergies"],
            ["Existing Conditions", "conditions"]
        ];

        if (!reviewData) return;
        reviewData.innerHTML = "";

        fields.forEach(([label, id]) => {
            const el = document.getElementById(id);
            const val = (el && el.value.trim()) ? el.value.trim() : "Not Provided";
            reviewData.innerHTML += `
                <div class="review-item">
                    <span>${label}</span>
                    <strong>${val}</strong>
                </div>
            `;
        });
    }

    if (patientForm) {
        patientForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const getVal = (id) => {
                const el = document.getElementById(id);
                return el ? el.value.trim() : "";
            };

            // Calculate age from DOB if possible
            let calculatedAge = 35;
            const dobVal = getVal("dob");
            if (dobVal) {
                const birthYear = new Date(dobVal).getFullYear();
                const currentYear = new Date().getFullYear();
                if (!isNaN(birthYear) && birthYear < currentYear) {
                    calculatedAge = currentYear - birthYear;
                }
            }

            const newPatient = {
                fullName: getVal("fullName") || "New Patient",
                dob: dobVal,
                age: calculatedAge,
                gender: getVal("gender") || "Other",
                bloodGroup: getVal("bloodGroup") || "O+",
                occupation: getVal("occupation"),
                phone: getVal("phone"),
                email: getVal("email"),
                address: getVal("address"),
                emergencyName: getVal("emergencyName"),
                emergencyPhone: getVal("emergencyPhone"),
                allergies: getVal("allergies") || "No Known Allergies",
                allergyStatus: getVal("allergies") ? "known" : "no_known_allergies",
                conditions: getVal("conditions") || "None reported",
                password: "123456",
                pastDoctorRecords: [],
                patientReportedDiseases: [],
                status: "new"
            };

            let createdPatient = newPatient;
            if (typeof ClinicalStorage !== "undefined") {
                createdPatient = ClinicalStorage.addPatient(newPatient);
            }

            // Update success modal with generated ID & credentials
            const patientIdEl = document.querySelector(".patient-id-badge strong");
            if (patientIdEl && createdPatient.id) {
                patientIdEl.innerHTML = `${createdPatient.id}<br><span style="font-size: 11px; color: #166534; font-weight: normal;">Patient Portal Password: 123456</span>`;
            }

            if (successModal) {
                successModal.classList.add("show-modal");
            }
        });
    }

    // Auto-Fill Patient Details by Credentials
    const fetchCredsBtn = document.getElementById("fetchPatientCredsBtn");
    const fetchIdInput = document.getElementById("fetchPatientIdInput");
    const fetchPassInput = document.getElementById("fetchPatientPassInput");
    const fetchStatusMsg = document.getElementById("fetchPatientStatusMsg");

    if (fetchCredsBtn) {
        fetchCredsBtn.addEventListener("click", () => {
            const queryId = (fetchIdInput ? fetchIdInput.value : "").trim();

            if (!queryId) {
                alert("Please enter a Patient ID or Mobile Number.");
                if (fetchIdInput) fetchIdInput.focus();
                return;
            }

            // Find patient in ClinicalStorage
            let targetPatient = null;
            if (typeof ClinicalStorage !== "undefined") {
                targetPatient = ClinicalStorage.getPatientById(queryId);
                if (!targetPatient) {
                    const allPatients = ClinicalStorage.getPatients();
                    targetPatient = allPatients.find(p => 
                        (p.id && p.id.toLowerCase() === queryId.toLowerCase()) ||
                        (p.phone && p.phone.replace(/\D/g, "").includes(queryId.replace(/\D/g, "")))
                    );
                }
            }

            if (!targetPatient) {
                if (fetchStatusMsg) {
                    fetchStatusMsg.style.display = "block";
                    fetchStatusMsg.style.background = "#fef2f2";
                    fetchStatusMsg.style.color = "#991b1b";
                    fetchStatusMsg.style.border = "1px solid #fca5a5";
                    fetchStatusMsg.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> No patient found matching "${queryId}". Please verify Patient ID or Phone number.`;
                }
                return;
            }

            // Auto-fill form input fields
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el && val !== undefined && val !== null) {
                    el.value = val;
                }
            };

            setVal("fullName", targetPatient.fullName);
            if (targetPatient.dob) setVal("dob", targetPatient.dob);
            setVal("gender", targetPatient.gender);
            setVal("bloodGroup", targetPatient.bloodGroup);
            setVal("occupation", targetPatient.occupation || "");
            setVal("phone", targetPatient.phone || "");
            setVal("email", targetPatient.email || "");
            setVal("address", targetPatient.address || "");
            setVal("emergencyName", targetPatient.emergencyName || "");
            setVal("emergencyPhone", targetPatient.emergencyPhone || "");
            setVal("allergies", targetPatient.allergies || "");
            setVal("conditions", targetPatient.conditions || "");

            if (fetchStatusMsg) {
                fetchStatusMsg.style.display = "block";
                fetchStatusMsg.style.background = "#f0fdf4";
                fetchStatusMsg.style.color = "#166534";
                fetchStatusMsg.style.border = "1px solid #bbf7d0";
                fetchStatusMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> <strong>Patient Details Auto-Filled Successfully!</strong><br>Found: ${targetPatient.fullName} (ID: ${targetPatient.id}, Phone: ${targetPatient.phone || 'N/A'}). Form fields populated automatically.`;
            }

            if (typeof I18nService !== "undefined") {
                I18nService.translatePage();
            }
        });
    }

    const goToPatients = document.getElementById("goToPatients");
    if (goToPatients) {
        goToPatients.addEventListener("click", () => {
            window.location.href = "dashboard.html";
        });
    }

    showStep();
});