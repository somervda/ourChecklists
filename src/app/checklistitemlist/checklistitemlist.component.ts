import { Component, OnInit, Input } from "@angular/core";
import { Checklist, ChecklistStatus } from "../models/checklist.model";
import { Checklistitem } from "../models/checklistitem.model";
import { Observable } from "rxjs";
import { ChecklistitemService } from "../services/checklistitem.service";

@Component({
  selector: "app-checklistitemlist",
  templateUrl: "./checklistitemlist.component.html",
  styleUrls: ["./checklistitemlist.component.scss"],
})
export class ChecklistitemlistComponent implements OnInit {
  @Input() checklist: Checklist;
  @Input() hideCreate: boolean;
  displayedColumns: string[] = ["name"];
  ChecklistStatus = ChecklistStatus;
  checklistitems$: Observable<Checklistitem[]>;

  constructor(private checklistitemService: ChecklistitemService) {}

  async ngOnInit() {
    // await this.waitForCurrentUser();
    this.checklistitems$ = this.checklistitemService.findAll(this.checklist.id);
  }

  getChecklistitemLinkAction(
    checklistitem: Checklistitem
  ): { link: string; tooltip: string } {
    let linkAction = { link: "", tooltip: "" };
    switch (this.checklist.status) {
      case ChecklistStatus.UnderConstruction:
        // Item Design only option in underconstruction
        linkAction.link = `/checklist/${this.checklist.id}/checklistitemdesign/${checklistitem.id}`;
        linkAction.tooltip = "Design the Checklist Item";
        break;
      case ChecklistStatus.Active:
        // Checklist item is ready to be filled in
        linkAction.link = `/checklist/${this.checklist.id}/checklistitemedit/${checklistitem.id}`;
        linkAction.tooltip = "Edit/fill-in the Checklist Item";
        break;
      case ChecklistStatus.Complete:
      case ChecklistStatus.Done:
        // Can view
        linkAction.link = `/checklist/${this.checklist.id}/checklistitemview/${checklistitem.id}`;
        linkAction.tooltip = "Review Checklist Item Details";
        break;
      case ChecklistStatus.Deleted:
        // Deleted checklists can only be viewed , and only by admins (Not shown in lists for non-admins)
        linkAction.link = `/checklist/${this.checklist.id}/checklistitemview/${checklistitem.id}`;
        linkAction.tooltip = "View Deleted Checklist";
        break;
    }

    return linkAction;
  }

  // async waitForCurrentUser() {
  //   let waitMS = 5000;
  //   while (!this.auth.currentUser && waitMS > 0) {
  //     console.log("Waiting for user to show up!");
  //     await this.sleep(200);
  //     waitMS -= 200;
  //   }
  // }

  // sleep(ms) {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // }
}
