import app from "./app";
import logger from "./utils/logger";
import ENV from "./config/env";

// ENV já carrega o .env via config/env.ts (dotenv.config é chamado lá)
const PORT = ENV.PORT;

app.listen(PORT, () => {
  logger.success(`🚀 Backend UaiMED iniciado em http://localhost:${PORT} (env=${ENV.NODE_ENV})`);
});
