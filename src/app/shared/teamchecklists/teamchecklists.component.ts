import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist } from "../../models/checklist.model";
import { ChecklistService } from "../../services/checklist.service";
import { Team } from "../../models/team.model";

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
    this.checklists$ = this.checklistService.findByTeam(this.teamId, 100);
  }
}
