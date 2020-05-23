import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Checklist, ChecklistStatus } from "../models/checklist.model";
import { map, first } from "rxjs/operators";
import * as firebase from "firebase";
import {
  convertSnap,
  convertSnaps,
  dbFieldUpdate,
  dbFieldUpdateAsPromise,
} from "./db-utils";
import { AuthService } from "./auth.service";
import { UserRef } from "../models/helper.model";
import { ChecklistitemService } from "./checklistitem.service";

@Injectable({
  providedIn: "root",
})
export class ChecklistService {
  constructor(
    private afs: AngularFirestore,
    private auth: AuthService,
    private checklistitemService: ChecklistitemService
  ) {}

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

  fieldUpdateAsPromise(
    docId: string,
    fieldName: string,
    newValue: any
  ): Promise<void> {
    console.log("checklist fieldUpdate", docId, fieldName, newValue);
    if (docId && fieldName) {
      return dbFieldUpdateAsPromise(
        "/checklists/" + docId,
        fieldName,
        newValue,
        this.afs
      );
    } else {
      return null;
    }
  }

  create(checklist: Checklist): Promise<DocumentReference> {
    return this.afs.collection("checklists").add(checklist);
  }

  /**
   * Creates a checklist as a template that is based on the checklist document passed to this function.
   * The new template will include a copy of the checklist items, and all results, comments, evidence is removed
   * from the checklist being used as the basis for the template.
   * @param checklist : The checklist document used for the basis of the new template
   * Note: the name and description in the document is the new values to be used in the template.
   */
  createTemplate(checklist: Checklist) {
    console.log("createTemplate", checklist);
    // First get the checklistitems for the checklist to copy to
    // the template
    return this.checklistitemService
      .findAll(checklist.id)
      .pipe(first())
      .toPromise()
      .then((clis) => {
        console.log("createTemplate items:", clis);
        // Wrap all the document creations in a transaction so they all
        // work or all fail.
        this.afs.firestore
          .runTransaction((t) => {
            // Modify the checklist , remove the fields not needed for a template
            const id = checklist.id;
            delete checklist.id;
            checklist.status = ChecklistStatus.Active;
            checklist.isTemplate = true;
            checklist.comments = "";
            checklist.dateCreated = firebase.firestore.FieldValue.serverTimestamp();
            checklist.assignee = [];
            // Get a new document Id to use when creating the template
            const tid = this.afs.createId();
            console.log("createTemplate Service", checklist);
            var clRef = this.afs.collection("checklists").doc(tid).ref;
            t.set(clRef, checklist);
            // Create the checklistitems for the template
            clis.forEach((cli) => {
              const tiid = this.afs.createId();
              var cliRef = this.afs
                .collection(`checklists/${tid}/checklistitems/`)
                .doc(tiid).ref;
              delete cli.id;
              delete cli.evidence;
              delete cli.comment;
              delete cli.dateResultSet;
              delete cli.resultValue;
              cli.dateCreated = firebase.firestore.FieldValue.serverTimestamp();
              cli.tagId = tiid;
              console.log("createTemplateItem Service", cli);
              t.set(cliRef, cli);
            });

            return Promise.resolve(tid);
          })
          .then((x) => {
            return x;
          });
      })
      .then((x) => {
        return x;
      });
  }
}
