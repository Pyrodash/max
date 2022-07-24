import { join } from 'path'
import winston from 'winston'

const rootPath = process.env.LOGS_PATH || join(__dirname, '..', '..', 'logs')

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: join(rootPath, 'all.log') }),
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: join(rootPath, 'exceptions.log'),
        }),
    ],
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    )
}
