import {
  Checklistitem,
  ChecklistItemResultValue,
  ChecklistItemResultType,
} from "./../models/checklistitem.model";
import { Component, OnInit, OnDestroy, NgZone } from "@angular/core";
import { Crud } from "../models/helper.model";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Subscription, Observable } from "rxjs";
import { ChecklistitemService } from "../services/checklistitem.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../services/auth.service";
import { Checklist } from "../models/checklist.model";
import { ChecklistService } from "../services/checklist.service";
import { Activity } from "../models/activity.model";

@Component({
  selector: "app-checklistitemdesign",
  templateUrl: "./checklistitemdesign.component.html",
  styleUrls: ["./checklistitemdesign.component.scss"],
})
export class ChecklistitemdesignComponent implements OnInit, OnDestroy {
  checklistitem: Checklistitem;
  checklist$: Observable<Checklist>;
  cid: string;
  clid: string;
  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;

  checklistitemForm: FormGroup;
  checklistitemSubscription$$: Subscription;

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

  ngOnInit() {
    this.cid = this.route.snapshot.paramMap.get("cid");
    this.checklist$ = this.checklistService.findById(this.cid);

    console.log(
      "ChecklistitemdesignComponent",
      this.cid,
      this.route.snapshot.paramMap.get("clid")
    );
    this.crudAction = Crud.Update;
    if (
      this.route.routeConfig.path == "checklist/:cid/checklistitem/delete/:clid"
    )
      this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "checklist/:cid/checklistitem/create")
      this.crudAction = Crud.Create;

    // console.log("category onInit", this.crudAction);
    if (this.crudAction == Crud.Create) {
      this.checklistitem = {
        name: "",
        description: "",
        sequence: 0,
        allowNA: false,
        resultValue: ChecklistItemResultValue.false,
        resultType: ChecklistItemResultType.checkbox,
      };
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
    // console.log("create checklistitem", this.checklistitem);
    for (const field in this.checklistitemForm.controls) {
      this.checklistitem[field] = this.checklistitemForm.get(field).value;
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
      this.checklistitem.id != "" &&
      this.crudAction != Crud.Delete
    ) {
      let newValue = this.checklistitemForm.get(fieldName).value;
      this.checklistitemService.fieldUpdate(
        this.cid,
        this.clid,
        fieldName,
        newValue
      );
    }
  }

  onActivitiesChange(activities: Activity[]) {
    console.log("onActivitiesChange", activities);
    this.checklistitemService.fieldUpdate(
      this.cid,
      this.clid,
      "activities",
      activities
    );
  }

  activitiesString(): string {
    if (this.checklistitem.activities) {
      let activities = this.checklistitem.activities.reduce(
        (accumulator, activity, index) => {
          return (accumulator += (index == 0 ? "" : ", ") + activity.name);
        },
        ""
      );
      return activities;
    }
    return "";
  }

  ngOnDestroy() {
    if (this.checklistitemSubscription$$)
      this.checklistitemSubscription$$.unsubscribe();
  }
}
