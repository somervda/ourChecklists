import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ResourceService } from "../services/resource.service";
import { MatDialog } from "@angular/material/dialog";
import { Checklist, ChecklistStatus } from "../models/checklist.model";
import { Observable } from "rxjs";
import { Resource } from "../models/resource.model";
import { Checklistitem } from "../models/checklistitem.model";
import { ChecklistitemService } from "../services/checklistitem.service";
import { CheckliststatusdialogComponent } from "../dialogs/checkliststatusdialog/checkliststatusdialog.component";
import { AuthService } from "../services/auth.service";
import { HelperService } from "../services/helper.service";

@Component({
  selector: "app-checklist",
  templateUrl: "./checklist.component.html",
  styleUrls: ["./checklist.component.scss"],
})
export class ChecklistComponent implements OnInit {
  checklist: Checklist;
  resources$: Observable<Resource[]>;
  checklistitems$: Observable<Checklistitem[]>;
  displayedColumns: string[] = ["name", "resultType"];
  ChecklistStatus = ChecklistStatus;

  constructor(
    private route: ActivatedRoute,
    private checklistitemService: ChecklistitemService,
    private resourceService: ResourceService,
    public dialog: MatDialog,
    private auth: AuthService,
    public helper: HelperService
  ) {}

  async ngOnInit() {
    await this.waitForCurrentUser();
    this.checklist = this.route.snapshot.data["checklist"];
    this.checklistitems$ = this.checklistitemService.findAll(this.checklist.id);
    if (this.checklist.resources) {
      this.resources$ = this.resourceService.findAllIn(
        this.checklist.resources.map((r) => r.id)
      );
    }
  }

  statusDialog() {
    console.log("statusDialog");
    const dialogRef = this.dialog.open(CheckliststatusdialogComponent, {
      minWidth: "380px",
      maxWidth: "500px",
      width: "80%",
      data: { checklist: this.checklist },
      autoFocus: false,
    });
  }

  isTeamManagerOrAdmin(): Boolean {
    return (
      this.auth.currentUser.isAdmin ||
      this.auth.currentUser.managerOfTeams?.includes(this.checklist.team.id)
    );
  }

  iconAction(value) {
    // console.log("iconAction:", value, ":");
    switch (value) {
      case "print":
        window.print();
        break;
    }
  }

  // getResultValueName(value: ChecklistitemResultValue): string {
  //   switch (value) {
  //     case undefined:
  //       return "...";
  //     case ChecklistitemResultValue.NA:
  //       return "N/A";
  //     case ChecklistitemResultValue.false:
  //       return "No";
  //     case ChecklistitemResultValue.true:
  //       return "Yes";
  //     case ChecklistitemResultValue.low:
  //       return "1: Low";
  //     case ChecklistitemResultValue.mediumLow:
  //       return "2: Medium Low";
  //     case ChecklistitemResultValue.medium:
  //       return "3: Medium";
  //     case ChecklistitemResultValue.mediumHigh:
  //       return "4: Medium High";
  //     case ChecklistitemResultValue.high:
  //       return "5: High";
  //   }
  // }

  async waitForCurrentUser() {
    let waitMS = 5000;
    while (!this.auth.currentUser && waitMS > 0) {
      console.log("Waiting for user to show up!");
      await this.sleep(200);
      waitMS -= 200;
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
