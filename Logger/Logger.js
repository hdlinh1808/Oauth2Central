const winston = require('winston');
require('dotenv').config();

const getLabel = function (callingModule) {
    const parts = callingModule.filename.split(path.sep);
    return path.join(parts[parts.length - 2], parts.pop());
};

const errorStackFormat = winston.format(info => {
    if (info instanceof Error) {
        return Object.assign({}, info, {
            stack: info.stack,
            message: info.message
        })
    }
    return info
})

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(),
        errorStackFormat(),
        // winston.format.json(),
        // winston.format.simple(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
            if (stack) {
                // print log trace 
                return `${timestamp} ${level}: ${message} - ${stack}`;
            }
            return `${timestamp} ${level}: ${message}`;
        }),
    ),
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `info.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'info.log' }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'exception.log' }),
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(winston.format.timestamp(),
            errorStackFormat(),
            // winston.format.json(),
            // winston.format.simple(),
            winston.format.printf(({ level, message, timestamp, stack }) => {
                if (stack) {
                    // print log trace 
                    return `${timestamp} ${level}: ${message} - ${stack}`;
                }
                return `${timestamp} ${level}: ${message}`;
            }),
        )
    }));
}

module.exports = logger;