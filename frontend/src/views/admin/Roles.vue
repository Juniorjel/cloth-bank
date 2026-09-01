<template>
  <div class="roles-management-page">
    <!-- ── Hero Page Header ── -->
    <div class="roles-hero-card mb-4">
      <div class="hero-content-wrap">
        <div class="d-flex align-items-center gap-3">
          <div class="hero-icon-bubble">🛡️</div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <h1 class="hero-title">Roles & Permissions</h1>
              <span class="hero-status-pill">RBAC System v2.0</span>
            </div>
            <p class="hero-subtitle">
              Configure fine-grained access control, manage default system roles, and build tailored team roles.
            </p>
          </div>
        </div>

        <div class="hero-actions-wrap">
          <button class="btn btn-hero-create" @click="openCreateModal">
            <span class="btn-icon">✨</span>
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics Ribbon inside Hero -->
      <div class="hero-stats-ribbon">
        <div class="hero-stat-item">
          <span class="stat-num">{{ roles.length }}</span>
          <span class="stat-lbl">Total Roles</span>
        </div>
        <div class="stat-divider"></div>
        <div class="hero-stat-item">
          <span class="stat-num text-emerald">{{ customRolesCount }}</span>
          <span class="stat-lbl">Custom Roles</span>
        </div>
        <div class="stat-divider"></div>
        <div class="hero-stat-item">
          <span class="stat-num text-amber">{{ totalPermissionsCount }}</span>
          <span class="stat-lbl">Modular Permissions</span>
        </div>
        <div class="stat-divider"></div>
        <div class="hero-stat-item">
          <span class="stat-num text-indigo">{{ totalAssignedUsers }}</span>
          <span class="stat-lbl">Assigned Staff</span>
        </div>
      </div>
    </div>

    <!-- ── Flash Notification Alerts ── -->
    <transition name="fade">
      <div v-if="successMsg" class="flash-alert alert-success mb-4">
        <div class="d-flex align-items-center gap-2">
          <span class="alert-icon">✅</span>
          <span class="alert-text">{{ successMsg }}</span>
        </div>
        <button class="alert-close" @click="successMsg = ''">✕</button>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="errorMsg" class="flash-alert alert-danger mb-4">
        <div class="d-flex align-items-center gap-2">
          <span class="alert-icon">⚠️</span>
          <span class="alert-text">{{ errorMsg }}</span>
        </div>
        <button class="alert-close" @click="errorMsg = ''">✕</button>
      </div>
    </transition>

    <!-- ── Controls & Tabs Bar ── -->
    <div class="controls-toolbar mb-4">
      <!-- Tab Switcher -->
      <div class="tab-switcher">
        <button
          class="tab-btn"
          :class="{ 'active': activeTab === 'cards' }"
          @click="activeTab = 'cards'"
        >
          <span>🛡️ Roles Overview</span>
          <span class="tab-badge">{{ filteredRoles.length }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'active': activeTab === 'matrix' }"
          @click="activeTab = 'matrix'"
        >
          <span>📊 Full Permissions Matrix</span>
        </button>
      </div>

      <!-- Search Filter -->
      <div class="search-input-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search by role name or permission..."
        />
        <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">✕</button>
      </div>
    </div>

    <!-- ── Loading State ── -->
    <div v-if="loading" class="loading-state-card py-5 text-center">
      <div class="pulse-spinner mb-3"></div>
      <h4 class="loading-title">Syncing Roles & Permissions Matrix</h4>
      <p class="text-muted small">Loading organizational structure from backend…</p>
    </div>

    <!-- ── TAB 1: Roles Grid Cards ── -->
    <div v-else-if="activeTab === 'cards'" class="roles-cards-grid">
      <div
        v-for="role in filteredRoles"
        :key="role.id"
        class="role-modern-card"
        :class="`theme-${getRoleTheme(role)}`"
      >
        <!-- Card Header -->
        <div class="card-head">
          <div class="d-flex align-items-start gap-3">
            <div class="role-avatar-icon">
              {{ getRoleIcon(role) }}
            </div>
            <div>
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <h3 class="role-title">{{ role.name }}</h3>
                <span v-if="role.is_system" class="badge-system-lock" title="Core System Role">
                  🔒 System
                </span>
                <span v-else class="badge-custom-sparkle">
                  ✨ Custom
                </span>
              </div>
              <p class="role-summary-desc">{{ role.description || 'No description configured.' }}</p>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="card-actions-row">
            <button class="action-circle-btn btn-edit" @click="openEditModal(role)" title="Edit Role & Permissions">
              ✏️
            </button>
            <button
              v-if="!role.is_system"
              class="action-circle-btn btn-delete"
              :disabled="role.users_count > 0"
              :title="role.users_count > 0 ? 'Cannot delete role with assigned users' : 'Delete Role'"
              @click="confirmDelete(role)"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- Coverage Meter Bar -->
        <div class="coverage-bar-wrap my-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="coverage-label">Permissions Granted</span>
            <span class="coverage-percentage font-mono font-bold">
              {{ getRolePermCount(role) }} / {{ totalPermissionsCount }} ({{ getRoleCoverage(role) }}%)
            </span>
          </div>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: `${getRoleCoverage(role)}%` }"
            ></div>
          </div>
        </div>

        <!-- Assigned Staff Section -->
        <div class="assigned-staff-section mb-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="section-micro-title">Assigned Staff Members ({{ role.users_count || 0 }})</span>
          </div>
          <div class="staff-avatars-row">
            <div
              v-for="u in (role.users || []).slice(0, 4)"
              :key="u.id"
              class="staff-user-pill"
              :title="`${u.name} (${u.email})`"
            >
              <div class="staff-mini-avatar">{{ u.name.charAt(0).toUpperCase() }}</div>
              <span class="staff-name-text">{{ u.name }}</span>
            </div>
            <span v-if="(role.users_count || 0) > 4" class="staff-more-pill">
              +{{ role.users_count - 4 }} more
            </span>
            <span v-if="!role.users_count || role.users_count === 0" class="no-staff-text">
              No staff members assigned yet
            </span>
          </div>
        </div>

        <!-- Permissions Tag Cloud -->
        <div class="granted-permissions-box">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="section-micro-title">Active Capabilities</span>
          </div>
          <div class="perms-pills-wrap">
            <span
              v-for="perm in (role.permissions || []).slice(0, 7)"
              :key="perm.id"
              class="perm-chip"
              :title="perm.description"
            >
              <span class="perm-check">✓</span>
              <span>{{ perm.name }}</span>
            </span>
            <span v-if="(role.permissions || []).length > 7" class="perm-chip-more">
              +{{ role.permissions.length - 7 }} more
            </span>
            <span v-if="!role.permissions || role.permissions.length === 0" class="no-perms-text">
              No permissions granted
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── TAB 2: Comprehensive Permissions Matrix Table ── -->
    <div v-else-if="activeTab === 'matrix'" class="matrix-card-wrap">
      <div class="matrix-table-responsive">
        <table class="matrix-table">
          <thead>
            <tr>
              <th class="col-permission-header">Permission & Module</th>
              <th
                v-for="r in roles"
                :key="r.id"
                class="col-role-header text-center"
              >
                <div class="d-flex flex-column align-items-center gap-1">
                  <span class="role-matrix-icon">{{ getRoleIcon(r) }}</span>
                  <span class="role-matrix-name">{{ r.name }}</span>
                  <span v-if="r.is_system" class="role-matrix-tag system">System</span>
                  <span v-else class="role-matrix-tag custom">Custom</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(perms, moduleName) in groupedPermissions">
              <tr :key="`header-${moduleName}`" class="module-section-row">
                <td :colspan="roles.length + 1" class="module-title-cell">
                  📁 {{ moduleName }} ({{ perms.length }} abilities)
                </td>
              </tr>
              <tr
                v-for="p in perms"
                :key="p.id"
                class="permission-matrix-row"
              >
                <td class="permission-info-cell">
                  <div class="perm-table-title">{{ p.name }}</div>
                  <div class="perm-table-desc">{{ p.description }}</div>
                </td>
                <td
                  v-for="r in roles"
                  :key="`${p.id}-${r.id}`"
                  class="matrix-check-cell text-center"
                >
                  <span
                    v-if="roleHasPermission(r, p.id)"
                    class="matrix-icon-granted"
                    title="Granted"
                  >
                    ✓
                  </span>
                  <span v-else class="matrix-icon-denied" title="Not Granted">
                    —
                  </span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Create / Edit Role Modal ── -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal modal-lg role-modal-premium">
        <!-- Modal Head -->
        <div class="modal-premium-header">
          <div class="d-flex align-items-center gap-3">
            <div class="modal-head-icon">
              {{ isEditing ? '✏️' : '✨' }}
            </div>
            <div>
              <h3 class="modal-premium-title mb-0">
                {{ isEditing ? `Edit Role: ${form.name}` : 'Create Custom Role' }}
              </h3>
              <p class="modal-premium-sub mb-0">
                Configure role identity and assign granular access permissions.
              </p>
            </div>
          </div>
          <button class="btn-close-modal" @click="showModal = false">✕</button>
        </div>

        <form @submit.prevent="saveRole" class="modal-form-body">
          <!-- Role Details Inputs -->
          <div class="form-section-card mb-4">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label-premium">
                  <span>Role Display Name</span>
                  <span class="required-star">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control-premium"
                  placeholder="e.g. Warehouse Quality Inspector, Intake Coordinator"
                  required
                />
              </div>
              <div class="col-12">
                <label class="form-label-premium">Role Description</label>
                <textarea
                  v-model="form.description"
                  class="form-control-premium textarea-premium"
                  rows="2"
                  placeholder="Describe what responsibilities and scope this role has in your organization..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Permissions Granular Matrix Section -->
          <div class="perms-picker-section">
            <div class="perms-picker-head mb-3">
              <div>
                <h4 class="perms-picker-title mb-0">🔑 Granular Permissions Matrix</h4>
                <div class="perms-counter-pill mt-1">
                  <span>Selected: <strong>{{ form.permission_ids.length }}</strong> of {{ totalPermissionsCount }} permissions</span>
                </div>
              </div>

              <!-- Quick Toggles -->
              <div class="d-flex gap-2">
                <button
                  type="button"
                  class="btn btn-sm btn-quick-toggle"
                  @click="selectAllPermissions"
                >
                  ✓ Select All
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-quick-toggle"
                  @click="clearAllPermissions"
                >
                  ✕ Clear All
                </button>
              </div>
            </div>

            <!-- Grouped by Module -->
            <div class="module-accordion-grid">
              <div
                v-for="(perms, moduleName) in groupedPermissions"
                :key="moduleName"
                class="module-perm-card"
                :class="{ 'module-all-checked': isModuleAllChecked(perms) }"
              >
                <!-- Module Card Head -->
                <div class="module-perm-header">
                  <div class="d-flex align-items-center gap-2">
                    <span class="module-folder-icon">📁</span>
                    <span class="module-title-text">{{ moduleName }}</span>
                    <span class="module-count-badge">
                      {{ getModuleSelectedCount(perms) }} / {{ perms.length }}
                    </span>
                  </div>
                  <button
                    type="button"
                    class="btn-module-select-all"
                    @click="toggleModulePerms(perms)"
                  >
                    {{ isModuleAllChecked(perms) ? 'Deselect All' : 'Select All' }}
                  </button>
                </div>

                <!-- Checkboxes List -->
                <div class="module-checkboxes-stack">
                  <label
                    v-for="p in perms"
                    :key="p.id"
                    class="perm-checkbox-row"
                    :class="{ 'is-selected': form.permission_ids.includes(p.id) }"
                  >
                    <input
                      type="checkbox"
                      :value="p.id"
                      v-model="form.permission_ids"
                      class="custom-check-input"
                    />
                    <div class="perm-check-label">
                      <div class="perm-name-strong">{{ p.name }}</div>
                      <div class="perm-desc-muted">{{ p.description }}</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Action Buttons -->
          <div class="modal-footer-premium mt-4">
            <button type="button" class="btn btn-secondary-premium" @click="showModal = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary-premium" :disabled="saving">
              <span v-if="saving" class="spinner-sm me-2"></span>
              <span>{{ isEditing ? '💾 Save Role Changes' : '✨ Create Custom Role' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '@/api/roles'

export default {
  name: 'AdminRoles',
  data() {
    return {
      roles: [],
      allPermissions: [],
      groupedPermissions: {},
      loading: true,
      saving: false,
      showModal: false,
      isEditing: false,
      activeTab: 'cards', // 'cards' | 'matrix'
      searchQuery: '',
      successMsg: '',
      errorMsg: '',
      form: {
        id: null,
        name: '',
        description: '',
        is_system: false,
        permission_ids: [],
      }
    }
  },
  computed: {
    customRolesCount() {
      return this.roles.filter(r => !r.is_system).length
    },
    totalPermissionsCount() {
      return this.allPermissions.length
    },
    totalAssignedUsers() {
      return this.roles.reduce((acc, r) => acc + (r.users_count || 0), 0)
    },
    filteredRoles() {
      if (!this.searchQuery) return this.roles
      const q = this.searchQuery.toLowerCase()
      return this.roles.filter(r => {
        const nameMatch = r.name.toLowerCase().includes(q)
        const descMatch = (r.description || '').toLowerCase().includes(q)
        const permMatch = (r.permissions || []).some(p => p.name.toLowerCase().includes(q))
        return nameMatch || descMatch || permMatch
      })
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const [rolesRes, permsRes] = await Promise.all([
          getRoles(),
          getPermissions()
        ])
        this.roles = rolesRes.data
        this.allPermissions = permsRes.data.all || []
        this.groupedPermissions = permsRes.data.grouped || {}
      } catch (err) {
        this.errorMsg = err.response?.data?.message || 'Failed to load roles and permissions.'
      } finally {
        this.loading = false
      }
    },
    getRoleIcon(role) {
      const slug = (role.slug || '').toLowerCase()
      if (slug === 'admin' || slug === 'super-admin') return '👑'
      if (slug === 'agent' || slug === 'driver' || slug === 'logistics-agent') return '🚚'
      if (slug === 'warehouse-manager') return '📦'
      if (slug === 'campaign-coordinator') return '📢'
      if (slug === 'user' || slug === 'donor') return '🎁'
      return '🛡️'
    },
    getRoleTheme(role) {
      const slug = (role.slug || '').toLowerCase()
      if (slug === 'admin' || slug === 'super-admin') return 'indigo'
      if (slug === 'agent' || slug === 'driver') return 'emerald'
      if (slug === 'warehouse-manager') return 'amber'
      if (slug === 'campaign-coordinator') return 'sky'
      return 'purple'
    },
    getRolePermCount(role) {
      return (role.permissions || []).length
    },
    getRoleCoverage(role) {
      if (!this.totalPermissionsCount) return 0
      const count = this.getRolePermCount(role)
      return Math.round((count / this.totalPermissionsCount) * 100)
    },
    roleHasPermission(role, permissionId) {
      return (role.permissions || []).some(p => p.id === permissionId)
    },
    isModuleAllChecked(perms) {
      if (!perms.length) return false
      return perms.every(p => this.form.permission_ids.includes(p.id))
    },
    getModuleSelectedCount(perms) {
      return perms.filter(p => this.form.permission_ids.includes(p.id)).length
    },
    openCreateModal() {
      this.isEditing = false
      this.form = {
        id: null,
        name: '',
        description: '',
        is_system: false,
        permission_ids: [],
      }
      this.showModal = true
    },
    openEditModal(role) {
      this.isEditing = true
      this.form = {
        id: role.id,
        name: role.name,
        description: role.description || '',
        is_system: role.is_system,
        permission_ids: (role.permissions || []).map(p => p.id),
      }
      this.showModal = true
    },
    selectAllPermissions() {
      this.form.permission_ids = this.allPermissions.map(p => p.id)
    },
    clearAllPermissions() {
      this.form.permission_ids = []
    },
    toggleModulePerms(perms) {
      const moduleIds = perms.map(p => p.id)
      const allSelected = moduleIds.every(id => this.form.permission_ids.includes(id))
      
      if (allSelected) {
        this.form.permission_ids = this.form.permission_ids.filter(id => !moduleIds.includes(id))
      } else {
        const toAdd = moduleIds.filter(id => !this.form.permission_ids.includes(id))
        this.form.permission_ids = [...this.form.permission_ids, ...toAdd]
      }
    },
    async saveRole() {
      this.saving = true
      this.errorMsg = ''
      this.successMsg = ''

      try {
        if (this.isEditing) {
          await updateRole(this.form.id, this.form)
          this.successMsg = `Role "${this.form.name}" updated successfully.`
        } else {
          await createRole(this.form)
          this.successMsg = `Role "${this.form.name}" created successfully.`
        }
        this.showModal = false
        await this.fetchData()
      } catch (err) {
        this.errorMsg = err.response?.data?.message || 'Failed to save role. Please check required fields.'
      } finally {
        this.saving = false
      }
    },
    async confirmDelete(role) {
      if (!confirm(`Are you sure you want to delete custom role "${role.name}"?`)) return

      try {
        await deleteRole(role.id)
        this.successMsg = `Role "${role.name}" deleted successfully.`
        await this.fetchData()
      } catch (err) {
        this.errorMsg = err.response?.data?.message || 'Failed to delete role.'
      }
    }
  }
}
</script>

<style scoped>
.roles-management-page {
  max-width: 1320px;
  margin: 0 auto;
  padding-bottom: 40px;
}

/* ── Hero Page Header Card ── */
.roles-hero-card {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e293b 100%);
  border: 1px solid #334155;
  border-radius: 20px;
  padding: 28px 32px;
  color: #ffffff;
  box-shadow: 0 14px 34px -8px rgba(15, 23, 42, 0.45);
  position: relative;
  overflow: hidden;
}
.roles-hero-card::after {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.hero-content-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.hero-icon-bubble {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  backdrop-filter: blur(8px);
}

.hero-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.5px;
}

