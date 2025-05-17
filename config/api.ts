// API base URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Interface definitions
interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

interface ApiError {
  error: string;
  status?: number;
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `API error: ${response.status}`);
  }
  
  return data as T;
}

// Authentication API functions
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  
  return handleResponse<LoginResponse>(response);
}

// Function to get the auth token
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

// Function to check if user is authenticated
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

// Function to get the current user
export function getCurrentUser() {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

// Authenticated API request helper
export async function authenticatedRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });
  
  return handleResponse<T>(response);
}

// Logout function
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Redirect to login page if needed
  window.location.href = "/";
}