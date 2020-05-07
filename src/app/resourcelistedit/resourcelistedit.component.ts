import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";
import { MatTable } from "@angular/material/table";
import { DocRef } from "../models/helper.model";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmdialogComponent } from "../confirmdialog/confirmdialog.component";
import { Observable } from "rxjs";
import {
  Resource,
  ResourceTypeInfo,
  ResourceStatus,
  ResourceType,
  ResourceTypeInfoItem,
} from "../models/resource.model";
import { ResourceService } from "../services/resource.service";
import { ResourcefinderComponent } from "../resourcefinder/resourcefinder.component";

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
    // dialogRef.afterClosed().subscribe((choice) => {
    //   if (choice) {
    //     this.users.splice(
    //       this.users.findIndex((u) => u.uid == uid),
    //       1
    //     );
    //     this.table.renderRows();
    //     this.change.emit(this.users);
    //   }
    // });
  }

  addResource() {
    if (this.resources.length >= 10) {
      this.snackBar.open(
        "No more resources can be added (10 max), remove and existing resource before adding another.",
        "",
        {
          duration: 5000,
        }
      );
    } else {
      const dialogRef = this.dialog.open(ResourcefinderComponent, {
        width: "380px",
        data: { idHide: this.resources.map((r) => r.id) },
      });
      //     dialogRef.afterClosed().subscribe((result) => {
      //       if (result) {
      //         console.log("addUser", result);
      //         const newUser: UserRef = {
      //           uid: result.uid,
      //           displayName: result.displayName,
      //         };
      //         this.users.push(newUser);
      //         this.table.renderRows();
      //         this.change.emit(this.users);
      //       }
      //     });
    }
  }

  getResourceTypeInfoItem(type: ResourceType): ResourceTypeInfoItem {
    return this.resourceTypeInfo.find((info) => info.resourceType == type);
  }

  refresh() {
    this.resources$ = this.resourceService.findAllIn(
      this.resources.map((r) => r.id)
    );
    this.table.renderRows();
  }
}
