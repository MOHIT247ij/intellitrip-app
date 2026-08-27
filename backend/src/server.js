/**
 * server.js
 * Entry point: starts the HTTP server and verifies the MySQL
 * connection via Prisma before accepting traffic.
 */
const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');
const logger = require('./config/logger');

async function start() {
  try {
    await prisma.$connect();
    logger.info('Connected to MySQL database.');
  } catch (err) {
    logger.error('Failed to connect to the database. Check DATABASE_URL in backend/.env.', { message: err.message });
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    logger.info(`IntelliTrip API listening on http://localhost:${env.port} (${env.nodeEnv})`);
    if (!env.gemini.apiKey) {
      logger.warn('GEMINI_API_KEY is not set — AI Planner will use deterministic fallback itineraries.');
    }
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
