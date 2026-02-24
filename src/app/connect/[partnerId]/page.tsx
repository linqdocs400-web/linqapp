"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface FormData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  has_vehicle: string;
  vehicle_type: string;
  seats: string;
  from: string;
  to: string;
  time: string;
  willing_return: string;
  return_time: string;
  message_to_partner: string;
  travel_frequency: string;
  travel_days: string[];
}

export default function ConnectPage() {
  const { partnerId } = useParams();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    gender: "",
    has_vehicle: "",
    vehicle_type: "",
    seats: "",
    from: "",
    to: "",
    time: "",
    willing_return: "",
    return_time: "",
    message_to_partner: "",
    travel_frequency: "",
    travel_days: [],
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);

  // ===== HELPER FUNCTIONS =====
  function formatTo12Hour(time: string) {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  }

  // ===== FORM HANDLERS =====
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }

  function handleHasVehicleChange(value: string) {
    setForm(prev => ({
      ...prev,
      has_vehicle: value,
      vehicle_type: value === "No" ? "" : prev.vehicle_type,
      seats: value === "No" ? "" : prev.seats,
    }));
  }

  function handleWillingReturnChange(value: string) {
    setForm(prev => ({
      ...prev,
      willing_return: value,
      return_time: value === "No" ? "" : prev.return_time,
    }));
  }

  function handleTravelFrequencyChange(value: string) {
    setForm(prev => ({
      ...prev,
      travel_frequency: value,
      travel_days: value === "Specific days" ? prev.travel_days : [],
    }));
  }

  function handleTravelDayToggle(day: string) {
    setForm(prev => ({
      ...prev,
      travel_days: prev.travel_days.includes(day)
        ? prev.travel_days.filter(d => d !== day)
        : [...prev.travel_days, day],
    }));
  }

  // ===== VALIDATION =====
  function validateForm(): boolean {
    const newErrors: Partial<FormData> = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    if (!form.from.trim()) newErrors.from = "From address is required";
    if (!form.to.trim()) newErrors.to = "To address is required";
    if (!form.time.trim()) newErrors.time = "Time is required";
    
    // Validate return time if willing to return is "Yes"
    if (form.willing_return === "Yes" && !form.return_time.trim()) {
      newErrors.return_time = "Return time is required when willing to return";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ===== GEOCODING =====
  async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }
    return null;
  }

  // 🔍 LOCATION SEARCH (INDIA + HYDERABAD BIAS)
  async function searchLocation(value: string, type: "from" | "to") {
    if (value.length < 2) return;

    const viewbox = "78.2311,17.6033,78.5911,17.2161"; // Hyderabad box

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${value}&format=json&countrycodes=in&limit=6&viewbox=${viewbox}`
    );

    let data = await res.json();

    data = data.sort((a: any, b: any) => {
      const aHyd = a.display_name.toLowerCase().includes("hyderabad") ? 0 : 1;
      const bHyd = b.display_name.toLowerCase().includes("hyderabad") ? 0 : 1;
      return aHyd - bHyd;
    });

    if (type === "from") setFromSuggestions(data);
    else setToSuggestions(data);
  }

  // ===== DUPLICATE CHECK =====
  async function checkDuplicate(submissionData: any): Promise<boolean> {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL as string);
      const existingData = await response.json();

      return existingData.some((row: any) => {
        const matchName = row.name?.toLowerCase().trim() === submissionData.name.toLowerCase().trim();
        const matchPhone = row.phone?.toLowerCase().trim() === submissionData.phone.toLowerCase().trim();
        const matchFrom = row.from?.toLowerCase().trim() === submissionData.from.toLowerCase().trim();
        const matchTo = row.to?.toLowerCase().trim() === submissionData.to.toLowerCase().trim();
        const matchTime = row.morning_time?.toLowerCase().trim() === submissionData.morning_time.toLowerCase().trim();

        return matchName && matchPhone && matchFrom && matchTo && matchTime;
      });
    } catch (err) {
      console.error("Duplicate check error:", err);
      return false;
    }
  }

  // ===== SUBMIT =====
  const API = process.env.NEXT_PUBLIC_API_URL as string;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      // Geocode addresses
      const fromCoords = await geocodeAddress(form.from);
      const toCoords = await geocodeAddress(form.to);

      const submissionData = {
        id: Date.now().toString(),
        name: form.name,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        has_vehicle: form.has_vehicle,
        vehicle_type: form.vehicle_type,
        seats: form.seats,
        from: form.from,
        to: form.to,
        morning_time: form.time,
        evening_connect: form.willing_return,
        evening_time: form.return_time,
        message: form.message_to_partner,
        travel_frequency: form.travel_frequency,
        travel_days: form.travel_days.join(","),
        status: "active",
        created_at: new Date().toISOString(),
        from_lat: fromCoords?.lat || "",
        from_lng: fromCoords?.lng || "",
        to_lat: toCoords?.lat || "",
        to_lng: toCoords?.lng || ""
      };

      // duplicate check
      const existingRes = await fetch(API);
      const existing = await existingRes.json();

      const already = existing.some((r: any) =>
        r.phone === submissionData.phone &&
        r.from === submissionData.from &&
        r.to === submissionData.to &&
        r.morning_time === submissionData.morning_time
      );

      if (already) {
        alert("You already submitted this route");
        setSubmitting(false);
        return;
      }

      await fetch(API, {
        method: "POST",
        body: JSON.stringify(submissionData)
      });

      alert("Submitted successfully");
      setSubmitting(false);

      // Handle success based on route
      if (partnerId) {
        setTimeout(() => {
          const whatsappMessage = encodeURIComponent(
            `Hi LinQ 👋\n\nI want to connect with Partner ID: ${partnerId}\n\nMy details submitted on website.`
          );
          window.location.href = `https://wa.me/9494823941?text=${whatsappMessage}`;
        }, 2000);
      } else {
        setTimeout(() => {
          window.location.href = "/#search";
        }, 1000);
      }

    } catch (err) {
      console.error(err);
      setSubmitting(false);
      alert("Submission failed");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 md:px-12 pt-28 pb-20">
      <div className="max-w-4xl mx-auto">

        <Link href="/" className="text-sm text-gray-600">
          ← Back
        </Link>

        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mt-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            {partnerId ? "Share your details" : "Share Your Details"}
          </h1>
          {partnerId && (
            <p className="text-gray-600 mb-8">Connect with Partner ID: {partnerId}</p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2F5EEA] focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2F5EEA] focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2F5EEA] focus:border-transparent ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2F5EEA] focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Vehicle Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you have a vehicle? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="has_vehicle"
                    value="Yes"
                    checked={form.has_vehicle === "Yes"}
                    onChange={(e) => handleHasVehicleChange(e.target.value)}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="has_vehicle"
                    value="No"
                    checked={form.has_vehicle === "No"}
                    onChange={(e) => handleHasVehicleChange(e.target.value)}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            </div>

            {form.has_vehicle === "Yes" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  <input
                    type="text"
                    name="vehicle_type"
                    value={form.vehicle_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2F5EEA] focus:border-transparent"
                    placeholder="e.g., Car, Bike, Scooter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Seats
                  </label>
                  <input
                    type="number"
                    name="seats"
                    value={form.seats}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2F5EEA] focus:border-transparent"
                    placeholder="Number of seats available"
                    min="1"
                  />
                </div>
              </div>
            )}

            {/* Travel Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="from"
                    value={form.from}
                    onChange={(e) => {
                      handleChange(e);
                      searchLocation(e.target.value, "from");
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2F5EEA] focus:border-transparent ${
                      errors.from ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter pickup location"
                  />
                  {errors.from && <p className="text-red-500 text-sm mt-1">{errors.from}</p>}

                  {fromSuggestions.length > 0 && (
                    <div className="absolute bg-white border rounded-xl mt-1 w-full z-50 max-h-60 overflow-y-auto">
                      {fromSuggestions.map((s: any, i: number) => (
                        <div
                          key={i}
                          onClick={() => {
                            setForm({
                                ...form,
                                from: s.display_name,
                              });
                            setFromSuggestions([]);
                          }}
                          className="p-3 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {s.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="to"
                    value={form.to}
                    onChange={(e) => {
                      handleChange(e);
                      searchLocation(e.target.value, "to");
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2F5EEA] focus:border-transparent ${
                      errors.to ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter destination"
                  />
                  {errors.to && <p className="text-red-500 text-sm mt-1">{errors.to}</p>}

                  {toSuggestions.length > 0 && (
                    <div className="absolute bg-white border rounded-xl mt-1 w-full z-50 max-h-60 overflow-y-auto">
                      {toSuggestions.map((s: any, i: number) => (
                        <div
                          key={i}
                          onClick={() => {
                            setForm({
                                ...form,
                                to: s.display_name,
                              });
                            setToSuggestions([]);
                          }}
                          className="p-3 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {s.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2F5EEA] focus:border-transparent ${
                      errors.time ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select time</option>

                    {Array.from({ length: 24 }).map((_, hour) =>
                      ["00", "15", "30", "45"].map((minute) => {
                        const h = hour.toString().padStart(2, "0");
                        const value = `${h}:${minute}`;

                        return (
                          <option key={value} value={value}>
                            {formatTo12Hour(value)}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Willing to Return?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="willing_return"
                      value="Yes"
                      checked={form.willing_return === "Yes"}
                      onChange={(e) => handleWillingReturnChange(e.target.value)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="willing_return"
                      value="No"
                      checked={form.willing_return === "No"}
                      onChange={(e) => handleWillingReturnChange(e.target.value)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>
            </div>

            {form.willing_return === "Yes" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Time
                </label>
                <div className="relative">
                  <select
                    name="return_time"
                    value={form.return_time}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2F5EEA] focus:border-transparent ${
                      errors.return_time ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select return time</option>

                    {Array.from({ length: 24 }).map((_, hour) =>
                      ["00", "15", "30", "45"].map((minute) => {
                        const h = hour.toString().padStart(2, "0");
                        const value = `${h}:${minute}`;

                        return (
                          <option key={value} value={value}>
                            {formatTo12Hour(value)}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
                {errors.return_time && <p className="text-red-500 text-sm mt-1">{errors.return_time}</p>}
              </div>
            )}

            {/* Travel Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How often will you travel?
              </label>
              <select
                name="travel_frequency"
                value={form.travel_frequency}
                onChange={(e) => handleTravelFrequencyChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2F5EEA] focus:border-transparent"
              >
                <option value="">Select frequency</option>
                <option value="Everyday">Everyday</option>
                <option value="Monday to Friday">Monday to Friday</option>
                <option value="Monday to Saturday">Monday to Saturday</option>
                <option value="Specific days">Specific days</option>
              </select>
            </div>

            {form.travel_frequency === "Specific days" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select travel days
                </label>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={form.travel_days.includes(day)}
                        onChange={() => handleTravelDayToggle(day)}
                        className="mr-2"
                      />
                      <span className="text-sm">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to Partner
              </label>
              <textarea
                name="message_to_partner"
                value={form.message_to_partner}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2F5EEA] focus:border-transparent"
                placeholder="Any specific requirements or preferences?"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#2F5EEA] text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1E3FAE] transition"
              >
                {submitting ? "Submitting..." : (partnerId ? "Submit & Continue on WhatsApp" : "Submit Details")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
