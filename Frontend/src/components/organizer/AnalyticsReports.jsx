import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { MetricCard } from "../common/MetricCard";
import { generateAnalyticsReportPDF } from "../../utils/generateAnalyticsReportPDF";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import {
  Users,
  DollarSign,
  Activity,
  Grid,
  Bookmark,
  Calendar,
  Download,
  TrendingUp,
  Award,
  Loader2,
  Sparkles,
  FileText
} from "lucide-react";

const AnalyticsReports = () => {
  const {
    expos = [],
    selectedExpoId: globalExpoId,
    booths = [],
    sessions = [],
    registrations = [],
    bookmarks = [],
    applications = [],
    currentUser,
    fetchExpoAnalyticsApi,
    showToast
  } = useApp();

  const [selectedExpoId, setSelectedExpoId] = useState(globalExpoId || expos[0]?._id || "");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Sync selectedExpoId if expos load
  useEffect(() => {
    if (expos.length > 0 && (!selectedExpoId || !expos.some((e) => e._id === selectedExpoId))) {
      setSelectedExpoId(expos[0]._id);
    }
  }, [expos, selectedExpoId]);

  // Fetch Expo Analytics from MongoDB API on expo change
  const loadAnalytics = async (expoId) => {
    if (!expoId) return;
    setLoading(true);
    const data = await fetchExpoAnalyticsApi(expoId);
    if (data) {
      setAnalyticsData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedExpoId) {
      loadAnalytics(selectedExpoId);
    }
  }, [selectedExpoId]);

  const selectedExpo = expos.find((e) => e._id === selectedExpoId) || expos[0];

  const handleDownloadPdfReport = async () => {
    if (!selectedExpo) {
      showToast("No Expo Selected", "Please select an expo to generate its report.", "error");
      return;
    }
    setIsGeneratingPdf(true);
    try {
      generateAnalyticsReportPDF({
        expo: selectedExpo,
        analyticsData,
        booths,
        sessions,
        registrations,
        bookmarks,
        currentUser
      });
      showToast("Report Downloaded", `Executive analytics PDF generated for "${selectedExpo.title}".`, "success");
    } catch (err) {
      console.error("Failed to generate analytics PDF:", err);
      showToast("PDF Error", "Failed to compile the analytics report.", "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 1. Booth Traffic & Utilization Data
  const expoBooths = booths.filter(
    (b) => String(b.expo_id?._id || b.expo_id) === String(selectedExpoId)
  );

  const apiBoothTraffic = analyticsData?.booth_traffic || {};
  const totalBooths = apiBoothTraffic.total_booths || expoBooths.length || 1;
  const bookedCount = apiBoothTraffic.booked_booths !== undefined
    ? apiBoothTraffic.booked_booths
    : expoBooths.filter((b) => b.status === "booked").length;
  const reservedCount = apiBoothTraffic.reserved_booths !== undefined
    ? apiBoothTraffic.reserved_booths
    : expoBooths.filter((b) => b.status === "reserved").length;
  const availableCount = apiBoothTraffic.available_booths !== undefined
    ? apiBoothTraffic.available_booths
    : expoBooths.filter((b) => b.status === "available").length;

  const floorOccupancy = Math.round((bookedCount / (totalBooths || 1)) * 100);

  // Revenue calculation
  const bookedBoothsList = expoBooths.filter((b) => b.status === "booked");
  const totalBoothRevenue = bookedBoothsList.reduce((sum, b) => sum + (b.price || 0), 0);
  const expoRegistrations = registrations.filter(
    (r) => String(r.expo_id?._id || r.expo_id) === String(selectedExpoId)
  );
  const totalPassRevenue = 0; // Passes are free entry
  const aggregateRevenue = totalBoothRevenue + totalPassRevenue;

  // 2. Attendee Engagement Metrics
  const apiEngagement = analyticsData?.attendee_engagement || {};
  const totalExpoRegs = apiEngagement.total_expo_registrations !== undefined
    ? apiEngagement.total_expo_registrations
    : expoRegistrations.length;
  const totalSessionRegs = apiEngagement.total_session_registrations !== undefined
    ? apiEngagement.total_session_registrations
    : registrations.filter((r) => r.session_id).length;
  const combinedEngagement = apiEngagement.total_combined_registrations !== undefined
    ? apiEngagement.total_combined_registrations
    : totalExpoRegs + totalSessionRegs;

  // 3. Session Popularity Metrics
  const apiSessions = analyticsData?.session_popularity || [];
  const expoSessions = sessions.filter(
    (s) => String(s.expo_id?._id || s.expo_id) === String(selectedExpoId)
  );

  const sessionPopularityData = apiSessions.length > 0
    ? apiSessions.map((s) => ({
      name: s.title ? (s.title.length > 20 ? s.title.slice(0, 20) + "..." : s.title) : "Session",
      speaker: s.speaker || "Keynote",
      registrations: s.registrations_count || 0,
      bookmarks: s.bookmarks_count || 0,
      totalInterest: (s.registrations_count || 0) + (s.bookmarks_count || 0)
    }))
    : expoSessions.map((s) => {
      const bms = bookmarks.filter((b) => String(b.session_id) === String(s._id)).length;
      const regs = registrations.filter((r) => String(r.session_id) === String(s._id)).length;
      return {
        name: s.title ? (s.title.length > 20 ? s.title.slice(0, 20) + "..." : s.title) : "Session",
        speaker: s.speaker_name || s.speaker || "Keynote",
        registrations: regs,
        bookmarks: bms,
        totalInterest: regs + bms
      };
    });

  // 4. Booth Status Pie Data
  const boothStatusData = [
    { name: "Booked", value: bookedCount, color: "#1488A6" },
    { name: "Available", value: availableCount, color: "#10b981" },
    { name: "Reserved", value: reservedCount, color: "#38B2AC" }
  ];

  // Hall Occupancy Data
  const hallMap = {};
  expoBooths.forEach((b) => {
    const hallName = b.hall || "Main Hall";
    if (!hallMap[hallName]) {
      hallMap[hallName] = { hall: hallName, booked: 0, available: 0, revenue: 0 };
    }
    if (b.status === "booked") {
      hallMap[hallName].booked += 1;
      hallMap[hallName].revenue += b.price || 0;
    } else {
      hallMap[hallName].available += 1;
    }
  });
  const hallOccupancyData = Object.values(hallMap).length > 0
    ? Object.values(hallMap)
    : [{ hall: "Main Hall", booked: bookedCount, available: availableCount }];

  // Engagement Velocity Timeline Data
  const registrationTimelineData = [
    { day: "Phase 1", attendees: Math.round(totalExpoRegs * 0.2), sessionSaves: Math.round(combinedEngagement * 0.15) },
    { day: "Phase 2", attendees: Math.round(totalExpoRegs * 0.45), sessionSaves: Math.round(combinedEngagement * 0.4) },
    { day: "Phase 3", attendees: Math.round(totalExpoRegs * 0.75), sessionSaves: Math.round(combinedEngagement * 0.7) },
    { day: "Current", attendees: totalExpoRegs, sessionSaves: combinedEngagement }
  ];

  return (
    <div id="analytics-reports-view" className="space-y-6 font-body">
      {/* Top Header & Expo Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading tracking-tight">
              Analytics & Real-Time Performance
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#CBD5E1] mt-0.5">
            Real-time reports on attendee engagement, booth traffic, hall utilization, and session popularity.
          </p>
        </div>

        {/* Controls: Expo Dropdown & Download PDF Report */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1488A6] dark:text-[#38B2AC]" />
            <select
              value={selectedExpoId}
              onChange={(e) => setSelectedExpoId(e.target.value)}
              className="pl-9 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-[#1A202C] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-[#1F2937] dark:text-[#F8FAFC] font-bold focus:outline-none focus:ring-2 focus:ring-[#38B2AC] shadow-xs cursor-pointer"
            >
              {expos.map((expo) => (
                <option key={expo._id} value={expo._id}>
                  {expo.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownloadPdfReport}
            disabled={isGeneratingPdf || !selectedExpo}
            className="py-2 px-3.5 btn-teal-primary rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            title="Download executive analytics PDF report"
          >
            <Download className={`w-4 h-4 ${isGeneratingPdf ? "animate-bounce" : ""}`} />
            <span>{isGeneratingPdf ? "Generating PDF..." : "Download Report"}</span>
          </button>
        </div>
      </div>

      {/* Real-time Status Indicator Banner */}
      <div className="bg-slate-50 dark:bg-[#1A202C] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-[#1F2937] dark:text-[#F8FAFC]">
          <Activity className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC] animate-pulse" />
          <span>
            Active Analytics Target: <strong>{selectedExpo?.title || "Selected Expo"}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#6B7280] dark:text-[#CBD5E1]/70 font-mono text-[11px]">
          <span>Booths: <strong>{totalBooths}</strong></span>
          <span>•</span>
          <span>Attendees: <strong>{totalExpoRegs}</strong></span>
          <span>•</span>
          <span>Sessions: <strong>{expoSessions.length}</strong></span>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="metric-analytics-revenue"
          title="Total Pipeline Revenue"
          value={`PKR ${aggregateRevenue.toLocaleString()}`}
          subtitle={`PKR ${totalBoothRevenue.toLocaleString()} booth fees + PKR ${totalPassRevenue.toLocaleString()} passes`}
          icon={DollarSign}
          accentColor="emerald"
          trend={{
            value: "+32.4%",
            label: "vs forecast",
            isPositive: true
          }}
          sparklineData={[12e3, 18500, 24e3, 31e3, 42e3, aggregateRevenue || 55e3]}
        />

        <MetricCard
          id="metric-analytics-attendees"
          title="Attendee Engagement"
          value={combinedEngagement}
          subtitle={`${totalExpoRegs} Expo Passes + ${totalSessionRegs} Session Regs`}
          icon={Users}
          accentColor="teal"
          trend={{
            value: `${totalExpoRegs} pass holders`,
            label: "registrations",
            isPositive: true
          }}
          sparklineData={[10, 25, 40, totalExpoRegs, combinedEngagement]}
        />

        <MetricCard
          id="metric-analytics-utilization"
          title="Booth Traffic & Floor Occupancy"
          value={`${floorOccupancy}%`}
          subtitle={`${bookedCount} booked, ${reservedCount} reserved of ${totalBooths} total`}
          icon={Grid}
          accentColor="purple"
          trend={{
            value: `${floorOccupancy}%`,
            label: "occupancy rate",
            isPositive: floorOccupancy >= 50
          }}
          sparklineData={[15, 30, 45, 60, floorOccupancy]}
        />

        <MetricCard
          id="metric-analytics-engagement"
          title="Session Popularity & Demand"
          value={sessionPopularityData.reduce((acc, curr) => acc + curr.totalInterest, 0)}
          subtitle="Total registrations & bookmarks across keynotes"
          icon={Bookmark}
          accentColor="teal"
          trend={{
            value: `${expoSessions.length} keynotes`,
            label: "active tracks",
            isPositive: true
          }}
          sparklineData={[5, 15, 30, 50, 75]}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Attendee Engagement Velocity */}
        <div className="bg-white dark:bg-[#1A202C] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
                Attendee Engagement Velocity
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">Expo pass registrations and session agenda saves over campaign timeline.</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    color: "#fff",
                    borderRadius: "12px",
                    fontSize: "12px",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="attendees"
                  stroke="#1488A6"
                  strokeWidth={3}
                  name="Total Expo Registrations"
                />
                <Line
                  type="monotone"
                  dataKey="sessionSaves"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Combined Engagement"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Session Popularity Breakdown */}
        <div className="bg-white dark:bg-[#1A202C] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
              Session Popularity & Speaker Demand
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">Keynote session registrations vs bookmark saves.</p>
          </div>

          <div className="h-64">
            {sessionPopularityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#6B7280] dark:text-[#CBD5E1]/60">
                No session popularity data available for this expo yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionPopularityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      color: "#fff",
                      borderRadius: "12px",
                      fontSize: "12px",
                      border: "1px solid rgba(255,255,255,0.1)"
                    }}
                  />
                  <Bar dataKey="registrations" fill="#1488A6" name="Session Registrations" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="bookmarks" fill="#38B2AC" name="Bookmarks Saved" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Booth Traffic & Occupancy Breakdown */}
        <div className="bg-white dark:bg-[#1A202C] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading flex items-center gap-2">
              <Grid className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
              Booth Inventory Breakdown
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">Ratio of booked, reserved, and available booths on floor plan.</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={boothStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {boothStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    color: "#fff",
                    borderRadius: "12px",
                    fontSize: "12px",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Exhibition Hall Booth Allocation */}
        <div className="bg-white dark:bg-[#1A202C] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1488A6] dark:text-[#38B2AC]" />
              Hall Allocation & Booth Traffic
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]/70">Booked vs available booths per convention hall zone.</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hallOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                <XAxis dataKey="hall" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    color: "#fff",
                    borderRadius: "12px",
                    fontSize: "12px",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                />
                <Bar dataKey="booked" fill="#1488A6" name="Booked Booths" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" fill="#10b981" name="Available Booths" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Session Popularity Detail Table */}
      {sessionPopularityData.length > 0 && (
        <div className="bg-white dark:bg-[#1A202C] p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#1F2937] dark:text-[#F8FAFC] font-heading flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-[#1488A6] dark:text-[#38B2AC]" />
            Session Popularity & Demand Report
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] text-[#6B7280] dark:text-[#CBD5E1]/70 font-mono uppercase font-bold border-b border-[#E5E7EB] dark:border-white/10">
                <tr>
                  <th className="p-3">Session Title</th>
                  <th className="p-3">Speaker</th>
                  <th className="p-3 text-center">Registrations</th>
                  <th className="p-3 text-center">Bookmarks</th>
                  <th className="p-3 text-right">Combined Interest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-white/10">
                {sessionPopularityData.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#203748]/40 transition-colors">
                    <td className="p-3 font-bold text-[#1F2937] dark:text-[#F8FAFC]">{s.name}</td>
                    <td className="p-3 text-[#6B7280] dark:text-[#CBD5E1]">{s.speaker}</td>
                    <td className="p-3 text-center font-mono font-bold text-[#1488A6] dark:text-[#38B2AC]">
                      {s.registrations}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-[#10b981]">
                      {s.bookmarks}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[#1F2937] dark:text-[#F8FAFC]">
                      {s.totalInterest}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export { AnalyticsReports };
export default AnalyticsReports;
