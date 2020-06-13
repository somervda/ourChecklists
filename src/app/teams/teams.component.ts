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
  displayedColumns: string[] = ["name", "description", "id"];

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
    // this.teams$ = this.teamservice.findAll(100).pipe(
    //   map((teams) => {
    //     // Admins can see all teams
    //     if (this.auth.currentUser && user.isAdmin) {
    //       return teams;
    //     }
    //     return teams.filter(
    //       (team) =>
    //         // otherwise people only see teams in their teamLists
    //         (user.memberOfTeams && user.memberOfTeams.includes(team.id)) ||
    //         (user.managerOfTeams && user.managerOfTeams.includes(team.id)) ||
    //         (user.reviewerOfTeams && user.reviewerOfTeams.includes(team.id))
    //     );
    //   })
    // );
  }
}
