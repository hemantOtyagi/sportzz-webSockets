import { Router } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { getMatchStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";

export const matchRouter = Router();
const MAX_LIMIT = 100;

matchRouter.get("/", async (req, res) => {
  const parsedData = listMatchesQuerySchema.safeParse(req.query);
  if (!parsedData.success) {
    res.status(400).json({
      error: "Invalid Query",
      details: JSON.stringify(parsedData.error),
    });
  }

  const limit = Math.min(parsedData.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);
    res.json({ data: data });
  } catch (error) {
    res.status(500).json({
      error: "Failed to list matches",
    });
  }

  res.status(200).json({
    success: true,
    message: "list of all matches",
  });
});

matchRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid payload",
      details: parsed.error.issues,
    });
  }

  const { startTime, endTime, ...rest } = parsed.data;

  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...rest,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        status: getMatchStatus(startTime, endTime) ?? MATCH_STATUS.SCHEDULED,
      })
      .returning();

    return res.status(201).json({ data: event });
  } catch (error) {
    console.error("Failed to create match:", error);
    return res.status(500).json({ error: "Failed to create match" });
  }
});
