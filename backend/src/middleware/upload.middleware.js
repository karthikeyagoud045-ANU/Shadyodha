const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');

const originalDir = path.resolve(process.cwd(), env.uploadDir, 'original');
fs.mkdirSync(originalDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, originalDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  }
});

const ALLOWED = ['image/jpeg', 'image/png', 'image/tiff'];

function fileFilter(req, file, cb) {
  if (ALLOWED.includes(file.mimetype)) return cb(null, true);
  const err = new Error('Only JPEG, PNG or TIFF images are allowed');
  err.code = 'UPLOAD_ERROR';
  err.statusCode = 400;
  return cb(err);
}

const upload = multer({
  storage,
  limits: { fileSize: env.maxFileSize },
  fileFilter
});

module.exports = upload;
