import { Component, OnInit, OnDestroy } from "@angular/core";
import { Crud } from "../models/helper.model";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { CategoryService } from "../services/category.service";
import { ActivatedRoute } from "@angular/router";
import { Category } from "../models/category.model";
import { HelperService } from "../services/helper.service";
import * as firebase from "firebase";

@Component({
  selector: "app-category",
  templateUrl: "./category.component.html",
  styleUrls: ["./category.component.scss"],
})
export class CategoryComponent implements OnInit, OnDestroy {
  category: Category;
  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;

  categoryForm: FormGroup;
  categorySubscription$$: Subscription;

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private helper: HelperService
  ) {}

  ngOnInit() {
    console.log(
      "this.route.snapshot.paramMap.get('id')",
      this.route.snapshot.paramMap.get("id")
    );
    this.crudAction = Crud.Update;
    if (this.route.routeConfig.path == "category/delete/:id")
      this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "category/create")
      this.crudAction = Crud.Create;

    // console.log("category onInit", this.crudAction);
    if (this.crudAction == Crud.Create) {
      this.category = {
        name: "",
        description: "",
        dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
      };
    } else {
      this.category = this.route.snapshot.data["category"];
      this.categorySubscription$$ = this.categoryService
        .findById(this.category.id)
        .subscribe((category) => {
          this.category = category;
          // console.log("subscribed category", this.category);
          this.categoryForm.patchValue(this.category);
        });
    }

    // Create form group and initialize with probe values
    this.categoryForm = this.fb.group({
      name: [
        this.category.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
        ],
      ],
      description: [
        this.category.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
    });

    // Mark all fields as touched to trigger validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.categoryForm.controls) {
        this.categoryForm.get(field).markAsTouched();
      }
    }
  }

  onCreate() {
    // console.log("create probe", this.probe);
    for (const field in this.categoryForm.controls) {
      this.category[field] = this.categoryForm.get(field).value;
    }

    this.categoryService
      .create(this.category)
      .then((newDoc) => {
        this.crudAction = Crud.Update;
        this.category.id = newDoc.id;
        this.helper.snackbar(
          "Category '" + this.category.name + "' created.",
          2000
        );
        this.helper.redirect("/category/" + this.category.id);
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.category.name, error);
      });
  }

  onDelete() {
    // console.log("delete", this.probe.id);
    const teamId = this.category.id;
    const name = this.category.name;
    this.categoryService
      .delete(this.category.id)
      .then(() => {
        this.helper.snackbar("Category '" + name + "' deleted!", 2000);
        this.helper.redirect("/categories");
      })
      .catch(function (error) {
        console.error("Error deleting category: ", error);
      });
  }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (
      this.categoryForm.get(fieldName).valid &&
      this.category.id != "" &&
      this.crudAction != Crud.Delete
    ) {
      let newValue = this.categoryForm.get(fieldName).value;
      this.categoryService.fieldUpdate(this.category.id, fieldName, newValue);
    }
  }

  ngOnDestroy() {
    if (this.categorySubscription$$) this.categorySubscription$$.unsubscribe();
  }
}
