import {genaiClient} from '../client/genaiClient';
import {newsSchema} from '../../models/news.schema';
import {logger} from '../../utils/logger';
import {PROMPT_NEWS_DISCOVERY} from '../../constants/prompt';
import {safeJsonParse} from '../../utils/jsonCleaning';
import {validateTopic, validateResponseSize} from '../../utils/inputValidation';


export const newsDiscovery = async (topic: string) => {
  // valida e sanitiza input
  const validatedTopic = validateTopic(topic);
  if (!validatedTopic) {
    logger.warn('Tópico inválido ou vazio fornecido ao news discovery', {topic});
    return [];
  }

  logger.info(`Iniciando a descoberta de notícias com base no(s) interesse(s): ${validatedTopic} ...`);
  try {
    const prompt = PROMPT_NEWS_DISCOVERY.replace('#TOPIC', validatedTopic);
    const text = await genaiClient(prompt);

    if (!text || text === '') {
      logger.warn('Resposta vazia do GenAI para news discovery');
      return [];
    }

    // valida tamanho da resposta
    if (!validateResponseSize(text)) {
      logger.err('Resposta do GenAI excede tamanho máximo permitido');
      return [];
    }

    // parsea JSON de forma segura
    const parsed = safeJsonParse<unknown>(text);
    if (!parsed) {
      logger.err('Falha ao parsear JSON da resposta do news discovery', {text: text.substring(0, 500)});
      return [];
    }

    // valida schema Zod - usa safeParse para lidar com erros graceful
    const validationResult = newsSchema.safeParse(parsed);
    if (!validationResult.success) {
      logger.err('Validação de schema falhou para news discovery', {
        errors: validationResult.error,
        parsed: JSON.stringify(parsed).substring(0, 500),
      });
      return [];
    }

    logger.info(`News discovery gerou ${validationResult.data.length} notícias`);
    return validationResult.data;
  } catch (error) {
    logger.err('Erro inesperado no news discovery', {error});
    return [];
  }
};

