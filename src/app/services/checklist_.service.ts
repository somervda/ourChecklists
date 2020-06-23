import { Injectable } from "@angular/core";
import {
  Checklistextract,
  DocInfo,
  UserInfo,
  Checklistitemextract,
} from "../models/checklistextract.model";
import { Checklist } from "../models/checklist.model";
import { DocumentReference } from "@angular/fire/firestore";
import { HelperService } from "./helper.service";

@Injectable({
  providedIn: "root",
})
/**
 * Special service used for managing denormalized versions of checklists and checklistitems
 */
export class Checklist_Service {
  constructor(private helper: HelperService) {}

  denormalizeChecklist(checklist: Checklist): Checklistextract {
    let categoryDR = checklist.category.get();
    let checklistextract: Checklistextract = {
      id: checklist.id,
      isTemplate: checklist.isTemplate,
      name: checklist.name,
      description: checklist.description,
      status: checklist.status,
      team: { id: this.helper.getDocRefId(checklist.team) } as DocInfo,
      assignee: checklist.assignee.map((userref) => {
        return { uid: this.helper.getDocRefId(userref) };
      }),
      resources: checklist.assignee.map((docref) => {
        return { id: this.helper.getDocRefId(docref) };
      }),
      checklistitems: [] as Checklistitemextract[],
      category: { id: this.helper.getDocRefId(checklist.category) } as DocInfo,
    };

    return checklistextract;
  }

  //  refToDocInfo(ref: DocumentReference): DocInfo {
  //   let docInfo: DocInfo;
  //   ref.get().then((s) => (docInfo = { id: s.id, name: s.data().name }));
  //   return docInfo;
  // }
}
