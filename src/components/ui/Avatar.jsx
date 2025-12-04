import React, { useState, useRef, useEffect } from "react";

export default function Avatar({
  src,
  initial = "U",
  size = 40,
  onImageSelect,
}) {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false); // 🔥 controls animation
  const fileInputRef = useRef(null);

  // Reset fade-in when src changes
  useEffect(() => {
    setLoaded(false);
  }, [src]);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) onImageSelect(file);
  };

  const showImage = src && !imgError;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#e5e7eb",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        fontWeight: 600,
        color: "#4b5563",
      }}
    >

      {showImage ? (
        <img
          src={src}
          alt={initial}
          onError={() => setImgError(true)}
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.4s ease-in-out", // ✨ fade-in animation
          }}
        />
      ) : (
        <span>{initial}</span>
      )}

      {/* Camera button */}
      <button
        onClick={handlePickFile}
        style={{
          position: "absolute",
          bottom: 4,
          right: 4,
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 26,
          height: 26,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        📷
      </button>

      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
