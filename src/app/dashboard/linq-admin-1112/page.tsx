"use client";

import { useState, useEffect } from "react";
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
  travel_days: string;
  college_office: string;
  partner_id: string;
  status: string;
  created_at: string;
  from_lat: string;
  from_lng: string;
  to_lat: string;
  to_lng: string;
}

export default function PrivateAdminDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL as string;

  useEffect(() => {
    fetchCustomers();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchCustomers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerStatus = async (customerId: string, newStatus: string) => {
    setUpdating(customerId);
    try {
      // Find customer to get their row index
      const customer = customers.find(c => c.id === customerId);
      if (!customer) throw new Error("Customer not found");

      // Update customer in Google Sheets via Apps Script
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

  const deleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
      return;
    }
    
    setUpdating(customerId);
    try {
      // Delete customer from Google Sheets via Apps Script
      const response = await fetch(`${API}/${customerId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete customer");

      // Remove from local state
      setCustomers(prev => prev.filter(c => c.id !== customerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete customer");
    } finally {
      setUpdating(null);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    String(customer.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(customer.phone || "").includes(searchTerm) ||
    String(customer.from || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(customer.to || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uncheckedCustomers = filteredCustomers.filter(c => c.status === "New");
  const contactedCustomers = filteredCustomers.filter(c => c.status === "Contacted");
  const inactiveCustomers = filteredCustomers.filter(c => c.status === "Inactive");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
            <button 
              onClick={() => {
                setError(null);
                fetchCustomers();
              }}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <head>
        <meta name="robots" content="noindex" />
      </head>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage customer inquiries and track contact status</p>
          </div>
          <Link href="/" className="text-sm text-gray-600 hover:text-[#2F5EEA] transition">
            ← Back to Home
          </Link>
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

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search by name, phone, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F5EEA] focus:border-transparent"
            />
            <div className="text-sm text-gray-500">
              {filteredCustomers.length} of {customers.length} customers
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

        {/* Inactive Customers Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-sm font-medium mr-3">
              Inactive
            </span>
            Inactive Customers ({inactiveCustomers.length})
          </h2>

          {inactiveCustomers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No inactive customers</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inactiveCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  updating={false}
                  onUpdateStatus={() => updateCustomerStatus(customer.id, "New")}
                  actionLabel="Make Active"
                  actionColor="gray"
                />
              ))}
            </div>
          )}
        </div>

        {/* All Customers Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-sm font-medium mr-3">
              All Users
            </span>
            All Customers ({filteredCustomers.length})
          </h2>

          {filteredCustomers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No customers found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  updating={updating === customer.id}
                  onUpdateStatus={customer.status === "Inactive" ? () => updateCustomerStatus(customer.id, "New") : 
                                   customer.status === "New" ? () => updateCustomerStatus(customer.id, "Contacted") : null}
                  actionLabel={customer.status === "Inactive" ? "Make Active" : 
                              customer.status === "New" ? "Mark as Contacted" : "Contacted"}
                  actionColor={customer.status === "Inactive" ? "gray" : 
                              customer.status === "New" ? "blue" : "green"}
                  onDelete={() => deleteCustomer(customer.id)}
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
  onDelete?: () => void;
  actionLabel: string;
  actionColor: "blue" | "green" | "gray" | "purple";
}

function CustomerCard({ customer, updating, onUpdateStatus, onDelete, actionLabel, actionColor }: CustomerCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === "Not specified") return "Not specified";
    
    try {
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        });
      }
      
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours));
      date.setMinutes(parseInt(minutes || '0'));
      
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  };

  const getActionButtonClasses = () => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium text-sm transition-colors";
    if (actionColor === "blue") {
      return `${baseClasses} bg-[#2F5EEA] text-white hover:bg-[#1E3FAE] disabled:opacity-50 disabled:cursor-not-allowed`;
    } else if (actionColor === "green") {
      return `${baseClasses} bg-green-100 text-green-700 cursor-default`;
    } else if (actionColor === "gray") {
      return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed`;
    } else {
      return `${baseClasses} bg-purple-100 text-purple-700 cursor-default`;
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
              <span className="font-medium">Phone:</span> {String(customer.phone || "")}
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
              <span className="font-medium">From:</span> {customer.from || "Not specified"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">To:</span> {customer.to || "Not specified"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Time:</span> {formatTime(customer.morning_time)}
            </p>
            {customer.evening_connect === "Yes" && (
              <p className="text-gray-600">
                <span className="font-medium">Return:</span> {formatTime(customer.evening_time)}
              </p>
            )}
            <p className="text-gray-600">
              <span className="font-medium">Vehicle:</span> {customer.has_vehicle || "Not specified"}
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
            {onDelete && (
              <button
                onClick={onDelete}
                disabled={updating}
                className="ml-2 px-3 py-2 rounded-lg font-medium text-sm bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* College/Office */}
      {customer.college_office && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium">College/Office:</span> {customer.college_office}
          </p>
        </div>
      )}

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
