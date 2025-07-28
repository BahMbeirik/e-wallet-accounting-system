import React, { useEffect, useState } from 'react';
import {   getGroups,   createGroup,   updateGroup,   deleteGroup,  getPermissions,} from '../../api/auth'; 
import {   Shield,   Plus,   Edit3,   Trash2,   Save,   X,     Search,  Check, AlertCircle,    Key} from 'lucide-react';

const PermissionBadge = ({ permission, isSelected, onToggle, disabled }) => (
  <button
    onClick={() => !disabled && onToggle(permission.id)}
    disabled={disabled}
    className={`
      group relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 transform
      ${isSelected 
        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg scale-105' 
        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-102'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
    `}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1 text-left">
        <div className="flex items-center space-x-2 mb-2">
          <Key className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
          <span className={`font-semibold text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
            {permission.name}
          </span>
        </div>
        <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
          {permission.description}
        </p>
      </div>
      <div className={`
        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 bg-blue-500' 
          : 'border-gray-300 group-hover:border-blue-400'
        }
      `}>
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </div>
    </div>
  </button>
);

// Composant carte pour mobile
const GroupCard = ({ group, onEdit, onDelete }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {group.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
          <p className="text-sm text-gray-500">
            {group.permissions?.length || 0} permissions
          </p>
        </div>
      </div>
    </div>
    
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-700 mb-2">Permissions :</p>
      <div className="flex flex-wrap gap-1">
        {group.permissions_display?.length > 0 ? (
          group.permissions_display.slice(0, 2).map((perm, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {perm}
            </span>
          ))
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Aucune permission
          </span>
        )}
        {group.permissions_display?.length > 2 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            +{group.permissions_display.length - 2} de plus
          </span>
        )}
      </div>
    </div>
    
    <div className="flex space-x-2">
      <button 
        onClick={() => onEdit(group)}
        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-200 shadow-md"
      >
        <Edit3 className="w-4 h-4 mr-1" />
        Modifier
      </button>
      <button 
        onClick={() => onDelete(group.id)}
        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-all duration-200 shadow-md"
      >
        <Trash2 className="w-4 h-4 mr-1" />
        Supprimer
      </button>
    </div>
  </div>
);

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, permissionsRes] = await Promise.all([
          getGroups(),
          getPermissions()
        ]);
        setGroups(groupsRes.data);
        setPermissions(permissionsRes.data);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // إنشاء مجموعة جديدة
  const handleCreateGroup = async () => {
  if (!newGroupName.trim()) {
    setError('Le nom du groupe ne peut pas être vide');
    return;
  }
  setIsCreating(true);
  try {
    const response = await createGroup({ 
      name: newGroupName
      // لا ترسل permissions هنا
    });
    setGroups([...groups, response.data]);
    setNewGroupName('');
    setError(null);
  } catch (error) {
    handleApiError(error);
  }finally{
    setIsCreating(false);
  }
};

  // بدء التعديل على مجموعة
  const handleEditStart = (group) => {
    setEditingGroup(group);
    setSelectedPermissions(
      group.permissions.map(p => (typeof p === 'object' ? p.id : p))
    );

  };

  // حفظ التعديلات
const handleEditSave = async () => {
  try {
    const permissionIds = selectedPermissions.map(id =>
      typeof id === 'object' ? id.id : id
    );

    const response = await updateGroup(editingGroup.id, {
      name: editingGroup.name,
      permissions: permissionIds
    });

    setGroups(groups.map(g => 
      g.id === editingGroup.id ? response.data : g
    ));
    setEditingGroup(null);
  } catch (error) {
    handleApiError(error);
  }
};


  // حذف مجموعة
  const handleDelete = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    
    try {
      await deleteGroup(groupId);
      setGroups(groups.filter(g => g.id !== groupId));
    } catch (error) {
      handleApiError(error);
    }
  };

  // إدارة الصلاحيات
  const handlePermissionToggle = (permId) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    );
  };

  const handleApiError = (error) => {
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message;
    setError(errorMessage);
    console.error('API Error:', error.response?.data || error);
  };

const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            <Shield className="w-8 h-8 text-white animate-pulse absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-700">Chargement des groupes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen md:w-full md:p-2.5 font-sans p-2">
        
            

        {/* Create/Edit Group Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            {editingGroup ? 'Modifier le groupe' : 'Créer un nouveau groupe'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex-1">
              <input
                type="text"
                value={editingGroup ? editingGroup.name : newGroupName}
                onChange={(e) => 
                  editingGroup
                    ? setEditingGroup({...editingGroup, name: e.target.value})
                    : setNewGroupName(e.target.value)
                }
                placeholder="Enter group name..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            {editingGroup ? (
              <div className="flex space-x-2">
                <button 
                  onClick={handleEditSave}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-700 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </button>
                <button 
                  onClick={() => setEditingGroup(null)}
                  className="inline-flex items-center px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </button>
              </div>
            ) : (
              <button 
                onClick={handleCreateGroup}
                disabled={isCreating}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isCreating ? 'Création...' : 'Créer un groupe'}
              </button>
            )}
          </div>

          {/* Permissions Section */}
          {editingGroup && (
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <Key className="w-4 h-4 mr-2 text-purple-600" />
                Permissions du groupe
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.map(perm => (
                  <PermissionBadge
                    key={perm.id}
                    permission={perm}
                    isSelected={selectedPermissions.includes(perm.id)}
                    onToggle={handlePermissionToggle}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative flex-1 mb-3">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher des groupes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:border-transparent transition-all duration-200"
              />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Groups Table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Nom du groupe</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4" />
                      <span>Permissions</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGroups.map((group) => (
                  <tr key={group.id} className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {group.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {group.permissions?.length || 0} permissions
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {group.permissions_display?.length > 0 ? (
                          group.permissions_display.slice(0, 3).map((perm, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {perm}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Aucune permission
                          </span>
                        )}
                        {group.permissions_display?.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{group.permissions_display.length - 3} de plus
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditStart(group)}
                          className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-200 shadow-md"
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDelete(group.id)}
                          className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-200 shadow-md"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredGroups.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun groupe trouvé</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Essayez d\'ajuster vos termes de recherche' : 'Créez votre premier groupe pour commencer'}
              </p>
            </div>
          )}
        </div>

        {/* Vue mobile - Cartes */}
      <div className="block md:hidden">
        {filteredGroups.length > 0 ? (
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onEdit={handleEditStart}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun groupe trouvé</h3>
            <p className="text-gray-500 px-4">
              {searchTerm ? 'Essayez d\'ajuster vos termes de recherche' : 'Créez votre premier groupe pour commencer'}
            </p>
          </div>
        )}
      </div>

        {/* Stats Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total des groupes</p>
                <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Permissions disponibles</p>
                <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Résultats filtrés</p>
                <p className="text-2xl font-bold text-gray-900">{filteredGroups.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

    </div>
  );

};

export default GroupManagement;