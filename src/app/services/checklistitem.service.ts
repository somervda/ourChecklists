import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Checklistitem } from "../models/checklistitem.model";
import {
  convertSnap,
  convertSnaps,
  dbFieldUpdate,
  convertSnapsGetParent,
} from "./db-utils";
import { map } from "rxjs/operators";
import { Checklist } from "../models/checklist.model";
import * as firebase from "firebase";

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
          // console.log("findAll snaps:", snaps);
          return convertSnaps<Checklistitem>(snaps);
        })
      );
  }

  findAll2(pageSize: number): Observable<Checklistitem[]> {
    return this.afs
      .collectionGroup("checklistitems", (ref) => ref.limit(pageSize))
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          return convertSnapsGetParent<Checklistitem>(snaps);
        })
      );
  }

  findMaxSequence(cid: string): Observable<Checklistitem[]> {
    return this.afs
      .collection("checklists/" + cid + "/checklistitems", (ref) =>
        ref.orderBy("sequence", "desc").limit(1)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          console.log(
            "findMaxSequence",
            snaps,
            convertSnaps<Checklistitem>(snaps)
          );
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
      // May move dateUpdated to a function
      if (fieldName == "resultValue") {
        dbFieldUpdate(
          "/checklists/" + cid + "/checklistitems/" + clid,
          "dateResultSet",
          firebase.firestore.FieldValue.serverTimestamp(),
          this.afs
        );
      }
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
