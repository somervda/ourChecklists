import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Activity } from "../models/activity.model";
import { map, first } from "rxjs/operators";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";

@Injectable({
  providedIn: "root",
})
export class ActivityService {
  constructor(private afs: AngularFirestore) {}

  /**
   * Find a specific activity document based on the category id and activity id parameters
   * @param cid Category ID
   * @param aid Activity ID
   */
  findById(cid: string, aid: string): Observable<Activity> {
    return this.afs
      .doc("/categories/" + cid + "/activities/" + aid)
      .snapshotChanges()
      .pipe(
        map((snap) => {
          return convertSnap<Activity>(snap);
        }),
        first()
      );
  }

  /**
   * Find all activity documents (Limited by the pageSize parameter)
   * @param pageSize The maximum number of activities to return
   */
  findAll(pageSize: number): Observable<Activity[]> {
    return this.afs
      .collectionGroup("activities", (ref) => ref.limit(pageSize))
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          return convertSnaps<Activity>(snaps);
        })
      );
  }

  /**
   * Find all the activities in a category
   * @param cid Category Id
   * @param pageSize The maximum number of activities to return
   */
  findAllByCategory(cid: string, pageSize: number): Observable<Activity[]> {
    // console.log( "team findAll",  pageSize  );
    return this.afs
      .collection("/categories/" + cid + "/activities", (ref) =>
        ref.limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("findDevices", convertSnaps<Device>(snaps));
          return convertSnaps<Activity>(snaps);
        })
      );
  }

  fieldUpdate(cid: string, aid: string, fieldName: string, newValue: any) {
    // console.log("activity field update", cid, aid, fieldName, newValue);
    if (cid && aid && fieldName) {
      const docLocation = "/categories/" + cid + "/activities/" + aid;
      // console.log("activity field update docLocation:", docLocation);
      const updateObject = {};
      dbFieldUpdate(docLocation, fieldName, newValue, this.afs);
    }
  }

  create(cid: string, activity: Activity): Promise<DocumentReference> {
    console.log("create activity", cid, activity);
    return this.afs
      .collection("/categories/" + cid + "/activities/")
      .add(activity);
  }

  delete(cid: string, aid: string): Promise<void> {
    // console.log("delete activity",cid,aid);
    return this.afs
      .collection("/categories/" + cid + "/activities/")
      .doc(aid)
      .delete();
  }
}
