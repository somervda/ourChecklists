import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist, ChecklistStatus } from "../../models/checklist.model";
import { ChecklistService } from "../../services/checklist.service";
import { Team } from "../../models/team.model";
import { map } from "rxjs/operators";

@Component({
  selector: "app-teamchecklists",
  templateUrl: "./teamchecklists.component.html",
  styleUrls: ["./teamchecklists.component.scss"],
})
export class TeamchecklistsComponent implements OnInit {
  @Input() teamId: string;
  checklists$: Observable<Checklist[]>;
  team$: Observable<Team>;

  constructor(private checklistService: ChecklistService) {}

  ngOnInit() {
    this.checklists$ = this.checklistService.findByTeam(this.teamId, 100).pipe(
      map((c) => {
        return c.filter((cf) => cf.status != ChecklistStatus.Deleted);
      })
    );
  }
}
