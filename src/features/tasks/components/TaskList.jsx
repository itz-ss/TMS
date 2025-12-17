// src/features/tasks/TaskList.jsx
import React, { useEffect, useState, useMemo } from "react";
// import "../styles/tasks.css";

import {
  getTasks,
  createTask,
  deleteTask,
  assignTask,
} from "../api";

import TaskChatModal from "./TaskChatModal";
import { useAppDispatch, useAppSelector } from "/src/store/hooks";
import { setTasks } from "/src/store/taskSlice";
import http from "/src/services/httpClient";

import { useClients } from "/src/features/clients/hooks";
import { createClient } from "/src/features/clients/api";
import ClientTabs from "/src/features/clients/components/ClientTabs";

import { useNavigate, useLocation } from "react-router-dom";
import CalendarLegend from "/src/features/calendar/components/CalendarLegend";


import {
  selectCanCreateTask,
  selectCanAssignTask,
  selectCanApproveTask,
  selectCanDeleteTask,
  selectCanReviseTask,
  selectCanViewAllTasks,
} from "/src/store/authSlice";

export default function TaskList({ date, employeeId,  onEmployeeChange,}) {
  const dispatch = useAppDispatch();
  
  const [tasks, setTasksLocal] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(false);
  // create-task form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    client: "",
  });


  // create-client modal
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", description: "", contact: "" });

  // modal & selection
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedClient, setSelectedClient] = useState("");

  // clients hook
  const { clients = [], loadingClients, reloadClients } = useClients();

  // counts (will store number of ASSIGNED tasks per client)
  const [taskCounts, setTaskCounts] = useState({});

  // description expand state (set of task ids)
  const [expanded, setExpanded] = useState(new Set());

  // permissions and user
  const currentUser = useAppSelector((s) => s.auth.user);
  const canCreate = useAppSelector(selectCanCreateTask);
  const canAssign = useAppSelector(selectCanAssignTask);
  const canApprove = useAppSelector(selectCanApproveTask);
  const canDelete = useAppSelector(selectCanDeleteTask);
  const canRevise = useAppSelector(selectCanReviseTask);
  const canViewAll = useAppSelector(selectCanViewAllTasks);


  const activeEmployeeId = selectedEmployee || (currentUser?.role === "employee" ? currentUser._id : null);


  const navigate = useNavigate();

  const location = useLocation();
  // calendar view = coming from calendar page
  const isCalendarView = location.pathname.includes("/calendar");




  // fetch tasks whenever selectedClient changes
 useEffect(() => {
  loadTasks();
}, [selectedClient, date, selectedEmployee]);

