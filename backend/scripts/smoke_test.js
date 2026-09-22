const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const fs = require('fs').promises;

const User = require('../src/models/User');
const Patient = require('../src/models/Patient');
const Screening = require('../src/models/Screening');
const { runPipeline } = require('../src/agents/orchestrator');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/drishti_ai';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔬 Starting Integration Smoke Test...');
  
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 2. Create mock Health Worker user if none exists
    let user = await User.findOne({ role: 'health_worker' });
    if (!user) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('Worker@123', 12);
      user = await User.create({
        name: 'Smoke Test Worker',
        email: `smoke-${Date.now()}@drishti.ai`,
        password: hash,
        role: 'health_worker'
      });
      console.log('✅ Created test health worker');
    } else {
      console.log('✅ Found existing health worker');
    }

    // 3. Create mock Patient
    let patient = await Patient.findOne({ email: { $exists: false } }); // Any patient
    if (!patient) {
      patient = await Patient.create({
        name: 'Smoke Test Patient',
        age: 55,
        gender: 'male',
        village: 'Test Village',
        district: 'Test District',
        isDiabetic: true,
        diabetesDurationYears: 5,
        registeredBy: user._id
      });
      console.log('✅ Created test patient');
    } else {
      console.log('✅ Found existing patient');
    }

    // 4. Create Screening document with status="registered"
    const fixturePath = path.resolve(__dirname, '../tests/fixtures/fundus.jpg');
    const destDir = path.resolve(process.cwd(), UPLOAD_DIR, 'original');
    await fs.mkdir(destDir, { recursive: true });
    const destFile = path.join(destDir, 'test-smoke.jpg');
    await fs.copyFile(fixturePath, destFile);
    console.log('✅ Copied test fixture to uploads/original/test-smoke.jpg');

    const screening = await Screening.create({
      patient: patient._id,
      patientId: patient._id,
      healthWorkerId: user._id,
      status: 'registered',
      uploadedImage: {
        fileName: 'test-smoke.jpg',
        filePath: path.join('uploads', 'original', 'test-smoke.jpg').replace(/\\/g, '/'),
        fileSize: (await fs.stat(fixturePath)).size,
        mimeType: 'image/jpeg',
        uploadTimestamp: new Date()
      },
      auditTrail: [
        { timestamp: new Date(), userId: user._id, action: 'SCREENING_CREATED', details: 'Screening registered for smoke test' },
        { timestamp: new Date(), userId: user._id, action: 'STATUS_IMAGE_UPLOADED', details: 'Image uploaded: test-smoke.jpg' }
      ]
    });
    console.log(`✅ Created screening: ${screening.screeningId} (${screening._id})`);

    // 5. Call orchestrator.runPipeline directly
    console.log('🚀 Running orchestrator pipeline...');
    const result = await runPipeline(screening._id, user._id);
    console.log(`✅ Pipeline completed with status: ${result.status}`);

    // 6. Poll database until status is ai_completed or error
    let attempts = 0;
    const maxAttempts = 30;
    while (attempts < maxAttempts) {
      const fresh = await Screening.findById(screening._id);
      if (fresh.status === 'ai_completed' || fresh.status === 'error' || fresh.status === 'completed' || fresh.status === 'review_pending') {
        console.log(`📊 Final status: ${fresh.status}`);
        break;
      }
      await sleep(1000);
      attempts++;
    }

    // 7. ASSERTIONS
    const final = await Screening.findById(screening._id);
    
    console.log('\n📋 Running assertions...');
    
    // Assertion 1: Status is ai_completed (or review_pending/completed for non-referable)
    const validFinalStatuses = ['ai_completed', 'review_pending', 'completed'];
    if (!validFinalStatuses.includes(final.status)) {
      throw new Error(`Status is ${final.status}, expected one of ${validFinalStatuses.join(', ')}`);
    }
    console.log('✅ Status is valid final state');

    // Assertion 2: aiResult.grade is a number 0-4
    if (final.aiResult === undefined || final.aiResult.grade === undefined) {
      throw new Error('aiResult.grade is missing');
    }
    const grade = final.aiResult.grade;
    if (!Number.isInteger(grade) || grade < 0 || grade > 4) {
      throw new Error(`aiResult.grade is ${grade}, expected integer 0-4`);
    }
    console.log(`✅ aiResult.grade = ${grade} (valid 0-4)`);

    // Assertion 3: explainability.gradcamUrl starts with "/uploads/"
    if (!final.explainability || !final.explainability.gradcamUrl) {
      throw new Error('explainability.gradcamUrl is missing');
    }
    if (!final.explainability.gradcamUrl.startsWith('/uploads/')) {
      throw new Error(`gradcamUrl is ${final.explainability.gradcamUrl}, expected to start with /uploads/`);
    }
    console.log(`✅ gradcamUrl = ${final.explainability.gradcamUrl}`);

    // Assertion 4: File exists on disk
    const gradcamPath = path.resolve(process.cwd(), final.explainability.gradcamUrl.replace(/^\//, ''));
    const fileExists = await fs.access(gradcamPath).then(() => true).catch(() => false);
    if (!fileExists) {
      throw new Error(`Grad-CAM file not found at ${gradcamPath}`);
    }
    console.log(`✅ Grad-CAM file exists at ${gradcamPath}`);

    // Additional assertions for v1.2 features
    console.log('\n📋 v1.2 Integration assertions...');
    
    // Triage object has all required fields including routingFlag
    if (!final.triage || !final.triage.priority || !final.triage.isReferable) {
      throw new Error('Triage object missing required fields');
    }
    console.log(`✅ Triage: priority=${final.triage.priority}, isReferable=${final.triage.isReferable}`);

    // isReferable invariant: grade >= 2 === isReferable
    const expectedReferable = grade >= 2;
    if (final.triage.isReferable !== expectedReferable) {
      throw new Error(`INVARIANT VIOLATED: isReferable=${final.triage.isReferable} but grade=${grade} (expected ${expectedReferable})`);
    }
    console.log('✅ INVARIANT HOLDS: isReferable === (grade >= 2)');

    // Audit trail has entries
    if (!final.auditTrail || final.auditTrail.length < 3) {
      throw new Error('Audit trail missing entries');
    }
    console.log(`✅ Audit trail has ${final.auditTrail.length} entries`);

    console.log('\n🎉 ===========================');
    console.log('✅ SMOKE TEST PASSED');
    console.log('===========================');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ===========================');
    console.error('❌ SMOKE TEST FAILED');
    console.error('===========================');
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();