import { Component, OnInit, OnDestroy } from "@angular/core";
import { ChecklistService } from "../services/checklist.service";
import { HelperService } from "../services/helper.service";
import { ChecklistStatus, Checklist } from "../models/checklist.model";
import { Observable, Subscription } from "rxjs";
import { ChecklistitemService } from "../services/checklistitem.service";
import { first } from "rxjs/operators";

@Component({
  selector: "app-adminutils",
  templateUrl: "./adminutils.component.html",
  styleUrls: ["./adminutils.component.scss"],
})
export class AdminutilsComponent implements OnInit, OnDestroy {
  showSpinner = false;
  deletedChecklists$: Observable<Checklist[]>;
  deletedChecklists$$: Subscription;
  deletedChecklists: Checklist[];

  constructor(
    private checklistService: ChecklistService,
    private checklistitemService: ChecklistitemService,
    private helper: HelperService
  ) {}

  ngOnInit(): void {}

  async checklistCleanup() {
    this.showSpinner = true;
    this.deletedChecklists = [];
    this.deletedChecklists$ = this.checklistService.search(
      ChecklistStatus.Deleted,
      this.helper.docRef("/categories/0"),
      this.helper.docRef("/teams/0"),
      this.helper.docRef("/checklists/0"),
      100
    );
    // Delete checklists
    this.deletedChecklists$$ = await this.deletedChecklists$
      .pipe(first())
      .subscribe((checklists) =>
        checklists.map((checklist) => {
          this.deletedChecklists.push({ ...checklist });
          this.deleteChecklist(checklist);
        })
      );
    this.showSpinner = false;
  }

  async deleteChecklist(checklist: Checklist) {
    await this.checklistitemService
      .findAll(checklist.id)
      .pipe(first())
      .toPromise()
      .then((cis) => this.checklistService.deleteChecklist(checklist, cis))
      .then(() => {
        console.log("deleteChecklist:", checklist.id);
      });
  }

  ngOnDestroy() {
    if (this.deletedChecklists$$) {
      this.deletedChecklists$$.unsubscribe();
    }
  }
}
