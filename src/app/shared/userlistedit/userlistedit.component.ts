import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmdialogComponent } from "../../dialogs/confirmdialog/confirmdialog.component";
import { UserselectordialogComponent } from "../../dialogs/userselectordialog/userselectordialog.component";
import { UserRef } from "../../models/helper.model";
import { MatTable } from "@angular/material/table";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-userlistedit",
  templateUrl: "./userlistedit.component.html",
  styleUrls: ["./userlistedit.component.scss"],
})
export class UserlisteditComponent implements OnInit {
  @Input() users: UserRef[];
  @Input() hideCreate: boolean;
  @ViewChild(MatTable) table: MatTable<any>;
  @Output() change = new EventEmitter();

  displayedColumns: string[] = ["displayName", "uid"];

  constructor(public dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    console.log("UserlisteditComponent:", this.users);
  }

  removeUser(uid, displayName) {
    const prompt = `Are you sure you want to remove "${displayName}" user from the list?`;
    const dialogRef = this.dialog.open(ConfirmdialogComponent, {
      width: "300px",
      data: { heading: "Confirm", prompt: prompt },
    });
    dialogRef.afterClosed().subscribe((choice) => {
      if (choice) {
        this.users.splice(
          this.users.findIndex((u) => u.uid == uid),
          1
        );
        this.table.renderRows();
        this.change.emit(this.users);
      }
    });
  }

  addUser() {
    if (this.users.length >= 10) {
      this.snackBar.open(
        "No more users can be added (10 max), remove an existing user before adding another.",
        "",
        {
          duration: 5000,
        }
      );
    } else {
      const dialogRef = this.dialog.open(UserselectordialogComponent, {
        width: "380px",
        data: { uidHide: this.users.map((u) => u.uid) },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log("addUser", result);
          const newUser: UserRef = {
            uid: result.uid,
            displayName: result.displayName,
          };
          this.users.push(newUser);
          this.table.renderRows();
          this.change.emit(this.users);
        }
      });
    }
  }
}
