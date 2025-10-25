import * as functions from "firebase-functions/v1";
import { initializeApp, getApps } from "firebase-admin/app";
import { addDocument } from "../utils/firestoreHelpers";

if (getApps().length === 0) {
  initializeApp();
}


/**
 * Gatilho para quando um novo usuário é criado no Firebase Auth.
 * Cria um documento correspondente na coleção 'users' do Firestore.
 */
export const onUserCreate = functions
  .region("southamerica-east1")
  .auth
  .user()
  .onCreate(async (user) => {
    const { uid, email, displayName } = user;
    functions.logger.info(`Novo usuário criando perfil: ${uid}`, { email });

    try {

      const userDoc = {
      uid,
      email: email || null,
      name: displayName || "Usuário",
      interesses: [], // vazio inicialmente
      metas: [], // vazio inicialmente
    };
      await addDocument("usuarios", userDoc);
      functions.logger.info(`Perfil do usuário ${uid} criado com sucesso.`);
    } catch (error) {
      functions.logger.error(`Erro ao criar perfil para o usuário ${uid}:`, error);
    }
  });