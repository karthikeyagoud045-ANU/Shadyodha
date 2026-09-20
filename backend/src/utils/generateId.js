const { v4: uuidv4 } = require('uuid');

function generateId(prefix) {
  const short = uuidv4().split('-')[0].toUpperCase();
  return prefix ? `${prefix}-${short}` : short;
}

module.exports = generateId;
