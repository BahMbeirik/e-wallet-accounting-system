import React, { useEffect, useState } from 'react';
import { getUsers, getPermissions, updateUserPermissions } from '../../api/auth';
import { User,  CheckCircle, AlertCircle, Users, Settings } from 'lucide-react';


const UserPermissionManager = () => {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [usersRes, permissionsRes] = await Promise.all([
          getUsers(),
          getPermissions()
        ]);
        
        setUsers(usersRes.data);
        setPermissions(permissionsRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePermissionChange = async (permId, checked) => {
    setUpdating(true);
    try {
      const newPermissions = checked
        ? [...selectedUser.user_permissions, permId]
        : selectedUser.user_permissions.filter(id => id !== permId);

      await updateUserPermissions(selectedUser.id, newPermissions);
      setSelectedUser({ ...selectedUser, user_permissions: newPermissions });
    } catch (err) {
      console.error('Failed to update permissions:', err);
      setError('فشل في تحديث الصلاحيات. يرجى المحاولة مرة أخرى.');
    }finally {
      setUpdating(false);
    }
  };

   const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-xl font-medium text-gray-700">Le chargement est en cours...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen md:w-full md:p-2.5 font-sans p-2">

        {error && (
          <div className="mb-6 bg-red-50 border-r-4 border-red-400 p-4 rounded-lg shadow-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 ml-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Users Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 sticky top-6">
              <div className="flex items-center space-x-3 space-x-reverse mb-6">
                <Users className="h-6 w-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-800">Les utilisateurs</h2>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  className="w-full px-4 py-3 pr-10 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <User className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              {/* Users List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Il n'y a pas d'utilisateurs disponibles</p>
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-4  rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                        selectedUser?.id === user.id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-50/80 hover:bg-gray-100/80 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className={`p-2 rounded-lg mr-2 ${
                          selectedUser?.id === user.id ? 'bg-white/20' : 'bg-indigo-100'
                        }`}>
                          <User className={`h-5 w-5 ${
                            selectedUser?.id === user.id ? 'text-white' : 'text-indigo-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0 ">
                          <p className="font-medium truncate">{user.username}</p>
                          <p className={`text-sm truncate ${
                            selectedUser?.id === user.id ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {user.email}
                          </p>
                          
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Permissions Panel */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="p-3 mr-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        Pouvoirs {selectedUser.username}
                      </h3>
                      <p className="text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                  {updating && (
                    <div className="flex items-center space-x-2 space-x-reverse text-indigo-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                      <span className="text-sm">La mise à jour est en cours...</span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([category, categoryPerms]) => (
                    <div className="bg-gray-50/80 rounded-xl p-5">
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        {categoryPerms.map(perm => (
                          <label
                            key={perm.id}
                            className="flex items-center p-4 bg-white/80 rounded-lg cursor-pointer hover:bg-white transition-all duration-200 transform hover:scale-[1.02] shadow-sm"
                          >
                            <div className="relative mr-1">
                              <input
                                type="checkbox"
                                checked={selectedUser.user_permissions?.includes(perm.id)}
                                onChange={(e) => handlePermissionChange(perm.id, e.target.checked)}
                                className="sr-only"
                                disabled={updating}
                              />
                              <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                                selectedUser.user_permissions?.includes(perm.id)
                                  ? 'bg-indigo-600 border-indigo-600'
                                  : 'border-gray-300 hover:border-indigo-400'
                              }`}>
                                {selectedUser.user_permissions?.includes(perm.id) && (
                                  <CheckCircle className="w-5 h-5 text-white -mt-0.5 -mr-0.5" />
                                )}
                              </div>
                            </div>
                            <span className="mr-3 text-gray-700 font-medium">{perm.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Puissances totales activées:</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {selectedUser.user_permissions?.length || 0} / {permissions.length}
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${((selectedUser.user_permissions?.length || 0) / permissions.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-12 shadow-xl border border-white/20 text-center">
                <div className="mb-6">
                  <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Sélectionnez un utilisateur</h3>
                  <p className="text-gray-500">Sélectionnez un utilisateur dans le menu latéral pour afficher et gérer ses autorisations</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
    </div>
  );
};

export default UserPermissionManager;