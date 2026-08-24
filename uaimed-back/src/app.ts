import express, { Request, Response } from "express";
import cors from "cors";
import routes from "./routes";
import errorHandler from "./middleware/errorHandler";
import logger from "./utils/logger";
import ENV from "./config/env";

const app = express(); 

const corsOptions = {
  origin: (origin: any, callback: any) => {
    // Em desenvolvimento, permite todas as origens (incluindo Android Simulator)
    if (ENV.NODE_ENV === "development") {
      return callback(null, true);
    }
    
    // Em produção, valida as origens permitidas
    const allowed = [ENV.FRONTEND_URL, "http://localhost:19000", "http://127.0.0.1:19000"];
    if (!origin) return callback(null, true); // allow server-to-server or curl
    if (allowed.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error("CORS not allowed"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// O projeto envia avatar e banner como Data URL/Base64 dentro do JSON.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString(), environment: ENV.NODE_ENV });
});

app.use("/api", routes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Rota não encontrada", path: _req.path });
});

app.use(errorHandler);

logger.info(`App configured (env=${ENV.NODE_ENV})`);

export default app;
