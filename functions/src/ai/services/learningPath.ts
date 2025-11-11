import { genaiClient } from "../client/genaiClient";
import { learningPathSchema } from "../../models/learningPath.schema";
import { logger } from "../../utils/logger";
import {PROMPT_CONTENT_PATH_CURATOR} from "../../constants/prompt";
import { cleanJsonString } from "../../utils/jsonCleaning";



export const learningPath = async (goal: string, existingContent: any[]) => {
  logger.info(`Iniciando a geração de conteúdo com base na meta: ${goal} ...`);
  const text = await genaiClient(`${PROMPT_CONTENT_PATH_CURATOR
                                          .replace('#META', goal)
                                          .replace('#CONTEUDO', JSON.stringify(existingContent))}`);

  if(text === '' || text == undefined){
    return [];
  }

  let parsed = [];
  try{
    logger.info("Limpa e parseia resposta da criação de trilha de aprendizado");
    const jsonCleaned = cleanJsonString(text?.toString() || '');
    parsed = JSON.parse(jsonCleaned);
  }
  catch(error)
  {
    logger.err("Erro ao parsear resposta do content curator", { error, text });
    return parsed;
  }

  return learningPathSchema.parse(parsed);
}