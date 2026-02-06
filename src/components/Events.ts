import * as d3 from "d3";
import { N } from "../i18n";
import type { KeyEvent, RenderContext } from "../types";

const MAJOR_EVENT_NAMES = new Set([
  "Formation of Earth", "Origin of Life", "Great Oxidation Event",
  "Cambrian Explosion", "First Dinosaurs", "Homo Sapiens",
  "First Eukaryotes", "First Animals",
]);

interface EvtWithRow extends KeyEvent {
  _row: number;
}

export class Events {
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private data: KeyEvent[];
  private evtY: number;
  private axisY: number;

  constructor(
    parent: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: KeyEvent[],
    evtY: number,
    axisY: number,
    private onHover: (ev: MouseEvent, d: KeyEvent) => void,
    private onMove: (ev: MouseEvent) => void,
    private onLeave: () => void,
    private onClick: (ev: MouseEvent, d: KeyEvent) => void,
  ) {
    this.g = parent.append("g");
    this.data = data;
    this.evtY = evtY;
    this.axisY = axisY;
  }

  updateY(evtY: number, axisY: number): void {
    this.evtY = evtY;
    this.axisY = axisY;
  }

  render(ctx: RenderContext): void {
    const k = ctx.curT.k;
    const visible: EvtWithRow[] = this.data
      .filter((d) => {
        if (d.type === "extinction") return false;
        if (MAJOR_EVENT_NAMES.has(d.name)) return true;
        return k >= 2;
      })
      .map((d) => ({ ...d, _row: 0 }));

    const positions: { px: number; row: number }[] = [];
    visible.forEach((d) => {
      const px = ctx.xScale(d.date);
      let row = 0;
      while (positions.some((p) => p.row === row && Math.abs(p.px - px) < 95)) row++;
      positions.push({ px, row });
      d._row = row;
    });

    const ecol = (d: KeyEvent) => (d.type === "origin" ? "#4ec98a" : "#e0a040");

    const sel = this.g.selectAll<SVGGElement, EvtWithRow>(".event-marker").data(visible, (d) => d.name);
    const ent = sel.enter().append("g").attr("class", "event-marker")
      .on("mouseover", (ev: MouseEvent, d: EvtWithRow) => this.onHover(ev, d))
      .on("mousemove", (ev: MouseEvent) => this.onMove(ev))
      .on("mouseout", () => this.onLeave())
      .on("click", (ev: MouseEvent, d: EvtWithRow) => {
        ev.stopPropagation();
        this.onClick(ev, d);
      });
    ent.append("line").attr("class", "event-line");
    ent.append("circle").attr("class", "event-dot");
    ent.append("text").attr("class", "event-text");

    const all = ent.merge(sel);
    all.attr("transform", (d) => `translate(${ctx.xScale(d.date)},0)`);
    all.select<SVGLineElement>(".event-line")
      .attr("y1", this.evtY).attr("y2", this.axisY)
      .attr("stroke", ecol).attr("opacity", 0.18);
    all.select<SVGCircleElement>(".event-dot")
      .attr("cy", this.evtY).attr("r", (d) => (MAJOR_EVENT_NAMES.has(d.name) ? 5 : 3.5))
      .attr("fill", ecol).attr("stroke", "#0c1018").attr("stroke-width", 1.5);
    all.select<SVGTextElement>(".event-text")
      .attr("x", 6).attr("y", (d) => this.evtY + 14 + d._row * 15)
      .attr("fill", ecol)
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .attr("opacity", (d) => (MAJOR_EVENT_NAMES.has(d.name) ? 0.9 : 0.7))
      .text((d) => {
        const nm = N(d);
        const len = k > 10 ? 30 : k > 3 ? 22 : 16;
        return nm.length > len ? nm.slice(0, len - 1) + "\u2026" : nm;
      });

    sel.exit().remove();
  }
}
