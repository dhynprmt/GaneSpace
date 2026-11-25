import apiClient, { API_CONFIG } from "./api/apiClient";
import { DEMO_ACCOUNTS, IS_DEV_MOCK_ENABLED } from "../mocks/demoAuth";

const PROFILE_OVERRIDE_KEY = "ganespace_profile_override_v1";

function readProfileOverrides() {
  try {
    return JSON.parse(sessionStorage.getItem(PROFILE_OVERRIDE_KEY) || "{}");
  } catch {
    return {};
  }
}

function normalizeRoles(user) {
  const rawRoles = user?.roles ?? user?.role ?? user?.primary_role ?? [];
  const roles = (Array.isArray(rawRoles) ? rawRoles : [rawRoles])
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item?.role === "string") return item.role;
      return item?.slug || item?.name || item?.role?.slug || item?.role?.name;
    })
    .filter(Boolean)
    .map((role) => String(role).toLowerCase());

  if (user?.role && !roles.includes(String(user.role).toLowerCase())) {
    roles.push(String(user.role).toLowerCase());
  }

  return [...new Set(roles)];
}

export function normalizeUserResponse(payload) {
  const candidate = payload?.user || payload?.data?.user || payload?.data || payload;
  if (!candidate || typeof candidate !== "object") return null;

  const studentProfile = candidate.student || candidate.student_profile || candidate.studentProfile || {};
  const roles = normalizeRoles(candidate);
  const roleValue = candidate.primary_role?.slug || candidate.primary_role || candidate.role?.slug || candidate.role;
  const role = roleValue ||
    ["super_admin", "event_admin", "student"].find((item) => roles.includes(item)) ||
    roles[0] || "guest";
  const eventAdminAssignment = (candidate.user_roles || candidate.role_assignments || (Array.isArray(candidate.roles) ? candidate.roles : [])).find((assignment) =>
    ((typeof assignment.role === "string" ? assignment.role : assignment.role?.slug) || assignment.role_slug || assignment.slug) === "event_admin"
  );
  const scopedOrganization = eventAdminAssignment?.organization_name || eventAdminAssignment?.organization || candidate.organization;

  return {
    ...candidate,
    roles,
    role: String(role).toLowerCase(),
    organization_id: candidate.organization_id ?? eventAdminAssignment?.organization_id ?? null,
    organization: typeof scopedOrganization === "string" ? scopedOrganization : scopedOrganization?.name ?? null,
    nim: candidate.nim ?? studentProfile.nim ?? null,
    faculty: candidate.faculty ?? studentProfile.study_program?.faculty ?? studentProfile.faculty?.name ?? studentProfile.faculty_name ?? null,
    department: candidate.department ?? studentProfile.study_program?.department ?? studentProfile.department?.name ?? studentProfile.department_name ?? null,
    study_program: candidate.study_program ?? studentProfile.study_program?.name ?? studentProfile.study_program_name ?? null,
    faculty_id: candidate.faculty_id ?? studentProfile.study_program?.faculty_id ?? studentProfile.faculty_id ?? null,
    department_id: candidate.department_id ?? studentProfile.study_program?.department_id ?? studentProfile.department_id ?? null,
    study_program_id: candidate.study_program_id ?? studentProfile.study_program?.id ?? studentProfile.study_program_id ?? null,
    verification_status: candidate.verification_status ?? studentProfile.verification_status ?? studentProfile.status ?? "pending",
  };
}

function toRegistrationFormData(payload) {
  if (payload instanceof FormData) return payload;
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, value);
  });
  return formData;
}

