/**
 * SWASTHAI AI Service Layer
 * Wraps external AI provider calls with graceful fallback.
 * If AI_API_KEY is missing, returns structured rule-based responses.
 * 
 * IMPORTANT: AI output is clinical decision SUPPORT only.
 * It is NOT an autonomous medical diagnosis.
 */

const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || "gemini-1.5-flash";
const AI_PROVIDER = process.env.AI_PROVIDER || "gemini"; // gemini | openai | disabled

const hasAiKey = !!(AI_API_KEY && AI_API_KEY.trim().length > 8);

if (!hasAiKey) {
    console.info("ℹ️  [AI Service] No AI_API_KEY configured — AI endpoints will use rule-based fallback responses. This is safe for demo mode.");
}

/**
 * Generate a structured consultation summary.
 * Tries AI first, falls back to rule-based template.
 */
async function generateConsultationSummary({ patientInfo, chiefComplaint, symptoms, notes, vitals }) {
    if (hasAiKey) {
        try {
            return await _callGeminiAPI({
                prompt: `You are a clinical documentation assistant for AYUSH healthcare. 
Generate a structured SOAP-format consultation note based on:
Patient: ${patientInfo?.fullName || 'Patient'}, Age: ${patientInfo?.age || 'N/A'}, Gender: ${patientInfo?.gender || 'N/A'}
Chief Complaint: ${chiefComplaint || 'Not specified'}
Symptoms: ${(symptoms || []).join(', ')}
Vitals: ${JSON.stringify(vitals || {})}
Doctor Notes: ${notes || 'None'}

Return ONLY valid JSON with fields: { subjective, objective, assessment, plan, disclaimer }
disclaimer must be: "AI-generated draft — doctor review and verification required before clinical use."`,
                maxTokens: 800
            });
        } catch (err) {
            console.warn("[AI Service] Gemini API call failed, using fallback:", err.message);
        }
    }

    // Rule-based fallback
    return {
        subjective: `Patient presents with: ${chiefComplaint || 'unspecified complaint'}. ${symptoms?.length > 0 ? 'Symptoms: ' + symptoms.join(', ') + '.' : ''}`,
        objective: vitals ? `Vitals recorded: BP ${vitals.bp || 'N/A'}, HR ${vitals.heartRate || 'N/A'} bpm, SpO2 ${vitals.spo2 || 'N/A'}%, Temp ${vitals.temperature || 'N/A'}°F.` : 'Vitals not recorded.',
        assessment: `Clinical assessment pending practitioner review. ${notes || ''}`,
        plan: "Doctor to verify and complete clinical management plan, investigations, and prescriptions.",
        disclaimer: "AI-generated draft — doctor review and verification required before clinical use."
    };
}

/**
 * Analyze a clinical case for red flags, allergy conflicts, missing info.
 * Returns structured analysis — STRICTLY for practitioner review.
 */
async function analyzeClinicalCase({ chiefComplaint, symptoms, history, medications, allergies, prakriti, duration, severity }) {
    const RED_FLAGS = [
        { pattern: /thunderclap|worst headache|sudden severe headache|behoshi|unconscious|paralysis/i, flag: "Critical Neurological Sign — Rule out Subarachnoid Hemorrhage or Stroke", severity: "CRITICAL", action: "Urgent emergency referral & brain neuroimaging required immediately." },
        { pattern: /chest pain|chhati me dard|shortness of breath|saans lene me taklif|pain radiating to arm|jaw pain/i, flag: "Suspected Acute Coronary Syndrome / Angina", severity: "CRITICAL", action: "Immediate ECG, cardiac enzymes, and emergency triage required." },
        { pattern: /khoon ki ulti|vomiting blood|black stool|kala latrine|hematemesis|melena/i, flag: "Upper Gastrointestinal Bleed", severity: "HIGH", action: "Urgent gastroenterology evaluation and stabilization." },
        { pattern: /rigid abdomen|board like abdomen|severe rebound tenderness/i, flag: "Acute Peritoneal Sign — Rule out Perforation", severity: "CRITICAL", action: "Immediate surgical consult." }
    ];

    const ALLERGY_DRUG_MAP = {
        penicillin: ["Amoxicillin", "Ampicillin", "Augmentin", "Penicillin V", "Piperacillin"],
        sulfa: ["Sulfamethoxazole", "Bactrim", "Septra", "Sulfasalazine"],
        aspirin: ["Aspirin", "Disprin", "Ecosprin", "Ibuprofen", "Brufen", "Diclofenac", "Combiflam"]
    };

    const textToScan = `${chiefComplaint || ""} ${(symptoms || []).join(" ")} ${JSON.stringify(history || {})}`;

    // 1. Red Flags
    const detectedRedFlags = RED_FLAGS.filter(r => r.pattern.test(textToScan)).map(r => ({
        flag: r.flag, severity: r.severity, action: r.action, trigger: chiefComplaint || "Reported symptoms"
    }));

    // 2. Allergy conflicts
    const allergyConflicts = [];
    const allergyStr = (Array.isArray(allergies) ? allergies.join(" ") : (allergies || "")).toLowerCase();
    (medications || []).forEach(med => {
        const medName = (typeof med === "string" ? med : (med.name || "")).toLowerCase();
        for (const [allergen, drugs] of Object.entries(ALLERGY_DRUG_MAP)) {
            if (allergyStr.includes(allergen)) {
                drugs.forEach(d => {
                    if (medName.includes(d.toLowerCase())) {
                        allergyConflicts.push({
                            allergen: allergen.toUpperCase(),
                            conflictingMedicine: med.name || med,
                            warning: `Patient has documented allergy to ${allergen}. Prescribing ${med.name || med} may cause adverse hypersensitivity reaction.`
                        });
                    }
                });
            }
        }
    });

    // 3. Missing info
    const missingInfo = [];
    if (!duration) missingInfo.push({ field: "duration", question: "How long have you had these symptoms?" });
    if (!severity) missingInfo.push({ field: "severity", question: "On a scale of 1 to 10, how intense is the discomfort?" });
    if (!allergies || allergies.length === 0) missingInfo.push({ field: "allergies", question: "Do you have any known drug or food allergies?" });

    // 4. Dosha assessment
    let primaryDosha = prakriti || "Pitta-Vata";
    if (/acidity|burning|pitta|fever|inflammation/i.test(textToScan)) primaryDosha = "Pitta";
    else if (/pain|gas|bloating|constipation|joint|shirashoola/i.test(textToScan)) primaryDosha = "Vata";
    else if (/cough|congestion|heavy|swelling|weight/i.test(textToScan)) primaryDosha = "Kapha";

    const summary = `Patient presents with ${chiefComplaint || 'health concerns'}${duration ? ' lasting for ' + duration : ''}. Clinical presentation is consistent with ${primaryDosha} dosha involvement.`;

    return {
        summary,
        primaryDosha,
        redFlags: detectedRedFlags,
        allergyConflicts,
        missingInformation: missingInfo,
        normalizedSymptoms: symptoms || [chiefComplaint],
        aiDisclaimer: "Clinical Decision Support Only — Not an autonomous medical diagnosis. Practitioner verification required.",
        mode: hasAiKey ? "ai" : "rule-based"
    };
}

