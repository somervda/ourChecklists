import { HelperService } from "./../../services/helper.service";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist, ChecklistStatus } from "../../models/checklist.model";
import { AuthService } from "../../services/auth.service";
import { first, map } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmdialogComponent } from "src/app/dialogs/confirmdialog/confirmdialog.component";
import { ChecklistService } from "src/app/services/checklist.service";

@Component({
  selector: "app-checklistlist",
  templateUrl: "./checklistlist.component.html",
  styleUrls: ["./checklistlist.component.scss"],
})
export class ChecklistlistComponent implements OnInit {
  @Input() checklists$: Observable<Checklist[]>;
  @Input() hideCreate: boolean;
  @Input() showCompletedOption: boolean;
  @Input() showDelete = true;
  @Input() viewOnlyLink = false;
  @Output() showCompletedChange = new EventEmitter();
  includeCompleted = false;
  displayedColumns: string[] = ["name", "status", "description", "delete"];
  isAdmin: Boolean;
  uid: String;

  constructor(
    private auth: AuthService,
    public helper: HelperService,
    private dialog: MatDialog,
    private checklistService: ChecklistService
  ) {}

  ngOnInit() {
    this.auth.user$
      .pipe(first())
      .toPromise()
      .then((u) => {
        this.isAdmin = u.isAdmin;
        this.uid = u.uid;
      });
  }

  toggleIncludeComplete() {
    console.log("toggleIncludeComplete", this.includeCompleted);
    this.showCompletedChange.emit(this.includeCompleted);
  }

  getChecklistLinkAction(
    checklist: Checklist
  ): { link: string; tooltip: string } {
    let linkAction = { link: "", tooltip: "" };
    // console.log("getChecklistLinkAction", checklist);
    if (
      this.isAdmin ||
      checklist.assignee.find((u) => this.uid == this.helper.getDocRefId(u))
    ) {
      switch (checklist.status) {
        case ChecklistStatus.UnderConstruction:
          // Design only option in underconstruction
          linkAction.link = `/checklistdesign/${checklist.id}`;
          linkAction.tooltip = "Design the Checklist";
          break;
        case ChecklistStatus.Active:
          // NChecklist is ready to be filled in
          linkAction.link = `/checklistedit/${checklist.id}`;
          linkAction.tooltip = "Edit/fill-in the Checklist";
          break;
        case ChecklistStatus.Complete:
        case ChecklistStatus.Done:
          // Can view and update the status depending on role
          linkAction.link = `/checklist/${checklist.id}`;
          linkAction.tooltip = "Review Checklist";
          break;
        case ChecklistStatus.Deleted:
          // NDeleted checklists can only be viewed , and only by admins (Not shown in lists for non-admins)
          linkAction.link = `/checklist/${checklist.id}`;
          linkAction.tooltip = "View Deleted Checklist";
          break;
      }
    } else {
      // Not in the assignee lists and not admin so can only view
      linkAction.link = `/checklist/${checklist.id}`;
      linkAction.tooltip = "View Checklist";
    }

    return linkAction;
  }

  isOverdue(checklist): boolean {
    // Check if we have a target date and if it is in the past
    // and if status is not complete
    if (checklist.dateTargeted) {
      if (checklist.dateTargeted.toDate() < new Date()) {
        if (checklist.status != ChecklistStatus.Complete) {
          return true;
        }
      }
    }
    return false;
  }

  deleteChecklist(checklist: Checklist) {
    console.log("deleteChecklist", checklist);

    const prompt =
      "Are you sure you want to delete this checklist? Note: The checklist is logically deleted and can be restored by an administrator.";
    const dialogRef = this.dialog.open(ConfirmdialogComponent, {
      width: "390px",
      data: { heading: "Confirm", prompt: prompt },
    });
    dialogRef.afterClosed().subscribe((choice) => {
      if (choice) {
        console.log("deleteChecklist Yes");
        this.checklistService.fieldUpdate(
          checklist.id,
          "status",
          ChecklistStatus.Deleted
        );
      }
    });
  }
}
