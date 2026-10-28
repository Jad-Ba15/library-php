import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { Badge, ErrorBox, Loading } from '../components/ui.jsx'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api('/dashboard').then(setData).catch(setError)
  }, [])

  if (error) return <ErrorBox error={error} />
  if (!data) return <Loading />

  const s = data.stats
  const maxBooks = Math.max(1, ...data.books_by_category.map((c) => c.books_count))

  const cards = [
    { label: 'Books',          value: s.books,            note: `${s.copies} copies in total` },
    { label: 'On the shelf',   value: s.available,        note: `of ${s.copies} copies` },
    { label: 'Members',        value: s.members,          note: 'registered' },
    { label: 'Borrowed now',   value: s.active_loans,     note: 'open loans' },
    { label: 'Late',           value: s.overdue_loans,    note: 'need follow-up', warn: s.overdue_loans > 0 },
    { label: 'Fines',          value: `$${s.fines_collected.toFixed(2)}`, note: 'collected' },
  ]

  return (
    <>
      <h1>Dashboard</h1>

      <div className="stats">
        {cards.map((c) => (
          <div key={c.label} className={`stat ${c.warn ? 'warn' : ''}`}>
            <span>{c.label}</span>
            <strong>{c.value}</strong>
            <small>{c.note}</small>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <h2>Late books</h2>
            <Link to="/loans?status=overdue">See all →</Link>
          </div>
          {data.overdue.length === 0 ? (
            <p className="muted">No late books 🎉</p>
          ) : (
            <table>
              <thead><tr><th>Book</th><th>Member</th><th>Days late</th></tr></thead>
              <tbody>
                {data.overdue.map((l) => (
                  <tr key={l.id}>
                    <td>{l.title}</td>
                    <td>{l.full_name}</td>
                    <td><span className="badge overdue">{l.days_late} days</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Recent loans</h2>
            <Link to="/loans">See all →</Link>
          </div>
          <table>
            <thead><tr><th>Book</th><th>Member</th><th>Status</th></tr></thead>
            <tbody>
              {data.recent_loans.map((l) => (
                <tr key={l.id}>
                  <td>{l.book?.title}</td>
                  <td>{l.member?.full_name}</td>
                  <td><Badge status={l.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2>Books by category</h2>
          <div className="bars">
            {data.books_by_category.map((c) => (
              <div key={c.id} className="bar-row">
                <span>{c.name}</span>
                <div className="bar"><div style={{ width: `${(c.books_count / maxBooks) * 100}%` }} /></div>
                <b>{c.books_count}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Most borrowed</h2>
          <ol className="ranked">
            {data.popular_books.map((b) => (
              <li key={b.id}>
                <div><strong>{b.title}</strong><small>{b.author}</small></div>
                <span>{b.loans_count}×</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  )
}
