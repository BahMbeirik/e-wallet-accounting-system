/* eslint-disable no-lone-blocks */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { getUsers, updateUserGroups ,updateUserRole,updateUserStatus} from '../../api/auth';
import { Users, Mail, Shield,  Check, X, ChevronDown, Loader, Search } from 'lucide-react';

{/*
const GroupBadge = ({ group, isSelected, onToggle, disabled }) => (
  <button
    onClick={() => !disabled && onToggle(group.id)}
    disabled={disabled}
    className={`
      inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 transform
      ${isSelected 
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105 ring-2 ring-blue-200' 
        : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300 hover:scale-105'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
    `}
  >
    <Shield className="w-3 h-3 mr-1" />
    {group.name}
    {isSelected && <Check className="w-3 h-3 ml-1" />}
  </button>
);*/}

const UserRow = ({ user, onGroupChange , onRoleChange, onStatusChange }) => {
  // const [selectedGroups, setSelectedGroups] = useState(user.groups || []);
  // const [isUpdating, setIsUpdating] = useState(false);
  // const [showGroups, setShowGroups] = useState(false);
  const [isRoleUpdating, setIsRoleUpdating] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleRoleToggle = async () => {
    setIsRoleUpdating(true);
    try {
      await onRoleChange(user.id, !user.is_staff);
    } finally {
      setIsRoleUpdating(false);
    }
  };

  const handleActiveToggle = async () => {
    setIsActive(true);
    try {
      await onStatusChange(user.id, !user.is_active);
    } finally {
      setIsActive(false);
    }
  };

  {/*const handleGroupToggle = async (groupId) => {
    const newGroups = selectedGroups.includes(groupId)
      ? selectedGroups.filter(id => id !== groupId)
      : [...selectedGroups, groupId];
    
    setSelectedGroups(newGroups);
    setIsUpdating(true);
    
    try {
      await onGroupChange(user.id, newGroups);
    } finally {
      setIsUpdating(false);
    }
  }; */}

  return (
    <tr className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
              {user.username}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
          {user.email}
        </div>
      </td>
      
    {/*  <td className="px-6 py-4">
        <div className="relative">
          <button
            onClick={() => setShowGroups(!showGroups)}
            className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            <span className="text-sm text-gray-700">
              {selectedGroups.length} group{selectedGroups.length !== 1 ? 's' : ''}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showGroups ? 'rotate-180' : ''}`} />
          </button>
          
          {showGroups && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-10 p-4 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Available Groups</div>
                <div className="flex flex-wrap gap-2">
                  {user.available_groups?.map(group => (
                    <GroupBadge
                      key={group.id}
                      group={group}
                      isSelected={selectedGroups.includes(group.id)}
                      onToggle={handleGroupToggle}
                      disabled={isUpdating}
                    />
                  ))}
                </div>
                {isUpdating && (
                  <div className="flex items-center justify-center pt-2">
                    <Loader className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="ml-2 text-xs text-blue-600">Updating...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </td> */}

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRoleToggle}
            disabled={isRoleUpdating}
            className={`
              inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 transform
              ${user.is_staff 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105 ring-2 ring-blue-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300 hover:scale-105'
              }
              ${isRoleUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
            `}
          >
            {isRoleUpdating ? (
              <Loader className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Shield className="w-3 h-3 mr-1" />
            )}
            {user.is_staff ? 'Admin' : 'User'}
          </button>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleActiveToggle}
            disabled={isActive}
            className={`
              inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 transform
              ${user.is_active
                ? 'bg-gradient-to-r from-green-300 to-green-600 text-white shadow-lg scale-105 ring-2 ring-blue-200'
                : 'bg-red-100 text-gray-700 hover:bg-gradient-to-r hover:from-red-200 hover:to-red-300 hover:scale-105'
              }
              ${isActive ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
            `}
          >
            {isActive ? (
              <Loader className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Check className="w-3 h-3 mr-1" />
            )}
            {user.is_active ? 'Active' : 'Inactive'}
          </button>
        </div>
      </td>

    </tr>
  );
};

