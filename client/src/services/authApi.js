import { readResponse } from "./apiClient";

const API_URL = "http://localhost:3000/api/auth";

export async function registerApi(userData) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return readResponse(response);
}

export async function loginApi(credentials) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return readResponse(response);
}

export async function refreshApi() {
  const response = await fetch(`${API_URL}/refresh`, {
    method: "POST",
    credentials: "include",
  });

  return readResponse(response);
}

export async function logoutApi() {
  const response = await fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });

  return readResponse(response);
}