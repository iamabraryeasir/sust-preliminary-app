export class HttpError extends Error {
    public readonly status: number;
    public readonly details: unknown;

    constructor(status: number, message: string, details?: unknown) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.details = details;

        // Restore prototype chain after extending a built-in.
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}

/**
 * Discriminated codes for upstream/internal service failures.
 */
export type ServiceErrorCode =
    | "ai_upstream_failure"
    | "ai_invalid_json"
    | "ai_schema_violation"
    | "ai_timeout";

/**
 * Internal service-layer failure.
 *
 * The HTTP layer should never expose the raw `cause` to clients.
 */
export class ServiceError extends Error {
    public readonly code: ServiceErrorCode;
    public readonly cause: unknown;

    constructor(code: ServiceErrorCode, message: string, cause?: unknown) {
        super(message);
        this.name = "ServiceError";
        this.code = code;
        this.cause = cause;

        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}

/**
 * Convenience type guards used by the central error middleware.
 */
export const isHttpError = (err: unknown): err is HttpError =>
    err instanceof HttpError;

export const isServiceError = (err: unknown): err is ServiceError =>
    err instanceof ServiceError;
