import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import {
  Resource,
  ResourceTypeInfo,
  ResourceType,
  ResourceTypeInfoItem,
} from "../models/resource.model";
import { ResourceService } from "../services/resource.service";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-resources",
  templateUrl: "./resources.component.html",
  styleUrls: ["./resources.component.scss"],
})
export class ResourcesComponent implements OnInit {
  resources$: Observable<Resource[]>;
  displayedColumns: string[] = ["name", "description", "resourceType", "id"];

  resourceTypeInfo = ResourceTypeInfo;

  constructor(
    private resourceService: ResourceService,
    private auth: AuthService
  ) {}
  ngOnInit() {
    this.resources$ = this.resourceService.findAll(100);
  }

  getResourceTypeInfoItem(type: ResourceType): ResourceTypeInfoItem {
    return this.resourceTypeInfo.find((info) => info.resourceType == type);
  }
}
