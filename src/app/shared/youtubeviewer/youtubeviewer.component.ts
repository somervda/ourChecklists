import { Component, OnInit, Input } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-youtubeviewer",
  templateUrl: "./youtubeviewer.component.html",
  styleUrls: ["./youtubeviewer.component.scss"],
})
export class YoutubeviewerComponent implements OnInit {
  @Input() youtubeId: string;
  isMedium: boolean = false;
  clickedVideo = false;
  safeImageURL: SafeResourceUrl;
  safeVideoURL: SafeResourceUrl;

  constructor(public sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.safeImageURL = this.youtubeImageURL(this.youtubeId);
    this.safeVideoURL = this.youtubeURL(this.youtubeId);
    console.log(this.youtubeId, this.safeImageURL, this.safeVideoURL);
  }

  youtubeURL(youtubeId: string): SafeResourceUrl {
    // allow the generated URL to be used in angular template
    // need to sanitize the URL to allow angular to present it
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      "https://www.youtube.com/embed/" + youtubeId + "?autoplay=1"
    );
  }

  youtubeImageURL(youtubeId: string): SafeResourceUrl {
    // allow the generated URL to be used in angular template
    // need to sanitize the URL to allow angular to present it
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      "https://img.youtube.com/vi/" + youtubeId + "/mqdefault.jpg"
    );
  }
}
