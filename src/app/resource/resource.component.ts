import { Component, OnInit } from "@angular/core";
import {
  Resource,
  ResourceType,
  ResourceStatus,
  ResourceTypeInfo,
} from "../models/resource.model";
import { Crud, DocRef, UserRef } from "../models/helper.model";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ResourceService } from "../services/resource.service";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { Subscription, Observable, timer } from "rxjs";
import { AngularFireStorage } from "@angular/fire/storage";
import { MatDialog } from "@angular/material/dialog";
import { UserselectordialogComponent } from "../dialogs/userselectordialog/userselectordialog.component";
import { TeamselectordialogComponent } from "../dialogs/teamselectordialog/teamselectordialog.component";
import { CategoryselectordialogComponent } from "../dialogs/categoryselectordialog/categoryselectordialog.component";
import { ConfirmdialogComponent } from "../dialogs/confirmdialog/confirmdialog.component";
import { HelperService } from "../services/helper.service";

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
  showSpinner = false;

  resourceForm: FormGroup;
  resourceSubscription$$: Subscription;
  ResourceTypeInfo = ResourceTypeInfo;
  ResourceStatus = ResourceStatus;
  ResourceType = ResourceType;
  fileToUpload: File;
  downloadUrl$: Observable<string>;
  isInit = true;

  constructor(
    private resourceService: ResourceService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private auth: AuthService,
    private storage: AngularFireStorage,
    public dialog: MatDialog,
    private helper: HelperService
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
        reviewer: {
          uid: this.auth.currentUser.uid,
          displayName: this.auth.currentUser.displayName,
        },
      };
      console.log("resource:", this.resource);
    } else {
      console.log("this.route.snapshot", this.route.snapshot);
      this.resource = this.route.snapshot.data["resource"];
      if (this.resource.status == ResourceStatus.superseded) {
        this.helper.snackbar(
          "This resource has been superseded. Updates not allowed.",
          3000
        );
      }
      if (
        this.resource.resourceType == ResourceType.file ||
        this.resource.resourceType == ResourceType.image
      ) {
        // get downloadUrl
        console.log(
          "getref:",
          `resources/${this.resource.id}/${this.resource.content}`
        );
        this.downloadUrl$ = this.storage
          .ref(`resources/${this.resource.id}/${this.resource.content}`)
          .getDownloadURL();
      }
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
    this.isInit = false;
  }

  setContentValidators(resourceType: ResourceType) {
    console.log("setContentValidators", resourceType);

    if (this.crudAction == Crud.Update && !this.isInit) {
      const prompt =
        "Are you sure you want to update the content type of an existing resource. The content value will be deleted and need to be reentered.";
      const dialogRef = this.dialog.open(ConfirmdialogComponent, {
        width: "300px",
        data: { heading: "Confirm", prompt: prompt },
      });
      let carryOn = false;
      dialogRef.afterClosed().subscribe((choice) => {
        if (choice) {
          this.updateContentValidator(resourceType);
          // Reset content value if changing content type
          this.resourceService.fieldUpdate(this.resource.id, "content", "");
        } else {
          this.resourceForm.controls["resourceType"].setValue(
            this.resource.resourceType
          );
        }
      });
    } else {
      this.updateContentValidator(resourceType);
    }
  }

  updateContentValidator(resourceType: ResourceType) {
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
      case ResourceType.file:
      case ResourceType.image:
        this.resourceForm.controls["content"].setValidators([]);
        break;
    }
    this.resourceForm.controls["content"].setValue("");
    this.resource.resourceType = resourceType;
    this.resourceForm.controls["content"].updateValueAndValidity();
  }

  onCreate() {
    // console.log("create resource", this.resource);
    for (const field in this.resourceForm.controls) {
      this.resource[field] = this.resourceForm.get(field).value;
    }
    if (
      this.resource.resourceType == ResourceType.file ||
      this.resource.resourceType == ResourceType.image
    ) {
      this.resource.content = this.fileToUpload.name;
    }
    this.showSpinner = true;

    this.resourceService
      .create(this.resource)
      .then((newDoc) => {
        this.resource.id = newDoc.id;
        if (
          this.resource.resourceType == ResourceType.file ||
          this.resource.resourceType == ResourceType.image
        ) {
          this.doUpload(this.resource.id);
        }
        this.showSpinner = false;

        this.helper.snackbar(
          "Resource '" + this.resource.name + "' created.",
          2000
        );
        this.helper.redirect("/resources");
      })
      .catch(function (error) {
        this.showSpinner = false;
        console.error("Error adding document: ", this.resource.name, error);
      });
  }

  onUploadFile(event) {
    console.log("onUploadFile", event);
    this.fileToUpload = event.target.files[0];
    if (this.crudAction == Crud.Update) {
      this.doUpload(this.resource.id);
    }
  }

  isUpdater() {
    // Rules for being able to update a resource
    // 1. isAdmin
    // 2. isOwner of the resource
    // 3. is a manager of team that resource is associated with.
    // And we must be in update mode & resource is not superseded
    if (
      this.auth.currentUser.isAdmin ||
      this.auth.currentUser.uid == this.resource?.owner?.uid ||
      (this.auth.currentUser.managerOfTeams &&
        this.auth.currentUser.managerOfTeams.includes(this.resource?.team?.id))
    ) {
      if (
        this.crudAction == Crud.Update &&
        this.resource.status != ResourceStatus.superseded
      ) {
        return true;
      }
    }
    return false;
  }

  onSupersede() {
    console.log("onSupersede");
    // Supersede will
    // 1.create a copy of the current resource (Not content or storage, that needs to be recreated for a superseded resource)
    // 2. Add a note in the description of the superseded resource about the supersession and link to superseded item
    // 3. set the superseded resource status to superseded (and so lock it)
    // 4. Take the user to the new resource (so they can update it)
    const prompt = "Are you sure you want to supersede this resource?";
    const dialogRef = this.dialog.open(ConfirmdialogComponent, {
      width: "300px",
      data: { heading: "Confirm", prompt: prompt },
    });
    let carryOn = false;
    dialogRef.afterClosed().subscribe((choice) => {
      if (choice) {
        this.supersede();
      }
    });
  }

  supersede() {
    this.showSpinner = true;
    let newResource = { ...this.resource };
    delete newResource.id;
    newResource.supersedes = <DocRef>{
      id: this.resource.id,
      name: this.resource.name,
    };

    this.resourceService
      .create(newResource)
      .then((newDoc) => {
        // this.crudAction = Crud.Update;
        console.log("superseding:", newDoc);
        newDoc.id;
        const description =
          this.resource.description +
          String.fromCharCode(13) +
          "[Superseded on " +
          Date().toString() +
          " by " +
          this.auth.currentUser.displayName +
          "]";
        this.resourceService.fieldUpdate(
          this.resource.id,
          "description",
          description
        );
        this.resourceService.fieldUpdate(
          this.resource.id,
          "status",
          ResourceStatus.superseded
        );

        this.showSpinner = false;

        this.helper.snackbar(
          "Superseding Resource '" + this.resource.name + "' created.",
          2000
        );
        this.helper.redirect("/resources");
      })
      .catch(function (error) {
        this.showSpinner = false;
        console.error(
          "Error adding superseding document: ",
          this.resource.id,
          error
        );
      });
  }

  onUpdateOwner() {
    console.log("onUpdateOwner");
    const dialogRef = this.dialog.open(UserselectordialogComponent, {
      width: "380px",
      data: { uidHide: [this.resource?.owner?.uid] },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("New Owner", result);
        const userRef: UserRef = {
          uid: result.uid,
          displayName: result.displayName,
        };
        this.resourceService.fieldUpdate(this.resource.id, "owner", userRef);
        this.resource.owner = userRef;
      }
    });
  }

  onUpdateReviewer() {
    console.log("onUpdateReviewer");
    const dialogRef = this.dialog.open(UserselectordialogComponent, {
      width: "380px",
      data: { uidHide: [this.resource?.reviewer?.uid] },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("New Reviewer", result);
        const userRef: UserRef = {
          uid: result.uid,
          displayName: result.displayName,
        };
        this.resourceService.fieldUpdate(this.resource.id, "reviewer", userRef);
        this.resource.reviewer = userRef;
      }
    });
  }

  onUpdateTeam() {
    console.log("onUpdateTeam");
    const dialogRef = this.dialog.open(TeamselectordialogComponent, {
      width: "380px",
      data: { id: this.resource?.team?.id },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("New Team", result);
        const teamRef: DocRef = {
          id: result.id,
          name: result.name,
        };
        this.resourceService.fieldUpdate(this.resource.id, "team", teamRef);
        this.resource.team = teamRef;
      }
    });
  }

  onUpdateCategory() {
    console.log("onUpdateCategory");
    const dialogRef = this.dialog.open(CategoryselectordialogComponent, {
      width: "380px",
      data: { id: this.resource?.category?.id },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("New Category", result);
        const categoryRef: DocRef = {
          id: result.id,
          name: result.name,
        };
        this.resourceService.fieldUpdate(
          this.resource.id,
          "category",
          categoryRef
        );
        this.resource.category = categoryRef;
      }
    });
  }

  doUpload(id: string) {
    console.log("this.fileToUpload.name", this.fileToUpload, id);
    this.showSpinner = true;
    const task = this.storage
      .upload(`resources/${id}/${this.fileToUpload.name}`, this.fileToUpload)
      .then((t) => {
        this.showSpinner = false;
        if (this.crudAction != Crud.Create) {
          this.resource.content = this.fileToUpload.name;
          this.resourceForm.controls["content"].setValue(
            this.fileToUpload.name
          );
          this.onFieldUpdate("content");
          // get downloadUrl
          this.downloadUrl$ = this.storage
            .ref(`resources/${this.resource.id}/${this.resource.content}`)
            .getDownloadURL();
        }
      })
      .catch((e) => (this.showSpinner = false));
    // task.snapshotChanges().subscribe(console.log);
  }

  onDelete() {
    // console.log("delete", this.resource.id);
    const name = this.resource.name;
    this.resourceService
      .delete(this.resource.id)
      .then(() => {
        this.helper.snackbar("Resource '" + name + "' deleted!", 2000);
        this.helper.redirect("/resources");
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
      console.log("onFieldUpdate", fieldName, newValue, this.resource.id);
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
