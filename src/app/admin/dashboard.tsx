"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  has_vehicle: string;
  vehicle_type: string;
  seats: string;
  from: string;
  to: string;
  morning_time: string;
  evening_connect: string;
  evening_time: string;
  message: string;
  travel_frequency: string;
  travel_days: string;
  partner_id: string;
  status: string;
  created_at: string;
  from_lat: string;
  from_lng: string;
  to_lat: string;
  to_lng: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL as string;

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('admin_authenticated');
    if (isAuthenticated !== 'true') {
      router.push('/admin');
      return;
    }

    fetchCustomers();
  }, [router]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerStatus = async (customerId: string, newStatus: string) => {
    setUpdating(customerId);
    try {
      // Find the customer to get their row index
      const customer = customers.find(c => c.id === customerId);
      if (!customer) throw new Error("Customer not found");

      // Update the customer in Google Sheets
      const response = await fetch(`${API}/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...customer,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      // Update local state
      setCustomers(prev => 
        prev.map(c => c.id === customerId ? { ...c, status: newStatus } : c)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    router.push('/admin');
  };

  const uncheckedCustomers = customers.filter(c => c.status === "New");
  const contactedCustomers = customers.filter(c => c.status === "Contacted");

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F5EEA]"></div>
            <p className="mt-4 text-gray-600">Loading customers...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Error: {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <Link href="/" className="text-sm text-gray-600 hover:text-[#2F5EEA] transition">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage customer inquiries and track contact status</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Unchecked Customers</h2>
              <p className="text-sm text-gray-600">Customers waiting for contact</p>
            </div>
            <div className="bg-[#2F5EEA] text-white rounded-full px-6 py-3">
              <span className="text-2xl font-bold">{uncheckedCustomers.length}</span>
            </div>
          </div>
        </div>

        {/* Unchecked Customers Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-red-100 text-red-700 rounded-full px-3 py-1 text-sm font-medium mr-3">
              New
            </span>
            Unchecked Customers ({uncheckedCustomers.length})
          </h2>

          {uncheckedCustomers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No unchecked customers</p>
            </div>
          ) : (
            <div className="space-y-4">
              {uncheckedCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  updating={updating === customer.id}
                  onUpdateStatus={() => updateCustomerStatus(customer.id, "Contacted")}
                  actionLabel="Mark as Contacted"
                  actionColor="blue"
                />
              ))}
            </div>
          )}
        </div>

        {/* Contacted Customers Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-sm font-medium mr-3">
              Contacted
            </span>
            Contacted Customers ({contactedCustomers.length})
          </h2>

          {contactedCustomers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No contacted customers yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contactedCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  updating={false}
                  onUpdateStatus={null}
                  actionLabel="Contacted"
                  actionColor="green"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

interface CustomerCardProps {
  customer: Customer;
  updating: boolean;
  onUpdateStatus: (() => void) | null;
  actionLabel: string;
  actionColor: "blue" | "green";
}

function CustomerCard({ customer, updating, onUpdateStatus, actionLabel, actionColor }: CustomerCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionButtonClasses = () => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium text-sm transition-colors";
    if (actionColor === "blue") {
      return `${baseClasses} bg-[#2F5EEA] text-white hover:bg-[#1E3FAE] disabled:opacity-50 disabled:cursor-not-allowed`;
    } else {
      return `${baseClasses} bg-green-100 text-green-700 cursor-default`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Customer Info */}
        <div className="lg:col-span-2">
          <h3 className="font-semibold text-gray-900 text-lg mb-2">{customer.name}</h3>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> {customer.email || "Not provided"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Phone:</span> {customer.phone}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Gender:</span> {customer.gender || "Not specified"}
            </p>
            {customer.partner_id && (
              <p className="text-gray-600">
                <span className="font-medium">Partner ID:</span> {customer.partner_id}
              </p>
            )}
          </div>
        </div>

        {/* Travel Info */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Travel Details</h4>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">From:</span> {customer.from}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">To:</span> {customer.to}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Time:</span> {customer.morning_time}
            </p>
            {customer.evening_connect === "Yes" && (
              <p className="text-gray-600">
                <span className="font-medium">Return:</span> {customer.evening_time}
              </p>
            )}
            <p className="text-gray-600">
              <span className="font-medium">Vehicle:</span> {customer.has_vehicle}
            </p>
            {customer.has_vehicle === "Yes" && customer.vehicle_type && (
              <p className="text-gray-600">
                <span className="font-medium">Type:</span> {customer.vehicle_type}
              </p>
            )}
          </div>
        </div>

        {/* Actions & Meta */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-4">
              Submitted: {formatDate(customer.created_at)}
            </p>
            {onUpdateStatus && (
              <button
                onClick={onUpdateStatus}
                disabled={updating}
                className={getActionButtonClasses()}
              >
                {updating ? "Updating..." : actionLabel}
              </button>
            )}
            {!onUpdateStatus && (
              <div className={getActionButtonClasses()}>
                {actionLabel}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message */}
      {customer.message && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Message:</span> {customer.message}
          </p>
        </div>
      )}
    </div>
  );
}
