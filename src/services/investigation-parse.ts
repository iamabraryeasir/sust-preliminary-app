import { AnalyzeTicketResponseSchema } from "../schemas/analyze-ticket.schema";
import { ServiceError } from "../utils/errors";
import type { AnalyzeTicketResponseInput } from "../schemas/analyze-ticket.schema";

/**
 * The AI model may occasionally leak prose, markdown fences, or "Here is the JSON:"
 * chatter around the JSON object, even with `response_format: json_object`.
 * This tolerant extractor walks the string and pulls out the first balanced
 * JSON object.
 *
 * Strategy:
 *   1. Strip markdown fences (```...```) if present.
 *   2. Find the first '{' and the matching closing '}' (string-aware).
 *   3. Return the slice; if nothing looks like JSON, return the cleaned raw.
 */
const extractFirstJsonObject = (raw: string): string => {
    // 1. Strip ```json ... ``` or ``` ... ``` fences.
    let cleaned = raw.trim();
    const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
        cleaned = fenced[1].trim();
    }

    // 2. Find first '{'.
    const firstBrace = cleaned.indexOf("{");
    if (firstBrace === -1) {
        return cleaned;
    }

    // 3. Walk forward, tracking nesting + string state, to find the matching '}'.
    let depth = 0;
    let inString = false;
    let escape = false;
    let lastValidEnd = -1;

    for (let i = firstBrace; i < cleaned.length; i++) {
        const ch = cleaned[i];

        if (inString) {
            if (escape) {
                escape = false;
            } else if (ch === "\\") {
                escape = true;
            } else if (ch === '"') {
                inString = false;
            }
            continue;
        }

        if (ch === '"') {
            inString = true;
        } else if (ch === "{") {
            depth++;
        } else if (ch === "}") {
            depth--;
            if (depth === 0) {
                lastValidEnd = i;
                break;
            }
        }
    }

    if (lastValidEnd === -1) {
        // Couldn't find a balanced object — fall back to the cleaned string.
        return cleaned;
    }

    return cleaned.slice(firstBrace, lastValidEnd + 1);
};

/**
 * Robust parse + schema-validate.
 *
 *   - Tries JSON.parse on the raw output first.
 *   - On failure, extracts the first balanced {...} substring and retries.
 *   - Then validates with the response Zod schema.
 *
 * Throws ServiceError on either failure. The original raw output is logged
 * server-side so the cause can be debugged without leaking it to clients.
 */
export const parseAndValidate = (
    raw: string,
    ticketId: string,
): AnalyzeTicketResponseInput => {
    if (!raw || typeof raw !== "string") {
        throw new ServiceError(
            "ai_invalid_json",
            "AI returned empty content",
        );
    }

    const tryParse = (text: string): unknown => {
        try {
            return JSON.parse(text);
        } catch {
            return undefined;
        }
    };

    let parsed: unknown = tryParse(raw);

    if (parsed === undefined) {
        // Strip prose / fences and try again.
        const candidate = extractFirstJsonObject(raw);
        parsed = tryParse(candidate);

        if (parsed === undefined) {
            console.error(
                `[investigator] AI returned non-JSON for ticket ${ticketId}:`,
                raw.slice(0, 500),
            );
            throw new ServiceError(
                "ai_invalid_json",
                "AI returned non-JSON content",
            );
        }
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
