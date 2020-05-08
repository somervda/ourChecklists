import { Component, OnInit, Input, Output, Inject } from "@angular/core";
import { ResourceService } from "../services/resource.service";
import { Observable } from "rxjs";
import { Resource, ResourceStatus } from "../models/resource.model";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-resourcefinder",
  templateUrl: "./resourcefinder.component.html",
  styleUrls: ["./resourcefinder.component.scss"],
})
export class ResourcefinderComponent implements OnInit {
  constructor(
    private resourceService: ResourceService,
    private dialogRef: MatDialogRef<ResourcefinderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  idHide: string[];
  // @Output() resourceSelected: EventEmitter<any> = new EventEmitter();
  resources$: Observable<Resource[]>;
  selectedResource: Resource;

  ngOnInit(): void {
    if (this.data.idHide) {
      this.idHide = this.data.idHide;
    }
    console.log("resourcefinder idHide:", this.idHide);

    this.resources$ = this.resourceService.findByPartialName("");
  }

  onKey(event: any) {
    // console.log("searchName", event.target.value);
    this.resources$ = this.resourceService.findByPartialName(
      event.target.value
    );
  }

  isHidden(resource: Resource) {
    if (
      resource.status == ResourceStatus.superseded ||
      resource.status == ResourceStatus.inactive
    ) {
      return true;
    }
    if (this.idHide) {
      return this.idHide.includes(resource.id);
    }
    return false;
  }

  onResourceSelected(resource: Resource) {
    console.log("onResourceSelected", resource);
    this.selectedResource = resource;
  }

  resourceTitle(resource: Resource) {
    let title = "";
    if (resource.category && resource.category.name) {
      title += resource.category.name + ": ";
    }
    if (resource.description.length < 40) {
      title += resource.description;
    } else {
      title += resource.description.substr(0, 40) + "...";
    }
    return title;
  }

  returnResource() {
    this.dialogRef.close(this.selectedResource);
  }
}
