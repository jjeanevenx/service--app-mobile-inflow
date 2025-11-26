import {genaiClient} from '../client/genaiClient';
import {interestSchema} from '../../models/interest.schema';
import {logger} from '../../utils/logger';
import {PROMPT_CONTENT_CURATOR} from '../../constants/prompt';
import {safeJsonParse} from '../../utils/jsonCleaning';
import {validateTopic, validateResponseSize} from '../../utils/inputValidation';


export const contentCurator = async (topic: string) => {
  // valida e sanitiza input
  const validatedTopic = validateTopic(topic);
  if (!validatedTopic) {
    logger.warn('Tópico inválido ou vazio fornecido ao content curator', {topic});
    return [];
  }

  logger.info(`Iniciando a geração de conteúdo com base no(s) interesse(s): ${validatedTopic} ...`);
  try {
    const prompt = PROMPT_CONTENT_CURATOR.replace('#TOPIC', validatedTopic);
    const text = await genaiClient(prompt);

    if (!text || text === '') {
      logger.warn('Resposta vazia do GenAI para content curator');
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
      logger.err('Falha ao parsear JSON da resposta do content curator', {text: text.substring(0, 500)});
      return [];
    }

    // valida com schema Zod - usa safeParse para lidar com erros graceful
    const validationResult = interestSchema.safeParse(parsed);
    if (!validationResult.success) {
      logger.err('Validação de schema falhou para content curator', {
        errors: validationResult.error,
        parsed: JSON.stringify(parsed).substring(0, 500),
      });
      return [];
    }

    logger.info(`Content curator gerou ${validationResult.data.length} itens`);
    return validationResult.data;
  } catch (error) {
    logger.err('Erro inesperado no content curator', {error});
    return [];
  }
};
