export interface Team {
  id?: string;
  name: string;
  description: string;
  isActive: Boolean;
  dateCreated?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  dateUpdated?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}
