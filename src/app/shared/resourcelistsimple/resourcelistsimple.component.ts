import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import {
  Resource,
  ResourceTypeInfo,
  ResourceStatus,
  ResourceType,
  ResourceTypeInfoItem,
} from "src/app/models/resource.model";
import { ResourceviewdialogComponent } from "src/app/dialogs/resourceviewdialog/resourceviewdialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-resourcelistsimple",
  templateUrl: "./resourcelistsimple.component.html",
  styleUrls: ["./resourcelistsimple.component.scss"],
})

/**
 * Show a list of resources as a simple comma delimited lists
 * where you can click on the name to see a popup dialog with resource details
 */
export class ResourcelistsimpleComponent implements OnInit {
  @Input() resources$: Observable<Resource[]>;
  resourceTypeInfo = ResourceTypeInfo;
  ResourceStatus = ResourceStatus;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {}

  getResourceTypeInfoItem(type: ResourceType): ResourceTypeInfoItem {
    return this.resourceTypeInfo.find((info) => info.resourceType == type);
  }

  openResourceView(resource) {
    console.log("openResourceView", resource);
    const dialogRef = this.dialog.open(ResourceviewdialogComponent, {
      width: "95%",
      maxWidth: "800px",
      maxHeight: "90%",
      data: { resource: resource },
      autoFocus: false,
    });
  }
}
