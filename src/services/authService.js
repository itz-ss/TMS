import httpClient from "./httpClient";

export const loginRequest = (email, password) =>
  httpClient.post("/api/auth/login", { email, password });

export const getProfileRequest = () =>
  httpClient.get("/api/auth/profile");
