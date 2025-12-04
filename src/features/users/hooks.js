import { useEffect, useState } from "react";
import { fetchUsers, updateUserRole, deleteUser } from "./api";
import { useToast } from "../../hooks/useToast";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (id, role) => {
    try {
      await updateUserRole(id, role);
      toast.success("Role updated");
      loadUsers();
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const removeUser = async (id) => {
    try {
      await deleteUser(id);
      toast.success("User deleted");
      loadUsers();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return { users, loading, changeRole, removeUser };
}
