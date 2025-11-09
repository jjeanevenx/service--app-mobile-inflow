import { logger } from "../../utils/logger";
import { GoogleGenAI } from "@google/genai";
//import { defineSecret } from "firebase-functions/params";


// const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY").value();
// logger.info("Chave da API Gemini carregada com sucesso?", { loaded: !!GEMINI_API_KEY });

const ai = new GoogleGenAI({  });

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
    return response.text;
  }
  catch (error) {
    logger.err("Erro ao gerar conteudos a partir da web com GenAI", error);
    return '';
  }

}