import api from '../api'; 

export const getGroups = () => api.get('/groups/');
export const getPermissions = () => api.get('/permissions/');
export const getUsers = () => api.get('/users/');

export const updateUserGroups = (userId, groups) => 
  api.patch(`/users/${userId}/`, { groups });

export const updateUserRole = async (userId, isStaff) => {
  const response = await api.patch(`/users/${userId}/`, {
    is_staff: isStaff
  });
  return response.data;
};

export const updateUserStatus = async (userId, isActive) => {
  const response = await api.patch(`/users/${userId}/`, {
    is_active: isActive
  });
  return response.data;
};

export const createGroup = (groupData) => 
  api.post('/groups/', groupData); 

export const verifyToken = () => api.get('/auth/verify/');

// تحديث صلاحيات مستخدم
export const updateUserPermissions = (userId, permissionIds) =>
  api.patch(`/users/${userId}/`, { user_permissions: permissionIds });

// تحديث صلاحيات مجموعة
export const updateGroupPermissions = (groupId, permissionIds) =>
  api.patch(`/groups/${groupId}/`, { permissions: permissionIds });

export const deleteGroup = (groupId) => 
  api.delete(`/groups/${groupId}/`);

export const updateGroup = (groupId, groupData) => 
  api.patch(`/groups/${groupId}/`, groupData);
