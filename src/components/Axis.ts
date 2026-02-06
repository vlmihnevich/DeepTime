import * as d3 from "d3";
import { formatMa, to24Hour } from "../utils/format";
import type { RenderContext } from "../types";

export class Axis {
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gClock: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(parent: d3.Selection<SVGGElement, unknown, null, undefined>, axisY: number) {
    this.g = parent.append("g").attr("class", "axis").attr("transform", `translate(0,${axisY})`);
    this.gClock = parent.append("g").attr("class", "axis-clock").attr("transform", `translate(0,${axisY})`);
  }

  render(ctx: RenderContext): void {
    const vl = ctx.xScale.invert(0);
    const vr = ctx.xScale.invert(ctx.iW);
    const lin = d3.scaleLinear().domain([vl, vr]).range([0, ctx.iW]);
    const tickCount = Math.min(14, Math.max(4, Math.floor(ctx.iW / 110)));
    this.g.call(
      d3.axisBottom(lin)
        .tickFormat((d) => formatMa(Math.abs(d.valueOf())))
        .ticks(tickCount),
    );
    this.g.selectAll("text").attr("fill", "#c0c8d4");
    this.g.selectAll("line, path").attr("stroke", "#1c2430");

    // 24-hour clock labels below main axis
    const ticks = lin.ticks(tickCount);
    const sel = this.gClock.selectAll<SVGTextElement, number>(".clock-label")
      .data(ticks, (d) => String(d));
    sel.enter().append("text").attr("class", "clock-label").merge(sel)
      .attr("x", (d) => lin(d))
      .attr("y", 32)
      .attr("text-anchor", "middle")
      .attr("fill", "#d4a54a")
      .attr("opacity", 0.9)
      .attr("font-size", "9.5px")
      .attr("font-family", "'DM Sans', system-ui, sans-serif")
      .attr("font-weight", "500")
      .attr("letter-spacing", "0.03em")
      .text((d) => to24Hour(Math.abs(d)));
    sel.exit().remove();
  }

  updateY(axisY: number): void {
    this.g.attr("transform", `translate(0,${axisY})`);
    this.gClock.attr("transform", `translate(0,${axisY})`);
  }
}
