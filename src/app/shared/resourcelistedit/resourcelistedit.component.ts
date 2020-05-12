import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";
import { MatTable } from "@angular/material/table";
import { DocRef } from "../../models/helper.model";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
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

@Component({
  selector: "app-resourcelistedit",
  templateUrl: "./resourcelistedit.component.html",
  styleUrls: ["./resourcelistedit.component.scss"],
})
export class ResourcelisteditComponent implements OnInit {
  @Input() resources: DocRef[];
  @Input() hideCreate: boolean;
  @ViewChild(MatTable) table: MatTable<any>;
  @Output() change = new EventEmitter();
  resources$: Observable<Resource[]>;

  displayedColumns: string[] = ["name", "description", "resourceType", "id"];
  resourceTypeInfo = ResourceTypeInfo;
  ResourceStatus = ResourceStatus;

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private resourceService: ResourceService
  ) {}

  ngOnInit(): void {
    if (!this.resources) {
      this.resources = [];
    }
    this.resources$ = this.resourceService.findAllIn(
      this.resources.map((r) => r.id)
    );
  }

  removeResource(resource: Resource) {
    const prompt = `Are you sure you want to remove "${resource.name}" resource from the list?`;
    const dialogRef = this.dialog.open(ConfirmdialogComponent, {
      width: "300px",
      data: { heading: "Confirm", prompt: prompt },
    });
    dialogRef.afterClosed().subscribe((choice) => {
      if (choice) {
        this.resources.splice(
          this.resources.findIndex((r) => r.id == resource.id),
          1
        );
        this.refresh();
        this.change.emit(this.resources);
      }
    });
  }

  addResource() {
    if (this.resources && this.resources.length >= 10) {
      this.snackBar.open(
        "No more resources can be added (10 max), remove an existing resource before adding another.",
        "",
        {
          duration: 5000,
        }
      );
    } else {
      const dialogRef = this.dialog.open(ResourcefinderdialogComponent, {
        width: "380px",
        data: { idHide: this.resources.map((r) => r.id) },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log("addResource", result);
          const newResource: DocRef = {
            id: result.id,
            name: result.name,
          };
          this.resources.push(newResource);

          this.refresh();
          this.change.emit(this.resources);
        }
      });
    }
  }

  getResourceTypeInfoItem(type: ResourceType): ResourceTypeInfoItem {
    return this.resourceTypeInfo.find((info) => info.resourceType == type);
  }

  openResourceView(resource) {
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
