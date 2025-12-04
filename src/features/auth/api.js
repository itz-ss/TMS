import http from "../../services/httpClient";

export const login = (data) => http.post("/auth/login", data);
export const register = (data) => http.post("/auth/register", data);
export const getAuthProfile = () => http.get("/auth/profile");
