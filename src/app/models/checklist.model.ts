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
