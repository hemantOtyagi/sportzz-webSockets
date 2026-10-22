import { z } from "zod";

// Mirrors the match_status pgEnum in src/db/schema.js
export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  FINISHED: "finished",
};

const isoDateTime = z.iso.datetime({ offset: true });

export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createMatchSchema = z
  .object({
    sport: z.string().trim().min(1),
    homeTeam: z.string().trim().min(1),
    awayTeam: z.string().trim().min(1),
    status: z.enum(Object.values(MATCH_STATUS)).optional(),
    startTime: isoDateTime,
    endTime: isoDateTime.optional(),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.endTime) return;

    if (new Date(data.endTime) <= new Date(data.startTime)) {
      ctx.addIssue({
        code: "custom",
        message: "endTime must be chronologically after startTime",
        path: ["endTime"],
      });
    }
  });

export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});