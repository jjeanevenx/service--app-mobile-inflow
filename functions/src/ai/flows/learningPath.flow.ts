import {genkit, z} from 'genkit';
import { googleAI } from "@genkit-ai/googleai";
import { webSearchTool } from '../tools/webSearch.tool';
import { logger } from "../../utils/logger";
import { getContentPathCuratorPrompt } from '../../utils/prompt';

logger.info("Starting learning path flow setup...");
const ai = genkit({
  plugins: [ googleAI() ],
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
    const { goal, existingContent = [] } = input;

    const webResults = await webSearchTool({ query: goal, maxResults: 20 });

    const combined = [...existingContent, ...webResults].slice(0, 15);

    const prompt = getContentPathCuratorPrompt(goal, combined);

    const { text } = await ai.generate({ prompt });
    return JSON.parse(text || `{ "goal": "${goal}", "steps": [] }`);
  }
);