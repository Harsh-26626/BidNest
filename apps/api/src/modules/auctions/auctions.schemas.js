import { z } from "zod";

export const listSchema = z.object({
  query: z.object({
    status: z.enum(["live", "upcoming", "ended", "all"]).default("live"),
    mine: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
    q: z.string().trim().max(80).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  }),
});

export const createSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().max(2000).default(""),
    images: z.array(z.string().url().startsWith("https://")).min(1).max(5),
    startingPrice: z.number().int().min(1).max(10_000_000),
    bidStep: z.number().int().min(1).max(10_000_000).default(100),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date(),
  }),
});

export const bidSchema = z.object({
  body: z.object({ amount: z.number().int().min(1).max(100_000_000) }),
});
