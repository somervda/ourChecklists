import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";
import { DocRef } from "../models/helper.model";
import { MatTable } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivityService } from "../services/activity.service";
import { ConfirmdialogComponent } from "../confirmdialog/confirmdialog.component";
import { Activity } from "../models/activity.model";
import { ActivityfinderdialogComponent } from "../activityfinderdialog/activityfinderdialog.component";

@Component({
  selector: "app-activitylistedit",
  templateUrl: "./activitylistedit.component.html",
  styleUrls: ["./activitylistedit.component.scss"],
})
export class ActivitylisteditComponent implements OnInit {
  @Input() activities: DocRef[];
  @Input() categoryRef: DocRef;
  @Input() hideCreate: boolean;
  @ViewChild(MatTable) table: MatTable<any>;
  @Output() change = new EventEmitter();

  displayedColumns: string[] = ["name", "id"];

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private resourceService: ActivityService
  ) {}

  ngOnInit(): void {
    console.log(
      "ActivitylisteditComponent:",
      this.activities,
      this.categoryRef
    );
    if (!this.activities) {
      this.activities = [];
    }
  }

  removeActivity(activity: Activity) {
    const prompt = `Are you sure you want to remove "${activity.name}" activity from the list?`;
    const dialogRef = this.dialog.open(ConfirmdialogComponent, {
      width: "300px",
      data: { heading: "Confirm", prompt: prompt },
    });
    dialogRef.afterClosed().subscribe((choice) => {
      if (choice) {
        this.activities.splice(
          this.activities.findIndex((a) => a.id == activity.id),
          1
        );
        this.refresh();
      }
    });
  }

  addActivity() {
    if (this.activities.length >= 10) {
      this.snackBar.open(
        "No more activities can be added (10 max), remove an existing activity before adding another.",
        "",
        {
          duration: 5000,
        }
      );
    } else {
      const dialogRef = this.dialog.open(ActivityfinderdialogComponent, {
        width: "380px",
        data: {
          idHide: this.activities.map((r) => r.id),
          categoryRef: this.categoryRef,
        },
      });
      dialogRef.afterClosed().subscribe((activity) => {
        if (activity) {
          console.log("addActivity", activity);
          const newActivity: DocRef = {
            id: activity.id,
            name: activity.name,
          };
          this.activities.push(newActivity);

          this.refresh();
        }
      });
    }
  }

  refresh() {
    this.table.renderRows();
    this.change.emit(this.activities);
  }
}
