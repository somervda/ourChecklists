import { Injectable, NgZone, Inject, LOCALE_ID } from "@angular/core";
import { UserRef, DocRef } from "../models/helper.model";
import {
  ChecklistStatus,
  ChecklistStatusInfoItem,
  ChecklistStatusInfo,
} from "../models/checklist.model";
import {
  ChecklistitemResultValue,
  ChecklistitemResultItem,
  ChecklistitemResultInfo,
} from "../models/checklistitem.model";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { map } from "rxjs/operators";
import { convertSnap } from "./db-utils";
import { Observable } from "rxjs";
import { firestore } from "firebase";

@Injectable({
  providedIn: "root",
})
export class HelperService {
  constructor(
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private router: Router,
    private afs: AngularFirestore
  ) {}

  userRefToDocRef(userRef: UserRef[]): DocRef[] {
    return userRef.map((a) => {
      return { id: a.uid, name: a.displayName };
    });
  }

  getFlatDocRefArray(docRefArray: DocRef[]): string {
    if (docRefArray) {
      return docRefArray.reduce((accumulator, docRef, index) => {
        return (accumulator += (index == 0 ? "" : ", ") + docRef.name);
      }, "");
    }
    return "None";
  }

  getChecklistStatusInfoItem(status: ChecklistStatus): ChecklistStatusInfoItem {
    return ChecklistStatusInfo.find((clsii) => clsii.status == status);
  }

  getResultValueInfo(value: ChecklistitemResultValue): ChecklistitemResultItem {
    if (value == undefined) {
      return {
        value: null,
        name: "Unknown",
        description: "Not Set/Not Touched",
        image: "unknown.png",
        relSize: 70,
      };
    } else {
      // console.log(
      //   "info",
      //   ChecklistitemResultInfo.find((cmirv) => cmirv.value == value)
      // );
      return ChecklistitemResultInfo.find((cmirv) => cmirv.value == value);
    }
  }

  /**
   * Simplified version of snackbar
   * @param msg Message to display in the snackBar
   * @param ms Number of milliseconds to display the snackbar
   */
  snackbar(msg: string, ms: number, url?: string) {
    this.snackBar.open(msg, "", {
      duration: ms,
    });
  }

  /**
   * Helper function to display both a snackbar and optionally
   * route the user to another component.
   * @param url Optional: URL to a new route
   */
  redirect(url: string) {
    this.ngZone.run(() => this.router.navigateByUrl(url));
  }

  docRef(path: string): DocumentReference {
    return this.afs.doc(path).ref;
  }

  getDocRefId(docRef: DocumentReference): string {
    let id = undefined;
    if (docRef && docRef.path) {
      id = /[^/]*$/.exec(docRef.path)[0];
    }
    // console.log("getDocRefId", docRef, docRef.path, " id:", id);

    return id;
  }

  getDocRef<T>(value: firestore.DocumentReference<T>): Observable<T> {
    if (value && value != null && value.path && value.path != null) {
      return this.afs
        .doc(value.path)
        .snapshotChanges()
        .pipe(
          map((snap) => {
            // console.log("transform snap", convertSnap<T>(snap));
            return convertSnap<T>(snap);
          })
        );
    }
  }
}
