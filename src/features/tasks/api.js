// src/features/tasks/api.js
import http from "../../services/httpClient";

// ===========================
// TASK CRUD API FUNCTIONS
// ===========================

// Create task
export const createTask = (data) => http.post("/tasks", data);

// Get all tasks (supports optional query params, e.g. { clientId: "..." } )
export const getTasks = (params = {}) => {
  // If params is empty object, axios will simply request /tasks
  // If you need to use a different query name (e.g. 'client' instead of 'clientId'),
  // change the caller OR change the param key here before sending.
  return http.get("/tasks", { params });
};

// Get single task
export const getTaskById = (id) => http.get(`/tasks/${id}`);

// Update task
export const updateTask = (id, data) => http.put(`/tasks/${id}`, data);

// Delete task
export const deleteTask = (id) => http.delete(`/tasks/${id}`);

// Assign task
// Backend earlier expected body like { assigneeId: "..." } or string — match your backend.
// This helper sends the body as { assigneeId } by default; your TaskList currently sends string directly
// so ensure assignTask usage matches backend. To support both easily, accept either value.
export const assignTask = (taskId, payload) => {
  // If user passed a string (userId), send as body { assigneeId: userId }
  if (typeof payload === "string") {
    return http.put(`/tasks/${taskId}/assign`, { assigneeId: payload });
  }
  // else assume payload is already the object the backend expects
  return http.put(`/tasks/${taskId}/assign`, payload);
};

// ===========================
// TASK REVIEW WORKFLOW API
// ===========================

/**
 * Submit work (Employee)
//  * @param {string} id - Task ID
//  * @param {string} notes - Submission notes
//  * @returns {Promise<{success: boolean, task?: object, message?: string, error?: string}>}
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

