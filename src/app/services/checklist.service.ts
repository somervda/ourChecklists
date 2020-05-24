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
import { Checklistitem } from "../models/checklistitem.model";

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

  findAllTemplates(pageSize: number): Observable<Checklist[]> {
    // console.log( "checklist findAll",  pageSize  );
    return this.afs
      .collection("checklists", (ref) =>
        ref.where("isTemplate", "==", true).limit(pageSize)
      )
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
  createTemplate(checklist: Checklist): Promise<string> {
    console.log("createTemplate", checklist);
    // First get the checklistitems for the checklist to copy to
    // the template

    return this.checklistitemService
      .findAll(checklist.id)
      .pipe(first())
      .toPromise()
      .then((checklistitems) => {
        console.log("createTemplate items:", checklistitems);
        // Modify the checklist , remove the fields not needed for a template
        const id = checklist.id;
        delete checklist.id;
        checklist.status = ChecklistStatus.Active;
        checklist.isTemplate = true;
        checklist.comments = "";
        checklist.dateCreated = firebase.firestore.FieldValue.serverTimestamp();
        checklist.assignee = [];
        // Clean up checklistitems for use in the template
        checklistitems.forEach((checklistitem) => {
          delete checklistitem.id;
          delete checklistitem.evidence;
          delete checklistitem.comment;
          delete checklistitem.dateResultSet;
          delete checklistitem.resultValue;
          checklistitem.dateCreated = firebase.firestore.FieldValue.serverTimestamp();
        });

        return this.createTemplateTransaction(checklist, checklistitems);
      })
      .then((result) => {
        console.log("createTemplate:", result);
        return Promise.resolve(result);
      })
      .catch((err) => {
        console.error("createTemplate failure:", err);
        return Promise.reject(err);
      });
  }

  /**
   * Perform the transactional part of creating a template,
   * all document writes are wrapped in one transaction so
   * either it creates the template and template items or
   * all fails
   * @param template The template document to be created
   * @param templateItems All the checklist items for the template
   */
  createTemplateTransaction(
    template: Checklist,
    templateItems: Checklistitem[]
  ): Promise<string> {
    console.log("createTemplateT", template, templateItems);
    return this.afs.firestore
      .runTransaction((t) => {
        // Get document ids and write new documents

        // Main template document
        const templateId = this.afs.createId();
        var templateRef = this.afs.collection("checklists").doc(templateId).ref;
        t.set(templateRef, template);

        // template items documents
        templateItems.forEach((item) => {
          const templateItemId = this.afs.createId();
          // Set template tag ids to match the document ids, the
          // tagId are unchanged for checklists that are derived from
          // a template so metrics can be gathered from items
          // derived from the same template
          item.tagId = templateItemId;
          var templateItemRef = this.afs
            .collection(`checklists/${templateId}/checklistitems/`)
            .doc(templateItemId).ref;
          t.set(templateItemRef, item);
        });

        return Promise.resolve(templateId);
      })
      .then((templateId) => {
        console.log("createTemplateTransaction", templateId);
        return Promise.resolve(templateId);
      })
      .catch((err) => {
        console.error("createTemplateTransaction failure:", err);
        return Promise.reject(err);
      });
  }
}
