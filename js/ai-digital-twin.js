/* ==========================================================================
   SwasthAI — AI Digital Twin Engine
   Priority-based patient health summary panel.
   Role-aware rendering: 'patient' (Hindi-friendly) | 'doctor' (clinical)
   
   Priority Levels:
     CRITICAL  (1) — Allergy alerts, active red flags, emergency signals
     URGENT    (2) — Chief complaint, pending meds, overdue follow-up
     IMPORTANT (3) — Chronic conditions, current meds, Prakriti
     INFO      (4) — Demographics, emergency contact, lifestyle
   ========================================================================== */

const DigitalTwin = (() => {

    // ── Red-flag symptom keywords ──────────────────────────────────────────
    const RED_FLAG_KEYWORDS = [
        "chest pain", "shortness of breath", "breathlessness",
        "difficulty breathing", "severe headache", "loss of consciousness",
        "sudden weakness", "paralysis", "seizure", "convulsion",
        "high fever", "tez bukhar", "chhati mein dard", "saans lene mein takleef",
        "unconscious", "blood vomiting", "khoon ulti", "severe bleeding",
        "vision loss", "stroke", "heart attack", "dil ka dora",
        "numbness", "confusion", "altered sensorium"
    ];

    // ── Chronic condition keywords ─────────────────────────────────────────
    const CHRONIC_KEYWORDS = [
        "hypertension", "bp", "blood pressure", "diabetes", "diabetic",
        "thyroid", "asthma", "copd", "arthritis", "kidney disease",
        "liver disease", "heart disease", "cancer", "epilepsy", "depression",
        "anxiety", "cholesterol", "obesity", "pcod", "pcos"
    ];

    // ── Texts by role & language ───────────────────────────────────────────
    const T = {
        patient: {
            panelTitle:        "🤖 आपका AI Digital Twin — आज की Health Summary",
            panelSub:          "यह आपकी सेहत की सबसे ज़रूरी जानकारी है, पहले पढ़ें",
            criticalLabel:     "🔴 तुरंत ध्यान दें",
            urgentLabel:       "🟠 आज के लिए ज़रूरी",
            importantLabel:    "🟡 जानना ज़रूरी है",
            infoLabel:         "🟢 आपकी जानकारी",
            allergyAlert:      (a) => `⚠️ एलर्जी चेतावनी: <strong>${a}</strong> — डॉक्टर को ज़रूर बताएं, कोई भी दवाई लेने से पहले`,
            noAllergy:         "✅ कोई ज्ञात दवाई एलर्जी नहीं — यह अच्छी बात है",
            unknownAllergy:    "⚠️ एलर्जी की जानकारी अज्ञात है — डॉक्टर से पूछें",
            redFlagFound:      (f) => `🚨 गंभीर लक्षण: <strong>${f}</strong> — तुरंत डॉक्टर को बताएं`,
            chiefComplaint:    (c) => `📋 आज की समस्या: <strong>${c}</strong>`,
            noComplaint:       "📋 अभी कोई नई समस्या दर्ज नहीं है",
            medication:        (m) => `💊 दवाइयां जो आप ले रहे हैं: <strong>${m}</strong>`,
            noMedication:      "💊 कोई नियमित दवाई नहीं",
            followupOverdue:   (d) => `📅 <strong>Follow-up बकाया है — ${d} दिन हो गए</strong>`,
            followupSoon:      (d) => `📅 Follow-up: ${d} दिनों में होना है`,
            conditions:        (c) => `🏥 पुरानी बीमारियां: <strong>${c}</strong>`,
            noConditions:      "🏥 कोई ज्ञात पुरानी बीमारी नहीं",
            prakriti:          (p) => `🌿 आपकी AYUSH प्रकृति: <strong>${p}</strong>`,
            noPrakriti:        "🌿 AYUSH प्रकृति का आकलन बाकी है",
            age:               (a, g) => `👤 उम्र / लिंग: <strong>${a} वर्ष / ${g === 'Male' ? 'पुरुष' : g === 'Female' ? 'महिला' : g}</strong>`,
            blood:             (b) => `🩸 ब्लड ग्रुप: <strong>${b}</strong>`,
            emergency:         (n, p) => `🆘 आपात संपर्क: <strong>${n}</strong> — ${p}`,
            lastVisit:         (d) => `📆 आखिरी डॉक्टर विज़िट: ${d} दिन पहले`,
            lastVisitNever:    "📆 अभी तक कोई डॉक्टर विज़िट दर्ज नहीं",
            poweredBy:         "AI Digital Twin · SwasthAI",
            updatedNow:        "अभी अपडेट हुआ",
        },
        doctor: {
            panelTitle:        "🤖 AI Digital Twin — Clinical Snapshot",
            panelSub:          "Priority-ranked signals · AI-assisted · Practitioner verification required",
            criticalLabel:     "🔴 CRITICAL",
            urgentLabel:       "🟠 URGENT",
            importantLabel:    "🟡 IMPORTANT",
            infoLabel:         "🟢 INFO",
            allergyAlert:      (a) => `⚠️ ALLERGY: <strong>${a}</strong> — Avoid related drug class, risk of anaphylaxis`,
            noAllergy:         "✅ NKDA — No Known Drug Allergies",
            unknownAllergy:    "⚠️ Allergy status UNKNOWN — Ask patient before prescribing",
            redFlagFound:      (f) => `🚨 RED FLAG: <strong>${f}</strong> — Rule out emergency etiology`,
            chiefComplaint:    (c) => `📋 Chief Complaint: <strong>${c}</strong>`,
            noComplaint:       "📋 No active complaint recorded for this visit",
            medication:        (m) => `💊 Current Medications: <strong>${m}</strong>`,
            noMedication:      "💊 No regular medications on record",
            followupOverdue:   (d) => `📅 <strong>Follow-up OVERDUE by ${d} days</strong> — Schedule immediately`,
            followupSoon:      (d) => `📅 Follow-up due in ${d} days`,
            conditions:        (c) => `🏥 Chronic Conditions: <strong>${c}</strong>`,
            noConditions:      "🏥 No known chronic conditions",
            prakriti:          (p) => `🌿 AYUSH Prakriti: <strong>${p}</strong>`,
            noPrakriti:        "🌿 Prakriti assessment not recorded",
            age:               (a, g) => `👤 Age / Gender: <strong>${a}y / ${g}</strong>`,
            blood:             (b) => `🩸 Blood Group: <strong>${b}</strong>`,
            emergency:         (n, p) => `🆘 Emergency Contact: <strong>${n}</strong> — ${p}`,
            lastVisit:         (d) => `📆 Last Visit: ${d} days ago`,
            lastVisitNever:    "📆 No prior visit on record",
            poweredBy:         "AI Digital Twin · SwasthAI Clinical",
            updatedNow:        "Live",
        }
    };

    // ══════════════════════════════════════════════════════════════════════
    //  PRIORITY ANALYSIS ENGINE
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Analyze patient + latest case data and return priority-sorted signals.
     * @param {object} patient  — from ClinicalStorage.getPatientById()
     * @param {object|null} latestCase — from ClinicalStorage, may be null
     * @returns {{ critical: Signal[], urgent: Signal[], important: Signal[], info: Signal[] }}
     */
    function analyze(patient, latestCase) {
        const signals = { critical: [], urgent: [], important: [], info: [] };

        if (!patient) return signals;

        // ── LEVEL 1: CRITICAL ──────────────────────────────────────────────

        // 1a. Allergy / Safety Alert
        const allergyStatus = (patient.allergyStatus || "").toLowerCase();
        const allergyText   = (patient.allergies || "").trim();
        if (allergyStatus === "known" && allergyText) {
            signals.critical.push({ type: "allergy", data: allergyText, priority: 1 });
        } else if (allergyStatus === "unknown") {
            signals.critical.push({ type: "allergy_unknown", priority: 2 });
        } else {
            signals.info.push({ type: "allergy_none", priority: 1 });
        }

        // 1b. Red Flags — from latest case symptoms / chief complaint
        if (latestCase) {
            const searchText = [
                latestCase.chiefComplaint || "",
                latestCase.symptoms || "",
                latestCase.patientNarrative || "",
                latestCase.additionalNotes || ""
            ].join(" ").toLowerCase();

            const foundFlags = RED_FLAG_KEYWORDS.filter(kw => searchText.includes(kw));
            if (foundFlags.length > 0) {
                // De-duplicate & title-case
                const unique = [...new Set(foundFlags)].map(f =>
                    f.replace(/\b\w/g, c => c.toUpperCase())
                );
                signals.critical.push({ type: "red_flag", data: unique.slice(0, 3).join(", "), priority: 3 });
            }
        }

        // ── LEVEL 2: URGENT ────────────────────────────────────────────────

        // 2a. Chief Complaint (current visit)
        if (latestCase && latestCase.chiefComplaint) {
            signals.urgent.push({ type: "chief_complaint", data: latestCase.chiefComplaint, priority: 1 });
        } else {
            signals.urgent.push({ type: "no_complaint", priority: 2 });
        }

        // 2b. Current Medications
        const meds = (patient.currentMedications || "").trim();
        if (meds && meds.toLowerCase() !== "none" && meds.toLowerCase() !== "none regular") {
            signals.urgent.push({ type: "medication", data: meds, priority: 3 });
        } else {
            signals.important.push({ type: "no_medication", priority: 3 });
        }

        // 2c. Follow-up status
        if (latestCase && latestCase.followupDate) {
            const today     = new Date();
            const followup  = new Date(latestCase.followupDate);
            const diffDays  = Math.round((followup - today) / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                // Overdue
                signals.urgent.push({ type: "followup_overdue", data: Math.abs(diffDays), priority: 2 });
            } else if (diffDays <= 7) {
                // Due soon
                signals.urgent.push({ type: "followup_soon", data: diffDays, priority: 4 });
            }
        }

        // 2d. Last visit (days since last case)
        if (latestCase && latestCase.createdAt) {
            const caseDate  = new Date(latestCase.createdAt);
            const today     = new Date();
            const diffDays  = Math.round((today - caseDate) / (1000 * 60 * 60 * 24));
            signals.urgent.push({ type: "last_visit", data: diffDays, priority: 5 });
        } else {
            signals.urgent.push({ type: "last_visit_never", priority: 6 });
        }

        // ── LEVEL 3: IMPORTANT ─────────────────────────────────────────────

        // 3a. Chronic conditions
        const conditions = (patient.conditions || "").trim();
        if (conditions) {
            signals.important.push({ type: "conditions", data: conditions, priority: 1 });
        } else {
            signals.important.push({ type: "no_conditions", priority: 2 });
        }

        // 3b. AYUSH Prakriti
        const prakriti = (patient.prakriti || "").trim();
        if (prakriti && prakriti.toLowerCase() !== "unknown") {
            signals.important.push({ type: "prakriti", data: prakriti, priority: 3 });
        } else {
            signals.important.push({ type: "no_prakriti", priority: 4 });
        }

        // ── LEVEL 4: INFO ──────────────────────────────────────────────────

        signals.info.push({ type: "age_gender", data: { age: patient.age, gender: patient.gender }, priority: 1 });

        if (patient.bloodGroup) {
            signals.info.push({ type: "blood", data: patient.bloodGroup, priority: 2 });
        }

        if (patient.emergencyName && patient.emergencyPhone) {
            signals.info.push({ type: "emergency", data: { name: patient.emergencyName, phone: patient.emergencyPhone }, priority: 3 });
        }

        return signals;
    }

    // ══════════════════════════════════════════════════════════════════════
    //  SIGNAL → HTML RENDERER
    // ══════════════════════════════════════════════════════════════════════

    function signalToHTML(signal, role) {
        const t = T[role];
        switch (signal.type) {
            case "allergy":         return t.allergyAlert(signal.data);
            case "allergy_unknown": return t.unknownAllergy;
            case "allergy_none":    return t.noAllergy;
            case "red_flag":        return t.redFlagFound(signal.data);
            case "chief_complaint": return t.chiefComplaint(signal.data);
            case "no_complaint":    return t.noComplaint;
            case "medication":      return t.medication(signal.data);
            case "no_medication":   return t.noMedication;
            case "followup_overdue":return t.followupOverdue(signal.data);
            case "followup_soon":   return t.followupSoon(signal.data);
            case "last_visit":      return t.lastVisit(signal.data);
            case "last_visit_never":return t.lastVisitNever;
            case "conditions":      return t.conditions(signal.data);
            case "no_conditions":   return t.noConditions;
            case "prakriti":        return t.prakriti(signal.data);
            case "no_prakriti":     return t.noPrakriti;
            case "age_gender":      return t.age(signal.data.age, signal.data.gender);
            case "blood":           return t.blood(signal.data);
            case "emergency":       return t.emergency(signal.data.name, signal.data.phone);
            default:                return "";
        }
    }

    // ══════════════════════════════════════════════════════════════════════
    //  PANEL HTML BUILDER
    // ══════════════════════════════════════════════════════════════════════

    function buildPanelHTML(signals, patient, role) {
        const t   = T[role];
        const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

        // Helper to build a band
        function band(levelKey, labelText, cssClass) {
            const items = signals[levelKey];
            if (!items || items.length === 0) return "";
            const rows = items.map(s => {
                const html = signalToHTML(s, role);
                if (!html) return "";
                return `<div class="dt-signal-row dt-signal-${levelKey}">${html}</div>`;
            }).join("");
            if (!rows.trim()) return "";
            return `
                <div class="dt-band dt-band-${levelKey}">
                    <span class="dt-band-label">${labelText}</span>
                    <div class="dt-band-rows">${rows}</div>
                </div>`;
        }

        const initials = (patient.fullName || "P").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

        const criticalBand  = band("critical",  t.criticalLabel,  "critical");
        const urgentBand    = band("urgent",    t.urgentLabel,    "urgent");
        const importantBand = band("important", t.importantLabel, "important");
        const infoBand      = band("info",      t.infoLabel,      "info");

        const hasCritical = signals.critical.length > 0;

        return `
<div class="dt-panel dt-role-${role} ${hasCritical ? 'dt-has-critical' : ''}" id="dtMainPanel">
    <div class="dt-panel-header">
        <div class="dt-header-left">
            <div class="dt-avatar" aria-hidden="true">${initials}</div>
            <div>
                <h3 class="dt-title">${t.panelTitle}</h3>
                <p class="dt-subtitle">${patient.fullName} &nbsp;·&nbsp; ID: ${patient.id}</p>
            </div>
        </div>
        <div class="dt-header-right">
            <span class="dt-live-badge">
                <span class="dt-live-dot"></span>
                ${t.updatedNow} · ${now}
            </span>
            <button class="dt-collapse-btn" id="dtCollapseBtn" title="Collapse / Expand" aria-expanded="true">
                <i class="fa-solid fa-chevron-up"></i>
            </button>
        </div>
    </div>

    <div class="dt-panel-body" id="dtPanelBody">
        <p class="dt-panel-sub">${t.panelSub}</p>
        ${criticalBand}
        ${urgentBand}
        ${importantBand}
        ${infoBand}
        <div class="dt-powered-by">${t.poweredBy} &nbsp;·&nbsp; <i class="fa-solid fa-brain"></i> Rule-based priority engine</div>
    </div>
</div>`;
    }

    // ══════════════════════════════════════════════════════════════════════
    //  PUBLIC API: renderPanel(containerId, role)
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Render the Digital Twin panel into a container element.
     * @param {string} containerId  — id of the element to inject into
     * @param {'patient'|'doctor'} role
     * @param {string|null} patientId  — override, else reads localStorage
     * @param {string|null} caseId     — override, else picks latest case
     */
    function renderPanel(containerId, role, patientId, caseId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Load patient
        let resolvedPatientId = patientId || localStorage.getItem("swasthai_active_patient_id");

        let patient = null;
        if (typeof ClinicalStorage !== "undefined") {
            if (resolvedPatientId) {
                patient = ClinicalStorage.getPatientById(resolvedPatientId);
            }
            if (!patient) {
                patient = (ClinicalStorage.getPatients() || [])[0];
            }
        }

        if (patient) {
            localStorage.setItem("swasthai_active_patient_id", patient.id);
        } else {
            container.innerHTML = "";
            return;
        }

        // Load latest case
        let latestCase = null;
        if (typeof ClinicalStorage !== "undefined") {
            if (caseId) {
                latestCase = ClinicalStorage.getCaseById(caseId);
            } else {
                const allCases = (ClinicalStorage.getCases() || [])
                    .filter(c => c.patientId === patient.id)
                    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                latestCase = allCases[0] || null;
            }
        }

        // Build signals & HTML
        const signals = analyze(patient, latestCase);
        container.innerHTML = buildPanelHTML(signals, patient, role);

        // Wire up collapse button
        const collapseBtn = document.getElementById("dtCollapseBtn");
        const panelBody   = document.getElementById("dtPanelBody");
        if (collapseBtn && panelBody) {
            collapseBtn.addEventListener("click", () => {
                const isOpen = panelBody.style.display !== "none";
                panelBody.style.display = isOpen ? "none" : "";
                collapseBtn.setAttribute("aria-expanded", String(!isOpen));
                const icon = collapseBtn.querySelector("i");
                if (icon) {
                    icon.className = isOpen ? "fa-solid fa-chevron-down" : "fa-solid fa-chevron-up";
                }
            });
        }
    }

    // Public API
    return { renderPanel, analyze };

})();
