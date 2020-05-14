import { ChecklistitemResultValue } from "./../models/checklistitem.model";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ChecklistService } from "../services/checklist.service";
import { ResourceService } from "../services/resource.service";
import { MatDialog } from "@angular/material/dialog";
import {
  Checklist,
  ChecklistStatus,
  ChecklistStatusInfoItem,
  ChecklistStatusInfo,
} from "../models/checklist.model";
import { Observable } from "rxjs";
import { Resource } from "../models/resource.model";
import { UserRef, DocRef } from "../models/helper.model";
import { Checklistitem } from "../models/checklistitem.model";
import { ChecklistitemService } from "../services/checklistitem.service";
import { CheckliststatusdialogComponent } from "../dialogs/checkliststatusdialog/checkliststatusdialog.component";

@Component({
  selector: "app-checklist",
  templateUrl: "./checklist.component.html",
  styleUrls: ["./checklist.component.scss"],
})
export class ChecklistComponent implements OnInit {
  checklist: Checklist;
  resources$: Observable<Resource[]>;
  checklistitems$: Observable<Checklistitem[]>;
  displayedColumns: string[] = ["name", "resultType"];

  constructor(
    private route: ActivatedRoute,
    private checklistService: ChecklistService,
    private checklistitemService: ChecklistitemService,
    private resourceService: ResourceService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.checklist = this.route.snapshot.data["checklist"];
    this.checklistitems$ = this.checklistitemService.findAll(this.checklist.id);
    if (this.checklist.resources) {
      this.resources$ = this.resourceService.findAllIn(
        this.checklist.resources.map((r) => r.id)
      );
    }
  }

  userRefToDocRef(userRef: UserRef[]): DocRef[] {
    return userRef.map((a) => {
      return { id: a.uid, name: a.displayName };
    });
  }

  getFlatDocRefArray(docRefArray: DocRef[]): string {
    if (docRefArray) {
      return docRefArray.reduce((accumulator, docRef, index) => {
        return (accumulator += (index == 0 ? "" : ", ") + docRef.name);
      }, "");
    }
    return "None";
  }

  getChecklistStatusInfoItem(status: ChecklistStatus): ChecklistStatusInfoItem {
    return ChecklistStatusInfo.find((clsii) => clsii.status == status);
  }

  statusDialog() {
    console.log("statusDialog");
    const dialogRef = this.dialog.open(CheckliststatusdialogComponent, {
      width: "90%",
      minWidth: "340px",
      maxWidth: "600px",
      data: { checklist: this.checklist },
    });
    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     console.log("New Owner", result);
    //     const userRef: UserRef = {
    //       uid: result.uid,
    //       displayName: result.displayName,
    //     };
    //     this.resourceService.fieldUpdate(this.resource.id, "owner", userRef);
    //     this.resource.owner = userRef;
    //   }
    // });
  }

  getResultValueName(value: ChecklistitemResultValue): string {
    switch (value) {
      case undefined:
        return "...";
      case ChecklistitemResultValue.NA:
        return "N/A";
      case ChecklistitemResultValue.false:
        return "No";
      case ChecklistitemResultValue.true:
        return "Yes";
      case ChecklistitemResultValue.low:
        return "1: Low";
      case ChecklistitemResultValue.mediumLow:
        return "2: Medium Low";
      case ChecklistitemResultValue.medium:
        return "3: Medium";
      case ChecklistitemResultValue.mediumHigh:
        return "4: Medium High";
      case ChecklistitemResultValue.high:
        return "5: High";
    }
  }
}
