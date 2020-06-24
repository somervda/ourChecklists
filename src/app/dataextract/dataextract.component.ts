import { Component, OnInit, OnDestroy } from "@angular/core";
import { CategoryService } from "../services/category.service";
import { Observable, Subscription } from "rxjs";
import { Category } from "../models/category.model";
import {
  DocInfo,
  Checklistextract,
  Checklistitemextract,
} from "../models/checklistextract.model";
import { map, first } from "rxjs/operators";
import { TeamService } from "../services/team.service";
import { ActivityService } from "../services/activity.service";
import { Checklist } from "../models/checklist.model";
import { HelperService } from "../services/helper.service";
import { ChecklistService } from "../services/checklist.service";
import { ChecklistitemService } from "../services/checklistitem.service";
import { Checklistitem } from "../models/checklistitem.model";
import { DomSanitizer } from "@angular/platform-browser";

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

  checklistSpinner = false;
  checklists$: Observable<Checklist[]>;
  checklistsExtract: Checklistextract[];

  fileUrl;
  downLoadReady = false;
  extractName = "checklists-extract.json";

  constructor(
    private categoryService: CategoryService,
    private teamService: TeamService,
    private activityService: ActivityService,
    private helper: HelperService,
    private checklistService: ChecklistService,
    private checklistitemService: ChecklistitemService,
    private sanitizer: DomSanitizer
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

    this.checklists$ = this.checklistService.findAll(3);
  }

  async clicker() {
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
      team: { id: this.helper.getDocRefId(checklist.team) } as DocInfo,
      assignee: checklist.assignee
        ? checklist.assignee.map((userref) => {
            return { uid: this.helper.getDocRefId(userref) };
          })
        : [],
      resources: checklist.resources
        ? checklist.resources.map((docref) => {
            return { id: this.helper.getDocRefId(docref) };
          })
        : [],
      checklistitems: [],
      category: { id: this.helper.getDocRefId(checklist.category) } as DocInfo,
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
            return { id: this.helper.getDocRefId(docref) };
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
