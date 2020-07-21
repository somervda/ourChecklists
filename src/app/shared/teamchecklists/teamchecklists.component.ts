import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist, ChecklistStatus } from "../../models/checklist.model";
import { ChecklistService } from "../../services/checklist.service";
import { Team } from "../../models/team.model";
import { HelperService } from "src/app/services/helper.service";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-teamchecklists",
  templateUrl: "./teamchecklists.component.html",
  styleUrls: ["./teamchecklists.component.scss"],
})
export class TeamchecklistsComponent implements OnInit {
  @Input() team: Team;
  checklists$: Observable<Checklist[]>;
  team$: Observable<Team>;

  constructor(
    private checklistService: ChecklistService,
    private helper: HelperService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.checklists$ = this.checklistService.findByTeam(
      this.helper.docRef(`teams/${this.team.id}`),
      ChecklistStatus.Done,
      100
    );
  }

  showDelete(): boolean {
    if (this.auth.currentUser.isAdmin) {
      return true;
    }
    if (
      this.auth.currentUser.managerOfTeams &&
      this.auth.currentUser.managerOfTeams.includes(this.team.id)
    ) {
      return true;
    }
    return false;
  }

  showCompletedChange(event) {
    console.log("showCompletedChange", event);
    if (event) {
      this.checklists$ = this.checklistService.findByTeam(
        this.helper.docRef(`teams/${this.team.id}`),
        ChecklistStatus.Complete,
        100
      );
    } else {
      this.checklists$ = this.checklistService.findByTeam(
        this.helper.docRef(`teams/${this.team.id}`),
        ChecklistStatus.Done,
        100
      );
    }
  }
}
