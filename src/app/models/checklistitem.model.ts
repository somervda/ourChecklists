import { DocRef, UserRef } from "./helper.model";

export interface Checklistitem {
  id?: string;
  name: string;
  sequence: number;
  description: string;
  activities?: DocRef[];
  dateCreated?: Date | any;
  dateResultSet?: Date | any;
  evidence?: string;
  allowNA: boolean;
  requireEvidence: boolean;
  resultValue?: ChecklistitemResultValue;
  resultType: ChecklistitemResultType;
  comment?: string;
  resources?: DocRef[];
  tagId?: string;
}

export enum ChecklistitemResultType {
  checkbox = 0,
  checkboxNA = 1,
  rating = 2,
  ratingNA = 3,
}

export enum ChecklistitemResultValue {
  NA = -1,
  false = 0,
  true = 1,
  low = 101,
  mediumLow = 102,
  medium = 103,
  mediumHigh = 104,
  high = 105,
}
