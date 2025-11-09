import { z } from "zod";

export const interestSchema = z.array(
  z.object({
    title: z.string(),
    url: z.string().url(),
    type: z.string(),
    category: z.string(),
    summary: z.string(),
  }));


export const learningPathSchema = z.object({
  goal: z.string(),
  steps: z.array(
    z.object({
      order: z.number(),
      title: z.string(),
      url: z.string().url(),
      summary: z.string()
    }))
});

export const newsSchema = z.array(
  z.object({
    title: z.string(),
    link: z.string().url(),
    summary: z.string(),
    interest: z.string(),
  }));