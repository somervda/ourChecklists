import { Component, OnInit, OnDestroy } from "@angular/core";
import { Team } from "../models/team.model";
import { Crud } from "../models/helper.model";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { TeamService } from "../services/team.service";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { HelperService } from "../services/helper.service";
import { first } from "rxjs/operators";
import { User } from "../models/user.model";

@Component({
  selector: "app-team",
  templateUrl: "./team.component.html",
  styleUrls: ["./team.component.scss"],
})
export class TeamComponent implements OnInit, OnDestroy {
  team: Team;
  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;
  hideAddRemove = true;
  readOnly = true;

  teamForm: FormGroup;
  teamSubscription$$: Subscription;

  constructor(
    private teamService: TeamService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private auth: AuthService,
    private helper: HelperService
  ) {}

  ngOnInit() {
    if (this.route.routeConfig.path == "team/create") {
      this.auth.user$
        .pipe(first())
        .toPromise()
        .then((u) => this.initProcesses(u));
    } else {
      this.initProcesses(this.auth.currentUser);
    }
  }

  initProcesses(user: User) {
    this.crudAction = Crud.Update;
    if (this.route.routeConfig.path == "team/delete/:id")
      this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "team/create")
      this.crudAction = Crud.Create;

    // console.log("team onInit", this.crudAction);
    if (this.crudAction == Crud.Create) {
      this.team = {
        name: "",
        description: "",
        isActive: true,
      };
    } else {
      // console.log("team snapshotdata", this.route.snapshot);
      this.team = this.route.snapshot.data["team"];
      // console.log("Probe from resolver:", this.probe);
      // Subscribe to team to keep getting live updates
      this.teamSubscription$$ = this.teamService
        .findById(this.team.id)
        .subscribe((team) => {
          this.team = team;
          // console.log("subscribed team", this.team);
          this.teamForm.patchValue(this.team);
        });
    }

    // Create form group and initialize with probe values
    this.teamForm = this.fb.group({
      name: [
        this.team.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
        ],
      ],
      description: [
        this.team.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      isActive: [this.team.isActive],
    });

    // Mark all fields as touched to trigger validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.teamForm.controls) {
        this.teamForm.get(field).markAsTouched();
      }
    }

    // update the app-teamuserlist to show or hide the user add/remove buttons
    // and allow team data updates if user is admin or the team manager
    if (
      user &&
      (user.isAdmin ||
        (user.managerOfTeams && user.managerOfTeams.includes(this.team.id)))
    ) {
      this.hideAddRemove = false;
      this.readOnly = false;
    }
    if (this.crudAction != Crud.Update) {
      this.hideAddRemove = true;
    }
  }

  onCreate() {
    // console.log("create probe", this.probe);
    for (const field in this.teamForm.controls) {
      this.team[field] = this.teamForm.get(field).value;
    }

    this.teamService
      .create(this.team)
      .then((newDoc) => {
        this.crudAction = Crud.Update;

        this.team.id = newDoc.id;
        this.helper.snackbar("Team '" + this.team.name + "' created.", 2000);
        this.helper.redirect("/team/" + this.team.id);
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.team.name, error);
      });
  }

  onDelete() {
    // console.log("delete", this.probe.id);
    const teamId = this.team.id;
    const name = this.team.name;
    this.teamService
      .delete(this.team.id)
      .then(() => {
        this.helper.snackbar("Team '" + name + "' deleted!", 2000);
        this.helper.redirect("/teams");
      })
      .catch(function (error) {
        console.error("Error deleting team: ", error);
      });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // disableSelectedUpdatesIfProbeIsInUse(probeId: string) {
  //   // See if any measurements have been taken with the probe
  //   // or if the probe has been assigned to a device

  //   console.log("IsProbeUsed", probeId);
  //   let usedOnDevice = "";

  //   if (this.teamSubscription$$) this.teamSubscription$$.unsubscribe();

  //   this.devices$$ = this.devices$.subscribe((devices) => {
  //     devices.map((device) => {
  //       const probeItemIndex = device.probeList.findIndex(
  //         (p) => p.id == probeId
  //       );

  //       if (probeItemIndex != -1) {
  //         this.probeForm.get("target").disable();
  //         this.probeForm.get("type").disable();
  //         usedOnDevice += device.id + " ";
  //       }
  //     });

  //     if (usedOnDevice) {
  //       this.snackBar.open(
  //         "Probe's target and type properties can not be updated because the probe is in use on device(s): " +
  //           usedOnDevice +
  //           "  Recommendation: Delete and create another probe rather than change it.",
  //         "",
  //         {
  //           duration: 7000,
  //         }
  //       );
  //     }
  //   });

  // }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (
      this.teamForm.get(fieldName).valid &&
      this.team.id != "" &&
      this.crudAction != Crud.Delete
    ) {
      let newValue = this.teamForm.get(fieldName).value;
      this.teamService.fieldUpdate(this.team.id, fieldName, newValue);
    }
  }

  ngOnDestroy() {
    if (this.teamSubscription$$) this.teamSubscription$$.unsubscribe();
  }
}
