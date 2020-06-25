import { ChecklistStatus } from "./checklist.model";
import {
  ChecklistitemResultValue,
  ChecklistitemResultType,
} from "./checklistitem.model";

/**
 * Denormalized (Flattened) version the a checklist that includes the checklistitems (also denormalized)
 * DocumentReference properties are denormalized to DocInfo and UserInfo data
 */
export interface Checklistextract {
  id: string;
  name: string;
  isTemplate: boolean;
  fromTemplate?: DocInfo;
  description: string;
  comments?: string;
  status: ChecklistStatus;
  dateCreated?: Date;
  dateUpdated?: Date;
  dateTargeted?: Date;
  dateCompleted?: Date;
  team: DocInfo;
  assignee: UserInfo[];
  category: DocInfo;
  checklistitems: Checklistitemextract[];
}

export interface Checklistitemextract {
  id: string;
  name: string;
  sequence: number;
  description: string;
  activities?: DocInfo[];
  dateCreated?: Date;
  dateResultSet?: Date;
  evidence?: string;
  allowNA: boolean;
  requireEvidence: boolean;
  resultValue?: ChecklistitemResultValue;
  resultType: ChecklistitemResultType;
  comment?: string;
  tagId?: string;
}

export interface DocInfo {
  id: string;
  name?: string;
}

export interface UserInfo {
  uid: string;
  displayName?: string;
  email?: string;
}
