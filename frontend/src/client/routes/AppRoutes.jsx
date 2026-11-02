import { Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import PlaceholderPage from "../components/common/PlaceholderPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import { GuestRoute, ProtectedRoute } from "./RouteGuards";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/groups" element={<PlaceholderPage title="My Groups" />} />
          <Route path="/expenses" element={<PlaceholderPage title="Expenses" />} />
          <Route path="/balances" element={<PlaceholderPage title="Balances" />} />
          <Route path="/settlements" element={<PlaceholderPage title="Settlements" />} />
          <Route path="/activity" element={<PlaceholderPage title="Activity" />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
