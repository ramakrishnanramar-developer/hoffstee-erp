
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import {
  getModulePages,
  createModulePages,
  getModulePagesById,
  updateModulePages,
  deleteModulePages,
  getModuleDropdown,
  getSubModuleDropdown
} from '../services/authService';
import 'react-toastify/dist/ReactToastify.css';
import './SubModulesPage.css';

Modal.setAppElement('#root');

const ModuleAddPages = () => {
    const [modulePages, setModulePages] = useState([]);
    const [modules, setModules] = useState([]);
    const [subModules, setSubModules] = useState([]);
    const [formData, setFormData] = useState({
      id: null,
      pageName: '',
      pageUrl: '',
      description:'',
      status: true,
      priority: 1,
      moduleId:0,
      subModuleId:0,
      module:'',
      subModule:'',
    });
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

     useEffect(() => {
        if (isModalOpen) {
          console.log('Modal mode:', editingId ? 'Edit' : 'Create');
        }
        loadModulePages();
      }, [editingId, isModalOpen]);

      const loadModulePages = async () => {
         try {
              let data = await getModulePages();
              let list = Array.isArray(data) ? data : data?.output || [];
              setModulePages(list);

              data = await getModuleDropdown();
              list = Array.isArray(data) ? data : data?.output || [];
              setModules(list);

              data = await getSubModuleDropdown();
              list = Array.isArray(data) ? data : data?.output || [];
              setSubModules(list);
            } catch (err) {
              toast.error('Failed to load modules');
            }
        };

        const handleSubmit = async (e) => {
              e.preventDefault();

              if (!formData.pageName.trim() || !formData.pageUrl.trim()) {
                toast.error('Page Name and URL are required');
                return;
              }
              if (formData.moduleId === 0) {
                toast.error('Please select Module!');
                return;
              }
              if (formData.subModuleId === 0) {
                toast.error('Please select Sub Module!');
                return;
              }

              const cleanData = {
                id: formData.id,
                pageName: formData.pageName.trim(),
                pageUrl: formData.pageUrl.trim(),
                description: formData.description.trim(),
                status: Boolean(formData.status),
                priority: parseInt(formData.priority) > 0 ? parseInt(formData.priority) : 1,
                moduleId: parseInt(formData.moduleId),
                subModuleId: parseInt(formData.subModuleId),
              };

              try {
                if (editingId) {
                  await updateModulePages(editingId, cleanData);
                  toast.success('Module Page updated successfully');
                } else {
                  await createModulePages(cleanData);
                  toast.success('Module Page created successfully');
                }

                setFormData({
                  id: null,
                  pageName: '',
                  pageUrl: '',
                  description: '',
                  status: true,
                  priority: 1,
                  moduleId: 0,
                  subModuleId: 0,
                  module: '',
                  subModule: '',
                });
                setEditingId(null);
                setIsModalOpen(false);
                loadModulePages();
              } catch (err) {
                console.error('Save failed:', err.response?.data || err.message);
                toast.error('Save failed');
              }
          };

          const handleEdit = async (id) => {
            try {
              console.log('Editing module:', id);
              const mod = await getModulePagesById(id);
              const data = mod.output;
              console.log(data);
              if (!data || !data.id) {
                toast.error('Invalid module page data received');
                return;
              }
          
              setFormData({
                id: data.id,
                pageName: data.pageName || '',
                pageUrl: data.pageUrl || '',
                description:data.description || '',
                status: data.status ?? true,
                priority: data.priority ?? 1,
                moduleId: data.moduleId ?? 0,
                subModuleId: data.subModuleId ?? 0
              });
              console.log('Editing:', data.id)
          
              setEditingId(data.id);
              setIsModalOpen(true);
            } catch (err) {
              toast.error('Failed to load module page details');
              console.error('Module page fetch failed:', err);
            }
          };

          const handleDeleteRequest = (id) => {
            setConfirmDeleteId(id);
          };

           const handleDelete = async (id) => {
              try {
                await deleteModulePages(id);
                toast.success('Module Page deleted');
                setConfirmDeleteId(null);
                loadModulePages();
              } catch (err) {
                toast.error('Delete failed');
              }
            };

             return (
                <div className="modules-page">
                  <h2>📦 Module Pages Management</h2>
                  <button className="create-btn mt4" onClick={() => setIsModalOpen(true)}>
                    Create Module Pages
                  </button>
            
                 <Modal
                         isOpen={isModalOpen}
                         onRequestClose={() => {
                           setIsModalOpen(false);
                           setFormData({
                            id: null,
                            pageName: '',
                            pageUrl: '',
                            description:'',
                            status:  true,
                            priority:  1,
                            moduleId:  0,
                            subModuleId:  0
                           });
                           setEditingId(null);
                         }}
                         className="edit-modal"
                       >
                       {/* {console.log('Modal mode:', editingId ? 'Edit' : 'Create')} */}
                 
                         <h3>{editingId ? 'Edit Module' : 'Create Module Page'}</h3>
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
                           <select className="form-select"
                            value={formData.moduleId}
                            onChange={(e) => setFormData({ ...formData, moduleId: parseInt(e.target.value) })}
                            required
                          >
                            <option value={0}>-- Select Module --</option>
                            {modules.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>

                          <select className="form-select"
                            value={formData.subModuleId}
                            onChange={(e) => setFormData({ ...formData, subModuleId: parseInt(e.target.value) })}
                            required
                          >
                            <option value={0}>-- Select Sub Module --</option>
                            {subModules.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                           <input
                             type="text"
                             placeholder="Page Name"
                             value={formData.pageName ?? ''}
                             onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
                             className={formData.pageName.trim() === '' ? 'error' : ''}
                             required
                           />
                           <input
                             type="text"
                             placeholder="Page Url"
                             value={formData.pageUrl ?? ''}
                             onChange={(e) => setFormData({ ...formData, pageUrl: e.target.value })}
                             className={formData.pageUrl.trim() === '' ? 'error' : ''}
                             required
                           />
                           <input
                             type="text"
                             placeholder="Description"
                             value={formData.description ?? ''}
                             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                             className={formData.description.trim() === '' ? 'error' : ''}
                           />
                           <input
                             type="number"
                             placeholder="Priority"
                             value={formData.priority ?? ''}
                             onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                             min={1}
                             required
                           />
                           <label className="switch">
                             <input
                               type="checkbox"
                               checked={formData.status ?? ''}
                               onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                             />
                             <span className="slider"></span>
                           </label>
                           <button type="submit">{editingId ? 'Update' : 'Create'} Module</button>
                         </form>
                       </Modal>
            
                  <table className="module-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Page Name</th>
                        <th>Page URL</th>
                        <th>Module Name</th>
                        <th>subModule Name</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(modulePages) && modulePages.map((mod) => (
                        <tr key={mod.id}>
                          <td>{mod.id}</td>
                          <td>{mod.pageName}</td>
                          <td>{mod.pageUrl}</td>
                          <td>{mod.module}</td>
                          <td>{mod.subModule}</td>
                          <td>{mod.status ? 'Active' : 'Inactive'}</td>
                          <td>{mod.priority}</td>
                          <td>
                            <button className="action-btn edit" onClick={() => handleEdit(mod.id)}>✏️ Edit</button>
                            <button className="action-btn delete" onClick={() => handleDeleteRequest(mod.id)}>🗑️ Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
            
                  {confirmDeleteId !== null && (
                      <div className="confirm-modal">
                        <div className="confirm-box">
                          <h4>Are you sure you want to delete this module?</h4>
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

export default ModuleAddPages;