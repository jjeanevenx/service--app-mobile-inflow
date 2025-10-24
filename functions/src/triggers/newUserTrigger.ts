import * as functions from "firebase-functions/v1";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Evita reinicialização do app em ambientes de hot-reload
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

/**
 * Gatilho para quando um novo usuário é criado no Firebase Auth.
 * Cria um documento correspondente na coleção 'users' do Firestore.
 */
export const onUserCreate = functions
  .region("southamerica-east1")
  .auth.user()
  .onCreate(async (user) => {
    const { uid, email, displayName } = user;
    const userRef = db.collection("usuarios").doc(uid);

    functions.logger.info(`Novo usuário criando perfil: ${uid}`, { email });

    try {
      await userRef.set({
        uid: uid,
        email: email,
        displayName: displayName || null,
        createdAt: new Date(),
        interesses: [],
        metas: [],  
      });
      functions.logger.info(`Perfil do usuário ${uid} criado com sucesso.`);
    } catch (error) {
      functions.logger.error(`Erro ao criar perfil para o usuário ${uid}:`, error);
    }
  });