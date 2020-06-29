import { Component, OnInit } from "@angular/core";
import { HelperService } from "../services/helper.service";
import { Checklistextract } from "../models/checklistextract.model";

@Component({
  selector: "app-datavizualization",
  templateUrl: "./datavizualization.component.html",
  styleUrls: ["./datavizualization.component.scss"],
})
export class DatavizualizationComponent implements OnInit {
  rows: number = 0;
  showChart = false;

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

  createViz(checklistsAndItems) {
    // console.log("creatViz:", checklistsAndItems);
    this.rows = checklistsAndItems.length;
    this.series = this.buildChartData(
      checklistsAndItems,
      "category.name",
      "score.completeness"
    );

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
      const value = traverse(c, scoreProperty);
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
      return { name: s.name, value: Math.round(s.value / s.count) };
    });
  }

  onSelect() {}
}
