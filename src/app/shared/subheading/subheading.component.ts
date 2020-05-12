import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-subheading",
  templateUrl: "./subheading.component.html",
  styleUrls: ["./subheading.component.scss"],
})
export class SubheadingComponent implements OnInit {
  @Input() title: string;
  @Input() returnRoute: string;
  @Input() returnTitle: string;
  @Input() matIcon: string;
  @Input() showAll: boolean;
  @Input() showClose: boolean;
  @Output() showAllChange = new EventEmitter();
  @Output() close = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  onShowAll(event) {
    // console.log("onShowAll", event);
    this.showAllChange.emit(event.checked);
  }

  onClose() {
    this.close.emit(true);
  }
}
