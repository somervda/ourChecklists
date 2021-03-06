import { HelperService } from "./../../services/helper.service";
import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Checklist, ChecklistStatus } from "src/app/models/checklist.model";
import { ChecklistService } from "src/app/services/checklist.service";

@Component({
  selector: "app-checkliststatusdialog",
  templateUrl: "./checkliststatusdialog.component.html",
  styleUrls: ["./checkliststatusdialog.component.scss"],
})
export class CheckliststatusdialogComponent implements OnInit {
  checklist: Checklist;
  newStatus: ChecklistStatus;
  ChecklistStatus = ChecklistStatus;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CheckliststatusdialogComponent>,
    private checklistService: ChecklistService,
    public helper: HelperService
  ) {}

  ngOnInit(): void {
    if (this.data.checklist) {
      this.checklist = this.data.checklist;
    }
  }

  updateStatus() {
    console.log("updateStatus", this.newStatus);
    this.checklistService
      .fieldUpdateAsPromise(this.checklist.id, "status", this.newStatus)
      .then((p) => {
        this.helper.snackbar(
          "Checklist '" + this.checklist.name + "' status updated.",
          5000
        );

        switch (this.newStatus) {
          case ChecklistStatus.UnderConstruction:
            this.helper.redirect("/checklistdesign/" + this.checklist.id);
            this.dialogRef.close();
            break;
          case ChecklistStatus.Active:
            this.helper.redirect("/checklistedit/" + this.checklist.id);
            this.dialogRef.close();
            break;
          default:
            this.helper.redirect("/checklist/" + this.checklist.id);
            this.dialogRef.close();
            break;
        }
      })
      .catch((e) => {
        this.helper.snackbar(
          "Checklist '" + this.checklist.name + "' status was not updated." + e,
          5000
        );
        console.error("Status update failed:", e);
      });
  }

  iconAction(value) {
    // console.log("iconAction:", value, ":");
    switch (value) {
      case "close":
        this.dialogRef.close();
        break;
    }
  }
}
