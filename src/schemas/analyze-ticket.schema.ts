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
    "cash_out",
    "payment",
    "receive_money",
]);

export const TransactionStatusSchema = z.enum([
    "completed",
    "failed",
    "pending",
]);

export const EvidenceVerdictSchema = z.enum([
    "consistent",
    "inconsistent",
    "insufficient_data",
]);

export const CaseTypeSchema = z.enum([
    "wrong_transfer",
    "failed_transaction_charge",
    "unauthorized_fee",
    "duplicate_payment",
    "cash_out_discrepancy",
    "general_inquiry",
]);

export const SeveritySchema = z.enum(["low", "medium", "high", "critical"]);

export const DepartmentSchema = z.enum([
    "payments_ops",
    "fraud_compliance",
    "customer_relations",
    "tech_support",
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
        .length(3, "Currency must be a 3-letter ISO code"),
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
    transaction_history: z
        .array(TransactionEntrySchema)
        .max(50, "Maximum 50 transactions allowed"),
});

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
        .max(1, "Confidence must be <= 1"),
    reason_codes: z
        .array(z.string().min(1).max(64))
        .min(1, "At least one reason code is required"),
});

export type AnalyzeTicketResponseInput = z.infer<
    typeof AnalyzeTicketResponseSchema
>;
