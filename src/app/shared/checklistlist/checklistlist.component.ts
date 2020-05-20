import { HelperService } from "./../../services/helper.service";
import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Checklist, ChecklistStatus } from "../../models/checklist.model";
import { AuthService } from "../../services/auth.service";
import { first } from "rxjs/operators";

@Component({
  selector: "app-checklistlist",
  templateUrl: "./checklistlist.component.html",
  styleUrls: ["./checklistlist.component.scss"],
})
export class ChecklistlistComponent implements OnInit {
  @Input() checklists$: Observable<Checklist[]>;
  @Input() hideCreate: boolean;
  displayedColumns: string[] = [
    "name",
    "status",
    "description",
    "team",
    "viewprint",
  ];
  isAdmin: Boolean;
  uid: String;

  constructor(private auth: AuthService, public helper: HelperService) {}

  ngOnInit() {
    this.auth.user$
      .pipe(first())
      .toPromise()
      .then((u) => {
        this.isAdmin = u.isAdmin;
        this.uid = u.uid;
      });
  }

  getChecklistLinkAction(
    checklist: Checklist
  ): { link: string; tooltip: string } {
    let linkAction = { link: "", tooltip: "" };
    // console.log("getChecklistLinkAction", checklist);
    if (this.isAdmin || checklist.assignee.find((u) => this.uid == u.uid)) {
      switch (checklist.status) {
        case ChecklistStatus.UnderConstruction:
          // Design only option in underconstruction
          linkAction.link = `/checklistdesign/${checklist.id}`;
          linkAction.tooltip = "Design the Checklist";
          break;
        case ChecklistStatus.Active:
          // NChecklist is ready to be filled in
          linkAction.link = `/checklistedit/${checklist.id}`;
          linkAction.tooltip = "Edit/fill-in the Checklist";
          break;
        case ChecklistStatus.Complete:
        case ChecklistStatus.Done:
          // Can view and update the status depending on role
          linkAction.link = `/checklist/${checklist.id}`;
          linkAction.tooltip = "Review Checklist";
          break;
        case ChecklistStatus.Deleted:
          // NDeleted checklists can only be viewed , and only by admins (Not shown in lists for non-admins)
          linkAction.link = `/checklist/${checklist.id}`;
          linkAction.tooltip = "View Deleted Checklist";
          break;
      }
    } else {
      // Not in the assignee lists and not admin so can only view
      linkAction.link = `/checklist/${checklist.id}`;
      linkAction.tooltip = "View Checklist";
    }

    return linkAction;
  }
}
