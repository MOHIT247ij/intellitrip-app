/**
 * apiResponse.js
 * Consistent response envelope for every endpoint in the API.
 *   Success: { success: true, data }
 *   Error:   { success: false, message }
 * Keeping this in one helper guarantees the frontend never has to
 * guess the shape of a response.
 */

function success(res, data = {}, statusCode = 200, meta = undefined) {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

function error(res, message = 'Something went wrong', statusCode = 400) {
  return res.status(statusCode).json({ success: false, message });
}

module.exports = { success, error };
