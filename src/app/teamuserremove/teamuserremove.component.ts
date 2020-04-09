import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UserService } from "../services/user.service";

@Component({
  selector: "app-teamuserremove",
  templateUrl: "./teamuserremove.component.html",
  styleUrls: ["./teamuserremove.component.scss"],
})
export class TeamuserremoveComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private dialogRef: MatDialogRef<TeamuserremoveComponent>
  ) {}

  ngOnInit(): void {}

  async removeUser() {
    console.log(this.data);
    await this.userService.removeUserFromTeam(
      this.data.uid,
      this.data.teamId,
      this.data.role
    );
    this.dialogRef.close();
  }
}
