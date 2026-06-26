/**
 * Node Modules
 */
import { Router } from "express";

/**
 * Local Modules
 */
import ticketController from "../controllers/ticket.controller";
import asyncHandler from "../utils/async-handler";

const apiRouter = Router();

/**
 * Health Check
 */
apiRouter.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

/**
 * Analyze Ticket — AI-powered investigation.
 */
apiRouter.post("/analyze-ticket", asyncHandler(ticketController.analyzeTicket));

export default apiRouter;
