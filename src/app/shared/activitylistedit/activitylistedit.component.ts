import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";
import { DocRef } from "../../models/helper.model";
import { MatTable } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmdialogComponent } from "../../dialogs/confirmdialog/confirmdialog.component";
import { Activity } from "../../models/activity.model";
import { ActivityfinderdialogComponent } from "../../dialogs/activityfinderdialog/activityfinderdialog.component";
import { HelperService } from "src/app/services/helper.service";
import { DocumentReference } from "@angular/fire/firestore";
import { Category } from "src/app/models/category.model";

@Component({
  selector: "app-activitylistedit",
  templateUrl: "./activitylistedit.component.html",
  styleUrls: ["./activitylistedit.component.scss"],
})
export class ActivitylisteditComponent implements OnInit {
  @Input() activities: DocumentReference[];
  @Input() category: Category;
  @Input() hideCreate: boolean;
  @ViewChild(MatTable) table: MatTable<any>;
  @Output() change = new EventEmitter();

  displayedColumns: string[] = ["name", "id"];

  constructor(public dialog: MatDialog, private helper: HelperService) {}

  ngOnInit(): void {
    console.log("ActivitylisteditComponent:", this.activities, this.category);
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
    if (this.activities && this.activities.length >= 10) {
      this.helper.snackbar(
        "No more activities can be added (10 max), remove an existing activity before adding another.",
        5000
      );
    } else {
      const dialogRef = this.dialog.open(ActivityfinderdialogComponent, {
        width: "380px",
        data: {
          refHide: this.activities,
          category: this.category,
        },
      });
      dialogRef.afterClosed().subscribe((activity) => {
        if (activity) {
          console.log("addActivity", activity);
          const newActivity = this.helper.docRef(
            `categories/${this.category.id}/activities/${activity.id}`
          );
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
