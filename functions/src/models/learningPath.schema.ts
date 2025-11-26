import {z} from 'zod';


export const lessons = z.object({
  order: z.string(),
  title: z.string(),
  url: z.string(),
  duration: z.string(),
  author: z.string(),
  category: z.string(),
  summary: z.string()});

export const learningPathModule = z.object({
  title: z.string(),
  order: z.string(),
  description: z.string(),
  lessonCount: z.number(),
  totalHours: z.number(),
  difficulty: z.string(),
  lessons: lessons.array()});


export const learningPathSchema = z.object({
  title: z.string(),
  goal: z.string(),
  description: z.string(),
  moduleCount: z.number(),
  totalHours: z.number(),
  difficulty: z.string(),
  modules: learningPathModule.array()});


