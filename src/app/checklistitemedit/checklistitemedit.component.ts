import { HelperService } from "./../services/helper.service";
import { Component, OnInit } from "@angular/core";
import { Checklistitem } from "../models/checklistitem.model";
import { Observable } from "rxjs";
import { Resource } from "../models/resource.model";
import { ActivatedRoute } from "@angular/router";
import { ResourceService } from "../services/resource.service";
import { ChecklistitemService } from "../services/checklistitem.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { map } from "rxjs/operators";

@Component({
  selector: "app-checklistitemedit",
  templateUrl: "./checklistitemedit.component.html",
  styleUrls: ["./checklistitemedit.component.scss"],
})
export class ChecklistitemeditComponent implements OnInit {
  checklistitem: Checklistitem;
  checklistitem$: Observable<Checklistitem>;
  resources$: Observable<Resource[]>;
  cid: string;
  checklistitemForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private checklistitemService: ChecklistitemService,
    private resourceService: ResourceService,
    public helper: HelperService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.checklistitem = this.route.snapshot.data["checklistitem"];
    this.cid = this.route.snapshot.paramMap.get("cid");
    // Keep the checklistitem up to date in real time
    // by using an observable and an async operation on the checklistitem$ name
    // in the html template to force a subscription
    this.checklistitem$ = this.checklistitemService
      .findById(this.cid, this.checklistitem.id)
      .pipe(map((ci) => (this.checklistitem = ci)));
    if (this.checklistitem.resources) {
      this.resources$ = this.resourceService.findAllIn(
        this.checklistitem.resources.map((r) => r.id)
      );
    }

    // Create validators
    this.checklistitemForm = this.fb.group({
      comment: [this.checklistitem.comment, [Validators.maxLength(5000)]],
      evidence: [this.checklistitem.evidence, [Validators.maxLength(5000)]],
    });
  }

  updateComment() {
    // console.log("updateComment");
    if (this.checklistitemForm.get("comment").valid) {
      this.checklistitemService.fieldUpdate(
        this.cid,
        this.checklistitem.id,
        "comment",
        this.checklistitem.comment
      );
    }
  }

  updateEvidence() {
    // console.log("updateEvidence");
    if (this.checklistitemForm.get("evidence").valid) {
      this.checklistitemService.fieldUpdate(
        this.cid,
        this.checklistitem.id,
        "evidence",
        this.checklistitem.evidence
      );
    }
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
