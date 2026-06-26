# QueueStorm Investigator

> **AI-Powered Fintech Support Ticket Investigation API**
>
> An intelligent SupportOps API that analyzes customer complaints, investigates transaction history, determines evidence-backed decisions, routes cases to the appropriate department, and generates safe, policy-compliant customer responses.

---

## Overview

QueueStorm Investigator is an AI-powered backend service developed for the **SUST CSE Carnival 2026 – Codex Community Hackathon**.

Unlike traditional ticket classifiers that rely solely on complaint text, QueueStorm Investigator performs **evidence-based investigation** by analyzing both the customer's complaint and their recent transaction history before making a decision.

The system identifies the most relevant transaction, verifies whether the complaint is supported by available evidence, classifies the issue, assigns the responsible department, determines severity, generates an agent-ready investigation summary, recommends operational next steps, and drafts a customer-safe response that strictly follows fintech security guidelines.

The API is designed as an **internal AI copilot** for customer support teams—not as an autonomous financial decision maker.

---

# Features

- AI-powered complaint investigation
- Evidence-based transaction matching
- Intelligent case classification
- Fintech safety guardrails
- Human review detection
- Structured JSON API
- Multilingual complaint understanding
    - English
    - Bangla
    - Mixed Banglish

- Zod request validation
- Type-safe TypeScript implementation
- Production-ready Express architecture
- Health monitoring endpoint
- Professional REST API
- Clean layered architecture
- OpenAI SDK integration with Google Gemini API

---

# Problem Statement

Digital financial platforms receive thousands of customer complaints every day.

Simply classifying complaint text is insufficient.

An intelligent investigator must answer questions like:

- Which transaction is the customer referring to?
- Does the transaction history support the complaint?
- Is the complaint suspicious?
- Which internal department should handle it?
- How severe is the issue?
- Does this require manual investigation?
- How should the support agent respond safely?

QueueStorm Investigator solves these challenges through AI-assisted reasoning combined with structured transaction analysis.

---

# Technology Stack

| Category        | Technology               |
| --------------- | ------------------------ |
| Runtime         | Node.js                  |
| Framework       | Express.js               |
| Language        | TypeScript               |
| Validation      | Zod                      |
| AI SDK          | OpenAI SDK               |
| AI Model        | Google Gemini (Free API) |
| Environment     | dotenv                   |
| REST API        | Express Router           |
| Package Manager | npm                      |

---

# Project Structure

```text
src
│
├── config
│   └── index.ts
│
├── controllers
│   └── ticket.controller.ts
│
├── routes
│   └── api.routes.ts
│
├── services
│   └── investigator.service.ts
│
├── types
│   └── index.ts
│
├── app.ts
└── server.ts
```

## Folder Responsibilities

### config/

Application configuration including environment variables and AI client initialization.

---

### controllers/

Handles incoming HTTP requests, validates data flow, and delegates business logic to services.

---

### services/

Contains the core AI investigation engine responsible for:

- Prompt creation
- AI communication
- Transaction reasoning
- Response parsing
- Decision generation

---

### routes/

Defines all public API endpoints.

---

### types/

Centralized TypeScript interfaces and shared types.

---

### app.ts

Creates and configures the Express application.

---

### server.ts

Starts the HTTP server.

---

# System Architecture

```text
                Client
                  │
                  ▼
          POST /analyze-ticket
                  │
                  ▼
            Express Router
                  │
                  ▼
            Ticket Controller
                  │
                  ▼
          Zod Request Validation
                  │
                  ▼
        Investigator Service
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
 Transaction History     Complaint
    Processing           Processing
        │                   │
        └─────────┬─────────┘
                  ▼
        Google Gemini API
                  │
                  ▼
      Structured Investigation
                  │
                  ▼
        JSON Response Returned
```

---

# Investigation Workflow

1. Receive customer complaint.
2. Validate request using Zod.
3. Read recent transaction history.
4. Construct investigation prompt.
5. Send structured context to Gemini.
6. AI determines:
    - Relevant transaction
    - Evidence verdict
    - Case type
    - Severity
    - Department
    - Human review requirement

7. Generate safe customer response.
8. Return structured JSON.

---

