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
     * Groq API key provided by the environment.
     */
    GROQ_API_KEY: process.env.GROQ_API_KEY,

    /**
     * Model name provided by the environment.
     */
    MODEL_NAME: process.env.MODEL_NAME,

    /**
     * Base URL for the Groq OpenAI-compatible endpoint.
     */
    GROQ_API_BASE_URL: process.env.GROQ_API_BASE_URL,
});

/**
 * Cached lazy singleton for the OpenAI SDK client. We point the SDK
 * at Groq's OpenAI-compatible endpoint so we can reuse the same
 * `chat.completions` API surface.
 */
let cachedClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
    if (cachedClient) {
        return cachedClient;
    }

    const apiKey = config.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error(
            "GROQ API key is not set — cannot construct the AI client. " +
                "Add GROQ_API_KEY to your .env file (see .env.example).",
        );
    }

    if (!config.MODEL_NAME) {
        throw new Error(
            "MODEL_NAME is not set — specify the Groq model name in your environment.",
        );
    }

    if (!config.GROQ_API_BASE_URL) {
        throw new Error(
            "GROQ_API_BASE_URL is not set — specify the Groq OpenAI-compatible endpoint.",
        );
    }

    cachedClient = new OpenAI({
        apiKey,
        baseURL: config.GROQ_API_BASE_URL,
    });

    return cachedClient;
}

export default config;
