import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import {
    getSubModules,
    createSubModule,
    getSubModuleById,
    updateSubModule,
    deleteSubModule,
    getPermissionsByPage, // 👈 Added
} from '../services/authService';
import STRINGS from '../constants/strings'; // 👈 Added for page constants
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
        priority: 1,
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
        loadSubModules();
    }, []);

    const loadPermissions = async () => {
        try {
            const data = await getPermissionsByPage(STRINGS.PAGES.Sub_Modules);
            setPermissions(data.output || {});
        } catch {
            toast.error('Failed to load permissions');
        }
    };

    const loadSubModules = async () => {
        try {
            const data = await getSubModules();
            const list = Array.isArray(data) ? data : data?.output || [];
            setSubModules(list);
            console.log('The SubModules Data:', list);
        } catch (err) {
            toast.error('Failed to load submodules');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subModuleName.trim() || !formData.subModuleCode.trim()) {
            toast.error('SubModule Name and Code are required');
            return;
        }

        const cleanData = {
            id: formData.id,
            subModuleName: formData.subModuleName.trim(),
            subModuleCode: formData.subModuleCode.trim(),
            status: Boolean(formData.status),
            priority:
                Number.isFinite(Number(formData.priority)) && Number(formData.priority) > 0
                    ? parseInt(formData.priority)
                    : 1,
        };

        try {
            if (editingId) {
                if (!permissions.isEdit) {
                    toast.error("You don't have permission to edit submodules");
                    return;
                }
                await updateSubModule(editingId, cleanData);
                toast.success('SubModule updated successfully');
            } else {
                if (!permissions.isAdd) {
                    toast.error("You don't have permission to create submodules");
                    return;
                }
                await createSubModule(cleanData);
                toast.success('SubModule created successfully');
            }

            resetForm();
            loadSubModules();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = async (id) => {
        if (!permissions.isEdit) {
            toast.error("You don't have permission to edit submodules");
            return;
        }
        try {
            const res = await getSubModuleById(id);
            const data = res.output;

            if (!data || !data.id) {
                toast.error('Invalid submodule data received');
                return;
            }

            setFormData({
                id: data.id,
                subModuleName: data.subModuleName || '',
                subModuleCode: data.subModuleCode || '',
                status: data.status ?? true,
                priority: data.priority ?? 1,
            });

            setEditingId(data.id);
            setIsModalOpen(true);
        } catch (err) {
            toast.error('Failed to load submodule details');
        }
    };

    const handleDeleteRequest = (id) => setConfirmDeleteId(id);

    const handleDelete = async (id) => {
        if (!permissions.isDelete) {
            toast.error("You don't have permission to delete submodules");
            return;
        }
        try {
            await deleteSubModule(id);
            toast.success('SubModule deleted');
            setConfirmDeleteId(null);
            loadSubModules();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            subModuleName: '',
            subModuleCode: '',
            status: true,
            priority: 1,
        });
        setEditingId(null);
        setIsModalOpen(false);
    };

    return (
        <div className="modules-page">
            <h2>📦 SubModules Management</h2>

            {/* Create button only if isAdd = true */}
            {permissions.isAdd && (
                <button className="create-btn mt4" onClick={() => setIsModalOpen(true)}>
                    Create SubModule
                </button>
            )}

            <Modal isOpen={isModalOpen} onRequestClose={resetForm} className="edit-modal">
                <h3>{editingId ? 'Edit SubModule' : 'Create SubModule'}</h3>
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
                        required
                    />
                    <input
                        type="text"
                        placeholder="SubModule Code"
                        value={formData.subModuleCode ?? ''}
                        onChange={(e) => setFormData({ ...formData, subModuleCode: e.target.value })}
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
                    <button type="submit">{editingId ? 'Update' : 'Create'} SubModule</button>
                </form>
            </Modal>

            {/* Table only if isView = true */}
            {permissions.isView && (
                <table className="module-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>SubModule Name</th>
                            <th>SubModule Code</th>
                            <th>Status</th>
                            <th>Priority</th>
                            {(permissions.isEdit || permissions.isDelete) && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(submodules) &&
                            submodules.map((mod) => (
                                <tr key={mod.id}>
                                    <td>{mod.id}</td>
                                    <td>{mod.subModuleName}</td>
                                    <td>{mod.subModuleCode}</td>
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
                        <h4>Are you sure you want to delete this submodule?</h4>
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

export default SubModulesPage;
