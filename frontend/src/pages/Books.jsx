import { useCallback, useEffect, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import { ErrorBox, Modal, Pagination, useDebounce } from '../components/ui.jsx'

const emptyBook = { title: '', author: '', isbn: '', year: '', category_id: '', total_copies: 1, description: '' }

export default function Books() {
  const { isAdmin } = useAuth()
  const [result, setResult] = useState(null)       // Laravel paginate() result
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)     // null = closed, {} = new book, {...} = edit
  const [error, setError] = useState(null)

  const q = useDebounce(search)

  const load = useCallback(() => {
    api('/books', { params: { q, category_id: categoryId, available: onlyAvailable ? 1 : '', page } })
      .then(setResult)
      .catch(setError)
  }, [q, categoryId, onlyAvailable, page])

  useEffect(load, [load])
  useEffect(() => { api('/categories').then(setCategories) }, [])

  async function remove(book) {
    if (!confirm(`Delete "${book.title}"?`)) return
    try {
      await api(`/books/${book.id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Books</h1>
        <button className="btn" onClick={() => setEditing(emptyBook)}>+ Add book</button>
      </div>

      <div className="filters">
        <input type="search" placeholder="Search title, author or ISBN…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="check">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => { setOnlyAvailable(e.target.checked); setPage(1) }} />
          Available only
        </label>
      </div>

      <ErrorBox error={error} />

      <section className="card no-pad">
        <table>
          <thead>
            <tr><th>Title</th><th>Author</th><th>Category</th><th>Year</th><th>Copies</th><th></th></tr>
          </thead>
          <tbody>
            {result?.data.length === 0 && (
              <tr><td colSpan="6" className="muted center">No books found.</td></tr>
            )}
            {result?.data.map((b) => (
              <tr key={b.id}>
                <td><strong>{b.title}</strong>{b.isbn && <small className="sub">ISBN {b.isbn}</small>}</td>
                <td>{b.author}</td>
                <td>{b.category?.name || '—'}</td>
                <td>{b.year || '—'}</td>
                <td>
                  <span className={`badge ${b.available_copies > 0 ? 'active' : 'overdue'}`}>
                    {b.available_copies} / {b.total_copies}
                  </span>
                </td>
                <td className="actions">
                  <button className="btn ghost small" onClick={() => setEditing(b)}>Edit</button>
                  {isAdmin && (
                    <button className="btn danger small" onClick={() => remove(b)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination meta={result} onPage={setPage} />
      </section>

      {editing && (
        <BookForm
          book={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </>
  )
}

function BookForm({ book, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    ...emptyBook,
    ...book,
    isbn: book.isbn ?? '',
    year: book.year ?? '',
    category_id: book.category_id ?? '',
    description: book.description ?? '',
  })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const body = {
      title: form.title,
      author: form.author,
      isbn: form.isbn || null,
      year: form.year || null,
      category_id: form.category_id || null,
      total_copies: Number(form.total_copies),
      description: form.description || null,
    }
    try {
      if (book.id) await api(`/books/${book.id}`, { method: 'PUT', body })
      else await api('/books', { method: 'POST', body })
      onSaved()
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  return (
    <Modal title={book.id ? 'Edit book' : 'Add a book'} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <ErrorBox error={error} />
        <label>Title<input name="title" value={form.title} onChange={change} required /></label>
        <label>Author<input name="author" value={form.author} onChange={change} required /></label>
        <div className="row">
          <label>ISBN<input name="isbn" value={form.isbn} onChange={change} /></label>
          <label>Year<input name="year" type="number" value={form.year} onChange={change} /></label>
        </div>
        <div className="row">
          <label>Category
            <select name="category_id" value={form.category_id} onChange={change}>
              <option value="">— none —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>Total copies
            <input name="total_copies" type="number" min="1" value={form.total_copies} onChange={change} required />
          </label>
        </div>
        <label>Description<textarea name="description" rows="3" value={form.description} onChange={change} /></label>
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  )
}
