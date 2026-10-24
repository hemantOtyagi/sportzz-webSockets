import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const arcjetKey = process.env.ARCJET_KEY;
if (!arcjetKey) throw new Error("ARCJET_KEY environment variable is missing.");

// DRY_RUN logs decisions without blocking; anything else enforces (LIVE).
const arcjetMode = process.env.ARCJET_MODE === "DRY_RUN" ? "DRY_RUN" : "LIVE";

// Rules shared by HTTP and WebSocket protection
const baseRules = [
  shield({ mode: arcjetMode }),
  detectBot({
    mode: arcjetMode,
    allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
  }),
];

export const httpArcjet = arcjet({
  key: arcjetKey,
  rules: [
    ...baseRules,
    slidingWindow({ mode: arcjetMode, interval: "10s", max: 50 }),
  ],
});

export const wsArcjet = arcjet({
  key: arcjetKey,
  rules: [
    ...baseRules,
    slidingWindow({ mode: arcjetMode, interval: "2s", max: 5 }),
  ],
});

export function securityMiddleware() {
  return async (req, res, next) => {
    try {
      const decision = await httpArcjet.protect(req);

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({ error: "Too many requests." });
        }

        if (decision.reason.isBot()) {
          return res.status(403).json({ error: "Automated clients are not allowed." });
        }

        return res.status(403).json({ error: "Forbidden." });
      }
    } catch (error) {
      console.error("Arcjet middleware error:", error);
      return res.status(503).json({ error: "Service unavailable." });
    }

    next();
  };
}