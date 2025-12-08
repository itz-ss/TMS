// src/permissions/permissions.js

export const permissionsMatrix = {
  admin: {
    canCreateTask: true,
    canAssignTask: true,
    canApproveTask: true,
    canReviseTask: true,
    canDeleteTask: true,
    canViewAllTasks: true,
    canUpdateAnyTask: true,
    canViewClients: true,
    canCreateClients: true,
  },

  manager: {
    canCreateTask: true,
    canAssignTask: true,
    canApproveTask: true,
    canReviseTask: true,
    canDeleteTask: true,
    canViewAllTasks: true,
    canUpdateAnyTask: true,
    canViewClients: true,
    canCreateClients: true,
  },

  // All other roles (intern, employee, viewer, unknown)
  default: {
    canCreateTask: false,
    canAssignTask: false,
    canApproveTask: false,
    canReviseTask: false,
    canDeleteTask: false,
    canViewAllTasks: false,
    canUpdateAnyTask: false,
    canViewClients: true,
    canCreateClients: false,
  },
};

export function getPermissions(role) {
  return permissionsMatrix[role] || permissionsMatrix.default;
}
