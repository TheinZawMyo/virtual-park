const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const parkApi = {
  health: () => request('/health'),
  parks: () => request('/parks'),
  park: (id) => request(`/parks/${id}`),
  createPark: (data) => request('/parks', { method: 'POST', body: JSON.stringify(data) }),
  features: (parkId) => request(`/parks/${parkId}/features`),
  players: () => request('/players'),
  player: (id) => request(`/players/${id}`),
  createPlayer: (data) => request('/players', { method: 'POST', body: JSON.stringify(data) }),
  updatePlayer: (id, data) =>
    request(`/players/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  parkPlayers: (parkId) => request(`/parks/${parkId}/players`),
}

export default parkApi