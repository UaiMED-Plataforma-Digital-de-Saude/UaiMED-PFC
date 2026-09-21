import rateLimit from "express-rate-limit";

// Protege endpoints de autenticação contra brute force: máx. 10 tentativas por IP a cada minuto.
// Cada rota deve instanciar seu próprio limiter para não compartilhar contador entre endpoints.
export const createAuthRateLimit = (options?: { skipSuccessfulRequests?: boolean }) =>
  rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options?.skipSuccessfulRequests ?? false,
    message: { error: "Muitas tentativas. Tente novamente em instantes." },
  });

export default createAuthRateLimit;
