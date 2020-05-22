import { Component, OnInit, Input } from "@angular/core";
import * as firebase from "firebase/app";
import { AngularFireStorage } from "@angular/fire/storage";
import { Observable } from "rxjs";
import { ConfirmdialogComponent } from "src/app/dialogs/confirmdialog/confirmdialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-storagelist",
  templateUrl: "./storagelist.component.html",
  styleUrls: ["./storagelist.component.scss"],
})

/**
 * This component will manage files stored that are assosiated with
 * a specific docId. The docId is used to identify a unique folder
 * in the storage and files associated with this docId are stored in that storage folder.
 */
export class StoragelistComponent implements OnInit {
  @Input() docId: string;
  @Input() docType: string;
  @Input() readOnly: boolean;
  files: { name: string; url$: Observable<any> }[];
  showSpinner = false;

  constructor(private storage: AngularFireStorage, public dialog: MatDialog) {}

  ngOnInit(): void {
    // Get a list of files already in the docId fold
    const storageRef = firebase
      .storage()
      .ref(`/docs/${this.docId}/${this.docType}`);

    // Find all the items.
    const files = storageRef.listAll().then(
      (r) =>
        // r.items.forEach((element) => {
        //   console.log("element", element.name);
        // })
        (this.files = r.items.map((i) => {
          return { name: i.name, url$: this.getStorageUrl(i.name) };
        }))
    );
  }

  onUploadFile(event) {
    console.log("onUploadFile", event);
    const fileToUpload = event.target.files[0];
    this.showSpinner = true;
    const task = this.storage
      .upload(
        `docs/${this.docId}/${this.docType}/${fileToUpload.name}`,
        fileToUpload
      )
      .then((t) => {
        this.showSpinner = false;
        this.files.push({
          name: fileToUpload.name,
          url$: this.getStorageUrl(fileToUpload.name),
        });
      })
      .catch((e) => (this.showSpinner = false));
  }

  getStorageUrl(filename: string): Observable<any> {
    console.log("getStorageUrl", filename);
    return this.storage
      .ref(`docs/${this.docId}/${this.docType}/${filename}`)
      .getDownloadURL();
  }

  onDeleteFile(fileName: string) {
    console.log("onDeleteFile", fileName);
    const prompt = "Are you sure you want to delete this file: " + fileName;
    const dialogRef = this.dialog.open(ConfirmdialogComponent, {
      width: "300px",
      data: { heading: "Confirm", prompt: prompt },
    });

    dialogRef.afterClosed().subscribe((choice) => {
      if (choice) {
        this.storage
          .ref(`docs/${this.docId}/${this.docType}/${fileName}`)
          .delete()
          .toPromise()
          .then(() => {
            // clean up files array
            console.log("filedeleted");
            const filesIndex = this.files.findIndex((f) => f.name == fileName);
            console.log("filesIndex", filesIndex);
            this.files.splice(filesIndex, 1);
          })
          .catch(function (error) {
            console.error("File delete error:", error);
          });
      }
    });
  }
}
