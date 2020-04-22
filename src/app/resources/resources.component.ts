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
import { MatSnackBar } from "@angular/material/snack-bar";
import { TeamService } from "../services/team.service";
import { Team } from "../models/team.model";
import { CategoryService } from "../services/category.service";
import { Category } from "../models/category.model";
import { UserService } from "../services/user.service";
import { User } from "../models/user.model";

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
  maxToRetrieve = 100;
  nameFilter = "";
  teamFilter = "";
  categoryFilter = "";
  ownerFilter = "";
  reviewerFilter = "";
  filterType = "Team";
  teams$: Observable<Team[]>;
  categories$: Observable<Category[]>;
  users$: Observable<User[]>;

  resourceTypeInfo = ResourceTypeInfo;
  ResourceStatus = ResourceStatus;

  constructor(
    private resourceService: ResourceService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private teamService: TeamService,
    private categoryService: CategoryService,
    private userService: UserService
  ) {}
  ngOnInit() {
    this.teams$ = this.teamService.findAll(100);
    this.categories$ = this.categoryService.findAll(100);
    this.users$ = this.userService.findByPartialName("", 100);
    this.getResourceList();
  }

  getResourceList() {
    let filter = "";
    switch (this.filterType) {
      case "Team":
        filter = this.teamFilter;
        break;
      case "Category":
        filter = this.categoryFilter;
        break;
      case "Owner":
        filter = this.ownerFilter;
        break;
      case "Reviewer":
        filter = this.reviewerFilter;
        break;
    }
    this.resources$ = this.resourceService
      .findAllFiltered(
        this.nameFilter,
        this.filterType,
        filter,
        this.maxToRetrieve
      )
      .pipe(
        map((r) => {
          // Show message if it looks like we hit the max retrieval limit
          if (r.length == this.maxToRetrieve) {
            this.snackBar.open(
              `More than the limit of ${this.maxToRetrieve} resources found. Try adding filters to keep within the data retrieval limit. `,
              "",
              {
                duration: 5000,
              }
            );
          }
          return r.filter((ri) => this.showResource(ri));
        })
      );
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

  onNameKey(event: any) {
    console.log("searchName", event.target.value);
    this.nameFilter = event.target.value;
    this.getResourceList();
  }

  getResourceTypeInfoItem(type: ResourceType): ResourceTypeInfoItem {
    return this.resourceTypeInfo.find((info) => info.resourceType == type);
  }
}
