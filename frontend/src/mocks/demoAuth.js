export const IS_DEV_MOCK_ENABLED =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === "true";

export const DEMO_ACCOUNTS = {
  super_admin: {
    email: "admin@example.test",
    passcode: "ganespace7",
    profile: {
      id: "usr-master-01",
      name: "UPA TIK Administrator",
      email: "admin@example.test",
      role: "super_admin",
      organization: "UPA TIK Undiksha",
    },
  },
  student: {
    email: "mahasiswa@example.test",
    passcode: "student123",
    profile: {
      id: "usr-student-01",
      name: "Kadek Wahyu Ardia",
      email: "mahasiswa@example.test",
      role: "student",
      nim: "2415101002",
      faculty: "Fakultas Teknik dan Kejuruan",
      department: "Teknik Informatika",
      study_program: "Ilmu Komputer",
      verification_status: "verified",
      seminar_attendance_count: 6,
      seminar_attendance_target: 10,
    },
  },
  event_admin: {
    email: "hmjti@example.test",
    passcode: "admin123",
    profile: {
      id: "usr-org-01",
      name: "Admin HMJ TI",
      email: "hmjti@example.test",
      role: "event_admin",
      organization_id: "org-hmjti",
      organization: "HMJ Teknik Informatika",
    },
  },
};