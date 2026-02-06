import type { Eon, GeoItem, Species } from "../types";

export function flattenGeology(data: Eon[]): GeoItem[] {
  const f: GeoItem[] = [];
  data.forEach((eon) => {
    f.push({ ...eon, level: "eon" });
    (eon.eras || []).forEach((era) => {
      f.push({ ...era, level: "era" });
      (era.periods || []).forEach((p) => f.push({ ...p, level: "period" }));
    });
  });
  return f;
}

export function stackSpecies(data: Species[]): Species[] {
  const sorted = [...data].sort((a, b) => b.start - a.start);
  const lanes: Species[][] = [];
  sorted.forEach((sp) => {
    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      if (!lanes[i].some((o) => !(sp.end >= o.start || sp.start <= o.end))) {
        lanes[i].push(sp);
        sp._lane = i;
        placed = true;
        break;
      }
    }
    if (!placed) {
      sp._lane = lanes.length;
      lanes.push([sp]);
    }
  });
  return sorted;
}