/**
 * AI Assistant chat response
 */
async function assistantChat({ message, patientContext }) {
    const userQuery = (message || "").toLowerCase();
    let reply = "";
    let suggestions = [];

    if (hasAiKey) {
        try {
            const contextStr = patientContext
                ? `Patient: ${patientContext.fullName}, Age: ${patientContext.age}, Conditions: ${patientContext.conditions}, Allergies: ${patientContext.allergies}`
                : "No specific patient context.";
            const result = await _callGeminiAPI({
                prompt: `You are SWASTHAI Clinical Decision Support AI. You assist AYUSH practitioners with clinical queries.
Patient Context: ${contextStr}
Practitioner Query: ${message}
Respond in under 150 words. Include a disclaimer that this is clinical support, not autonomous diagnosis.`,
                maxTokens: 300
            });
            if (typeof result === "string") {
                reply = result;
            } else {
                reply = result.text || result.reply || JSON.stringify(result);
            }
            return { reply, suggestions, mode: "ai", disclaimer: "AI-generated clinical support. Practitioner judgment is sovereign." };
        } catch (err) {
            console.warn("[AI Service] Assistant chat API failed, using fallback:", err.message);
        }
    }

    // Rule-based fallback
    if (userQuery.includes("headache") || userQuery.includes("sir dard")) {
        reply = "Headache in AYUSH is categorized as Shirashoola. If accompanied by photophobia and nausea, assess for Ardhavabhedaka (Migraine / Pitta-Vata). Red flag: Sudden severe 'thunderclap' headache warrants urgent non-contrast CT head.";
        suggestions = ["Assess cranial nerve reflexes", "Check blood pressure", "Review sleep hours & screen time"];
    } else if (userQuery.includes("acidity") || userQuery.includes("stomach")) {
        reply = "Upper abdominal discomfort with post-prandial burning suggests Amlapitta (Hyperacidity / GERD). Protocol: Sutshekhar Ras (125mg BD), Avipattikar Churna (3g at bedtime) with lifestyle modification.";
        suggestions = ["Check for nocturnal reflux", "Ask about NSAID usage", "Recommend alkaline diet"];
    } else if (userQuery.includes("bp") || userQuery.includes("blood pressure")) {
        reply = "Elevated blood pressure (Rakta Vata) requires continuous monitoring. Ensure compliance with prescribed antihypertensives. AYUSH adjuncts: Sarpagandha Vati and Brahmi Vati under strict supervision.";
        suggestions = ["Log daily BP morning & night", "Restrict dietary sodium <2g/day", "Perform 15 min Anulom Vilom"];
    } else {
        reply = `Clinical Decision Support for: "${message}". Verify all red flags are cleared and medication dosages match the treatment protocol for ${patientContext ? patientContext.fullName : 'the patient'}.`;
        suggestions = ["Verify vital trends", "Check drug-herb interactions", "Review patient allergy history"];
    }

    return { reply, suggestions, mode: "rule-based", disclaimer: "Rule-based clinical support. Practitioner judgment is sovereign." };
}

/**
 * Internal: Call Google Gemini API
 */
async function _callGeminiAPI({ prompt, maxTokens = 500 }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${AI_API_KEY}`;
    
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 }
        }),
        signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${errBody.slice(0, 200)}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from Gemini API");

    // Try to parse JSON if the prompt asked for it
    try {
        return JSON.parse(text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
    } catch {
        return text;
    }
}

module.exports = {
    hasAiKey,
    generateConsultationSummary,
    analyzeClinicalCase,
    assistantChat
};
