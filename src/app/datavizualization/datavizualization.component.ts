import { Component, OnInit } from "@angular/core";
import { HelperService } from "../services/helper.service";

@Component({
  selector: "app-datavizualization",
  templateUrl: "./datavizualization.component.html",
  styleUrls: ["./datavizualization.component.scss"],
})
export class DatavizualizationComponent implements OnInit {
  rows: number = 0;
  vizReady = false;
  constructor(private helper: HelperService) {}

  ngOnInit(): void {}

  startExtract() {
    this.vizReady = false;
  }

  createViz(checklistsAndItems) {
    console.log("creatViz:", checklistsAndItems);
    this.rows = checklistsAndItems.length;
    this.vizReady = true;
  }
}
