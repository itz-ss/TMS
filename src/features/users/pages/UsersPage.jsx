import { useUsers } from "../hooks";
import UserTable from "../components/UserTable";
import "../styles/users.css";


export default function UsersPage() {
  const { users, loading, changeRole, removeUser } = useUsers();

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h2>Users</h2>
      <UserTable
        users={users}
        onRoleChange={changeRole}
        onDelete={removeUser}
      />
    </div>
  );
}
