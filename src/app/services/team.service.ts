import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Team } from "../models/team.model";
import { map } from "rxjs/operators";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";

@Injectable({
  providedIn: "root",
})
export class TeamService {
  constructor(private afs: AngularFirestore) {}

  findById(id: string): Observable<Team> {
    return this.afs
      .doc("/teams/" + id)
      .snapshotChanges()
      .pipe(
        map((snap) => {
          return convertSnap<Team>(snap);
        })
      );
  }

  findAll(pageSize: number): Observable<Team[]> {
    // console.log( "team findAll",  pageSize  );
    return this.afs
      .collection("teams", (ref) => ref.limit(pageSize))
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("findDevices", convertSnaps<Device>(snaps));
          return convertSnaps<Team>(snaps);
        })
      );
  }

  findByName(name: string): Observable<Team[]> {
    // console.log( "team findByName",  name  );
    return this.afs
      .collection("teams", (ref) => ref.where("name", "==", name))
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("team findByName", convertSnaps<Device>(snaps));
          return convertSnaps<Team>(snaps);
        })
      );
  }

  fieldUpdate(docId: string, fieldName: string, newValue: any) {
    if (docId && fieldName) {
      const updateObject = {};
      dbFieldUpdate("/teams/" + docId, fieldName, newValue, this.afs);
    }
  }

  create(team: Team): Promise<DocumentReference> {
    return this.afs.collection("teams").add(team);
  }

  delete(id: string): Promise<void> {
    return this.afs.collection("teams").doc(id).delete();
  }
}
