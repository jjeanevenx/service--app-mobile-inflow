import { genaiClient } from "../client/genaiClient";
import { interestSchema } from "../../model/interestSchema";
import { logger } from "../../utils/logger";
import {PROMPT_CONTENT_CURATOR} from "../../constants/prompt";



export const contentCurator = async (topic: string): Promise<typeof interestSchema._type> => {
  logger.info(`Iniciando a geração de conteúdo com base nos interesses ${topic} ...`);
  const text = await genaiClient(`${PROMPT_CONTENT_CURATOR.replace('#TOPIC', topic)}`);

  if(!text){
    return [];
  }

  let parsed = [];
  try{
    parsed = JSON.parse(text);
  }
  catch(error)
  {
    logger.err("Erro ao parsear resposta do content curator", { error, text });
    return parsed;
  }

  return interestSchema.parse(parsed);
}
