/* ==========================================================================
   SwasthAI / SWASTHAI — Unified Frontend API Client Layer
   Provides standardized REST client methods, token injection, error handling,
   and graceful offline fallback.
   ========================================================================== */

const ApiService = (() => {
    // Determine Base URL dynamically (supports localhost, 127.0.0.1, and direct file:/// opening)
    const isLocalhost = window.location.hostname === "localhost" ||
                        window.location.hostname === "127.0.0.1" ||
                        window.location.protocol === "file:" ||
                        !window.location.hostname;
    const API_BASE_URL = window.SWASTHAI_API_URL || (isLocalhost ? "http://localhost:5000/api" : "/api");
    const AUTH_TOKEN_KEY = "swasthai_jwt_token";

    function getToken() {
        return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY) || "";
    }

    function setToken(token, persist = true) {
        if (token) {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            if (!persist) sessionStorage.setItem(AUTH_TOKEN_KEY, token);
        } else {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            sessionStorage.removeItem(AUTH_TOKEN_KEY);
        }
    }

    function removeToken() {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
    }

    async function request(endpoint, options = {}) {
        const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
        const headers = {
            "Content-Type": "application/json",
            ...options.headers
        };

        const token = getToken();
        if (token && !headers["Authorization"]) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // 3.5s timeout controller to prevent hanging if backend or DB is slow/offline
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || 3500);

        const config = {
            method: options.method || "GET",
            headers,
            signal: controller.signal,
            ...options
        };

        if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            // Handle 401 Unauthorized
            if (response.status === 401) {
                console.warn(`[ApiService] 401 Unauthorized on ${endpoint}`);
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errorMsg = data.message || data.error || `HTTP error ${response.status}`;
                const err = new Error(errorMsg);
                err.status = response.status;
                err.data = data;
                throw err;
            }

            return data;
        } catch (error) {
            // Network or CORS error
            if (!error.status) {
                console.warn(`[ApiService] Network/Connection error on ${url}:`, error.message);
                error.isNetworkError = true;
            }
            throw error;
        }
    }

    async function get(endpoint, params = {}) {
        let url = endpoint;
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") {
                query.append(key, val);
            }
        });
        const qs = query.toString();
        if (qs) {
            url += (url.includes("?") ? "&" : "?") + qs;
        }
        return request(url, { method: "GET" });
    }

    async function post(endpoint, body = {}) {
        return request(endpoint, { method: "POST", body });
    }

    async function put(endpoint, body = {}) {
        return request(endpoint, { method: "PUT", body });
    }

    async function del(endpoint) {
        return request(endpoint, { method: "DELETE" });
    }

    async function upload(endpoint, formData) {
        const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
        const headers = {};
        const token = getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: formData
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const err = new Error(data.message || data.error || `Upload failed (${response.status})`);
            err.status = response.status;
            err.data = data;
            throw err;
        }
        return data;
    }

    return {
        API_BASE_URL,
        getToken,
        setToken,
        removeToken,
        request,
        get,
        post,
        put,
        delete: del,
        upload,

        // Auth APIs
        login: (credentials) => post("/auth/login", credentials),
        register: (userData) => post("/auth/register", userData),
        logout: () => post("/auth/logout"),
        getMe: () => get("/auth/me"),

        // Patient APIs
        getPatients: (params) => get("/patients", params),
        getPatientById: (id) => get(`/patients/${id}`),
        getPatientDossier: (id) => get(`/patients/${id}/dossier`),
        createPatient: (patientData) => post("/patients", patientData),
        updatePatient: (id, data) => put(`/patients/${id}`, data),
        deletePatient: (id) => del(`/patients/${id}`),
        addReportedDisease: (patientId, diseaseData) => post(`/patients/${patientId}/diseases`, diseaseData),
        addPastDoctorRecord: (patientId, recordData) => post(`/patients/${patientId}/past-records`, recordData),

        // Case APIs
        getCases: (params) => get("/cases", params),
        getCaseById: (id) => get(`/cases/${id}`),
        createCase: (caseData) => post("/cases", caseData),
        updateCase: (id, data) => put(`/cases/${id}`, data),
        getCaseReview: (caseId) => get(`/cases/${caseId}/review`),
        updateVerification: (caseId, verificationData) => put(`/cases/${caseId}/verification`, verificationData),
        addClinicalNotes: (caseId, noteData) => post(`/cases/${caseId}/notes`, noteData),
        finalizeCase: (caseId) => post(`/cases/${caseId}/finalize`),
        addTimelineEvent: (caseId, eventData) => post(`/cases/${caseId}/timeline`, eventData),
        scheduleFollowup: (caseId, followupData) => post(`/cases/${caseId}/followup`, followupData),

        // Prescription APIs
        createPrescription: (rxData) => post("/prescriptions", rxData),
        getPrescriptionsForPatient: (patientId) => get(`/prescriptions/patient/${patientId}`),
        getPrescriptionById: (id) => get(`/prescriptions/${id}`),

        // Consultation APIs
        getConsultations: (params) => get("/consultations", params),
        getConsultationById: (id) => get(`/consultations/${id}`),
        saveConsultation: (consultationData) => post("/consultations", consultationData),

        // Health Reading APIs
        getHealthReadings: (patientId, params) => get(`/health-readings/${patientId}`, params),
        saveHealthReading: (readingData) => post("/health-readings", readingData),
        updateHealthReading: (id, data) => put(`/health-readings/${id}`, data),
        deleteHealthReading: (id) => del(`/health-readings/${id}`),
        getHealthSummary: (patientId) => get(`/health-readings/summary/${patientId}`),
        getHealthTrends: (patientId, params) => get(`/health-readings/trends/${patientId}`, params),

        // Report APIs
        uploadReport: (formData) => upload("/reports/upload", formData),
        getReports: (patientId) => get(`/reports/patient/${patientId}`),
        getReportById: (id) => get(`/reports/${id}`),
        deleteReport: (id) => del(`/reports/${id}`),
        getReportDownloadUrl: (reportId) => `${API_BASE_URL}/reports/download/${reportId}`,

        // Analytics APIs
        getDashboardMetrics: () => get("/analytics/dashboard"),
        getAnalyticsOverview: () => get("/analytics/overview"),
        getAiInsights: () => get("/analytics/insights"),

        // AI APIs
        analyzeCaseAI: (caseData) => post("/ai/analyze-case", caseData),
        generateSummaryAI: (data) => post("/ai/generate-summary", data),
        suggestQuestionsAI: (data) => post("/ai/suggest-questions", data),
        assistantChatAI: (data) => post("/ai/assistant", data),
        generateConsultationNotesAI: (data) => post("/ai/consultation-notes", data),

        // Audit APIs
        getAuditLogs: (params) => get("/audit", params),
        logAudit: (auditData) => post("/audit", auditData)
    };
})();
