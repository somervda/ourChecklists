import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Checklistitem } from "../models/checklistitem.model";
import { convertSnap, convertSnaps } from "./db-utils";
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
      .doc("/checklist/" + cid + "/checklistitems/" + clid)
      .snapshotChanges()
      .pipe(
        map((snap) => {
          return convertSnap<Checklistitem>(snap);
        })
      );
  }

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
}
