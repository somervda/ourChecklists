import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Checklistitem } from "../models/checklistitem.model";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";
import { map } from "rxjs/operators";
import { Checklist } from "../models/checklist.model";

@Injectable({
  providedIn: "root",
})
export class ChecklistitemService {
  constructor(private afs: AngularFirestore) {}

  /**
   * Get a specific checklist item
   * @param cid Checklist.id
   * @param clid Checklistitem.id
   */
  findById(cid: string, clid: string): Observable<Checklistitem> {
    return this.afs
      .doc("/checklists/" + cid + "/checklistitems/" + clid)
      .snapshotChanges()
      .pipe(
        map((snap) => {
          return convertSnap<Checklistitem>(snap);
        })
      );
  }

  /**
   * Get all the checklist items for a checklist
   * @param cid checklist.id
   * @returns Observable of an array of checklistitems
   */
  findAll(cid: string): Observable<Checklistitem[]> {
    // console.log( "checklistitem findAll",  cid  );
    return this.afs
      .collection("checklists/" + cid + "/checklistitems", (ref) =>
        ref.orderBy("sequence")
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          return convertSnaps<Checklistitem>(snaps);
        })
      );
  }

  /**
   * Updates a selected property on a checklistitem
   * @param cid checklist.id
   * @param clid checklistitem.id
   * @param fieldName Property to be updated
   * @param newValue New value for the property
   */
  fieldUpdate(cid: string, clid: string, fieldName: string, newValue: any) {
    if (cid && clid && fieldName) {
      dbFieldUpdate(
        "/checklists/" + cid + "/checklistitems/" + clid,
        fieldName,
        newValue,
        this.afs
      );
    }
  }

  /**
   * Create a new checklistitem
   * @param cid checklist.id
   * @param checklistitem Checklistitem document to be added
   */
  create(
    cid: string,
    checklistitem: Checklistitem
  ): Promise<DocumentReference> {
    return this.afs
      .collection("/checklists/" + cid + "/checklistitems")
      .add(checklistitem);
  }

  /**
   * Delete the selected checklistitem
   * @param cid checklist.id
   * @param clid checklistitem.id
   */
  delete(cid: string, clid: string): Promise<void> {
    return this.afs
      .collection("/checklists/" + cid + "/checklistitems")
      .doc(clid)
      .delete();
  }
}
