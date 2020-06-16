// import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// exports.usersDateCreated = functions.firestore
//   .document("users/{uid}")
//   .onCreate((snap, context) => {
//     return snap.ref.set(
//       {
//         dateCreated: admin.firestore.FieldValue.serverTimestamp(),
//         dateLastLogon: admin.firestore.FieldValue.serverTimestamp(),
//       },
//       { merge: true }
//     );
//   });

// Loops!!!!
// exports.usersDateUpdated = functions.firestore
//   .document("users/{uid}")
//   .onUpdate((change, context) => {
//     const date = admin.firestore.FieldValue.serverTimestamp();
//     return change.after.ref.set(
//       {
//         dateLastLogon: admin.firestore.FieldValue.serverTimestamp(),
//       },
//       { merge: true }
//     );
//   });
