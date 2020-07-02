import { Component, OnInit, OnDestroy } from "@angular/core";
import { ChecklistService } from "../services/checklist.service";
import { HelperService } from "../services/helper.service";
import { ChecklistStatus, Checklist } from "../models/checklist.model";
import { Observable, Subscription } from "rxjs";
import { ChecklistitemService } from "../services/checklistitem.service";
import { first } from "rxjs/operators";
import { DocumentReference } from "@angular/fire/firestore";
import { coerceCssPixelValue } from "@angular/cdk/coercion";

@Component({
  selector: "app-adminutils",
  templateUrl: "./adminutils.component.html",
  styleUrls: ["./adminutils.component.scss"],
})
export class AdminutilsComponent implements OnInit, OnDestroy {
  showSpinner = false;
  deletedChecklists$: Observable<Checklist[]>;
  deletedChecklists$$: Subscription;
  deletedChecklists: Checklist[];

  removedResources: DocumentReference[] = [];
  checklists$$: Subscription;

  constructor(
    private checklistService: ChecklistService,
    private checklistitemService: ChecklistitemService,
    private helper: HelperService
  ) {}

  ngOnInit(): void {}

  async checklistCleanup() {
    this.showSpinner = true;
    this.deletedChecklists = [];
    this.deletedChecklists$ = this.checklistService.search(
      ChecklistStatus.Deleted,
      this.helper.docRef("/categories/0"),
      this.helper.docRef("/teams/0"),
      this.helper.docRef("/checklists/0"),
      100
    );
    // Delete checklists
    this.deletedChecklists$$ = await this.deletedChecklists$
      .pipe(first())
      .subscribe((checklists) =>
        checklists.map((checklist) => {
          this.deletedChecklists.push({ ...checklist });
          this.deleteChecklist(checklist);
        })
      );
    this.showSpinner = false;
  }

  async deleteChecklist(checklist: Checklist) {
    await this.checklistitemService
      .findAll(checklist.id)
      .pipe(first())
      .toPromise()
      .then((cis) => this.checklistService.deleteChecklist(checklist, cis))
      .then(() => {
        console.log("deleteChecklist:", checklist.id);
      });
  }

  async resourceCleanup() {
    this.showSpinner = true;
    console.log("Cleaning up resources");
    this.removedResources = [];
    this.checklists$$ = await this.checklistService
      .findAll(10000)
      .pipe(first())
      .subscribe((checklists) =>
        checklists.map((checklist) => this.cleanUpChecklistResources(checklist))
      );
    this.showSpinner = false;
  }

  cleanUpChecklistResources(checklist: Checklist) {
    if (checklist.resources) {
      checklist.resources.map((resource) =>
        this.cleanUpChecklistResource(checklist, resource)
      );
    }
  }

  cleanUpChecklistResource(checklist: Checklist, resource: DocumentReference) {
    resource.get().then((doc) => {
      if (!doc.exists) {
        const resources = checklist.resources.filter((r) => r != resource);
        console.log("remove:", checklist.id, checklist.resources, resources);
        this.removedResources.push(resource);
        this.checklistService.fieldUpdate(checklist.id, "resources", resources);
      }
    });
  }

  ngOnDestroy() {
    if (this.deletedChecklists$$) {
      this.deletedChecklists$$.unsubscribe();
    }
    if (this.checklists$$) {
      this.checklists$$.unsubscribe();
    }
  }
}
