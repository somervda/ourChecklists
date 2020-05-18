import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Resource, ResourceType } from "../../models/resource.model";
import { AngularFireStorage } from "@angular/fire/storage";
import { Observable } from "rxjs";

@Component({
  selector: "app-resourceviewdialog",
  templateUrl: "./resourceviewdialog.component.html",
  styleUrls: ["./resourceviewdialog.component.scss"],
})
export class ResourceviewdialogComponent implements OnInit {
  resource: Resource;
  ResourceType = ResourceType;
  downloadUrl$: Observable<string>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ResourceviewdialogComponent>,
    private storage: AngularFireStorage
  ) {}

  ngOnInit(): void {
    if (this.data.resource) {
      this.resource = this.data.resource;
      if (
        this.resource.resourceType == ResourceType.file ||
        this.resource.resourceType == ResourceType.image
      ) {
        // get downloadUrl
        console.log(
          "getref:",
          `resources/${this.resource.id}/${this.resource.content}`
        );
        this.downloadUrl$ = this.storage
          .ref(`resources/${this.resource.id}/${this.resource.content}`)
          .getDownloadURL();
      }
    }
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
