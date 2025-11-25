import {jest, describe, it, beforeEach, expect} from '@jest/globals';
import {newsDiscovery} from '../../src/ai/services/newsDiscoveryService';
import {genaiClient} from '../../src/ai/client/genaiClient';
import {newsSchema} from '../../src/models/news.schema';
import {logger} from '../../src/utils/logger';
import {safeJsonParse} from '../../src/utils/jsonCleaning';

// Mocks
jest.mock('../../src/ai/client/genaiClient');
jest.mock('../../src/utils/logger');
jest.mock('../../src/utils/jsonCleaning');
jest.mock('../../src/models/news.schema');

describe('newsDiscovery service', () => {
  const topic = 'tecnologia';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar [] se genaiClient retornar string vazia', async () => {
    (genaiClient as jest.MockedFunction<typeof genaiClient>).mockResolvedValue('');

    const result = await newsDiscovery(topic);

    expect(result).toEqual([]);
    expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Iniciando a descoberta de notícias'),
    );
  });

  it('deve parsear corretamente JSON e validar com newsSchema', async () => {
    const aiResponse = `
      [
        {
          "title": "Nova IA revoluciona o mercado",
          "link": "https://exemplo.com/noticia",
          "summary": "Uma nova IA está mudando o setor de tecnologia.",
          "interest": "tecnologia",
          "category": "tecnologia",
          "readTime": "5 min",
          "publishedAt": "2025-01-15",
          "trending": true,
          "author": "Autor Exemplo"
        }
      ]
    `;
    (genaiClient as jest.MockedFunction<typeof genaiClient>).mockResolvedValue(aiResponse);
    (safeJsonParse as jest.MockedFunction<typeof safeJsonParse>).mockReturnValue([
      {
        title: 'Nova IA revoluciona o mercado',
        link: 'https://exemplo.com/noticia',
        summary: 'Uma nova IA está mudando o setor de tecnologia.',
        interest: 'tecnologia',
        category: 'tecnologia',
        readTime: '5 min',
        publishedAt: '2025-01-15',
        trending: true,
        author: 'Autor Exemplo',
      },
    ]);
    (newsSchema.safeParse as jest.MockedFunction<typeof newsSchema.safeParse>).mockReturnValue({
      success: true,
      data: [
      {
        title: 'Nova IA revoluciona o mercado',
        link: 'https://exemplo.com/noticia',
        summary: 'Uma nova IA está mudando o setor de tecnologia.',
        interest: 'tecnologia',
        category: 'tecnologia',
        readTime: '5 min',
        publishedAt: '2025-01-15',
        trending: true,
        author: 'Autor Exemplo',
      },
    ],
    } as any);

    const result = await newsDiscovery(topic);

    expect(genaiClient).toHaveBeenCalledWith(
        expect.stringContaining(topic),
    );
    expect(safeJsonParse).toHaveBeenCalled();
    expect(newsSchema.safeParse).toHaveBeenCalled();
    expect(result).toEqual([{
      title: 'Nova IA revoluciona o mercado',
      link: 'https://exemplo.com/noticia',
      summary: 'Uma nova IA está mudando o setor de tecnologia.',
      interest: 'tecnologia',
      category: 'tecnologia',
      readTime: '5 min',
      publishedAt: '2025-01-15',
      trending: true,
      author: 'Autor Exemplo',
    }]);
  });

  it('deve retornar [] e logar erro se o JSON estiver inválido', async () => {
    (genaiClient as jest.MockedFunction<typeof genaiClient>).mockResolvedValue('texto inválido');
    (safeJsonParse as jest.MockedFunction<typeof safeJsonParse>).mockReturnValue(null);

    const result = await newsDiscovery(topic);

    expect(logger.err).toHaveBeenCalledWith(
        'Falha ao parsear JSON da resposta do news discovery',
        expect.any(Object),
    );
    expect(result).toEqual([]);
  });

  it('deve retornar [] se genaiClient lançar exceção', async () => {
    (genaiClient as jest.MockedFunction<typeof genaiClient>).mockRejectedValue(new Error('Falha no GenAI'));

    const result = await newsDiscovery(topic);
    expect(result).toEqual([]);
  });
});
