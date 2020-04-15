import { DocRef, UserRef } from "./helper.model";

export interface Resource {
  id?: string;
  name: string;
  owner: UserRef;
  description: string;
  resourceType: ResourceType;
  content: string;
  status: ResourceStatus;
  supersedes?: DocRef;
  dateReviewed: Date;
  team: DocRef;
  reviewer: UserRef;
  dateCreated?: Date;
  dateUpdated?: Date;
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
  inactive = 9,
}
