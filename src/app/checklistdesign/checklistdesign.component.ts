import { HelperService } from "./../services/helper.service";
import { OnDestroy } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { Checklist, ChecklistStatus } from "../models/checklist.model";
import { Crud } from "../models/helper.model";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Subscription, Observable } from "rxjs";
import { ChecklistService } from "../services/checklist.service";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { Team } from "../models/team.model";
import { TeamService } from "../services/team.service";
import { Category } from "../models/category.model";
import { CategoryService } from "../services/category.service";
import { MatDialog } from "@angular/material/dialog";
import { User } from "../models/user.model";
import { first } from "rxjs/operators";
import * as firebase from "firebase";
import { DocumentReference } from "@angular/fire/firestore";
import { ChecklistitemService } from "../services/checklistitem.service";

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
  myteams$: Observable<Team[]>;
  categories$: Observable<Category[]>;
  ChecklistStatus = ChecklistStatus;

  constructor(
    private checklistService: ChecklistService,
    private teamService: TeamService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private auth: AuthService,
    public dialog: MatDialog,
    public helper: HelperService
  ) {}

  ngOnInit() {
    this.auth.user$
      .pipe(first())
      .toPromise()
      .then((u) => this.initProcesses(u));
  }

  initProcesses(user: User) {
    console.log("initProcesses", user);
    if (user.isAdmin) {
      this.myteams$ = this.teamService.findAll(100);
    } else {
      this.myteams$ = this.teamService.findMyMemberManagerOfTeams();
    }
    this.categories$ = this.categoryService.findAll(100);
    this.crudAction = Crud.Update;
    // if (this.route.routeConfig.path == "category/delete/:id")
    //   this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "checklistdesign/create")
      this.crudAction = Crud.Create;

    // console.log("category onInit", this.crudAction);
    if (this.crudAction == Crud.Create) {
      console.log("Checklistdesign create");
      this.checklist = {
        name: "",
        description: "",
        isTemplate: false,
        status: ChecklistStatus.UnderConstruction,
        team: null,
        assignee: [this.helper.docRef(`users/${user.uid}`)],
        category: null,
        dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
      };
    } else {
      this.checklist = this.route.snapshot.data["checklist"];
      console.log("update checklist:", this.checklist);
      this.checklistSubscription$$ = this.checklistService
        .findById(this.checklist.id)
        .subscribe((checklist) => {
          this.checklist = checklist;
          // console.log("subscribed checklist", this.checklist);
          this.checklistForm.patchValue(this.checklist);
        });
    }

    // Create form group and initialize with probe values
    console.log("this.checklist", this.checklist);
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
      comments: [this.checklist.comments, [Validators.maxLength(500)]],
      team: [this.checklist.team],
      category: [this.checklist.category],
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
        this.checklist.id = newDoc.id;
        this.helper.snackbar(
          "Checklist '" + this.checklist.name + "' created.",
          2000
        );
        this.helper.redirect("/checklistdesign/" + this.checklist.id);
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.checklist.name, error);
      });
  }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (
      this.checklistForm.get(fieldName).valid &&
      this.crudAction == Crud.Update
    ) {
      let newValue = this.checklistForm.get(fieldName).value;
      this.checklistService.fieldUpdate(this.checklist.id, fieldName, newValue);
    }
  }

  onAssigneeChange(assignee: DocumentReference[]) {
    console.log("onAssigneeChange assignee:", assignee);
    this.checklist.assignee = assignee;
    if (this.crudAction == Crud.Update) {
      this.checklistService.fieldUpdate(
        this.checklist.id,
        "assignee",
        this.checklist.assignee
      );
    }
  }

  onResourcesChange(resources: DocumentReference[]) {
    console.log("onResourcesChange", resources);
    this.checklist.resources = resources;
    if (this.crudAction == Crud.Update) {
      this.checklistService.fieldUpdate(
        this.checklist.id,
        "resources",
        this.checklist.resources
      );
    }
  }

  objectComparisonFunction = function (
    option: DocumentReference,
    value: DocumentReference
  ): boolean {
    // Needed to compare objects in select drop downs
    // console.log("compare", option, value);
    return option?.path == value?.path;
  };

  onTeamChange(event) {
    console.log("onTeamChange: ", event);
    this.checklist.team = event.value;
    if (this.crudAction == Crud.Update) {
      this.checklistService.fieldUpdate(
        this.checklist.id,
        "team",
        this.checklist.team
      );
    }
  }

  onCategoryChange(event) {
    console.log("onCategoryChange: ", event);
    this.checklist.category = event.value;
    if (this.crudAction == Crud.Update) {
      this.checklistService.fieldUpdate(
        this.checklist.id,
        "category",
        this.checklist.category
      );
    }
  }

  async waitForCurrentUser() {
    let waitMS = 5000;
    console.log("waitForCurrentUser");
    while (!this.auth.currentUser && waitMS > 0) {
      console.log("Waiting for user to show up!");
      await this.sleep(200);
      waitMS -= 200;
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  ngOnDestroy() {
    if (this.checklistSubscription$$)
      this.checklistSubscription$$.unsubscribe();
  }
}
