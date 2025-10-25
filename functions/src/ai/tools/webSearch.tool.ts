import axios from "axios";
import { genkit, z } from 'genkit';
import { googleAI } from "@genkit-ai/googleai";
import { logger } from "../../utils/logger";


const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const GOOGLE_CX = process.env.GOOGLE_CX!;

const ai = genkit({
  plugins: [ googleAI() ],
  model: googleAI.model("gemini-1.5-flash")
});

export const webSearchTool = ai.defineTool(
  {
    name: "webSearch",
    description: "Busca conteúdos na web com base em um termo de interesse",
    inputSchema: z.object({
      query: z.string().describe("Termo a ser pesquisado na web"),
      maxResults: z.number().default(5).describe("Número máximo de resultados a retornar")
    }),
    outputSchema: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string(),
    })
    )
  },
  async (input) => {
    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      throw new Error("As variáveis GOOGLE_API_KEY e GOOGLE_CX não estão definidas.");
    }
    const endpoint = new URL("https://www.googleapis.com/customsearch/v1");
    endpoint.searchParams.set("key", GOOGLE_API_KEY);
    endpoint.searchParams.set("cx", GOOGLE_CX);
    endpoint.searchParams.set("q", input.query);
    endpoint.searchParams.set("num", input.maxResults.toString());
    endpoint.searchParams.set("safe", "active");

    const response = await axios.get(endpoint.toString());
    
     if (response.status !== 200) {
      logger.err(`Erro na requisição: ${response.status} - ${response.statusText}`);
      const errorText = response.statusText;
      throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
    }

    const data = await response.data;

    if (!data.items || data.items.length === 0) {
      return [];
    }

    logger.info("Normaliza os dados de saída");
    return data.items.map((item: any) => ({
      title: item.title ?? "",
      url: item.link ?? "",
      snippet: item.snippet ?? "",
    }));
  }
);