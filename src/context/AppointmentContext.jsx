import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import {
  getDoctors,
  getAppointments,
  getSlots,
  createAppointment,
  updateAppointment,
} from "../services/api.js";

import { useAppointmentStore } from "../store/appointmentStore.js";

const C = createContext(null);

export function AppointmentProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState("");

  // Zustand global booking state
  const selection = useAppointmentStore((s) => s.selection);
  const setDoctor = useAppointmentStore((s) => s.setDoctor);
  const setDate = useAppointmentStore((s) => s.setDate);
  const setTime = useAppointmentStore((s) => s.setTime);
  const setPatient = useAppointmentStore((s) => s.setPatient);
  const clear = useAppointmentStore((s) => s.clear);

  // REST API: GET doctors
  const refreshDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    console.log("[REST API] GET /doctors");

    try {
      const data = await getDoctors();

      setDoctors(data);

      console.log("[REST API SUCCESS] Doctors loaded:", {
        count: data.length,
      });
    } catch (err) {
      console.error("[REST API ERROR] Unable to load doctors", err);
      setError("Unable to load doctors.");
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  // REST API: GET appointments
  const refreshAppointments = useCallback(async () => {
    setLoadingAppointments(true);
    console.log("[REST API] GET /appointments");

    try {
      const data = await getAppointments();

      setAppointments(data);

      console.log("[REST API SUCCESS] Appointments loaded:", {
        count: data.length,
      });
    } catch (err) {
      console.error("[REST API ERROR] Unable to load appointments", err);
      setError("Unable to load appointments.");
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    refreshDoctors();
    refreshAppointments();
  }, [refreshDoctors, refreshAppointments]);

  // State Management: log appointment state changes
  useEffect(() => {
    console.log("[STATE MANAGEMENT] Appointment state updated:", {
      total: appointments.length,
      active: appointments.filter(
        (a) => a.status !== "Cancelled"
      ).length,
      cancelled: appointments.filter(
        (a) => a.status === "Cancelled"
      ).length,
    });
  }, [appointments]);

  // State Management: log booking selections without exposing patient details
  useEffect(() => {
    console.log("[STATE MANAGEMENT] Booking selection updated:", {
      doctorId: selection?.doctor?.id ?? null,
      date: selection?.date || null,
      time: selection?.time || null,
      patientDetailsProvided: Boolean(selection?.patient?.name),
    });
  }, [selection]);

  // Load available slots when doctor or date changes
  useEffect(() => {
    let live = true;

    if (!selection?.doctor || !selection?.date) {
      setAvailableSlots([]);
      return () => {
        live = false;
      };
    }

    console.log("[REST API] Loading available appointment slots");

    getSlots(selection.doctor.id, selection.date)
      .then((slots) => {
        if (live) {
          setAvailableSlots(slots);
          console.log("[REST API SUCCESS] Available slots loaded:", {
            count: slots.length,
          });
        }
      })
      .catch((err) => {
        if (live) {
          setAvailableSlots([]);
          console.error("[REST API ERROR] Unable to load slots", err);
        }
      });

    return () => {
      live = false;
    };
  }, [selection?.doctor, selection?.date, appointments]);

  // Create appointment
  const bookAppointment = useCallback(async () => {
    const p = selection.patient || {
      name: "",
      email: "",
      phone: "",
    };

    if (!selection.doctor || !selection.date || !selection.time) {
      throw new Error("Select doctor, date and time.");
    }

    const name = (p.name || "").trim();
    const email = (p.email || "").trim();
    const phone = (p.phone || "").trim().replace(/[\s-]/g, "");

    // Correct email and phone validation
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validPhone = /^\+?\d{10,15}$/.test(phone);

    if (!name || !validEmail || !validPhone) {
      throw new Error(
        "Enter a name, valid email and valid phone number."
      );
    }

    const payload = {
      doctorId: selection.doctor.id,
      doctorName: selection.doctor.name,
      specialty: selection.doctor.specialty,
      fee: selection.doctor.fee,
      date: selection.date,
      time: selection.time,
      patient: { ...p, name, email, phone },
      patientName: name,
      patientEmail: email,
    };

    console.log("[REST API] POST /appointments");

    try {
      const appointment = await createAppointment(payload);

      console.log("[REST API SUCCESS] Appointment created");

      // React state update
      setAppointments((current) => [appointment, ...current]);

      clear();

      return appointment;
    } catch (err) {
      console.error("[REST API ERROR] Appointment creation failed", err);
      throw err;
    }
  }, [selection, clear]);

  // Reschedule appointment
  const rescheduleAppointment = useCallback(
    async (id, changes) => {
      if (!changes.date || !changes.time) {
        throw new Error("Choose date and time.");
      }

      console.log(`[REST API] Updating appointment ${id}`);

      try {
        const appointment = await updateAppointment(id, changes);

        console.log("[REST API SUCCESS] Appointment updated");

        await refreshAppointments();

        return appointment;
      } catch (err) {
        console.error("[REST API ERROR] Appointment update failed", err);
        throw err;
      }
    },
    [refreshAppointments]
  );

  // Cancel appointment by updating its status
  const cancelAppointment = useCallback(
    async (id) => {
      const existing = appointments.find(
        (a) => String(a.id) === String(id)
      );

      if (!existing) {
        throw new Error("Appointment not found.");
      }

      console.log(`[REST API] Updating appointment ${id} to Cancelled`);

      try {
        await updateAppointment(id, {
          ...existing,
          status: "Cancelled",
        });

        setAppointments((current) =>
          current.map((a) =>
            String(a.id) === String(id)
              ? { ...a, status: "Cancelled" }
              : a
          )
        );

        console.log("[REST API SUCCESS] Appointment cancelled");
      } catch (err) {
        console.error("[REST API ERROR] Appointment cancellation failed", err);
        throw err;
      }
    },
    [appointments]
  );

  // Upcoming appointments
  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter(
          (a) =>
            a.status !== "Cancelled" &&
            a.date >= new Date().toISOString().slice(0, 10)
        )
        .sort((a, b) =>
          (a.date + " " + a.time).localeCompare(b.date + " " + b.time)
        ),
    [appointments]
  );

  // Context values
  const value = useMemo(
    () => ({
      doctors,
      appointments,
      availableSlots,
      loadingDoctors,
      loadingAppointments,
      error,
      refreshDoctors,
      refreshAppointments,
      selection,
      setDoctor,
      setDate,
      setTime,
      setPatient,
      clearSelection: clear,
      bookAppointment,
      rescheduleAppointment,
      cancelAppointment,
      appointmentCount: appointments.filter(
        (a) => a.status !== "Cancelled"
      ).length,
      upcomingAppointments,
      appointmentHistory: [...appointments].sort((a, b) =>
        (b.createdAt || "").localeCompare(a.createdAt || "")
      ),
    }),
    [
      doctors,
      appointments,
      availableSlots,
      loadingDoctors,
      loadingAppointments,
      error,
      refreshDoctors,
      refreshAppointments,
      selection,
      setDoctor,
      setDate,
      setTime,
      setPatient,
      clear,
      bookAppointment,
      rescheduleAppointment,
      cancelAppointment,
      upcomingAppointments,
    ]
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useAppointmentsContext() {
  return useContext(C);
}