// TaskChatModal.jsx — Unified chat modal with LIVE Socket.IO chat
import React, { useState, useEffect, useRef } from "react";
import {
  submitWork,
  reviseTask,
  approveTask,
} from "/src/features/tasks/pages/api";

import { socket } from "/src/services/socket";
import "../styles/TaskChatModal.css";

export default function TaskChatModal({
  task,
  currentUser,
  canApprove,
  canRevise,
  onClose,
  onUpdate,
}) {
  const [messages, setMessages] = useState([]);
  const [inputNotes, setInputNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  /* ---------------------------------------------------
     ROLE & PERMISSION LOGIC
  ---------------------------------------------------- */
  const isAssignedToMe =
    task.assignee?._id?.toString() === currentUser?._id?.toString();

  const canSubmitWork =
    isAssignedToMe &&
    ["assigned", "in-progress", "revisions"].includes(task.status);

  const isManager = canApprove || canRevise;

  /* ---------------------------------------------------
     INITIAL HISTORY (task actions)
  ---------------------------------------------------- */
  useEffect(() => {
    const historyMessages = (task.history || [])
      .filter((h) =>
        ["submit", "revise", "approve"].includes(h.action)
      )
      .map((h) => ({
        type:
          h.action === "revise"
            ? "revision"
            : h.action === "submit"
            ? "submission"
            : "approve",
        notes: h.notes,
        date: h.date,
        user: h.user,
      }));

    setMessages(
      historyMessages.sort((a, b) => new Date(a.date) - new Date(b.date))
    );
  }, [task]);

  /* ---------------------------------------------------
     SOCKET.IO — JOIN ROOM + LISTEN
  ---------------------------------------------------- */
  useEffect(() => {
    if (!task?._id || !currentUser?._id) return;

    socket.connect();

    socket.emit("join-task-room", {
      taskId: task._id,
      userId: currentUser._id,
    });

    socket.on("task-chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("task-chat-message");
      socket.emit("leave-task-room", task._id);
    };
  }, [task._id, currentUser._id]);

  /* ---------------------------------------------------
     AUTO SCROLL
  ---------------------------------------------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------------------------------------------
     SEND LIVE CHAT MESSAGE
  ---------------------------------------------------- */
  function sendChatMessage() {
    if (!inputNotes.trim()) return;

    const msg = {
      type: "chat",
      text: inputNotes,
      user: {
        _id: currentUser._id,
        name: currentUser.name || "User",
      },
      date: new Date().toISOString(),
    };

    socket.emit("task-chat-message", {
      taskId: task._id,
      message: msg,
    });

    setMessages((prev) => [...prev, msg]);
    setInputNotes("");
  }

  /* ---------------------------------------------------
     SUBMIT / REVISE / APPROVE (unchanged)
  ---------------------------------------------------- */
  async function handleSubmitWork() {
    if (!inputNotes.trim()) return alert("Enter submission notes");

    setLoading(true);
    const res = await submitWork(task._id, inputNotes);
    setLoading(false);

    if (res.success) {
      setInputNotes("");
      onUpdate();
    }
  }

  async function handleRequestRevision() {
    if (!inputNotes.trim()) return alert("Enter revision notes");

    setLoading(true);
    const res = await reviseTask(task._id, inputNotes);
    setLoading(false);

    if (res.success) {
      setInputNotes("");
      onUpdate();
    }
  }

  async function handleApprove() {
    if (!confirm("Approve this task?")) return;

    setLoading(true);
    const res = await approveTask(task._id);
    setLoading(false);

    if (res.success) onUpdate();
  }

  /* ---------------------------------------------------
     UI
  ---------------------------------------------------- */
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content task-chat-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{task.title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* ---------------- MESSAGES ---------------- */}
        <div className="chat-messages">
          {messages.map((msg, idx) => {
           const isMine =
            msg.user &&
            (
              msg.user._id?.toString() === currentUser._id?.toString() ||
              msg.user?.toString?.() === currentUser._id?.toString()
            );
            const isRevision = msg.type === "revision";

            return (
              <div
                key={idx}
                className={`chat-bubble ${
                  isMine ? "right" : "left"
                }`}
                style={{
                  background:
                    msg.type === "chat"
                      ? isMine
                        ? "#007bffff"
                        : "#fbfbfbff"
                      : isRevision
                      ? "#fff3cd"
                      : "#d1ecf1",
                  color: isMine ? "#000000ff" : "#333",
                }}
              >
                <div className="chat-text">
                  {msg.text || msg.notes}
                </div>
                <div className="chat-time">
                  {msg.user?.name} ·{" "}
                  {new Date(msg.date).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* ---------------- CHAT INPUT ---------------- */}
        <div className="chat-input-area">
          <textarea
          className="text-area"
            value={inputNotes}
            onChange={(e) => setInputNotes(e.target.value)}
            placeholder="Type a message…"
            rows={2}
          />

          <div className="chat-actions">
            <button onClick={sendChatMessage} className="send-btn">
              Send
            </button>

            {canSubmitWork && (
              <button onClick={handleSubmitWork} className="send-btn primary">
                Submit Work
              </button>
            )}

            {task.status === "submitted" && isManager && (
              <>
                {canRevise && (
                  <button onClick={handleRequestRevision} className="send-btn warn">
                    Request Revision
                  </button>
                )}
                {canApprove && (
                  <button onClick={handleApprove} className="send-btn success">
                    Approve
                  </button>
                )}
              </>
            )}
          </div>

          {task.status === "approved" && (
            <div className="chat-approved">✓ Task Approved</div>
          )}
        </div>
      </div>
    </div>
  );
}
