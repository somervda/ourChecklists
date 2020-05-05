import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Team } from "../models/team.model";
import { map, first } from "rxjs/operators";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";
import { AuthService } from "./auth.service";
import * as firebase from "firebase";

@Injectable({
  providedIn: "root",
})
export class TeamService {
  constructor(private afs: AngularFirestore, private auth: AuthService) {}

  findById(id: string): Observable<Team> {
    console.log("team findById", id);
    return this.afs
      .doc("/teams/" + id)
      .snapshotChanges()
      .pipe(
        map((snap) => {
          console.log("team findById snap", snap);
          return convertSnap<Team>(snap);
        }),
        first()
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

  findMyTeams(pageSize: number): Observable<Team[]> {
    const myTeams: string[] = this.auth.currentUser.managerOfTeams;
    console.log("checklist findMyTeams", myTeams, pageSize);
    return this.afs
      .collection("teams", (ref) =>
        ref
          .where(firebase.firestore.FieldPath.documentId(), "in", myTeams)
          .limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
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

  findByPartialName(name: string, pageSize: number = 100): Observable<Team[]> {
    // console.log( "findByPartialName",  pageSize  );
    return this.afs
      .collection("teams", (ref) =>
        ref
          .where("name", ">=", name)
          .where("name", "<=", name + "~")
          .orderBy("name", "asc")
          .limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
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
