import bunyan, { LogLevel } from 'bunyan';
import dotenv from 'dotenv';
dotenv.config();

const log = bunyan.createLogger({ name: 'MalaguideApp' });
log.level(process.env.BUNYAN_LEVEL as LogLevel);

export default log;
