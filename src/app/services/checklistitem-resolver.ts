import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { ChecklistitemService } from "./checklistitem.service";
import { Checklistitem } from "../models/checklistitem.model";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ChecklistitemResolver implements Resolve<Checklistitem> {
  constructor(private checklistitemService: ChecklistitemService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Checklistitem> {
    // console.log(
    //   "ChecklistitemResolver :",
    //   route.paramMap.get("cid"),
    //   route.paramMap.get("clid")
    // );
    return this.checklistitemService
      .findById(route.paramMap.get("cid"), route.paramMap.get("clid"))
      .pipe(first());
  }
}
