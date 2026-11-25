import apiClient, { API_CONFIG, allPages, unwrapCollection } from "./api/apiClient";
import { eventStore } from "../mocks/eventStore";
import { normalizeEventResource, normalizeOrganizationResource } from "./eventMapper";
import {
  MOCK_ADMIN_SESSIONS,
  MOCK_AUDIT_LOGS,
  MOCK_MODERATION_EVENTS,
  MOCK_ORGANIZATIONS,
  MOCK_PARTICIPANTS,
  MOCK_STUDENT_VERIFICATIONS,
  MOCK_USERS,
} from "../mocks/adminData";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const unavailable = (message) => {
  const error = new Error(message);
  error.status = 501;
  return error;
};

let devOrgs = [...MOCK_ORGANIZATIONS];
let devUsers = [...MOCK_USERS];
let devVerifications = [...MOCK_STUDENT_VERIFICATIONS];
let devModeration = [...MOCK_MODERATION_EVENTS];
let devLogs = [...MOCK_AUDIT_LOGS];
let devSessions = [...MOCK_ADMIN_SESSIONS];

export const adminService = {
  catalogRows: (kind) => allPages(`/master/${kind}`),
  saveCatalogRow: (kind, id, payload) => id
    ? apiClient.patch(`/master/${kind}/${id}`, payload)
    : apiClient.post(`/master/${kind}`, payload),
  deleteEventType: (id) => apiClient.delete(`/master/event-types/${id}`),
  revokeRole: (id) => apiClient.delete(`/master/user-roles/${id}`),

  // Event Admin: organization-scoped event management.
  getAdminOrganizations: async () => {
    if (API_CONFIG.useMockApi) return [...devOrgs];
    const response = await apiClient.get("/admin/organizations");
    return unwrapCollection(response.data).map(normalizeOrganizationResource);
  },

  getAdminEvents: async (organizationName = "HMJ Teknik Informatika") => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      return eventStore.getAll().filter((event) => event.organizer === organizationName);
    }
    const rows = await allPages("/admin/events", { per_page: 100 });
    return rows.map((event) => normalizeEventResource(event, "admin"));
  },

  getAdminEventById: async (id) => {
    if (API_CONFIG.useMockApi) {
      await wait(150);
      return eventStore.getAll().find((event) => String(event.id) === String(id)) || null;
    }
    const response = await apiClient.get(`/admin/events/${id}`);
    return normalizeEventResource(response.data.data || response.data, "admin");
  },

  createEvent: async (payload) => {
    if (API_CONFIG.useMockApi) {
      await wait(280);
      return eventStore.add({
        ...payload,
        id: `evt-${Date.now()}`,
        slug: `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-3)}`,
        active_registrations: 0,
        status: payload.status || "draft",
        is_published: false,
      });
    }
    const eventPayload = { ...payload };
    delete eventPayload.poster_file;
    delete eventPayload.poster_url;
    delete eventPayload.poster_alt_text;
    const response = await apiClient.post("/admin/events", eventPayload);
    return normalizeEventResource(response.data.data || response.data, "admin");
  },

  updateEvent: async (id, payload) => {
    if (API_CONFIG.useMockApi) {
      await wait(280);
      return eventStore.update(id, payload);
    }
    const eventPayload = { ...payload };
    delete eventPayload.poster_file;
    delete eventPayload.poster_url;
    delete eventPayload.poster_alt_text;
    const response = await apiClient.put(`/admin/events/${id}`, eventPayload);
    return normalizeEventResource(response.data.data || response.data, "admin");
  },

  uploadEventMedia: async (eventId, file, mediaKind = "poster", altText = "") => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      return { id: `media-${Date.now()}`, kind: mediaKind, url: URL.createObjectURL(file), alt_text: altText };
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("media_kind", mediaKind);
    if (altText) formData.append("alt_text", altText);
    const response = await apiClient.post(`/admin/events/${eventId}/media`, formData);
    return response.data.data || response.data;
  },

  deleteEventMedia: async (eventId, mediaId) => {
    if (API_CONFIG.useMockApi) return true;
    await apiClient.delete(`/admin/events/${eventId}/media/${mediaId}`);
    return true;
  },

  deleteEvent: async (id) => {
    if (API_CONFIG.useMockApi) {
      await wait(200);
      eventStore.remove(id);
      return true;
    }
    await apiClient.delete(`/admin/events/${id}`);
    return true;
  },

  togglePublishEvent: async (id, currentlyPublished) => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      const current = eventStore.getAll().find((event) => String(event.id) === String(id));
      if (!current) return null;
      const nextPublished = !current.is_published;
      return eventStore.update(id, { is_published: nextPublished, status: nextPublished ? "open" : "draft" });
    }
    const action = currentlyPublished ? "unpublish" : "publish";
    const response = await apiClient.patch(`/admin/events/${id}/${action}`);
    return response.data.data || response.data;
  },

  getEventParticipants: async (eventId, { search, status, page }) => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      const term = search.toLowerCase();
      const rows = MOCK_PARTICIPANTS.filter((person) => String(person.event_id) === String(eventId)
        && (status === "all" || person.status === status)
        && [person.name, person.nim, person.study_program].some((value) => String(value || "").toLowerCase().includes(term)));
      return { rows: rows.slice((page - 1) * 50, page * 50), lastPage: Math.max(1, Math.ceil(rows.length / 50)) };
    }
    const params = { page, search: search || undefined,
      status: status === "all" ? undefined : status === "registered" ? "active" : status };
    const { data } = await apiClient.get(`/admin/events/${eventId}/participants`, { params });
    return {
      rows: data.data.map((row) => ({ ...row, status: row.status === "active" ? "registered" : row.status })),
      lastPage: data.meta.last_page,
    };
  },

  // UPA TIK: dashboard statistics are assembled from endpoints already available.
  getMasterOverview: async () => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      return {
        total_users: devUsers.length,
        total_students: devUsers.filter((user) => user.role === "student").length,
        total_organizations: devOrgs.length,
        total_events: eventStore.getAll().length,
        pending_verifications: devVerifications.filter((item) => ["pending", "manual_review"].includes(item.status)).length,
        pending_moderation: devModeration.filter((item) => item.moderation_status === "pending").length,
      };
    }
    const [organizations, events, verifications] = await Promise.all([
      adminService.getOrganizations(),
      adminService.getAllMasterEvents(),
      adminService.getStudentVerifications(),
    ]);
    return {
      total_users: null,
      total_students: null,
      total_organizations: organizations.length,
      total_events: events.length,
      pending_verifications: verifications.filter((item) => ["pending", "manual_review"].includes(item.status)).length,
      // moderation is action/log based (flag, unpublish, restore, cancel),
      // not an approval queue with a pending status.
      pending_moderation: null,
    };
  },

  getUsers: async () => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      return [...devUsers];
    }
    throw unavailable("Backend belum menyediakan endpoint GET /master/users. Role assignment tetap tersedia melalui POST /master/user-roles.");
  },

  updateUserRole: async (userId, roleSlug, organizationId = null) => {
    if (API_CONFIG.useMockApi) {
      await wait(200);
      devUsers = devUsers.map((user) => user.id === userId ? { ...user, role: roleSlug, organization_id: organizationId } : user);
      return [...devUsers];
    }
    const response = await apiClient.post("/master/user-roles", {
      user_id: userId,
      role_slug: roleSlug,
      ...(organizationId ? { organization_id: organizationId } : {}),
    });
    return response.data.data;
  },

  getOrganizations: async () => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      return [...devOrgs];
    }
    const rows = await allPages("/master/organizations", { per_page: 100 });
    return rows.map(normalizeOrganizationResource);
  },

  saveOrganization: async (organization) => {
    const organizationPayload = {
      name: organization.name?.trim(),
      organization_type: (organization.organization_type || organization.type || "student_organization").trim().toLowerCase(),
      parent_id: organization.parent_id || null,
      faculty_id: organization.faculty_id || null,
      contact_email: organization.contact_email || null,
      contact_phone: organization.contact_phone || null,
      is_active: organization.is_active ?? true,
    };

    if (API_CONFIG.useMockApi) {
      await wait(200);
      if (organization.id) {
        devOrgs = devOrgs.map((item) => item.id === organization.id
          ? normalizeOrganizationResource({ ...item, ...organizationPayload, type: organizationPayload.organization_type })
          : item);
      } else {
        devOrgs = [normalizeOrganizationResource({ ...organizationPayload, id: `org-${Date.now()}` }), ...devOrgs];
      }
      return [...devOrgs];
    }

    if (organization.id) {
      await apiClient.patch(`/master/organizations/${organization.id}`, organizationPayload);
    } else {
      await apiClient.post("/master/organizations", organizationPayload);
    }
    return adminService.getOrganizations();
  },

  deleteOrganization: async (id) => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      devOrgs = devOrgs.filter((organization) => organization.id !== id);
      return [...devOrgs];
    }
    await apiClient.delete(`/master/organizations/${id}`);
    return adminService.getOrganizations();
  },

  getAllMasterEvents: async () => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      return [...eventStore.getAll()];
    }
    const rows = await allPages("/master/events", { per_page: 100 });
    return rows.map((event) => normalizeEventResource(event, "admin"));
  },

  getModerationQueue: async () => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      return [...devModeration];
    }
    const rows = await allPages("/master/events", { per_page: 100 });
    return rows.map((event) => normalizeEventResource(event, "admin"));
  },

  getModerationLogs: async (eventId) => {
    if (API_CONFIG.useMockApi) return [];
    return allPages(`/master/events/${eventId}/moderation-logs`);
  },

  moderateEvent: async (id, action, reason = "") => {
    if (API_CONFIG.useMockApi) {
      await wait(200);
      devModeration = devModeration.map((item) => item.id === id ? {
        ...item,
        publication_status: action === "unpublish" ? "unpublished" : action === "restore" ? "published" : item.publication_status,
        cancelled: action === "cancel" ? true : action === "restore" ? false : item.cancelled,
        status: action === "cancel" ? "cancelled" : action === "unpublish" ? "unpublished" : action === "restore" ? "published" : item.status,
        last_moderation_action: action,
        last_moderation_reason: reason,
      } : item);
      return [...devModeration];
    }
    await apiClient.patch(`/master/events/${id}/moderation`, { action, reason });
    return adminService.getModerationQueue();
  },

  getStudentVerifications: async () => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      return [...devVerifications];
    }
    const rows = await allPages("/master/student-verifications", { per_page: 100 });
    return rows.map((item) => ({
      ...item, name: item.student?.name, email: item.student?.email, submitted_at: item.requested_at,
    }));
  },

  updateStudentVerification: async (id, status, reason = "") => {
    if (API_CONFIG.useMockApi) {
      await wait(200);
      devVerifications = devVerifications.map((item) => item.id === id ? { ...item, status, notes: reason || item.notes } : item);
      return [...devVerifications];
    }
    await apiClient.patch(`/master/student-verifications/${id}`, { status, reason });
    return adminService.getStudentVerifications();
  },

  getAuditAndSecurity: async () => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      return [...devLogs];
    }
    throw unavailable("Audit log dan security event belum memiliki endpoint pada backend.");
  },

  getSessions: async () => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      return [...devSessions];
    }
    throw unavailable("Session monitoring belum memiliki endpoint pada backend.");
  },

  revokeSession: async (id) => {
    if (API_CONFIG.useMockApi) {
      await wait(180);
      devSessions = devSessions.filter((session) => session.id !== id);
      return [...devSessions];
    }
    throw unavailable("Session revocation belum memiliki endpoint pada backend.");
  },
};
