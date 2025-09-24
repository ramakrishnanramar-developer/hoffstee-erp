import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import {
    getTransactionTypes,
    createTransactionType,
    getTransactionTypeById,
    updateTransactionType,
    deleteTransactionType,
    getPermissionsByPage
} from '../services/authService';
import 'react-toastify/dist/ReactToastify.css';
import './SubModulesPage.css';
import STRINGS from "../constants/strings";

Modal.setAppElement('#root');

const TransactionTypeMasterPage = () => {
    const [transactionTypes, setTransactionTypes] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        code: '',
        isActive: true
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
        isDownload: false
    });

    useEffect(() => {
        loadPermissions();
        loadTransactionTypes();
    }, []);

    const loadPermissions = async () => {
        try {
            const data = await getPermissionsByPage(STRINGS.PAGES.TransactionType);
            setPermissions(data.output || {});
        } catch (err) {
            toast.error('Failed to load permissions');
        }
    };

    const loadTransactionTypes = async () => {
        try {
            const data = await getTransactionTypes();
            const list = Array.isArray(data) ? data : data?.output || [];
            setTransactionTypes(list);
        } catch (err) {
            toast.error('Failed to load transaction types');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code.trim()) {
            toast.error('Code is required');
            return;
        }

        const cleanData = {
            id: formData.id,
            code: formData.code.trim(),
            isActive: Boolean(formData.isActive)
        };

        try {
            if (editingId) {
                await updateTransactionType(editingId, cleanData);
                toast.success('Transaction Type updated successfully');
            } else {
                await createTransactionType(cleanData);
                toast.success('Transaction Type created successfully');
            }

            resetForm();
            loadTransactionTypes();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = async (id) => {
        try {
            const result = await getTransactionTypeById(id);
            const data = result.output || result;

            if (!data || !data.id) {
                toast.error('Invalid data received');
                return;
            }

            setFormData({
                id: data.id,
                code: data.code || '',
                isActive: data.isActive ?? true
            });
            setEditingId(data.id);
            setIsModalOpen(true);
        } catch (err) {
            toast.error('Failed to load details');
        }
    };

    const handleDeleteRequest = (id) => setConfirmDeleteId(id);

    const handleDelete = async (id) => {
        try {
            await deleteTransactionType(id);
            toast.success('Transaction Type deleted');
            setConfirmDeleteId(null);
            loadTransactionTypes();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            code: '',
            isActive: true
        });
        setEditingId(null);
        setIsModalOpen(false);
    };

    return (
        <div className="modules-page">
            <h2>📑 Transaction Type Management</h2>

            {permissions.isAdd && (
                <button className="create-btn mt4" onClick={() => setIsModalOpen(true)}>
                    Create Transaction Type
                </button>
            )}

            {permissions.isView && (
                <table className="module-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Code</th>
                            <th>Status</th>
                            {(permissions.isEdit || permissions.isDelete) && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(transactionTypes) && transactionTypes.map((type) => (
                            <tr key={type.id}>
                                <td>{type.id}</td>
                                <td>{type.code}</td>
                                <td>{type.isActive ? 'Active' : 'Inactive'}</td>
                                <td>
                                    {permissions.isEdit && (
                                        <button className="action-btn edit" onClick={() => handleEdit(type.id)}>✏️ Edit</button>
                                    )}
                                    {permissions.isDelete && (
                                        <button className="action-btn delete" onClick={() => handleDeleteRequest(type.id)}>🗑️ Delete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <Modal
                isOpen={isModalOpen}
                onRequestClose={resetForm}
                className="edit-modal"
            >
                <h3>{editingId ? 'Edit Transaction Type' : 'Create Transaction Type'}</h3>
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
                        placeholder="Code"
                        value={formData.code ?? ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        required
                    />
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={formData.isActive ?? false}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <span className="slider"></span>
                    </label>
                    <button type="submit">{editingId ? 'Update' : 'Create'} Transaction Type</button>
                </form>
            </Modal>

            {confirmDeleteId !== null && (
                <div className="confirm-modal">
                    <div className="confirm-box">
                        <h4>Are you sure you want to delete this transaction type?</h4>
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

export default TransactionTypeMasterPage;
