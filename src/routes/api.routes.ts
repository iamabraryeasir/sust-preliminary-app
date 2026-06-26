import { Router } from "express";

const apiRouter = Router();

apiRouter.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

apiRouter.post("/analyze-ticket", (req, res) => {
    res.status(200).json({ status: "OK" });
});

export default apiRouter;
