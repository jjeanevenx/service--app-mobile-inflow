import { genaiClient } from "../client/genaiClient";
import { learningPathSchema } from "../../model/interestSchema";
import { logger } from "../../utils/logger";
import {PROMPT_CONTENT_PATH_CURATOR} from "../../constants/prompt";
import { cleanJsonString } from "../../utils/jsonCleaning";



export const learningPath = async (goal: string) => {
  logger.info(`Iniciando a geração de conteúdo com base na(s) meta(s): ${goal} ...`);
  const text = await genaiClient(`${PROMPT_CONTENT_PATH_CURATOR.replace('#META', goal)}`);

  if(text === ''){
    return [];
  }

  let parsed = [];
  try{
    const jsonCleaned = cleanJsonString(text?.toString() || '');
    logger.info("Resposta limpa do content curator:", { jsonCleaned });
    parsed = JSON.parse(jsonCleaned);
  }
  catch(error)
  {
    logger.err("Erro ao parsear resposta do content curator", { error, text });
    return parsed;
  }

  return learningPathSchema.parse(parsed);
}