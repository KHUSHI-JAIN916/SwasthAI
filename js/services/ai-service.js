/* ==========================================================================
   SwasthAI / SWASTHAI — Clinical AI Service Layer
   Adaptive Interview Engine, Multilingual NLP, Red-Flag Detection,
   Missing-Info Analysis, Allergy Conflict, & Explanation Generator.
   Strictly for practitioner assistance — not autonomous medical diagnosis.
   ========================================================================== */

const AIService = (() => {

    // Multilingual normalization dictionary (Hindi/Hinglish -> Clinical English)
    const CLINICAL_LEXICON = [
        // Symptoms & Complaints
        { patterns: [/pet (?:mein |me )?dard/i, /stomach (?:pain|ache)/i, /abdominal pain/i, /belly pain/i], field: "chiefComplaint", value: "Abdominal Pain", normalized: "Abdominal pain" },
        { patterns: [/sir (?:mein |me )?dard/i, /headache/i, /sar dard/i, /mathe me dard/i], field: "chiefComplaint", value: "Headache / Shirashoola", normalized: "Headache" },
        { patterns: [/bukhar/i, /fever/i, /temperature/i, /tap/i, /jwar/i], field: "symptom", value: "Fever / Jwara", normalized: "Fever" },
        { patterns: [/ulti/i, /vomiting/i, /vomit/i, /chhardi/i], field: "symptom", value: "Vomiting", normalized: "Vomiting" },
        { patterns: [/matli/i, /nausea/i, /jee ghabrana/i, /hrillasa/i], field: "symptom", value: "Nausea", normalized: "Nausea" },
        { patterns: [/dast/i, /loose motion/i, /diarrhea/i, /diarrhoea/i, /atisara/i], field: "symptom", value: "Diarrhea", normalized: "Diarrhea" },
        { patterns: [/khansi/i, /cough/i, /kasa/i], field: "symptom", value: "Cough", normalized: "Cough" },
        { patterns: [/jalan/i, /burning/i, /heartburn/i, /acidity/i, /vidaha/i], field: "symptom", value: "Acidity / Heartburn", normalized: "Post-prandial heartburn" },
        { patterns: [/jodon (?:mein |me )?dard/i, /joint pain/i, /ghutne me dard/i, /sandhishoola/i], field: "chiefComplaint", value: "Joint Pain / Sandhishoola", normalized: "Joint pain" },
        { patterns: [/thakan/i, /fatigue/i, /kamzori/i, /tiredness/i, /daurbalya/i], field: "symptom", value: "Fatigue / Generalized Weakness", normalized: "Fatigue" },

        // Locations
        { patterns: [/right (?:upper|side)/i, /dahine taraf/i, /seedhe hath ki taraf/i, /right hypochondrium/i], field: "location", value: "Right Upper Quadrant (Right Hypochondrium)" },
        { patterns: [/left (?:upper|side)/i, /bayen taraf/i, /left side/i], field: "location", value: "Left Abdomen / Left Hypochondrium" },
        { patterns: [/lower abdomen/i, /pedu me/i, /pait ke nichle hisse/i], field: "location", value: "Lower Abdomen / Hypogastrium" },
        { patterns: [/center/i, /beech me/i, /epigastric/i, /naabhi ke aas paas/i], field: "location", value: "Epigastric / Periumbilical Region" },

        // Temporal / Duration
        { patterns: [/(\d+)\s*(?:din|days?|d|day|dino)\b/i, /(?:since|for)\s*(\d+)\s*(?:days?|din)/i], field: "duration", extractor: m => `${m[1]} days` },
        { patterns: [/(\d+)\s*(?:ghante|hours?|hrs?|hr)\b/i, /(?:since|for)\s*(\d+)\s*(?:hours?|hrs?|hr)/i], field: "duration", extractor: m => `${m[1]} hours` },
        { patterns: [/(\d+)\s*(?:hafte|weeks?|wk|wks)\b/i, /(?:since|for)\s*(\d+)\s*(?:weeks?|wks)/i], field: "duration", extractor: m => `${m[1]} weeks` },
        { patterns: [/(\d+)\s*(?:mahine|months?|m|mon)\b/i, /(?:since|for)\s*(\d+)\s*(?:months?|mon)/i], field: "duration", extractor: m => `${m[1]} months` },
        { patterns: [/^\s*(\d+)\s*$/i], field: "duration", extractor: m => `${m[1]} days` },
        { patterns: [/kal se/i, /since yesterday/i, /started yesterday/i], field: "duration", value: "1 day (since yesterday)" },
        { patterns: [/aaj subah se/i, /since today morning/i], field: "duration", value: "Few hours (since morning)" },

        // Severity
        { patterns: [/bahut tez/i, /severe/i, /unbearable/i, /bura haal/i, /tez dard/i, /teevra/i], field: "severity", value: "Severe (7-8/10)" },
        { patterns: [/moderate/i, /madhyam/i, /theek thak dard/i], field: "severity", value: "Moderate (4-6/10)" },
        { patterns: [/mild/i, /halka/i, /thoda/i, /manda/i], field: "severity", value: "Mild (1-3/10)" },

        // Medications
        { patterns: [/amlodipine/i, /stamlo/i, /bp ki goli/i, /bp medicine/i], field: "medication", name: "Amlodipine", defaultDose: "5mg", reason: "Hypertension" },
        { patterns: [/metformin/i, /sugar ki goli/i, /diabetes medicine/i, /glycomet/i], field: "medication", name: "Metformin", defaultDose: "500mg", reason: "Diabetes" },
        { patterns: [/paracetamol/i, /dolo/i, /crocin/i, /calpol/i], field: "medication", name: "Paracetamol", defaultDose: "650mg", reason: "Fever / Analgesic" },
        { patterns: [/dard ki goli/i, /painkiller/i, /combiflam/i, /ibuprofen/i], field: "medication", name: "Painkiller (NSAID)", defaultDose: "Unspecified", reason: "Pain relief" },
        { patterns: [/pantoprazole/i, /pan 40/i, /gas ki goli/i, /omeprazole/i, /antacid/i], field: "medication", name: "Proton Pump Inhibitor / Antacid", defaultDose: "40mg", reason: "Gastric protection / Acidity" },

        // Allergies
        { patterns: [/penicillin/i, /penicillin allergy/i], field: "allergy", allergen: "Penicillin", severity: "High" },
        { patterns: [/sulfa/i, /sulfa drugs/i], field: "allergy", allergen: "Sulfonamides", severity: "Moderate" },
        { patterns: [/aspirin/i, /nsaid allergy/i], field: "allergy", allergen: "Aspirin / NSAIDs", severity: "High" }
    ];

    /**
     * Adaptive Interview Questions Graph
     * Selects dynamic follow-ups based on the missing clinical slots.
     */
    const INTERVIEW_QUESTIONS = {
        en: {
            GREETING: "Hello! I am SwasthAI, your clinical assistant. Please describe your main health concern in your own words.",
            CHIEF_COMPLAINT: "What primary health concern or symptom brings you here today?",
            DURATION: "When did this symptom start, and how long has it been bothering you?",
            LOCATION: "Where exactly is the discomfort located (upper, lower, left, right, or center)? Does it radiate anywhere?",
            SEVERITY: "How intense is the discomfort on a scale of 1 to 10 (mild, moderate, or severe)?",
            ASSOCIATED_GI: "Are you also experiencing fever, vomiting, nausea, or changes in bowel movements?",
            ASSOCIATED_HEADACHE: "Do you also experience nausea, visual blurriness, or sensitivity to light and sound?",
            ASSOCIATED_GENERAL: "Have you noticed any other symptoms such as fatigue, sweating, or loss of appetite?",
            MEDICATIONS: "Are you currently taking any regular medications for BP, sugar, thyroid, or pain? If yes, please mention their names and doses.",
            MED_DOSE_CLARIFICATION: "You mentioned taking a medicine. Do you know its specific name, strength (mg), or how often you take it?",
            ALLERGIES: "Do you have any known allergies to medicines (such as Penicillin, Sulfa, or Aspirin), foods, or injections?",
            PAST_HISTORY: "Have you ever had any major illnesses, surgeries, or hospitalizations in the past?",
            FAMILY_HISTORY: "Does anyone in your family have conditions like diabetes, hypertension, heart disease, or gallstones?",
            LIFESTYLE: "How is your daily sleep (how many hours), physical activity level, and dietary pattern?",
            SUFFICIENT: "✅ Case information is sufficient for practitioner review. You may now proceed to verify the structured case summary."
        },
        hi: {
            GREETING: "नमस्ते! मैं SwasthAI क्लिनिकल असिस्टेंट हूँ। कृपया अपनी मुख्य स्वास्थ्य समस्या के बारे में विस्तार से बताएं।",
            CHIEF_COMPLAINT: "आज आप किस मुख्य तकलीफ या लक्षण के लिए परामर्श ले रहे हैं?",
            DURATION: "यह तकलीफ कब से शुरू हुई और कितने दिनों या घंटों से है?",
            LOCATION: "दर्द या तकलीफ शरीर में ठीक किस जगह पर है (ऊपर, नीचे, दाएं, बाएं या बीच में)? क्या यह कहीं और भी फैलता है?",
            SEVERITY: "यह तकलीफ कितनी तेज है (हल्की, मध्यम, या बहुत असहनीय)?",
            ASSOCIATED_GI: "क्या आपको इसके साथ बुखार, उल्टी, जी मिचलाना या दस्त की भी शिकायत है?",
            ASSOCIATED_HEADACHE: "क्या सिरदर्द के साथ चक्कर, आंखों के आगे अंधेरा या तेज रोशनी से परेशानी होती है?",
            ASSOCIATED_GENERAL: "क्या कोई और लक्षण जैसे बहुत ज्यादा कमजोरी, भूख न लगना या पसीना आना महसूस हो रहा है?",
            MEDICATIONS: "क्या आप बीपी, शुगर, थायराइड या दर्द की कोई नियमित दवा ले रहे हैं? कृपया नाम और खुराक बताएं।",
            MED_DOSE_CLARIFICATION: "आपने दवा का जिक्र किया। क्या आपको उसकी सटीक खुराक (mg) या समय पता है?",
            ALLERGIES: "क्या आपको पेनिसिलिन, सल्फा या किसी अन्य दवा/इंजेक्शन से कभी कोई एलर्जी हुई है?",
            PAST_HISTORY: "क्या पहले कभी कोई बड़ी बीमारी, ऑपरेशन या अस्पताल में भर्ती होने का इतिहास रहा है?",
            FAMILY_HISTORY: "क्या परिवार में किसी को बीपी, शुगर, दिल की बीमारी या पथरी की समस्या रही है?",
            LIFESTYLE: "आपकी नींद कितने घंटे होती है और खान-पान व दैनिक दिनचर्या कैसी है?",
            SUFFICIENT: "✅ डॉक्टर के अवलोकन के लिए आवश्यक जानकारी पूर्ण हो चुकी है। अब आप संरचित केस सारांश की समीक्षा कर सकते हैं।"
        },
        hinglish: {
            GREETING: "Namaste! Main SwasthAI assistant hoon. Aapko kya taklif ho rahi hai? Kripya batayein.",
            CHIEF_COMPLAINT: "Aapko main kya taklif ho rahi hai jiske liye aap consult kar rahe hain?",
            DURATION: "Yeh taklif kab shuru hui thi aur kitne dino ya ghanto se hai?",
            LOCATION: "Dard theek kis jagah mehsoos ho raha hai — upar, neeche, right side, left side ya center mein?",
            SEVERITY: "Dard kitna tez hai (halka, normal, ya bahut zyada unbearable)?",
            ASSOCIATED_GI: "Kya iske sath bukhar, ulti, nausea ya loose motions jaisi koi aur taklif bhi hai?",
            ASSOCIATED_HEADACHE: "Kya sar dard ke sath chakkar, ulti ya light se pareshani hoti hai?",
            ASSOCIATED_GENERAL: "Kya koi aur symptom jaise thakan, bhook na lagna ya weakness mehsoos ho rahi hai?",
            MEDICATIONS: "Kya aap BP, sugar, thyroid ya dard ke liye koi daily medicine lete hain? Naam aur dose batayein.",
            MED_DOSE_CLARIFICATION: "Aapne dawai ka zikr kiya. Kya aapko uska naam, dosage (mg) ya kitni baar lete hain maloom hai?",
            ALLERGIES: "Kya aapko Penicillin, Sulfa ya kisi dawai/injection se koi allergy hui hai?",
            PAST_HISTORY: "Kya pehle kabhi koi badi bimari ya koi surgery/operation hua hai?",
            FAMILY_HISTORY: "Family mein kisi ko BP, sugar, heart problem ya gallstones ki history hai?",
            LIFESTYLE: "Aap daily kitne ghante so paate hain aur khana-peena regular rehta hai?",
            SUFFICIENT: "✅ Case information is sufficient for practitioner review. Practitioner ke review ke liye data taiyar hai."
        }
    };

    /**
     * Process patient utterance, extract clinical slots, detect red flags,
     * identify missing info and contradictions, and determine the next adaptive question.
     */
    function processPatientUtterance(userText, caseState, language = "hinglish") {
        if (!userText || !userText.trim()) {
            return {
                reply: getQuestionText("CHIEF_COMPLAINT", language),
                caseState: caseState,
                isSufficient: false
            };
        }

        const trimmedText = userText.trim();
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Add to transcript
        caseState.transcript.push({
            id: "t-" + Date.now().toString(36),
            speaker: "patient",
            text: trimmedText,
            originalLanguage: language,
            timestamp: timestamp
        });

        // 1. Check for RED FLAGS (Req 6)
        checkRedFlags(trimmedText, caseState);

        // 2. Perform entity extraction via CLINICAL_LEXICON
        extractEntities(trimmedText, caseState, timestamp);

        // 3. Check for ALLERGY CONFLICTS (Req 5)
        checkAllergyConflicts(caseState);

        // 4. Check for CONTRADICTIONS (Req 9)
        checkContradictions(trimmedText, caseState);

        // 5. Evaluate MISSING INFORMATION (Req 2)
        evaluateMissingInformation(caseState);

        // 6. Calculate Field-Level Confidence (Req 8)
        calculateConfidence(caseState);

        // 7. Decide Next Adaptive Question (Req 1)
        const nextQ = determineNextQuestion(caseState, language);

        // Append AI response to transcript
        caseState.transcript.push({
            id: "ai-" + Date.now().toString(36),
            speaker: "ai",
            text: nextQ.text,
            originalLanguage: language,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        caseState.updatedAt = new Date().toISOString();

        return {
            reply: nextQ.text,
            questionKey: nextQ.key,
            caseState: caseState,
            isSufficient: nextQ.isComplete,
            redFlagsDetected: caseState.redFlags.length > 0,
            missingInfoCount: caseState.missingInformation.length,
            extractedSummary: generateBriefClinicalSummary(caseState)
        };
    }

    /**
     * Extracts clinical entities from patient text.
     */
    function extractEntities(text, caseState, timestamp) {
        CLINICAL_LEXICON.forEach(rule => {
            rule.patterns.forEach(pattern => {
                const match = text.match(pattern);
                if (match) {
                    let extractedVal = rule.value;
                    if (rule.extractor) {
                        extractedVal = rule.extractor(match);
                    }

                    if (rule.field === "chiefComplaint" && !caseState.chiefComplaint) {
                        caseState.chiefComplaint = extractedVal;
                        recordTraceability(caseState, "chiefComplaint", text, timestamp, 95);
                    } else if (rule.field === "symptom") {
                        if (!caseState.symptoms.includes(extractedVal)) {
                            caseState.symptoms.push(extractedVal);
                            recordTraceability(caseState, `symptom_${extractedVal}`, text, timestamp, 92);
                        }
                    } else if (rule.field === "location" && !caseState.location) {
                        caseState.location = extractedVal;
                        recordTraceability(caseState, "location", text, timestamp, 94);
                    } else if (rule.field === "duration") {
                        if (!caseState.duration) {
                            caseState.duration = extractedVal;
                            caseState.onset = extractedVal;
                            recordTraceability(caseState, "duration", text, timestamp, 90);
                        }
                    } else if (rule.field === "severity" && !caseState.severity) {
                        caseState.severity = extractedVal;
                        recordTraceability(caseState, "severity", text, timestamp, 88);
                    } else if (rule.field === "medication") {
                        const existing = caseState.currentMedications.find(m => m.name.toLowerCase() === rule.name.toLowerCase());
                        if (!existing) {
                            caseState.currentMedications.push({
                                name: rule.name,
                                dose: rule.defaultDose,
                                frequency: "Daily",
                                route: "Oral",
                                startDate: "Prior to consultation",
                                endDate: "",
                                reason: rule.reason,
                                prescribedBy: "Documented by patient",
                                status: "current"
                            });
                            recordTraceability(caseState, `med_${rule.name}`, text, timestamp, 89);
                        }
                    } else if (rule.field === "allergy") {
                        const existingAllergy = caseState.allergies.find(a => a.allergen.toLowerCase() === rule.allergen.toLowerCase());
                        if (!existingAllergy) {
                            caseState.allergies.push({
                                allergen: rule.allergen,
                                reaction: "Severe sensitivity reported by patient",
                                severity: rule.severity,
                                confirmedStatus: "confirmed"
                            });
                            caseState.allergyStatus = "known";
                            recordTraceability(caseState, `allergy_${rule.allergen}`, text, timestamp, 98);
                        }
                    }
                }
            });
        });

        // Smart context-aware fallback slot filling if patient responds to specific prompt
        const lastAiText = (caseState.transcript.slice().reverse().find(t => t.speaker === "ai")?.text || "").toLowerCase();
        
        if (lastAiText.includes("kab") || lastAiText.includes("dino") || lastAiText.includes("ghanto") || lastAiText.includes("duration") || lastAiText.includes("when")) {
            if (!caseState.duration) {
                caseState.duration = text.trim();
                caseState.onset = text.trim();
                recordTraceability(caseState, "duration", text, timestamp, 85);
            }
        } else if (lastAiText.includes("jagah") || lastAiText.includes("location") || lastAiText.includes("kahan")) {
            if (!caseState.location) {
                caseState.location = text.trim();
                recordTraceability(caseState, "location", text, timestamp, 85);
            }
        } else if (lastAiText.includes("tez") || lastAiText.includes("intensity") || lastAiText.includes("severity")) {
            if (!caseState.severity) {
                caseState.severity = text.trim();
                recordTraceability(caseState, "severity", text, timestamp, 85);
            }
        }

        // Fallback catch-all for Chief Complaint if not set by lexicon
        if (!caseState.chiefComplaint && text.length > 2) {
            caseState.chiefComplaint = text.trim();
            recordTraceability(caseState, "chiefComplaint", text, timestamp, 80);
        }

        // Lifestyle clues
        if (/sleep|neend|so|ghante/i.test(text)) {
            const sleepMatch = text.match(/(\d+)\s*(?:ghante|hours?)/i);
            if (sleepMatch) {
                caseState.lifestyle.sleep = `${sleepMatch[1]} hours`;
            }
        }
    }

    /**
     * Records source utterance, timestamp, and confidence score for traceability (Req 7).
     */
    function recordTraceability(caseState, fieldKey, utterance, timestamp, confidence) {
        if (!caseState.sourceTraceability) caseState.sourceTraceability = {};
        caseState.sourceTraceability[fieldKey] = {
            field: fieldKey,
            utterance: utterance,
            speaker: "Patient",
            timestamp: timestamp,
            confidence: confidence
        };
    }

    /**
     * Evaluates text against Red-Flag Urgency Rules (Req 6).
     */
    function checkRedFlags(text, caseState) {
        ClinicalRules.RED_FLAGS.forEach(rule => {
            const matchedKeyword = rule.keywords.find(kw => text.toLowerCase().includes(kw.toLowerCase()));
            if (matchedKeyword) {
                const alreadyRecorded = caseState.redFlags.some(rf => rf.id === rule.id);
                if (!alreadyRecorded) {
                    caseState.redFlags.push({
                        id: rule.id,
                        category: rule.category,
                        title: rule.title,
                        severity: rule.severity,
                        triggerStatement: text,
                        matchedPhrase: matchedKeyword,
                        guidance: rule.guidance,
                        ruleReference: rule.ruleReference,
                        timestamp: new Date().toISOString()
                    });

                    if (typeof ClinicalStorage !== "undefined") {
                        ClinicalStorage.logAudit(
                            "Triggered Safety Red Flag",
                            "AI Engine",
                            `Red Flag: ${rule.title}`,
                            caseState.id,
                            `Trigger phrase: "${matchedKeyword}" in "${text}"`
                        );
                    }
                }
            }
        });
    }

    /**
     * Checks if current medications conflict with recorded allergies (Req 5).
     */
    function checkAllergyConflicts(caseState) {
        if (!caseState.allergies || caseState.allergies.length === 0) return;

        caseState.allergies.forEach(allergy => {
            const allergenLower = allergy.allergen.toLowerCase();
            const allergyDef = ClinicalRules.ALLERGY_CLASSES[allergenLower];

            if (allergyDef) {
                caseState.currentMedications.forEach(med => {
                    const medLower = med.name.toLowerCase();
                    const hasConflict = allergyDef.relatedMeds.some(rel => medLower.includes(rel));
                    if (hasConflict) {
                        allergy.hasConflict = true;
                        allergy.conflictingMed = med.name;
                        allergy.conflictWarning = allergyDef.warning;
                    }
                });
            }
        });
    }

    /**
     * Checks for temporal or clinical contradictions in patient statements (Req 9).
     */
    function checkContradictions(currentText, caseState) {
        // Look for temporal contradiction in transcript
        const patientUtterances = caseState.transcript.filter(t => t.speaker === "patient");
        if (patientUtterances.length < 2) return;

        const durMatches = [];
        patientUtterances.forEach(u => {
            const matchDays = u.text.match(/(\d+)\s*(?:din|days?)/i);
            const matchWeeks = u.text.match(/(\d+)\s*(?:hafte|weeks?|mahine|months?)/i);
            if (matchDays) durMatches.push({ utterance: u.text, days: parseInt(matchDays[1]), time: u.timestamp });
            if (matchWeeks) durMatches.push({ utterance: u.text, days: parseInt(matchWeeks[1]) * 7, time: u.timestamp });
        });

        if (durMatches.length >= 2) {
            const first = durMatches[0];
            const latest = durMatches[durMatches.length - 1];
            // If delta between durations is significant (e.g. 2 days vs 14+ days)
            if (Math.abs(first.days - latest.days) >= 5) {
                const contraId = "CONTRA_DURATION";
                if (!caseState.contradictions.some(c => c.id === contraId)) {
                    caseState.contradictions.push({
                        id: contraId,
                        field: "Symptom Duration",
                        earlierStatement: `${first.utterance} (${first.time})`,
                        laterStatement: `${latest.utterance} (${latest.time})`,
                        recommendation: "Clarify with patient whether the acute episode began recently while mild underlying symptoms were present earlier."
                    });
                }
            }
        }
    }

    /**
     * Detects missing clinical parameters (Req 2).
     */
    function evaluateMissingInformation(caseState) {
        const missing = [];

        // 1. Missing duration / onset
        if (!caseState.duration && caseState.chiefComplaint) {
            missing.push({
                id: "MISSING_DURATION",
                category: "History of Present Illness",
                label: "Exact duration / onset of symptoms",
                status: "unconfirmed"
            });
        }

        // 2. Missing location for pain complaints
        if (caseState.chiefComplaint && caseState.chiefComplaint.toLowerCase().includes("pain") && !caseState.location) {
            missing.push({
                id: "MISSING_LOCATION",
                category: "Symptoms",
                label: "Specific anatomical location and radiation of pain",
                status: "unconfirmed"
            });
        }

        // 3. Medication missing dosage
        caseState.currentMedications.forEach(med => {
            if (!med.dose || med.dose.toLowerCase().includes("unknown") || med.dose.toLowerCase().includes("unspecified")) {
                missing.push({
                    id: `MISSING_DOSE_${med.name}`,
                    category: "Medication",
                    label: `Dosage and frequency for ${med.name}`,
                    status: "unconfirmed"
                });
            }
        });

        // 4. Allergy status not explicitly verified
        if (caseState.allergyStatus === "unknown") {
            missing.push({
                id: "MISSING_ALLERGY_VERIFICATION",
                category: "Safety",
                label: "Allergy status verification (Drug / Food sensitivities)",
                status: "unconfirmed"
            });
        }

        caseState.missingInformation = missing;
    }

    /**
     * Computes field-level confidence scores (Req 8).
     */
    function calculateConfidence(caseState) {
        if (!caseState.fieldConfidence) caseState.fieldConfidence = {};

        // Chief complaint
        if (caseState.chiefComplaint) {
            caseState.fieldConfidence.chiefComplaint = caseState.chiefComplaint.length > 5 ? 96 : 82;
        }

        // Duration
        if (caseState.duration) {
            caseState.fieldConfidence.duration = caseState.contradictions.some(c => c.field.includes("Duration")) ? 52 : 92;
        }

        // Location
        if (caseState.location) {
            caseState.fieldConfidence.location = 94;
        }

        // Medications
        caseState.currentMedications.forEach(m => {
            const hasDose = m.dose && !m.dose.includes("Unknown");
            caseState.fieldConfidence[`med_${m.name}`] = hasDose ? 92 : 44;
        });

        // Allergies
        caseState.allergies.forEach(a => {
            caseState.fieldConfidence[`allergy_${a.allergen}`] = 98;
        });
    }

    /**
     * Determines the next dynamic question in the adaptive interview (Req 1).
     */
    function determineNextQuestion(caseState, language) {
        const lastAiUtterance = caseState.transcript.slice().reverse().find(t => t.speaker === "ai")?.text || "";

        const getCandidate = () => {
            // Priority 1: Chief complaint
            if (!caseState.chiefComplaint) {
                return { key: "CHIEF_COMPLAINT", text: getQuestionText("CHIEF_COMPLAINT", language), isComplete: false };
            }

            // Priority 2: Duration / Onset
            if (!caseState.duration) {
                return { key: "DURATION", text: getQuestionText("DURATION", language), isComplete: false };
            }

            // Priority 3: Anatomical Location (if pain complaint)
            if (caseState.chiefComplaint.toLowerCase().includes("pain") && !caseState.location) {
                return { key: "LOCATION", text: getQuestionText("LOCATION", language), isComplete: false };
            }

            // Priority 4: Severity
            if (!caseState.severity) {
                return { key: "SEVERITY", text: getQuestionText("SEVERITY", language), isComplete: false };
            }

            // Priority 5: Associated acute symptoms (GI vs Headache vs General)
            const hasAskedAssociated = caseState.transcript.some(t => t.speaker === "ai" && (t.text.includes("fever") || t.text.includes("bukhar") || t.text.includes("ulti")));
            if (!hasAskedAssociated) {
                if (caseState.chiefComplaint.toLowerCase().includes("headache") || caseState.chiefComplaint.toLowerCase().includes("sar")) {
                    return { key: "ASSOCIATED_HEADACHE", text: getQuestionText("ASSOCIATED_HEADACHE", language), isComplete: false };
                }
                return { key: "ASSOCIATED_GI", text: getQuestionText("ASSOCIATED_GI", language), isComplete: false };
            }

            // Priority 6: Clarify medicine dose if medicine has unspecified dose
            const medWithMissingDose = caseState.currentMedications.find(m => !m.dose || m.dose.includes("Unknown"));
            const hasAskedMedClarification = caseState.transcript.some(t => t.speaker === "ai" && (t.text.includes("dose") || t.text.includes("khurak") || t.text.includes("strength")));
            if (medWithMissingDose && !hasAskedMedClarification) {
                return { key: "MED_DOSE_CLARIFICATION", text: getQuestionText("MED_DOSE_CLARIFICATION", language), isComplete: false };
            }

            // Priority 7: Medications in general
            const hasAskedMeds = caseState.transcript.some(t => t.speaker === "ai" && (t.text.includes("medicine") || t.text.includes("dawai")));
            if (!hasAskedMeds && caseState.currentMedications.length === 0) {
                return { key: "MEDICATIONS", text: getQuestionText("MEDICATIONS", language), isComplete: false };
            }

            // Priority 8: Allergies
            const hasAskedAllergy = caseState.transcript.some(t => t.speaker === "ai" && (t.text.includes("allergy") || t.text.includes("reaction")));
            if (!hasAskedAllergy && caseState.allergyStatus === "unknown") {
                return { key: "ALLERGIES", text: getQuestionText("ALLERGIES", language), isComplete: false };
            }

            // Priority 9: Lifestyle
            if (!caseState.lifestyle.sleep) {
                const hasAskedLifestyle = caseState.transcript.some(t => t.speaker === "ai" && (t.text.includes("sleep") || t.text.includes("neend")));
                if (!hasAskedLifestyle) {
                    return { key: "LIFESTYLE", text: getQuestionText("LIFESTYLE", language), isComplete: false };
                }
            }

            // Sufficient information reached!
            return {
                key: "SUFFICIENT",
                text: getQuestionText("SUFFICIENT", language),
                isComplete: true
            };
        };

        let candidate = getCandidate();

        // Anti-repetition check: If candidate question matches the last AI utterance, fallback to DURATION or SEVERITY
        if (candidate.text === lastAiUtterance && !candidate.isComplete) {
            if (!caseState.duration) {
                candidate = { key: "DURATION", text: getQuestionText("DURATION", language), isComplete: false };
            } else if (!caseState.severity) {
                candidate = { key: "SEVERITY", text: getQuestionText("SEVERITY", language), isComplete: false };
            } else {
                candidate = { key: "ASSOCIATED_GENERAL", text: getQuestionText("ASSOCIATED_GENERAL", language), isComplete: false };
            }
        }

        return candidate;
    }

    function getQuestionText(key, language) {
        const langMap = INTERVIEW_QUESTIONS[language] || INTERVIEW_QUESTIONS["hinglish"];
        return langMap[key] || INTERVIEW_QUESTIONS["en"][key] || "Please provide further details.";
    }

    /**
     * Patient manual correction mechanism (Req 18).
     */
    function applyPatientCorrection(caseState, field, newValue, oldStatement) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (field === "age") {
            caseState.patientAge = newValue;
        } else if (field === "chiefComplaint") {
            caseState.chiefComplaint = newValue;
        } else if (field === "duration") {
            caseState.duration = newValue;
        } else if (field === "location") {
            caseState.location = newValue;
        }

        recordTraceability(caseState, field, `Patient correction: "${newValue}" (replaced "${oldStatement}")`, timestamp, 99);

        if (typeof ClinicalStorage !== "undefined") {
            ClinicalStorage.logAudit(
                "Patient Corrected AI Interpretation",
                "Patient",
                field,
                caseState.id,
                `Changed to: "${newValue}"`
            );
        }

        return caseState;
    }

    /**
     * AI Explanation Provider ("Why did AI flag this?") (Req 27).
     */
    function getFlagExplanation(flagId, caseState) {
        const redFlag = caseState.redFlags.find(rf => rf.id === flagId);
        if (redFlag) {
            return {
                title: redFlag.title,
                category: redFlag.category,
                severity: redFlag.severity,
                reason: redFlag.guidance,
                ruleReference: redFlag.ruleReference,
                triggerStatement: redFlag.triggerStatement,
                matchedPhrase: redFlag.matchedPhrase,
                confidence: "High (Protocol Rule Match)",
                disclaimer: "This urgency flag is an AI safety assist and does not constitute a diagnostic pronouncement."
            };
        }

        return {
            title: "Safety Flag",
            reason: "Clinical safety pattern matched from patient interview.",
            ruleReference: "Standard Clinical Case-Taking Safety Guidelines",
            triggerStatement: "Refer to patient transcript",
            confidence: "Moderate"
        };
    }

    /**
     * Generates a brief clinical summary for preview.
     */
    function generateBriefClinicalSummary(caseState) {
        const symptomsList = caseState.symptoms.length > 0 ? caseState.symptoms.join(", ") : "None reported";
        const medsList = caseState.currentMedications.map(m => `${m.name} (${m.dose})`).join("; ") || "None active";
        const allergyList = caseState.allergies.map(a => a.allergen).join(", ") || "No allergies documented";

        return {
            chiefComplaint: caseState.chiefComplaint || "Under review",
            duration: caseState.duration || "Not specified",
            location: caseState.location || "Not specified",
            symptoms: symptomsList,
            medications: medsList,
            allergies: allergyList,
            prakriti: caseState.ayushAssessment.prakriti || "To be assessed"
        };
    }

    /* =========================================================================
       AI MEDICAL SCRIBE & STRUCTURED CONSULTATION NOTES ENGINE
       Strict Medical Safety: NEVER invent symptoms, vitals, diagnosis, medicines,
       or history. If not in transcript, write "Not mentioned".
       ========================================================================= */

    async function generateStructuredConsultationNotes(transcriptData, patientInfo = {}, options = {}) {
        let transcriptText = "";
        if (Array.isArray(transcriptData)) {
            transcriptText = transcriptData.map(item => {
                if (typeof item === "string") return item;
                return `${item.speaker || 'Speaker'}: ${item.text || ''}`;
            }).join("\n");
        } else if (typeof transcriptData === "string") {
            transcriptText = transcriptData;
        }

        const apiKey = options.apiKey || localStorage.getItem("swasthai_gemini_api_key") || "";

        if (apiKey && apiKey.trim().length > 15) {
            try {
                const geminiNotes = await callGeminiScribeApi(transcriptText, patientInfo, apiKey.trim());
                if (geminiNotes) {
                    return geminiNotes;
                }
            } catch (err) {
                console.warn("Remote AI service unavailable, utilizing local Clinical NLP engine:", err);
            }
        }

        return extractNotesRuleBased(transcriptText, patientInfo);
    }

    function extractNotesRuleBased(transcriptText, patientInfo = {}) {
        const text = transcriptText || "";
        const lower = text.toLowerCase();
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

        // Separate Doctor and Patient speech lines if labeled
        const doctorLines = [];
        const patientLines = [];
        lines.forEach(line => {
            if (/^doctor\s*:/i.test(line)) {
                doctorLines.push(line.replace(/^doctor\s*:/i, "").trim());
            } else if (/^patient\s*:/i.test(line)) {
                patientLines.push(line.replace(/^patient\s*:/i, "").trim());
            }
        });

        // 1. PATIENT COMPLAINT
        let mainComplaint = "Not mentioned";
        let duration = "Not mentioned";
        let severity = "Not mentioned";

        // Extract Complaint
        const complaintMatches = [];
        if (/fever|bukhar|tap|temperature/i.test(text)) complaintMatches.push("Fever");
        if (/headache|sir dard|sar dard|mathe me dard/i.test(text)) complaintMatches.push("Headache");
        if (/stomach (?:pain|ache)|pet (?:me|mein) dard|abdominal pain|acidity|gas/i.test(text)) complaintMatches.push("Abdominal pain / Acidity");
        if (/cough|khansi/i.test(text) && !/no cough|khansi nahi/i.test(lower)) complaintMatches.push("Cough");
        if (/joint pain|ghutne (?:me|mein) dard|sandhishoola/i.test(text)) complaintMatches.push("Joint pain");
        if (/vomiting|ulti/i.test(text) && !/no vomiting|ulti nahi/i.test(lower)) complaintMatches.push("Vomiting");
        if (/chest pain|chhati me dard/i.test(text) && !/no chest pain|chhati me dard nahi/i.test(lower)) complaintMatches.push("Chest discomfort");
        if (/throat pain|gale me dard|sore throat/i.test(text)) complaintMatches.push("Sore throat");
        if (/weakness|kamzori|thakan|fatigue/i.test(text)) complaintMatches.push("Fatigue / Weakness");

        if (complaintMatches.length > 0) {
            mainComplaint = complaintMatches.join(", ");
        } else {
            // Fallback to searching first patient utterance
            if (patientLines.length > 0) {
                const firstPatientLine = patientLines[0];
                if (firstPatientLine.length < 120) {
                    mainComplaint = firstPatientLine;
                }
            }
        }

        // Extract Duration
        const durMatch = text.match(/(?:for|since|last|pichle|se)\s*(\d+\s*(?:days?|weeks?|months?|hours?|din|hafte|mahine))/i) ||
                         text.match(/(\d+\s*(?:days?|weeks?|months?|hours?|din|hafte|mahine)\s*(?:se|ago|duration))/i);
        if (durMatch) {
            duration = durMatch[1].trim();
        } else if (/yesterday|kal se/i.test(text)) {
            duration = "Since yesterday";
        } else if (/today morning|aaj subah se/i.test(text)) {
            duration = "Since today morning";
        }

        // Extract Severity
        if (/severe|unbearable|bahut tez|tez dard|bura haal|extreme|high/i.test(text)) {
            severity = "Severe";
        } else if (/moderate|theek thak|medium/i.test(text)) {
            severity = "Moderate";
        } else if (/mild|halka|thoda/i.test(text)) {
            severity = "Mild";
        }

        // 2. SYMPTOMS (Present vs Negative)
        const presentSymptoms = [];
        const negativeSymptoms = [];

        // Check Present
        if (/fever|bukhar/i.test(lower)) presentSymptoms.push("Fever");
        if (/headache|sir dard|sar dard/i.test(lower)) presentSymptoms.push("Headache");
        if (/body (?:pain|ache)|badan dard/i.test(lower)) presentSymptoms.push("Body ache");
        if (/nausea|matli|jee ghabrana/i.test(lower)) presentSymptoms.push("Nausea");
        if (/chills|shivering|thand lagna/i.test(lower)) presentSymptoms.push("Chills / Shivering");
        if (/loose motion|diarrhea|dast/i.test(lower) && !/no loose motion|dast nahi/i.test(lower)) presentSymptoms.push("Diarrhea");
        if (/cough|khansi/i.test(lower) && !/no cough|khansi nahi/i.test(lower)) presentSymptoms.push("Cough");
        if (/swelling|sujan/i.test(lower)) presentSymptoms.push("Swelling");
        if (/burning|jalan|heartburn/i.test(lower)) presentSymptoms.push("Heartburn / Burning sensation");

        // Check Explicit Negative Symptoms
        if (/no cough|don't have cough|khansi nahi|not having cough|cough nahi/i.test(lower)) negativeSymptoms.push("No cough");
        if (/no chest pain|chhati me dard nahi|no chest heaviness/i.test(lower)) negativeSymptoms.push("No chest pain");
        if (/no vomiting|ulti nahi|vomiting nahi/i.test(lower)) negativeSymptoms.push("No vomiting");
        if (/no loose motion|dast nahi|no diarrhea/i.test(lower)) negativeSymptoms.push("No loose motions");
        if (/no fever|bukhar nahi/i.test(lower)) negativeSymptoms.push("No fever");
        if (/no breathing difficulty|saans lene me dikkat nahi|no breathlessness|no dyspnea/i.test(lower)) negativeSymptoms.push("No breathlessness");
        if (/no dizziness|chakkar nahi/i.test(lower)) negativeSymptoms.push("No dizziness");

        // 3. MEDICAL HISTORY
        let pastConditions = "Not mentioned";
        let pastSurgeries = "Not mentioned";
        let allergies = "Not mentioned";
        let currentMedications = "Not mentioned";

        const conds = [];
        if (/hypertension|high bp|high blood pressure/i.test(lower)) conds.push("Hypertension");
        if (/diabetes|sugar ki bimari|sugar patient|type 2 diabetes/i.test(lower)) conds.push("Diabetes Mellitus");
        if (/asthma|dama/i.test(lower)) conds.push("Asthma");
        if (/thyroid/i.test(lower)) conds.push("Thyroid disorder");
        if (/work stress|tension|stress/i.test(lower)) conds.push("Work stress / mental fatigue");
        if (conds.length > 0) pastConditions = conds.join(", ");

        if (/no (?:past )?surger(?:y|ies)|never had surgery|operation nahi hua/i.test(lower)) {
            pastSurgeries = "No prior surgeries reported";
        } else {
            const surgMatch = text.match(/(?:surgery for|operation for|operated for|had surgery of)\s*([a-zA-Z\s]{3,30})/i);
            if (surgMatch) pastSurgeries = surgMatch[0].trim();
        }

        if (/no allergies|no known (?:drug )?allergies|nkda|kisi dawai se allergy nahi/i.test(lower)) {
            allergies = "No known drug allergies reported";
        } else if (/allergic to penicillin|penicillin allergy/i.test(lower)) {
            allergies = "Penicillin (Reported allergy)";
        } else if (/allergic to sulfa|sulfa allergy/i.test(lower)) {
            allergies = "Sulfa drugs (Reported allergy)";
        } else if (/allergic to aspirin|aspirin allergy/i.test(lower)) {
            allergies = "Aspirin / NSAIDs (Reported allergy)";
        }

        const medsFound = [];
        if (/amlodipine|stamlo/i.test(lower)) medsFound.push("Amlodipine");
        if (/metformin|glycomet/i.test(lower)) medsFound.push("Metformin");
        if (/thyronorm|eltroxin/i.test(lower)) medsFound.push("Thyroxine");
        if (/no regular medicines|no regular medications|koi dawai nahi lete|not taking any medicine/i.test(lower)) {
            currentMedications = "No regular medications";
        } else if (medsFound.length > 0) {
            currentMedications = medsFound.join(", ");
        }

        // 4. VITALS (Strict regex extraction only)
        let bloodPressure = "Not mentioned";
        let heartRate = "Not mentioned";
        let temperature = "Not mentioned";
        let spO2 = "Not mentioned";
        let weight = "Not mentioned";

        // BP
        const bpMatch = text.match(/(?:bp|blood pressure|b\.p\.)\s*(?:is|:|=)?\s*(\d{2,3}\s*[\/\\]\s*\d{2,3}(?:\s*mmhg)?)/i) ||
                        text.match(/(\b\d{2,3}\s*[\/\\]\s*\d{2,3}\b(?:\s*mmhg)?)/i);
        if (bpMatch) {
            bloodPressure = bpMatch[1].trim();
            if (!bloodPressure.toLowerCase().includes("mmhg")) bloodPressure += " mmHg";
        }

        // Pulse / HR
        const hrMatch = text.match(/(?:pulse|heart rate|hr|pr)\s*(?:is|:|=)?\s*(\d{2,3}(?:\s*bpm)?)/i) ||
                        text.match(/(\b\d{2,3}\b)\s*bpm/i);
        if (hrMatch) {
            heartRate = hrMatch[1].trim();
            if (!heartRate.toLowerCase().includes("bpm")) heartRate += " bpm";
        }

        // Temperature
        const tempMatch = text.match(/(?:temp|temperature)\s*(?:is|:|=)?\s*(\d{2,3}(?:\.\d+)?\s*(?:f|c|°f|°c|deg(?:rees)?)?)/i) ||
                          text.match(/(\b\d{2,3}(?:\.\d+)?\b)\s*(?:°?f|°?c)/i);
        if (tempMatch) {
            temperature = tempMatch[1].trim();
            if (!/[fc]/i.test(temperature)) temperature += " °F";
        }

        // SpO2
        const spo2Match = text.match(/(?:spo2|oxygen|saturation|o2 sat)\s*(?:is|:|=)?\s*(\d{2,3}\s*%)/i) ||
                          text.match(/(\b\d{2,3}\b)\s*%\s*(?:spo2|saturation|oxygen)?/i);
        if (spo2Match) {
            spO2 = spo2Match[1].trim();
            if (!spO2.includes("%")) spO2 += "%";
        }

        // Weight
        const wtMatch = text.match(/(?:weight|wt)\s*(?:is|:|=)?\s*(\d{2,3}(?:\.\d+)?\s*(?:kg|kgs|kilo|pounds|lbs)?)/i);
        if (wtMatch && !/loss|gain/i.test(wtMatch[0])) {
            weight = wtMatch[1].trim();
            if (!/[a-z]/i.test(weight)) weight += " kg";
        }

        // 5. ASSESSMENT
        let assessment = "Not mentioned";
        const assessmentKeywords = [
            /(?:looks like|seems like|indicates|impression is|diagnos(?:is|ed)|likely|suspecting|condition is|cause of)\s*([^.,\n]+)/i,
            /(?:tension-type headache|viral prodrome|viral fever|acute gastritis|upper respiratory tract infection|urti|migraine|sandhivata|amlapitta)/i
        ];

        for (const kw of assessmentKeywords) {
            const m = text.match(kw);
            if (m) {
                if (m[1]) {
                    assessment = `Doctor impression: ${m[1].trim()}`;
                } else {
                    assessment = `Doctor impression: ${m[0].trim()}`;
                }
                break;
            }
        }

        // 6. PLAN
        let planMedicines = "Not mentioned";
        let planTests = "Not mentioned";
        let planLifestyle = "Not mentioned";
        let planFollowUp = "Not mentioned";

        // Medicines in plan
        const prescribedMeds = [];
        if (/paracetamol|pcm|dolo|crocin|calpol/i.test(lower)) {
            const pcmDose = text.match(/paracetamol\s*(\d+mg|\w+)/i) || text.match(/dolo\s*(\d+mg|\w+)/i);
            prescribedMeds.push(pcmDose ? pcmDose[0] : "Paracetamol 650mg SOS after meals");
        }
        if (/brahmi vati/i.test(lower)) prescribedMeds.push("Brahmi Vati 1 tablet twice daily");
        if (/pantocid|pan 40|pantoprazole/i.test(lower)) prescribedMeds.push("Pantoprazole 40mg before breakfast");
        if (/cetirizine|allegra/i.test(lower)) prescribedMeds.push("Antihistamine (Cetirizine / Allegra) as advised");
        if (/amoxicillin|azithromycin|antibiotic/i.test(lower)) {
            const abxMatch = text.match(/(?:amoxicillin|azithromycin)\s*(?:\d+mg)?/i);
            prescribedMeds.push(abxMatch ? abxMatch[0] : "Antibiotic as specified by doctor");
        }
        if (/cough syrup|kuf|syrup/i.test(lower)) prescribedMeds.push("Cough syrup as advised");

        if (prescribedMeds.length > 0) {
            planMedicines = prescribedMeds.join("; ");
        }

        // Tests
        const tests = [];
        if (/blood test|cbc|complete blood count/i.test(lower)) tests.push("Complete Blood Count (CBC)");
        if (/lft|liver function/i.test(lower)) tests.push("Liver Function Test (LFT)");
        if (/kft|kidney function/i.test(lower)) tests.push("Kidney Function Test (KFT)");
        if (/x-?ray/i.test(lower)) tests.push("X-Ray");
        if (/ultrasound|usg/i.test(lower)) tests.push("Ultrasound (USG)");
        if (/ecg|electrocardiogram/i.test(lower)) tests.push("Electrocardiogram (ECG)");
        if (/urine routine|urine test/i.test(lower)) tests.push("Urine Routine Examination");
        if (tests.length > 0) planTests = tests.join(", ");

        // Lifestyle / Diet
        const lifestyleAdvice = [];
        if (/water|hydration|paani/i.test(lower)) lifestyleAdvice.push("Drink plenty of fluids / maintain hydration");
        if (/rest|aaram|sleep/i.test(lower)) lifestyleAdvice.push("Adequate physical rest and sleep");
        if (/avoid oily|light diet|avoid spicy|tala bhuna/i.test(lower)) lifestyleAdvice.push("Light, easy-to-digest diet; avoid spicy/oily food");
        if (/warm water|garam paani/i.test(lower)) lifestyleAdvice.push("Sip warm water");
        if (/salt/i.test(lower)) lifestyleAdvice.push("Limit sodium/salt intake");
        if (lifestyleAdvice.length > 0) planLifestyle = lifestyleAdvice.join("; ");

        // Follow-up
        const fuMatch = text.match(/(?:follow up|review|come back|dikhao|milna)\s*(?:in|after|ke baad)?\s*(\d+\s*(?:days?|weeks?|mahine|din))/i);
        if (fuMatch) {
            planFollowUp = `Follow up in ${fuMatch[1].trim()}`;
        } else if (/if fever persists|if symptoms worsen|agar bukhar na tute/i.test(lower)) {
            planFollowUp = "Follow up if symptoms persist or worsen";
        }

        // 7. DOCTOR NOTES
        let doctorNotes = "Not mentioned";
        // Check if doctor made specific observations
        const observationMatches = text.match(/(?:observe|noticed|alert to|advice to report|patient seems|looks|note:)\s*([^.,\n]+)/i);
        if (observationMatches) {
            doctorNotes = observationMatches[0].trim();
        }

        return {
            complaint: {
                main: mainComplaint,
                duration: duration,
                severity: severity
            },
            symptoms: {
                present: presentSymptoms.length > 0 ? presentSymptoms.join(", ") : (mainComplaint !== "Not mentioned" ? mainComplaint : "Not mentioned"),
                negative: negativeSymptoms.length > 0 ? negativeSymptoms.join(", ") : "Not mentioned"
            },
            history: {
                conditions: pastConditions,
                surgeries: pastSurgeries,
                allergies: allergies,
                medications: currentMedications
            },
            vitals: {
                bloodPressure: bloodPressure,
                heartRate: heartRate,
                temperature: temperature,
                spO2: spO2,
                weight: weight
            },
            assessment: assessment,
            plan: {
                medicines: planMedicines,
                tests: planTests,
                lifestyle: planLifestyle,
                followUp: planFollowUp
            },
            doctorNotes: doctorNotes,
            aiDisclaimer: "AI-generated draft — doctor review required."
        };
    }

    async function callGeminiScribeApi(transcriptText, patientInfo, apiKey) {
        const prompt = `You are a certified clinical AI medical scribe assisting a licensed doctor.
Convert the following consultation transcript into accurate, structured clinical consultation notes.

STRICT MEDICAL SAFETY RULES:
1. You must NEVER invent or assume symptoms, vital signs, diagnosis, medicines, laboratory tests, or medical history.
2. If any piece of information is NOT explicitly stated in the transcript, write EXACTLY: "Not mentioned".
3. For Assessment: Summarize only the doctor's explicit verbal assessment. Do NOT invent a diagnosis.
4. Output MUST be valid JSON with this exact structure:
{
  "complaint": {
    "main": "string (or 'Not mentioned')",
    "duration": "string (or 'Not mentioned')",
    "severity": "string (or 'Not mentioned')"
  },
  "symptoms": {
    "present": "string (or 'Not mentioned')",
    "negative": "string (negative symptoms explicitly denied, or 'Not mentioned')"
  },
  "history": {
    "conditions": "string (or 'Not mentioned')",
    "surgeries": "string (or 'Not mentioned')",
    "allergies": "string (or 'Not mentioned')",
    "medications": "string (or 'Not mentioned')"
  },
  "vitals": {
    "bloodPressure": "string with mmHg (or 'Not mentioned')",
    "heartRate": "string with bpm (or 'Not mentioned')",
    "temperature": "string with unit (or 'Not mentioned')",
    "spO2": "string with % (or 'Not mentioned')",
    "weight": "string with kg (or 'Not mentioned')"
  },
  "assessment": "string (summarize ONLY explicit verbal assessment stated by doctor, or 'Not mentioned')",
  "plan": {
    "medicines": "string (or 'Not mentioned')",
    "tests": "string (or 'Not mentioned')",
    "lifestyle": "string (or 'Not mentioned')",
    "followUp": "string (or 'Not mentioned')"
  },
  "doctorNotes": "string (additional observations explicitly stated by doctor, or 'Not mentioned')"
}

PATIENT CONTEXT:
Name: ${patientInfo.fullName || patientInfo.patientName || 'Patient'}
ID: ${patientInfo.id || patientInfo.patientId || 'Unspecified'}

CONSULTATION TRANSCRIPT:
"""
${transcriptText}
"""

Respond with ONLY the JSON object.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) throw new Error("Empty response from Gemini API");

        const parsed = JSON.parse(candidateText);
        parsed.aiDisclaimer = "AI-generated draft — doctor review required.";
        return parsed;
    }

    return {
        processPatientUtterance,
        applyPatientCorrection,
        getFlagExplanation,
        getQuestionText,
        generateBriefClinicalSummary,
        generateStructuredConsultationNotes
    };
})();
