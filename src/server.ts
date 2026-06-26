/**
 * Node Modules
 */
import "dotenv/config";
import config from "./config";

/**
 * Fail fast if the AI key is missing — better than a vague runtime
 * failure when the first `/analyze-ticket` request comes in.
 */
if (!config.GROQ_API_KEY || !config.MODEL_NAME || !config.GROQ_API_BASE_URL) {
    console.error(
        "❌ Missing required Groq configuration. Please set GROQ_API_KEY, MODEL_NAME, and GROQ_API_BASE_URL in your environment or .env file.\n" +
            "   See .env.example for the expected values.",
    );
    process.exit(1);
}

/**
 * Local Modules (imported AFTER the startup check so a missing key
 * produces the clear error above instead of an OpenAI SDK init crash).
 */
import app from "./app";

app.listen(config.PORT, () => {
    console.log(
        `🚀 QueueStorm Investigator running on port ${config.PORT} ` +
            `[${config.NODE_ENV}] using Groq model ${config.MODEL_NAME}`,
    );
});
