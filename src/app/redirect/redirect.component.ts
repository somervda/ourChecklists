import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HelperService } from "../services/helper.service";

@Component({
  selector: "app-redirect",
  templateUrl: "./redirect.component.html",
  styleUrls: ["./redirect.component.scss"],
})
export class RedirectComponent implements OnInit {
  constructor(private route: ActivatedRoute, private helper: HelperService) {}

  ngOnInit(): void {
    console.log("this.route.snapshot", this.route.snapshot);
    const component = this.route.snapshot.params["component"];
    const id = this.route.snapshot.params["id"];
    this.helper.redirect(component + "/" + id);
  }
}
