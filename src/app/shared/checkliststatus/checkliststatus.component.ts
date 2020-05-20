import { Component, OnInit, Input } from "@angular/core";
import { HelperService } from "src/app/services/helper.service";
import { Checklist } from "src/app/models/checklist.model";
import { AuthService } from "src/app/services/auth.service";
import { first } from "rxjs/operators";

@Component({
  selector: "app-checkliststatus",
  templateUrl: "./checkliststatus.component.html",
  styleUrls: ["./checkliststatus.component.scss"],
})
export class CheckliststatusComponent implements OnInit {
  // @Input() checklist: Checklist;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    console.log("Hi1");
    this.auth.user$
      .pipe(first())
      .toPromise()
      .then((u) => {
        console.log("CheckliststatusComponent", u);
      });

    console.log("Hi2");
  }
}
