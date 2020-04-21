import { Component, OnInit, Inject } from "@angular/core";
import { Category } from "../models/category.model";
import { Observable } from "rxjs";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CategoryService } from "../services/category.service";

@Component({
  selector: "app-categoryselectordialog",
  templateUrl: "./categoryselectordialog.component.html",
  styleUrls: ["./categoryselectordialog.component.scss"],
})
export class CategoryselectordialogComponent implements OnInit {
  category: Category;
  categories$: Observable<Category[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private categoryService: CategoryService,
    private dialogRef: MatDialogRef<CategoryselectordialogComponent>
  ) {}

  ngOnInit(): void {
    this.categories$ = this.categoryService.findByPartialName("");
  }

  returnCategory() {
    this.dialogRef.close(this.category);
  }

  onCategorySelected(id) {
    console.log("onCategorySelected:", id);
    this.categoryService
      .findById(id)
      .toPromise()
      .then((category) => {
        console.log("set category:", category);
        this.category = category;
      })
      .catch((e) => console.error("error:", e));
  }

  onKey(event: any) {
    console.log("searchName", event.target.value);
    this.categories$ = this.categoryService.findByPartialName(
      event.target.value
    );
  }
}
