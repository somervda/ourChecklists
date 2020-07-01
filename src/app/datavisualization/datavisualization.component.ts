import { Component, OnInit } from "@angular/core";
import { HelperService } from "../services/helper.service";
import { Checklistextract } from "../models/checklistextract.model";

@Component({
  selector: "app-datavisualization",
  templateUrl: "./datavisualization.component.html",
  styleUrls: ["./datavisualization.component.scss"],
})
export class DatavisualizationComponent implements OnInit {
  rows: number = 0;
  showChart = false;
  checklistsAndItems;
  valueProperty = "score.overall";
  groupProperty = "category.name";

  series = [];
  // view: any[] = [700, 400];

  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  yAxisLabel: string = "Category";
  showYAxisLabel: boolean = true;
  xAxisLabel: string = "Percentage";

  colorScheme = {
    domain: ["#5AA454", "#A10A28", "#C7B42C", "#AAAAAA"],
  };

  constructor(private helper: HelperService) {}

  ngOnInit(): void {}

  startExtract() {
    this.showChart = false;
  }

  groupChange(groupProperty: string) {
    console.log("groupChange", groupProperty);
    this.groupProperty = groupProperty;
    this.drawChart();
  }

  valueChange(valueProperty: string) {
    console.log("valueChange", valueProperty);
    this.valueProperty = valueProperty;
    this.drawChart();
  }

  initializeVisualization(checklistsAndItems) {
    this.checklistsAndItems = checklistsAndItems;
    this.drawChart();
  }

  drawChart() {
    // console.log("creatViz:", checklistsAndItems);
    this.rows = this.checklistsAndItems.length;
    switch (this.groupProperty) {
      case "category.name":
        this.yAxisLabel = "Category";
        break;
      case "team.name":
        this.yAxisLabel = "Team";
        break;
      case "status.name":
        this.yAxisLabel = "Status";
        break;
      default:
        this.yAxisLabel = "?";
        break;
    }
    switch (this.valueProperty) {
      case "score.overall":
        this.xAxisLabel = "Checklist Score (Avg.) %";
        break;
      case "score.completeness":
        this.xAxisLabel = "Checklist completeness (Avg.) %";
        break;
      case "counts":
        this.xAxisLabel = "Checklist Counts";
        break;
      default:
        this.xAxisLabel = "?";
        break;
    }

    this.series = this.buildChartData(
      this.checklistsAndItems,
      this.groupProperty,
      this.valueProperty
    );
    console.log("this.series", this.series);
    this.showChart = true;
  }

  buildChartData(
    checklistsAndItems: Checklistextract[],
    groupingProperty: string,
    scoreProperty: string
  ): { name: string; value: number }[] {
    let traverse = function (obj, keys) {
      return keys.split(".").reduce(function (cur, key) {
        return cur[key];
      }, obj);
    };

    let series: { name: string; value: number; count: number }[] = [];
    checklistsAndItems.forEach((c) => {
      const group = traverse(c, groupingProperty);
      const value = scoreProperty == "counts" ? 1 : traverse(c, scoreProperty);
      if (group != undefined && value != undefined) {
        if (series.find((x) => x.name == group)) {
          series.find((x) => x.name == group).value += value;
          series.find((x) => x.name == group).count += 1;
        } else {
          series.push({ name: group, value: value, count: 1 });
        }
      }
    });

    return series.map((s) => {
      return scoreProperty == "counts"
        ? { name: s.name, value: s.value }
        : { name: s.name, value: Math.round(s.value / s.count) };
    });
  }

  onSelect() {}
}
