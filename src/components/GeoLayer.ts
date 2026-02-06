import * as d3 from "d3";
import { N } from "../i18n";
import { contrastColor } from "../utils/color";
import type { GeoItem, RenderContext } from "../types";

export class GeoLayer {
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private data: GeoItem[];
  private y: number;
  private h: number;
  private cls: string;

  constructor(
    parent: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: GeoItem[],
    y: number,
    h: number,
    cls: string,
    private onHover: (ev: MouseEvent, d: GeoItem) => void,
    private onMove: (ev: MouseEvent) => void,
    private onLeave: () => void,
    private onClick: (ev: MouseEvent, d: GeoItem) => void,
  ) {
    this.g = parent.append("g");
    this.data = data;
    this.y = y;
    this.h = h;
    this.cls = cls;
  }

  render(ctx: RenderContext): void {
    const { xScale } = ctx;
    const iW = ctx.iW;

    const sel = this.g.selectAll<SVGGElement, GeoItem>(`.${this.cls}`).data(this.data, (d) => d.name);
    const ent = sel.enter().append("g").attr("class", this.cls);
    ent.append("rect").attr("class", "geo-bar");
    ent.append("text").attr("class", "geo-label");
    ent.select<SVGRectElement>("rect")
      .on("mouseover", (ev: MouseEvent, d: GeoItem) => this.onHover(ev, d))
      .on("mousemove", (ev: MouseEvent) => this.onMove(ev))
      .on("mouseout", () => this.onLeave())
      .on("dblclick", (ev: MouseEvent, d: GeoItem) => {
        ev.stopPropagation();
        this.onClick(ev, d);
      });
    const all = ent.merge(sel);

    all.select<SVGRectElement>("rect")
      .attr("x", (d) => Math.max(-2000, xScale(d.start)))
      .attr("y", this.y)
      .attr("width", (d) => {
        const x1 = Math.max(-2000, xScale(d.start));
        const x2 = Math.min(iW + 2000, xScale(d.end));
        return Math.max(0, x2 - x1);
      })
      .attr("height", this.h)
      .attr("fill", (d) => d.color)
      .style("display", (d) => {
        const x1 = xScale(d.start);
        const x2 = xScale(d.end);
        return x2 < 0 || x1 > iW ? "none" : null;
      });

    all.select<SVGTextElement>("text")
      .attr("x", (d) => {
        const a = Math.max(0, xScale(d.start));
        const b = Math.min(iW, xScale(d.end));
        return (a + b) / 2;
      })
      .attr("y", this.y + this.h / 2)
      .attr("fill", (d) => contrastColor(d.color))
      .style("font-size", this.h >= 40 ? "16px" : this.h >= 30 ? "14px" : "12px")
      .text((d) => {
        const nm = N(d);
        const visL = Math.max(0, xScale(d.start));
        const visR = Math.min(iW, xScale(d.end));
        const px = visR - visL;
        if (px < 35) return "";
        if (px < 65) return nm.slice(0, 4);
        if (px < 110) return nm.length > 10 ? nm.slice(0, 9) + "\u2026" : nm;
        return nm;
      });

    sel.exit().remove();
  }

  clear(): void {
    this.g.selectAll("*").remove();
  }
}
