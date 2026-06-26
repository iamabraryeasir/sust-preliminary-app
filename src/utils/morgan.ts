/**
 * Node Modules
 */
import morgan from "morgan";
import { Request, Response } from "express";

/**
 * Local Modules
 */
import config from "../config";

/**
 * Morgan token: ISO-formatted timestamp
 */
morgan.token("timestamp", () => new Date().toISOString());

/**
 * Dev logger format
 *
 * Example output:
 *   [2026-06-26T10:42:11.221Z] GET /health 200 4.123 ms - 15 b
 */
const devFormat =
    ":timestamp :method :url :status :res[content-length] - :response-time ms";

/**
 * Skip logging in production
 */
const skip = () => config.NODE_ENV === "production";

/**
 * Attach request id and remote address for traceability
 */
const devLogger = morgan(devFormat, {
    skip,
});

export default devLogger;
