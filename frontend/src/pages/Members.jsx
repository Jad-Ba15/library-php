import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import { Badge, ErrorBox, Modal, Pagination, useDebounce } from '../components/ui.jsx'

const emptyMember = { full_name: '', email: '', phone: '', address: '', status: 'active' }

export default function Members() {
  const { isAdmin } = useAuth()
  const [result, setResult] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState(null)

  const q = useDebounce(search)

  const load = useCallback(() => {
    api('/members', { params: { q, status, page } }).then(setResult).catch(setError)
  }, [q, status, page])

  useEffect(load, [load])

  async function remove(member) {
    if (!confirm(`Delete ${member.full_name}?`)) return
    try {
      await api(`/members/${member.id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Members</h1>
        <button className="btn" onClick={() => setEditing(emptyMember)}>+ Add member</button>
      </div>

      <div className="filters">
        <input type="search" placeholder="Search name, email or phone…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <ErrorBox error={error} />

      <section className="card no-pad">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Books now</th><th></th></tr>
          </thead>
          <tbody>
            {result?.data.length === 0 && (
              <tr><td colSpan="6" className="muted center">No members found.</td></tr>
            )}
            {result?.data.map((m) => (
              <tr key={m.id}>
                <td><Link to={`/members/${m.id}`}><strong>{m.full_name}</strong></Link></td>
                <td>{m.email}</td>
                <td>{m.phone || '—'}</td>
                <td><Badge status={m.status} /></td>
                <td>{m.active_loans_count}</td>
                <td className="actions">
                  <button className="btn ghost small" onClick={() => setEditing(m)}>Edit</button>
                  {isAdmin && (
                    <button className="btn danger small" onClick={() => remove(m)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination meta={result} onPage={setPage} />
      </section>

      {editing && (
        <MemberForm
          member={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </>
  )
}

// Also used by MemberDetail.jsx
export function MemberForm({ member, onClose, onSaved }) {
  const [form, setForm] = useState({
    ...emptyMember,
    ...member,
    phone: member.phone ?? '',
    address: member.address ?? '',
  })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const body = {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      address: form.address || null,
      status: form.status,
    }
    try {
      if (member.id) await api(`/members/${member.id}`, { method: 'PUT', body })
      else await api('/members', { method: 'POST', body })
      onSaved()
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  return (
    <Modal title={member.id ? 'Edit member' : 'Add a member'} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <ErrorBox error={error} />
        <label>Full name<input name="full_name" value={form.full_name} onChange={change} required /></label>
        <label>Email<input name="email" type="email" value={form.email} onChange={change} required /></label>
        <div className="row">
          <label>Phone<input name="phone" value={form.phone} onChange={change} /></label>
          <label>Status
            <select name="status" value={form.status} onChange={change}>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>
        </div>
        <label>Address<input name="address" value={form.address} onChange={change} /></label>
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  )
}
