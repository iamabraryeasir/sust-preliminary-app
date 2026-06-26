/**
 * Investigator Service — the AI investigation engine.
 *
 * Responsibilities:
 *   1. Build a safety-hardened investigation prompt.
 *   2. Call Google Gemini via the OpenAI-compatible API.
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
import { buildInvestigationPrompt } from "./investigation-prompt";
import { callGemini } from "./investigation-ai";
import { parseAndValidate } from "./investigation-parse";

/**
 * Force human review whenever the model's confidence is low or the
 * evidence verdict is anything other than "consistent". Safety first.
 */
const shouldForceHumanReview = (
    parsed: AnalyzeTicketResponseInput,
): boolean => {
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
 * Never throws a raw Error: only ServiceError or HttpError reach the
 * controller. Anything truly unexpected is wrapped.
 */
const investigate = async (
    input: AnalyzeTicketRequest,
): Promise<AnalyzeTicketResponseInput> => {
    try {
        const client = getOpenAIClient();
        const prompt = buildInvestigationPrompt(input);
        const raw = await callGemini(prompt, client);
        const parsed = parseAndValidate(raw, input.ticket_id);
        return finalizeResponse(parsed, input.ticket_id);
    } catch (err) {
        if (err instanceof ServiceError) throw err;

        throw new ServiceError(
            "ai_upstream_failure",
            "Unexpected error during investigation",
            err,
        );
    }
};

export default {
    investigate,
    buildInvestigationPrompt,
};
