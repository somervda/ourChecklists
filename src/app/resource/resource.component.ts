import { Component, OnInit, NgZone } from "@angular/core";
import { Resource } from "../models/resource.model";
import { Crud } from "../models/helper.model";
import { FormGroup, FormBuilder } from "@angular/forms";
import { ResourceService } from "../services/resource.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-resource",
  templateUrl: "./resource.component.html",
  styleUrls: ["./resource.component.scss"],
})
export class ResourceComponent implements OnInit {
  resource: Resource;
  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;

  resourceForm: FormGroup;
  resourceSubscription$$: Subscription;

  constructor(
    private resourceService: ResourceService,
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
    if (this.route.routeConfig.path == "category/delete/:id")
      this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "category/create")
      this.crudAction = Crud.Create;

    // console.log("category onInit", this.crudAction);
    if (this.crudAction == Crud.Create) {
      this.resource = {
        name: "",
        description: "",
      };
    } else {
      this.resource = this.route.snapshot.data["category"];
      this.resourceSubscription$$ = this.resourceService
        .findById(this.resource.id)
        .subscribe((category) => {
          this.resource = category;
          // console.log("subscribed category", this.category);
          this.resourceForm.patchValue(this.resource);
        });
    }

    // Create form group and initialize with probe values
    this.resourceForm = this.fb.group({
      name: [
        this.resource.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
        ],
      ],
      description: [
        this.resource.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
    });

    // Mark all fields as touched to trigger validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.resourceForm.controls) {
        this.resourceForm.get(field).markAsTouched();
      }
    }
  }

  onCreate() {
    // console.log("create probe", this.probe);
    for (const field in this.resourceForm.controls) {
      this.resource[field] = this.resourceForm.get(field).value;
    }

    this.resourceService
      .create(this.resource)
      .then((newDoc) => {
        this.crudAction = Crud.Update;
        this.snackBar.open(
          "Category '" + this.resource.name + "' created.",
          "",
          {
            duration: 2000,
          }
        );
        this.resource.id = newDoc.id;
        this.ngZone.run(() =>
          this.router.navigateByUrl("/category/" + this.resource.id)
        );
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.category.name, error);
      });
  }

  onDelete() {
    // console.log("delete", this.probe.id);
    const teamId = this.resource.id;
    const name = this.resource.name;
    this.resourceService
      .delete(this.resource.id)
      .then(() => {
        this.snackBar.open("Category '" + name + "' deleted!", "", {
          duration: 2000,
        });
        this.ngZone.run(() => this.router.navigateByUrl("/categories"));
      })
      .catch(function (error) {
        console.error("Error deleting category: ", error);
      });
  }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (
      this.resourceForm.get(fieldName).valid &&
      this.resource.id != "" &&
      this.crudAction != Crud.Delete
    ) {
      let newValue = this.resourceForm.get(fieldName).value;
      this.resourceService.fieldUpdate(this.resource.id, fieldName, newValue);
    }
  }

  ngOnDestroy() {
    if (this.resourceSubscription$$) this.resourceSubscription$$.unsubscribe();
  }
}
