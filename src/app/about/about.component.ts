import { Component, OnInit } from "@angular/core";
import { HelperService } from "../services/helper.service";

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.scss"],
})
export class AboutComponent implements OnInit {
  docRef: any;
  constructor(private helper: HelperService) {}

  ngOnInit() {}
}
