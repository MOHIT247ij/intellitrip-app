const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

async function hash(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function compare(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

module.exports = { hash, compare };
