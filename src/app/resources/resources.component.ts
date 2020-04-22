import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import {
  Resource,
  ResourceTypeInfo,
  ResourceType,
  ResourceStatus,
  ResourceTypeInfoItem,
} from "../models/resource.model";
import { ResourceService } from "../services/resource.service";
import { AuthService } from "../services/auth.service";
import { map } from "rxjs/operators";
import { RippleRef } from "@angular/material/core";

@Component({
  selector: "app-resources",
  templateUrl: "./resources.component.html",
  styleUrls: ["./resources.component.scss"],
})
export class ResourcesComponent implements OnInit {
  resources$: Observable<Resource[]>;
  displayedColumns: string[] = ["name", "description", "resourceType", "id"];
  showSuperseded = false;
  showUrl = true;
  showYouTube = true;
  showFile = true;
  showMarkdown = true;
  showImage = true;

  resourceTypeInfo = ResourceTypeInfo;
  ResourceStatus = ResourceStatus;

  constructor(
    private resourceService: ResourceService,
    private auth: AuthService
  ) {}
  ngOnInit() {
    this.getResourceList();
  }

  getResourceList() {
    this.resources$ = this.resourceService
      .findAll(100)
      .pipe(map((r) => r.filter((ri) => this.showResource(ri))));
  }

  showResource(ri: Resource): boolean {
    const selector =
      ((this.showSuperseded && ri.status == ResourceStatus.superseded) ||
        ri.status == ResourceStatus.active ||
        ri.status == ResourceStatus.needsReview) &&
      ((this.showUrl && ri.resourceType == ResourceType.url) ||
        (this.showYouTube && ri.resourceType == ResourceType.youtubeId) ||
        (this.showFile && ri.resourceType == ResourceType.file) ||
        (this.showMarkdown && ri.resourceType == ResourceType.markdown) ||
        (this.showImage && ri.resourceType == ResourceType.image));
    return selector;
  }

  getResourceTypeInfoItem(type: ResourceType): ResourceTypeInfoItem {
    return this.resourceTypeInfo.find((info) => info.resourceType == type);
  }
}
