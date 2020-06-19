import { AuthService } from "./../services/auth.service";
import { ChecklistService } from "src/app/services/checklist.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Checklist, ChecklistStatus } from "../models/checklist.model";
import { Observable, Subscription } from "rxjs";
import { Checklistitem } from "../models/checklistitem.model";
import { ActivatedRoute } from "@angular/router";
import { ChecklistitemService } from "../services/checklistitem.service";
import { HelperService } from "../services/helper.service";
import { IconAction } from "../models/helper.model";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-template",
  templateUrl: "./template.component.html",
  styleUrls: ["./template.component.scss"],
})
export class TemplateComponent implements OnInit, OnDestroy {
  checklist: Checklist;
  checklistitems$: Observable<Checklistitem[]>;
  checklistitems$$: Subscription;
  checklistItems: Checklistitem[];
  displayedColumns: string[] = ["name"];
  ChecklistStatus = ChecklistStatus;
  user$;
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
  fileUrl;
  downLoadReady = false;
  extractName = "template.json";

  constructor(
    private route: ActivatedRoute,
    private checklistitemService: ChecklistitemService,
    private helper: HelperService,
    private checklistService: ChecklistService,
    private auth: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.checklist = this.route.snapshot.data["checklist"];
    this.checklistitems$ = this.checklistitemService.findAll(this.checklist.id);
    this.checklistitems$$ = this.checklistitems$.subscribe((ci) =>
      this.createDownload(this.checklist, ci)
    );
    this.user$ = this.auth.user$;
  }

  go() {
    this.helper.redirect("/checklistdesign/" + this.checklist.id);
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

  createDownload(template: Checklist, templateitems: Checklistitem[]) {
    // const configData = JSON.stringify(this.availableRanges);
    const templateToExtract = {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category.path,
      resources: template.resources?.map((r) => r.path),
      status: template.status,
      team: template.team.path,
      isTemplate: true,
    };
    const teamplateitemsToExtract = templateitems.map((ti) => ({
      name: ti.name,
      sequence: ti.sequence,
      description: ti.description,
      activities: ti.activities?.map((a) => a.path),
      allowNA: ti.allowNA,
      requireEvidence: ti.requireEvidence ? ti.requireEvidence : false,
      resultType: ti.resultType,
      resources: ti.resources?.map((r) => r.path),
      tagId: ti.tagId,
    }));
    const templateObject = {
      template: templateToExtract,
      templateitems: teamplateitemsToExtract,
    };
    console.log("createDownload:", templateObject);
    const extractBlob = new Blob([JSON.stringify(templateObject)], {
      type: "application/json",
    });

    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      window.URL.createObjectURL(extractBlob)
    );
    this.extractName =
      "checklist-template-" + new Date().toISOString() + ".json";
    this.downLoadReady = true;
  }

  ngOnDestroy() {
    if (this.checklistitems$$) {
      this.checklistitems$$.unsubscribe();
    }
  }
}
