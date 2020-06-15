import { HelperService } from "src/app/services/helper.service";
import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { UserService } from "../../services/user.service";
import { User } from "../../models/user.model";
import { MatDialog } from "@angular/material/dialog";
import { TeamuserremovedialogComponent } from "../../dialogs/teamuserremovedialog/teamuserremovedialog.component";
import { TeamuseradddialogComponent } from "../../dialogs/teamuseradddialog/teamuseradddialog.component";

@Component({
  selector: "app-teamuserlist",
  templateUrl: "./teamuserlist.component.html",
  styleUrls: ["./teamuserlist.component.scss"],
})
export class TeamuserlistComponent implements OnInit, OnDestroy {
  @Input() teamId: string;
  @Input() hideAddRemove: boolean = true;
  users: User[];
  users$: Observable<User[]>;
  users$$: Subscription;
  displayedColumns: string[] = ["displayName", "role", "email", "uid"];

  constructor(
    private userservice: UserService,
    public dialog: MatDialog,
    private helper: HelperService
  ) {}
  ngOnInit() {
    // get a observable of all probes
    // console.log("teamuserlist teamId", this.teamId);
    this.users$ = this.userservice.findByTeamId(this.teamId);
    this.users$$ = this.users$.subscribe((u) => (this.users = u));
  }

  openTeamUserRemoveDialog(uid, displayName, teamId, role) {
    // console.log("remove click:", uid, displayName, teamId);
    const dialogRef = this.dialog.open(TeamuserremovedialogComponent, {
      width: "250px",
      data: { uid: uid, displayName: displayName, teamId: teamId, role: role },
    });
  }

  openTeamUserAddDialog(teamId) {
    console.log("add click:", teamId);
    const dialogRef = this.dialog.open(TeamuseradddialogComponent, {
      width: "380px",
      data: {
        teamId: teamId,
        refHide: this.users.map((u) => this.helper.docRef(`users/${u.uid}`)),
      },
    });
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (!this.users$$.closed) {
      this.users$$.unsubscribe();
    }
  }
}
