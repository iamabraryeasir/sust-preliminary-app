// --- REQUEST SCHEMA INTERFACES ---

export interface TransactionEntry {
    transaction_id: string;
    timestamp: string;
    amount: number;
    currency: string;
    type:
        | "transfer"
        | "payment"
        | "cash_in"
        | "cash_out"
        | "settlement"
        | "refund";
    status: "completed" | "failed" | "pending" | "reversed";
    counterparty: string;
}

export interface AnalyzeTicketRequest {
    ticket_id: string;
    complaint: string;
    language?: "en" | "bn" | "mixed";
    channel?:
        | "in_app_chat"
        | "call_center"
        | "email"
        | "merchant_portal"
        | "field_agent";
    user_type?: "customer" | "merchant" | "agent" | "unknown";
    campaign_context?: string;
    transaction_history?: TransactionEntry[];
    metadata?: Record<string, unknown>;
}

// --- STRICT RESPONSE SCHEMA ENUMS ---

export type EvidenceVerdict =
    | "consistent"
    | "inconsistent"
    | "insufficient_data";

export type CaseType =
    | "wrong_transfer"
    | "payment_failed"
    | "refund_request"
    | "duplicate_payment"
    | "merchant_settlement_delay"
    | "agent_cash_in_issue"
    | "phishing_or_social_engineering"
    | "other";

export type Severity = "low" | "medium" | "high" | "critical";

export type Department =
    | "customer_support"
    | "dispute_resolution"
    | "payments_ops"
    | "merchant_operations"
    | "agent_operations"
    | "fraud_risk";

// --- RESPONSE SCHEMA INTERFACE ---

export interface AnalyzeTicketResponse {
    ticket_id: string;
    relevant_transaction_id: string | null;
    evidence_verdict: EvidenceVerdict;
    case_type: CaseType;
    severity: Severity;
    department: Department;
    agent_summary: string;
    recommended_next_action: string;
    customer_reply: string;
    human_review_required: boolean;
    confidence?: number; // Optional float between 0.00 and 1.00
    reason_codes?: string[];
}
