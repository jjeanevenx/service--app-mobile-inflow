import * as functions from "firebase-functions/v1";
import { contentCurator } from "../ai/services/contentCurator";
import { addDocument } from "../utils/firestoreHelpers";
import { logger } from "../utils/logger";
import { colConteudosRecomendados } from "../utils/collection";

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

    const curatedContent = await contentCurator(newInterests.join(','));

    if(curatedContent.length === 0){
      logger.info("Nenhum conteúdo curado gerado.");
      return;
    }
    await addDocument(colConteudosRecomendados, {userId, ...curatedContent});
    

    logger.info("Curadoria concluída para", userId);
  });
