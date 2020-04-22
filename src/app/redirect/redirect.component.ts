import { Component, OnInit, NgZone } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-redirect",
  templateUrl: "./redirect.component.html",
  styleUrls: ["./redirect.component.scss"],
})
export class RedirectComponent implements OnInit {
  constructor(
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log("this.route.snapshot", this.route.snapshot);
    const component = this.route.snapshot.params["component"];
    const id = this.route.snapshot.params["id"];
    this.ngZone.run(() => this.router.navigateByUrl(component + "/" + id));
  }
}
