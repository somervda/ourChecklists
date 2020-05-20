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
import { CheckliststatusdialogComponent } from "../dialogs/checkliststatusdialog/checkliststatusdialog.component";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

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
      comments: [this.checklist?.comments, [Validators.maxLength(5000)]],
    });
  }

  statusDialog() {
    console.log("statusDialog");
    const dialogRef = this.dialog.open(CheckliststatusdialogComponent, {
      minWidth: "380px",
      maxWidth: "500px",
      width: "80%",
      data: { checklist: this.checklist },
      autoFocus: false,
    });
  }

  onShowAllChange(checked) {
    // console.log("onshowallchange", checked);
    this.hideDetails = !checked;
  }

  updateComments() {
    // console.log("updateComments");
    if (this.checklistForm.get("comments").valid) {
      this.checklistService.fieldUpdate(
        this.checklist.id,
        "comments",
        this.checklist.comments
      );
    }
  }
}
