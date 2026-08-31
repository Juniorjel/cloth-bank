import api from './axios'

export default {
  getAll(params = {}) {
    return api.get('/donations', { params })
  },
  getOne(id) {
    return api.get(`/donations/${id}`)
  },
  // Regular JSON create (kept for compatibility)
  create(data) {
    return api.post('/donations', data)
  },
  // Multipart FormData create (used when uploading images + multiple items)
  createFormData(formData) {
    return api.post('/donations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  assign(id, agentId) {
    return api.patch(`/donations/${id}/assign`, { agent_id: agentId })
  },
  markPickedUp(id) {
    return api.patch(`/donations/${id}/pickup`)
  },
  markDelivered(id) {
    return api.patch(`/donations/${id}/deliver`)
  },
  verify(id, verifiedQuantity) {
    return api.patch(`/donations/${id}/verify`, { verified_quantity: verifiedQuantity })
  },
  getStats() {
    return api.get('/donations/stats')
  },
  getAgentPickups() {
    return api.get('/agent/pickups')
  }
}
