import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { NotfoundComponent } from "./notfound/notfound.component";
import { AboutComponent } from "./about/about.component";
import { LoginComponent } from "./login/login.component";
import { UsersComponent } from "./users/users.component";
import { UserComponent } from "./user/user.component";
import { UserResolver } from "./services/user-resolver";
import { NotauthorizedComponent } from "./notauthorized/notauthorized.component";
import { TeamsComponent } from "./teams/teams.component";
import { TeamComponent } from "./team/team.component";
import { TeamResolver } from "./services/team-resolver";
import { CategoryComponent } from "./category/category.component";
import { CategoriesComponent } from "./categories/categories.component";
import { CategoryResolver } from "./services/category-resolver";
import { ActivityComponent } from "./activity/activity.component";
import { ResourcesComponent } from "./resources/resources.component";
import { permissionGuard } from "./guards/permission.guard";
import { ActivityResolver } from "./services/activity-resolver";
import { ResourceComponent } from "./resource/resource.component";
import { ResourceResolver } from "./services/resource-resolver";
import { RedirectComponent } from "./redirect/redirect.component";
import { MychecklistsComponent } from "./mychecklists/mychecklists.component";
import { TeamchecklistsComponent } from "./teamchecklists/teamchecklists.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "about", component: AboutComponent },
  { path: "login", component: LoginComponent },
  { path: "notAuthorized", component: NotauthorizedComponent },
  {
    path: "redirect/:component/:id",
    component: RedirectComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isActivated"] },
  },

  // Checklists
  {
    path: "mychecklists",
    component: MychecklistsComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isActivated"] },
  },
  {
    path: "teamchecklists/:id",
    component: TeamchecklistsComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isActivated"] },
  },

  // Teams
  {
    path: "teams",
    component: TeamsComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "isActivated"] },
  },
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
    data: { permissions: ["isAdmin", "isActivated"] },
  },

  // Categories
  {
    path: "categories",
    component: CategoriesComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "isCategoryManager"] },
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

  // Category/Activity
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

  // Resources
  {
    path: "resources",
    component: ResourcesComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "isResourceManager"] },
  },
  {
    path: "resource/create",
    component: ResourceComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "isResourceManager"] },
  },
  {
    path: "resource/delete/:id",
    component: ResourceComponent,
    resolve: { resource: ResourceResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "isResourceManager"] },
  },
  {
    path: "resource/:id",
    component: ResourceComponent,
    resolve: { resource: ResourceResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin", "isResourceManager"] },
  },

  //  Users
  {
    path: "users",
    component: UsersComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "user/:uid",
    component: UserComponent,
    resolve: { user: UserResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isActivated"] },
    runGuardsAndResolvers: "always",
  },
  // Other
  { path: "notfound", component: NotfoundComponent },
  { path: "**", component: NotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
