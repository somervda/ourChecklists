import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import {
  Resource,
  ResourceTypeInfo,
  ResourceType,
  ResourceStatus,
  ResourceTypeInfoItem,
} from "../../models/resource.model";
import { ResourceviewdialogComponent } from "src/app/dialogs/resourceviewdialog/resourceviewdialog.component";
import { MatDialog } from "@angular/material/dialog";

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

  constructor(public dialog: MatDialog) {}

  async ngOnInit() {}

  getResourceTypeInfoItem(type: ResourceType): ResourceTypeInfoItem {
    return this.resourceTypeInfo.find((info) => info.resourceType == type);
  }

  openResourceView(resource) {
    const dialogRef = this.dialog.open(ResourceviewdialogComponent, {
      width: "95%",
      maxWidth: "800px",
      maxHeight: "90%",
      data: { resource: resource },
    });
  }
}
