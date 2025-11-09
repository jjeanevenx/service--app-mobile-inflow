import { z } from "zod";

export const interestSchema = z.array(
  z.object({
    title: z.string(),
    url: z.string().url(),
    type: z.string(),
    category: z.string(),
    summary: z.string(),
}));