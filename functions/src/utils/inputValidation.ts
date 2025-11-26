/**
 * Valida e sanitiza input para serviços de IA
 */

const MAX_INPUT_LENGTH = 500;
const MAX_TOPIC_LENGTH = 200;
const MAX_GOAL_LENGTH = 200;
const MAX_RESPONSE_SIZE = 100000; // 100KB max response size

// sanitiza input para prevenir injeção de prompt
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove caracteres potencialmente perigosos e padrões
  return input
      .trim()
      .replace(/[<>{}[\]\\]/g, '') // Remove colchetes e barras invertidas
      .replace(/```/g, '') // Remove code block markers
      .replace(/`/g, '') // Remove crases
      .replace(/\n{3,}/g, '\n\n') // Limita novas linhas consecutivas
      .slice(0, MAX_INPUT_LENGTH); // Força tamanho máximo
};

// Valida e sanitiza input de tópico
export const validateTopic = (topic: string): string | null => {
  if (!topic || typeof topic !== 'string') {
    return null;
  }

  const sanitized = sanitizeInput(topic);
  if (sanitized.length === 0 || sanitized.length > MAX_TOPIC_LENGTH) {
    return null;
  }

  return sanitized;
};

// Valida e sanitiza input de meta
export const validateGoal = (goal: string): string | null => {
  if (!goal || typeof goal !== 'string') {
    return null;
  }

  const sanitized = sanitizeInput(goal);
  if (sanitized.length === 0 || sanitized.length > MAX_GOAL_LENGTH) {
    return null;
  }

  return sanitized;
};

// Valida tamanho da resposta
export const validateResponseSize = (response: string): boolean => {
  if (!response || typeof response !== 'string') {
    return false;
  }
  return response.length <= MAX_RESPONSE_SIZE;
};

// Valida array de conteúdo existente
export const validateExistingContent = (content: unknown): boolean => {
  if (!Array.isArray(content)) {
    return false;
  }

  // Limita tamanho do array para prevenir problemas de memória
  if (content.length > 100) {
    return false;
  }

  // Valida cada item é um objeto plano
  return content.every((item) => {
    return typeof item === 'object' && item !== null && !Array.isArray(item);
  });
};
