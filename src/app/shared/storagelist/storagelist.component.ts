import { Component, OnInit, Input } from "@angular/core";
import * as firebase from "firebase/app";

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
  files: string[];

  constructor() {}

  ngOnInit(): void {
    // Get a list of files already in the docId fold
    const storageRef = firebase.storage().ref(`/docs/${this.docId}`);

    // Find all the items.
    const files = storageRef.listAll().then(
      (r) =>
        // r.items.forEach((element) => {
        //   console.log("element", element.name);
        // })
        (this.files = r.items.map((i) => i.name))
    );
  }
}
