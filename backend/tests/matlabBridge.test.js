const path = require('path');
const fs = require('fs');

process.env.USE_MOCK_AI = 'false';
process.env.MATLAB_PATH = path.resolve(__dirname, '..', 'matlab-stub', 'matlab');

// eslint-disable-next-line global-require
const { runMATLABScreening } = require('../src/services/matlabService');

describe('MATLAB bridge (stub binary, USE_MOCK_AI=false)', () => {
  test('runs child_process plumbing, parses result.json, attaches URLs', async () => {
    const screeningId = `STUB-${Date.now()}`;
    const fixture = path.resolve(__dirname, 'fixtures', 'fundus.jpg');
    expect(fs.existsSync(fixture)).toBe(true);

    const result = await runMATLABScreening(fixture, screeningId);

    expect(result.prediction.grade).toBe(2);
    expect(result.prediction.referable).toBe(true);
    expect(result.explainability.gradcamUrl).toBe(`/uploads/results/${screeningId}/gradcam.png`);
    expect(result.explainability.overlayUrl).toBe(`/uploads/results/${screeningId}/overlay.png`);
    expect(result.explainability.annotationUrl).toBe(`/uploads/results/${screeningId}/lesion_annotation.png`);

    const outDir = path.resolve(process.cwd(), 'uploads', 'results', screeningId);
    ['result.json', 'gradcam.png', 'overlay.png', 'lesion_annotation.png'].forEach((f) => {
      expect(fs.existsSync(path.join(outDir, f))).toBe(true);
    });

    fs.rmSync(outDir, { recursive: true, force: true });
  }, 60000);
});
