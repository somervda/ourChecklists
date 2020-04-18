import { Component, OnInit, NgZone } from "@angular/core";
import {
  Resource,
  ResourceType,
  ResourceStatus,
  ResourceTypeInfo,
} from "../models/resource.model";
import { Crud } from "../models/helper.model";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ResourceService } from "../services/resource.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../services/auth.service";
import { Subscription } from "rxjs";

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
  ResourceTypeInfo = ResourceTypeInfo;
  ResourceType = ResourceType;

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
    this.crudAction = Crud.Update;
    if (this.route.routeConfig.path == "resource/delete/:id")
      this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "resource/create")
      this.crudAction = Crud.Create;

    // console.log("category onInit", this.crudAction);
    if (this.crudAction == Crud.Create) {
      this.resource = {
        name: "",
        description: "",
        owner: {
          uid: this.auth.currentUser.uid,
          displayName: this.auth.currentUser.displayName,
        },
        resourceType: ResourceType.url,
        content: "",
        status: ResourceStatus.active,
      };
      console.log("resource:", this.resource);
    } else {
      this.resource = this.route.snapshot.data["resource"];
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
      resourceType: [this.resource.resourceType],
      content: [this.resource.content],
    });
    this.setContentValidators(this.resource.resourceType);
    // Mark all fields as touched to trigger validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.resourceForm.controls) {
        this.resourceForm.get(field).markAsTouched();
      }
    }
  }

  setContentValidators(resourceType: ResourceType) {
    console.log("setContentValidators", resourceType);
    switch (resourceType) {
      case ResourceType.url:
        const regURL = "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?";
        this.resourceForm.controls["content"].setValidators([
          Validators.required,
          Validators.pattern(regURL),
        ]);
        break;
      case ResourceType.youtubeId:
        const regYouTubeId = "^([A-Za-z0-9_-]{11})$";
        this.resourceForm.controls["content"].setValidators([
          Validators.required,
          Validators.pattern(regYouTubeId),
        ]);
        break;
      case ResourceType.markdown:
        this.resourceForm.controls["content"].setValidators([
          Validators.required,
          Validators.maxLength(10000),
        ]);
        break;
    }
  }

  onCreate() {
    // console.log("create resource", this.resource);
    for (const field in this.resourceForm.controls) {
      this.resource[field] = this.resourceForm.get(field).value;
    }

    this.resourceService
      .create(this.resource)
      .then((newDoc) => {
        this.crudAction = Crud.Update;
        this.snackBar.open(
          "Resource '" + this.resource.name + "' created.",
          "",
          {
            duration: 2000,
          }
        );
        this.resource.id = newDoc.id;
        this.ngZone.run(() => this.router.navigateByUrl("/resources"));
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.resource.name, error);
      });
  }

  onDelete() {
    // console.log("delete", this.resource.id);
    const name = this.resource.name;
    this.resourceService
      .delete(this.resource.id)
      .then(() => {
        this.snackBar.open("Resource '" + name + "' deleted!", "", {
          duration: 2000,
        });
        this.ngZone.run(() => this.router.navigateByUrl("/resources"));
      })
      .catch(function (error) {
        console.error("Error deleting resource: ", error);
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
    // special code to apply values during create
    if (this.crudAction == Crud.Create) {
      this.resource[fieldName] = this.resourceForm.get(fieldName).value;
    }
  }

  ngOnDestroy() {
    if (this.resourceSubscription$$) this.resourceSubscription$$.unsubscribe();
  }
}
