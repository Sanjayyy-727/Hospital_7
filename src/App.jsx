import React from "react";
import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { Loading } from "./components/UI.jsx";
import ControlCenter from "./pages/ControlCenter.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Doctors = lazy(() => import("./pages/Doctors.jsx"));
const DoctorProfile = lazy(() => import("./pages/DoctorProfile.jsx"));
const Booking = lazy(() => import("./pages/Booking.jsx"));
const Appointments = lazy(() => import("./pages/Appointments.jsx"));
const AppointmentDetail = lazy(() => import("./pages/AppointmentDetail.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard.jsx"));
const PatientRoute = lazy(() => import("./pages/PatientRoute.jsx"));

export default function App() {
  return (
    <div className="app">
      <Header />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/controlpage" element={<ControlCenter />} />
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctor/:id" element={<DoctorProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book-appointment" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/appointment/:id" element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>} />
          <Route path="/patient" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>}>
            <Route index element={<PatientRoute />} />
            <Route path="appointments" element={<PatientRoute />} />
            <Route path="upcoming" element={<PatientRoute />} />
            <Route path="history" element={<PatientRoute />} />
            <Route path="profile" element={<PatientRoute />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}
