import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { UserService } from "../../services/user.service";
import { Observable } from "rxjs";
import { User } from "../../models/user.model";
import { DocumentReference } from "@angular/fire/firestore";
import { HelperService } from "src/app/services/helper.service";

@Component({
  selector: "app-userfinder",
  templateUrl: "./userfinder.component.html",
  styleUrls: ["./userfinder.component.scss"],
})
export class UserfinderComponent implements OnInit {
  constructor(private userService: UserService, public helper: HelperService) {}
  @Input() refHide: DocumentReference[];
  @Output() userSelected: EventEmitter<any> = new EventEmitter();
  users$: Observable<User[]>;
  selectedUser: DocumentReference = null;

  ngOnInit(): void {
    console.log("userfinder refHide:", this.refHide);
    this.users$ = this.userService.findByPartialName("");
  }

  onKey(event: any) {
    console.log("searchName", event.target.value);
    this.users$ = this.userService.findByPartialName(event.target.value);
  }

  isHidden(user) {
    if (this.refHide) {
      return this.refHide.findIndex((h) => h.path == user.path) > -1;
    }
    return false;
  }

  onUserSelected(user) {
    console.log("onUserSelected", user);
    this.selectedUser = user;
    this.userSelected.emit(user);
  }
}
