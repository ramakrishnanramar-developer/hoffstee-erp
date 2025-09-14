import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import {
  getModules,
  createModule,
  getModuleById,
  updateModule,
  deleteModule
} from '../services/authService';
import 'react-toastify/dist/ReactToastify.css';
import './ModulesPage.css';

Modal.setAppElement('#root');

const ModulesPage = () => {
  const [modules, setModules] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    moduleName: '',
    moduleCode: '',
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
    loadModules();
  }, [editingId, isModalOpen]);

  const loadModules = async () => {
    try {
      const data = await getModules();
      const list = Array.isArray(data) ? data : data?.output || [];
      setModules(list);
      console.log("The Modules Data:", list);
    } catch (err) {
      toast.error('Failed to load modules');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.moduleName.trim() || !formData.moduleCode.trim()) {
      toast.error('Module Name and Code are required');
      return;
    }

    const cleanData = {
      id: formData.id, // include ID for update
      moduleName: formData.moduleName.trim(),
      moduleCode: formData.moduleCode.trim(),
      status: Boolean(formData.status),
      priority: Number.isFinite(Number(formData.priority)) && Number(formData.priority) > 0
        ? parseInt(formData.priority)
        : 1
    };

    try {
      if (editingId) {
        await updateModule(editingId, cleanData);
        toast.success('Module updated successfully');
      } else {
        await createModule(cleanData);
        toast.success('Module created successfully');
      }

      setFormData({
        id: null,
        moduleName: '',
        moduleCode: '',
        status: true,
        priority: 1
      });
      setEditingId(null);
      setIsModalOpen(false);
      loadModules();
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
    const mod = await getModuleById(id);
    const data = mod.output;
    
    if (!data || !data.id) {
      toast.error('Invalid module data received');
      return;
    }

    setFormData({
      id: data.id,
      moduleName: data.moduleName || '',
      moduleCode: data.moduleCode || '',
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
      await deleteModule(id);
      toast.success('Module deleted');
      setConfirmDeleteId(null);
      loadModules();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="modules-page">
      <h2>📦 Modules Management</h2>
      <button className="create-btn mt4" onClick={() => setIsModalOpen(true)}>
        Create Module
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setFormData({
            id: null,
            moduleName: '',
            moduleCode: '',
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
            placeholder="Module Name"
            value={formData.moduleName ?? ''}
            onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
            className={formData.moduleName.trim() === '' ? 'error' : ''}
            required
          />
          <input
            type="text"
            placeholder="Module Code"
            value={formData.moduleCode ?? ''}
            onChange={(e) => setFormData({ ...formData, moduleCode: e.target.value })}
            className={formData.moduleCode.trim() === '' ? 'error' : ''}
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
            <th>Module Name</th>
            <th>Module Code</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(modules) && modules.map((mod) => (
            <tr key={mod.id}>
              <td>{mod.id}</td>
              <td>{mod.moduleName}</td>
              <td>{mod.moduleCode}</td>
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

export default ModulesPage;