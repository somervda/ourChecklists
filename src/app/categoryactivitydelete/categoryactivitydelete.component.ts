import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ActivityService } from "../services/activity.service";
import { Observable } from "rxjs";
import { Activity } from "../models/activity.model";

@Component({
  selector: "app-categoryactivitydelete",
  templateUrl: "./categoryactivitydelete.component.html",
  styleUrls: ["./categoryactivitydelete.component.scss"],
})
export class CategoryactivitydeleteComponent implements OnInit {
  activity$: Observable<Activity>;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private activityService: ActivityService,
    private dialogRef: MatDialogRef<CategoryactivitydeleteComponent>
  ) {}

  ngOnInit(): void {
    this.activity$ = this.activityService.findById(
      this.data.categoryId,
      this.data.activityId
    );
  }

  deleteActivity() {
    console.log(this.data);
    this.activityService.delete(this.data.categoryId, this.data.activityId);
    this.dialogRef.close();
  }
}
