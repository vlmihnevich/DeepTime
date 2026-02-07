import * as d3 from "d3";
import type { GeoItem, KeyEvent, Species, RenderContext } from "../types";
import { GEOLOGICAL_TIME } from "../data/geological";
import { KEY_EVENTS } from "../data/events";
import { DOMINANT_SPECIES } from "../data/species";
import { flattenGeology, stackSpecies } from "../utils/geology";
import { Grid } from "./Grid";
import { Axis } from "./Axis";
import { YouAreHere } from "./YouAreHere";
import { GeoLayer } from "./GeoLayer";
import { Extinctions } from "./Extinctions";
import { Events } from "./Events";
import { SpeciesBars } from "./SpeciesBars";
import { Tooltip } from "./Tooltip";
import { InfoPanel } from "./InfoPanel";
import { NavBar } from "./NavBar";
import { t, getLang } from "../i18n";

const MARGIN = { top: 16, right: 30, bottom: 40, left: 30 };
const EON_H = 50, ERA_H = 34, PER_H = 26, GAP = 3;
const EON_Y = 0, ERA_Y = EON_H + GAP, PER_Y = ERA_Y + ERA_H + GAP;
const SP_LANE = 28, SP_GAP = 4;

export class Timeline {
  private container: HTMLElement;
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private xBase!: d3.ScalePower<number, number>;
  private xScale!: d3.ScalePower<number, number>;
  private curT: d3.ZoomTransform = d3.zoomIdentity;
  private zoom!: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private W = 0; private H = 0; private iW = 0; private iH = 0;

  private eons: GeoItem[];
  private eras: GeoItem[];
  private periods: GeoItem[];
  private speciesArr: Species[];

  private evtY = 0; private evtH = 0; private spY = 0; private axisY = 0;

  private grid!: Grid;
  private axis!: Axis;
  private youAreHere!: YouAreHere;
  private eonLayer!: GeoLayer;
  private eraLayer!: GeoLayer;
  private perLayer!: GeoLayer;
  private extinctions!: Extinctions;
  private events!: Events;
  private speciesBars!: SpeciesBars;

  private tooltip: Tooltip;
  private infoPanel: InfoPanel;
  private navBar: NavBar;

  private annotation: HTMLElement;
  private kbHint: HTMLElement;
  private urlUpdateTimer: number | null = null;

  constructor() {
    this.container = document.getElementById("timeline-container")!;
    this.annotation = document.getElementById("opening-annotation")!;
    this.kbHint = document.getElementById("keyboard-hint")!;

    const geoFlat = flattenGeology(GEOLOGICAL_TIME);
    this.eons = geoFlat.filter((d) => d.level === "eon");
    this.eras = geoFlat.filter((d) => d.level === "era");
    this.periods = geoFlat.filter((d) => d.level === "period");
    this.speciesArr = stackSpecies(DOMINANT_SPECIES);

    this.tooltip = new Tooltip();
    this.infoPanel = new InfoPanel();
    this.navBar = new NavBar(
      (eonName) => {
        const eon = this.eons.find((e) => e.name === eonName);
        if (eon) this.zoomTo(eon.start, eon.end);
      },
      () => {
        this.svg.transition().duration(750).call(this.zoom.transform, d3.zoomIdentity);
        this.infoPanel.close();
      },
      () => this.updateLangUI(),
    );

    this.init();
    this.setupKeyboard();
    this.setupResize();
    this.updateLangUI();
  }

  private dims(): void {
    const r = this.container.getBoundingClientRect();
    this.W = r.width;
    this.H = r.height;
    this.iW = this.W - MARGIN.left - MARGIN.right;
    this.iH = this.H - MARGIN.top - MARGIN.bottom;
  }

  private computeLayout(): void {
    this.spY = PER_Y + PER_H + 10;
    const maxLane = this.speciesArr.reduce((m, s) => Math.max(m, s._lane || 0), 0);
    const spBottom = this.spY + (maxLane + 1) * (SP_LANE + SP_GAP);
    this.axisY = this.iH - 12;
    // Фиксируем базовую линию событий в 50px от нижней оси
    this.evtY = this.axisY - 50;
    this.evtH = 50;
  }

