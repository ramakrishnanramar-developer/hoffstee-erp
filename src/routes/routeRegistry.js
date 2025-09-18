// routeRegistry.js
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import VoucherEntry from '../pages/VoucherEntry';
import TrialBalance from '../pages/TrialBalance';
import Payslip from '../pages/Payslip';
import ModulesPage from '../pages/ModulesPage';
import SubModulesPage from '../pages/SubModulesPage';
import ModuleAddPages from '../pages/ModuleAddPages';
import Company from '../pages/Company';
import UserPage from '../pages/UserPage';
import RolesPage from '../pages/RolesPage';
import UserRolesPage from '../pages/UserRolesPage';
import AccountGroupsPage from '../pages/AccountGroupsPage';
import LedgersPage from '../pages/LedgersPage';
import TaxMasterPage from '../pages/TaxMasterPage';
import VoucherTypesPage from '../pages/VoucherTypesPage';
import UserRolePermissions from '../pages/UserRolePermissions';

export const routeRegistry = {
    '/login': Login,
    '/dashboard': Dashboard,
    '/finance/voucher': VoucherEntry,
    '/finance/trialbalance': TrialBalance,
    '/hr/payroll/payslip': Payslip,
    // Add more as needed
    '/modules': ModulesPage, // ✅ Add this line
    '/submodules': SubModulesPage,
    '/pages': ModuleAddPages,
    '/company': Company,
    '/users': UserPage,
    '/roles': RolesPage,
    '/userroles': UserRolesPage,
    '/accountgroups': AccountGroupsPage,
    '/ledgers': LedgersPage,
    '/taxmasters': TaxMasterPage,
    '/vouchertypes': VoucherTypesPage,
    '/userrolepermissions': UserRolePermissions
};