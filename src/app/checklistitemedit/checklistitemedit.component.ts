import { Component, OnInit } from "@angular/core";
import { Checklistitem } from "../models/checklistitem.model";
import { Observable } from "rxjs";
import { Resource } from "../models/resource.model";
import { ActivatedRoute } from "@angular/router";
import { ResourceService } from "../services/resource.service";
import { ChecklistitemService } from "../services/checklistitem.service";
import { DocRef } from "../models/helper.model";

@Component({
  selector: "app-checklistitemedit",
  templateUrl: "./checklistitemedit.component.html",
  styleUrls: ["./checklistitemedit.component.scss"],
})
export class ChecklistitemeditComponent implements OnInit {
  checklistitem: Checklistitem;
  resources$: Observable<Resource[]>;
  cid: string;

  constructor(
    private route: ActivatedRoute,
    private checklistitemService: ChecklistitemService,
    private resourceService: ResourceService
  ) {}

  ngOnInit(): void {
    this.checklistitem = this.route.snapshot.data["checklistitem"];
    this.cid = this.route.snapshot.paramMap.get("cid");
    if (this.checklistitem.resources) {
      this.resources$ = this.resourceService.findAllIn(
        this.checklistitem.resources.map((r) => r.id)
      );
    }
  }

  getFlatDocRefArray(docRefArray: DocRef[]): string {
    if (docRefArray) {
      return docRefArray.reduce((accumulator, docRef, index) => {
        return (accumulator += (index == 0 ? "" : ", ") + docRef.name);
      }, "");
    }
    return "None";
  }

  updateComment() {
    // console.log("updateComment");
    this.checklistitemService.fieldUpdate(
      this.cid,
      this.checklistitem.id,
      "comment",
      this.checklistitem.comment
    );
  }

  updateEvidence() {
    // console.log("updateEvidence");
    this.checklistitemService.fieldUpdate(
      this.cid,
      this.checklistitem.id,
      "evidence",
      this.checklistitem.evidence
    );
  }

  onResultChange(resultValue, checklistitem) {
    console.log("onResultChange", resultValue, checklistitem);
    // Also update user and optionally the dateUpdateFirst value

    this.checklistitemService.fieldUpdate(
      this.cid,
      checklistitem.id,
      "resultValue",
      resultValue
    );
  }
}
