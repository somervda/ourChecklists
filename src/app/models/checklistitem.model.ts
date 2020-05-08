import { DocRef } from "./helper.model";

export interface Checklistitem {
  id?: string;
  name: string;
  sequence: number;
  description: string;
  activities?: DocRef[];
  dateCreated?: Date;
  dateUpdate?: Date;
  evidence?: string;
  allowNA: boolean;
  resultValue: ChecklistItemResultValue;
  resultType: ChecklistItemResultType;
  comment?: string;
  resources?: DocRef[];
  tagId?: string;
}

export enum ChecklistItemResultType {
  checkbox = 0,
  checkboxNA = 1,
  rating = 2,
  ratingNA = 3,
}

export enum ChecklistItemResultValue {
  NA = -1,
  false = 0,
  true = 1,
  low = 101,
  mediumLow = 102,
  medium = 103,
  mediumHigh = 104,
  high = 105,
}
