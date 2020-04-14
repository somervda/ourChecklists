import { Component, OnInit, Inject } from "@angular/core";
import { Observable } from "rxjs";
import { ActivityService } from "../services/activity.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Activity } from "../models/activity.model";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-categoryactivityadd",
  templateUrl: "./categoryactivityadd.component.html",
  styleUrls: ["./categoryactivityadd.component.scss"],
})
export class CategoryactivityaddComponent implements OnInit {
  activity: Activity;
  activityForm: FormGroup;

  constructor(
    private activityService: ActivityService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CategoryactivityaddComponent>,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activity = { name: "", description: "" };
    this.activityForm = this.fb.group({
      name: [
        this.activity.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
        ],
      ],
      description: [
        this.activity.description,
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(150),
        ],
      ],
    });
  }

  addActivity() {
    console.log("addActivity");
    for (const field in this.activityForm.controls) {
      this.activity[field] = this.activityForm.get(field).value;
    }
    const result = this.activityService.create(this.data.id, this.activity);
    this.dialogRef.close();
  }
}
