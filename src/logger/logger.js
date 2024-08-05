import log from 'loglevel';

const logLevel = process.env.REACT_APP_LOG_LEVEL || 'none';

if (logLevel !== 'none') {
  log.setLevel(logLevel);
} else {
  log.setLevel('silent'); 
}

const logger = (level, ...args) => {
  switch (level) {
    case 'trace':
      log.trace(...args);
      break;
    case 'debug':
      log.debug(...args);
      break;
    case 'info':
      log.info(...args);
      break;
    case 'warn':
      log.warn(...args);
      break;
    case 'error':
      log.error(...args);
      break;
    default:
      log.info(...args); 
      break;
  }
};

export default logger;
