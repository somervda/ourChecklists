import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { UserService } from "../services/user.service";
import { User } from "../models/user.model";

@Component({
  selector: "app-teamuserlist",
  templateUrl: "./teamuserlist.component.html",
  styleUrls: ["./teamuserlist.component.scss"],
})
export class TeamuserlistComponent implements OnInit {
  @Input() teamId: string;
  users$: Observable<User[]>;
  displayedColumns: string[] = ["displayName", "role", "uid"];

  constructor(private userservice: UserService) {}
  ngOnInit() {
    // get a observable of all probes
    console.log("teamuserlist teamId", this.teamId);
    this.users$ = this.userservice.findByTeamId(this.teamId);
    this.users$.subscribe((u) => console.log("users", u));
  }
}
