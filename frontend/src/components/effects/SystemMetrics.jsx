import { useEffect, useState } from "react";
import { HiOutlineServer, HiOutlineDatabase, HiOutlineLightningBolt } from "react-icons/hi";
import { api } from "../../lib/api";

export default function SystemMetrics() {
  const [stats, setStats] = useState({
    status: "connecting",
    dbCount: 0,
    uptime: 0,
    latency: null,
  });

  const fetchStats = async () => {
    const startTime = performance.now();
    try {
      const response = await api.get("/metrics/stats", {
        timeout: 4000,
      });
      const endTime = performance.now();
      const calculatedLatency = Math.round(endTime - startTime);

      setStats({
        status: "online",
        dbCount: response.data.db_submissions,
        uptime: response.data.uptime_seconds,
        latency: calculatedLatency,
      });
    } catch {
      setStats((prev) => ({
        ...prev,
        status: "offline",
        latency: null,
      }));
    }
  };

  useEffect(() => {
    const initialFetch = setTimeout(fetchStats, 0);
    // Poll stats every 10 seconds to keep live metrics accurate
    const interval = setInterval(fetchStats, 10000);
    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, []);

  const formatUptime = (seconds) => {
    if (!seconds) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-4 font-mono text-xs backdrop-blur-md">
      {/* API Status Indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {stats.status === "online" && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
              stats.status === "online"
                ? "bg-emerald-400"
                : stats.status === "connecting"
                ? "bg-amber-400"
                : "bg-rose-500"
            }`}
          />
        </span>
        <span className="text-gray-400 uppercase tracking-wider text-[10px]">
          API: {stats.status}
        </span>
      </div>

      {/* Latency / Ping */}
      {stats.status === "online" && stats.latency !== null && (
        <div className="flex items-center gap-1.5 text-gray-400 border-l border-white/10 pl-5">
          <HiOutlineLightningBolt className="text-cyan-400 text-sm shrink-0" />
          <span>Ping: <span className="text-cyan-300 font-semibold">{stats.latency}ms</span></span>
        </div>
      )}

      {/* DB count */}
      {stats.status === "online" && (
        <div className="flex items-center gap-1.5 text-gray-400 border-l border-white/10 pl-5">
          <HiOutlineDatabase className="text-violet-400 text-sm shrink-0" />
          <span>DB Records: <span className="text-violet-300 font-semibold">{stats.dbCount} forms</span></span>
        </div>
      )}

      {/* Server Uptime */}
      {stats.status === "online" && (
        <div className="flex items-center gap-1.5 text-gray-400 border-l border-white/10 pl-5">
          <HiOutlineServer className="text-fuchsia-400 text-sm shrink-0" />
          <span>Uptime: <span className="text-fuchsia-300 font-semibold">{formatUptime(stats.uptime)}</span></span>
        </div>
      )}
    </div>
  );
}
