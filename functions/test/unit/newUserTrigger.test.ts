import { onUserCreate } from "../../src/triggers/newUserTrigger";
import { addDocument } from "../../src/utils/firestoreHelpers";
import * as functions from "firebase-functions/v1";

// Mock dos módulos externos
jest.mock("../../src/utils/firestoreHelpers", () => ({
    addDocument: jest.fn(),
}));

jest.mock("../../src/utils/collection", () => ({
    colUsuarios: "users",
}));

jest.mock("firebase-functions/v1", () => ({
    region: jest.fn().mockReturnThis(),
    auth: {
        user: jest.fn().mockReturnValue({
            onCreate: jest.fn((fn: any) => fn),
        }),
    },

    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

describe("onUserCreate trigger", () => {
    const mockUser = {
        uid: "user123",
        email: "teste@exemplo.com",
        displayName: "João da Silva",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve criar documento de usuário com dados básicos", async () => {
        // Simula o comportamento do gatilho chamando diretamente o handler
        await onUserCreate(mockUser as any);

        expect(addDocument).toHaveBeenCalledWith("users", {
            uid: "user123",
            email: "teste@exemplo.com",
            name: "João da Silva",
            interesses: [],
            metas: [],
        });

        expect(functions.logger.info).toHaveBeenCalledWith(
            expect.stringContaining("Novo usuário criando perfil"),
            expect.objectContaining({ email: "teste@exemplo.com" })
        );

        expect(functions.logger.info).toHaveBeenCalledWith(
            expect.stringContaining("criado com sucesso.")
        );
    });

    it("deve usar 'Usuário' como nome padrão quando displayName for nulo", async () => {
        const userSemNome = {
            uid: "user456",
            email: "anon@teste.com",
            displayName: null,
        };

        const handler = (onUserCreate as any);

        await handler(userSemNome);

        expect(addDocument).toHaveBeenCalledWith("users", {
            uid: "user456",
            email: "anon@teste.com",
            name: "Usuário",
            interesses: [],
            metas: [],
        });
    });

    it("deve logar erro quando addDocument falhar", async () => {
        (addDocument as jest.Mock).mockRejectedValueOnce(new Error("Erro Firestore"));

        const handler = (onUserCreate as any);

        await handler(mockUser);

        expect(functions.logger.error).toHaveBeenCalledWith(
            expect.stringContaining("Erro ao criar perfil para o usuário user123:"),
            expect.any(Error)
        );
    });
});
