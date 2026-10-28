import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { Badge, ErrorBox, Modal, Pagination, useDebounce } from '../components/ui.jsx'

const tabs = [
  { value: '',         label: 'All' },
  { value: 'active',   label: 'Borrowed' },
  { value: 'overdue',  label: 'Late' },
  { value: 'returned', label: 'Returned' },
]

export default function Loans() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') || ''   // e.g. /loans?status=overdue
  const [result, setResult] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const q = useDebounce(search)

  const load = useCallback(() => {
    api('/loans', { params: { status, q, page } }).then(setResult).catch(setError)
  }, [status, q, page])

  useEffect(load, [load])

  async function returnBook(loan) {
    try {
      const updated = await api(`/loans/${loan.id}/return`, { method: 'PATCH' })
      if (Number(updated.fine) > 0) alert(`Returned late. Fine: $${updated.fine}`)
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Loans</h1>
        <button className="btn" onClick={() => setCreating(true)}>+ New loan</button>
      </div>

      <div className="filters">
        <div className="tabs">
          {tabs.map((t) => (
            <button key={t.value} className={status === t.value ? 'active' : ''}
              onClick={() => { setSearchParams(t.value ? { status: t.value } : {}); setPage(1) }}>
              {t.label}
            </button>
          ))}
        </div>
        <input type="search" placeholder="Search book or member…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
      </div>

      <ErrorBox error={error} />

      <section className="card no-pad">
        <table>
          <thead>
            <tr><th>Book</th><th>Member</th><th>Borrowed</th><th>Due</th><th>Returned</th><th>Fine</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {result?.data.length === 0 && (
              <tr><td colSpan="8" className="muted center">No loans found.</td></tr>
            )}
            {result?.data.map((l) => (
              <tr key={l.id}>
                <td><strong>{l.book?.title}</strong></td>
                <td><Link to={`/members/${l.member_id}`}>{l.member?.full_name}</Link></td>
                <td>{l.loan_date}</td>
                <td>{l.due_date}</td>
                <td>{l.return_date || '—'}</td>
                <td>{Number(l.fine) > 0 ? `$${l.fine}` : '—'}</td>
                <td><Badge status={l.status} /></td>
                <td className="actions">
                  {!l.return_date && (
                    <button className="btn small" onClick={() => returnBook(l)}>Return</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination meta={result} onPage={setPage} />
      </section>

      {creating && (
        <NewLoan onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load() }} />
      )}
    </>
  )
}

function NewLoan({ onClose, onSaved }) {
  const [members, setMembers] = useState([])
  const [books, setBooks] = useState([])
  const [form, setForm] = useState({ member_id: '', book_id: '', days: 14 })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  // Only active members and books with free copies
  useEffect(() => {
    api('/members', { params: { status: 'active', per_page: 100 } }).then((r) => setMembers(r.data))
    api('/books', { params: { available: 1, per_page: 100 } }).then((r) => setBooks(r.data))
  }, [])

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api('/loans', {
        method: 'POST',
        body: { member_id: Number(form.member_id), book_id: Number(form.book_id), days: Number(form.days) },
      })
      onSaved()
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  return (
    <Modal title="New loan" onClose={onClose}>
      <form onSubmit={submit} className="form">
        <ErrorBox error={error} />
        <label>Member
          <select name="member_id" value={form.member_id} onChange={change} required>
            <option value="">— choose a member —</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.full_name} ({m.active_loans_count} books now)</option>)}
          </select>
        </label>
        <label>Book
          <select name="book_id" value={form.book_id} onChange={change} required>
            <option value="">— choose a book —</option>
            {books.map((b) => <option key={b.id} value={b.id}>{b.title} — {b.available_copies} left</option>)}
          </select>
        </label>
        <label>Days to keep it
          <input name="days" type="number" min="1" max="60" value={form.days} onChange={change} required />
        </label>
        <p className="hint">Rules: max 3 books per member · no new books while one is late · $0.50 fine per late day.</p>
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Lend book'}</button>
        </div>
      </form>
    </Modal>
  )
}
