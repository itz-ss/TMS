// src/features/tasks/pages/api.js
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
// TASK REVIEW WORKFLOW API
// ===========================

/**
 * Submit work (Employee)
 * @param {string} id - Task ID
 * @param {string} notes - Submission notes
 * @returns {Promise<{success: boolean, task?: object, message?: string, error?: string}>}
 */
export const submitWork = async (id, notes = "") => {
  try {
    const res = await http.put(`/tasks/${id}/submit`, { notes });
    return res.data;
  } catch (err) {
    console.error("[submitWork] Error:", err.response?.data || err.message);
    return {
      success: false,
      error: err.response?.data?.error || err.message || "Failed to submit work",
    };
  }
};

/**
 * Request revision (Manager/Admin)
 * @param {string} id - Task ID
 * @param {string} notes - Revision notes
 * @returns {Promise<{success: boolean, task?: object, message?: string, error?: string}>}
 */
export const reviseTask = async (id, notes = "") => {
  try {
    const res = await http.put(`/tasks/${id}/revise`, { notes });
    return res.data;
  } catch (err) {
    console.error("[reviseTask] Error:", err.response?.data || err.message);
    return {
      success: false,
      error: err.response?.data?.error || err.message || "Failed to request revision",
    };
  }
};

/**
 * Approve task (Manager/Admin)
 * @param {string} id - Task ID
 * @returns {Promise<{success: boolean, task?: object, message?: string, error?: string}>}
 */
export const approveTask = async (id) => {
  try {
    const res = await http.put(`/tasks/${id}/approve`);
    return res.data;
  } catch (err) {
    console.error("[approveTask] Error:", err.response?.data || err.message);
    return {
      success: false,
      error: err.response?.data?.error || err.message || "Failed to approve task",
    };
  }
}; 
