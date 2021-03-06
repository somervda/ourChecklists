import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  Input,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { Observable, Subscription, Subject } from "rxjs";
import { map, first, take, takeUntil } from "rxjs/operators";
import { TemplateselectordialogComponent } from "src/app/dialogs/templateselectordialog/templateselectordialog.component";
import { Checklist, ChecklistStatusInfo } from "src/app/models/checklist.model";
import {
  Checklistcsv,
  Checklistextract,
  Checklistitemcsv,
  Checklistitemextract,
  DocInfo,
  UserInfo,
} from "src/app/models/checklistextract.model";
import { Checklistitem } from "src/app/models/checklistitem.model";
import { ActivityService } from "src/app/services/activity.service";
import { CategoryService } from "src/app/services/category.service";
import { ChecklistService } from "src/app/services/checklist.service";
import { ChecklistitemService } from "src/app/services/checklistitem.service";
import { HelperService } from "src/app/services/helper.service";
import { TeamService } from "src/app/services/team.service";
import { UserService } from "src/app/services/user.service";
import { User } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-datasearch",
  templateUrl: "./datasearch.component.html",
  styleUrls: ["./datasearch.component.scss"],
})
export class DatasearchComponent implements OnInit, OnDestroy {
  @Input() makeExtract = false;
  @Input() includeTeamMembers = false;
  @Output() checklistExtract = new EventEmitter();
  @Output() startExtract = new EventEmitter();
  @Output() checklistObservable = new EventEmitter();

  categoryInfo: DocInfo[];
  categoriesInfo$: Observable<DocInfo[]>;
  categorySpinner = false;

  teamInfo: DocInfo[];
  teamInfo$: Observable<DocInfo[]>;
  teamSpinner = false;

  activityInfo: DocInfo[];
  activityInfo$: Observable<DocInfo[]>;
  activitySpinner = false;

  userInfo: UserInfo[];
  userInfo$: Observable<UserInfo[]>;
  userSpinner = false;

  checklistSpinner = false;
  checklists$: Observable<Checklist[]>;
  checklistsExtract: Checklistextract[];
  checklistStatusInfo = ChecklistStatusInfo;

  selectedStatus = "0";
  selectedCategory = "0";
  selectedTeam = "0";
  selectedTemplate = { id: "0", name: "All" };
  selectedFromDate: Date;
  selectedToDate: Date;

  checklistRows: number = 0;
  checklistitemRows: number = 0;
  fileUrlJSON;
  extractNameJSON = "checklists-extract.json";
  fileUrlChecklists;
  extractNameChecklists = "checklists-extract.csv";
  fileUrlChecklistitems;
  extractNameChecklistitems = "checklistitems-extract.csv";
  downLoadReady = false;
  user: User;

  // https://medium.com/@sub.metu/angular-how-to-avoid-memory-leaks-from-subscriptions-8fa925003aa9
  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(
    private categoryService: CategoryService,
    private teamService: TeamService,
    private activityService: ActivityService,
    private helper: HelperService,
    private checklistService: ChecklistService,
    private checklistitemService: ChecklistitemService,
    private sanitizer: DomSanitizer,
    private userService: UserService,
    public dialog: MatDialog,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.auth.user$
      .pipe(take(1))
      .toPromise()
      .then((u) => this.initialization(u));
  }

