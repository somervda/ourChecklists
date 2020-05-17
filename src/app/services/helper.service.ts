import { Injectable } from "@angular/core";
import { UserRef, DocRef } from "../models/helper.model";
import {
  ChecklistStatus,
  ChecklistStatusInfoItem,
  ChecklistStatusInfo,
} from "../models/checklist.model";

@Injectable({
  providedIn: "root",
})
export class HelperService {
  constructor() {}

  userRefToDocRef(userRef: UserRef[]): DocRef[] {
    return userRef.map((a) => {
      return { id: a.uid, name: a.displayName };
    });
  }

  getFlatDocRefArray(docRefArray: DocRef[]): string {
    if (docRefArray) {
      return docRefArray.reduce((accumulator, docRef, index) => {
        return (accumulator += (index == 0 ? "" : ", ") + docRef.name);
      }, "");
    }
    return "None";
  }

  getChecklistStatusInfoItem(status: ChecklistStatus): ChecklistStatusInfoItem {
    return ChecklistStatusInfo.find((clsii) => clsii.status == status);
  }
}
