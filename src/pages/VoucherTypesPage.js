import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import {
    getVoucherTypes,
    createVoucherType,
    getVoucherTypeById,
    updateVoucherType,
    deleteVoucherType
} from '../services/authService';
import 'react-toastify/dist/ReactToastify.css';
import './SubModulesPage.css';

Modal.setAppElement('#root');

const VoucherTypePage = () => {
    const [voucherTypes, setVoucherTypes] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        code: '',
        name: '',
        category: 'Accounts',
        numberingMethod: 'Auto',
        prefix: '',
        suffix: '',
        startingNumber: 1,
        isActive: true
    });
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const categories = [
        'Accounts',
        'Adjustment',
        'Expense',
        'Finance',
        'Purchase',
        'Sales'
    ];
    const numberingMethods = ['Auto', 'Manual']; 
    useEffect(() => {
        loadVoucherTypes();
    }, []);

    const loadVoucherTypes = async () => {
        try {
            const data = await getVoucherTypes();
            const list = Array.isArray(data) ? data : data?.output || [];
            setVoucherTypes(list);
        } catch (err) {
            toast.error('Failed to load voucher types');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code.trim() || !formData.name.trim()) {
            toast.error('Code and Name are required');
            return;
        }
        if (!formData.numberingMethod.trim()) {
            toast.error('Numbering method are required');
            return;
        }
        const cleanData = {
            id: formData.id,
            code: formData.code.trim(),
            name: formData.name.trim(),
            category: formData.category,
            numberingMethod: formData.numberingMethod,
            prefix: formData.prefix.trim(),
            suffix: formData.suffix.trim(),
            startingNumber: Number.isFinite(Number(formData.startingNumber))
                ? parseInt(formData.startingNumber)
                : 1,
            isActive: Boolean(formData.isActive)
        };

        try {
            if (editingId) {
                await updateVoucherType(editingId, cleanData);
                toast.success('Voucher Type updated successfully');
            } else {
                await createVoucherType(cleanData);
                toast.success('Voucher Type created successfully');
            }

            resetForm();
            setIsModalOpen(false);
            loadVoucherTypes();
        } catch (err) {
            console.error('Save failed:', err.response?.data || err.message);
            toast.error('Save failed');
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            code: '',
            name: '',
            category: 'Accounts',
            numberingMethod: 'Auto',
            prefix: '',
            suffix: '',
            startingNumber: 1,
            isActive: true
        });
        setEditingId(null);
    };

    const handleEdit = async (id) => {
        try {
            const res = await getVoucherTypeById(id);
            const data = res.output;

            if (!data || !data.id) {
                toast.error('Invalid voucher type data received');
                return;
            }

            setFormData({
                id: data.id,
                code: data.code || '',
                name: data.name || '',
                category: data.category || 'Accounts',
                numberingMethod: data.numberingMethod || 'Auto',
                prefix: data.prefix || '',
                suffix: data.suffix || '',
                startingNumber: data.startingNumber ?? 1,
                isActive: data.isActive ?? true
            });

            setEditingId(data.id);
            setIsModalOpen(true);
        } catch (err) {
            toast.error('Failed to load voucher type details');
        }
    };

    const handleDeleteRequest = (id) => {
        setConfirmDeleteId(id);
    };

    const handleDelete = async (id) => {
        try {
            await deleteVoucherType(id);
            toast.success('Voucher Type deleted');
            setConfirmDeleteId(null);
            loadVoucherTypes();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="modules-page">
            <h2>🧾 Voucher Type Management</h2>
            <button className="create-btn mt4" onClick={() => setIsModalOpen(true)}>
                Create Voucher Type
            </button>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                className="edit-modal"
            >
                <h3>{editingId ? 'Edit Voucher Type' : 'Create Voucher Type'}</h3>
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
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <select className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                    >
                        {categories.map((cat, idx) => (
                            <option key={idx} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                    <select
                        className="form-select"
                        value={formData.numberingMethod}
                        onChange={(e) => setFormData({ ...formData, numberingMethod: e.target.value })}
                        required
                    >
                        {numberingMethods.map((method, idx) => (
                            <option key={idx} value={method}>
                                {method}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Prefix"
                        value={formData.prefix}
                        onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Suffix"
                        value={formData.suffix}
                        onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Starting Number"
                        value={formData.startingNumber}
                        onChange={(e) =>
                            setFormData({ ...formData, startingNumber: parseInt(e.target.value) })
                        }
                        min={1}
                        required
                    />
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
                    <button type="submit">{editingId ? 'Update' : 'Create'} Voucher Type</button>
                </form>
            </Modal>

            <table className="module-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Numbering Method</th>
                        <th>Prefix</th>
                        <th>Suffix</th>
                        <th>Starting Number</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {voucherTypes.map((vt) => (
                        <tr key={vt.id}>
                            <td>{vt.id}</td>
                            <td>{vt.code}</td>
                            <td>{vt.name}</td>
                            <td>{vt.category}</td>
                            <td>{vt.numberingMethod}</td>
                            <td>{vt.prefix}</td>
                            <td>{vt.suffix}</td>
                            <td>{vt.startingNumber}</td>
                            <td>{vt.isActive ? 'Active' : 'Inactive'}</td>
                            <td>
                                <button className="action-btn edit" onClick={() => handleEdit(vt.id)}>✏️ Edit</button>
                                <button className="action-btn delete" onClick={() => handleDeleteRequest(vt.id)}>🗑️ Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {confirmDeleteId !== null && (
                <div className="confirm-modal">
                    <div className="confirm-box">
                        <h4>Are you sure you want to delete this voucher type?</h4>
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

export default VoucherTypePage;
