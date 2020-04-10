import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { UserService } from "../services/user.service";
import { User } from "../models/user.model";
import { MatDialog } from "@angular/material/dialog";
import { TeamuserremoveComponent } from "../teamuserremove/teamuserremove.component";
import { TeamuseraddComponent } from "../teamuseradd/teamuseradd.component";

@Component({
  selector: "app-teamuserlist",
  templateUrl: "./teamuserlist.component.html",
  styleUrls: ["./teamuserlist.component.scss"],
})
export class TeamuserlistComponent implements OnInit {
  @Input() teamId: string;
  @Input() hideAddRemove: boolean = true;
  users$: Observable<User[]>;
  displayedColumns: string[] = ["displayName", "role", "email", "uid"];

  constructor(private userservice: UserService, public dialog: MatDialog) {}
  ngOnInit() {
    // get a observable of all probes
    // console.log("teamuserlist teamId", this.teamId);
    this.users$ = this.userservice.findByTeamId(this.teamId);
    // this.users$.subscribe((u) => console.log("users", u));
  }

  openTeamUserRemoveDialog(uid, displayName, teamId, role) {
    // console.log("remove click:", uid, displayName, teamId);
    const dialogRef = this.dialog.open(TeamuserremoveComponent, {
      width: "250px",
      data: { uid: uid, displayName: displayName, teamId: teamId, role: role },
    });
  }

  openTeamUserAddDialog(teamId) {
    console.log("add click:", teamId);
    const dialogRef = this.dialog.open(TeamuseraddComponent, {
      width: "380px",
      data: { teamId: teamId },
    });
  }
}
