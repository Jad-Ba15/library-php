// =========================================
// Small pieces we use on many pages.
// =========================================
import { useEffect, useState } from 'react'

// A popup window
export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// Shows the error message + every field error from Laravel
export function ErrorBox({ error }) {
  if (!error) return null
  const fieldErrors = Object.values(error.errors || {}).flat()
  return (
    <div className="alert error">
      {fieldErrors.length > 0 ? (
        <ul>{fieldErrors.map((m) => <li key={m}>{m}</li>)}</ul>
      ) : (
        error.message
      )}
    </div>
  )
}

// "Page 1 of 3   ‹ Prev  Next ›"  (works with Laravel paginate())
export function Pagination({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null
  return (
    <div className="pagination">
      <span>
        Page {meta.current_page} of {meta.last_page} · {meta.total} items
      </span>
      <div>
        <button className="btn ghost small" disabled={meta.current_page === 1}
          onClick={() => onPage(meta.current_page - 1)}>‹ Prev</button>
        <button className="btn ghost small" disabled={meta.current_page === meta.last_page}
          onClick={() => onPage(meta.current_page + 1)}>Next ›</button>
      </div>
    </div>
  )
}

// Colored label: active / overdue / returned / blocked
export function Badge({ status }) {
  return <span className={`badge ${status}`}>{status}</span>
}

// Waits until the user stops typing (for search boxes)
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function Loading() {
  return <div className="loading">Loading…</div>
}
