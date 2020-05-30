import { Component, OnInit, Inject } from "@angular/core";
import { ActivityService } from "../../services/activity.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { Activity } from "../../models/activity.model";
import { DocumentReference } from "@angular/fire/firestore";
import { Category } from "src/app/models/category.model";
import { HelperService } from "src/app/services/helper.service";

@Component({
  selector: "app-activityfinderdialog",
  templateUrl: "./activityfinderdialog.component.html",
  styleUrls: ["./activityfinderdialog.component.scss"],
})

/**
 * Used to select a activity, activity selected gets returned as
 * a activity object. The list of activities displayed can be modified
 * to show activities that don't match the refHide array of resource DocumentReferences
 */
export class ActivityfinderdialogComponent implements OnInit {
  activities$: Observable<Activity[]>;
  selectedActivity: Activity;
  refHide: DocumentReference[] = [];
  category: Category;

  constructor(
    private activityService: ActivityService,
    private dialogRef: MatDialogRef<ActivityfinderdialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private helper: HelperService
  ) {}

  ngOnInit(): void {
    if (this.data) {
      console.log("ActivityfinderdialogComponent", this.data);
    }
    if (this.data.refHide) {
      this.refHide = this.data.refHide;
    }
    if (this.data.category) {
      this.category = this.data["category"];
    }
    this.activities$ = this.activityService.findAllByCategory(
      this.category.id,
      100
    );
  }

  isHidden(activity: Activity) {
    // console.log("isHidden", activity);
    if (this.refHide) {
      return (
        this.refHide.findIndex(
          (p) =>
            this.helper.docRef(
              `categories/${this.category.id}/activities/${activity.id}`
            ).path == p.path
        ) > -1
      );
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
