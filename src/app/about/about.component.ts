import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { HelperService } from "../services/helper.service";

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.scss"],
})
export class AboutComponent implements OnInit {
  docRef: any;
  constructor(private afs: AngularFirestore, private helper: HelperService) {}

  ngOnInit() {
    this.docRef = this.afs.doc("categories/5WKWyqynskw7xMLgdtXq").ref;
    console.log(this.helper.getDocRefId(this.docRef));
    console.log("about", this.docRef);
  }
}
