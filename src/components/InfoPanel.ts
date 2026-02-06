import { N, Desc, Wiki, t } from "../i18n";
import { formatMa, formatDuration, to24Hour, formatDuration24 } from "../utils/format";
import type { GeoItem, KeyEvent, Species } from "../types";

type PanelItem = GeoItem | KeyEvent | Species;
type PanelType = "geo" | "event" | "species";

export class InfoPanel {
  private el: HTMLElement;
  private titleEl: HTMLElement;
  private datesEl: HTMLElement;
  private durationEl: HTMLElement;
  private descEl: HTMLElement;
  private perspEl: HTMLElement;
  private linkEl: HTMLAnchorElement;

  constructor() {
    this.el = document.getElementById("info-panel")!;
    this.titleEl = this.el.querySelector(".panel-title")!;
    this.datesEl = this.el.querySelector(".panel-dates")!;
    this.durationEl = this.el.querySelector(".panel-duration")!;
    this.descEl = this.el.querySelector(".panel-desc")!;
    this.perspEl = this.el.querySelector(".panel-perspective")!;
    this.linkEl = this.el.querySelector(".panel-link")!;

    this.el.querySelector(".panel-close")!.addEventListener("click", (e) => {
      e.stopPropagation();
      this.close();
    });
  }

  show(d: PanelItem, type: PanelType): void {
    this.titleEl.textContent = N(d);
    if (type === "geo" || type === "species") {
      const item = d as GeoItem | Species;
      this.datesEl.textContent = `${formatMa(item.start)} → ${formatMa(item.end)}`;
      this.durationEl.textContent = `${t("duration")}: ${formatDuration(item.start, item.end)}`;
      this.perspEl.innerHTML = `<strong>${t("clock24")}:</strong> ${t("clockSpan")} <strong>${to24Hour(item.start)}</strong> ${t("to")} <strong>${to24Hour(item.end)}</strong> (${formatDuration24(item.start, item.end)}).`;
    } else {
      const item = d as KeyEvent;
      this.datesEl.textContent = formatMa(item.date);
      this.durationEl.textContent = item.severity ? `${t("severity")}: ~${item.severity}% ${t("speciesLost")}` : "";
      this.perspEl.innerHTML = `<strong>${t("clock24")}:</strong> ${t("clockAt")} <strong>${to24Hour(item.date)}</strong>.`;
    }
    this.descEl.textContent = Desc(d as { description?: string; descRu?: string });
    const url = Wiki(d as { wikiUrl?: string; wikiRu?: string });
    if (url) {
      this.linkEl.href = url;
      this.linkEl.style.display = "";
      this.linkEl.innerHTML = t("wikiLink");
    } else {
      this.linkEl.style.display = "none";
    }
    this.el.classList.add("open");
  }

  close(): void {
    this.el.classList.remove("open");
  }
}
