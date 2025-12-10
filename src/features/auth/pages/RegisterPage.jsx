// src/features/auth/pages/RegisterPage.jsx
import React, { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import http from "../../../services/httpClient";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("intern");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    try {
      // httpClient automatically sends token for admin
      const res = await http.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      setMsg(res.data.notice || res.data.message || "User registered.");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Admin — add new users">
      <form onSubmit={handleRegister}>
        {msg && <p className="auth-success">{msg}</p>}
        {error && <p className="auth-error">{error}</p>}

        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Create password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Register User</button>
      </form>
    </AuthLayout>
  );
}
