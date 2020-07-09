import { DocumentReference } from "@angular/fire/firestore";

export interface Checklist {
  id?: string;
  name: string;
  isTemplate: boolean;
  fromTemplate?: DocumentReference;
  description: string;
  comments?: string;
  status: ChecklistStatus;
  dateCreated?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  dateUpdated?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  dateTargeted?: firebase.firestore.Timestamp;
  dateCompleted?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  team: DocumentReference;
  assignee: DocumentReference[];
  category: DocumentReference;
  resources?: DocumentReference[];
}

export enum ChecklistStatus {
  UnderConstruction = 1,
  Active = 2,
  Done = 3,
  Complete = 4,
  Deleted = 5,
}

export const ChecklistStatusInfo: ChecklistStatusInfoItem[] = [
  {
    status: 1,
    name: "Under Construction",
    icon: "build",
    description:
      "Checklist is in design mode, basic definitional information can be updated and checklist items can be added, removed or edited",
  },
  {
    status: 2,
    name: "Active",
    icon: "ballot",
    description:
      "Checklist is in use, checklist item results (Checkboxes, Ratings etc) can be entered.",
  },
  {
    status: 3,
    name: "Done",
    icon: "done",
    description:
      "The checklist assignees have completed the checklist, the checklist is ready to be reviewed by the team manager for completeness",
  },
  {
    status: 4,
    name: "Completed",
    icon: "done_all",
    description:
      "The team manager has reviewed and approved the completeness of the checklist.",
  },
  {
    status: 5,
    name: "Deleted",
    icon: "delete_outline",
    description: "Logically deleted checklist",
  },
];

export interface ChecklistStatusInfoItem {
  status: ChecklistStatus;
  name: string;
  icon: string;
  description: string;
}

export interface ChecklistStatistics {
  itemCount: number;
  requiredNotSet: number;
  naSet: number;
  itemsSet: number;
  isOverdue: boolean;
  scoreRaw: number;
  scorePercentage: number;
}
