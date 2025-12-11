export default function RoleSelect({ value, onChange }) {
  const roles = [
    "admin",
    "manager",
    "business executive",
    "marketer",
    "video editor",
    "graphic designer",
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
