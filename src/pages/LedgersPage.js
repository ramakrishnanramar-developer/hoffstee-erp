// Ledgers.js
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import {
    getLedgers,
    createLedger,
    getLedgerById,
    updateLedger,
    deleteLedger,
    getAccountGroups,
} from '../services/authService';
import 'react-toastify/dist/ReactToastify.css';
import './company.css';

Modal.setAppElement('#root');

const initialForm = {
    id: null,
    accountGroupID: '',
    parentLedgerID: 0,
    name: '',
    alias: '',
    openingBalance: 0,
    balanceType: 'D',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    pan: '',
    bankName: '',
    accountNo: '',
    ifsc: '',
    swiftCode: '',
    isActive: true,
    accountGroupName: '',
    parentLedgerName: '',
};

const Ledgers = () => {
    const [ledgers, setLedgers] = useState([]);
    const [accountGroups, setAccountGroups] = useState([]);
    const [formData, setFormData] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadLedgers();
        loadAccountGroups();
    }, []);

    const loadLedgers = async () => {
        setLoading(true);
        try {
            const data = await getLedgers();
            const list = Array.isArray(data) ? data : data?.output || [];
            setLedgers(list);
        } catch (err) {
            console.error('Load ledgers failed', err);
            toast.error('Failed to load ledgers');
        } finally {
            setLoading(false);
        }
    };

    const loadAccountGroups = async () => {
        try {
            const data = await getAccountGroups();
            const list = Array.isArray(data) ? data : data?.output || [];
            setAccountGroups(list);
        } catch (err) {
            console.error('Load account groups failed', err);
            toast.error('Failed to load account groups');
        }
    };

    const openCreate = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData(initialForm);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.preventDefault();

        // 1. Ledger Name mandatory
        if (!formData.name.trim()) {
            toast.error('Ledger Name is required');
            return;
        }

        // 2. Account Group mandatory
        if (!formData.accountGroupID) {
            toast.error('Account Group is required');
            return;
        }

        // 3. Opening Balance default to 0
        const openingBalance = formData.openingBalance ? Number(formData.openingBalance) : 0;
        const parentLedgerId = formData.parentLedgerID ? Number(formData.parentLedgerID) : 0;
        // 4. Email validation if not empty
        if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
            toast.error('Invalid email format');
            return;
        }

        // 5. Balance Type mapping
        const balanceType = formData.balanceType === 'Credit' || formData.balanceType === 'C' ? 'C' : 'D';

        // 6. Phone number validation if not empty
        if (formData.phone && !/^\d{10,20}$/.test(formData.phone)) {
            toast.error('Phone number must be 10 to 20 digits');
            return;
        }
        try {
            const payload = {
                ...formData,
                openingBalance: openingBalance,
                balanceType: balanceType,
                accountGroupName: '',
                parentLedgerName: '',
                parentLedgerID: parentLedgerId
            };

            if (editingId) {
                await updateLedger(editingId, payload);
                toast.success('Ledger updated successfully');
            } else {
                await createLedger(payload);
                toast.success('Ledger created successfully');
            }

            resetForm();
            setIsModalOpen(false);
            await loadLedgers();
        } catch (err) {
            console.error('Save failed', err?.response?.data || err.message || err);
            toast.error('Save failed');
        }
    };

    const handleEdit = async (id) => {
        try {
            const res = await getLedgerById(id);
            const data = res?.output ?? res;
            if (!data || !data.id) {
                toast.error('Invalid ledger data received');
                return;
            }
            setFormData({
                id: data.id,
                accountGroupID: data.accountGroupID ?? '',
                parentLedgerID: data.parentLedgerID ?? 0,
                name: data.name ?? '',
                alias: data.alias ?? '',
                openingBalance: data.openingBalance ?? 0,
                balanceType: data.balanceType ?? 'D',
                email: data.email ?? '',
                phone: data.phone ?? '',
                address: data.address ?? '',
                gstin: data.gstin ?? '',
                pan: data.pan ?? '',
                bankName: data.bankName ?? '',
                accountNo: data.accountNo ?? '',
                ifsc: data.ifsc ?? '',
                swiftCode: data.swiftCode ?? '',
                isActive: data.isActive ?? true,
                accountGroupName: data.accountGroupName ?? '',
                parentLedgerName: data.parentLedgerName ?? '',
            });
            setEditingId(data.id);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Fetch ledger failed', err);
            toast.error('Failed to load ledger details');
        }
    };

    const handleDeleteRequest = (id) => setConfirmDeleteId(id);

    const handleDelete = async (id) => {
        try {
            await deleteLedger(id);
            toast.success('Ledger deleted');
            setConfirmDeleteId(null);
            await loadLedgers();
        } catch (err) {
            console.error('Delete failed', err);
            toast.error('Delete failed');
        }
    };

    return (
        <div className="modules-page">
            <h2>📒 Ledger Management</h2>

            <button className="create-btn mt4" onClick={openCreate}>
                Create Ledger
            </button>

            {loading ? (
                <p>Loading ledgers...</p>
            ) : (
                <table className="module-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Group</th>
                            <th>Parent Ledger</th>
                            <th>Name</th>
                            <th>Alias</th>
                            <th>Opening Balance</th>
                            <th>Balance Type</th>
                            {/* <th>Email</th>
                            <th>Phone</th> */}
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ledgers.length > 0 ? (
                            ledgers.map((l) => (
                                <tr key={l.id}>
                                    <td>{l.id}</td>
                                    <td>{l.accountGroupName}</td>
                                    <td>{l.parentLedgerName}</td>
                                    <td>{l.name}</td>
                                    <td>{l.alias}</td>
                                    <td>{l.openingBalance}</td>
                                    <td>{l.balanceType}</td>
                                    {/* <td>{l.email}</td>
                                    <td>{l.phone}</td> */}
                                    <td>{l.isActive ? 'Yes' : 'No'}</td>
                                    <td>
                                        <button className="action-btn edit" onClick={() => handleEdit(l.id)}>✏️ Edit</button>
                                        <button className="action-btn delete" onClick={() => handleDeleteRequest(l.id)}>🗑️ Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="11" style={{ textAlign: 'center' }}>
                                    No ledgers found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                className="edit-modal"
            >
                <h3>{editingId ? 'Edit Ledger' : 'Create Ledger'}</h3>

                <form onSubmit={handleSubmit} className="module-form">
                    <div className="form-row">
                        <div className="form-column">
                            <select
                                value={formData.accountGroupID}
                                onChange={(e) => setFormData({ ...formData, accountGroupID: e.target.value })}
                            >
                                <option value="">-- Select Account Group --</option>
                                {accountGroups.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-column">
                            <select
                                value={formData.parentLedgerID}
                                onChange={(e) => setFormData({ ...formData, parentLedgerID: e.target.value })}
                            >
                                <option value="">-- Select Parent Ledger --</option>
                                {ledgers.map((pl) => (
                                    <option key={pl.id} value={pl.id}>
                                        {pl.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* other form fields, same as before */}
                    {/* Name + Alias */}
                    <div className="form-row">
                        <div className="form-column">
                            <input
                                type="text"
                                placeholder="Ledger Name *"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-column">
                            <input
                                type="text"
                                placeholder="Alias"
                                value={formData.alias}
                                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Opening Balance + Balance Type */}
                    <div className="form-row">
                        <div className="form-column">
                            <input
                                type="number"
                                placeholder="Opening Balance"
                                value={formData.openingBalance}
                                onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                            />
                        </div>
                        <div className="form-column">
                            <select
                                value={formData.balanceType}
                                onChange={(e) => setFormData({ ...formData, balanceType: e.target.value })}
                            >
                                <option value="D">Debit</option>
                                <option value="C">Credit</option>
                            </select>
                        </div>
                    </div>

                    {/* Email + Phone */}
                    <div className="form-row">
                        <div className="form-column">
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-column">
                            <input
                                type="text"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Address + GSTIN */}
                    <div className="form-row">
                        <div className="form-column">
                            <textarea
                                placeholder="Address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={2}
                            />
                        </div>
                        <div className="form-column">
                            <input
                                type="text"
                                placeholder="GSTIN"
                                value={formData.gstin}
                                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* PAN + Bank Name */}
                    <div className="form-row">
                        <div className="form-column">
                            <input
                                type="text"
                                placeholder="PAN"
                                value={formData.pan}
                                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                            />
                        </div>
                        <div className="form-column">
                            <input
                                type="text"
                                placeholder="Bank Name"
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Account No + IFSC */}
                    <div className="form-row">
                        <div className="form-column">
                            <input
                                type="text"
                                placeholder="Account No"
                                value={formData.accountNo}
                                onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                            />
                        </div>
                        <div className="form-column">
                            <input
                                type="text"
                                placeholder="IFSC"
                                value={formData.ifsc}
                                onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* SWIFT + Active */}
                    <div className="form-row">
                        <div className="form-column">
                            <input
                                type="text"
                                placeholder="SWIFT Code"
                                value={formData.swiftCode}
                                onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                            />
                        </div>
                        <div className="form-column">
                            <label className="switch" style={{ marginTop: 8 }}>
                                <input
                                    type="checkbox"
                                    checked={Boolean(formData.isActive)}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <span className="slider"></span>
                                <span style={{ marginLeft: 8 }}>{formData.isActive ? 'Active' : 'Inactive'}</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit">{editingId ? 'Update' : 'Create'} Ledger</button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {confirmDeleteId !== null && (
                <div className="confirm-modal">
                    <div className="confirm-box">
                        <h4>Are you sure you want to delete this ledger?</h4>
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

export default Ledgers;
