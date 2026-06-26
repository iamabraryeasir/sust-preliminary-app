import { AnalyzeTicketResponseSchema } from "../schemas/analyze-ticket.schema";
import { ServiceError } from "../utils/errors";
import type { AnalyzeTicketResponseInput } from "../schemas/analyze-ticket.schema";

export const parseAndValidate = (
    raw: string,
    ticketId: string,
): AnalyzeTicketResponseInput => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch (err) {
        throw new ServiceError(
            "ai_invalid_json",
            "AI returned non-JSON content",
            err,
        );
    }

    const result = AnalyzeTicketResponseSchema.safeParse(parsed);
    if (!result.success) {
        console.error(
            `[investigator] AI schema violation for ticket ${ticketId}:`,
            JSON.stringify(result.error.issues),
        );
        throw new ServiceError(
            "ai_schema_violation",
            "AI response did not match the expected schema",
        );
    }

    return result.data;
};
