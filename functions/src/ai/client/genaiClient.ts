import {logger} from '../../utils/logger';
import {GoogleGenAI} from '@google/genai';
import {validateResponseSize} from '../../utils/inputValidation';

const ai = new GoogleGenAI({});
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;


const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


export const genaiClient = async (prompt: string, retryCount = 0): Promise<string> => {
  // valida input
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    logger.warn('Prompt vazio ou inválido fornecido ao GenAI');
    return '';
  }

  // limita tamanho do prompt para prevenir abuso
  const MAX_PROMPT_SIZE = 50000; // 50KB max prompt
  if (prompt.length > MAX_PROMPT_SIZE) {
    logger.err('Prompt excede tamanho máximo permitido', {size: prompt.length});
    return '';
  }

  try {
    logger.info('Iniciando chamada ao GenAI...', {retryCount});
    const groundingTool = {
      googleSearch: {},
    };

    const config = {
      tools: [groundingTool],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config,
    });

    const responseText = response.text?.trim() || '';

    // valida tamanho da resposta
    if (!validateResponseSize(responseText)) {
      logger.err('Resposta do GenAI excede tamanho máximo permitido', {size: responseText.length});
      return '';
    }

    logger.info('Chamada ao GenAI concluída.', {responseSize: responseText.length});
    return responseText;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isRetryable = errorMessage.includes('timeout') ||
                       errorMessage.includes('network') ||
                       errorMessage.includes('rate limit') ||
                       errorMessage.includes('503') ||
                       errorMessage.includes('429');

    if (isRetryable && retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
      logger.warn(`Erro retryable no GenAI, tentando novamente em ${delay}ms`, {
        error: errorMessage,
        retryCount: retryCount + 1,
      });
      await sleep(delay);
      return genaiClient(prompt, retryCount + 1);
    }

    logger.err('Erro ao gerar conteudos a partir da web com GenAI', {
      error: errorMessage,
      retryCount,
      isRetryable,
    });
    return '';
  }
};
