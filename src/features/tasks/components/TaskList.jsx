// TaskList.jsx - Permission-based task UI

import React, { useEffect, useState } from "react";
import {
  fetchTasks,
  createTask,
  deleteTask,
  assignTask,
  reviseTask,
  approveTask,
} from "../pages/api";

import http from "/src/services/httpClient";

// ⭐ Correct Redux selectors
import { useAppSelector } from "/src/store/hooks";
import {
  selectCanCreateTask,
  selectCanAssignTask,
  selectCanApproveTask,
  selectCanDeleteTask,
  selectCanReviseTask,
  selectCanViewAllTasks,
} from "/src/store/authSlice";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });

  // ⭐ Current user
  const currentUser = useAppSelector((s) => s.auth.user);

  // ⭐ Permissions (FIXED)
  const canCreate = useAppSelector(selectCanCreateTask);
  const canAssign = useAppSelector(selectCanAssignTask);
  const canApprove = useAppSelector(selectCanApproveTask);
  const canDelete = useAppSelector(selectCanDeleteTask);
  const canRevise = useAppSelector(selectCanReviseTask);
  const canViewAll = useAppSelector(selectCanViewAllTasks);

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  async function loadTasks() {
    setLoading(true);
    const res = await fetchTasks();

    if (res.success) {
      setTasks(res.tasks || []);
      setError(null);
    } else {
      setTasks([]);
      setError(res.error);
    }

    setLoading(false);
  }

  async function loadUsers() {
    try {
      const res = await http.get("/users");
      const data = res.data;

      if (Array.isArray(data)) setUsers(data);
      else if (Array.isArray(data?.users)) setUsers(data.users);
      else setUsers([]);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    const res = await createTask(form);

    if (res.success) {
      setForm({ title: "", description: "", dueDate: "" });
      setShowForm(false);
      loadTasks();
    } else {
      alert(res.error || "Failed to create task");
    }
  }

  async function handleDelete(id) {
    if (!canDelete) return alert("No permission to delete.");
    if (!confirm("Delete this task?")) return;

    const res = await deleteTask(id);
    if (res.success) loadTasks();
    else alert(res.error || "Failed to delete");
  }

  async function handleAssign(id, assigneeId) {
    if (!canAssign) return alert("No permission to assign tasks.");

    const res = await assignTask(id, assigneeId);
    if (res.success) loadTasks();
    else alert(res.error || "Failed to assign");
  }

  async function handleRevise(id) {
    if (!canRevise) return alert("No permission to revise tasks.");

    const notes = prompt("Revision notes (optional)");
    if (notes === null) return;

    const res = await reviseTask(id, notes);

    if (res.success) loadTasks();
    else alert(res.error || "Failed to mark revision");
  }

  async function handleApprove(id) {
    if (!canApprove) return alert("No permission to approve.");

    const res = await approveTask(id);

    if (res.success) loadTasks();
    else alert(res.error || "Failed to approve");
  }

  async function handleSubmitWork(id) {
    const notes = prompt("Enter submission notes:");
    if (notes === null) return;

    const res = await reviseTask(id, notes);

    if (res.success) loadTasks();
    else alert(res.error || "Failed to submit work");
  }

  return (
    <div className="tasks-page">
      <h2>Tasks</h2>

      {canCreate && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="btn-primary"
          >
            {showForm ? "Close" : "Create Task"}
          </button>
        </div>
      )}

      {showForm && canCreate && (
        <form onSubmit={handleCreate} className="task-form">
          <div>
            <label>Title</label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div>
            <label>Due date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm({ ...form, dueDate: e.target.value })
              }
            />
          </div>

          <div style={{ marginTop: 8 }}>
            <button type="submit" className="btn-primary">
              Create
            </button>
          </div>
        </form>
      )}

      {loading && <p>Loading tasks…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && tasks.length === 0 && <p>No tasks yet.</p>}

      <table className="tasks-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Assignee</th>
            <th>Status</th>
            <th>Due</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((t) => {
            const isAssignedToMe =
              t.assignee?._id?.toString() === currentUser?._id?.toString();

            return (
              <tr key={t._id}>
                <td>{t.title}</td>

                <td>
                  {t.assignee ? (
                    t.assignee.name
                  ) : canAssign ? (
                    <select
                      onChange={(e) =>
                        handleAssign(t._id, e.target.value)
                      }
                      defaultValue=""
                    >
                      <option value="">Assign...</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    "-"
                  )}
                </td>

                <td>{t.status}</td>

                <td>
                  {t.dueDate
                    ? new Date(t.dueDate).toLocaleDateString()
                    : "-"}
                </td>

                <td style={{ display: "flex", gap: "6px" }}>
                  {canRevise && (
                    <button
                      onClick={() => handleRevise(t._id)}
                      className="btn-sm"
                    >
                      Revise
                    </button>
                  )}

                  {canApprove && (
                    <button
                      onClick={() => handleApprove(t._id)}
                      className="btn-sm"
                    >
                      Approve
                    </button>
                  )}

                  {!canApprove && isAssignedToMe && (
                    <button
                      onClick={() => handleSubmitWork(t._id)}
                      className="btn-sm btn-info"
                    >
                      Submit Work
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
