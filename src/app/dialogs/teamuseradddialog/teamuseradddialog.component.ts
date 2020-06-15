import { DocumentReference } from "@angular/fire/firestore";
import { Component, OnInit, Inject } from "@angular/core";
import { TeamService } from "../../services/team.service";
import { Observable } from "rxjs";
import { Team } from "../../models/team.model";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TeamRoles } from "../../models/user.model";
import { UserService } from "../../services/user.service";

@Component({
  selector: "app-teamuseradd",
  templateUrl: "./teamuseradddialog.component.html",
  styleUrls: ["./teamuseradddialog.component.scss"],
})
export class TeamuseradddialogComponent implements OnInit {
  team$: Observable<Team>;
  teamRoles = TeamRoles;
  selectedUid = "";
  selectedRole = "";
  addError = "";
  refHide = [] as DocumentReference[];

  constructor(
    private teamService: TeamService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private dialogRef: MatDialogRef<TeamuseradddialogComponent>
  ) {}

  ngOnInit(): void {
    this.team$ = this.teamService.findById(this.data.teamId);
    if (this.data.refHide) {
      this.refHide = this.data.refHide;
    }
  }

  async addUser() {
    console.log(
      "addUser:",
      this.selectedUid,
      this.selectedRole,
      this.data.teamId
    );
    const result = await this.userService
      .addUserToTeam(this.selectedUid, this.data.teamId, this.selectedRole)
      .then();
    if (result === "OK") {
      this.dialogRef.close();
    } else {
      this.addError = result;
    }
  }

  onUserSelected(event) {
    console.log("onUserSelected:", event);
    this.selectedUid = event.id;
  }
}
