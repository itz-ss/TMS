// src/features/clients/api.js
import http from "../../services/httpClient";

export const getClients = () => http.get("/clients");

export const createClient = (data) => http.post("/clients", data);

export const updateClient = (id, data) => http.put(`/clients/${id}`, data);

export const deleteClient = (id) => http.delete(`/clients/${id}`);
