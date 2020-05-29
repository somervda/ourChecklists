import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  DocumentReference,
  CollectionReference,
} from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Resource } from "../models/resource.model";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";
import { map, first } from "rxjs/operators";
import * as firebase from "firebase";

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
        }),
        first()
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

  findAllIn(resources: string[]): Observable<Resource[]> {
    // console.log("resource findAllIn", resources);
    if (resources && resources.length > 0) {
      return this.afs
        .collection("resources", (ref) =>
          ref.where(firebase.firestore.FieldPath.documentId(), "in", resources)
        )
        .snapshotChanges()
        .pipe(
          map((snaps) => {
            // console.log("findDevices", convertSnaps<Device>(snaps));
            return convertSnaps<Resource>(snaps);
          })
        );
    }
    return null;
  }

  findAllFiltered(
    name: string,
    filterType: string,
    filter: DocumentReference,
    pageSize: number
  ): Observable<Resource[]> {
    // console.log(
    //   "findAllFiltered",
    //   name,
    //   " filterType:",
    //   filterType,
    //   " filter:",
    //   filter,
    //   " pagesize:",
    //   pageSize
    // );
    console.log("hi cl");
    return this.afs
      .collection("resources", (ref) => {
        let refVal = ref as any;
        if (name == "") {
          refVal = refVal.where("name", ">=", name);
        } else {
          refVal = refVal
            .where("name", ">=", name)
            .where("name", "<=", name + "~");
        }
        if (filterType == "Team" && filter != null) {
          refVal = refVal.where("team", "==", filter);
        }
        if (filterType == "Category" && filter != null) {
          refVal = refVal.where("category", "==", filter);
        }
        if (filterType == "Owner" && filter != null) {
          // console.log("owner", filter);
          refVal = refVal.where("owner", "==", filter);
        }
        if (filterType == "Reviewer" && filter != null) {
          refVal = refVal.where("reviewer", "==", filter);
        }

        refVal = refVal.orderBy("name", "asc").limit(pageSize);
        console.log("cl ref", refVal);
        return refVal;
      })
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          return convertSnaps<Resource>(snaps);
        })
      );
  }

  findByPartialName(
    name: string,
    pageSize: number = 100
  ): Observable<Resource[]> {
    console.log("findByPartialName", name, pageSize);
    return this.afs
      .collection("resources", (ref) =>
        ref
          .where("name", ">=", name)
          .where("name", "<=", name + "~")
          .orderBy("name", "asc")
          .limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          console.log(snaps);
          return convertSnaps<Resource>(snaps);
        })
      );
  }

  // getFilterRefs(ref: CollectionReference,name:string) {
  //   let refBuilder = ref as any;
  //   if (name == "") {
  //     refBuilder = refBuilder.where("name", ">=", name)
  //     }
  //   }
  //   return refBuilder;

  // }

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
