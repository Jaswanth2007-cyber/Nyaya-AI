import pino from 'pino';

// Structured JSON logging (Pino) in place of raw console.log/console.error --
// every log line carries a level, timestamp, and structured fields, so it
// can be piped into any log aggregator without text-parsing.
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info'
});
