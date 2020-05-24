import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist } from "src/app/models/checklist.model";

@Component({
  selector: "app-templatelist",
  templateUrl: "./templatelist.component.html",
  styleUrls: ["./templatelist.component.scss"],
})
export class TemplatelistComponent implements OnInit {
  @Input() checklists$: Observable<Checklist[]>;
  displayedColumns: string[] = ["name", "description"];

  constructor() {}

  ngOnInit() {}
}
