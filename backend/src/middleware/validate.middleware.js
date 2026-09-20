function validate(schema, source) {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : source === 'params' ? req.params : req.body;
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map((d) => ({ field: d.path.join('.'), message: d.message }))
      });
    }
    if (source === 'query') req.query = value;
    else if (source === 'params') req.params = value;
    else req.body = value;
    return next();
  };
}

module.exports = validate;
