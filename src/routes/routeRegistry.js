// routeRegistry.js
import Dashboard from '../pages/Dashboard';
import VoucherEntry from '../pages/VoucherEntry';
import TrialBalance from '../pages/TrialBalance';
import Payslip from '../pages/Payslip';
import ModulesPage from '../pages/ModulesPage';

export const routeRegistry = {
  '/dashboard': Dashboard,
  '/finance/voucher': VoucherEntry,
  '/finance/trialbalance': TrialBalance,
  '/hr/payroll/payslip': Payslip,
  // Add more as needed
  '/modules': ModulesPage, // ✅ Add this line

};