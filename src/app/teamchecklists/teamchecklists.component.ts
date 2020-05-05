import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist } from "../models/checklist.model";
import { ChecklistService } from "../services/checklist.service";
import { AuthService } from "../services/auth.service";
import { ActivatedRoute } from "@angular/router";
import { Team } from "../models/team.model";
import { TeamService } from "../services/team.service";

@Component({
  selector: "app-teamchecklists",
  templateUrl: "./teamchecklists.component.html",
  styleUrls: ["./teamchecklists.component.scss"],
})
export class TeamchecklistsComponent implements OnInit {
  checklists$: Observable<Checklist[]>;
  team$: Observable<Team>;

  constructor(
    private checklistService: ChecklistService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private teamService: TeamService
  ) {}

  async ngOnInit() {
    await this.waitForCurrentUser();
    const teamId = this.route.snapshot.paramMap.get("id");
    this.team$ = this.teamService.findById(teamId);
    this.checklists$ = this.checklistService.findByTeam(teamId, 100);
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
