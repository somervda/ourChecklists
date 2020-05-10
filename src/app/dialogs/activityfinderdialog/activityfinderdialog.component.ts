import { Component, OnInit, Inject } from "@angular/core";
import { ActivityService } from "../../services/activity.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { Activity } from "../../models/activity.model";
import { DocRef } from "../../models/helper.model";

@Component({
  selector: "app-activityfinderdialog",
  templateUrl: "./activityfinderdialog.component.html",
  styleUrls: ["./activityfinderdialog.component.scss"],
})
export class ActivityfinderdialogComponent implements OnInit {
  activities$: Observable<Activity[]>;
  selectedActivity: Activity;
  idHide: string[] = [];
  categoryRef: DocRef = { id: "", name: "" };

  constructor(
    private activityService: ActivityService,
    private dialogRef: MatDialogRef<ActivityfinderdialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data) {
      console.log("ActivityfinderdialogComponent", this.data);
    }
    if (this.data.idHide) {
      this.idHide = this.data.idHide;
    }
    if (this.data.categoryRef) {
      this.categoryRef = this.data["categoryRef"];
    }
    this.activities$ = this.activityService.findAllByCategory(
      this.data["categoryRef"]?.id,
      100
    );
  }

  isHidden(activity: Activity) {
    if (this.idHide) {
      return this.idHide.includes(activity.id);
    }
    return false;
  }

  onActivitySelected(activity: Activity) {
    console.log("onActivitySelected", activity);
    this.selectedActivity = activity;
  }

  returnActivity() {
    this.dialogRef.close(this.selectedActivity);
  }
}
