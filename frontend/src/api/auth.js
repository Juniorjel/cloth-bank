import api from './axios'

export default {
  login(credentials) {
    return api.post('/login', credentials)
  },
  logout() {
    return api.post('/logout')
  },
  me() {
    return api.get('/me')
  }
}
