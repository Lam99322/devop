import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { FaUserTag, FaPlus, FaEdit, FaTrash, FaSpinner, FaKey } from "react-icons/fa";

export default function ManageRoles() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: new Set()
  });

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      console.log('📤 Loading roles...');
      
      const response = await axiosClient.get(API_ENDPOINTS.ROLES.GET_ALL);
      console.log('✅ Roles loaded:', response.data);
      
      // Extract roles from API response
      const rolesData = response.data?.data?.content || response.data?.data || response.data || [];
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      
    } catch (err) {
      console.error('❌ Failed to load roles:', err);
      setError(`Failed to load roles: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      console.log('📤 Loading permissions...');
      
      const response = await axiosClient.get(API_ENDPOINTS.PERMISSIONS.GET_ALL);
      console.log('✅ Permissions loaded:', response.data);
      
      // Extract permissions from API response
      const permissionsData = response.data?.data?.content || response.data?.data || response.data || [];
      setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
      
    } catch (err) {
      console.error('❌ Failed to load permissions:', err);
      // Don't block the UI if permissions fail to load
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Role name is required');
      return;
    }

    try {
      // Convert Set to Array for backend compatibility
      const roleRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        permissions: Array.from(formData.permissions)
      };

      console.log('📤 Submitting role request:', roleRequest);

      if (editingRole) {
        // Update existing role - use PUT method with role ID
        await axiosClient.put(`${API_ENDPOINTS.ROLES.GET_ALL}/${editingRole.id}`, roleRequest);
        console.log('✅ Role updated successfully');
        alert('✅ Role updated successfully!');
      } else {
        // Create new role
        const response = await axiosClient.post(API_ENDPOINTS.ROLES.CREATE, roleRequest);
        console.log('✅ Role created:', response.data);
        alert('✅ Role created successfully!');
      }

      // Reset form and reload data
      setShowModal(false);
      setEditingRole(null);
      setFormData({ name: '', description: '', permissions: new Set() });
      loadRoles();

    } catch (err) {
      console.error('❌ Failed to save role:', err);
      const errorMsg = err.response?.data?.message || err.message;
      alert(`❌ Failed to save role: ${errorMsg}`);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name || '',
      description: role.description || '',
      permissions: new Set(role.permissions || [])
    });
    setShowModal(true);
  };

  const handleDelete = async (role) => {
    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

    try {
      console.log(`📤 Deleting role: ${role.id}`);
      await axiosClient.delete(API_ENDPOINTS.ROLES.DELETE(role.id));
      console.log('✅ Role deleted successfully');
      alert('✅ Role deleted successfully!');
      loadRoles();
    } catch (err) {
      console.error('❌ Failed to delete role:', err);
      const errorMsg = err.response?.data?.message || err.message;
      alert(`❌ Failed to delete role: ${errorMsg}`);
    }
  };

  const handlePermissionToggle = (permission) => {
    const newPermissions = new Set(formData.permissions);
    if (newPermissions.has(permission)) {
      newPermissions.delete(permission);
    } else {
      newPermissions.add(permission);
    }
    setFormData({ ...formData, permissions: newPermissions });
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: new Set() });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserTag className="text-purple-600" />
            Manage Roles
          </h1>
          <span className="text-gray-600">({roles.length} roles)</span>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          <FaPlus />
          Create Role
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="font-semibold text-gray-800">Roles List</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin text-3xl text-purple-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading roles...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="p-8 text-center">
            <FaUserTag className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No roles found</p>
            <p className="text-gray-400 text-sm">Create your first role to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Role Name</th>
                  <th className="text-left p-4 font-medium text-gray-700">Description</th>
                  <th className="text-left p-4 font-medium text-gray-700">Permissions</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.id || role.name} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FaUserTag className="text-purple-600" />
                        <span className="font-medium text-gray-800">{role.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {role.description || <span className="italic text-gray-400">No description</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.slice(0, 3).map(permission => (
                            <span
                              key={permission}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {permission}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic text-sm">No permissions</span>
                        )}
                        {role.permissions && role.permissions.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(role)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                        >
                          <FaEdit />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(role)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter role name (e.g., ADMIN, USER)"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter role description"
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded p-2">
                  {permissions.length > 0 ? (
                    <div className="space-y-2">
                      {permissions.map(permission => (
                        <label key={permission.name || permission} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.has(permission.name || permission)}
                            onChange={() => handlePermissionToggle(permission.name || permission)}
                            className="rounded"
                          />
                          <span className="text-sm flex items-center gap-1">
                            <FaKey className="text-blue-500" />
                            {permission.name || permission}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No permissions available</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {formData.permissions.size} permission(s)
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}