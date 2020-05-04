import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist } from "../models/checklist.model";
import { ChecklistService } from "../services/checklist.service";

@Component({
  selector: "app-mychecklists",
  templateUrl: "./mychecklists.component.html",
  styleUrls: ["./mychecklists.component.scss"],
})
export class MychecklistsComponent implements OnInit {
  checklists$: Observable<Checklist[]>;

  constructor(private checklistService: ChecklistService) {}
  ngOnInit() {
    this.checklists$ = this.checklistService.findMyChecklists(100);
  }
}
