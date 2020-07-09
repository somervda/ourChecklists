import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from "@angular/core";
import {
  DocInfo,
  Checklistextract,
  Checklistitemextract,
  UserInfo,
  Checklistcsv,
  Checklistitemcsv,
} from "src/app/models/checklistextract.model";
import { Observable, Subscription } from "rxjs";
import {
  Checklist,
  ChecklistStatusInfo,
  ChecklistStatus,
  ChecklistStatistics,
} from "src/app/models/checklist.model";
import { CategoryService } from "src/app/services/category.service";
import { TeamService } from "src/app/services/team.service";
import { ActivityService } from "src/app/services/activity.service";
import { HelperService } from "src/app/services/helper.service";
import { ChecklistService } from "src/app/services/checklist.service";
import { ChecklistitemService } from "src/app/services/checklistitem.service";
import { DomSanitizer } from "@angular/platform-browser";
import { UserService } from "src/app/services/user.service";
import { MatDialog } from "@angular/material/dialog";
import { map, first, take } from "rxjs/operators";
import { TemplateselectordialogComponent } from "src/app/dialogs/templateselectordialog/templateselectordialog.component";
import {
  Checklistitem,
  ChecklistitemResultValue,
} from "src/app/models/checklistitem.model";

@Component({
  selector: "app-datasearch",
  templateUrl: "./datasearch.component.html",
  styleUrls: ["./datasearch.component.scss"],
})
export class DatasearchComponent implements OnInit, OnDestroy {
  categoryInfo: DocInfo[];
  categoriesInfo$: Observable<DocInfo[]>;
  categoriesInfo$$: Subscription;
  categorySpinner = false;

  teamInfo: DocInfo[];
  teamInfo$: Observable<DocInfo[]>;
  teamInfo$$: Subscription;
  teamSpinner = false;

  activityInfo: DocInfo[];
  activityInfo$: Observable<DocInfo[]>;
  activityInfo$$: Subscription;
  activitySpinner = false;

  userInfo: UserInfo[];
  userInfo$: Observable<UserInfo[]>;
  userInfo$$: Subscription;
  userSpinner = false;

  checklistSpinner = false;
  checklists$: Observable<Checklist[]>;
  checklistsExtract: Checklistextract[];

  // rows: number;
  // fileUrl;
  // downLoadReady = false;
  // extractName = "checklists-extract.json";
  @Output() checklistExtract = new EventEmitter();
  @Output() startExtract = new EventEmitter();

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

