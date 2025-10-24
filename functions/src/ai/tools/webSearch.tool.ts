import axios from "axios";
import { genkit, z } from 'genkit';
import { googleAI } from "@genkit-ai/googleai";

const ai = genkit({
  plugins: [ googleAI() ],
  model: googleAI.model("gemini-1.5-flash")
});

export const webSearchTool = ai.defineTool(
  {
    name: "webSearch",
    description: "Busca conteúdos na web com base em um termo de interesse",
    inputSchema: z.object({
      query: z.string().describe("Termo a ser pesquisado na web")
    }),
    outputSchema: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        resumo: z.string()
      })
    )
  },
  async (input) => {
    const { query } = input;
    const encoded = encodeURIComponent(query);
    const res = await axios.get(`https://api.duckduckgo.com/?q=${encoded}&format=json`);
    const results = (res.data.RelatedTopics || []).slice(0, 10).map((item: any) => ({
      title: item.Text,
      url: item.FirstURL
    }));
    return results;
  }
);