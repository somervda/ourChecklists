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
  status: DocInfo;
  dateCreated?: Date;
  dateUpdated?: Date;
  dateTargeted?: Date;
  dateCompleted?: Date;
  team: DocInfo;
  assignee: UserInfo[];
  category: DocInfo;
  score?: Checklistscore;
  checklistitems?: Checklistitemextract[];
}

export interface Checklistcsv {
  id: string;
  name: string;
  isTemplate: boolean;
  fromTemplate_id?: string;
  fromTemplate_name?: string;
  description: string;
  comments?: string;
  status: string;
  status_name: string;
  dateCreated?: Date;
  dateUpdated?: Date;
  dateTargeted?: Date;
  dateCompleted?: Date;
  assignee: string;
  team_id: string;
  team_name: string;
  category_id: string;
  category_name: string;
  score_overall: number;
  score_completeness: number;
}

export interface Checklistscore {
  overall: number;
  completeness: number;
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

export interface Checklistitemcsv {
  id: string;
  checklist_id: string;
  name: string;
  sequence: number;
  description: string;
  activities?: string;
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
