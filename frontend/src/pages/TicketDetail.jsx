import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ticketApi, commentApi, activityApi } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import CommentThread from '../components/CommentThread'

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical']

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [showActivity, setShowActivity] = useState(false)

  const canEdit = user?.role === 'admin' || user?.role === 'agent'

  useEffect(() => {
    const load = async () => {
      try {
        const [ticketRes, commentsRes] = await Promise.all([
          ticketApi.get(id),
          commentApi.list(id),
        ])
        setTicket(ticketRes.data)
        setComments(commentsRes.data)
        // Load activity log
        try {
          const actRes = await activityApi.list(id)
          setActivities(actRes.data)
        } catch {}
      } catch {
        setError('Ticket not found or access denied.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleUpdate = async (field, value) => {
    setUpdating(true)
    try {
      const { data } = await ticketApi.update(id, { [field]: value })
      setTicket(data)
      // Refresh activity log after update
      try {
        const actRes = await activityApi.list(id)
        setActivities(actRes.data)
      } catch {}
    } catch {
      setError('Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const STATUS_BADGE = {
    open:        'bg-blue-500/20 text-blue-400 border-blue-500/30',
    in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    resolved:    'bg-green-500/20 text-green-400 border-green-500/30',
    closed:      'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }

  const PRIORITY_BADGE = {
    low:      'bg-gray-500/20 text-gray-400 border-gray-500/30',
    medium:   'bg-brand-500/20 text-brand-400 border-brand-500/30',
    high:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  if (loading) return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-6 bg-surface-card rounded w-1/3" />
        <div className="h-4 bg-surface-card rounded w-2/3" />
        <div className="card h-40" />
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center text-red-400">{error}</div>
        <Link to="/" className="btn-secondary mt-4 inline-flex">← Back to tickets</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-300 transition-colors">Tickets</Link>
          <span>/</span>
          <span className="text-gray-300">#{ticket.id}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-lg font-semibold text-white">{ticket.subject}</h1>
                <span className={`badge border shrink-0 ${STATUS_BADGE[ticket.status]}`}>
                  {ticket.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
              <div className="mt-4 pt-4 border-t border-surface-border flex items-center gap-4 text-xs text-gray-600">
                <span>Created by <span className="text-gray-400">{ticket.requester?.name}</span></span>
                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <CommentThread
              ticketId={id}
              comments={comments}
              onNewComment={(c) => setComments(prev => [...prev, c])}
            />

            {/* Activity Log */}
            {activities.length > 0 && (
              <div className="card">
                <button
                  onClick={() => setShowActivity(!showActivity)}
                  className="flex items-center justify-between w-full"
                >
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Activity Log ({activities.length})
                  </h3>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${showActivity ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showActivity && (
                  <div className="mt-4 space-y-2">
                    {activities.map((log, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs p-2 rounded-lg bg-surface-input/30">
                        <div className="w-5 h-5 rounded-full bg-brand-700/50 flex items-center justify-center text-brand-300 shrink-0 mt-0.5">
                          {log.actor?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <span className="text-gray-300 font-medium">{log.actor?.name || 'System'}</span>
                          {' '}
                          <span className="text-gray-500">
                            {log.action === 'created' && 'created this ticket'}
                            {log.action === 'status_changed' && `changed status from ${log.meta?.from} → ${log.meta?.to}`}
                            {log.action === 'assigned' && `assigned ticket`}
                            {!['created', 'status_changed', 'assigned'].includes(log.action) && log.action}
                          </span>
                        </div>
                        <span className="text-gray-600 shrink-0">
                          {log.created_at ? new Date(log.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</h3>

              {/* Status */}
              <div>
                <label className="label">Status</label>
                {canEdit ? (
                  <select
                    id="ticket-status"
                    value={ticket.status}
                    onChange={(e) => handleUpdate('status', e.target.value)}
                    disabled={updating}
                    className="input text-sm"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`badge border ${STATUS_BADGE[ticket.status]}`}>
                    {ticket.status?.replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="label">Priority</label>
                {canEdit ? (
                  <select
                    id="ticket-priority"
                    value={ticket.priority}
                    onChange={(e) => handleUpdate('priority', e.target.value)}
                    disabled={updating}
                    className="input text-sm"
                  >
                    {PRIORITY_OPTIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`badge border ${PRIORITY_BADGE[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                )}
              </div>

              {/* Assignee */}
              <div>
                <label className="label">Assignee</label>
                <p className="text-sm text-gray-300">{ticket.assignee?.name || 'Unassigned'}</p>
              </div>

              {/* Ticket ID */}
              <div>
                <label className="label">Ticket ID</label>
                <p className="text-sm text-gray-500 font-mono">#{ticket.id}</p>
              </div>

              {/* Created */}
              <div>
                <label className="label">Created</label>
                <p className="text-sm text-gray-400">
                  {new Date(ticket.created_at).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <Link to="/" className="btn-secondary w-full justify-center">
              ← Back to tickets
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
