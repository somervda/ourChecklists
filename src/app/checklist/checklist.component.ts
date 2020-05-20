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
import { first } from "rxjs/operators";

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
  isTeamManagerOrAdmin: Boolean;

  constructor(
    private route: ActivatedRoute,
    private checklistitemService: ChecklistitemService,
    private resourceService: ResourceService,
    public dialog: MatDialog,
    private auth: AuthService,
    public helper: HelperService
  ) {}

  ngOnInit() {
    this.checklist = this.route.snapshot.data["checklist"];
    this.checklistitems$ = this.checklistitemService.findAll(this.checklist.id);
    if (this.checklist.resources) {
      this.resources$ = this.resourceService.findAllIn(
        this.checklist.resources.map((r) => r.id)
      );
    }
    this.auth.user$
      .pipe(first())
      .toPromise()
      .then((u) => {
        this.isTeamManagerOrAdmin =
          u.isAdmin || u.managerOfTeams?.includes(this.checklist.team.id);
      });
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

  iconAction(value) {
    // console.log("iconAction:", value, ":");
    switch (value) {
      case "print":
        window.print();
        break;
    }
  }
}
