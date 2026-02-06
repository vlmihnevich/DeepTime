import { t, getLang, setLang, N } from "../i18n";
import { formatMa } from "../utils/format";
import type { GeoItem, RenderContext } from "../types";

export class NavBar {
  private eonButtons: NodeListOf<HTMLButtonElement>;
  private resetBtn: HTMLElement;
  private langBtn: HTMLElement;
  private ctxEl: HTMLElement;
  private titleEl: HTMLElement;

  constructor(
    private onEonClick: (eonName: string) => void,
    private onReset: () => void,
    private onLangToggle: () => void,
  ) {
    this.eonButtons = document.querySelectorAll<HTMLButtonElement>(".nav-btn[data-eon]");
    this.resetBtn = document.getElementById("btn-reset")!;
    this.langBtn = document.getElementById("btn-lang")!;
    this.ctxEl = document.getElementById("context-indicator")!;
    this.titleEl = document.getElementById("nav-title")!;

    this.eonButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.eon) this.onEonClick(btn.dataset.eon);
      });
    });

    this.resetBtn.addEventListener("click", () => this.onReset());
    this.langBtn.addEventListener("click", () => {
      setLang(getLang() === "en" ? "ru" : "en");
      this.onLangToggle();
    });
  }

  updateLangUI(): void {
    document.title = getLang() === "ru" ? "История жизни на Земле" : "History of Life on Earth";
    this.titleEl.textContent = t("title");
    document.getElementById("btn-hadean")!.textContent = t("hadean");
    document.getElementById("btn-archean")!.textContent = t("archean");
    document.getElementById("btn-proterozoic")!.textContent = t("proterozoic");
    document.getElementById("btn-phanerozoic")!.textContent = t("phanerozoic");
    this.resetBtn.textContent = t("reset");
    this.langBtn.textContent = getLang() === "en" ? "RU" : "EN";
  }

  updateContext(ctx: RenderContext, eons: GeoItem[], eras: GeoItem[], periods: GeoItem[]): void {
    const mid = ctx.xScale.invert(ctx.iW / 2);
    const k = ctx.curT.k;
    let label = t("fullTimeline");
    let range = `4.54 ${t("ga")} – ${t("present")}`;

    if (k >= 3) {
      const p = periods.find((p) => mid <= p.start && mid >= p.end);
      if (p) { label = N(p); range = `${formatMa(p.start)} – ${formatMa(p.end)}`; }
    }
    if (label === t("fullTimeline") && k >= 1.5) {
      const e = eras.find((e) => mid <= e.start && mid >= e.end);
      if (e) { label = N(e); range = `${formatMa(e.start)} – ${formatMa(e.end)}`; }
    }
    if (label === t("fullTimeline")) {
      const e = eons.find((e) => mid <= e.start && mid >= e.end);
      if (e) { label = N(e); range = `${formatMa(e.start)} – ${formatMa(e.end)}`; }
    }
    this.ctxEl.innerHTML = `${t("viewing")}: <span>${label}</span> | ${range}`;

    this.eonButtons.forEach((btn) => {
      const eon = eons.find((e) => e.name === btn.dataset.eon);
      if (!eon) return;
      const vis = ctx.xScale(eon.start) < ctx.iW && ctx.xScale(eon.end) > 0;
      btn.classList.toggle("active", k > 1.3 && vis && (ctx.xScale(eon.end) - ctx.xScale(eon.start)) > ctx.iW * 0.35);
    });
  }
}
