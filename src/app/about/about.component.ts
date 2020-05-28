import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.scss"],
})
export class AboutComponent implements OnInit {
  docRef: any;
  constructor(private afs: AngularFirestore) {}

  ngOnInit() {
    this.docRef = this.afs.doc("categories/5WKWyqynskw7xMLgdtX").ref;
    console.log("about", this.docRef);
  }
}
