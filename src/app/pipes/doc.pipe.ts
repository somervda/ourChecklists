import { Pipe, PipeTransform } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { firestore } from "firebase";
import { map } from "rxjs/operators";
import { convertSnap } from "../services/db-utils";

@Pipe({
  name: "doc",
})

/**
 * Resolves a document reference  into an observable of that document
 */
export class DocPipe implements PipeTransform {
  constructor(private afs: AngularFirestore) {}

  transform<T>(value: firestore.DocumentReference<T>): Observable<T> {
    // console.log("transform:", value);
    if (value && value != null && value.path && value.path != null) {
      return this.afs
        .doc(value.path)
        .snapshotChanges()
        .pipe(
          map((snap) => {
            // console.log("transform snap", convertSnap<T>(snap));
            return convertSnap<T>(snap);
          })
        );
    }
  }
}
