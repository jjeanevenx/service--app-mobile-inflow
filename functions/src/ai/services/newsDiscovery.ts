import { genaiClient } from "../client/genaiClient";
import { newsSchema } from "../../model/interestSchema";
import { logger } from "../../utils/logger";
import {PROMPT_NEWS_DISCOVERY} from "../../constants/prompt";
import { cleanJsonString } from "../../utils/jsonCleaning";


export const newsDiscovery = async (topic: string) => {
  logger.info(`Iniciando a descoberta de notícias com base no(s) interesse(s): ${topic} ...`);
  const text = await genaiClient(`${PROMPT_NEWS_DISCOVERY.replace('#TOPIC', topic)}`);

  if(text === ''){
    return [];
  }

  let parsed = [];
  try{
    const jsonCleaned = cleanJsonString(text?.toString() || '');
    logger.info("Resposta limpa do news discovery:", { jsonCleaned });
    parsed = JSON.parse(jsonCleaned);
  }
  catch(error)
  {
    logger.err("Erro ao parsear resposta do news discovery", { error, text });
    return parsed;
  }

  return newsSchema.parse(parsed);
}

