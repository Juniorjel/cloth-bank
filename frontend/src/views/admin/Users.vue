<template>
  <div class="saas-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Users & Staff</h1>
        <p class="text-muted">Manage system administrators and field logistics drivers.</p>
      </div>
      <button class="btn btn-primary btn-sm" @click="openModal()">
        <span>+</span> Add User
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
              <th>Role</th>
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
                  <div class="user-avatar-sm" :style="u.role === 'admin' ? 'background:#4f46e5; color:#fff' : 'background:#e0e7ff; color:#4f46e5'">
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
                <span :class="u.role === 'admin' ? 'badge badge-assigned' : 'badge badge-verified'">
                  {{ u.role === 'admin' ? 'Admin' : 'Field Driver' }}
                </span>
              </td>
              <td>
                <span :class="'badge ' + (u.is_active ? 'badge-verified' : 'badge-inactive')">
                  ● {{ u.is_active ? 'Active' : 'Disabled' }}
                </span>
              </td>
              <td class="text-center">
                <div class="d-flex gap-1 justify-content-center">
                  <button class="btn btn-secondary btn-sm" @click="openModal(u)" title="Edit User">
                    Edit
                  </button>
                  <button class="btn btn-danger btn-sm" @click="deleteUser(u.id)" title="Delete User">
                    🗑
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!users.length">
              <td colspan="7" class="text-center text-muted py-5">
                <p class="mb-0">No user accounts registered.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal-backdrop" v-if="showModal" @click.self="showModal = false">
      <div class="modal">
        <h3 class="modal-title">{{ editing ? 'Edit User Profile' : 'Add New User' }}</h3>
        
        <div v-if="formError" class="alert alert-error">
          <div>{{ formError }}</div>
        </div>

        <div class="row g-2">
          <div class="col-12 col-sm-6">
            <div class="form-group">
              <label>Full Name</label>
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
          <label>Email Address</label>
          <input v-model="form.email" type="email" class="form-control" placeholder="user@clothbank.com" required />
        </div>

        <div class="form-group">
          <label>Password {{ editing ? '(Leave blank to keep unchanged)' : '' }}</label>
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
              <label>Assigned Role</label>
              <select v-model="form.role" class="form-control">
                <option value="agent">Field Driver</option>
                <option value="admin">System Administrator</option>
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
            <span v-else>{{ editing ? 'Save Changes' : 'Create User' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import userApi from '../../api/users'

export default {
  name: 'AdminUsers',
  data() {
    return {
      users:     [],
      loading:   true,
      showModal: false,
      editing:   null,
      saving:    false,
      formError: '',
      form: { name: '', email: '', phone: '', password: '', role: 'agent', is_active: true }
    }
  },
  async created() {
    await this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const res = await userApi.getAll()
        this.users = res.data
      } finally {
        this.loading = false
      }
    },
    openModal(user = null) {
      this.editing   = user
      this.formError = ''
      if (user) {
        this.form = {
          name:      user.name,
          email:     user.email,
          phone:     user.phone || '',
          password:  '',
          role:      user.role,
          is_active: user.is_active
        }
      } else {
        this.form = { name: '', email: '', phone: '', password: '', role: 'agent', is_active: true }
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
        this.formError = errors ? Object.values(errors).flat().join(' ') : 'Failed to save user account.'
      } finally {
        this.saving = false
      }
    },
    async deleteUser(id) {
      if (!confirm('Delete this user account?')) return
      await userApi.delete(id)
      this.users = this.users.filter(u => u.id !== id)
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
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
}
</style>
