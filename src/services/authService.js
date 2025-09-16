// src/services/authService.js
import axios from 'axios';
import api from './axiosInstance';

export  const BASE_URL = 'https://localhost:7260/api';

export const login = (email, password) => {
  return axios.post(`${BASE_URL}/Auth/login`, { email, password });
};

export const refreshTokendata = (accessToken, refreshToken) => {
  return axios.post(`${BASE_URL}/Auth/refresh`, { accessToken, refreshToken });
};

export const forgotPassword = (email) => {
  return axios.post(`${BASE_URL}/Password/forgot`, { email });
};

export const resetPassword = (data) => {
  return axios.post(`${BASE_URL}/Password/reset`, data);
};

export const confirmReset = (data) => {
  return axios.post(`${BASE_URL}/Password/confirm-reset`, data);
};

//User id fetch

export const getUserById = async (id) => {
  const response = await api.get(`/Users/${id}`);
  return response.data.output || response.data;
};


// src/services/authService.js
export const getSidebarModules = async () => {
  try {
    const response = await api.get('/ModulePage/List');
    return response.data;
  } catch (error) {
    console.error('Sidebar fetch failed:', error);
    throw error;
  }
};

// getModules
export const getModules = async () => {
  try {
    const response = await api.get('/Modules');
    return response.data;
  } catch (error) {
    console.error('GET /Modules failed:', error);
    throw error;
  }
};

//createModule

export const createModule = async (data) => {
  try {
    const response = await api.post('/Modules', data);
    return response.data;
  } catch (error) {
    console.error('POST/Modules failed:', error);
    throw error;
  }
};

//getModuleById

export const getModuleById = async (id) => {
  try {
    const response = await api.get(`/Modules/${id}`);
    return response.data;
  } catch (error) {
    console.error(`GET /Modules/${id} failed:`, error);
    throw error;
  }
};

//updateModule

export const updateModule = async (id, data) => {
  try {
    const response = await api.put(`/Modules/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`PUT /Modules/${id} failed:`, error);
    throw error;
  }
};

// deleteModule

export const deleteModule = async (id) => {
  try {
    const response = await api.delete(`/Modules/${id}`);
    return response.data;
  } catch (error) {
    console.error(`DELETE /Modules/${id} failed:`, error);
    throw error;
  }
};

// get SubModules
export const getSubModules = async () => {
  try {
    const response = await api.get('/SubModule');
    return response.data;
  } catch (error) {
    console.error('GET /SubModules failed:', error);
    throw error;
  }
};

//createModule

export const createSubModule = async (data) => {
  try {
    const response = await api.post('/SubModule', data);
    return response.data;
  } catch (error) {
    console.error('POST/SubModules failed:', error);
    throw error;
  }
};

//getModuleById

export const getSubModuleById = async (id) => {
  try {
    const response = await api.get(`/SubModule/${id}`);
    return response.data;
  } catch (error) {
    console.error(`GET /SubModules/${id} failed:`, error);
    throw error;
  }
};

//updateModule

export const updateSubModule = async (id, data) => {
  try {
    const response = await api.put(`/SubModule/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`PUT /SubModules/${id} failed:`, error);
    throw error;
  }
};

// deleteModule

export const deleteSubModule = async (id) => {
  try {
    const response = await api.delete(`/SubModule/${id}`);
    return response.data;
  } catch (error) {
    console.error(`DELETE /SubModules/${id} failed:`, error);
    throw error;
  }
};
// get SubModules
export const getModulePages = async () => {
  try {
    const response = await api.get('/ModulePage');
    return response.data;
  } catch (error) {
    console.error('GET /SubModules failed:', error);
    throw error;
  }
};

//createModule

export const createModulePages = async (data) => {
  try {
    const response = await api.post('/ModulePage', data);
    return response.data;
  } catch (error) {
    console.error('POST/ModulePages failed:', error);
    throw error;
  }
};

//getModuleById

export const getModulePagesById = async (id) => {
  try {
    const response = await api.get(`/ModulePage/${id}`);
    return response.data;
  } catch (error) {
    console.error(`GET /ModulePages/${id} failed:`, error);
    throw error;
  }
};

//updateModule

