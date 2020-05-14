import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist } from "../models/checklist.model";
import { ChecklistService } from "../services/checklist.service";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-mychecklists",
  templateUrl: "./mychecklists.component.html",
  styleUrls: ["./mychecklists.component.scss"],
})
export class MychecklistsComponent implements OnInit {
  checklists$: Observable<Checklist[]>;

  constructor(
    private checklistService: ChecklistService,
    private auth: AuthService
  ) {}
  ngOnInit() {
    this.waitForCurrentUser();
    this.checklists$ = this.checklistService.findMyChecklists(100);
  }

  async waitForCurrentUser() {
    let waitMS = 5000;
    while (!this.auth.currentUser && waitMS > 0) {
      console.log("Waiting for user to show up!");
      await this.sleep(200);
      waitMS -= 200;
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
