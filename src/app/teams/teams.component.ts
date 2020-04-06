import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Team } from "../models/team.model";
import { TeamService } from "../services/team.service";

@Component({
  selector: "app-teams",
  templateUrl: "./teams.component.html",
  styleUrls: ["./teams.component.scss"],
})
export class TeamsComponent implements OnInit {
  teams$: Observable<Team[]>;
  displayedColumns: string[] = ["name", "description", "id"];

  constructor(private teamservice: TeamService) {}
  ngOnInit() {
    // get a observable of all probes
    this.teams$ = this.teamservice.findAll(100);
  }
}
