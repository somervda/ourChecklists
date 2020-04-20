import { Component, OnInit, Inject } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UserService } from "../services/user.service";
import { User } from "../models/user.model";

@Component({
  selector: "app-userselectordialog",
  templateUrl: "./userselectordialog.component.html",
  styleUrls: ["./userselectordialog.component.scss"],
})
export class UserselectordialogComponent implements OnInit {
  user: User;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserselectordialogComponent>
  ) {}

  ngOnInit(): void {}

  returnUser() {
    this.dialogRef.close(this.user);
  }

  onUserSelected(uid) {
    console.log("onUserSelected:", uid);
    this.userService
      .findUserByUid(uid)
      .toPromise()
      .then((user) => (this.user = user));
  }
}
