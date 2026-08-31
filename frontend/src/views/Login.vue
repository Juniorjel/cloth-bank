<template>
  <div class="login-page">
    <!-- Ambient glowing backgrounds -->
    <div class="glow-orb orb-1"></div>
    <div class="glow-orb orb-2"></div>
    <div class="glow-orb orb-3"></div>

    <div class="login-card">
      <div class="brand-badge">
        <div class="brand-icon">🧺</div>
      </div>

      <div class="login-header">
        <h1>Cloth Bank</h1>
        <p>Campaign & Logistics Management System</p>
      </div>

      <!-- Quick demo accounts -->
      <div class="demo-chips">
        <span class="demo-label">⚡ Quick Demo Login:</span>
        <div class="chips-wrap">
          <button
            type="button"
            class="chip-btn"
            :class="{ active: form.email === 'admin@clothbank.com' }"
            @click="fillDemo('admin@clothbank.com', 'password')"
          >
            👑 Super Admin
          </button>
          <button
            type="button"
            class="chip-btn"
            :class="{ active: form.email === 'agent@clothbank.com' }"
            @click="fillDemo('agent@clothbank.com', 'password')"
          >
            🚚 Field Agent
          </button>
        </div>
      </div>

      <div v-if="error" class="alert alert-error">
        <span>⚠️</span>
        <div>{{ error }}</div>
      </div>

      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label>Email Address</label>
          <div class="input-wrap">
            <span class="input-icon">✉️</span>
            <input
              v-model="form.email"
              type="email"
              class="form-control with-icon"
              placeholder="name@clothbank.com"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-wrap">
            <span class="input-icon">🔒</span>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control with-icon with-action"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              class="pwd-toggle"
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              {{ showPassword ? '👁️' : '🙈' }}
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-full btn-lg mt-3" :disabled="loading">
          <span v-if="loading" class="spinner-sm"></span>
          <span v-if="loading">Signing in…</span>
          <span v-else>Sign In to Portal →</span>
        </button>
      </form>

      <div class="login-footer">
        <router-link to="/donate" class="donate-cta">
          <span>🎁</span>
          <span>Want to donate clothes instead? <strong>Click here</strong></span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import authApi from '../api/auth'

export default {
  name: 'LoginView',
  data() {
    return {
      form: { email: '', password: '' },
      loading: false,
      error: '',
      showPassword: false
    }
  },
  methods: {
    fillDemo(email, password) {
      this.form.email = email
      this.form.password = password
      this.error = ''
    },
    async login() {
      if (!this.form.email || !this.form.password) {
        this.error = 'Please enter both your email and password.'
        return
      }
      this.loading = true
      this.error = ''
      try {
        const res = await authApi.login(this.form)
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))

        const redirect = this.$route.query.redirect
        if (redirect && redirect !== '/login') {
          this.$router.push(redirect)
        } else if (res.data.user.role === 'admin') {
          this.$router.push('/admin/dashboard')
        } else {
          this.$router.push('/agent/pickups')
        }
      } catch (e) {
        this.error = e.response?.data?.message || 'Invalid credentials. Please verify your login details.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: radial-gradient(circle at 10% 20%, #0f172a 0%, #022c22 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* Ambient glow blobs */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  opacity: 0.6;
  animation: pulseGlow 8s ease-in-out infinite alternate;
}
.orb-1 {
  width: 380px;
  height: 380px;
  background: rgba(16, 185, 129, 0.25);
  top: -80px;
  right: -80px;
}
.orb-2 {
  width: 420px;
  height: 420px;
  background: rgba(5, 150, 105, 0.2);
  bottom: -100px;
  left: -100px;
  animation-delay: -4s;
}
.orb-3 {
  width: 250px;
  height: 250px;
  background: rgba(2, 132, 199, 0.15);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes pulseGlow {
  0% { transform: scale(1) translate(0, 0); opacity: 0.45; }
  100% { transform: scale(1.15) translate(20px, 20px); opacity: 0.75; }
}

.login-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 44px 38px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2);
  z-index: 10;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.brand-badge {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.brand-icon {
  width: 58px;
  height: 58px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 2px solid #a7f3d0;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 8px 16px -4px rgba(16, 185, 129, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}
.login-header h1 {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.login-header p {
  color: #64748b;
  font-size: 13px;
  margin-top: 4px;
}

/* Demo buttons */
.demo-chips {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 20px;
}
.demo-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}
.chips-wrap {
  display: flex;
  gap: 8px;
}
.chip-btn {
  flex: 1;
  padding: 6px 10px;
  font-size: 11.5px;
  font-weight: 600;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.chip-btn:hover {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #059669;
}
.chip-btn.active {
  background: #059669;
  border-color: #059669;
  color: #ffffff;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 14px;
  font-size: 15px;
  color: #94a3b8;
  pointer-events: none;
}
.form-control.with-icon {
  padding-left: 42px;
}
.form-control.with-action {
  padding-right: 42px;
}
.pwd-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  opacity: 0.65;
  transition: opacity 0.15s;
}
.pwd-toggle:hover {
  opacity: 1;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

.login-footer {
  margin-top: 26px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  text-align: center;
}
.donate-cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #059669;
  text-decoration: none;
  transition: color 0.15s;
}
.donate-cta strong {
  text-decoration: underline;
}
.donate-cta:hover {
  color: #047857;
}
</style>