# API Endpoints

## Health Check

```http
GET /health
```

### Response

```json
{
    "status": "ok"
}
```

---

## Analyze Ticket

```http
POST /analyze-ticket
```

Receives a customer complaint and transaction history and returns an AI-generated investigation result.

---

# Example Request

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

---

# Example Response

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

---

# Supported Case Types

- Wrong Transfer
- Payment Failed
- Refund Request
- Duplicate Payment
- Merchant Settlement Delay
- Agent Cash-In Issue
- Phishing / Social Engineering
- Other

---

# AI Reasoning

The investigation engine does **not** simply classify complaint text.

Instead, it evaluates multiple contextual signals including:

- Complaint intent
- Mentioned amount
- Mentioned time
- Transaction type
- Transaction status
- Counterparty
- Previous transaction patterns
- Available evidence

The AI produces a structured decision rather than free-form text, ensuring responses remain machine-readable and compliant with the expected API contract.

---

# Safety Guardrails

The system is designed around fintech safety principles.

It will **never**:

- Ask for PIN
- Ask for OTP
- Ask for passwords
- Ask for full card numbers
- Promise refunds without authorization
- Promise reversals
- Confirm account recovery
- Direct customers to unofficial third parties

High-risk or ambiguous cases are flagged for human review instead of making unsupported assumptions.

---

# Input Validation

All incoming requests are validated using **Zod**.

Validation includes:

- Required fields
- Data types
- Enum values
- Nested transaction objects
- Malformed request handling

Invalid requests return appropriate HTTP status codes without crashing the application.

---

# Error Handling

The API follows fail-safe principles.

Possible responses include:

- 200 OK
- 400 Bad Request
- 422 Unprocessable Entity
- 500 Internal Server Error

Sensitive information such as API keys, stack traces, or internal configuration details is never exposed to clients.

---

# Performance

The application is designed to be lightweight and efficient.

Goals include:

- Fast API responses
- Minimal memory usage
- Type-safe development
- Stable AI integration
- Predictable JSON output

---

# Environment Variables

Create a `.env` file in the project root.

```env
PORT=5000

GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
```

---

# Installation

Clone the repository.

```bash
git clone <repository-url>
```

Move into the project.

```bash
cd queue-storm-investigator
```

Install dependencies.

```bash
npm install
```

Configure environment variables.

```bash
cp .env.example .env
```

Start development server.

```bash
npm run dev
```

Build production.

```bash
npm run build
```

Run production server.

```bash
npm start
```

---

# Live Deployment

The application is deployed as a publicly accessible REST API.

Replace the following placeholder with your deployed URL.

```text
Base URL

https://your-live-api-url.com
```

Health endpoint

```text
GET /health
```

Analysis endpoint

```text
POST /analyze-ticket
```

---

# Design Principles

The project follows several engineering principles:

- Separation of concerns
- Layered architecture
- Strong typing
- Centralized validation
- AI encapsulation
- Minimal controller logic
- Reusable service layer
- Predictable API contracts

---

# Limitations

Current implementation depends on an external LLM for reasoning.

Potential limitations include:

- AI inference latency
- Prompt dependency
- External API availability
- Model output variability

Future versions could incorporate:

- Deterministic rule engine
- Hybrid AI + rules reasoning
- Transaction similarity scoring
- Confidence calibration
- Observability
- Response caching
- Analytics dashboard

---

# Future Improvements

- Prompt optimization
- Retry strategy
- Streaming AI responses
- Response caching
- Logging and monitoring
- Unit tests
- Integration tests
- Rate limiting
- Authentication
- OpenAPI / Swagger documentation
- CI/CD pipeline
- AI evaluation benchmarks

---

# Acknowledgements

Developed for the **SUST CSE Carnival 2026 – Codex Community Hackathon**.

Special thanks to the organizers for designing a practical AI SupportOps challenge focused on evidence-based reasoning, fintech safety, and production-ready API design.

---

# License

This project was developed for educational and hackathon purposes.

---

## Author

**Abrar Yeasir**

Undergraduate Student, Computer Science & Engineering

Premier University, Chattogram

Passionate about Backend Engineering, Artificial Intelligence, and Building Scalable Software.
