import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import {
  ChecklistitemResultType,
  Checklistitem,
  ChecklistitemResultValue,
} from "src/app/models/checklistitem.model";

@Component({
  selector: "app-checklistitemresult",
  templateUrl: "./checklistitemresult.component.html",
  styleUrls: ["./checklistitemresult.component.scss"],
})
export class ChecklistitemresultComponent implements OnInit {
  @Input() checklistitem: Checklistitem;
  @Output() change = new EventEmitter();
  ChecklistitemResultType = ChecklistitemResultType;
  ChecklistitemResultValue = ChecklistitemResultValue;

  constructor() {}

  ngOnInit(): void {}

  onChange(resultEvent, isCheckbox) {
    // console.log(
    //   "onChange",
    //   resultEvent,
    //   this.checklistitem.resultValue,
    //   resultEvent.source
    // );
    if (isCheckbox) {
      if (resultEvent.checked) {
        this.change.emit(ChecklistitemResultValue.true);
      } else {
        this.change.emit(ChecklistitemResultValue.false);
      }
    } else {
      this.change.emit(resultEvent.value);
    }
  }
}
