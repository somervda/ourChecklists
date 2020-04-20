import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { UserService } from "../services/user.service";
import { Observable } from "rxjs";
import { User } from "../models/user.model";

@Component({
  selector: "app-userfinder",
  templateUrl: "./userfinder.component.html",
  styleUrls: ["./userfinder.component.scss"],
})
export class UserfinderComponent implements OnInit {
  constructor(private userService: UserService) {}
  @Output() userSelected: EventEmitter<any> = new EventEmitter();
  users$: Observable<User[]>;
  selectedUid: string;

  ngOnInit(): void {
    this.users$ = this.userService.findByPartialName("");
  }

  onKey(event: any) {
    console.log("searchName", event.target.value);
    this.users$ = this.userService.findByPartialName(event.target.value);
  }

  onUserSelected(uid) {
    console.log("onUserSelected", uid);
    this.selectedUid = uid;
    this.userSelected.emit(uid);
  }
}
