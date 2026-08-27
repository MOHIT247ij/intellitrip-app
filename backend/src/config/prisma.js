/**
 * prisma.js
 * -----------------------------------------------------------------
 * Single shared PrismaClient instance.
 *
 * WHY PRISMA?  Prisma is an ORM (Object-Relational Mapper) — it lets
 * our Node.js code call `prisma.user.findUnique(...)` instead of
 * writing raw SQL strings. It generates a type-safe client from
 * `prisma/schema.prisma`, manages migrations, and automatically
 * parameterizes every query (protecting us from SQL injection).
 *
 * We instantiate ONE client and reuse it everywhere (a new
 * PrismaClient per request would exhaust MySQL connections).
 * -----------------------------------------------------------------
 */
const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const prisma = new PrismaClient({
  log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
