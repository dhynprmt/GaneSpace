import apiClient, { API_CONFIG, unwrapCollection } from "./api/apiClient";
import { MOCK_CATEGORIES } from "../mocks/events";

export const campusDirectoryService = {
  async getFaculties() {
    if (API_CONFIG.useMockApi) return [];
    const response = await apiClient.get("/faculties", { params: { per_page: 100 } });
    return unwrapCollection(response.data);
  },

  async getDepartments(facultyId) {
    if (!facultyId) return [];
    if (API_CONFIG.useMockApi) return [];
    const response = await apiClient.get(`/faculties/${facultyId}/departments`, { params: { per_page: 100 } });
    return unwrapCollection(response.data);
  },

  async getStudyPrograms(departmentId) {
    if (!departmentId) return [];
    if (API_CONFIG.useMockApi) return [];
    const response = await apiClient.get(`/departments/${departmentId}/study-programs`, { params: { per_page: 100 } });
    return unwrapCollection(response.data);
  },

  async getCategories() {
    if (API_CONFIG.useMockApi) return MOCK_CATEGORIES;
    const response = await apiClient.get("/event-categories");
    return unwrapCollection(response.data);
  },

  async getEventTypes() {
    if (API_CONFIG.useMockApi) return [];
    const response = await apiClient.get("/event-types");
    return unwrapCollection(response.data);
  },
};