.hero-status-pill {
  background: rgba(99, 102, 241, 0.3);
  border: 1px solid rgba(165, 180, 252, 0.3);
  color: #c7d2fe;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.hero-subtitle {
  color: #94a3b8;
  font-size: 13.5px;
  margin: 4px 0 0 0;
  max-width: 600px;
  line-height: 1.4;
}

.btn-hero-create {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
  transition: all 0.2s ease;
  cursor: pointer;
}
.btn-hero-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.55);
}

/* Stats Ribbon */
.hero-stats-ribbon {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
}
.hero-stat-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.stat-num {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
}
.stat-lbl {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}
.stat-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.15);
}

/* ── Flash Notifications ── */
.flash-alert {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}
.alert-success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}
.alert-danger {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}
.alert-close {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
}
.alert-close:hover { opacity: 1; }

/* ── Controls Toolbar ── */
.controls-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.tab-switcher {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
  border: 1px solid #e2e8f0;
}
.tab-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}
.tab-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.tab-badge {
  background: #e2e8f0;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 10px;
}
.tab-btn.active .tab-badge {
  background: #4f46e5;
  color: #ffffff;
}

.search-input-wrap {
  position: relative;
  min-width: 280px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  opacity: 0.5;
}
.search-input {
  width: 100%;
  padding: 8px 32px 8px 34px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}
