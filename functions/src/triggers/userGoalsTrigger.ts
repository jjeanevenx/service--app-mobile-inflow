import * as functions from "firebase-functions/v1";
import { learningPathFlow } from "../ai/flows/learningPath.flow";
import { getByIdAndField, addDocument, deleteByField } from "../utils/firestoreHelpers";
import { logger } from "../utils/logger";

/**
 * Disparada sempre que o campo "metas" de um usuário for alterado.
 */
export const onUserGoalsChange = functions.firestore
  .document("usuarios/{uid}")
  .onUpdate(async (change, context) => {

    try{
        const before = change.before.data();
        const after = change.after.data();
        const userId = context.params.uid;

        const beforeGoals = before?.metas || [];
        const afterGoals = after?.metas || [];

        logger.info("Detectar mudanças");
        const addedGoals = afterGoals.filter((g: string) => !beforeGoals.includes(g));
        const removedGoals = beforeGoals.filter((g: string) => !afterGoals.includes(g));
        const updatedGoals = afterGoals.filter(
          (g: string) => beforeGoals.includes(g) && g !== beforeGoals.find((b: string) => b === g)
        );

        if (addedGoals.length === 0 && removedGoals.length === 0 && updatedGoals.length === 0) {
          logger.info("Nenhuma alteração relevante em metas", { userId });
          return;
        }

        logger.info("Alterações detectadas em metas", { userId, addedGoals, removedGoals });

        logger.info("Deletar trilhas removidas");
        for (const goal of removedGoals) {

            const field = {name: "meta", value: goal};
            await deleteByField("trilhas", userId, field);
            logger.info(`Trilha removida: ${goal}`);
        }

        logger.info("Gerar ou atualizar trilhas novas/alteradas");
        const goalsToProcess = [...addedGoals, ...updatedGoals];
        for (const goal of goalsToProcess) {

          logger.info("Buscar conteúdos recomendados existentes");
          const contentSnapshot = await getByIdAndField("conteudos_recomendados", {docId: userId, name: "interest", value: goal});

          const existingContent = contentSnapshot.docs.map((doc) => doc.data());
          const path = await learningPathFlow.run({ goal, ...existingContent });

          await addDocument("trilhas", path)

          logger.info(`Trilha gerada/atualizada para: ${goal}`);
        }

    }
    catch(error){
      logger.err("Erro ao processar alterações de metas do usuário", { error });
      return;
    }
    
  });
