<template>
  <div class="agent-layout">
    <header class="agent-topbar">
      <div class="agent-brand">
        <img src="/logo.svg" alt="Cloth Bank Logo" class="brand-logo-wrap" />
        <div>
          <span class="brand-name">Cloth Bank</span>
          <span class="brand-role-badge">Field Logistics</span>
        </div>
      </div>

      <div class="topbar-right">
        <div class="agent-profile">
          <div class="agent-avatar">
            {{ (user.name || 'Agent').charAt(0).toUpperCase() }}
          </div>
          <div class="agent-meta">
            <span class="agent-name">{{ user.name || 'Field Agent' }}</span>
            <span class="agent-status">🟢 Active</span>
          </div>
        </div>

        <button class="btn btn-secondary btn-sm" @click="logout">
          <span>🚪</span> Logout
        </button>
      </div>
    </header>

    <main class="agent-main">
      <div class="agent-container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import authApi from '../api/auth'

export default {
  name: 'AgentLayout',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user') || '{}')
    }
  },
  methods: {
    async logout() {
      try { await authApi.logout() } catch (e) {}
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.agent-layout {
  min-height: 100vh;
  background-color: #f1f5f9;
  display: flex;
  flex-direction: column;
}

.agent-topbar {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.agent-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-logo-wrap {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
}
.brand-name {
  font-family: 'Outfit', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  display: block;
}
.brand-role-badge {
  font-size: 10.5px;
  color: #0284c7;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.agent-profile {
  display: flex;
  align-items: center;
  gap: 8px;
}
.agent-avatar {
  width: 32px;
  height: 32px;
  background: #0284c7;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}
.agent-meta {
  display: flex;
  flex-direction: column;
}
.agent-name {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}
.agent-status {
  font-size: 10px;
  color: #059669;
}
@media (max-width: 540px) {
  .agent-meta { display: none; }
  .agent-topbar { padding: 10px 14px; }
}

.agent-main {
  flex: 1;
  padding: 24px 16px 48px;
}
.agent-container {
  max-width: 760px;
  margin: 0 auto;
}
</style>
