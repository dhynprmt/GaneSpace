import apiClient, { API_CONFIG } from "./api/apiClient";
import { MOCK_EVENTS } from "../mocks/events";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let devConversations = [
  {
    id: "conv-1",
    title: "Jadwal Sempro Minggu Ini",
    updated_at: "2026-11-23T10:15:00+08:00",
    messages: [
      {
        id: "m-1",
        sender: "user",
        content: "Ada seminar proposal terbuka di FTK?",
        created_at: "2026-11-23T10:14:00+08:00",
      },
      {
        id: "m-2",
        sender: "assistant",
        content:
          "Saat ini tersedia jadwal Seminar Proposal terbuka di FTK: \"Automated Short-Answer Grading Berbasis IndoBERT\" pada 27 November 2026 pukul 09.30 WITA di Ruang Seminar FTK 204. Anda dapat membuka detail acaranya untuk mendaftar sebagai audiens.",
        created_at: "2026-11-23T10:15:00+08:00",
      },
    ],
  },
];

export const aiService = {
  generateEventSummary: async (event) => {
    if (API_CONFIG.useMockApi) {
      await wait(600);
      return {
        tujuan: event.short_description || "Informasi tujuan kegiatan belum tersedia.",
        topik: event.description || "Informasi topik dan materi belum tersedia.",
        jadwal_lokasi: `${event.location} (Zona waktu Asia/Makassar / WITA)`,
        informasi_penting: `Penyelenggara: ${event.organizer}. Status: ${event.status.toUpperCase()}.`,
        persyaratan:
          event.requirements && event.requirements.length > 0
            ? event.requirements
            : ["Terbuka untuk mahasiswa Undiksha sesuai ketentuan penyelenggara."],
      };
    }

    const res = await apiClient.post(`/events/${event.id}/ai-summary`);
    return res.data.data || res.data;
  },

  getConversations: async () => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      return devConversations.map((c) => ({ ...c, messages: [...c.messages] }));
    }
    const res = await apiClient.get("/ai-conversations");
    return res.data.data || res.data;
  },

  createConversation: async (eventId = null, initialTitle = "Percakapan Baru") => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      const created = {
        id: `conv-${Date.now()}`,
        title: initialTitle,
        updated_at: new Date().toISOString(),
        messages: [],
      };
      devConversations = [created, ...devConversations];
      return created;
    }
    const endpoint = eventId ? `/events/${eventId}/ai-conversations` : "/ai-conversations";
    const res = await apiClient.post(endpoint, { title: initialTitle });
    return res.data.data || res.data;
  },

  sendMessage: async (conversationId, promptText) => {
    if (API_CONFIG.useMockApi) {
      await wait(700);
      const q = promptText.toLowerCase();
      const matched = MOCK_EVENTS.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q) ||
          (q.includes("sempro") && e.is_sempro) ||
          (q.includes("workshop") && e.category_slug === "workshop-bootcamp") ||
          (q.includes("bootcamp") && e.category_slug === "workshop-bootcamp") ||
          (q.includes("ilmu komputer") && e.study_program === "Ilmu Komputer")
      );

      let replyText =
        "Informasi spesifik untuk pertanyaan tersebut belum ditemukan pada katalog kegiatan saat ini. Coba sebutkan nama kegiatan, kategori (Sempro, Bootcamp, Seminar), atau penyelenggara.";

      if (matched.length > 0) {
        const listStr = matched
          .slice(0, 3)
          .map((e) => `- ${e.title} (${e.location}, ${e.organizer})`)
          .join("\n");
        replyText = `Berikut kegiatan yang sesuai dengan pencarian Anda:\n${listStr}\n\nBuka halaman detail kegiatan untuk melihat jadwal WITA, kuota, dan tombol pendaftaran.`;
      }

      const userMsg = {
        id: `u-${Date.now()}`,
        sender: "user",
        content: promptText,
        created_at: new Date().toISOString(),
      };
      const aiMsg = {
        id: `a-${Date.now() + 1}`,
        sender: "assistant",
        content: replyText,
        created_at: new Date().toISOString(),
      };

      devConversations = devConversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              title: conv.messages.length === 0 ? promptText.slice(0, 36) : conv.title,
              updated_at: new Date().toISOString(),
              messages: [...conv.messages, userMsg, aiMsg],
            }
          : conv
      );

      return { userMsg, aiMsg };
    }

    const res = await apiClient.post(`/ai-conversations/${conversationId}/messages`, {
      message: promptText,
    });
    return res.data.data || res.data;
  },

  deleteConversation: async (conversationId) => {
    if (API_CONFIG.useMockApi) {
      await wait(160);
      devConversations = devConversations.filter((c) => c.id !== conversationId);
      return true;
    }
    await apiClient.delete(`/ai-conversations/${conversationId}`);
    return true;
  },
};