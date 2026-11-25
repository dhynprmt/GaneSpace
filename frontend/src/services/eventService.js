import apiClient, { API_CONFIG } from "./api/apiClient";
import { MOCK_CATEGORIES } from "../mocks/events";
import { eventStore } from "../mocks/eventStore";
import { normalizeEventResource, unwrapEventCollection } from "./eventMapper";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const eventService = {
  getEvents: async (params = {}) => {
    if (API_CONFIG.useMockApi) {
      await wait(160);
      let list = eventStore.getAll().filter((e) => e.is_published !== false);

      if (params.domain && params.domain !== "all") {
        list = list.filter((e) => e.domain === params.domain);
      }
      if (params.semproOnly) {
        list = list.filter((e) => e.is_sempro || e.category_slug === "seminar-proposal");
      }
      if (params.search?.trim()) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.organizer.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q) ||
            (e.student_presenter && e.student_presenter.toLowerCase().includes(q))
        );
      }
      if (params.category && params.category !== "all") {
        list = list.filter((e) => e.category_slug === params.category);
      }
      if (params.eventType && params.eventType !== "all") {
        list = list.filter((e) => e.event_type?.toLowerCase() === params.eventType.toLowerCase());
      }
      if (params.location?.trim()) {
        const loc = params.location.toLowerCase();
        list = list.filter((e) => e.location.toLowerCase().includes(loc));
      }
      if (params.date) {
        list = list.filter((e) => e.start_datetime.startsWith(params.date));
      }
      if (params.status && params.status !== "all") {
        list = list.filter((e) => e.status === params.status);
      }
      if (params.sort === "soonest") {
        list.sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
      }

      const page = Number(params.page) || 1;
      const perPage = Number(params.per_page) || 12;
      const start = (page - 1) * perPage;

      return {
        data: list.slice(start, start + perPage),
        meta: {
          current_page: page,
          last_page: Math.max(1, Math.ceil(list.length / perPage)),
          per_page: perPage,
          total: list.length,
        },
      };
    }

    const apiParams = {
      period: params.period || (params.sort === "soonest" ? "upcoming" : "all"),
      per_page: params.per_page || 12,
    };
    if (params.page) apiParams.page = params.page;

    if (params.search?.trim()) apiParams.q = params.search.trim();
    if (params.domain && params.domain !== "all") {
      apiParams.category = params.domain === "non_academic" ? "non-academic" : "academic";
    }
    if (params.category && params.category !== "all") {
      if (["academic", "non-academic"].includes(params.category)) {
        apiParams.category = params.category;
      } else {
        apiParams.event_type = params.category;
      }
    }
    if (params.eventType && params.eventType !== "all") apiParams.event_type = params.eventType;
    if (params.organization) apiParams.organization = params.organization;
    if (params.location?.trim()) apiParams.location = params.location.trim();
    if (params.location_mode) apiParams.location_mode = params.location_mode;
    if (params.date) {
      apiParams.from = params.date;
      apiParams.to = params.date;
    }
    if (params.from) apiParams.from = params.from;
    if (params.to) apiParams.to = params.to;
    if (params.semproOnly) {
      apiParams.category = "academic";
      apiParams.event_type = "proposal-seminar";
    }

    const res = await apiClient.get("/events", { params: apiParams });
    const data = unwrapEventCollection(res.data, "public");
    return { ...res.data, data };
  },

  getMeetingLink: async (eventId) => {
    const response = await apiClient.get(`/events/${eventId}/meeting-link`);
    const url = new URL(response.data.data.meeting_url);
    if (!["https:", "http:"].includes(url.protocol)) throw new Error("Format tautan rapat tidak didukung.");
    return url.href;
  },

  getEventBySlug: async (slug) => {
    if (API_CONFIG.useMockApi) {
      await wait(140);
      return eventStore.getAll().find((e) => e.slug === slug) || null;
    }
    const res = await apiClient.get(`/events/${slug}`);
    const raw = res.data.data || res.data;
    return normalizeEventResource(raw, "public");
  },

  getCategories: async () => {
    if (API_CONFIG.useMockApi) return MOCK_CATEGORIES;
    const res = await apiClient.get("/event-categories");
    return res.data.data || res.data;
  },

  getEventTypes: async (category = null) => {
    if (API_CONFIG.useMockApi) {
      return MOCK_CATEGORIES
        .filter((item) => !category || item.domain === category || item.domain === category.replace("-", "_"))
        .map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          category: {
            slug: item.domain === "non_academic" ? "non-academic" : "academic",
            name: item.domain === "non_academic" ? "Non-Academic" : "Academic",
          },
        }));
    }
    const res = await apiClient.get("/event-types", { params: category ? { category } : {} });
    return res.data.data || res.data;
  },
};