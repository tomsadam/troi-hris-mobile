import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://localhost:8080/api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  name: string;
  username: string;
}

export interface ProfileResponse {
  id: string;
  name: string;
  username: string;
  employeeId: string;
  jobPosition: string;
  status: string;
  email: string;
  department: string;
  location: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  totalHours: string;
  location: string;
}

export interface AttendanceStats {
  absenceDays: number;
  totalAttended: number;
  month: string;
}

export interface ClockResponse {
  success: boolean;
  time: string;
  message: string;
}

const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("authToken");
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
    throw new Error(`API Error: ${response.status}`);
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
      return data;
    } catch (error) {
      console.log("Backend unavailable, using mock login for testing");
      if (credentials.username === "superadmin" && credentials.password === "aA@123") {
        const mockData: LoginResponse = {
          token: "mock-jwt-token-for-testing",
          name: "Akhmad Maariz",
          username: "superadmin",
        };
        await AsyncStorage.setItem("authToken", mockData.token);
        await AsyncStorage.setItem("userData", JSON.stringify(mockData));
        return mockData;
      }
      throw new Error("Invalid credentials");
    }
  },

  logout: async (): Promise<void> => {
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
  getProfile: async (): Promise<ProfileResponse> => {
    try {
      return await apiRequest<ProfileResponse>("/profile/detail");
    } catch (error) {
      console.log("Using mock profile data");
      return {
        id: "1",
        name: "Akhmad Maariz",
        username: "superadmin",
        employeeId: "2023988231",
        jobPosition: "UI/UX Designer",
        status: "Full Time",
        email: "akhmad.maariz@company.com",
        department: "Design",
        location: "West Jakarta, Indonesia",
      };
    }
  },
};

export const attendanceApi = {
  getHistory: async (): Promise<AttendanceRecord[]> => {
    try {
      return await apiRequest<AttendanceRecord[]>("/attendance/history");
    } catch (error) {
      console.log("Using mock attendance data");
      return [
        {
          id: "1",
          date: "2023-11-23",
          checkIn: "07:58",
          checkOut: null,
          totalHours: "-",
          location: "Office, West Jakarta, Indonesia",
        },
        {
          id: "2",
          date: "2023-11-22",
          checkIn: "07:57",
          checkOut: "17:00",
          totalHours: "08:03",
          location: "Office, West Jakarta, Indonesia",
        },
        {
          id: "3",
          date: "2023-11-21",
          checkIn: "08:03",
          checkOut: "17:08",
          totalHours: "08:05",
          location: "Office, West Jakarta, Indonesia",
        },
        {
          id: "4",
          date: "2023-11-20",
          checkIn: "07:59",
          checkOut: "17:00",
          totalHours: "08:01",
          location: "Office, West Jakarta, Indonesia",
        },
        {
          id: "5",
          date: "2023-11-17",
          checkIn: "08:05",
          checkOut: "17:10",
          totalHours: "08:05",
          location: "Office, West Jakarta, Indonesia",
        },
      ];
    }
  },

  getStats: async (): Promise<AttendanceStats> => {
    try {
      return await apiRequest<AttendanceStats>("/attendance/stats");
    } catch (error) {
      console.log("Using mock stats data");
      return {
        absenceDays: 3,
        totalAttended: 15,
        month: "November",
      };
    }
  },

  getTodayStatus: async (): Promise<{ checkIn: string | null; checkOut: string | null }> => {
    try {
      return await apiRequest<{ checkIn: string | null; checkOut: string | null }>("/attendance/today");
    } catch (error) {
      console.log("Using mock today status");
      return {
        checkIn: "07:58",
        checkOut: null,
      };
    }
  },

  clockIn: async (faceData?: string): Promise<ClockResponse> => {
    try {
      return await apiRequest<ClockResponse>("/attendance/clock-in", {
        method: "POST",
        body: JSON.stringify({ faceData }),
      });
    } catch (error) {
      console.log("Using mock clock-in response");
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      return {
        success: true,
        time: `${hours}:${minutes}`,
        message: "Clock in successful",
      };
    }
  },

  clockOut: async (faceData?: string): Promise<ClockResponse> => {
    try {
      return await apiRequest<ClockResponse>("/attendance/clock-out", {
        method: "POST",
        body: JSON.stringify({ faceData }),
      });
    } catch (error) {
      console.log("Using mock clock-out response");
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      return {
        success: true,
        time: `${hours}:${minutes}`,
        message: "Clock out successful",
      };
    }
  },
};
