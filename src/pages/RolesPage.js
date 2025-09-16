import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import {
  getRoles,
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
} from '../services/authService';// 👈 you'll create this similar to authService
import "react-toastify/dist/ReactToastify.css";
import './SubModulesPage.css';

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

  useEffect(() => {
    if (isModalOpen) {
      console.log("Modal mode:", editingId ? "Edit" : "Create");
    }
    loadRoles();
  }, [editingId, isModalOpen]);

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
        await updateRole(editingId, cleanData);
        toast.success("Role updated successfully");
      } else {
        await createRole(cleanData);
        toast.success("Role created successfully");
      }

      setFormData({
        id: null,
        name: "",
        description: "",
        isActive: true,
      });
      setEditingId(null);
      setIsModalOpen(false);
      loadRoles();
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      toast.error("Save failed");
    }
  };

  const handleEdit = async (id) => {
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
      console.error("Role fetch failed:", err);
    }
  };

  const handleDeleteRequest = (id) => {
    setConfirmDeleteId(id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteRole(id);
      toast.success("Role deleted");
      setConfirmDeleteId(null);
      loadRoles();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="modules-page">
      <h2>👤 Roles Management</h2>
      <button className="create-btn mt4" onClick={() => setIsModalOpen(true)}>
        Create Role
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setFormData({
            id: null,
            name: "",
            description: "",
            isActive: true,
          });
          setEditingId(null);
        }}
        className="edit-modal"
      >
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
              checked={formData.isActive ?? ""}
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

      <table className="module-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Role Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
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
                  <button
                    className="action-btn edit"
                    onClick={() => handleEdit(role.id)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteRequest(role.id)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

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
