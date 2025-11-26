import {z} from 'zod';
export const newsSchema = z.array(
    z.object({
      title: z.string(),
      link: z.string(),
      summary: z.string(),
      interest: z.string(),
      category: z.string(),
      readTime: z.string(),
      publishedAt: z.string(),
      trending: z.boolean(),
      author: z.string()}));
