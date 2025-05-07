const pino = require('pino');
const config = require('../config');

// Create base logger
const baseLogger = pino({
    level: config.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard'
        }
    }
});

// Create enhanced logger with custom methods
const logger = {
    ...baseLogger,
    
    // Log state changes
    stateChange: (userId, oldState, newState) => {
        baseLogger.info({
            type: 'state_change',
            userId,
            oldState,
            newState,
            timestamp: new Date().toISOString()
        });
    },

    // Log CS interaction
    csInteraction: (type, userId, csId, message) => {
        baseLogger.info({
            type: 'cs_interaction',
            interactionType: type,
            userId,
            csId,
            message,
            timestamp: new Date().toISOString()
        });
    },

    // Log errors with context
    errorWithContext: (error, context) => {
        baseLogger.error({
            type: 'error',
            error: {
                message: error.message,
                stack: error.stack
            },
            context,
            timestamp: new Date().toISOString()
        });
    },

    // Log message processing
    messageProcess: (userId, messageType, content, response) => {
        baseLogger.info({
            type: 'message_process',
            userId,
            messageType,
            content,
            response,
            timestamp: new Date().toISOString()
        });
    },

    // Standard logging methods
    info: (...args) => baseLogger.info(...args),
    error: (...args) => baseLogger.error(...args),
    warn: (...args) => baseLogger.warn(...args),
    debug: (...args) => baseLogger.debug(...args)
};

module.exports = logger;
