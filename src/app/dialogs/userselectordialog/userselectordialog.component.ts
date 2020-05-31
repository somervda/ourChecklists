import { Component, OnInit, Inject } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UserService } from "../../services/user.service";
import { User } from "../../models/user.model";
import { DocumentReference } from "@angular/fire/firestore";

@Component({
  selector: "app-userselectordialog",
  templateUrl: "./userselectordialog.component.html",
  styleUrls: ["./userselectordialog.component.scss"],
})

/**
 * Will display a list of users, except users who are in the refHide array
 * passed as part of the dialog data. Returns the selected user as a DocumentReference
 */
export class UserselectordialogComponent implements OnInit {
  user: DocumentReference = null;
  // refHide is a list of users not to show in the userfinder selection
  refHide: DocumentReference[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserselectordialogComponent>
  ) {}

  ngOnInit(): void {
    if (this.data.refHide) {
      this.refHide = this.data.refHide;
    }
    console.log("userselectordialog this.data.uidHide:", this.refHide);
  }

  returnUser() {
    this.dialogRef.close(this.user);
  }

  onUserSelected(user: DocumentReference) {
    console.log("onUserSelected:", user);
    this.user = user;
  }
}
