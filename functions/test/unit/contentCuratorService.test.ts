import { contentCurator } from "../../src/ai/services/contentCuratorService";
import { genaiClient } from "../../src/ai/client/genaiClient";
import { logger } from "../../src/utils/logger";
import { cleanJsonString } from "../../src/utils/jsonCleaning";
import { interestSchema } from "../../src/models/interest.schema";

// Mocks
jest.mock("../../src/ai/client/genaiClient");
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/jsonCleaning");
jest.mock("../../src/models/interest.schema");

describe("contentCurator", () => {
  const topic = "Inteligência Artificial";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar um array vazio se genaiClient retornar string vazia", async () => {
    (genaiClient as jest.Mock).mockResolvedValue("");
    const result = await contentCurator(topic);
    expect(result).toEqual([]);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("Iniciando a geração de conteúdo")
    );
  });

  it("deve parsear o JSON corretamente e validar com interestSchema", async () => {
    const aiResponse = `
      [
        {
          "title": "IA no mundo moderno",
          "url": "https://exemplo.com/ia",
          "type": "artigo",
          "category": "tecnologia",
          "summary": "Resumo de exemplo"
        }
      ]
    `;
    (genaiClient as jest.Mock).mockResolvedValue(aiResponse);
    (cleanJsonString as jest.Mock).mockReturnValue(aiResponse);
    (interestSchema.parse as jest.Mock).mockReturnValue([{ title: "IA no mundo moderno" }]);

    const result = await contentCurator(topic);

    expect(genaiClient).toHaveBeenCalledWith(expect.stringContaining(topic));
    expect(cleanJsonString).toHaveBeenCalledWith(expect.stringContaining("IA no mundo moderno"));
    expect(interestSchema.parse).toHaveBeenCalled();
    expect(result).toEqual([{ title: "IA no mundo moderno" }]);
  });

  it("deve retornar [] e logar erro se o JSON estiver inválido", async () => {
    (genaiClient as jest.Mock).mockResolvedValue("texto inválido");
    (cleanJsonString as jest.Mock).mockReturnValue("texto inválido");

    const result = await contentCurator(topic);

    expect(logger.err).toHaveBeenCalledWith(
      "Erro ao parsear resposta do content curator",
      expect.any(Object)
    );
    expect(result).toEqual([]);
  });

  it("deve lidar com erros do genaiClient", async () => {
    (genaiClient as jest.Mock).mockRejectedValue(new Error("Falha no GenAI"));

    await expect(contentCurator(topic)).rejects.toThrow("Falha no GenAI");
  });
});
