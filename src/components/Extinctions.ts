import * as d3 from "d3";
import type { KeyEvent, RenderContext } from "../types";

export class Extinctions {
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private data: KeyEvent[];
  private axisY: number;

  constructor(
    parent: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: KeyEvent[],
    axisY: number,
    private onHover: (ev: MouseEvent, d: KeyEvent) => void,
    private onMove: (ev: MouseEvent) => void,
    private onLeave: () => void,
    private onClick: (ev: MouseEvent, d: KeyEvent) => void,
  ) {
    this.g = parent.append("g");
    this.data = data.filter((d) => d.type === "extinction");
    this.axisY = axisY;
  }

  updateY(axisY: number): void {
    this.axisY = axisY;
  }

  render(ctx: RenderContext): void {
    const bw = Math.max(4, Math.min(40, 6 * Math.sqrt(ctx.curT.k)));

    const sel = this.g.selectAll<SVGRectElement, KeyEvent>(".extinction-band").data(this.data, (d) => d.name);
    const ent = sel.enter().append("rect").attr("class", "extinction-band")
      .attr("filter", "url(#glow)")
      .on("mouseover", (ev: MouseEvent, d: KeyEvent) => this.onHover(ev, d))
      .on("mousemove", (ev: MouseEvent) => this.onMove(ev))
      .on("mouseout", () => this.onLeave())
      .on("click", (ev: MouseEvent, d: KeyEvent) => {
        ev.stopPropagation();
        this.onClick(ev, d);
      });
    ent.merge(sel)
      .attr("x", (d) => ctx.xScale(d.date) - bw / 2)
      .attr("y", 0)
      .attr("width", bw)
      .attr("height", this.axisY)
      .attr("fill", "#e03e3e")
      .attr("opacity", (d) => ((d.severity || 50) / 100) * 0.28)
      .attr("rx", bw / 3);
    sel.exit().remove();
  }
}
