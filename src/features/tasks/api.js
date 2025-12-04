// src/features/tasks/api.js
import http from "../../services/httpClient";

// ===========================
// TASK CRUD API FUNCTIONS
// ===========================

// Create task
export const createTask = (data) => http.post("/tasks", data);

// Get all tasks
export const getTasks = () => http.get("/tasks");

// Get single task
export const getTaskById = (id) => http.get(`/tasks/${id}`);

// Update task
export const updateTask = (id, data) => http.put(`/tasks/${id}`, data);

// Delete task
export const deleteTask = (id) => http.delete(`/tasks/${id}`);

// Assign task
export const assignTask = (taskId, data) =>
  http.put(`/tasks/${taskId}/assign`, data);

// Mark task as completed/approved
export const approveTask = (taskId) =>
  http.put(`/tasks/${taskId}/approve`);

// Send task for revision
export const requestRevision = (taskId, data) =>
  http.put(`/tasks/${taskId}/revision`, data);
