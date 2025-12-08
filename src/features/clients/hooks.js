// src/features/clients/hooks.js
import { useEffect, useState } from "react";
import { getClients } from "./api";

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState(null);

  async function loadClients() {
    setLoadingClients(true);
    try {
      const res = await getClients();
      const data = res?.data ?? res;

      if (Array.isArray(data)) setClients(data);
      else if (Array.isArray(data?.clients)) setClients(data.clients);
      else setClients([]);
      
      setError(null);
    } catch (err) {
      console.error("Failed to load clients:", err);
      setError(err);
      setClients([]);
    }
    setLoadingClients(false);
  }

  // Reload method for TaskList
  async function reloadClients() {
    await loadClients();
  }

  useEffect(() => {
    loadClients();
  }, []);

  return { clients, loadingClients, error, reloadClients };
}
