const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const env = require('../config/env');

function mockResultPath() {
  return path.resolve(__dirname, '../../mocks/mockAIResult.json');
}

async function runMockAI(screeningId) {
  await new Promise((r) => setTimeout(r, 2000));
  const raw = await fs.readFile(mockResultPath(), 'utf8');
  const mock = JSON.parse(raw);
  mock.screeningId = screeningId;
  // Add full URLs for explainability images (same as real MATLAB path)
  mock.explainability = mock.explainability || {};
  mock.explainability.gradcamUrl = `/uploads/results/${screeningId}/gradcam.png`;
  mock.explainability.overlayUrl = `/uploads/results/${screeningId}/overlay.png`;
  mock.explainability.annotationUrl = `/uploads/results/${screeningId}/lesion_annotation.png`;
  
  // Create output directory and copy placeholder images (like stub does)
  const outputDir = path.resolve(process.cwd(), env.uploadDir, 'results', String(screeningId));
  await fs.mkdir(outputDir, { recursive: true });
  const mocksDir = path.resolve(__dirname, '../../mocks');
  await fs.copyFile(path.join(mocksDir, 'mockGradcam.png'), path.join(outputDir, 'gradcam.png'));
  await fs.copyFile(path.join(mocksDir, 'mockGradcam.png'), path.join(outputDir, 'overlay.png'));
  await fs.copyFile(path.join(mocksDir, 'mockGradcam.png'), path.join(outputDir, 'lesion_annotation.png'));
  
  return mock;
}

async function runMATLABScreening(imagePath, screeningId) {
  if (env.useMockAI) return runMockAI(screeningId);

  const outputDir = path.resolve(process.cwd(), env.uploadDir, 'results', String(screeningId));
  await fs.mkdir(outputDir, { recursive: true });

  const absImage = path.resolve(imagePath);
  const cmd = `${env.matlabPath} -batch "run_screening('${absImage}','${outputDir}')"`;

  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 120000 }, async (err, stdout, stderr) => {
      if (err) {
        const e = new Error(`MATLAB error: ${stderr || err.message}`);
        e.statusCode = 500;
        e.code = 'AI_PROCESSING_ERROR';
        return reject(e);
      }
      try {
        const json = await fs.readFile(path.join(outputDir, 'result.json'), 'utf8');
        const result = JSON.parse(json);
        result.explainability = result.explainability || {};
        result.explainability.gradcamUrl = `/uploads/results/${screeningId}/gradcam.png`;
        result.explainability.overlayUrl = `/uploads/results/${screeningId}/overlay.png`;
        result.explainability.annotationUrl = `/uploads/results/${screeningId}/lesion_annotation.png`;
        return resolve(result);
      } catch (e) {
        const ex = new Error(`Failed to read MATLAB output: ${e.message}`);
        ex.statusCode = 500;
        ex.code = 'AI_PROCESSING_ERROR';
        return reject(ex);
      }
    });
  });
}

module.exports = { runMATLABScreening, runMockAI };
