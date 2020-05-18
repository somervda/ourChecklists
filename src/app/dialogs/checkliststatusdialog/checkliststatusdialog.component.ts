import { HelperService } from "./../../services/helper.service";
import { Component, OnInit, Inject, NgZone } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  Checklist,
  ChecklistStatus,
  ChecklistStatusInfoItem,
  ChecklistStatusInfo,
} from "src/app/models/checklist.model";
import { ChecklistService } from "src/app/services/checklist.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

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
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private router: Router,
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
        this.snackBar.open(
          "Checklist '" + this.checklist.name + "' status updated.",
          "",
          {
            duration: 5000,
          }
        );
        this.ngZone.run(() => {
          switch (this.newStatus) {
            case ChecklistStatus.UnderConstruction:
              this.router.navigateByUrl(
                "/checklistdesign/" + this.checklist.id
              );
              this.dialogRef.close();
              break;
            case ChecklistStatus.Active:
              this.router.navigateByUrl("/checklistedit/" + this.checklist.id);
              this.dialogRef.close();
              break;
            default:
              this.router.navigateByUrl("/checklist/" + this.checklist.id);
              this.dialogRef.close();
              break;
          }
        });
      })
      .catch((e) => {
        this.snackBar.open(
          "Checklist '" + this.checklist.name + "' status was not updated." + e,
          "",
          {
            duration: 5000,
          }
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
