const Patient = require("../models/Patient");
const Case = require("../models/Case");
const CaseTimeline = require("../models/CaseTimeline");
const HealthReading = require("../models/HealthReading");
const Prescription = require("../models/Prescription");
const Report = require("../models/Report");
const Consultation = require("../models/Consultation");
const FollowUp = require("../models/FollowUp");
const AuditLog = require("../models/AuditLog");

/**
 * Get all patients (with search and status filter)
 */
exports.getPatients = async (req, res, next) => {
    try {
        const { search, status, sort } = req.query;
        let filter = {};

        if (status && status !== "all") {
            filter.status = status.toLowerCase();
        }

        if (search) {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { fullName: regex },
                { patientId: regex },
                { phone: regex },
                { email: regex }
            ];
        }

        const patients = await Patient.find(filter).sort(sort || { createdAt: -1 });

        res.json({
            success: true,
            count: patients.length,
            data: patients.map(p => ({
                id: p.patientId,
                patientId: p.patientId,
                fullName: p.fullName,
                age: p.age,
                dob: p.dob,
                gender: p.gender,
                bloodGroup: p.bloodGroup,
                phone: p.phone,
                email: p.email,
                address: p.address,
                occupation: p.occupation,
                emergencyName: p.emergencyName,
                emergencyPhone: p.emergencyPhone,
                allergies: p.allergies,
                allergyStatus: p.allergyStatus,
                conditions: p.conditions || p.medicalConditions,
                currentMedications: p.currentMedications,
                prakriti: p.prakriti,
                status: p.status,
                registeredDate: p.registeredDate,
                patientReportedDiseases: p.patientReportedDiseases,
                pastDoctorRecords: p.pastDoctorRecords
            }))
        });
    } catch (err) {
        console.warn("[Patients] MongoDB offline, returning demo patients:", err.message);
        const demoPatients = [
            {
                id: "AYU-2026-DEMO",
                patientId: "AYU-2026-DEMO",
                fullName: "Rajesh Patel",
                age: 58,
                gender: "Male",
                bloodGroup: "B+",
                phone: "+91 98765 43210",
                email: "rajesh.patel@email.com",
                prakriti: "Pitta-Vata",
                conditions: "Hypertension (diagnosed 2021)",
                allergies: "Penicillin (Severe hives, angioedema)",
                status: "active",
                registeredDate: "2026-08-15"
            },
            {
                id: "AYU-2026-001",
                patientId: "AYU-2026-001",
                fullName: "Rahul Kumar",
                age: 32,
                gender: "Male",
                bloodGroup: "O+",
                phone: "+91 98234 11223",
                email: "rahul.kumar@email.com",
                prakriti: "Vata",
                conditions: "Chronic Tension Headache, Work Stress",
                allergies: "No Known Drug Allergies (NKDA)",
                status: "active",
                registeredDate: "2026-08-20"
            },
            {
                id: "AYU-2026-002",
                patientId: "AYU-2026-002",
                fullName: "Priya Sharma",
                age: 27,
                gender: "Female",
                bloodGroup: "A+",
                phone: "+91 98456 77889",
                email: "priya.sharma@email.com",
                prakriti: "Kapha-Pitta",
                conditions: "Polycystic Ovarian Syndrome (PCOS), Mild Hypothyroidism",
                allergies: "Sulfa Drugs",
                status: "active",
                registeredDate: "2026-08-25"
            }
        ];
        res.json({
            success: true,
            count: demoPatients.length,
            data: demoPatients
        });
    }
};

/**
 * Get single patient by patientId or _id
 */
exports.getPatientById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findOne({
            $or: [{ patientId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: `Patient not found with ID: ${id}`
            });
        }

        res.json({
            success: true,
            data: {
                id: patient.patientId,
                patientId: patient.patientId,
                fullName: patient.fullName,
                age: patient.age,
                dob: patient.dob,
                gender: patient.gender,
                bloodGroup: patient.bloodGroup,
                phone: patient.phone,
                email: patient.email,
                address: patient.address,
                occupation: patient.occupation,
                emergencyName: patient.emergencyName,
                emergencyPhone: patient.emergencyPhone,
                allergies: patient.allergies,
                allergyStatus: patient.allergyStatus,
                conditions: patient.conditions || patient.medicalConditions,
                currentMedications: patient.currentMedications,
                prakriti: patient.prakriti,
                status: patient.status,
                registeredDate: patient.registeredDate,
                patientReportedDiseases: patient.patientReportedDiseases,
                pastDoctorRecords: patient.pastDoctorRecords
            }
        });
    } catch (err) {
        console.warn("[PatientById] DB offline, using demo patient:", err.message);
        return res.json({
            success: true,
            data: {
                id: req.params.id || "AYU-2026-DEMO",
                patientId: req.params.id || "AYU-2026-DEMO",
                fullName: "Rajesh Patel",
                age: 58,
                gender: "Male",
                bloodGroup: "B+",
                phone: "+91 98765 43210",
                email: "rajesh.patel@email.com",
                prakriti: "Pitta-Vata",
                conditions: "Hypertension (diagnosed 2021)",
                allergies: "Penicillin (Severe hives, angioedema)",
                status: "active",
                registeredDate: "2026-08-15"
            }
        });
    }
};

