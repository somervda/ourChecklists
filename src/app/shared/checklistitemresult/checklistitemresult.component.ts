import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import {
  ChecklistitemResultType,
  Checklistitem,
  ChecklistitemResultValue,
} from "src/app/models/checklistitem.model";
import { Checklist } from "src/app/models/checklist.model";

@Component({
  selector: "app-checklistitemresult",
  templateUrl: "./checklistitemresult.component.html",
  styleUrls: ["./checklistitemresult.component.scss"],
})
export class ChecklistitemresultComponent implements OnInit {
  @Input() cid: string;
  @Input() checklistitem: Checklistitem;
  @Output() change = new EventEmitter();
  @Input() redirectForEvidence: boolean;
  @Input() disabled: boolean;
  ChecklistitemResultType = ChecklistitemResultType;
  ChecklistitemResultValue = ChecklistitemResultValue;

  constructor() {}

  ngOnInit(): void {}

  onChange(resultEvent, resultControl) {
    // console.log(
    //   "onChange",
    //   resultControl,
    //   resultEvent
    // );
    switch (resultControl) {
      case "YesNo":
        if (resultEvent.checked) {
          this.change.emit(ChecklistitemResultValue.true);
          this.checklistitem.resultValue = ChecklistitemResultValue.true;
        } else {
          this.change.emit(ChecklistitemResultValue.false);
          this.checklistitem.resultValue = ChecklistitemResultValue.false;
        }
        break;
      case "NA":
        if (resultEvent.checked) {
          this.change.emit(ChecklistitemResultValue.NA);
          this.checklistitem.resultValue = ChecklistitemResultValue.NA;
        } else {
          this.change.emit(ChecklistitemResultValue.false);
          this.checklistitem.resultValue = ChecklistitemResultValue.false;
        }
        break;
      case "Rating":
        this.change.emit(resultEvent.value);
        this.checklistitem.resultValue = resultEvent.value;
        break;
    }
  }
}
