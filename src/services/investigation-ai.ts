import OpenAI from "openai";

import config from "../config";
import { ServiceError } from "../utils/errors";
import type { PromptPayload } from "./investigation-prompt";

const AI_TIMEOUT_MS = 15_000;
const MAX_TOKENS = 1024;
const TEMPERATURE = 0.2;

export const callAI = async (
    prompt: PromptPayload,
    client: OpenAI,
): Promise<string> => {
    try {
        const response = await client.chat.completions.create(
            {
                model: config.MODEL_NAME as string,
                messages: [
                    { role: "system", content: prompt.system },
                    { role: "user", content: prompt.user },
                ],
                response_format: { type: "json_object" },
                temperature: TEMPERATURE,
                max_tokens: MAX_TOKENS,
            },
            { signal: AbortSignal.timeout(AI_TIMEOUT_MS) },
        );

        const content = response.choices?.[0]?.message?.content;
        if (!content || typeof content !== "string") {
            throw new ServiceError(
                "ai_upstream_failure",
                "AI returned an empty response",
            );
        }
        return content;
    } catch (err) {
        if (err instanceof ServiceError) throw err;

        const isTimeout =
            err instanceof Error &&
            (err.name === "AbortError" ||
                err.name === "TimeoutError" ||
                /timeout/i.test(err.message));

        throw new ServiceError(
            isTimeout ? "ai_timeout" : "ai_upstream_failure",
            isTimeout ? "AI request timed out" : "AI upstream request failed",
            err,
        );
    }
};
