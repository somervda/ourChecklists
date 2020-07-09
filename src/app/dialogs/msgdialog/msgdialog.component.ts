import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-msgdialog",
  templateUrl: "./msgdialog.component.html",
  styleUrls: ["./msgdialog.component.scss"],
})
export class MsgdialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {}
}
