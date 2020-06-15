import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable, combineLatest } from "rxjs";
import { User, TeamRoles } from "../models/user.model";
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

  findByPartialName(
    displayName: string,
    pageSize: number = 100
  ): Observable<User[]> {
    // console.log( "findByPartialName",  pageSize  );
    return this.afs
      .collection("users", (ref) =>
        ref
          .where("displayName", ">=", displayName)
          .where("displayName", "<=", displayName + "~")
          .orderBy("displayName", "asc")
          .limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          return convertSnaps<User>(snaps);
        })
      );
  }

  findByTeamId(id: string): Observable<User[]> {
    // console.log("user findByTeam", id);

    const teamMembers$ = this.afs
      .collection("users", (ref) =>
        ref.where("memberOfTeams", "array-contains", id)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("teamMember snaps", snaps);
          return convertSnaps<User>(snaps).map((x) => ({
            ...x,
            role: "Member",
          }));
        })
      );

    const teamManagers$ = this.afs
      .collection("users", (ref) =>
        ref.where("managerOfTeams", "array-contains", id)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("teamManager snaps", snaps);
          return convertSnaps<User>(snaps).map((x) => ({
            ...x,
            role: "Manager",
          }));
        })
      );

    const teamReviewers$ = this.afs
      .collection("users", (ref) =>
        ref.where("reviewerOfTeams", "array-contains", id)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("teamReviewer snaps", snaps);
          return convertSnaps<User>(snaps).map((x) => ({
            ...x,
            role: "Reviewer",
          }));
        })
      );

    // Return all three observables but as a single observable that combines
    // the latest values from each observable, collapse the three emissions
    // into one emission with the map(array.concat) functions
    // Note: User roles are not flattened, I think that is better
    // because normally users don't have multiple roles on a team
    // and it can be handled by the caller of function if flattening is needed
    // for the particular use case.
    return combineLatest([teamMembers$, teamManagers$, teamReviewers$]).pipe(
      map(([members, managers, reviewers]) => {
        // console.log("members,managers,reviewers", members, managers, reviewers);
        return members.concat(managers, reviewers);
      })
    );
  }

  removeUserFromTeam(uid: string, teamId: string, role: string) {
    // console.log("removeUserFromTeam", uid, teamId, role);
    this.findUserByUid(uid)
      .toPromise()
      .then((user) => {
        // console.log("removeUserFromTeam user", user);
        let fieldName = TeamRoles.find((teamRole) => teamRole.name === role)
          .arrayName;
        // console.log("removeUserFromTeam fieldName", fieldName);
        const newValue = user[fieldName].filter((team) => team !== teamId);
        // console.log("removeUserFromTeam update", uid, fieldName, newValue);
        this.dbFieldUpdate(uid, fieldName, newValue);
      });
  }

  async addUserToTeam(uid: string, teamId: string, role: string) {
    // Note: Use a few async awaits on promisees to bubble up results to calling code
    //
    console.log("addUserToTeam uid:", uid, " teamid:", teamId, " role:", role);
    let addResult = await this.findUserByUid(uid)
      .toPromise()
      .then((user) => {
        console.log("addUserToTeam user", user);
        let fieldName = TeamRoles.find((teamRole) => teamRole.name === role)
          .arrayName;
        // console.log("addUserToTeam fieldName", fieldName);
        if (!user[fieldName]) {
          // console.log("addUserToTeam save with new team field");
          this.afs
            .collection("users")
            .doc(uid)
            .set({ [fieldName]: [teamId] }, { merge: true });
          return "OK";
        }

        if (user[fieldName].filter((team) => team === teamId).length > 0) {
          // console.log("addUserToTeam already exists");
          return "User already has this role on this team. Can not be added.";
        } else {
          user[fieldName].push(teamId);
          // console.log("addUserToTeam update:", uid, fieldName, user[fieldName]);
          this.dbFieldUpdate(uid, fieldName, user[fieldName]);
          return "OK";
        }
      });
    return addResult;
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
