import api from './axios'

export default {
  getAll() {
    return api.get('/cloth-types')
  },
  create(data) {
    return api.post('/cloth-types', data)
  },
  update(id, data) {
    return api.put(`/cloth-types/${id}`, data)
  },
  delete(id) {
    return api.delete(`/cloth-types/${id}`)
  }
}
