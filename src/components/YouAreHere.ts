import * as d3 from "d3";
import { t } from "../i18n";
import type { RenderContext } from "../types";

export class YouAreHere {
  private grp: d3.Selection<SVGGElement, unknown, null, undefined>;
  private label: d3.Selection<SVGTextElement, unknown, null, undefined>;

  constructor(parent: d3.Selection<SVGGElement, unknown, null, undefined>, private eonH: number) {
    this.grp = parent.append("g").attr("class", "yah");
    this.grp.append("circle").attr("class", "you-are-here-pulse").attr("cy", this.eonH / 2);
    this.grp.append("circle").attr("cy", this.eonH / 2).attr("r", 5).attr("fill", "var(--accent)");
    this.label = this.grp.append("text").attr("y", -6).attr("text-anchor", "end").attr("fill", "var(--accent)")
      .attr("font-size", "12px").attr("font-weight", "700");
  }

  updateY(eonH: number): void {
    this.eonH = eonH;
    this.grp.selectAll("circle").attr("cy", this.eonH / 2);
  }

  render(ctx: RenderContext): void {
    this.grp.attr("transform", `translate(${ctx.xScale(0)},0)`);
    this.label.text(t("youAreHere"));
  }
}
