import { Component, OnInit } from "@angular/core";
import { Checklist, ChecklistStatus } from "../models/checklist.model";
import { Observable } from "rxjs";
import { Resource } from "../models/resource.model";
import { Checklistitem } from "../models/checklistitem.model";
import { ActivatedRoute } from "@angular/router";
import { ChecklistitemService } from "../services/checklistitem.service";
import { ResourceService } from "../services/resource.service";
import { HelperService } from "../services/helper.service";
import { IconAction } from "../models/helper.model";

@Component({
  selector: "app-template",
  templateUrl: "./template.component.html",
  styleUrls: ["./template.component.scss"],
})
export class TemplateComponent implements OnInit {
  checklist: Checklist;
  resources$: Observable<Resource[]>;
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
    private resourceService: ResourceService,
    private helper: HelperService
  ) {}

  ngOnInit() {
    this.checklist = this.route.snapshot.data["checklist"];
    this.checklistitems$ = this.checklistitemService.findAll(this.checklist.id);
    if (this.checklist.resources) {
      this.resources$ = this.resourceService.findAllIn(
        this.checklist.resources.map((r) => r.id)
      );
    }
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
    // const dialogRef = this.dialog.open(TemplategeneratordialogComponent, {
    //   minWidth: "380px",
    //   maxWidth: "700px",
    //   width: "80%",
    //   data: { checklist: this.checklist },
    //   autoFocus: false,
    // });
  }
}
