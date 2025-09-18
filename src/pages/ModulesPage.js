import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import {
    getModules,
    createModule,
    getModuleById,
    updateModule,
    deleteModule,
    getPermissionsByPage, // 👈 Added
} from '../services/authService';
import STRINGS from '../constants/strings'; // 👈 Added for page constants
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
        priority: 1,
    });
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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
        loadModules();
    }, []);

    const loadPermissions = async () => {
        try {
            const data = await getPermissionsByPage(STRINGS.PAGES.Modules);
            setPermissions(data.output || {});
        } catch {
            toast.error('Failed to load permissions');
        }
    };

    const loadModules = async () => {
        try {
            const data = await getModules();
            const list = Array.isArray(data) ? data : data?.output || [];
            setModules(list);
            console.log('The Modules Data:', list);
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
            id: formData.id,
            moduleName: formData.moduleName.trim(),
            moduleCode: formData.moduleCode.trim(),
            status: Boolean(formData.status),
            priority:
                Number.isFinite(Number(formData.priority)) && Number(formData.priority) > 0
                    ? parseInt(formData.priority)
                    : 1,
        };

        try {
            if (editingId) {
                if (!permissions.isEdit) {
                    toast.error("You don't have permission to edit modules");
                    return;
                }
                await updateModule(editingId, cleanData);
                toast.success('Module updated successfully');
            } else {
                if (!permissions.isAdd) {
                    toast.error("You don't have permission to create modules");
                    return;
                }
                await createModule(cleanData);
                toast.success('Module created successfully');
            }

            resetForm();
            loadModules();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = async (id) => {
        if (!permissions.isEdit) {
            toast.error("You don't have permission to edit modules");
            return;
        }
        try {
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
                priority: data.priority ?? 1,
            });

            setEditingId(data.id);
            setIsModalOpen(true);
        } catch (err) {
            toast.error('Failed to load module details');
        }
    };

    const handleDeleteRequest = (id) => setConfirmDeleteId(id);

    const handleDelete = async (id) => {
        if (!permissions.isDelete) {
            toast.error("You don't have permission to delete modules");
            return;
        }
        try {
            await deleteModule(id);
            toast.success('Module deleted');
            setConfirmDeleteId(null);
            loadModules();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            moduleName: '',
            moduleCode: '',
            status: true,
            priority: 1,
        });
        setEditingId(null);
        setIsModalOpen(false);
    };

    return (
        <div className="modules-page">
            <h2>📦 Modules Management</h2>

            {/* Create button only if isAdd = true */}
            {permissions.isAdd && (
                <button className="create-btn mt4" onClick={() => setIsModalOpen(true)}>
                    Create Module
                </button>
            )}

            <Modal isOpen={isModalOpen} onRequestClose={resetForm} className="edit-modal">
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
                        required
                    />
                    <input
                        type="text"
                        placeholder="Module Code"
                        value={formData.moduleCode ?? ''}
                        onChange={(e) => setFormData({ ...formData, moduleCode: e.target.value })}
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
                            checked={formData.status ?? true}
                            onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                        />
                        <span className="slider"></span>
                    </label>
                    <button type="submit">{editingId ? 'Update' : 'Create'} Module</button>
                </form>
            </Modal>

            {/* Table only if isView = true */}
            {permissions.isView && (
                <table className="module-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Module Name</th>
                            <th>Module Code</th>
                            <th>Status</th>
                            <th>Priority</th>
                            {(permissions.isEdit || permissions.isDelete) && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(modules) &&
                            modules.map((mod) => (
                                <tr key={mod.id}>
                                    <td>{mod.id}</td>
                                    <td>{mod.moduleName}</td>
                                    <td>{mod.moduleCode}</td>
                                    <td>{mod.status ? 'Active' : 'Inactive'}</td>
                                    <td>{mod.priority}</td>
                                    <td>
                                        {permissions.isEdit && (
                                            <button className="action-btn edit" onClick={() => handleEdit(mod.id)}>
                                                ✏️ Edit
                                            </button>
                                        )}
                                        {permissions.isDelete && (
                                            <button className="action-btn delete" onClick={() => handleDeleteRequest(mod.id)}>
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
                        <h4>Are you sure you want to delete this module?</h4>
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

export default ModulesPage;
