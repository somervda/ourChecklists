import { Component, OnInit, Input } from "@angular/core";
import { HelperService } from "src/app/services/helper.service";
import { Checklist } from "src/app/models/checklist.model";
import { AuthService } from "src/app/services/auth.service";
import { first } from "rxjs/operators";
import { CheckliststatusdialogComponent } from "src/app/dialogs/checkliststatusdialog/checkliststatusdialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-checkliststatus",
  templateUrl: "./checkliststatus.component.html",
  styleUrls: ["./checkliststatus.component.scss"],
})
export class CheckliststatusComponent implements OnInit {
  @Input() checklist: Checklist;
  @Input() showAction: boolean;

  constructor(
    private auth: AuthService,
    private helper: HelperService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    console.log("Hi1");
    this.auth.user$
      .pipe(first())
      .toPromise()
      .then((u) => {
        console.log("CheckliststatusComponent", u);
      });

    console.log("Hi2");
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
}
