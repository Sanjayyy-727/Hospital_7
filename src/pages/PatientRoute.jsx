
import React from "react";
import { useLocation } from "react-router-dom";
import { Overview, PatientAppointments, PatientProfile } from "./PatientSubpages.jsx";

export default function PatientRoute() {
  const path = useLocation().pathname;
  if (path.endsWith("/profile")) return <PatientProfile />;
  if (path.endsWith("/upcoming")) return <PatientAppointments mode="upcoming" />;
  if (path.endsWith("/history")) return <PatientAppointments mode="history" />;
  if (path.endsWith("/appointments")) return <PatientAppointments />;
  return <Overview />;
}
