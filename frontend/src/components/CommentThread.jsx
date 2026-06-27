import { useState } from 'react'
import { commentApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function CommentThread({ ticketId, comments, onNewComment }) {
  const { user } = useAuth()
  const [body, setBody] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const canWriteInternal = user?.role === 'admin' || user?.role === 'agent'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      const { data } = await commentApi.create(ticketId, { body, is_internal: isInternal })
      onNewComment(data)
      setBody('')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Conversation</h3>

      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-gray-600 italic">No comments yet.</p>
        )}
        {comments.map((comment) => (
          <div
            key={comment.id}
            id={`comment-${comment.id}`}
            className={`p-4 rounded-xl border text-sm ${
              comment.is_internal
                ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-100'
                : 'bg-surface-card border-surface-border text-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-700 flex items-center justify-center text-xs font-medium text-brand-200">
                  {comment.author?.name?.[0]?.toUpperCase()}
                </div>
                <span className="font-medium text-gray-300">{comment.author?.name}</span>
                {comment.is_internal && (
                  <span className="badge border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Internal note
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600">{formatDate(comment.created_at)}</span>
            </div>
            <p className="whitespace-pre-wrap leading-relaxed">{comment.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="card space-y-3">
        <textarea
          id="comment-body"
          className="input resize-none"
          rows={3}
          placeholder="Write a reply..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <div className="flex items-center justify-between">
          {canWriteInternal && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                id="internal-toggle"
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="w-4 h-4 rounded accent-yellow-500"
              />
              <span className="text-xs text-gray-400">Internal note</span>
            </label>
          )}
          <button
            id="comment-submit"
            type="submit"
            disabled={submitting || !body.trim()}
            className="btn-primary ml-auto"
          >
            {submitting ? 'Posting...' : 'Post reply'}
          </button>
        </div>
      </form>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}
