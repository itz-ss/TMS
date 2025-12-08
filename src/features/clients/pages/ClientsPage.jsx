// src/features/clients/pages/ClientsPage.jsx
import React, { useState } from "react";
import { useClients } from "../hooks";
import { createClient, deleteClient } from "../api";

export default function ClientsPage() {
  const { clients, loadingClients } = useClients();
  const [name, setName] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Enter client name");

    await createClient({ name });
    setName("");
    window.location.reload();
  }

  return (
    <div className="page">
      <h2>Clients</h2>

      <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <input
          placeholder="Client name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn-primary">Add</button>
      </form>

      {loadingClients ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {clients.map((c) => (
            <li key={c._id}>
              {c.name}
              <button
                style={{ marginLeft: 10 }}
                onClick={() => deleteClient(c._id).then(() => location.reload())}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
