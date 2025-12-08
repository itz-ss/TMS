import React, { useState } from "react";
import { createClient } from "../api";
import "../styles/clientTabs.css"; // adjust if needed

export default function CreateClientModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", contact: "", description: "" });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await createClient(form);
      const data = res.data;

      if (data?.success) {
        onCreated(); // reload clients in parent
        onClose();
        setForm({ name: "", contact: "", description: "" });
      } else {
        alert(data?.error || "Failed to create client");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Could not create client");
    }

    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content client-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Create Client</h3>

        <form onSubmit={handleSubmit}>
          <label>Name*</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <label>Contact</label>
          <input
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />

          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <button className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Create Client"}
          </button>
        </form>
      </div>
    </div>
  );
}
