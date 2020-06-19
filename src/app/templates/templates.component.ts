import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ChecklistStatus, Checklist } from "../models/checklist.model";
import { Checklistitem } from "../models/checklistitem.model";
import { AuthService } from "../services/auth.service";
import { ChecklistService } from "../services/checklist.service";
import { HelperService } from "../services/helper.service";

@Component({
  selector: "app-templates",
  templateUrl: "./templates.component.html",
  styleUrls: ["./templates.component.scss"],
})
export class TemplatesComponent implements OnInit {
  checklists$: Observable<Checklist[]>;
  user$;

  constructor(
    private checklistService: ChecklistService,
    private auth: AuthService,
    private helper: HelperService
  ) {}

  ngOnInit(): void {
    this.user$ = this.auth.user$;

    this.checklists$ = this.checklistService.findAllTemplates(100).pipe(
      map((c) => {
        // console.log(c);
        return c.filter((cf) => cf.status != ChecklistStatus.Deleted);
        // console.log(x);
        // return x;
      })
    );
  }

  doImport(fileList: FileList) {
    console.log("doImport:", fileList);
    if (fileList.length == 1) {
      let fileReader: FileReader = new FileReader();
      const file = fileList[0];
      let self = this;
      fileReader.onloadend = (f) => this.processJSONImport(fileReader.result);
      fileReader.readAsText(file);
    }
  }

  processJSONImport(jsonString) {
    console.log("processJSONImport: ", jsonString);
    let importObject: any;
    try {
      importObject = JSON.parse(jsonString);
    } catch (e) {
      console.error("Could not parse jsonString as json: ", e.message);
      this.helper.snackbar("Error processing template:" + e.msg, 5000);
      return false;
    }
    console.log("importObject: ", importObject);
    // Create a new checklist and checklistitems based on importObject.
    //
    try {
      const checklist = this.templateToChecklist(importObject.template);
      const checklistitems = importObject.templateitems.map((i) =>
        this.templateitemToChecklistitem(i)
      );
      // console.log("checklist:", checklist);
      // console.log("checklistitems:", checklistitems);
      this.checklistService.createTemplateTransaction(
        checklist,
        checklistitems
      );
    } catch (e) {
      this.helper.snackbar("Error processing template:" + e.msg, 5000);
    }
  }

  /**
   * Return a valid checklist object by resolving the templateFromJSON object
   * @param templateFromJSON The raw object return by reading the template object created by reading  JSON
   */
  templateToChecklist(template): Checklist {
    // console.log("templateToChecklist:", template);
    let checklist = {} as Checklist;
    let now = new Date();
    if (template.name) {
      checklist.name = template.name;
    }
    checklist.name += `: Import(${now.toISOString()})`;
    if (template.description) {
      checklist.description = template.description;
    } else {
      checklist.description = "";
    }
    checklist.isTemplate = true;
    if (template.category) {
      checklist.category = this.helper.docRef(template.category);
    }
    if (template.resources) {
      checklist.resources = template.resources?.map((r) =>
        this.helper.docRef(r)
      );
    }
    checklist.status = template.status;
    if (template.team) {
      checklist.team = this.helper.docRef(template.team);
    }
    return checklist;
  }

  templateitemToChecklistitem(templateitem): Checklistitem {
    // console.log("templateToChecklist:", templateitem);
    let checklistitem = {} as Checklistitem;
    if (templateitem.name) {
      checklistitem.name = templateitem.name;
    } else {
      checklistitem.name = "[Missing Name!]";
    }
    if (templateitem.description) {
      checklistitem.description = templateitem.description;
    } else {
      checklistitem.description = "";
    }
    if (templateitem.sequence) {
      checklistitem.sequence = templateitem.sequence;
    } else {
      checklistitem.sequence = 100;
    }
    if (templateitem.activities) {
      checklistitem.activities = templateitem.activities?.map((a) =>
        this.helper.docRef(a)
      );
    }
    checklistitem.allowNA = templateitem.allowNA;
    if (templateitem.requireEvidence) {
      checklistitem.requireEvidence = templateitem.requireEvidence;
    } else {
      checklistitem.requireEvidence = false;
    }

    checklistitem.resultType = templateitem.resultType;
    if (templateitem.resources) {
      checklistitem.resources = templateitem.resources?.map((r) =>
        this.helper.docRef(r)
      );
    }
    if (templateitem.tagId) {
      checklistitem.tagId = templateitem.tagId;
    } else {
      checklistitem.tagId = "";
    }
    return checklistitem;
  }
}
