// TaskChatModal.jsx - Unified chat modal for submissions and revisions
import React, { useState, useEffect, useRef } from "react";
import { submitWork, reviseTask, approveTask } from "../pages/api";
import "../styles/tasks.css";

export default function TaskChatModal({ task, currentUser, canApprove, canRevise, onClose, onUpdate }) {
  const [messages, setMessages] = useState([]);
  const [inputNotes, setInputNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const isAssignedToMe = task.assignee?._id?.toString() === currentUser?._id?.toString();
  const isEmployee = !canApprove && isAssignedToMe;
  const isManager = canApprove || canRevise;

  useEffect(() => {
    // Build messages from history array
    const historyMessages = (task.history || [])
      .filter((h) => h.action === "submit" || h.action === "revise" || h.action === "approve")
      .map((h) => ({
        type: h.action === "revise" ? "revision" : h.action === "submit" ? "submission" : h.action,
        notes: h.notes,
        date: h.date,
        user: h.user,
      }));

    // Add current submission/revision if exists and not already in history
    const currentMessages = [];
    if (task.submissionNotes && task.submittedAt) {
      const existsInHistory = historyMessages.some(
        (m) => m.type === "submission" && new Date(m.date).getTime() === new Date(task.submittedAt).getTime()
      );
      if (!existsInHistory) {
        currentMessages.push({
          type: "submission",
          notes: task.submissionNotes,
          date: task.submittedAt,
        });
      }
    }
    if (task.revisionNotes && task.revisionRequestedAt) {
      const existsInHistory = historyMessages.some(
        (m) => m.type === "revision" && new Date(m.date).getTime() === new Date(task.revisionRequestedAt).getTime()
      );
      if (!existsInHistory) {
        currentMessages.push({
          type: "revision",
          notes: task.revisionNotes,
          date: task.revisionRequestedAt,
        });
      }
    }

    const allMessages = [...historyMessages, ...currentMessages].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    setMessages(allMessages);
  }, [task]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmitWork() {
    if (!inputNotes.trim()) {
      alert("Please enter submission notes");
      return;
    }

    setLoading(true);
    const res = await submitWork(task._id, inputNotes);
    setLoading(false);

    if (res.success) {
      setInputNotes("");
      onUpdate();
    } else {
      alert(res.error || "Failed to submit work");
    }
  }

  async function handleRequestRevision() {
    if (!inputNotes.trim()) {
      alert("Please enter revision notes");
      return;
    }

    setLoading(true);
    const res = await reviseTask(task._id, inputNotes);
    setLoading(false);

    if (res.success) {
      setInputNotes("");
      onUpdate();
    } else {
      alert(res.error || "Failed to request revision");
    }
  }

  async function handleApprove() {
    if (!confirm("Approve this task?")) return;

    setLoading(true);
    const res = await approveTask(task._id);
    setLoading(false);

    if (res.success) {
      onUpdate();
    } else {
      alert(res.error || "Failed to approve task");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task.title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">No messages yet</div>
          ) : (
            messages.map((msg, idx) => {
              const isRevision = msg.type === "revision";
              const isSubmission = msg.type === "submission";

              return (
                <div
                  key={idx}
                  className={`chat-bubble ${isRevision ? "chat-bubble-left" : "chat-bubble-right"}`}
                  style={{
                    backgroundColor: isRevision ? "#f0f0f0" : "#007bff",
                    color: isRevision ? "#333" : "white",
                    borderLeft: isRevision ? "4px solid #fd7e14" : "none",
                    alignSelf: isRevision ? "flex-start" : "flex-end",
                    maxWidth: "70%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div className="chat-message-text">{msg.notes}</div>
                  <div
                    className="chat-message-date"
                    style={{
                      fontSize: "0.75rem",
                      opacity: 0.7,
                      marginTop: "4px",
                    }}
                  >
                    {new Date(msg.date).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          {task.status === "submitted" && isManager && (
            <div className="chat-actions" style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>
              {canRevise && (
                <button
                  onClick={handleRequestRevision}
                  disabled={loading || !inputNotes.trim()}
                  className="btn-sm"
                  style={{ backgroundColor: "#ffc107", color: "black" }}
                >
                  Request Revision
                </button>
              )}
              {canApprove && (
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="btn-sm"
                  style={{ backgroundColor: "#28a745", color: "white" }}
                >
                  Approve Task
                </button>
              )}
            </div>
          )}

          {((isEmployee && ["assigned", "in-progress", "revisions"].includes(task.status)) ||
            (isManager && task.status === "submitted" && canRevise)) && (
            <div className="chat-input-wrapper">
              <textarea
                value={inputNotes}
                onChange={(e) => setInputNotes(e.target.value)}
                placeholder={
                  isEmployee
                    ? "Enter submission notes..."
                    : "Enter revision notes..."
                }
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  resize: "vertical",
                }}
              />
              {isEmployee && (
                <button
                  onClick={handleSubmitWork}
                  disabled={loading || !inputNotes.trim()}
                  className="btn-sm"
                  style={{
                    marginTop: "8px",
                    backgroundColor: "#007bff",
                    color: "white",
                  }}
                >
                  {loading ? "Submitting..." : "Submit Work"}
                </button>
              )}
            </div>
          )}

          {task.status === "approved" && (
            <div style={{ padding: "12px", backgroundColor: "#d4edda", borderRadius: "4px", color: "#155724" }}>
              ✓ Task has been approved
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

