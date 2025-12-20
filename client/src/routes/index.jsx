// Route configuration
import LandingPage from '../pages/LandingPage';
import Dashboard from '../pages/Dashboard';
import DemoPage from '../pages/DemoPage';

// Verification Pages
import AddressBuilder from '../pages/verification/AddressBuilder';

// Business Pages
import CompanyFormation from '../pages/business/CompanyFormation';
import Invoicing from '../pages/business/Invoicing';
import Mailbox from '../pages/business/Mailbox';
import MailboxSubscription from '../pages/business/MailboxSubscription';
import ApiKeys from '../pages/business/ApiKeys';
import MyOrders from '../pages/business/MyOrders';

// Admin Pages
import FormationOrders from '../pages/admin/FormationOrders';
import OrderDetail from '../pages/admin/OrderDetail';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import VerifyEmail from '../pages/auth/VerifyEmail';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
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
];

// Standalone routes (no AppLayout)
export const standaloneRoutes = [
  { path: '/', element: LandingPage, public: true },
  { path: '/demo', element: DemoPage, public: true },
  { path: '/address-verification', element: AddressBuilder, public: true },
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
    { path: 'mailbox', element: Mailbox, protected: true },
    { path: 'mailbox/subscribe', element: MailboxSubscription, protected: true },
    { path: 'api-keys', element: ApiKeys, protected: true },
  ],
  
  // Admin (admin only)
  admin: [
    { path: 'admin', element: FormationOrders, admin: true },
    { path: 'admin/order/:id', element: OrderDetail, admin: true },
  ],
  
  // Legal (public)
  legal: [
    { path: 'terms', element: TermsOfService },
    { path: 'privacy', element: PrivacyPolicy },
  ],
};

// Export route protection wrappers
export { ProtectedRoute, AdminRoute };
