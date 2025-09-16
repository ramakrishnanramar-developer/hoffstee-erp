import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import {
  getSubModules,
  createSubModule,
  getSubModuleById,
  updateSubModule,
  deleteSubModule
} from '../services/authService';
import 'react-toastify/dist/ReactToastify.css';
import './SubModulesPage.css';

Modal.setAppElement('#root');

const SubModulesPage = () => {
  const [submodules, setSubModules] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    subModuleName: '',
    subModuleCode: '',
    status: true,
    priority: 1
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (isModalOpen) {
      console.log('Modal mode:', editingId ? 'Edit' : 'Create');
    }
    loadSubModules();
  }, [editingId, isModalOpen]);

  const loadSubModules = async () => {
    try {
      const data = await getSubModules();
      const list = Array.isArray(data) ? data : data?.output || [];
      setSubModules(list);
      console.log("The Sub Modules Data:", list);
    } catch (err) {
      toast.error('Failed to load modules');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subModuleName.trim() || !formData.subModuleCode.trim()) {
      toast.error('Sub Module Name and Code are required');
      return;
    }

    const cleanData = {
      id: formData.id, // include ID for update
      subModuleName: formData.subModuleName.trim(),
      subModuleCode: formData.subModuleCode.trim(),
      status: Boolean(formData.status),
      priority: Number.isFinite(Number(formData.priority)) && Number(formData.priority) > 0
        ? parseInt(formData.priority)
        : 1
    };

    try {
      if (editingId) {
        await updateSubModule(editingId, cleanData);
        toast.success('SubModule updated successfully');
      } else {
        await createSubModule(cleanData);
        toast.success('SubModule created successfully');
      }

      setFormData({
        id: null,
        subModuleName: '',
        subModuleCode: '',
        status: true,
        priority: 1
      });
      setEditingId(null);
      setIsModalOpen(false);
      loadSubModules();
    } catch (err) {
      console.error('Save failed:', err.response?.data || err.message);
      toast.error('Save failed');
    }
  };

  // const handleEdit = (mod) => {
  //   setFormData({
  //     id: mod.id,
  //     moduleName: mod.moduleName,
  //     moduleCode: mod.moduleCode,
  //     status: mod.status,
  //     priority: mod.priority
  //   });
  //   setEditingId(mod.id);
  //   setIsModalOpen(true);
  // };

  const handleEdit = async (id) => {
  try {
    console.log('Editing module:', id);
    const mod = await getSubModuleById(id);
    const data = mod.output;
    console.log(data);
    if (!data || !data.id) {
      toast.error('Invalid module data received');
      return;
    }

    setFormData({
      id: data.id,
      subModuleName: data.subModuleName || '',
      subModuleCode: data.subModuleCode || '',
      status: data.status ?? true,
      priority: data.priority ?? 1
    });
    console.log('Editing:', data.id)

    setEditingId(data.id);
    setIsModalOpen(true);
  } catch (err) {
    toast.error('Failed to load module details');
    console.error('Module fetch failed:', err);
  }
};

  const handleDeleteRequest = (id) => {
    setConfirmDeleteId(id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteSubModule(id);
      toast.success('SubModule deleted');
      setConfirmDeleteId(null);
      loadSubModules();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="modules-page">
      <h2>📦 SubModules Management</h2>
      <button className="create-btn mt4" onClick={() => setIsModalOpen(true)}>
        Create SubModule
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setFormData({
            id: null,
            subModuleName: '',
            subModuleCode: '',
            status: true,
            priority: 1
          });
          setEditingId(null);
        }}
        className="edit-modal"
      >
      {/* {console.log('Modal mode:', editingId ? 'Edit' : 'Create')} */}

        <h3>{editingId ? 'Edit Module' : 'Create Module'}</h3>
        <form onSubmit={handleSubmit} className="module-form">
          {editingId && (
            <input
              type="text"
              value={formData.id ?? ''}
              disabled
              className="form-control"
              style={{ backgroundColor: '#eee', marginBottom: '10px' }}
            />
          )}
          <input
            type="text"
            placeholder="SubModule Name"
            value={formData.subModuleName ?? ''}
            onChange={(e) => setFormData({ ...formData, subModuleName: e.target.value })}
            className={formData.subModuleName.trim() === '' ? 'error' : ''}
            required
          />
          <input
            type="text"
            placeholder="SubModule Code"
            value={formData.subModuleCode ?? ''}
            onChange={(e) => setFormData({ ...formData, subModuleCode: e.target.value })}
            className={formData.subModuleCode.trim() === '' ? 'error' : ''}
            required
          />
          <input
            type="number"
            placeholder="Priority"
            value={formData.priority ?? ''}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            min={1}
            required
          />
          <label className="switch">
            <input
              type="checkbox"
              checked={formData.status ?? ''}
              onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
          <button type="submit">{editingId ? 'Update' : 'Create'} Module</button>
        </form>
      </Modal>

      <table className="module-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>SubModule Name</th>
            <th>SubModule Code</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(submodules) && submodules.map((mod) => (
            <tr key={mod.id}>
              <td>{mod.id}</td>
              <td>{mod.subModuleName}</td>
              <td>{mod.subModuleCode}</td>
              <td>{mod.status ? 'Active' : 'Inactive'}</td>
              <td>{mod.priority}</td>
              <td>
                <button className="action-btn edit" onClick={() => handleEdit(mod.id)}>✏️ Edit</button>
                <button className="action-btn delete" onClick={() => handleDeleteRequest(mod.id)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {confirmDeleteId !== null && (
        <div className="confirm-modal">
          <div className="confirm-box">
            <h4>Are you sure you want to delete this module?</h4>
            <div className="confirm-actions">
              <button className="confirm-btn delete" onClick={() => handleDelete(confirmDeleteId)}>Yes, Delete</button>
              <button className="confirm-btn cancel" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubModulesPage;