import api from './axios'

export default {
  getAll() {
    return api.get('/users')
  },
  getAgents() {
    return api.get('/users/agents')
  },
  getOne(id) {
    return api.get(`/users/${id}`)
  },
  create(data) {
    return api.post('/users', data)
  },
  update(id, data) {
    return api.put(`/users/${id}`, data)
  },
  delete(id) {
    return api.delete(`/users/${id}`)
  }
}
