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

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
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
]);
