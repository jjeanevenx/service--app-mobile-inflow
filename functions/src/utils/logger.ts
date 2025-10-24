import * as functions from "firebase-functions";

export const logger = {
  info: (message: string, data?: any) =>
    functions.logger.info(message, data || {}),
  warn: (message: string, data?: any) =>
    functions.logger.warn(message, data || {}),
  err: (message: string, error?: any) =>
    functions.logger.error(message, error || {}),
};
