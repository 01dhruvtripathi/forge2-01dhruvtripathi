import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ticketApi } from '../api'
import Navbar from '../components/Navbar'

export default function NewTicket() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    subject: '',
    description: '',
    priority: 'medium',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await ticketApi.create(form)
      navigate(`/tickets/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-300 transition-colors">Tickets</Link>
          <span>/</span>
          <span className="text-gray-300">New ticket</span>
        </div>

        <div className="card">
          <h1 className="text-lg font-semibold text-white mb-6">Create a new ticket</h1>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                className="input"
                placeholder="Brief description of the issue"
                value={form.subject}
                onChange={handleChange}
                required
                maxLength={255}
              />
            </div>

            <div>
              <label className="label" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="input resize-none"
                rows={5}
                placeholder="Describe the issue in detail..."
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                className="input"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                id="create-ticket-submit"
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Creating...' : 'Create ticket'}
              </button>
              <Link to="/" className="btn-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
