import { OnDestroy, NgZone } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { Checklist, ChecklistStatus } from "../models/checklist.model";
import { Crud } from "../models/helper.model";
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

  constructor(
    private checklistService: ChecklistService,
    private teamService: TeamService,
    private categoryService: CategoryService,
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
    if (this.auth.currentUser.isAdmin) {
      this.myteams$ = this.teamService.findAll(100);
    } else {
      this.myteams$ = this.teamService.findMyMemberManagerOfTeams();
    }
    this.categories$ = this.categoryService.findAll(100);
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
      this.checklist.id != "" &&
      this.crudAction != Crud.Delete
    ) {
      let newValue = this.checklistForm.get(fieldName).value;
      this.checklistService.fieldUpdate(this.checklist.id, fieldName, newValue);
    }
  }

  objectComparisonFunction = function (option, value): boolean {
    // Needed to compare objects in select dropdowns
    // console.log("objectComparisonFunction", option, value);
    return option.id === value.id;
  };

  onTeamChange(event) {
    console.log("onTeamChange: ", event);
    const newTeam = event.value;
    // console.log("onTeamChange form:", this.checklistForm);
    if (this.crudAction == Crud.Update) {
      this.checklistService.fieldUpdate(this.checklist.id, "team", newTeam);
    }
  }

  onCategoryChange(event) {
    console.log("onCategoryChange: ", event);
    const newCategory = event.value;
    if (this.crudAction == Crud.Update) {
      this.checklistService.fieldUpdate(
        this.checklist.id,
        "category",
        newCategory
      );
    }
  }

  ngOnDestroy() {
    if (this.checklistSubscription$$)
      this.checklistSubscription$$.unsubscribe();
  }
}
