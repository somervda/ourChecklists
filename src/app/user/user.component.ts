import { AuthService } from "./../services/auth.service";
import { UserService } from "./../services/user.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { User } from "../models/user.model";
import { AngularFireAuth } from "@angular/fire/auth";
import { Subscription } from "rxjs";
import { Kvp } from "../models/helper.model";

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.scss"],
})
export class UserComponent implements OnInit, OnDestroy {
  user: User;
  kvps: Kvp[];
  updatableProfile: boolean = false;
  userInitSub: Subscription;
  navigationSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    private userservice: UserService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // subscribe to the router events - storing the subscription so
    // we can unsubscribe later.
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.loadDisplayUser();
      }
    });

    //Initial load
    this.loadDisplayUser();
  }

  loadDisplayUser() {
    console.log("initialiseInvites");

    //console.log("this.user", this.user);
    this.user = this.route.snapshot.data["user"];
    //console.log("this.user", this.user);
    const isAdmin = this.user.isAdmin ? "Yes" : "No";
    const isActivated = this.user.isActivated ? "Yes" : "No";
    const canCreateTeams = this.user.canCreateTeams ? "Yes" : "No";
    const isCategoryManager = this.user.isCategoryManager ? "Yes" : "No";
    const isResourceManager = this.user.isResourceManager ? "Yes" : "No";
    const isTemplateManager = this.user.isTemplateManager ? "Yes" : "No";

    this.userInitSub = this.auth.user$.subscribe((currentUser) => {
      // The user page is read only for non-administrators
      // or where the uid = the logged on user UID)
      // if the user is and administrator and looking at other peoples profiles then updates
      // functionality is available
      // Note: firestore rules will still control the updates on the backend

      if (
        this.user.uid != this.afAuth.auth.currentUser.uid &&
        currentUser.isAdmin
      )
        this.updatableProfile = true;

      this.kvps = [
        { key: "Display Name", value: this.user.displayName },
        { key: "User Id", value: this.user.uid },
        { key: "eMail", value: this.user.email },
        {
          key: "Photo URL",
          value: this.user.photoURL,
        },
      ];

      if (!this.updatableProfile) {
        this.kvps.push({ key: "Is Administrator?", value: isAdmin });
        this.kvps.push({ key: "Is Activated?", value: isActivated });
        this.kvps.push({ key: "Can Create Teams?", value: canCreateTeams });
        this.kvps.push({
          key: "Is Category Manager?",
          value: isCategoryManager,
        });
        this.kvps.push({
          key: "Is Resource Manager?",
          value: isResourceManager,
        });
        this.kvps.push({
          key: "Is Template Manager?",
          value: isTemplateManager,
        });
      }
      // for admins updating other users profile isAdmin and isActivated displayed
      // as updatable controls in the HTML template
    });
  }

  updateIsAdmin() {
    // Note: click is processed before the this.user.isAdmin is updated with the
    // ngModel binding.

    this.userservice.dbFieldUpdate(
      this.user.uid,
      "isAdmin",
      !this.user.isAdmin
    );
  }

  updateIsActivated() {
    this.userservice.dbFieldUpdate(
      this.user.uid,
      "isActivated",
      !this.user.isActivated
    );
  }

  updateCanCreateTeams() {
    this.userservice.dbFieldUpdate(
      this.user.uid,
      "canCreateTeams",
      !this.user.canCreateTeams
    );
  }

  updateIsCategoryManager() {
    this.userservice.dbFieldUpdate(
      this.user.uid,
      "isCategoryManager",
      !this.user.isCategoryManager
    );
  }

  updateIsResourceManager() {
    this.userservice.dbFieldUpdate(
      this.user.uid,
      "isResourceManager",
      !this.user.isResourceManager
    );
  }

  updateIsTemplateManager() {
    this.userservice.dbFieldUpdate(
      this.user.uid,
      "isTemplateManager",
      !this.user.isTemplateManager
    );
  }

  ngOnDestroy() {
    if (this.userInitSub) this.userInitSub.unsubscribe();
    if (this.navigationSubscription) this.navigationSubscription.unsubscribe();
  }
}
