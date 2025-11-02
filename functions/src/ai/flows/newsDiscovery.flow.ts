import { webSearchTool } from "../tools/webSearch.tool";
import { getNewsDescoveryCuratorPrompt } from "../../utils/prompt";
import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { logger } from "../../utils/logger";


logger.info("Starting news discovery flow setup...");
const ai = genkit({
  plugins: [ googleAI() ],
  model: googleAI.model("gemini-1.5-flash")
});

export const newsDiscoveryFlow = ai.defineFlow(
  {
    name: "newsDiscovery",
    inputSchema: z.object({
      interest: z.string().describe("Tema de interesse do usuário"),
    }),
    outputSchema: z.array(
      z.object({
        title: z.string(),
        link: z.string(),
        summary: z.string(),
        interest: z.string(),
      })
    ),
  },
  async (input) => {
    const { interest } = input;

    logger.info("Buscar conteúdos na web");
    const webResults = await webSearchTool({ query: `${interest} notícias recentes`, maxResults: 20 });

    const prompt = getNewsDescoveryCuratorPrompt(interest, webResults);

    const { text } = await ai.generate({ prompt });
    return JSON.parse(text || "[]");
  }
);