  constructor(
    private categoryService: CategoryService,
    private teamService: TeamService,
    private activityService: ActivityService,
    private helper: HelperService,
    private checklistService: ChecklistService,
    private checklistitemService: ChecklistitemService,
    private sanitizer: DomSanitizer,
    private userService: UserService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
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
    this.categoriesInfo$$ = this.categoriesInfo$.subscribe(() => {
      this.categorySpinner = false;
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
    this.teamInfo$$ = this.teamInfo$.subscribe(() => {
      this.teamSpinner = false;
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
    this.userInfo$$ = this.userInfo$.subscribe(() => {
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
    this.activityInfo$$ = this.activityInfo$.subscribe(() => {
      this.activitySpinner = false;
      // console.log("activityInfo:", this.activityInfo);
    });
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
    dialogRef.afterClosed().subscribe((choice) => {
      if (choice) {
        this.selectedTemplate = choice;
      }
    });
  }

  async getSelectedData() {
    // console.log(
    //   "selectedFromDate ${this.selectedFromDate}, selectedCategory ${this.selectedCategory} ," +
    //     " selectedTeam ${this.selectedTeam}, selectedTemplate${this.selectedTemplate}," +
    //     " selectedStatus ${this.selectedStatus}, selectedToDate ${this.selectedToDate}"
    // );
    this.checklistSpinner = true;
    this.startExtract.emit(true);
    const category = this.helper.docRef(`/categories/${this.selectedCategory}`);
    const team = this.helper.docRef(`/teams/${this.selectedTeam}`);
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

    // Don't include templates
    this.checklists$ = this.checklists$.pipe(
      map((cs) => {
        return cs.filter((c) => !c.isTemplate);
      })
    );

    // For the extract I use a lot of awaits to resolve promises so the end result
    // is to have all the selected checklists ready to write as json to a file
    // and have denormalized most of the document references. Not all the properties
    // of the checklists or checklist items get extracted
    let checklistsPrime = await this.getChecklists(this.checklists$);
    let checklistExtracts = await Promise.all(
      checklistsPrime.map(async (c) => {
        let f = await this.denormalizeChecklist(c);
        return f;
      })
    );
    // let checklists = await (await this.getChecklists(this.checklists$)).map(
    //   async (c) => {
    //      let f =  (await this.denormalizeChecklist(c));
    //      return f;
    //   }
    // );

    const checklistsAndItems = await Promise.all(
      checklistExtracts.map(async (c) => {
        let checklistitems = await (
          await this.getChecklistitems(this.checklistitemService.findAll(c.id))
        ).map((cli) => this.denormalizeChecklistitem(cli));
        c["checklistitems"] = checklistitems;
        return c;
      })
    );

    // Update checklistscore
    // checklistsAndItems.forEach((c) => (c.score = this.calculateScores(c)));

    this.buildDownloads(checklistsAndItems);

    this.checklistSpinner = false;
    this.checklistExtract.emit(checklistsAndItems);
  }

  /**
   * This creates 3 downloadable files , a json file with the checklists and items
   * and also 2 separate csv versions with the checklists in one and the checklistitems
   * in the other
   * @param checklistsAndItems
   */
  buildDownloads(checklistsAndItems: Checklistextract[]) {
    // console.log("createDownload:", checklistsAndItems);

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
    const checklistscsv = this.toCsv(checklists);
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
    const checklistitemscsv = this.toCsv(checklistitems);

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
        dateCreated: ci.dateCreated,
        dateResultSet: ci.dateResultSet,
        evidence: ci.evidence,
        allowNA: ci.allowNA,
        requireEvidence: ci.requireEvidence,
        resultValue: ci.resultValue,
        resultType: ci.resultType,
        comment: ci.comment,
        tagId: ci.tagId,
      };
      return checklistitemcsv;
    } catch (e) {
      console.error("checklistitemExtractToCSV error:", e.msg);
      return null;
    }
  }

  toCsv(rows: object[]) {
    if (!rows || !rows.length) {
      return;
    }
    const separator = ",";
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      "\n" +
      rows
        .map((row) => {
          return keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? "" : row[k];
              cell =
                cell instanceof Date
                  ? cell.toLocaleString()
                  : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join("\n");
    return csvContent;
  }

  async getChecklists(checklists$: Observable<Checklist[]>) {
    // console.log("getChecklistitems");
    let checklists = await checklists$.pipe(first()).toPromise();
    return checklists;
  }

  async getChecklistitems(checklistitems$: Observable<Checklistitem[]>) {
    // console.log("getChecklistitems");
    let checklistitems = await checklistitems$.pipe(first()).toPromise();
    return checklistitems;
  }

  async denormalizeChecklist(checklist: Checklist): Promise<Checklistextract> {
    // console.log("denormalizeChecklist", checklist);
    let s = await this.checklistService
      .getStatistics(checklist.id)
      .pipe(first())
      .toPromise();

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
      score: s.scorePercentage,
    };

    return checklistextract;
  }

  denormalizeChecklistitem(checklistitem: Checklistitem): Checklistitemextract {
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
    };
    return checklistitemextract;
  }

  ngOnDestroy() {
    if (this.categoriesInfo$$) {
      this.categoriesInfo$$.unsubscribe();
    }
    if (this.teamInfo$$) {
      this.teamInfo$$.unsubscribe();
    }
    if (this.activityInfo$$) {
      this.activityInfo$$.unsubscribe();
    }
  }
}
