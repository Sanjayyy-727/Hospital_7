import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  DoctorCard, DoctorList, SearchBar, TimeSlot, AppointmentCard, Loading
} from "./UI.jsx";

const doctor = {
  id: "doc-1",
  name: "Dr. Maya Sharma",
  specialty: "Cardiology",
  qualification: "MBBS, MD",
  experience: 8,
  rating: 4.8,
  fee: 700,
  image: "https://example.com/doctor.jpg"
};

describe("Hospital appointment UI components", () => {
  test("renders doctor card details and profile link", () => {
    render(<MemoryRouter><DoctorCard doctor={doctor} /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Dr. Maya Sharma" })).toBeInTheDocument();
    expect(screen.getByText("Cardiology")).toBeInTheDocument();
    expect(screen.getByText("₹700")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view profile/i })).toHaveAttribute("href", "/doctor/doc-1");
  });

  test("shows loading state while doctors are being fetched", () => {
    render(<DoctorList doctors={[]} loading />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("shows an empty state when no doctors match the search", () => {
    render(<DoctorList doctors={[]} loading={false} />);
    expect(screen.getByText(/no doctors available/i)).toBeInTheDocument();
  });

  test("updates the doctor search field when the user types", () => {
    const onChange = jest.fn();
    render(<SearchBar value="" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(/search doctors or specialties/i), {
      target: { value: "cardiology" }
    });
    expect(onChange).toHaveBeenCalledWith("cardiology");
  });

  test("selects a date/time slot when clicked", () => {
    const onClick = jest.fn();
    render(<TimeSlot time="10:30 AM" selected={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "10:30 AM" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("cancels an appointment when the cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(
      <AppointmentCard
        appointment={{
          id: "apt-1", doctorName: "Dr. Maya Sharma", specialty: "Cardiology",
          date: "2026-11-02", time: "10:30 AM", status: "Confirmed"
        }}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledWith("apt-1");
  });

  test("does not show cancel or reschedule controls for a cancelled appointment", () => {
    render(
      <AppointmentCard
        appointment={{
          id: "apt-2", doctorName: "Dr. Maya Sharma", specialty: "Cardiology",
          date: "2026-11-02", time: "10:30 AM", status: "Cancelled"
        }}
      />
    );
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reschedule/i })).not.toBeInTheDocument();
  });
});
