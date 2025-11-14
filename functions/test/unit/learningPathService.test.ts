import { learningPath } from "../../src/ai/services/learningPathService";
import { genaiClient } from "../../src/ai/client/genaiClient";
import { learningPathSchema } from "../../src/models/learningPath.schema";
import { logger } from "../../src/utils/logger";
import { cleanJsonString } from "../../src/utils/jsonCleaning";
import { jest, describe, it, beforeEach, expect} from "@jest/globals";

// Mocks
jest.mock("../../src/ai/client/genaiClient");
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/jsonCleaning");
jest.mock("../../src/models/learningPath.schema");

describe("learningPath service", () => {
  const goal = "Aprender Kubernetes";
  const existingContent = [
    { title: "Introdução ao Docker", url: "https://exemplo.com/docker" }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar [] se genaiClient retornar string vazia", async () => {
    (genaiClient as jest.Mock).mockResolvedValue("");

    const result = await learningPath(goal, existingContent);

    expect(result).toEqual([]);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("Iniciando a geração de conteúdo com base na meta")
    );
  });

  it("deve retornar [] se genaiClient retornar undefined", async () => {
    (genaiClient as jest.Mock).mockResolvedValue(undefined);

    const result = await learningPath(goal, existingContent);

    expect(result).toEqual([]);
  });

  it("deve parsear corretamente JSON e validar com learningPathSchema", async () => {
    const aiResponse = `
      [
        {
          "title": "Kubernetes para Iniciantes",
          "url": "https://exemplo.com/kubernetes",
          "type": "curso",
          "category": "infraestrutura",
          "summary": "Guia completo para aprender Kubernetes"
        }
      ]
    `;
    (genaiClient as jest.Mock).mockResolvedValue(aiResponse);
    (cleanJsonString as jest.Mock).mockReturnValue(aiResponse);
    (learningPathSchema.parse as jest.Mock).mockReturnValue([{ title: "Kubernetes para Iniciantes" }]);

    const result = await learningPath(goal, existingContent);

    expect(genaiClient).toHaveBeenCalledWith(
      expect.stringContaining(goal)
    );
    expect(cleanJsonString).toHaveBeenCalledWith(expect.stringContaining("Kubernetes para Iniciantes"));
    expect(learningPathSchema.parse).toHaveBeenCalled();
    expect(result).toEqual([{ title: "Kubernetes para Iniciantes" }]);
  });

  it("deve retornar [] e logar erro se o JSON estiver inválido", async () => {
    (genaiClient as jest.Mock).mockResolvedValue("texto inválido");
    (cleanJsonString as jest.Mock).mockReturnValue("texto inválido");

    const result = await learningPath(goal, existingContent);

    expect(logger.err).toHaveBeenCalledWith(
      "Erro ao parsear resposta do content curator",
      expect.any(Object)
    );
    expect(result).toEqual([]);
  });

  it("deve propagar erro se genaiClient lançar exceção", async () => {
    (genaiClient as jest.Mock).mockRejectedValue(new Error("Falha no GenAI"));

    await expect(learningPath(goal, existingContent)).rejects.toThrow("Falha no GenAI");
  });
});
