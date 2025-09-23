import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import {
    GetLedgersDropdown,
    getPermissionsByPage,
    GenerateVoucherCode,
    CreateVouchers,
    UpdateVouchers,
    GetVouchersById
} from "../services/authService";
import STRINGS from "../constants/strings";
import "react-toastify/dist/ReactToastify.css";
import "./PaymentVoucher.css";
import { buildHierarchy } from "../utils/hierarchyHelper";
import { allowTwoDecimals, handleDecimalPaste } from "../utils/inputUtils";

Modal.setAppElement("#root");

const ReceiptVoucher = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id"); // id = "123"
    console.log(id);
    const [formData, setFormData] = useState({
        id: null,  // ✅ supports Edit
        voucherTypeId: 0,
        voucherNumber: "",
        voucherDate: "",
        referenceNo: "",
        narration: "",
        amount: 0,
        approvedOrVerifiedBy: null,
        entries: [
            { id: 0, ledgerID: 0, debitAmount: 0, creditAmount: 0, lineNarration: "" },
        ],
    });
    const [ledgers, setLedgers] = useState([]);
    const [users, setUsers] = useState([]);
    const [permissions, setPermissions] = useState({
        isAdd: false,
        isEdit: false,
        isView: false,
        isDelete: false,
        isPost: false,
    });
    const [editingId, setEditingId] = useState(null);
    const resetForm = () => {
        setFormData({
            id: null,  // ✅ supports Edit
            voucherNumber: "",
            voucherDate: "",
            referenceNo: "",
            narration: "",
            approvedOrVerifiedBy: null,
            entries: [
                { id: 0, ledgerID: 0, debitAmount: 0, creditAmount: 0, lineNarration: "" },
            ],
        });
        setEditingId(null);
    };
    useEffect(() => {
        LoadPages();
        if (id) {
            setEditingId(id);
            loadVoucherById(id);
        }
    }, []);
    const LoadPages = async () => {
        try {
            loadPermissions();
            loadLedgers();
            GenerateCode(id);
        } catch (err) {
            console.error("Failed to load voucher code:", err);
        }
    };
    const loadVoucherById = async (voucherId) => {
        try {
            const data = await GetVouchersById(voucherId);
            if (data.output) {
                // Map API fields to formData
                const v = data.output;
                setFormData({
                    id: v.id,
                    voucherTypeId: v.voucherTypeID,
                    voucherNumber: v.voucherNumber,
                    voucherDate: v.voucherDate,
                    referenceNo: v.referenceNo,
                    narration: v.narration,
                    approvedBy: v.approvedBy || null,
                    approvedOrVerifiedBy: v.approvedOrVerifiedBy,
                    amount: v.amount || 0,
                    entries: v.entries.map((e) => ({
                        id: e.id,
                        ledgerID: e.ledgerID,
                        debitAmount: e.debitAmount,
                        creditAmount: e.creditAmount,
                        lineNarration: e.lineNarration || "",
                    })),
                });
            }
        } catch (err) {
            toast.error("Failed to load voucher for editing");
            console.error(err);
        }
    };
    const GenerateCode = async (id) => {
        try {
            const data = await GenerateVoucherCode(STRINGS.Codes.ReceiptVoucher, id || 0 == 0 ? false : true);
            setFormData((prev) => ({
                ...prev,
                voucherNumber: data.output.voucherCode,
                voucherTypeId: data.output.voucherTypeId
            }));
            setUsers(data.output.users);
        } catch (err) {
            console.error("Failed to load voucher code:", err);
        }
    };

    const loadPermissions = async () => {
        try {
            const data = await getPermissionsByPage(STRINGS.PAGES.ReceiptVoucher);
            setPermissions(data.output || {});
        } catch {
            toast.error("Failed to load permissions");
        }
    };

    const loadLedgers = async () => {
        try {
            const data = await GetLedgersDropdown();
            setLedgers(data.output || []);
        } catch {
            toast.error("Failed to load ledgers");
        }
    };

    // Handle change for main form fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle ledger entry change
    const handleLedgerChange = (index, field, value) => {
        const updatedLedgers = [...formData.entries];
        updatedLedgers[index][field] = value;
        setFormData({ ...formData, entries: updatedLedgers });
    };

    // Add a new ledger row
    const addLedgerRow = () => {
        setFormData({
            ...formData,
            entries: [
                ...formData.entries,
                { id: 0, ledgerID: 0, debitAmount: 0, creditAmount: 0, lineNarration: "" },
            ],
        });
    };

    // Remove a ledger row
    const removeLedgerRow = (index) => {
        const updatedLedgers = formData.entries.filter((_, i) => i !== index);
        setFormData({ ...formData, entries: updatedLedgers });
    };

    // Handle save
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.voucherDate) {
            toast.error("Please select a date");
            return;
        }
        if (!formData.approvedOrVerifiedBy) {
            toast.error("Please select an Verifier");
            return;
        }
        if (formData.entries.length === 0) {
            toast.error("Please add at least one ledger entry");
            return;
        }
        // Validation: Ledger Entries count
        if (!formData.entries || formData.entries.length < 2) {
            toast.error("At least 2 ledger entries are required (Debit & Credit)");
            return;
        }
        // Validation: LedgerID should not be 0
        const invalidLedgers = formData.entries.some(
            (entry) => !entry.ledgerID || entry.ledgerID === 0
        );
        if (invalidLedgers) {
            toast.error("All ledger rows must have a valid ledger selected");
            return;
        }
        // Validation: Debit/Credit totals
        const totalDebit = formData.entries.reduce(
            (sum, entry) => sum + (parseFloat(entry.debitAmount) || 0),
            0
        );
        const totalCredit = formData.entries.reduce(
            (sum, entry) => sum + (parseFloat(entry.creditAmount) || 0),
            0
        );

        if (totalDebit <= 0 || totalCredit <= 0) {
            toast.error("Both Debit and Credit must have values");
            return;
        }

        if (totalDebit !== totalCredit) {
            toast.error(`Debit (${totalDebit}) and Credit (${totalCredit}) must be equal`);
            return;
        }
        try {
            // ✅ Get which button was clicked
            const form = e.target;
            const submitter = e.nativeEvent.submitter; // this is the clicked button
            const action = submitter?.value; // 'save' or 'post'

            // Add flags to formData
            const payload = {
                ...formData,
                isSave: action === "save" ? true : false,
                isPost: action === "post" ? true : false,
                amount: totalDebit
            };

            if (editingId) {
                if (!permissions.isEdit) {
                    toast.error("You don't have permission to edit pages");
                    return;
                }
                await UpdateVouchers(editingId, payload);
                toast.success('Receipt Voucher updated successfully');
            } else {
                if (!permissions.isAdd) {
                    toast.error("You don't have permission to create pages");
                    return;
                }
                await CreateVouchers(payload);
                toast.success('Receipt Voucher created successfully');
            }

            // Remove the `id` query parameter
            const url = new URL(window.location.href);
            url.searchParams.delete("id");

            // Replace the URL without reloading the page
            window.location.href = url.toString();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="modules-page">
            <h2>🧾 {editingId ? "Edit" : "Create"} Receipt Voucher</h2>

            <form onSubmit={handleSubmit} className="module-form">
                {/* Header section */}
                <div className="form-section">
                    <div className="form-row">
                        <div className="form-column">
                            <label>Voucher No.</label>
                        </div>
                        <div className="form-column">
                            <input
                                type="text"
                                name="voucherNumber"
                                value={formData.voucherNumber}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-column">
                            <label>voucher Date</label>
                        </div>
                        <div className="form-column">
                            <input
                                type="date"
                                name="voucherDate"
                                value={formData.voucherDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-column">
                            <label>Reference No.</label>
                        </div>
                        <div className="form-column">
                            <input
                                type="text"
                                name="referenceNo"
                                value={formData.referenceNo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-column">
                            <label>Narration</label>
                        </div>
                        <div className="form-column">
                            <input
                                type="text"
                                name="narration"
                                value={formData.narration}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Ledger Entries Table */}
                <table className="module-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Debit Amount</th>
                            <th>Credit Amount</th>
                            <th>Description</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.entries.map((entry, index) => (
                            <tr key={index}>
                                {/* Hidden ID field */}
                                <input type="hidden" value={entry.id} />
                                <td>
                                    <select
                                        className="form-select"
                                        value={entry.ledgerID}
                                        onChange={(e) =>
                                            handleLedgerChange(index, "ledgerID", parseInt(e.target.value))
                                        }
                                        required
                                    >
                                        <option value={0}>-- Select Ledgers --</option>
                                        {buildHierarchy(ledgers).map((ledger) => (
                                            <option key={ledger.id} value={ledger.id}>
                                                {ledger.displayName}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={entry.debitAmount}
                                        onChange={(e) =>
                                            handleLedgerChange(index, "debitAmount", allowTwoDecimals(e.target.value))
                                        }
                                        onPaste={(e) => {
                                            const sanitized = handleDecimalPaste(e);
                                            handleLedgerChange(index, "debitAmount", sanitized);
                                        }}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={entry.creditAmount}
                                        onChange={(e) =>
                                            handleLedgerChange(index, "creditAmount", allowTwoDecimals(e.target.value))
                                        }
                                        onPaste={(e) => {
                                            const sanitized = handleDecimalPaste(e);
                                            handleLedgerChange(index, "creditAmount", sanitized);
                                        }}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={entry.lineNarration}
                                        onChange={(e) =>
                                            handleLedgerChange(index, "lineNarration", e.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => removeLedgerRow(index)}
                                        disabled={formData.entries.length === 1}
                                    >
                                        ➖
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button type="button" onClick={addLedgerRow}>
                    ➕ Add Row
                </button>

                {/* Verified By */}
                <div className="verified-section">
                    <label>Verified By</label>
                    <select
                        className="form-select"
                        name="approvedOrVerifiedBy"
                        value={formData.approvedOrVerifiedBy}
                        onChange={handleChange}
                    >
                        <option value="">-- Select User --</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Buttons */}
                <div className="action-buttons form-row">
                    <div className="form-column">
                        {permissions.isPost && (
                            <button type="submit" name="action" value="post" className="save-btn">
                                Post
                            </button>
                        )}
                    </div>
                    <div className="form-column">
                        {permissions.isAdd && (
                            <button type="submit" name="action" value="save" className="save-btn">
                                Save
                            </button>
                        )}
                    </div>
                    <div className="form-column">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() =>
                                setFormData({
                                    id: 0,
                                    voucherNumber: "",
                                    voucherDate: "",
                                    referenceNo: "",
                                    narration: "",
                                    approvedOrVerifiedBy: "",
                                    entries: [
                                        { id: 0, ledgerID: 0, debitAmount: 0, creditAmount: 0, lineNarration: "" },
                                    ],
                                })
                            }
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ReceiptVoucher;