.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 12px;
  color: #94a3b8;
  cursor: pointer;
}

/* ── Roles Grid Cards ── */
.roles-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

.role-modern-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.04);
  transition: all 0.25s ease;
  position: relative;
}
.role-modern-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px -4px rgba(15, 23, 42, 0.08);
  border-color: #cbd5e1;
}

/* Theme Accents */
.theme-indigo { border-top: 4px solid #6366f1; }
.theme-emerald { border-top: 4px solid #10b981; }
.theme-amber { border-top: 4px solid #f59e0b; }
.theme-sky { border-top: 4px solid #0ea5e9; }
.theme-purple { border-top: 4px solid #8b5cf6; }

.role-avatar-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.role-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16.5px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.badge-system-lock {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}
.badge-custom-sparkle {
  background: #ede9fe;
  border: 1px solid #ddd6fe;
  color: #6d28d9;
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}

.role-summary-desc {
  font-size: 12.5px;
  color: #64748b;
  margin: 4px 0 0 0;
  line-height: 1.4;
  min-height: 35px;
}

.card-actions-row {
  display: flex;
  gap: 6px;
}
.action-circle-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s ease;
}
.action-circle-btn:hover:not(:disabled) {
  background: #f8fafc;
  transform: scale(1.05);
}
.btn-edit:hover { border-color: #6366f1; }
.btn-delete:hover { border-color: #ef4444; background: #fef2f2; }
.action-circle-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Coverage Progress Bar */
.coverage-bar-wrap {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  padding: 10px 12px;
}
.coverage-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #475569;
}
.coverage-percentage {
  font-size: 11px;
  color: #6366f1;
}
.progress-track {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 10px;
  transition: width 0.4s ease;
}

/* Assigned Staff Members */
.section-micro-title {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
}
.staff-avatars-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.staff-user-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 2px 8px 2px 3px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 600;
  color: #334155;
}
.staff-mini-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4338ca;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9.5px;
  font-weight: 800;
}
.staff-more-pill {
  background: #ede9fe;
  color: #6d28d9;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 12px;
}
.no-staff-text, .no-perms-text {
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
}

/* Permissions Chip Cloud */
.granted-permissions-box {
  margin-top: auto;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}
.perms-pills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.perm-chip {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #1e293b;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.perm-check {
  color: #10b981;
  font-weight: 800;
}
.perm-chip-more {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

/* ── Matrix Table ── */
.matrix-card-wrap {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}
.matrix-table-responsive {
  overflow-x: auto;
}
.matrix-table {
  width: 100%;
  border-collapse: collapse;
}
.matrix-table th, .matrix-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
}
.col-permission-header {
  min-width: 280px;
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}
.col-role-header {
  min-width: 140px;
  background: #f8fafc;
}
.role-matrix-icon {
  font-size: 20px;
}
.role-matrix-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}
.role-matrix-tag {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}
.role-matrix-tag.system { background: #e2e8f0; color: #475569; }
.role-matrix-tag.custom { background: #ede9fe; color: #6d28d9; }

.module-section-row {
  background: #f1f5f9;
}
.module-title-cell {
  font-size: 12.5px;
  font-weight: 800;
  color: #1e293b;
  padding: 8px 16px !important;
}

.permission-matrix-row:hover {
  background: #f8fafc;
}
.perm-table-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}
.perm-table-desc {
  font-size: 11.5px;
  color: #64748b;
  margin-top: 2px;
}

.matrix-icon-granted {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ecfdf5;
  color: #059669;
  font-weight: 800;
  font-size: 13px;
}
.matrix-icon-denied {
  color: #cbd5e1;
  font-weight: 700;
}

/* ── Premium Modal ── */
.role-modal-premium {
  max-width: 820px;
  padding: 0;
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
}

.modal-premium-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 22px 28px;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-head-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.modal-premium-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
}
.modal-premium-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}
.btn-close-modal {
  background: none;
  border: none;
  font-size: 18px;
  color: #94a3b8;
  cursor: pointer;
}
.btn-close-modal:hover { color: #ffffff; }

.modal-form-body {
  padding: 24px 28px;
}

.form-section-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
}

.form-label-premium {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
  display: block;
}
.required-star { color: #ef4444; margin-left: 2px; }

.form-control-premium {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}
.form-control-premium:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}
.textarea-premium { resize: vertical; }

/* Perms Picker Section */
.perms-picker-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.perms-picker-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}
.perms-counter-pill {
  font-size: 12px;
  color: #6366f1;
  background: #e0e7ff;
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
}

