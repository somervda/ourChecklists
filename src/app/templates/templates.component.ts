import { Component, OnInit } from "@angular/core";
import { ChecklistService } from "../services/checklist.service";
import { Observable } from "rxjs";
import { Checklist } from "../models/checklist.model";

@Component({
  selector: "app-templates",
  templateUrl: "./templates.component.html",
  styleUrls: ["./templates.component.scss"],
})
export class TemplatesComponent implements OnInit {
  checklists$: Observable<Checklist[]>;

  constructor(private checklistService: ChecklistService) {}

  ngOnInit(): void {
    this.checklists$ = this.checklistService.findAllTemplates(100);
  }
}
