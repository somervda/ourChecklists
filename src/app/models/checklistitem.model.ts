import { DocumentReference } from "@angular/fire/firestore";

export interface Checklistitem {
  id?: string;
  name: string;
  sequence: number;
  description: string;
  activities?: DocumentReference[];
  dateCreated?: Date | firebase.firestore.FieldValue;
  dateResultSet?: Date | firebase.firestore.FieldValue;
  evidence?: string;
  allowNA: boolean;
  requireEvidence: boolean;
  resultValue?: ChecklistitemResultValue;
  resultType: ChecklistitemResultType;
  comment?: string;
  resources?: DocumentReference[];
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
    relSize: 70,
  },
  {
    value: ChecklistitemResultValue.false,
    name: "No",
    description: "No/false",
    image: "no.png",
    relSize: 50,
  },
  {
    value: ChecklistitemResultValue.true,
    name: "Yes",
    description: "Yes/true",
    image: "yes.png",
    relSize: 50,
  },
  {
    value: ChecklistitemResultValue.low,
    name: "1. Low",
    description: "Lowest Rating (F)",
    image: "low.png",
    relSize: 100,
  },
  {
    value: ChecklistitemResultValue.mediumLow,
    name: "2: Medium Low",
    description: "Just better than lowest rating (D)",
    image: "mediumlow.png",
    relSize: 100,
  },
  {
    value: ChecklistitemResultValue.medium,
    name: "3. Medium",
    description: "Medium rating (C)",
    image: "medium.png",
    relSize: 100,
  },
  {
    value: ChecklistitemResultValue.mediumHigh,
    name: "4: Medium High",
    description: "Almost highest rating (B)",
    image: "mediumhigh.png",
    relSize: 100,
  },
  {
    value: ChecklistitemResultValue.high,
    name: "5. High",
    description: "Highest rating (A)",
    image: "high.png",
    relSize: 100,
  },
];

export interface ChecklistitemResultItem {
  value: ChecklistitemResultValue;
  name: string;
  description: string;
  image: string;
  relSize: number;
}
