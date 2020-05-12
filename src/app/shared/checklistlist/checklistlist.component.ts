import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import {
  Checklist,
  ChecklistStatusInfo,
  ChecklistStatus,
  ChecklistStatusInfoItem,
} from "../../models/checklist.model";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-checklistlist",
  templateUrl: "./checklistlist.component.html",
  styleUrls: ["./checklistlist.component.scss"],
})
export class ChecklistlistComponent implements OnInit {
  @Input() checklists$: Observable<Checklist[]>;
  @Input() hideCreate: boolean;
  displayedColumns: string[] = ["name", "description", "status", "team"];

  constructor(private auth: AuthService) {}

  async ngOnInit() {
    await this.waitForCurrentUser();
  }

  getChecklistLinkAction(
    checklist: Checklist
  ): { link: string; tooltip: string } {
    let linkAction = { link: "", tooltip: "" };
    // console.log("getChecklistLinkAction", checklist);
    if (
      !this.auth.currentUser.isAdmin &&
      !checklist.assignee.find((u) => this.auth.currentUser.uid == u.uid)
    ) {
      // Not in the assignee lists and not admin so can only view
      linkAction.link = `/checklist/${checklist.id}`;
      linkAction.tooltip = "View Checklist";
    }
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

    return linkAction;
  }
  getChecklistStatusInfoItem(status: ChecklistStatus): ChecklistStatusInfoItem {
    return ChecklistStatusInfo.find((clsii) => clsii.status == status);
  }

  async waitForCurrentUser() {
    let waitMS = 5000;
    while (!this.auth.currentUser && waitMS > 0) {
      console.log("Waiting for user to show up!");
      await this.sleep(200);
      waitMS -= 200;
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
