import { Component, OnInit, Inject } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist, ChecklistStatus } from "src/app/models/checklist.model";
import { ChecklistService } from "src/app/services/checklist.service";
import { map } from "rxjs/operators";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DocInfo } from "src/app/models/checklistextract.model";

@Component({
  selector: "app-templateselectordialog",
  templateUrl: "./templateselectordialog.component.html",
  styleUrls: ["./templateselectordialog.component.scss"],
})
export class TemplateselectordialogComponent implements OnInit {
  templates$: Observable<Checklist[]>;
  selectedTemplate = { id: "0", name: "All" };

  constructor(
    private checklistService: ChecklistService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TemplateselectordialogComponent>
  ) {}

  ngOnInit(): void {
    // Get templates
    this.templates$ = this.checklistService.findAllTemplates(100).pipe(
      map((c) => {
        return c.filter((cf) => cf.status != ChecklistStatus.Deleted);
      })
    );
    console.log("this.data[selectedTemplate]", this.data);
    if (this.data.selectedTemplate) {
      this.selectedTemplate = this.data.selectedTemplate;
    }
  }

  onTemplateSelected(template) {
    console.log("onTemplateSelected:", template);
    this.selectedTemplate = template;
  }

  returnTemplateInfo() {
    this.dialogRef.close(this.selectedTemplate);
  }
}
