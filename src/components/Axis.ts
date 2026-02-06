import * as d3 from "d3";
import { formatMa } from "../utils/format";
import type { RenderContext } from "../types";

export class Axis {
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(parent: d3.Selection<SVGGElement, unknown, null, undefined>, axisY: number) {
    this.g = parent.append("g").attr("class", "axis").attr("transform", `translate(0,${axisY})`);
  }

  render(ctx: RenderContext): void {
    const vl = ctx.xScale.invert(0);
    const vr = ctx.xScale.invert(ctx.iW);
    const lin = d3.scaleLinear().domain([vl, vr]).range([0, ctx.iW]);
    this.g.call(
      d3.axisBottom(lin)
        .tickFormat((d) => formatMa(Math.abs(d.valueOf())))
        .ticks(Math.min(14, Math.max(4, Math.floor(ctx.iW / 110)))),
    );
    this.g.selectAll("text").attr("fill", "#506070");
    this.g.selectAll("line, path").attr("stroke", "#1e2a38");
  }

  updateY(axisY: number): void {
    this.g.attr("transform", `translate(0,${axisY})`);
  }
}
