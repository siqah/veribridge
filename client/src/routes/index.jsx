// Route configuration
import LandingPage from '../pages/LandingPage';
import Dashboard from '../pages/Dashboard';
import DemoPage from '../pages/DemoPage';

// Verification Pages
import AddressBuilder from '../pages/verification/AddressBuilder';

// Standalone Pages
import MailboxInfo from '../pages/standalone/MailboxInfo';

// Public Pages
import InvoicePortal from '../pages/public/InvoicePortal';

// Business Pages
import CompanyFormation from '../pages/business/CompanyFormation';
import Invoicing from '../pages/business/Invoicing';
import RecurringInvoices from '../pages/business/RecurringInvoices';
import DigitalMailbox from '../pages/business/DigitalMailbox';
import MailboxSubscription from '../pages/business/MailboxSubscription';
// ApiKeys feature removed
import MyOrders from '../pages/business/MyOrders';
import ProfileSettings from '../pages/business/ProfileSettings';

// Admin Pages
import FormationOrders from '../pages/admin/FormationOrders';
import OrderDetail from '../pages/admin/OrderDetail';
import MailManagement from '../pages/admin/MailManagement';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import VerifyEmail from '../pages/auth/VerifyEmail';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import AdminLogin from '../pages/auth/AdminLogin';
import { ProtectedRoute, AdminRoute } from '../pages/auth/ProtectedRoute';

// Legal Pages
import TermsOfService from '../pages/legal/TermsOfService';
import PrivacyPolicy from '../pages/legal/PrivacyPolicy';

// Auth routes (fullscreen, no layout)
export const authRoutes = [
  { path: '/login', element: Login },
  { path: '/signup', element: Signup },
  { path: '/verify-email', element: VerifyEmail },
  { path: '/forgot-password', element: ForgotPassword },
  { path: '/reset-password', element: ResetPassword },
  { path: '/admin/login', element: AdminLogin },
];

// Standalone routes (no AppLayout)
export const standaloneRoutes = [
  { path: '/', element: LandingPage, public: true },
  { path: '/demo', element: DemoPage, public: true },
  { path: '/address-verification', element: AddressBuilder, public: true },
  { path: '/mailbox-info', element: MailboxInfo, public: true },
  { path: '/invoice/:token', element: InvoicePortal, public: true },
  { path: '/invoice/:token/callback', element: InvoicePortal, public: true },
];

// Routes that use AppLayout
export const appLayoutRoutes = {
  // Dashboard (protected)
  dashboard: [
    { path: 'dashboard', element: Dashboard, protected: true },
  ],
  
  // Verification Tools - moved to standalone routes
  verification: [],
  
  // Business Services (protected)
  business: [
    { path: 'my-orders', element: MyOrders, protected: true },
    { path: 'company-formation', element: CompanyFormation, protected: true },
    { path: 'invoicing', element: Invoicing, protected: true },
    { path: 'recurring-invoices', element: RecurringInvoices, protected: true },
    { path: 'mailbox', element: DigitalMailbox, protected: true },
    { path: 'mailbox/subscribe', element: MailboxSubscription, protected: true },
    { path: 'settings', element: ProfileSettings, protected: true },
  ],
  
  // Admin (admin only)
  admin: [
    { path: 'admin', element: FormationOrders, admin: true },
    { path: 'admin/order/:id', element: OrderDetail, admin: true },
    { path: 'admin/mail', element: MailManagement, admin: true },
  ],
  
  // Legal (public)
  legal: [
    { path: 'terms', element: TermsOfService },
    { path: 'privacy', element: PrivacyPolicy },
  ],
};

// Export route protection wrappers
export { ProtectedRoute, AdminRoute };
