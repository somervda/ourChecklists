import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { NotfoundComponent } from "./notfound/notfound.component";
import { AboutComponent } from "./about/about.component";
import { LoginComponent } from "./login/login.component";
import { UsersComponent } from "./users/users.component";
import { UserComponent } from "./user/user.component";
import { UserResolver } from "./services/user-resolver";
import { IsAdminGuard } from "./guards/isAdmin.guard";
import { IsActivatedGuard } from "./guards/isActivated.guard";
import { NotauthorizedComponent } from "./notauthorized/notauthorized.component";
import { TeamsComponent } from "./teams/teams.component";
import { TeamComponent } from "./team/team.component";
import { TeamResolver } from "./services/team-resolver";
import { CategoryComponent } from "./category/category.component";
import { CategoriesComponent } from "./categories/categories.component";
import { CategoryResolver } from "./services/category-resolver";
import { ActivityComponent } from "./activity/activity.component";
import { ActivityResolver } from "./services/activity.resolver";
import { ResourcesComponent } from "./resources/resources.component";
import { permissionGuard } from "./guards/permission.guard";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "about", component: AboutComponent },
  { path: "login", component: LoginComponent },
  {
    path: "teams",
    component: TeamsComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "canCreateTeams"] },
  },
  {
    path: "categories",
    component: CategoriesComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "isCategoryManager"] },
  },
  {
    path: "resources",
    component: ResourcesComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "isResourceManager"] },
  },
  { path: "notAuthorized", component: NotauthorizedComponent },
  {
    path: "team/create",
    component: TeamComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "canCreateTeams"] },
  },
  {
    path: "team/delete/:id",
    component: TeamComponent,
    resolve: { team: TeamResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "canCreateTeams"] },
  },
  {
    path: "team/:id",
    component: TeamComponent,
    resolve: { team: TeamResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "canCreateTeams"] },
  },

  {
    path: "category/create",
    component: CategoryComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "isCategoryManager"] },
  },
  {
    path: "category/delete/:id",
    component: CategoryComponent,
    resolve: { category: CategoryResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "isCategoryManager"] },
  },
  {
    path: "category/:id",
    component: CategoryComponent,
    resolve: { category: CategoryResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "isCategoryManager"] },
  },

  {
    path: "category/:cid/activity/create",
    component: ActivityComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "isCategoryManager"] },
  },
  {
    path: "category/:cid/activity/delete/:aid",
    component: ActivityComponent,
    resolve: { activity: ActivityResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "isCategoryManager"] },
  },
  {
    path: "category/:cid/activity/:aid",
    component: ActivityComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "isCategoryManager"] },
  },

  { path: "users", component: UsersComponent, canActivate: [IsAdminGuard] },
  {
    path: "user/:uid",
    component: UserComponent,
    resolve: { user: UserResolver },
    canActivate: [IsActivatedGuard],
    runGuardsAndResolvers: "always",
  },
  { path: "notfound", component: NotfoundComponent },
  { path: "**", component: NotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
