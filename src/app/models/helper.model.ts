// Key/Value Pair
export interface Kvp {
  key: string;
  value: any;
}

export interface DocRef {
  id: string;
  name: string;
}

export interface UserRef {
  uid: string;
  displayName: string;
}

export enum Crud {
  "Create" = "C",
  "Read" = "R",
  "Update" = "U",
  "Delete" = "D",
}
