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

  /**
   * Find a category doc by category id
   * @param id Category Id
   */
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

  /**
   * Find all categories
   * @param pageSize The maximum number of categories to return
   */
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

  /**
   *Find categories my matching on first letters of the name
   * @param name Partial name used for matching, will match on initial letters
   * @param pageSize The maximum number of categories to return
   */
  findByPartialName(
    name: string,
    pageSize: number = 100
  ): Observable<Category[]> {
    // console.log( "findByPartialName",  pageSize  );
    return this.afs
      .collection("categories", (ref) =>
        ref
          .where("name", ">=", name)
          .where("name", "<=", name + "~")
          .orderBy("name", "asc")
          .limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
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
