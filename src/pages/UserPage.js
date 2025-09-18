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
    getPermissionsByPage,   // 👈 Added
    BASE_URL
} from '../services/authService';
import STRINGS from '../constants/strings'; // 👈 Added
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
        loadUsers();
        loadCompanies();

        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadPermissions = async () => {
        try {
            const data = await getPermissionsByPage(STRINGS.PAGES.Users);
            setPermissions(data.output || {});
        } catch {
            toast.error('Failed to load permissions');
        }
    };

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
        if (!permissions.isAdd) {
            toast.error("You don't have permission to add users");
            return;
        }
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
                if (!permissions.isEdit) {
                    toast.error("You don't have permission to edit users");
                    return;
                }
                fd.append('id', editingId);
                await updateUsers(editingId, fd);
                toast.success('User updated successfully');
            } else {
                if (!permissions.isAdd) {
                    toast.error("You don't have permission to create users");
                    return;
                }
                await createUsers(fd);
                toast.success('User created successfully');
            }

            resetForm();
            setIsModalOpen(false);
            await loadUsers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = async (id) => {
        if (!permissions.isEdit) {
            toast.error("You don't have permission to edit users");
            return;
        }
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
        if (!permissions.isDelete) {
            toast.error("You don't have permission to delete users");
            return;
        }
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

            {permissions.isAdd && (
                <button className="create-btn mt4" onClick={openCreate}>Create User</button>
            )}

            {loading ? <p>Loading users...</p> : (
                permissions.isView && (
                    <table className="module-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>Name</th><th>Email</th><th>Phone</th>
                                <th>Employee Code</th><th>Company</th><th>Active</th>
                                {(permissions.isEdit || permissions.isDelete) && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {users.length ? users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td>
                                    <td>{u.employeeCode}</td><td>{companies.find(c => c.id === u.companyId)?.name || '-'}</td>
                                    <td>{u.isActive ? 'Yes' : 'No'}</td>
                                    <td>
                                        {permissions.isEdit && (
                                            <button onClick={() => handleEdit(u.id)}>✏️ Edit</button>
                                        )}
                                        {permissions.isDelete && (
                                            <button onClick={() => handleDeleteRequest(u.id)}>🗑️ Delete</button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" style={{ textAlign: 'center' }}>No users found</td></tr>
                            )}
                        </tbody>
                    </table>
                )
            )}

            {/* Modal stays same */}
            <Modal isOpen={isModalOpen} onRequestClose={() => { setIsModalOpen(false); resetForm(); }} className="edit-modal">
                <h3>{editingId ? 'Edit' : 'Create'} User</h3>
                {/* form unchanged */}
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
