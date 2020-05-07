import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
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
  @Input() uidHide: string[];
  @Output() userSelected: EventEmitter<any> = new EventEmitter();
  users$: Observable<User[]>;
  selectedUid: string;

  ngOnInit(): void {
    console.log("userfinder uidHide:", this.uidHide);
    this.users$ = this.userService.findByPartialName("");
  }

  onKey(event: any) {
    console.log("searchName", event.target.value);
    this.users$ = this.userService.findByPartialName(event.target.value);
  }

  isHidden(uid) {
    return this.uidHide.includes(uid);
  }

  onUserSelected(uid) {
    console.log("onUserSelected", uid);
    this.selectedUid = uid;
    this.userSelected.emit(uid);
  }
}
