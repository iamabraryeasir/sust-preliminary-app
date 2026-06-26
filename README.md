# QueueStorm Investigator

**AI-Powered Fintech Support Ticket Investigation API**

QueueStorm Investigator is a backend service that analyzes customer complaints, inspects recent transaction history, and returns evidence-backed structured decisions for support teams.

## Fast Start

1. Install dependencies:

```bash
npm install
```

2. Copy configuration:

```bash
cp .env.example .env
```

3. Update `.env` with your Groq values.

4. Build the project:

```bash
npm run build
```

5. Start the server:

```bash
npm start
```

6. Health check:

```bash
curl http://localhost:5000/health
```

## Project Features

- Structured `/analyze-ticket` investigation API
- Evidence-based transaction matching
- Strong runtime validation with Zod
- Type-safe TypeScript architecture
- Groq OpenAI-compatible AI integration
- Centralized error handling and safety guardrails
- Support for English, Bengali, and mixed inputs

## Technology Stack

| Category        | Technology               |
| --------------- | ------------------------ |
| Runtime         | Node.js                  |
| Framework       | Express.js               |
| Language        | TypeScript               |
| Validation      | Zod                      |
| AI SDK          | OpenAI SDK               |
| AI Model        | Groq (OpenAI-compatible) |
| Build           | tsup                     |
| Environment     | dotenv                   |
| Package Manager | npm                      |

## Project Structure

```text
src
├── app.ts
├── config
│   └── index.ts
├── controllers
│   └── ticket.controller.ts
├── middlewares
│   ├── error-handler.middleware.ts
│   └── not-found.middleware.ts
├── routes
│   └── api.routes.ts
├── schemas
│   └── analyze-ticket.schema.ts
├── services
│   ├── investigation-ai.ts
│   ├── investigation-parse.ts
│   ├── investigation-prompt.ts
│   └── investigator.service.ts
├── types
│   └── schema.ts
└── server.ts
```

## API Endpoints

### Health Check

```http
GET /health
```

Response:

```json
{ "status": "OK" }
```

### Analyze Ticket

```http
POST /analyze-ticket
Content-Type: application/json
```

Request body:

```json
{
    "ticket_id": "TKT-001",
    "complaint": "I accidentally sent money to the wrong number.",
    "language": "en",
    "channel": "in_app_chat",
    "user_type": "customer",
    "transaction_history": []
}
```

Response body:

```json
{
    "ticket_id": "TKT-001",
    "relevant_transaction_id": "TXN-9101",
    "evidence_verdict": "consistent",
    "case_type": "wrong_transfer",
    "severity": "high",
    "department": "dispute_resolution",
    "agent_summary": "...",
    "recommended_next_action": "...",
    "customer_reply": "...",
    "human_review_required": true,
    "confidence": 0.91,
    "reason_codes": ["transaction_match", "wrong_transfer"]
}
```

## Environment Variables

Create `.env` with these values:

```env
PORT=5000
GROQ_API_KEY=YOUR_GROQ_API_KEY
MODEL_NAME=groq-1.0
GROQ_API_BASE_URL=https://api.groq.com/openai/v1
```

## Build and Run

- Development mode:

```bash
npm run dev
```

- Production build:

```bash
npm run build
npm start
```

## AI Integration

- Uses the OpenAI SDK to call Groq's OpenAI-compatible endpoint.
- The service passes a strongly constrained prompt and expects a single JSON object reply.
- Response parsing uses Zod validation to enforce the expected contract.

## Safety Guidelines

The system is designed to avoid unsafe AI responses. It will not:

- Ask for PIN, OTP, password, or full card numbers
- Promise refunds, reversals, or account recovery without authority
- Direct customers to unofficial third parties
- Leak sensitive config or internal errors to the client

## Validation

- Request payloads are validated with `AnalyzeTicketRequestSchema`
- AI responses are validated with `AnalyzeTicketResponseSchema`
- Invalid requests return `400`
- AI parse/schema failures return a safe error payload

## Notes

- This service is intended for internal support workflows, not customer-facing financial authorization.
- The AI output is structured and human-review-safe.
- `tsup` is used for production builds to generate an ESM bundle in `dist/`.

## License

This project is built for educational and hackathon use.
