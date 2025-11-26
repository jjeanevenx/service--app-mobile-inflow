import {jest} from '@jest/globals';

export const mockBatch = {
  set: jest.fn(),
  commit: jest.fn(),
};

export const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  add: jest.fn(),
  where: jest.fn().mockReturnThis(),
  get: jest.fn(),
  batch: jest.fn(() => mockBatch),
};

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: () => mockFirestore,
}));
