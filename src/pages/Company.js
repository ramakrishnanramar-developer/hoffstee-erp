// CompanyPage.js
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import {
    getCompanies,
    createCompany,
    getCompanyById,
    updateCompany,
    deleteCompany,
    getPermissionsByPage,   // 👈 Added
    BASE_URL
} from '../services/authService';
import STRINGS from '../constants/strings'; // 👈 Added
import 'react-toastify/dist/ReactToastify.css';
import './company.css';

Modal.setAppElement('#root');

const initialForm = {
    id: null,
    companyCode: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    pan: '',
    gstin: '',
    registrationNo: '',
    financialYearStart: '',
    financialYearEnd: '',
    baseCurrency: '',
    type: '',
    industryType: '',
    logoPath: '',
    isActive: true
};

const CompanyPage = () => {
    const [companies, setCompanies] = useState([]);
    const [formData, setFormData] = useState(initialForm);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [loading, setLoading] = useState(false);

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
        loadCompanies();

        return () => {
            if (logoPreview && logoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadPermissions = async () => {
        try {
            const data = await getPermissionsByPage(STRINGS.PAGES.Company);
            setPermissions(data.output || {});
        } catch {
            toast.error('Failed to load permissions');
        }
    };

    const loadCompanies = async () => {
        setLoading(true);
        try {
            const data = await getCompanies();
            const list = Array.isArray(data) ? data : data?.output || [];
            setCompanies(list);
        } catch (err) {
            console.error('Load companies failed', err);
            toast.error('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        if (!permissions.isAdd) {
            toast.error("You don't have permission to add companies");
            return;
        }
        resetForm();
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData(initialForm);
        setLogoFile(null);
        if (logoPreview && logoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(logoPreview);
        }
        setLogoPreview('');
        setEditingId(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        setLogoFile(file);

        if (logoPreview && logoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(logoPreview);
        }

        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setLogoPreview(formData.logoPath || '');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.companyCode.trim() || !formData.name.trim()) {
            toast.error('Company Code and Name are required');
            return;
        }
        if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
            toast.error('Invalid email format');
            return;
        }

        try {
            const fd = new FormData();
            fd.append('companyCode', formData.companyCode.trim());
            fd.append('name', formData.name.trim());
            fd.append('address', formData.address?.trim() || '');
            fd.append('phone', formData.phone?.trim() || '');
            fd.append('email', formData.email?.trim() || '');
            fd.append('website', formData.website?.trim() || '');
            fd.append('pan', formData.pan?.trim() || '');
            fd.append('gstin', formData.gstin?.trim() || '');
            fd.append('registrationNo', formData.registrationNo?.trim() || '');
            fd.append('financialYearStart', formData.financialYearStart || '');
            fd.append('financialYearEnd', formData.financialYearEnd || '');
            fd.append('baseCurrency', formData.baseCurrency?.trim() || '');
            fd.append('type', formData.type?.trim() || '');
            fd.append('industryType', formData.industryType?.trim() || '');
            fd.append('isActive', formData.isActive ? 'true' : 'false');

            if (logoFile) {
                fd.append('LogoFile', logoFile);
            } else if (formData.logoPath) {
                fd.append('logoPath', formData.logoPath);
            }

            if (editingId) {
                if (!permissions.isEdit) {
                    toast.error("You don't have permission to edit companies");
                    return;
                }
                fd.append('id', editingId);
                await updateCompany(editingId, fd);
                toast.success('Company updated successfully');
            } else {
                if (!permissions.isAdd) {
                    toast.error("You don't have permission to create companies");
                    return;
                }
                await createCompany(fd);
                toast.success('Company created successfully');
            }

            resetForm();
            setIsModalOpen(false);
            await loadCompanies();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = async (id) => {
        if (!permissions.isEdit) {
            toast.error("You don't have permission to edit companies");
            return;
        }
        try {
            const res = await getCompanyById(id);
            const data = res?.output ?? res;
            if (!data || !data.id) {
                toast.error('Invalid company data received');
                return;
            }

            setFormData({
                id: data.id,
                companyCode: data.companyCode ?? '',
                name: data.name ?? '',
                address: data.address ?? '',
                phone: data.phone ?? '',
                email: data.email ?? '',
                website: data.website ?? '',
                pan: data.pan ?? '',
                gstin: data.gstin ?? '',
                registrationNo: data.registrationNo ?? '',
                financialYearStart: data.financialYearStart ? data.financialYearStart.split('T')[0] : '',
                financialYearEnd: data.financialYearEnd ? data.financialYearEnd.split('T')[0] : '',
                baseCurrency: data.baseCurrency ?? '',
                type: data.type ?? '',
                industryType: data.industryType ?? '',
                logoPath: data.logoPath ?? '',
                isActive: data.isActive ?? true
            });

            setLogoFile(null);
            setLogoPreview(data.logoPath ?? '');

            setEditingId(data.id);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Fetch company failed', err);
            toast.error('Failed to load company details');
        }
    };

    const handleDeleteRequest = (id) => setConfirmDeleteId(id);

    const handleDelete = async (id) => {
        if (!permissions.isDelete) {
            toast.error("You don't have permission to delete companies");
            return;
        }
        try {
            await deleteCompany(id);
            toast.success('Company deleted');
            setConfirmDeleteId(null);
            await loadCompanies();
        } catch (err) {
            console.error('Delete failed', err);
            toast.error('Delete failed');
        }
    };

    return (
        <div className="modules-page">
            <h2>🏢 Company Management</h2>

            {/* Add button permission */}
            {permissions.isAdd && (
                <button className="create-btn mt4" onClick={openCreate}>
                    Create Company
                </button>
            )}

            {loading ? (
                <p>Loading companies...</p>
            ) : (
                permissions.isView && ( // 👈 View permission
                    <table className="module-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Company Code</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Base Currency</th>
                                <th>Active</th>
                                {(permissions.isEdit || permissions.isDelete) && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {companies.length > 0 ? companies.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.companyCode}</td>
                                    <td>{c.name}</td>
                                    <td>{c.phone}</td>
                                    <td>{c.email}</td>
                                    <td>{c.baseCurrency}</td>
                                    <td>{c.isActive ? 'Yes' : 'No'}</td>
                                    <td>
                                        {permissions.isEdit && (
                                            <button className="action-btn edit" onClick={() => handleEdit(c.id)}>✏️ Edit</button>
                                        )}
                                        {permissions.isDelete && (
                                            <button className="action-btn delete" onClick={() => handleDeleteRequest(c.id)}>🗑️ Delete</button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center' }}>No companies found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )
            )}

            {/* Modal and Delete Confirm stay same... */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                className="edit-modal"
            >
                <h3>{editingId ? 'Edit Company' : 'Create Company'}</h3>
                {/* form unchanged */}
            </Modal>

            {confirmDeleteId !== null && (
                <div className="confirm-modal">
                    <div className="confirm-box">
                        <h4>Are you sure you want to delete this company?</h4>
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

export default CompanyPage;
