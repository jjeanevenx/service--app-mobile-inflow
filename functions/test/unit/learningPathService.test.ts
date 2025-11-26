import {learningPath} from '../../src/ai/services/learningPathService';
import {genaiClient} from '../../src/ai/client/genaiClient';
import {learningPathSchema} from '../../src/models/learningPath.schema';
import {logger} from '../../src/utils/logger';
import {safeJsonParse} from '../../src/utils/jsonCleaning';
import {jest, describe, it, beforeEach, expect} from '@jest/globals';

// Mocks
jest.mock('../../src/ai/client/genaiClient');
jest.mock('../../src/utils/logger');
jest.mock('../../src/utils/jsonCleaning');
jest.mock('../../src/models/learningPath.schema');

describe('learningPath service', () => {
  const goal = 'Aprender Kubernetes';
  const existingContent = [
    {title: 'Introdução ao Docker', url: 'https://exemplo.com/docker'},
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar null se genaiClient retornar string vazia', async () => {
    (genaiClient as jest.MockedFunction<typeof genaiClient>).mockResolvedValue('');

    const result = await learningPath(goal, existingContent);

    expect(result).toBeNull();
    expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Iniciando a geração de conteúdo com base na meta'),
    );
  });

  it('deve retornar null se genaiClient retornar undefined', async () => {
    (genaiClient as jest.MockedFunction<typeof genaiClient>).mockResolvedValue('');

    const result = await learningPath(goal, existingContent);

    expect(result).toBeNull();
  });

  it('deve parsear corretamente JSON e validar com learningPathSchema', async () => {
    const aiResponse = `
      {
        "title": "Trilha de Kubernetes",
        "goal": "Aprender Kubernetes",
        "description": "Uma trilha completa",
        "moduleCount": 1,
        "totalHours": 10,
        "difficulty": "intermediário",
        "modules": [
          {
            "title": "Fundamentos",
            "order": "1",
            "description": "Módulo introdutório",
            "lessonCount": 5,
            "totalHours": 10,
            "difficulty": "iniciante",
            "lessons": [
              {
                "order": "1",
                "title": "Kubernetes para Iniciantes",
                "url": "https://exemplo.com/kubernetes",
                "duration": "2 horas",
                "author": "Autor Exemplo",
                "category": "infraestrutura",
                "summary": "Guia completo para aprender Kubernetes"
              }
            ]
          }
        ]
      }
    `;
    const mockData = {
      title: 'Trilha de Kubernetes',
      goal: 'Aprender Kubernetes',
      description: 'Uma trilha completa',
      moduleCount: 1,
      totalHours: 10,
      difficulty: 'intermediário',
      modules: [{
        title: 'Fundamentos',
        order: '1',
        description: 'Módulo introdutório',
        lessonCount: 5,
        totalHours: 10,
        difficulty: 'iniciante',
        lessons: [{
          order: '1',
          title: 'Kubernetes para Iniciantes',
          url: 'https://exemplo.com/kubernetes',
          duration: '2 horas',
          author: 'Autor Exemplo',
          category: 'infraestrutura',
          summary: 'Guia completo para aprender Kubernetes',
        }],
      }],
    };

    (genaiClient as jest.MockedFunction<typeof genaiClient>).mockResolvedValue(aiResponse);
    (safeJsonParse as jest.MockedFunction<typeof safeJsonParse>).mockReturnValue(mockData);
    (learningPathSchema.safeParse as jest.MockedFunction<typeof learningPathSchema.safeParse>).mockReturnValue({
      success: true,
      data: mockData,
    } as any);

    const result = await learningPath(goal, existingContent);

    expect(genaiClient).toHaveBeenCalledWith(
        expect.stringContaining(goal),
    );
    expect(safeJsonParse).toHaveBeenCalled();
    expect(learningPathSchema.safeParse).toHaveBeenCalled();
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Trilha de Kubernetes');
  });

  it('deve retornar null e logar erro se o JSON estiver inválido', async () => {
    (genaiClient as jest.MockedFunction<typeof genaiClient>).mockResolvedValue('texto inválido');
    (safeJsonParse as jest.MockedFunction<typeof safeJsonParse>).mockReturnValue(null);

    const result = await learningPath(goal, existingContent);

    expect(logger.err).toHaveBeenCalledWith(
        'Falha ao parsear JSON da resposta do learning path',
        expect.any(Object),
    );
    expect(result).toBeNull();
  });

  it('deve retornar null se genaiClient lançar exceção', async () => {
    (genaiClient as jest.MockedFunction<typeof genaiClient>).mockRejectedValue(new Error('Falha no GenAI'));

    const result = await learningPath(goal, existingContent);
    expect(result).toBeNull();
  });
});
