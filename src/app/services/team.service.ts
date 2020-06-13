import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable, combineLatest, of } from "rxjs";
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
      .collection("teams", (ref) => ref.orderBy("name").limit(pageSize))
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("findDevices", convertSnaps<Device>(snaps));
          return convertSnaps<Team>(snaps);
        })
      );
  }

  findMyMemberOfTeams(pageSize: number): Observable<Team[]> {
    console.log(
      "checklist findMyMemberOfTeams",
      this.auth.currentUser.memberOfTeams,
      pageSize
    );
    if (
      !this.auth.currentUser.memberOfTeams ||
      this.auth.currentUser.memberOfTeams.length == 0
    ) {
      return of<Team[]>([]);
    }
    const myTeams: string[] = this.auth.currentUser.memberOfTeams;
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

  findMyManagerOfTeams(pageSize: number): Observable<Team[]> {
    console.log(
      "checklist findMyManagerOfTeams",
      this.auth.currentUser.managerOfTeams,
      pageSize
    );
    if (
      !this.auth.currentUser.managerOfTeams ||
      this.auth.currentUser.managerOfTeams.length == 0
    ) {
      return of<Team[]>([]);
    }
    const myTeams: string[] = this.auth.currentUser.managerOfTeams;
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

  findMyReviewerOfTeams(pageSize: number): Observable<Team[]> {
    console.log(
      "checklist findMyReviewerOfTeams",
      this.auth.currentUser.reviewerOfTeams,
      pageSize
    );
    if (
      !this.auth.currentUser.reviewerOfTeams ||
      this.auth.currentUser.reviewerOfTeams.length == 0
    ) {
      return of<Team[]>([]);
    }
    const myTeams: string[] = this.auth.currentUser.reviewerOfTeams;
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

  /**
   * Returns all teams were the users might be a member, manager or reviewer. Parameters are used to include
   * the different collections of team relationships
   * @param member if true result will include teams were the user is a member
   * @param manager if true result will include teams were the user is a manager
   * @param reviewer if true result will include teams were the user is a reviewer
   */
  findMyMemberManagerReviewerOfTeams(
    member: boolean,
    manager: boolean,
    reviewer: boolean
  ): Observable<Team[]> {
    console.log("team findMyMemberManagerReviewerOfTeams");
    // Get individual observables of each team relationship, return an empty observable if the particular
    // relationship is not to be included. Max of 10 teams for each relationship based on a restriction
    // placed on user arrays (only 10 team allowed in each array)

    const teamMembers$ = member ? this.findMyMemberOfTeams(10) : of<Team[]>([]);
    const teamManagers$ = manager
      ? this.findMyManagerOfTeams(10)
      : of<Team[]>([]);
    const teamReviewer$ = reviewer
      ? this.findMyReviewerOfTeams(10)
      : of<Team[]>([]);

    return combineLatest([teamMembers$, teamManagers$, teamReviewer$]).pipe(
      map(([members, managers, reviewers]) => {
        console.log("members,managers,reviewers", members, managers, reviewers);
        // return members.concat(managers);
        // Use spread and Set to return only unique values
        const mergedTeams = [
          ...new Set([...members, ...managers, ...reviewers]),
        ];
        return mergedTeams.sort((a, b) => {
          var x = a.name.toLowerCase();
          var y = b.name.toLowerCase();
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });
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
