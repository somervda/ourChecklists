import { Component, OnInit, Input } from "@angular/core";
import { Checklist } from "src/app/models/checklist.model";
import { ChecklistitemService } from "src/app/services/checklistitem.service";
import { Observable } from "rxjs";
import { Checklistitem } from "src/app/models/checklistitem.model";

@Component({
  selector: "app-checklistitemeditlist",
  templateUrl: "./checklistitemeditlist.component.html",
  styleUrls: ["./checklistitemeditlist.component.scss"],
})
export class ChecklistitemeditlistComponent implements OnInit {
  @Input() checklist: Checklist;
  checklistitems$: Observable<Checklistitem[]>;
  displayedColumns: string[] = ["name", "resultType"];

  constructor(private checklistitemService: ChecklistitemService) {}

  ngOnInit(): void {
    this.checklistitems$ = this.checklistitemService.findAll(this.checklist.id);
  }

  onResultChange(resultValue, checklistitem) {
    // console.log("onResultChange", resultValue);
    this.checklistitemService.fieldUpdate(
      this.checklist.id,
      checklistitem.id,
      "resultValue",
      resultValue
    );
  }
}
