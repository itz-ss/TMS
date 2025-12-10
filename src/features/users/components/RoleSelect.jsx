export default function RoleSelect({ value, onChange }) {
  const roles = [
    "admin",
    "manager",
    "business executive",
    "marketer",
    "video editor",
    "Graphic designer",
    "photographer",
    "website developer",
    "intern"
  ];

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {roles.map(role => (
        <option key={role} value={role}>{role}</option>
      ))}
    </select>
  );
}



  // ⬅️ GET USER ROLE
  // const user = useAppSelector((s) => s.auth.user);
  // const role = user?.role;

  // // ⬅️ FILTER CLIENTS: admins & managers see all
  // const filteredClients =
  //   role === "admin" || role === "manager"
  //     ? clients
  //     : clients.filter((c) => (taskCounts[c._id] || 0) > 0);
