import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import {
  Checklist,
  ChecklistStatus,
  ChecklistStatistics,
} from "../models/checklist.model";
import { map, first, switchMap } from "rxjs/operators";
import * as firebase from "firebase";
import {
  convertSnap,
  convertSnaps,
  dbFieldUpdate,
  dbFieldUpdateAsPromise,
} from "./db-utils";
import { AuthService } from "./auth.service";
import { ChecklistitemService } from "./checklistitem.service";
import {
  Checklistitem,
  ChecklistitemResultType,
  ChecklistitemResultValue,
} from "../models/checklistitem.model";
import { User } from "../models/user.model";
import { HelperService } from "./helper.service";
import { Timestamp } from "rxjs/internal/operators/timestamp";

@Injectable({
  providedIn: "root",
})
export class ChecklistService {
  constructor(
    private afs: AngularFirestore,
    private auth: AuthService,
    private checklistitemService: ChecklistitemService,
    private helper: HelperService
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
          // console.log("findAll snaps:", snaps.length);
          return convertSnaps<Checklist>(snaps);
        })
      );
  }

  /**
   * Special version of find to do more complicated searches with multiple
   * filters, uses a special case to find all
   * @param category
   * @param pageSize
   */
  search(
    status: number,
    category: DocumentReference,
    team: DocumentReference,
    template: DocumentReference,
    // fromDateCompleted: Date,
    pageSize: number
  ): Observable<Checklist[]> {
    // console.log(
    //   "checklist search : ",
    //   status,
    //   category,
    //   team,
    //   template,
    //   pageSize
    // );
    return this.afs
      .collection("checklists", (ref) => {
        let retVal = ref as any;

        if (status != 0) {
          retVal = retVal.where("status", "==", status);
        }

        if (category.path != "categories/0") {
          retVal = retVal.where("category", "==", category);
        }

        if (team.path != "teams/0") {
          retVal = retVal.where("team", "==", team);
        }

        if (template.path != "checklists/0") {
          retVal = retVal.where("fromTemplate", "==", template);
        }

        retVal = retVal.limit(pageSize);
        return retVal;
      })
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          let cs = convertSnaps<Checklist>(snaps);
          console.log("search:", cs);
          return cs;
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

  /**
   * Get checklists for which the user is an assignee
   * @param maxStatus The maximum status to display , for filtering Deleted or Completed status
   * @param pageSize Maximum number of rows to retrieve
   */
  findMyChecklists(
    uid: string,
    maxStatus: ChecklistStatus,
    pageSize: number
  ): Observable<Checklist[]> {
    const myUserRef = this.helper.docRef(`users/${uid}`);
    // console.log( "checklist findByUid", myUserRef,  pageSize  );
    return this.afs
      .collection("checklists", (ref) =>
        ref
          .where("assignee", "array-contains", myUserRef)
          .where("status", "<=", maxStatus)
          .where("isTemplate", "==", false)
          .orderBy("status", "asc")
          .limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          return convertSnaps<Checklist>(snaps);
        })
      );
  }

  findMyChecklistsByStatus(
    status: ChecklistStatus,
    pageSize: number
  ): Observable<Checklist[]> {
    const myUserRef = this.helper.docRef(`users/${this.auth.currentUser.uid}`);
    // console.log( "checklist findByUid", myUserRef,  pageSize  );
    return this.afs
      .collection("checklists", (ref) =>
        ref
          .where("assignee", "array-contains", myUserRef)
          .where("status", "==", status)
          .where("isTemplate", "==", false)
          .limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          return convertSnaps<Checklist>(snaps);
        })
      );
  }

  findByTeam(
    teamRef: DocumentReference,
    maxStatus: ChecklistStatus,
    pageSize: number
  ): Observable<Checklist[]> {
    console.log("checklist findByTeam", teamRef, pageSize);
    return this.afs
      .collection("checklists", (ref) =>
        ref
          .where("team", "==", teamRef)
          .where("status", "<=", maxStatus)
          .where("isTemplate", "==", false)
          .limit(pageSize)
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
  ): Promise<any> {
    console.log("checklist fieldUpdate", docId, fieldName, newValue);
    if (docId && fieldName) {
      let myPromises = [];
      myPromises.push(
        dbFieldUpdateAsPromise(
          "/checklists/" + docId,
          fieldName,
          newValue,
          this.afs
        )
      );

      // Special case if updating status to completed, also update dateCompleted
      if (fieldName == "status" && newValue == ChecklistStatus.Complete) {
        myPromises.push(
          dbFieldUpdateAsPromise(
            "/checklists/" + docId,
            "dateCompleted",
            firebase.firestore.FieldValue.serverTimestamp(),
            this.afs
          )
        );
      }
      return Promise.all(myPromises);
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
        if (checklist.dateCompleted) {
          delete checklist.dateCompleted;
        }
        if (checklist.dateTargeted) {
          delete checklist.dateTargeted;
        }
        if (checklist.dateUpdated) {
          delete checklist.dateUpdated;
        }
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
    console.log("createTemplateTransaction", template, templateItems);
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

  // Create a checklist from a template

  createFromTemplate(template: Checklist, user: User): Promise<string> {
    console.log("createFromTemplate", template);

    return this.checklistitemService
      .findAll(template.id)
      .pipe(first())
      .toPromise()
      .then((templateItems) => {
        console.log("createTemplate items:", templateItems);
        // Modify the checklist , remove the fields not needed for a template
        template.fromTemplate = this.helper.docRef(`checklists/${template.id}`);
        const dateNow = new Date();
        template.name += `: ${dateNow.valueOf()}`;
        template.description += `Created from template: ${dateNow.toISOString()}`;
        delete template.id;
        template.status = ChecklistStatus.Active;
        template.isTemplate = false;
        template.dateCreated = firebase.firestore.FieldValue.serverTimestamp();
        template.assignee = [this.helper.docRef(`users/${user.uid}`)];
        // Clean up templateItems for use in the checklist
        templateItems.forEach((templateItem) => {
          delete templateItem.id;
          templateItem.dateCreated = firebase.firestore.FieldValue.serverTimestamp();
        });

        return this.createFromTemplateTransaction(template, templateItems);
      })
      .then((result) => {
        console.log("createFromTemplate:", result);
        return Promise.resolve(result);
      })
      .catch((err) => {
        console.error("createFromTemplate failure:", err);
        return Promise.reject(err);
      });
  }

  /**
   * Perform the transactional part of creating a checklist from a template,
   * all document writes are wrapped in one transaction so
   * either it creates the checklist and checklist items or
   * all fails
   * @param checklist The checklist document to be created
   * @param checklistItems All the checklist items
   */
  createFromTemplateTransaction(
    checklist: Checklist,
    checklistItems: Checklistitem[]
  ): Promise<string> {
    console.log("createFromTemplateTransaction", checklist, checklistItems);
    return this.afs.firestore
      .runTransaction((t) => {
        // Get document ids and write new documents

        // Main template document
        const checklistId = this.afs.createId();
        var checklistRef = this.afs.collection("checklists").doc(checklistId)
          .ref;
        t.set(checklistRef, checklist);

        // template items documents
        checklistItems.forEach((item) => {
          const checklistitemId = this.afs.createId();
          var checklistitemRef = this.afs
            .collection(`checklists/${checklistId}/checklistitems/`)
            .doc(checklistitemId).ref;
          t.set(checklistitemRef, item);
        });

        return Promise.resolve(checklistId);
      })
      .then((templateId) => {
        console.log("createFromTemplateTransaction", templateId);
        return Promise.resolve(templateId);
      })
      .catch((err) => {
        console.error("createFromTemplateTransaction failure:", err);
        return Promise.reject(err);
      });
  }

  deleteChecklist(
    checklist: Checklist,
    checklistitems: Checklistitem[]
  ): Promise<void> {
    // console.log("deletechecklists batch", checklist, checklistitems);
    let batch = this.afs.firestore.batch();
    checklistitems.forEach((ci) =>
      batch.delete(
        this.helper.docRef(
          `/checklists/${checklist.id}/checklistitems/${ci.id}`
        )
      )
    );
    batch.delete(this.helper.docRef(`/checklists/${checklist.id}`));
    return batch.commit();
  }

  getStatistics(checklistId: string): Observable<ChecklistStatistics> {
    return this.findById(checklistId).pipe(
      switchMap((c) => {
        let isOverdue = this.overdueCheck(
          c.dateTargeted ? c.dateTargeted.toDate() : undefined,
          c.status
        );
        return this.checklistitemService
          .findAll(checklistId)
          .pipe(map((cis) => this.getStatisticsOverItems(cis, isOverdue)));
      })
    );
  }

  getStatisticsOverItems(
    cis: Checklistitem[],
    isOverdue: boolean
  ): ChecklistStatistics {
    let s: ChecklistStatistics = {
      itemCount: 0,
      requiredNotSet: 0,
      naSet: 0,
      itemsSet: 0,
      isOverdue: false,
      scoreRaw: 0,
      scorePercentage: 0,
    };
    s.itemCount = cis.length;
    s.isOverdue = isOverdue;
    s.itemsSet = cis.reduce(
      (a, ci) => (ci.resultValue == undefined ? (a += 0) : (a += 1)),
      0
    );
    s.requiredNotSet = cis.reduce(
      (a, ci) =>
        ci.resultValue == undefined && ci.allowNA == false
          ? (a += 1)
          : (a += 0),
      0
    );
    s.naSet = cis.reduce(
      (a, ci) =>
        ci.resultValue == ChecklistitemResultValue.NA ? (a += 1) : (a += 0),
      0
    );
    s.scoreRaw = cis.reduce((a, ci) => a + this.getItemScore(ci), 0);
    s.scorePercentage = Math.round(
      (s.scoreRaw / ((s.itemsSet + s.requiredNotSet - s.naSet) * 4)) * 100
    );

    return s;
  }

  overdueCheck(dateTargeted: Date, status: ChecklistStatus): boolean {
    if (dateTargeted) {
      if (dateTargeted < new Date()) {
        if (status != ChecklistStatus.Complete) {
          return true;
        }
      }
    }
    return false;
  }

  getItemScore(ci: Checklistitem): number {
    let itemScore = 0;
    switch (ci.resultValue) {
      case ChecklistitemResultValue.false:
        itemScore += 0;
        break;
      case ChecklistitemResultValue.true:
        itemScore += 4;
        break;
      case ChecklistitemResultValue.low:
        itemScore += 0;
        break;
      case ChecklistitemResultValue.mediumLow:
        itemScore += 1;
        break;
      case ChecklistitemResultValue.medium:
        itemScore += 2;
        break;
      case ChecklistitemResultValue.mediumHigh:
        itemScore += 3;
        break;
      case ChecklistitemResultValue.high:
        itemScore += 4;
        break;
      case ChecklistitemResultValue.NA:
        // Treat NA as not existing items
        itemScore += 0;
        break;
      default:
        // item not set is treated as a false
        itemScore += 0;
    }
    return itemScore;
  }

  totalScore(score, set, required, na) {
    let total = (score / ((set + required - na) * 4)) * 100;
    return Math.round(total);
  }
}
