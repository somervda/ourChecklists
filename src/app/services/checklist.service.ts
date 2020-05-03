import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Checklist } from "../models/checklist.model";
import { map } from "rxjs/operators";
import { convertSnap, convertSnaps } from "./db-utils";

@Injectable({
  providedIn: "root",
})
export class ChecklistService {
  constructor(private afs: AngularFirestore) {}

  findById(id: string): Observable<Checklist> {
    return this.afs
      .doc("/checklists/" + id)
      .snapshotChanges()
      .pipe(
        map((snap) => {
          return convertSnap<Checklist>(snap);
        })
      );
  }

  findAll(pageSize: number): Observable<Checklist[]> {
    // console.log( "checklist findAll",  pageSize  );
    return this.afs
      .collection("checklists", (ref) => ref.limit(pageSize))
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("findDevices", convertSnaps<Device>(snaps));
          return convertSnaps<Checklist>(snaps);
        })
      );
  }
}
