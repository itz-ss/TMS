import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { loginThunk } from "../../../store/authSlice";
import "../styles/auth.css";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await dispatch(loginThunk({ email, password })).unwrap();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <AuthLayout title="Welcome Back 👋" subtitle="Login to your workspace">
      <form onSubmit={handleSubmit}>
        {error && <p className="auth-error">{error}</p>}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>Login</button>

      </form>
    </AuthLayout>
  );
}
