import { Component, OnInit } from "@angular/core";
import { Observable, timer } from "rxjs";
import { Team } from "../models/team.model";
import { TeamService } from "../services/team.service";
import { map, first } from "rxjs/operators";
import { AuthService } from "../services/auth.service";
import { User } from "../models/user.model";

@Component({
  selector: "app-teams",
  templateUrl: "./teams.component.html",
  styleUrls: ["./teams.component.scss"],
})
export class TeamsComponent implements OnInit {
  teams$: Observable<Team[]>;
  canCreateTeams = false;
  displayedColumns: string[] = ["name", "description", "role", "id"];

  constructor(private teamservice: TeamService, private auth: AuthService) {}

  ngOnInit() {
    this.auth.user$
      .pipe(first())
      .toPromise()
      .then((u) => this.initProcesses(u));
  }

  initProcesses(user: User) {
    if (user.isAdmin || user.canCreateTeams) {
      this.canCreateTeams = true;
    }
    // get a observable of all teams then use a pipe/map
    // to filter on just what the user is allowed to see

    if (user.isAdmin) {
      this.teams$ = this.teamservice.findAll(100);
    } else {
      this.teams$ = this.teamservice.findMyMemberManagerReviewerOfTeams(
        true,
        true,
        true
      );
    }
  }

  getRole(team: Team): string {
    let role = "";
    if (
      this.auth.currentUser.memberOfTeams &&
      this.auth.currentUser.memberOfTeams.includes(team.id)
    ) {
      role += "Member ";
    }
    if (
      this.auth.currentUser.managerOfTeams &&
      this.auth.currentUser.managerOfTeams.includes(team.id)
    ) {
      role += "Manager ";
    }
    if (
      this.auth.currentUser.reviewerOfTeams &&
      this.auth.currentUser.reviewerOfTeams.includes(team.id)
    ) {
      role += "Reviewer ";
    }
    return role;
  }
}
