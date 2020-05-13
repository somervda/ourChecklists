import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  Checklist,
  ChecklistStatus,
  ChecklistStatusInfoItem,
  ChecklistStatusInfo,
} from "src/app/models/checklist.model";

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
    private dialogRef: MatDialogRef<CheckliststatusdialogComponent>
  ) {}

  ngOnInit(): void {
    if (this.data.checklist) {
      this.checklist = this.data.checklist;
    }
  }

  getChecklistStatusInfoItem(status: ChecklistStatus): ChecklistStatusInfoItem {
    return ChecklistStatusInfo.find((clsii) => clsii.status == status);
  }

  updateStatus() {
    console.log("updateStatus", this.newStatus);
  }

  close() {
    console.log("Close");
    this.dialogRef.close();
  }
}
