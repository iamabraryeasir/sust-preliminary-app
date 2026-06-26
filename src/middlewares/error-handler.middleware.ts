/**
 * Node Modules
 */
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";

/**
 * Local Modules
 */
import { HttpError, ServiceError } from "../utils/errors";

/**
 * Central error middleware.
 *
 * Mapping rules:
 *   - HttpError      -> its status + message (+ optional details)
 *   - ZodError       -> 400 with flattened issues
 *   - ServiceError   -> 504 if code === "ai_timeout", else 502
 *   - anything else  -> generic 500, raw error logged server-side only
 *
 * No stack traces, no API keys, no internal details reach the client.
 */
const errorHandler: ErrorRequestHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    // 1) HttpError — known client-side problem
    if (err instanceof HttpError) {
        res.status(err.status).json({
            status: "error",
            message: err.message,
            ...(err.details !== undefined ? { details: err.details } : {}),
        });
        return;
    }

    // 2) ZodError — should have been wrapped, but handle defensively
    if (err instanceof ZodError) {
        res.status(400).json({
            status: "error",
            message: "Invalid request payload",
            details: err.issues,
        });
        return;
    }

    // 3) ServiceError — upstream / AI failure
    if (err instanceof ServiceError) {
        console.error(
            `[service_error] ticket=${req.body?.ticket_id ?? "unknown"} code=${err.code} message=${err.message}`,
            err.cause,
        );
        const status = err.code === "ai_timeout" ? 504 : 502;
        res.status(status).json({
            status: "error",
            message:
                err.code === "ai_timeout"
                    ? "The AI service took too long to respond. Please try again."
                    : "The AI service is currently unavailable. Please try again shortly.",
        });
        return;
    }

    // 4) Unknown error — generic 500
    console.error(`[unhandled_error] ${req.method} ${req.originalUrl}`, err);
    res.status(500).json({
        status: "error",
        message: "An internal server error occurred. Please try again later.",
    });
};

export default errorHandler;
