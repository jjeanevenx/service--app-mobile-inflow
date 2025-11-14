import { z } from "zod";

export const learningPathSchema = z.object({
  goal: z.string(),
  steps: z.array(
    z.object({
      order: z.number(),
      title: z.string(),
      url: z.string().url(),
      summary: z.string(),
      thumbnailUrl: z.string().optional()
    }))
});