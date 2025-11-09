import { genkit, z } from 'genkit';
import { googleAI } from "@genkit-ai/googleai";
import { genaiClient } from '../client/genaiClient';
import { logger } from "../../utils/logger";
import { getContentPathCuratorPrompt } from '../../utils/prompt';

logger.info("Starting learning path flow setup...");
const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model("gemini-1.5-flash")
});

export const learningPathFlow = ai.defineFlow(
  {
    name: "learningPath",
    inputSchema: z.object({
      goal: z.string().describe("Meta de aprendizado do usuário"),
      existingContent: z.array(
        z.object({
          title: z.string(),
          url: z.string().optional(),
          type: z.string().optional(),
          category: z.string().optional(),
          summary: z.string().optional(),
        })
      ).optional(),
    }),
    outputSchema: z.object({
      goal: z.string(),
      steps: z.array(
        z.object({
          title: z.string(),
          url: z.string().optional(),
          type: z.string().optional(),
          summary: z.string().optional(),
        })
      ),
    }),
  },
  async (input) => {
    const { goal} = input;

    const contents = await genaiClient(goal);

    //const combined = [...existingContent, ...contents].slice(0, 15);

    const prompt = getContentPathCuratorPrompt(goal, contents);

    // const { text } = await ai.generate({
    //   prompt
    // });


    const { text } = await ai.generate({
      system: 'construtor de trilhas de aprendizado',
      prompt: prompt,
      //messages: existingContent
    });
    return JSON.parse(text || `{ "goal": "${goal}", "steps": [] }`);
  }
);