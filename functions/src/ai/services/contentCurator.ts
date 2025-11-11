import { genaiClient } from "../client/genaiClient";
import { interestSchema } from "../../model/interestSchema";
import { logger } from "../../utils/logger";
import {PROMPT_CONTENT_CURATOR} from "../../constants/prompt";
import { cleanJsonString } from "../../utils/jsonCleaning";



export const contentCurator = async (topic: string) => {
  logger.info(`Iniciando a geração de conteúdo com base no(s) interesse(s): ${topic} ...`);
  const text = await genaiClient(`${PROMPT_CONTENT_CURATOR.replace('#TOPIC', topic)}`);

  if(text === ''){
    return [];
  }

  let parsed = [];
  try{
    logger.info("Limpa e parseia resposta do content curator");
    const jsonCleaned = cleanJsonString(text?.toString() || '');
    parsed = JSON.parse(jsonCleaned);
  }
  catch(error)
  {
    logger.err("Erro ao parsear resposta do content curator", { error, text });
    return parsed;
  }

  return interestSchema.parse(parsed);
}
