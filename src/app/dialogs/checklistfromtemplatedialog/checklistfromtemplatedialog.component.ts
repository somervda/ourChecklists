import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Checklist } from "src/app/models/checklist.model";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ChecklistService } from "src/app/services/checklist.service";
import { HelperService } from "src/app/services/helper.service";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-checklistfromtemplatedialog",
  templateUrl: "./checklistfromtemplatedialog.component.html",
  styleUrls: ["./checklistfromtemplatedialog.component.scss"],
})
export class ChecklistfromtemplatedialogComponent implements OnInit {
  checklist: Checklist;
  checklistForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ChecklistfromtemplatedialogComponent>,
    private fb: FormBuilder,
    private checklistService: ChecklistService,
    private helper: HelperService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this.data) {
      console.log("ChecklistfromtemplatedialogComponent", this.data);
    }
    if (this.data.checklist) {
      this.checklist = this.data.checklist;

      this.checklistForm = this.fb.group({
        name: [
          this.checklist.name,
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(70),
          ],
        ],
        description: [
          this.checklist.description,
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(500),
          ],
        ],
      });
    }
  }

  ok() {
    // this.checklistService
    //   .createFromTemplate(this.checklist, this.auth.currentUser)
    //   .then((checklistId) => {
    //     console.log("checklistId", checklistId);
    //     this.helper.snackbar("Checklist created from template", 3000);
    //     this.helper.redirect(`/checklist/${checklistId}`);
    //   })
    //   .catch((err) => console.error("createFromTemplate failed:", err));
    this.dialogRef.close();
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
