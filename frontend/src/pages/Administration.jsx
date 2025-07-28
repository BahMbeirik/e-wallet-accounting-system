import React, { useState } from 'react';
import UserManagement from '../components/admin/UserManagement';
import GroupManagement from '../components/admin/GroupManagement';
import UserPermissionManager from '../components/admin/UserPermissionManager';
import ProtectedRoute from '../components/ProtectedRoute';

const Administration = () => {
  const [modeP, setModeP] = useState('users');

  const handleModeChange = (mode) => {
        setModeP(mode);
  };

  return (
    <div className="w-full md:w-full md:p-2.5 font-sans">
      <div className="flex justify-between p-1 bg-gray-100 rounded-xl shadow-sm md:w-full mb-3 md:sticky md:top-0 md:z-30 ">
          <button className={`w-4/5 font-semibold mr-1 p-2 rounded-xl ${
            modeP === 'users' 
              ? 'bg-white text-indigo-500 ' 
              : 'bg-gray-100 text-gray-700 '
          }`}
              onClick={() => handleModeChange('users')}
          >
            <h3 >Gestion des utilisateurs</h3>
          </button>
          <button className={`w-4/5 font-semibold ml-1 p-2 rounded-xl ${
            modeP === 'group' 
              ? 'bg-white text-indigo-500' 
              : 'bg-gray-100 text-gray-700 '
          }`} 
              onClick={() => handleModeChange('group')}
          >
            <h3 >Gestion des groupes</h3>
          </button>
          <button className={`w-4/5 font-semibold ml-1 p-2 rounded-xl ${
            modeP === 'permission' 
              ? 'bg-white text-indigo-500' 
              : 'bg-gray-100 text-gray-700 '
          }`} 
              onClick={() => handleModeChange('permission')}
          >
            <h3 >Gestion des permissions</h3>
          </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden"
                        style={{ display: modeP === 'users' ? 'block' : 'none' }}
        >
        <ProtectedRoute requiredPermissions={['auth.change_user']}>
          <UserManagement />
        </ProtectedRoute>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden"
                        style={{ display: modeP === 'group' ? 'block' : 'none' }}
        >
          <ProtectedRoute requiredPermissions={['auth.change_group']}>
            <GroupManagement />
          </ProtectedRoute>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden"
                        style={{ display: modeP === 'permission' ? 'block' : 'none' }}
        >
        <ProtectedRoute requiredPermissions={['auth.change_user']}>
          <UserPermissionManager />
        </ProtectedRoute>
      </div>

    </div>
  )
}
export default Administration;