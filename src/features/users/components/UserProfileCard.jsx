// src/features/users/components/UserProfileCard.jsx

import React from "react";
import Avatar from "../../../components/ui/Avatar";

export default function UserProfileCard({ image, name, email, onImageSelect }) {
  const initial =
    name && name.trim() !== "" ? name.charAt(0).toUpperCase() : "U";

  const safeImg = image && image.trim() !== "" ? image : null;

  return (
    <div className="profile-card">
      <Avatar
        src={safeImg}
        initial={initial}
        size={100}
        onImageSelect={onImageSelect}   // <-- THIS NOW WORKS
      />

      <h2 style={{ marginTop: "12px" }}>{name}</h2>
      <p style={{ color: "#777", marginBottom: "20px" }}>{email}</p>
    </div>
  );
}
