import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { webSearchTool } from "../tools/webSearch.tool";
import { getContentCuratorPrompt } from "../../utils/prompt";
import { logger } from "../../utils/logger";

logger.info("Starting content curator flow setup...");
const ai = genkit({
  plugins: [ googleAI() ],
  model: googleAI.model("gemini-1.5-flash")
});

export const contentCuratorFlow = ai.defineFlow(
  {
    name: "contentCurator",
    inputSchema: z.object({ interest: z.string().describe("Termo de interesse do usuário") }),
    outputSchema: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        type: z.string(),
        category: z.string(),
        summary: z.string(),
      })
    ),
  },
  async (input) => {
    const { interest } = input;

    const webResults = await webSearchTool({ query: interest,  maxResults:20});
    const prompt = getContentCuratorPrompt(interest, webResults);

    const { text } = await ai.generate({
      prompt,
      tools: [webSearchTool],  
    });

    const curated = JSON.parse(text || "[]");
    return curated;
  }
);
