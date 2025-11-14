import { newsDiscovery } from "../../src/ai/services/newsDiscoveryService";
import { genaiClient } from "../../src/ai/client/genaiClient";
import { newsSchema } from "../../src/models/news.schema";
import { logger } from "../../src/utils/logger";
import { cleanJsonString } from "../../src/utils/jsonCleaning";

// Mocks
jest.mock("../../src/ai/client/genaiClient");
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/jsonCleaning");
jest.mock("../../src/models/news.schema");

describe("newsDiscovery service", () => {
  const topic = "tecnologia";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar [] se genaiClient retornar string vazia", async () => {
    (genaiClient as jest.Mock).mockResolvedValue("");

    const result = await newsDiscovery(topic);

    expect(result).toEqual([]);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("Iniciando a descoberta de notícias")
    );
  });

  it("deve parsear corretamente JSON e validar com newsSchema", async () => {
    const aiResponse = `
      [
        {
          "title": "Nova IA revoluciona o mercado",
          "url": "https://exemplo.com/noticia",
          "type": "notícia",
          "category": "tecnologia",
          "summary": "Uma nova IA está mudando o setor de tecnologia."
        }
      ]
    `;
    (genaiClient as jest.Mock).mockResolvedValue(aiResponse);
    (cleanJsonString as jest.Mock).mockReturnValue(aiResponse);
    (newsSchema.parse as jest.Mock).mockReturnValue([
      { title: "Nova IA revoluciona o mercado" },
    ]);

    const result = await newsDiscovery(topic);

    expect(genaiClient).toHaveBeenCalledWith(
      expect.stringContaining(topic)
    );
    expect(cleanJsonString).toHaveBeenCalledWith(expect.stringContaining("Nova IA revoluciona o mercado"));
    expect(newsSchema.parse).toHaveBeenCalled();
    expect(result).toEqual([{ title: "Nova IA revoluciona o mercado" }]);
  });

  it("deve retornar [] e logar erro se o JSON estiver inválido", async () => {
    (genaiClient as jest.Mock).mockResolvedValue("texto inválido");
    (cleanJsonString as jest.Mock).mockReturnValue("texto inválido");

    const result = await newsDiscovery(topic);

    expect(logger.err).toHaveBeenCalledWith(
      "Erro ao parsear resposta do news discovery",
      expect.any(Object)
    );
    expect(result).toEqual([]);
  });

  it("deve propagar erro se genaiClient lançar exceção", async () => {
    (genaiClient as jest.Mock).mockRejectedValue(new Error("Falha no GenAI"));

    await expect(newsDiscovery(topic)).rejects.toThrow("Falha no GenAI");
  });
});
