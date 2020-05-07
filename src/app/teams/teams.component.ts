import { Component, OnInit } from "@angular/core";
import { Observable, timer } from "rxjs";
import { Team } from "../models/team.model";
import { TeamService } from "../services/team.service";
import { map } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

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

  async ngOnInit() {
    await this.waitForCurrentUser();
    if (this.auth.currentUser.isAdmin || this.auth.currentUser.canCreateTeams) {
      this.canCreateTeams = true;
    }
    // get a observable of all teams then use a pipe/map
    // to filter on just what the user is allowed to see
    this.teams$ = this.teamservice.findAll(100).pipe(
      map((teams) => {
        // Admins can see all teams
        if (this.auth.currentUser && this.auth.currentUser.isAdmin) {
          return teams;
        }
        return teams.filter(
          (team) =>
            // otherwise people only see teams in their teamLists
            (this.auth.currentUser.memberOfTeams &&
              this.auth.currentUser.memberOfTeams.includes(team.id)) ||
            (this.auth.currentUser.managerOfTeams &&
              this.auth.currentUser.managerOfTeams.includes(team.id)) ||
            (this.auth.currentUser.reviewerOfTeams &&
              this.auth.currentUser.reviewerOfTeams.includes(team.id))
        );
      })
    );
  }

  async waitForCurrentUser() {
    let waitMS = 5000;
    while (!this.auth.currentUser && waitMS > 0) {
      console.log("Waiting for user to show up!");
      await this.sleep(200);
      waitMS -= 200;
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
