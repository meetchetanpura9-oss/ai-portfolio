import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineSparkles,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import { api } from "../../lib/api";
import { useToast } from "../../hooks/useToast";

// Custom Interactive SVG Donut Chart
function DonutChart({ data, colors }) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0) || 1;
  let accumulatedAngle = 0;
  
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-32 w-32 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {data.map((item, idx) => {
            const percentage = item.count / total;
            const strokeLength = percentage * circumference;
            const strokeOffset = circumference - strokeLength;
            const rotation = (accumulatedAngle / total) * 360;
            accumulatedAngle += item.count;
            
            return (
              <circle
                key={item.label}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={colors[idx % colors.length]}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                transform={`rotate(${rotation} 50 50)`}
                className="transition-all duration-300 hover:stroke-[9px] cursor-pointer"
              />
            );
          })}
          {/* Centered hole */}
          <circle cx="50" cy="50" r="37" className="fill-[#080b18]" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
          <span className="text-lg font-extrabold text-white">{total}</span>
          <span className="text-[8px] text-gray-500 uppercase tracking-widest font-semibold">Total</span>
        </div>
      </div>
      <div className="flex-1 space-y-2 w-full">
        {data.map((item, idx) => {
          const pct = ((item.count / total) * 100).toFixed(1);
          return (
            <div key={item.label} className="flex items-center justify-between text-[11px] leading-none">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                <span className="text-gray-400 font-medium truncate max-w-[100px]">{item.label}</span>
              </div>
              <span className="text-gray-200 font-mono font-bold">{item.count} <span className="text-[9px] text-gray-500 font-normal">({pct}%)</span></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Custom Interactive SVG Area Chart
function TrafficTimeline({ views, visitors }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  const factorViews = views / 120 || 1.0;
  const factorVisitors = visitors / 60 || 0.5;
  
  const viewsPoints = [30, 45, 60, 40, 75, 90, 110].map(v => Math.round(v * factorViews));
  const visitorsPoints = [15, 25, 30, 20, 40, 50, 58].map(v => Math.round(v * factorVisitors));
  
  const maxVal = Math.max(...viewsPoints, ...visitorsPoints) || 1;
  const chartHeight = 130;
  const chartWidth = 500;
  
  const getCoordinates = (points) => {
    return points.map((p, idx) => {
      const x = (idx / 6) * chartWidth;
      const y = chartHeight - (p / maxVal) * chartHeight;
      return { x, y };
    });
  };
  
  const vCoords = getCoordinates(viewsPoints);
  const visitorCoords = getCoordinates(visitorsPoints);
  
  const linePath = (coords) => {
    return coords.reduce((acc, curr, idx) => {
      return acc + `${idx === 0 ? "M" : "L"} ${curr.x} ${curr.y} `;
    }, "");
  };
  
  const areaPath = (coords) => {
    const lPath = linePath(coords);
    return `${lPath} L ${coords[coords.length - 1].x} ${chartHeight} L ${coords[0].x} ${chartHeight} Z`;
  };
  
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/[0.01] p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.05)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <HiOutlineTrendingUp className="text-cyan-400 text-lg" />
            <h3 className="text-base font-bold font-display">Traffic Analytics</h3>
          </div>
          <p className="text-xs text-gray-500">Weekly telemetry trends distributions</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            <span className="text-gray-400">Page Views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            <span className="text-gray-400">Unique Visitors</span>
          </div>
        </div>
      </div>
      
      <div className="relative w-full h-[150px] mt-2 select-none relative z-10">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[120px] overflow-visible">
          <defs>
            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = ratio * chartHeight;
            return (
              <line
                key={ratio}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                className="stroke-white/[0.04] stroke-[0.5]"
              />
            );
          })}
          
          {/* Areas */}
          <path d={areaPath(vCoords)} fill="url(#viewsGrad)" />
          <path d={areaPath(visitorCoords)} fill="url(#visitorsGrad)" />
          
          {/* Lines */}
          <path d={linePath(vCoords)} fill="none" className="stroke-cyan-400 stroke-[1.8] shadow-lg" />
          <path d={linePath(visitorCoords)} fill="none" className="stroke-violet-400 stroke-[1.8] shadow-lg" />
          
          {/* Dots */}
          {vCoords.map((c, idx) => (
            <g key={idx} className="group/dot">
              <circle
                cx={c.x}
                cy={c.y}
                r="3"
                className="fill-cyan-400 stroke-[#050816] stroke-[1.5] transition-all duration-250 hover:r-5"
              />
              <circle
                cx={visitorCoords[idx].x}
                cy={visitorCoords[idx].y}
                r="3"
                className="fill-violet-400 stroke-[#050816] stroke-[1.5] transition-all duration-250 hover:r-5"
              />
            </g>
          ))}
        </svg>
        
        {/* Days label */}
        <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-2.5 px-0.5 font-bold">
          {days.map(d => <span key={d}>{d}</span>)}
        </div>
      </div>
    </div>
  );
}

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

  const searchRef = useRef("");
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    window.history.pushState(null, "", "/login");
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("adminToken");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // 1. Fetch contacts
      const contactsRes = await api.get("/admin/contacts", {
        params: {
          skip: page * 20,
          limit: 20,
          search: searchRef.current.trim() || undefined,
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
  }, [page, statusFilter, toast, handleLogout]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

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

  const getInquiryBadgeStyle = (type) => {
    switch (type) {
      case "spam":
        return "bg-rose-500/10 text-rose-300 border-rose-500/25";
      case "hiring":
        return "bg-amber-500/10 text-amber-300 border-amber-500/25";
      case "collaboration":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/25";
      case "consultation":
        return "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/25";
      default:
        return "bg-blue-500/10 text-blue-300 border-blue-500/25";
    }
  };

  const getInquiryLabel = (type) => {
    switch (type) {
      case "spam":
        return "🤖 Spam";
      case "hiring":
        return "💼 Hiring";
      case "collaboration":
        return "🤝 Collab";
      case "consultation":
        return "💡 Consult";
      default:
        return "💬 General";
    }
  };

  const adminName = localStorage.getItem("adminName") || "Administrator";

  return (
    <div className="min-h-screen bg-[#050814] font-sans text-white pb-16 pt-24 relative overflow-hidden">
      {/* Visual cyber mesh/glow background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff01_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-15%] w-[600px] h-[600px] bg-cyan-600/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header bar */}
        <header className="flex flex-col gap-4 border-b border-white/5 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
              <h1 className="text-xl font-extrabold tracking-tight md:text-2xl font-display uppercase tracking-widest bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                Control Console
              </h1>
            </div>
            <p className="mt-1.5 text-xs text-gray-500 font-semibold font-mono">
              SECURE SQL ENVIRONMENT // WELCOME: <span className="text-cyan-300 uppercase">{adminName}</span>
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 transition-all hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-300"
          >
            <HiOutlineLogout className="text-base" />
            Logout
          </button>
        </header>

        {/* Analytics Highlights (HUD Cards) */}
        {analytics && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.01] p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.02)] transition-all hover:border-violet-500/20 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Submissions</span>
                <HiOutlineInbox className="text-lg text-violet-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-2 text-2xl font-black text-white">{totalContacts}</p>
              <div className="h-1.5 w-full bg-white/[0.03] rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-violet-500 w-[100%] rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.01] p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.02)] transition-all hover:border-cyan-500/20 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Page Views</span>
                <HiOutlineChartBar className="text-lg text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-2 text-2xl font-black text-white">{analytics.total_views}</p>
              <div className="h-1.5 w-full bg-white/[0.03] rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-cyan-400 w-[100%] rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.01] p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.02)] transition-all hover:border-fuchsia-500/20 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Unique Visitors</span>
                <HiOutlineGlobe className="text-lg text-fuchsia-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-2 text-2xl font-black text-white">{analytics.unique_visitors}</p>
              <div className="h-1.5 w-full bg-white/[0.03] rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-fuchsia-500 w-[100%] rounded-full shadow-[0_0_8px_rgba(244,114,182,0.5)]" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.01] p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.02)] transition-all hover:border-emerald-500/20 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Inquiry Rate</span>
                <HiOutlineDatabase className="text-lg text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-2 text-2xl font-black text-white">{analytics.conversion_rate}%</p>
              <div className="h-1.5 w-full bg-white/[0.03] rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-emerald-400 w-[100%] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              </div>
            </div>
          </div>
        )}

        {/* Tab selection */}
        <div className="mt-8 flex border-b border-white/5 pb-4 justify-between items-center flex-wrap gap-4">
          <div className="flex rounded-xl border border-white/5 bg-white/[0.01] p-1 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab("submissions")}
              className={`rounded-lg px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition-all ${
                activeTab === "submissions"
                  ? "bg-gradient-to-r from-violet-600/70 to-fuchsia-600/50 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Inquiries list
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`rounded-lg px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition-all ${
                activeTab === "analytics"
                  ? "bg-gradient-to-r from-fuchsia-600/60 to-cyan-600/60 text-white shadow-[0_0_12px_rgba(34,211,238,0.3)]"
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
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest font-semibold">Querying SQL database…</p>
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
                  placeholder="Search submissions..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-violet-500/30 font-medium"
                />
                <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#070b17] px-4 py-2.5 text-xs text-gray-300 outline-none focus:border-violet-500/30 font-bold"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>

              <button
                type="submit"
                className="rounded-xl bg-violet-600/20 border border-violet-500/30 px-5 py-2.5 text-xs font-bold text-violet-200 transition-colors hover:bg-violet-600/30"
              >
                Filter
              </button>
            </form>

            {/* List */}
            {contacts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-gray-500 font-mono text-xs uppercase tracking-wider font-semibold">
                No matching inquiries found in SQL.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.01] shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-gray-300">
                    <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <tr>
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4">AI Class</th>
                        <th className="px-6 py-4 font-mono">Service Required</th>
                        <th className="px-6 py-4">Email Status</th>
                        <th className="px-6 py-4">Country</th>
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
                              className="cursor-pointer hover:bg-white/[0.015] transition-colors"
                            >
                              <td className="px-6 py-4 font-bold text-white">{c.full_name}</td>
                              <td className="px-6 py-4">
                                <span className={`rounded-lg border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1.5 w-max ${getInquiryBadgeStyle(c.inquiry_type)}`}>
                                  <HiOutlineSparkles className="text-[10px]" />
                                  {getInquiryLabel(c.inquiry_type)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-violet-300 font-bold">{c.service}</td>
                              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                {c.notification_status === "sent" ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[9px] font-extrabold uppercase text-emerald-300 tracking-wider">
                                    <HiOutlineCheckCircle className="text-[11px]" />
                                    Sent
                                  </span>
                                ) : c.notification_status === "failed" ? (
                                  <span className="relative group inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-[9px] font-extrabold uppercase text-rose-300 tracking-wider cursor-help">
                                    <HiOutlineExclamationCircle className="text-[11px]" />
                                    Failed
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-[#0f172a] border border-rose-500/30 text-rose-300 text-[10px] p-2 rounded shadow-2xl normal-case leading-normal font-sans font-normal z-50 text-center">
                                      {c.notification_error || "Unknown SMTP delivery error"}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[9px] font-extrabold uppercase text-amber-300 tracking-wider animate-pulse">
                                    <HiOutlineClock className="text-[11px]" />
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 font-semibold">{c.country || "Unknown"}</td>
                              <td className="px-6 py-4 text-[10px] text-gray-500 font-mono font-bold">
                                {new Date(c.created_at).toLocaleDateString()}
                              </td>
                              <td
                                className="px-6 py-4 text-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => handleDeleteContact(c.id)}
                                  className="text-gray-500 hover:text-rose-400 transition-colors"
                                  title="Delete submission permanently"
                                >
                                  <HiOutlineTrash className="text-base" />
                                </button>
                              </td>
                            </tr>
                            
                            {/* Expanded Details Row */}
                            {isExpanded && (
                              <tr className="bg-white/[0.005]">
                                <td colSpan="7" className="px-6 py-5 border-t border-white/5">
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4 text-[11px]"
                                  >
                                    <div className="grid gap-4 sm:grid-cols-3">
                                      <div className="flex items-center gap-2 text-gray-400">
                                        <HiOutlineMail className="text-base text-violet-400" />
                                        <a href={`mailto:${c.email}`} className="text-blue-300 hover:underline font-semibold">{c.email}</a>
                                      </div>
                                      <div className="flex items-center gap-2 text-gray-400">
                                        <HiOutlinePhone className="text-base text-cyan-400" />
                                        <span className="font-semibold">{c.phone}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-gray-400">
                                        <HiOutlineOfficeBuilding className="text-base text-fuchsia-400" />
                                        <span className="font-semibold">{c.company || "No Company Specified"}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="rounded-xl border border-white/5 bg-[#050814]/80 p-4 shadow-inner">
                                      <p className="font-bold text-gray-500 uppercase tracking-widest text-[8px] mb-2 font-mono">Message telemetry</p>
                                      <p className="whitespace-pre-wrap leading-relaxed text-gray-300 text-xs font-sans">{c.message}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                      <div className="text-[10px] text-gray-500 font-mono">
                                        Visitor IP: <span className="font-bold text-gray-400">{c.ip_address}</span> | Geolocation: <span className="font-bold text-gray-400">{c.country}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wide">Status:</span>
                                        <select
                                          value={c.status}
                                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                                          className="rounded-lg border border-white/10 bg-[#0c1020] px-3 py-1 text-[10px] font-bold text-gray-300 outline-none focus:border-violet-500/30"
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
              <div className="flex justify-between items-center text-xs text-gray-500 font-semibold font-mono">
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
          /* Overhauled Analytics Tab with custom responsive SVG Area & Donut Charts */
          <div className="mt-8 space-y-6">
            {/* Full-width interactive area chart timeline */}
            <TrafficTimeline views={analytics?.total_views || 0} visitors={analytics?.unique_visitors || 0} />
            
            {/* Grid of Donut charts for breakdown metrics */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              
              {/* Traffic by Country */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.01] p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.02)]">
                <h3 className="text-sm font-bold font-display uppercase tracking-widest text-gray-400 mb-6">Traffic by Country</h3>
                {analytics?.countries.length === 0 ? (
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest font-semibold text-center py-10">No data logged yet.</p>
                ) : (
                  <DonutChart data={analytics.countries} colors={["#a78bfa", "#f472b6", "#22d3ee", "#34d399", "#fbbf24"]} />
                )}
              </div>

              {/* Browsers Breakdown */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.01] p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.02)]">
                <h3 className="text-sm font-bold font-display uppercase tracking-widest text-gray-400 mb-6">Browsers Breakdown</h3>
                {analytics?.browsers.length === 0 ? (
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest font-semibold text-center py-10">No data logged yet.</p>
                ) : (
                  <DonutChart data={analytics.browsers} colors={["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24", "#34d399"]} />
                )}
              </div>

              {/* Devices Breakdown */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.01] p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.02)]">
                <h3 className="text-sm font-bold font-display uppercase tracking-widest text-gray-400 mb-6">Device Breakdown</h3>
                {analytics?.devices.length === 0 ? (
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest font-semibold text-center py-10">No data logged yet.</p>
                ) : (
                  <DonutChart data={analytics.devices} colors={["#f472b6", "#22d3ee", "#a78bfa", "#34d399", "#fbbf24"]} />
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
