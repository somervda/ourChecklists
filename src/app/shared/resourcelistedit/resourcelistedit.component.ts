import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";
import { MatTable } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmdialogComponent } from "../../dialogs/confirmdialog/confirmdialog.component";
import { Observable } from "rxjs";
import {
  Resource,
  ResourceTypeInfo,
  ResourceStatus,
  ResourceType,
  ResourceTypeInfoItem,
} from "../../models/resource.model";
import { ResourceService } from "../../services/resource.service";
import { ResourcefinderdialogComponent } from "../../dialogs/resourcefinderdialog/resourcefinderdialog.component";
import { ResourceviewdialogComponent } from "../../dialogs/resourceviewdialog/resourceviewdialog.component";
import { HelperService } from "src/app/services/helper.service";
import { DocumentReference } from "@angular/fire/firestore";
import { first } from "rxjs/operators";

@Component({
  selector: "app-resourcelistedit",
  templateUrl: "./resourcelistedit.component.html",
  styleUrls: ["./resourcelistedit.component.scss"],
})

/**
 * Displays a table of resources based on an array of resource DocumentReferences
 * being passed to the component.
 * OnChange: a change event is generated that contains the current array of resource
 * documentreferences
 */
export class ResourcelisteditComponent implements OnInit {
  @Input() resources: DocumentReference[];
  @Input() hideCreate: boolean;
  @ViewChild(MatTable) table: MatTable<any>;
  @Output() change = new EventEmitter();
  resources$: Observable<Resource[]>;

  displayedColumns: string[] = ["name", "description", "resourceType", "id"];
  resourceTypeInfo = ResourceTypeInfo;
  ResourceStatus = ResourceStatus;

  constructor(
    public dialog: MatDialog,
    private resourceService: ResourceService,
    private helper: HelperService
  ) {}

  ngOnInit(): void {
    if (!this.resources) {
      this.resources = [];
    }
    // this.resources$ = this.resourceService.findAllIn(
    //   this.resources.map((r) => r.id)
    // );
  }

  removeResource(resource: DocumentReference) {
    console.log("removeResource", resource);
    this.helper
      .getDocRef(resource)
      .pipe(first())
      .toPromise()
      .then((r) => {
        const prompt = `Are you sure you want to remove "${r.name}" resource from the list?`;
        const dialogRef = this.dialog.open(ConfirmdialogComponent, {
          width: "300px",
          data: { heading: "Confirm", prompt: prompt },
        });
        dialogRef.afterClosed().subscribe((choice) => {
          if (choice) {
            this.resources.splice(
              this.resources.findIndex((r) => r.path == resource.path),
              1
            );
            this.refresh();
            this.change.emit(this.resources);
          }
        });
      });
  }

  addResource() {
    let refHide = [];
    if (this.resources) {
      refHide = this.resources;
    }
    if (this.resources && this.resources.length >= 10) {
      this.helper.snackbar(
        "No more resources can be added (10 max), remove an existing resource before adding another.",
        5000
      );
    } else {
      const dialogRef = this.dialog.open(ResourcefinderdialogComponent, {
        width: "380px",
        data: { refHide: refHide },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log("addResource", result);
          const newResource = this.helper.docRef("resources/" + result.id);
          if (this.resources) {
            this.resources.push(newResource);
          } else {
            this.resources = [newResource];
          }
          this.refresh();
          this.change.emit(this.resources);
        }
      });
    }
  }

  getResourceTypeInfoItem(type: ResourceType): ResourceTypeInfoItem {
    return this.resourceTypeInfo.find((info) => info.resourceType == type);
  }

  openResourceView(resource: DocumentReference) {
    console.log("openResourceView", resource);
    const dialogRef = this.dialog.open(ResourceviewdialogComponent, {
      width: "95%",
      maxWidth: "800px",
      maxHeight: "90%",
      data: { resource: resource },
      autoFocus: false,
    });
  }

  refresh() {
    this.resources$ = this.resourceService.findAllIn(
      this.resources.map((r) => r.id)
    );
    this.table.renderRows();
  }
}
