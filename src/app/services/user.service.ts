import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable, merge } from "rxjs";
import { User } from "../models/user.model";
import { convertSnaps } from "./db-utils";
import { first, map, take } from "rxjs/operators";
import OrderByDirection = firebase.firestore.OrderByDirection;

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private afs: AngularFirestore) {}

  findUserByUid(uid: string): Observable<User> {
    return this.afs
      .collection("users", (ref) => ref.where("uid", "==", uid))
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          const users = convertSnaps<User>(snaps);
          return users.length == 1 ? users[0] : undefined;
        }),
        first()
      );
  }

  findUsers(
    filter = "",
    sortField,
    sortOrder: OrderByDirection,
    pageSize
  ): Observable<User[]> {
    // console.log( "findUsers",  sortField, sortOrder  ,pageSize  );
    return this.afs
      .collection("users", (ref) =>
        ref.orderBy(sortField, sortOrder).limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          return convertSnaps<User>(snaps);
        }),
        // Not sure why this is needed but 2 sets of results are emitted with this query
        take(2)
      );
  }

  findByTeamId(id: string): Observable<User[]> {
    // console.log( "user findByTeam",  id  );
    const teamManagers$ = this.afs
      .collection("users", (ref) =>
        ref.where("managerOfTeams", "array-contains", id)
      )
      .snapshotChanges();
    const teamMembers$ = this.afs
      .collection("users", (ref) =>
        ref.where("memberOfTeams", "array-contains", id)
      )
      .snapshotChanges();
    const teamReviewers$ = this.afs
      .collection("users", (ref) =>
        ref.where("reviewerOfTeams", "array-contains", id)
      )
      .snapshotChanges();
    return merge(teamManagers$, teamMembers$, teamReviewers$).pipe(
      map((snaps) => {
        // console.log("user findByTeam", convertSnaps<Device>(snaps));
        return convertSnaps<User>(snaps);
      })
    );
  }

  dbFieldUpdate(docId: string, fieldName: string, newValue: any) {
    if (docId && fieldName) {
      const updateObject = {};
      // console.log("dbFieldUpdate", docId, fieldName, newValue);
      updateObject[fieldName] = newValue;
      this.afs
        .doc("/users/" + docId) // Update to firestore collection
        .update(updateObject)
        .then((data) => {
          // console.log(fieldName + " updated");
        })
        .catch((error) =>
          console.error(fieldName + " user update error ", error)
        );
    }
  }
}
