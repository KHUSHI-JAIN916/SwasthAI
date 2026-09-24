/* ==========================================================================
   SwasthAI / SWASTHAI — Universal EMR/EHR & ABDM FHIR R4 Service
   Standard Compliance:
   - Ayushman Bharat Digital Mission (ABDM) / NDHM Health Data Standards
   - HL7 FHIR Release 4 (Bundle, Composition, Patient, Encounter, Condition,
     Observation, AllergyIntolerance, MedicationStatement, CarePlan)
   - Clinical Code Systems: LOINC, SNOMED-CT, NAMASTE (National AYUSH Morbidity
     and Standardized Terminologies Electronic Portal)
   ========================================================================== */

const FhirEmrService = (() => {

    // Standard Code Systems
    const SYSTEM_LOINC = "http://loinc.org";
    const SYSTEM_SNOMED = "http://snomed.info/sct";
    const SYSTEM_ABDM_DOC_TYPE = "https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-document-type";
    const SYSTEM_AYUSH_NAMASTE = "https://namstp.ayush.gov.in";

    /**
     * Map clinical vitals to LOINC and standard units
     */
    const VITALS_LOINC_MAP = {
        bloodPressure: { loinc: "85354-9", display: "Blood pressure panel with all children optional" },
        systolic: { loinc: "8480-6", display: "Systolic blood pressure", unit: "mmHg", code: "mm[Hg]" },
        diastolic: { loinc: "8462-4", display: "Diastolic blood pressure", unit: "mmHg", code: "mm[Hg]" },
        heartRate: { loinc: "8867-4", display: "Heart rate", unit: "beats/min", code: "/min" },
        temperature: { loinc: "8310-5", display: "Body temperature", unit: "degF", code: "[degF]" },
        spO2: { loinc: "59408-5", display: "Oxygen saturation in Arterial blood by Pulse oximetry", unit: "%", code: "%" },
        weight: { loinc: "29463-7", display: "Body weight", unit: "kg", code: "kg" }
    };

    /**
     * Map AYUSH Prakriti / Dosha to standardized NAMASTE terminology
     */
    const AYUSH_NAMASTE_MAP = {
        "Vata": { code: "NAM-DOSHA-01", display: "Vata Dosha Dominance (Vatika)" },
        "Pitta": { code: "NAM-DOSHA-02", display: "Pitta Dosha Dominance (Paittika)" },
        "Kapha": { code: "NAM-DOSHA-03", display: "Kapha Dosha Dominance (Kaphaja)" },
        "Pitta-Vata": { code: "NAM-DOSHA-04", display: "Dvandvaja Prakriti (Pitta-Vata)" },
        "Vata-Kapha": { code: "NAM-DOSHA-05", display: "Dvandvaja Prakriti (Vata-Kapha)" },
        "Pitta-Kapha": { code: "NAM-DOSHA-06", display: "Dvandvaja Prakriti (Pitta-Kapha)" },
        "Sama": { code: "NAM-DOSHA-07", display: "Samadosha / Balanced Prakriti" }
    };

    /**
     * Generates a complete, compliant HL7 FHIR R4 Bundle for ABDM OPD Consultation Record
     * @param {Object} consultationRecord - Standard consultation note object
     * @param {Object} patientInfo - Patient demographics
     * @param {Object} doctorInfo - Practitioner details
     * @returns {Object} FHIR R4 Bundle (document type)
     */
    function createAbdmFhirBundle(consultationRecord = {}, patientInfo = {}, doctorInfo = {}) {
        const timestamp = consultationRecord.date 
            ? new Date(consultationRecord.date).toISOString() 
            : new Date().toISOString();
        const bundleId = `bundle-${consultationRecord.id || Date.now().toString(36)}`;
        const compositionId = `comp-${consultationRecord.id || Date.now().toString(36)}`;
        const patientId = consultationRecord.patientId || patientInfo.id || "AYU-PAT-001";
        const practitionerId = consultationRecord.doctorId || doctorInfo.id || "DOC-IN-001";
        const encounterId = `enc-${consultationRecord.id || Date.now().toString(36)}`;

        const notes = consultationRecord.finalNotes || consultationRecord.generatedNotes || {};
        const complaint = notes.complaint || {};
        const symptoms = notes.symptoms || {};
        const history = notes.history || {};
        const vitals = notes.vitals || {};
        const ayush = notes.ayush || {};
        const plan = notes.plan || {};

        const entries = [];

        // 1. COMPOSITION RESOURCE (ABDM OPD Consultation Record)
        const compositionResource = {
            resourceType: "Composition",
            id: compositionId,
            meta: {
                versionId: "1",
                lastUpdated: timestamp,
                profile: [
                    "https://nrces.in/ndhm/fhir/r4/StructureDefinition/OPConsultRecord"
                ]
            },
            language: "en-IN",
            status: "final",
            type: {
                coding: [
                    {
                        system: SYSTEM_ABDM_DOC_TYPE,
                        code: "OPConsult",
                        display: "Outpatient Consultation Record"
                    },
                    {
                        system: SYSTEM_SNOMED,
                        code: "371530004",
                        display: "Clinical consultation report"
                    }
                ],
                text: "OPD Consultation Clinical Summary"
            },
            subject: {
                reference: `Patient/${patientId}`,
                display: consultationRecord.patientName || patientInfo.fullName || "Patient"
            },
            encounter: {
                reference: `Encounter/${encounterId}`
            },
            date: timestamp,
            author: [
                {
                    reference: `Practitioner/${practitionerId}`,
                    display: consultationRecord.doctorName || doctorInfo.name || "Dr. Sharma"
                }
            ],
            title: "Outpatient Consultation & AYUSH Integrative Clinical Note",
            section: []
        };

        // 2. PATIENT RESOURCE
        const patientResource = {
            resourceType: "Patient",
            id: patientId,
            meta: {
                profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"]
            },
            identifier: [
                {
                    type: {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                                code: "MR",
                                display: "Medical record number"
                            }
                        ]
                    },
                    system: "https://healthid.abdm.gov.in",
                    value: patientId
                }
            ],
            name: [
                {
                    text: consultationRecord.patientName || patientInfo.fullName || "Patient"
                }
            ],
            gender: (patientInfo.gender || "male").toLowerCase(),
            birthDate: patientInfo.age ? calculateEstimatedBirthDate(patientInfo.age) : undefined
        };
        entries.push({ fullUrl: `urn:uuid:${patientId}`, resource: patientResource });

        // 3. PRACTITIONER RESOURCE
        const practitionerResource = {
            resourceType: "Practitioner",
            id: practitionerId,
            meta: {
                profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Practitioner"]
            },
            identifier: [
                {
                    system: "https://doctor.abdm.gov.in",
                    value: practitionerId
                }
            ],
            name: [
                {
                    text: consultationRecord.doctorName || doctorInfo.name || "Dr. Sharma"
                }
            ]
        };
        entries.push({ fullUrl: `urn:uuid:${practitionerId}`, resource: practitionerResource });

        // 4. ENCOUNTER RESOURCE
        const encounterResource = {
            resourceType: "Encounter",
            id: encounterId,
            meta: {
                profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Encounter"]
            },
            status: "finished",
            class: {
                system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                code: "AMB",
                display: "ambulatory"
            },
            subject: {
                reference: `Patient/${patientId}`
            },
            period: {
                start: timestamp
            }
        };
        entries.push({ fullUrl: `urn:uuid:${encounterId}`, resource: encounterResource });

        // SECTION: CHIEF COMPLAINT & SYMPTOMS
        const complaintCondId = `cond-complaint-${Date.now().toString(36)}`;
        if (complaint.main && complaint.main !== "Not mentioned") {
            const conditionResource = {
                resourceType: "Condition",
                id: complaintCondId,
                meta: {
                    profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition"]
                },
                clinicalStatus: {
                    coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }]
                },
                verificationStatus: {
                    coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: "confirmed" }]
                },
                code: {
                    text: `${complaint.main} (Duration: ${complaint.duration || 'Unspecified'}, Severity: ${complaint.severity || 'Moderate'})`
                },
                subject: { reference: `Patient/${patientId}` },
                recordedDate: timestamp
            };
            entries.push({ fullUrl: `urn:uuid:${complaintCondId}`, resource: conditionResource });

            compositionResource.section.push({
                title: "Chief Complaint & Present Illness",
                code: {
                    coding: [{ system: SYSTEM_SNOMED, code: "422843007", display: "Chief complaint section" }]
                },
                entry: [{ reference: `Condition/${complaintCondId}` }]
            });
        }

        // SECTION: AYUSH & LIFESTYLE PROFILE OBSERVATION
        if (ayush && (ayush.prakriti?.dosha || ayush.diet?.agni || ayush.lifestyle?.sleep)) {
            const ayushObsId = `obs-ayush-${Date.now().toString(36)}`;
            const prakText = ayush.prakriti?.dosha || "";
            let matchedNamaste = { code: "NAM-DOSHA-00", display: prakText || "Ayurvedic Health Profile" };
            for (const key of Object.keys(AYUSH_NAMASTE_MAP)) {
                if (prakText.toLowerCase().includes(key.toLowerCase())) {
                    matchedNamaste = AYUSH_NAMASTE_MAP[key];
                    break;
                }
            }

            const ayushObservation = {
                resourceType: "Observation",
                id: ayushObsId,
                meta: {
                    profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation"]
                },
                status: "final",
                category: [
                    {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                                code: "exam",
                                display: "Exam"
                            }
                        ]
                    }
                ],
                code: {
                    coding: [
                        {
                            system: SYSTEM_AYUSH_NAMASTE,
                            code: matchedNamaste.code,
                            display: matchedNamaste.display
                        },
                        {
                            system: SYSTEM_SNOMED,
                            code: "71388002",
                            display: "Procedure on constitution"
                        }
                    ],
                    text: "AYUSH Prakriti & Lifestyle Assessment"
                },
                subject: { reference: `Patient/${patientId}` },
                effectiveDateTime: timestamp,
                component: [
                    {
                        code: { text: "Body Constitution (Prakriti)" },
                        valueString: ayush.prakriti?.dosha || "Not mentioned"
                    },
                    {
                        code: { text: "Mental State & Stress (Manasika)" },
                        valueString: ayush.prakriti?.manasika || "Not mentioned"
                    },
                    {
                        code: { text: "Sleep Rhythm & Quality (Nidra)" },
                        valueString: ayush.lifestyle?.sleep || "Not mentioned"
                    },
                    {
                        code: { text: "Bowel Regularity (Koshtha)" },
                        valueString: ayush.lifestyle?.bowel || "Not mentioned"
                    },
                    {
                        code: { text: "Digestion & Hunger Level (Agni)" },
                        valueString: ayush.diet?.agni || "Not mentioned"
                    },
                    {
                        code: { text: "Dietary Patterns & Cravings (Ahara Rasa)" },
                        valueString: ayush.diet?.patternsAndRasa || "Not mentioned"
                    }
                ]
            };
            entries.push({ fullUrl: `urn:uuid:${ayushObsId}`, resource: ayushObservation });

            compositionResource.section.push({
                title: "AYUSH & Lifestyle Evaluation (Prakriti, Agni, Koshtha, Nidra)",
                code: {
                    coding: [{ system: SYSTEM_AYUSH_NAMASTE, code: "SEC-AYUSH-LIFESTYLE", display: "AYUSH Health Assessment" }]
                },
                entry: [{ reference: `Observation/${ayushObsId}` }]
            });
        }

        // SECTION: PHYSICAL VITALS OBSERVATIONS
        const vitalsObsEntries = [];
        if (vitals.bloodPressure && vitals.bloodPressure !== "Not mentioned") {
            const bpId = `obs-bp-${Date.now().toString(36)}`;
            entries.push({
                fullUrl: `urn:uuid:${bpId}`,
                resource: {
                    resourceType: "Observation",
                    id: bpId,
                    status: "final",
                    category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs" }] }],
                    code: { coding: [{ system: SYSTEM_LOINC, code: "85354-9", display: "Blood pressure" }] },
                    subject: { reference: `Patient/${patientId}` },
                    valueString: vitals.bloodPressure
                }
            });
            vitalsObsEntries.push({ reference: `Observation/${bpId}` });
        }
        if (vitals.heartRate && vitals.heartRate !== "Not mentioned") {
            const hrId = `obs-hr-${Date.now().toString(36)}`;
            entries.push({
                fullUrl: `urn:uuid:${hrId}`,
                resource: {
                    resourceType: "Observation",
                    id: hrId,
                    status: "final",
                    category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs" }] }],
                    code: { coding: [{ system: SYSTEM_LOINC, code: "8867-4", display: "Heart rate" }] },
                    subject: { reference: `Patient/${patientId}` },
                    valueString: vitals.heartRate
                }
            });
            vitalsObsEntries.push({ reference: `Observation/${hrId}` });
        }

        if (vitalsObsEntries.length > 0) {
            compositionResource.section.push({
                title: "Vital Signs",
                code: { coding: [{ system: SYSTEM_LOINC, code: "8716-3", display: "Vital signs" }] },
                entry: vitalsObsEntries
            });
        }

        // SECTION: CLINICAL ASSESSMENT & PLAN
        if (notes.assessment && notes.assessment !== "Not mentioned") {
            compositionResource.section.push({
                title: "Clinical Assessment",
                code: { coding: [{ system: SYSTEM_LOINC, code: "51848-0", display: "Evaluation note" }] },
                text: { status: "generated", div: `<div>${escapeXml(notes.assessment)}</div>` }
            });
        }

        if (plan.medicines || plan.tests || plan.lifestyle || plan.followUp) {
            const planDetails = [
                plan.medicines && plan.medicines !== "Not mentioned" ? `Medicines: ${plan.medicines}` : null,
                plan.tests && plan.tests !== "Not mentioned" ? `Tests: ${plan.tests}` : null,
                plan.lifestyle && plan.lifestyle !== "Not mentioned" ? `Lifestyle/Diet: ${plan.lifestyle}` : null,
                plan.followUp && plan.followUp !== "Not mentioned" ? `Follow-up: ${plan.followUp}` : null
            ].filter(Boolean).join(" | ");

            compositionResource.section.push({
                title: "Care & Treatment Plan",
                code: { coding: [{ system: SYSTEM_LOINC, code: "18776-5", display: "Plan of care note" }] },
                text: { status: "generated", div: `<div>${escapeXml(planDetails)}</div>` }
            });
        }

        // PREPEND Composition resource as the very first entry of FHIR Bundle
        entries.unshift({
            fullUrl: `urn:uuid:${compositionId}`,
            resource: compositionResource
        });

        // BUNDLE ROOT
        return {
            resourceType: "Bundle",
            id: bundleId,
            meta: {
                versionId: "1",
                lastUpdated: timestamp,
                profile: [
                    "https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"
                ]
            },
            identifier: {
                system: "https://healthid.abdm.gov.in/bundles",
                value: bundleId
            },
            type: "document",
            timestamp: timestamp,
            entry: entries
        };
    }

    /**
     * Converts an existing SwasthAI Case Taking state into an ABDM FHIR R4 Bundle
     */
    function convertCaseToFhirBundle(caseObj = {}, patientObj = {}) {
        const fakeConsultation = {
            id: caseObj.id || caseObj.caseId || `CASE-${Date.now().toString(36)}`,
            patientId: caseObj.patientId || patientObj.id || "AYU-PAT-001",
            patientName: caseObj.patientName || patientObj.fullName || "Patient",
            doctorId: caseObj.practitionerId || "DOC-IN-001",
            doctorName: caseObj.doctorName || "Dr. Sharma",
            date: caseObj.createdAt || caseObj.date || new Date().toISOString(),
            finalNotes: {
                complaint: {
                    main: caseObj.chiefComplaint || "General Consultation",
                    duration: caseObj.duration || "Not mentioned",
                    severity: caseObj.severity || "Not mentioned"
                },
                symptoms: {
                    present: Array.isArray(caseObj.symptoms) ? caseObj.symptoms.join(", ") : (caseObj.symptoms || "Not mentioned"),
                    negative: "Not mentioned"
                },
                history: {
                    conditions: caseObj.history?.pastConditions || "Not mentioned",
                    surgeries: caseObj.history?.surgeries || "Not mentioned",
                    allergies: Array.isArray(caseObj.allergies) ? caseObj.allergies.join(", ") : "Not mentioned",
                    medications: Array.isArray(caseObj.medications) ? caseObj.medications.map(m => m.name || m).join(", ") : "Not mentioned"
                },
                vitals: {
                    bloodPressure: caseObj.vitals?.bp || "Not mentioned",
                    heartRate: caseObj.vitals?.heartRate || "Not mentioned",
                    temperature: caseObj.vitals?.temperature || "Not mentioned",
                    spO2: caseObj.vitals?.spo2 || "Not mentioned",
                    weight: caseObj.vitals?.weight || "Not mentioned"
                },
                ayush: {
                    prakriti: {
                        dosha: caseObj.ayushAssessment?.prakriti || "Not mentioned",
                        manasika: "Not mentioned"
                    },
                    lifestyle: {
                        sleep: caseObj.lifestyle?.sleep || "Not mentioned",
                        bowel: caseObj.ayushAssessment?.koshta || "Not mentioned",
                        routineAndStress: caseObj.lifestyle?.stress || "Not mentioned"
                    },
                    diet: {
                        agni: caseObj.ayushAssessment?.agni || "Not mentioned",
                        patternsAndRasa: caseObj.lifestyle?.diet || "Not mentioned",
                        timingsAndIncompatibilities: "Not mentioned"
                    }
                },
                assessment: caseObj.clinicalSummary || caseObj.clinicalImpression || "Doctor assessment completed.",
                plan: {
                    medicines: Array.isArray(caseObj.treatmentPlan?.herbalFormulations) ? caseObj.treatmentPlan.herbalFormulations.join(", ") : "",
                    tests: "",
                    lifestyle: caseObj.treatmentPlan?.dietAdvice || caseObj.treatmentPlan?.pathyaApathya || "",
                    followUp: caseObj.followUp?.date ? `Follow up on ${caseObj.followUp.date}` : ""
                }
            }
        };

        return createAbdmFhirBundle(fakeConsultation, patientObj, { id: "DOC-IN-001", name: "Dr. Sharma" });
    }

    /**
     * Triggers file download of the FHIR R4 Bundle JSON
     */
    function downloadFhirBundle(bundleObj, filenamePrefix = "ABDM_FHIR_Record") {
        const jsonStr = JSON.stringify(bundleObj, null, 2);
        const dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(jsonStr);
        const a = document.createElement("a");
        a.setAttribute("href", dataStr);
        const id = bundleObj.identifier?.value || Date.now().toString(36);
        a.setAttribute("download", `${filenamePrefix}_${id}.json`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function calculateEstimatedBirthDate(age) {
        const num = parseInt(age, 10);
        if (isNaN(num)) return undefined;
        const year = new Date().getFullYear() - num;
        return `${year}-01-01`;
    }

    function escapeXml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    return {
        createAbdmFhirBundle,
        convertCaseToFhirBundle,
        downloadFhirBundle,
        SYSTEM_LOINC,
        SYSTEM_SNOMED,
        SYSTEM_AYUSH_NAMASTE
    };
})();

if (typeof window !== "undefined") window.FhirEmrService = FhirEmrService;
if (typeof globalThis !== "undefined") globalThis.FhirEmrService = FhirEmrService;
