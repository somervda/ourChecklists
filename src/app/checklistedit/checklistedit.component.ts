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
import { DocRef, UserRef } from "../models/helper.model";
import { MatDialog } from "@angular/material/dialog";
import { CheckliststatusdialogComponent } from "../dialogs/checkliststatusdialog/checkliststatusdialog.component";
import { AuthService } from "../services/auth.service";
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
    private auth: AuthService,
    public helper: HelperService,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    await this.waitForCurrentUser();
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
      width: "350px",
      data: { checklist: this.checklist },
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

  async waitForCurrentUser() {
    let waitMS = 5000;
    while (!this.auth.currentUser && waitMS > 0) {
      console.log("Waiting for user to show up!");
      await this.sleep(200);
      waitMS -= 200;
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
