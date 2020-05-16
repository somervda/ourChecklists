import {
  Checklistitem,
  ChecklistitemResultValue,
  ChecklistitemResultType,
} from "./../models/checklistitem.model";
import { Component, OnInit, OnDestroy, NgZone } from "@angular/core";
import { Crud, DocRef } from "../models/helper.model";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Subscription, Observable } from "rxjs";
import { ChecklistitemService } from "../services/checklistitem.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../services/auth.service";
import { Checklist } from "../models/checklist.model";
import { ChecklistService } from "../services/checklist.service";
import * as firebase from "firebase";

@Component({
  selector: "app-checklistitemdesign",
  templateUrl: "./checklistitemdesign.component.html",
  styleUrls: ["./checklistitemdesign.component.scss"],
})
export class ChecklistitemdesignComponent implements OnInit, OnDestroy {
  checklistitem: Checklistitem;
  checklist$: Observable<Checklist>;
  maxSeq$$: Subscription;
  cid: string;
  clid: string;
  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;

  checklistitemForm: FormGroup;
  checklistitemSubscription$$: Subscription;
  ChecklistitemResultType = ChecklistitemResultType;

  constructor(
    private checklistitemService: ChecklistitemService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private router: Router,
    private auth: AuthService,
    private checklistService: ChecklistService
  ) {}

  async ngOnInit() {
    await this.waitForCurrentUser();
    this.cid = this.route.snapshot.paramMap.get("cid");
    this.checklist$ = this.checklistService.findById(this.cid);

    console.log(
      "ChecklistitemdesignComponent",
      this.cid,
      this.route.snapshot.paramMap.get("clid")
    );
    this.crudAction = Crud.Update;
    console.log("route path", this.route.routeConfig.path);
    if (
      this.route.routeConfig.path ==
      "checklist/:cid/checklistitemdesign/:clid/delete"
    )
      this.crudAction = Crud.Delete;
    if (
      this.route.routeConfig.path == "checklist/:cid/checklistitemdesign/create"
    )
      this.crudAction = Crud.Create;

    // console.log("category onInit", this.crudAction);
    if (this.crudAction == Crud.Create) {
      this.checklistitem = {
        name: "",
        description: "",
        sequence: 10,
        allowNA: false,
        requireEvidence: false,
        resultType: ChecklistitemResultType.checkbox,
        dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
      };
      // Code to work out what the next sequence number should be to add the
      // new checklistitem to the end of the list
      this.maxSeq$$ = this.checklistitemService
        .findMaxSequence(this.cid)
        .subscribe((c) => {
          if (c[0]) {
            console.log(
              "getHighestSequence",
              this.checklistitem.sequence,
              c[0]
            );
            this.checklistitem.sequence = c[0].sequence + 10;
            this.checklistitemForm.patchValue(this.checklistitem);
          }
        });
    } else {
      this.checklistitem = this.route.snapshot.data["checklistitem"];
      this.clid = this.route.snapshot.paramMap.get("clid");
      this.checklistitemSubscription$$ = this.checklistitemService
        .findById(this.cid, this.clid)
        .subscribe((checklistitem) => {
          this.checklistitem = checklistitem;
          // console.log("subscribed category", this.category);
          this.checklistitemForm.patchValue(this.checklistitem);
        });
    }

    // Create form group and initialize with probe values
    this.checklistitemForm = this.fb.group({
      name: [
        this.checklistitem.name,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(160),
        ],
      ],
      description: [
        this.checklistitem.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      sequence: [this.checklistitem.sequence, [Validators.required]],
    });

    // Mark all fields as touched to trigger validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.checklistitemForm.controls) {
        this.checklistitemForm.get(field).markAsTouched();
      }
    }
  }

  onCreate() {
    console.log("onCreate", this.checklistitem);
    for (const field in this.checklistitemForm.controls) {
      if (field == "sequence") {
        this.checklistitem[field] = parseFloat(
          this.checklistitemForm.get(field).value
        );
      } else {
        this.checklistitem[field] = this.checklistitemForm.get(field).value;
      }
    }

    this.checklistitemService
      .create(this.cid, this.checklistitem)
      .then((newDoc) => {
        this.crudAction = Crud.Update;
        this.snackBar.open(
          "Checklistitem '" + this.checklistitem.name + "' created.",
          "",
          {
            duration: 2000,
          }
        );
        this.checklistitem.id = newDoc.id;
        this.ngZone.run(() =>
          this.router.navigateByUrl("/checklistdesign/" + this.cid)
        );
      })
      .catch(function (error) {
        console.error(
          "Error adding document: ",
          this.checklistitem.name,
          error
        );
      });
  }

  onDelete() {
    // console.log("delete", this.checklistitem.id);
    // const teamId = this.checklistitem.id;
    const name = this.checklistitem.name;
    this.checklistitemService
      .delete(this.cid, this.clid)
      .then(() => {
        this.snackBar.open("Checklistitem '" + name + "' deleted!", "", {
          duration: 2000,
        });
        this.ngZone.run(() =>
          this.router.navigateByUrl("/checklistdesign/" + this.cid)
        );
      })
      .catch(function (error) {
        console.error("Error deleting checklistitem: ", error);
      });
  }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (
      this.checklistitemForm.get(fieldName).valid &&
      this.crudAction == Crud.Update
    ) {
      let newValue = this.checklistitemForm.get(fieldName).value;
      if (toType == "number") {
        newValue = parseFloat(this.checklistitemForm.get(fieldName).value);
      }
      this.checklistitemService.fieldUpdate(
        this.cid,
        this.clid,
        fieldName,
        newValue
      );
    }
  }

  onActivitiesChange(activities: DocRef[]) {
    console.log("onActivitiesChange", activities);
    this.checklistitem.activities = activities;
    if (this.crudAction == Crud.Update) {
      this.checklistitemService.fieldUpdate(
        this.cid,
        this.clid,
        "activities",
        activities
      );
    }
  }

  onResourcesChange(resources: DocRef[]) {
    console.log("onResourcesChange", resources);
    this.checklistitem.resources = resources;
    if (this.crudAction == Crud.Update) {
      this.checklistitemService.fieldUpdate(
        this.cid,
        this.clid,
        "resources",
        resources
      );
    }
  }

  flatDocRefArray(docRefArray: DocRef[]): string {
    if (docRefArray) {
      return docRefArray.reduce((accumulator, docRef, index) => {
        return (accumulator += (index == 0 ? "" : ", ") + docRef.name);
      }, "");
    }
    return "None";
  }

  updateResultType() {
    console.log("updateResultType");
    if (this.crudAction == Crud.Update) {
      this.checklistitemService.fieldUpdate(
        this.cid,
        this.clid,
        "resultType",
        this.checklistitem.resultType
      );
    }
  }

  updateAllowNA() {
    console.log("updateAllowNA");
    if (this.crudAction == Crud.Update) {
      this.checklistitemService.fieldUpdate(
        this.cid,
        this.clid,
        "allowNA",
        this.checklistitem.allowNA
      );
    }
  }

  updateRequireEvidence() {
    console.log("updateRequireEvidence");
    if (this.crudAction == Crud.Update) {
      this.checklistitemService.fieldUpdate(
        this.cid,
        this.clid,
        "requireEvidence",
        this.checklistitem.requireEvidence
      );
    }
  }

  ngOnDestroy() {
    if (this.checklistitemSubscription$$)
      this.checklistitemSubscription$$.unsubscribe();
    if (this.maxSeq$$) {
      this.maxSeq$$.unsubscribe();
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
