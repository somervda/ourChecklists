import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UserService } from "../../services/user.service";

@Component({
  selector: "app-teamuserremovedialog",
  templateUrl: "./teamuserremovedialog.component.html",
  styleUrls: ["./teamuserremovedialog.component.scss"],
})
export class TeamuserremovedialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private dialogRef: MatDialogRef<TeamuserremovedialogComponent>
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