export const updateModulePages = async (id, data) => {
  try {
    const response = await api.put(`/ModulePage/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`PUT /ModulePages/${id} failed:`, error);
    throw error;
  }
};

// deleteModule

export const deleteModulePages = async (id) => {
  try {
    const response = await api.delete(`/ModulePage/${id}`);
    return response.data;
  } catch (error) {
    console.error(`DELETE /ModulePages/${id} failed:`, error);
    throw error;
  }
};

export const getModuleDropdown = async () => {
  try {
    const response = await api.get('/Modules/dropdown');
    return response.data;
  } catch (error) {
    console.error('GET /Modules dropdown failed:', error);
    throw error;
  }
};
export const getSubModuleDropdown = async () => {
  try {
    const response = await api.get('/SubModule/dropdown');
    return response.data;
  } catch (error) {
    console.error('GET /SubModule dropdown failed:', error);
    throw error;
  }
};

// get SubModules
export const getCompanies = async () => {
  try {
    const response = await api.get('/Companies');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('GET /company failed:', error);
    throw error;
  }
};

//createModule

export const createCompany = async (data) => {
  try {
    const response = await api.post('/Companies', data);
    return response.data;
  } catch (error) {
    console.error('POST/company failed:', error);
    throw error;
  }
};

//getModuleById

export const getCompanyById = async (id) => {
  try {
    const response = await api.get(`/Companies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`GET /company/${id} failed:`, error);
    throw error;
  }
};

//updateModule

export const updateCompany = async (id, data) => {
  try {
    const response = await api.put(`/Companies/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`PUT /company/${id} failed:`, error);
    throw error;
  }
};

// deleteModule

export const deleteCompany = async (id) => {
  try {
    const response = await api.delete(`/Companies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`DELETE /Company/${id} failed:`, error);
    throw error;
  }
};

// get Users
export const getUsers = async () => {
  try {
    const response = await api.get('/Users');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('GET /Users failed:', error);
    throw error;
  }
};

//createUsers

export const createUsers = async (data) => {
  try {
    const response = await api.post('/Users', data);
    return response.data;
  } catch (error) {
    console.error('POST/Users failed:', error);
    throw error;
  }
};

//getUsersById

export const getUsersById = async (id) => {
  try {
    const response = await api.get(`/Users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`GET /Users/${id} failed:`, error);
    throw error;
  }
};

//updateModule

export const updateUsers = async (id, data) => {
  try {
    const response = await api.put(`/Users/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`PUT /Users/${id} failed:`, error);
    throw error;
  }
};

// deleteUsers

export const deleteUsers = async (id) => {
  try {
    const response = await api.delete(`/Users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`DELETE /Users/${id} failed:`, error);
    throw error;
  }
};
// get Roles
export const getRoles = async () => {
  try {
    const response = await api.get('/roles');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('GET /roles failed:', error);
    throw error;
  }
};

//createUsers

export const createRole = async (data) => {
  try {
    const response = await api.post('/roles', data);
    return response.data;
  } catch (error) {
    console.error('POST/roles failed:', error);
    throw error;
  }
};

//getUsersById

export const getRoleById = async (id) => {
  try {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`GET /roles/${id} failed:`, error);
    throw error;
  }
};

//updateModule

export const updateRole = async (id, data) => {
  try {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`PUT /roles/${id} failed:`, error);
    throw error;
  }
};

// deleteUsers

export const deleteRole = async (id) => {
  try {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`DELETE /roles/${id} failed:`, error);
    throw error;
  }
};

// get Roles
export const getUserRoles = async () => {
  try {
    const response = await api.get('/UserRoles/roles');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('GET /roles failed:', error);
    throw error;
  }
};

//createUsers

export const createUserRole = async (data) => {
  try {
    const response = await api.post('/UserRoles/assign', data);
    return response.data;
  } catch (error) {
    console.error('POST/roles failed:', error);
    throw error;
  }
};

//getUsersById

export const getUserRoleById = async (id) => {
  try {
    const response = await api.get(`/UserRoles/user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`GET /roles/${id} failed:`, error);
    throw error;
  }
};

export const deleteUserRole = async (id) => {
  try {
    const response = await api.delete(`/UserRoles/user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`DELETE /roles/${id} failed:`, error);
    throw error;
  }
};
