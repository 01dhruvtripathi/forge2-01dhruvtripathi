import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const STATUS_COLORS = {
  open:        { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', bar: 'bg-blue-500' },
  in_progress: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', bar: 'bg-amber-500' },
  resolved:    { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  closed:      { bg: 'bg-gray-500/15', border: 'border-gray-500/30', text: 'text-gray-400', bar: 'bg-gray-500' },
}

const PRIORITY_COLORS = {
  critical: { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', bar: 'bg-red-500' },
  high:     { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400', bar: 'bg-orange-500' },
  medium:   { bg: 'bg-brand-500/15', border: 'border-brand-500/30', text: 'text-brand-400', bar: 'bg-brand-500' },
  low:      { bg: 'bg-gray-500/15', border: 'border-gray-500/30', text: 'text-gray-400', bar: 'bg-gray-500' },
}

export default function Analytics() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.metrics()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-surface-border rounded w-1/2 mb-3" />
              <div className="h-8 bg-surface-border rounded w-1/3" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-48" />
          ))}
        </div>
      </div>
    </div>
  )

  const statusCounts = data?.status_counts || {}
  const priorityCounts = data?.priority_counts || {}
  const totalActive = (statusCounts.open || 0) + (statusCounts.in_progress || 0)
  const totalAll = data?.total || 0

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Overview of your support operations</p>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="btn-secondary">View Tickets</Link>
            <Link to="/tickets/new" className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Ticket
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KpiCard
            label="Total Tickets"
            value={totalAll}
            icon={<TicketIcon />}
            color="brand"
          />
          <KpiCard
            label="Active"
            value={totalActive}
            icon={<ActiveIcon />}
            color="blue"
            subtitle={`${statusCounts.open || 0} open · ${statusCounts.in_progress || 0} in progress`}
          />
          <KpiCard
            label="Resolved"
            value={statusCounts.resolved || 0}
            icon={<ResolvedIcon />}
            color="emerald"
          />
          <KpiCard
            label="Unassigned"
            value={data?.unassigned || 0}
            icon={<UnassignedIcon />}
            color="amber"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Status Breakdown */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Status Breakdown</h3>
            <div className="space-y-3">
              {['open', 'in_progress', 'resolved', 'closed'].map(status => {
                const count = statusCounts[status] || 0
                const pct = totalAll > 0 ? (count / totalAll * 100) : 0
                const colors = STATUS_COLORS[status]
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${colors.text}`}>
                        {status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-input overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors.bar} transition-all duration-700 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Priority Breakdown</h3>
            <div className="space-y-3">
              {['critical', 'high', 'medium', 'low'].map(priority => {
                const count = priorityCounts[priority] || 0
                const pct = totalAll > 0 ? (count / totalAll * 100) : 0
                const colors = PRIORITY_COLORS[priority]
                return (
                  <div key={priority}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium capitalize ${colors.text}`}>
                        {priority}
                      </span>
                      <span className="text-xs text-gray-500">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-input overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors.bar} transition-all duration-700 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Agent Workload */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Agent Workload</h3>
            {(data?.agents || []).length === 0 ? (
              <p className="text-sm text-gray-600">No agents in organization.</p>
            ) : (
              <div className="space-y-3">
                {(data?.agents || []).map(agent => (
                  <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-input/50 border border-surface-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-600/30 flex items-center justify-center text-sm font-medium text-brand-300">
                        {agent.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{agent.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{agent.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${agent.assigned_count > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {agent.assigned_count}
                      </span>
                      <span className="text-xs text-gray-500">active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tickets */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Recent Tickets</h3>
              <Link to="/" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View all →</Link>
            </div>
            <div className="space-y-2">
              {(data?.recent_tickets || []).map(ticket => {
                const statusColor = STATUS_COLORS[ticket.status] || STATUS_COLORS.open
                return (
                  <Link
                    key={ticket.id}
                    to={`/tickets/${ticket.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-input/50 border border-surface-border hover:border-brand-600/40 transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-gray-600">#{ticket.id}</span>
                        <span className={`badge border ${statusColor.bg} ${statusColor.border} ${statusColor.text}`}>
                          {ticket.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 truncate group-hover:text-brand-300 transition-colors">
                        {ticket.subject}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-brand-400 transition-colors shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, icon, color, subtitle }) {
  const colorMap = {
    brand:   'from-brand-600/20 to-brand-900/10 border-brand-500/20',
    blue:    'from-blue-600/20 to-blue-900/10 border-blue-500/20',
    emerald: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/20',
    amber:   'from-amber-600/20 to-amber-900/10 border-amber-500/20',
  }
  const textColorMap = {
    brand: 'text-brand-400',
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
  }
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${colorMap[color]} transition-all hover:scale-[1.02] duration-200`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</span>
        <span className={`${textColorMap[color]} opacity-60`}>{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${textColorMap[color]}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

function TicketIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
}
function ActiveIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
}
function ResolvedIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function UnassignedIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
}
