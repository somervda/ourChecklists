import { HelperService } from "./../services/helper.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  Checklist,
  ChecklistStatusInfo,
  ChecklistStatus,
  ChecklistStatusInfoItem,
} from "../models/checklist.model";
import { ChecklistService } from "../services/checklist.service";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { Resource } from "../models/resource.model";
import { MatDialog } from "@angular/material/dialog";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { AuthService } from "../services/auth.service";
import { first } from "rxjs/operators";
import { TeamService } from "../services/team.service";
import { Team } from "../models/team.model";
import { DocumentReference } from "@angular/fire/firestore";

@Component({
  selector: "app-checklistedit",
  templateUrl: "./checklistedit.component.html",
  styleUrls: ["./checklistedit.component.scss"],
})
export class ChecklisteditComponent implements OnInit {
  checklist: Checklist;
  enhanced = false;
  showResources = false;
  checklistForm: FormGroup;
  myteams$: Observable<Team[]>;

  constructor(
    private route: ActivatedRoute,
    private checklistService: ChecklistService,
    public dialog: MatDialog,
    public helper: HelperService,
    private fb: FormBuilder,
    private auth: AuthService,
    private teamService: TeamService
  ) {}

  ngOnInit() {
    this.checklist = this.route.snapshot.data["checklist"];
    // if (this.checklist.resources) {
    //   this.resources$ = this.resourceService.findAllIn(
    //     this.checklist.resources.map((r) => r.id)
    //   );
    // }

    // Create validators
    this.checklistForm = this.fb.group({
      name: [
        this.checklist.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(70),
        ],
      ],
      description: [
        this.checklist.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      comments: [this.checklist?.comments, [Validators.maxLength(5000)]],
    });
    this.auth.user$
      .pipe(first())
      .toPromise()
      .then((u) => {
        if (u.isAdmin) {
          this.myteams$ = this.teamService.findAll(100);
        } else {
          // Can assign to a team the user is a manager or member but not a reviewer
          this.myteams$ = this.teamService.findMyMemberManagerReviewerOfTeams(
            true,
            true,
            false
          );
        }
      });
  }

  onEnhanced(checked) {
    // console.log("onshowallchange", checked);
    this.enhanced = checked;
  }

  objectComparisonFunction = function (
    option: DocumentReference,
    value: DocumentReference
  ): boolean {
    // Needed to compare objects in select drop downs
    // console.log("compare", option, value);
    return option?.path == value?.path;
  };

  onTeamChange(event) {
    // console.log("onTeamChange: ", event);
    this.checklist.team = event.value;
    this.checklistService.fieldUpdate(
      this.checklist.id,
      "team",
      this.checklist.team
    );
  }

  toDate(timestamp: any): Date {
    if (timestamp) {
      return (timestamp as firebase.firestore.Timestamp).toDate();
    } else {
      return null;
    }
  }

  targetDateChange(value) {
    console.log("targetDateChange:", value);
    this.checklistService.fieldUpdate(this.checklist.id, "dateTargeted", value);
  }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (this.checklistForm.get(fieldName).valid) {
      let newValue = this.checklistForm.get(fieldName).value;
      this.checklistService.fieldUpdate(this.checklist.id, fieldName, newValue);
      this.checklist[fieldName] = newValue;
    }
  }
}
