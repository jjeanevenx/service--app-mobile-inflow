import { jest } from "@jest/globals";

jest.mock("firebase-functions/v1", () => {
    const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn(),
    };

    return {
        logger: mockLogger,

        region: jest.fn().mockReturnValue({
            firestore: {
                document: jest.fn().mockReturnValue({
                    onWrite: (fn: any) => fn,
                    onUpdate: (fn: any) => fn,
                }),
            },
            pubsub: {
                schedule: jest.fn().mockReturnValue({
                    onRun: (fn: any) => fn,
                }),
            },
            auth: {
                user: jest.fn().mockReturnValue({
                    onCreate: jest.fn((fn: any) => fn),
                }),
            },

        }),
    };
});
