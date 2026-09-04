/* ==========================================================================
   SWASTHAI — Doctor & Hospital Login Controller
   Manages Doctor authentication with Hospital name selection and registration.
   ========================================================================== */

function switchDoctorAuthTab(tab) {
    const loginForm = document.getElementById("doctorLoginForm");
    const regForm = document.getElementById("doctorRegisterForm");
    const tabLoginBtn = document.getElementById("tabDoctorLoginBtn");
    const tabRegBtn = document.getElementById("tabHospitalRegBtn");

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

function updateHospitalBadge() {
    const select = document.getElementById("loginHospitalName");
    const displayHeader = document.getElementById("displayHospitalName");
    if (select && displayHeader) {
        displayHeader.textContent = select.value;
    }
}

function fillDoctorDemo(id, name, pass, hospital) {
    const idInput = document.getElementById("loginDoctorId");
    const passInput = document.getElementById("loginDoctorPassword");
    const hospSelect = document.getElementById("loginHospitalName");

    if (idInput) idInput.value = id;
    if (passInput) passInput.value = pass;
    if (hospSelect) {
        hospSelect.value = hospital;
        updateHospitalBadge();
    }
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

function handleDoctorLogin(e) {
    e.preventDefault();
    const hospitalName = document.getElementById("loginHospitalName").value;
    const docId = document.getElementById("loginDoctorId").value.trim();
    const password = document.getElementById("loginDoctorPassword").value;
    const errorEl = document.getElementById("doctorLoginError");

    if (!docId) {
        if (errorEl) {
            errorEl.textContent = "कृपया Doctor ID या ईमेल दर्ज करें।";
            errorEl.style.display = "block";
        }
        return;
    }

    // Determine Doctor Name
    let doctorName = "Dr. Sharma";
    if (docId.toLowerCase().includes("verma")) {
        doctorName = "Dr. Verma";
    } else if (docId.startsWith("Dr.") || docId.startsWith("dr.")) {
        doctorName = docId;
    }

    // Store doctor session details in localStorage
    const doctorSession = {
        id: docId,
        name: doctorName,
        hospitalName: hospitalName,
        role: "practitioner",
        loggedInAt: new Date().toISOString()
    };

    localStorage.setItem("ayushCurrentUser", JSON.stringify(doctorSession));
    localStorage.setItem("ayushActiveRole", "practitioner");
    localStorage.setItem("swasthai_current_hospital", hospitalName);

    if (typeof ClinicalStorage !== "undefined") {
        ClinicalStorage.logAudit(
            "Doctor Login",
            "practitioner",
            "Authentication",
            docId,
            `${doctorName} logged in under ${hospitalName}`
        );
    }

    if (typeof SpeechService !== "undefined") {
        SpeechService.speakText(`स्वागत है ${doctorName} जी, ${hospitalName} पोर्टल में।`, { lang: "hi-IN" });
    }

    // Redirect to Doctor Dashboard
    window.location.href = "dashboard.html";
}

function handleDoctorRegister(e) {
    e.preventDefault();
    const hospName = document.getElementById("regHospitalName").value.trim();
    const docName = document.getElementById("regDoctorName").value.trim();
    const specialty = document.getElementById("regSpecialty").value.trim();
    const license = document.getElementById("regLicense").value.trim();
    const contact = document.getElementById("regDoctorContact").value.trim();
    const password = document.getElementById("regDoctorPassword").value;
    const errorEl = document.getElementById("doctorRegisterError");

    if (!hospName || !docName || !contact) {
        if (errorEl) {
            errorEl.textContent = "कृपया अस्पताल का नाम, डॉक्टर का नाम और संपर्क अनिवार्य रूप से भरें।";
            errorEl.style.display = "block";
        }
        return;
    }

    // Save session
    const doctorSession = {
        id: "DOC-" + Date.now().toString().slice(-4),
        name: docName.startsWith("Dr.") ? docName : "Dr. " + docName,
        hospitalName: hospName,
        specialty: specialty,
        license: license,
        contact: contact,
        role: "practitioner",
        loggedInAt: new Date().toISOString()
    };

    localStorage.setItem("ayushCurrentUser", JSON.stringify(doctorSession));
    localStorage.setItem("ayushActiveRole", "practitioner");
    localStorage.setItem("swasthai_current_hospital", hospName);

    if (typeof ClinicalStorage !== "undefined") {
        ClinicalStorage.logAudit(
            "Registered & Logged In Doctor",
            "practitioner",
            "Registration",
            doctorSession.id,
            `${doctorSession.name} registered under ${hospName}`
        );
    }

    window.location.href = "dashboard.html";
}

// Auto init badge on load
document.addEventListener("DOMContentLoaded", () => {
    updateHospitalBadge();
});
