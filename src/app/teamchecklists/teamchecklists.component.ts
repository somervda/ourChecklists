import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist } from "../models/checklist.model";
import { ChecklistService } from "../services/checklist.service";

@Component({
  selector: "app-teamchecklists",
  templateUrl: "./teamchecklists.component.html",
  styleUrls: ["./teamchecklists.component.scss"],
})
export class TeamchecklistsComponent implements OnInit {
  checklists$: Observable<Checklist[]>;

  constructor(private checklistService: ChecklistService) {}
  ngOnInit() {
    this.checklists$ = this.checklistService.findMyTeamChecklists(100);
  }
}
