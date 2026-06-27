import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ticketApi } from '../api'
import Navbar from '../components/Navbar'
import TicketCard from '../components/TicketCard'

const STATUS_FILTERS = ['all', 'open', 'in_progress', 'resolved', 'closed']
const PRIORITY_FILTERS = ['all', 'critical', 'high', 'medium', 'low']

export default function Dashboard() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [search, setSearch] = useState('')

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (priorityFilter !== 'all') params.priority = priorityFilter
      if (assigneeFilter) params.assignee_id = assigneeFilter
      if (search) params.search = search
      const { data } = await ticketApi.list(params)
      setTickets(data.data || data)
    } catch (err) {
      setError('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, priorityFilter, assigneeFilter, search])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Tickets</h1>
            <p className="text-sm text-gray-500 mt-0.5">{tickets.length} total in your organization</p>
          </div>
          <Link to="/tickets/new" id="new-ticket-btn" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Open', count: stats.open, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'In Progress', count: stats.in_progress, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
            { label: 'Resolved', count: stats.resolved, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`rounded-xl border p-4 ${bg}`}>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col mb-6 gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="search-tickets"
              type="text"
              className="input max-w-xs"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              id="filter-assignee"
              type="number"
              className="input max-w-[150px]"
              placeholder="Assignee ID"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                id={`filter-status-${s}`}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  statusFilter === s
                    ? 'bg-brand-600 border-brand-500 text-white'
                    : 'border-surface-border bg-surface-card text-gray-400 hover:text-gray-200'
                }`}
              >
                {s === 'all' ? 'All status' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {PRIORITY_FILTERS.map((p) => (
              <button
                key={p}
                id={`filter-priority-${p}`}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  priorityFilter === p
                    ? 'bg-orange-600 border-orange-500 text-white'
                    : 'border-surface-border bg-surface-card text-gray-400 hover:text-gray-200'
                }`}
              >
                {p === 'all' ? 'All priority' : p}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket list */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-surface-border rounded w-3/4 mb-2" />
                <div className="h-3 bg-surface-border rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card text-center text-red-400">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="card text-center py-12">
            <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">No tickets found. <Link to="/tickets/new" className="text-brand-400 hover:underline">Create one?</Link></p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
