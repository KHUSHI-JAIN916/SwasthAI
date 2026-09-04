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

    const goToPatients = document.getElementById("goToPatients");
    if (goToPatients) {
        goToPatients.addEventListener("click", () => {
            window.location.href = "patients.html";
        });
    }

    showStep();
});