/**
 * Node Modules
 */
import { Request, Response, NextFunction } from "express";

/**
 * 404 handler. Mount AFTER all routes — it catches anything that
 * fell through the router stack.
 */
const notFoundHandler = (
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    res.status(404).json({
        status: "error",
        message: "Route not found",
    });
};

export default notFoundHandler;
