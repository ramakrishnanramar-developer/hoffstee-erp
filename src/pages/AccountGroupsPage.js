import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import {
  getAccountGroups,
  createAccountGroup,
  getAccountGroupById,
  updateAccountGroup,
  deleteAccountGroup,
} from "../services/authService"; // 👈 implement similar to authService
import "react-toastify/dist/ReactToastify.css";
import './company.css';

Modal.setAppElement("#root");

const AccountGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    alias: "",
    parentGroupID: null,
    natureOfGroup: "",
    netEffect: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      let data = await getAccountGroups();
      let list = Array.isArray(data) ? data : data?.output || [];
      setGroups(list);
    } catch (err) {
      toast.error("Failed to load account groups");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (!formData.natureOfGroup) {
      toast.error("Please select natureOfGroup of Group");
      return;
    }
    if (!formData.netEffect) {
      toast.error("Please select Net Effect");
      return;
    }

    const cleanData = {
      id: formData.id,
      name: formData.name.trim(),
      alias: formData.alias?.trim() || "",
      natureOfGroup: formData.natureOfGroup,
      netEffect: formData.netEffect,
      isActive: Boolean(formData.isActive),
      parentGroupID: formData.parentGroupID || null
    };

    try {
      if (editingId) {
        await updateAccountGroup(editingId, cleanData);
        toast.success("Account group updated successfully");
      } else {
        await createAccountGroup(cleanData);
        toast.success("Account group created successfully");
      }

      resetForm();
      loadGroups();
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      toast.error("Save failed");
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await getAccountGroupById(id);
      const data = res.output;

      if (!data || !data.id) {
        toast.error("Invalid group data received");
        return;
      }

      setFormData({
        id: data.id,
        name: data.name || "",
        alias: data.alias || "",
        parentGroupID: data.parentGroupID ?? null,
        natureOfGroup: data.natureOfGroup || "",
        netEffect: data.netEffect || "",
        isActive: data.isActive ?? true,
      });

      setEditingId(data.id);
      setIsModalOpen(true);
    } catch (err) {
      toast.error("Failed to load group details");
      console.error("Group fetch failed:", err);
    }
  };

  const handleDeleteRequest = (id) => {
    setConfirmDeleteId(id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAccountGroup(id);
      toast.success("Account group deleted");
      setConfirmDeleteId(null);
      loadGroups();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      alias: "",
      parentGroupID: null,
      natureOfGroup: "",
      netEffect: "",
      isActive: true,
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  return (
    <div className="modules-page">
      <h2>📂 Account Groups Management</h2>
      <button className="create-btn mt4" onClick={() => setIsModalOpen(true)}>
        Create Account Group
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={resetForm}
        className="edit-modal"
      >
        <h3>{editingId ? "Edit Group" : "Create Group"}</h3>
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
            placeholder="Group Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Alias (optional)"
            value={formData.alias}
            onChange={(e) =>
              setFormData({ ...formData, alias: e.target.value })
            }
          />

          {/* Parent Group Dropdown */}
          <div className="form-row">
            <div className="form-column">
              <select
                value={formData.parentGroupID || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parentGroupID: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              >
                <option value="">-- Select Parent Group --</option>
                {groups.map((grp) => (
                  <option key={grp.id} value={grp.id}>
                    {grp.name}
                  </option>
                ))}
              </select>

            </div>
          </div>
          <div className="form-row">
            <div className="form-column">
              {/* natureOfGroup Dropdown */}
              <select
                value={formData.natureOfGroup}
                onChange={(e) => setFormData({ ...formData, natureOfGroup: e.target.value })}
                required
              >
                <option value="">-- Select natureOfGroup --</option>
                <option value="Asset">Asset</option>
                <option value="Liability">Liability</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div></div>
          <div className="form-row">
            <div className="form-column">
              {/* Net Effect Dropdown */}
              <select
                value={formData.netEffect}
                onChange={(e) =>
                  setFormData({ ...formData, netEffect: e.target.value })
                }
                required
              >
                <option value="">-- Select Net Effect --</option>
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
              </select>
            </div></div>
          {/* Status Switch */}
          <label className="switch">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
            <span className="slider"></span>
          </label>

          <button type="submit">
            {editingId ? "Update" : "Create"} Group
          </button>
        </form>
      </Modal>

      <table className="module-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Group Name</th>
            <th>Alias</th>
            <th>Parent Group</th>
            <th>natureOfGroup</th>
            <th>Net Effect</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id}>
              <td>{group.id}</td>
              <td>{group.name}</td>
              <td>{group.alias}</td>
              <td>{group.parentGroup}</td>
              <td>{group.natureOfGroup}</td>
              <td>{group.netEffect}</td>
              <td>{group.isActive ? "Active" : "Inactive"}</td>
              <td>
                <button
                  className="action-btn edit"
                  onClick={() => handleEdit(group.id)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDeleteRequest(group.id)}
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
            <h4>Are you sure you want to delete this group?</h4>
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

export default AccountGroupsPage;
