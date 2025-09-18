import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import {
    getRoles,
    createRole,
    getRoleById,
    updateRole,
    deleteRole,
    getPermissionsByPage, // 👈 Added
} from "../services/authService";
import STRINGS from "../constants/strings"; // 👈 Added for page constants
import "react-toastify/dist/ReactToastify.css";
import "./SubModulesPage.css";

Modal.setAppElement("#root");

const RolesPage = () => {
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        name: "",
        description: "",
        isActive: true,
    });
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // 🔑 Permissions
    const [permissions, setPermissions] = useState({
        isAdd: false,
        isEdit: false,
        isView: false,
        isDelete: false,
        isPrint: false,
        isDownload: false,
    });

    useEffect(() => {
        loadPermissions();
        loadRoles();
    }, []);

    const loadPermissions = async () => {
        try {
            const data = await getPermissionsByPage(STRINGS.PAGES.Roles);
            setPermissions(data.output || {});
        } catch {
            toast.error("Failed to load permissions");
        }
    };

    const loadRoles = async () => {
        try {
            let data = await getRoles();
            let list = Array.isArray(data) ? data : data?.output || [];
            setRoles(list);
        } catch (err) {
            toast.error("Failed to load roles");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Role name is required");
            return;
        }

        const cleanData = {
            id: formData.id,
            name: formData.name.trim(),
            description: formData.description.trim(),
            isActive: Boolean(formData.isActive),
        };

        try {
            if (editingId) {
                if (!permissions.isEdit) {
                    toast.error("You don't have permission to edit roles");
                    return;
                }
                await updateRole(editingId, cleanData);
                toast.success("Role updated successfully");
            } else {
                if (!permissions.isAdd) {
                    toast.error("You don't have permission to create roles");
                    return;
                }
                await createRole(cleanData);
                toast.success("Role created successfully");
            }

            resetForm();
            loadRoles();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = async (id) => {
        if (!permissions.isEdit) {
            toast.error("You don't have permission to edit roles");
            return;
        }
        try {
            const res = await getRoleById(id);
            const data = res.output;

            if (!data || !data.id) {
                toast.error("Invalid role data received");
                return;
            }

            setFormData({
                id: data.id,
                name: data.name || "",
                description: data.description || "",
                isActive: data.isActive ?? true,
            });

            setEditingId(data.id);
            setIsModalOpen(true);
        } catch (err) {
            toast.error("Failed to load role details");
        }
    };

    const handleDeleteRequest = (id) => setConfirmDeleteId(id);

    const handleDelete = async (id) => {
        if (!permissions.isDelete) {
            toast.error("You don't have permission to delete roles");
            return;
        }
        try {
            await deleteRole(id);
            toast.success("Role deleted");
            setConfirmDeleteId(null);
            loadRoles();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            name: "",
            description: "",
            isActive: true,
        });
        setEditingId(null);
        setIsModalOpen(false);
    };

    return (
        <div className="modules-page">
            <h2>👤 Roles Management</h2>

            {/* Create button only if isAdd = true */}
            {permissions.isAdd && (
                <button className="create-btn mt4" onClick={() => setIsModalOpen(true)}>
                    Create Role
                </button>
            )}

            <Modal isOpen={isModalOpen} onRequestClose={resetForm} className="edit-modal">
                <h3>{editingId ? "Edit Role" : "Create Role"}</h3>
                <form onSubmit={handleSubmit} className="module-form">
                    {editingId && (
                        <input
                            type="text"
                            value={formData.id ?? ""}
                            disabled
                            className="form-control"
                            style={{ backgroundColor: "#eee", marginBottom: "10px" }}
                        />
                    )}
                    <input
                        type="text"
                        placeholder="Role Name"
                        value={formData.name ?? ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={formData.description ?? ""}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                    />
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={formData.isActive ?? true}
                            onChange={(e) =>
                                setFormData({ ...formData, isActive: e.target.checked })
                            }
                        />
                        <span className="slider"></span>
                    </label>
                    <button type="submit">
                        {editingId ? "Update" : "Create"} Role
                    </button>
                </form>
            </Modal>

            {/* Table only if isView = true */}
            {permissions.isView && (
                <table className="module-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Role Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            {(permissions.isEdit || permissions.isDelete) && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(roles) &&
                            roles.map((role) => (
                                <tr key={role.id}>
                                    <td>{role.id}</td>
                                    <td>{role.name}</td>
                                    <td>{role.description}</td>
                                    <td>{role.isActive ? "Active" : "Inactive"}</td>
                                    <td>
                                        {permissions.isEdit && (
                                            <button
                                                className="action-btn edit"
                                                onClick={() => handleEdit(role.id)}
                                            >
                                                ✏️ Edit
                                            </button>
                                        )}
                                        {permissions.isDelete && (
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDeleteRequest(role.id)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            )}

            {confirmDeleteId !== null && (
                <div className="confirm-modal">
                    <div className="confirm-box">
                        <h4>Are you sure you want to delete this role?</h4>
                        <div className="confirm-actions">
                            <button
                                className="confirm-btn delete"
                                onClick={() => handleDelete(confirmDeleteId)}
                            >
                                Yes, Delete
                            </button>
                            <button
                                className="confirm-btn cancel"
                                onClick={() => setConfirmDeleteId(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesPage;