useEffect(() =>{
  loadUsers();
},[]);


  // ---------- LOAD TASKS ----------
  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
     const params = {};

    if (selectedClient) {
      params.clientId = selectedClient;
    }

    // ✅ ADD THIS
    if (date) {
      params.date = date;
    }

    if (activeEmployeeId) {
      params.employeeId = activeEmployeeId;
    }

      // load page tasks (filtered if selectedClient)
      const res = await getTasks(params);
      const data = res?.data ?? res;
      const tasksArr = Array.isArray(data?.tasks) ? data.tasks : Array.isArray(data) ? data : [];

      setTasksLocal(tasksArr);
      dispatch(setTasks(tasksArr));

      // load all tasks (no filter) to compute accurate assigned counts per client
      const allRes = await getTasks({ status: "assigned" });
      const allData = allRes?.data ?? allRes;
      const assignedTasks = Array.isArray(allData?.tasks)
        ? allData.tasks
        : Array.isArray(allData)
        ? allData
        : [];

      const counts = {};
      assignedTasks.forEach((t) => {
        const clientId = t.client?._id || t.client;
        if (!clientId) return;
        counts[clientId] = (counts[clientId] || 0) + 1;
      });

      setTaskCounts(counts);

    } catch (err) {
      console.error("loadTasks error:", err);
      setError(err?.response?.data?.error || err?.message || "Failed to load tasks");
      setTasksLocal([]);
      setTaskCounts({});
    } finally {
      setLoading(false);
    }
  }

  // ---------- LOAD USERS ----------
  async function loadUsers() {
    try {
      const res = await http.get("/users");
      const data = res.data;
      if (Array.isArray(data)) setUsers(data);
      else if (Array.isArray(data?.users)) setUsers(data.users);
      else setUsers([]);
    } catch (err) {
      // 403 for non-admins is expected in some setups — handle gracefully
      console.warn("Failed to load users (maybe unauthorized):", err?.response?.status);
      setUsers([]);
    }
  }

  // ---------- CREATE TASK ----------
  async function handleCreate(e) {
    e.preventDefault();
    try {
      const body = { ...form };
      const res = await createTask(body);
      const data = res?.data ?? res;
      if (data?.success) {
        setForm({ title: "", description: "", dueDate: "", client: "" });
        setShowForm(false);
        await loadTasks();
      } else {
        alert(data?.error || "Failed to create task");
      }
    } catch (err) {
      console.error("create task error:", err);
      alert(err?.response?.data?.error || err?.message || "Failed to create task");
    }
  }

  // ---------- CREATE CLIENT ----------
  async function handleCreateClient(e) {
    e.preventDefault();
    try {
      const res = await createClient(newClient);
      const data = res?.data ?? res;
      // data may be { success: true, client: {...} } or the client object itself
      const createdClient = data?.client ?? (data?._id ? data : null);

      if (data?.success || createdClient) {
        setNewClient({ name: "", description: "", contact: "" });
        setShowClientModal(false);
        await reloadClients();
        const id = createdClient?._id ?? data?._id;
        if (id) {
          setForm((p) => ({ ...p, client: id }));
          setSelectedClient(id);
        }
      } else {
        alert(data?.error || "Failed to create client");
      }
    } catch (err) {
      console.error("create client error:", err);
      alert(err?.response?.data?.error || err?.message || "Failed to create client");
    }
  }

  // ---------- DELETE TASK ----------
  async function handleDelete(id) {
    if (!canDelete) return alert("No permission to delete.");
    if (!confirm("Delete task?")) return;
    try {
      const res = await deleteTask(id);
      const data = res?.data ?? res;
      if (data?.success) loadTasks();
      else alert(data?.error || "Failed to delete task");
    } catch (err) {
      console.error("delete error:", err);
      alert(err?.response?.data?.error || err?.message || "Failed to delete");
    }
  }

 // ---------- ASSIGN ----------
