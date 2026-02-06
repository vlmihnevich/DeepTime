import * as d3 from "d3";
import { N } from "../i18n";
import type { Species, RenderContext } from "../types";

export class SpeciesBars {
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private data: Species[];
  private spY: number;
  private spLane: number;
  private spGap: number;

  constructor(
    parent: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: Species[],
    spY: number,
    spLane: number,
    spGap: number,
    private onHover: (ev: MouseEvent, d: Species) => void,
    private onMove: (ev: MouseEvent) => void,
    private onLeave: () => void,
    private onClick: (ev: MouseEvent, d: Species) => void,
  ) {
    this.g = parent.append("g");
    this.data = data;
    this.spY = spY;
    this.spLane = spLane;
    this.spGap = spGap;
  }

  render(ctx: RenderContext): void {
    const k = ctx.curT.k;

    const sel = this.g.selectAll<SVGGElement, Species>(".sp-group").data(this.data, (d) => d.name);
    const ent = sel.enter().append("g").attr("class", "sp-group");
    ent.append("rect").attr("class", "species-bar");
    ent.append("text").attr("class", "species-label");

    const all = ent.merge(sel);
    all.select<SVGRectElement>("rect")
      .attr("x", (d) => ctx.xScale(d.start))
      .attr("y", (d) => this.spY + (d._lane || 0) * (this.spLane + this.spGap))
      .attr("width", (d) => Math.max(4, ctx.xScale(d.end) - ctx.xScale(d.start)))
      .attr("height", this.spLane)
      .attr("fill", (d) => d.color)
      .attr("opacity", 0.7)
      .attr("stroke", "rgba(255,255,255,0.08)")
      .attr("stroke-width", 0.5);

    all.select<SVGTextElement>("text")
      .attr("x", (d) => {
        const visL = Math.max(0, ctx.xScale(d.start));
        return visL + 5;
      })
      .attr("y", (d) => this.spY + (d._lane || 0) * (this.spLane + this.spGap) + this.spLane / 2)
      .text((d) => {
        const nm = N(d);
        const visL = Math.max(0, ctx.xScale(d.start));
        const visR = Math.min(ctx.iW, ctx.xScale(d.end));
        const visPx = visR - visL;
        if (visPx < 35) return "";
        if (visPx < 70) return nm.slice(0, 6) + (nm.length > 6 ? "\u2026" : "");
        return nm;
      })
      .attr("font-size", "13px")
      .attr("dominant-baseline", "central")
      .attr("opacity", k > 3 ? 0.9 : 0.6);

    all.on("mouseover", (ev: MouseEvent, d: Species) => this.onHover(ev, d))
      .on("mousemove", (ev: MouseEvent) => this.onMove(ev))
      .on("mouseout", () => this.onLeave())
      .on("click", (ev: MouseEvent, d: Species) => {
        ev.stopPropagation();
        this.onClick(ev, d);
      });

    sel.exit().remove();
  }
}
