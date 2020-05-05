import { DocRef, UserRef } from "./helper.model";

export class Checklist {
  id?: string;
  name: string;
  isTemplate: boolean;
  fromTemplate?: DocRef;
  description: string;
  comments?: string;
  status: ChecklistStatus;
  dateCreated?: Date;
  dateUpdated?: Date;
  dateTargeted?: Date;
  dateCompleted?: Date;
  team: DocRef;
  assignee: UserRef[];
  category: DocRef;
  resources?: DocRef[];
}

export enum ChecklistStatus {
  UnderConstruction = 1,
  Active = 2,
  Done = 3,
  Complete = 4,
  Deleted = 5,
}

export const ChecklistStatusInfo: ChecklistStatusInfoItem[] = [
  { status: 1, name: "Under Construction", icon: "build" },
  { status: 2, name: "Active", icon: "check_box" },
  { status: 3, name: "Done", icon: "done" },
  { status: 4, name: "Completed", icon: "done_all" },
  { status: 5, name: "Deleted", icon: "delete_outline" },
];

export interface ChecklistStatusInfoItem {
  status: ChecklistStatus;
  name: string;
  icon: string;
}
