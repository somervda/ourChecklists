import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist } from "../models/checklist.model";

@Component({
  selector: "app-checklistlist",
  templateUrl: "./checklistlist.component.html",
  styleUrls: ["./checklistlist.component.scss"],
})
export class ChecklistlistComponent implements OnInit {
  @Input() checklists$: Observable<Checklist[]>;
  displayedColumns: string[] = ["name", "description", "team"];

  constructor() {}

  ngOnInit(): void {}
}
