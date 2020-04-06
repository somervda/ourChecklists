import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { NotfoundComponent } from "./notfound/notfound.component";
import { AboutComponent } from "./about/about.component";
import { LoginComponent } from "./login/login.component";
import { UsersComponent } from "./users/users.component";
import { UserComponent } from "./user/user.component";
import { UserResolver } from "./services/user-resolver";
import { AdministrationComponent } from "./administration/administration.component";
import { IsAdminGuard } from "./guards/isAdmin.guard";
import { IsActivatedGuard } from "./guards/isActivated.guard";
import { NotauthorizedComponent } from "./notauthorized/notauthorized.component";
import { TeamsComponent } from "./teams/teams.component";
import { TeamComponent } from "./team/team.component";
import { TeamResolver } from "./services/team-resolver";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "about", component: AboutComponent },
  { path: "login", component: LoginComponent },
  { path: "teams", component: TeamsComponent },

  { path: "notAuthorized", component: NotauthorizedComponent },
  {
    path: "administration",
    component: AdministrationComponent,
    canActivate: [IsAdminGuard],
  },
  {
    path: "team/create",
    component: TeamComponent,
    canActivate: [IsActivatedGuard],
  },
  {
    path: "team/delete/:id",
    component: TeamComponent,
    resolve: { team: TeamResolver },
    canActivate: [IsActivatedGuard],
  },
  {
    path: "team/:id",
    component: TeamComponent,
    resolve: { team: TeamResolver },
    canActivate: [IsActivatedGuard],
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
