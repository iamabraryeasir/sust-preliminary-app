/**
 * Ticket Controller — HTTP boundary for `/analyze-ticket`.
 *
 * Responsibilities (only):
 *   1. Validate the incoming request body with the Zod schema.
 *   2. Delegate to the investigator service.
 *   3. Map the typed result (or typed error) to an HTTP response.
 *
 * No business logic lives here.
 */

/**
 * Node Modules
 */
import type { Request, Response, NextFunction } from "express";

/**
 * Local Modules
 */
import investigatorService from "../services/investigator.service";
import { AnalyzeTicketRequestSchema } from "../schemas/analyze-ticket.schema";
import { HttpError } from "../utils/errors";

/**
 * POST /analyze-ticket
 *
 * - 400 on schema validation failure (HttpError with field-level issues).
 * - 200 with the typed AnalyzeTicketResponse on success.
 * - Any thrown error is forwarded to `next()` for the central error
 *   middleware to render.
 */
const analyzeTicket = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const parsed = AnalyzeTicketRequestSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new HttpError(
                400,
                "Invalid request payload",
                parsed.error.issues,
            );
        }

        const result = await investigatorService.investigate(parsed.data);

        res.status(200).json({
            status: "success",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

export default {
    analyzeTicket,
};
