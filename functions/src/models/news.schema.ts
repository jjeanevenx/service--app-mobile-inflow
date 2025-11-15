import { z } from "zod";

export const newsSchema = z.array(
  z.object({
    title: z.string(),
    link: z.string().url(),
    summary: z.string(),
    interest: z.string()
  }));