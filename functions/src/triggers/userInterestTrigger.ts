import * as functions from "firebase-functions/v1";
import { contentCuratorFlow } from "../ai/flows/contentCurator.flow";
import { addDocument } from "../utils/firestoreHelpers";
import { logger } from "../utils/logger";

export const onUserInterestChange = functions.firestore
  .document("usuarios/{userId}")
  .onWrite(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const userId = context.params.userId;

    const beforeInterests = before?.interesses || [];
    const afterInterests = after?.interesses || [];

    // Identificar novos interesses
    const newInterests = afterInterests.filter((i: string) => !beforeInterests.includes(i));
    if (newInterests.length === 0) return;

    logger.info(`Novos interesses detectados para ${userId}:`, newInterests);

    for (const interest of newInterests) {
      const curatedContent = await contentCuratorFlow.run({ interest });

      for (const content of curatedContent.result) {
            await addDocument("conteudos_recomendados", {userId, interest, ...content});
        }
    }

    logger.info("Curadoria concluída para", userId);
  });
