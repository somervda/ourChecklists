import { AuthService } from "./../services/auth.service";
import { UserService } from "./../services/user.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { User } from "../models/user.model";
import { AngularFireAuth } from "@angular/fire/auth";
import { Subscription, Observable } from "rxjs";
import { Kvp } from "../models/helper.model";
import { AngularFireStorage } from "@angular/fire/storage";
import { HelperService } from "../services/helper.service";

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.scss"],
})
export class UserComponent implements OnInit, OnDestroy {
  user: User;
  user$$: Subscription;

  // If only the photo can be updated unless the user has fullAccess
  fullAccess: boolean = false;

  showSpinner = false;
  fileUploadMsg = "";

  constructor(
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    private userService: UserService,
    private auth: AuthService,
    private storage: AngularFireStorage,
    private helper: HelperService
  ) {}

  ngOnInit() {
    this.user$$ = this.userService
      .findUserByUid(this.route.snapshot.paramMap.get("uid"))
      .subscribe((u) => this.renderPage(u));
  }

  renderPage(user: User) {
    console.log("renderPage", user, this.auth.currentUser);
    // Check access: Admin can update all users except their own profile
    // otherwise non-admins can only access their own profiles
    if (
      this.auth.currentUser.isAdmin &&
      this.auth.currentUser.uid != user.uid
    ) {
      this.fullAccess = true;
    }
    if (
      !this.auth.currentUser.isAdmin &&
      this.auth.currentUser.uid != user.uid
    ) {
      this.helper.redirect("/notAuthorized");
    }
    this.user = user;

    // const isAdmin = this.user.isAdmin ? "Yes" : "No";
    // const isActivated = this.user.isActivated ? "Yes" : "No";
    // const canCreateTeams = this.user.canCreateTeams ? "Yes" : "No";
    // const isCategoryManager = this.user.isCategoryManager ? "Yes" : "No";
    // const isResourceManager = this.user.isResourceManager ? "Yes" : "No";
    // const isTemplateManager = this.user.isTemplateManager ? "Yes" : "No";

    // this.userInitSub = this.auth.user$.subscribe((currentUser) => {
    //   // The user page is read only for non-administrators
    //   // or where the uid = the logged on user UID)
    //   // if the user is and administrator and looking at other peoples profiles then updates
    //   // functionality is available
    //   // Note: firestore rules will still control the updates on the backend

    //   if (
    //     this.user.uid != this.afAuth.auth.currentUser.uid &&
    //     currentUser.isAdmin
    //   )
    //     this.updatableProfile = true;

    //   this.kvps = [
    //     { key: "Display Name", value: this.user.displayName },
    //     { key: "User Id", value: this.user.uid },
    //     { key: "eMail", value: this.user.email },
    //     {
    //       key: "Photo URL",
    //       value: this.user.photoURL,
    //     },
    //   ];

    //   if (!this.updatableProfile) {
    //     this.kvps.push({ key: "Is Administrator?", value: isAdmin });
    //     this.kvps.push({ key: "Is Activated?", value: isActivated });
    //     this.kvps.push({ key: "Can Create Teams?", value: canCreateTeams });
    //     this.kvps.push({
    //       key: "Is Category Manager?",
    //       value: isCategoryManager,
    //     });
    //     this.kvps.push({
    //       key: "Is Resource Manager?",
    //       value: isResourceManager,
    //     });
    //     this.kvps.push({
    //       key: "Is Template Manager?",
    //       value: isTemplateManager,
    //     });
    //   }
    //   // for admins updating other users profile isAdmin and isActivated displayed
    //   // as updatable controls in the HTML template
    // });
  }

  updateIsAdmin() {
    // Note: click is processed before the this.user.isAdmin is updated with the
    // ngModel binding.

    this.userService.dbFieldUpdate(
      this.user.uid,
      "isAdmin",
      !this.user.isAdmin
    );
  }

  updateIsActivated() {
    this.userService.dbFieldUpdate(
      this.user.uid,
      "isActivated",
      !this.user.isActivated
    );
  }

  updateCanCreateTeams() {
    this.userService.dbFieldUpdate(
      this.user.uid,
      "canCreateTeams",
      !this.user.canCreateTeams
    );
  }

  updateIsCategoryManager() {
    this.userService.dbFieldUpdate(
      this.user.uid,
      "isCategoryManager",
      !this.user.isCategoryManager
    );
  }

  updateIsResourceManager() {
    this.userService.dbFieldUpdate(
      this.user.uid,
      "isResourceManager",
      !this.user.isResourceManager
    );
  }

  updateIsTemplateManager() {
    this.userService.dbFieldUpdate(
      this.user.uid,
      "isTemplateManager",
      !this.user.isTemplateManager
    );
  }

  getStorageUrl(filename: string): Observable<any> {
    // console.log("getStorageUrl", filename);
    return this.storage
      .ref(`userphotos/${this.user.uid}/${filename}`)
      .getDownloadURL();
  }

  onUploadFile(event) {
    console.log("onUploadFile", event);
    const fileToUpload = event.target.files[0];
    console.log("fileToUpload", fileToUpload.size);
    if (fileToUpload.size > 150000) {
      this.fileUploadMsg =
        " File is too large to upload. Must be less than 150KB";
    } else {
      this.showSpinner = true;
      this.fileUploadMsg = "";
      const task = this.storage
        .upload(
          `userphotos/${this.user.uid}/${fileToUpload.name}`,
          fileToUpload
        )
        .then((t) => {
          this.getStorageUrl(fileToUpload.name)
            .toPromise()
            .then((url) =>
              this.userService.dbFieldUpdate(this.user.uid, "photoURL", url)
            );
          this.showSpinner = false;
        })
        .catch((e) => (this.showSpinner = false));
    }
  }

  ngOnDestroy() {
    if (this.user$$) this.user$$.unsubscribe();
  }
}
