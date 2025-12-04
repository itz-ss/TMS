// src/features/tasks/api.js
// Correct Task API using httpClient (baseURL + auth token support)

import http from "/src/services/httpClient";

// ===========================
// GET ALL TASKS
// ===========================
export const fetchTasks = (params = {}) =>
  http.get("/tasks", { params }).then((res) => res.data);

// ===========================
// GET TASK BY ID
// ===========================
export const getTaskById = (id) =>
  http.get(`/tasks/${id}`).then((res) => res.data);

// ===========================
// CREATE TASK
// ===========================
export const createTask = (data) =>
  http.post("/tasks", data).then((res) => res.data);

// ===========================
// UPDATE TASK
// ===========================
export const updateTask = (id, data) =>
  http.put(`/tasks/${id}`, data).then((res) => res.data);

// ===========================
// DELETE TASK
// ===========================
export const deleteTask = (id) =>
  http.delete(`/tasks/${id}`).then((res) => res.data);

// ===========================
// ASSIGN TASK
// ===========================
export const assignTask = (id, assigneeId) =>
  http.put(`/tasks/${id}/assign`, { assigneeId }).then((res) => res.data);

// ===========================
// REQUEST REVISION
// ===========================
export const reviseTask = (id, notes) =>
  http.put(`/tasks/${id}/revise`, { revisionNotes: notes }).then((res) => res.data);

// ===========================
// APPROVE TASK
// ===========================
export const approveTask = (id) =>
  http.put(`/tasks/${id}/approve`).then((res) => res.data);
