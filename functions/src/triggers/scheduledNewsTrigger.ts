import * as functions from 'firebase-functions/v1';
import {newsDiscovery} from '../ai/services/newsDiscoveryService';
import {addDocument, getUsersAtiveLastThirtyMins} from '../utils/firestoreHelpers';
import {logger} from '../utils/logger';
import {colUltimasNoticias, colUsuarios} from '../utils/collection';


/**
 * Executa automaticamente a cada 12 hora via Cloud Scheduler.
 */
export const scheduledNewsDiscovery = functions.pubsub
    .schedule('every 12 hours')
    .timeZone('America/Sao_Paulo')
    .onRun(async () => {
      try {
        logger.info('Iniciando descoberta proativa de notícias...');

        const usersSnapshot = await getUsersAtiveLastThirtyMins(colUsuarios);

        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          const interests = userData.interests || [];
          if (interests.length === 0) {
            logger.info(`Usuário ${userDoc.id} não possui interesses. Pulando...`);
            continue;
          }
          logger.info(`Usuário ativo recentemente: ${userDoc.id}`, {lastActiveAt: userData.lastActiveAt});
          const newsItems = await newsDiscovery(Array.from(interests).join(', '));

          if (newsItems.length === 0) {
            logger.info(`Nenhuma notícia encontrada para o usuário ${userDoc.id}.`);
            continue;
          }
          await addDocument(colUltimasNoticias, {userId: userDoc.id, newsItems});
        }
        logger.info('Descoberta de notícias concluída com sucesso.');
        logger.info(`usuários ativos recentemente encontrados: ${usersSnapshot.size}`);
        return null;
      } catch (error) {
        logger.err('Erro durante a descoberta proativa de notícias:', error);
        return null;
      }
    });
