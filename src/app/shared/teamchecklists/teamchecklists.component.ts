import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist, ChecklistStatus } from "../../models/checklist.model";
import { ChecklistService } from "../../services/checklist.service";
import { Team } from "../../models/team.model";
import { map } from "rxjs/operators";
import { HelperService } from "src/app/services/helper.service";

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
    private helper: HelperService
  ) {}

  ngOnInit() {
    this.checklists$ = this.checklistService.findByTeam(
      this.helper.docRef(`teams/${this.team.id}`),
      100
    );
  }
}
