import { Injectable, NgZone, Inject, LOCALE_ID } from "@angular/core";
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

  /**
   * Returns an observable of the document represented by the
   * docRef. Note: Used by the doc pipe.
   * @param docRef a firestore.DocumentReference
   */
  getDocRef<T>(docRef: firestore.DocumentReference<T>): Observable<T> {
    if (docRef && docRef != null && docRef.path && docRef.path != null) {
      return this.afs
        .doc(docRef.path)
        .snapshotChanges()
        .pipe(
          map((snap) => {
            // console.log("transform snap", convertSnap<T>(snap));
            return convertSnap<T>(snap);
          })
        );
    }
  }

  /**
   * Converts an array of objects into a CSV string
   * @param rows
   */
  toCsv(rows: object[]) {
    if (!rows || !rows.length) {
      return;
    }
    const separator = ",";
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      "\n" +
      rows
        .map((row) => {
          return keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? "" : row[k];
              cell =
                cell instanceof Date
                  ? cell.toLocaleString()
                  : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join("\n");
    return csvContent;
  }
}
