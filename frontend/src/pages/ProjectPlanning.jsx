import React, { useState } from 'react';
import {
  CalendarCheck,
  DollarSign,
  Clock,
  RotateCcw,
  Sparkles,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  FileSpreadsheet,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import ExportButton from '../components/ExportButton';
import SeverityBadge from '../components/SeverityBadge';
import { apiClient } from '../api/client';
import { formatCurrency, formatNumber } from '../utils/formatters';

const BUDGET_COLORS = ['#2563EB', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6'];

export default function ProjectPlanning() {
  const [formData, setFormData] = useState({
    project_name: 'Harbor Point Commercial Center',
    project_type: 'Commercial',
    location: 'Chicago, IL',
    estimated_budget: 1850000,
    project_area_sqft: 22000,
    start_date: '2026-05-01',
    completion_date: '2027-04-30',
    requirements: 'LEED certified core and shell; post-tensioned slabs; 3-story steel frame with glass curtain wall facade.'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.completion_date) <= new Date(formData.start_date)) {
      setError('Completion date must be strictly after the start date.');
      return;
    }
    if (formData.estimated_budget <= 0) {
      setError('Please provide a realistic estimated budget greater than zero.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.generateProjectPlan(formData);
      if (res.success) {
        setPlan(res.data);
      } else {
        throw new Error(res.error || 'Failed to generate project schedule');
      }
    } catch (err) {
      setError(err.message || 'Error executing CPM scheduling engine');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setError(null);
  };

  const chartData = plan?.budget_breakdown?.map((b) => ({
    name: b.category,
    value: b.amount
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Construction Project Planning & Scheduling
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Critical Path Method (CPM) phased scheduling, trade contractor dependency allocation, budget modeling, and risk mitigation.
          </p>
        </div>

        {plan && (
          <div className="flex items-center gap-2">
            <ExportButton data={plan} filename="construction_project_plan" label="Export Schedule" />
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>New Plan</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className={`space-y-5 ${plan ? 'lg:col-span-4' : 'lg:col-span-8 lg:col-start-3'}`}>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
              <input
                type="text"
                required
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Type</label>
                <select
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Renovation">Renovation</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Budget ($)</label>
                <input
                  type="number"
                  min="1000"
                  required
                  value={formData.estimated_budget}
                  onChange={(e) => setFormData({ ...formData, estimated_budget: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gross Area (Sq Ft)</label>
                <input
                  type="number"
                  min="100"
                  required
                  value={formData.project_area_sqft}
                  onChange={(e) => setFormData({ ...formData, project_area_sqft: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Planned Start</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Completion</label>
                <input
                  type="date"
                  required
                  value={formData.completion_date}
                  onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Scope & Technical Specifications
              </label>
              <textarea
                rows={3}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-all active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Synthesizing CPM Schedule & Budget Allocations...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Proposed Project Plan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        {plan && (
          <div className="lg:col-span-8 space-y-5">
            {/* Project KPI bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Duration</span>
                <p className="mt-1 text-lg font-bold text-slate-900">{plan.total_duration_days} Days</p>
                <span className="text-[11px] text-slate-500">~{Math.round(plan.total_duration_days / 30)} Months</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Budget</span>
                <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(plan.total_budget)}</p>
                <span className="text-[11px] text-slate-500">Allocated across 5 cost codes</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Phases Defined</span>
                <p className="mt-1 text-lg font-bold text-slate-900">{plan.phases?.length || 6} Critical Phases</p>
                <span className="text-[11px] text-slate-500">Includes dry-in & closeout</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Key Milestones</span>
                <p className="mt-1 text-lg font-bold text-slate-900">{plan.milestones?.length || 5} Checkpoints</p>
                <span className="text-[11px] text-slate-500">Major owner reviews</span>
              </div>
            </div>

            {/* Phased CPM Schedule */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-emerald-600" />
                  <span>Project Schedule & Trade Assignments</span>
                </h4>
                <span className="text-xs text-slate-500 font-medium">{plan.start_date} → {plan.completion_date}</span>
              </div>

              <div className="space-y-4">
                {plan.phases?.map((phase, idx) => (
                  <div key={phase.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-slate-900">{phase.phase_name}</h5>
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                        {phase.estimated_days} Days
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200/70 border-t border-slate-200/70 pt-2 text-xs">
                      {phase.tasks?.map((task) => (
                        <div key={task.id} className="py-2 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-5 font-medium text-slate-800 flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-400">{task.id}</span>
                            <span>{task.name}</span>
                          </div>
                          <div className="sm:col-span-3 text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-700">Trade: </span>
                            <span>{task.trade}</span>
                          </div>
                          <div className="sm:col-span-2 text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-700">Days: </span>
                            <span>{task.duration_days}d</span>
                          </div>
                          <div className="sm:col-span-2 text-[10px] text-slate-500 truncate">
                            {task.deliverables}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Allocation & Risk Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Budget Chart */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span>Cost Allocation Breakdown</span>
                </h4>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={entry.name} fill={BUDGET_COLORS[index % BUDGET_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => formatCurrency(val)}
                        contentStyle={{ backgroundColor: '#1E293B', borderRadius: 8, color: '#fff', fontSize: 12 }}
                      />
                      <Legend verticalAlign="bottom" height={40} iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Matrix */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>Risk Management Matrix</span>
                </h4>
                <div className="space-y-2.5">
                  {plan.risk_matrix?.map((risk, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{risk.risk_title}</span>
                        <SeverityBadge level={risk.probability === 'High' ? 'High' : 'Moderate'} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{risk.mitigation_strategy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-3 text-[11px] text-slate-500">
              <p className="font-semibold text-slate-700">Planning Notice:</p>
              <p>{plan.disclaimer}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
