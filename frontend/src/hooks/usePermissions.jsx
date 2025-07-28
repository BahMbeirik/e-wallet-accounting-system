import { useState, useEffect, useContext, createContext } from 'react';

// Create Permission Context
const PermissionContext = createContext();

// Permission Provider Component
export const PermissionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/me/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setPermissions(userData.permissions || []);
        setGroups(userData.groups || []);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList) => {
    return permissionList.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (permissionList) => {
    return permissionList.every(permission => permissions.includes(permission));
  };

  const hasGroup = (groupName) => {
    return groups.some(group => group.name === groupName);
  };

  const hasAnyGroup = (groupList) => {
    return groupList.some(groupName => 
      groups.some(group => group.name === groupName)
    );
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  const value = {
    user,
    permissions,
    groups,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasGroup,
    hasAnyGroup,
    isAuthenticated,
    refreshUserData: fetchUserData
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

// Custom hook to use permissions
export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

// HOC for conditional rendering based on permissions
export const withPermission = (Component, requiredPermissions = [], requiredGroups = []) => {
  return function PermissionWrappedComponent(props) {
    const { hasAllPermissions, hasAnyGroup } = usePermissions();
    
    const hasRequiredPermissions = requiredPermissions.length === 0 || 
      hasAllPermissions(requiredPermissions);
    
    const hasRequiredGroups = requiredGroups.length === 0 || 
      hasAnyGroup(requiredGroups);

    if (hasRequiredPermissions && hasRequiredGroups) {
      return <Component {...props} />;
    }

    return null; // or return a "no permission" component
  };
};

// Component for conditional rendering
export const PermissionGate = ({ 
  children, 
  permissions = [], 
  groups = [], 
  fallback = null,
  requireAll = true 
}) => {
  const { hasAllPermissions, hasAnyPermission, hasAnyGroup } = usePermissions();
  
  let hasRequiredPermissions = true;
  if (permissions.length > 0) {
    hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }
  
  const hasRequiredGroups = groups.length === 0 || hasAnyGroup(groups);
  
  if (hasRequiredPermissions && hasRequiredGroups) {
    return children;
  }
  
  return fallback;
};