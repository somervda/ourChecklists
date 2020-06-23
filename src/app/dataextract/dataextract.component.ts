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
import { createUrlResolverWithoutPackagePrefix } from "@angular/compiler";

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

  constructor(
    private categoryService: CategoryService,
    private teamService: TeamService,
    private activityService: ActivityService,
    private helper: HelperService,
    private checklistService: ChecklistService,
    private checklistitemService: ChecklistitemService
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
    console.log("ckicker");
    this.checklistSpinner = true;
    // const x = await this.checklists$
    //   .pipe(first())
    //   .toPromise()
    //   .then((cs) => {
    //     cs.map((c) => {
    //       // Also resolve all the checklist items for the checklist
    //       const checklistitem$$ = this.checklistitemService
    //         .findAll(c.id)
    //         .pipe(first())
    //         .toPromise()
    //         .then((cis) => {
    //           // Process the cs and cis items to build the denormalized extract
    //           console.log("c:", c, " csi:", cis);
    //           this.checklistsExtract.push(this.denormalizeChecklist(c, cis));
    //           // console.log("this.checklistsExtract", this.checklistsExtract);
    //         });
    //     });
    //   });

    let cl = await (await this.getChecklists(this.checklists$)).map((c) =>
      this.denormalizeChecklist(c)
    );
    let y = JSON.parse(JSON.stringify(cl));
    console.log("y", y);
    // async (cl.map(async (c) => {
    //   let checklistitems$ = this.checklistitemService.findAll(c.id);
    //   let cx = await (
    //     await this.getChecklistitems(checklistitems$)
    //   ).map((cli) => this.denormalizeChecklistitem(cli));
    //   let cy = JSON.parse(JSON.stringify(cx));
    //   c["checklistitems"] = cy;
    // }));
    // let cl2 = await cl.map(async (cl) => {
    //   let checklistitems$ = this.checklistitemService.findAll(cl.id);
    //   let ci = (await this.getChecklistitems(checklistitems$)).map((c) =>
    //     this.denormalizeChecklistitem(c)
    //   );
    //   console.log("ci", ci);
    //   // let x = JSON.parse(JSON.stringify(ci));
    //   // console.log("x", x);
    //   cl["checklistitems"] = ci;
    //   return cl;
    // });
    // see https://flaviocopes.com/javascript-async-await-array-map/
    let ci = await this.getChecklistitems(
      this.checklistitemService.findAll(cl[0].id)
    );
    let x = JSON.parse(JSON.stringify(ci));

    let cl2 = await Promise.all(
      cl.map(async (c) => {
        let ci = await (
          await this.getChecklistitems(this.checklistitemService.findAll(c.id))
        ).map((cii) => this.denormalizeChecklistitem(cii));
        c["checklistitems"] = ci;
        return c;
      })
    );

    console.log("end", cl2);
    this.checklistSpinner = false;
  }

  // async getChecklistitems(id) {
  //   let checklistitems$ = this.checklistitemService.findAll(id);
  //   let ci = await (await this.getChecklistitems(checklistitems$)).map((c) =>
  //     this.denormalizeChecklistitem(c)
  //   );
  //   return ci;

  // }

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

  async getChecklists(checklists$: Observable<Checklist[]>) {
    // console.log("getChecklistitems");
    let x = await checklists$.pipe(first()).toPromise();
    console.log("getChecklists x", x);
    return x;
  }

  async getChecklistitems(checklistitems$: Observable<Checklistitem[]>) {
    // console.log("getChecklistitems");
    let x = await checklistitems$.pipe(first()).toPromise();
    console.log("getChecklistitems x", x);
    return x;
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
