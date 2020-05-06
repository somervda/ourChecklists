import { OnDestroy, NgZone } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { Checklist, ChecklistStatus } from "../models/checklist.model";
import { Crud } from "../models/helper.model";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { ChecklistService } from "../services/checklist.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../services/auth.service";
import { ResourceStatus } from "../models/resource.model";

@Component({
  selector: "app-checklistdesign",
  templateUrl: "./checklistdesign.component.html",
  styleUrls: ["./checklistdesign.component.scss"],
})
export class ChecklistdesignComponent implements OnInit, OnDestroy {
  checklist: Checklist;
  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;

  checklistForm: FormGroup;
  checklistSubscription$$: Subscription;

  constructor(
    private checklistService: ChecklistService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    console.log(
      "this.route.snapshot.paramMap.get('id')",
      this.route.snapshot.paramMap.get("id")
    );
    this.crudAction = Crud.Update;
    // if (this.route.routeConfig.path == "category/delete/:id")
    //   this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "category/create")
      this.crudAction = Crud.Create;

    // console.log("category onInit", this.crudAction);
    if (this.crudAction == Crud.Create) {
      this.checklist = {
        name: "",
        description: "",
        isTemplate: false,
        status: ChecklistStatus.UnderConstruction,
        team: { id: "", name: "" },
        assignee: [
          {
            uid: this.auth.currentUser.uid,
            displayName: this.auth.currentUser.displayName,
          },
        ],
        category: { id: "", name: "" },
      };
    } else {
      this.checklist = this.route.snapshot.data["checklist"];
      console.log("create checklist:", this.checklist);
      this.checklistSubscription$$ = this.checklistService
        .findById(this.checklist.id)
        .subscribe((checklist) => {
          this.checklist = checklist;
          // console.log("subscribed category", this.checklist);
          this.checklistForm.patchValue(this.checklist);
        });
    }

    // Create form group and initialize with probe values
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
    });

    // Mark all fields as touched to trigger validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.checklistForm.controls) {
        this.checklistForm.get(field).markAsTouched();
      }
    }
  }

  onCreate() {
    // console.log("create probe", this.probe);
    for (const field in this.checklistForm.controls) {
      this.checklist[field] = this.checklistForm.get(field).value;
    }

    this.checklistService
      .create(this.checklist)
      .then((newDoc) => {
        this.crudAction = Crud.Update;
        this.snackBar.open(
          "Checklist '" + this.checklist.name + "' created.",
          "",
          {
            duration: 2000,
          }
        );
        this.checklist.id = newDoc.id;
        this.ngZone.run(() =>
          this.router.navigateByUrl("/checklistdesign/" + this.checklist.id)
        );
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.checklist.name, error);
      });
  }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (
      this.checklistForm.get(fieldName).valid &&
      this.checklist.id != "" &&
      this.crudAction != Crud.Delete
    ) {
      let newValue = this.checklistForm.get(fieldName).value;
      this.checklistService.fieldUpdate(this.checklist.id, fieldName, newValue);
    }
  }

  ngOnDestroy() {
    if (this.checklistSubscription$$)
      this.checklistSubscription$$.unsubscribe();
  }
}
