import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    GetVouchersList,
    DeleteVoucher,
    GetVoucherEntriesById
} from "../services/authService";
import "react-toastify/dist/ReactToastify.css";
import "./SubModulesPage.css";
import STRINGS from "../constants/strings";

const ReceiptVoucherList = () => {
    const [activeRow, setActiveRow] = useState(null);
    const [vouchers, setVouchers] = useState([]);
    const [expandedRows, setExpandedRows] = useState({}); // keep track of expanded rows
    const [voucherEntries, setVoucherEntries] = useState({}); // store entries per voucher
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    // Load vouchers
    const loadVouchers = async () => {
        try {
            const res = await GetVouchersList(STRINGS.Codes.ReceiptVoucher);
            setVouchers(res.output || []);
        } catch (err) {
            toast.error("Failed to load vouchers");
            console.error(err);
        }
    };

    useEffect(() => {
        loadVouchers();
    }, []);

    // Toggle voucher entries
    const toggleEntries = async (voucherId) => {
        if (expandedRows[voucherId]) {
            setExpandedRows({ ...expandedRows, [voucherId]: false });
        } else {
            if (!voucherEntries[voucherId]) {
                // Load entries from API
                try {
                    const res = await GetVoucherEntriesById(voucherId);
                    setVoucherEntries({
                        ...voucherEntries,
                        [voucherId]: res.output || [],
                    });
                } catch (err) {
                    toast.error("Failed to load voucher entries");
                    return;
                }
            }
            setExpandedRows({ ...expandedRows, [voucherId]: true });
        }
    };

    // Delete voucher
    const handleDeleteRequest = (id) => setConfirmDeleteId(id);
    const handleDelete = async (id) => {
        //if (!permissions.isDelete) {
        //    toast.error("You don't have permission to delete pages");
        //    return;
        //}
        try {
            await DeleteVoucher(id);
            toast.success('Receipt Voucher deleted!');
            setConfirmDeleteId(null);
            loadVouchers();
        } catch (err) {
            toast.error('Delete failed');
        }
    };
    // Edit voucher
    const handleEdit = (voucherId) => {
        // Redirect to ReceiptVoucher page with id query param
        window.location.href = `/receipt?id=${voucherId}`;
    };

    return (
        <div className="modules-page">
            <h2>🧾 Receipt Vouchers</h2>

            <table className="module-table">
                <thead>
                    <tr>
                        <th>Voucher No.</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Verified By</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vouchers.map((v, index) => (
                        <React.Fragment key={v.id}>
                            <tr className="voucher-row"
                                onClick={() =>
                                    setActiveRow(activeRow === index ? null : index)
                                }
                                style={{ cursor: "pointer" }}>
                                <td>{v.voucherNumber}</td>
                                <td>{v.voucherDate}</td>
                                <td>{v.amount}</td>
                                <td>{v.approvedOrVerifiedByName || "-"}</td>
                                <td>
                                    <button className="action-btn edit" onClick={() => toggleEntries(v.id)}>
                                        {expandedRows[v.id] ? "Voucher Entries" : "Voucher Entries"}
                                    </button>
                                    <button className="action-btn edit" onClick={() => handleEdit(v.id)}>Edit</button>
                                    <button className="action-btn delete" onClick={() => handleDeleteRequest(v.id)}>Delete</button>
                                </td>
                            </tr>
                            {expandedRows[v.id] && voucherEntries[v.id] && (
                                <tr className="voucher-entries-row" style={{ display: activeRow === index ? "table-row" : "none" }}>
                                    <td colSpan={5}>
                                        <table className="module-table">
                                            <thead>
                                                <tr>
                                                    <th>Ledger</th>
                                                    <th>Debit Amount</th>
                                                    <th>Credit Amount</th>
                                                    <th>Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {voucherEntries[v.id].map((entry) => (
                                                    <tr key={entry.id}>
                                                        <td>{entry.ledgerName}</td>
                                                        <td>{entry.debitAmount}</td>
                                                        <td>{entry.creditAmount}</td>
                                                        <td>{entry.lineNarration}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            {confirmDeleteId !== null && (
                <div className="confirm-modal">
                    <div className="confirm-box">
                        <h4>Are you sure you want to delete this module page?</h4>
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

export default ReceiptVoucherList;
