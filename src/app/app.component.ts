import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "./services/auth.service";
import { SwUpdate } from "@angular/service-worker";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, fromEvent, Subscription } from "rxjs";
import { User } from "./models/user.model";
// import { TeamRole, UserTeam } from "./models/user.model";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "ourChecklists";
  isConnected = true;
  onlineEvent$: Observable<Event>;
  offlineEvent$: Observable<Event>;
  subscriptions$$: Subscription[] = [];
  // TeamRole: TeamRole;

  constructor(
    public auth: AuthService,
    private swUpdate: SwUpdate,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Determine if we are connected
    // See https://robinraju.dev/developer/2018-07-26-detecting-user-offline-in-angular/
    this.onlineEvent$ = fromEvent(window, "online");
    this.offlineEvent$ = fromEvent(window, "offline");

    this.subscriptions$$.push(
      this.onlineEvent$.subscribe((e) => {
        this.isConnected = true;
      })
    );

    this.subscriptions$$.push(
      this.offlineEvent$.subscribe((e) => {
        this.isConnected = false;
      })
    );

    // Track PWA version
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        // Will show snackbar notification that PWA client is out of date
        // and needs to be refreshed. Note: iOS at 12.2  not working,
        // PWA apps do not recheck there cache on startup, it seems to be a bug
        // that should be resolved (If you really need this then some sort of
        // version check between firestore and application version probably is a solution)
        // In iOS you can refresh the application in the browser to force the PWA to reload
        let newVersionSnackBarRef = this.snackBar.open(
          "New version available.",
          "Load New Version?",
          {
            duration: 20000,
          }
        );
        newVersionSnackBarRef.onAction().subscribe(() => {
          console.log("New version action pressed");
          window.location.reload();
        });
      });
    }
  }

  // isTeamManager(teams: UserTeam[]) {
  //   if (teams === undefined || teams === null) {
  //     return false;
  //   }
  //   return (
  //     teams.filter((team) => team.teamRole === TeamRole.manager).length > 0
  //   );
  // }

  hasTeamRole(user: User) {
    if (user === undefined || user === null) {
      return false;
    }
    if (
      (user.memberOfTeams && user.memberOfTeams.length > 0) ||
      (user.managerOfTeams && user.managerOfTeams.length > 0) ||
      (user.reviewerOfTeams && user.reviewerOfTeams.length > 0)
    )
      return true;
  }

  logout() {
    this.auth.signOut();
  }

  ngOnDestroy(): void {
    /**
     * Unsubscribe all subscriptions to avoid memory leak
     */
    this.subscriptions$$.forEach((subscription) => subscription.unsubscribe());
  }
}
