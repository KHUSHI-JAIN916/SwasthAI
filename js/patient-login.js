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

async function handlePatientLogin(e) {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    
    const idInput = document.getElementById("loginPatientId");
    const passInput = document.getElementById("loginPassword");
    const errorEl = document.getElementById("loginErrorMsg");
    const submitBtn = document.querySelector("#patientLoginForm button[type='submit']");

    const id = idInput ? idInput.value.trim() : "";
    const pass = passInput ? passInput.value : "";

    if (!id) {
        if (errorEl) {
            errorEl.textContent = "कृपया Patient ID या मोबाइल नंबर दर्ज करें (उदा. AYU-2026-DEMO या 9876543210)";
            errorEl.style.display = "block";
        } else {
            alert("कृपया Patient ID या मोबाइल नंबर दर्ज करें।");
        }
        return false;
    }

    if (errorEl) errorEl.style.display = "none";
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> लॉगिन हो रहा है...';
    }

    let authResult = { success: false, message: "" };

    try {
        if (typeof ApiService !== "undefined") {
            const res = await ApiService.login({
                email: id,
                phone: id,
                patientId: id,
                id: id,
                password: pass || "123456",
                role: "patient"
            });

            if (res && res.token) {
                ApiService.setToken(res.token);
                authResult = {
                    success: true,
                    patient: res.user || { id: id, fullName: res.user.name || "Patient" }
                };
            }
        }
    } catch (apiErr) {
        console.warn("[PatientLogin] Backend API warning, checking clinical storage:", apiErr.message);
        if (apiErr.status === 401 && !apiErr.isNetworkError) {
            authResult = { success: false, message: apiErr.message || "पासवर्ड गलत है।" };
        }
    }

    if (!authResult.success && typeof ClinicalStorage !== "undefined" && typeof ClinicalStorage.authenticatePatient === "function") {
        authResult = ClinicalStorage.authenticatePatient(id, pass);
    }

    if (!authResult.success) {
        if (errorEl) {
            errorEl.textContent = authResult.message || "लॉगिन विफल। कृपया ID व पासवर्ड जांचें।";
            errorEl.style.display = "block";
        } else {
            alert(authResult.message || "लॉगिन विफल।");
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> स्वास्थ्य पोर्टल में प्रवेश करें (Login)';
        }
        return false;
    }

    // Success: save active patient
    const targetPatientId = (authResult.patient && (authResult.patient.patientId || authResult.patient.id)) ? (authResult.patient.patientId || authResult.patient.id) : "AYU-2026-DEMO";
    localStorage.setItem("swasthai_active_patient_id", targetPatientId);
    localStorage.setItem("ayushActiveRole", "patient");

    if (typeof SpeechService !== "undefined" && typeof SpeechService.speakText === "function") {
        try {
            SpeechService.speakText(`नमस्ते ${authResult.patient.fullName || authResult.patient.name || ''}, स्वास्थ AI में आपका स्वागत है।`, { lang: "hi-IN" });
        } catch(err) {}
    }

    window.location.href = "patient-portal.html";
    return false;
}

async function handlePatientRegister(e) {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const fullName = document.getElementById("regFullName").value.trim();
    const age = parseInt(document.getElementById("regAge").value, 10) || 30;
    const gender = document.getElementById("regGender").value;
    const phone = document.getElementById("regPhone").value.trim();
    const allergies = document.getElementById("regAllergies").value.trim() || "No Known Allergies";
    const password = document.getElementById("regPassword").value || "123456";
    const errorEl = document.getElementById("registerErrorMsg");
    const submitBtn = document.querySelector("#patientRegisterForm button[type='submit']");

    if (!fullName || !phone) {
        if (errorEl) {
            errorEl.textContent = "कृपया नाम और मोबाइल नंबर अनिवार्य रूप से भरें।";
            errorEl.style.display = "block";
        }
        return;
    }

    if (errorEl) errorEl.style.display = "none";
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> खाता बन रहा है...';
    }

    let createdId = "";

    try {
        if (typeof ApiService !== "undefined") {
            const res = await ApiService.register({
                name: fullName,
                fullName: fullName,
                email: `${phone.replace(/\D/g, "")}@swasthai.local`,
                phone: phone,
                age: age,
                gender: gender,
                allergies: allergies,
                password: password,
                role: "patient"
            });

            if (res && res.token) {
                ApiService.setToken(res.token);
            }
            if (res && res.user && res.user.patientId) {
                createdId = res.user.patientId;
            }
        }
    } catch (apiErr) {
        console.warn("[PatientRegister] Backend register API warning, saving locally:", apiErr.message);
    }

    // Register patient into storage
    const newPatient = ClinicalStorage.addPatient({
        id: createdId || undefined,
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

    const activeId = createdId || newPatient.id;
    localStorage.setItem("swasthai_active_patient_id", activeId);
    localStorage.setItem("ayushActiveRole", "patient");

    alert(`पंजीकरण सफल!\n\nआपकी Patient ID: ${activeId}\nपासवर्ड: ${password}\n\nअब आप अपने स्वास्थ्य पोर्टल में प्रवेश कर रहे हैं।`);

    window.location.href = "patient-portal.html";
}
