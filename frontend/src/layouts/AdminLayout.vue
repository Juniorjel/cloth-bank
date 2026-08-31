<template>
  <div class="saas-admin-shell">
    <!-- Mobile Backdrop Overlay -->
    <div
      class="sidebar-mobile-backdrop d-md-none"
      :class="{ 'show': mobileSidebarOpen }"
      @click="mobileSidebarOpen = false"
    ></div>

    <!-- ── Sidebar ── -->
    <aside
      class="saas-sidebar"
      :class="{
        'sidebar-collapsed': desktopSidebarCollapsed,
        'mobile-open': mobileSidebarOpen
      }"
    >
      <!-- Organization / Brand Head -->
      <div class="sidebar-brand-header">
        <router-link to="/admin/dashboard" class="brand-badge-box">
          <span class="brand-icon">🧺</span>
          <div class="brand-info" v-if="!desktopSidebarCollapsed || mobileSidebarOpen">
            <span class="brand-name">ClothBank</span>
            <span class="brand-plan">SaaS Pro</span>
          </div>
        </router-link>
        
        <!-- Desktop Collapse Button -->
        <button
          class="collapse-btn d-none d-md-flex"
          @click="desktopSidebarCollapsed = !desktopSidebarCollapsed"
          :title="desktopSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
        >
          {{ desktopSidebarCollapsed ? '→' : '←' }}
        </button>

        <!-- Mobile Close Button -->
        <button
          class="collapse-btn d-md-none"
          @click="mobileSidebarOpen = false"
          title="Close Menu"
        >
          ✕
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav">
        <div class="nav-section-label" v-if="!desktopSidebarCollapsed || mobileSidebarOpen">MAIN MENU</div>
        
        <router-link
          to="/admin/dashboard"
          class="nav-item"
          active-class="nav-item-active"
          @click.native="onNavClick"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-label" v-if="!desktopSidebarCollapsed || mobileSidebarOpen">Dashboard</span>
        </router-link>

        <router-link
          to="/admin/donations"
          class="nav-item"
          active-class="nav-item-active"
          @click.native="onNavClick"
        >
          <span class="nav-icon">📦</span>
          <span class="nav-label" v-if="!desktopSidebarCollapsed || mobileSidebarOpen">Donations</span>
        </router-link>

        <router-link
          to="/admin/campaigns"
          class="nav-item"
          active-class="nav-item-active"
          @click.native="onNavClick"
        >
          <span class="nav-icon">📢</span>
          <span class="nav-label" v-if="!desktopSidebarCollapsed || mobileSidebarOpen">Campaigns</span>
        </router-link>

        <router-link
          to="/admin/cloth-types"
          class="nav-item"
          active-class="nav-item-active"
          @click.native="onNavClick"
        >
          <span class="nav-icon">👕</span>
          <span class="nav-label" v-if="!desktopSidebarCollapsed || mobileSidebarOpen">Cloth Categories</span>
        </router-link>

        <div class="nav-section-label mt-3" v-if="!desktopSidebarCollapsed || mobileSidebarOpen">ADMINISTRATION</div>

        <router-link
          to="/admin/users"
          class="nav-item"
          active-class="nav-item-active"
          @click.native="onNavClick"
        >
          <span class="nav-icon">👥</span>
          <span class="nav-label" v-if="!desktopSidebarCollapsed || mobileSidebarOpen">Users & Staff</span>
        </router-link>

        <router-link
          to="/donate"
          target="_blank"
          class="nav-item d-sm-none"
        >
          <span class="nav-icon">🌐</span>
          <span class="nav-label">Public Portal ↗</span>
        </router-link>

        <!-- Direct Sign Out Nav Item -->
        <button
          type="button"
          class="nav-item nav-logout-btn"
          @click="logout"
          title="Sign out of Admin Portal"
        >
          <span class="nav-icon">🚪</span>
          <span class="nav-label" v-if="!desktopSidebarCollapsed || mobileSidebarOpen">Sign Out</span>
        </button>
      </nav>

      <!-- User Profile Card in Sidebar Footer -->
      <div class="sidebar-footer" v-if="!desktopSidebarCollapsed || mobileSidebarOpen">
        <div class="user-profile-strip">
          <div class="user-avatar-pill">
            {{ user ? user.name.charAt(0).toUpperCase() : 'A' }}
          </div>
          <div class="user-meta">
            <span class="user-name">{{ user ? user.name : 'Admin' }}</span>
            <span class="user-role-label">{{ user ? user.email : 'admin@clothbank.com' }}</span>
          </div>
          <button class="logout-btn-subtle" @click="logout" title="Sign out">
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- ── Main Workspace Area ── -->
    <div class="saas-main-wrapper">
      <!-- Top Navigation Bar -->
      <header class="saas-topbar">
        <div class="topbar-left-wrap">
          <!-- Mobile Hamburger Menu Button -->
          <button
            class="topbar-mobile-toggle d-md-none"
            @click="mobileSidebarOpen = true"
            title="Open Menu"
            aria-label="Open Navigation"
          >
            ☰
          </button>

          <!-- Quick Search Bar (Stripe-like) -->
          <div class="topbar-search d-none d-sm-flex">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search donations, donors, campaigns… (Press '/')"
              class="topbar-search-input"
            />
          </div>
        </div>

        <!-- Right Quick Actions -->
        <div class="topbar-right-actions">
          <!-- Server QR Poster Trigger Button -->
          <button
            type="button"
            class="btn btn-secondary btn-sm d-none d-sm-inline-flex"
            @click="showQrModal = true"
            title="Generate mobile app connection QR poster"
          >
            <span>📱</span> App QR Poster
          </button>

          <router-link to="/donate" target="_blank" class="btn btn-secondary btn-sm donate-public-link d-none d-sm-inline-flex">
            <span>🌐</span> Public Portal ↗
          </router-link>

          <!-- User Badge in Topbar -->
          <div class="topbar-user-badge">
            <div class="topbar-avatar">
              {{ user ? user.name.charAt(0).toUpperCase() : 'A' }}
            </div>
            <div class="d-none d-md-flex flex-column text-left">
              <span class="topbar-username">{{ user ? user.name : 'Admin' }}</span>
              <span class="topbar-userrole text-muted">Administrator</span>
            </div>
          </div>

          <!-- Prominent Explicit Logout Button -->
          <button
            type="button"
            class="btn btn-danger btn-sm topbar-logout-btn"
            @click="logout"
            title="Click to Sign Out"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </header>

      <!-- Main Page Router View -->
      <main class="saas-content-area">
        <router-view />
      </main>
    </div>

    <!-- QR Poster Generator Modal -->
    <ServerQrModal v-if="showQrModal" @close="showQrModal = false" />
  </div>
