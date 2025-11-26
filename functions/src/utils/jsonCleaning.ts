/**
 * Utilitário de limpeza de JSON melhorado com extração e validação melhoradas
 */

import {logger} from './logger';

const MAX_JSON_SIZE = 500000; // 500KB max JSON size

// Extrai JSON de uma string que pode conter blocos de código markdown ou outro texto
export const cleanJsonString = (jsonString: string): string => {
  if (!jsonString || typeof jsonString !== 'string') {
    return '';
  }

  // Verifica limite de tamanho primeiro
  if (jsonString.length > MAX_JSON_SIZE) {
    return '';
  }

  let cleaned = jsonString.trim();

  // Remove blocos de código markdown
  cleaned = cleaned
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

  // Tenta extrair JSON de padrões comuns
  // Padrão 1: JSON envolvido em markdown
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonMatch && jsonMatch[1]) {
    cleaned = jsonMatch[1].trim();
  }

  // Padrão 2: JSON entre chaves ou colchetes
  const braceMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (braceMatch && braceMatch[1]) {
    cleaned = braceMatch[1].trim();
  }

  // Remove texto não JSON inicial/final
  cleaned = cleaned.replace(/^[^{[]*/, '').replace(/[^}\]]*$/, '');

  return cleaned.trim();
};

// parsea JSON de forma segura com validação
export const safeJsonParse = <T = unknown>(jsonString: string): T | null => {
  try {
    const cleaned = cleanJsonString(jsonString);
    if (!cleaned) {
      return null;
    }

    const parsed = JSON.parse(cleaned);
    return parsed as T;
  } catch (error) {
    logger.err('Erro ao parsear JSON', {error});
    return null;
  }
};

