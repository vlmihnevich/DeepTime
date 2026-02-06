import type * as d3 from "d3";

export interface Period {
  name: string;
  ru: string;
  start: number;
  end: number;
  color: string;
  wikiUrl: string;
  wikiRu: string;
}

export interface Era extends Period {
  periods: Period[];
}

export interface Eon extends Period {
  eras: Era[];
}

export interface GeoItem extends Period {
  level: "eon" | "era" | "period";
}

export interface KeyEvent {
  name: string;
  ru: string;
  date: number;
  type: "planetary" | "origin" | "extinction" | "human";
  description: string;
  descRu: string;
  wikiUrl: string;
  wikiRu: string;
  severity?: number;
}

export interface Species {
  name: string;
  ru: string;
  start: number;
  end: number;
  color: string;
  description: string;
  descRu: string;
  wikiUrl: string;
  wikiRu: string;
  _lane?: number;
}

export interface RenderContext {
  xScale: d3.ScalePower<number, number>;
  curT: d3.ZoomTransform;
  iW: number;
  iH: number;
}
