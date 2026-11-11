import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import RoomDetails from "../pages/RoomDetails";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Rooms from "../pages/Rooms";
import Position from "../pages/Position";
import Settlements from "../pages/Settlements";
import Activity from "../pages/Activity";
import Approvals from "../pages/Approvals";
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
          <Route path="/rooms/:roomId" element={<RoomDetails />} />
          <Route path="/groups" element={<Navigate to="/rooms" replace />} />

          <Route path="/position" element={<Position />} />
          <Route path="/expenses" element={<Navigate to="/position" replace />} />
          <Route path="/balances" element={<Navigate to="/position" replace />} />

          <Route path="/settlements" element={<Settlements />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/activity" element={<Activity />} />

          <Route path="/account" element={<Profile />} />
          <Route path="/profile" element={<Navigate to="/account" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}