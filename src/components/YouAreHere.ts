import * as d3 from "d3";
import { t } from "../i18n";
import type { RenderContext } from "../types";

export class YouAreHere {
  private grp: d3.Selection<SVGGElement, unknown, null, undefined>;
  private label: d3.Selection<SVGTextElement, unknown, null, undefined>;

  constructor(parent: d3.Selection<SVGGElement, unknown, null, undefined>, eonH: number) {
    this.grp = parent.append("g").attr("class", "yah");
    this.grp.append("circle").attr("class", "you-are-here-pulse").attr("cy", eonH / 2);
    this.grp.append("circle").attr("cy", eonH / 2).attr("r", 5).attr("fill", "#d4a54a");
    this.label = this.grp.append("text").attr("y", -6).attr("text-anchor", "end").attr("fill", "#d4a54a")
      .attr("font-size", "10px").attr("font-weight", "700");
  }

  render(ctx: RenderContext): void {
    this.grp.attr("transform", `translate(${ctx.xScale(0)},0)`);
    this.label.text(t("youAreHere"));
  }
}
