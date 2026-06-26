/**
 * Node Modules
 */
import express, { Request, Response, NextFunction, Application } from "express";
import apiRouter from "./routes/api.routes";

/**
 * Local Modules
 */
import devLogger from "./utils/morgan";

/**
 * Application
 */
const app: Application = express();

/**
 * Default Middlewares
 */
app.use(devLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Application Routes
 */
app.use("/", apiRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled Server Error:", err.message);

    res.status(500).json({
        status: "error",
        message: "An internal server error occurred. Please try again later.",
    });
});
export default app;
