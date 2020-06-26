export interface Activity {
  id?: string;
  name: string;
  description: string;
  dateCreated?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  dateUpdated?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}
