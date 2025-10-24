import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export async function addDocument<T extends Record<string, any>>(
  collection: string,
  data: T
) {
  return db.collection(collection).add({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

export async function updateDocument<T extends Record<string, any>>(
  collection: string,
  docId: string,
  data: Partial<T>
) {
  return db.collection(collection).doc(docId).set(data, { merge: true });
}


export async function deleteByField(
  collection: string,
  field: string,
  value: any
) {
  const snapshot = await db
    .collection(collection)
    .where(field, "==", value)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}