const UserCard = ({ user, onGroupChange ,onRoleChange,onStatusChange}) => {
  // const [selectedGroups, setSelectedGroups] = useState(user.groups || []);
  // const [isUpdating, setIsUpdating] = useState(false);
  // const [showGroups, setShowGroups] = useState(false);
  const [isRoleUpdating, setIsRoleUpdating] = useState(false);
  const [isActive, setIsActive] = useState(false);


  const handleRoleToggle = async () => {
    setIsRoleUpdating(true);
    try {
      await onRoleChange(user.id, !user.is_staff);
    } finally {
      setIsRoleUpdating(false);
    }
  };

  const handleActiveToggle = async () => {
    setIsActive(true);
    try {
      await onStatusChange(user.id, !user.is_active);
    } finally {
      setIsActive(false);
    }
  };

  {/* const handleGroupToggle = async (groupId) => {
    const newGroups = selectedGroups.includes(groupId)
      ? selectedGroups.filter(id => id !== groupId)
      : [...selectedGroups, groupId];
    
    setSelectedGroups(newGroups);
    setIsUpdating(true);
    
    try {
      await onGroupChange(user.id, newGroups);
    } finally {
      setIsUpdating(false);
    }
  }; */}

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* User Info */}
      <div className="flex items-start space-x-3 mb-3">
        <div clclassName="relative group">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user.username ? user.username.charAt(0).toUpperCase() : '?'}
          </div>
          <div className={`relative -top-3 -right-9 w-3 h-3 ${user.is_active ? 'bg-emerald-400' : 'bg-red-400'} rounded-full border-2 border-white`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900 truncate ">{user.username || 'Nom non défini'}</span>
            <button
              onClick={handleRoleToggle}
              disabled={isRoleUpdating}
              className={`
                px-3 py-1 rounded-lg text-xs font-semibold transition-all
                ${user.is_staff 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
                }
                ${isRoleUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
              `}
            >
              {isRoleUpdating ? (
                <Loader className="w-3 h-3 animate-spin mr-1 inline" />
              ) : null}
              {user.is_staff ? 'Admin' : 'User'}
            </button>

          </div>

          <div className="flex items-center mt-1 text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{user.email || 'Email non défini'}</span>
          </div>
        </div>
      </div>

      {/* Groups Section */}
    {/*  <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm font-medium text-gray-700">
            <Shield className="w-4 h-4 mr-1" />
            <span>Groupes ({selectedGroups.length})</span>
          </div>
          <button
            onClick={() => setShowGroups(!showGroups)}
            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showGroups ? 'rotate-180' : ''}`} />
          </button>
        </div>

        
        <div className="flex flex-wrap gap-2">
          {selectedGroups.length > 0 ? (
            user.available_groups?.filter(group => selectedGroups.includes(group.id)).map(group => (
              <span
                key={group.id}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                <Shield className="w-3 h-3 mr-1" />
                {group.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-500 italic">Aucun groupe assigné</span>
          )}
        </div>

        
        {showGroups && (
          <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Groupes disponibles
            </div>
            <div className="flex flex-wrap gap-2">
              {user.available_groups?.map(group => (
                <GroupBadge
                  key={group.id}
                  group={group}
                  isSelected={selectedGroups.includes(group.id)}
                  onToggle={handleGroupToggle}
                  disabled={isUpdating}
                />
              ))}
            </div>
            {isUpdating && (
              <div className="flex items-center justify-center pt-2">
                <Loader className="w-4 h-4 animate-spin text-blue-500" />
                <span className="ml-2 text-xs text-blue-600">Mise à jour...</span>
              </div>
            )}
          </div>
        )}
      </div> */}

      {/*Active section*/}
      <div className="flex items-center space-x-2 mt-1 justify-end">
          <button
            onClick={handleActiveToggle}
            disabled={isActive}
            className={`
              inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 transform
              ${user.is_active
                ? ' text-green-600 '
                : ' text-red-700 '
              }
              ${isActive ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
            `}
          >
            {isActive ? (
              <Loader className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Check className="w-3 h-3 mr-1" />
            )}
            {user.is_active ? 'Active' : 'Inactive'}
          </button>
        </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleGroupChange = async (userId, newGroups) => {
    try {
      await updateUserGroups(userId, newGroups);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, groups: newGroups } : user
      ));
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      console.error('Error updating groups:', error);
    }
  };

  const handleRoleChange = async (userId, isStaff) => {
    try {
      await updateUserRole(userId, isStaff);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_staff: isStaff } : user
      ));
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      console.error('Error updating role:', error);
    }
  };
  const handleStatusChange = async (userId, isActive) => {
    try {
      await updateUserStatus(userId, isActive);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: isActive } : user
      ));
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      console.error('Error updating status:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            <Loader className="w-8 h-8 text-white animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-700">Chargement des utilisateurs...</p>
          <p className="text-sm text-gray-500">Veuillez patienter pendant que nous récupérons les données</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200 max-w-md text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Oups! Quelque chose s'est mal passé</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200 font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen md:w-full md:p-2.5 font-sans p-2">
          {/* Stats Footer */}
          <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nombre Total d'Utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Résultats Filtrés</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher des utilisateurs par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
        </div>
        
            

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Utilisateur</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </div>
                  </th>
                  {/*<th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Groupes</span>
                    </div>
                  </th>*/}
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <span>Rôle</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <span>Statut</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <UserRow 
                    key={user.id} 
                    user={user} 
                    onGroupChange={handleGroupChange}
                    onRoleChange={handleRoleChange}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>

           {/* Mobile Cards */}
            <div className="md:hidden">
              <div className="p-4 space-y-4">
                {filteredUsers.map((user, index) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onGroupChange={handleGroupChange}
                    onRoleChange={handleRoleChange}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Essayez d\'ajuster vos termes de recherche' : 'Aucun utilisateur disponible à afficher'}
              </p>
            </div>
          )}
        </div>

    </div>
  );
};

export default UserManagement;