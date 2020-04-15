import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { ActivityService } from "./activity.service";
import { Activity } from "../models/activity.model";
import { Observable } from "rxjs";
import { first, map } from "rxjs/operators";
import { Category } from "../models/category.model";
import { CategoryService } from "./category.service";

@Injectable({
  providedIn: "root",
})
export class ActivityResolver implements Resolve<Activity> {
  constructor(
    private activityService: ActivityService,
    private categoryService: CategoryService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Activity> {
    const cid = route.paramMap.get("cid");
    const aid = route.paramMap.get("aid");
    // Append the cid to the returned object
    return this.activityService.findById(cid, aid).pipe(first());
  }
}
