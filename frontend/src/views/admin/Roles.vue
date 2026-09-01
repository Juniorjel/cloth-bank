<template>
  <div>
    <!-- Page Title & Header -->
    <div class="page-title-row">
      <div>
        <h1 class="page-title">🛡️ Roles & Permissions (RBAC)</h1>
        <p class="page-subtitle">Define custom staff roles and configure fine-grained module permissions.</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        ➕ Create Custom Role
      </button>
    </div>

    <!-- KPI Metric Summary Cards -->
    <div class="kpi-grid mb-4">
      <div class="kpi-card">
        <div class="kpi-icon-box bg-indigo-subtle text-indigo">🛡️</div>
        <div>
          <div class="kpi-value">{{ roles.length }}</div>
          <div class="kpi-label">Total System Roles</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-box bg-emerald-subtle text-emerald">✨</div>
        <div>
          <div class="kpi-value">{{ customRolesCount }}</div>
          <div class="kpi-label">Custom Roles</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-box bg-amber-subtle text-amber">🔑</div>
        <div>
          <div class="kpi-value">{{ totalPermissionsCount }}</div>
          <div class="kpi-label">Available Permissions</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-box bg-sky-subtle text-sky">👥</div>
        <div>
          <div class="kpi-value">{{ totalAssignedUsers }}</div>
          <div class="kpi-label">Assigned Staff</div>
        </div>
      </div>
    </div>

    <!-- Alert / Message Bar -->
    <div v-if="successMsg" class="alert alert-success d-flex justify-content-between align-items-center mb-3">
      <span>{{ successMsg }}</span>
      <button class="btn-close-alert" @click="successMsg = ''">✕</button>
    </div>
    <div v-if="errorMsg" class="alert alert-danger d-flex justify-content-between align-items-center mb-3">
      <span>{{ errorMsg }}</span>
      <button class="btn-close-alert" @click="errorMsg = ''">✕</button>
    </div>

    <!-- Roles Grid Cards -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-sm mb-2"></div>
      <p class="text-muted">Loading roles and permissions matrix…</p>
    </div>

    <div v-else class="roles-grid">
      <div
        v-for="role in roles"
        :key="role.id"
        class="role-card"
        :class="{ 'role-system-card': role.is_system }"
      >
        <div class="role-card-header">
          <div>
            <div class="d-flex align-items-center gap-2">
              <h3 class="role-name">{{ role.name }}</h3>
              <span v-if="role.is_system" class="badge badge-system" title="Core system role protected from deletion">
                🔒 System
              </span>
              <span v-else class="badge badge-custom">
                ✨ Custom
              </span>
            </div>
            <code class="role-slug-pill">slug: {{ role.slug }}</code>
          </div>
          <div class="role-actions">
            <button class="btn btn-sm btn-outline-primary" @click="openEditModal(role)">
              ✏️ Edit
            </button>
            <button
              v-if="!role.is_system"
              class="btn btn-sm btn-outline-danger"
              :disabled="role.users_count > 0"
              :title="role.users_count > 0 ? 'Cannot delete role with assigned users' : 'Delete role'"
              @click="confirmDelete(role)"
            >
              🗑️
            </button>
          </div>
        </div>

        <p class="role-desc">{{ role.description || 'No description provided.' }}</p>

        <div class="role-users-row mb-3">
          <span class="text-muted small font-bold">Assigned Users ({{ role.users_count || 0 }}):</span>
          <div class="d-flex flex-wrap gap-1 mt-1">
            <span
              v-for="u in (role.users || []).slice(0, 3)"
              :key="u.id"
              class="user-tag"
            >
              👤 {{ u.name }}
            </span>
            <span v-if="(role.users_count || 0) > 3" class="user-tag-more">
              +{{ role.users_count - 3 }} more
            </span>
            <span v-if="!role.users_count || role.users_count === 0" class="text-muted small fst-italic">
              No staff assigned yet
            </span>
          </div>
        </div>

        <!-- Permissions Count & Module Tags -->
        <div class="role-perms-section">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-muted small font-bold">Granted Permissions:</span>
            <span class="badge badge-perms-count">
              {{ (role.permissions || []).length }} / {{ totalPermissionsCount }}
            </span>
          </div>

          <div class="perms-tag-cloud">
            <span
              v-for="perm in (role.permissions || []).slice(0, 6)"
              :key="perm.id"
              class="perm-badge"
            >
              ✓ {{ perm.name }}
            </span>
            <span v-if="(role.permissions || []).length > 6" class="perm-badge-more">
              +{{ role.permissions.length - 6 }} more
            </span>
            <span v-if="!role.permissions || role.permissions.length === 0" class="text-muted small fst-italic">
              No permissions granted
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Role Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal modal-lg role-form-modal">
        <div class="modal-head-between">
          <div>
            <h3 class="modal-title mb-0">
              {{ isEditing ? `✏️ Edit Role: ${form.name}` : '➕ Create New Custom Role' }}
            </h3>
            <p class="text-muted small mb-0">Configure role identity and assign granular module permissions.</p>
          </div>
          <button class="close-x-btn" @click="showModal = false">✕</button>
        </div>

        <form @submit.prevent="saveRole" class="mt-3">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label font-bold">Role Display Name *</label>
              <input
                v-model="form.name"
                class="form-control"
                placeholder="e.g. Warehouse Inspector"
                required
              />
            </div>
            <div class="col-md-6">
              <label class="form-label font-bold">Role Slug / Code</label>
              <input
                v-model="form.slug"
                class="form-control font-mono"
                placeholder="e.g. warehouse-inspector"
                :disabled="isEditing && form.is_system"
              />
              <small class="text-muted">Unique machine identifier for system routing.</small>
            </div>
            <div class="col-12">
              <label class="form-label font-bold">Description</label>
              <textarea
                v-model="form.description"
                class="form-control"
                rows="2"
                placeholder="Briefly describe the operational responsibilities of this role..."
              ></textarea>
            </div>
          </div>

          <!-- Permissions Granular Matrix Header -->
          <div class="perms-matrix-box mt-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 class="matrix-title mb-0">🔑 Granular Permissions Checklist</h4>
                <p class="text-muted small mb-0">Select specific abilities granted to users with this role.</p>
              </div>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="selectAllPermissions">
                  Check All
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="clearAllPermissions">
                  Clear All
                </button>
              </div>
            </div>

            <!-- Grouped by Module -->
            <div class="module-groups-grid">
              <div
                v-for="(perms, moduleName) in groupedPermissions"
                :key="moduleName"
                class="module-group-card"
              >
                <div class="module-group-head">
                  <span class="module-group-name">📁 {{ moduleName }}</span>
                  <button
                    type="button"
                    class="btn-toggle-module"
                    @click="toggleModulePerms(perms)"
                  >
                    Toggle
                  </button>
                </div>

                <div class="module-perms-list">
                  <label
                    v-for="p in perms"
                    :key="p.id"
                    class="perm-checkbox-item"
                    :class="{ 'active-perm': form.permission_ids.includes(p.id) }"
                  >
                    <input
                      type="checkbox"
                      :value="p.id"
                      v-model="form.permission_ids"
                    />
                    <div>
                      <div class="perm-item-name">{{ p.name }}</div>
                      <div class="perm-item-desc">{{ p.description }}</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer justify-content-between mt-4">
            <button type="button" class="btn btn-secondary" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-sm me-1"></span>
              {{ isEditing ? '💾 Update Role & Permissions' : '✨ Create Role' }}
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
      successMsg: '',
      errorMsg: '',
      form: {
        id: null,
        name: '',
        slug: '',
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
    openCreateModal() {
      this.isEditing = false
      this.form = {
        id: null,
        name: '',
        slug: '',
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
        slug: role.slug,
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
        // Remove all in this module
        this.form.permission_ids = this.form.permission_ids.filter(id => !moduleIds.includes(id))
      } else {
        // Add missing ones in this module
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
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.role-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.role-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.role-system-card {
  border-left: 4px solid var(--primary-600);
}

.role-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.role-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}
.badge-system {
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}
.badge-custom {
  background: #ede9fe;
  color: #6d28d9;
  font-size: 11px;
  font-weight: 700;
}

.role-slug-pill {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-main);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 4px;
}

.role-desc {
  font-size: 13px;
  color: var(--text-muted);
  min-height: 38px;
  line-height: 1.4;
  margin-bottom: 12px;
}

.user-tag {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}
.user-tag-more {
  background: #ede9fe;
  color: #6d28d9;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
}

.role-perms-section {
  background: var(--bg-main);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-top: auto;
}

.badge-perms-count {
  background: #dbeafe;
  color: #1e40af;
  font-weight: 700;
}

.perms-tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.perm-badge {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #1e293b;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}
.perm-badge-more {
  background: #e0f2fe;
  color: #0369a1;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

/* ── Modal & Permissions Matrix ── */
.role-form-modal {
  max-width: 780px;
}
.modal-head-between {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}
.close-x-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--text-muted);
}

.perms-matrix-box {
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 16px;
  max-height: 420px;
  overflow-y: auto;
}
.matrix-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
}

.module-groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
}

.module-group-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md);
  padding: 12px;
}

.module-group-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 6px;
  margin-bottom: 8px;
}
.module-group-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-main);
}
.btn-toggle-module {
  background: #f1f5f9;
  border: none;
  border-radius: 4px;
  font-size: 10.5px;
  font-weight: 700;
  color: #475569;
  padding: 2px 6px;
  cursor: pointer;
}

.module-perms-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.perm-checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.perm-checkbox-item:hover {
  background: #f8fafc;
}
.perm-checkbox-item.active-perm {
  background: #eff6ff;
}

.perm-item-name {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
}
.perm-item-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.2;
  margin-top: 2px;
}

.btn-close-alert {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
</style>
