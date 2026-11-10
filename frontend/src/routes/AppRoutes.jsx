
import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import PlaceholderPage from "../components/common/PlaceholderPage";

import RoomDetails from "../pages/RoomDetails";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Rooms from "../pages/Rooms";
import Position from "../pages/Position";
import Settlements from "../pages/Settlements";
import Activity from "../pages/Activity";
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

          <Route path="/rooms" element={<Rooms />} />

          <Route
            path="/rooms/:roomId"
            element={<RoomDetails />}
          />

          <Route
            path="/groups"
            element={<Navigate to="/rooms" replace />}
          />

          {/* Combined Expenses and Balances page */}
          <Route
            path="/position"
            element={<Position />}
          />

          {/* Redirect old URLs to Position */}
          <Route
            path="/expenses"
            element={<Navigate to="/position" replace />}
          />

          <Route
            path="/balances"
            element={<Navigate to="/position" replace />}
          />

          <Route
            path="/settlements"
            element={<Settlements />}
          />

          <Route
            path="/activity"
            element={<Activity />}
          />

          <Route path="/account" element={<Profile />} />

          <Route
            path="/profile"
            element={<Navigate to="/account" replace />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
