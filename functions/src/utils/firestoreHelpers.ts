import * as admin from 'firebase-admin';
import {logger} from 'firebase-functions';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {DatabaseName} from '../utils/database';

const app = initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = getFirestore(app, DatabaseName);

export async function getByIdAndField(collection: string, queryField: { id: string, name: string; value: any }) {
  return await db
      .collection(collection)
      .where('userId', '==', queryField.id)
      .where(queryField.name, '>=', queryField.value)
      .get();
}

export async function getAll(collection: string) {
  return await db.collection(collection).get();
}

export async function addDocument<T extends Record<string, any>>(
    collection: string,
    data: T,
) {
  return db.collection(collection).add({
    ...data,
  });
}

export async function updateDocument<T extends Record<string, any>>(
    collection: string,
    docId: string,
    data: Partial<T>,
) {
  return db.collection(collection).doc(docId).set(data, {merge: true});
}


export async function deleteByField(
    collection: string,
    id: string,
    field: { name: string, value: string },
) {
  const snapshot = await db
      .collection(collection)
      .where('userId', '==', id)
      .where(field.name, '==', field.value)
      .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

export async function getUsersAtiveLastThirtyMins(
    collection: string,
) {
  const time = Date.now() - 30 * 60 * 1000;
  logger.info(`Timestamp de 30 minutos atrás:${time}`);
  const usersSnapshot = await db.collection(collection)
      .where('lastActiveAt', '>=', (Date.now() - time).toString())
      .get();
  return usersSnapshot;
}
