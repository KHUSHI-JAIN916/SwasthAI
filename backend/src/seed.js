require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Patient = require("./models/Patient");
const Case = require("./models/Case");
const CaseTimeline = require("./models/CaseTimeline");
const Consultation = require("./models/Consultation");
const Prescription = require("./models/Prescription");
const HealthReading = require("./models/HealthReading");
const AuditLog = require("./models/AuditLog");
const FollowUp = require("./models/FollowUp");

const seedDatabase = async () => {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/swasthai";
        console.log(`🌱 Connecting to MongoDB at ${uri}...`);
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ MongoDB connected for seeding.");

        // Clear existing test data
        await Promise.all([
            User.deleteMany({}),
            Patient.deleteMany({}),
            Case.deleteMany({}),
            CaseTimeline.deleteMany({}),
            Consultation.deleteMany({}),
            Prescription.deleteMany({}),
            HealthReading.deleteMany({}),
            AuditLog.deleteMany({}),
            FollowUp.deleteMany({})
        ]);

        console.log("🧹 Cleared old collections.");

        // 1. Create Admin & Practitioners
        const defaultPasswordHash = await User.hashPassword("123456");

        const adminUser = await User.create({
            name: "System Administrator",
            email: "admin@ayush.com",
            phone: "+91 99999 00000",
            passwordHash: defaultPasswordHash,
            role: "admin",
            hospitalName: "Central Health Administration",
            specialty: "Clinical Informatics & Compliance",
            license: "ADMIN-GOV-2026-01"
        });

        const doctorSharma = await User.create({
            name: "Dr. Sharma",
            email: "doctor@ayush.com",
            phone: "+91 98765 00000",
            passwordHash: defaultPasswordHash,
            role: "practitioner",
            hospitalName: "AIIMS Partner Hospital",
            specialty: "Ayurveda General Medicine & Panchakarma",
            license: "AYU-REG-2021-9988"
        });

        const doctorVerma = await User.create({
            name: "Dr. Verma",
            email: "dr.verma@ayush.com",
            phone: "+91 98765 00001",
            passwordHash: defaultPasswordHash,
            role: "practitioner",
            hospitalName: "Safdarjung AYUSH Center",
            specialty: "Kaya Chikitsa & Chronic Disease Management",
            license: "AYU-REG-2019-4455"
        });

        console.log("✅ Seeded Admin & 2 Practitioners.");

        // 2. Create 5 Realistic Patients
        const patientRajesh = await Patient.create({
            patientId: "AYU-2026-DEMO",
            fullName: "Rajesh Patel",
            age: 58,
            dob: "1968-04-12",
            gender: "Male",
            bloodGroup: "B+",
            phone: "+91 98765 43210",
            email: "rajesh.patel@email.com",
            address: "42 MG Road, Ahmedabad, Gujarat",
            occupation: "Senior Civil Engineer",
            emergencyName: "Meena Patel (Spouse)",
            emergencyPhone: "+91 98765 43211",
            allergies: "Penicillin (Severe hives, angioedema)",
            allergyStatus: "known",
            conditions: "Hypertension (diagnosed 2021)",
            currentMedications: "Amlodipine 5mg OD",
            prakriti: "Pitta-Vata",
            status: "active",
            registeredDate: "2026-08-15",
            passwordHash: defaultPasswordHash,
            patientReportedDiseases: [
                {
                    id: "DIS-01",
                    diseaseName: "Hyperacidity (Amlapitta)",
                    severity: "Moderate",
                    duration: "6 months",
                    symptoms: "Acid reflux, sour belching after meals",
                    notes: "Worsens after spicy tea"
                }
            ],
            pastDoctorRecords: [
                {
                    id: "DOC-REC-01",
                    doctorName: "Dr. K. Mehta (Cardiologist)",
                    clinicOrHospital: "Apollo Hospital Ahmedabad",
                    year: "2021",
                    diagnosis: "Essential Hypertension Stage 1",
                    pastMedicines: "Amlodipine 5mg",
                    notes: "Advised low-salt diet and regular blood pressure monitoring."
                }
            ]
        });

        const patientRahul = await Patient.create({
            patientId: "AYU-2026-001",
            fullName: "Rahul Kumar",
            age: 32,
            dob: "1994-06-21",
            gender: "Male",
            bloodGroup: "O+",
            phone: "+91 98234 11223",
            email: "rahul.kumar@email.com",
            address: "Sector 14, Noida, UP",
            occupation: "Software Architect",
            emergencyName: "Sunita Kumar (Mother)",
            emergencyPhone: "+91 98234 11224",
            allergies: "No Known Drug Allergies (NKDA)",
            allergyStatus: "no_known_allergies",
            conditions: "Chronic Tension Headache, Work Stress",
            currentMedications: "None regular",
            prakriti: "Vata",
            status: "active",
            registeredDate: "2026-08-20",
            passwordHash: defaultPasswordHash
        });

        const patientPriya = await Patient.create({
            patientId: "AYU-2026-002",
            fullName: "Priya Sharma",
            age: 28,
            dob: "1998-11-05",
            gender: "Female",
            bloodGroup: "A+",
            phone: "+91 97112 33445",
            email: "priya.sharma@email.com",
            address: "Model Town, Delhi",
            occupation: "Teacher",
            emergencyName: "Anil Sharma (Father)",
            emergencyPhone: "+91 97112 33446",
            allergies: "Sulfa drugs (Skin rash)",
            allergyStatus: "known",
            conditions: "Digestive Discomfort, Acidity",
            currentMedications: "Antacid syrup SOS",
            prakriti: "Pitta",
            status: "followup",
            registeredDate: "2026-08-25",
            passwordHash: defaultPasswordHash
        });

        const patientAmit = await Patient.create({
            patientId: "AYU-2026-003",
            fullName: "Amit Verma",
            age: 45,
            dob: "1981-02-17",
            gender: "Male",
            bloodGroup: "B-",
            phone: "+91 98101 55667",
            email: "amit.verma@email.com",
            address: "Banjara Hills, Hyderabad, Telangana",
            occupation: "Bank Manager",
            emergencyName: "Kavita Verma (Spouse)",
            emergencyPhone: "+91 98101 55668",
            allergies: "Aspirin (Bronchospasm)",
            allergyStatus: "known",
            conditions: "Early Osteoarthritis Knee (Sandhigata Vata)",
            currentMedications: "Glucosamine supplements",
            prakriti: "Vata-Kapha",
            status: "active",
            registeredDate: "2026-09-01",
            passwordHash: defaultPasswordHash
        });

        const patientSunita = await Patient.create({
            patientId: "AYU-2026-004",
            fullName: "Sunita Rao",
            age: 52,
            dob: "1974-09-30",
            gender: "Female",
            bloodGroup: "AB+",
            phone: "+91 98450 77889",
            email: "sunita.rao@email.com",
            address: "Indiranagar, Bengaluru, Karnataka",
            occupation: "Homemaker",
            emergencyName: "Ramesh Rao (Spouse)",
            emergencyPhone: "+91 98450 77890",
            allergies: "No Known Drug Allergies (NKDA)",
            allergyStatus: "no_known_allergies",
            conditions: "Type 2 Diabetes Mellitus (Madhumeha)",
            currentMedications: "Metformin 500mg BD",
            prakriti: "Kapha-Pitta",
            status: "active",
            registeredDate: "2026-09-10",
            passwordHash: defaultPasswordHash
        });

        console.log("✅ Seeded 5 Patients.");

        // 3. Create Demo Case for Rajesh Patel
        const demoCase = await Case.create({
            caseId: "CASE-DEMO-2026",
            patientId: "AYU-2026-DEMO",
            patientName: "Rajesh Patel",
            doctorName: "Dr. Sharma",
            chiefComplaint: "Abdominal Pain & Post-Meal Heartburn (Amlapitta)",
            symptoms: [
                "Right Upper Quadrant Abdominal Pain (radiating posteriorly)",
                "Post-prandial burning sensation (Vidaha)",
                "Mild nausea without emesis",
                "Sour belching (Amlodgara)"
            ],
            duration: "3 days (since Saturday evening)",
            severity: "Moderate (5/10, worsening after oily meals)",
            location: "Right Upper Quadrant / Epigastric Region",
            history: {
                pastConditions: "Hypertension (diagnosed 2021, on Amlodipine 5mg)",
                surgeries: "Appendectomy (2014, uncomplicated)",
                familyHistory: "Father had gallstone disease (Cholelithiasis); Mother had Type 2 Diabetes",
                lifestyle: "High stress desk job, sedentary, irregular meal times, consumes 3-4 cups tea daily"
            },
            medications: [
                { name: "Amlodipine", dose: "5mg", frequency: "OD (Morning)", reason: "Hypertension", duration: "Ongoing", instructions: "After Breakfast" },
                { name: "Pantoprazole", dose: "40mg", frequency: "OD (Empty stomach)", reason: "Gastric protection", duration: "7 days", instructions: "Before Breakfast" }
            ],
            allergies: [
                { allergen: "Penicillin", severity: "High (Anaphylaxis/Angioedema)", reaction: "Hives & facial swelling" }
            ],
            vitals: {
                bp: "128/82 mmHg",
                heartRate: "76 bpm",
                temperature: "98.4 °F",
                spo2: "99%",
                weight: "68 kg"
            },
            clinicalSummary: "58-year-old male with known hypertension presenting with 3-day history of right hypochondriac pain with post-prandial burning sensation.",
            aiAnalysis: {
                summary: "Clinical presentation strongly suggests Pitta-Vataja Shoola with Amlapitta (Hyperacidity/GERD). Differential includes Biliary Colic vs Reflux Gastritis.",
                primaryDosha: "Pitta-Vata",
                confidenceScore: 0.94,
                differentialPossibilities: ["Amlapitta (GERD)", "Pittashaya Shoola (Biliary colic)", "Parinama Shoola (Duodenal ulcer)"]
            },
            redFlags: [
                { flag: "Post-prandial RUQ Pain with Family History of Gallstones", severity: "MODERATE", trigger: "Biliary colic rule-out recommended", action: "Perform Ultrasound Abdomen" }
            ],
            missingInformation: [
                { field: "Lipid Profile", question: "Recent fasting lipid panel available?" }
            ],
            ayushAssessment: {
                prakriti: "Pitta-Vata",
                vikriti: "Pitta Vriddhi with Samana Vayu Dushti",
                agni: "Vishamagni",
                koshta: "Madhyama"
            },
            status: "AI REVIEW",
            date: "2026-09-24"
        });

        console.log("✅ Seeded demo case.");

        // 4. Create Demo Prescription
        await Prescription.create({
            prescriptionId: "RX-DEMO-2026",
            patientId: "AYU-2026-DEMO",
            patientName: "Rajesh Patel",
            doctorName: "Dr. Sharma",
            caseId: "CASE-DEMO-2026",
            diagnosis: "Pitta-Vata Shoola & Amlapitta (Hyperacidity)",
            medicines: [
                {
                    name: "Avipattikar Churna",
                    form: "Churna",
                    dose: "3 grams",
                    frequency: "Morning & Night (1-0-1)",
                    timing: "Before Meals",
                    instructions: "Before Meals with Warm Water",
                    duration: "14 Days",
                    reason: "Pitta Shamana & Agni Deepana"
                },
                {
                    name: "Sutshekhar Ras (Plain)",
                    form: "Tablet",
                    dose: "125 mg (1 Tab)",
                    frequency: "Thrice Daily (1-1-1)",
                    timing: "After Meals",
                    instructions: "After Meals with Honey/Water",
                    duration: "10 Days",
                    reason: "Acidity relief & gastric mucosal soothing"
                },
                {
                    name: "Amlodipine 5mg",
                    form: "Tablet",
                    dose: "5 mg (1 Tab)",
                    frequency: "Morning (1-0-0)",
                    timing: "After Meals",
                    instructions: "Regular BP Medication",
                    duration: "Ongoing",
                    reason: "Hypertension control"
                }
            ],
            advice: "Avoid spicy, deeply fried foods. Take light meals at regular hours. 30 mins morning walking.",
            recommendedTests: "Ultrasound Abdomen & Liver Function Test (LFT)",
            followupDate: "2026-10-05",
            status: "active",
            date: "2026-09-24"
        });

        console.log("✅ Seeded demo prescription.");

        // 5. Create Health Readings for Rajesh Patel (7 historical days + 1 abnormal)
        const vitalsSeed = [
            {
                readingId: "VIT-SEED-1",
                systolic: 146,
                diastolic: 94,
                bloodSugar: 148,
                sugarType: "postprandial",
                heartRate: 84,
                spo2: 97,
                temperature: 98.6,
                weight: 68.4,
                notes: "Felt mild throbbing sensation in temples after afternoon meeting.",
                date: "2026-09-24",
                time: "08:15 AM",
                evalInfo: {
                    isAbnormal: true,
                    severity: "warning",
                    abnormalAlerts: [],
                    warnings: [
                        "Stage 1 Hypertension (146/94 mmHg)",
                        "Elevated Blood Sugar (148 mg/dL)"
                    ],
                    disclaimer: "These are screening indicators only, not medical diagnoses. Practitioner review required."
                }
            },
            {
                readingId: "VIT-SEED-2",
                systolic: 130,
                diastolic: 84,
                bloodSugar: 104,
                sugarType: "fasting",
                heartRate: 78,
                spo2: 98,
                temperature: 98.4,
                weight: 68.3,
                notes: "Normal morning reading before breakfast.",
                date: "2026-09-23",
                time: "08:30 AM",
                evalInfo: { isAbnormal: false, severity: "normal", abnormalAlerts: [], warnings: [] }
            },
            {
                readingId: "VIT-SEED-3",
                systolic: 126,
                diastolic: 80,
                bloodSugar: 95,
                sugarType: "fasting",
                heartRate: 74,
                spo2: 99,
                temperature: 98.2,
                weight: 68.1,
                notes: "Good rest, no headache.",
                date: "2026-09-22",
                time: "08:10 AM",
                evalInfo: { isAbnormal: false, severity: "normal", abnormalAlerts: [], warnings: [] }
            },
            {
                readingId: "VIT-SEED-4",
                systolic: 134,
                diastolic: 86,
                bloodSugar: 112,
                sugarType: "fasting",
                heartRate: 80,
                spo2: 98,
                temperature: 98.5,
                weight: 68.4,
                notes: "Took morning walk for 25 mins.",
                date: "2026-09-21",
                time: "08:45 AM",
                evalInfo: { isAbnormal: false, severity: "normal", abnormalAlerts: [], warnings: [] }
            },
            {
                readingId: "VIT-SEED-5",
                systolic: 128,
                diastolic: 82,
                bloodSugar: 99,
                sugarType: "fasting",
                heartRate: 75,
                spo2: 99,
                temperature: 98.4,
                weight: 68.2,
                notes: "",
                date: "2026-09-20",
                time: "08:20 AM",
                evalInfo: { isAbnormal: false, severity: "normal", abnormalAlerts: [], warnings: [] }
            },
            {
                readingId: "VIT-SEED-6",
                systolic: 132,
                diastolic: 84,
                bloodSugar: 102,
                sugarType: "fasting",
                heartRate: 77,
                spo2: 98,
                temperature: 98.3,
                weight: 68.5,
                notes: "",
                date: "2026-09-19",
                time: "08:15 AM",
                evalInfo: { isAbnormal: false, severity: "normal", abnormalAlerts: [], warnings: [] }
            },
            {
                readingId: "VIT-SEED-7",
                systolic: 125,
                diastolic: 81,
                bloodSugar: 96,
                sugarType: "fasting",
                heartRate: 73,
                spo2: 99,
                temperature: 98.1,
                weight: 68.0,
                notes: "",
                date: "2026-09-18",
                time: "08:05 AM",
                evalInfo: { isAbnormal: false, severity: "normal", abnormalAlerts: [], warnings: [] }
            }
        ];

        for (const v of vitalsSeed) {
            await HealthReading.create({
                readingId: v.readingId,
                patientId: "AYU-2026-DEMO",
                systolic: v.systolic,
                diastolic: v.diastolic,
                bloodSugar: v.bloodSugar,
                sugarType: v.sugarType,
                heartRate: v.heartRate,
                spo2: v.spo2,
                temperature: v.temperature,
                weight: v.weight,
                notes: v.notes,
                date: v.date,
                time: v.time,
                recordedAt: new Date(v.date + "T08:00:00Z"),
                evalInfo: v.evalInfo,
                evaluation: v.evalInfo,
                createdBy: "patient"
            });
        }

        console.log("✅ Seeded demo health readings with screening alerts.");

        // 6. Create Consultation Notes
        await Consultation.create({
            consultationId: "CNS-DEMO-2026",
            caseId: "CASE-DEMO-2026",
            patientId: "AYU-2026-DEMO",
            patientName: "Rajesh Patel",
            doctorName: "Dr. Sharma",
            durationSeconds: 420,
            date: "2026-09-24",
            time: "10:30 AM",
            transcript: "Doctor: Namaste Rajesh ji, how are you feeling today? Patient: Doctor sahab, since last 3 days I have burning pain in upper right stomach especially after eating spicy meals. Doctor: Are you having any nausea? Patient: Yes mild sour burping in the throat. Doctor: Let us check your vitals and start Avipattikar Churna.",
            speakerTurns: [
                { speaker: "Doctor", text: "Namaste Rajesh ji, how are you feeling today?", timestamp: "00:05" },
                { speaker: "Patient", text: "Doctor sahab, since last 3 days I have burning pain in upper right stomach especially after eating spicy meals.", timestamp: "00:22" },
                { speaker: "Doctor", text: "Are you having any nausea?", timestamp: "00:35" },
                { speaker: "Patient", text: "Yes mild sour burping in the throat.", timestamp: "00:48" }
            ],
            aiGeneratedNotes: {
                subjective: "Patient reports 3-day history of post-prandial right upper quadrant burning discomfort with acid regurgitation.",
                objective: "BP 146/94 mmHg, HR 84 bpm, SpO2 97%. Mild epigastric tenderness.",
                assessment: "Amlapitta with Pitta-Vata vitiation. Rule out cholelithiasis.",
                plan: "Avipattikar Churna 3g BD before meals, Sutshekhar Ras 125mg BD, USG abdomen advised."
            },
            structuredNotes: {
                complaintMain: "Abdominal Pain & Acid Reflux",
                complaintDuration: "3 Days",
                complaintSeverity: "5/10",
                assessment: "Amlapitta (Hyperacidity / GERD) with Pitta Dushti",
                doctorNotes: "Patient reminded to avoid late-night dinners and heavy fried foods."
            },
            isFinalized: true
        });

        console.log("✅ Seeded consultation document.");

        // 7. Create Follow-up
        await FollowUp.create({
            followupId: "FOL-DEMO-2026",
            patientId: "AYU-2026-DEMO",
            caseId: "CASE-DEMO-2026",
            doctorName: "Dr. Sharma",
            scheduledDate: "2026-10-05",
            reason: "Review response to Avipattikar Churna and review Ultrasound Abdomen report",
            notes: "Check BP trend and glycemic response.",
            status: "scheduled"
        });

        console.log("✅ Seeded follow-up appointment.");

        // 8. Create Timeline Events
        await CaseTimeline.create([
            {
                patientId: "AYU-2026-DEMO",
                caseId: "CASE-DEMO-2026",
                category: "Registration",
                title: "Patient Registered at OPD",
                details: "Rajesh Patel registered with ID AYU-2026-DEMO. Medical history logged.",
                icon: "fa-user-check",
                tag: "Registration",
                date: "2026-08-15"
            },
            {
                patientId: "AYU-2026-DEMO",
                caseId: "CASE-DEMO-2026",
                category: "Case Initiation",
                title: "Adaptive Clinical Case Recorded",
                details: "Chief complaint: Right Upper Quadrant Pain with post-prandial heartburn.",
                icon: "fa-folder-plus",
                tag: "Case Intake",
                date: "2026-09-24"
            },
            {
                patientId: "AYU-2026-DEMO",
                caseId: "CASE-DEMO-2026",
                category: "Vitals",
                title: "Daily Health Reading Logged (08:15 AM)",
                details: "BP 146/94, Sugar 148 mg/dL, HR 84 bpm, SpO2 97%. ⚠️ Screening Alert: Stage 1 Hypertension.",
                icon: "fa-heart-pulse",
                tag: "Abnormal Vitals",
                date: "2026-09-24"
            },
            {
                patientId: "AYU-2026-DEMO",
                caseId: "CASE-DEMO-2026",
                category: "Consultation",
                title: "OPD Consultation Conducted by Dr. Sharma",
                details: "Conducted clinical interview with AI Scribe notes generation.",
                icon: "fa-comments",
                tag: "Consultation",
                date: "2026-09-24"
            },
            {
                patientId: "AYU-2026-DEMO",
                caseId: "CASE-DEMO-2026",
                category: "Prescription",
                title: "Prescription Issued by Dr. Sharma",
                details: "Avipattikar Churna 3g BD, Sutshekhar Ras 125mg BD prescribed.",
                icon: "fa-prescription",
                tag: "Treatment",
                date: "2026-09-24"
            }
        ]);

        console.log("✅ Seeded timeline events.");

        // 9. Create Audit Logs
        await AuditLog.create([
            {
                userId: String(doctorSharma._id),
                role: "practitioner",
                action: "PRACTITIONER Login",
                entityType: "Authentication",
                entityId: String(doctorSharma._id),
                description: "Dr. Sharma logged in to OPD Dashboard"
            },
            {
                userId: "AYU-2026-DEMO",
                role: "patient",
                action: "HEALTH_READING_CREATED",
                entityType: "HealthReading",
                entityId: "VIT-SEED-1",
                description: "BP 146/94, Sugar 148 mg/dL. Patient: AYU-2026-DEMO"
            },
            {
                userId: String(doctorSharma._id),
                role: "practitioner",
                action: "PRESCRIPTION_CREATED",
                entityType: "Prescription",
                entityId: "RX-DEMO-2026",
                description: "Dr. Sharma prescribed 3 medicines for Rajesh Patel"
            }
        ]);

        console.log("✅ Seeded audit records.");

        console.log(`
=========================================================
🎉 SWASTHAI Database Seed Completed Successfully!
=========================================================
🔑 Credentials:
   • Admin:         admin@ayush.com / 123456
   • Doctor 1:      doctor@ayush.com / 123456
   • Doctor 2:      dr.verma@ayush.com / 123456
   • Patient (Demo):AYU-2026-DEMO / 123456
   • Patient 2:     AYU-2026-001 / 123456
=========================================================
        `);

        process.exit(0);
    } catch (err) {
        console.error("❌ Seed Error:", err);
        process.exit(1);
    }
};

seedDatabase();
