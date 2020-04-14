import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Activity } from "../models/activity.model";
import { MatDialog } from "@angular/material/dialog";
import { ActivityService } from "../services/activity.service";
import { CategoryactivitydeleteComponent } from "../categoryactivitydelete/categoryactivitydelete.component";
import { CategoryactivityaddComponent } from "../categoryactivityadd/categoryactivityadd.component";

@Component({
  selector: "app-categoryactivitylist",
  templateUrl: "./categoryactivitylist.component.html",
  styleUrls: ["./categoryactivitylist.component.scss"],
})
export class CategoryactivitylistComponent implements OnInit {
  @Input() categoryId: string;
  activities$: Observable<Activity[]>;
  displayedColumns: string[] = ["name", "description", "id"];

  constructor(
    private activityService: ActivityService,
    public dialog: MatDialog
  ) {}
  ngOnInit() {
    this.activities$ = this.activityService.findAllByCategory(
      this.categoryId,
      100
    );
  }

  onCategoryActivityDelete(activityId: string) {
    // console.log("remove click:", uid, displayName, teamId);
    const dialogRef = this.dialog.open(CategoryactivitydeleteComponent, {
      width: "280px",
      data: { categoryId: this.categoryId, activityId: activityId },
    });
  }

  onCategoryActivityAdd() {
    console.log("add click:");
    const dialogRef = this.dialog.open(CategoryactivityaddComponent, {
      width: "380px",
      data: { id: this.categoryId },
    });
  }
}