export const authService = {
  login: async ({ email, password, turnstileToken }) => {
    if (API_CONFIG.useMockApi && IS_DEV_MOCK_ENABLED) {
      const normalized = email.trim().toLowerCase();
      const matched = Object.values(DEMO_ACCOUNTS).find(
        (account) => account.email.toLowerCase() === normalized && account.passcode === password
      );
      if (!matched) {
        const error = new Error("Email atau password tidak sesuai.");
        error.status = 401;
        throw error;
      }
      const overrides = readProfileOverrides();
      const profile = { ...matched.profile, ...(overrides[matched.profile.id] || {}) };
      sessionStorage.setItem("ganespace_dev_session", JSON.stringify(profile));
      return normalizeUserResponse(profile);
    }

    const response = await apiClient.post("/auth/login", {
      email,
      password,
      turnstile_token: turnstileToken,
    });
    return normalizeUserResponse(response.data);
  },

  register: async (payload) => {
    if (API_CONFIG.useMockApi && IS_DEV_MOCK_ENABLED) {
      return { message: "Pendaftaran akun berhasil. Silakan cek email untuk verifikasi." };
    }
    const response = await apiClient.post("/auth/register", toRegistrationFormData(payload));
    return response.data;
  },

  forgotPassword: async ({ email, turnstileToken }) => {
    if (API_CONFIG.useMockApi && IS_DEV_MOCK_ENABLED) {
      return { message: "Jika email terdaftar, tautan pemulihan akan dikirim." };
    }
    const response = await apiClient.post("/auth/forgot-password", {
      email,
      turnstile_token: turnstileToken,
    });
    return response.data;
  },

  resetPassword: async (payload) => {
    const response = await apiClient.post("/auth/reset-password", payload);
    return response.data;
  },

  resendVerification: async ({ email, turnstileToken }) => {
    if (API_CONFIG.useMockApi && IS_DEV_MOCK_ENABLED) {
      return { message: "Jika akun memerlukan verifikasi, email akan dikirim ulang." };
    }
    const response = await apiClient.post("/auth/email/resend", {
      email,
      turnstile_token: turnstileToken,
    });
    return response.data;
  },

  updateProfile: async (payload) => {
    if (API_CONFIG.useMockApi && IS_DEV_MOCK_ENABLED) {
      const raw = sessionStorage.getItem("ganespace_dev_session");
      const current = raw ? JSON.parse(raw) : DEMO_ACCOUNTS.student.profile;
      const updated = { ...current, ...payload };
      const overrides = readProfileOverrides();
      overrides[updated.id] = updated;
      sessionStorage.setItem(PROFILE_OVERRIDE_KEY, JSON.stringify(overrides));
      sessionStorage.setItem("ganespace_dev_session", JSON.stringify(updated));
      return normalizeUserResponse(updated);
    }
    const response = await apiClient.patch("/me/profile", payload);
    return normalizeUserResponse(response.data);
  },

  getStudentPhoto: async () => {
    const response = await apiClient.get("/me/student-profile/photo", { responseType: "blob" });
    return response.data;
  },

  saveStudentPhoto: async (file) => {
    await apiClient.post("/me/student-profile/photo", toRegistrationFormData({ profile_photo: file }));
  },

  resubmitStudentProfile: async (payload) => {
    if (API_CONFIG.useMockApi && IS_DEV_MOCK_ENABLED) {
      return { message: "Data identitas berhasil dikirim untuk peninjauan." };
    }
    const response = await apiClient.post("/me/student-profile/resubmit", toRegistrationFormData(payload));
    return response.data;
  },

  getMe: async () => {
    if (API_CONFIG.useMockApi && IS_DEV_MOCK_ENABLED) {
      const savedSession = sessionStorage.getItem("ganespace_dev_session");
      if (savedSession) {
        try { return normalizeUserResponse(JSON.parse(savedSession)); } catch { return null; }
      }
      const legacyRole = sessionStorage.getItem("ganespace_dev_role");
      return legacyRole ? normalizeUserResponse(DEMO_ACCOUNTS[legacyRole]?.profile) : null;
    }

    try {
      const response = await apiClient.get("/me");
      return normalizeUserResponse(response.data);
    } catch (error) {
      if (error.status === 401) return null;
      throw error;
    }
  },

  logout: async () => {
    if (API_CONFIG.useMockApi && IS_DEV_MOCK_ENABLED) {
      sessionStorage.removeItem("ganespace_dev_session");
      sessionStorage.removeItem("ganespace_dev_role");
      return true;
    }
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      if (error.status !== 401) throw error;
    }
    return true;
  },
};