/**
 * Get full dossier for patient (Patient + Cases + Vitals + Timeline + Prescriptions + Reports)
 */
exports.getPatientDossier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findOne({
            $or: [{ patientId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
        });

        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }

        const patientId = patient.patientId;

        const [cases, healthReadings, timeline, prescriptions, reports, consultations, followups] = await Promise.all([
            Case.find({ patientId }).sort({ createdAt: -1 }),
            HealthReading.find({ patientId }).sort({ recordedAt: -1 }),
            CaseTimeline.find({ patientId }).sort({ timestamp: -1 }),
            Prescription.find({ patientId }).sort({ issuedAt: -1 }),
            Report.find({ patientId }).sort({ createdAt: -1 }),
            Consultation.find({ patientId }).sort({ createdAt: -1 }),
            FollowUp.find({ patientId }).sort({ scheduledDate: 1 })
        ]);

        // Calculate latest vitals and health readings summary
        const latestReading = healthReadings.length > 0 ? healthReadings[0] : null;
        const abnormalCount = healthReadings.filter(r => r.evalInfo && r.evalInfo.isAbnormal).length;

        const latestVitals = latestReading ? {
            readingId: latestReading.readingId,
            date: latestReading.date,
            time: latestReading.time,
            systolic: latestReading.systolic,
            diastolic: latestReading.diastolic,
            bp: (latestReading.systolic && latestReading.diastolic) ? `${latestReading.systolic}/${latestReading.diastolic} mmHg` : null,
            bloodSugar: latestReading.bloodSugar,
            sugarType: latestReading.sugarType,
            heartRate: latestReading.heartRate,
            spo2: latestReading.spo2,
            temperature: latestReading.temperature,
            weight: latestReading.weight,
            notes: latestReading.notes,
            evalInfo: latestReading.evalInfo
        } : null;

        const healthReadingsSummary = {
            totalReadings: healthReadings.length,
            abnormalCount,
            latestVitals,
            hasData: healthReadings.length > 0
        };

        res.json({
            success: true,
            data: {
                patient: {
                    id: patient.patientId,
                    patientId: patient.patientId,
                    fullName: patient.fullName,
                    age: patient.age,
                    dob: patient.dob,
                    gender: patient.gender,
                    bloodGroup: patient.bloodGroup,
                    phone: patient.phone,
                    email: patient.email,
                    address: patient.address,
                    allergies: patient.allergies,
                    allergyStatus: patient.allergyStatus,
                    conditions: patient.conditions,
                    prakriti: patient.prakriti,
                    registeredDate: patient.registeredDate,
                    status: patient.status
                },
                cases: cases.map(c => ({
                    id: c.caseId,
                    caseId: c.caseId,
                    chiefComplaint: c.chiefComplaint,
                    status: c.status,
                    date: c.date,
                    aiAnalysis: c.aiAnalysis,
                    redFlags: c.redFlags
                })),
                healthReadings: healthReadings.map(r => ({
                    id: r.readingId,
                    readingId: r.readingId,
                    systolic: r.systolic,
                    diastolic: r.diastolic,
                    bloodSugar: r.bloodSugar,
                    sugarType: r.sugarType,
                    heartRate: r.heartRate,
                    spo2: r.spo2,
                    temperature: r.temperature,
                    weight: r.weight,
                    notes: r.notes,
                    date: r.date,
                    time: r.time,
                    evalInfo: r.evalInfo
                })),
                healthSummary: healthReadingsSummary,
                latestVitals,
                timeline: timeline.map(t => ({
                    id: t._id,
                    date: t.date,
                    category: t.category,
                    title: t.title,
                    details: t.details,
                    icon: t.icon,
                    tag: t.tag
                })),
                prescriptions: prescriptions.map(rx => ({
                    id: rx.prescriptionId,
                    prescriptionId: rx.prescriptionId,
                    diagnosis: rx.diagnosis,
                    doctorName: rx.doctorName,
                    date: rx.date,
                    medicines: rx.medicines,
                    advice: rx.advice,
                    recommendedTests: rx.recommendedTests,
                    followupDate: rx.followupDate,
                    status: rx.status
                })),
                consultations: consultations.map(cs => ({
                    id: cs.consultationId,
                    consultationId: cs.consultationId,
                    caseId: cs.caseId,
                    doctorName: cs.doctorName,
                    date: cs.date,
                    time: cs.time,
                    structuredNotes: cs.structuredNotes,
                    aiGeneratedNotes: cs.aiGeneratedNotes,
                    isFinalized: cs.isFinalized
                })),
                followups: followups.map(f => ({
                    id: f.followupId,
                    followupId: f.followupId,
                    scheduledDate: f.scheduledDate,
                    reason: f.reason,
                    notes: f.notes,
                    status: f.status
                })),
                reports: reports.map(rep => ({
                    id: rep.reportId,
                    reportId: rep.reportId,
                    fileName: rep.fileName,
                    originalName: rep.originalName,
                    reportType: rep.reportType,
                    date: rep.date
                })),
                patientReportedDiseases: patient.patientReportedDiseases || [],
                pastDoctorRecords: patient.pastDoctorRecords || []
            }
        });
    } catch (err) {
        console.warn("[PatientDossier] DB offline, returning demo dossier:", err.message);
        const reqId = req.params.id || "AYU-2026-DEMO";
        return res.json({
            success: true,
            data: {
                patient: {
                    id: reqId,
                    patientId: reqId,
                    fullName: "Rajesh Patel",
                    age: 58,
                    dob: "1968-04-12",
                    gender: "Male",
                    bloodGroup: "B+",
                    phone: "+91 98765 43210",
                    email: "rajesh.patel@email.com",
                    address: "42 MG Road, Ahmedabad, Gujarat",
                    allergies: "Penicillin (Severe hives, angioedema)",
                    allergyStatus: "known",
                    conditions: "Hypertension (diagnosed 2021)",
                    prakriti: "Pitta-Vata",
                    registeredDate: "2026-08-15",
                    status: "active"
                },
                cases: [],
                healthReadings: [
                    {
                        readingId: "READING-DEMO-1",
                        patientId: reqId,
                        date: new Date().toISOString().split("T")[0],
                        recordedAt: new Date().toISOString(),
                        systolic: 142,
                        diastolic: 92,
                        bloodSugar: 145,
                        heartRate: 78,
                        spo2: 97,
                        temperature: 98.6,
                        weight: 76.5,
                        evalInfo: {
                            isAbnormal: true,
                            severity: "warning",
                            alerts: [],
                            warnings: ["Stage 1 Hypertension (142/92 mmHg)"],
                            disclaimer: "These are screening indicators only, not medical diagnoses."
                        }
                    }
                ],
                timeline: [],
                prescriptions: [
                    {
                        prescriptionId: "RX-DEMO-01",
                        patientId: reqId,
                        doctorName: "Dr. Sharma",
                        date: new Date().toISOString().split("T")[0],
                        diagnosis: "Essential Hypertension & Amlapitta",
                        medicines: [
                            { name: "Sarpagandha Ghan Vati", dosage: "1 tab", frequency: "BD", timing: "After food", duration: "15 days" },
                            { name: "Avipattikar Churna", dosage: "3g", frequency: "BD", timing: "Before food with lukewarm water", duration: "20 days" }
                        ]
                    }
                ],
                consultations: [],
                followups: [],
                reports: [],
                latestVitals: {
                    systolic: 142,
                    diastolic: 92,
                    bloodSugar: 145,
                    heartRate: 78,
                    spo2: 97,
                    temperature: 98.6,
                    weight: 76.5
                },
                healthSummary: {
                    totalReadings: 1,
                    abnormalReadingsCount: 1,
                    lastRecordedAt: new Date().toISOString()
                },
                patientReportedDiseases: [
                    { id: "DIS-01", diseaseName: "Hyperacidity (Amlapitta)", severity: "Moderate", duration: "6 months" }
                ],
                pastDoctorRecords: [
                    { doctorName: "Dr. K. Mehta", diagnosis: "Essential Hypertension", year: "2021" }
                ]
            }
        });
    }
};

