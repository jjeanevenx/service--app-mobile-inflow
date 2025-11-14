import { jest } from "@jest/globals";


export const mockGenerateTyped = jest.fn(async () => ({
  goal: "Kubernetes",
  steps: [{ title: "Step test" }]
}));

jest.mock("../../src/ai/client/genaiClient", () => ({
  generateTyped: mockGenerateTyped,
}));
