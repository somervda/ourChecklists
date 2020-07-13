import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { Checklist, ChecklistStatus } from "../models/checklist.model";
import { ChecklistService } from "../services/checklist.service";
import { AuthService } from "../services/auth.service";
import { first, map } from "rxjs/operators";

@Component({
  selector: "app-mychecklists",
  templateUrl: "./mychecklists.component.html",
  styleUrls: ["./mychecklists.component.scss"],
})
export class MychecklistsComponent implements OnInit, OnDestroy {
  checklists$: Observable<Checklist[]>;
  user$$: Subscription;

  constructor(
    private checklistService: ChecklistService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.user$$ = this.auth.user$.subscribe((u) => {
      // Make sure we have the user resolved before getting their checklists
      this.checklists$ = this.checklistService.findMyChecklists(
        u.uid,
        ChecklistStatus.Done,
        100
      );
    });
  }

  showCompletedChange(event) {
    console.log("showCompletedChange", event);
    if (event) {
      this.checklists$ = this.checklistService.findMyChecklists(
        this.auth.currentUser.uid,
        ChecklistStatus.Complete,
        100
      );
    } else {
      this.checklists$ = this.checklistService.findMyChecklists(
        this.auth.currentUser.uid,
        ChecklistStatus.Done,
        100
      );
    }
  }

  ngOnDestroy() {
    if (this.user$$) {
      this.user$$.unsubscribe();
    }
  }
}
