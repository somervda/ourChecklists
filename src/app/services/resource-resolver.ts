import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";
import { ResourceService } from "./resource.service";
import { Resource } from "../models/resource.model";

@Injectable({
  providedIn: "root",
})
export class ResourceResolver implements Resolve<Resource> {
  constructor(private resourceService: ResourceService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Resource> {
    const id = route.paramMap.get("id");
    return this.resourceService.findById(id).pipe(first());
  }
}
