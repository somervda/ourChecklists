import { HelperService } from "./../services/helper.service";
import { OnDestroy, NgZone } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import {
  Checklist,
  ChecklistStatus,
  ChecklistStatusInfoItem,
  ChecklistStatusInfo,
} from "../models/checklist.model";
import { Crud, DocRef, UserRef } from "../models/helper.model";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Subscription, Observable } from "rxjs";
import { ChecklistService } from "../services/checklist.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../services/auth.service";
import { Team } from "../models/team.model";
import { TeamService } from "../services/team.service";
import { Category } from "../models/category.model";
import { CategoryService } from "../services/category.service";
import { Resource } from "../models/resource.model";
import { ResourceService } from "../services/resource.service";
import { CheckliststatusdialogComponent } from "../dialogs/checkliststatusdialog/checkliststatusdialog.component";
import { MatDialog } from "@angular/material/dialog";

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
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private router: Router,
    private auth: AuthService,
    public dialog: MatDialog,
    public helper: HelperService
  ) {}

  async ngOnInit() {
    await this.waitForCurrentUser();
    console.log(
      "this.route.snapshot.paramMap.get('id')",
      this.route.snapshot.paramMap.get("id")
    );
    if (this.auth.currentUser.isAdmin) {
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
      console.log("update checklist:", this.checklist);
      this.checklistSubscription$$ = this.checklistService
        .findById(this.checklist.id)
        .subscribe((checklist) => {
          this.checklist = checklist;
          // console.log("subscribed checklist", this.checklist);
          this.checklistForm.patchValue(this.checklist);
        });
    }

    // this.resources$ = this.resourceService.findAllIn(
    //   this.checklist.resources.map((r) => r.id)
    // );

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
      comments: [this.checklist.comments, [Validators.maxLength(500)]],
      team: [{ id: this.checklist.team.id, name: this.checklist.team.name }],
      category: [
        { id: this.checklist.category.id, name: this.checklist.category.name },
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
      this.crudAction == Crud.Update
    ) {
      let newValue = this.checklistForm.get(fieldName).value;
      this.checklistService.fieldUpdate(this.checklist.id, fieldName, newValue);
    }
  }

  onAssigneeChange(assignee: UserRef[]) {
    console.log("onAssigneeChange", assignee);
    this.checklist.assignee = assignee;
    if (this.crudAction == Crud.Update) {
      this.checklistService.fieldUpdate(
        this.checklist.id,
        "assignee",
        this.checklist.assignee
      );
    }
  }

  onResourcesChange(resources: Resource[]) {
    console.log("onResourcesChange", resources);
    this.checklist.resources = resources.map((r) => {
      return { id: r.id, name: r.name };
    });
    if (this.crudAction == Crud.Update) {
      this.checklistService.fieldUpdate(
        this.checklist.id,
        "resources",
        this.checklist.resources
      );
    }
  }

  objectComparisonFunction = function (option, value): boolean {
    // Needed to compare objects in select dropdowns
    // console.log("objectComparisonFunction", option, value);
    return option.id === value.id;
  };

  onTeamChange(teamRef: DocRef) {
    console.log("onTeamChange: ", event);
    this.checklist.team = teamRef;
    // console.log("onTeamChange form:", this.checklistForm);
    if (this.crudAction == Crud.Update) {
      this.checklistService.fieldUpdate(
        this.checklist.id,
        "team",
        this.checklist.team
      );
    }
  }

  onCategoryChange(categoryRef: DocRef) {
    console.log("onCategoryChange: ", event);
    this.checklist.category = categoryRef;
    if (this.crudAction == Crud.Update) {
      this.checklistService.fieldUpdate(
        this.checklist.id,
        "category",
        this.checklist.category
      );
    }
  }

  statusDialog() {
    console.log("statusDialog");
    const dialogRef = this.dialog.open(CheckliststatusdialogComponent, {
      width: "350px",
      data: { checklist: this.checklist },
    });
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

  ngOnDestroy() {
    if (this.checklistSubscription$$)
      this.checklistSubscription$$.unsubscribe();
  }
}
