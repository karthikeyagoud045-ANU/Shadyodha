const fs = require('fs').promises;
const path = require('path');
const env = require('../config/env');

function relativeUploadPath(...parts) {
  return path.join(...parts).replace(/\\/g, '/');
}

async function ensureDirs() {
  await fs.mkdir(path.resolve(process.cwd(), env.uploadDir, 'original'), { recursive: true });
  await fs.mkdir(path.resolve(process.cwd(), env.uploadDir, 'results'), { recursive: true });
}

async function deleteFile(absPath) {
  try {
    await fs.unlink(absPath);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
}

module.exports = { relativeUploadPath, ensureDirs, deleteFile };
