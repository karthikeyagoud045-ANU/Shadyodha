function success(res, data, message, statusCode) {
  const body = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode || 200).json(body);
}

function failure(res, error, code, statusCode) {
  return res.status(statusCode || 400).json({ success: false, error, code });
}

module.exports = { success, failure };
