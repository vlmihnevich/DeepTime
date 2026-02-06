type LangKey =
  | "title" | "hadean" | "archean" | "proterozoic" | "phanerozoic"
  | "reset" | "viewing" | "fullTimeline" | "annotation" | "wikiLink"
  | "youAreHere" | "duration" | "severity" | "speciesLost"
  | "clock24" | "clockSpan" | "clockAt" | "to" | "present"
  | "ga" | "ma" | "ka" | "yearsAgo"
  | "bilYears" | "milYears" | "thouYears" | "years";

type UIStrings = Record<LangKey, string>;

const UI: Record<string, UIStrings> = {
  en: {
    title: "HISTORY OF LIFE",
    hadean: "Hadean", archean: "Archean", proterozoic: "Proterozoic", phanerozoic: "Phanerozoic",
    reset: "Reset", viewing: "Viewing", fullTimeline: "Full Timeline",
    annotation: 'All of <strong>recorded human history</strong> (~5,000 years) occupies the last <strong>0.00011%</strong> of Earth\'s story — invisible at this scale. Scroll to zoom in.',
    wikiLink: "Read more on Wikipedia &rarr;",
    youAreHere: "YOU ARE HERE",
    duration: "Duration",
    severity: "Severity",
    speciesLost: "of species lost",
    clock24: "24-hour clock",
    clockSpan: "If Earth's history were 24 hours, this spans",
    clockAt: "If Earth's history were 24 hours, this happens at",
    to: "to",
    present: "Present",
    ga: "Ga", ma: "Ma", ka: "Ka", yearsAgo: "years ago",
    bilYears: "billion years", milYears: "million years", thouYears: "thousand years", years: "years",
  },
  ru: {
    title: "ИСТОРИЯ ЖИЗНИ",
    hadean: "Катархей", archean: "Архей", proterozoic: "Протерозой", phanerozoic: "Фанерозой",
    reset: "Сброс", viewing: "Обзор", fullTimeline: "Вся шкала",
    annotation: 'Вся <strong>письменная история человечества</strong> (~5 000 лет) занимает лишь <strong>0,00011%</strong> истории Земли — невидимая на этом масштабе. Прокрутите для увеличения.',
    wikiLink: "Подробнее в Википедии &rarr;",
    youAreHere: "ВЫ ЗДЕСЬ",
    duration: "Длительность",
    severity: "Масштаб",
    speciesLost: "видов вымерло",
    clock24: "24-часовые часы",
    clockSpan: "Если бы история Земли уместилась в 24 часа, это длится с",
    clockAt: "Если бы история Земли уместилась в 24 часа, это происходит в",
    to: "до",
    present: "Наше время",
    ga: "млрд л.н.", ma: "млн л.н.", ka: "тыс. л.н.", yearsAgo: "лет назад",
    bilYears: "млрд лет", milYears: "млн лет", thouYears: "тыс. лет", years: "лет",
  },
};

let LANG = "en";

export function getLang(): string {
  return LANG;
}

export function setLang(lang: string): void {
  LANG = lang;
}

export function t(key: LangKey): string {
  return UI[LANG]?.[key] || UI.en[key] || key;
}

export function N(d: { name: string; ru?: string }): string {
  return LANG === "ru" && d.ru ? d.ru : d.name;
}

export function Desc(d: { description?: string; descRu?: string }): string {
  return LANG === "ru" && d.descRu ? d.descRu : d.description || "";
}

export function Wiki(d: { wikiUrl?: string; wikiRu?: string }): string {
  return LANG === "ru" && d.wikiRu ? d.wikiRu : d.wikiUrl || "";
}
