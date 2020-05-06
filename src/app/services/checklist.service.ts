import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Checklist } from "../models/checklist.model";
import { map } from "rxjs/operators";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";
import { AuthService } from "./auth.service";
import { UserRef } from "../models/helper.model";

@Injectable({
  providedIn: "root",
})
export class ChecklistService {
  constructor(private afs: AngularFirestore, private auth: AuthService) {}

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
          return convertSnaps<Checklist>(snaps);
        })
      );
  }

  findMyChecklists(pageSize: number): Observable<Checklist[]> {
    const myUserRef: UserRef = {
      uid: this.auth.currentUser.uid,
      displayName: this.auth.currentUser.displayName,
    };
    // console.log( "checklist findByUid", myUserRef,  pageSize  );
    return this.afs
      .collection("checklists", (ref) =>
        ref.where("assignee", "array-contains", myUserRef).limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          return convertSnaps<Checklist>(snaps);
        })
      );
  }

  findMyTeamChecklists(pageSize: number): Observable<Checklist[]> {
    const myTeams: string[] = this.auth.currentUser.managerOfTeams;
    console.log("checklist findMyTeamChecklists", myTeams, pageSize);
    return this.afs
      .collection("checklists", (ref) =>
        ref.where("team.id", "in", myTeams).limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          return convertSnaps<Checklist>(snaps);
        })
      );
  }

  findByTeam(id: string, pageSize: number): Observable<Checklist[]> {
    console.log("checklist findByTeam", id, pageSize);
    return this.afs
      .collection("checklists", (ref) =>
        ref.where("team.id", "==", id).limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          return convertSnaps<Checklist>(snaps);
        })
      );
  }

  fieldUpdate(docId: string, fieldName: string, newValue: any) {
    console.log("checklist fieldUpdate", docId, fieldName, newValue);
    if (docId && fieldName) {
      dbFieldUpdate("/checklists/" + docId, fieldName, newValue, this.afs);
    }
  }

  create(checklist: Checklist): Promise<DocumentReference> {
    return this.afs.collection("checklists").add(checklist);
  }
}
