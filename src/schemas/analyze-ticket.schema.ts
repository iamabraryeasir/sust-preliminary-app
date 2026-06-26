/**
 * Zod schemas — single source of truth for request/response validation.
 *
 * TypeScript types in `src/types/schema.ts` are kept in sync manually for now,
 * but the runtime contract here is what the controller enforces.
 */
import { z } from "zod";

// --- ENUMS ---

export const TransactionTypeSchema = z.enum([
    "transfer",
    "payment",
    "cash_in",
    "cash_out",
    "settlement",
    "refund",
]);

export const TransactionStatusSchema = z.enum([
    "completed",
    "failed",
    "pending",
    "reversed",
]);

export const EvidenceVerdictSchema = z.enum([
    "consistent",
    "inconsistent",
    "insufficient_data",
]);

export const CaseTypeSchema = z.enum([
    "wrong_transfer",
    "payment_failed",
    "refund_request",
    "duplicate_payment",
    "merchant_settlement_delay",
    "agent_cash_in_issue",
    "phishing_or_social_engineering",
    "other",
]);

export const SeveritySchema = z.enum(["low", "medium", "high", "critical"]);

export const DepartmentSchema = z.enum([
    "customer_support",
    "dispute_resolution",
    "payments_ops",
    "merchant_operations",
    "agent_operations",
    "fraud_risk",
]);

// --- REQUEST ---

export const TransactionEntrySchema = z.object({
    transaction_id: z.string().trim().min(1).max(64),
    timestamp: z.iso.datetime({
        offset: true,
        message: "Must be an ISO-8601 timestamp",
    }),
    amount: z.number().positive().finite(),
    currency: z
        .string()
        .trim()
        .length(3, "Currency must be a 3-letter ISO code")
        .optional()
        .default("BDT"),
    type: TransactionTypeSchema,
    status: TransactionStatusSchema,
    counterparty: z.string().trim().min(1).max(120),
});

export const AnalyzeTicketRequestSchema = z.object({
    ticket_id: z.string().trim().min(1).max(64),
    complaint: z
        .string()
        .trim()
        .min(1, "Complaint cannot be empty")
        .max(2000, "Complaint is too long"),
    language: z.enum(["en", "bn", "mixed"]).optional(),
    channel: z
        .enum([
            "in_app_chat",
            "call_center",
            "email",
            "merchant_portal",
            "field_agent",
        ])
        .optional(),
    user_type: z
        .enum(["customer", "merchant", "agent", "unknown"])
        .optional(),
    campaign_context: z.string().trim().max(128).optional(),
    transaction_history: z
        .array(TransactionEntrySchema)
        .max(50, "Maximum 50 transactions allowed")
        .optional()
        .default([]),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export const AnalyzeTicketRequestEnvelopeSchema = z.preprocess((value) => {
    if (
        typeof value === "object" &&
        value !== null &&
        "input" in value &&
        typeof (value as any).input === "object"
    ) {
        return (value as any).input;
    }
    return value;
}, AnalyzeTicketRequestSchema);

export type AnalyzeTicketRequestInput = z.infer<
    typeof AnalyzeTicketRequestSchema
>;

// --- RESPONSE ---

export const AnalyzeTicketResponseSchema = z.object({
    ticket_id: z.string().min(1),
    relevant_transaction_id: z.string().nullable(),
    evidence_verdict: EvidenceVerdictSchema,
    case_type: CaseTypeSchema,
    severity: SeveritySchema,
    department: DepartmentSchema,
    agent_summary: z.string().min(1).max(2000),
    recommended_next_action: z.string().min(1).max(1000),
    customer_reply: z.string().min(1).max(1500),
    human_review_required: z.boolean(),
    confidence: z
        .number()
        .min(0, "Confidence must be >= 0")
        .max(1, "Confidence must be <= 1")
        .optional(),
    reason_codes: z
        .array(z.string().min(1).max(64))
        .optional(),
});

export type AnalyzeTicketResponseInput = z.infer<
    typeof AnalyzeTicketResponseSchema
>;
