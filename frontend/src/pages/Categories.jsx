import { useCallback, useEffect, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import { ErrorBox, Loading } from '../components/ui.jsx'

export default function Categories() {
  const { isAdmin } = useAuth()
  const [categories, setCategories] = useState(null)
  const [form, setForm] = useState({ id: null, name: '', description: '' })
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    api('/categories').then(setCategories).catch(setError)
  }, [])

  useEffect(load, [load])

  function reset() {
    setForm({ id: null, name: '', description: '' })
    setError(null)
  }

  async function submit(e) {
    e.preventDefault()
    setError(null)
    const body = { name: form.name, description: form.description || null }
    try {
      if (form.id) await api(`/categories/${form.id}`, { method: 'PUT', body })
      else await api('/categories', { method: 'POST', body })
      reset()
      load()
    } catch (err) {
      setError(err)
    }
  }

  async function remove(c) {
    if (!confirm(`Delete "${c.name}"? Its books will have no category.`)) return
    try {
      await api(`/categories/${c.id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  if (!categories) return <Loading />

  return (
    <>
      <h1>Categories</h1>

      <div className="grid-2 wide-left">
        <section className="card no-pad">
          <table>
            <thead><tr><th>Name</th><th>Description</th><th>Books</th><th></th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td className="muted">{c.description || '—'}</td>
                  <td>{c.books_count}</td>
                  <td className="actions">
                    <button className="btn ghost small"
                      onClick={() => setForm({ id: c.id, name: c.name, description: c.description ?? '' })}>Edit</button>
                    {isAdmin && <button className="btn danger small" onClick={() => remove(c)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2>{form.id ? 'Edit category' : 'New category'}</h2>
          <form onSubmit={submit} className="form">
            <ErrorBox error={error} />
            <label>Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>Description
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <div className="form-actions">
              {form.id && <button type="button" className="btn ghost" onClick={reset}>Cancel</button>}
              <button className="btn">{form.id ? 'Save' : 'Add category'}</button>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}
