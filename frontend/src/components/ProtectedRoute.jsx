import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 

const ProtectedRoute = ({ requiredPermissions = [], children }) => {
  const { user, loading } = useAuth(); 

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!user) {
    return <Navigate to="/login" replace />; 
  }

  const userPermissions = user.permissions || [];

  const hasPermission = requiredPermissions.every(perm =>
    userPermissions.includes(perm)
  );
  

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-2xl font-bold text-red-600 mb-4">
          Access Denied
        </div>
        <div className="text-lg mb-6">
          You do not have permission to view this page.
        </div>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
