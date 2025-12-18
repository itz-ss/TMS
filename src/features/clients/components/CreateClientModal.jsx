import React, { useState, useEffect } from "react";
import { createClient } from "../api";
import { socket } from "../../../services/socket";
import "../styles/CreateClientModal.css "; // contains modal styles

export default function CreateClientModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", contact: "", description: "" });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  useEffect(() => {
    if (!task?._id) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-task", task._id);

    return () => {
      socket.off("task:message");
    };
  }, [task?._id]);

  useEffect(() => {
    const handleTaskMessage = (msg) => {
      setMessages((prev) =>
        [...prev, msg].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        )
      );
    };

    socket.on("task:message", handleTaskMessage);

    return () => {
      socket.off("task:message", handleTaskMessage);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await createClient(form);
      const data = res.data;

      if (data?.success) {
        onCreated();
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
      <div
        className="modal-content client-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Create Client</h3>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-label">Name*</label>
          <input
            className="modal-input"
            required
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <label className="modal-label">Contact</label>
          <input
            className="modal-input"
            value={form.contact}
            onChange={(e) =>
              setForm({ ...form, contact: e.target.value })
            }
          />

          <label className="modal-label">Description</label>
          <textarea
            className="modal-textarea"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Create Client"}
          </button>
        </form>
      </div>
    </div>
  );
}
