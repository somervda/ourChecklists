import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { IconAction } from "src/app/models/helper.model";

@Component({
  selector: "app-subheading",
  templateUrl: "./subheading.component.html",
  styleUrls: ["./subheading.component.scss"],
})
export class SubheadingComponent implements OnInit {
  @Input() prompt: string;
  @Input() matIcon: string;
  @Input() showAll: boolean;
  @Output() showAllChange = new EventEmitter();
  @Input() iconActions: IconAction[];
  @Output() iconAction = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  onShowAll(event) {
    // console.log("onShowAll", event);
    this.showAllChange.emit(event.checked);
  }

  iconActionClick(value: string) {
    console.log("iconActionClick:", value);
    this.iconAction.emit(value);
  }
}
