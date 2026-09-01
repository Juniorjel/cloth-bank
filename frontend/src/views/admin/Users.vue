<template>
  <div class="saas-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>👥 Users & Staff Management</h1>
        <p class="text-muted">Manage system administrators, logistics field drivers, and assign custom RBAC roles.</p>
      </div>
      <button class="btn btn-primary btn-sm" @click="openModal()">
        <span>+</span> Add Staff Member
      </button>
    </div>

    <div v-if="loading" class="spinner-wrap">
      <div class="spinner"></div>
      <p>Loading user records…</p>
    </div>

    <div v-else class="card table-card mb-0">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width: 70px;">ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Assigned Role</th>
              <th>Permissions</th>
              <th>Status</th>
              <th class="text-center" style="width: 140px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>
                <span class="font-medium text-muted">#{{ u.id }}</span>
              </td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="user-avatar-sm" :style="getAvatarStyle(u)">
                    {{ u.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-semibold text-main">{{ u.name }}</span>
                </div>
              </td>
              <td>
                <span class="text-secondary" style="font-size:12.5px">{{ u.email }}</span>
              </td>
              <td>
                <span class="text-muted" style="font-size:12.5px">{{ u.phone || '—' }}</span>
              </td>
              <td>
                <span :class="getRoleBadgeClass(u)">
                  🛡️ {{ u.role_name || formatRoleName(u.role) }}
                </span>
              </td>
              <td>
                <span class="badge badge-perms-tag" :title="getPermissionsTooltip(u)">
                  🔑 {{ (u.permissions || []).length }} granted
                </span>
              </td>
              <td>
                <span :class="'badge ' + (u.is_active ? 'badge-verified' : 'badge-inactive')">
                  ● {{ u.is_active ? 'Active' : 'Disabled' }}
                </span>
              </td>
              <td class="text-center">
                <div class="d-flex gap-1 justify-content-center">
                  <button class="btn btn-secondary btn-sm" @click="openModal(u)" title="Edit User & Role">
                    Edit
                  </button>
                  <button class="btn btn-danger btn-sm" @click="deleteUser(u.id)" title="Delete User">
                    🗑
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!users.length">
              <td colspan="8" class="text-center text-muted py-5">
                <p class="mb-0">No user accounts registered.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal with Custom Role Assignment -->
    <div class="modal-backdrop" v-if="showModal" @click.self="showModal = false">
      <div class="modal">
        <h3 class="modal-title">{{ editing ? 'Edit User & Role Assignment' : 'Add New Staff Account' }}</h3>
        
        <div v-if="formError" class="alert alert-error">
          <div>{{ formError }}</div>
        </div>

        <div class="row g-2">
          <div class="col-12 col-sm-6">
            <div class="form-group">
              <label>Full Name *</label>
              <input v-model="form.name" class="form-control" placeholder="e.g. John Doe" required />
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="form-group">
              <label>Phone Number</label>
              <input v-model="form.phone" class="form-control" placeholder="98XXXXXXXX" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Email Address *</label>
          <input v-model="form.email" type="email" class="form-control" placeholder="user@clothbank.com" required />
        </div>

        <div class="form-group">
          <label>Password {{ editing ? '(Leave blank to keep unchanged)' : '*' }}</label>
          <input
            v-model="form.password"
            type="password"
            class="form-control"
            placeholder="Min. 6 characters"
          />
        </div>

        <div class="row g-2">
          <div class="col-12 col-sm-6">
            <div class="form-group">
              <label>🛡️ Assign Role (RBAC) *</label>
              <select v-model="form.role_id" class="form-control font-bold" @change="onRoleChange">
                <option v-for="r in availableRoles" :key="r.id" :value="r.id">
                  {{ r.name }} ({{ r.permissions ? r.permissions.length : 0 }} perms)
                </option>
              </select>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="form-group">
              <label>Account Status</label>
              <select v-model="form.is_active" class="form-control">
                <option :value="true">Active</option>
                <option :value="false">Disabled / Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showModal = false">Cancel</button>
          <button type="button" class="btn btn-primary" :disabled="saving" @click="save">
            <span v-if="saving">Saving…</span>
            <span v-else>{{ editing ? 'Save Changes' : 'Create Staff User' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import userApi from '../../api/users'
import { getRoles } from '../../api/roles'

export default {
  name: 'AdminUsers',
  data() {
    return {
      users:          [],
      availableRoles: [],
      loading:        true,
      showModal:      false,
      editing:        null,
      saving:         false,
      formError:      '',
      form: {
        name:      '',
        email:     '',
        phone:     '',
        password:  '',
        role_id:   null,
        role:      'agent',
        is_active: true
      }
    }
  },
  async created() {
    await this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const [usersRes, rolesRes] = await Promise.all([
          userApi.getAll(),
          getRoles()
        ])
        this.users = usersRes.data
        this.availableRoles = rolesRes.data || []
      } catch (err) {
        console.error('Error loading users/roles:', err)
      } finally {
        this.loading = false
      }
    },
    getAvatarStyle(u) {
      if (u.role === 'admin' || (u.primary_role && u.primary_role.slug === 'admin')) {
        return 'background:#4f46e5; color:#fff'
      }
      return 'background:#e0e7ff; color:#4f46e5'
    },
    getRoleBadgeClass(u) {
      const slug = u.role || (u.primary_role ? u.primary_role.slug : '')
      if (slug === 'admin' || slug === 'super-admin') return 'badge badge-assigned'
      if (slug === 'agent' || slug === 'driver') return 'badge badge-verified'
      return 'badge badge-custom-role'
    },
    formatRoleName(slug) {
      if (slug === 'admin') return 'Super Admin'
      if (slug === 'agent') return 'Logistics Driver'
      if (slug === 'user') return 'Donor'
      return slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'User'
    },
    getPermissionsTooltip(u) {
      const perms = u.permissions || []
      if (!perms.length) return 'No permissions'
      return perms.join(', ')
    },
    onRoleChange() {
      const selected = this.availableRoles.find(r => r.id === this.form.role_id)
      if (selected) {
        this.form.role = selected.slug
      }
    },
    openModal(user = null) {
      this.editing   = user
      this.formError = ''
      
      let defaultRoleId = null
      if (user && user.role_id) {
        defaultRoleId = user.role_id
      } else if (user) {
        const matchedRole = this.availableRoles.find(r => r.slug === user.role)
        defaultRoleId = matchedRole ? matchedRole.id : (this.availableRoles[0] ? this.availableRoles[0].id : null)
      } else {
        const agentRole = this.availableRoles.find(r => r.slug === 'agent')
        defaultRoleId = agentRole ? agentRole.id : (this.availableRoles[0] ? this.availableRoles[0].id : null)
      }

      if (user) {
        this.form = {
          name:      user.name,
          email:     user.email,
          phone:     user.phone || '',
          password:  '',
          role_id:   defaultRoleId,
          role:      user.role,
          is_active: user.is_active
        }
      } else {
        this.form = {
          name:      '',
          email:     '',
          phone:     '',
          password:  '',
          role_id:   defaultRoleId,
          role:      'agent',
          is_active: true
        }
      }
      this.showModal = true
    },
    async save() {
      if (!this.form.name || !this.form.email) {
        this.formError = 'Name and email are required.'
        return
      }
      if (!this.editing && !this.form.password) {
        this.formError = 'Password is required for new accounts.'
        return
      }
      this.saving    = true
      this.formError = ''
      try {
        if (this.editing) {
          await userApi.update(this.editing.id, this.form)
        } else {
          await userApi.create(this.form)
        }
        this.showModal = false
        await this.load()
      } catch (e) {
        const errors = e.response?.data?.errors
        this.formError = errors ? Object.values(errors).flat().join(' ') : (e.response?.data?.message || 'Failed to save user account.')
      } finally {
        this.saving = false
      }
    },
    async deleteUser(id) {
      if (!confirm('Delete this user account?')) return
      try {
        await userApi.delete(id)
        this.users = this.users.filter(u => u.id !== id)
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user.')
      }
    }
  }
}
</script>

<style scoped>
.saas-page {
  max-width: 1200px;
  margin: 0 auto;
}
.table-card {
  padding: 0;
  overflow: hidden;
}
.user-avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: flex-center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
}
.badge-custom-role {
  background: #ede9fe;
  color: #6d28d9;
  font-weight: 700;
  font-size: 11.5px;
}
.badge-perms-tag {
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  font-size: 11px;
}
</style>
