// ruchky/lib/api/auth.ts
import { safeFetch, BASE_API_URL } from './request';
import { User } from "@/lib/types/user";

let csrfToken = "";

/**
 * 1) Fetch CSRF token from backend and store it in-memory.
 *    Must call this once before making any "write" requests (login, logout, register).
 */
export async function fetchCSRFToken(): Promise<void> {
  const data = await safeFetch<{ csrf_token: string }>(`${BASE_API_URL}/api/v1/auth/csrf`, {
    method: "GET",
    credentials: "include",
  });
  csrfToken = data.csrf_token;
}

/**
 * 2) Log in user with email/password, setting Django session cookie (sessionid).
 */
export async function loginUser(email: string, password: string): Promise<void> {
  await safeFetch<{ message: string }>(`${BASE_API_URL}/api/v1/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ email, password }),
  });
}

/**
 * 3) Log out user, server clears session.
 */
export async function logoutUser(): Promise<void> {
  await safeFetch<{ message: string }>(`${BASE_API_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });
}

/**
 * 4) Register a new account. 
 */
interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export async function registerUser(data: RegisterData): Promise<void> {
  await safeFetch(`${BASE_API_URL}/api/v1/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
    }),
  });
}

/**
 * 5) Fetch the current logged-in user (if any).
 *    Assumes you have some endpoint like /users/me
 */
export async function fetchCurrentUser(): Promise<User | null> {
    try {
        return await safeFetch<User>(`${BASE_API_URL}/api/v1/users/me`, {
        method: "GET",
        credentials: "include",
        });
    } catch (err: any) {
        if (err.status === 401) {
        return null;
        }
        throw err;
    }
}
