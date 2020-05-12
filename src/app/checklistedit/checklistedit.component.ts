import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  Checklist,
  ChecklistStatusInfo,
  ChecklistStatus,
  ChecklistStatusInfoItem,
} from "../models/checklist.model";
import { ChecklistService } from "../services/checklist.service";
import { ActivatedRoute } from "@angular/router";
import { ResourceService } from "../services/resource.service";
import { Observable } from "rxjs";
import { Resource } from "../models/resource.model";
import { DocRef } from "../models/helper.model";

@Component({
  selector: "app-checklistedit",
  templateUrl: "./checklistedit.component.html",
  styleUrls: ["./checklistedit.component.scss"],
})
export class ChecklisteditComponent implements OnInit {
  checklist: Checklist;
  resources$: Observable<Resource[]>;
  hideDetails = true;
  showResources = false;

  constructor(
    private route: ActivatedRoute,
    private checklistService: ChecklistService,
    private resourceService: ResourceService
  ) {}

  ngOnInit(): void {
    this.checklist = this.route.snapshot.data["checklist"];
    if (this.checklist.resources) {
      this.resources$ = this.resourceService.findAllIn(
        this.checklist.resources.map((r) => r.id)
      );
    }
  }

  getChecklistStatusInfoItem(status: ChecklistStatus): ChecklistStatusInfoItem {
    return ChecklistStatusInfo.find((clsii) => clsii.status == status);
  }

  onShowAllChange(checked) {
    // console.log("onshowallchange", checked);
    this.hideDetails = !checked;
  }

  updateComments() {
    // console.log("updateComments");
    this.checklistService.fieldUpdate(
      this.checklist.id,
      "comments",
      this.checklist.comments
    );
  }

  getFlatDocRefArray(docRefArray: DocRef[]): string {
    if (docRefArray) {
      return docRefArray.reduce((accumulator, docRef, index) => {
        return (accumulator += (index == 0 ? "" : ", ") + docRef.name);
      }, "");
    }
    return "None";
  }
}
