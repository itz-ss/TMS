// src/features/users/api.js
// -----------------------------------------------------
// USER MODULE API
// Contains:
// - Admin user management endpoints (existing)
// - User self-service endpoints (new)
// -----------------------------------------------------

import axios from "../../services/httpClient";

/* =====================================================
 *  ADMIN: GET ALL USERS
 * ===================================================== */
export const fetchUsers = async () => {
  const res = await axios.get("/users");
  return res.data;
};

/* =====================================================
 *  ADMIN: UPDATE USER ROLE
 * ===================================================== */
export const updateUserRole = async (userId, role) => {
  const res = await axios.put(`/users/${userId}/role`, { role });
  return res.data;
};

/* =====================================================
 *  ADMIN: DELETE USER
 * ===================================================== */
export const deleteUser = async (userId) => {
  const res = await axios.delete(`/users/${userId}`);
  return res.data;
};

/* =====================================================
 *  USER: GET MY PROFILE (Logged-in user)
 * ===================================================== */
export const getMyProfile = async () => {
  const res = await axios.get("/users/me");
  return res.data;
};

/* =====================================================
 *  USER: UPDATE NAME + PHONE
 *  PUT /users/update
 * ===================================================== */
export const updateProfile = async (payload) => {
  const res = await axios.put("/users/update", payload);
  return res.data;
};

/* =====================================================
 *  USER: UPDATE PROFILE IMAGE URL
 *  PUT /users/profile-image
 * ===================================================== */
export const updateProfileImage = async (payload) => {
  const res = await axios.put("/users/profile-image", payload);
  return res.data;
};

/* =====================================================
 *  USER: CHANGE PASSWORD
 *  PUT /users/change-password
 * ===================================================== */
export const changePassword = async (payload) => {
  const res = await axios.put("/users/change-password", payload);
  return res.data;
};

/* =====================================================
 *  USER: UPDATE SETTINGS (theme + notifications)
 *  PUT /users/settings
 * ===================================================== */
export const updateUserSettings = async (payload) => {
  const res = await axios.put("/users/settings", payload);
  return res.data;
};

/* =====================================================
 *  USER: GET MY ANALYTICS / STATS
 *  GET /users/stats
 * ===================================================== */
export const getUserStats = async () => {
  const res = await axios.get("/users/stats");
  return res.data;
};

/* =====================================================
 *  USER: UPLOAD PROFILE IMAGE TO CLOUDINARY
 * ===================================================== */
// upload file (multipart/form-data)
export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append("file", file);  // MUST MATCH multer.single("file")

  const res = await axios.post("/users/upload-photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  // backend returns { success, message, user } — return the user directly
  return res.data.user;
};


// src/features/users/api.js (append)
export const toggleActive = async (userId) => {
  const res = await axios.put(`/users/toggle/${userId}`);
  return res.data; // { success, message, user }
};

