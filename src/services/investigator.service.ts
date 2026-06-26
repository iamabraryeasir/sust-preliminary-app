/**
 * Investigator Service — the AI investigation engine.
 *
 * Responsibilities:
 *   1. Build a safety-hardened investigation prompt.
 *   2. Call the AI model via the OpenAI-compatible API.
 *   3. Parse + validate the response against the response Zod schema.
 *   4. Apply safety post-processing (force human review on low confidence
 *      or inconsistent evidence, override ticket_id, trim strings).
 *
 * The service is HTTP-agnostic — it takes a typed request and returns
 * a typed response (or throws a typed ServiceError). The controller
 * decides how to map those to HTTP statuses.
 */

/**
 * Local Modules
 */
import { getOpenAIClient } from "../config";
import { ServiceError } from "../utils/errors";
import type { AnalyzeTicketRequest } from "../types/schema";
import type { AnalyzeTicketResponseInput } from "../schemas/analyze-ticket.schema";
import {
    buildInvestigationPrompt,
    type PromptPayload,
} from "./investigation-prompt";
import { callAI } from "./investigation-ai";
import { parseAndValidate } from "./investigation-parse";

/**
 * Force human review whenever the model's confidence is low or the
 * evidence verdict is anything other than "consistent". Safety first.
 */
const shouldForceHumanReview = (
    parsed: AnalyzeTicketResponseInput,
): boolean => {
    if (parsed.confidence === undefined) return true;
    if (parsed.confidence < 0.7) return true;
    if (parsed.evidence_verdict !== "consistent") return true;
    return false;
};

const finalizeResponse = (
    parsed: AnalyzeTicketResponseInput,
    requestTicketId: string,
): AnalyzeTicketResponseInput => ({
    ...parsed,
    ticket_id: requestTicketId,
    human_review_required:
        parsed.human_review_required || shouldForceHumanReview(parsed),
    customer_reply: parsed.customer_reply.trim(),
    agent_summary: parsed.agent_summary.trim(),
});

/**
 * investigate
 *
 * Orchestrates prompt -> call -> parse -> safety post-processing.
 *
 * On a parse/schema failure (rare, but happens when the AI response leaks
 * prose or emits an out-of-enum value), we retry ONCE with a stricter reminder
 * to respond with raw JSON only. After that we surface the error.
 *
 * Never throws a raw Error: only ServiceError or HttpError reach the
 * controller. Anything truly unexpected is wrapped.
 */
const investigate = async (
    input: AnalyzeTicketRequest,
): Promise<AnalyzeTicketResponseInput> => {
    const client = getOpenAIClient();
    const basePrompt = buildInvestigationPrompt(input);

    const attempts: PromptPayload[] = [
        basePrompt,
        {
            system: basePrompt.system,
            user:
                `${basePrompt.user}\n\n` +
                `IMPORTANT: Your previous reply was not valid JSON. ` +
                `Respond again with ONLY a single raw JSON object — no ` +
                `markdown fences, no commentary, no explanation. The JSON ` +
                `must start with '{' and end with '}'.`,
        },
    ];

    let lastServiceError: ServiceError | null = null;

    for (const prompt of attempts) {
        try {
            const raw = await callAI(prompt, client);
            const parsed = parseAndValidate(raw, input.ticket_id);
            return finalizeResponse(parsed, input.ticket_id);
        } catch (err) {
            if (err instanceof ServiceError) {
                // Only retry on parse/format issues — not on timeouts or
                // upstream network failures (those won't fix themselves).
                const retryable =
                    err.code === "ai_invalid_json" ||
                    err.code === "ai_schema_violation";
                lastServiceError = err;
                if (!retryable) throw err;
                continue;
            }

            // Defensive: any unexpected error becomes a generic upstream failure.
            throw new ServiceError(
                "ai_upstream_failure",
                "Unexpected error during investigation",
                err,
            );
        }
    }

    // Both attempts failed with a retryable parse/schema issue.
    throw (
        lastServiceError ??
        new ServiceError(
            "ai_upstream_failure",
            "Investigation failed after retry",
        )
    );
};

export default {
    investigate,
    buildInvestigationPrompt,
};
