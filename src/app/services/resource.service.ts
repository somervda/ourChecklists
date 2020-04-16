import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Resource } from "../models/resource.model";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ResourceService {
  constructor(private afs: AngularFirestore) {}

  findById(id: string): Observable<Resource> {
    return this.afs
      .doc("/resources/" + id)
      .snapshotChanges()
      .pipe(
        map((snap) => {
          return convertSnap<Resource>(snap);
        })
      );
  }

  findAll(pageSize: number): Observable<Resource[]> {
    // console.log( "team findAll",  pageSize  );
    return this.afs
      .collection("resources", (ref) => ref.limit(pageSize))
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("findDevices", convertSnaps<Device>(snaps));
          return convertSnaps<Resource>(snaps);
        })
      );
  }

  fieldUpdate(docId: string, fieldName: string, newValue: any) {
    if (docId && fieldName) {
      const updateObject = {};
      dbFieldUpdate("/resources/" + docId, fieldName, newValue, this.afs);
    }
  }

  create(resource: Resource): Promise<DocumentReference> {
    return this.afs.collection("resources").add(resource);
  }

  delete(id: string): Promise<void> {
    return this.afs.collection("resources").doc(id).delete();
  }
}
