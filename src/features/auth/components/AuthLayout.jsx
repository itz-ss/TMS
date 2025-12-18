// AuthLayout etc.import React from "react";
import "../styles/auth.css";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {title && <h2 className="auth-title">{title}</h2>}
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
