import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { Badge, ErrorBox, Loading } from '../components/ui.jsx'
import { MemberForm } from './Members.jsx'

export default function MemberDetail() {
  const { id } = useParams()
  const [member, setMember] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)

  const load = useCallback(() => {
    api(`/members/${id}`).then(setMember).catch(setError)
  }, [id])

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

  if (error) return <ErrorBox error={error} />
  if (!member) return <Loading />

  const open = member.loans.filter((l) => !l.return_date)
  const totalFines = member.loans.reduce((sum, l) => sum + Number(l.fine), 0)

  return (
    <>
      <Link to="/members" className="back">← All members</Link>

      <div className="page-head">
        <h1>{member.full_name} <Badge status={member.status} /></h1>
        <button className="btn ghost" onClick={() => setEditing(true)}>Edit</button>
      </div>

      <div className="stats">
        <div className="stat"><span>Email</span><strong className="small">{member.email}</strong></div>
        <div className="stat"><span>Phone</span><strong className="small">{member.phone || '—'}</strong></div>
        <div className="stat"><span>Books now</span><strong>{open.length}</strong></div>
        <div className="stat"><span>Total loans</span><strong>{member.loans.length}</strong></div>
        <div className="stat"><span>Fines paid</span><strong>${totalFines.toFixed(2)}</strong></div>
      </div>

      <section className="card no-pad">
        <div className="card-head pad"><h2>Loan history</h2></div>
        <table>
          <thead>
            <tr><th>Book</th><th>Borrowed</th><th>Due</th><th>Returned</th><th>Fine</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {member.loans.length === 0 && (
              <tr><td colSpan="7" className="muted center">This member has not borrowed any books yet.</td></tr>
            )}
            {member.loans.map((l) => (
              <tr key={l.id}>
                <td><strong>{l.book?.title}</strong><small className="sub">{l.book?.author}</small></td>
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
      </section>

      {editing && (
        <MemberForm
          member={member}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); load() }}
        />
      )}
    </>
  )
}
