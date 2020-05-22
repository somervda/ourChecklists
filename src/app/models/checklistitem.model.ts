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
    image: "na.png",
  },
  {
    value: ChecklistitemResultValue.false,
    name: "No",
    description: "No/false",
    image: "no.png",
  },
  {
    value: ChecklistitemResultValue.true,
    name: "Yes",
    description: "Yes/true",
    image: "yes.png",
  },
  {
    value: ChecklistitemResultValue.low,
    name: "1. Low",
    description: "Lowest Rating (F)",
    image: "low.png",
  },
  {
    value: ChecklistitemResultValue.mediumLow,
    name: "2: Medium Low",
    description: "Just better than lowest rating (D)",
    image: "mediumlow.png",
  },
  {
    value: ChecklistitemResultValue.medium,
    name: "3. Medium",
    description: "Medium rating (C)",
    image: "medium.png",
  },
  {
    value: ChecklistitemResultValue.mediumHigh,
    name: "4: Medium High",
    description: "Almost highest rating (B)",
    image: "mediumhigh.png",
  },
  {
    value: ChecklistitemResultValue.high,
    name: "5. High",
    description: "Highest rating (A)",
    image: "high.png",
  },
];

export interface ChecklistitemResultItem {
  value: ChecklistitemResultValue;
  name: string;
  description: string;
  image: string;
}