.btn-quick-toggle {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  font-size: 11.5px;
  font-weight: 700;
  color: #475569;
  border-radius: 8px;
  padding: 5px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-quick-toggle:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.module-accordion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 14px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 4px;
}

.module-perm-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.module-perm-card.module-all-checked {
  border-color: #a5b4fc;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.module-perm-header {
  background: #f8fafc;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}
.module-title-text {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}
.module-count-badge {
  font-size: 10.5px;
  font-weight: 700;
  background: #e2e8f0;
  color: #475569;
  padding: 2px 6px;
  border-radius: 6px;
}
.btn-module-select-all {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.module-checkboxes-stack {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.perm-checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.perm-checkbox-row:hover {
  background: #f8fafc;
}
.perm-checkbox-row.is-selected {
  background: #eff6ff;
}

.custom-check-input {
  margin-top: 3px;
  cursor: pointer;
}
.perm-name-strong {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}
.perm-desc-muted {
  font-size: 11px;
  color: #64748b;
  line-height: 1.2;
  margin-top: 2px;
}

.modal-footer-premium {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #f1f5f9;
  padding-top: 18px;
}

.btn-secondary-premium {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-weight: 700;
  font-size: 13px;
  padding: 9px 18px;
  border-radius: 10px;
  cursor: pointer;
}
.btn-primary-premium {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: none;
  color: #ffffff;
  font-weight: 700;
  font-size: 13px;
  padding: 9px 20px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
  transition: transform 0.15s ease;
}
.btn-primary-premium:hover:not(:disabled) {
  transform: translateY(-1px);
}

.pulse-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
