import {jest, describe, it, beforeEach, expect} from '@jest/globals';
import {contentCurator} from '../../src/ai/services/contentCuratorService';
import {genaiClient} from '../../src/ai/client/genaiClient';
import {logger} from '../../src/utils/logger';
import {safeJsonParse} from '../../src/utils/jsonCleaning';
import {interestSchema} from '../../src/models/interest.schema';

// Mocks
jest.mock('../../src/ai/client/genaiClient');
jest.mock('../../src/utils/logger');
jest.mock('../../src/utils/jsonCleaning');
jest.mock('../../src/models/interest.schema');

describe('contentCurator', () => {
  const topic = 'Inteligência Artificial';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar um array vazio se genaiClient retornar string vazia', async () => {
    (genaiClient as jest.MockedFunction<typeof genaiClient>).mockResolvedValue('');
    const result = await contentCurator(topic);
    expect(result).toEqual([]);
    expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Iniciando a geração de conteúdo'),
    );
  });

  it('deve parsear o JSON corretamente e validar com interestSchema', async () => {
    const aiResponse = `
      [
        {
          'title': 'IA no mundo moderno',
          'url': 'https://exemplo.com/ia',
          'type': 'artigo',
          'category': 'tecnologia',
          'summary': 'Resumo de exemplo'
        }
      ]
    `;
    (genaiClient as jest.MockedFunction<typeof genaiClient>).mockResolvedValue(aiResponse);
    (safeJsonParse as jest.MockedFunction<typeof safeJsonParse>).mockReturnValue([{
      title: 'IA no mundo moderno',
      url: 'https://exemplo.com/ia',
      author: 'Autor Exemplo',
      publishedAt: '2025-01-15',
      readTime: '5 min',
      type: 'artigo',
      temperature: 0.9,
      category: 'tecnologia',
      summary: 'Resumo de exemplo',
    }]);
    (interestSchema.safeParse as jest.MockedFunction<typeof interestSchema.safeParse>).mockReturnValue({
      success: true,
      data: [{
      title: 'IA no mundo moderno',
      url: 'https://exemplo.com/ia',
      author: 'Autor Exemplo',
      publishedAt: '2025-01-15',
      readTime: '5 min',
      type: 'artigo',
      temperature: 0.9,
      category: 'tecnologia',
      summary: 'Resumo de exemplo',
    }],
    } as any);

    const result = await contentCurator(topic);

    expect(genaiClient).toHaveBeenCalledWith(expect.stringContaining(topic));
    expect(safeJsonParse).toHaveBeenCalled();
    expect(interestSchema.safeParse).toHaveBeenCalled();
    expect(result).toEqual([{
      title: 'IA no mundo moderno',
      url: 'https://exemplo.com/ia',
      author: 'Autor Exemplo',
      publishedAt: '2025-01-15',
      readTime: '5 min',
      type: 'artigo',
      temperature: 0.9,
      category: 'tecnologia',
      summary: 'Resumo de exemplo',
    }]);
  });

  it('deve retornar [] e logar erro se o JSON estiver inválido', async () => {
    (genaiClient as jest.MockedFunction<typeof genaiClient>).mockResolvedValue('texto inválido');
    (safeJsonParse as jest.MockedFunction<typeof safeJsonParse>).mockReturnValue(null);

    const result = await contentCurator(topic);

    expect(logger.err).toHaveBeenCalledWith(
        'Falha ao parsear JSON da resposta do content curator',
        expect.any(Object),
    );
    expect(result).toEqual([]);
  });

  it('deve lidar com erros do genaiClient', async () => {
    (genaiClient as jest.MockedFunction<typeof genaiClient>).mockRejectedValue(new Error('Falha no GenAI'));

    const result = await contentCurator(topic);
    expect(result).toEqual([]);
  });
});
