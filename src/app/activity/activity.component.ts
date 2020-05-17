import { Component, OnInit, NgZone } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../services/auth.service";
import { Crud } from "../models/helper.model";
import { Activity } from "../models/activity.model";
import { ActivityService } from "../services/activity.service";

@Component({
  selector: "app-activity",
  templateUrl: "./activity.component.html",
  styleUrls: ["./activity.component.scss"],
})
export class ActivityComponent implements OnInit {
  activity: Activity;
  categoryId: string;
  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;

  activityForm: FormGroup;
  activity$$: Subscription;

  constructor(
    private activityService: ActivityService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngOnInit() {
    this.crudAction = Crud.Update;
    if (this.route.routeConfig.path == "category/:cid/activity/delete/:aid")
      this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "category/:cid/activity/create")
      this.crudAction = Crud.Create;

    //   // console.log("category onInit", this.crudAction);
    this.categoryId = this.route.snapshot.paramMap.get("cid");

    this.activity = {
      name: "",
      description: "",
    };
    if (this.crudAction != Crud.Create) {
      const aid = this.route.snapshot.paramMap.get("aid");
      console.log("!create:", this.categoryId, aid);
      this.activity$$ = this.activityService
        .findById(this.categoryId, aid)
        .subscribe((activity) => {
          this.activity = activity;
          console.log("this.activity", this.activity);
          this.activityForm.patchValue(this.activity);
        });
    }

    // Create form group and initialize with probe values
    this.activityForm = this.fb.group({
      name: [
        this.activity.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
        ],
      ],
      description: [
        this.activity.description,
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(150),
        ],
      ],
    });

    // Mark all fields as touched to trigger validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.activityForm.controls) {
        this.activityForm.get(field).markAsTouched();
      }
    }
  }

  onCreate() {
    // console.log("create probe", this.probe);
    for (const field in this.activityForm.controls) {
      this.activity[field] = this.activityForm.get(field).value;
    }

    this.activityService
      .create(this.categoryId, this.activity)
      .then((newDoc) => {
        this.snackBar.open(
          "Activity '" + this.activity.name + "' created.",
          "",
          {
            duration: 2000,
          }
        );
        this.ngZone.run(() =>
          this.router.navigateByUrl("/category/" + this.categoryId)
        );
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.category.name, error);
      });
  }

  onDelete() {
    // console.log("delete", this.probe.id);

    const name = this.activity.name;
    this.activityService
      .delete(this.categoryId, this.activity.id)
      .then(() => {
        this.snackBar.open("Activity '" + name + "' deleted!", "", {
          duration: 2000,
        });
        this.ngZone.run(() =>
          this.router.navigateByUrl("/category/" + this.categoryId)
        );
      })
      .catch(function (error) {
        console.error("Error deleting activity: ", error);
      });
  }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (
      this.activityForm.get(fieldName).valid &&
      this.activity.id != "" &&
      this.crudAction != Crud.Delete
    ) {
      let newValue = this.activityForm.get(fieldName).value;
      this.activityService.fieldUpdate(
        this.categoryId,
        this.activity.id,
        fieldName,
        newValue
      );
    }
  }

  ngOnDestroy() {
    if (this.activity$$) this.activity$$.unsubscribe();
  }
}
