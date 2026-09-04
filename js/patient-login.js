/* ==========================================================================
   SWASTHAI — Patient Login & Registration Controller
   Authenticates patients by ID/Mobile + Password and handles registration.
   ========================================================================== */

function switchAuthTab(tab) {
    const loginForm = document.getElementById("patientLoginForm");
    const regForm = document.getElementById("patientRegisterForm");
    const tabLoginBtn = document.getElementById("tabLoginBtn");
    const tabRegBtn = document.getElementById("tabRegisterBtn");

    if (tab === "login") {
        if (loginForm) loginForm.style.display = "block";
        if (regForm) regForm.style.display = "none";
        if (tabLoginBtn) tabLoginBtn.classList.add("active");
        if (tabRegBtn) tabRegBtn.classList.remove("active");
    } else {
        if (loginForm) loginForm.style.display = "none";
        if (regForm) regForm.style.display = "block";
        if (tabLoginBtn) tabLoginBtn.classList.remove("active");
        if (tabRegBtn) tabRegBtn.classList.add("active");
    }
}

function fillDemoCredentials(id, pass) {
    const idInput = document.getElementById("loginPatientId");
    const passInput = document.getElementById("loginPassword");
    if (idInput) idInput.value = id;
    if (passInput) passInput.value = pass;
}

function togglePasswordVisibility(inputId, iconEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        iconEl.classList.remove("fa-eye");
        iconEl.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        iconEl.classList.remove("fa-eye-slash");
        iconEl.classList.add("fa-eye");
    }
}

function handlePatientLogin(e) {
    e.preventDefault();
    const id = document.getElementById("loginPatientId").value.trim();
    const pass = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("loginErrorMsg");

    if (!id) {
        if (errorEl) {
            errorEl.textContent = "कृपया Patient ID या मोबाइल नंबर दर्ज करें।";
            errorEl.style.display = "block";
        }
        return;
    }

    const authResult = ClinicalStorage.authenticatePatient(id, pass);
    if (!authResult.success) {
        if (errorEl) {
            errorEl.textContent = authResult.message;
            errorEl.style.display = "block";
        }
        return;
    }

    // Success: save active patient
    localStorage.setItem("swasthai_active_patient_id", authResult.patient.id);
    localStorage.setItem("ayushActiveRole", "patient");

    // Success feedback
    if (typeof SpeechService !== "undefined") {
        SpeechService.speakText(`नमस्ते ${authResult.patient.fullName}, स्वास्थ AI में आपका स्वागत है।`, { lang: "hi-IN" });
    }

    window.location.href = "patient-portal.html";
}

function handlePatientRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById("regFullName").value.trim();
    const age = parseInt(document.getElementById("regAge").value, 10) || 30;
    const gender = document.getElementById("regGender").value;
    const phone = document.getElementById("regPhone").value.trim();
    const allergies = document.getElementById("regAllergies").value.trim() || "No Known Allergies";
    const password = document.getElementById("regPassword").value || "123456";
    const errorEl = document.getElementById("registerErrorMsg");

    if (!fullName || !phone) {
        if (errorEl) {
            errorEl.textContent = "कृपया नाम और मोबाइल नंबर अनिवार्य रूप से भरें।";
            errorEl.style.display = "block";
        }
        return;
    }

    // Register patient into storage
    const newPatient = ClinicalStorage.addPatient({
        fullName: fullName,
        age: age,
        gender: gender,
        phone: phone,
        allergies: allergies,
        password: password,
        status: "active",
        conditions: "New Consultation Registered",
        pastDoctorRecords: [],
        patientReportedDiseases: []
    });

    localStorage.setItem("swasthai_active_patient_id", newPatient.id);
    localStorage.setItem("ayushActiveRole", "patient");

    alert(`पंजीकरण सफल!\n\nआपकी Patient ID: ${newPatient.id}\nपासवर्ड: ${password}\n\nअब आप अपने स्वास्थ्य पोर्टल में प्रवेश कर रहे हैं।`);

    window.location.href = "patient-portal.html";
}
