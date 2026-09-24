const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const assert = require('assert');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

console.log('--- Test 1: Vital Signs Evaluation Engine ---');
const { evaluateVitals } = require('../src/controllers/health.controller');

// Normal reading
const normal = evaluateVitals({
    systolic: 120,
    diastolic: 80,
    bloodSugar: 95,
    heartRate: 72,
    spo2: 98,
    temperature: 98.6
});
assert.strictEqual(normal.isAbnormal, false, 'Normal reading should not be abnormal');
assert.strictEqual(normal.severity, 'normal', 'Severity should be normal');
assert(normal.disclaimer.includes('screening indicators only'), 'Must include clinical disclaimer');
console.log('  [PASS] Normal vitals evaluated correctly');

// Crisis reading
const crisis = evaluateVitals({ systolic: 185, diastolic: 122 });
assert.strictEqual(crisis.isAbnormal, true, 'Crisis reading must be abnormal');
assert.strictEqual(crisis.severity, 'critical', 'Severity should be critical');
assert(crisis.abnormalAlerts.some(a => a.includes('Hypertensive Crisis')), 'Alert must mention crisis');
console.log('  [PASS] Hypertensive crisis detected with critical severity');

// Hypoglycemia
const lowSugar = evaluateVitals({ bloodSugar: 52 });
assert.strictEqual(lowSugar.isAbnormal, true);
assert(lowSugar.abnormalAlerts.some(a => a.includes('Hypoglycemia Indicator')));
console.log('  [PASS] Hypoglycemia screening alert detected');

// SpO2 desaturation
const lowOxygen = evaluateVitals({ spo2: 85 });
assert.strictEqual(lowOxygen.isAbnormal, true);
assert.strictEqual(lowOxygen.severity, 'critical');
assert(lowOxygen.abnormalAlerts.some(a => a.includes('Critical SpO2 Desaturation')));
console.log('  [PASS] Critical SpO2 desaturation alert detected');

// High fever
const fever = evaluateVitals({ temperature: 104.2 });
assert.strictEqual(fever.isAbnormal, true);
assert(fever.abnormalAlerts.some(a => a.includes('High Fever')));
console.log('  [PASS] High fever alert detected');

console.log('\n--- Test 2: Input Validation ---');
const { validateHealthReading } = require('../src/validators/health.validator');

const validPayload = { systolic: 125, diastolic: 82, heartRate: 74 };
const resValid = validateHealthReading(validPayload);
assert.strictEqual(resValid.valid, true);
assert.strictEqual(resValid.errors.length, 0);
console.log('  [PASS] Valid health reading passed');

const emptyPayload = {};
const resEmpty = validateHealthReading(emptyPayload);
assert.strictEqual(resEmpty.valid, false);
console.log('  [PASS] Empty payload rejected');

const outOfRangePayload = { systolic: 450 };
const resRange = validateHealthReading(outOfRangePayload);
assert.strictEqual(resRange.valid, false);
console.log('  [PASS] Out-of-range vital rejected');

console.log('\n--- Test 3: JWT & Bcrypt Cryptography ---');
const secret = 'test-secret-key-12345678901234567890';
const payload = { id: 'usr_001', role: 'practitioner', email: 'doctor@ayush.com' };
const token = jwt.sign(payload, secret, { expiresIn: '1h' });
const decoded = jwt.verify(token, secret);
assert.strictEqual(decoded.id, 'usr_001');
assert.strictEqual(decoded.role, 'practitioner');
console.log('  [PASS] JWT signing and verification verified');

const password = 'Doctor@123';
const salt = bcrypt.genSaltSync(10);
const hashed = bcrypt.hashSync(password, salt);
assert(bcrypt.compareSync(password, hashed));
assert(!bcrypt.compareSync('WrongPassword', hashed));
console.log('  [PASS] Bcrypt password hashing and verification verified');

console.log('\n--- Test 4: Route Module Exports ---');
const authRoutes = require('../src/routes/auth.routes');
const patientRoutes = require('../src/routes/patient.routes');
const healthRoutes = require('../src/routes/health.routes');
const consultationRoutes = require('../src/routes/consultation.routes');
const prescriptionRoutes = require('../src/routes/prescription.routes');
const reportRoutes = require('../src/routes/report.routes');
const analyticsRoutes = require('../src/routes/analytics.routes');
const aiRoutes = require('../src/routes/ai.routes');

assert(typeof authRoutes === 'function');
assert(typeof patientRoutes === 'function');
assert(typeof healthRoutes === 'function');
assert(typeof consultationRoutes === 'function');
assert(typeof prescriptionRoutes === 'function');
assert(typeof reportRoutes === 'function');
assert(typeof analyticsRoutes === 'function');
assert(typeof aiRoutes === 'function');
console.log('  [PASS] All 8 route modules successfully export Express routers');

console.log('\n======================================================');
console.log('  SUCCESS: ALL 4 VERIFICATION TEST SUITES PASSED!');
console.log('======================================================\n');
