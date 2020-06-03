import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { HelperService } from "src/app/services/helper.service";
import { ResourceType } from "src/app/models/resource.model";

@Component({
  selector: "app-resourcecontentviewdialog",
  templateUrl: "./resourcecontentviewdialog.component.html",
  styleUrls: ["./resourcecontentviewdialog.component.scss"],
})
export class ResourcecontentviewdialogComponent implements OnInit {
  content: string;
  resourceType: ResourceType;
  description: string;
  name: string;
  ResourceType = ResourceType;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ResourcecontentviewdialogComponent>,
    private helper: HelperService
  ) {}

  ngOnInit(): void {
    this.content = this.data["content"];
    this.resourceType = this.data["resourceType"];
    this.description = this.data["description"];
    this.name = this.data["name"];
  }

  iconAction(value) {
    // console.log("iconAction:", value, ":");
    switch (value) {
      case "close":
        this.dialogRef.close();
        break;
    }
  }
}
