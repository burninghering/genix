import {logger} from "./winston";
import morgan from "morgan";

const combined = ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
const common = ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length]'

const format = () => {
    return process.env.NODE_ENV === 'prd' ? combined : common
}

const stream = { write: (message) => logger.http(message) }

const skip = (_, res) => {
    if (process.env.NODE_ENV === 'prd') return res.statusCode < 400
    return false
}

const morganMiddleware = morgan(format(), { stream, skip })

export {morganMiddleware};