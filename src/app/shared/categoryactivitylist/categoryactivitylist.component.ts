import { Component, OnInit, Input, NgZone } from "@angular/core";
import { Observable } from "rxjs";
import { Activity } from "../../models/activity.model";
import { MatDialog } from "@angular/material/dialog";
import { ActivityService } from "../../services/activity.service";
import { Router } from "@angular/router";
import { HelperService } from "src/app/services/helper.service";

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
    public dialog: MatDialog,
    private ngZone: NgZone,
    private router: Router,
    private helper: HelperService
  ) {}
  ngOnInit() {
    this.activities$ = this.activityService.findAllByCategory(
      this.categoryId,
      100
    );
  }

  onCategoryActivityDelete(activityId: string) {
    // console.log("remove click:", uid, displayName, teamId);
    this.helper.redirect(
      "/category/" + this.categoryId + "/activity/delete/" + activityId
    );
  }

  onCategoryActivityAdd() {
    console.log("add click:");

    this.helper.redirect("/category/" + this.categoryId + "/activity/create");
  }
}
