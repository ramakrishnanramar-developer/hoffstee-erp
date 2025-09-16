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
  BASE_URL
} from '../services/authService'; // ensure these support FormData for create/update
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
  logoPath: '', // existing logo URL/key returned from backend
  isActive: true
};

const CompanyPage = () => {
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [logoFile, setLogoFile] = useState(null); // actual File object when user selects file
  const [logoPreview, setLogoPreview] = useState(''); // preview URL (object URL or existing URL)
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompanies();
    // cleanup preview object URL on unmount
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // revoke previous preview if it was a blob
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }

    if (file) {
      const objUrl = URL.createObjectURL(file);
      setLogoPreview(objUrl);
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
      // Build FormData to support file upload (multipart/form-data)
      const fd = new FormData();

      // Append scalar fields
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

      // If user selected a new file, append it. Backend should accept field name "logo"
      if (logoFile) {
        fd.append('LogoFile', logoFile);
      } else if (formData.logoPath) {
        // If no new file but existing logoPath present, send it so backend can keep it
        fd.append('logoPath', formData.logoPath);
      }

      // If editing include id
      if (editingId) {
        fd.append('id', editingId);
        // Ensure your updateCompany accepts FormData; it should send as multipart/form-data
        await updateCompany(editingId, fd);
        toast.success('Company updated successfully');
      } else {
        await createCompany(fd);
        toast.success('Company created successfully');
      }

      // cleanup and reload
      resetForm();
      setIsModalOpen(false);
      await loadCompanies();
    } catch (err) {
      console.error('Save failed', err?.response?.data || err.message || err);
      toast.error('Save failed');
    }
  };

  const handleEdit = async (id) => {
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
        logoPath: data.logoPath ?? '', // existing URL/key returned by API
        isActive: data.isActive ?? true
      });

      // show preview using existing logoPath (if available)
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

      <button className="create-btn mt4" onClick={openCreate}>
        Create Company
      </button>

      {loading ? (
        <p>Loading companies...</p>
      ) : (
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
              <th>Actions</th>
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
                  <button className="action-btn edit" onClick={() => handleEdit(c.id)}>✏️ Edit</button>
                  <button className="action-btn delete" onClick={() => handleDeleteRequest(c.id)}>🗑️ Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>No companies found</td>
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
        <h3>{editingId ? 'Edit Company' : 'Create Company'}</h3>

        <form onSubmit={handleSubmit} className="module-form" encType="multipart/form-data">
          <div className="form-row">
            <div className="form-column">
              <input
                type="text"
                placeholder="Company Code *"
                value={formData.companyCode}
                onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })}
                required
              />
            </div>
            <div className="form-column">
              <input
                type="text"
                placeholder="Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

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
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

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
                placeholder="Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
          </div>

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
                placeholder="GSTIN"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-column">
              <input
                type="text"
                placeholder="Registration No"
                value={formData.registrationNo}
                onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
              />
            </div>
            <div className="form-column">
              <input
                type="text"
                placeholder="Base Currency"
                value={formData.baseCurrency}
                onChange={(e) => setFormData({ ...formData, baseCurrency: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-column">
              <label>Financial Year Start</label>
              <input
                type="date"
                value={formData.financialYearStart}
                onChange={(e) => setFormData({ ...formData, financialYearStart: e.target.value })}
              />
            </div>
            <div className="form-column">
              <label>Financial Year End</label>
              <input
                type="date"
                value={formData.financialYearEnd}
                onChange={(e) => setFormData({ ...formData, financialYearEnd: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-column">
              <input
                type="text"
                placeholder="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            <div className="form-column">
              <input
                type="text"
                placeholder="Industry Type"
                value={formData.industryType}
                onChange={(e) => setFormData({ ...formData, industryType: e.target.value })}
              />
            </div>
          </div>

          {/* Logo upload (changed to file input with preview) */}
          <div className="form-row">
            <div className="form-column">
              <label style={{ marginBottom: 6 }}>Upload Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <small style={{ display: 'block', marginTop: 6, color: '#666' }}>
                Supported: jpg, png, gif, svg
              </small>
            </div>
            <div className="form-column" style={{ alignItems: 'center', justifyContent: 'center' }}>
              {logoPreview ? (
                // show preview (constrain size)
                <img
                  src={logoPreview &&
                    (logoPreview.includes('http') || logoPreview.includes('https') || logoPreview.includes('localhost'))
                      ? logoPreview
                      : `${BASE_URL}${logoPreview}`
                  }
                  alt="Logo preview"
                  style={{ maxWidth: '120px', maxHeight: '80px', objectFit: 'contain', border: '1px solid #eee', padding: 6, borderRadius: 4 }}
                />
              ) : (
                <div style={{ width: 120, height: 80, border: '1px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', borderRadius: 4 }}>
                  No logo
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
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
            <div className="form-column">
              {/* placeholder to keep two-column layout aligned */}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit">{editingId ? 'Update' : 'Create'} Company</button>
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
