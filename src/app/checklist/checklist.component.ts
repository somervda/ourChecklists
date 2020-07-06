import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Checklist, ChecklistStatus } from "../models/checklist.model";
import { Observable, Subscription } from "rxjs";
import { Checklistitem } from "../models/checklistitem.model";
import { ChecklistitemService } from "../services/checklistitem.service";
import { CheckliststatusdialogComponent } from "../dialogs/checkliststatusdialog/checkliststatusdialog.component";
import { AuthService } from "../services/auth.service";
import { HelperService } from "../services/helper.service";
import { first } from "rxjs/operators";
import { IconAction } from "../models/helper.model";
import { TemplategeneratordialogComponent } from "../dialogs/templategeneratordialog/templategeneratordialog.component";
import { ChecklistService } from "../services/checklist.service";

@Component({
  selector: "app-checklist",
  templateUrl: "./checklist.component.html",
  styleUrls: ["./checklist.component.scss"],
})
export class ChecklistComponent implements OnInit, OnDestroy {
  checklist: Checklist;
  checklist$: Observable<Checklist>;
  checklist$$: Subscription;
  checklistitems$: Observable<Checklistitem[]>;
  displayedColumns: string[] = ["name", "resultType"];
  ChecklistStatus = ChecklistStatus;
  isTeamManagerOrAdmin: Boolean;
  iconActions: IconAction[] = [
    {
      icon: "print",
      toolTip: "Print",
      emitValue: "print",
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private checklistService: ChecklistService,
    private checklistitemService: ChecklistitemService,
    public dialog: MatDialog,
    private auth: AuthService,
    public helper: HelperService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.data["checklist"].id;
    this.checklist$ = this.checklistService.findById(id);
    this.checklistitems$ = this.checklistitemService.findAll(id);
    this.checklist$$ = this.checklist$.subscribe(
      (checklist) => (this.checklist = checklist)
    );
    this.auth.user$
      .pipe(first())
      .toPromise()
      .then((u) => {
        this.isTeamManagerOrAdmin =
          u.isAdmin || u.managerOfTeams?.includes(this.checklist.team.id);
        if (u.isAdmin || u.isTemplateManager) {
          this.iconActions.push({
            icon: "dynamic_feed",
            toolTip: "Create template from this checklist",
            emitValue: "template",
          });
        }
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

  toDate(timestamp: any): Date {
    if (timestamp) {
      return (timestamp as firebase.firestore.Timestamp).toDate();
    } else {
      return null;
    }
  }

  isOverdue(): boolean {
    // Check if we have a target date and if it is in the past
    // and if status is not complete
    if (this.checklist.dateTargeted) {
      if (this.checklist.dateTargeted.toDate() < new Date()) {
        if (this.checklist.status != ChecklistStatus.Complete) {
          return true;
        }
      }
    }
    return false;
  }

  iconAction(value) {
    // console.log("iconAction:", value, ":");
    switch (value) {
      case "print":
        window.print();
        break;
      case "template":
        this.createTemplate();
        break;
    }
  }

  createTemplate() {
    console.log("createTemplate");
    const dialogRef = this.dialog.open(TemplategeneratordialogComponent, {
      minWidth: "380px",
      maxWidth: "700px",
      width: "80%",
      data: { checklist: this.checklist },
      autoFocus: false,
    });
  }

  ngOnDestroy(): void {
    if (this.checklist$$) {
      this.checklist$$.unsubscribe();
    }
  }
}
