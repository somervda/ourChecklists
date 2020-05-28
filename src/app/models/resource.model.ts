import { DocRef, UserRef } from "./helper.model";
import { DocumentReference } from "@angular/fire/firestore";

export interface Resource {
  id?: string;
  name: string;
  owner: DocumentReference;
  description: string;
  resourceType: ResourceType;
  content: string;
  status: ResourceStatus;
  supersedes?: DocRef;
  dateReviewed?: Date;
  team?: DocRef;
  reviewer?: DocumentReference;
  dateCreated?: Date;
  dateUpdated?: Date;
  category?: DocumentReference;
}

export enum ResourceType {
  url = 1,
  youtubeId = 2,
  file = 3,
  markdown = 4,
  image = 5,
}

export enum ResourceStatus {
  active = 1,
  superseded = 2,
  needsReview = 3,
  inactive = 9,
}

export const ResourceTypeInfo: ResourceTypeInfoItem[] = [
  { resourceType: 1, name: "URL", icon: "resourceURLIcon.png" },
  { resourceType: 2, name: "YouTube Video", icon: "resourceYouTubeIcon.png" },
  { resourceType: 3, name: "File", icon: "resourceFileIcon.png" },
  { resourceType: 4, name: "Markdown", icon: "resourceMarkDownIcon.png" },
  { resourceType: 5, name: "Image", icon: "resourceImageIcon.png" },
];

export interface ResourceTypeInfoItem {
  resourceType: ResourceType;
  name: string;
  icon: string;
}
