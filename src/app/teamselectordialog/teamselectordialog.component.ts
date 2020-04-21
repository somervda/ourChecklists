import { Component, OnInit, Inject } from "@angular/core";
import { Team } from "../models/team.model";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TeamService } from "../services/team.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-teamselectordialog",
  templateUrl: "./teamselectordialog.component.html",
  styleUrls: ["./teamselectordialog.component.scss"],
})
export class TeamselectordialogComponent implements OnInit {
  team: Team;
  teams$: Observable<Team[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private teamService: TeamService,
    private dialogRef: MatDialogRef<TeamselectordialogComponent>
  ) {}

  ngOnInit(): void {
    this.teams$ = this.teamService.findByPartialName("");
  }

  returnTeam() {
    this.dialogRef.close(this.team);
  }

  onTeamSelected(id) {
    console.log("onTeamSelected:", id);
    this.teamService
      .findById(id)
      .toPromise()
      .then((team) => {
        console.log("set team:", team);
        this.team = team;
      })
      .catch((e) => console.error("error:", e));
  }

  onKey(event: any) {
    console.log("searchName", event.target.value);
    this.teams$ = this.teamService.findByPartialName(event.target.value);
  }
}
