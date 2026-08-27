/**
 * logger.js — minimal structured console logger.
 * Kept dependency-free (no winston/pino) to stay easy to explain in a viva.
 */
const levelColor = { info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m', debug: '\x1b[90m' };
const reset = '\x1b[0m';

function log(level, message, meta) {
  const color = levelColor[level] || '';
  const ts = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  // eslint-disable-next-line no-console
  console.log(`${color}[${ts}] [${level.toUpperCase()}]${reset} ${message}${metaStr}`);
}

module.exports = {
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => {
    if (process.env.NODE_ENV === 'development') log('debug', msg, meta);
  },
};