async function handleAssign(taskId, userId) {
  if (!canAssign) return alert("No permission to assign tasks.");

  try {
    const res = await assignTask(taskId, userId);   // <-- SEND STRING ONLY
    const data = res?.data ?? res;

    if (data?.success) {
      await loadTasks();
    } else {
      alert(data?.error || "Failed to assign");
    }
  } catch (err) {
    console.error("assign error:", err);
    alert(err?.response?.data?.error || err?.message || "Failed to assign");
  }
}


  // ---------- MODAL ----------
  function openTaskModal(task) {
    setSelectedTask(task);
  }
  function closeTaskModal() {
    setSelectedTask(null);
  }
  function handleModalUpdate() {
    loadTasks();
  }

  // ---------- BADGES ----------
  function getStatusBadge(status) {
    const badges = {
      pending: { text: "Pending", class: "badge-gray" },
      assigned: { text: "Assigned", class: "badge-blue" },
      "in-progress": { text: "In Progress", class: "badge-yellow" },
      submitted: { text: "Waiting Review", class: "badge-yellow" },
      revisions: { text: "Revisions", class: "badge-orange" },
      approved: { text: "Approved", class: "badge-green" },
    };
    return badges[status] || { text: status || "-", class: "badge-gray" };
  }

  // ---------- GROUPING ----------
  function groupTasks(tasksArr) {
    const myTasks = tasksArr.filter(
      (t) =>
        t.assignee?._id?.toString() ===
        (activeEmployeeId || currentUser?._id)?.toString()
    );

    const awaitingReview = tasksArr.filter((t) => t.status === "submitted" && canApprove);
    const revisionRequests = tasksArr.filter(
      (t) => t.status === "revisions" && t.assignee?._id?.toString() === currentUser?._id?.toString()
    );
    const tasksToSubmit = myTasks.filter((t) =>
      ["assigned", "in-progress", "revisions"].includes(t.status)
    );
    const completed = tasksArr.filter((t) => t.status === "approved");

    return { myTasks, awaitingReview, revisionRequests, tasksToSubmit, completed };
  }

  const { myTasks, awaitingReview, revisionRequests, tasksToSubmit, completed } = useMemo(
    () => groupTasks(tasks),
    [tasks, currentUser, canApprove]
  );


  function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}


  // ---------- HELPER: client name ----------
  function getClientName(t) {
    if (!t) return "-";
    if (typeof t === "string") {
      // client is id string: look up in clients list
      const c = clients.find((x) => x._id === t);
      return c?.name || t;
    }
    return t?.name || "-";
  }

  // ---------- DESCRIPTION TRUNCATION ----------
  const TRUNCATE = 60;
  function truncated(text) {
    if (!text) return "-";
    if (text.length <= TRUNCATE) return text;
    return text.slice(0, TRUNCATE).trim() + "…";
  }
  function toggleExpand(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function isExpanded(id) {
    return expanded.has(id);
  }

  // ---------- RENDER ----------
  return (

    <div className="tasks-page" style={{ padding: 12 }}>
      {date && (
      <button
        onClick={() => navigate("/dashboard/calendar")}
        style={{
          marginBottom: 8,
          background: "transparent",
          border: "none",
          color: "#007bff",
          cursor: "pointer",
          padding: 0,
          fontSize: 14,
        }}
      >
        ← Back to Calendar
      </button>
    )}

     <h2 style={{ marginBottom: 12 }}>
      {date
        ? `Tasks for ${new Date(date).toLocaleDateString()}`
        : "Tasks"}
    </h2>

    

      {canViewAll && users.length > 0 && (
        <div style={{ maxWidth: 260, marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: "#555" }}>
            Filter by employee
          </label>
          <select
            value={selectedEmployee || ""}
           onChange={(e) => {
              const value = e.target.value || null;
              setSelectedEmployee(value);      // local (optional)
              onEmployeeChange(value);         // 🔑 updates calendar
            }}

            style={{ width: "100%", padding: 6, marginTop: 4 }}
          >
            <option value="">All employees</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* CLIENT TABS / DROPDOWN */}
      <div style={{ marginBottom: 12 }}>
        <ClientTabs
          clients={clients || []}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          taskCounts={taskCounts}
        />
      </div>

      {/* CREATE BUTTON */}
      {canCreate && !isCalendarView && (
        <div style={{ marginBottom: 12 }}>
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Close" : "Create Task"}
          </button>
        </div>
      )}

      {/* CREATE FORM */}
      {showForm && canCreate && !isCalendarView && (
        <form onSubmit={handleCreate} className="task-form" style={{ marginBottom: 16 }}>
          <div>
            <label>Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div>
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label>Due date</label>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>

          <div>
            <label>Client</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select style={{ flex: 1 }} value={form.client || ""} onChange={(e) => setForm({ ...form, client: e.target.value })}>
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {taskCounts[c._id] ? `(${taskCounts[c._id]})` : ""}
                  </option>
                ))}
              </select>
              <button type="button" className="btn-sm" style={{ backgroundColor: "#28a745", color: "#fff" }} onClick={() => setShowClientModal(true)}>
                + Add
              </button>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      )}

      {/* CLIENT CREATE MODAL */}
      {showClientModal && !isCalendarView && (
        <div className="modal-overlay" onClick={() => setShowClientModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h3>Create Client</h3>
            <form onSubmit={handleCreateClient}>
              <div>
                <label>Name</label>
                <input required value={newClient.name} onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))} />
              </div>

              <div>
                <label>Description</label>
                <textarea value={newClient.description} onChange={(e) => setNewClient((p) => ({ ...p, description: e.target.value }))} />
              </div>

              <div>
                <label>Contact</label>
                <input value={newClient.contact} onChange={(e) => setNewClient((p) => ({ ...p, contact: e.target.value }))} />
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button className="btn-primary" type="submit">Create</button>
                <button className="btn-secondary" type="button" onClick={() => setShowClientModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading / Empty */}
      {loading && <p>Loading tasks…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && tasks.length === 0 && <p>No tasks yet.</p>}

      {/* CONTENT */}
      {!loading && tasks.length > 0 && (
        <>
          {/* REVIEW REQUESTS (cards) */}
          { !isCalendarView && !date && awaitingReview.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 8 }}>🔍 Review Requests ({awaitingReview.length})</h3>
              <div className="review-requests-grid" style={{ display: "grid", gap: 12 }}>
                {awaitingReview.map((t) => (
                  <div key={t._id} className="review-request-card" onClick={() => openTaskModal(t)} style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <strong>{t.title}</strong>
                        <div style={{ fontSize: 13, color: "#666" }}>Assigned to: {t.assignee?.name || "-"}</div>
                        <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>{t.submissionNotes}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className={getStatusBadge(t.status).class} style={{ padding: "6px 10px", borderRadius: 6 }}>{getStatusBadge(t.status).text}</div>
                        <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>{getClientName(t.client)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVISION REQUESTS */}
          {!isCalendarView && !date && revisionRequests.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 8 }}>🟠 Revision Requests ({revisionRequests.length})</h3>
              <div className="revision-requests-grid" style={{ display: "grid", gap: 12 }}>
                {revisionRequests.map((t) => (
                  <div key={t._id} className="revision-request-card" onClick={() => openTaskModal(t)} style={{ padding: 12, border: "2px solid #fd7e14", borderRadius: 8, backgroundColor: "#fff8f0", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <strong style={{ color: "#fd7e14" }}>{t.title}</strong>
                        <div style={{ fontSize: 13, color: "#666" }}>Revision requested - Please resubmit your work</div>
                        <div style={{ marginTop: 8, fontStyle: "italic" }}>{t.revisionNotes}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className={getStatusBadge(t.status).class} style={{ padding: "6px 10px", borderRadius: 6 }}>{getStatusBadge(t.status).text}</div>
                        <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>{getClientName(t.client)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MY ASSIGNED TASKS table (unified columns) */}
        { currentUser && ( <div style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 8 }}>
              📋 My Assigned Tasks ({myTasks.length})
              {tasksToSubmit.length > 0 && <span style={{ fontSize: 14, color: "#007bff", marginLeft: 8 }}>- {tasksToSubmit.length} need submission</span>}
            </h3>

            {myTasks.length === 0 ? (
              <p style={{ color: "#666" }}>No tasks assigned to you.</p>
            ) : (
              <table className="tasks-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 8 }}>Client</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Title</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Description</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Status</th>
                    {date && <th style={{ textAlign: "left", padding: 8 }}>Submitted</th>}
                    {date && <th style={{ textAlign: "left", padding: 8 }}>Revision</th>}
                    {date && <th style={{ textAlign: "left", padding: 8 }}>Approved</th>}
                    <th style={{ textAlign: "left", padding: 8 }}>Due Date</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myTasks.map((t) => {
                    const badge = getStatusBadge(t.status);
                    const canSubmitBtn = ["assigned", "in-progress", "revisions"].includes(t.status) && t.assignee?._id?.toString() === currentUser?._id?.toString();
                    const expandedFlag = isExpanded(t._id);
                    return (
                      <tr key={t._id} style={{ verticalAlign: "top", borderTop: "1px solid #eee" }}>
                        <td style={{ padding: 8, width: 160 }}>{getClientName(t.client)}</td>
                        <td style={{ padding: 8, width: 220 }}><strong>{t.title}</strong></td>

                        <td style={{ padding: 8, maxWidth: 420 }}>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleExpand(t._id)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleExpand(t._id); }}
                            style={{
                              cursor: "pointer",
                              whiteSpace: expandedFlag ? "normal" : "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "100%",
                              display: "block",
                            }}
                            title={expandedFlag ? "" : (t.description || "")}
                          >
                            {expandedFlag ? (t.description || "-") : truncated(t.description)}
                          </div>
                        </td>

                       <td style={{ padding: 8 }}>
                          <span className={badge.class} style={{ padding: "4px 8px", borderRadius: 4 }}>
                            {badge.text}
                          </span>
                        </td>

                        {date && <td style={{ padding: 8 }}>{formatDate(t.submittedAt)}</td>}
                        {date && <td style={{ padding: 8 }}>{formatDate(t.revisionRequestedAt)}</td>}
                        {date && <td style={{ padding: 8 }}>{formatDate(t.approvedAt)}</td>}

                        <td style={{ padding: 8 }}>
                          {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "-"}
                        </td>


                        <td style={{ padding: 8 }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "-"}</td>

                        <td style={{ padding: 8, display: "flex", gap: 8 }}>
                          <button onClick={() => openTaskModal(t)} className="btn-sm" style={{ backgroundColor: "#007bff", color: "white" }}>
                            View
                          </button>
                          {canSubmitBtn && (
                            <button onClick={() => openTaskModal(t)} className="btn-sm">
                              Submit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>)}

          {/* ALL TASKS (admin/manager) */}
          {!isCalendarView && canViewAll && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 8 }}>📊 All Tasks ({tasks.length})</h3>

              <table className="tasks-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 8 }}>Client</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Title</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Description</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Assignee</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Status</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Due</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => {
                    const badge = getStatusBadge(t.status);
                    return (
                      <tr key={t._id} style={{ verticalAlign: "top", borderTop: "1px solid #eee" }}>
                        <td style={{ padding: 8, width: 160 }}>{getClientName(t.client)}</td>
                        <td style={{ padding: 8, width: 220 }}><strong>{t.title}</strong></td>
                        <td style={{ padding: 8, maxWidth: 420 }}>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleExpand(t._id)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleExpand(t._id); }}
                            style={{
                              cursor: "pointer",
                              whiteSpace: isExpanded(t._id) ? "normal" : "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block",
                            }}
                            title={isExpanded(t._id) ? "" : (t.description || "")}
                          >
                            {isExpanded(t._id) ? (t.description || "-") : truncated(t.description)}
                          </div>
                        </td>
                        <td style={{ padding: 8 }}>{t.assignee?.name || "-"}</td>
                        <td style={{ padding: 8 }}><span className={badge.class} style={{ padding: "4px 8px", borderRadius: 4 }}>{badge.text}</span></td>
                        <td style={{ padding: 8 }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "-"}</td>
                        <td style={{ padding: 8, display: "flex", gap: 8 }}>
                          <button onClick={() => openTaskModal(t)} className="btn-sm">View</button>
                          {canAssign && !t.assignee && (
                            <select defaultValue="" onChange={(e) => handleAssign(t._id, e.target.value)}>
                              <option value="">Assign...</option>
                              {users.map((u) => (<option key={u._id} value={u._id}>{u.name}</option>))}
                            </select>
                          )}
                          {canDelete && <button onClick={() => handleDelete(t._id)} className="btn-sm btn-danger">Delete</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Task Chat Modal */}
      {selectedTask && (
        <TaskChatModal
          task={selectedTask}
          currentUser={currentUser}
          canApprove={canApprove}
          canRevise={canRevise}
          onClose={closeTaskModal}
          onUpdate={handleModalUpdate}
        />
      )}
    </div>
  );
}