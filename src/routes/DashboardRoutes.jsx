import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import ProfilePage from "../features/users/pages/ProfilePage";

export default function DashboardRoutes() {
  return [
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute roles={["admin", "manager", "intern"]}>
          <DashboardPage />
        </ProtectedRoute>
      )
    },
    {
      path: "/dashboard/profile",
      element: (
        <ProtectedRoute roles={["admin", "manager", "intern"]}>
          <ProfilePage />
        </ProtectedRoute>
      )
    }
  ];
}
