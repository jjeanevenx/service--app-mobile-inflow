import {z} from 'zod';
export const interestSchema = z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      author: z.string(),
      publishedAt: z.string(),
      readTime: z.string(),
      type: z.string(),
      temperature: z.number(),
      category: z.string(),
      summary: z.string()}));
