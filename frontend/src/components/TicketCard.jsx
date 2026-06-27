import { Link } from 'react-router-dom'

const STATUS_STYLES = {
  open:        'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  resolved:    'bg-green-500/20 text-green-400 border-green-500/30',
  closed:      'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const PRIORITY_STYLES = {
  low:      'bg-gray-500/20 text-gray-400 border-gray-500/30',
  medium:   'bg-brand-500/20 text-brand-400 border-brand-500/30',
  high:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function TicketCard({ ticket }) {
  const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.open
  const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium
  const ago = timeAgo(ticket.created_at)

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      id={`ticket-${ticket.id}`}
      className="block card hover:border-brand-600/40 hover:shadow-brand-900/20 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">#{ticket.id}</span>
            <span className={`badge border ${priorityStyle}`}>{ticket.priority}</span>
            {['open', 'in_progress'].includes(ticket.status) && (Date.now() - new Date(ticket.created_at)) / (1000 * 60 * 60) > (ticket.priority === 'critical' ? 2 : ticket.priority === 'high' ? 8 : ticket.priority === 'medium' ? 48 : 96) && (
              <span className="badge border bg-red-500/20 text-red-500 border-red-500/30 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                SLA Breached
              </span>
            )}
          </div>
          <h3 className="font-medium text-white text-sm truncate group-hover:text-brand-300 transition-colors">
            {ticket.subject}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`badge border ${statusStyle}`}>
            {ticket.status?.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-600">{ago}</span>
        </div>
      </div>
      {ticket.assignee && (
        <div className="mt-3 pt-3 border-t border-surface-border flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-brand-700 flex items-center justify-center text-xs text-brand-200 font-medium">
            {ticket.assignee.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-xs text-gray-500">{ticket.assignee.name}</span>
        </div>
      )}
    </Link>
  )
}

function timeAgo(date) {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
