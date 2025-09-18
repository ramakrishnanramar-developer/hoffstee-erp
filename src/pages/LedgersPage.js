import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import {
    getLedgers,
    createLedger,
    getLedgerById,
    updateLedger,
    deleteLedger,
    getAccountGroups,
    getPermissionsByPage
} from "../services/authService"; // 👈 Added getPermissionsByPage
import "react-toastify/dist/ReactToastify.css";
import "./company.css";
import STRINGS from "../constants/strings"; // 👈 for page constant

Modal.setAppElement("#root");

const LedgersPage = () => {
    const [ledgers, setLedgers] = useState([]);
    const [accountGroups, setAccountGroups] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        accountGroupID: "",
        parentLedgerID: null,
        name: "",
        alias: "",
        openingBalance: 0,
        balanceType: "D",
        email: "",
        phone: "",
        address: "",
        gstin: "",
        pan: "",
        bankName: "",
        accountNo: "",
        ifsc: "",
        swiftCode: "",
        isActive: true,
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
        loadLedgers();
        loadAccountGroups();
    }, []);

    const loadPermissions = async () => {
        try {
            const data = await getPermissionsByPage(STRINGS.PAGES.General_Ledgers);
            setPermissions(data.output || {});
        } catch {
            toast.error("Failed to load permissions");
        }
    };

    const loadLedgers = async () => {
        try {
            let data = await getLedgers();
            let list = Array.isArray(data) ? data : data?.output || [];
            setLedgers(list);
        } catch {
            toast.error("Failed to load ledgers");
        }
    };

    const loadAccountGroups = async () => {
        try {
            let data = await getAccountGroups();
            let list = Array.isArray(data) ? data : data?.output || [];
            setAccountGroups(list);
        } catch {
            toast.error("Failed to load account groups");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Ledger name is required");
            return;
        }
        if (!formData.accountGroupID) {
            toast.error("Please select Account Group");
            return;
        }

        const cleanData = {
            ...formData,
            accountGroupID: parseInt(formData.accountGroupID),
            parentLedgerID: formData.parentLedgerID ? parseInt(formData.parentLedgerID) : null,
            openingBalance: Number(formData.openingBalance) || 0,
            balanceType: formData.balanceType === "C" ? "C" : "D",
            isActive: Boolean(formData.isActive),
        };

        try {
            if (editingId) {
                await updateLedger(editingId, cleanData);
                toast.success("Ledger updated successfully");
            } else {
                await createLedger(cleanData);
                toast.success("Ledger created successfully");
            }

            resetForm();
            loadLedgers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = async (id) => {
        try {
            const res = await getLedgerById(id);
            const data = res.output;

            if (!data || !data.id) {
                toast.error("Invalid ledger data received");
                return;
            }

            setFormData({
                id: data.id,
                accountGroupID: data.accountGroupID || "",
                parentLedgerID: data.parentLedgerID || null,
                name: data.name || "",
                alias: data.alias || "",
                openingBalance: data.openingBalance || 0,
                balanceType: data.balanceType || "D",
                email: data.email || "",
                phone: data.phone || "",
                address: data.address || "",
                gstin: data.gstin || "",
                pan: data.pan || "",
                bankName: data.bankName || "",
                accountNo: data.accountNo || "",
                ifsc: data.ifsc || "",
                swiftCode: data.swiftCode || "",
                isActive: data.isActive ?? true,
            });

            setEditingId(data.id);
            setIsModalOpen(true);
        } catch {
            toast.error("Failed to load ledger details");
        }
    };

    const handleDeleteRequest = (id) => setConfirmDeleteId(id);

    const handleDelete = async (id) => {
        try {
            await deleteLedger(id);
            toast.success("Ledger deleted");
            setConfirmDeleteId(null);
            loadLedgers();
        } catch {
            toast.error("Delete failed");
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            accountGroupID: "",
            parentLedgerID: null,
            name: "",
            alias: "",
            openingBalance: 0,
            balanceType: "D",
            email: "",
            phone: "",
            address: "",
            gstin: "",
            pan: "",
            bankName: "",
            accountNo: "",
            ifsc: "",
            swiftCode: "",
            isActive: true,
        });
        setEditingId(null);
        setIsModalOpen(false);
    };

    return (
        <div className="modules-page">
            <h2>📒 Ledgers Management</h2>

            {/* Show Create button only if isAdd = true */}
            {permissions.isAdd && (
                <button className="create-btn mt4" onClick={() => setIsModalOpen(true)}>
                    Create Ledger
                </button>
            )}

            <Modal
                isOpen={isModalOpen}
                onRequestClose={resetForm}
                className="edit-modal"
            >
                <h3>{editingId ? "Edit Ledger" : "Create Ledger"}</h3>
                <form onSubmit={handleSubmit} className="module-form">
                    {editingId && (
                        <input
                            type="text"
                            value={formData.id ?? ""}
                            disabled
                            className="form-control"
                            style={{ backgroundColor: "#eee", marginBottom: "10px" }}
                        />
                    )}

                    <input
                        type="text"
                        placeholder="Ledger Name"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        required
                    />

                    <input
                        type="text"
                        placeholder="Alias (optional)"
                        value={formData.alias}
                        onChange={(e) =>
                            setFormData({ ...formData, alias: e.target.value })
                        }
                    />

                    {/* Account Group Dropdown */}
                    <select
                        value={formData.accountGroupID || ""}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                accountGroupID: e.target.value ? parseInt(e.target.value) : "",
                            })
                        }
                        required
                    >
                        <option value="">-- Select Account Group --</option>
                        {accountGroups.map((grp) => (
                            <option key={grp.id} value={grp.id}>
                                {grp.name}
                            </option>
                        ))}
                    </select>

                    {/* Balance Type */}
                    <select
                        value={formData.balanceType}
                        onChange={(e) => setFormData({ ...formData, balanceType: e.target.value })}
                        required
                    >
                        <option value="D">Debit</option>
                        <option value="C">Credit</option>
                    </select>

                    {/* Opening Balance */}
                    <input
                        type="number"
                        placeholder="Opening Balance"
                        value={formData.openingBalance}
                        onChange={(e) =>
                            setFormData({ ...formData, openingBalance: e.target.value })
                        }
                    />

                    {/* Status Switch */}
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

                    <button type="submit">
                        {editingId ? "Update" : "Create"} Ledger
                    </button>
                </form>
            </Modal>

            {/* Show table only if isView = true */}
            {permissions.isView && (
                <table className="module-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ledger Name</th>
                            <th>Alias</th>
                            <th>Account Group</th>
                            <th>Opening Balance</th>
                            <th>Balance Type</th>
                            <th>Status</th>
                            {(permissions.isEdit || permissions.isDelete) && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {ledgers.map((ledger) => (
                            <tr key={ledger.id}>
                                <td>{ledger.id}</td>
                                <td>{ledger.name}</td>
                                <td>{ledger.alias}</td>
                                <td>{ledger.accountGroupName}</td>
                                <td>{ledger.openingBalance}</td>
                                <td>{ledger.balanceType === "C" ? "Credit" : "Debit"}</td>
                                <td>{ledger.isActive ? "Active" : "Inactive"}</td>
                                <td>
                                    {/* Show Edit only if isEdit = true */}
                                    {permissions.isEdit && (
                                        <button
                                            className="action-btn edit"
                                            onClick={() => handleEdit(ledger.id)}
                                        >
                                            ✏️ Edit
                                        </button>
                                    )}

                                    {/* Show Delete only if isDelete = true */}
                                    {permissions.isDelete && (
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleDeleteRequest(ledger.id)}
                                        >
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
                        <h4>Are you sure you want to delete this ledger?</h4>
                        <div className="confirm-actions">
                            <button
                                className="confirm-btn delete"
                                onClick={() => handleDelete(confirmDeleteId)}
                            >
                                Yes, Delete
                            </button>
                            <button
                                className="confirm-btn cancel"
                                onClick={() => setConfirmDeleteId(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LedgersPage;
