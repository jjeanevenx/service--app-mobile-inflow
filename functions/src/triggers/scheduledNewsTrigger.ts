import * as functions from "firebase-functions/v1";
import { newsDiscovery } from "../ai/services/newsDiscovery";
import { addDocument, getAll } from "../utils/firestoreHelpers"
import { logger } from "../utils/logger";


/**
 * Executa automaticamente a cada 1 hora via Cloud Scheduler.
 */
export const scheduledNewsDiscovery = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async () => {
    logger.info("Iniciando descoberta proativa de notícias...");

    logger.info("Agregar todos os interesses únicos dos usuários");
    const snapshot = await getAll("usuarios");
    const allInterests = new Set<string>(); 

    snapshot.forEach((doc:any) => {
      const interests = doc.data().interesses || [];
      interests.forEach((i: string) => allInterests.add(i));
    });

    if (allInterests.size === 0) {
      logger.warn("Nenhum interesse encontrado. Encerrando execução.");
      return null;
    }

    // logger.info(`Buscando notícias para interesse: ${interest}`);
    // const newsItems = await newsDiscoveryFlow(allInterests.);
      
    //   logger.info("Salvar resultados no Firestore");
    //   await addDocument("ultimas_noticias", item);
      
    logger.info("Descoberta de notícias concluída com sucesso.");
    return null;
      
  });