</template>

<script>
import authApi from '../api/auth'
import ServerQrModal from '../components/ServerQrModal.vue'

export default {
  name: 'AdminLayout',
  components: {
    ServerQrModal
  },
  data() {
    return {
      desktopSidebarCollapsed: false,
      mobileSidebarOpen: false,
      showQrModal: false,
    }
  },
  computed: {
    user() {
      return (
        this.$store?.state?.user ||
        JSON.parse(localStorage.getItem('user') || localStorage.getItem('cb_user') || 'null')
      )
    }
  },
  methods: {
    onNavClick() {
      if (window.innerWidth < 768) {
        this.mobileSidebarOpen = false
      }
    },
    async logout() {
      try { await authApi.logout() } catch (e) {}
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('cb_token')
      localStorage.removeItem('cb_user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.saas-admin-shell {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-app);
  position: relative;
}

/* ─── Light Sidebar ─── */
.saas-sidebar {
  width: 250px;
  background: #ffffff;
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 100;
}
.saas-sidebar.sidebar-collapsed {
  width: 68px;
}

/* Mobile Sidebar Drawer (< 768px) */
@media (max-width: 767px) {
  .saas-sidebar {
    position: fixed;
    top: 0;
    left: -270px;
    bottom: 0;
    width: 260px !important;
    z-index: 1050;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  }
  .saas-sidebar.mobile-open {
    left: 0 !important;
  }
  .sidebar-mobile-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(2px);
    z-index: 1040;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
  .sidebar-mobile-backdrop.show {
    opacity: 1;
    pointer-events: auto;
  }
}

/* Brand Header */
.sidebar-brand-header {
  height: 60px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
}
.brand-badge-box {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.brand-icon {
  font-size: 18px;
  width: 32px;
  height: 32px;
  background: #eef2ff;
  border: 1px solid #e0e7ff;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.1;
  display: block;
}
.brand-plan {
  font-size: 10px;
  font-weight: 600;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.collapse-btn {
  background: none;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  width: 24px;
  height: 24px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.collapse-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

/* Sidebar Nav */
.sidebar-nav {
  flex: 1;
  padding: 14px 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.nav-section-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-light);
  letter-spacing: 0.06em;
  padding: 6px 10px 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s ease;
  white-space: nowrap;
  border: none;
  background: transparent;
  width: 100%;
  cursor: pointer;
  text-align: left;
}
.nav-item:hover {
  background-color: #f1f5f9;
  color: var(--text-main);
}
.nav-item-active {
  background-color: #eef2ff !important;
  color: var(--primary) !important;
  font-weight: 600;
}
.nav-logout-btn {
  color: #e11d48;
  margin-top: 8px;
}
.nav-logout-btn:hover {
  background-color: #fff1f2 !important;
  color: #be123c !important;
}
.nav-icon {
  font-size: 15px;
  flex-shrink: 0;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 12px 14px;
  border-top: 1px solid var(--border-subtle);
  background: #fafafa;
}
.user-profile-strip {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-avatar-pill {
  width: 32px;
  height: 32px;
  background: var(--primary);
  color: #ffffff;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}
.user-meta {
  flex: 1;
  min-width: 0;
}
.user-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-main);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-role-label {
  font-size: 10.5px;
  color: var(--text-muted);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.logout-btn-subtle {
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #e11d48;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.logout-btn-subtle:hover {
  background: #fff1f2;
  border-color: #fecdd3;
}

/* ─── Main Workspace & Topbar ─── */
.saas-main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.saas-topbar {
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 40;
}

.topbar-left-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.topbar-mobile-toggle {
  background: none;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  font-size: 16px;
  color: var(--text-main);
  cursor: pointer;
}

/* Search input */
.topbar-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 5px 12px;
  width: 300px;
}
.search-icon {
  font-size: 12px;
  color: var(--text-light);
}
.topbar-search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 12px;
  width: 100%;
  color: var(--text-main);
}
.topbar-search-input::placeholder {
  color: var(--text-light);
}

/* Right actions */
.topbar-right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.donate-public-link {
  font-size: 12px;
}

.topbar-user-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 6px;
}
.topbar-avatar {
  width: 30px;
  height: 30px;
  background: #e0e7ff;
  color: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}
.topbar-username {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.2;
}
.topbar-userrole {
  font-size: 10.5px;
  line-height: 1.1;
}

.topbar-logout-btn {
  font-size: 11.5px;
  font-weight: 600;
  padding: 4px 10px;
  gap: 4px;
}

/* Content Area */
.saas-content-area {
  padding: 20px;
  flex: 1;
}

@media (max-width: 576px) {
  .saas-topbar { padding: 0 10px; }
  .saas-content-area { padding: 12px; }
  .topbar-logout-btn span:last-child { display: none; } /* Show icon on small mobile */
}
</style>
