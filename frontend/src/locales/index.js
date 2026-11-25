import id from "./id";
import en from "./en";

export const LOCALES = { id, en };

// Kompatibilitas otomatis untuk key flat yang sudah terpakai di komponen lama
const LEGACY_KEY_MAP = {
  nav_home: "nav.home",
  nav_explore: "nav.explore",
  nav_academic: "nav.academic",
  nav_non_academic: "nav.nonAcademic",
  nav_bookings: "nav.bookings",
  nav_login: "nav.login",
  nav_register: "nav.register",
  search_placeholder: "common.searchPlaceholder",
  search_btn: "common.searchBtn",
  section_featured: "home.featured",
  section_academic: "home.academicSection",
  section_non_academic: "home.nonAcademicSection",
  see_all: "common.seeAll",
  view_details: "common.viewDetails",
  explore_title: "home.exploreTitle",
  explore_sub: "home.exploreSub",
  academic_title: "home.academicTitle",
  academic_sub: "home.academicSub",
  non_academic_title: "home.nonAcademicTitle",
  non_academic_sub: "home.nonAcademicSub",
  sempro_progress: "home.semproProgress",
  tab_all: "tabs.all",
  tab_academic: "tabs.academic",
  tab_non_academic: "tabs.nonAcademic",
  tab_sempro: "tabs.sempro",
  tab_seminar: "tabs.seminar",
  tab_workshop: "tabs.workshop",
  empty_title: "common.emptyTitle",
  empty_desc: "common.emptyDesc",
  reset_filter: "common.resetFilter",
};

export function resolveTranslation(lang, key, params = null) {
  const path = LEGACY_KEY_MAP[key] || key;
  const parts = path.split(".");

  const readPath = (dict) =>
    parts.reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);

  let value = readPath(LOCALES[lang]) ?? readPath(LOCALES.id) ?? key;

  if (typeof value === "string" && params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replaceAll(`{${k}}`, String(v));
    });
  }

  return value;
}