// =========================================
// All calls to the Laravel API go through here.
// =========================================

const TOKEN_KEY = 'library_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// Example: api('/books', { params: { q: 'php' } })
//          api('/books', { method: 'POST', body: { title: '...' } })
export async function api(path, { method = 'GET', body, params } = {}) {
  let url = '/api' + path

  // Add ?key=value to the URL (skip empty values)
  if (params) {
    const clean = Object.entries(params).filter(([, v]) => v !== '' && v != null && v !== false)
    const qs = new URLSearchParams(clean).toString()
    if (qs) url += '?' + qs
  }

  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  // Token is wrong or expired -> log out
  if (res.status === 401 && path !== '/login') {
    setToken(null)
    window.dispatchEvent(new Event('logout'))
  }

  if (!res.ok) {
    const error = new Error(data.message || 'Something went wrong. Is Laravel running?')
    error.errors = data.errors || {} // validation errors, per field
    throw error
  }

  return data
}
