import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { Checklist, ChecklistStatus } from "src/app/models/checklist.model";
import { ChecklistService } from "src/app/services/checklist.service";

@Component({
  selector: "app-templateselectordialog",
  templateUrl: "./templateselectordialog.component.html",
  styleUrls: ["./templateselectordialog.component.scss"],
})
export class TemplateselectordialogComponent implements OnInit, OnDestroy {
  templates$: Observable<Checklist[]>;
  selectedTemplate = { id: "0", name: "All" };
  templateSpinner = true;

  templates: { id: string; name: string }[];
  templates$$: Subscription;

  constructor(
    private checklistService: ChecklistService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TemplateselectordialogComponent>
  ) {}

  ngOnInit(): void {
    // Use a subscription to get the template list so a spinner can be started and stopped
    this.templates$$ = this.checklistService
      .findAllTemplates(100)
      .pipe(
        map((c) => {
          return c.filter((cf) => cf.status != ChecklistStatus.Deleted);
        })
      )
      .subscribe((ts) => {
        this.templateSpinner = false;
        this.templates = ts.map((t) => {
          return { id: t.id, name: t.name };
        });
      });

    // console.log("this.data[selectedTemplate]", this.data);
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

  ngOnDestroy(): void {
    if (this.templates$$) {
      this.templates$$.unsubscribe();
    }
  }
}
