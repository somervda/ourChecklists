import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist } from "../models/checklist.model";

@Component({
  selector: "app-checklistsearch",
  templateUrl: "./checklistsearch.component.html",
  styleUrls: ["./checklistsearch.component.scss"],
})
export class ChecklistsearchComponent implements OnInit {
  checklists$: Observable<Checklist[]>;

  constructor() {}

  ngOnInit(): void {}

  showChecklists(checklists$) {
    this.checklists$ = checklists$;
  }
}
