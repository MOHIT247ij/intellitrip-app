const crypto = require('crypto');

/** Generate a numeric OTP of the given length (default 6 digits). */
function generateOtp(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

/** Generate a random reference id, e.g. for mock transaction refs. */
function generateRef(prefix = 'REF') {
  return `${prefix}_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
}

module.exports = { generateOtp, generateRef };
