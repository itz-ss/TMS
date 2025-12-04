// src/features/users/pages/ProfilePage.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  updateProfileThunk,
  updateImageThunk,
  changePasswordThunk,
  setUser,
} from "../../../store/authSlice";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";

import UserProfileCard from "../components/UserProfileCard";
import ProfileForm from "../components/ProfileForm";
import "../../../styles/profile.css";
import { uploadProfilePhoto } from "../api";

function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const loadedOnce = useRef(false);

  const [values, setValues] = useState({
    name: "",
    phone: "",
    profileImage: "",
  });

  const [passwordBoxOpen, setPasswordBoxOpen] = useState(false);

  const [pwd, setPwd] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user → local state once
  useEffect(() => {
    if (user && !loadedOnce.current) {
      loadedOnce.current = true;
      setValues({
        name: user.name || "",
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [user]);

  const handleChange = useCallback((field, val) => {
    setValues((prev) => ({ ...prev, [field]: val }));
  }, []);

  const handleSubmit = useCallback(() => {
    dispatch(updateProfileThunk(values));
  }, [values, dispatch]);

  const handleSaveImage = useCallback(() => {
    dispatch(updateImageThunk({ imageUrl: values.profileImage }));
  }, [dispatch, values.profileImage]);

  const handleImageSelect = async (file) => {
    if (!file) return;

    try {
      const res = await uploadProfilePhoto(file);
      const updatedUser = res?.user;

      if (!updatedUser || !updatedUser.profileImage) return;

      dispatch(setUser(updatedUser));

      setValues((prev) => ({
        ...prev,
        profileImage: updatedUser.profileImage,
      }));
    } catch (err) {
      // Inform the user and don't log sensitive error details in production
      alert(err?.message || "Failed uploading profile photo");
    }
  };

  // Change password
  const handlePwdChange = (field, val) => {
    setPwd((prev) => ({ ...prev, [field]: val }));
  };

  const handlePwdSubmit = async () => {
    if (pwd.newPassword !== pwd.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      const res = await dispatch(
        changePasswordThunk({
          oldPassword: pwd.oldPassword,
          newPassword: pwd.newPassword,
        })
      ).unwrap();

      // if backend returned updated user, update Redux and local UI
      if (res?.user) {
  dispatch(setUser(res.user));
      } else {
        dispatch(autoLoginThunk()); // refreshes user profile
      }
    } catch (err) {
      alert(err?.message || "Failed to update password");
      return;
    }

    // reset
    setPwd({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    alert("Password updated successfully!");
  };

  if (!user) return <div>Loading...</div>;

  // Cache-busting for profile image
  const rawImage = values.profileImage || user.profileImage;
  const version = user?.updatedAt
    ? new Date(user.updatedAt).getTime()
    : Date.now();
  const displayImage = rawImage
    ? `${rawImage}${rawImage.includes("?") ? "&" : "?"}v=${version}`
    : null;

  return (
    <div className="profile-page-wrapper">
      <UserProfileCard
        image={displayImage}
        name={values.name}
        email={user.email}
        onImageSelect={handleImageSelect}
      />

      <ProfileForm values={values} onChange={handleChange} onSubmit={handleSubmit} />

      <button
        onClick={handleSaveImage}
        className="btn-primary"
        style={{ marginTop: "10px" }}
      >
        Save Profile Image
      </button>

      {/* ==========================
          CHANGE PASSWORD SECTION
      ========================== */}
      <div style={{ marginTop: "25px" }}>
        <button
          className="btn-secondary"
          onClick={() => setPasswordBoxOpen((p) => !p)}
        >
          {passwordBoxOpen ? "Hide Change Password" : "Change Password"}
        </button>

        {passwordBoxOpen && (
          <div className="password-box">
            <h3>Change Password</h3>

            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={pwd.oldPassword}
                onChange={(e) => handlePwdChange("oldPassword", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={pwd.newPassword}
                onChange={(e) => handlePwdChange("newPassword", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={pwd.confirmPassword}
                onChange={(e) => handlePwdChange("confirmPassword", e.target.value)}
              />
            </div>

            <button className="btn-primary" onClick={handlePwdSubmit}>
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
