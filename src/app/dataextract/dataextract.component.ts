import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { Observable, Subscription } from "rxjs";
import { first, map } from "rxjs/operators";
import { TemplateselectordialogComponent } from "../dialogs/templateselectordialog/templateselectordialog.component";
import { Checklist, ChecklistStatusInfo } from "../models/checklist.model";
import {
  Checklistextract,
  Checklistitemextract,
  DocInfo,
  UserInfo,
} from "../models/checklistextract.model";
import { Checklistitem } from "../models/checklistitem.model";
import { ActivityService } from "../services/activity.service";
import { CategoryService } from "../services/category.service";
import { ChecklistService } from "../services/checklist.service";
import { ChecklistitemService } from "../services/checklistitem.service";
import { HelperService } from "../services/helper.service";
import { TeamService } from "../services/team.service";
import { UserService } from "../services/user.service";

@Component({
  selector: "app-dataextract",
  templateUrl: "./dataextract.component.html",
  styleUrls: ["./dataextract.component.scss"],
})
export class DataextractComponent implements OnInit, OnDestroy {
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

  templates$: Observable<Checklist[]>;
  templateInfo: DocInfo[];
  templateInfo$: Observable<DocInfo[]>;
  templateInfo$$: Subscription;
  templateSpinner = false;

  rows: number;
  fileUrl;
  downLoadReady = false;
  extractName = "checklists-extract.json";
  @ViewChild("fileExtract") fileExtract: ElementRef<HTMLElement>;

  checklistStatusInfo = ChecklistStatusInfo;

  selectedStatus = "0";
  selectedCategory = "0";
  selectedTeam = "0";
  selectedTemplate = { id: "0", name: "All" };
  selectedFromDate: Date;
  selectedToDate: Date;

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
    console.log("ngOnInit start");
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
      console.log("activityInfo:", this.activityInfo);
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
    console.log("templateDialog");
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

  async createExtractFile() {
    console.log(
      "selectedFromDate ${this.selectedFromDate}, selectedCategory ${this.selectedCategory} ," +
        " selectedTeam ${this.selectedTeam}, selectedTemplate${this.selectedTemplate}," +
        " selectedStatus ${this.selectedStatus}, selectedToDate ${this.selectedToDate}"
    );
    this.checklistSpinner = true;
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

    // For the extract I use a lot of awaits to resolve promises so the end result
    // is to have all the selected checklists ready to write as json to a file
    // and have denormalized most of the document references. Not all the properties
    // of the checklists or checklist items get extracted
    let checklists = await (
      await this.getChecklists(this.checklists$)
    ).map((c) => this.denormalizeChecklist(c));

    this.rows = checklists.length;

    let checklistsAndItems = await Promise.all(
      checklists.map(async (c) => {
        let checklistitems = await (
          await this.getChecklistitems(this.checklistitemService.findAll(c.id))
        ).map((cli) => this.denormalizeChecklistitem(cli));
        c["checklistitems"] = checklistitems;
        return c;
      })
    );

    // console.log("end", checklistsAndItems);

    console.log("createDownload:", checklistsAndItems);
    const extractBlob = new Blob([JSON.stringify(checklistsAndItems)], {
      type: "application/json",
    });

    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      window.URL.createObjectURL(extractBlob)
    );
    this.extractName =
      "checklists-extract-" + new Date().toISOString() + ".json";
    this.downLoadReady = true;

    this.checklistSpinner = false;
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

  denormalizeChecklist(checklist: Checklist): Checklistextract {
    // console.log("denormalizeChecklist", checklist);
    let checklistextract: Checklistextract = {
      id: checklist.id,
      isTemplate: checklist.isTemplate,
      name: checklist.name,
      description: checklist.description,
      status: checklist.status,
      dateCreated: checklist.dateCreated
        ? (checklist.dateCreated as firebase.firestore.Timestamp).toDate()
        : undefined,
      dateCompleted: checklist.dateCompleted
        ? (checklist.dateCompleted as firebase.firestore.Timestamp).toDate()
        : undefined,
      dateUpdated: checklist.dateUpdated
        ? (checklist.dateUpdated as firebase.firestore.Timestamp).toDate()
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
    if (this.templateInfo$$) {
      this.templateInfo$$.unsubscribe();
    }
  }
}
