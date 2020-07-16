const winston = require('winston');
require('dotenv').config();

const getLabel = function (callingModule) {
    var parts = callingModule.filename.split('/');
    return parts[parts.length - 2] + '/' + parts.pop();
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

var logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(),
        errorStackFormat(),
        // winston.format.json(),
        // winston.format.simple(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
            if (stack) {
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
        new winston.transports.Console({
            format: winston.format.combine(winston.format.timestamp(),
                errorStackFormat(),
                winston.format.colorize(),
                winston.format.printf(({ level, message, timestamp, stack }) => {
                    if (stack) {
                        return `${timestamp} ${level}: ${message} - ${stack}`;
                    }
                    return `${timestamp} ${level}: ${message}`;
                }),
            )
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'exception.log' }),
        new winston.transports.Console({
            format: winston.format.combine(winston.format.timestamp(),
                errorStackFormat(),
                // winston.format.json(),
                // winston.format.simple(),
                winston.format.printf(({ level, message, timestamp, stack }) => {
                    if (stack) {
                        return `${timestamp} ${level}: ${message} - ${stack}`;
                    }
                    return `${timestamp} ${level}: ${message}`;
                }),
            )
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    // logger.add();
}

class Logger {
    constructor(callingModule) {
        this.callingModule = callingModule;
        this.label = "[" + getLabel(this.callingModule) + "] " ;
    }

    info(msg) {
        // msg.message = this.label + msg.message;
        logger.info(msg);
    }

    error(err) {
        if(err.message){
            err.message = this.label + err.message;
        }
        
        logger.error(err);
    }
}
module.exports = function (callingModule) {
    return new Logger(callingModule);
};