import { HelperService } from "./../services/helper.service";
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
import { MatDialog } from "@angular/material/dialog";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

@Component({
  selector: "app-checklistedit",
  templateUrl: "./checklistedit.component.html",
  styleUrls: ["./checklistedit.component.scss"],
})
export class ChecklisteditComponent implements OnInit {
  checklist: Checklist;
  resources$: Observable<Resource[]>;
  enhanced = false;
  showResources = false;
  checklistForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private checklistService: ChecklistService,
    private resourceService: ResourceService,
    public dialog: MatDialog,
    public helper: HelperService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.checklist = this.route.snapshot.data["checklist"];
    if (this.checklist.resources) {
      this.resources$ = this.resourceService.findAllIn(
        this.checklist.resources.map((r) => r.id)
      );
    }

    // Create validators
    this.checklistForm = this.fb.group({
      name: [
        this.checklist.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(70),
        ],
      ],
      description: [
        this.checklist.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      comments: [this.checklist?.comments, [Validators.maxLength(5000)]],
    });
  }

  onEnhanced(checked) {
    // console.log("onshowallchange", checked);
    this.enhanced = checked;
  }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (this.checklistForm.get(fieldName).valid) {
      let newValue = this.checklistForm.get(fieldName).value;
      this.checklistService.fieldUpdate(this.checklist.id, fieldName, newValue);
      this.checklist[fieldName] = newValue;
    }
  }
}
