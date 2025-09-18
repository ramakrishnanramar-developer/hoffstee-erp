import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import {
    getUserRoleById,
    createUserRole,
    getUserRoles,
    getUsers,
    getRoles,
    deleteUserRole,
    getPermissionsByPage, // 👈 Added
} from '../services/authService';
import STRINGS from '../constants/strings'; // 👈 Added for page constants
import "react-toastify/dist/ReactToastify.css";
import './company.css';

Modal.setAppElement("#root");

const UserRolesPage = () => {
    const [userRoles, setUserRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        userId: "",
        roleIds: [],
        isActive: true,
    });
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const [permissions, setPermissions] = useState({
        isAdd: false,
        isEdit: false,
        isView: false,
        isDelete: false,
    });

    useEffect(() => {
        loadPermissions();
        loadUserRoles();
        loadUsersAndRoles();
    }, []);

    const loadPermissions = async () => {
        try {
            const data = await getPermissionsByPage(STRINGS.PAGES.User_Roles);
            setPermissions(data.output || {});
        } catch {
            toast.error("Failed to load permissions");
        }
    };

    const loadUserRoles = async () => {
        try {
            let data = await getUserRoles();
            let list = Array.isArray(data) ? data : data?.output || [];
            setUserRoles(list);
        } catch {
            toast.error("Failed to load user roles");
        }
    };

    const loadUsersAndRoles = async () => {
        try {
            let userData = await getUsers();
            let roleData = await getRoles();
            setUsers(userData?.output || []);
            setRoles(roleData?.output || []);
        } catch {
            toast.error("Failed to load users or roles");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!permissions.isAdd && !editingId) {
            toast.error("You don't have permission to create user roles");
            return;
        }

        if (!permissions.isEdit && editingId) {
            toast.error("You don't have permission to edit user roles");
            return;
        }

        if (!formData.userId) {
            toast.error("User is required");
            return;
        }
        if (!formData.roleIds.length) {
            toast.error("At least one role is required");
            return;
        }

        const cleanData = {
            userId: formData.userId,
            RoleId: formData.roleIds,
        };

        try {
            await createUserRole(cleanData);
            toast.success("User roles updated successfully");

            setFormData({ id: null, userId: "", roleIds: [], isActive: true });
            setEditingId(null);
            setIsModalOpen(false);
            loadUserRoles();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = async (id) => {
        if (!permissions.isEdit) {
            toast.error("You don't have permission to edit user roles");
            return;
        }
        try {
            const res = await getUserRoleById(id);
            const data = res.output;
            if (!data || !data.userId) {
                toast.error("Invalid user role data received");
                return;
            }
            setFormData({
                userId: data.userId || "",
                roleIds: data.roles?.map(r => r.id) || [],
                isActive: data.active ?? true,
            });

            setEditingId(data.id);
            setIsModalOpen(true);
        } catch (err) {
            toast.error("Failed to load user role details");
            console.error("Fetch failed:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!permissions.isDelete) {
            toast.error("You don't have permission to delete user roles");
            return;
        }
        try {
            await deleteUserRole(id);
            toast.success("User role deleted");
            setConfirmDeleteId(null);
            loadUserRoles();
        } catch {
            toast.error("Delete failed");
        }
    };

    const toggleRoleSelection = (roleId) => {
        setFormData((prev) => ({
            ...prev,
            roleIds: prev.roleIds.includes(roleId)
                ? prev.roleIds.filter((id) => id !== roleId)
                : [...prev.roleIds, roleId],
        }));
    };

    return (
        <div className="modules-page">
            <h2>👥 User Roles Management</h2>

            {/* Create button */}
            {permissions.isAdd && (
                <button className="create-btn mt4" onClick={() => setIsModalOpen(true)}>
                    Create User Role
                </button>
            )}

            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => {
                    setIsModalOpen(false);
                    setFormData({ id: null, userId: "", roleIds: [], isActive: true });
                    setEditingId(null);
                }}
                className="edit-modal"
            >
                <h3>{editingId ? "Edit User Role" : "Assign Roles to User"}</h3>
                <form onSubmit={handleSubmit} className="module-form">
                    {/* User Dropdown */}
                    <div className="form-row">
                        <div className="form-column">
                            <select
                                value={formData.userId}
                                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                required
                            >
                                <option value="">-- Select User --</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Role Checkboxes */}
                    <div style={{ margin: "10px 0" }}>
                        <label><strong>Roles:</strong></label>
                        {roles.map((r) => (
                            <div key={r.id} style={{ marginTop: "5px" }}>
                                <input
                                    type="checkbox"
                                    checked={formData.roleIds.includes(r.id)}
                                    onChange={() => toggleRoleSelection(r.id)}
                                />
                                <span style={{ marginLeft: "6px" }}>{r.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Status Toggle */}
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={formData.isActive ?? true}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <span className="slider"></span>
                    </label>

                    <button type="submit">{editingId ? "Update" : "Assign"} Roles</button>
                </form>
            </Modal>

            {/* Table */}
            {permissions.isView && (
                <table className="module-table">
                    <thead>
                        <tr>
                            <th>UserId</th>
                            <th>User Name</th>
                            <th>Role Name</th>
                            <th>Active</th>
                            {(permissions.isEdit || permissions.isDelete) && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(userRoles) &&
                            userRoles.map((ur) => (
                                <tr key={ur.userId}>
                                    <td>{ur.userId}</td>
                                    <td>{ur.name}</td>
                                    <td>{ur.roles?.map(r => r.name).join(", ")}</td>
                                    <td>{ur.active ? "Active" : "Inactive"}</td>
                                    {(permissions.isEdit || permissions.isDelete) && (
                                        <td>
                                            {permissions.isEdit && (
                                                <button className="action-btn edit" onClick={() => handleEdit(ur.userId)}>
                                                    ✏️ Edit
                                                </button>
                                            )}
                                            {permissions.isDelete && (
                                                <button className="action-btn delete" onClick={() => setConfirmDeleteId(ur.userId)}>
                                                    🗑️ Delete
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                    </tbody>
                </table>
            )}

            {confirmDeleteId !== null && (
                <div className="confirm-modal">
                    <div className="confirm-box">
                        <h4>Are you sure you want to delete this user role?</h4>
                        <div className="confirm-actions">
                            <button className="confirm-btn delete" onClick={() => handleDelete(confirmDeleteId)}>
                                Yes, Delete
                            </button>
                            <button className="confirm-btn cancel" onClick={() => setConfirmDeleteId(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserRolesPage;
