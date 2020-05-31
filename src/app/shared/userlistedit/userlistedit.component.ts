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
import { MatTable } from "@angular/material/table";
import { HelperService } from "src/app/services/helper.service";
import { DocumentReference } from "@angular/fire/firestore";
import { first } from "rxjs/operators";

@Component({
  selector: "app-userlistedit",
  templateUrl: "./userlistedit.component.html",
  styleUrls: ["./userlistedit.component.scss"],
})
export class UserlisteditComponent implements OnInit {
  @Input() users: DocumentReference[];
  @Input() hideCreate: boolean;
  @ViewChild(MatTable) table: MatTable<any>;
  @Output() change = new EventEmitter();

  displayedColumns: string[] = ["displayName", "uid"];

  constructor(public dialog: MatDialog, private helper: HelperService) {}

  ngOnInit(): void {
    console.log("UserlisteditComponent:", this.users);
  }

  removeUser(userRef: DocumentReference) {
    console.log("removeUser", userRef);
    this.helper
      .getDocRef(userRef)
      .pipe(first())
      .toPromise()
      .then((user) => {
        const prompt = `Are you sure you want to remove "${user.displayName}" user from the list?`;
        const dialogRef = this.dialog.open(ConfirmdialogComponent, {
          width: "300px",
          data: { heading: "Confirm", prompt: prompt },
        });
        dialogRef.afterClosed().subscribe((choice) => {
          if (choice) {
            this.users.splice(
              this.users.findIndex((u) => u.path == userRef.path),
              1
            );
            this.table.renderRows();
            this.change.emit(this.users);
          }
        });
      });
  }

  addUser() {
    if (this.users && this.users.length >= 10) {
      this.helper.snackbar(
        "No more users can be added (10 max), remove an existing user before adding another.",
        5000
      );
    } else {
      const dialogRef = this.dialog.open(UserselectordialogComponent, {
        width: "380px",
        data: {
          refHide: this.users,
        },
      });
      // Result is a DocumentReference
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log("addUser", result);
          const newUser = this.helper.docRef(`users/${result.id}`);
          if (this.users) {
            this.users.push(newUser);
          } else {
            this.users = [newUser];
          }
          this.table.renderRows();
          this.change.emit(this.users);
        }
      });
    }
  }
}
