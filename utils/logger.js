const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info", // Log levels: error, warn, info, http, verbose, debug, silly
  format: format.combine(
    format.timestamp({ format: "DD-MM-YYYY HH:mm" }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
  ),
  transports: [
    // Console Transport
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
        })
      ),
    }),
    // File Transport for error logs
    new transports.File({ filename: "logs/error.log", level: "error" }),
    // File Transport for all logs
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

// For development, log additional details
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
    })
  );
}

module.exports = logger;
