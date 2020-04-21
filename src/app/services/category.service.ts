import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Category } from "../models/category.model";
import { map, first } from "rxjs/operators";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";

@Injectable({
  providedIn: "root",
})
export class CategoryService {
  constructor(private afs: AngularFirestore) {}

  findById(id: string): Observable<Category> {
    return this.afs
      .doc("/categories/" + id)
      .snapshotChanges()
      .pipe(
        map((snap) => {
          return convertSnap<Category>(snap);
        }),
        first()
      );
  }

  findAll(pageSize: number): Observable<Category[]> {
    // console.log( "team findAll",  pageSize  );
    return this.afs
      .collection("categories", (ref) => ref.limit(pageSize))
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("findDevices", convertSnaps<Device>(snaps));
          return convertSnaps<Category>(snaps);
        })
      );
  }

  fieldUpdate(docId: string, fieldName: string, newValue: any) {
    if (docId && fieldName) {
      const updateObject = {};
      dbFieldUpdate("/categories/" + docId, fieldName, newValue, this.afs);
    }
  }

  create(category: Category): Promise<DocumentReference> {
    return this.afs.collection("categories").add(category);
  }

  delete(id: string): Promise<void> {
    return this.afs.collection("categories").doc(id).delete();
  }
}
