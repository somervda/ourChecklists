import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AngularFireModule } from "@angular/fire";
import { AngularFirePerformanceModule } from "@angular/fire/performance";

import { environment } from "../environments/environment";
import { AngularFireAuthModule } from "@angular/fire/auth";
import {
  AngularFirestoreModule,
  AngularFirestore,
} from "@angular/fire/firestore";
import { AngularFireStorageModule } from "@angular/fire/storage";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { NgbCarouselModule } from "@ng-bootstrap/ng-bootstrap";
import { HomeComponent } from "./home/home.component";
import { NotfoundComponent } from "./notfound/notfound.component";
import { AboutComponent } from "./about/about.component";
import { LoginComponent } from "./login/login.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { UsersComponent } from "./users/users.component";
import { UserComponent } from "./user/user.component";
import { NotauthorizedComponent } from "./notauthorized/notauthorized.component";
import { TeamsComponent } from "./teams/teams.component";
import { SubheadingComponent } from "./subheading/subheading.component";
import { TeamComponent } from "./team/team.component";
import { TeamuserlistComponent } from "./teamuserlist/teamuserlist.component";
import { TeamuserremoveComponent } from "./dialogs/teamuserremove/teamuserremove.component";
import { TeamuseraddComponent } from "./dialogs/teamuseradd/teamuseradd.component";
import { UserfinderComponent } from "./userfinder/userfinder.component";
import { CategoriesComponent } from "./categories/categories.component";
import { CategoryComponent } from "./category/category.component";
import { CategoryactivitylistComponent } from "./categoryactivitylist/categoryactivitylist.component";
import { ActivityComponent } from "./activity/activity.component";
import { ResourcesComponent } from "./resources/resources.component";
import { ResourceComponent } from "./resource/resource.component";
import { MarkedPipe } from "./marked.pipe";
import { YoutubeviewerComponent } from "./youtubeviewer/youtubeviewer.component";
import { UserselectordialogComponent } from "./dialogs/userselectordialog/userselectordialog.component";
import { TeamselectordialogComponent } from "./dialogs/teamselectordialog/teamselectordialog.component";
import { CategoryselectordialogComponent } from "./dialogs/categoryselectordialog/categoryselectordialog.component";
import { ConfirmdialogComponent } from "./dialogs/confirmdialog/confirmdialog.component";
import { RedirectComponent } from "./redirect/redirect.component";
import { MychecklistsComponent } from "./mychecklists/mychecklists.component";
import { ChecklistlistComponent } from "./checklistlist/checklistlist.component";
import { TeamchecklistsComponent } from "./teamchecklists/teamchecklists.component";
import { ChecklistdesignComponent } from "./checklistdesign/checklistdesign.component";
import { ChecklistitemdesignComponent } from "./checklistitemdesign/checklistitemdesign.component";
import { ChecklistitemeditComponent } from "./checklistitemedit/checklistitemedit.component";
import { ChecklisteditComponent } from "./checklistedit/checklistedit.component";
import { ChecklistComponent } from "./checklist/checklist.component";
import { ChecklistitemComponent } from "./checklistitem/checklistitem.component";
import { ResourcelistComponent } from "./resourcelist/resourcelist.component";
import { UserlisteditComponent } from "./userlistedit/userlistedit.component";
import { ResourcelisteditComponent } from "./resourcelistedit/resourcelistedit.component";
import { ResourcefinderComponent } from "./dialogs/resourcefinder/resourcefinder.component";
import { ResourceviewdialogComponent } from "./dialogs/resourceviewdialog/resourceviewdialog.component";
import { ChecklistitemlistComponent } from "./checklistitemlist/checklistitemlist.component";
import { ActivitylisteditComponent } from "./activitylistedit/activitylistedit.component";
import { ActivityfinderdialogComponent } from "./dialogs/activityfinderdialog/activityfinderdialog.component";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NotfoundComponent,
    AboutComponent,
    LoginComponent,
    UsersComponent,
    UserComponent,
    NotauthorizedComponent,
    TeamsComponent,
    SubheadingComponent,
    TeamuserlistComponent,
    TeamComponent,
    TeamuserremoveComponent,
    TeamuseraddComponent,
    UserfinderComponent,
    CategoriesComponent,
    CategoryComponent,
    CategoryactivitylistComponent,
    ActivityComponent,
    ResourcesComponent,
    ResourceComponent,
    MarkedPipe,
    YoutubeviewerComponent,
    UserselectordialogComponent,
    TeamselectordialogComponent,
    CategoryselectordialogComponent,
    ConfirmdialogComponent,
    RedirectComponent,
    MychecklistsComponent,
    ChecklistlistComponent,
    TeamchecklistsComponent,
    ChecklistdesignComponent,
    ChecklistitemdesignComponent,
    ChecklistitemeditComponent,
    ChecklisteditComponent,
    ChecklistComponent,
    ChecklistitemComponent,
    ResourcelistComponent,
    UserlisteditComponent,
    ResourcelisteditComponent,
    ResourcefinderComponent,
    ResourceviewdialogComponent,
    ChecklistitemlistComponent,
    ActivitylisteditComponent,
    ActivityfinderdialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatCheckboxModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatChipsModule,
    MatTooltipModule,
    MatTableModule,
    MatTabsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    AppRoutingModule,
    NgbCarouselModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirePerformanceModule,
    AngularFireAuthModule,
    // Allow offline operations - useful when used in combination with PWA functionality
    // AngularFirestoreModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireStorageModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
