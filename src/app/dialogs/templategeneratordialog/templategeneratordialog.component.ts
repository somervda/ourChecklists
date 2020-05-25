import { Component, OnInit, Inject } from "@angular/core";
import { Checklist } from "src/app/models/checklist.model";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ChecklistService } from "src/app/services/checklist.service";
import { HelperService } from "src/app/services/helper.service";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-templategeneratordialog",
  templateUrl: "./templategeneratordialog.component.html",
  styleUrls: ["./templategeneratordialog.component.scss"],
})
export class TemplategeneratordialogComponent implements OnInit {
  checklist: Checklist;
  checklistForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TemplategeneratordialogComponent>,
    private fb: FormBuilder,
    private checklistService: ChecklistService,
    private helper: HelperService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this.data) {
      console.log("TemplategeneratordialogComponent", this.data);
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

  generateTemplate() {
    for (const field in this.checklistForm.controls) {
      this.checklist[field] = this.checklistForm.get(field).value;
    }
    this.checklistService
      .createTemplate(this.checklist)
      .then((templateId) => {
        console.log("templateId", templateId);
        this.helper.snackbar("Template created from checklist", 3000);
        this.helper.redirect(`/template/${templateId}`);
      })
      .catch((err) => console.error("createTemplate failed:", err));

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
