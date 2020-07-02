import { Component, OnInit, Input, Output, Inject } from "@angular/core";
import { ResourceService } from "../../services/resource.service";
import { Observable } from "rxjs";
import { Resource, ResourceStatus } from "../../models/resource.model";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DocumentReference } from "@angular/fire/firestore";
import { HelperService } from "src/app/services/helper.service";
import { CategoryService } from "src/app/services/category.service";
import { Category } from "src/app/models/category.model";

@Component({
  selector: "app-resourcefinderdialog",
  templateUrl: "./resourcefinderdialog.component.html",
  styleUrls: ["./resourcefinderdialog.component.scss"],
})

/**
 * Used to select a resource, response selected gets returned as
 * a resource object. The list of resources displayed can be modified
 * to show resources that don't match the refHide array of resource DocumentReferences
 */
export class ResourcefinderdialogComponent implements OnInit {
  constructor(
    private resourceService: ResourceService,
    private dialogRef: MatDialogRef<ResourcefinderdialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private helper: HelperService,
    private categoryService: CategoryService
  ) {}
  refHide: DocumentReference[];
  resources$: Observable<Resource[]>;
  selectedResource: Resource;
  categories$: Observable<Category[]>;
  selectedCategory = "All";
  selectedName = "";

  ngOnInit(): void {
    if (this.data.refHide) {
      this.refHide = this.data.refHide;
    }
    console.log("resourcefinderdialog refHide:", this.refHide);

    this.resources$ = this.resourceService.findByPartialName("");
    this.categories$ = this.categoryService.findAll(100);
  }

  onKey(event: any) {
    // console.log("searchName", event.target.value);
    this.selectedName = event.target.value;
    this.updateResources();
  }

  updateResources() {
    if (this.selectedCategory == "All") {
      this.resources$ = this.resourceService.findByPartialName(
        this.selectedName
      );
    } else {
      this.resources$ = this.resourceService.findAllFiltered(
        this.selectedName,
        "Category",
        this.helper.docRef(`/categories/${this.selectedCategory}`),
        100
      );
    }
  }

  onCategoryChange(value) {
    console.log("onCategoryChange ", event);
    this.selectedCategory = value;
    this.updateResources();
  }

  isHidden(resource: Resource) {
    if (
      resource.status == ResourceStatus.superseded ||
      resource.status == ResourceStatus.inactive
    ) {
      return true;
    }
    if (this.refHide) {
      return (
        this.refHide.findIndex(
          (r) => this.helper.docRef(`resources/${resource.id}`).path == r.path
        ) > -1
      );
    }
    return false;
  }

  onResourceSelected(resource: Resource) {
    console.log("onResourceSelected", resource);
    this.selectedResource = resource;
  }

  shortDescription(resource: Resource, maxLength: number = 40) {
    let desc = "";
    // if (resource.category && resource.category.name) {
    //   title += resource.category.name + ": ";
    // }

    if (resource.description.length < maxLength) {
      desc += resource.description;
    } else {
      desc += resource.description.substr(0, maxLength) + "...";
    }
    return desc;
  }

  returnResource() {
    this.dialogRef.close(this.selectedResource);
  }
}
