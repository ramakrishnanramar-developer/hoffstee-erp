import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import {
    getTaxes,
    createTax,
    getTaxById,
    updateTax,
    deleteTax,
    getPermissionsByPage
} from '../services/authService';
import 'react-toastify/dist/ReactToastify.css';
import './SubModulesPage.css';
import STRINGS from "../constants/strings";

Modal.setAppElement('#root');

const TaxMasterPage = () => {
    const [taxes, setTaxes] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        taxName: '',
        taxRate: '',
        effectiveFrom: '',
        effectiveTo: '',
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
        loadTaxes();
    }, []);

    const loadPermissions = async () => {
        try {
            const data = await getPermissionsByPage(STRINGS.PAGES.TAXMASTER);
            console.log(data);
            setPermissions(data.output || {});
        } catch (err) {
            toast.error('Failed to load permissions');
        }
    };

    const loadTaxes = async () => {
        try {
            const data = await getTaxes();
            const list = Array.isArray(data) ? data : data?.output || [];
            setTaxes(list);
        } catch (err) {
            toast.error('Failed to load taxes');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.taxName.trim() || !formData.taxRate) {
            toast.error('Tax Name and Rate are required');
            return;
        }

        const cleanData = {
            id: formData.id,
            taxName: formData.taxName.trim(),
            taxRate: parseFloat(formData.taxRate) || 0,
            effectiveFrom: formData.effectiveFrom ? formData.effectiveFrom.split('T')[0] : null,
            effectiveTo: formData.effectiveTo ? formData.effectiveTo.split('T')[0] : null,
            isActive: Boolean(formData.isActive)
        };

        try {
            if (editingId) {
                await updateTax(editingId, cleanData);
                toast.success('Tax updated successfully');
            } else {
                await createTax(cleanData);
                toast.success('Tax created successfully');
            }

            resetForm();
            loadTaxes();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = async (id) => {
        try {
            const tax = await getTaxById(id);
            const data = tax.output || tax;

            if (!data || !data.id) {
                toast.error('Invalid tax data received');
                return;
            }

            setFormData({
                id: data.id,
                taxName: data.taxName || '',
                taxRate: data.taxRate || 0,
                effectiveFrom: data.effectiveFrom ? data.effectiveFrom.split('T')[0] : '',
                effectiveTo: data.effectiveTo ? data.effectiveTo.split('T')[0] : '',
                isActive: data.isActive ?? true
            });
            setEditingId(data.id);
            setIsModalOpen(true);
        } catch (err) {
            toast.error('Failed to load tax details');
        }
    };

    const handleDeleteRequest = (id) => setConfirmDeleteId(id);

    const handleDelete = async (id) => {
        try {
            await deleteTax(id);
            toast.success('Tax deleted');
            setConfirmDeleteId(null);
            loadTaxes();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            taxName: '',
            taxRate: '',
            effectiveFrom: '',
            effectiveTo: '',
            isActive: true
        });
        setEditingId(null);
        setIsModalOpen(false);
    };

    return (
        <div className="modules-page">
            <h2>💰 Taxes Management</h2>

            {/* Show Create button only if isAdd = true */}
            {permissions.isAdd && (
                <button className="create-btn mt4" onClick={() => setIsModalOpen(true)}>
                    Create Tax
                </button>
            )}

            {/* Show Grid only if isView = true */}
            {permissions.isView && (
                <table className="module-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tax Name</th>
                            <th>Rate (%)</th>
                            <th>Effective From</th>
                            <th>Effective To</th>
                            <th>Status</th>
                            {(permissions.isEdit || permissions.isDelete) && (
                                <th>Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(taxes) && taxes.map((tax) => (
                            <tr key={tax.id}>
                                <td>{tax.id}</td>
                                <td>{tax.taxName}</td>
                                <td>{tax.taxRate}</td>
                                <td>{tax.effectiveFrom ? tax.effectiveFrom.split('T')[0] : ''}</td>
                                <td>{tax.effectiveTo ? tax.effectiveTo.split('T')[0] : ''}</td>
                                <td>{tax.isActive ? 'Active' : 'Inactive'}</td>
                                <td>
                                    {/* Show Edit only if isEdit = true */}
                                    {permissions.isEdit && (
                                        <button className="action-btn edit" onClick={() => handleEdit(tax.id)}>✏️ Edit</button>
                                    )}

                                    {/* Show Delete only if isDelete = true */}
                                    {permissions.isDelete && (
                                        <button className="action-btn delete" onClick={() => handleDeleteRequest(tax.id)}>🗑️ Delete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={resetForm}
                className="edit-modal"
            >
                <h3>{editingId ? 'Edit Tax' : 'Create Tax'}</h3>
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
                        placeholder="Tax Name"
                        value={formData.taxName ?? ''}
                        onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Tax Rate"
                        value={formData.taxRate ?? ''}
                        onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                        required
                    />
                    <label>Effective From:</label>
                    <input
                        type="date"
                        value={formData.effectiveFrom ?? ''}
                        onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                    />
                    <label>Effective To:</label>
                    <input
                        type="date"
                        value={formData.effectiveTo ?? ''}
                        onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                    />
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={formData.isActive ?? false}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <span className="slider"></span>
                    </label>
                    <button type="submit">{editingId ? 'Update' : 'Create'} Tax</button>
                </form>
            </Modal>

            {/* Confirm Delete */}
            {confirmDeleteId !== null && (
                <div className="confirm-modal">
                    <div className="confirm-box">
                        <h4>Are you sure you want to delete this tax?</h4>
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

export default TaxMasterPage;
