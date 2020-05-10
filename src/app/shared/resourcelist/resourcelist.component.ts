import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import {
  Resource,
  ResourceTypeInfo,
  ResourceType,
  ResourceStatus,
  ResourceTypeInfoItem,
} from "../../models/resource.model";

@Component({
  selector: "app-resourcelist",
  templateUrl: "./resourcelist.component.html",
  styleUrls: ["./resourcelist.component.scss"],
})
export class ResourcelistComponent implements OnInit {
  @Input() resources$: Observable<Resource[]>;
  displayedColumns: string[] = ["name", "description", "resourceType"];
  resourceTypeInfo = ResourceTypeInfo;
  ResourceStatus = ResourceStatus;

  constructor() {}

  async ngOnInit() {}

  // getChecklistLinkAction(
  //   checklist: Checklist
  // ): { link: string; tooltip: string } {
  //   let linkAction = { link: "", tooltip: "" };
  //   if (
  //     !this.auth.currentUser.isAdmin &&
  //     !checklist.assignee.find((u) => this.auth.currentUser.uid == u.uid)
  //   ) {
  //     // Not in the assignee lists and not admin so can only view
  //     linkAction.link = `/checklist/${checklist.id}`;
  //     linkAction.tooltip = "View Checklist";
  //   }
  //   switch (checklist.status) {
  //     case ChecklistStatus.UnderConstruction:
  //       // Design only option in underconstruction
  //       linkAction.link = `/checklistdesign/${checklist.id}`;
  //       linkAction.tooltip = "Design the Checklist";
  //       break;
  //     case ChecklistStatus.Active:
  //       // NChecklist is ready to be filled in
  //       linkAction.link = `/checklistedit/${checklist.id}`;
  //       linkAction.tooltip = "Edit/fill-in the Checklist";
  //       break;
  //     case ChecklistStatus.Complete:
  //     case ChecklistStatus.Done:
  //       // Can view and update the status depending on role
  //       linkAction.link = `/checklist/${checklist.id}`;
  //       linkAction.tooltip = "Review Checklist";
  //       break;
  //     case ChecklistStatus.Deleted:
  //       // NDeleted checklists can only be viewed , and only by admins (Not shown in lists for non-admins)
  //       linkAction.link = `/checklist/${checklist.id}`;
  //       linkAction.tooltip = "View Deleted Checklist";
  //       break;
  //   }

  //   return linkAction;
  // }
  // getChecklistStatusInfoItem(status: ChecklistStatus): ChecklistStatusInfoItem {
  //   return ChecklistStatusInfo.find((clsii) => clsii.status == status);
  // }
  getResourceTypeInfoItem(type: ResourceType): ResourceTypeInfoItem {
    return this.resourceTypeInfo.find((info) => info.resourceType == type);
  }
}
