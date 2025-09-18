import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import {
    getRoles,
    getModulePages,
    getPermissionsByUserRole,
    updatePermissions,
    getPermissionsByPage, // 👈 Added
} from '../services/authService';
import STRINGS from '../constants/strings'; // 👈 Added for page constants
import "react-toastify/dist/ReactToastify.css";
import './company.css';

Modal.setAppElement("#root");
const actions = ["Add", "Edit", "View", "Delete", "Print", "Download"];

const UserRolePermissions = () => {
    const [roles, setRoles] = useState([]);
    const [pages, setPages] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [permissions, setPermissions] = useState({});
    const [pagePermissions, setPagePermissions] = useState({
        isAdd: false,
        isEdit: false,
        isView: false,
        isDelete: false,
        isPrint: false,
        isDownload: false,
    });

    useEffect(() => {
        loadPagePermissions();
        loadRoles();
        loadPages();
    }, []);

    const loadPagePermissions = async () => {
        try {
            const data = await getPermissionsByPage(STRINGS.PAGES.Role_Permissions);
            setPagePermissions(data.output || {});
        } catch {
            toast.error("Failed to load page permissions");
        }
    };

    const loadRoles = async () => {
        try {
            let roleData = await getRoles();
            setRoles(roleData?.output || []);
        } catch (err) {
            console.error("Failed to load roles:", err);
        }
    };

    const loadPages = async () => {
        try {
            let pageData = await getModulePages();
            let list = pageData?.output || pageData || [];
            setPages(list);
        } catch (err) {
            console.error("Failed to load pages:", err);
        }
    };

    const handleRoleChange = async (roleId) => {
        const id = Number(roleId);
        setSelectedRole(id);
        setPermissions({});

        if (!id) return;

        try {
            const raw = await getPermissionsByUserRole(id);

            let permsArray = [];
            if (!raw) permsArray = [];
            else if (Array.isArray(raw.page)) permsArray = raw.page;
            else if (Array.isArray(raw.pages)) permsArray = raw.pages;
            else if (Array.isArray(raw.output?.page)) permsArray = raw.output.page;
            else if (Array.isArray(raw.output)) permsArray = raw.output;
            else if (Array.isArray(raw.data)) permsArray = raw.data;
            else if (Array.isArray(raw.data?.page)) permsArray = raw.data.page;
            else if (Array.isArray(raw)) permsArray = raw;

            const mapped = {};
            pages.forEach((p) => {
                mapped[p.id] = actions.reduce((acc, act) => {
                    acc[act] = false;
                    return acc;
                }, {});
            });

            permsArray.forEach((p) => {
                const pid = p.pageId ?? p.PageId ?? p.id;
                if (!pid) return;

                mapped[pid] = {
                    Add: !!(p.add ?? p.Add ?? p.isAdd ?? p.IsAdd),
                    Edit: !!(p.edit ?? p.Edit ?? p.isEdit ?? p.IsEdit),
                    View: !!(p.view ?? p.View ?? p.isView ?? p.IsView),
                    Delete: !!(p.delete ?? p.Delete ?? p.isDelete ?? p.IsDelete),
                    Print: !!(p.print ?? p.Print ?? p.isPrint ?? p.IsPrint),
                    Download: !!(p.download ?? p.Download ?? p.isDownload ?? p.IsDownload),
                };
            });

            setPermissions(mapped);
        } catch (err) {
            console.error("Failed to load permissions:", err);
            toast.error("Failed to load role permissions");
        }
    };

    const togglePermission = (pageId, action) => {
        if (!pagePermissions[`is${action}`]) return; // 🔒 Respect action-level permission

        setPermissions((prev) => ({
            ...prev,
            [pageId]: {
                ...prev[pageId],
                [action]: !prev[pageId]?.[action],
            },
        }));
    };

    const toggleSelectAll = (action) => {
        if (!pagePermissions[`is${action}`]) return;

        const allChecked = pages.every((p) => permissions[p.id]?.[action]);
        const updated = { ...permissions };

        pages.forEach((page) => {
            if (!updated[page.id]) updated[page.id] = {};
            updated[page.id][action] = !allChecked;
        });

        setPermissions(updated);
    };

    const isActionFullySelected = (action) =>
        pages.length > 0 && pages.every((p) => permissions[p.id]?.[action]);

    const handleSave = async () => {
        if (!pagePermissions.isEdit) {
            toast.error("You don't have permission to save permissions");
            return;
        }

        if (!selectedRole) {
            toast.error("Please select a role first");
            return;
        }

        const payload = {
            userRoleId: Number(selectedRole),
            page: pages.map((p) => ({
                pageId: p.id,
                subModuleId: p.subModuleId || 0,
                add: permissions[p.id]?.Add || false,
                edit: permissions[p.id]?.Edit || false,
                view: permissions[p.id]?.View || false,
                delete: permissions[p.id]?.Delete || false,
                print: permissions[p.id]?.Print || false,
                download: permissions[p.id]?.Download || false,
            })),
        };

        try {
            const result = await updatePermissions(payload);
            toast.success(result.message || "Permissions saved successfully!");
        } catch (error) {
            console.error("Error saving permissions:", error);
            toast.error("Failed to save permissions");
        }
    };

    return (
        <div className="modules-page">
            <h2>🔐 User Role Permissions</h2>

            {/* Role Dropdown */}
            <div className="form-row">
                <div className="form-column">
                    <label><strong>Select Role:</strong></label>
                </div>
                <div className="form-column">
                    <select
                        className="form-select"
                        value={selectedRole}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        required
                    >
                        <option value="">-- Select Role --</option>
                        {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Permissions Table */}
            {pagePermissions.isView && (
                <table className="module-table" style={{ marginTop: "20px" }}>
                    <thead>
                        <tr>
                            <th>Page <br /> Select All</th>
                            {actions.map((a) => (
                                <th key={a}>
                                    {a} <br />
                                    <input
                                        type="checkbox"
                                        checked={isActionFullySelected(a)}
                                        onChange={() => toggleSelectAll(a)}
                                        disabled={!pagePermissions[`is${a}`]} // 🔒 Disable if no permission
                                    />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map((page) => (
                            <tr key={page.id}>
                                <td>{page.pageName}</td>
                                {actions.map((a) => (
                                    <td key={a}>
                                        <input
                                            type="checkbox"
                                            checked={permissions[page.id]?.[a] || false}
                                            onChange={() => togglePermission(page.id, a)}
                                            disabled={!pagePermissions[`is${a}`]} // 🔒 Disable if no permission
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {pagePermissions.isEdit && (
                <button className="create-btn mt4" onClick={handleSave}>
                    💾 Save Permissions
                </button>
            )}
        </div>
    );
};

export default UserRolePermissions;
