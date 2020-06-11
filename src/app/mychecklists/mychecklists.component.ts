import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist, ChecklistStatus } from "../models/checklist.model";
import { ChecklistService } from "../services/checklist.service";
import { AuthService } from "../services/auth.service";
import { first, map } from "rxjs/operators";

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
    this.auth.user$
      .pipe(first())
      .toPromise()
      .then((u) => {
        // Make sure we have the user resolved before getting their checklists
        this.checklists$ = this.checklistService.findMyChecklists(
          ChecklistStatus.Done,
          100
        );
      });
  }

  showCompletedChange(event) {
    console.log("showCompletedChange", event);
    if (event) {
      this.checklists$ = this.checklistService.findMyChecklists(
        ChecklistStatus.Complete,
        100
      );
    } else {
      this.checklists$ = this.checklistService.findMyChecklists(
        ChecklistStatus.Done,
        100
      );
    }
  }
}
