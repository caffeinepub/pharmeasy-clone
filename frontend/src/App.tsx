import React, { useState } from 'react';
import {
  createRouter, createRoute, createRootRoute, RouterProvider, Outlet, redirect
} from '@tanstack/react-router';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import UploadPrescriptionModal from './components/UploadPrescriptionModal';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';

import Home from './pages/Home';
import MedicineSearch from './pages/MedicineSearch';
import MedicineDetail from './pages/MedicineDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import LabTests from './pages/LabTests';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import LabTestsManagement from './pages/admin/LabTestsManagement';
import HealthPackagesManagement from './pages/admin/HealthPackagesManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import LabBookingsManagement from './pages/admin/LabBookingsManagement';
import PrescriptionsManagement from './pages/admin/PrescriptionsManagement';

// Root layout component
function RootLayout() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <Layout onUploadPrescription={() => setUploadModalOpen(true)}>
      <Outlet />
      {showProfileSetup && (
        <ProfileSetupModal
          open={showProfileSetup}
          onComplete={() => {}}
        />
      )}
      <UploadPrescriptionModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
      <Toaster richColors position="top-right" />
    </Layout>
  );
}

// Route definitions
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const medicinesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/medicines',
  component: MedicineSearch,
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || '',
    category: (search.category as string) || '',
  }),
});

const medicineDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/medicine/$id',
  component: MedicineDetail,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: Cart,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: Checkout,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: Profile,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: OrderHistory,
});

const labTestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lab-tests',
  component: LabTests,
});

const articlesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/articles',
  component: Articles,
});

const articleDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/article/$id',
  component: ArticleDetail,
});

// Admin routes - use a separate root to avoid the main Layout wrapper
const adminRootRoute = createRootRoute({
  component: () => <><Outlet /><Toaster richColors position="top-right" /></>,
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/admin/lab-tests' });
  },
  component: () => null,
});

const adminLabTestsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/lab-tests',
  component: LabTestsManagement,
});

const adminHealthPackagesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/health-packages',
  component: HealthPackagesManagement,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/orders',
  component: OrdersManagement,
});

const adminLabBookingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/lab-bookings',
  component: LabBookingsManagement,
});

const adminPrescriptionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/prescriptions',
  component: PrescriptionsManagement,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  medicinesRoute,
  medicineDetailRoute,
  cartRoute,
  checkoutRoute,
  profileRoute,
  ordersRoute,
  labTestsRoute,
  articlesRoute,
  articleDetailRoute,
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminLabTestsRoute,
    adminHealthPackagesRoute,
    adminOrdersRoute,
    adminLabBookingsRoute,
    adminPrescriptionsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}
