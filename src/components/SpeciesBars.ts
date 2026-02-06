import * as d3 from "d3";
import { N } from "../i18n";
import { contrastColor } from "../utils/color";
import { formatDuration, formatDuration24 } from "../utils/format";
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
    const sel = this.g.selectAll<SVGGElement, Species>(".sp-group").data(this.data, (d) => d.name);
    const ent = sel.enter().append("g").attr("class", "sp-group")
      .on("mouseover", (ev: MouseEvent, d: Species) => this.onHover(ev, d))
      .on("mousemove", (ev: MouseEvent) => this.onMove(ev))
      .on("mouseout", () => this.onLeave())
      .on("click", (ev: MouseEvent, d: Species) => {
        ev.stopPropagation();
        this.onClick(ev, d);
      });
    ent.append("rect").attr("class", "species-bar");
    ent.append("text").attr("class", "species-label");
    ent.append("text").attr("class", "species-duration");

    const all = ent.merge(sel);
    all.select<SVGRectElement>("rect")
      .attr("x", (d) => ctx.xScale(d.start))
      .attr("y", (d) => this.spY + (d._lane || 0) * (this.spLane + this.spGap))
      .attr("width", (d) => Math.max(4, ctx.xScale(d.end) - ctx.xScale(d.start)))
      .attr("height", this.spLane)
      .attr("fill", (d) => d.color)
      .attr("opacity", 1)
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-width", 0.5);

    all.select<SVGTextElement>("text")
      .attr("x", (d) => {
        const visL = Math.max(0, ctx.xScale(d.start));
        return visL + 5;
      })
      .attr("y", (d) => this.spY + (d._lane || 0) * (this.spLane + this.spGap) + this.spLane / 2)
      .attr("fill", (d) => contrastColor(d.color))
      .text((d) => {
        const nm = N(d);
        const visL = Math.max(0, ctx.xScale(d.start));
        const visR = Math.min(ctx.iW, ctx.xScale(d.end));
        const visPx = visR - visL;
        if (visPx < 35) return "";
        if (visPx < 85) return nm.slice(0, 6) + (nm.length > 6 ? "\u2026" : "");
        return nm;
      })
      .attr("font-size", "15px")
      .attr("dominant-baseline", "central")
      .attr("opacity", 1);

    all.select<SVGTextElement>(".species-duration")
      .attr("x", (d) => {
        const visR = Math.min(ctx.iW, ctx.xScale(d.end));
        return visR - 5;
      })
      .attr("y", (d) => this.spY + (d._lane || 0) * (this.spLane + this.spGap) + this.spLane / 2)
      .attr("fill", (d) => contrastColor(d.color))
      .attr("text-anchor", "end")
      .attr("font-size", "12px")
      .attr("dominant-baseline", "central")
      .attr("opacity", 1)
      .text((d) => {
        const visL = Math.max(0, ctx.xScale(d.start));
        const visR = Math.min(ctx.iW, ctx.xScale(d.end));
        const visPx = visR - visL;
        if (visPx < 120) return "";
        const dur = formatDuration(d.start, d.end);
        const clock = formatDuration24(d.start, d.end);
        if (visPx < 220) return dur;
        return `${dur} (${clock})`;
      });

    sel.exit().remove();
  }
}
