import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist, ChecklistStatus } from "src/app/models/checklist.model";
import { AuthService } from "src/app/services/auth.service";
import { ConfirmdialogComponent } from "src/app/dialogs/confirmdialog/confirmdialog.component";
import { MatDialog } from "@angular/material/dialog";
import { ChecklistService } from "src/app/services/checklist.service";

@Component({
  selector: "app-templatelist",
  templateUrl: "./templatelist.component.html",
  styleUrls: ["./templatelist.component.scss"],
})
export class TemplatelistComponent implements OnInit {
  @Input() checklists$: Observable<Checklist[]>;
  displayedColumns: string[] = ["name", "description", "delete"];

  constructor(
    public auth: AuthService,
    private dialog: MatDialog,
    private checklistService: ChecklistService
  ) {}

  ngOnInit() {
    this.auth.currentUser.isTemplateManager;
  }

  deleteTemplate(checklist: Checklist) {
    console.log("deleteTemplate", checklist);
    const prompt =
      "Are you sure you want to delete this template? Note: The template list is logically deleted and can be restored by an administrator.";
    const dialogRef = this.dialog.open(ConfirmdialogComponent, {
      width: "390px",
      data: { heading: "Confirm", prompt: prompt },
    });
    dialogRef.afterClosed().subscribe((choice) => {
      if (choice) {
        console.log("deleteTemplate Yes");
        this.checklistService.fieldUpdate(
          checklist.id,
          "status",
          ChecklistStatus.Deleted
        );
      }
    });
  }
}
