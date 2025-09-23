// src/services/authService.js
import axios from 'axios';
import api from './axiosInstance';

export const BASE_URL = 'https://localhost:7260/api';
//export const BASE_URL = 'https://hoffstee.azurewebsites.net/api';

// POST / PUT Generic error handling function
const handlePostPutError = (error, action, endpoint) => {
    if (error.response && error.response.data) {
        console.error(`${action} ${endpoint} failed:`, error.response.data);
        throw new Error(error.response.data.message || `${action} failed`);
    } else {
        console.error(`${action} ${endpoint} failed:`, error.message);
        throw new Error(`${action} failed`);
    }
};


//export const login = (email, password) => {
//    return axios.post(`${BASE_URL}/Auth/login`, { email, password });
//};
export const login = async (email, password) => {
    try {
        const response = await axios.post(`${BASE_URL}/Auth/login`, { email, password });
        return response;
    } catch (error) {
        handlePostPutError(error, 'POST', `/Auth/login`);
    }
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
        handlePostPutError(error, 'POST', `/Modules`);
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
        handlePostPutError(error, 'PUT', `/Modules/${id}`);
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
        handlePostPutError(error, 'POST', `/SubModule`);
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
        handlePostPutError(error, 'PUT', `/SubModule/${id}`);
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
        handlePostPutError(error, 'POST', `/ModulePage`);
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
        handlePostPutError(error, 'PUT', `/ModulePage/${id}`);
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
        handlePostPutError(error, 'POST', `/Companies`);
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
        handlePostPutError(error, 'PUT', `/Companies/${id}`);
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
        handlePostPutError(error, 'POST', `/Users`);
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
        handlePostPutError(error, 'PUT', `/Users/${id}`);
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
        handlePostPutError(error, 'POST', `/roles`);
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
        handlePostPutError(error, 'PUT', `/roles/${id}`);
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
        handlePostPutError(error, 'POST', `/UserRoles/assign`);
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
// get Ledger
export const getLedgers = async () => {
    try {
        const response = await api.get('/Ledgers');
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('GET /Ledgers failed:', error);
        throw error;
    }
};

//create Ledger

export const createLedger = async (data) => {
    try {
        const response = await api.post('/Ledgers', data);
        return response.data;
    } catch (error) {
        handlePostPutError(error, 'POST', `/Ledgers`);
    }
};

//get Ledger ById

export const getLedgerById = async (id) => {
    try {
        const response = await api.get(`/Ledgers/${id}`);
        return response.data;
    } catch (error) {
        console.error(`GET /Ledgers/${id} failed:`, error);
        throw error;
    }
};

//update Ledger

export const updateLedger = async (id, data) => {
    try {
        const response = await api.put(`/Ledgers/${id}`, data);
        return response.data;
    } catch (error) {
        handlePostPutError(error, 'PUT', `/Ledgers/${id}`);
    }
};

// delete Ledger

export const deleteLedger = async (id) => {
    try {
        const response = await api.delete(`/Ledgers/${id}`);
        return response.data;
    } catch (error) {
        console.error(`DELETE /Ledgers/${id} failed:`, error);
        throw error;
    }
};


// get AccountGroups
export const getAccountGroups = async () => {
    try {
        const response = await api.get('/AccountGroups');
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('GET /AccountGroups failed:', error);
        throw error;
    }
};

//create AccountGroups

export const createAccountGroup = async (data) => {
    try {
        const response = await api.post('/AccountGroups', data);
        return response.data;
    } catch (error) {
        handlePostPutError(error, 'POST', `/AccountGroups`);
    }
};

//get AccountGroups ById

export const getAccountGroupById = async (id) => {
    try {
        const response = await api.get(`/AccountGroups/${id}`);
        return response.data;
    } catch (error) {
        console.error(`GET /AccountGroups/${id} failed:`, error);
        throw error;
    }
};

//update AccountGroups

export const updateAccountGroup = async (id, data) => {
    try {
        const response = await api.put(`/AccountGroups/${id}`, data);
        return response.data;
    } catch (error) {
        handlePostPutError(error, 'PUT', `/AccountGroups/${id}`);
    }
};

// delete AccountGroups

export const deleteAccountGroup = async (id) => {
    try {
        const response = await api.delete(`/AccountGroups/${id}`);
        return response.data;
    } catch (error) {
        console.error(`DELETE /AccountGroups/${id} failed:`, error);
        throw error;
    }
};

// get TaxMasters
export const getTaxes = async () => {
    try {
        const response = await api.get('/TaxMasters');
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('GET /TaxMasters failed:', error);
        throw error;
    }
};

//create TaxMasters

export const createTax = async (data) => {
    try {
        const response = await api.post('/TaxMasters', data);
        return response.data;
    } catch (error) {
        handlePostPutError(error, 'POST', `/TaxMasters`);
    }
};

//get TaxMasters ById

export const getTaxById = async (id) => {
    try {
        const response = await api.get(`/TaxMasters/${id}`);
        return response.data;
    } catch (error) {
        console.error(`GET /TaxMasters/${id} failed:`, error);
        throw error;
    }
};

//update TaxMasters

export const updateTax = async (id, data) => {
    try {
        const response = await api.put(`/TaxMasters/${id}`, data);
        return response.data;
    } catch (error) {
        handlePostPutError(error, 'PUT', `/TaxMasters/${id}`);
    }
};

// delete TaxMasters

export const deleteTax = async (id) => {
    try {
        const response = await api.delete(`/TaxMasters/${id}`);
        return response.data;
    } catch (error) {
        console.error(`DELETE /TaxMasters/${id} failed:`, error);
        throw error;
    }
};

//Voucher Types
export const getVoucherTypes = async () => {
    try {
        const response = await api.get('/VoucherTypes');
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('GET /VoucherTypes failed:', error);
        throw error;
    }
};
export const createVoucherType = async (data) => {
    try {
        const response = await api.post('/VoucherTypes', data);
        return response.data;
    } catch (error) {
        handlePostPutError(error, 'POST', `/VoucherTypes`);
    }
};
export const getVoucherTypeById = async (id) => {
    try {
        const response = await api.get(`/VoucherTypes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`GET /VoucherTypes/${id} failed:`, error);
        throw error;
    }
};
export const updateVoucherType = async (id, data) => {
    try {
        const response = await api.put(`/VoucherTypes/${id}`, data);
        return response.data;
    } catch (error) {
        handlePostPutError(error, 'PUT', `/VoucherTypes/${id}`);
    }
};
export const deleteVoucherType = async (id) => {
    try {
        const response = await api.delete(`/VoucherTypes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`DELETE /VoucherTypes/${id} failed:`, error);
        throw error;
    }
};
export const getPermissionsByUserRole = async (userRoleId) => {
    try {
        const response = await api.get(`/PageAccessPermission/userrole/${userRoleId}`);
        return response.data;
    } catch (error) {
        console.error("GET /PageAccessPermission failed:", error);
        throw error;
    }
};
export const updatePermissions = async (payload) => {
    try {
        const response = await api.post(`/PageAccessPermission/update`, payload);
        return response.data;
    } catch (error) {
        handlePostPutError(error, 'POST', `/PageAccessPermission/update`);
    }
};
export const getPermissionsByPage = async (page) => {
    try {
        const response = await api.get(`/PageAccessPermission/page/${page}`);
        return response.data;
    } catch (error) {
        handlePostPutError(error, 'GET', `/PageAccessPermission/page/${page}`);
    }
};
export const GetLedgersDropdown = async () => {
    try {
        const response = await api.get(`/Ledgers/dropdown`);
        return response.data;
    }
    catch (error) {
        handlePostPutError(error, 'GET', `/Ledgers/dropdown`);
    }
};
export const GenerateVoucherCode = async (code, isEdit) => {
    try {
        const response = await api.get(`/Vouchers/vouchercode/${code}/edit/${isEdit}`);
        return response.data;
    }
    catch (error) {
        handlePostPutError(error, 'GET', `/Vouchers/vouchercode/${code}/edit/${isEdit}`);
    }
};

export const CreateVouchers = async (data) => {
    try {
        const response = await api.post('/Vouchers', data);
        return response.data;
    } catch (error) {
        handlePostPutError(error, 'POST', `/Vouchers`);
    }
};

//get Voucher ById

export const GetVouchersById = async (id) => {
    try {
        const response = await api.get(`/Vouchers/${id}`);
        return response.data;
    } catch (error) {
        console.error(`GET /Vouchers/${id} failed:`, error);
        throw error;
    }
};

//update Voucher
export const UpdateVouchers = async (id, data) => {
    try {
        const response = await api.put(`/Vouchers/${id}`, data);
        return response.data;
    } catch (error) {
        handlePostPutError(error, 'PUT', `/Vouchers/${id}`);
    }
};

//Voucher Types
export const GetVouchersList = async (code) => {
    try {
        const response = await api.get(`/Vouchers/type/${code}`);
        return response.data;
    } catch (error) {
        console.error('GET /Vouchers failed:', error);
        throw error;
    }
};
export const GetVoucherEntriesById = async (id) => {
    try {
        const response = await api.get(`/Vouchers/${id}/entries`);
        return response.data;
    } catch (error) {
        console.error(`GET /Vouchers/${id}/entries failed:`, error);
        throw error;
    }
};
export const DeleteVoucher = async (id) => {
    try {
        const response = await api.delete(`/Vouchers/${id}`);
        return response.data;
    } catch (error) {
        console.error(`DELETE /VoucherTypes/${id} failed:`, error);
        throw error;
    }
};