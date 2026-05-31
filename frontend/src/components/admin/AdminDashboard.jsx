import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineInbox,
  HiOutlineChartBar,
  HiOutlineDownload,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineOfficeBuilding,
  HiOutlineGlobe,
  HiOutlineDatabase,
  HiOutlineLogout,
} from "react-icons/hi";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("submissions"); // "submissions" or "analytics"
  const [contacts, setContacts] = useState([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  
  // Selected Contact for expansion detail modal
  const [expandedId, setExpandedId] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem("adminToken");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // 1. Fetch contacts
      const contactsRes = await api.get("/admin/contacts", {
        params: {
          skip: page * 20,
          limit: 20,
          search: search.trim() || undefined,
          status_filter: statusFilter || undefined,
        },
        headers,
      });
      setContacts(contactsRes.data.contacts);
      setTotalContacts(contactsRes.data.total);

      // 2. Fetch analytics
      const analyticsRes = await api.get("/analytics/summary", { headers });
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
      if (err.response?.status === 401) {
        toast("Session expired. Please log in again.", "error");
        handleLogout();
      } else {
        toast("Unable to retrieve database data.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchDashboardData();
  };

  const handleStatusChange = async (contactId, newStatus) => {
    const token = localStorage.getItem("adminToken");
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      await api.patch(
        `/admin/contacts/${contactId}`,
        { status: newStatus },
        { headers }
      );
      toast("Submission status updated", "success");
      
      // Update local state to avoid full reload
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error("Status update failed:", err);
      toast("Failed to update status", "error");
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this submission permanently?")) {
      return;
    }
    
    const token = localStorage.getItem("adminToken");
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      await api.delete(`/admin/contacts/${contactId}`, { headers });
      toast("Submission deleted", "success");
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to delete record:", err);
      toast("Failed to delete submission", "error");
    }
  };

  const handleExport = async (format) => {
    const token = localStorage.getItem("adminToken");
    toast(`Preparing ${format.toUpperCase()} download...`, "info");
    
    try {
      const response = await api.get(`/admin/export/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      
      // Create download link
      const blob = new Blob([response.data], {
        type:
          format === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `contact_submissions_${new Date().toISOString().slice(0, 10)}.${format === "excel" ? "xlsx" : "csv"}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Report export failed:", err);
      toast("Download failed. Check administrator session.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    window.history.pushState(null, "", "/login"); // Redirect to login
  };

  const adminName = localStorage.getItem("adminName") || "Administrator";

  return (
    <div className="min-h-screen bg-[#050816] font-sans text-white pb-12 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header bar */}
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-display">
                Control Console
              </h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, <span className="text-violet-300 font-semibold">{adminName}</span>. Manage contacts and monitor metrics.
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-300"
          >
            <HiOutlineLogout className="text-lg" />
            Logout
          </button>
        </header>

        {/* Analytics Highlights */}
        {analytics && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">Submissions</span>
                <HiOutlineInbox className="text-xl text-violet-400" />
              </div>
              <p className="mt-2 text-3xl font-bold">{totalContacts}</p>
              <p className="text-xs text-gray-500 mt-1">Total inquiries saved in SQL</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">Page Views</span>
                <HiOutlineChartBar className="text-xl text-cyan-400" />
              </div>
              <p className="mt-2 text-3xl font-bold">{analytics.total_views}</p>
              <p className="text-xs text-gray-500 mt-1">Total page view tracking pings</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">Unique Visitors</span>
                <HiOutlineGlobe className="text-xl text-fuchsia-400" />
              </div>
              <p className="mt-2 text-3xl font-bold">{analytics.unique_visitors}</p>
              <p className="text-xs text-gray-500 mt-1">Distinct IP addresses tracked</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">Inquiry Rate</span>
                <HiOutlineDatabase className="text-xl text-emerald-400" />
              </div>
              <p className="mt-2 text-3xl font-bold">{analytics.conversion_rate}%</p>
              <p className="text-xs text-gray-500 mt-1">Submission to unique visits ratio</p>
            </div>
          </div>
        )}

        {/* Tab selection */}
        <div className="mt-8 flex border-b border-white/10 pb-4 justify-between items-center flex-wrap gap-4">
          <div className="flex rounded-xl border border-white/5 bg-white/[0.02] p-1">
            <button
              onClick={() => setActiveTab("submissions")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === "submissions"
                  ? "bg-gradient-to-r from-violet-600/60 to-fuchsia-600/40 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Inquiries list
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === "analytics"
                  ? "bg-gradient-to-r from-fuchsia-600/50 to-cyan-600/50 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Analytics Charts
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-violet-500/35 hover:text-white"
            >
              <HiOutlineDownload />
              CSV
            </button>
            <button
              onClick={() => handleExport("excel")}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-cyan-500/35 hover:text-white"
            >
              <HiOutlineDownload />
              Excel (XLSX)
            </button>
          </div>
        </div>

        {/* Dashboard Tabs Content */}
        {loading ? (
          <div className="mt-20 flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-500" />
            <p className="text-sm text-gray-500">Querying secure SQL database…</p>
          </div>
        ) : activeTab === "submissions" ? (
          <div className="mt-8 space-y-6">
            {/* Filters Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, company, message..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-violet-500/40"
                />
                <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#070b1a] px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-violet-500/40"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>

              <button
                type="submit"
                className="rounded-xl bg-violet-600/30 border border-violet-500/40 px-5 py-2.5 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-600/40"
              >
                Filter
              </button>
            </form>

            {/* List */}
            {contacts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-gray-500">
                No matching inquiries found in the database.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-gray-300">
                    <thead className="border-b border-white/10 bg-white/[0.03] text-xs font-semibold uppercase tracking-wider text-gray-400">
                      <tr>
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Country</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {contacts.map((c) => {
                        const isExpanded = expandedId === c.id;
                        return (
                          <React.Fragment key={c.id}>
                            <tr
                              onClick={() => setExpandedId(isExpanded ? null : c.id)}
                              className="cursor-pointer hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="px-6 py-4 font-semibold text-white">{c.full_name}</td>
                              <td className="px-6 py-4 text-violet-300 font-medium">{c.service}</td>
                              <td className="px-6 py-4">{c.country || "Unknown"}</td>
                              <td className="px-6 py-4">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                                    c.status === "new"
                                      ? "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                                      : c.status === "read"
                                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                                      : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                                  }`}
                                >
                                  {c.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-gray-500">
                                {new Date(c.created_at).toLocaleDateString()}
                              </td>
                              <td
                                className="px-6 py-4 text-center"
                                onClick={(e) => e.stopPropagation()} // Stop modal trigger
                              >
                                <button
                                  onClick={() => handleDeleteContact(c.id)}
                                  className="text-gray-500 hover:text-rose-400 transition-colors"
                                  title="Delete submission permanently"
                                >
                                  <HiOutlineTrash className="text-lg" />
                                </button>
                              </td>
                            </tr>
                            
                            {/* Expanded Details Row */}
                            {isExpanded && (
                              <tr className="bg-white/[0.01]">
                                <td colSpan="6" className="px-6 py-5 border-t border-white/5">
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4 text-xs sm:text-sm"
                                  >
                                    <div className="grid gap-4 sm:grid-cols-3">
                                      <div className="flex items-center gap-2 text-gray-400">
                                        <HiOutlineMail className="text-lg text-violet-400" />
                                        <a href={`mailto:${c.email}`} className="text-blue-300 hover:underline">{c.email}</a>
                                      </div>
                                      <div className="flex items-center gap-2 text-gray-400">
                                        <HiOutlinePhone className="text-lg text-cyan-400" />
                                        <span>{c.phone}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-gray-400">
                                        <HiOutlineOfficeBuilding className="text-lg text-fuchsia-400" />
                                        <span>{c.company || "No Company Specified"}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="rounded-xl border border-white/5 bg-[#050816]/70 p-4">
                                      <p className="font-semibold text-gray-500 uppercase tracking-widest text-[9px] mb-2">Message</p>
                                      <p className="whitespace-pre-wrap leading-relaxed text-gray-300">{c.message}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                      <div className="text-xs text-gray-500">
                                        Visitor IP: <span className="font-mono">{c.ip_address}</span> | Geolocation: <span>{c.country}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 font-semibold">Change Status:</span>
                                        <select
                                          value={c.status}
                                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                                          className="rounded-lg border border-white/10 bg-[#0c1021] px-3 py-1 text-xs text-gray-300 outline-none"
                                        >
                                          <option value="new">New</option>
                                          <option value="read">Read</option>
                                          <option value="replied">Replied</option>
                                        </select>
                                      </div>
                                    </div>
                                  </motion.div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Pagination */}
            {totalContacts > 20 && (
              <div className="flex justify-between items-center text-sm text-gray-500">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span>Page {page + 1} of {Math.ceil(totalContacts / 20)}</span>
                <button
                  disabled={(page + 1) * 20 >= totalContacts}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Analytics tab with charts generated using styled Tailwind bars */
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Countries Charts */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
              <h3 className="text-lg font-bold font-display mb-4">Traffic by Country</h3>
              <div className="space-y-4">
                {analytics?.countries.length === 0 ? (
                  <p className="text-sm text-gray-500">No country traffic data logged yet.</p>
                ) : (
                  analytics?.countries.map((item, idx) => {
                    const maxVal = Math.max(...analytics.countries.map((i) => i.count)) || 1;
                    const pct = (item.count / maxVal) * 100;
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{item.label}</span>
                          <span className="text-violet-400">{item.count} hits</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/[0.03] overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Browsers Charts */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
              <h3 className="text-lg font-bold font-display mb-4">Browsers Breakdown</h3>
              <div className="space-y-4">
                {analytics?.browsers.length === 0 ? (
                  <p className="text-sm text-gray-500">No browser tracking logged yet.</p>
                ) : (
                  analytics?.browsers.map((item) => {
                    const maxVal = Math.max(...analytics.browsers.map((i) => i.count)) || 1;
                    const pct = (item.count / maxVal) * 100;
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{item.label}</span>
                          <span className="text-cyan-400">{item.count} hits</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/[0.03] overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-violet-600 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Devices Charts */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
              <h3 className="text-lg font-bold font-display mb-4">Device Sizing Breakdown</h3>
              <div className="space-y-4">
                {analytics?.devices.length === 0 ? (
                  <p className="text-sm text-gray-500">No device sizes tracked yet.</p>
                ) : (
                  analytics?.devices.map((item) => {
                    const maxVal = Math.max(...analytics.devices.map((i) => i.count)) || 1;
                    const pct = (item.count / maxVal) * 100;
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{item.label}</span>
                          <span className="text-fuchsia-400">{item.count} hits</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/[0.03] overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React from "react";
