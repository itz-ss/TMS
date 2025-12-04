import RoleSelect from "./RoleSelect";

export default function UserTable({ users, onRoleChange, onDelete }) {
  return (
    <table className="users-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th style={{ textAlign: "right" }}>Actions</th>
        </tr>
      </thead>

      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>
              <RoleSelect value={u.role} onChange={(r) => onRoleChange(u.id, r)} />
            </td>
            <td style={{ textAlign: "right" }}>
              <button onClick={() => onDelete(u.id)} className="delete-btn">
                ❌ Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
