import { Component, OnInit, OnDestroy } from "@angular/core";
import { ChecklistService } from "../services/checklist.service";
import { HelperService } from "../services/helper.service";
import { ChecklistStatus, Checklist } from "../models/checklist.model";
import { Observable, Subscription } from "rxjs";
import { ChecklistitemService } from "../services/checklistitem.service";
import { first } from "rxjs/operators";
import { DocumentReference } from "@angular/fire/firestore";
import { coerceCssPixelValue } from "@angular/cdk/coercion";
import { Checklistitem } from "../models/checklistitem.model";

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
  removedItemResources: DocumentReference[] = [];
  checklistitems$$: Subscription;

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
    // Clean up checklists
    this.checklists$$ = await this.checklistService
      .findAll(10000)
      .pipe(first())
      .subscribe((checklists) =>
        checklists.map((checklist) => this.cleanUpChecklistResources(checklist))
      );
    // Clean up checklistitems
    console.log("cleanUpChecklistitemResources");
    this.checklistitems$$ = await this.checklistitemService
      .findAll2(10000)
      .pipe(first())
      .subscribe((checklistitems) =>
        checklistitems.map((checklistitem) =>
          this.cleanUpChecklistitemResources(checklistitem)
        )
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

  /**
   * Will scan the resources used on checklist Items and fix any problems
   * Uses a special index over checklistitems to do this
   *
   * @param checklistitem
   */
  cleanUpChecklistitemResources(checklistitem: Checklistitem) {
    console.log("cleanUpChecklistitemResources:", checklistitem);
    if (checklistitem.resources) {
      checklistitem.resources.map((resource) =>
        this.cleanUpChecklistitemResource(checklistitem, resource)
      );
    }
  }

  cleanUpChecklistitemResource(
    checklistitem: Checklistitem,
    resource: DocumentReference
  ) {
    resource.get().then((doc) => {
      if (!doc.exists) {
        const resources = checklistitem.resources.filter((r) => r != resource);
        console.log(
          "remove:",
          checklistitem.id,
          checklistitem.resources,
          checklistitem.parent_id,
          resources
        );
        this.removedItemResources.push(resource);
        this.checklistitemService.fieldUpdate(
          checklistitem.parent_id,
          checklistitem.id,
          "resources",
          resources
        );
      }
    });
  }

  ctCleanup() {}

  ngOnDestroy() {
    if (this.deletedChecklists$$) {
      this.deletedChecklists$$.unsubscribe();
    }
    if (this.checklists$$) {
      this.checklists$$.unsubscribe();
    }
    if (this.checklistitems$$) {
      this.checklistitems$$.unsubscribe();
    }
  }
}
