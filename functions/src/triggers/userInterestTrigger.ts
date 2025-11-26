import * as functions from 'firebase-functions/v1';
import {contentCurator} from '../ai/services/contentCuratorService';
import {addDocument} from '../utils/firestoreHelpers';
import {logger} from '../utils/logger';
import {colConteudosRecomendados} from '../utils/collection';

export const onUserInterestChange = functions.firestore
    .database('(default)')
    .document('usuarios/{userId}')
    .onWrite(async (change, context) => {
      try {
        const before = change.before.data();
        const after = change.after.data();
        const userId = context.params.userId;

        const beforeInterests = before?.interests || [];
        const afterInterests = after?.interests || [];

        // Identificar novos interesses
        const newInterests = afterInterests.filter((i: string) => !beforeInterests.includes(i));
        if (newInterests.length === 0) return;

        logger.info(`Novos interesses detectados para ${userId}:`, newInterests);

        const curatedContent = await contentCurator(newInterests.join(','));

        if (curatedContent.length === 0) {
          logger.info('Nenhum conteúdo curado gerado.');
          return;
        }

        await addDocument(colConteudosRecomendados, {userId, ...curatedContent});
        logger.info('Curadoria concluída para', userId);
      } catch (error) {
        logger.err(`Erro ao processar interesses do usuário ${context.params.userId}:`, error);
        throw error;
      }
    });
