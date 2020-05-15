import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from "@angular/router";
import { Observable } from "rxjs";
import { ChecklistService } from "../services/checklist.service";
import { ChecklistStatus } from "../models/checklist.model";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})

/**
 * Will only allow the route to be activated if the checklist id passed in the
 * route path has one of the validStatus values
 */
export class CheckliststatusGuard implements CanActivate {
  constructor(
    private checklistService: ChecklistService,
    private router: Router
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const validStatuses = next.data["validStatuses"] as Array<ChecklistStatus>;
    const id = next.paramMap.get("id");
    // console.log(
    //   "CheckliststatusGuard",
    //   validStatuses,
    //   id,
    //   this.checklistService
    // );
    return this.checklistService.findById(id).pipe(
      map((c) => {
        if (!validStatuses.includes(c.status)) {
          this.router.navigateByUrl("notAuthorized");
        }
        return true;
      })
    );
  }
}
