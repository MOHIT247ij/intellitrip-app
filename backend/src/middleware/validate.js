/**
 * validate.js
 * Generic middleware factory that validates req.body (or query/params)
 * against a Zod schema before the request reaches the controller.
 * Keeps controllers free of manual `if (!field) ...` checks.
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      return res.status(422).json({ success: false, message: message || 'Invalid request data.' });
    }
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
