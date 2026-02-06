import * as d3 from "d3";
import { t } from "../i18n";
import type { RenderContext } from "../types";

export class YouAreHere {
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private eonH: number;

  constructor(parent: d3.Selection<SVGGElement, unknown, null, undefined>, eonH: number) {
    this.g = parent.append("g");
    this.eonH = eonH;
  }

  render(ctx: RenderContext): void {
    this.g.selectAll("*").remove();
    const grp = this.g.append("g").attr("class", "yah").attr("transform", `translate(${ctx.xScale(0)},0)`);
    grp.append("circle").attr("class", "you-are-here-pulse").attr("cy", this.eonH / 2);
    grp.append("circle").attr("cy", this.eonH / 2).attr("r", 5).attr("fill", "#d4a54a");
    grp.append("text").attr("y", -6).attr("text-anchor", "end").attr("fill", "#d4a54a")
      .attr("font-size", "10px").attr("font-weight", "700").text(t("youAreHere"));
  }
}
