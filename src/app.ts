/**
 * Node Modules
 */
import express, { Application } from "express";

/**
 * Local Modules
 */
import apiRouter from "./routes/api.routes";
import devLogger from "./utils/morgan";
import notFoundHandler from "./middlewares/not-found.middleware";
import errorHandler from "./middlewares/error-handler.middleware";

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

/**
 * 404 — must be mounted AFTER all routes.
 */
app.use(notFoundHandler);

/**
 * Central error middleware — must be mounted last.
 */
app.use(errorHandler);

export default app;
