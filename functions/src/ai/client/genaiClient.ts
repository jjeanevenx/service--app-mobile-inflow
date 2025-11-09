import { logger } from "../../utils/logger";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export const genaiClient = async (promt: string) => {
  try {
    logger.info("Iniciando chamada ao GenAI...");
    const groundingTool = {
      googleSearch: {},
    };

    const config = {
      tools: [groundingTool],
    };
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promt,
      config
    });

    logger.info("Chamada ao GenAI concluída.");
    return response.text?.trim();
  }
  catch (error) {
    logger.err("Erro ao gerar conteudos a partir da web com GenAI", error);
    return '';
  }

}