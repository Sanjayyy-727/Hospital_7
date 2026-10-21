
import React, { useEffect, useState } from "react";
import "./controlcenter.css";

const API = "http://localhost:4000";

const emptyDoctor = {
  name: "",
  specialty: "",
  experience: "",
  fee: "",
  available: true,
  description: "",
};

const emptyAppointment = {
  patientName: "",
  patientEmail: "",
  patientPhone: "",
  doctorId: "",
  doctorName: "",
  date: "",
  time: "",
  status: "Confirmed",
  reason: "",
};

export default function ControlCenter() {
  const [section, setSection] = useState("doctors");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorForm, setDoctorForm] = useState(emptyDoctor);
  const [appointmentForm, setAppointmentForm] =
    useState(emptyAppointment);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


    async function request(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const url = `${API}${path}`;

  console.log(`%c[CRUD REQUEST] ${method} ${path}`, "color: blue; font-weight: bold");

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      console.error(
        `[CRUD FAILED] ${method} ${path} — Status: ${response.status}`
      );

      throw new Error(`Request failed (${response.status})`);
    }

    let result = null;

    if (response.status !== 204) {
      const text = await response.text();
      result = text ? JSON.parse(text) : null;
    }

    console.log(
      `%c[CRUD SUCCESS] ${method} ${path} — Status: ${response.status}`,
      "color: green; font-weight: bold"
    );

    return result;
  } catch (error) {
    console.error(
      `[CRUD ERROR] ${method} ${path}: ${error.message}`
    );

    throw error;
  }
}


  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [doctorData, appointmentData] = await Promise.all([
        request("/doctors"),
        request("/appointments"),
      ]);

      setDoctors(doctorData);
      setAppointments(appointmentData);
    } catch (err) {
      setError(
        "Could not load data. Make sure JSON Server is running on port 4000."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForms() {
    setDoctorForm(emptyDoctor);
    setAppointmentForm(emptyAppointment);
    setEditingId(null);
  }

  async function saveDoctor(event) {
    event.preventDefault();
    setError("");

    const payload = {
      ...doctorForm,
      experience: Number(doctorForm.experience),
      fee: Number(doctorForm.fee),
    };

    try {
      if (editingId !== null) {
  console.log("[PUT] Updating doctor:", editingId);

  await request(`/doctors/${editingId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
} else {
  console.log("[POST] Creating a new doctor");

  await request("/doctors", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  console.log("[POST] Doctor created successfully");
}

      resetForms();
      await loadData();
    } catch {
      setError("Unable to save the doctor. Please try again.");
    }
  }

  async function saveAppointment(event) {
    event.preventDefault();
    setError("");

    const selectedDoctor = doctors.find(
      (doctor) => String(doctor.id) === String(appointmentForm.doctorId)
    );

    const payload = {
      ...appointmentForm,
      doctorName: selectedDoctor?.name || appointmentForm.doctorName,
    };

    try {
      if (editingId !== null) {
  console.log("[PUT] Updating appointment:", editingId);

  await request(`/appointments/${editingId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
} else {
  console.log("[POST] Creating a new appointment");

  await request("/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  console.log("[POST] Appointment created successfully");
}

      resetForms();
      await loadData();
    } catch {
      setError("Unable to save the appointment. Please try again.");
    }
  }

  function editDoctor(doctor) {
    setSection("doctors");
    setEditingId(doctor.id);
    setDoctorForm({
      name: doctor.name || "",
      specialty: doctor.specialty || "",
      experience: doctor.experience ?? "",
      fee: doctor.fee ?? "",
      available: doctor.available ?? true,
      description: doctor.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editAppointment(appointment) {
    setSection("appointments");
    setEditingId(appointment.id);
    setAppointmentForm({
      ...emptyAppointment,
      ...appointment,
      doctorId: String(appointment.doctorId || ""),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteRecord(type, id) {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${type.slice(0, -1)}?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await request(`/${type}/${id}`, { method: "DELETE" });

      if (String(editingId) === String(id)) resetForms();
      await loadData();
    } catch {
      setError("Unable to delete this record. Please try again.");
    }
  }

  async function updateAppointmentStatus(appointment, status) {
    try {
      await request(`/appointments/${appointment.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadData();
    } catch {
      setError("Unable to update the appointment status.");
    }
  }

  return (
    <main className="control-center">
      <header className="control-header">
        <div>
          <p className="control-eyebrow">HOSPITAL ADMINISTRATION</p>
          <h1>Control Center</h1>
          <p>Manage doctors and patient appointments.</p>
        </div>
        <button className="cc-refresh" onClick={loadData}>
          Refresh data
        </button>
      </header>

      <section className="cc-stats">
        <article>
          <span>Total doctors</span>
          <strong>{doctors.length}</strong>
        </article>
        <article>
          <span>Total appointments</span>
          <strong>{appointments.length}</strong>
        </article>
        <article>
          <span>Confirmed appointments</span>
          <strong>
            {appointments.filter((a) => a.status === "Confirmed").length}
          </strong>
        </article>
      </section>

      <nav className="cc-tabs" aria-label="Control center sections">
        <button
          className={section === "doctors" ? "active" : ""}
          onClick={() => {
            resetForms();
            setSection("doctors");
          }}
        >
          Manage Doctors
        </button>
        <button
          className={section === "appointments" ? "active" : ""}
          onClick={() => {
            resetForms();
            setSection("appointments");
          }}
        >
          Manage Appointments
        </button>
      </nav>

      {error && <p className="cc-error" role="alert">{error}</p>}

      {section === "doctors" && (
        <section className="cc-panel">
          <h2>{editingId !== null ? "Edit Doctor" : "Add a Doctor"}</h2>

          <form className="cc-form" onSubmit={saveDoctor}>
            <label>
              Doctor name
              <input
                required
                value={doctorForm.name}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, name: e.target.value })
                }
                placeholder="Dr. Name"
              />
            </label>

            <label>
              Specialty
              <input
                required
                value={doctorForm.specialty}
                onChange={(e) =>
                  setDoctorForm({
                    ...doctorForm,
                    specialty: e.target.value,
                  })
                }
                placeholder="Cardiology"
              />
            </label>

            <label>
              Experience (years)
              <input
                required
                type="number"
                min="0"
                value={doctorForm.experience}
                onChange={(e) =>
                  setDoctorForm({
                    ...doctorForm,
                    experience: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Consultation fee (₹)
              <input
                required
                type="number"
                min="0"
                value={doctorForm.fee}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, fee: e.target.value })
                }
              />
            </label>

            <label className="cc-full">
              Description
              <textarea
                value={doctorForm.description}
                onChange={(e) =>
                  setDoctorForm({
                    ...doctorForm,
                    description: e.target.value,
                  })
                }
                rows="2"
              />
            </label>

            <label className="cc-checkbox">
              <input
                type="checkbox"
                checked={Boolean(doctorForm.available)}
                onChange={(e) =>
                  setDoctorForm({
                    ...doctorForm,
                    available: e.target.checked,
                  })
                }
              />
              Available for appointments
            </label>

            <div className="cc-actions cc-full">
              <button type="submit" className="cc-primary">
                {editingId !== null ? "Update Doctor" : "Add Doctor"}
              </button>
              {editingId !== null && (
                <button type="button" onClick={resetForms}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          <h2>Doctor Records</h2>

          {loading ? (
            <p>Loading doctors...</p>
          ) : (
            <div className="cc-table-wrap">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Specialty</th>
                    <th>Experience</th>
                    <th>Fee</th>
                    <th>Availability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td>{doctor.name}</td>
                      <td>{doctor.specialty}</td>
                      <td>{doctor.experience} years</td>
                      <td>₹{doctor.fee}</td>
                      <td>{doctor.available ? "Available" : "Unavailable"}</td>
                      <td className="cc-row-actions">
                        <button onClick={() => editDoctor(doctor)}>Edit</button>
                        <button
                          className="cc-delete"
                          onClick={() => deleteRecord("doctors", doctor.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!doctors.length && (
                    <tr>
                      <td colSpan="6">No doctor records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {section === "appointments" && (
        <section className="cc-panel">
          <h2>
            {editingId !== null ? "Edit Appointment" : "Add an Appointment"}
          </h2>

          <form className="cc-form" onSubmit={saveAppointment}>
            <label>
              Patient name
              <input
                required
                value={appointmentForm.patientName}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    patientName: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Patient email
              <input
                required
                type="email"
                value={appointmentForm.patientEmail}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    patientEmail: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Phone
              <input
                required
                value={appointmentForm.patientPhone}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    patientPhone: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Doctor
              <select
                required
                value={appointmentForm.doctorId}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    doctorId: e.target.value,
                  })
                }
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} — {doctor.specialty}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Appointment date
              <input
                required
                type="date"
                value={appointmentForm.date}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    date: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Appointment time
              <input
                required
                type="time"
                value={appointmentForm.time}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    time: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Status
              <select
                value={appointmentForm.status}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    status: e.target.value,
                  })
                }
              >
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </label>

            <label>
              Reason for visit
              <input
                value={appointmentForm.reason}
                onChange={(e) =>
                  setAppointmentForm({
                    ...appointmentForm,
                    reason: e.target.value,
                  })
                }
              />
            </label>

            <div className="cc-actions cc-full">
              <button type="submit" className="cc-primary">
                {editingId !== null
                  ? "Update Appointment"
                  : "Add Appointment"}
              </button>
              {editingId !== null && (
                <button type="button" onClick={resetForms}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          <h2>Appointment Records</h2>

          {loading ? (
            <p>Loading appointments...</p>
          ) : (
            <div className="cc-table-wrap">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <strong>{appointment.patientName}</strong>
                        <br />
                        {appointment.patientEmail}
                      </td>
                      <td>
                        {appointment.doctorName ||
                          doctors.find(
                            (d) =>
                              String(d.id) === String(appointment.doctorId)
                          )?.name ||
                          "Unknown doctor"}
                      </td>
                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>
                        <select
                          aria-label={`Status for ${appointment.patientName}`}
                          value={appointment.status || "Pending"}
                          onChange={(e) =>
                            updateAppointmentStatus(
                              appointment,
                              e.target.value
                            )
                          }
                        >
                          <option>Confirmed</option>
                          <option>Pending</option>
                          <option>Completed</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                      <td className="cc-row-actions">
                        <button
                          onClick={() => editAppointment(appointment)}
                        >
                          Edit
                        </button>
                        <button
                          className="cc-delete"
                          onClick={() =>
                            deleteRecord("appointments", appointment.id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!appointments.length && (
                    <tr>
                      <td colSpan="6">No appointment records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
