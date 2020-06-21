import { Injectable } from "@angular/core";
import {
  Checklist_,
  DocInfo,
  UserInfo,
  Checklistitem_,
} from "../models/checklist_.model";
import { Checklist } from "../models/checklist.model";
import { DocumentReference } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root",
})
/**
 * Special service used for managing denormalized versions of checklists and checklistitems
 */
export class Checklist_Service {
  constructor() {}

  denormalizeChecklist(checklist: Checklist): Checklist_ {
    let categoryDR = checklist.category.get();
    let checklist_: Checklist_ = {
      id: checklist.id,
      isTemplate: checklist.isTemplate,
      name: checklist.name,
      description: checklist.description,
      status: checklist.status,
      team: {} as DocInfo,
      assignee: [] as UserInfo[],
      checklistitems: [] as Checklistitem_[],
      category: {} as DocInfo,
    };

    return checklist_;
  }

  //  refToDocInfo(ref: DocumentReference): DocInfo {
  //   let docInfo: DocInfo;
  //   ref.get().then((s) => (docInfo = { id: s.id, name: s.data().name }));
  //   return docInfo;
  // }
}
