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
import { AuthService } from "../services/auth.service";
import { HelperService } from "../services/helper.service";

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
    private router: Router,
    private auth: AuthService,
    private helper: HelperService
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
    console.log(
      "CheckliststatusGuard validStatuses:",
      validStatuses,
      " next:",
      next,
      " id:",
      id
    );
    return this.checklistService.findById(id).pipe(
      map((c) => {
        if (
          c.isTemplate &&
          next.routeConfig.path == "checklistdesign/:id" &&
          (this.auth.currentUser?.isAdmin ||
            this.auth.currentUser?.isTemplateManager)
        ) {
          return true;
        }
        if (validStatuses && !validStatuses.includes(c.status)) {
          this.router.navigateByUrl("notAuthorized");
        }

        const userRef = this.helper.docRef(
          "users/" + this.auth.currentUser?.uid
        );

        // Only assignee or admin  or team manager have access checklistdesign or checklistedit
        if (
          next.routeConfig.path == "checklistdesign/:id" ||
          next.routeConfig.path == "checklistedit/:id"
        ) {
          if (
            this.auth.currentUser?.isAdmin ||
            (this.auth.currentUser &&
              this.auth.currentUser.managerOfTeams &&
              this.auth.currentUser.managerOfTeams.includes(
                this.helper.getDocRefId(c.team)
              )) ||
            c.assignee.find((a) => a.path == userRef.path)
          ) {
            return true;
          }
        }
        //  assignee or admin  or team manager or team reviewer  or teamMember have access checklist
        if (next.routeConfig.path == "checklist/:id") {
          if (
            this.auth.currentUser?.isAdmin ||
            (this.auth.currentUser &&
              this.auth.currentUser.managerOfTeams &&
              this.auth.currentUser.managerOfTeams.includes(
                this.helper.getDocRefId(c.team)
              )) ||
            c.assignee.find((a) => a.path == userRef.path) ||
            (this.auth.currentUser &&
              this.auth.currentUser.memberOfTeams &&
              this.auth.currentUser.memberOfTeams.includes(
                this.helper.getDocRefId(c.team)
              )) ||
            (this.auth.currentUser &&
              this.auth.currentUser.reviewerOfTeams &&
              this.auth.currentUser.reviewerOfTeams.includes(
                this.helper.getDocRefId(c.team)
              ))
          ) {
            return true;
          }
        }

        this.router.navigateByUrl("notAuthorized");
        return false;
      })
    );
  }
}
