import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { Client } from "../types/client";
import { ClientSite } from "../types/client-site";
import { JobPosition } from "../types/job-position";
import { Role } from "../types/role";
import { User, UserCreate } from "../types/user";
import { Employee, EmployeeFormDto, EmployeeSearchParams, OnboardEmployeeRequest } from "../types/employee";
import { JobReference } from "../types/job-reference";
import { CreateShiftMasterRequest, ShiftMasterDTO } from "../types/shift-master";
import { ShiftPattern, CreatePatternRequest, BulkPatternItemsRequest } from "../types/shift-pattern";
import { RosterResponse } from "../types/roster";
import { PageResponse } from "../types/common";

// --- KONFIGURASI HOST ---
// Mengambil IP Host dari Expo Go (untuk development)
const debuggerHost = Constants.expoGoConfig?.debuggerHost;
const host = debuggerHost ? debuggerHost.split(":")[0] : "localhost";

// Ganti port sesuai backend Spring Boot Anda (biasanya 8080)
// export const API_BASE_URL = `http://${host}:8080/api`;
export const API_BASE_URL = `https://troi-office-dev-latest.onrender.com/api`;

let onUnauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedHandler = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

const handleResponseError = async (response: Response) => {
  if (response.status === 401) {
    // Jika ada callback terdaftar (fungsi logout), jalankan
    if (onUnauthorizedCallback) {
      console.log("Session expired (401), executing logout...");
      onUnauthorizedCallback();
    }
    throw new Error("Session expired. Please login again.");
  }

  const errorBody = await response.text();
  console.error(`API Error ${response.status}: ${errorBody}`);

  if (response.status === 500) {
    console.error("Critical Server Error (500). Please check backend logs if possible.");
    console.error("Full Error Body:", errorBody);
  }

  throw new Error(errorBody || `API Error: ${response.status}`);
};

// --- INTERFACES ---

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  name: string;
  username: string;
}

export interface RoleResponseDTO {
  id: string;
  name: string;
}

export interface UserResponseDTO {
  id: string;
  name: string;
  username: string;
  role: RoleResponseDTO;
}

export interface LocalDate {
  year: number;
  month: number;
  day: number;
}

export interface BigDecimal {
  value: number;
}

export type EmploymentType = 'PKWT' | 'PKWTT' | 'FREELANCE';


export interface PlacementDTO {
  id: string;
  client: Client;
  clientSite: ClientSite;
  jobPosition: JobPosition;
  jobTitle: string;
  employeeIdAtClient: string;
  employmentType: EmploymentType;
  startDate: LocalDate;
  endDate: LocalDate;
  basicSalary: BigDecimal;
  isActive: boolean;

}

export interface ProfileDetailResponseDTO {
  user: UserResponseDTO;
  employee: Employee;
  placement: PlacementDTO;
}

export interface AttendanceStats {
  employeeName: string;
  monthYear: string;
  totalWorkingDays: number;
  daysPresent: number;
  daysAbsent: number;
  daysLateCheckIn: number;
}

export interface AttendanceResponse {
  id: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  employeeName: string;
  checkInLatitude: string;
  checkInLongitude: string;
  checkOutLatitude: string;
  checkOutLongitude: string;
  status: string;
  location: string;
  checkInPhotoUrl: string;
  checkOutPhotoUrl: string;
  totalHours: number;
}

// --- TOKEN MANAGEMENT ---
let localAuthToken: string | null = null;

export const setLocalAuthToken = (token: string | null) => {
  localAuthToken = token;
};

const getAuthToken = async (): Promise<string | null> => {
  if (localAuthToken) return localAuthToken;
  const token = await AsyncStorage.getItem("authToken");
  if (token) localAuthToken = token;
  return token;
};

const getMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
  return { start, end };
};

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    await handleResponseError(response);
  }

  // Handle empty responses (e.g. 204 No Content for DELETE)
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return {} as T;
  }

  return response.json();
};

const apiRequestMultipart = async <T>(
  endpoint: string,
  method: "POST" | "PUT",
  formData: FormData
): Promise<T> => {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    body: formData,
    headers,
  });

  if (!response.ok) {
    await handleResponseError(response);
  }

  return response.json();
};

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data: LoginResponse = await response.json();
      await AsyncStorage.setItem("authToken", data.token);
      await AsyncStorage.setItem("userData", JSON.stringify(data));
      setLocalAuthToken(data.token); // Cache to memory
      return data;
    } catch (error) {
      console.log("Login Error:", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    setLocalAuthToken(null); // Clear memory cache
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userData");
  },

  getStoredUser: async (): Promise<LoginResponse | null> => {
    const userData = await AsyncStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem("authToken");
    return !!token;
  },
};

export const profileApi = {
  getProfile: async (): Promise<ProfileDetailResponseDTO> => {
    try {
      return await apiRequest<ProfileDetailResponseDTO>("/profiles/detail");
    } catch (error) {
      console.error('Error get detail profile:', error);
      throw error;
    }
  },
};

export const attendanceApi = {
  getHistory: async (start?: string, end?: string): Promise<AttendanceResponse[]> => {
    try {
      const range = getMonthRange();
      const startDate = start || range.start;
      const endDate = end || range.end;

      return await apiRequest<AttendanceResponse[]>(
        `/attendance/list?start=${startDate}&end=${endDate}`
      );
    } catch (error) {
      console.error("Error get list attendance:", error);
      throw error;
    }
  },

  getStats: async (): Promise<AttendanceStats> => {
    try {
      return await apiRequest<AttendanceStats>("/attendance/stats");
    } catch (error) {
      console.error('Error get attendance stats:', error);
      throw error;
    }
  },

  getTodayStatus: async (): Promise<AttendanceResponse> => {
    try {
      return await apiRequest<AttendanceResponse>("/attendance/today");
    } catch (error) {
      console.error('Error get attendance today:', error);
      throw error;
    }
  },

  clockIn: async (data: FormData): Promise<AttendanceResponse> => {
    return await apiRequestMultipart<AttendanceResponse>("/attendance", "POST", data);
  },

  clockOut: async (data: FormData): Promise<AttendanceResponse> => {
    return await apiRequestMultipart<AttendanceResponse>("/attendance", "POST", data);
  },
};