  private init(): void {
    this.dims();
    this.computeLayout();

    this.svg = d3.select(this.container).append("svg").attr("width", this.W).attr("height", this.H);
    const defs = this.svg.append("defs");
    defs.append("clipPath").attr("id", "clip").append("rect")
      .attr("width", this.iW).attr("height", this.iH + MARGIN.top + MARGIN.bottom);
    const filt = defs.append("filter").attr("id", "glow")
      .attr("x", "-50%").attr("y", "-20%").attr("width", "200%").attr("height", "140%");
    filt.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
    filt.append("feMerge").selectAll("feMergeNode").data(["blur", "SourceGraphic"]).enter()
      .append("feMergeNode").attr("in", (d) => d);

    this.g = this.svg.append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`)
      .attr("clip-path", "url(#clip)");

    this.xBase = d3.scalePow().exponent(0.5).domain([4540, 0]).range([0, this.iW]);
    this.xScale = this.xBase.copy();

    const showGeoTT = (ev: MouseEvent, d: GeoItem) => this.tooltip.show(ev, d, "geo");
    const moveTT = (ev: MouseEvent) => this.tooltip.move(ev);
    const hideTT = () => this.tooltip.hide();
    const clickGeo = (_ev: MouseEvent, d: GeoItem) => {
      this.zoomTo(d.start, d.end);
      this.infoPanel.show(d, "geo");
    };

    const showEvtTT = (ev: MouseEvent, d: KeyEvent) => this.tooltip.show(ev, d, "event");
    const clickEvt = (_ev: MouseEvent, d: KeyEvent) => this.infoPanel.show(d, "event");

    const showSpTT = (ev: MouseEvent, d: Species) => this.tooltip.show(ev, d, "species");
    const clickSp = (_ev: MouseEvent, d: Species) => {
      this.zoomTo(d.start, d.end);
      this.infoPanel.show(d, "species");
    };

    // Order matters for SVG layering
    this.grid = new Grid(this.g, this.axisY);
    this.extinctions = new Extinctions(this.g, KEY_EVENTS, this.axisY, showEvtTT, moveTT, hideTT, clickEvt);
    this.eonLayer = new GeoLayer(this.g, this.eons, EON_Y, EON_H, "eon-g", showGeoTT, moveTT, hideTT, clickGeo);
    this.eraLayer = new GeoLayer(this.g, this.eras, ERA_Y, ERA_H, "era-g", showGeoTT, moveTT, hideTT, clickGeo);
    this.perLayer = new GeoLayer(this.g, this.periods, PER_Y, PER_H, "per-g", showGeoTT, moveTT, hideTT, clickGeo);
    this.speciesBars = new SpeciesBars(this.g, this.speciesArr, this.spY, SP_LANE, SP_GAP, showSpTT, moveTT, hideTT, clickSp);
    this.events = new Events(this.g, KEY_EVENTS, this.evtY, this.axisY, showEvtTT, moveTT, hideTT, clickEvt);
    this.youAreHere = new YouAreHere(this.g, EON_H);
    this.axis = new Axis(this.g, this.axisY);

    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 100000])
      .translateExtent([[0, -10], [this.iW, this.iH + 10]])
      .extent([[0, 0], [this.iW, this.iH]])
      .on("zoom", (ev) => {
        this.curT = ev.transform;
        this.xScale = this.curT.rescaleX(this.xBase) as d3.ScalePower<number, number>;
        this.updateAll();
        this.annotation.classList.toggle("hidden", this.curT.k > 1.3);
        if (this.curT.k > 1.1) this.kbHint.style.opacity = "0";
        this.updateUrl();
      });

    this.svg.call(this.zoom).on("dblclick.zoom", null);
    this.svg.on("click", () => this.infoPanel.close());

    this.restoreStateFromUrl();
  }

  private restoreStateFromUrl(): void {
    const params = new URLSearchParams(window.location.search);
    const x = parseFloat(params.get("x") || "");
    const k = parseFloat(params.get("k") || "");

    if (!isNaN(x) && !isNaN(k)) {
      const transform = d3.zoomIdentity.translate(x, 0).scale(k);
      this.svg.call(this.zoom.transform, transform);
    }
  }

  private updateUrl(): void {
    if (this.urlUpdateTimer) window.clearTimeout(this.urlUpdateTimer);
    this.urlUpdateTimer = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set("x", this.curT.x.toFixed(2));
      url.searchParams.set("k", this.curT.k.toFixed(2));
      url.searchParams.set("lang", getLang());
      window.history.replaceState(null, "", url.toString());
    }, 500);
  }

  private ctx(): RenderContext {
    return { xScale: this.xScale, curT: this.curT, iW: this.iW, iH: this.iH };
  }

  private updateAll(): void {
    const c = this.ctx();
    const k = this.curT.k;

    this.eonLayer.render(c);
    this.eraLayer.render(c);
    if (k >= 2) this.perLayer.render(c); else this.perLayer.clear();
    this.grid.render(c);
    this.extinctions.render(c);
    this.events.render(c);
    this.speciesBars.render(c);
    this.youAreHere.render(c);
    this.axis.render(c);
    this.navBar.updateContext(c, this.eons, this.eras, this.periods);
  }

  private zoomTo(s: number, e: number, dur = 750): void {
    const x0 = this.xBase(s);
    const x1 = this.xBase(e);
    const rw = x1 - x0;
    if (rw <= 0) return;
    const pad = this.iW * 0.04;
    const sc = (this.iW - 2 * pad) / rw;
    const tx = -x0 * sc + pad;
    this.svg.transition().duration(dur).call(this.zoom.transform, d3.zoomIdentity.translate(tx, 0).scale(sc));
  }

  private updateLangUI(): void {
    this.navBar.updateLangUI();
    this.annotation.innerHTML = t("annotation");
    this.kbHint.innerHTML = `<kbd>+</kbd><kbd>-</kbd> ${t("kbZoom")} &nbsp;<kbd>&larr;</kbd><kbd>&rarr;</kbd> ${t("kbPan")} &nbsp;<kbd>Home</kbd> ${t("kbReset")} &nbsp;<kbd>1</kbd>-<kbd>4</kbd>`;
    this.updateAll();
    this.updateUrl();
  }

  private setupKeyboard(): void {
    document.addEventListener("keydown", (e) => {
      const pan = this.iW * 0.15;
      switch (e.key) {
        case "+": case "=": this.svg.transition().duration(300).call(this.zoom.scaleBy, 2); break;
        case "-": case "_": this.svg.transition().duration(300).call(this.zoom.scaleBy, 0.5); break;
        case "ArrowLeft": this.svg.transition().duration(200).call(this.zoom.translateBy, pan, 0); break;
        case "ArrowRight": this.svg.transition().duration(200).call(this.zoom.translateBy, -pan, 0); break;
        case "Home":
          this.svg.transition().duration(750).call(this.zoom.transform, d3.zoomIdentity);
          this.infoPanel.close();
          break;
        case "1": { const x = this.eons.find((e) => e.name === "Hadean"); if (x) this.zoomTo(x.start, x.end); break; }
        case "2": { const x = this.eons.find((e) => e.name === "Archean"); if (x) this.zoomTo(x.start, x.end); break; }
        case "3": { const x = this.eons.find((e) => e.name === "Proterozoic"); if (x) this.zoomTo(x.start, x.end); break; }
        case "4": { const x = this.eons.find((e) => e.name === "Phanerozoic"); if (x) this.zoomTo(x.start, x.end); break; }
        case "Escape": this.infoPanel.close(); break;
      }
    });
  }

  private setupResize(): void {
    window.addEventListener("resize", () => {
      this.dims();
      this.computeLayout();
      this.svg.attr("width", this.W).attr("height", this.H);
      this.xBase.range([0, this.iW]);
      this.svg.select("#clip rect").attr("width", this.iW).attr("height", this.iH + MARGIN.top + MARGIN.bottom);
      this.axis.updateY(this.axisY);
      this.grid.updateY(this.axisY);
      this.extinctions.updateY(this.axisY);
      this.events.updateY(this.evtY, this.axisY);
      this.zoom
        .translateExtent([[0, -10], [this.iW, this.iH + 10]])
        .extent([[0, 0], [this.iW, this.iH]]);
      this.xScale = this.curT.rescaleX(this.xBase) as d3.ScalePower<number, number>;
      this.updateAll();
    });
  }
}
