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

export const ChecklistitemResultInfo: ChecklistitemResultItem[] = [
  {
    value: ChecklistitemResultValue.NA,
    name: "N/A",
    description: "Not Applicable",
  },
  {
    value: ChecklistitemResultValue.false,
    name: "No",
    description: "No/false",
  },
  {
    value: ChecklistitemResultValue.true,
    name: "Yes",
    description: "Yes/true",
  },
  {
    value: ChecklistitemResultValue.low,
    name: "1. Low",
    description: "Lowest Rating (F)",
  },
  {
    value: ChecklistitemResultValue.mediumLow,
    name: "2: Medium Low",
    description: "Just better than lowest rating (D)",
  },
  {
    value: ChecklistitemResultValue.medium,
    name: "3. Medium",
    description: "Medium rating (C)",
  },
  {
    value: ChecklistitemResultValue.mediumHigh,
    name: "4: Medium High",
    description: "Almost highest rating (B)",
  },
  {
    value: ChecklistitemResultValue.high,
    name: "5. High",
    description: "Highest rating (A)",
  },
];

export interface ChecklistitemResultItem {
  value: ChecklistitemResultValue;
  name: string;
  description: string;
}
