import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export async function getByIdAndField(collection: string, queryField: {docId: string, name: string; value: any }) 
{
  return await db
    .collection(collection)
    .where("uid", "==", queryField.docId)
    .where(queryField.name, ">=", queryField.value)
    .get();
}

export async function getAll(collection: string) 
{
  return await db.collection(collection).get();
}

export async function addDocument<T extends Record<string, any>>(
  collection: string,
  data: T
) {
  return db.collection(collection).add({
    ...data
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
  docId: string,
  field: {name: string, value: string}
) {
  const snapshot = await db
    .collection(collection)
    .where("uid", "==", docId)
    .where(field.name, "==", field.value)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}
