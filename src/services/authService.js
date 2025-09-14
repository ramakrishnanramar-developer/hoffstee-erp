// src/services/authService.js
import axios from 'axios';
import api from './axiosInstance';

const BASE_URL = 'https://hoffstee.azurewebsites.net/api';

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
