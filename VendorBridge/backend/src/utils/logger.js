// Logger utility for consistent logging
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatLog = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level,
    message,
  };

  if (data) {
    logEntry.data = data;
  }

  return logEntry;
};

// Console colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const logger = {
  error: (message, data = null) => {
    const log = formatLog(LOG_LEVELS.ERROR, message, data);
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `${colors.red}[${log.timestamp}] ${log.level}: ${log.message}${colors.reset}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    } else {
      console.error(JSON.stringify(log));
    }
  },

  warn: (message, data = null) => {
    const log = formatLog(LOG_LEVELS.WARN, message, data);
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `${colors.yellow}[${log.timestamp}] ${log.level}: ${log.message}${colors.reset}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    } else {
      console.warn(JSON.stringify(log));
    }
  },

  info: (message, data = null) => {
    const log = formatLog(LOG_LEVELS.INFO, message, data);
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `${colors.cyan}[${log.timestamp}] ${log.level}: ${log.message}${colors.reset}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    } else {
      console.log(JSON.stringify(log));
    }
  },

  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const log = formatLog(LOG_LEVELS.DEBUG, message, data);
      console.log(
        `${colors.gray}[${log.timestamp}] ${log.level}: ${log.message}${colors.reset}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    }
  },
};

export default logger;