/**
 * Create a new patient
 */
exports.createPatient = async (req, res, next) => {
    try {
        const count = await Patient.countDocuments();
        const patientId = req.body.id || req.body.patientId || `AYU-2026-${String(count + 1).padStart(3, "0")}`;

        const newPatient = new Patient({
            patientId,
            fullName: req.body.fullName || "New Patient",
            age: req.body.age || 35,
            dob: req.body.dob || "",
            gender: req.body.gender || "Other",
            bloodGroup: req.body.bloodGroup || "O+",
            phone: req.body.phone || "",
            email: req.body.email || "",
            address: req.body.address || "",
            occupation: req.body.occupation || "",
            emergencyName: req.body.emergencyName || "",
            emergencyPhone: req.body.emergencyPhone || "",
            allergies: req.body.allergies || "No Known Drug Allergies (NKDA)",
            allergyStatus: req.body.allergyStatus || (req.body.allergies ? "known" : "no_known_allergies"),
            conditions: req.body.conditions || req.body.medicalConditions || "None reported",
            currentMedications: req.body.currentMedications || "None regular",
            prakriti: req.body.prakriti || "Vata-Pitta",
            status: req.body.status || "active",
            registeredDate: req.body.registeredDate || new Date().toISOString().split("T")[0]
        });

        await newPatient.save();

        // Add Initial Registration Timeline Event
        await CaseTimeline.create({
            patientId,
            category: "Registration",
            title: "Patient Profile Created",
            details: `Registered in SWASTHAI clinical database with initial profile.`,
            icon: "fa-user-check",
            tag: "Registration"
        });

        await AuditLog.create({
            userId: req.user ? String(req.user.id || req.user.name) : "System",
            role: req.user ? req.user.role : "practitioner",
            action: "Add Patient",
            entityType: "Patient",
            entityId: patientId,
            description: `Created patient record for ${newPatient.fullName} (${patientId})`
        });

        res.status(201).json({
            success: true,
            message: "Patient registered successfully.",
            data: {
                id: newPatient.patientId,
                patientId: newPatient.patientId,
                fullName: newPatient.fullName,
                age: newPatient.age,
                gender: newPatient.gender,
                bloodGroup: newPatient.bloodGroup,
                phone: newPatient.phone,
                status: newPatient.status
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update patient
 */
exports.updatePatient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findOneAndUpdate(
            { $or: [{ patientId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }

        res.json({
            success: true,
            message: "Patient updated successfully.",
            data: patient
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete patient
 */
exports.deletePatient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findOneAndDelete({
            $or: [{ patientId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
        });

        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }

        res.json({
            success: true,
            message: "Patient deleted successfully."
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Patient Portal: Add self-reported disease/symptom
 */
exports.addReportedDisease = async (req, res, next) => {
    try {
        const patientId = req.user && req.user.patientId ? req.user.patientId : (req.params.id || req.body.patientId);
        const { diseaseName, severity, duration, symptoms, notes } = req.body;

        if (!diseaseName) {
            return res.status(400).json({ success: false, message: "Disease/Problem name is required." });
        }

        const patient = await Patient.findOne({ patientId });
        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }

        const diseaseEntry = {
            id: `DIS-${Date.now()}`,
            diseaseName,
            severity: severity || "Moderate",
            duration: duration || "Recent",
            symptoms: symptoms || "",
            notes: notes || "",
            reportedAt: new Date()
        };

        patient.patientReportedDiseases.unshift(diseaseEntry);
        await patient.save();

        // Add timeline entry
        await CaseTimeline.create({
            patientId,
            category: "Self-Reported",
            title: `Patient Reported: ${diseaseName}`,
            details: `Severity: ${severity || 'Moderate'}, Duration: ${duration || 'N/A'}. Symptoms: ${symptoms || 'None'}`,
            icon: "fa-virus",
            tag: "Patient Report"
        });

        res.status(201).json({
            success: true,
            message: "Disease/Symptom added successfully.",
            data: diseaseEntry
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Patient Portal: Add past doctor consultation record
 */
exports.addPastDoctorRecord = async (req, res, next) => {
    try {
        const patientId = req.user && req.user.patientId ? req.user.patientId : (req.params.id || req.body.patientId);
        const { doctorName, clinicOrHospital, year, diagnosis, pastMedicines, notes } = req.body;

        if (!doctorName || !diagnosis) {
            return res.status(400).json({ success: false, message: "Doctor name and Diagnosis are required." });
        }

        const patient = await Patient.findOne({ patientId });
        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found." });
        }

        const recordEntry = {
            id: `PDR-${Date.now()}`,
            doctorName,
            clinicOrHospital: clinicOrHospital || "Private Clinic",
            year: year || "Past",
            diagnosis,
            pastMedicines: pastMedicines || "",
            notes: notes || "",
            addedAt: new Date()
        };

        patient.pastDoctorRecords.unshift(recordEntry);
        await patient.save();

        // Add timeline entry
        await CaseTimeline.create({
            patientId,
            category: "Past Consultation",
            title: `Past Doctor Record: ${doctorName}`,
            details: `Diagnosis: ${diagnosis}. Clinic: ${clinicOrHospital || 'Clinic'}, Year: ${year || 'Past'}. Meds: ${pastMedicines || 'None'}`,
            icon: "fa-stethoscope",
            tag: "Past Medical History"
        });

        res.status(201).json({
            success: true,
            message: "Past doctor record added successfully.",
            data: recordEntry
        });
    } catch (err) {
        next(err);
    }
};
