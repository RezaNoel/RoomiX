import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import UserPanelLayout from "../components/layout/UserPanelLayout";
import Dashboard from "../components/dashboard/Dashboard";
import Manager from "../components/manager/manager";
import CRMTable from "../components/crm/CRMTable";
import CustomerReservationSystem from "../components/customerReservation/CustomerReservationSystem";
import ReservationPage from "../components/customerReservation/ReservationPage";
import Confirmation from "../components/customerReservation/Confirmation";
import Reservations from "../components/reservation/Reservations";
import Login from "../components/Login";
import VoucherPage from "../components/customerReservation/VoucherPage";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  const { token, role } = useAuth();


  return (
    <Routes>
  {/* مسیر لاگین */}
  <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />

  {/* مسیر سیستم رزرو مشتریان */}
  <Route path="/reservation" element={<CustomerReservationSystem />} />
  <Route path="/reservation/informations" element={<ReservationPage />} />
  <Route path="/reservation/confirmation" element={<Confirmation />} />
  <Route path="/voucher" element={<VoucherPage />} />

  {/* مسیر پنل کاربران */}
  <Route
    path="/"
    element={
      token ? (
        ["ادمین", "مدیر هتل", "رزرواسیون"].some(
          (allowedRole) => allowedRole.trim().toLowerCase() === (role || "").trim().toLowerCase()
        ) ? (
          <UserPanelLayout />
        ) : (
          <>
          </>
        )
      ) : (
        <>
          <Navigate to="/login" />
        </>
      )
    }
  >
    <Route element={<ProtectedRoute allowedRoles={["ادمین", "مدیر هتل", "رزرواسیون"]} />}>
      <Route index element={<Dashboard />} />
      <Route path="manager" element={<Manager />} />
      <Route path="crm" element={<CRMTable />} />
      <Route path="reservations" element={<Reservations />} />
    </Route>
  </Route>
</Routes>

  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
