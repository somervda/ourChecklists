import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { ChecklistService } from "./checklist.service";
import { Checklist } from "../models/checklist.model";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ChecklistResolver implements Resolve<Checklist> {
  constructor(private checklistService: ChecklistService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Checklist> {
    const id = route.paramMap.get("id");
    return this.checklistService.findById(id).pipe(first());
  }
}
