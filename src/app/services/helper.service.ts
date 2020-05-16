import { Injectable } from "@angular/core";
import { UserRef, DocRef } from "../models/helper.model";

@Injectable({
  providedIn: "root",
})
export class HelperService {
  constructor() {}

  userRefToDocRef(userRef: UserRef[]): DocRef[] {
    return userRef.map((a) => {
      return { id: a.uid, name: a.displayName };
    });
  }
}
