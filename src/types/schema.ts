// --- REQUEST SCHEMA INTERFACES ---

export interface TransactionEntry {
    transaction_id: string;
    timestamp: string; 
    amount: number;
    currency: string;
    type: "transfer" | "cash_out" | "payment" | "receive_money";
    status: "completed" | "failed" | "pending";
    counterparty: string;
}

export interface AnalyzeTicketRequest {
    ticket_id: string;
    complaint: string;
    transaction_history: TransactionEntry[];
}

// --- STRICT RESPONSE SCHEMA ENUMS ---

export type EvidenceVerdict =
    | "consistent"
    | "inconsistent"
    | "insufficient_data";

export type CaseType =
    | "wrong_transfer"
    | "failed_transaction_charge"
    | "unauthorized_fee"
    | "duplicate_payment"
    | "cash_out_discrepancy"
    | "general_inquiry";

export type Severity = "low" | "medium" | "high" | "critical";

export type Department =
    | "payments_ops"
    | "fraud_compliance"
    | "customer_relations"
    | "tech_support";

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
    confidence: number; // Float between 0.00 and 1.00
    reason_codes: string[];
}
