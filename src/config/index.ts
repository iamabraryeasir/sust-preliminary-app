/**
 * Node Modules
 */
import "dotenv/config";
import OpenAI from "openai";

/**
 * Application configuration. Frozen so consumers cannot mutate it
 * at runtime (treated as immutable).
 */
const config = Object.freeze({
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",

    /**
     * Google Gemini credentials (used via OpenAI-compatible endpoint).
     * Key may be undefined — `server.ts` performs the fail-fast check
     * before anything tries to call the AI service.
     */
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,

    /**
     * Gemini model name. Defaults to a fast, free-tier friendly variant.
     * Override via .env (e.g. "gemini-2.0-flash", "gemini-2.5-pro").
     */
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
});

/**
 * Cached lazy singleton for the OpenAI SDK client. We point the SDK
 * at Google's OpenAI-compatible endpoint so we can reuse the same
 * `chat.completions` API surface across providers.
 */
let cachedClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
    if (cachedClient) {
        return cachedClient;
    }

    const apiKey = config.GOOGLE_API_KEY;

    if (!apiKey) {
        throw new Error(
            "GOOGLE_API_KEY is not set — cannot construct the AI client. " +
                "Add it to your .env file (see .env.example).",
        );
    }

    cachedClient = new OpenAI({
        apiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });

    return cachedClient;
}

export default config;
