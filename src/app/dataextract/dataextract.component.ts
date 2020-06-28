import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { HelperService } from "../services/helper.service";

@Component({
  selector: "app-dataextract",
  templateUrl: "./dataextract.component.html",
  styleUrls: ["./dataextract.component.scss"],
})
export class DataextractComponent implements OnInit {
  rows: number = 0;
  fileUrl;
  downLoadReady = false;
  extractName = "checklists-extract.json";
  // @ViewChild("fileExtract") fileExtract: ElementRef<HTMLElement>;

  constructor(
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    private helper: HelperService
  ) {}

  ngOnInit(): void {}

  startExtract() {
    this.downLoadReady = false;
  }

  createDownload(checklistsAndItems) {
    console.log("createDownload:", checklistsAndItems);
    this.rows = checklistsAndItems.length;
    const extractBlob = new Blob([JSON.stringify(checklistsAndItems)], {
      type: "application/json",
    });

    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      window.URL.createObjectURL(extractBlob)
    );
    this.extractName =
      "checklists-extract-" + new Date().toISOString() + ".json";
    this.helper.snackbar(
      `Checklists extract ready for downloading: ${this.rows} checklists found.`,
      2000
    );
    this.downLoadReady = true;
  }
}
