import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { Observable } from "rxjs";
import { take, tap, map } from "rxjs/operators";
import { User } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class permissionGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    let permissions = route.data["permissions"] as Array<string>;
    // console.log("permissionGuard", permissions);
    return this.auth.user$.pipe(
      take(1),
      tap((u: User) => {
        // If the user does not have required access then redirect
        // console.log("u tap:", u);
        if (!u) this.router.navigateByUrl("login");
        // Check if any permission is meet
        let isPermitted = false;
        permissions.forEach((permission) => {
          //   console.log("isPermitted: ", permission, u[permission], isPermitted);
          if (u[permission]) isPermitted = true;
        });

        if (!isPermitted) {
          this.router.navigateByUrl("notAuthorized");
        }
      }),
      map((u: User) => !!u)
    );
  }
}