  private initialization(u: User) {
    this.user = u;
    if (!u.isAdmin) {
      // If user is not an admin then all teams are not a selection option
      this.selectedTeam = "-1";
      // select the first team the user is a manager of, or a reviewer of
      if (u.managerOfTeams && u.managerOfTeams.length > 0) {
        this.selectedTeam = u.managerOfTeams[0];
      }
      if (u.reviewerOfTeams && u.reviewerOfTeams.length > 0) {
        this.selectedTeam = u.reviewerOfTeams[0];
      }
      if (u.memberOfTeams && u.memberOfTeams.length > 0) {
        this.selectedTeam = u.memberOfTeams[0];
      }
    }

    if (sessionStorage.getItem("searchSelectedStatus")) {
      this.selectedStatus = sessionStorage.getItem("searchSelectedStatus");
    }

    if (sessionStorage.getItem("searchSelectedTemplate")) {
      this.selectedTemplate = JSON.parse(
        sessionStorage.getItem("searchSelectedTemplate")
      );
    }

    if (sessionStorage.getItem("searchSelectedFromDate")) {
      this.selectedFromDate = new Date(
        JSON.parse(sessionStorage.getItem("searchSelectedFromDate"))
      );
    }

    if (sessionStorage.getItem("searchSelectedToDate")) {
      this.selectedToDate = new Date(
        JSON.parse(sessionStorage.getItem("searchSelectedToDate"))
      );
    }

    // Set up observables to get a copy of all categories and teams for use
    // in the extract data resolution
    // console.log("ngOnInit start");
    this.checklistsExtract = [];
    // Get CategoryInfo
    this.categorySpinner = true;
    this.categoriesInfo$ = this.categoryService.findAll(1000).pipe(
      map(
        (cs) =>
          (this.categoryInfo = cs.map((c) => {
            return { id: c.id, name: c.name };
          }))
      )
    );
    this.categoriesInfo$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.categorySpinner = false;
      if (sessionStorage.getItem("searchSelectedCategory")) {
        this.selectedCategory = sessionStorage.getItem(
          "searchSelectedCategory"
        );
      }
    });

    // Get teamInfo
    this.teamSpinner = true;
    this.teamInfo$ = this.teamService.findAll(1000).pipe(
      map(
        (ts) =>
          (this.teamInfo = ts.map((t) => {
            return { id: t.id, name: t.name };
          }))
      )
    );
    this.teamInfo$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.teamSpinner = false;
      if (sessionStorage.getItem("searchSelectedTeam")) {
        this.selectedTeam = sessionStorage.getItem("searchSelectedTeam");
      }
    });

    // Get userInfo
    this.userSpinner = true;
    this.userInfo$ = this.userService.findAll(1000).pipe(
      map(
        (users) =>
          (this.userInfo = users.map((user) => {
            return {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
            };
          }))
      )
    );
    this.userInfo$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.userSpinner = false;
    });

    // Get activityInfo
    this.activitySpinner = true;
    this.activityInfo$ = this.activityService.findAll(1000).pipe(
      map(
        (as) =>
          (this.activityInfo = as.map((a) => {
            return { id: a.id, name: a.name };
          }))
      )
    );
    this.activityInfo$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.activitySpinner = false;
      // console.log("activityInfo:", this.activityInfo);
    });
  }

  getSelectedData() {
    this.checklistSpinner = true;
    this.startExtract.emit(true);
    this.saveSearch();

    // Create the checklist$ observable based on the selection parameters
    this.makeChecklists$();

    // Do the extract
    this.checklists$
      // Convert to checklistextracts
      .pipe(
        map((cs) => cs.map((c) => this.toChecklistExtract(c))),
        takeUntil(this.ngUnsubscribe)
      )
      // Subscribe and blow out the checklist items
      .subscribe((cs) => {
        // Add checklistitemExtracts to the checklists
        if (cs.length > 0) {
          cs.map((c, i) =>
            this.checklistitemService
              .findAll(c.id)
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe((cis) => {
                cis.map((ci) => {
                  c.checklistitems.push(this.toChecklistitemExtract(ci));
                  let s = this.checklistService.getStatisticsOverItems(
                    cis,
                    this.checklistService.overdueCheck(
                      c.dateTargeted,
                      parseInt(c.status.id)
                    )
                  );
                  c.score = s.scorePercentage;
                  c.isOverdue = s.isOverdue;
                });
                if (cs.length - 1 == i) {
                  // The last checklistextract has been processed so can show downloads
                  // and emit event containing the extracted data
                  console.log("cs and items:", cs);
                  this.checklistSpinner = false;
                  if (this.makeExtract) {
                    this.buildDownloads(cs);
                    this.checklistExtract.emit(cs);
                  } else {
                    this.checklistObservable.emit(this.checklists$);
                  }
                }
              })
          );
        } else {
          // No checklist selected in extract
          this.checklistSpinner = false;
          this.downLoadReady = false;
          // this.checklistExtract.emit(cs);
          this.helper.snackbar(
            "No checklists match the selection parameters",
            5000
          );
          if (this.makeExtract) {
            this.checklistExtract.emit([]);
          } else {
            this.checklistObservable.emit();
          }
        }
      });
  }

  toChecklistExtract(checklist: Checklist): Checklistextract {
    // console.log("denormalizeChecklist", checklist);

    let checklistextract: Checklistextract = {
      id: checklist.id,
      isTemplate: checklist.isTemplate,
      name: checklist.name,
      description: checklist.description,
      status: {
        id: checklist.status.toString(),
        name: ChecklistStatusInfo.find((s) => s.status == checklist.status)
          .name,
      },
      dateCreated: checklist.dateCreated
        ? (checklist.dateCreated as firebase.firestore.Timestamp).toDate()
        : undefined,
      dateCompleted: checklist.dateCompleted
        ? (checklist.dateCompleted as firebase.firestore.Timestamp).toDate()
        : undefined,
      dateUpdated: checklist.dateUpdated
        ? (checklist.dateUpdated as firebase.firestore.Timestamp).toDate()
        : undefined,
      dateTargeted: checklist.dateTargeted
        ? (checklist.dateTargeted as firebase.firestore.Timestamp).toDate()
        : undefined,
      team: this.getDocInfo(
        this.helper.getDocRefId(checklist.team),
        this.teamInfo
      ),
      assignee: checklist.assignee
        ? checklist.assignee.map((userref) => {
            return this.getUserInfo(this.helper.getDocRefId(userref));
          })
        : [],
      checklistitems: [],
      category: this.getDocInfo(
        this.helper.getDocRefId(checklist.category),
        this.categoryInfo
      ),
      score: 0,
      isOverdue: false,
    };

    return checklistextract;
  }

  toChecklistitemExtract(checklistitem: Checklistitem): Checklistitemextract {
    let checklistitemextract: Checklistitemextract = {
      id: checklistitem.id,
      name: checklistitem.name,
      description: checklistitem.description,
      sequence: checklistitem.sequence,
      allowNA: checklistitem.allowNA,
      requireEvidence: checklistitem.requireEvidence,
      resultType: checklistitem.resultType,
      resultValue: checklistitem.resultValue,
      tagId: checklistitem.tagId,
      dateCreated: checklistitem.dateCreated
        ? (checklistitem.dateCreated as firebase.firestore.Timestamp).toDate()
        : undefined,
      dateResultSet: checklistitem.dateResultSet
        ? (checklistitem.dateResultSet as firebase.firestore.Timestamp).toDate()
        : undefined,
      activities: checklistitem.activities
        ? checklistitem.activities.map((docref) => {
            return this.getDocInfo(
              this.helper.getDocRefId(docref),
              this.activityInfo
            );
          })
        : [],
      score: this.checklistService.getItemScore(checklistitem) * 25,
    };
    return checklistitemextract;
  }

  private saveSearch() {
    if (this.selectedCategory && this.selectedCategory != "0") {
      sessionStorage.setItem("searchSelectedCategory", this.selectedCategory);
    } else {
      sessionStorage.removeItem("searchSelectedCategory");
    }
    if (this.selectedTeam && this.selectedTeam != "0") {
      sessionStorage.setItem("searchSelectedTeam", this.selectedTeam);
    } else {
      sessionStorage.removeItem("selectedTeam");
    }
    if (this.selectedStatus && this.selectedStatus != "0") {
      sessionStorage.setItem("searchSelectedStatus", this.selectedStatus);
    } else {
      sessionStorage.removeItem("searchSelectedStatus");
    }
    if (this.selectedTemplate && this.selectedTemplate.id != "0") {
      sessionStorage.setItem(
        "searchSelectedTemplate",
        JSON.stringify(this.selectedTemplate)
      );
    } else {
      sessionStorage.removeItem("searchSelectedTemplate");
    }

    if (this.selectedFromDate) {
      sessionStorage.setItem(
        "searchSelectedFromDate",
        JSON.stringify(this.selectedFromDate)
      );
    } else {
      sessionStorage.removeItem("searchSelectedFromDate");
    }

    if (this.selectedToDate) {
      sessionStorage.setItem(
        "searchSelectedToDate",
        JSON.stringify(this.selectedToDate)
      );
    } else {
      sessionStorage.removeItem("searchSelectedToDate");
    }
  }

  private makeChecklists$() {
    const category = this.helper.docRef(`/categories/${this.selectedCategory}`);
    const team = this.helper.docRef(`/teams/${this.selectedTeam}`);
    console.log("team:", team);
    const template = this.helper.docRef(
      `/checklists/${this.selectedTemplate.id}`
    );
    this.checklists$ = this.checklistService.search(
      parseInt(this.selectedStatus),
      category,
      team,
      template,
      1000
    );
    // Date range filters are implemented as a client side pipe rather
    // than as firestore queries that would require managements of a bunch of indexes
    // until perform on the client is impacted this should be OK
    if (this.selectedFromDate) {
      this.checklists$ = this.checklists$.pipe(
        map((cs) => {
          return cs.filter(
            (c) =>
              c.dateCompleted &&
              (c.dateCompleted as firebase.firestore.Timestamp).toDate() >=
                this.selectedFromDate
          );
        })
      );
    }

    if (this.selectedToDate) {
      this.checklists$ = this.checklists$.pipe(
        map((cs) => {
          return cs.filter(
            (c) =>
              c.dateCompleted &&
              (c.dateCompleted as firebase.firestore.Timestamp).toDate() <=
                this.selectedToDate
          );
        })
      );
    }

    if (team.path == this.helper.docRef("/teams/-1").path) {
      console.log("None");
      this.checklists$ = this.checklists$.pipe(
        map((cs) => {
          return cs.filter((c) => c.team == null);
        })
      );
    }

    // Don't include templates
    this.checklists$ = this.checklists$.pipe(
      map((cs) => cs.filter((c) => !c.isTemplate))
    );
  }

  /**
   * This is a bit of a kludge , but the angular/firestore library seems
   * to cache the documents from the first query on a document collection, so
   * when I was getting a list of templates in the OnInit function then
   * the search checklists would only use the checklist in that subcollection!
   * I raised an observation with Google and then moved getting templates
   * out to a separate dialog componenet :(
   */
  templateDialog() {
    // console.log("templateDialog");
    const dialogRef = this.dialog.open(TemplateselectordialogComponent, {
      minWidth: "380px",
      maxWidth: "500px",
      width: "80%",
      data: { selectedTemplate: this.selectedTemplate },
      autoFocus: false,
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((choice) => {
        if (choice) {
          this.selectedTemplate = choice;
        }
      });
  }

  /**
   * This creates 3 downloadable files , a json file with the checklists and items
   * and also 2 separate csv versions with the checklists in one and the checklistitems
   * in the other
   * @param checklistsAndItems
   */
  buildDownloads(checklistsAndItems: Checklistextract[]) {
    console.log("createDownload:", checklistsAndItems);

    // Create JSON download
    this.checklistRows = checklistsAndItems.length;
    const extractBlobJSON = new Blob([JSON.stringify(checklistsAndItems)], {
      type: "application/json",
    });
    this.fileUrlJSON = this.sanitizer.bypassSecurityTrustResourceUrl(
      window.URL.createObjectURL(extractBlobJSON)
    );
    this.extractNameJSON =
      "checklists-extract-" + new Date().toISOString() + ".json";

    // Create Checklists CSV
    const checklists = checklistsAndItems.map((c) =>
      this.checklistExtractToCSV(c)
    );
    const checklistscsv = this.helper.toCsv(checklists);
    const extractBlobCCSV = new Blob([checklistscsv], {
      type: "application/csv",
    });
    this.fileUrlChecklists = this.sanitizer.bypassSecurityTrustResourceUrl(
      window.URL.createObjectURL(extractBlobCCSV)
    );
    this.extractNameChecklists =
      "checklists-" + new Date().toISOString() + ".csv";

    // Create Checklistitems CSV
    let checklistitems = [] as Checklistitemcsv[];
    checklistsAndItems.forEach((c) =>
      c.checklistitems.forEach((ci) =>
        checklistitems.push(this.checklistitemExtractToCSV(ci, c))
      )
    );
    this.checklistitemRows = checklistitems.length;
    const checklistitemscsv = this.helper.toCsv(checklistitems);

    const extractBlobCiCSV = new Blob([checklistitemscsv], {
      type: "application/csv",
    });
    this.fileUrlChecklistitems = this.sanitizer.bypassSecurityTrustResourceUrl(
      window.URL.createObjectURL(extractBlobCiCSV)
    );
    this.extractNameChecklistitems =
      "checklistitems-" + new Date().toISOString() + ".csv";

    // UI msg and show downloads

    this.helper.snackbar(
      `Checklists extracts ready for downloading: ${this.checklistRows} checklist and ${this.checklistitemRows} checklistitems found.`,
      2000
    );
    this.downLoadReady = true;
  }

  checklistExtractToCSV(checklist: Checklistextract): Checklistcsv {
    try {
      const checklistscsv: Checklistcsv = {
        id: checklist.id,
        name: checklist.name,
        isTemplate: checklist.isTemplate,
        fromTemplate_id: checklist.fromTemplate
          ? checklist.fromTemplate.id
          : "",
        fromTemplate_name: checklist.fromTemplate
          ? checklist.fromTemplate.name
          : "",
        description: checklist.description,
        comments: checklist.comments,
        status: checklist.status.id,
        status_name: checklist.status.name,
        dateCreated: checklist.dateCreated,
        dateUpdated: checklist.dateUpdated,
        dateTargeted: checklist.dateTargeted,
        dateCompleted: checklist.dateCompleted,
        assignee: checklist.assignee.reduce(
          (assignees, a) => assignees + a.uid + " ",
          ""
        ),
        team_id: checklist.team.id,
        team_name: checklist.team.name,
        category_id: checklist.category.id,
        category_name: checklist.category.name,
        score: checklist.score,
        isOverdue: checklist.isOverdue,
      };
      return checklistscsv;
    } catch (e) {
      console.error("checklistExtractToCSV error:", e.msg);
      return null;
    }
  }

  checklistitemExtractToCSV(
    ci: Checklistitemextract,
    c: Checklistextract
  ): Checklistitemcsv {
    try {
      const checklistitemcsv: Checklistitemcsv = {
        id: ci.id,
        checklist_id: c.id,
        name: ci.name,
        sequence: ci.sequence,
        description: ci.description,
        activities: ci.activities
          ? ci.activities.reduce(
              (activityList, a) => activityList + a.id + " ",
              ""
            )
          : "",
        activitiesName: ci.activities
          ? ci.activities.reduce(
              (activityList, a) => activityList + a.name + " ",
              ""
            )
          : "",
        dateCreated: ci.dateCreated,
        dateResultSet: ci.dateResultSet,
        evidence: ci.evidence,
        allowNA: ci.allowNA,
        requireEvidence: ci.requireEvidence,
        resultValue: ci.resultValue,
        resultType: ci.resultType,
        comment: ci.comment,
        tagId: ci.tagId,
        score: ci.score,
      };
      return checklistitemcsv;
    } catch (e) {
      console.error("checklistitemExtractToCSV error:", e.msg);
      return null;
    }
  }

  getDocInfo(id: string, collection: DocInfo[]): DocInfo {
    let foundDoc = collection.find((d) => d.id == id);
    if (foundDoc) {
      return foundDoc;
    } else {
      return { id: id };
    }
  }

  getUserInfo(uid: string): UserInfo {
    let foundUser = this.userInfo.find((u) => u.uid == uid);
    if (foundUser) {
      return foundUser;
    } else {
      return { uid: uid };
    }
  }

  ngOnDestroy() {
    // Close down subscriptions
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
