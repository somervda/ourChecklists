import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist } from "../models/checklist.model";
import { ChecklistService } from "../services/checklist.service";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-checklists",
  templateUrl: "./checklists.component.html",
  styleUrls: ["./checklists.component.scss"],
})
export class ChecklistsComponent implements OnInit {
  checklists$: Observable<Checklist[]>;
  displayedColumns: string[] = ["name", "description", "id"];

  constructor(
    private checklistService: ChecklistService,
    private auth: AuthService
  ) {}
  ngOnInit() {
    this.checklists$ = this.checklistService.findAll(100);
  }
}
