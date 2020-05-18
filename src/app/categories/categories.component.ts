import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Category } from "../models/category.model";
import { CategoryService } from "../services/category.service";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-categories",
  templateUrl: "./categories.component.html",
  styleUrls: ["./categories.component.scss"],
})
export class CategoriesComponent implements OnInit {
  categories$: Observable<Category[]>;
  displayedColumns: string[] = ["name", "description", "id"];

  constructor(
    private categoryService: CategoryService,
    private auth: AuthService
  ) {}
  ngOnInit() {
    this.categories$ = this.categoryService.findAll(100);
  }
}
