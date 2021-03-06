import { Component, OnInit } from "@angular/core";
import {
  Resource,
  ResourceType,
  ResourceStatus,
  ResourceTypeInfo,
} from "../models/resource.model";
import { Crud } from "../models/helper.model";
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
import { first } from "rxjs/operators";
import { UserService } from "../services/user.service";
import { ResourcecontentviewdialogComponent } from "../dialogs/resourcecontentviewdialog/resourcecontentviewdialog.component";
import { ResourceviewdialogComponent } from "../dialogs/resourceviewdialog/resourceviewdialog.component";
import * as firebase from "firebase";

@Component({
  selector: "app-resource",
  templateUrl: "./resource.component.html",
  styleUrls: ["./resource.component.scss"],
})

/**
 * Does most of th updating of resources
 * Resources are stored and displayed in different ways depending on ResourceType:
 * url - The url is stored as a string in the content property
 * youtubeId - Is the 11 character id given by youtube to any videos hosted by youtube. The ID string is stored in the content property
 * file/image - The actual file is stored in firebase storage in the resources/<resources.id>/<file Name> and the file name is stored in the content property
 * markdown - the markdown text is stored in the content property.
 */
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
    private helper: HelperService,
    private userService: UserService
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
        owner: this.helper.docRef("users/" + this.auth.currentUser.uid),
        resourceType: ResourceType.url,
        content: "",
        status: ResourceStatus.active,
        reviewer: this.helper.docRef("users/" + this.auth.currentUser.uid),
        dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
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
          Validators.maxLength(80),
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
          this.resourceService.fieldUpdate(
            this.resource.id,
            "resourceType",
            resourceType
          );
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
    this.resource.content = "";
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
      this.auth.currentUser.uid ==
        this.helper.getDocRefId(this.resource?.owner) ||
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
    newResource.supersedes = this.helper.docRef(
      "resources/" + this.resource.id
    );

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
    let refHide = [];
    if (this.helper.getDocRefId(this.resource?.owner)) {
      refHide = [this.resource?.owner];
    }
    const dialogRef = this.dialog.open(UserselectordialogComponent, {
      width: "380px",
      data: { refHide: refHide },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("New Owner", result);
        const userRef = this.helper.docRef("users/" + result.id);
        this.resourceService.fieldUpdate(this.resource.id, "owner", userRef);
        this.resource.owner = userRef;
      }
    });
  }

  onUpdateReviewer(currentUid: string) {
    console.log("onUpdateReviewer");
    let refHide = [];
    if (this.helper.getDocRefId(this.resource?.reviewer)) {
      refHide = [this.resource?.reviewer];
    }
    const dialogRef = this.dialog.open(UserselectordialogComponent, {
      width: "380px",
      data: { refHide: refHide },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("New Reviewer", result);
        const userRef = this.helper.docRef("users/" + result.id);
        this.resourceService.fieldUpdate(this.resource.id, "reviewer", userRef);
        this.resource.reviewer = userRef;
      }
    });
  }

  onUpdateTeam() {
    console.log("onUpdateTeam");
    let idHide = "";
    if (this.helper.getDocRefId(this.resource?.team)) {
      idHide = this.helper.getDocRefId(this.resource?.team);
    }
    const dialogRef = this.dialog.open(TeamselectordialogComponent, {
      width: "380px",
      data: { id: idHide },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("New Team", result);
        const teamRef = this.helper.docRef("teams/" + result.id);
        this.resourceService.fieldUpdate(this.resource.id, "team", teamRef);
        this.resource.team = teamRef;
      }
    });
  }

  onUpdateCategory() {
    console.log("onUpdateCategory");
    let idHide = "";
    if (this.helper.getDocRefId(this.resource?.category)) {
      idHide = this.helper.getDocRefId(this.resource?.category);
    }
    const dialogRef = this.dialog.open(CategoryselectordialogComponent, {
      width: "380px",
      data: { id: idHide },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("New Category", result);
        const categoryRef = this.helper.docRef("categories/" + result.id);
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

  contentViewer() {
    const data = {
      name: this.resource.name,
      description: this.resource.description,
      content: this.resource.content,
      resourceType: this.resource.resourceType,
    };
    if (this.crudAction == Crud.Create) {
      console.log("contentViewer", data);
      const dialogRef = this.dialog.open(ResourcecontentviewdialogComponent, {
        width: "95%",
        maxWidth: "800px",
        maxHeight: "90%",
        data: data,
        autoFocus: false,
      });
    } else {
      console.log("resourceView", this.resource);
      const dialogRef = this.dialog.open(ResourceviewdialogComponent, {
        width: "95%",
        maxWidth: "800px",
        maxHeight: "90%",
        data: { resource: this.helper.docRef(`resources/${this.resource.id}`) },
        autoFocus: false,
      });
    }
  }

  ngOnDestroy() {
    if (this.resourceSubscription$$) this.resourceSubscription$$.unsubscribe();
  }
}
