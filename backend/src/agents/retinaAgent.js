const path = require('path');
const { runMATLABScreening } = require('../services/matlabService');

async function analyzeImage(screening) {
  const absImage = path.resolve(process.cwd(), screening.uploadedImage.filePath);
  const result = await runMATLABScreening(absImage, screening.screeningId || String(screening._id));
  return result;
}

module.exports = { analyzeImage };
