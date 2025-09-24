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
import PaymentVoucher from '../pages/PaymentVoucher';
import PaymentVoucherList from '../pages/PaymentvoucherList';
import ReceiptVoucher from '../pages/ReceiptVoucher';
import ReceiptVoucherList from '../pages/ReceiptvoucherList';
import JournalVoucher from '../pages/JournalVoucher';
import JournalVoucherList from '../pages/JournalvoucherList';
import TransactionTypeMasterPage from '../pages/TransactionTypeMasterPage';
import ContraVoucher from '../pages/ContraVoucher';
import ContraVoucherList from '../pages/ContravoucherList';
import NoteVoucher from '../pages/NoteVoucher';
import NoteVoucherList from '../pages/NotevoucherList';

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
    '/userrolepermissions': UserRolePermissions,
    '/payment': PaymentVoucher,
    '/paymentlist': PaymentVoucherList,
    '/receipt': ReceiptVoucher,
    '/receiptlist': ReceiptVoucherList,
    '/journal': JournalVoucher,
    '/journallist': JournalVoucherList,
    '/transactiontype': TransactionTypeMasterPage,
    '/contra': ContraVoucher,
    '/contralist': ContraVoucherList,
    '/note': NoteVoucher,
    '/notelist': NoteVoucherList
};