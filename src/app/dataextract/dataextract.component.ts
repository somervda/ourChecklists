import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from "@angular/core";
import { CategoryService } from "../services/category.service";
import { Observable, Subscription } from "rxjs";
import { Category } from "../models/category.model";
import {
  DocInfo,
  Checklistextract,
  Checklistitemextract,
  UserInfo,
} from "../models/checklistextract.model";
import { map, first } from "rxjs/operators";
import { TeamService } from "../services/team.service";
import { ActivityService } from "../services/activity.service";
import {
  Checklist,
  ChecklistStatusInfo,
  ChecklistStatus,
} from "../models/checklist.model";
import { HelperService } from "../services/helper.service";
import { ChecklistService } from "../services/checklist.service";
import { ChecklistitemService } from "../services/checklistitem.service";
import { Checklistitem } from "../models/checklistitem.model";
import { DomSanitizer } from "@angular/platform-browser";
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

  fileUrl;
  downLoadReady = false;
  extractName = "checklists-extract.json";
  @ViewChild("fileExtract") fileExtract: ElementRef<HTMLElement>;

  checklistStatusInfo = ChecklistStatusInfo;

  selectedStatus = "0";
  selectedCategory = "0";
  selectedTeam = "0";
  selectedTemplate = "0";
  selectedFromDate: any;

  templates$: Observable<Checklist[]>;

  constructor(
    private categoryService: CategoryService,
    private teamService: TeamService,
    private activityService: ActivityService,
    private helper: HelperService,
    private checklistService: ChecklistService,
    private checklistitemService: ChecklistitemService,
    private sanitizer: DomSanitizer,
    private userService: UserService,
    private cdr: ChangeDetectorRef
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

    this.templates$ = this.checklistService.findAllTemplates(1000).pipe(
      map((c) => {
        return c.filter((cf) => cf.status != ChecklistStatus.Deleted);
      })
    );

    this.checklists$ = this.checklistService.findAll(20);
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

  async createExtractFile() {
    console.log("Selected:", this.selectedFromDate);
    // For the extract I use a lot of awaits to resolve promises so the end result
    // is to have all the selected checklists ready to write as json to a file
    // and have denomalized most of the document references. Not all the properties
    // of the checklists or checklist items get extracted
    this.checklistSpinner = true;
    let checklists = await (
      await this.getChecklists(this.checklists$)
    ).map((c) => this.denormalizeChecklist(c));

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
    this.cdr.detectChanges();

    // let el: HTMLElement = this.fileExtract.nativeElement;

    // el.click();
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
