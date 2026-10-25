import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  SearchCode,
  Building,
  CalendarCheck,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  CloudSun,
  MessageSquareText,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import StatCard from '../components/StatCard';
import SeverityBadge from '../components/SeverityBadge';
import { apiClient } from '../api/client';
import { formatDate } from '../utils/formatters';

const RISK_COLORS = {
  Low: '#10B981',
  Moderate: '#F59E0B',
  High: '#EF4444',
  Critical: '#991B1B'
};

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.getDashboard();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const riskPieData = stats?.risk_distribution
    ? Object.entries(stats.risk_distribution).map(([name, value]) => ({
        name,
        value: Number(value) || 0
      }))
    : [];

  const activityBarData = [
    { name: 'Safety Audits', count: stats?.safety_assessments_count || 0 },
    { name: 'Crack Analyses', count: stats?.crack_analyses_count || 0 },
    { name: 'Valuations', count: stats?.valuations_count || 0 },
    { name: 'Project Plans', count: stats?.saved_projects_count || 0 }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome banner */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 border border-blue-400/30 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            <span>AI-Driven Construction & Real Estate Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Decision-Support Hub for Construction & Real Estate
          </h2>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
            Analyze site photographs for OSHA safety hazards, detect structural concrete cracks, estimate indicative real estate values, automate CPM project schedules, and verify weather conditions in real-time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('safety')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-500 transition-all"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Inspect Site Safety</span>
            </button>
            <button
              onClick={() => onNavigate('cracks')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur hover:bg-white/20 transition-all border border-white/20"
            >
              <SearchCode className="h-4 w-4" />
              <span>Analyze Surface Cracks</span>
            </button>
            <button
              onClick={() => onNavigate('planning')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur hover:bg-white/20 transition-all border border-white/20"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Plan New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Analyzed Images"
          value={loading ? '...' : stats?.total_images_analyzed || 0}
          subtitle="Safety & crack vision scans"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Safety Inspections"
          value={loading ? '...' : stats?.safety_assessments_count || 0}
          subtitle="Hazard assessments logged"
          icon={ShieldAlert}
          color="amber"
        />
        <StatCard
          title="Crack Evaluations"
          value={loading ? '...' : stats?.crack_analyses_count || 0}
          subtitle="Structural surface scans"
          icon={SearchCode}
          color="purple"
        />
        <StatCard
          title="Saved Projects & Plans"
          value={loading ? '...' : (stats?.saved_projects_count || 0) + (stats?.valuations_count || 0)}
          subtitle="CPM schedules & valuations"
          icon={CalendarCheck}
          color="emerald"
        />
      </div>

      {/* Quick Action Matrix */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3">Quick Workflows</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('safety')}
            className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
            </div>
            <h4 className="mt-4 font-bold text-slate-900">Site Safety Monitoring</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Upload job-site photos to detect PPE compliance, fall protection hazards, and OSHA violations.
            </p>
          </div>

          <div
            onClick={() => onNavigate('cracks')}
            className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <SearchCode className="h-6 w-6" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
            </div>
            <h4 className="mt-4 font-bold text-slate-900">Structural Crack Detection</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Evaluate concrete and masonry crack patterns, visual severity, probable causes, and inspection needs.
            </p>
          </div>

          <div
            onClick={() => onNavigate('valuation')}
            className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Building className="h-6 w-6" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
            </div>
            <h4 className="mt-4 font-bold text-slate-900">Real Estate Valuation</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Transparent indicative property valuations based on regional benchmarks, quality, age, and amenities.
            </p>
          </div>

          <div
            onClick={() => onNavigate('planning')}
            className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
            </div>
            <h4 className="mt-4 font-bold text-slate-900">Construction Project Planner</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Generate 6-phase CPM schedules, trade assignments, budget breakdowns, and risk matrices.
            </p>
          </div>

          <div
            onClick={() => onNavigate('assistant')}
            className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <MessageSquareText className="h-6 w-6" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
            </div>
            <h4 className="mt-4 font-bold text-slate-900">Daily Site Assistant</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Ask technical questions about concrete curing, ACI/OSHA codes, sequencing, and materials.
            </p>
          </div>

          <div
            onClick={() => onNavigate('weather')}
            className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-sky-50 p-3 text-sky-600">
                <CloudSun className="h-6 w-6" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
            </div>
            <h4 className="mt-4 font-bold text-slate-900">Weather Safety Advisory</h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Real meteorological wind, rain, and temperature limits for crane lifts, concrete pours, and roofing.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Distribution Chart */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Modules Activity Overview</h3>
              <p className="text-xs text-slate-500">Completed assessments across platform modules</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  itemStyle={{ color: '#93C5FD' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Site Risk Level Profile</h3>
              <p className="text-xs text-slate-500">Distribution across logged audits</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {riskPieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskPieData.map((entry) => (
                      <Cell key={entry.name} fill={RISK_COLORS[entry.name] || '#94A3B8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400 p-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                <span>No risk events recorded yet. Run a site safety or crack inspection to populate.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <h3 className="font-bold text-slate-900 text-sm">Recent Activity Stream</h3>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View All Reports →
          </button>
        </div>

        {stats?.recent_activity?.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {stats.recent_activity.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900">{act.title}</h5>
                    <p className="text-[11px] text-slate-500">{act.action} • {formatDate(act.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge level={act.risk} size="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No recent activity recorded.
          </div>
        )}
      </div>
    </div>
  );
}
