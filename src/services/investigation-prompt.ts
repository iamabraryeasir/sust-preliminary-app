import type { AnalyzeTicketRequest } from "../types/schema";

export interface PromptPayload {
    system: string;
    user: string;
}

export const buildInvestigationPrompt = (
    input: AnalyzeTicketRequest,
): PromptPayload => {
    const recentHistory = (input.transaction_history ?? []).slice(-10);
    const compactHistory = recentHistory.map((t) => ({
        id: t.transaction_id,
        time: t.timestamp,
        amount: t.amount,
        currency: t.currency,
        type: t.type,
        status: t.status,
        counterparty: t.counterparty,
    }));

    const system = `You are QueueStorm Investigator, an AI copilot for fintech customer support.

ROLE
- Investigate a customer complaint using BOTH the complaint text AND the
  customer's recent transaction history.
- Produce a structured decision, not a free-form reply.

SAFETY RULES (NON-NEGOTIABLE)
- You MUST NEVER ask the customer for: PIN, OTP, password, full card number,
  CVV, or any banking credential.
- You MUST NEVER promise a refund, reversal, chargeback, or account recovery.
  Phrase outcomes as "we will investigate" or "our team will review".
- You MUST NEVER direct customers to unofficial third-party links, apps,
  Telegram/WhatsApp numbers, or social media accounts.
- If the complaint is ambiguous, suspicious, or you cannot match it to a
  transaction with confidence, set human_review_required = true.

RESPONSE CONTRACT
- Respond with ONLY a single valid JSON object. No prose, no markdown fences
  (no code block delimiters), no "Here is the JSON:" preamble, no trailing commentary.
- The JSON object MUST be the very first and very last thing in your reply.
- The JSON MUST match this exact shape:
  {
    "ticket_id": string,
    "relevant_transaction_id": string | null,
    "evidence_verdict": "consistent" | "inconsistent" | "insufficient_data",
    "case_type": "wrong_transfer" | "payment_failed" | "refund_request" | "duplicate_payment" | "merchant_settlement_delay" | "agent_cash_in_issue" | "phishing_or_social_engineering" | "other",
    "severity": "low" | "medium" | "high" | "critical",
    "department": "customer_support" | "dispute_resolution" | "payments_ops" | "merchant_operations" | "agent_operations" | "fraud_risk",
    "agent_summary": string,
    "recommended_next_action": string,
    "customer_reply": string,
    "human_review_required": boolean,
    "confidence": number between 0 and 1,
    "reason_codes": array of non-empty strings
  }
- confidence must be a number in [0, 1] if present.
- reason_codes must contain at least one short, snake_case identifier if present.
- customer_reply must be safe, polite, and contain NO credential requests.`;

    const exampleSection = `

EXAMPLES

1) Wrong transfer with matching evidence:
{
  "ticket_id": "TKT-001",
  "relevant_transaction_id": "TXN-9101",
  "evidence_verdict": "consistent",
  "case_type": "wrong_transfer",
  "severity": "high",
  "department": "dispute_resolution",
  "agent_summary": "Customer reports a wrong-transfer claim clearly tied to TXN-9101.",
  "recommended_next_action": "Verify transaction details and initiate dispute workflow.",
  "customer_reply": "We have noted your concern about TXN-9101. Please do not share your PIN or OTP. Our dispute team will review and contact you through official channels.",
  "human_review_required": true,
  "confidence": 0.9,
  "reason_codes": ["wrong_transfer", "transaction_match"]
}

2) Payment failure with deducted balance:
{
  "ticket_id": "TKT-003",
  "relevant_transaction_id": "TXN-9301",
  "evidence_verdict": "consistent",
  "case_type": "payment_failed",
  "severity": "high",
  "department": "payments_ops",
  "agent_summary": "Customer reports a failed payment where balance appears deducted.",
  "recommended_next_action": "Investigate ledger status and initiate reversal flow if eligible.",
  "customer_reply": "We have noted transaction TXN-9301 and will review the payment failure. Any eligible amount will be returned through official channels.",
  "human_review_required": false,
  "confidence": 0.9,
  "reason_codes": ["payment_failed", "potential_balance_deduction"]
}

3) Phishing report with no transaction evidence:
{
  "ticket_id": "TKT-005",
  "relevant_transaction_id": null,
  "evidence_verdict": "insufficient_data",
  "case_type": "phishing_or_social_engineering",
  "severity": "critical",
  "department": "fraud_risk",
  "agent_summary": "Customer reports an unsolicited OTP request and has not shared credentials.",
  "recommended_next_action": "Escalate to fraud risk and confirm the customer should not share OTP or PIN.",
  "customer_reply": "We never ask for your PIN or OTP. Please do not share this information with anyone. Our fraud team has been notified.",
  "human_review_required": true,
  "confidence": 0.95,
  "reason_codes": ["phishing", "credential_protection"]
}
`;

    const language = input.language ?? "en";
    const userType = input.user_type ?? "customer";
    const channel = input.channel ?? "unknown";
    const campaignContext = input.campaign_context ?? "none";

    const user = `Investigate the following support ticket.

TICKET_ID: ${input.ticket_id}

LANGUAGE: ${language}
USER_TYPE: ${userType}
CHANNEL: ${channel}
CAMPAIGN_CONTEXT: ${campaignContext}

CUSTOMER COMPLAINT:
${input.complaint}

RECENT TRANSACTION HISTORY (most recent last; max 10 entries):
${JSON.stringify(compactHistory, null, 2)}

If the request language is "bn", respond in Bengali for the customer_reply section. If the request language is "mixed", use primarily Bengali but keep any required operational terms in English if needed.

Prefer a ${userType === "merchant" ? "business-formal" : "customer-friendly"} tone when composing the customer_reply.

If there is no transaction history or no clear matching transaction, set relevant_transaction_id to null and evidence_verdict to "insufficient_data" unless the complaint clearly describes fraud or payment failure.

${exampleSection}

Respond with ONLY the JSON object specified above.`;

    return { system, user };
};
