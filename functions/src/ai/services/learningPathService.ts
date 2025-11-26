import {genaiClient} from '../client/genaiClient';
import {learningPathSchema} from '../../models/learningPath.schema';
import {logger} from '../../utils/logger';
import {PROMPT_CONTENT_PATH_CURATOR} from '../../constants/prompt';
import {safeJsonParse} from '../../utils/jsonCleaning';
import {validateGoal, validateExistingContent, validateResponseSize} from '../../utils/inputValidation';


export const learningPath = async (goal: string, existingContent: unknown[] = []) => {
  // valida e sanitiza input
  const validatedGoal = validateGoal(goal);
  if (!validatedGoal) {
    logger.warn('Meta inválida ou vazia fornecida ao learning path', {goal});
    return null;
  }

  // valida conteúdo existente
  if (!validateExistingContent(existingContent)) {
    logger.warn('Conteúdo existente inválido fornecido ao learning path');
    existingContent = [];
  }

  logger.info(`Iniciando a geração de conteúdo com base na meta: ${validatedGoal} ...`);
  try {
    // parsea conteúdo existente de forma segura
    let contentJson = '[]';
    try {
      contentJson = JSON.stringify(existingContent);
    } catch (error) {
      logger.warn('Erro ao serializar conteúdo existente, usando array vazio', {error});
      contentJson = '[]';
    }

    const prompt = PROMPT_CONTENT_PATH_CURATOR
        .replace('#META', validatedGoal)
        .replace('#CONTEUDO', contentJson);
    const text = await genaiClient(prompt);

    if (!text || text === '') {
      logger.warn('Resposta vazia do GenAI para learning path');
      return null;
    }

    // valida tamanho da resposta
    if (!validateResponseSize(text)) {
      logger.err('Resposta do GenAI excede tamanho máximo permitido');
      return null;
    }

    // parsea JSON de forma segura
    const parsed = safeJsonParse<unknown>(text);
    if (!parsed) {
      logger.err('Falha ao parsear JSON da resposta do learning path', {text: text.substring(0, 500)});
      return null;
    }

    // valida com schema Zod - usa safeParse para lidar com erros graceful
    const validationResult = learningPathSchema.safeParse(parsed);
    if (!validationResult.success) {
      logger.err('Validação de schema falhou para learning path', {
        errors: validationResult.error,
        parsed: JSON.stringify(parsed).substring(0, 500),
      });
      return null;
    }

    logger.info('Learning path gerado com sucesso', {
      title: validationResult.data.title,
      moduleCount: validationResult.data.moduleCount,
    });
    return validationResult.data;
  } catch (error) {
    logger.err('Erro inesperado no learning path', {error});
    return null;
  }
};
