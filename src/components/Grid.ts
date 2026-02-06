import * as d3 from "d3";
import type { RenderContext } from "../types";

export class Grid {
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private axisY: number;

  constructor(parent: d3.Selection<SVGGElement, unknown, null, undefined>, axisY: number) {
    this.g = parent.append("g");
    this.axisY = axisY;
  }

  render(ctx: RenderContext): void {
    const vl = ctx.xScale.invert(0);
    const vr = ctx.xScale.invert(ctx.iW);
    const lin = d3.scaleLinear().domain([vl, vr]).range([0, ctx.iW]);
    const ticks = lin.ticks(Math.min(14, Math.floor(ctx.iW / 110)));

    const sel = this.g.selectAll<SVGLineElement, number>(".grid-line").data(ticks, (d) => String(d));
    sel.enter().append("line").attr("class", "grid-line").merge(sel)
      .attr("x1", (d) => lin(d)).attr("x2", (d) => lin(d))
      .attr("y1", 0).attr("y2", this.axisY)
      .attr("stroke", "#141a24").attr("stroke-width", 0.5);
    sel.exit().remove();
  }
}
