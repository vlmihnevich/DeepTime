import { N, Desc, t } from "../i18n";
import { formatMa, formatDuration, to24Hour, formatDuration24 } from "../utils/format";
import type { GeoItem, KeyEvent, Species } from "../types";

type TooltipItem = GeoItem | KeyEvent | Species;
type TooltipType = "geo" | "event" | "species";

export class Tooltip {
  private el: HTMLElement;
  private ttTitle: HTMLElement;
  private ttDate: HTMLElement;
  private ttClock: HTMLElement;
  private ttDesc: HTMLElement;

  constructor() {
    this.el = document.getElementById("tooltip")!;
    this.ttTitle = this.el.querySelector(".tt-title")!;
    this.ttDate = this.el.querySelector(".tt-date")!;
    this.ttClock = this.el.querySelector(".tt-clock")!;
    this.ttDesc = this.el.querySelector(".tt-desc")!;
  }

  show(ev: MouseEvent, d: TooltipItem, type: TooltipType): void {
    this.ttTitle.textContent = N(d);
    if (type === "geo" || type === "species") {
      const item = d as GeoItem | Species;
      this.ttDate.textContent = `${formatMa(item.start)} → ${formatMa(item.end)} (${formatDuration(item.start, item.end)})`;
      this.ttClock.textContent = `🕐 ${to24Hour(item.start)} → ${to24Hour(item.end)} (${formatDuration24(item.start, item.end)})`;
    } else {
      const item = d as KeyEvent;
      let s = formatMa(item.date);
      if (item.severity) s += ` | ${item.severity}% ${t("speciesLost")}`;
      this.ttDate.textContent = s;
      this.ttClock.textContent = `🕐 ${to24Hour(item.date)}`;
    }
    this.ttDesc.textContent = Desc(d as { description?: string; descRu?: string });
    this.el.classList.add("visible");
    this.move(ev);
  }

  move(ev: MouseEvent): void {
    let x = ev.clientX + 14;
    let y = ev.clientY - 8;
    if (x + this.el.offsetWidth > window.innerWidth) x = ev.clientX - this.el.offsetWidth - 10;
    if (y + this.el.offsetHeight > window.innerHeight) y = ev.clientY - this.el.offsetHeight - 10;
    this.el.style.left = x + "px";
    this.el.style.top = y + "px";
  }

  hide(): void {
    this.el.classList.remove("visible");
  }
}
