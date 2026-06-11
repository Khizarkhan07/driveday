import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { VehicleConfirmPage } from "./pages/VehicleConfirmPage";
import { CoverDetailsPage } from "./pages/CoverDetailsPage";
import { DriverDetailsPage } from "./pages/DriverDetailsPage";
import { QuotePage } from "./pages/QuotePage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";
import { PortalPage } from "./pages/PortalPage";
import { PortalPolicyDetailPage } from "./pages/PortalPolicyDetailPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminUserDetailPage } from "./pages/admin/AdminUserDetailPage";
import { AdminPoliciesPage } from "./pages/admin/AdminPoliciesPage";
import { AdminPolicyDetailPage } from "./pages/admin/AdminPolicyDetailPage";
import { AdminEventsPage } from "./pages/admin/AdminEventsPage";

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: "/vehicle-confirm", element: <VehicleConfirmPage /> },
      { path: "/cover-details", element: <CoverDetailsPage /> },
      { path: "/driver-details", element: <DriverDetailsPage /> },
      { path: "/quote", element: <QuotePage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/confirmation", element: <ConfirmationPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/portal", element: <PortalPage /> },
      { path: "/portal/policies/:id", element: <PortalPolicyDetailPage /> },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      { path: "/admin", element: <AdminDashboardPage /> },
      { path: "/admin/users", element: <AdminUsersPage /> },
      { path: "/admin/users/:id", element: <AdminUserDetailPage /> },
      { path: "/admin/policies", element: <AdminPoliciesPage /> },
      { path: "/admin/policies/:id", element: <AdminPolicyDetailPage /> },
      { path: "/admin/events", element: <AdminEventsPage /> },
    ],
  },
]);
