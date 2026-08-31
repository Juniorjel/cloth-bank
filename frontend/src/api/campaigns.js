import api from './axios'

export default {
  getAll() {
    return api.get('/campaigns')
  },
  getActive() {
    return api.get('/campaigns/active')
  },
  getOne(id) {
    return api.get(`/campaigns/${id}`)
  },
  create(data) {
    return api.post('/campaigns', data)
  },
  update(id, data) {
    return api.put(`/campaigns/${id}`, data)
  },
  delete(id) {
    return api.delete(`/campaigns/${id}`)
  }
}
