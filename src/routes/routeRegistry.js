// routeRegistry.js
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

export const routeRegistry = {
  '/dashboard': Dashboard,
  '/finance/voucher': VoucherEntry,
  '/finance/trialbalance': TrialBalance,
  '/hr/payroll/payslip': Payslip,
  // Add more as needed
  '/modules': ModulesPage, // ✅ Add this line
  '/submodules': SubModulesPage,
  '/pages':ModuleAddPages,
  '/company':Company,
  '/users':UserPage,
  '/roles':RolesPage,
  '/userroles':UserRolesPage,
  '/accountgroups':AccountGroupsPage,
  '/ledgers':LedgersPage
};