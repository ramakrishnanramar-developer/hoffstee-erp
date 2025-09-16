// src/pages/Users.jsx
// UserPage.js
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import {
  getUsers,
  createUsers,
  getUsersById,
  updateUsers,
  deleteUsers,
  getCompanies,
  BASE_URL
} from '../services/authService';
import 'react-toastify/dist/ReactToastify.css';
import './company.css';

Modal.setAppElement('#root');

const initialForm = {
  id: null,
  companyId: '',
  name: '',
  email: '',
  phone: '',
  employeeCode: '',
  imagePath: '',
  isActive: true
};

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    loadCompanies();
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : data?.output || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(Array.isArray(data) ? data : data?.output || []);
    } catch {
      toast.error('Failed to load companies');
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setImageFile(null);
    if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview('');
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(file ? URL.createObjectURL(file) : formData.imagePath || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and Email are required');
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'imagePath' && key !== 'id') fd.append(key, value ?? '');
      });
      fd.append('isActive', formData.isActive ? 'true' : 'false');

      if (imageFile) fd.append('ImageFile', imageFile);
      else if (formData.imagePath) fd.append('imagePath', formData.imagePath);

      if (editingId) {
        fd.append('id', editingId);
        await updateUsers(editingId, fd);
        toast.success('User updated successfully');
      } else {
        await createUsers(fd);
        toast.success('User created successfully');
      }

      resetForm();
      setIsModalOpen(false);
      await loadUsers();
    } catch {
      toast.error('Save failed');
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await getUsersById(id);
      const data = res?.output ?? res;
      if (!data?.id) return toast.error('Invalid user data');

      setFormData({
        ...initialForm,
        ...data
      });
      setImageFile(null);
      setImagePreview(data.imagePath ?? '');
      setEditingId(data.id);
      setIsModalOpen(true);
    } catch {
      toast.error('Failed to load user details');
    }
  };

  const handleDeleteRequest = (id) => setConfirmDeleteId(id);

  const handleDelete = async (id) => {
    try {
      await deleteUsers(id);
      toast.success('User deleted');
      setConfirmDeleteId(null);
      await loadUsers();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="modules-page">
      <h2>👤 User Management</h2>
      <button className="create-btn mt4" onClick={openCreate}>Create User</button>

      {loading ? <p>Loading users...</p> : (
        <table className="module-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th><th>Phone</th>
              <th>Employee Code</th><th>Company</th><th>Active</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length ? users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td>
                <td>{u.employeeCode}</td><td>{companies.find(c => c.id === u.companyId)?.name || '-'}</td>
                <td>{u.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => handleEdit(u.id)}>✏️ Edit</button>
                  <button onClick={() => handleDeleteRequest(u.id)}>🗑️ Delete</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onRequestClose={() => { setIsModalOpen(false); resetForm(); }} className="edit-modal">
        <h3>{editingId ? 'Edit' : 'Create'} User</h3>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-row">
            <div className="form-column">
              <input type="text" placeholder="Name *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required/>
            </div>
            <div className="form-column">
              <input type="email" placeholder="Email *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required/>
            </div>
          </div>

          <div className="form-row">
            <div className="form-column">
              <input type="text" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/>
            </div>
            <div className="form-column">
              <input type="text" placeholder="Employee Code" value={formData.employeeCode} onChange={e => setFormData({...formData, employeeCode: e.target.value})}/>
            </div>
          </div>

          <div className="form-row">
            <div className="form-column">
              <select value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-column">
              <label>Upload Image</label>
              <input type="file" accept="image/*" onChange={handleFileChange}/>
              {imagePreview ? <img src={imagePreview.includes('http') || imagePreview.includes('localhost') ? imagePreview : `${BASE_URL}${imagePreview}`} alt="preview" style={{maxWidth:120,maxHeight:80}}/> : <div>No image</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-column">
              <label className="switch">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData,isActive:e.target.checked})}/>
                <span className="slider"></span>
                <span>{formData.isActive ? 'Active' : 'Inactive'}</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit">{editingId ? 'Update' : 'Create'} User</button>
            <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Confirm delete */}
      {confirmDeleteId !== null && (
        <div className="confirm-modal">
          <div className="confirm-box">
            <h4>Are you sure you want to delete this user?</h4>
            <div className="confirm-actions">
              <button onClick={() => handleDelete(confirmDeleteId)}>Yes, Delete</button>
              <button onClick={() => setConfirmDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
