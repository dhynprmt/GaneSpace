import apiClient, { API_CONFIG, allPages } from "./api/apiClient";
import { MOCK_REGISTRATIONS } from "../mocks/registrations";
import { eventStore } from "../mocks/eventStore";

const fromApi = (row) => ({ ...row, status: row.status === "active" ? "registered" : row.status });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let devRegistrations = MOCK_REGISTRATIONS.map((r) => ({
  ...r,
  registration_code: r.registration_code.replace(/^DEV-/, ""),
}));

export const registrationService = {
  registerAcademicEvent: async (event) => {
    const eventId = typeof event === "object" ? event.id : event;

    if (API_CONFIG.useMockApi) {
      await wait(320);
      const alreadyRegistered = devRegistrations.find(
        (r) => r.event_id === eventId && r.status === "registered"
      );
      if (alreadyRegistered) {
        throw { status: 422, message: "Anda sudah terdaftar pada kegiatan ini." };
      }

      const targetEvent =
        typeof event === "object"
          ? event
          : eventStore.getAll().find((e) => e.id === eventId) || {};

      const newReg = {
        id: `reg-${Date.now()}`,
        registration_code: `GS-2026-${String(Date.now()).slice(-4)}`,
        event_id: eventId,
        event_slug: targetEvent.slug || "",
        event_title: targetEvent.title || "Kegiatan Akademik",
        event_category: targetEvent.category || "Akademik",
        organizer: targetEvent.organizer || "Undiksha",
        start_datetime: targetEvent.start_datetime || new Date().toISOString(),
        end_datetime: targetEvent.end_datetime || new Date().toISOString(),
        location: targetEvent.location || "Kampus Undiksha",
        status: "registered",
        registered_at: new Date().toISOString(),
        can_cancel: true,
      };

      devRegistrations = [newReg, ...devRegistrations];

      if (targetEvent.id) {
        eventStore.update(targetEvent.id, {
          active_registrations: (targetEvent.active_registrations || 0) + 1,
        });
      }

      return {
        message: "Pendaftaran berhasil! Bukti receipt sudah tersedia di Pendaftaranku.",
        registration_id: newReg.id,
      };
    }

    const res = await apiClient.post(`/events/${eventId}/registrations`);
    return res.data;
  },

  getMyRegistrations: async (statusFilter = "all") => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      if (statusFilter === "all") return [...devRegistrations];
      return devRegistrations.filter((r) => r.status === statusFilter);
    }
    const status = statusFilter === "registered" ? "active" : statusFilter;
    return (await allPages("/me/registrations", status === "all" ? {} : { status })).map(fromApi);
  },

  getRegistrationById: async (id) => {
    if (API_CONFIG.useMockApi) {
      await wait(150);
      return devRegistrations.find((r) => r.id === id) || null;
    }
    const res = await apiClient.get(`/me/registrations/${id}`);
    return { ...fromApi(res.data.data), verification_url: res.data.verification_url };
  },

  cancelRegistration: async (id) => {
    if (API_CONFIG.useMockApi) {
      await wait(280);
      const existing = devRegistrations.find((r) => r.id === id);
      devRegistrations = devRegistrations.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "cancelled",
              can_cancel: false,
              cancelled_at: new Date().toISOString(),
            }
          : r
      );
      if (existing) {
        const target = eventStore.getAll().find((e) => e.id === existing.event_id);
        if (target && target.active_registrations > 0) {
          eventStore.update(target.id, {
            active_registrations: target.active_registrations - 1,
          });
        }
      }
      return { message: "Pendaftaran berhasil dibatalkan." };
    }
    const res = await apiClient.post(`/me/registrations/${id}/cancel`);
    return res.data;
  },

  verifyReceipt: async (uuid) => (await apiClient.get(`/receipts/verify/${encodeURIComponent(uuid)}`)).data.data,

  getReceiptQr: async (id) => {
    const response = await apiClient.get(`/me/registrations/${id}/qr`, { responseType: "blob" });
    return response.data;
  },

  downloadReceiptPdf: async (id) => {
    if (API_CONFIG.useMockApi) {
      await wait(220);
      window.print();
      return { message: "Pratinjau cetak / simpan PDF dibuka." };
    }
    const res = await apiClient.get(`/me/registrations/${id}/receipt`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `GANESPACE-Receipt-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return { message: "Bukti pendaftaran PDF berhasil diunduh." };
  },
};