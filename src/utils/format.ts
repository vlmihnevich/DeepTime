import { t } from "../i18n";

export function formatMa(ma: number): string {
  if (ma >= 1000) return (ma / 1000).toFixed(ma % 1000 === 0 ? 0 : 1) + " " + t("ga");
  if (ma >= 1) return ma.toFixed(ma >= 10 ? 0 : 1) + " " + t("ma");
  if (ma >= 0.001) return (ma * 1000).toFixed(0) + " " + t("ka");
  if (ma > 0) return (ma * 1e6).toFixed(0) + " " + t("yearsAgo");
  return t("present");
}

export function formatDuration(s: number, e: number): string {
  const d = s - e;
  if (d >= 1000) return (d / 1000).toFixed(1) + " " + t("bilYears");
  if (d >= 1) return d.toFixed(d >= 10 ? 0 : 1) + " " + t("milYears");
  if (d >= 0.001) return (d * 1000).toFixed(0) + " " + t("thouYears");
  return (d * 1e6).toFixed(0) + " " + t("years");
}

export function to24Hour(ma: number): string {
  const sec = ((4540 - ma) / 4540) * 86400;
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  if (ma < 0.001) return `${h}:${m}:${s}.${String(Math.round((sec % 1) * 1000)).padStart(3, "0")}`;
  return `${h}:${m}:${s}`;
}

export function formatDuration24(startMa: number, endMa: number): string {
  const totalSec = ((startMa - endMa) / 4540) * 86400;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}${t("clockH")}`);
  if (m > 0) parts.push(`${m}${t("clockM")}`);
  if (s > 0 || parts.length === 0) parts.push(`${s}${t("clockS")}`);
  return parts.join(" ");
}
