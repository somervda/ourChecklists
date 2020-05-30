import { AuthService } from "./../services/auth.service";
import { ChecklistService } from "src/app/services/checklist.service";
import { Component, OnInit } from "@angular/core";
import { Checklist, ChecklistStatus } from "../models/checklist.model";
import { Observable } from "rxjs";
import { Checklistitem } from "../models/checklistitem.model";
import { ActivatedRoute } from "@angular/router";
import { ChecklistitemService } from "../services/checklistitem.service";
import { HelperService } from "../services/helper.service";
import { IconAction } from "../models/helper.model";

@Component({
  selector: "app-template",
  templateUrl: "./template.component.html",
  styleUrls: ["./template.component.scss"],
})
export class TemplateComponent implements OnInit {
  checklist: Checklist;
  checklistitems$: Observable<Checklistitem[]>;
  displayedColumns: string[] = ["name"];
  ChecklistStatus = ChecklistStatus;
  iconActions: IconAction[] = [
    {
      icon: "print",
      toolTip: "Print",
      emitValue: "print",
    },
    {
      icon: "file_copy",
      toolTip: "Create a new checklist from the template",
      emitValue: "newChecklist",
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private checklistitemService: ChecklistitemService,
    private helper: HelperService,
    private checklistService: ChecklistService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.checklist = this.route.snapshot.data["checklist"];
    this.checklistitems$ = this.checklistitemService.findAll(this.checklist.id);
  }

  iconAction(value) {
    // console.log("iconAction:", value, ":");
    switch (value) {
      case "print":
        window.print();
        break;
      case "newChecklist":
        this.createChecklist();
        break;
    }
  }

  createChecklist() {
    console.log("createChecklist");
    this.checklistService
      .createFromTemplate(this.checklist, this.auth.currentUser)
      .then((checklistId) => {
        console.log("checklistId", checklistId);
        this.helper.snackbar("Checklist created from template", 3000);
        this.helper.redirect(`/checklist/${checklistId}`);
      })
      .catch((err) => console.error("createFromTemplate failed:", err));
  }
}
