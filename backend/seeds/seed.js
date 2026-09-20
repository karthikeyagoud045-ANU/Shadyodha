const bcrypt = require('bcryptjs');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Patient = require('../src/models/Patient');
const Screening = require('../src/models/Screening');

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Screening.deleteMany({})
  ]);

  const hash = (pw) => bcrypt.hash(pw, 12);
  const [adminHash, workerHash, doctorHash] = await Promise.all([
    hash('Admin@123'),
    hash('Worker@123'),
    hash('Doctor@123')
  ]);

  const [admin, asha1, asha2, doctor] = await User.create([
    { name: 'Admin', email: 'admin@drishti.ai', password: adminHash, role: 'admin', facility: 'HQ' },
    { name: 'ASHA Worker 1', email: 'asha1@drishti.ai', password: workerHash, role: 'health_worker', phone: '9000000001', facility: 'PHC Rampur' },
    { name: 'ASHA Worker 2', email: 'asha2@drishti.ai', password: workerHash, role: 'health_worker', phone: '9000000002', facility: 'PHC Belapur' },
    { name: 'Dr. Sharma', email: 'dr.sharma@drishti.ai', password: doctorHash, role: 'ophthalmologist', phone: '9000000003', facility: 'District Hospital' }
  ]);

  const patients = await Patient.create([
    { name: 'Ramesh Patel', age: 58, gender: 'male', phone: '9111111111', village: 'Rampur', district: 'Nashik', isDiabetic: true, diabetesDurationYears: 8, registeredBy: asha1._id },
    { name: 'Sunita Yadav', age: 52, gender: 'female', phone: '9222222222', village: 'Belapur', district: 'Nashik', isDiabetic: true, diabetesDurationYears: 5, registeredBy: asha1._id },
    { name: 'Mohan Singh', age: 63, gender: 'male', phone: '9333333333', village: 'Shirpur', district: 'Dhule', isDiabetic: true, diabetesDurationYears: 12, registeredBy: asha2._id },
    { name: 'Lakshmi Devi', age: 47, gender: 'female', phone: '9444444444', village: 'Rampur', district: 'Nashik', isDiabetic: true, diabetesDurationYears: 3, registeredBy: asha2._id },
    { name: 'Arjun Pawar', age: 60, gender: 'male', phone: '9555555555', village: 'Sinnar', district: 'Nashik', isDiabetic: true, diabetesDurationYears: 10, registeredBy: asha1._id }
  ]);

  await Screening.create([
    {
      patient: patients[0]._id,
      healthWorkerId: asha1._id,
      status: 'completed',
      uploadedImage: { fileName: 'fundus1.jpg', filePath: 'uploads/original/fundus1.jpg', fileSize: 512000, mimeType: 'image/jpeg', uploadTimestamp: new Date() },
      qualityAssessment: { gradable: true, score: 0.9, focusScore: 0.88, illuminationScore: 0.92, fovPercentage: 94, issues: [], recommendation: 'Image quality acceptable' },
      aiResult: { grade: 0, label: 'No DR', confidence: 0.95, calibratedConfidence: 0.93, referable: false, rawScores: [0.95, 0.02, 0.01, 0.01, 0.01], modelVersion: 'drishti-resnet101-v1', processingTimeMs: 4000 },
      triage: { priority: 'ROUTINE', action: 'ROUTINE_SCREENING', isReferable: false, recommendedTimeline: 'Next screening in 2 years' },
      auditTrail: [{ userId: asha1._id, action: 'SCREENING_CREATED', details: 'Seed data' }]
    },
    {
      patient: patients[1]._id,
      healthWorkerId: asha1._id,
      status: 'review_pending',
      uploadedImage: { fileName: 'fundus2.jpg', filePath: 'uploads/original/fundus2.jpg', fileSize: 612000, mimeType: 'image/jpeg', uploadTimestamp: new Date() },
      qualityAssessment: { gradable: true, score: 0.92, focusScore: 0.88, illuminationScore: 0.91, fovPercentage: 94.5, issues: [], recommendation: 'Image quality acceptable' },
      aiResult: { grade: 2, label: 'Moderate NPDR', confidence: 0.87, calibratedConfidence: 0.84, referable: true, rawScores: [0.02, 0.05, 0.87, 0.04, 0.02], modelVersion: 'drishti-resnet101-v1', processingTimeMs: 4200 },
      triage: { priority: 'MEDIUM', action: 'OPHTHALMOLOGIST_REVIEW', isReferable: true, recommendedTimeline: 'Ophthalmologist review within 7 days' },
      auditTrail: [{ userId: asha1._id, action: 'SCREENING_CREATED', details: 'Seed data' }]
    },
    {
      patient: patients[2]._id,
      healthWorkerId: asha2._id,
      status: 'referred',
      uploadedImage: { fileName: 'fundus3.jpg', filePath: 'uploads/original/fundus3.jpg', fileSize: 700000, mimeType: 'image/jpeg', uploadTimestamp: new Date() },
      qualityAssessment: { gradable: true, score: 0.89, focusScore: 0.86, illuminationScore: 0.9, fovPercentage: 93, issues: [], recommendation: 'Image quality acceptable' },
      aiResult: { grade: 4, label: 'Proliferative DR', confidence: 0.91, calibratedConfidence: 0.89, referable: true, rawScores: [0.01, 0.01, 0.03, 0.04, 0.91], modelVersion: 'drishti-resnet101-v1', processingTimeMs: 4500 },
      triage: { priority: 'URGENT', action: 'IMMEDIATE_REFERRAL', isReferable: true, recommendedTimeline: 'Immediate ophthalmologist review required' },
      review: { assignedTo: doctor._id, status: 'confirmed', decision: 'confirmed', clinicalNote: 'Seed review', reviewedAt: new Date() },
      auditTrail: [{ userId: asha2._id, action: 'SCREENING_CREATED', details: 'Seed data' }]
    }
  ]);

  // eslint-disable-next-line no-console
  console.log(`Seeded: admin ${admin.email}, workers, doctor ${doctor.email}, 5 patients, 3 screenings`);
  process.exit(0);
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err.message);
  process.exit(1);
});
